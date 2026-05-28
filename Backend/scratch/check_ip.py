import urllib.request
def get_ip():
    try:
        with urllib.request.urlopen("https://api.ipify.org", timeout=5) as response:
            print("Public IP:", response.read().decode('utf-8'))
    except Exception as e:
        print("Error getting public IP:", e)

if __name__ == "__main__":
    get_ip()
