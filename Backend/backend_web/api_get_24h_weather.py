from fastapi import APIRouter, HTTPException
from shared.database import get_connection
from datetime import datetime
import pymysql.cursors

router = APIRouter(
    prefix="/getData24hWeather",
    tags=["Weather"]
)

@router.get("/")
async def get_data_24h_weather():
    conn = get_connection()
    try:
        cursor = conn.cursor(pymysql.cursors.DictCursor)

        # 1. Find latest time in tb_weather
        cursor.execute("""
            SELECT MAX(date_time) as latest_time
            FROM tb_weather
        """)
        latest = cursor.fetchone()

        if not latest or not latest["latest_time"]:
            return {"data": []}

        latest_time = latest["latest_time"]

        # 2. Get hourly average for the last 24 hours
        cursor.execute("""
            SELECT 
                DATE_FORMAT(date_time, '%%Y-%%m-%%d %%H:00:00') as hour_group,
                AVG(temperature_w) as temperature_w,
                AVG(humidity_w) as humidity_w,
                AVG(wind_w) as wind_w,
                AVG(pressure_w) as pressure_w
            FROM tb_weather
            WHERE date_time > %s - INTERVAL 24 HOUR
            AND date_time <= %s
            GROUP BY hour_group
            ORDER BY hour_group ASC;
        """, (latest_time, latest_time))

        rows = cursor.fetchall()

        result = []
        for row in rows:
            hour_val = row["hour_group"]
            if isinstance(hour_val, str):
                dt = datetime.strptime(hour_val, '%Y-%m-%d %H:%M:%S')
                hour_str = dt.strftime("%H:%M")
            else:
                hour_str = hour_val.strftime("%H:%M")

            result.append({
                "time": hour_str,
                "temperature_w": round(row["temperature_w"], 2) if row["temperature_w"] is not None else 0,
                "humidity_w": round(row["humidity_w"], 2) if row["humidity_w"] is not None else 0,
                "wind_w": round(row["wind_w"], 2) if row["wind_w"] is not None else 0,
                "pressure_w": round(row["pressure_w"], 2) if row["pressure_w"] is not None else 0
            })

        return {"data": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
