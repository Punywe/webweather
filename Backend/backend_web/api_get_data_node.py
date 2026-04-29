from fastapi import APIRouter, HTTPException
from shared.database import get_connection

router = APIRouter(
    prefix="/getDataNode",
    tags=["Node"]
)

@router.get("/{name_node}")
async def get_data_node(name_node: str):
    # 1. Clean ชื่อโหนดก่อนเสมอ
    clean_name = name_node.strip("[]")
    
    conn = get_connection()
    try:
        cursor = conn.cursor()
        # 2. ดึงข้อมูลล่าสุด 1 แถว
        cursor.execute("""
            SELECT temp, humidity, wind_speed, date_time 
            FROM tb_node 
            WHERE node_name = %s 
            ORDER BY date_time DESC 
            LIMIT 1
        """, (clean_name,))
        
        row = cursor.fetchone()
        
        if not row:
            return {"data": []}

        # 3. ส่งข้อมูลกลับ (เช็คชื่อ Key ให้ตรงกับที่ React เรียก)
        return {
            "data": [{
                "temp": float(row["temp"]) if row["temp"] is not None else 0,
                "humidity": float(row["humidity"]) if row["humidity"] is not None else 0,
                "wind_speed": float(row["wind_speed"]) if row["wind_speed"] is not None else 0,
                "date_time": row["date_time"].strftime("%Y-%m-%d %H:%M:%S")
            }]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()