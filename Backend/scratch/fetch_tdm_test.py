import sys
import os

# Add Backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.data_tdm import main as fetch_tdm_data

if __name__ == "__main__":
    print("Testing TMD Fetch...")
    res = fetch_tdm_data()
    print("Result:")
    import json
    print(json.dumps(res, indent=2))
