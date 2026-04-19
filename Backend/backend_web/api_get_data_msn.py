from fastapi import APIRouter, HTTPException
from shared.database import get_connection

router = APIRouter(
    prefix="/getDataMSN",
    tags=["MSN"]
)

@router.get("/")
async def get_data_msn():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT date_time, temperature_msn, humidity_msn, wind_speed_msn, pm25, weather_text_msn FROM tb_msn ORDER BY date_time DESC LIMIT 1")
        data = cursor.fetchall()
        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
    