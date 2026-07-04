"""
Re-key faculty_details.json by the faculty's Firestore `id` from query_faculty.ts
instead of by name, so that page.tsx can look up by firebaseKey correctly.
"""
import json
import re

# Load query_faculty.ts to get name -> id mapping
with open('../src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Extract all faculty objects as {name, id} pairs
blocks = re.findall(r'\{[^{}]+\}', ts_content, re.DOTALL)
name_to_id = {}
for b in blocks:
    name_m = re.search(r'"name":\s*"([^"]+)"', b)
    id_m   = re.search(r'"id":\s*"([^"]+)"', b)
    if name_m and id_m:
        name_to_id[name_m.group(1)] = id_m.group(1)

print(f"Faculty in query_faculty.ts: {len(name_to_id)}")

# Load existing faculty_details.json (keyed by name)
with open('../src/data/faculty_details.json', 'r', encoding='utf-8') as f:
    details_by_name = json.load(f)

print(f"Entries in faculty_details.json: {len(details_by_name)}")

# Re-key by ID
details_by_id = {}
missing = []
for name, detail in details_by_name.items():
    fid = name_to_id.get(name)
    if fid:
        details_by_id[fid] = detail
        # Also store name for reference
        details_by_id[fid]['_name'] = name
    else:
        missing.append(name)
        # Fallback: store under name as well (for old format compatibility)
        details_by_id[name] = detail

print(f"Mapped by ID: {len(details_by_id) - len(missing)}")
print(f"Could not map (no id): {len(missing)}")
if missing[:5]:
    print("Examples:", missing[:5])

with open('../src/data/faculty_details.json', 'w', encoding='utf-8') as f:
    json.dump(details_by_id, f, indent=2, ensure_ascii=False)

print(f"\nSaved faculty_details.json with {len(details_by_id)} entries (keyed by Firestore ID)")
