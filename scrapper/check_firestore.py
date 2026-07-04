import requests
import json

url = "https://firestore.googleapis.com/v1/projects/faculty-ranker-272aa/databases/(default)/documents/partition_faculty_2/28"
response = requests.get(url)
print(response.status_code)
if response.status_code == 200:
    data = response.json()
    fields = data.get('fields', {})
    print("Keys in document:")
    for k in fields.keys():
        print(f" - {k}")
        
    print("\nMonalisa Sahu data:")
    for k, v in fields.items():
        if 'monalisa' in k.lower():
            print(json.dumps({k: v}, indent=2))
else:
    print(response.text)
