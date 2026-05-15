from sqlalchemy.orm import Session
from app.models.drug import DrugStatistics, DrugReport
from collections import Counter

SERIOUS_REACTIONS = {
    "death", "cardiac arrest", "liver failure", "renal failure",
    "anaphylaxis", "stroke", "seizure", "respiratory failure"
}

def check_interaction(drug1: str, drug2: str, db: Session):
    d1 = db.query(DrugStatistics).filter(
        DrugStatistics.drug_name == drug1.lower().strip()
    ).first()

    d2 = db.query(DrugStatistics).filter(
        DrugStatistics.drug_name == drug2.lower().strip()
    ).first()

    if not d1:
        return {"error": f"Drug not found: {drug1}"}
    if not d2:
        return {"error": f"Drug not found: {drug2}"}

    r1 = db.query(DrugReport.reaction).filter(
        DrugReport.drug_name == drug1.lower().strip()
    ).all()
    r2 = db.query(DrugReport.reaction).filter(
        DrugReport.drug_name == drug2.lower().strip()
    ).all()

    set1 = set(r[0].lower() for r in r1 if r[0])
    set2 = set(r[0].lower() for r in r2 if r[0])

    common_reactions = list(set1.intersection(set2))
    serious_common   = [r for r in common_reactions if r in SERIOUS_REACTIONS]

    # Risk logic
    if serious_common or (d1.risk_score >= 70 and d2.risk_score >= 70):
        risk = "critical"
        summary = "Dangerous combination. Serious shared adverse reactions detected."
    elif d1.risk_score >= 55 and d2.risk_score >= 55:
        risk = "high"
        summary = "High combined risk. Use only under strict medical supervision."
    elif len(common_reactions) >= 5:
        risk = "medium"
        summary = "Moderate overlap in side effects. Monitor closely."
    else:
        risk = "low"
        summary = "No significant interaction signal detected in current data."

    return {
        "drug1": drug1.lower(),
        "drug2": drug2.lower(),
        "drug1_risk_score": d1.risk_score,
        "drug2_risk_score": d2.risk_score,
        "interaction_risk": risk,
        "summary": summary,
        "common_reactions": common_reactions[:8],
        "serious_common_reactions": serious_common
    }
