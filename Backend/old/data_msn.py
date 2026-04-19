from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import StaleElementReferenceException
import time


def fetch_msn_data() -> dict:
    """Scrape ข้อมูลสภาพอากาศจาก MSN Weather แล้ว return dict"""
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")

    driver = webdriver.Chrome(options=options)
    try:
        driver.get("https://www.msn.com/th-th/weather/forecast/in-Phop-Phra")

        wait = WebDriverWait(driver, 15, poll_frequency=0.5,
                             ignored_exceptions=[StaleElementReferenceException])
        time.sleep(3)

        def get_text(by, selector):
            for attempt in range(3):
                try:
                    el = wait.until(EC.visibility_of_element_located((by, selector)))
                    return el.text.strip()
                except StaleElementReferenceException:
                    time.sleep(1)
            return "N/A"

        def get_aqi():
            for attempt in range(3):
                try:
                    el = wait.until(EC.visibility_of_element_located((
                        By.CSS_SELECTOR,
                        "a.aqiDetailItemGroupCompact-DS-EntryPoint1-1 > div[aria-hidden='true']"
                    )))
                    return driver.execute_script("""
                        const el = arguments[0];
                        for (let node of el.childNodes) {
                            if (node.nodeType === Node.TEXT_NODE) {
                                const val = node.textContent.trim();
                                if (val) return val;
                            }
                        }
                        return '';
                    """, el)
                except StaleElementReferenceException:
                    time.sleep(1)
            return "N/A"

        # แก้ temp ให้เอาแค่ตัวเลข
        temp_raw = get_text(By.CSS_SELECTOR, "#OverviewCurrentTemperature a")
        temp     = temp_raw.replace("\n", "").replace("°C", "").strip() + "°C"

        condition   = get_text(By.CLASS_NAME,   "summaryCaptionCompact-DS-EntryPoint1-1")
        humidity    = get_text(By.CSS_SELECTOR, "#CurrentDetailLineHumidityValue span")
        wind        = get_text(By.ID,           "CurrentDetailLineWindValue")
        visibility  = get_text(By.CSS_SELECTOR, "#CurrentDetailLineVisibilityValue span")
        pressure    = get_text(By.CSS_SELECTOR, "#CurrentDetailLinePressureValue span")
        dew         = get_text(By.CSS_SELECTOR, "#CurrentDetailLineDewPointValue span")
        pm25        = get_aqi()

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
    finally:
        driver.quit()


# สำหรับรันทดสอบตรงๆ
if __name__ == "__main__":
    data = fetch_msn_data()
    print(data)