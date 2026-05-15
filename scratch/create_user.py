import sqlite3
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

db_path = 'backend/safemedai.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

email = 'admin@safemedai.com'
password = 'Password123!'
hashed = hash_password(password)

try:
    cursor.execute(
        "INSERT INTO users (full_name, email, hashed_password, role, is_verified, is_active) VALUES (?, ?, ?, ?, ?, ?)",
        ("Admin Officer", email, hashed, "officer", True, True)
    )
    conn.commit()
    print(f"User {email} created successfully.")
except Exception as e:
    print(f"Error: {e}")

conn.close()
