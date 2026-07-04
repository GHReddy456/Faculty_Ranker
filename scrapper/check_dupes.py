import json
import re

with open('../src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    content = f.read()

names_to_check = [
    'Ms. Kirtika Sahu', 'Ms. Kritika Sahu',
    'Dr. Manimaran Aridoss', 'Dr. Manimaran',
    'Dr. M M Venkata Chalapthi', 'Dr. M M Venkata Chalapathi',
    'Dr. Sunkara Kalyani', 'Dr. Sukara Kalyani',
    'Dr. Y Mohamed Sirajudeen', 'Dr. Mohammad Sirajuddin'
]

blocks = re.findall(r'\{[^{}]+\}', content, re.DOTALL)
for name in names_to_check:
    found = False
    for b in blocks:
        name_m = re.search(r'"name":\s*"([^"]+)"', b)
        if name_m and name_m.group(1).lower() == name.lower():
            found = True
            break
    print(f'{name}: {"FOUND" if found else "NOT FOUND"}')
