import json
import re

# Load query_faculty data (it has single-quoted strings we need to handle carefully)
with open('../src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract faculty names using the specific format in query_faculty.ts
names = re.findall(r'"name":\s*"([^"]+)"', content)
print(f'Total names in query_faculty.ts: {len(names)}')

# Load faculty_details.json
with open('../src/data/faculty_details.json', 'r', encoding='utf-8') as f:
    details = json.load(f)

print(f'Total keys in faculty_details.json: {len(details)}')

# Find which ones are missing from details
missing = [n for n in names if n not in details]
print(f'Missing in details: {len(missing)}')
print('First 20 missing:')
for n in missing[:20]:
    print(f'  - {repr(n)}')
