from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database.connection import Base, engine
from app.models import alert, drug, user, doctor_report  # noqa: F401
from app.routers.health import router as health_router
from app.routers import auth, data, analytics, alerts, drugs, advanced, downloads, doctor_reports
from app.routers.sentiment import router as sentiment_router

app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    version=settings.API_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "SafeMedAI API is running"}


app.include_router(health_router)
app.include_router(auth.router)
app.include_router(alerts.router)
app.include_router(data.router)
app.include_router(analytics.router)
app.include_router(drugs.router)
app.include_router(advanced.router)
app.include_router(downloads.router)
app.include_router(sentiment_router)
app.include_router(doctor_reports.router)
