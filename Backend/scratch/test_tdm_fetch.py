import requests
from datetime import datetime

TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjE3ZDA5NWE1OTFiYmIxNWM0Y2Y1OWI3NmYxMzE1YmUwMjcxYmRhZmJlNDc0ZTE5MTYyZDM4NjdiY2IwYjg2M2Q4M2IyYTc4ZjdiMzA5YzhiIn0.eyJhdWQiOiIyIiwianRpIjoiMTdkMDk1YTU5MWJiYjE1YzRjZjU5Yjc2ZjEzMTViZTAyNzFiZGFmYmU0NzRlMTkxNjJkMzg2N2JjYjBiODYzZDgzYjJhNzhmN2IzMDljOGIiLCJpYXQiOjE3NzMxNDQyNjQsIm5iZiI6MTc3MzE0NDI2NCwiZXhwIjoxODA0NjgwMjY0LCJzdWIiOiI0ODk3Iiwic2NvcGVzIjpbXX0.AjwY68edXfra8CiR3yH_gLGfWOtGSNXBz9exWY-nf9sqRcCDcaUHIQOT_LCQCK2lwQ7MjvzkjlGVsByQ0kEor2jISX-iew898v26ZYLO9ofJwDg4MuKutuRh-lx6O1APIZyu04H450KMbxy7mRgqde3V9G5srXKJoRXCwPZ8nF4QOr1oVsc-oQ0EvsEhF9NiuoItkk4Dc7qjwKBJm-rZXpRrhUA6V48Bpb4LKLzmjgzxsvot_wC5-IxUX9n4jvskRjVo_oSL8i9xxmkHZY45mxBXMjAtOYcuLPR3PMx9ozfx5K1fnujlH-PKrsK9afkMMBPUSuTNz3b_PkDUV30gKZ6aospT-uUpJMPjvWD0R4ktr-wzvU4Y162BgqJMk82VcsqLUyEFJqhBtn5Oep9lDkyWGVV0Qnbh_bRrbs96_LwcQS4vAPYD9tGc8UjBn-1_8UIlXC8DCAN7UmI1dl2L2CiqvFTX5pgC9IGV8CpkbStN7eiK9y_ldQclDwcLElLzA1yQfWbDEbzvxq_Sb3Av6g6Kyl4imAViMaSY42n1vypvc3WJEElESqOw1SRo_4VL3kU1L3KYiB7DjJVkbf1haqqDBcajomk3YfmKTYFGVYE6ZIx9S_3wltTq7oTDsn19kdxphKRdc4uhLC9CbvTopkVcnO0V1gysqiOG3vxuRzA"
HEADERS = {
    "accept": "application/json",
    "authorization": f"Bearer {TOKEN}",
}

def test_fetch():
    url = "https://data.tmd.go.th/nwpapi/v1/forecast/location/hourly/at"
    params = {
        "lat": 16.883,
        "lon": 99.125,
        "fields": "tc,rh,rain,ws10m,cond",
        "date": datetime.utcnow().strftime("%Y-%m-%d"),
        "hour": datetime.utcnow().hour,
        "duration": 1
    }
    print(f"Fetching from {url} with params {params}")
    r = requests.get(url, headers=HEADERS, params=params, timeout=25)
    print(f"Status Code: {r.status_code}")
    print(f"Response: {r.text}")

if __name__ == "__main__":
    test_fetch()
