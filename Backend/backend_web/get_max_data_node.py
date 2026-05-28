from fastapi import APIRouter, HTTPException
from shared.database import get_connection
import pymysql.cursors 

router = APIRouter(
    prefix="/getMaxDataNode",
    tags=["getMaxDataNode"]
)

@router.get("/{name_node}")
async def get_max_data_node(name_node: str):
    
    try:
        conn = get_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        cursor.execute("""
            SELECT 
            MAX(wind_speed) AS wind_speed,
            MAX(wind_gust) AS wind_gust,
            MAX(temp) AS temp,
            MAX(rain_1h) AS rain_1h,
            MAX(rain_24h) AS rain_24h,
            MAX(humidity) AS humidity,
            MAX(pressure) AS pressure,
            MAX(light) AS light
            FROM tb_node
            WHERE node_name = %s
        """, (name_node,))
        result = cursor.fetchall()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()   
        

    