import pymysql
import pymysql.cursors
import os

def check_db():
    try:
        conn = pymysql.connect(
            host="127.0.0.1",
            port=3306,
            user="appuser",
            password="apppassword",
            db="weather",
            charset="utf8mb4",
            cursorclass=pymysql.cursors.DictCursor
        )
        with conn.cursor() as cursor:
            print("--- Table: nodes ---")
            cursor.execute("SELECT * FROM nodes")
            rows_nodes = cursor.fetchall()
            for row in rows_nodes:
                print(row)
            
            print("\n--- Table: tb_node (sample) ---")
            cursor.execute("SELECT DISTINCT node_name FROM tb_node")
            rows_tb_node = cursor.fetchall()
            for row in rows_tb_node:
                print(row)
                
            cursor.execute("SELECT COUNT(*) as count FROM tb_node")
            count = cursor.fetchone()
            print(f"Total rows in tb_node: {count['count']}")

        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_db()
