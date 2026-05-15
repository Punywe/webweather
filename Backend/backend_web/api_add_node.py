from fastapi import APIRouter, HTTPException
from shared.database import get_connection
from pydantic import BaseModel

class DataNode(BaseModel):
    station_id: str
    node_name: str
    latitude: float
    longitude: float

router = APIRouter(
    prefix="/addnode",
    tags=["addnode"]
)

# ── POST: เพิ่ม node ใหม่ ──────────────────────────────────────────────────
@router.post("/")
async def add_node(data: DataNode):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO nodes (station_id, node_name, latitude, longitude)
            VALUES (%s, %s, %s, %s)
        """, (data.station_id, data.node_name, data.latitude, data.longitude))
        conn.commit()
        return {"status": "ok", "message": f"เพิ่ม node '{data.node_name}' สำเร็จ"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# ── GET: รายการ node ทั้งหมด ──────────────────────────────────────────────
@router.get("/")
async def get_all_nodes():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, station_id, node_name, latitude, longitude, created_at
            FROM nodes ORDER BY created_at DESC
        """)
        rows = cursor.fetchall()
        return {"nodes": [
            {
                "id":         row["id"],
                "station_id": row["station_id"],
                "node_name":  row["node_name"],
                "latitude":   row["latitude"],
                "longitude":  row["longitude"],
                "created_at": str(row["created_at"]),
            }
            for row in rows
        ]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# ── PUT: แก้ไข node ──────────────────────────────────────────────────────
@router.put("/{node_id}")
async def update_node(node_id: int, data: DataNode):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE nodes
            SET station_id = %s, node_name = %s, latitude = %s, longitude = %s
            WHERE id = %s
        """, (data.station_id, data.node_name, data.latitude, data.longitude, node_id))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="ไม่พบ node")
        conn.commit()
        return {"status": "ok", "message": "แก้ไข node สำเร็จ"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# ── DELETE: ลบ node ──────────────────────────────────────────────────────
@router.delete("/{node_id}")
async def delete_node(node_id: int):
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM nodes WHERE id = %s", (node_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="ไม่พบ node")
        conn.commit()
        return {"status": "ok", "message": "ลบ node สำเร็จ"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()