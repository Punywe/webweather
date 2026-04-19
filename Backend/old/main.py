import asyncio
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from database import get_connection
from sync_all import sync_all
from api_add_node import router as add_node_router
from api_add_tdm import router as add_tdm_router
from api_add_msn import router as add_msn_router
from api_get_name_node import router as get_name_node_router
from api_get_data_node import router as get_data_node_router
from fastapi.middleware.cors import CORSMiddleware

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
    print(f"🔄 Scheduler started — syncing every {SYNC_INTERVAL // 60} minutes")
    yield
    # Shutdown: ยกเลิก background task
    task.cancel()
    print("🛑 Scheduler stopped")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend ของคุณ
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(add_node_router)
app.include_router(add_tdm_router)
app.include_router(add_msn_router)
app.include_router(get_name_node_router)
app.include_router(get_data_node_router)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)