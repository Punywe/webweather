import bcrypt  # ใช้ bcrypt ตรงๆ ไม่ผ่าน passlib
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from shared.database import get_connection
from backend_web.verify_email import send_otp
from datetime import datetime

router = APIRouter(
    prefix="/register",
    tags=["register"]
)

_otp_store: dict[str, int] = {}

# ---------- Helper Functions สำหรับการจัดการรหัสผ่าน ----------

def hash_password(password: str) -> str:
    # Bcrypt รับข้อมูลเป็น bytes ดังนั้นต้อง encode ก่อน
    # ข้อจำกัด 72 bytes ยังคงอยู่ จึงควร slice [:72] เพื่อความปลอดภัย
    pwd_bytes = password[:72].encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

# ---------- Schemas ----------

class SendOTPRequest(BaseModel):
    email: str

class RegisterRequest(BaseModel):
    username: str
    password: str = Field(..., min_length=8, max_length=72)
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
    # 1. ตรวจสอบ OTP
    stored_otp = _otp_store.get(body.email)
    if stored_otp is None or int(stored_otp) != int(body.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")

    conn = get_connection()
    try:
        cursor = conn.cursor()

        # 2. ตรวจสอบ Username/Email ซ้ำ
        cursor.execute("SELECT id FROM tb_user WHERE username = %s OR email = %s", (body.username, body.email))
        if cursor.fetchone():
            raise HTTPException(status_code=409, detail="Username or email already exists.")

        # 3. Hash Password ด้วยวิธีที่ปลอดภัยที่สุด
        hashed_password = hash_password(body.password)

        # 4. บันทึกลง Database ด้วย Transaction
        cursor.execute(
            "INSERT INTO tb_user (username, password, email, date_regis) VALUES (%s, %s, %s, %s)",
            (body.username, hashed_password, body.email, datetime.now())
        )
        
        conn.commit()  # ยืนยันการบันทึก
        
        # ลบ OTP หลังใช้งานสำเร็จ
        _otp_store.pop(body.email, None)

        return {"message": "Registration successful!"}

    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
    finally:
        if conn: conn.close()