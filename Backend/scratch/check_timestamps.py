import pymysql
import os

def check_timestamps():
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
        for table in ["tb_node", "tb_tdm", "tb_msn", "tb_weather"]:
            cursor.execute(f"SELECT MAX(date_time) as max_dt, MIN(date_time) as min_dt, COUNT(*) as count FROM {table}")
            row = cursor.fetchone()
            print(f"Table: {table}")
            print(f"  Count: {row['count']}")
            print(f"  Min DT: {row['min_dt']}")
            print(f"  Max DT: {row['max_dt']}")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_timestamps()
