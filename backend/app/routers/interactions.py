from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.interaction_service import check_interaction

router = APIRouter(prefix="/interactions", tags=["Drug Interactions"])

@router.get("")
async def get_interaction(drug1: str, drug2: str, db: Session = Depends(get_db)):
    return check_interaction(drug1, drug2, db)
