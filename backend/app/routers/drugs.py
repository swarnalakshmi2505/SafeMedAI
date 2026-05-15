from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import Counter
import httpx

from app.database.connection import get_db
from app.models.drug import DrugReport, DrugStatistics, YearlyTrend
from app.ml.ror_calculator import compute_ror_for_drug_reaction
from app.ml.risk_scorer import compute_full_risk_profile

router = APIRouter(prefix="/drugs", tags=["Drug Detail"])

# ── helpers ────────────────────────────────────────────────────────────────────

async def fetch_openfda_label(drug_name: str) -> dict:
    """
    Multi-strategy openFDA fetcher.
    Tries brand name, generic name, and common aliases.
    """
    # Common name aliases (UK/generic → US FDA name)
    aliases = {
        "paracetamol":  ["acetaminophen", "paracetamol", "tylenol"],
        "adrenaline":   ["epinephrine"],
        "salbutamol":   ["albuterol"],
        "frusemide":    ["furosemide"],
        "lignocaine":   ["lidocaine"],
    }

    # Build search candidates
    candidates = aliases.get(drug_name.lower(), [drug_name])
    if drug_name not in candidates:
        candidates.insert(0, drug_name)

    url = "https://api.fda.gov/drug/label.json"

    async with httpx.AsyncClient(timeout=15) as client:
        for name in candidates:
            # Try multiple search field strategies
            search_strategies = [
                f'openfda.generic_name:"{name}"',
                f'openfda.brand_name:"{name}"',
                f'openfda.substance_name:"{name}"',
                f'indications_and_usage:"{name}"',
            ]
            for search_query in search_strategies:
                try:
                    r = await client.get(url, params={
                        "search": search_query,
                        "limit": 1
                    })
                    if r.status_code != 200:
                        continue
                    results = r.json().get("results", [])
                    if not results:
                        continue

                    label = results[0]

                    # Extract all relevant sections
                    def get_field(*keys):
                        for k in keys:
                            val = label.get(k)
                            if val:
                                text = " ".join(val) if isinstance(val, list) else val
                                text = text.strip()
                                if len(text) > 30:   # ignore empty/placeholder values
                                    return text[:2000]  # cap length
                        return None

                    uses    = get_field("indications_and_usage")
                    pros    = get_field("clinical_studies", "clinical_pharmacology",
                                       "mechanism_of_action")
                    cons    = get_field("warnings_and_cautions", "warnings",
                                       "boxed_warning", "adverse_reactions")
                    avoid   = get_field("contraindications")
                    dosage  = get_field("dosage_and_administration")

                    # Only return if we got at least uses or cons
                    if uses or cons:
                        return {
                            "uses":             uses  or "See prescribing information.",
                            "pros":             pros  or "Clinical benefit established. See clinical studies.",
                            "cons":             cons  or "See warnings section.",
                            "who_should_avoid": avoid  or "See contraindications section.",
                            "dosage":           dosage or "See dosage and administration section.",
                        }
                except Exception as e:
                    print(f"openFDA strategy failed ({name} / {search_query}): {e}")
                    continue

    # Final fallback — generate from FAERS data context
    return {
        "uses":             f"{drug_name.capitalize()} is a medication tracked in the FDA FAERS database for adverse event reporting.",
        "pros":             "Clinical benefit data is available in published literature. Search PubMed for peer-reviewed studies.",
        "cons":             "Adverse reactions have been reported. See the ROR Signal Detection table below for confirmed safety signals.",
        "who_should_avoid": "Consult prescribing information and a healthcare professional before use.",
        "dosage":           "Follow prescribed dosage. Do not self-medicate. Consult your doctor or pharmacist.",
    }


async def fetch_pubmed_count(drug_name: str) -> int:
    """Count PubMed safety papers — tries both name and alias."""
    aliases = {
        "paracetamol": "acetaminophen",
        "adrenaline":  "epinephrine",
        "salbutamol":  "albuterol",
    }
    search_name = aliases.get(drug_name.lower(), drug_name)
    url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(url, params={
                "db":      "pubmed",
                "retmode": "json",
                "term":    f"{search_name}[tiab] AND (adverse[tiab] OR safety[tiab] OR toxicity[tiab])",
                "retmax":  0,
            })
            return int(r.json()["esearchresult"]["count"])
    except:
        return 0


# ── main endpoint ──────────────────────────────────────────────────────────────

@router.get("/{drug_name}")
async def get_drug_detail(drug_name: str, db: Session = Depends(get_db)):
    drug_lower = drug_name.lower().strip()

    stat = db.query(DrugStatistics).filter(
        DrugStatistics.drug_name == drug_lower
    ).first()

    if not stat:
        raise HTTPException(
            status_code=404,
            detail=f"No data found for '{drug_name}'. Run data ingestion first."
        )

    # ── ROR signals ────────────────────────────────────────────────────────────
    total_all   = db.query(func.count(DrugReport.id)).scalar() or 1
    reactions   = db.query(DrugReport.reaction)\
                    .filter(DrugReport.drug_name == drug_lower).all()
    rx_counts   = Counter([r[0] for r in reactions])
    top_rx      = rx_counts.most_common(10)

    ror_signals = []
    for rx_name, cnt_in_drug in top_rx:
        cnt_in_all = db.query(func.count(DrugReport.id))\
                       .filter(DrugReport.reaction == rx_name).scalar()
        sig = compute_ror_for_drug_reaction(
            drug_name           = drug_lower,
            reaction            = rx_name,
            total_drug_reports  = stat.total_reports,
            total_all_reports   = total_all,
            reaction_in_drug    = cnt_in_drug,
            reaction_in_all     = cnt_in_all,
        )
        ror_signals.append(sig)

    # ── Yearly trends ──────────────────────────────────────────────────────────
    trends = db.query(YearlyTrend)\
               .filter(YearlyTrend.drug_name == drug_lower)\
               .order_by(YearlyTrend.year).all()
    trend_data = [{"year": t.year, "report_count": t.report_count,
                   "serious_count": t.serious_count} for t in trends]

    # ── Risk profile ───────────────────────────────────────────────────────────
    profile = compute_full_risk_profile(
        drug_name     = drug_lower,
        total_reports = stat.total_reports,
        serious_count = stat.serious_reports,
        death_count   = stat.death_reports,
        ror_signals   = ror_signals,
        trend_data    = trend_data,
    )

    # ── External data (parallel) ───────────────────────────────────────────────
    label_data    = await fetch_openfda_label(drug_lower)
    pubmed_count  = await fetch_pubmed_count(drug_lower)

    # ── Gender / age breakdown ─────────────────────────────────────────────────
    gender_rows = db.query(DrugReport.gender,
                           func.count(DrugReport.id).label("cnt"))\
                    .filter(DrugReport.drug_name == drug_lower)\
                    .group_by(DrugReport.gender).all()
    gender_dist = {r.gender: r.cnt for r in gender_rows}

    age_rows = db.query(DrugReport.age_group,
                        func.count(DrugReport.id).label("cnt"))\
                  .filter(DrugReport.drug_name == drug_lower)\
                  .group_by(DrugReport.age_group).all()
    age_dist = {r.age_group: r.cnt for r in age_rows}

    # ── Alternative drug suggestions ───────────────────────────────────────────
    safer_drugs = db.query(DrugStatistics)\
                    .filter(
                        DrugStatistics.drug_name != drug_lower,
                        DrugStatistics.risk_score < profile.risk_score - 10,
                    )\
                    .order_by(DrugStatistics.risk_score.asc())\
                    .limit(3).all()

    alternatives = [
        {
            "drug_name":  s.drug_name,
            "risk_score": s.risk_score,
            "risk_level": ("critical" if s.risk_score >= 70 else
                           "high"     if s.risk_score >= 55 else
                           "medium"   if s.risk_score >= 30 else "low"),
            "top_reactions": s.top_reactions[:2] if s.top_reactions else [],
        }
        for s in safer_drugs
    ]

    return {
        # Core identity
        "id":           stat.id,
        "drug_name":    drug_lower,
        "total_reports":stat.total_reports,
        "last_updated": str(stat.last_updated),

        # Risk
        "risk_score":      profile.risk_score,
        "risk_level":      profile.risk_level,
        "signal_count":    profile.signal_count,
        "strongest_ror":   profile.strongest_ror,
        "death_rate":      profile.death_rate,
        "serious_rate":    profile.serious_rate,
        "trend_direction": profile.trend_direction,
        "trend_magnitude": profile.trend_magnitude,
        "explanation":     profile.explanation,

        # ROR table
        "ror_signals": [
            {
                "reaction":  s.reaction,
                "ror":       s.ror,
                "ci_lower":  s.ror_lower,
                "ci_upper":  s.ror_upper,
                "signal":    s.signal,
                "confirmed": s.is_signal,
                "a": s.a, "b": s.b, "c": s.c, "d": s.d,
            }
            for s in ror_signals
        ],

        # Trend chart
        "yearly_trends": trend_data,

        # openFDA label
        "uses":             label_data.get("uses",             "Data not available"),
        "pros":             label_data.get("pros",             "Data not available"),
        "cons":             label_data.get("cons",             "Data not available"),
        "who_should_avoid": label_data.get("who_should_avoid", "Data not available"),
        "dosage":           label_data.get("dosage",           "Data not available"),
        "top_reactions":    stat.top_reactions or [],

        # Demographics
        "gender_distribution": gender_dist,
        "age_distribution":    age_dist,
        "alternatives":        alternatives,

        # Evidence sources
        "evidence": {
            "pubmed_count":  pubmed_count,
            "faers_reports": stat.total_reports,
            "fda_label":     bool(label_data),
        },
    }


@router.get("/")
def list_all_drugs(db: Session = Depends(get_db)):
    """List all drugs with basic stats — used for search suggestions."""
    stats = db.query(DrugStatistics)\
              .order_by(DrugStatistics.risk_score.desc()).all()
    return [
        {
            "drug_name":     s.drug_name,
            "total_reports": s.total_reports,
            "risk_score":    s.risk_score,
            "risk_level":    ("critical" if s.risk_score >= 70 else
                              "high"     if s.risk_score >= 55 else
                              "medium"   if s.risk_score >= 30 else "low"),
            "top_reactions": s.top_reactions or [],
        }
        for s in stats
    ]
