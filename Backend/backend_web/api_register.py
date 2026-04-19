from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from shared.database import get_connection
from backend_web.verify_email import send_otp
from datetime import datetime
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(
    prefix="/register",
    tags=["register"]
)

# เก็บ OTP ชั่วคราวใน memory { email: otp }
_otp_store: dict[str, int] = {}


# ---------- Schemas ----------

class SendOTPRequest(BaseModel):
    email: str

class RegisterRequest(BaseModel):
    username: str
    password: str
    email: str
    otp: int


# ---------- Endpoints ----------

@router.post("/send-otp")
async def send_otp_endpoint(body: SendOTPRequest):
    """ส่ง OTP ไปยังอีเมลที่ระบุ"""
    try:
        otp = send_otp(body.email)
        _otp_store[body.email] = otp
        return {"message": "OTP sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")


@router.post("/verify-and-register")
async def verify_and_register(body: RegisterRequest):
    """ตรวจสอบ OTP แล้วสมัครสมาชิก"""
    stored_otp = _otp_store.get(body.email)

    if stored_otp is None:
        raise HTTPException(status_code=400, detail="OTP not found. Please request a new OTP.")

    if stored_otp != body.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP.")

    # OTP ถูก ลบออกจาก store แล้ว insert ลง DB
    del _otp_store[body.email]

    conn = get_connection()
    try:
        cursor = conn.cursor()

        # ตรวจสอบว่า username หรือ email ซ้ำไหม
        cursor.execute("SELECT id FROM tb_user WHERE username = %s OR email = %s", (body.username, body.email))
        existing = cursor.fetchone()
        if existing:
            raise HTTPException(status_code=409, detail="Username or email already exists.")

        # Insert ข้อมูลสมาชิก (hash password ก่อน)
        hashed_password = pwd_context.hash(body.password)
        cursor.execute(
            "INSERT INTO tb_user (username, password, email, date_regis) VALUES (%s, %s, %s, %s)",
            (body.username, hashed_password, body.email, datetime.now())
        )
        return {"message": "Registration successful!"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
