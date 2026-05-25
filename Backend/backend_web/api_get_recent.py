from fastapi import APIRouter, HTTPException
from shared.database import get_connection
from datetime import datetime
import pymysql.cursors

router = APIRouter(
    prefix="/getRecent",
    tags=["Recent"]
)

@router.get("/{name_node}")
async def get_recent_data(name_node: str, minutes: int = 180):
    # Clean node name
    clean_name = name_node.strip("[]")
    conn = get_connection()
    try:
        cursor = conn.cursor(pymysql.cursors.DictCursor)

        # 1. Find the latest timestamp for this node
        cursor.execute("""
            SELECT MAX(date_time) as latest_time
            FROM tb_node
            WHERE node_name = %s;
        """, (clean_name,))
        latest = cursor.fetchone()

        if not latest or not latest["latest_time"]:
            return {"data": []}

        latest_time = latest["latest_time"]

        # 2. Get high-resolution raw data for the last N minutes
        cursor.execute("""
            SELECT 
                date_time,
                temp,
                wind_speed,
                wind_gust,
                humidity,
                pressure,
                light
            FROM tb_node
            WHERE node_name = %s
            AND date_time > %s - INTERVAL %s MINUTE
            AND date_time <= %s
            ORDER BY date_time ASC;
        """, (clean_name, latest_time, minutes, latest_time))

        rows = cursor.fetchall()

        result = []
        for row in rows:
            dt = row["date_time"]
            # If minutes <= 30, show seconds to see more detail, otherwise show HH:MM
            time_str = dt.strftime("%H:%M:%S") if minutes <= 30 else dt.strftime("%H:%M")
            result.append({
                "time": time_str,
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
