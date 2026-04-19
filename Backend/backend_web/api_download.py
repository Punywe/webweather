from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from shared.database import get_connection
import pymysql.cursors
import csv
import io
from datetime import datetime

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

        return limits
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

def generate_csv_stream(data, fieldnames):
    stream = io.StringIO()
    writer = csv.DictWriter(stream, fieldnames=fieldnames)
    writer.writeheader()
    
    # We yield the header first WITH the UTF-8 BOM to fix Excel decoding Thai characters
    yield '\ufeff' + stream.getvalue()
    stream.seek(0)
    stream.truncate(0)

    for row in data:
        # Convert any None values to 'ไม่มีข้อมูล' or empty string
        cleaned_row = {
            k: ("ไม่มีข้อมูล" if v is None else v) for k, v in row.items()
        }
        writer.writerow(cleaned_row)
        yield stream.getvalue()
        stream.seek(0)
        stream.truncate(0)

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

        else:
            raise HTTPException(status_code=400, detail="Invalid source. Must be tmd, msn, or node.")

        if not data:
            # Still return an empty CSV with just headers if no data
            data = []
        
        response = StreamingResponse(
            generate_csv_stream(data, header),
            media_type="text/csv"
        )
        response.headers["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
