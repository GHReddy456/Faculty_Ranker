import requests
import json

url = "https://cms.vitap.ac.in/api/faculty-profiles"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json"
}

params = {
    "populate": "*",
    "pagination[page]": 1,
    "pagination[pageSize]": 25,
    "sort": "Employee_Id:ASC"
}

response = requests.get(url, headers=headers, params=params)
print(f"Status: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print(f"Found {len(data.get('data', []))} items on page 1")
    print(f"Total items according to meta: {data.get('meta', {}).get('pagination', {}).get('total')}")
else:
    print(response.text)
