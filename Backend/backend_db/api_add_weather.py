import sys
import os
from fastapi import APIRouter
import datetime
import re # เพิ่มสำหรับสกัดตัวเลข

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from shared.data_weather_com import fetch_weather_com_data
from shared.database import get_connection

router = APIRouter(
    prefix="/addweather",
    tags=["weather"]
)

# ฟังก์ชันช่วยสกัดตัวเลข
def extract_num(text):
    if text is None: return 0
    if isinstance(text, (int, float)): return text
    match = re.search(r'[-?][\d]+(?:\.\d+)?', str(text))
    return float(match.group()) if match else 0

@router.post("/")
def add_weather():
    data = fetch_weather_com_data()
    
    # 1. ตรวจสอบว่าดึงข้อมูลสำเร็จหรือไม่
    if not data.get("ok"):
        return {"message": f"Fetch Failed: {data.get('error')}"}

    conn = get_connection()
    cursor = conn.cursor()

    try:
        # 2. สกัดเอาเฉพาะตัวเลข (ถ้าคอลัมน์ใน DB เป็น Numeric)
        temp = data.get("temp_c")
        wind = extract_num(data.get("wind"))
        hum = extract_num(data.get("humidity"))
        press = extract_num(data.get("pressure"))

        cursor.execute("""
            INSERT INTO tb_weather 
            (date_time, temperature_w, wind_w, humidity_w, pressure_w)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            datetime.datetime.now(),
            temp,
            wind,
            hum,
            press,
        ))
        
        # 3. Commit ใน try เมื่อทุกอย่างสำเร็จ
        conn.commit()
        return {"message": "Add Weather Success", "data": data}

    except Exception as e:
        conn.rollback()
        return {"message": f"Add Weather Failed: {e}"}
        
    finally:
        # 4. finally ใช้สำหรับปิดทรัพยากรเท่านั้น
        cursor.close()
        conn.close()
