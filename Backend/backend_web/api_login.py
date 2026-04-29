import bcrypt # เปลี่ยนมาใช้ตัวนี้แทน
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from shared.database import get_connection

router = APIRouter(
    prefix="/login",
    tags=["login"]
)

class LoginRequest(BaseModel):
    username: str
    password: str

# ฟังก์ชันตรวจสอบรหัสผ่าน (ใช้แทน pwd_context.verify)
def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        # Bcrypt ต้องการข้อมูลเป็น bytes ทั้งคู่
        return bcrypt.checkpw(
            plain_password.encode('utf-8'), 
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False

@router.post("/")
async def login(body: LoginRequest):
    """เข้าสู่ระบบด้วย username และ password"""
    conn = get_connection()
    try:
        # ใช้ DictCursor เพื่อให้เรียก user["id"] ได้ (ขึ้นอยู่กับ get_connection ของคุณ)
        cursor = conn.cursor() 
        
        cursor.execute(
            "SELECT id, username, password, email, role FROM tb_user WHERE username = %s",
            (body.username,)
        )
        user = cursor.fetchone()

        # ถ้าไม่เจอ user
        if not user:
            raise HTTPException(status_code=401, detail="ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")

        # ตรวจสอบรหัสผ่าน (ใช้ฟังก์ชันที่เราสร้างใหม่)
        # หมายเหตุ: ถ้า cursor ปกติคืนค่าเป็น tuple ให้ใช้ user[2] แทน user["password"]
        db_password = user["password"] if isinstance(user, dict) else user[2]
        
        if not verify_password(body.password, db_password):
            raise HTTPException(status_code=401, detail="ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")

        # เตรียมข้อมูลส่งกลับ
        user_data = {
            "id": user["id"] if isinstance(user, dict) else user[0],
            "username": user["username"] if isinstance(user, dict) else user[1],
            "email": user["email"] if isinstance(user, dict) else user[3],
            "role": user["role"] if isinstance(user, dict) else user[4],
        }

        return {
            "message": "เข้าสู่ระบบสำเร็จ",
            "user": user_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()