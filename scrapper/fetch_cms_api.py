import requests
import json

url = "https://cms.vitap.ac.in/api/faculty-profiles"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

all_data = []
page = 1

while True:
    print(f"Fetching page {page}...")
    params = {
        "populate": "*",
        "pagination[page]": page,
        "pagination[pageSize]": 100
    }
    try:
        response = requests.get(url, headers=headers, params=params)
        if response.status_code != 200:
            print(f"Failed with status: {response.status_code}")
            print(response.text[:200])
            break
            
        data = response.json()
        items = data.get("data", [])
        if not items:
            break
            
        all_data.extend(items)
        print(f"  Got {len(items)} items. Total so far: {len(all_data)}")
        
        meta = data.get("meta", {}).get("pagination", {})
        if page >= meta.get("pageCount", 1):
            break
            
        page += 1
    except Exception as e:
        print(f"Error: {e}")
        break

print(f"Finished. Saving {len(all_data)} items to all_cms_faculty.json")
with open("all_cms_faculty.json", "w", encoding="utf-8") as f:
    json.dump(all_data, f, indent=2, ensure_ascii=False)
