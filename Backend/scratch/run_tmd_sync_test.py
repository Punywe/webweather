import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.database import get_connection
import pymysql.cursors

def test_sync():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        print("Cursor class:", cursor.__class__)
        cursor.execute("SELECT COUNT(*) FROM tb_tdm")
        res = cursor.fetchone()
        print("Fetchone result:", res)
        print("Type:", type(res))
        
        # Let's see if accessing [0] fails
        try:
            count = res[0]
            print("Accessing [0] succeeded:", count)
        except Exception as e:
            print("Accessing [0] failed:", type(e), e)
            
        # Let's see if we can access the first value from values() or key
        if isinstance(res, dict):
            val = list(res.values())[0]
            print("Accessing list(res.values())[0] succeeded:", val)
            
    finally:
        conn.close()

if __name__ == "__main__":
    test_sync()
