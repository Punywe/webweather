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
        print("✅ Nodes sync completed")
    except Exception as e:
        print(f"❌ Node sync error: {e}")

    # ---- 2) Sync TDM ----
    try:
        data_tdm = fetch_tdm_data()
        if data_tdm.get("ok"):
            cursor = conn.cursor()
            tdm_time = datetime.fromisoformat(data_tdm['data']['time']).astimezone(THAILAND_TZ).strftime("%Y-%m-%d %H:%M:%S")
            # ตรวจสอบว่า timestamp นี้มีอยู่แล้วหรือเปล่า
            cursor.execute("SELECT COUNT(*) FROM tb_tdm WHERE date_time = %s", (tdm_time,))
            row = cursor.fetchone()
            count = (list(row.values())[0] if isinstance(row, dict) else row[0]) if row else 0
            if count == 0:
                cursor.execute(
                    """
                    INSERT INTO tb_tdm (date_time, temperature_tdm, humidity_tdm, rain_tdm, wind_speed_tdm, weather_text_tdm)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (
                        tdm_time,
                        data_tdm['data']['tc'],
                        data_tdm['data']['rh'],
                        data_tdm['data']['rain'],
                        data_tdm['data']['ws10m'],
                        data_tdm['data']['cond']['text_th']
                    )
                )
                conn.commit()
                print("✅ TDM sync completed")
            else:
                print(f"⏭️ TDM sync skipped: timestamp {tdm_time} already exists")
        else:
            print(f"⚠️ TDM sync skipped: {data_tdm.get('error')}")
    except Exception as e:
        conn.rollback()
        print(f"❌ TDM sync error: {e}")

    # ---- 3) Sync MSN ----
    try:
        data_msn = fetch_msn_data()
        if data_msn.get("temp") != "N/A":
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
        else:
            print("⚠️ MSN sync skipped (N/A data)")
    except Exception as e:
        conn.rollback()
        print(f"❌ MSN sync error: {e}")

    # ---- 4) Sync Weather.com ----
    try:
        data_weather = fetch_weather_com_data()
        if data_weather.get("ok"):
            def extract_num(text):
                if text is None: return 0
                if isinstance(text, (int, float)): return text
                match = re.search(r'-?\d+(?:\.\d+)?', str(text))
                return float(match.group()) if match else 0

            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO tb_weather (date_time, temperature_w, wind_w, humidity_w, pressure_w)
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
        else:
            print(f"⚠️ Weather sync skipped: {data_weather.get('error')}")
    except Exception as e:
        conn.rollback()
        print(f"❌ Weather sync error: {e}")
