from shared.node_sync import sync_node
from shared.data_tdm import main as fetch_tdm_data
from shared.data_msn import fetch_msn_data
from datetime import datetime, timezone, timedelta
import re

THAILAND_TZ = timezone(timedelta(hours=7))

def extract_number(text: str) -> str:
    match = re.search(r'[\d]+(?:\.?\d+)?', text or "")
    return match.group() if match else "0"

def sync_all(conn):
    """ดึงทุก node จาก DB แล้ว sync ทีละตัว + sync TDM & MSN"""

    # ---- 1) Sync Nodes (Google Sheet) ----
    cur = conn.cursor()
    cur.execute("SELECT id, node_name, latitude, longitude, sheet_url, last_row FROM nodes")
    nodes = cur.fetchall()

    for node in nodes:
        sync_node(conn, {
            "id":        node["id"],
            "node_name": node["node_name"],
            "latitude":  node["latitude"],
            "longitude": node["longitude"],
            "sheet_url": node["sheet_url"],
            "last_row":  node["last_row"]
        })

    # ---- 2) Sync TDM ----
    try:
        data_tdm = fetch_tdm_data()
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

    # ---- 3) Sync MSN ----
    try:
        data_msn = fetch_msn_data()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO tb_msn (date_time, temperature_msn, humidity_msn, wind_speed_msn, pm25, weather_text_msn)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            datetime.now(),
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
