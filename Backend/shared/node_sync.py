from shared.sheet_reader import get_sheet_df
import pandas as pd
import re

# ── Config ────────────────────────────────────────────────────────────────
# Sheet URL ที่รวมทุก node ไว้ในชีทเดียว (fix ไว้ในโค้ด)
SHEET_URL = "https://docs.google.com/spreadsheets/d/1XvHULl3W68lIUsN77gwVyv8VUFVYZbAKoe_KVF2bTu4/edit?usp=sharing"

STATION_ID_COL = "Station ID"   # ชื่อ column ใน Google Sheet

# ── Helper ────────────────────────────────────────────────────────────────
def fix_date_string(date_str: str) -> str:
    """แก้ปีที่มีตัวเลขเกิน 4 หลัก เช่น 20260 → 2026"""
    return re.sub(r'(\d{1,2}/\d{1,2}/)(\d{5,})', lambda m: m.group(1) + m.group(2)[:4], str(date_str))

# ── Main sync function ────────────────────────────────────────────────────
def sync_node(conn):
    """
    ดึงข้อมูลจาก Google Sheet เดียว แล้ว map Station ID → node_name
    - Skip row ที่ไม่มี Station ID
    - Skip row ที่ Station ID ไม่มีใน nodes table (ยังไม่ mapping)
    """

    # 1. โหลด mapping {station_id: node_name} จาก DB
    cur = conn.cursor()
    cur.execute("SELECT station_id, node_name FROM nodes")
    station_map = {row["station_id"]: row["node_name"] for row in cur.fetchall()}

    if not station_map:
        print("[sync_node] ไม่มี node ใน DB — ข้ามการ sync")
        return

    # 2. อ่าน last_row จาก sync_state
    cur.execute("SELECT value FROM sync_state WHERE key_name = 'sheet_last_row'")
    row = cur.fetchone()
    last_row = int(row["value"]) if row else 0

    # 3. ดึงข้อมูลจาก Google Sheet
    try:
        df = get_sheet_df(SHEET_URL)
    except Exception as e:
        print(f"[sync_node] ERROR ดึง Sheet ไม่ได้: {e}")
        return

    new_data = df.iloc[last_row:]

    if new_data.empty:
        print(f"[sync_node] ไม่มีข้อมูลใหม่ (last_row={last_row})")
        return

    print(f"[sync_node] พบ {len(new_data)} row ใหม่ (row {last_row} → {last_row + len(new_data) - 1})")

    # 4. Insert ทีละ row
    inserted = 0
    skipped_no_id = 0
    skipped_no_map = 0

    try:
        for _, row in new_data.iterrows():
            # ── ป้องกัน: ไม่มี Station ID ──
            station_id_raw = row.get(STATION_ID_COL)
            if pd.isna(station_id_raw) or str(station_id_raw).strip() == "":
                skipped_no_id += 1
                continue

            station_id = str(station_id_raw).strip()

            # ── ป้องกัน: Station ID ไม่มีใน mapping ──
            if station_id not in station_map:
                skipped_no_map += 1
                print(f"  ⚠ Station ID '{station_id}' ไม่มีใน nodes table — ข้าม")
                continue

            node_name = station_map[station_id]

            # ── Insert ──
            try:
                cur.execute("""
                    INSERT INTO tb_node (date_time, wind_dir, wind_speed, wind_gust,
                                         temp, rain_1h, rain_24h, humidity, pressure,
                                         light, node_name)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    pd.to_datetime(fix_date_string(row["Date Time"]), format="%d/%m/%Y, %H:%M:%S"),
                    row.get("wind_dir"),
                    row.get("wind_speed"),
                    row.get("wind_gust"),
                    row.get("temp"),
                    row.get("rain_1h"),
                    row.get("rain_24h"),
                    row.get("humidity"),
                    row.get("pressure"),
                    row.get("light"),
                    node_name,
                ))
                inserted += 1
            except Exception as e:
                print(f"  ❌ Insert row error (Station ID={station_id}): {e}")

        # 5. อัปเดต last_row ใน sync_state
        new_last_row = last_row + len(new_data)
        cur.execute("""
            INSERT INTO sync_state (key_name, value)
            VALUES ('sheet_last_row', %s)
            ON DUPLICATE KEY UPDATE value = %s
        """, (str(new_last_row), str(new_last_row)))

        conn.commit()
        print(f"[sync_node] ✅ insert {inserted} rows | skip no-id: {skipped_no_id} | skip no-map: {skipped_no_map} | last_row → {new_last_row}")

    except Exception as e:
        conn.rollback()
        print(f"[sync_node] ❌ ERROR: {e}")
        raise
