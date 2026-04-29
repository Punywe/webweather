from fastapi import APIRouter, HTTPException
from shared.database import get_connection
from datetime import datetime
import pymysql.cursors

router = APIRouter(
    prefix="/getData24hmsn",
    tags=["getData24hmsn"]
)

@router.get("/")
async def get_data_node():
    conn = get_connection()
    try:
        cursor = conn.cursor(pymysql.cursors.DictCursor)

        # 1. หาเวลาล่าสุด
        cursor.execute("""
            SELECT MAX(date_time) as latest_time
            FROM tb_msn
        """)
        latest = cursor.fetchone()

        if not latest or not latest["latest_time"]:
            return {"data": []}

        latest_time = latest["latest_time"]

        # 2. ย้อนหลัง 24 ชั่วโมง ดึงอุณหภูมิเฉลี่ยและข้อมูลที่จำเป็น รายชั่วโมง
        cursor.execute("""
            SELECT 
                DATE_FORMAT(date_time, '%%Y-%%m-%%d %%H:00:00') as hour_group,
                AVG(temperature_msn) as temperature_msn,
                AVG(humidity_msn) as humidity_msn,
                AVG(wind_speed_msn) as wind_speed_msn,
                AVG(pm25) as pm25,
                MAX(weather_text_msn) as weather_text_msn
            FROM tb_msn
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
                # If it comes back as datetime object
                hour_str = hour_val.strftime("%H:%M")

            result.append({
                "time": hour_str,
                "temperature_msn": round(row["temperature_msn"], 2) if row["temperature_msn"] is not None else 0,
                "humidity_msn": round(row["humidity_msn"], 2) if row["humidity_msn"] is not None else 0,
                "wind_speed_msn": round(row["wind_speed_msn"], 2) if row["wind_speed_msn"] is not None else 0,
                "pm25": round(row["pm25"], 2) if row["pm25"] is not None else 0,
                "weather_text_msn": row["weather_text_msn"]
            })

        return {"data": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
