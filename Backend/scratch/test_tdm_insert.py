from datetime import datetime, timezone, timedelta
import pymysql

THAILAND_TZ = timezone(timedelta(hours=7))

def test_insert():
    data_tdm = {
        'data': {
            'time': '2026-05-04T06:00:00+07:00',
            'tc': 28.18,
            'rh': 52.82,
            'rain': 0,
            'ws10m': 10.3,
            'cond': {'text_th': 'ท้องฟ้าแจ่มใส'}
        }
    }
    
    try:
        dt_str = datetime.fromisoformat(data_tdm['data']['time']).astimezone(THAILAND_TZ).strftime("%Y-%m-%d %H:%M:%S")
        print(f"Formatted Date: {dt_str}")
        
        # Test DB connection
        conn = pymysql.connect(
            host="127.0.0.1",
            user="appuser",
            password="apppassword",
            db="weather",
            charset="utf8mb4"
        )
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO tb_tdm (date_time, temperature_tdm, humidity_tdm, rain_tdm, wind_speed_tdm, weather_text_tdm)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                dt_str,
                data_tdm['data']['tc'],
                data_tdm['data']['rh'],
                data_tdm['data']['rain'],
                data_tdm['data']['ws10m'],
                data_tdm['data']['cond']['text_th']
            )
        )
        # conn.commit() # Don't commit for now
        print("Insert simulation successful")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_insert()
