import sys, os, urllib.request, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

payload = json.dumps({"username": "test", "password": "test"}).encode()
req = urllib.request.Request(
    "http://localhost:8000/login/",
    data=payload,
    headers={"Content-Type": "application/json"},
    method="POST"
)
try:
    with urllib.request.urlopen(req) as resp:
        print("STATUS:", resp.status)
        print("BODY:", resp.read().decode())
except urllib.error.HTTPError as e:
    print("ERROR:", e.code, e.read().decode())
