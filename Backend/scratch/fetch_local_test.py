import urllib.request
import json

def fetch_url(url):
    try:
        print(f"Fetching local: {url}")
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=2) as response:
            data = response.read().decode('utf-8')
            parsed = json.loads(data)
            print("Succeeded:", json.dumps(parsed, indent=2)[:500])
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    fetch_url("http://localhost:8000/getCurrentTMD/")
    fetch_url("http://localhost:8001/syncStatus")
