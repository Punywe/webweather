import requests
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Tuple, List

TH_TZ = timezone(timedelta(hours=7))

BASE_URL = "https://data.tmd.go.th/nwpapi/v1"

# =========================
# AUTH
# =========================
TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjE3ZDA5NWE1OTFiYmIxNWM0Y2Y1OWI3NmYxMzE1YmUwMjcxYmRhZmJlNDc0ZTE5MTYyZDM4NjdiY2IwYjg2M2Q4M2IyYTc4ZjdiMzA5YzhiIn0.eyJhdWQiOiIyIiwianRpIjoiMTdkMDk1YTU5MWJiYjE1YzRjZjU5Yjc2ZjEzMTViZTAyNzFiZGFmYmU0NzRlMTkxNjJkMzg2N2JjYjBiODYzZDgzYjJhNzhmN2IzMDljOGIiLCJpYXQiOjE3NzMxNDQyNjQsIm5iZiI6MTc3MzE0NDI2NCwiZXhwIjoxODA0NjgwMjY0LCJzdWIiOiI0ODk3Iiwic2NvcGVzIjpbXX0.AjwY68edXfra8CiR3yH_gLGfWOtGSNXBz9exWY-nf9sqRcCDcaUHIQOT_LCQCK2lwQ7MjvzkjlGVsByQ0kEor2jISX-iew898v26ZYLO9ofJwDg4MuKutuRh-lx6O1APIZyu04H450KMbxy7mRgqde3V9G5srXKJoRXCwPZ8nF4QOr1oVsc-oQ0EvsEhF9NiuoItkk4Dc7qjwKBJm-rZXpRrhUA6V48Bpb4LKLzmjgzxsvot_wC5-IxUX9n4jvskRjVo_oSL8i9xxmkHZY45mxBXMjAtOYcuLPR3PMx9ozfx5K1fnujlH-PKrsK9afkMMBPUSuTNz3b_PkDUV30gKZ6aospT-uUpJMPjvWD0R4ktr-wzvU4Y162BgqJMk82VcsqLUyEFJqhBtn5Oep9lDkyWGVV0Qnbh_bRrbs96_LwcQS4vAPYD9tGc8UjBn-1_8UIlXC8DCAN7UmI1dl2L2CiqvFTX5pgC9IGV8CpkbStN7eiK9y_ldQclDwcLElLzA1yQfWbDEbzvxq_Sb3Av6g6Kyl4imAViMaSY42n1vypvc3WJEElESqOw1SRo_4VL3kU1L3KYiB7DjJVkbf1haqqDBcajomk3YfmKTYFGVYE6ZIx9S_3wltTq7oTDsn19kdxphKRdc4uhLC9CbvTopkVcnO0V1gysqiOG3vxuRzA"

HEADERS = {
    "accept": "application/json",
    "authorization": f"Bearer {TOKEN}",
}

# =========================
# FIELDS & LABELS
# =========================
DAILY_FIELDS = ["tc_max", "tc_min", "rh", "rain", "cond"]

COND_TH = {
    1:  "ท้องฟ้าแจ่มใส",
    2:  "มีเมฆบางส่วน",
    3:  "เมฆเป็นส่วนมาก",
    4:  "เมฆมาก",
    5:  "ฝนเล็กน้อย",
    6:  "ฝนปานกลาง",
    7:  "ฝนหนัก",
    8:  "ฝนฟ้าคะนอง",
    9:  "อากาศเย็น/หนาว",
    10: "หมอก",
    11: "ลมแรง",
    12: "อื่นๆ/ไม่ระบุ",
}

DAY_TH = {
    0: "จันทร์",
    1: "อังคาร",
    2: "พุธ",
    3: "พฤหัสบดี",
    4: "ศุกร์",
    5: "เสาร์",
    6: "อาทิตย์",
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
    },
}

# ─────────────────────────────────────────────
# HTTP
# ─────────────────────────────────────────────

def _get(url: str, params: dict) -> dict:
    r = requests.get(url, headers=HEADERS, params=params, timeout=25)
    if r.status_code != 200:
        raise RuntimeError(f"HTTP {r.status_code}: {r.text[:300]}")
    return r.json()


# ─────────────────────────────────────────────
# FETCH
# ─────────────────────────────────────────────

# def fetch_daily_7day(lat: float, lon: float) -> List[dict]:
#     """
#     ดึงพยากรณ์รายวัน 7 วัน จาก /forecast/location/daily/at
#     คืน list ของ dict แต่ละวัน
#     """
#     now = datetime.now(UTC)
#     url = f"{BASE_URL}/forecast/location/daily/at"
#     params = {
#         "lat": lat,
#         "lon": lon,
#         "fields": ",".join(DAILY_FIELDS),
#         "date": now.strftime("%Y-%m-%d"),
#         "duration": 7,
#     }

#     raw = _get(url, params)

#     wf_list = raw.get("WeatherForecasts", [])
#     if not wf_list:
#         raise RuntimeError("ไม่พบ WeatherForecasts ใน response")

#     forecasts = wf_list[0].get("forecasts", [])
#     if not forecasts:
#         raise RuntimeError("ไม่พบ forecasts ใน response")

#     records: List[dict] = []
#     for f in forecasts:
#         d = f.get("data", {})
#         time_str = f.get("time", "")
#         date_part = time_str[:10] if time_str else ""

#         # แปลง date_part เป็น datetime เพื่อหาวันในสัปดาห์
#         try:
#             dt = datetime.strptime(date_part, "%Y-%m-%d")
#             weekday_th = DAY_TH.get(dt.weekday(), "")
#         except ValueError:
#             weekday_th = ""

#         cond = d.get("cond")
#         records.append({
#             "date":      date_part,
#             "weekday":   weekday_th,
#             "tc_max":    d.get("tc_max"),
#             "tc_min":    d.get("tc_min"),
#             "rh":        d.get("rh"),
#             "rain":      d.get("rain"),
#             "cond":      cond,
#             "cond_th":   COND_TH.get(cond, "-") if isinstance(cond, int) else "-",
#         })

#     return records

def fetch_daily_7day(lat: float, lon: float) -> dict:
    now = datetime.now(TH_TZ)
    url = f"{BASE_URL}/forecast/location/daily/at"
    params = {
        "lat": lat,
        "lon": lon,
        "fields": ",".join(DAILY_FIELDS),
        "date": now.strftime("%Y-%m-%d"),
        "duration": 7,
    }

    raw = _get(url, params)

    wf_list = raw.get("WeatherForecasts", [])
    if not wf_list:
        raise RuntimeError("ไม่พบ WeatherForecasts ใน response")

    forecasts = wf_list[0].get("forecasts", [])
    if not forecasts:
        raise RuntimeError("ไม่พบ forecasts ใน response")

    records = []
    for f in forecasts:
        d = f.get("data", {})
        time_str = f.get("time", "")
        date_part = time_str[:10] if time_str else ""

        try:
            dt = datetime.strptime(date_part, "%Y-%m-%d")
            weekday_th = DAY_TH.get(dt.weekday(), "")
        except ValueError:
            weekday_th = ""

        cond = d.get("cond")
        records.append({
            "date":     date_part,
            "weekday":  weekday_th,
            "tc_max":   d.get("tc_max"),
            "tc_min":   d.get("tc_min"),
            "rh":       d.get("rh"),
            "rain":     d.get("rain"),
            "cond":     cond,
            "cond_th":  COND_TH.get(cond, "-") if isinstance(cond, int) else "-",
        })

    return {
        "status": "success",
        "fetched_at": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "location": {"lat": lat, "lon": lon},
        "count": len(records),
        "forecasts": records,
    }


# ─────────────────────────────────────────────
# AREA SELECTOR
# ─────────────────────────────────────────────

def select_area(area_key: str) -> Tuple[float, float, Dict[str, Any]]:
    if area_key not in AREA_PRESETS:
        available = ", ".join(sorted(AREA_PRESETS.keys()))
        raise SystemExit(f"❌ ไม่พบพื้นที่ '{area_key}'  มีให้เลือก: {available}")
    meta = AREA_PRESETS[area_key]
    return float(meta["lat"]), float(meta["lon"]), meta


# ─────────────────────────────────────────────
# PRETTY PRINT
# ─────────────────────────────────────────────

def _fmt(val, unit="", decimals=1) -> str:
    if val is None:
        return "N/A"
    return f"{val:.{decimals}f}{unit}"


def print_daily_table(records: List[dict], area_label: str):
    now_str = datetime.now(TH_TZ).strftime("%Y-%m-%d %H:%M TH")

    print()
    print("=" * 76)
    print(f"  📅  พยากรณ์อากาศรายวัน 7 วัน  —  {area_label}")
    print(f"       ดึงข้อมูลเมื่อ: {now_str}")
    print("=" * 76)
    print(
        f"  {'วัน':<6} {'วันที่':<12} {'สูงสุด':>8} {'ต่ำสุด':>8} "
        f"{'ความชื้น':>10} {'ฝน':>8}  สภาพอากาศ"
    )
    print(
        f"  {'':<6} {'':<12} {'(°C)':>8} {'(°C)':>8} "
        f"{'(%RH)':>10} {'(mm)':>8}"
    )
    print("-" * 76)

    for r in records:
        print(
            f"  {r['weekday']:<6} {r['date']:<12} "
            f"{_fmt(r['tc_max'], '°C'):>8} "
            f"{_fmt(r['tc_min'], '°C'):>8} "
            f"{_fmt(r['rh'], '%', 0):>10} "
            f"{_fmt(r['rain'], 'mm'):>8}  "
            f"{r['cond_th']}"
        )

    print("=" * 76)
    print(f"  รวม {len(records)} วัน")
    print()


# ─────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────

def main():
    AREA_KEY = "ตาก"

    lat, lon, meta = select_area(AREA_KEY)
    area_label = meta.get("label", AREA_KEY)

    print(f"\n📡 กำลังดึงพยากรณ์รายวัน 7 วัน — {area_label} ...")

    records = fetch_daily_7day(lat, lon)
    print_daily_table(records, area_label)


if __name__ == "__main__":
    main()