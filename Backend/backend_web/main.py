import sys
import os
import uvicorn

# เพิ่ม Backend/ เข้า sys.path เพื่อให้ import shared.* ได้
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend_web.api_get_name_node import router as get_name_node_router
from backend_web.api_get_data_node import router as get_data_node_router
from backend_web.api_get_7day import router as get_7day_router
from backend_web.api_get_24h import router as get_24h_router
from backend_web.api_get_pre_tmd import router as get_pre_tmd_router
from backend_web.api_get_data7day_tmd import router as get_data7day_tmd_router
from backend_web.api_get_data24hr_tmd import router as get_data24hr_tmd_router
from backend_web.api_get_data_msn import router as get_data_msn_router
from backend_web.api_get_7day_msn import router as get_7day_msn_router
from backend_web.api_get_24h_msn import router as get_24h_msn_router
from backend_web.api_register import router as register_router
from backend_web.api_login import router as login_router
from backend_web.api_get_data_tmd import router as get_data_tmd_router
from backend_web.api_add_node import router as add_node_router
from backend_web.api_download import router as api_download_router
from backend_web.api_get_data_weather import router as get_data_weather_router
from backend_web.api_get_24h_weather import router as get_24h_weather_router

app = FastAPI(
    title="Weather Backend — Web Service",
    description="API สำหรับหน้าเว็บ (Frontend)",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://203.146.252.229:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(get_name_node_router)
app.include_router(get_data_node_router)
app.include_router(get_7day_router)
app.include_router(get_24h_router)
app.include_router(get_pre_tmd_router)
app.include_router(get_data7day_tmd_router)
app.include_router(get_data24hr_tmd_router)
app.include_router(get_data_msn_router)
app.include_router(get_7day_msn_router)
app.include_router(get_24h_msn_router)
app.include_router(register_router)
app.include_router(login_router)
app.include_router(get_data_tmd_router)
app.include_router(add_node_router)
app.include_router(api_download_router)
app.include_router(get_data_weather_router)
app.include_router(get_24h_weather_router)

@app.get("/debugDB")
async def debug_db():
    try:
        from shared.database import get_connection
        import pymysql.cursors
        conn = get_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        # Get Schemas
        cursor.execute("SHOW CREATE TABLE tb_tdm")
        schema_tdm = cursor.fetchone()
        cursor.execute("SHOW CREATE TABLE tb_msn")
        schema_msn = cursor.fetchone()
        cursor.execute("SHOW CREATE TABLE tb_node")
        schema_node = cursor.fetchone()
        
        # Get Last Rows
        cursor.execute("SELECT * FROM tb_tdm ORDER BY date_time DESC LIMIT 1")
        row_tdm = cursor.fetchone()
        cursor.execute("SELECT * FROM tb_msn ORDER BY date_time DESC LIMIT 1")
        row_msn = cursor.fetchone()
        
        conn.close()
        return {
            "tb_tdm": {"schema": schema_tdm, "last_row": row_tdm},
            "tb_msn": {"schema": schema_msn, "last_row": row_msn},
            "tb_node": {"schema": schema_node}
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/debugAll")
async def debug_all():
    try:
        from shared.database import get_connection
        conn = get_connection()
        cursor = conn.cursor()
        
        # 1. Check all tables
        cursor.execute("SHOW TABLES")
        tables = [list(row.values())[0] for row in cursor.fetchall()]
        
        # 2. Check nodes count and details
        cursor.execute("SELECT id, station_id, node_name FROM nodes")
        nodes_list = cursor.fetchall()
        
        # 3. Check tb_node unique names
        cursor.execute("SELECT DISTINCT node_name FROM tb_node")
        tb_node_names = cursor.fetchall()
        
        # 4. Check tb_node count
        cursor.execute("SELECT COUNT(*) as count FROM tb_node")
        tb_node_count = cursor.fetchone()

        # 5. Check tb_user count and names
        cursor.execute("SELECT username, role FROM tb_user")
        users_list = cursor.fetchall()
        
        conn.close()
        return {
            "tables": tables,
            "nodes": nodes_list,
            "tb_node_distinct_names": tb_node_names,
            "tb_node_total_rows": tb_node_count,
            "users": users_list
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/bootstrap")
async def bootstrap():
    from shared.database import get_connection
    import bcrypt
    from datetime import datetime
    conn = get_connection()
    try:
        cursor = conn.cursor()
        
        # 1. Ensure Admin User exists (admin / admin1234)
        cursor.execute("SELECT id FROM tb_user WHERE username = %s", ("admin",))
        admin_user = cursor.fetchone()
        
        pwd = "admin1234"
        hashed = bcrypt.hashpw(pwd.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        if not admin_user:
            cursor.execute(
                "INSERT INTO tb_user (username, password, email, role, date_regis) VALUES (%s, %s, %s, %s, %s)",
                ("admin", hashed, "admin@example.com", "admin", datetime.now())
            )
            user_msg = "✅ Admin created (user: admin, pass: admin1234). "
        else:
            cursor.execute(
                "UPDATE tb_user SET password = %s, role = 'admin' WHERE username = %s",
                (hashed, "admin")
            )
            user_msg = "✅ Admin password reset to 'admin1234'. "
            
        # 2. Create Default Nodes (Station_1, Station_2) if empty
        cursor.execute("SELECT COUNT(*) as count FROM nodes")
        node_count = cursor.fetchone()["count"]
        if node_count == 0:
            nodes_to_add = [
                ("Station_1", "Station 1 (Tak)", 16.883, 99.125),
                ("Station_2", "Station 2 (Tak)", 16.884, 99.126)
            ]
            for s_id, name, lat, lon in nodes_to_add:
                cursor.execute(
                    "INSERT INTO nodes (station_id, node_name, latitude, longitude) VALUES (%s, %s, %s, %s)",
                    (s_id, name, lat, lon)
                )
            node_msg = "✅ Nodes Station_1 & Station_2 added. "
        else:
            node_msg = "ℹ️ Nodes already exist. "
            
        # 3. Reset Sync State & Clear Data (Always reset for now to ensure data comes back)
        cursor.execute("UPDATE sync_state SET value = '0' WHERE key_name = 'sheet_last_row'")
        if cursor.rowcount == 0:
             cursor.execute("INSERT INTO sync_state (key_name, value) VALUES ('sheet_last_row', '0')")
             
        cursor.execute("TRUNCATE TABLE tb_node")
        
        conn.commit()
        return {"status": "success", "message": user_msg + node_msg + " ✅ tb_node truncated & Sync reset to row 0."}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()

if __name__ == "__main__":
    uvicorn.run("backend_web.main:app", host="0.0.0.0", port=8000, reload=True)
