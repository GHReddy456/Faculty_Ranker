import json, re
with open('../src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    content = f.read()
match = re.search(r'export const queryFacultyData: FacultyQueryData\[\] = (\[.*?\]);', content, re.DOTALL)
data = json.loads(match.group(1))
p28 = [f for f in data if f.get('partition_number') == 28]
print(f'Partition 28 faculty count: {len(p28)}')
for f in p28[:10]:
    print(f"  id: {repr(f['id'])} | name: {f['name']}")
