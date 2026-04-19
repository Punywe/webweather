from fastapi import APIRouter, HTTPException
from shared.database import get_connection


router = APIRouter(
    prefix="/getNameNode",
    tags=["getNameNode"]
)

@router.get("/")
async def get_name_node():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT node_name,latitude,longitude FROM nodes")
        rows = cursor.fetchall()
        return {"nodes": [{"node_name": row['node_name'], "latitude": row['latitude'], "longitude": row['longitude']} for row in rows]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
