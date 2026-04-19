from fastapi import APIRouter, HTTPException
from database import get_connection


router = APIRouter(
    prefix="/getNameNode",
    tags=["getNameNode"]
)

@router.get("/")
async def get_name_node():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT node_name FROM nodes")
        rows = cursor.fetchall()
        return {"nodes": [row['node_name'] for row in rows]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()