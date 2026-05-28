import urllib.request
import json

def fetch_url(url):
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            data = response.read().decode('utf-8')
            parsed = json.loads(data)
            print(json.dumps(parsed, indent=2))
    except Exception as e:
        print(f"Error fetching {url}: {e}")

if __name__ == "__main__":
    fetch_url("http://76.13.218.250:8001/syncStatus")
