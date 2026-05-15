from shared.node_sync import sync_node
from shared.data_tdm import main as fetch_tdm_data
from shared.data_msn import fetch_msn_data
from shared.data_weather_com import fetch_weather_com_data
from datetime import datetime, timezone, timedelta
import re

THAILAND_TZ = timezone(timedelta(hours=7))

def extract_number(text: str) -> str:
    match = re.search(r'[\d]+(?:\.?\d+)?', text or "")
    return match.group() if match else "0"

def sync_all(conn):
    """ดึงทุก node จาก DB แล้ว sync ทีละตัว + sync TDM & MSN"""
    print("🚀 sync_all: Starting full synchronization...")

    # ---- 1) Sync Nodes (Google Sheet → map Station ID) ----
    try:
        sync_node(conn)
    except Exception as e:
        print(f"❌ Node sync error: {e}")

    # ---- 2) Sync TDM ----
    try:
        data_tdm = fetch_tdm_data()
        if not data_tdm.get("ok"):
            raise ValueError(data_tdm.get("error", "Unknown TDM fetch error"))
            
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO tb_tdm (date_time, temperature_tdm, humidity_tdm, rain_tdm, wind_speed_tdm, weather_text_tdm)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                datetime.fromisoformat(data_tdm['data']['time']).astimezone(THAILAND_TZ).strftime("%Y-%m-%d %H:%M:%S"),
                data_tdm['data']['tc'],
                data_tdm['data']['rh'],
                data_tdm['data']['rain'],
                data_tdm['data']['ws10m'],
                data_tdm['data']['cond']['text_th']
            )
        )
        conn.commit()
        print("✅ TDM sync completed")
    except Exception as e:
        conn.rollback()
        print(f"❌ TDM sync error: {e}")
        raise e

    # ---- 3) Sync MSN ----
    try:
        data_msn = fetch_msn_data()
        # เช็คว่า data_msn มีข้อมูลจริง (ไม่ใช่ N/A ทั้งหมด)
        if data_msn.get("temp") == "N/A" and data_msn.get("humidity") == "N/A":
             raise ValueError("MSN scrape returned N/A for critical fields")

        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO tb_msn (date_time, temperature_msn, humidity_msn, wind_speed_msn, pm25, weather_text_msn)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            datetime.now(THAILAND_TZ),
            extract_number(data_msn.get("temp")),
            extract_number(data_msn.get("humidity")),
            extract_number(data_msn.get("wind")),
            extract_number(data_msn.get("pm25")),
            data_msn.get("condition")
        ))
        conn.commit()
        print("✅ MSN sync completed")
    except Exception as e:
        conn.rollback()
        print(f"❌ MSN sync error: {e}")
        # ไม่ raise e เพื่อให้รันส่วนต่อไปได้ หรือจะ raise ก็ได้ตามต้องการ
        # ในที่นี้ขอ raise เพื่อความปลอดภัยครับ
        raise e

    # ---- 4) Sync Weather.com ----
    print("⏳ Starting Weather.com sync...")
    try:
        data_weather = fetch_weather_com_data()
        if not data_weather.get("ok"):
            raise ValueError(data_weather.get("error", "Unknown Weather fetch error"))
            
        def extract_num(text):
            if text is None: return 0
            if isinstance(text, (int, float)): return text
            # แก้ regex ให้รองรับตัวเลขปกติที่ไม่มีเครื่องหมายนำหน้า
            match = re.search(r'-?\d+(?:\.\d+)?', str(text))
            return float(match.group()) if match else 0

        cursor = conn.cursor()
        # ตรวจสอบและสร้างตารางถ้ายังไม่มี (กันเหนียว)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tb_weather (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date_time DATETIME,
                temperature_w FLOAT,
                wind_w FLOAT,
                humidity_w FLOAT,
                pressure_w FLOAT
            )
        """)

        cursor.execute("""
            INSERT INTO tb_weather 
            (date_time, temperature_w, wind_w, humidity_w, pressure_w)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            datetime.now(THAILAND_TZ),
            data_weather.get("temp_c"),
            extract_num(data_weather.get("wind")),
            extract_num(data_weather.get("humidity")),
            extract_num(data_weather.get("pressure")),
        ))
        conn.commit()
        print("✅ Weather sync completed")
    except Exception as e:
        conn.rollback()
        print(f"❌ Weather sync error: {e}")
        raise e
