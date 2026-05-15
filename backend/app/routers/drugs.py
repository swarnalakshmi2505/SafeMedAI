from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import Counter
import httpx
import os
import json
try:
    import google.generativeai as genai
except ImportError:
    genai = None
try:
    from openai import AsyncOpenAI
except ImportError:
    AsyncOpenAI = None

from app.database.connection import get_db
from app.models.drug import DrugReport, DrugStatistics, YearlyTrend
from app.ml.ror_calculator import compute_ror_for_drug_reaction
from app.ml.risk_scorer import compute_full_risk_profile

router = APIRouter(prefix="/drugs", tags=["Drug Detail"])

# ── helpers ────────────────────────────────────────────────────────────────────

async def fetch_llm_drug_info(drug_name: str) -> dict:
    """Fetch uses, pros, cons, etc. from an LLM (Gemini or OpenAI)."""
    prompt = f"""
    Provide detailed medical information for the drug '{drug_name}'.
    Return ONLY a valid JSON object with exactly these keys:
    - "uses": brief description of what it is used for
    - "pros": clinical benefits
    - "cons": warnings and adverse reactions
    - "who_should_avoid": contraindications
    - "dosage": general dosage and administration guidelines
    """

    # Try Gemini
    gemini_key = os.getenv("GEMINI_API_KEY")
    if genai and gemini_key:
        try:
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            text = response.text
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].strip()
            return json.loads(text)
        except Exception as e:
            print(f"Gemini LLM error: {e}")

    # Try OpenAI
    openai_key = os.getenv("OPENAI_API_KEY")
    if AsyncOpenAI and openai_key:
        try:
            client = AsyncOpenAI(api_key=openai_key)
            response = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"OpenAI LLM error: {e}")

    # Fallback mock if no API keys
    return {
        "uses": f"Information for {drug_name} is typically used to treat specific conditions. (Please configure GEMINI_API_KEY or OPENAI_API_KEY)",
        "pros": "Can provide significant symptom relief when used correctly.",
        "cons": "May cause side effects. Consult a healthcare professional.",
        "who_should_avoid": "Patients with known allergies to this medication.",
        "dosage": "Follow your doctor's instructions."
    }


async def fetch_pubmed_count(drug_name: str) -> int:
    """Count PubMed safety-related papers for this drug."""
    url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    params = {
        "db": "pubmed", "retmode": "json",
        "term": f"{drug_name} adverse effects drug safety",
        "retmax": 0,
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(url, params=params)
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
    label_data    = await fetch_llm_drug_info(drug_lower)
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

    return {
        # Core identity
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
