import json

with open('api_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for call in data:
    if 'data' in call and 'data' in call['data']:
        items = call['data']['data']
        if isinstance(items, list):
            for item in items:
                attrs = item.get('attributes', item)
                name = attrs.get('Name', '')
                if 'sirajud' in name.lower() or 'sirajud' in name.lower():
                    print(f"Name: {name}")
                    print(f"Specialization: {attrs.get('Research_area_of_specialization', '')}")
                    photo = attrs.get('Photo', {})
                    img_url = ''
                    if photo and photo.get('data'):
                        img_url = photo['data']['attributes'].get('url', '')
                    print(f"Image: {img_url}")
                    print()
