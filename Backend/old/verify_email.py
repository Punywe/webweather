import smtplib
from email.mime.text import MIMEText
import random

def send_otp(email_user: str):
    otp = random.randint(100000, 999999)

    smtp_server = "smtp.gmail.com"
    port = 587

    email = "poonyawetason001@gmail.com"
    app_password = "wazd qkqh dqox dnzc"

    msg = MIMEText(f"Hello from Weather App Gmail!\nYour OTP is: {otp}")
    msg["Subject"] = "Verify Email"
    msg["From"] = email
    msg["To"] = email_user

    server = smtplib.SMTP(smtp_server, port)
    server.starttls()
    server.login(email, app_password)

    server.sendmail(msg["From"], msg["To"], msg.as_string())

    server.quit()

    print("Email sent successfully")

    return otp