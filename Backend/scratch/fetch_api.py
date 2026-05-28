import urllib.request
import json

def fetch_url(url):
    try:
        print(f"Fetching: {url}")
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            data = response.read().decode('utf-8')
            parsed = json.loads(data)
            print("Response length:", len(data))
            print("Response preview:", json.dumps(parsed, indent=2)[:1000])
    except Exception as e:
        print(f"Error fetching {url}: {e}")

if __name__ == "__main__":
    fetch_url("http://76.13.218.250:8000/getCurrentTMD/")
    fetch_url("http://76.13.218.250:8000/debugDB")
    # Let's check get24hOverall limit 24
    fetch_url("http://76.13.218.250:8000/get24hOverall/?limit_hours=24")
