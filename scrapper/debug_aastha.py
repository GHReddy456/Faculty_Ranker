import json, re

with open('../src/data/faculty_details.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

# Check what keys contain "Aastha"
aastha_keys = [k for k in d.keys() if 'aastha' in k.lower() or 'aastha' in str(d[k]).lower()]
print("Keys with Aastha:", aastha_keys)

# Check what keys contain "Madonna"
madonna_keys = [k for k in d.keys() if 'madonna' in k.lower()]
print("Keys with Madonna:", madonna_keys)

# Load query_faculty.ts and find Aastha's ID
with open('../src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    ts = f.read()

blocks = re.findall(r'\{[^{}]+\}', ts, re.DOTALL)
for b in blocks:
    name_m = re.search(r'"name":\s*"([^"]+)"', b)
    id_m   = re.search(r'"id":\s*"([^"]+)"', b)
    if name_m and 'aastha' in name_m.group(1).lower():
        print(f"\nQuery faculty entry:")
        print(f"  name: {name_m.group(1)}")
        print(f"  id: {id_m.group(1) if id_m else 'NOT FOUND'}")
