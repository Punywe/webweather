import pandas as pd

def get_sheet_df(sheet_url: str) -> pd.DataFrame:
    """แปลง Google Sheet URL → CSV แล้วดึงข้อมูล"""
    if "export?format=csv" not in sheet_url:
        sheet_id = sheet_url.split("/d/")[1].split("/")[0]
        csv_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv"
    else:
        csv_url = sheet_url
    return pd.read_csv(csv_url)