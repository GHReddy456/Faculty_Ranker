import json
import re

# Load the scraped API data
with open('api_data.json', 'r', encoding='utf-8') as f:
    api_raw = json.load(f)

cms_items = api_raw[0]['data']['data']
print(f"CMS API items: {len(cms_items)}")

# Build a lookup from name -> {image_url, specialization}
def normalize_name(name):
    return name.lower().replace(' ', '').replace('.', '').replace('-', '')

cms_lookup = {}
for item in cms_items:
    attrs = item['attributes']
    name = (attrs.get('Name') or '').strip()
    if not name:
        continue

    # Get image URL
    photo = attrs.get('Photo', {})
    photo_data = photo.get('data') if photo else None
    image_url = None
    if photo_data:
        image_url = photo_data.get('attributes', {}).get('url')

    # Get specialization
    specialization = attrs.get('Research_area_of_specialization') or None

    key = normalize_name(name)
    cms_lookup[key] = {
        'name': name,
        'image_url': image_url,
        'specialization': specialization
    }

print(f"CMS lookup entries: {len(cms_lookup)}")
print("Sample entries with images:", sum(1 for v in cms_lookup.values() if v['image_url']))

# Read query_faculty.ts
with open('../src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract the JSON array
match = re.search(r'export const queryFacultyData: FacultyQueryData\[\] = (\[.*?\]);', content, re.DOTALL)
if not match:
    print("ERROR: Could not find queryFacultyData array!")
    exit(1)

faculty_json_str = match.group(1)
faculty_list = json.loads(faculty_json_str)
print(f"\nFaculty in query_faculty.ts: {len(faculty_list)}")

# Update entries that have missing image_url or specialization
updated = 0
for f in faculty_list:
    key = normalize_name(f.get('name', ''))
    cms = cms_lookup.get(key)
    if not cms:
        continue

    changed = False
    if not f.get('image_url') and cms.get('image_url'):
        f['image_url'] = cms['image_url']
        changed = True
    if not f.get('specialization') and cms.get('specialization'):
        f['specialization'] = cms['specialization']
        changed = True

    if changed:
        updated += 1

print(f"Updated {updated} entries with new image/specialization data")

# Write back
new_json_str = json.dumps(faculty_list, indent=2, ensure_ascii=False)
new_content = content.replace(faculty_json_str, new_json_str)

with open('../src/app/showFaculty/query_faculty.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done! query_faculty.ts updated successfully.")

# Stats
missing_images = sum(1 for f in faculty_list if not f.get('image_url'))
missing_spec = sum(1 for f in faculty_list if not f.get('specialization'))
print(f"\nRemaining missing images: {missing_images}")
print(f"Remaining missing specializations: {missing_spec}")
