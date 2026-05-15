from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal, get_db
from app.models.drug import DrugReport, DrugStatistics, ExternalEvidenceSignal, YearlyTrend
from app.models.user import User
from app.routers.auth import require_officer, get_current_user
from app.services.ingestion_service import run_full_ingestion

router = APIRouter(prefix="/data", tags=["Data Pipeline"])

ingestion_status = {"running": False, "last_result": None, "last_error": None}


async def _run_ingestion(limit: int) -> None:
    ingestion_status["running"] = True
    ingestion_status["last_error"] = None

    db = SessionLocal()
    try:
        ingestion_status["last_result"] = await run_full_ingestion(db, limit)
    except Exception as exc:
        ingestion_status["last_error"] = str(exc)
    finally:
        db.close()
        ingestion_status["running"] = False


@router.post("/ingest")
async def trigger_ingestion(
    background_tasks: BackgroundTasks,
    limit: int = Query(default=100, ge=1, le=100),
    _: User = Depends(require_officer),
):
    if ingestion_status["running"]:
        raise HTTPException(status_code=409, detail="Ingestion already running")

    ingestion_status["running"] = True
    ingestion_status["last_error"] = None
    background_tasks.add_task(_run_ingestion, limit)
    return {"message": "Ingestion started in background", "status": "running"}


@router.get("/ingest/status")
def ingestion_status_check(_: User = Depends(require_officer)):
    return ingestion_status


@router.get("/summary")
def get_data_summary(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    total_reports = db.query(DrugReport).count()
    total_drugs = db.query(DrugStatistics).count()
    latest = db.query(DrugReport).order_by(DrugReport.created_at.desc()).first()

    return {
        "total_reports": total_reports,
        "drugs_tracked": total_drugs,
        "latest_report_date": str(latest.created_at) if latest else None,
    }


@router.get("/drugs")
def list_tracked_drugs(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    stats = db.query(DrugStatistics).order_by(DrugStatistics.risk_score.desc()).all()
    evidence_rows = db.query(ExternalEvidenceSignal).all()
    evidence_by_drug = {}
    for row in evidence_rows:
        evidence_by_drug.setdefault(row.drug_name, {})[row.source] = {
            "mention_count": row.mention_count,
            "last_updated": str(row.last_updated),
        }

    return [
        {
            "drug_name": stat.drug_name,
            "total_reports": stat.total_reports,
            "risk_score": stat.risk_score,
            "top_reactions": stat.top_reactions,
            "external_evidence": evidence_by_drug.get(stat.drug_name, {}),
            "last_updated": str(stat.last_updated),
        }
        for stat in stats
    ]


@router.get("/trends/{drug_name}")
def get_drug_trends(drug_name: str, db: Session = Depends(get_db), _: User = Depends(require_officer)):
    trends = (
        db.query(YearlyTrend)
        .filter(YearlyTrend.drug_name == drug_name.lower())
        .order_by(YearlyTrend.year)
        .all()
    )

    return [
        {
            "year": trend.year,
            "report_count": trend.report_count,
            "serious_count": trend.serious_count,
        }
        for trend in trends
    ]
