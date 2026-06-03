import os
import json
import requests
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Tuple
from pydantic import BaseModel

BASE_URL = "https://data.tmd.go.th/nwpapi/v1"

# =========================
# AUTH
# =========================
TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjE3ZDA5NWE1OTFiYmIxNWM0Y2Y1OWI3NmYxMzE1YmUwMjcxYmRhZmJlNDc0ZTE5MTYyZDM4NjdiY2IwYjg2M2Q4M2IyYTc4ZjdiMzA5YzhiIn0.eyJhdWQiOiIyIiwianRpIjoiMTdkMDk1YTU5MWJiYjE1YzRjZjU5Yjc2ZjEzMTViZTAyNzFiZGFmYmU0NzRlMTkxNjJkMzg2N2JjYjBiODYzZDgzYjJhNzhmN2IzMDljOGIiLCJpYXQiOjE3NzMxNDQyNjQsIm5iZiI6MTc3MzE0NDI2NCwiZXhwIjoxODA0NjgwMjY0LCJzdWIiOiI0ODk3Iiwic2NvcGVzIjpbXX0.AjwY68edXfra8CiR3yH_gLGfWOtGSNXBz9exWY-nf9sqRcCDcaUHIQOT_LCQCK2lwQ7MjvzkjlGVsByQ0kEor2jISX-iew898v26ZYLO9ofJwDg4MuKutuRh-lx6O1APIZyu04H450KMbxy7mRgqde3V9G5srXKJoRXCwPZ8nF4QOr1oVsc-oQ0EvsEhF9NiuoItkk4Dc7qjwKBJm-rZXpRrhUA6V48Bpb4LKLzmjgzxsvot_wC5-IxUX9n4jvskRjVo_oSL8i9xxmkHZY45mxBXMjAtOYcuLPR3PMx9ozfx5K1fnujlH-PKrsK9afkMMBPUSuTNz3b_PkDUV30gKZ6aospT-uUpJMPjvWD0R4ktr-wzvU4Y162BgqJMk82VcsqLUyEFJqhBtn5Oep9lDkyWGVV0Qnbh_bRrbs96_LwcQS4vAPYD9tGc8UjBn-1_8UIlXC8DCAN7UmI1dl2L2CiqvFTX5pgC9IGV8CpkbStN7eiK9y_ldQclDwcLElLzA1yQfWbDEbzvxq_Sb3Av6g6Kyl4imAViMaSY42n1vypvc3WJEElESqOw1SRo_4VL3kU1L3KYiB7DjJVkbf1haqqDBcajomk3YfmKTYFGVYE6ZIx9S_3wltTq7oTDsn19kdxphKRdc4uhLC9CbvTopkVcnO0V1gysqiOG3vxuRzA"

if not TOKEN:
    raise SystemExit("❌ กรุณาตั้งค่า token ก่อน")

HEADERS = {
    "accept": "application/json",
    "authorization": f"Bearer {TOKEN}",
}

# =========================
# FIELDS (hourly)
# =========================
DEFAULT_FIELDS = [
    "tc", "rh", "rain",
    "ws10m",
    "cond",
]

COND_TH = {
    1: "ท้องฟ้าแจ่มใส",
    2: "มีเมฆบางส่วน",
    3: "เมฆเป็นส่วนมาก",
    4: "เมฆมาก",
    5: "ฝนเล็กน้อย",
    6: "ฝนปานกลาง",
    7: "ฝนหนัก",
    8: "ฝนฟ้าคะนอง",
    9: "อากาศเย็น/หนาว",
    10: "หมอก",
    11: "ลมแรง",
    12: "อื่นๆ/ไม่ระบุ",
}

# =========================
# AREA PRESETS
# =========================
AREA_PRESETS: Dict[str, Dict[str, Any]] = {
    "ตาก": {
        "code": "63",
        "label": "จังหวัดตาก",
        "lat": 16.883,
        "lon": 99.125,
    }
}


def _tmd_get(url: str, params: dict) -> dict:
    r = requests.get(url, headers=HEADERS, params=params, timeout=25)
    if r.status_code != 200:
        raise RuntimeError(f"HTTP {r.status_code}: {r.text}")
    return r.json()


def select_area(area_key: str) -> Tuple[float, float, Dict[str, Any]]:
    if area_key not in AREA_PRESETS:
        available = "\n- " + "\n- ".join(sorted(AREA_PRESETS.keys()))
        raise SystemExit(f"❌ ไม่พบพื้นที่ '{area_key}'\nมีให้เลือก:{available}")

    meta = AREA_PRESETS[area_key]
    lat = meta.get("lat")
    lon = meta.get("lon")

    if lat is None or lon is None:
        raise SystemExit(
            f"❌ พื้นที่ '{area_key}' ยังไม่มี lat/lon\n"
            f"กรอกพิกัดใน AREA_PRESETS ก่อน (code={meta.get('code')}, label={meta.get('label')})"
        )

    return float(lat), float(lon), {
        "key": area_key,
        "code": meta.get("code"),
        "label": meta.get("label"),
    }


def fetch_hourly_at(lat: float, lon: float, date_str: str, hour: int, duration: int = 1, fields=None) -> dict:
    if fields is None:
        fields = DEFAULT_FIELDS

    url = f"{BASE_URL}/forecast/location/hourly/at"
    params = {
        "lat": lat,
        "lon": lon,
        "fields": ",".join(fields),
        "date": date_str,
        "hour": hour,
        "duration": duration
    }
    return _tmd_get(url, params)


def normalize_latest_1(raw: dict, query: dict) -> dict:
    wf_list = raw.get("WeatherForecasts", [])
    if not wf_list:
        return {"ok": False, "error": f"TMD API: No WeatherForecasts found for query {query}", "raw": raw}

    wf = wf_list[0]
    loc = wf.get("location", {})
    forecasts = wf.get("forecasts", [])
    if not forecasts:
        return {"ok": False, "error": f"TMD API: No forecasts found in WeatherForecasts for query {query}", "raw": raw}

    f = forecasts[0]
    t = f.get("time")
    d = f.get("data", {})

    if not d:
        return {"ok": False, "error": f"TMD API: No data fields found in forecast for time {t}", "raw": raw}

    cond = d.get("cond")
    cond_text = COND_TH.get(cond) if isinstance(cond, int) else None
    
    # ถ้าไม่มีข้อความสภาพอากาศ ให้ระบุเป็น "ไม่ระบุ" แทนที่จะเป็น None เพื่อป้องกัน DB crash
    if cond_text is None:
        cond_text = f"ไม่ระบุ ({cond})" if cond is not None else "ไม่ระบุ"

    return {
        "ok": True,
        "source": "TMD NWP API",
        "type": "hourly_forecast_latest_1",
        "query": query,
        "location": {
            "lat": loc.get("lat"),
            "lon": loc.get("lon")
        },
        "data": {
            "time": t,
            "tc": d.get("tc"),
            "rh": d.get("rh"),
            "rain": d.get("rain"),
            "ws10m": d.get("ws10m"),
            "cond": {
                "code": cond,
                "text_th": cond_text
            },
        }
    }


def get_latest_1_hourly(lat: float, lon: float) -> dict:
    THAILAND_TZ = timezone(timedelta(hours=7))
    now = datetime.now(THAILAND_TZ)
    date_str = now.strftime("%Y-%m-%d")
    hour = now.hour

    query = {"lat": lat, "lon": lon, "date": date_str, "hour": hour, "duration": 1}

    last_err = "Initial fetch"
    try:
        raw = fetch_hourly_at(lat, lon, date_str, hour, duration=1)
        normalized = normalize_latest_1(raw, query)
        if normalized.get("ok"):
            return normalized
        last_err = normalized.get("error", "unknown error")
    except Exception as e:
        last_err = str(e)

    # Fallback to previous hour
    prev = now - timedelta(hours=1)
    date_str2 = prev.strftime("%Y-%m-%d")
    hour2 = prev.hour
    query2 = {
        "lat": lat,
        "lon": lon,
        "date": date_str2,
        "hour": hour2,
        "duration": 1,
        "fallback": True
    }

    try:
        raw2 = fetch_hourly_at(lat, lon, date_str2, hour2, duration=1)
        normalized2 = normalize_latest_1(raw2, query2)
        if normalized2.get("ok"):
            normalized2["note"] = f"used fallback (previous hour) because: {last_err}"
            return normalized2
        
        # If fallback also fails, return the error from fallback but mention the first error
        final_err = normalized2.get("error", "fallback unknown error")
        return {
            "ok": False,
            "error": f"TMD API Failed (Current & Fallback). Primary error: {last_err}. Fallback error: {final_err}"
        }
    except Exception as e:
        return {
            "ok": False,
            "error": f"TMD API Exception. Primary: {last_err}. Fallback: {str(e)}"
        }


def main():
    AREA_KEY = "ตาก"
    lat, lon, area_meta = select_area(AREA_KEY)
    payload = get_latest_1_hourly(lat, lon)
    payload["area"] = area_meta
    return payload
