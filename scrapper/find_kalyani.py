import re
with open('../src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    content = f.read()

blocks = re.findall(r'(\{[^{}]+\})', content, re.DOTALL)
for b in blocks:
    name_m = re.search(r'"name":\s*"([^"]+)"', b)
    if name_m and 'kalyani' in name_m.group(1).lower():
        id_m = re.search(r'"id":\s*"([^"]+)"', b)
        print(f'{name_m.group(1)} : {id_m.group(1)}')
