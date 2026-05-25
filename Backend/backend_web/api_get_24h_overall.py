from fastapi import APIRouter, HTTPException
from shared.database import get_connection
from datetime import datetime, timedelta
import pymysql.cursors

router = APIRouter(
    prefix="/get24hOverall",
    tags=["Overall"]
)

@router.get("/")
async def get_24h_overall(limit_hours: int = 24):
    conn = get_connection()
    try:
        cursor = conn.cursor(pymysql.cursors.DictCursor)

        cursor.execute("SELECT MAX(date_time) as latest_time FROM tb_node;")
        latest = cursor.fetchone()
        
        if not latest or not latest["latest_time"]:
            latest_time = datetime.now()
        else:
            latest_time = latest["latest_time"]

        start_time = latest_time - timedelta(hours=limit_hours)

        hourly_data = {}
        
        curr_time = start_time
        # We add 1 hour to start_time to align with the first hour group
        # but a simple while loop filling hours is fine
        while curr_time <= latest_time + timedelta(hours=1):
            hour_str = curr_time.strftime('%Y-%m-%d %H:00:00')
            hourly_data[hour_str] = {
                "time": curr_time.strftime('%H:%M'),
                "full_time": hour_str,
                "Node_temp": None, "Node_hum": None, "Node_wind": None,
                "TMD_temp": None, "TMD_hum": None, "TMD_wind": None,
                "MSN_temp": None, "MSN_hum": None, "MSN_wind": None,
                "Weather_temp": None, "Weather_hum": None, "Weather_wind": None,
            }
            curr_time += timedelta(hours=1)

        def fetch_and_merge(table_name, prefix, temp_col, hum_col, wind_col):
            query = f"""
                SELECT 
                    DATE_FORMAT(date_time, '%%Y-%%m-%%d %%H:00:00') as hour_group,
                    AVG({temp_col}) as temp,
                    AVG({hum_col}) as hum,
                    AVG({wind_col}) as wind
                FROM {table_name}
                WHERE date_time > %s AND date_time <= %s
                GROUP BY hour_group
            """
            cursor.execute(query, (start_time, latest_time))
            for row in cursor.fetchall():
                hg = row["hour_group"]
                if hg in hourly_data:
                    if row["temp"] is not None:
                        hourly_data[hg][f"{prefix}_temp"] = round(row["temp"], 2)
                    if row["hum"] is not None:
                        hourly_data[hg][f"{prefix}_hum"] = round(row["hum"], 2)
                    if row["wind"] is not None:
                        hourly_data[hg][f"{prefix}_wind"] = round(row["wind"], 2)

        fetch_and_merge("tb_node", "Node", "temp", "humidity", "wind_speed")
        fetch_and_merge("tb_tdm", "TMD", "temperature_tdm", "humidity_tdm", "wind_speed_tdm")
        fetch_and_merge("tb_msn", "MSN", "temperature_msn", "humidity_msn", "wind_speed_msn")
        fetch_and_merge("tb_weather", "Weather", "temperature_w", "humidity_w", "wind_w")

        sorted_keys = sorted(hourly_data.keys())
        # Filter out empty entries if they are outside the actual data range, but it's fine to keep them for continuity
        result = [hourly_data[k] for k in sorted_keys if k <= latest_time.strftime('%Y-%m-%d %H:00:00') and k > start_time.strftime('%Y-%m-%d %H:00:00')]

        return {"data": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
