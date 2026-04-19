from fastapi import FastAPI, APIRouter, BackgroundTasks
from shared.database import get_connection
from shared.node_sync import sync_node
from pydantic import BaseModel
import pymysql.cursors

class Node(BaseModel):
    node_name: str
    latitude: float
    longitude: float
    sheet_url: str

router = APIRouter(
    prefix="/addnode",
    tags=["addnode"]
)

def background_sync(node_dict: dict):
    conn = get_connection()
    try:
        sync_node(conn, node_dict)
    except Exception as e:
        print(f"Background sync error for new node: {e}")
    finally:
        conn.close()

@router.post("/")
async def add_node(node: Node, background_tasks: BackgroundTasks):
    try:
        conn = get_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        cursor.execute("INSERT INTO nodes (node_name, latitude, longitude, sheet_url) VALUES (%s, %s, %s, %s)", (node.node_name, node.latitude, node.longitude, node.sheet_url))
        conn.commit()
        
        # Fetch the newly created node as dict
        cursor.execute("SELECT id, node_name, latitude, longitude, sheet_url, last_row FROM nodes WHERE node_name = %s LIMIT 1", (node.node_name,))
        new_node = cursor.fetchone()
        
        if new_node:
            background_tasks.add_task(background_sync, new_node)

        return {"message": "Node added successfully. Data sync has been started in the background."}
    except Exception as e:
        return {"error": str(e)}
    finally:    
        cursor.close()
        conn.close()