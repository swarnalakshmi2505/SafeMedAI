from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.ml.trend_detector import analyze_all_trends
from app.models.drug import DrugStatistics, ExternalEvidenceSignal, YearlyTrend, DrugReport
from app.services.drug_label_service import fetch_drug_label_summary
from app.services.analytics_service import compute_profile_for_drug, recalculate_score_for_drug

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/risk-profile/{drug_name}")
def get_risk_profile(drug_name: str, db: Session = Depends(get_db)):
    profile, ror_signals, trend_data = compute_profile_for_drug(db, drug_name)
    if not profile:
        return {"error": f"No data for {drug_name}"}

    return {
        "drug_name": profile.drug_name,
        "risk_score": profile.risk_score,
        "risk_level": profile.risk_level,
        "signal_count": profile.signal_count,
        "strongest_ror": profile.strongest_ror,
        "death_rate": profile.death_rate,
        "serious_rate": profile.serious_rate,
        "trend_direction": profile.trend_direction,
        "trend_magnitude": profile.trend_magnitude,
        "explanation": profile.explanation,
        "ror_signals": [
            {
                "reaction": signal.reaction,
                "a": signal.a,
                "b": signal.b,
                "c": signal.c,
                "d": signal.d,
                "ror": signal.ror,
                "ci_lower": signal.ror_lower,
                "ci_upper": signal.ror_upper,
                "signal": signal.signal,
                "confirmed": signal.is_signal,
            }
            for signal in ror_signals[:5]
        ],
        "yearly_trends": trend_data,
    }


@router.get("/drug-detail/{drug_name}")
def get_drug_detail(drug_name: str, db: Session = Depends(get_db)):
    profile, ror_signals, trend_data = compute_profile_for_drug(db, drug_name)
    if not profile:
        return {"error": f"No data for {drug_name}"}

    evidence_rows = (
        db.query(ExternalEvidenceSignal)
        .filter(ExternalEvidenceSignal.drug_name == drug_name.lower())
        .order_by(ExternalEvidenceSignal.source)
        .all()
    )

    return {
        "drug_name": profile.drug_name,
        "clinical_context": fetch_drug_label_summary(drug_name),
        "risk_profile": {
            "risk_score": profile.risk_score,
            "risk_level": profile.risk_level,
            "signal_count": profile.signal_count,
            "strongest_ror": profile.strongest_ror,
            "death_rate": profile.death_rate,
            "serious_rate": profile.serious_rate,
            "trend_direction": profile.trend_direction,
            "trend_magnitude": profile.trend_magnitude,
            "explanation": profile.explanation,
        },
        "ror_signals": [
            {
                "reaction": signal.reaction,
                "ror": signal.ror,
                "ci_lower": signal.ror_lower,
                "ci_upper": signal.ror_upper,
                "signal": signal.signal,
                "confirmed": signal.is_signal,
                "counts": {"a": signal.a, "b": signal.b, "c": signal.c, "d": signal.d},
            }
            for signal in ror_signals[:8]
        ],
        "yearly_trends": trend_data,
        "evidence_sources": [
            {
                "source": evidence.source,
                "mention_count": evidence.mention_count,
                "matched_terms": evidence.matched_terms,
                "sample_items": evidence.sample_items,
                "last_updated": str(evidence.last_updated),
            }
            for evidence in evidence_rows
        ],
    }


@router.get("/leaderboard")
def get_risk_leaderboard(db: Session = Depends(get_db)):
    stats = db.query(DrugStatistics).order_by(DrugStatistics.risk_score.desc()).limit(10).all()
    
    results = []
    for index, stat in enumerate(stats):
        # Fetch alternatives (safer drugs)
        safer_drugs = db.query(DrugStatistics).filter(
            DrugStatistics.drug_name != stat.drug_name,
            DrugStatistics.risk_score < stat.risk_score - 10
        ).order_by(DrugStatistics.risk_score.asc()).limit(2).all()
        
        alternatives = [
            {
                "drug_name": s.drug_name,
                "risk_score": s.risk_score,
                "top_reactions": s.top_reactions[:2] if s.top_reactions else []
            }
            for s in safer_drugs
        ]
        
        results.append({
            "rank": index + 1,
            "drug_name": stat.drug_name,
            "risk_score": stat.risk_score,
            "total_reports": stat.total_reports,
            "death_reports": stat.death_reports,
            "top_reactions": stat.top_reactions or [],
            "alternatives": alternatives
        })
    return results


@router.get("/demographics")
def get_demographics(drug_name: str = Query(...), db: Session = Depends(get_db)):
    """Get age group and gender distribution for a drug"""
    drug_reports = (
        db.query(DrugReport)
        .filter(DrugReport.drug_name == drug_name.lower())
        .all()
    )

    if not drug_reports:
        return {"age_groups": [], "gender": []}

    # Aggregate by age group
    age_groups_map = {}
    gender_map = {}

    for report in drug_reports:
        # Age group processing
        if report.age_group:
            age_group = report.age_group
            if age_group not in age_groups_map:
                age_groups_map[age_group] = 0
            age_groups_map[age_group] += 1

        # Gender processing
        if report.gender:
            gender = report.gender.lower()
            if gender not in gender_map:
                gender_map[gender] = 0
            gender_map[gender] += 1

    # Convert to list format with normalized risk scores
    total_reports = len(drug_reports)
    age_groups = [
        {
            "group": group,
            "count": count,
            "percentage": round((count / total_reports * 100), 2) if total_reports > 0 else 0,
        }
        for group, count in sorted(age_groups_map.items())
    ]

    gender = [
        {
            "type": gtype.capitalize(),
            "count": count,
            "percentage": round((count / total_reports * 100), 2) if total_reports > 0 else 0,
        }
        for gtype, count in sorted(gender_map.items())
    ]

    return {
        "drug_name": drug_name,
        "age_groups": age_groups,
        "gender": gender,
        "total_reports": total_reports,
    }



@router.get("/trend-alerts")
def get_trend_alerts(db: Session = Depends(get_db)):
    all_drugs = db.query(DrugStatistics).all()
    drug_trend_map = {}

    for drug in all_drugs:
        trends = (
            db.query(YearlyTrend)
            .filter(YearlyTrend.drug_name == drug.drug_name)
            .order_by(YearlyTrend.year)
            .all()
        )
        drug_trend_map[drug.drug_name] = [
            {"year": trend.year, "report_count": trend.report_count}
            for trend in trends
        ]

    alerts = analyze_all_trends(drug_trend_map)
    return [
        {
            "drug_name": alert.drug_name,
            "alert_type": alert.alert_type,
            "severity": alert.severity,
            "message": alert.message,
        }
        for alert in alerts
    ]


@router.post("/recalculate-all")
def recalculate_all_scores(db: Session = Depends(get_db)):
    stats = db.query(DrugStatistics).all()
    updated = 0

    for stat in stats:
        profile = recalculate_score_for_drug(db, stat)
        if profile:
            updated += 1

    db.commit()
    return {"message": f"Recalculated scores for {updated} drugs"}
