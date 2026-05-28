from fastapi import APIRouter, HTTPException
from shared.database import get_connection
from datetime import datetime
import pymysql.cursors

router = APIRouter(
    prefix="/getDataNodeSummary",
    tags=["Node"]
)

@router.get("/{name_node}")
async def get_data_node_summary(name_node: str, minutes: int = None, hours: int = None, days: int = None):
    clean_name = name_node.strip("[]")
    conn = get_connection()
    try:
        cursor = conn.cursor(pymysql.cursors.DictCursor)

        # 1. Find the latest timestamp and wind_dir for the node
        cursor.execute("""
            SELECT date_time as latest_time, wind_dir
            FROM tb_node
            WHERE node_name = %s
            ORDER BY date_time DESC LIMIT 1;
        """, (clean_name,))
        latest = cursor.fetchone()

        if not latest or not latest["latest_time"]:
            return {"data": []}

        latest_time = latest["latest_time"]

        # Determine interval SQL
        if minutes is not None:
            interval_sql = f"INTERVAL {minutes} MINUTE"
        elif hours is not None:
            interval_sql = f"INTERVAL {hours} HOUR"
        elif days is not None:
            interval_sql = f"INTERVAL {days} DAY"
        else:
            # Fallback to the latest row
            cursor.execute("""
                SELECT temp, humidity, wind_speed, rain_1h, rain_24h, pressure, light, wind_gust, wind_dir
                FROM tb_node 
                WHERE node_name = %s 
                ORDER BY date_time DESC 
                LIMIT 1
            """, (clean_name,))
            row = cursor.fetchone()
            if not row:
                return {"data": []}
            return {
                "data": [{
                    "node_name": clean_name,
                    "temp": float(row["temp"]) if row["temp"] is not None else 0,
                    "humidity": float(row["humidity"]) if row["humidity"] is not None else 0,
                    "wind_speed": float(row["wind_speed"]) if row["wind_speed"] is not None else 0,
                    "rain_1h": float(row["rain_1h"]) if row["rain_1h"] is not None else 0,
                    "rain_24h": float(row["rain_24h"]) if row["rain_24h"] is not None else 0,
                    "pressure": float(row["pressure"]) if row["pressure"] is not None else 0,
                    "light": float(row["light"]) if row["light"] is not None else 0,
                    "wind_gust": float(row["wind_gust"]) if row["wind_gust"] is not None else 0,
                    "wind_dir": str(row["wind_dir"]) if row["wind_dir"] is not None else "--",
                }]
            }

        # 2. Query averages over the interval
        query = f"""
            SELECT 
                AVG(temp) as temp, 
                AVG(humidity) as humidity, 
                AVG(wind_speed) as wind_speed, 
                AVG(rain_1h) as rain_1h, 
                AVG(rain_24h) as rain_24h, 
                AVG(pressure) as pressure, 
                AVG(light) as light, 
                AVG(wind_gust) as wind_gust
            FROM tb_node
            WHERE node_name = %s
            AND date_time > %s - {interval_sql}
            AND date_time <= %s
        """
        cursor.execute(query, (clean_name, latest_time, latest_time))
        row = cursor.fetchone()

        if not row or row["temp"] is None:
            return {"data": []}

        return {
            "data": [{
                "node_name": clean_name,
                "temp": round(float(row["temp"]), 2) if row["temp"] is not None else 0,
                "humidity": round(float(row["humidity"]), 2) if row["humidity"] is not None else 0,
                "wind_speed": round(float(row["wind_speed"]), 2) if row["wind_speed"] is not None else 0,
                "rain_1h": round(float(row["rain_1h"]), 2) if row["rain_1h"] is not None else 0,
                "rain_24h": round(float(row["rain_24h"]), 2) if row["rain_24h"] is not None else 0,
                "pressure": round(float(row["pressure"]), 2) if row["pressure"] is not None else 0,
                "light": round(float(row["light"]), 2) if row["light"] is not None else 0,
                "wind_gust": round(float(row["wind_gust"]), 2) if row["wind_gust"] is not None else 0,
                "wind_dir": str(latest["wind_dir"]) if latest.get("wind_dir") is not None else "--",
            }]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
