import requests
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Tuple, List

UTC = timezone.utc

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
# FIELDS
# =========================
HOURLY_FIELDS = ["tc", "rh", "rain", "ws10m", "cond"]
DAILY_FIELDS  = ["tc_max", "tc_min", "rh", "rain", "cond"]

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
# LOW-LEVEL HTTP
# ─────────────────────────────────────────────

def _get(url: str, params: dict) -> dict:
    r = requests.get(url, headers=HEADERS, params=params, timeout=25)
    if r.status_code != 200:
        raise RuntimeError(f"HTTP {r.status_code}: {r.text[:300]}")
    return r.json()


# ─────────────────────────────────────────────
# STRATEGY 1 : hourly  duration=48  (2 วัน, 1 call)
# API จำกัด duration ≤ 48 ชั่วโมง
# ─────────────────────────────────────────────

def _strategy_duration48(lat: float, lon: float, now: datetime) -> List[dict]:
    """
    ดึง hourly forecast 48 ชั่วโมง (2 วัน) ในคำขอเดียว
    API กำหนด duration ≤ 48
    """
    url = f"{BASE_URL}/forecast/location/hourly/at"
    params = {
        "lat": lat,
        "lon": lon,
        "fields": ",".join(HOURLY_FIELDS),
        "date": now.strftime("%Y-%m-%d"),
        "hour": now.hour,
        "duration": 48,
    }
    raw = _get(url, params)
    records = _extract_hourly_records(raw)
    if not records:
        raise ValueError("ได้รับข้อมูล 0 records จาก duration=48")
    return records


# ─────────────────────────────────────────────
# STRATEGY 2 : hourly  loop ทีละวัน (≤3 วัน)
# API อนุญาต date ล่วงหน้าได้ไม่เกิน ~3 วัน
# ─────────────────────────────────────────────

def _strategy_loop_3day(lat: float, lon: float, now: datetime) -> List[dict]:
    """
    วนดึง hourly forecast ทีละวัน สูงสุด 3 วัน (API limit)
    duration=48 ต่อ call เพื่อให้คุ้มค่า
    """
    url = f"{BASE_URL}/forecast/location/hourly/at"
    all_records: List[dict] = []

    for day_offset in range(3):
        target = now + timedelta(days=day_offset)
        params = {
            "lat": lat,
            "lon": lon,
            "fields": ",".join(HOURLY_FIELDS),
            "date": target.strftime("%Y-%m-%d"),
            "hour": 0,
            "duration": 24,
        }
        try:
            raw = _get(url, params)
            records = _extract_hourly_records(raw)
            all_records.extend(records)
        except RuntimeError as e:
            # หยุดเมื่อ API ปฏิเสธวันนั้น (เกิน range ที่ support)
            print(f"\n     (หยุดที่วัน +{day_offset}: {e})", end="")
            break

    if not all_records:
        raise ValueError("ได้รับข้อมูล 0 records จาก loop hourly")
    return all_records


# ─────────────────────────────────────────────
# STRATEGY 3 : /daily/at  duration=7  (1 call)
# ─────────────────────────────────────────────

def _strategy_daily_endpoint(lat: float, lon: float, now: datetime) -> List[dict]:
    """
    ใช้ endpoint รายวัน /forecast/location/daily/at
    คืน list ของ daily record 7 วัน
    """
    url = f"{BASE_URL}/forecast/location/daily/at"
    params = {
        "lat": lat,
        "lon": lon,
        "fields": ",".join(DAILY_FIELDS),
        "date": now.strftime("%Y-%m-%d"),
        "duration": 7,
    }
    raw = _get(url, params)
    records = _extract_daily_records(raw)
    if not records:
        raise ValueError("ได้รับข้อมูล 0 records จาก /daily/at")
    return records


# ─────────────────────────────────────────────
# HELPERS : แกะ JSON จาก TMD response
# ─────────────────────────────────────────────

def _extract_hourly_records(raw: dict) -> List[dict]:
    wf_list = raw.get("WeatherForecasts", [])
    if not wf_list:
        return []
    forecasts = wf_list[0].get("forecasts", [])
    result = []
    for f in forecasts:
        d = f.get("data", {})
        cond = d.get("cond")
        result.append({
            "time":   f.get("time"),
            "tc":     d.get("tc"),
            "rh":     d.get("rh"),
            "rain":   d.get("rain"),
            "ws10m":  d.get("ws10m"),
            "cond":   cond,
            "cond_th": COND_TH.get(cond, "-") if isinstance(cond, int) else "-",
        })
    return result


def _extract_daily_records(raw: dict) -> List[dict]:
    wf_list = raw.get("WeatherForecasts", [])
    if not wf_list:
        return []
    forecasts = wf_list[0].get("forecasts", [])
    result = []
    for f in forecasts:
        d = f.get("data", {})
        cond = d.get("cond")
        result.append({
            "time":    f.get("time"),
            "tc_max":  d.get("tc_max"),
            "tc_min":  d.get("tc_min"),
            "rh":      d.get("rh"),
            "rain":    d.get("rain"),
            "cond":    cond,
            "cond_th": COND_TH.get(cond, "-") if isinstance(cond, int) else "-",
        })
    return result


# ─────────────────────────────────────────────
# MAIN FETCHER  พร้อม auto-fallback
# ─────────────────────────────────────────────

STRATEGIES = [
    ("hourly duration=48 (2 วัน)",  _strategy_duration48),
    ("hourly loop ≤3 วัน",           _strategy_loop_3day),
    ("/daily/at duration=7 (7 วัน)", _strategy_daily_endpoint),
]

def fetch_7day_forecast(lat: float, lon: float) -> Tuple[str, str, List[dict]]:
    """
    ลองทุก strategy ตามลำดับ แล้ว fallback อัตโนมัติ
    คืนค่า (strategy_name, data_type, records)
      data_type = "hourly" | "daily"
    """
    now = datetime.now(UTC)
    errors: List[str] = []

    for name, fn in STRATEGIES:
        try:
            print(f"  ▶ ลอง strategy: {name} ...", end=" ", flush=True)
            records = fn(lat, lon, now)
            print(f"✅ ได้ {len(records)} records")
            data_type = "daily" if "daily" in name else "hourly"
            return name, data_type, records
        except Exception as e:
            msg = str(e)
            print(f"❌  {msg}")
            errors.append(f"[{name}] {msg}")

    raise RuntimeError(
        "ทุก strategy ล้มเหลว:\n" + "\n".join(errors)
    )


# ─────────────────────────────────────────────
# PRETTY PRINT
# ─────────────────────────────────────────────

def _fmt(val, unit="", decimals=1) -> str:
    if val is None:
        return "   N/A  "
    return f"{val:.{decimals}f}{unit}"


def print_hourly_table(records: List[dict], area_label: str):
    print()
    print("=" * 72)
    print(f"  พยากรณ์อากาศรายชั่วโมง 7 วัน  —  {area_label}")
    print("=" * 72)
    print(f"  {'วันที่-เวลา':<20} {'อุณหภูมิ':>8} {'ความชื้น':>8} {'ฝน':>7} {'ลม':>8}  สภาพอากาศ")
    print(f"  {'':<20} {'(°C)':>8} {'(%RH)':>8} {'(mm)':>7} {'(m/s)':>8}")
    print("-" * 72)

    prev_date = ""
    for r in records:
        t = r.get("time", "")
        date_part = t[:10] if t else ""

        # ขึ้นบรรทัดว่างเมื่อเปลี่ยนวัน
        if date_part != prev_date and prev_date:
            print()
        prev_date = date_part

        print(
            f"  {t:<20} "
            f"{_fmt(r.get('tc'), '°C'):>8} "
            f"{_fmt(r.get('rh'), '%', 0):>8} "
            f"{_fmt(r.get('rain'), 'mm'):>7} "
            f"{_fmt(r.get('ws10m'), 'm/s'):>8}  "
            f"{r.get('cond_th', '-')}"
        )

    print("=" * 72)


def print_daily_table(records: List[dict], area_label: str):
    print()
    print("=" * 72)
    print(f"  พยากรณ์อากาศรายวัน 7 วัน  —  {area_label}")
    print("=" * 72)
    print(f"  {'วันที่':<14} {'สูงสุด':>8} {'ต่ำสุด':>8} {'ความชื้น':>8} {'ฝน':>7}  สภาพอากาศ")
    print(f"  {'':<14} {'(°C)':>8} {'(°C)':>8} {'(%RH)':>8} {'(mm)':>7}")
    print("-" * 72)

    for r in records:
        t = r.get("time", "")
        date_part = t[:10] if t else t
        print(
            f"  {date_part:<14} "
            f"{_fmt(r.get('tc_max'), '°C'):>8} "
            f"{_fmt(r.get('tc_min'), '°C'):>8} "
            f"{_fmt(r.get('rh'), '%', 0):>8} "
            f"{_fmt(r.get('rain'), 'mm'):>7}  "
            f"{r.get('cond_th', '-')}"
        )

    print("=" * 72)


# ─────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────

def select_area(area_key: str) -> Tuple[float, float, Dict[str, Any]]:
    if area_key not in AREA_PRESETS:
        available = ", ".join(sorted(AREA_PRESETS.keys()))
        raise SystemExit(f"❌ ไม่พบพื้นที่ '{area_key}'  มีให้เลือก: {available}")
    meta = AREA_PRESETS[area_key]
    return float(meta["lat"]), float(meta["lon"]), meta


def main():
    AREA_KEY = "ตาก"

    lat, lon, meta = select_area(AREA_KEY)
    area_label = meta.get("label", AREA_KEY)

    print(f"\n🌤  ดึงพยากรณ์อากาศ 7 วัน — {area_label}  (lat={lat}, lon={lon})")
    print(f"   เวลาปัจจุบัน UTC: {datetime.now(UTC).strftime('%Y-%m-%d %H:%M')}\n")

    strategy_name, data_type, records = fetch_7day_forecast(lat, lon)

    print(f"\n✅ ใช้ strategy: {strategy_name}  |  data type: {data_type}  |  records: {len(records)}")

    if data_type == "hourly":
        print_hourly_table(records, area_label)
    else:
        print_daily_table(records, area_label)


if __name__ == "__main__":
    main()