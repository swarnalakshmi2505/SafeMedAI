from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database.connection import get_db
from app.services.chatbot_service import chat

router = APIRouter(prefix="/chatbot", tags=["AI Chatbot"])

class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []

@router.post("")
async def chatbot_endpoint(req: ChatRequest, db: Session = Depends(get_db)):
    reply = await chat(req.message, req.history, db)
    return {"response": reply}
