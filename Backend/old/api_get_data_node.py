from fastapi import APIRouter, HTTPException
from database import get_connection

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
            SELECT date_time, wind_dir, wind_speed, wind_gust, temp, rain_1h, rain_24h, humidity, pressure, light FROM tb_node WHERE node_name = %s;
            """, (name_node,))
        rows = cursor.fetchall()
        return {"data": [dict(row) for row in rows]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()