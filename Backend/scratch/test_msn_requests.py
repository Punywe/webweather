import urllib.request
import re

URL = "https://www.msn.com/th-th/weather/forecast/in-Phop-Phra"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

def fetch_msn_data_new() -> dict:
    try:
        req = urllib.request.Request(
            URL, 
            headers={
                "User-Agent": USER_AGENT,
                "Accept-Language": "th-TH,th;q=0.9,en;q=0.8"
            }
        )
        with urllib.request.urlopen(req, timeout=15) as response:
            html = response.read().decode('utf-8')
            
        # 1. Temp
        temp_match = re.search(r'id="OverviewCurrentTemperature".*?<a[^>]*title="([^"]+)"', html, re.DOTALL)
        temp = temp_match.group(1).strip() if temp_match else "N/A"
        if temp != "N/A" and not temp.endswith("°C"):
            # Ensure it has °C suffix if it's just a number
            temp = temp.replace("°", "") + "°C"
            
        # 2. Condition
        cond_match = re.search(r'id="OverviewCurrentTemperature".*?<img[^>]*title="([^"]+)"', html, re.DOTALL)
        condition = cond_match.group(1).strip() if cond_match else "N/A"

        # 3. Humidity
        hum_match = re.search(r'id="CurrentDetailLineHumidityValue"[^>]*>.*?<span>([^<]+)</span>', html, re.DOTALL)
        humidity = hum_match.group(1).strip() if hum_match else "N/A"
            
        # 4. Wind
        wind_match = re.search(r'id="CurrentDetailLineWindValue"[^>]*>([^<]+)<', html, re.DOTALL)
        wind = wind_match.group(1).strip() if wind_match else "N/A"

        # 5. Visibility
        vis_match = re.search(r'id="CurrentDetailLineVisibilityValue"[^>]*>.*?<span>([^<]+)</span>', html, re.DOTALL)
        visibility = vis_match.group(1).strip() if vis_match else "N/A"

        # 6. Pressure
        press_match = re.search(r'id="CurrentDetailLinePressureValue"[^>]*>.*?<span>([^<]+)</span>', html, re.DOTALL)
        pressure = press_match.group(1).strip() if press_match else "N/A"

        # 7. Dew Point
        dew_match = re.search(r'id="CurrentDetailLineDewPointValue"[^>]*>.*?<span>([^<]+)</span>', html, re.DOTALL)
        dew = dew_match.group(1).strip() if dew_match else "N/A"

        # 8. PM 2.5 / AQI
        aqi_match = re.search(r'class="[^"]*aqiDetailItemGroupCompact[^"]*"[^>]*>.*?(\d+)\s*<', html, re.DOTALL)
        pm25 = aqi_match.group(1).strip() if aqi_match else "N/A"

        return {
            "temp":       temp,
            "condition":  condition,
            "humidity":   humidity,
            "wind":       wind,
            "visibility": visibility,
            "pressure":   pressure,
            "dew":        dew,
            "pm25":       pm25,
        }
    except Exception as e:
        return {
            "temp":       "N/A",
            "condition":  "N/A",
            "humidity":   "N/A",
            "wind":       "N/A",
            "visibility": "N/A",
            "pressure":   "N/A",
            "dew":        "N/A",
            "pm25":       "N/A",
            "error":      str(e)
        }

if __name__ == "__main__":
    data = fetch_msn_data_new()
    print("EXTRACTED MSN DATA:")
    for k, v in data.items():
        print(f"  {k}: {v}")
