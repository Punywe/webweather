import pymysql
import os

def check_schema():
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
        cursor.execute("SHOW CREATE TABLE tb_tdm")
        row = cursor.fetchone()
        print(row['Create Table'])
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_schema()
