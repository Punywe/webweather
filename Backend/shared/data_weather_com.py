from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import StaleElementReferenceException, TimeoutException
import time


# URL ของ weather.com (en-US แสดงเป็น Fahrenheit)
# ใช้พิกัดของ จังหวัดตาก (16.88, 99.13) เพื่อให้ได้อุณหภูมิที่ตรงที่สุด
WEATHER_URL = "https://weather.com/en-US/weather/today/l/16.88,99.13"


def fahrenheit_to_celsius(f: float) -> float:
    """แปลงฟาเรนไฮต์ -> เซลเซียส"""
    return round((f - 32) * 5 / 9, 1)


def _safe_c(f_val):
    """แปลง F -> C ถ้ามีค่า"""
    if f_val is None:
        return None
    return fahrenheit_to_celsius(float(f_val))


def fetch_weather_com_data(url: str = WEATHER_URL) -> dict:
    """
    Scrape ข้อมูลสภาพอากาศจาก weather.com (Today page)

    ข้อมูลที่ดึง:
      - Current Temp (F/C)
      - Feels Like (F/C)
      - High / Low (F/C)
      - Wind (speed + direction)
      - Humidity
      - Dew Point (F/C)
      - Pressure
      - UV Index
      - Visibility
      - Moon Phase

    แปลง Fahrenheit -> Celsius สำหรับค่าอุณหภูมิ
    """
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )

    driver = webdriver.Chrome(options=options)
    try:
        # ตั้ง timezone ให้ตรงกับไทย
        driver.execute_cdp_cmd(
            "Emulation.setTimezoneOverride",
            {"timezoneId": "Asia/Bangkok"}
        )
        driver.get(url)

        # รอให้ JS render หน้าเว็บเสร็จก่อน (weather.com โหลด async)
        time.sleep(5)

        wait = WebDriverWait(
            driver, 25,
            poll_frequency=0.5,
            ignored_exceptions=[StaleElementReferenceException]
        )

        # รอให้ current temp visible
        CURRENT_TEMP_SELECTOR = (
            "div[class*='CurrentConditions--primary'] "
            "span[data-testid='TemperatureValue']"
            "[class*='CurrentConditions--tempValue']"
        )
        wait.until(EC.visibility_of_element_located(
            (By.CSS_SELECTOR, CURRENT_TEMP_SELECTOR)
        ))

        # รอให้ detail card โหลด
        wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, "div[data-testid='WeatherDetailsListItem']")
        ))

        # ดึงข้อมูลทั้งหมดใน JS call เดียว
        raw = driver.execute_script("""
            // ---- helper: ดึง first text node number จาก element ----
            function getNum(selector) {
                var el = document.querySelector(selector);
                if (!el) return null;
                for (var i = 0; i < el.childNodes.length; i++) {
                    var node = el.childNodes[i];
                    if (node.nodeType === 3) {
                        var val = node.textContent.trim();
                        if (val !== '' && !isNaN(parseFloat(val))) return parseFloat(val);
                    }
                }
                var raw = el.textContent.replace(/[^0-9\\-]/g, '');
                return raw ? parseFloat(raw) : null;
            }

            // ---- helper: ดึงค่า WeatherDetailsListItem ตาม label ----
            function getDetailByLabel(label) {
                var items = document.querySelectorAll("div[data-testid='WeatherDetailsListItem']");
                for (var i = 0; i < items.length; i++) {
                    var lbl = items[i].querySelector("div[data-testid='WeatherDetailsLabel']");
                    if (lbl && lbl.textContent.trim() === label) {
                        var wxData = items[i].querySelector("div[data-testid='wxData']");
                        return wxData ? wxData.textContent.trim() : null;
                    }
                }
                return null;
            }

            // ---- helper: ดึง temp number จาก detail item ตาม label (แปลง text node) ----
            function getDetailTemp(label, nth) {
                var items = document.querySelectorAll("div[data-testid='WeatherDetailsListItem']");
                for (var i = 0; i < items.length; i++) {
                    var lbl = items[i].querySelector("div[data-testid='WeatherDetailsLabel']");
                    if (lbl && lbl.textContent.trim() === label) {
                        var temps = items[i].querySelectorAll("span[data-testid='TemperatureValue']");
                        var el = temps[nth || 0];
                        if (!el) return null;
                        for (var j = 0; j < el.childNodes.length; j++) {
                            var node = el.childNodes[j];
                            if (node.nodeType === 3) {
                                var val = node.textContent.trim();
                                if (val !== '' && !isNaN(parseFloat(val))) return parseFloat(val);
                            }
                        }
                        var raw = el.textContent.replace(/[^0-9\\-]/g, '');
                        return raw ? parseFloat(raw) : null;
                    }
                }
                return null;
            }

            // ---- ดึงข้อมูลทั้งหมด ----

            // Current Temp
            var current_temp = getNum("div[class*='CurrentConditions--primary'] span[data-testid='TemperatureValue'][class*='CurrentConditions--tempValue']");

            // Feels Like
            var feels_like = getNum("div[data-testid='FeelsLikeSection'] span[data-testid='TemperatureValue']");

            // High / Low
            var high_raw = getDetailTemp("High / Low", 0);
            var low_raw  = getDetailTemp("High / Low", 1);

            // Wind (text เช่น "WSW 7 mph" หรือ "7 mph")
            var windEl = document.querySelector("span[data-testid='Wind']");
            var wind_text = windEl ? windEl.textContent.replace(/\\s+/g, ' ').trim() : null;

            // Humidity (text เช่น "49%")
            var humidity = getDetailByLabel("Humidity");

            // Dew Point
            var dew_point = getDetailTemp("Dew Point", 0);

            // Pressure (text เช่น "29.78 in")
            var pressureEl = document.querySelector("span[data-testid='PressureValue']");
            var pressure = pressureEl ? pressureEl.textContent.replace(/\\s+/g, ' ').trim() : null;

            // UV Index (text เช่น "0 of 11")
            var uvEl = document.querySelector("span[data-testid='UVIndexValue']");
            var uv_index = uvEl ? uvEl.textContent.trim() : null;

            // Visibility (text เช่น "10 mi")
            var visEl = document.querySelector("span[data-testid='VisibilityValue']");
            var visibility = visEl ? visEl.textContent.replace(/\\s+/g, ' ').trim() : null;

            // Moon Phase (text เช่น "Waning Gibbous")
            var moon_phase = getDetailByLabel("Moon Phase");

            return {
                current_temp: current_temp,
                feels_like: feels_like,
                high_f: high_raw,
                low_f: low_raw,
                wind: wind_text,
                humidity: humidity,
                dew_point_f: dew_point,
                pressure: pressure,
                uv_index: uv_index,
                visibility: visibility,
                moon_phase: moon_phase,
            };
        """)

        if raw is None or raw.get('current_temp') is None:
            return {
                "ok": False,
                "error": "ไม่พบ element อุณหภูมิหลักในหน้า",
            }

        # แปลงอุณหภูมิ F -> C
        temp_f = float(raw['current_temp'])
        temp_c = fahrenheit_to_celsius(temp_f)

        feels_f = raw.get('feels_like')
        feels_c = _safe_c(feels_f)

        high_f = raw.get('high_f')
        high_c = _safe_c(high_f)

        low_f = raw.get('low_f')
        low_c = _safe_c(low_f)

        dew_f = raw.get('dew_point_f')
        dew_c = _safe_c(dew_f)

        return {
            "ok": True,
            "source": "weather.com",
            # อุณหภูมิปัจจุบัน
            "temp_f": temp_f,
            "temp_c": temp_c,
            # Feels Like
            "feels_like_f": feels_f,
            "feels_like_c": feels_c,
            # High / Low
            "high_f": high_f,
            "high_c": high_c,
            "low_f": low_f,
            "low_c": low_c,
            # ข้อมูลอื่นๆ
            "wind": raw.get('wind'),
            "humidity": raw.get('humidity'),
            "dew_point_f": dew_f,
            "dew_point_c": dew_c,
            "pressure": raw.get('pressure'),
            "uv_index": raw.get('uv_index'),
            "visibility": raw.get('visibility'),
            "moon_phase": raw.get('moon_phase'),
        }

    except TimeoutException:
        return {
            "ok": False,
            "error": "Timeout: element ไม่พบ หรือหน้าโหลดนานเกินไป",
        }
    except Exception as e:
        return {
            "ok": False,
            "error": str(e),
        }
    finally:
        driver.quit()


# สำหรับรันทดสอบตรงๆ
if __name__ == "__main__":
    import sys
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    print(f"Fetching from: {WEATHER_URL}")
    print("Please wait...")

    r = fetch_weather_com_data()

    if r["ok"]:
        print(f"\n[OK] Success!")
        print(f"  Current Temp    : {r['temp_f']}F  /  {r['temp_c']}C")
        print(f"  Feels Like      : {r['feels_like_f']}F  /  {r['feels_like_c']}C")
        print(f"  High / Low      : {r['high_f']}F/{r['low_f']}F  ({r['high_c']}C/{r['low_c']}C)")
        print(f"  Wind            : {r['wind']}")
        print(f"  Humidity        : {r['humidity']}")
        print(f"  Dew Point       : {r['dew_point_f']}F  /  {r['dew_point_c']}C")
        print(f"  Pressure        : {r['pressure']}")
        print(f"  UV Index        : {r['uv_index']}")
        print(f"  Visibility      : {r['visibility']}")
        print(f"  Moon Phase      : {r['moon_phase']}")
    else:
        print(f"\n[FAIL] Error: {r['error']}")
