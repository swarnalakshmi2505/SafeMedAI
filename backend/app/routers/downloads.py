from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime

from app.database.connection import get_db
from app.models.user import User, DownloadHistory
from app.routers.auth import get_current_user

router = APIRouter(prefix="/downloads", tags=["Download History"])

class DownloadRecord(BaseModel):
    drug_name: str
    report_type: str = "PDF Analysis"

class DownloadHistorySchema(BaseModel):
    id: int
    drug_name: str
    report_type: str
    downloaded_at: datetime

    class Config:
        from_attributes = True

@router.post("/record")
async def record_download(
    data: DownloadRecord,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_history = DownloadHistory(
        user_id=current_user.id,
        drug_name=data.drug_name,
        report_type=data.report_type
    )
    db.add(new_history)
    db.commit()
    db.refresh(new_history)
    return {"message": "Download recorded", "id": new_history.id}

@router.get("/history", response_model=List[DownloadHistorySchema])
async def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(DownloadHistory).filter(
        DownloadHistory.user_id == current_user.id
    ).order_by(DownloadHistory.downloaded_at.desc()).all()
