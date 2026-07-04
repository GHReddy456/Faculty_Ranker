import requests
import json
url = "https://firestore.googleapis.com/v1/projects/faculty-ranker-272aa/databases/(default)/documents/ratings"
response = requests.get(url)
if response.status_code == 200:
    for doc in response.json().get('documents', []):
        if 'monalisa' in doc.get('name', '').lower():
            print(json.dumps(doc, indent=2))
