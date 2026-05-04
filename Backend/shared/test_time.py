import sys, time
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

options = Options()
options.add_argument('--headless=new')
options.add_argument('--disable-gpu')
options.add_argument('--no-sandbox')
options.add_argument('--window-size=1920,1080')
options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36')

driver = webdriver.Chrome(options=options)
driver.execute_cdp_cmd('Emulation.setTimezoneOverride', {'timezoneId': 'Asia/Bangkok'})
driver.get('https://weather.com/en-US/weather/today/l/16.88,99.13')
time.sleep(5)

result = driver.execute_script('''
    var timeEl = document.querySelector('span[class*=\"CurrentConditions--timestamp\"]');
    var tempEl = document.querySelector('div[class*=\"CurrentConditions--primary\"] span[data-testid=\"TemperatureValue\"][class*=\"CurrentConditions--tempValue\"]');
    var locEl = document.querySelector('h1[class*=\"CurrentConditions--location\"]');
    
    var timeTxt = timeEl ? timeEl.textContent : 'none';
    var tempTxt = tempEl ? tempEl.textContent : 'none';
    var locTxt = locEl ? locEl.textContent : 'none';
    
    return {time: timeTxt, temp: tempTxt, loc: locTxt};
''')

print(f"Location: {result['loc']}")
print(f"Time: {result['time']}")
print(f"Temp element text: {result['temp']}")

driver.quit()
