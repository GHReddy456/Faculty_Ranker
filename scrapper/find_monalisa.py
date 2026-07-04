import json, re
with open('../src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    content = f.read()
match = re.search(r'export const queryFacultyData: FacultyQueryData\[\] = (\[.*?\]);', content, re.DOTALL)
data = json.loads(match.group(1))
for f in data:
    if 'monalisa' in f['name'].lower() or 'sahu' in f['name'].lower():
        print(json.dumps(f, indent=2))
