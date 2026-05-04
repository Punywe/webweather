import sys, time
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

options = Options()
options.add_argument("--headless=new")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("--window-size=1920,1080")
options.add_argument(
    "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)

driver = webdriver.Chrome(options=options)
driver.get("https://weather.com/en-US/weather/today/l/THXX0111:1:TH")
print("Waiting 6s for JS to render...")
time.sleep(6)

result = driver.execute_script("""
    var all = document.querySelectorAll("span[data-testid='TemperatureValue']");
    var info = [];
    for (var i = 0; i < all.length; i++) {
        var el = all[i];
        var txt = '';
        for (var j = 0; j < el.childNodes.length; j++) {
            if (el.childNodes[j].nodeType === 3) txt = el.childNodes[j].textContent.trim();
        }
        info.push({
            idx: i,
            cls: el.className,
            text_node: txt,
            full_text: el.textContent.trim().substring(0, 10)
        });
    }
    return info;
""")

print(f"Found {len(result)} TemperatureValue elements:")
for r in result:
    print(f"  [{r['idx']}] text='{r['text_node']}' | class='{r['cls'][:60]}...' | full='{r['full_text']}'")

driver.quit()
