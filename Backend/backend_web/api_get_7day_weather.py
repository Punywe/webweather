from fastapi import APIRouter, HTTPException
from shared.database import get_connection
from datetime import datetime
import pymysql.cursors

router = APIRouter(
    prefix="/get7dayWeather",
    tags=["Weather"]
)

@router.get("/")
async def get_7day_weather():
    conn = get_connection()
    try:
        cursor = conn.cursor(pymysql.cursors.DictCursor)

        # 1. หาเวลาล่าสุด
        cursor.execute("""
            SELECT MAX(date_time) as latest_time
            FROM tb_weather;
        """)
        latest = cursor.fetchone()

        if not latest or not latest["latest_time"]:
            return {"data": []}

        latest_time = latest["latest_time"]

        # 2. เอา average ต่อวัน (ย้อนหลัง 7 วันจาก latest)
        cursor.execute("""
            SELECT 
                DATE(date_time) as day,
                AVG(temperature_w) as temperature_w,
                AVG(humidity_w) as humidity_w,
                AVG(wind_w) as wind_w,
                AVG(pressure_w) as pressure_w
            FROM tb_weather
            WHERE DATE(date_time) <= DATE(%s)
            AND DATE(date_time) > DATE(%s) - INTERVAL 7 DAY
            GROUP BY DATE(date_time)
            ORDER BY day DESC;
        """, (latest_time, latest_time))

        rows = cursor.fetchall()

        result = []
        THAI_DAYS = {
            "Monday": "จันทร์",
            "Tuesday": "อังคาร",
            "Wednesday": "พุธ",
            "Thursday": "พฤหัสบดี",
            "Friday": "ศุกร์",
            "Saturday": "เสาร์",
            "Sunday": "อาทิตย์"
        }
        for row in rows:
            formatted_date = row["day"].strftime("%d %b, %Y")
            day_name = THAI_DAYS.get(row["day"].strftime("%A"), "")
            result.append({
                "date": formatted_date,
                "day_name": day_name,
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
