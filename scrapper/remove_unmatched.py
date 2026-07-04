import re, json

with open('../src/data/faculty_details.json', 'r', encoding='utf-8') as f:
    details = json.load(f)
matched_ids = set(details.keys())

with open('../src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to remove objects from the array.
# The structure is: export const queryFacultyData = [ { ... }, { ... } ];
# Finding all objects inside the array:
matches = re.finditer(r'(\s*\{[^{}]*?"id":\s*"([^"]+)"[^{}]*?\}(?:,)?)(?=\s*\{|\s*\])', content, flags=re.DOTALL)

new_content = content
removed_count = 0
for m in reversed(list(matches)):
    block = m.group(1)
    fid = m.group(2)
    
    if fid not in matched_ids:
        # Remove this block entirely
        new_content = new_content[:m.start()] + new_content[m.end():]
        removed_count += 1

print(f'Removed {removed_count} faculty members.')

with open('../src/app/showFaculty/query_faculty.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)
