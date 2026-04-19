import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from shared.database import get_connection
conn = get_connection()
cur = conn.cursor()
cur.execute("UPDATE tb_user SET role = 'user' WHERE role IS NULL OR role = ''")
print("Updated rows:", cur.rowcount)
conn.close()
