from fastapi import APIRouter, HTTPException
from shared.database import get_connection
import pymysql.cursors

router = APIRouter(
    prefix="/getCurrentWeather",
    tags=["Weather"]
)

@router.get("/")
async def get_data_weather():
    try:
        conn = get_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        cursor.execute("SELECT date_time, temperature_w, wind_w, humidity_w, pressure_w FROM tb_weather ORDER BY date_time DESC LIMIT 1")
        data = cursor.fetchone()
        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'conn' in locals() and conn:
            conn.close()
