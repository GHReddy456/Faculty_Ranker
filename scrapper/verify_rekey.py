import json, re

with open('../src/data/faculty_details.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

with open('../src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    ts = f.read()

blocks = re.findall(r'\{[^{}]+\}', ts, re.DOTALL)
for b in blocks[:6]:
    name_m = re.search(r'"name":\s*"([^"]+)"', b)
    id_m   = re.search(r'"id":\s*"([^"]+)"', b)
    if name_m and id_m:
        fid = id_m.group(1)
        in_json = fid in d
        print(f'{name_m.group(1)} | id={fid[:25]}... | in_json={in_json}')
        if in_json:
            print(f'  designation: {d[fid].get("designation", "")}')
