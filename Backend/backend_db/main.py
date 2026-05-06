import sys
import os
import asyncio
import uvicorn
from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta

THAILAND_TZ = timezone(timedelta(hours=7))

# เพิ่ม Backend/ เข้า sys.path เพื่อให้ import shared.* ได้
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from shared.database import get_connection
from backend_db.sync_all import sync_all
from backend_db.api_add_node import router as add_node_router
from backend_db.api_add_tdm import router as add_tdm_router
from backend_db.api_add_msn import router as add_msn_router
from backend_db.api_add_weather import router as add_weather_router

SYNC_INTERVAL = 30 * 60  # 30 นาที (วินาที)

# เก็บสถานะการ sync ล่าสุด
sync_status = {
    "last_sync": None,
    "nodes": {"status": "pending", "error": None},
    "tdm": {"status": "pending", "error": None},
    "msn": {"status": "pending", "error": None},
    "weather": {"status": "pending", "error": None}
}

async def sync_scheduler():
    """Background task: รัน sync_all ทุกๆ 30 นาที"""
    # รอให้ Server startup ให้เสร็จก่อน 5 วินาทีค่อยเริ่ม sync ครั้งแรก
    await asyncio.sleep(5)
    while True:
        await run_sync_and_update_status()
        await asyncio.sleep(SYNC_INTERVAL)

async def run_sync_and_update_status():
    global sync_status
    sync_status["last_sync"] = datetime.now(THAILAND_TZ).strftime("%Y-%m-%d %H:%M:%S")
    print(f"🔄 Starting sync session at {sync_status['last_sync']}...")
    try:
        conn = get_connection()
        # ทำการ sync แยกทีละส่วนเพื่อให้ track สถานะได้ละเอียดขึ้น
        # 1. Nodes
        try:
            # รัน sync_all ใน ThreadPool เพื่อไม่ให้ block event loop
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, sync_all, conn)
            
            sync_status["nodes"]["status"] = "success"
            sync_status["tdm"]["status"] = "success"
            sync_status["msn"]["status"] = "success"
            sync_status["weather"]["status"] = "success"
            sync_status["nodes"]["error"] = None
            sync_status["tdm"]["error"] = None
            sync_status["msn"]["error"] = None
            sync_status["weather"]["error"] = None
        except Exception as e:
            sync_status["nodes"]["status"] = "error"
            sync_status["weather"]["status"] = "error"
            sync_status["nodes"]["error"] = str(e)
            sync_status["weather"]["error"] = str(e)
        
        conn.close()
        print(f"✅ Sync session completed at {sync_status['last_sync']}")
    except Exception as e:
        sync_status["tdm"]["status"] = "error"
        sync_status["tdm"]["error"] = str(e)
        print(f"❌ Global sync error: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: สร้าง background task
    task = asyncio.create_task(sync_scheduler())
    print(f"🔄 [DB Service] Scheduler started — syncing every {SYNC_INTERVAL // 60} minutes")
    yield
    # Shutdown: ยกเลิก background task
    task.cancel()
    print("🛑 [DB Service] Scheduler stopped")

app = FastAPI(
    title="Weather Backend — DB Service",
    description="บันทึกข้อมูลลง Database (TDM, MSN, Node)",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(add_node_router)
app.include_router(add_tdm_router)
app.include_router(add_msn_router)
app.include_router(add_weather_router)


@app.get("/syncStatus")
async def get_sync_status():
    return sync_status

@app.get("/manualSync")
async def manual_sync():
    await run_sync_and_update_status()
    return {"status": "completed", "sync_status": sync_status}

if __name__ == "__main__":
    uvicorn.run("backend_db.main:app", host="0.0.0.0", port=8001, reload=True)
