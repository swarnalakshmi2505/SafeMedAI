import sqlite3
import os

db_path = 'backend/safemedai.db'
if not os.path.exists(db_path):
    print(f"File not found: {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print(f"Tables: {tables}")
    
    cursor.execute("SELECT COUNT(*) FROM users;")
    print(f"User count: {cursor.fetchone()[0]}")
    
    cursor.execute("SELECT COUNT(*) FROM drug_statistics;")
    print(f"Drug stats count: {cursor.fetchone()[0]}")

    cursor.execute("SELECT COUNT(*) FROM alerts;")
    print(f"Alerts count: {cursor.fetchone()[0]}")
    
    conn.close()
