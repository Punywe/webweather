import pymysql

def get_connection():
    return pymysql.connect(
        host="127.0.0.1",
        user="appuser",
        password="apppassword",
        db="weather",
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True,
    )