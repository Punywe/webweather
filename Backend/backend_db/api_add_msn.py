from fastapi import APIRouter
from shared.database import get_connection
from shared.data_msn import fetch_msn_data
from datetime import datetime
import re

router = APIRouter(
    prefix="/addmsn",
    tags=["data-msn"]
)

def extract_number(text: str) -> str:
    match = re.search(r'[\d]+(?:\.\d+)?', text or "")
    return match.group() if match else "0"

@router.post("/")
async def add_msn():
    data = fetch_msn_data()
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO tb_msn (date_time, temperature_msn, humidity_msn, wind_speed_msn, pm25, weather_text_msn)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            datetime.now(),
            extract_number(data.get("temp")),
            extract_number(data.get("humidity")),
            extract_number(data.get("wind")),
            extract_number(data.get("pm25")),
            data.get("condition")
        ))
        conn.commit()
        return {"message": "Add MSN Success"}
    except Exception as e:
        conn.rollback()
        return {"message": f"Add MSN Failed: {e}"}
    finally:
        cursor.close()
        conn.close()
