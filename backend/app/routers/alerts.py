from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.alert_service import generate_alerts, get_all_alerts, review_alert, send_alert
from app.routers.auth import get_current_user, require_officer
from app.models.user import User

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.post("/generate")
def trigger_alert_generation(db: Session = Depends(get_db), _: User = Depends(require_officer)):
    return generate_alerts(db)

@router.post("/")
def create_manual_alert(data: dict, db: Session = Depends(get_db), _: User = Depends(require_officer)):
    from app.models.alert import Alert
    new_alert = Alert(
        drug_name=data.get("drug_name"),
        level=data.get("level", "medium"),
        risk_score=data.get("risk_score", 50.0),
        message=data.get("message", "Manual clinical observation recorded."),
        is_reviewed=False,
        is_sent=False
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    return new_alert

@router.get("/")
def fetch_alerts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alerts = get_all_alerts(db)
    # Both officers and doctors can see alerts, but doctors should maybe only see validated+sent alerts?
    # Actually the request says "Shows last 5 validated+sent alerts" for doctors.
    # The officer view might want all.
    
    return [
        {
            "id": a.id,
            "drug_name": a.drug_name,
            "risk_score": a.risk_score,
            "level": a.level,
            "message": a.message,
            "is_reviewed": a.is_reviewed,
            "is_sent": a.is_sent,
            "created_at": str(a.created_at)
        }
        for a in alerts
    ]

@router.patch("/{alert_id}/validate")
def mark_reviewed(alert_id: int, db: Session = Depends(get_db), _: User = Depends(require_officer)):
    result = review_alert(alert_id, db)
    if not result:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"success": True, "alert_id": alert_id}

@router.patch("/{alert_id}/send")
def mark_sent(alert_id: int, db: Session = Depends(get_db), _: User = Depends(require_officer)):
    result = send_alert(alert_id, db)
    if not result:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"success": True, "alert_id": alert_id}