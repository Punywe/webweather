from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from shared.database import get_connection
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(
    prefix="/login",
    tags=["login"]
)


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/")
async def login(body: LoginRequest):
    """เข้าสู่ระบบด้วย username และ password"""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, username, password, email, role FROM tb_user WHERE username = %s",
            (body.username,)
        )
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=401, detail="ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")

        if not pwd_context.verify(body.password, user["password"]):
            raise HTTPException(status_code=401, detail="ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")

        return {
            "message": "เข้าสู่ระบบสำเร็จ",
            "user": {
                "id": user["id"],
                "username": user["username"],
                "email": user["email"],
                "role": user["role"],
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
