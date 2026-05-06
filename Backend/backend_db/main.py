import sys
import os
import asyncio
import uvicorn
from contextlib import asynccontextmanager

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

async def sync_scheduler():
    """Background task: รัน sync_all ทุกๆ 30 นาที"""
    while True:
        try:
            conn = get_connection()
            sync_all(conn)
            conn.close()
            print("✅ Sync completed successfully")
        except Exception as e:
            print(f"❌ Sync error: {e}")
        await asyncio.sleep(SYNC_INTERVAL)

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


if __name__ == "__main__":
    uvicorn.run("backend_db.main:app", host="0.0.0.0", port=8001, reload=True)
