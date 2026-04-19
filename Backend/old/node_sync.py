from sheet_reader import get_sheet_df
import pandas as pd

def sync_node(conn, node: dict):
    """ดึงข้อมูลใหม่จาก sheet แล้ว insert ต่อจาก row ล่าสุด"""
    df = get_sheet_df(node["sheet_url"])

    last_row = node["last_row"]
    new_data = df.iloc[last_row:]

    if new_data.empty:
        print(f"[{node['node_name']}] ไม่มีข้อมูลใหม่")
        return

    cur = conn.cursor()
    try:
        for _, row in new_data.iterrows():
            cur.execute("""
                INSERT INTO tb_node (date_time, wind_dir, wind_speed, wind_gust, temp, rain_1h, rain_24h, humidity, pressure, light, node_name)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                pd.to_datetime(row["Date Time"], format="%d/%m/%Y, %H:%M:%S"),
                row["wind_dir"],
                row["wind_speed"],
                row["wind_gust"],
                row["temp"],
                row["rain_1h"],
                row["rain_24h"],
                row["humidity"],
                row["pressure"],
                row["light"],
                node["node_name"],
            ))

        cur.execute(
            "UPDATE nodes SET last_row = %s WHERE id = %s",
            (last_row + len(new_data), node["id"])
        )
        conn.commit()
        print(f"[{node['node_name']}] insert {len(new_data)} rows สำเร็จ")

    except Exception as e:
        conn.rollback()
        print(f"[{node['node_name']}] ERROR: {e}")