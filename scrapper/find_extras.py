import json, re

# Load all API names (the 500)
with open('api_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

api_names = set()
for call in data:
    if 'data' in call and 'data' in call['data']:
        items = call['data']['data']
        if isinstance(items, list):
            for item in items:
                name = item.get('attributes', {}).get('Name', '').strip()
                if name:
                    api_names.add(name)

# Load all names in query_faculty.ts (the 514)
with open('../src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    content = f.read()

blocks = re.findall(r'\{[^{}]+\}', content, re.DOTALL)
ts_entries = []
for b in blocks:
    name_m = re.search(r'"name":\s*"([^"]+)"', b)
    id_m = re.search(r'"id":\s*"([^"]+)"', b)
    spec_m = re.search(r'"specialization":\s*"([^"]+)"', b)
    if name_m and id_m:
        ts_entries.append({
            'name': name_m.group(1),
            'id': id_m.group(1),
            'spec': spec_m.group(1)[:60] if spec_m else ''
        })

print(f"Total in query_faculty.ts: {len(ts_entries)}")
print(f"Total in vitapfaculty API: {len(api_names)}")

# Find entries in TS that are NOT in API
not_in_api = [e for e in ts_entries if e['name'] not in api_names]
print(f"\nIn query_faculty.ts but NOT in vitapfaculty ({len(not_in_api)}):")
for e in not_in_api:
    print(f"  Name: {e['name']}")
    print(f"  ID:   {e['id']}")
    print()
