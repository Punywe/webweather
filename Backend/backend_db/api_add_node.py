from fastapi import APIRouter, HTTPException
from shared.database import get_connection
from pydantic import BaseModel, HttpUrl

router = APIRouter(
    prefix="/addNode",
    tags=["addNode"]
)

class DataNode(BaseModel):
    name: str
    latitude: float
    longitude: float
    sheet_url: HttpUrl  # ← validate ว่าเป็น URL จริงๆ

@router.post("/")
async def add_node(data: DataNode):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO nodes (node_name, latitude, longitude, sheet_url, last_row)
            VALUES (%s, %s, %s, %s, 0)
        """, (data.name, data.latitude, data.longitude, str(data.sheet_url)))
        conn.commit()
        return {"status": "ok"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        conn.close()
