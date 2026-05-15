import asyncio
from app.database.connection import SessionLocal
from app.services.ingestion_service import run_full_ingestion

async def main():
    db = SessionLocal()
    try:
        summary = await run_full_ingestion(db, limit_per_drug=50)
        print("Ingestion summary:", summary)
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main())
