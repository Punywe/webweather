from fastapi import APIRouter, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
from shared.database import get_connection
import pymysql.cursors
import csv
import io
from datetime import datetime
import urllib.parse

router = APIRouter(
    prefix="/api_download",
    tags=["Download"]
)

@router.get("/limits")
async def get_download_limits():
    """Returns the min and max date available across all data sources"""
    try:
        conn = get_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        limits = {}

        # TMD
        cursor.execute("SELECT MIN(date_time) as min_date, MAX(date_time) as max_date FROM tb_tdm")
        tmd = cursor.fetchone()
        limits["tmd"] = {
            "min": tmd["min_date"].strftime("%Y-%m-%d") if tmd and tmd["min_date"] else None,
            "max": tmd["max_date"].strftime("%Y-%m-%d") if tmd and tmd["max_date"] else None
        }

        # MSN 
        cursor.execute("SELECT MIN(date_time) as min_date, MAX(date_time) as max_date FROM tb_msn")
        msn = cursor.fetchone()
        limits["msn"] = {
            "min": msn["min_date"].strftime("%Y-%m-%d") if msn and msn["min_date"] else None,
            "max": msn["max_date"].strftime("%Y-%m-%d") if msn and msn["max_date"] else None
        }

        # Node (Overall min and max)
        cursor.execute("SELECT MIN(date_time) as min_date, MAX(date_time) as max_date FROM tb_node")
        node = cursor.fetchone()
        limits["node"] = {
            "min": node["min_date"].strftime("%Y-%m-%d") if node and node["min_date"] else None,
            "max": node["max_date"].strftime("%Y-%m-%d") if node and node["max_date"] else None
        }

        # Weather.com
        cursor.execute("SELECT MIN(date_time) as min_date, MAX(date_time) as max_date FROM tb_weather")
        weather = cursor.fetchone()
        limits["weather"] = {
            "min": weather["min_date"].strftime("%Y-%m-%d") if weather and weather["min_date"] else None,
            "max": weather["max_date"].strftime("%Y-%m-%d") if weather and weather["max_date"] else None
        }

        return limits
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

def generate_csv_data(data, fieldnames):
    stream = io.StringIO()
    # We write the UTF-8 BOM first to fix Excel decoding Thai characters
    stream.write('\ufeff')
    writer = csv.DictWriter(stream, fieldnames=fieldnames)
    writer.writeheader()

    for row in data:
        # Convert any None values to 'ไม่มีข้อมูล' or empty string
        cleaned_row = {
            k: ("ไม่มีข้อมูล" if v is None else v) for k, v in row.items()
        }
        writer.writerow(cleaned_row)
    return stream.getvalue()

@router.get("/")
async def download_csv_data(
    source: str = Query(..., description="tmd, msn, or node"),
    node_name: str = Query(None, description="Required only if source is node"),
    start_date: str = Query(..., description="YYYY-MM-DD"),
    end_date: str = Query(..., description="YYYY-MM-DD")
):
    conn = get_connection()
    try:
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        # We append time to make sure we cover the entire end_date
        s_date = f"{start_date} 00:00:00"
        e_date = f"{end_date} 23:59:59"

        if source == "tmd":
            query = "SELECT date_time, temperature_tdm, humidity_tdm, wind_speed_tdm, rain_tdm, weather_text_tdm FROM tb_tdm WHERE date_time BETWEEN %s AND %s ORDER BY date_time ASC"
            cursor.execute(query, (s_date, e_date))
            data = cursor.fetchall()
            header = ["date_time", "temperature_tdm", "humidity_tdm", "wind_speed_tdm", "rain_tdm", "weather_text_tdm"]
            filename = f"TMD_Data_{start_date}_to_{end_date}.csv"

        elif source == "msn":
            query = "SELECT date_time, temperature_msn, humidity_msn, wind_speed_msn, pm25, weather_text_msn FROM tb_msn WHERE date_time BETWEEN %s AND %s ORDER BY date_time ASC"
            cursor.execute(query, (s_date, e_date))
            data = cursor.fetchall()
            header = ["date_time", "temperature_msn", "humidity_msn", "wind_speed_msn", "pm25", "weather_text_msn"]
            filename = f"MSN_Data_{start_date}_to_{end_date}.csv"

        elif source == "node":
            if not node_name:
                raise HTTPException(status_code=400, detail="node_name is required when source is 'node'")
            query = "SELECT date_time, temp, humidity, pressure, light, wind_speed, wind_gust, wind_dir, rain_1h, rain_24h FROM tb_node WHERE node_name = %s AND date_time BETWEEN %s AND %s ORDER BY date_time ASC"
            cursor.execute(query, (node_name, s_date, e_date))
            data = cursor.fetchall()
            header = ["date_time", "temp", "humidity", "pressure", "light", "wind_speed", "wind_gust", "wind_dir", "rain_1h", "rain_24h"]
            filename = f"{node_name}_Data_{start_date}_to_{end_date}.csv"

        elif source == "weather":
            query = "SELECT date_time, temperature_w, humidity_w, wind_w, pressure_w FROM tb_weather WHERE date_time BETWEEN %s AND %s ORDER BY date_time ASC"
            cursor.execute(query, (s_date, e_date))
            data = cursor.fetchall()
            header = ["date_time", "temperature_w", "humidity_w", "wind_w", "pressure_w"]
            filename = f"WeatherCom_Data_{start_date}_to_{end_date}.csv"

        else:
            raise HTTPException(status_code=400, detail="Invalid source. Must be tmd, msn, node, or weather.")

        if not data:
            # Still return an empty CSV with just headers if no data
            data = []
        
        csv_content = generate_csv_data(data, header)
        csv_bytes = csv_content.encode('utf-8')
        
        response = Response(
            content=csv_bytes,
            media_type="text/csv"
        )
        encoded_filename = urllib.parse.quote(filename)
        response.headers["Content-Disposition"] = f"attachment; filename*=utf-8''{encoded_filename}"
        response.headers["Content-Length"] = str(len(csv_bytes))
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
