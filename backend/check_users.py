from app.database.connection import SessionLocal
from app.models.user import User

db = SessionLocal()
try:
    count = db.query(User).count()
    print(f"DEBUG: Number of users in database: {count}")
    if count > 0:
        users = db.query(User).all()
        for u in users:
            print(f"DEBUG: User: {u.email} ({u.role})")
finally:
    db.close()
