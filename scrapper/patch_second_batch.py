"""
Patches images from missing_specializations.json into query_faculty.ts
for entries that still have null image_url.
"""
import json
import re

# Load the results from the second scrape (has real image URLs)
with open('missing_specializations.json', 'r', encoding='utf-8') as f:
    extras = json.load(f)

def normalize(name):
    return name.lower().replace(' ', '').replace('.', '').replace('-', '')

# Build lookup by normalized name
extras_lookup = {normalize(k): v for k, v in extras.items()}

# Read query_faculty.ts
with open('../src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r'export const queryFacultyData: FacultyQueryData\[\] = (\[.*?\]);', content, re.DOTALL)
if not match:
    print("ERROR: Could not find queryFacultyData array!")
    exit(1)

faculty_json_str = match.group(1)
faculty_list = json.loads(faculty_json_str)

updated = 0
for f in faculty_list:
    key = normalize(f.get('name', ''))
    extra = extras_lookup.get(key)
    if not extra:
        continue

    changed = False
    if not f.get('image_url') and extra.get('image_url'):
        f['image_url'] = extra['image_url']
        changed = True
    if not f.get('specialization') and extra.get('specialization'):
        f['specialization'] = extra['specialization']
        changed = True

    if changed:
        updated += 1
        print(f"Updated: {f['name']}")

print(f"\nTotal updated: {updated}")

# Write back
new_json_str = json.dumps(faculty_list, indent=2, ensure_ascii=False)
new_content = content.replace(faculty_json_str, new_json_str)

with open('../src/app/showFaculty/query_faculty.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done!")

# Final stats
missing_images = sum(1 for f in faculty_list if not f.get('image_url'))
missing_spec = sum(1 for f in faculty_list if not f.get('specialization'))
print(f"\nFinal missing images: {missing_images}")
print(f"Final missing specializations: {missing_spec}")
if missing_images:
    print("Faculty still missing images:")
    for f in faculty_list:
        if not f.get('image_url'):
            print(f"  - {f['name']}")
if missing_spec:
    print("Faculty still missing specializations:")
    for f in faculty_list:
        if not f.get('specialization'):
            print(f"  - {f['name']}")
