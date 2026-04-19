import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shared.database import get_connection
conn = get_connection()
cur = conn.cursor()
cur.execute("SELECT id, username, email, role FROM tb_user")
rows = cur.fetchall()
for r in rows:
    print(r)
conn.close()
