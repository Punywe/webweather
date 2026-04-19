import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shared.database import get_connection

conn = get_connection()
cur = conn.cursor()
cur.execute("SHOW COLUMNS FROM tb_user LIKE 'role'")
result = cur.fetchone()
if not result:
    cur.execute("ALTER TABLE tb_user ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user'")
    print("OK: added role column")
else:
    print("OK: role column exists")
conn.close()
