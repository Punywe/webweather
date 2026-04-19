from fastapi import APIRouter, HTTPException
from shared.database import get_connection
from datetime import datetime
import pymysql.cursors

router = APIRouter(
    prefix="/get24h",
    tags=["24h"]
)

@router.get("/{name_node}")
async def get_data_node(name_node: str):
    conn = get_connection()
    try:
        cursor = conn.cursor(pymysql.cursors.DictCursor)

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

        # 2. ย้อนหลัง 24 ชั่วโมง ดึงอุณหภูมิเฉลี่ยและข้อมูลที่จำเป็น รายชั่วโมง
        cursor.execute("""
            SELECT 
                DATE_FORMAT(date_time, '%%Y-%%m-%%d %%H:00:00') as hour_group,
                AVG(temp) as temp,
                AVG(wind_speed) as wind_speed,
                AVG(wind_gust) as wind_gust,
                AVG(humidity) as humidity,
                AVG(pressure) as pressure,
                AVG(light) as light
            FROM tb_node
            WHERE node_name = %s
            AND date_time > %s - INTERVAL 24 HOUR
            AND date_time <= %s
            GROUP BY hour_group
            ORDER BY hour_group ASC;
        """, (name_node, latest_time, latest_time))

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
