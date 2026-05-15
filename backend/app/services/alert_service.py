from sqlalchemy.orm import Session
from app.models.drug import DrugStatistics
from app.models.alert import Alert

THRESHOLDS = {
    "critical": 80,
    "high": 60,
    "medium": 40,
}

def get_level(score: float) -> str | None:
    if score >= THRESHOLDS["critical"]:
        return "critical"
    elif score >= THRESHOLDS["high"]:
        return "high"
    elif score >= THRESHOLDS["medium"]:
        return "medium"
    return None

def generate_alerts(db: Session):
    drugs = db.query(DrugStatistics).all()
    created = 0

    for drug in drugs:
        level = get_level(drug.risk_score)
        if not level:
            continue

        # Avoid duplicate alerts for same drug + level
        existing = db.query(Alert).filter(
            Alert.drug_name == drug.drug_name,
            Alert.level == level,
            Alert.is_reviewed == False
        ).first()

        if existing:
            continue

        alert = Alert(
            drug_name=drug.drug_name,
            risk_score=drug.risk_score,
            level=level,
            message=f"{drug.drug_name.capitalize()} has reached {level.upper()} risk level with score {drug.risk_score}."
        )
        db.add(alert)
        created += 1

    db.commit()
    return {"alerts_created": created}

def get_all_alerts(db: Session):
    return db.query(Alert).order_by(Alert.created_at.desc()).all()

def review_alert(alert_id: int, db: Session):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        return None
    alert.is_reviewed = True
    db.commit()
    db.refresh(alert)
    return alert

def send_alert(alert_id: int, db: Session):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        return None
    alert.is_sent = True
    db.commit()
    db.refresh(alert)
    return alert
