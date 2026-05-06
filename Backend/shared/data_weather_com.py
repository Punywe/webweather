import requests
from bs4 import BeautifulSoup
import re

WEATHER_URL = "https://weather.com/en-US/weather/today/l/16.88,99.13"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}

def fahrenheit_to_celsius(f: float) -> float:
    return round((f - 32) * 5 / 9, 1)

def _safe_c(f_val):
    if f_val is None:
        return None
    return fahrenheit_to_celsius(float(f_val))

def _extract_num(text: str):
    if not text:
        return None
    match = re.search(r'-?[\d]+(?:\.\d+)?', text)
    return float(match.group()) if match else None

def fetch_weather_com_data(url: str = WEATHER_URL) -> dict:
    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, "html.parser")

        def get_testid(testid):
            el = soup.find(attrs={"data-testid": testid})
            return el.get_text(strip=True) if el else None

        def get_detail_by_label(label):
            for item in soup.find_all(attrs={"data-testid": "WeatherDetailsListItem"}):
                lbl = item.find(attrs={"data-testid": "WeatherDetailsLabel"})
                if lbl and lbl.get_text(strip=True) == label:
                    val = item.find(attrs={"data-testid": "wxData"})
                    return val.get_text(strip=True) if val else None
            return None

        def get_detail_temps(label):
            for item in soup.find_all(attrs={"data-testid": "WeatherDetailsListItem"}):
                lbl = item.find(attrs={"data-testid": "WeatherDetailsLabel"})
                if lbl and lbl.get_text(strip=True) == label:
                    temps = item.find_all(attrs={"data-testid": "TemperatureValue"})
                    return (
                        _extract_num(temps[0].get_text() if len(temps) > 0 else None),
                        _extract_num(temps[1].get_text() if len(temps) > 1 else None),
                    )
            return None, None

        # Current Temp
        temp_el = soup.find("span", attrs={"data-testid": "TemperatureValue"})
        temp_f = _extract_num(temp_el.get_text() if temp_el else None)

        if temp_f is None:
            return {"ok": False, "error": "ไม่พบอุณหภูมิหลัก"}

        feels_f = _extract_num(get_testid("FeelsLikeSection"))
        high_f, low_f = get_detail_temps("High / Low")

        return {
            "ok": True,
            "source": "weather.com",
            "temp_f": temp_f,
            "temp_c": fahrenheit_to_celsius(temp_f),
            "feels_like_f": feels_f,
            "feels_like_c": _safe_c(feels_f),
            "high_f": high_f,
            "high_c": _safe_c(high_f),
            "low_f": low_f,
            "low_c": _safe_c(low_f),
            "wind": get_testid("Wind"),
            "humidity": get_detail_by_label("Humidity"),
            "dew_point_f": (dew_f := _extract_num(get_detail_by_label("Dew Point"))),
            "dew_point_c": _safe_c(dew_f),
            "pressure": get_testid("PressureValue"),
            "uv_index": get_testid("UVIndexValue"),
            "visibility": get_testid("VisibilityValue"),
            "moon_phase": get_detail_by_label("Moon Phase"),
        }

    except Exception as e:
        return {"ok": False, "error": str(e)}


if __name__ == "__main__":
    import sys
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    r = fetch_weather_com_data()
    if r["ok"]:
        print(f"Temp     : {r['temp_f']}F / {r['temp_c']}C")
        print(f"Feels    : {r['feels_like_f']}F / {r['feels_like_c']}C")
        print(f"High/Low : {r['high_f']}F/{r['low_f']}F ({r['high_c']}C/{r['low_c']}C)")
        print(f"Wind     : {r['wind']}")
        print(f"Humidity : {r['humidity']}")
        print(f"Dew Point: {r['dew_point_f']}F / {r['dew_point_c']}C")
        print(f"Pressure : {r['pressure']}")
        print(f"UV Index : {r['uv_index']}")
        print(f"Visibility:{r['visibility']}")
        print(f"Moon     : {r['moon_phase']}")
    else:
        print(f"[FAIL] {r['error']}")