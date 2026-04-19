from fastapi import APIRouter, HTTPException
from shared.database import get_connection
from datetime import datetime

router = APIRouter(
    prefix="/get7day",
    tags=["7day"]
)

@router.get("/{name_node}")
async def get_data_node(name_node: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()

        # 1. หาเวลาล่าสุด
        cursor.execute("""
            SELECT MAX(date_time) as latest_time
            FROM tb_node
            WHERE node_name = %s;
        """, (name_node,))
        latest = cursor.fetchone()

        if not latest or not latest["latest_time"]:
            return {"data": []}

        latest_time = latest["latest_time"]

        # 2. เอา average temp ต่อวัน (ย้อนหลัง 7 วันจาก latest)
        cursor.execute("""
            SELECT 
                DATE(date_time) as day,
                AVG(temp) as temp,
                AVG(wind_speed) as wind_speed,
                AVG(wind_gust) as wind_gust,
                AVG(humidity) as humidity,
                AVG(pressure) as pressure,
                AVG(light) as light
            FROM tb_node
            WHERE node_name = %s
            AND DATE(date_time) < DATE(%s)
            AND DATE(date_time) >= DATE(%s) - INTERVAL 7 DAY
            GROUP BY DATE(date_time)
            ORDER BY day DESC;
        """, (name_node, latest_time, latest_time))

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
            formatted_date = f"{dt.day} {THAI_MONTHS[dt.month]} {dt.year + 543}"
            day_name = THAI_DAYS.get(dt.strftime("%A"), dt.strftime("%A"))
            result.append({
                "date": formatted_date,
                "day_name": day_name,
                "temp": round(row["temp"], 2) if row["temp"] is not None else 0,
                "wind_speed": round(row["wind_speed"], 2) if row["wind_speed"] is not None else 0,
                "wind_gust": round(row["wind_gust"], 2) if row["wind_gust"] is not None else 0,
                "humidity": round(row["humidity"], 2) if row["humidity"] is not None else 0,
                "pressure": round(row["pressure"], 2) if row["pressure"] is not None else 0,
                "light": round(row["light"], 2) if row["light"] is not None else 0
            })

        return {"data": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()