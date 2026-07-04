import re
code = open('src/app/showFaculty/query_faculty.ts', encoding='utf-8').read()
ids = re.findall(r'"id":\s*"([^"]+)"', code)
name_ids = [i for i in ids if ' ' in i]
print(f'Name-based IDs: {len(name_ids)}')
for i in name_ids:
    print(f'  - {repr(i)}')
