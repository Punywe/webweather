from fastapi import APIRouter, HTTPException
from shared.database import get_connection
from datetime import datetime

router = APIRouter(
    prefix="/getDataTMD",
    tags=["getDataTMD"]
)

@router.get("/")
async def get_data_tmd():
    conn = get_connection()
    try:
        cursor = conn.cursor()

        # 1. หาเวลาล่าสุด
        cursor.execute("""
            SELECT MAX(date_time) as latest_time
            FROM tb_tdm;
        """)
        latest = cursor.fetchone()

        if not latest or not latest["latest_time"]:
            return {"data": []}

        latest_time = latest["latest_time"]

        # 2. เอา average temp ต่อวัน (ย้อนหลัง 7 วันจาก latest)
        cursor.execute("""
            SELECT 
                DATE(date_time) as day,
                AVG(temperature_tdm) as temperature_tdm,
                AVG(humidity_tdm) as humidity_tdm,
                AVG(rain_tdm) as rain_tdm,
                MAX(weather_text_tdm) as weather_text_tdm,
                AVG(wind_speed_tdm) as wind_speed_tdm
            FROM tb_tdm
            WHERE DATE(date_time) <= DATE(%s)
            AND DATE(date_time) > DATE(%s) - INTERVAL 7 DAY
            GROUP BY DATE(date_time)
            ORDER BY day DESC;
        """, (latest_time, latest_time))

        rows = cursor.fetchall()
        result = []

        THAI_MONTHS = [
            "", "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
            "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
        ]
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
            dt = row["day"]
            if isinstance(dt, str):
                dt = datetime.strptime(dt, "%Y-%m-%d").date()

            formatted_date = f"{dt.day} {THAI_MONTHS[dt.month]} {dt.year + 543}"
            day_name = THAI_DAYS.get(dt.strftime("%A"), dt.strftime("%A"))  # ← ได้ชื่อวันภาษาอังกฤษ

            result.append({
                "date": formatted_date,
                "day_name": day_name,  # ← เติม "วัน" นำหน้า
                "temp": round(row["temperature_tdm"], 2) if row["temperature_tdm"] is not None else 0,
                "wind_speed": round(row["wind_speed_tdm"], 2) if row["wind_speed_tdm"] is not None else 0,
                "humidity": round(row["humidity_tdm"], 2) if row["humidity_tdm"] is not None else 0,
                "rain": round(row["rain_tdm"], 2) if row["rain_tdm"] is not None else 0,
                "weather_text": row["weather_text_tdm"]
            })

        return {"data": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()