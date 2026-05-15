from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.drug import DrugStatistics
from app.services.sentiment_service import get_drug_sentiment

router = APIRouter(prefix="/sentiment", tags=["Social Sentiment"])

@router.get("/{drug_name}")
async def drug_sentiment(drug_name: str, db: Session = Depends(get_db)):
    stat = db.query(DrugStatistics).filter(
        DrugStatistics.drug_name == drug_name.lower()
    ).first()

    clinical_score = stat.risk_score if stat else 50.0

    return await get_drug_sentiment(drug_name.lower(), clinical_score)
