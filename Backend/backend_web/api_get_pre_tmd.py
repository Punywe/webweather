import sys
import os
from fastapi import APIRouter, HTTPException
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from shared.predict7day import fetch_daily_7day

# res = fetch_daily_7day(16.883, 99.125)
# print(res)

router = APIRouter(
    prefix="/getPre7day",
    tags=["pre7dayTMD"]
)

@router.get("/")
async def get_data_node():
    res = fetch_daily_7day(16.883, 99.125)
    return res