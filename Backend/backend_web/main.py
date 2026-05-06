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

@app.get("/fixDB")
async def fix_db():
    try:
        from shared.database import get_connection
        conn = get_connection()
        cursor = conn.cursor()
        
        # Add AUTO_INCREMENT to tables
        # เราต้องระบุทั้ง Type และ PRIMARY KEY (ถ้ายังไม่ได้เป็น) 
        # หรือถ้าเป็น PK อยู่แล้วก็แค่ MODIFY ให้มี AUTO_INCREMENT
        cursor.execute("ALTER TABLE tb_tdm MODIFY id INT AUTO_INCREMENT")
        cursor.execute("ALTER TABLE tb_msn MODIFY id INT AUTO_INCREMENT")
        cursor.execute("ALTER TABLE tb_node MODIFY id INT AUTO_INCREMENT")
        
        conn.commit()
        conn.close()
        return {"status": "success", "message": "AUTO_INCREMENT restored to tb_tdm, tb_msn, and tb_node"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run("backend_web.main:app", host="0.0.0.0", port=8000, reload=True)
