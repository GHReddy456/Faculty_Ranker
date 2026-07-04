import json
import re

# Read query_faculty.ts
with open('c:\\Users\\harig\\OneDrive\\Desktop\\faculty-ranker-main\\src\\app\\showFaculty\\query_faculty.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract the JSON array
match = re.search(r'export const queryFacultyData: FacultyQueryData\[\] = (\[.*?\]);', content, re.DOTALL)
if not match:
    print("Could not find the queryFacultyData array in query_faculty.ts")
    exit(1)

faculty_json_str = match.group(1)
current_faculty = json.loads(faculty_json_str)

# Create a set of existing normalized names
existing_names = set()
for f in current_faculty:
    name = f.get('name', '').lower().replace(' ', '').replace('.', '')
    existing_names.add(name)

# Read scraped_faculty.json
with open('c:\\Users\\harig\\OneDrive\\Desktop\\faculty-ranker-main\\scrapper\\scraped_faculty.json', 'r', encoding='utf-8') as f:
    scraped_faculty = json.load(f)

# Find missing faculty
missing_faculty = []
max_partition = max(f.get('partition_number', 0) for f in current_faculty)

for sf in scraped_faculty:
    name = sf.get('name', '').strip()
    if not name: continue
    
    norm_name = name.lower().replace(' ', '').replace('.', '')
    if norm_name not in existing_names:
        # Avoid exact duplicates in the missing list
        if not any(mf['name'] == name for mf in missing_faculty):
            missing_faculty.append({
                "name": name,
                "specialization": sf.get('specialization', '') or None,
                "image_url": sf.get('image_url', '') or None,
                "partition_number": max_partition,
                "id": name
            })

print(f"Found {len(missing_faculty)} missing faculty.")

# Append to current_faculty
current_faculty.extend(missing_faculty)

# Write back to query_faculty.ts
new_json_str = json.dumps(current_faculty, indent=2, ensure_ascii=False)
# Fix indentation to match original
new_json_str = new_json_str.replace('\n', '\n  ')
new_content = content.replace(faculty_json_str, new_json_str)

with open('c:\\Users\\harig\\OneDrive\\Desktop\\faculty-ranker-main\\src\\app\\showFaculty\\query_faculty.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated query_faculty.ts successfully!")
