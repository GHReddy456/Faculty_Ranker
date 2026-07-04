import json

with open('missing_specializations.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for name, d in data.items():
    img = d.get('image_url') or 'NO IMAGE'
    spec = d.get('specialization') or 'NO SPECIALIZATION'
    print(f"{name}:")
    print(f"  img: {img[:80]}")
    print(f"  spec: {spec[:80]}")
