from fastapi import APIRouter, HTTPException
from shared.database import get_connection
import pymysql.cursors

router = APIRouter(
    prefix="/getCurrentTMD",
    tags=["TMD"]
)

@router.get("/")
async def get_data_tmd():
    try:
        conn = get_connection()
        # Use DictCursor to return dictionaries instead of tuples if needed
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        cursor.execute("SELECT date_time, temperature_tdm, humidity_tdm, wind_speed_tdm, rain_tdm, weather_text_tdm FROM tb_tdm ORDER BY date_time DESC LIMIT 1")
        data = cursor.fetchall()
        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
