import pymysql
import os

def check_tdm():
    try:
        conn = pymysql.connect(
            host=os.getenv("DB_HOST", "127.0.0.1"),
            user="appuser",
            password="apppassword",
            db="weather",
            charset="utf8mb4",
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=True,
        )
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM tb_tdm ORDER BY date_time DESC LIMIT 5")
        rows = cursor.fetchall()
        print("Last TDM entries:")
        for row in rows:
            print(row)
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_tdm()
