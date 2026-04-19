from fastapi import APIRouter
from shared.database import get_connection
from shared.data_tdm import main as fetch_tdm_data
from datetime import datetime, timezone, timedelta

THAILAND_TZ = timezone(timedelta(hours=7))

router = APIRouter(
    prefix="/addtdm",
    tags=["tdm"]
)

@router.post("/")
async def add_tdm():
    data = fetch_tdm_data()
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO tb_tdm (date_time, temperature_tdm, humidity_tdm, rain_tdm, wind_speed_tdm, weather_text_tdm)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                datetime.fromisoformat(data['data']['time']).astimezone(THAILAND_TZ).strftime("%Y-%m-%d %H:%M:%S"),
                data['data']['tc'],
                data['data']['rh'],
                data['data']['rain'],
                data['data']['ws10m'],
                data['data']['cond']['text_th']
            )
        )
        conn.commit()
        return {"message": "Add TDM Success"}
    except Exception as e:
        conn.rollback()
        return {"message": f"Add TDM Failed: {e}"}
    finally:
        cursor.close()
        conn.close()
