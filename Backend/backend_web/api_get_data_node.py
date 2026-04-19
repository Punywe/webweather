from fastapi import APIRouter, HTTPException
from shared.database import get_connection

router = APIRouter(
    prefix="/getDataNode",
    tags=["Node"]
)

@router.get("/{name_node}")
async def get_data_node(name_node: str):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT date_time, wind_dir, wind_speed, wind_gust, temp, rain_1h, rain_24h, humidity, pressure, light 
            FROM tb_node 
            WHERE node_name = %s
            ORDER BY date_time DESC
            LIMIT 1;
            """, (name_node,))
        rows = cursor.fetchall()
        result = []
        THAI_MONTHS = [
            "", "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
            "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
        ]
        for row in rows:
            dt = row["date_time"]
            formatted_date = f"{dt.day} {THAI_MONTHS[dt.month]} {dt.year + 543}"
            result.append({
                "date": formatted_date,
                "temp": round(row["temp"], 2),
                "wind_dir": row["wind_dir"],
                "wind_speed": row["wind_speed"],
                "wind_gust": row["wind_gust"],
                "rain_1h": row["rain_1h"],
                "rain_24h": row["rain_24h"],
                "humidity": row["humidity"],
                "pressure": row["pressure"],
                "light": row["light"]
            })
        return {"data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
