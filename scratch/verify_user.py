import sqlite3
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

db_path = 'backend/safemedai.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

email = 'admin@safemedai.com'
password = 'Password123!'

cursor.execute("SELECT hashed_password FROM users WHERE email = ?", (email,))
res = cursor.fetchone()
if res:
    hashed = res[0]
    is_valid = verify_password(password, hashed)
    print(f"Password valid: {is_valid}")
else:
    print("User not found")

conn.close()
