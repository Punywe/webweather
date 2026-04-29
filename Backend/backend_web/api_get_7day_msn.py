from fastapi import APIRouter, HTTPException
from shared.database import get_connection
from datetime import datetime

router = APIRouter(
    prefix="/get7dayMSN",
    tags=["get7dayMSN"]
)

@router.get("/")
async def get_data_msn():
    conn = get_connection()
    try:
        cursor = conn.cursor()

        # 1. หาเวลาล่าสุด
        cursor.execute("""
            SELECT MAX(date_time) as latest_time
            FROM tb_msn;
        """)
        latest = cursor.fetchone()

        if not latest or not latest["latest_time"]:
            return {"data": []}

        latest_time = latest["latest_time"]

        # 2. เอา average temp ต่อวัน (ย้อนหลัง 7 วันจาก latest)
        cursor.execute("""
            SELECT 
                DATE(date_time) as day,
                AVG(temperature_msn) as temperature_msn,
                AVG(humidity_msn) as humidity_msn,
                AVG(wind_speed_msn) as wind_speed_msn,
                MAX(weather_text_msn) as weather_text_msn,
                AVG(pm25) as pm25
            FROM tb_msn
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
                "temp": round(row["temperature_msn"], 2) if row["temperature_msn"] is not None else 0,
                "wind_speed": round(row["wind_speed_msn"], 2) if row["wind_speed_msn"] is not None else 0,
                "humidity": round(row["humidity_msn"], 2) if row["humidity_msn"] is not None else 0,
                "pm25": round(row["pm25"], 2) if row["pm25"] is not None else 0,
                "weather_text": row["weather_text_msn"]
            })

        return {"data": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()