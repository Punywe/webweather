
import pymysql
import os

def check_db():
    try:
        conn = pymysql.connect(
            host="127.0.0.1",
            user="appuser",
            password="apppassword",
            db="weather",
            charset="utf8mb4",
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=True,
        )
        cursor = conn.cursor()
        
        print("--- Tables ---")
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        for t in tables:
            print(t)
            
        print("\n--- Users (tb_user) ---")
        cursor.execute("SELECT id, username, email, role FROM tb_user")
        users = cursor.fetchall()
        for u in users:
            print(u)
            
        print("\n--- Nodes (nodes) ---")
        cursor.execute("SELECT station_id, node_name FROM nodes")
        nodes = cursor.fetchall()
        for n in nodes:
            print(n)
            
        print("\n--- tb_node count ---")
        cursor.execute("SELECT COUNT(*) as count FROM tb_node")
        count = cursor.fetchone()
        print(count)
        
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_db()
