"""
Patch image_url in query_faculty.ts with the official S3 URLs from VIT-AP API.
Only updates faculty that have a matched image URL.
"""
import json
import re

with open('image_url_map.json', 'r', encoding='utf-8') as f:
    image_url_map = json.load(f)

with open('../src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    content = f.read()

updated = 0
skipped = 0

def replace_image(match):
    global updated, skipped
    block = match.group(0)
    
    # Extract name from the block
    name_match = re.search(r'"name":\s*"([^"]+)"', block)
    if not name_match:
        skipped += 1
        return block
    
    ts_name = name_match.group(1)
    if ts_name not in image_url_map:
        skipped += 1
        return block
    
    new_url = image_url_map[ts_name]
    
    # Replace the image_url value
    new_block = re.sub(
        r'("image_url":\s*)"[^"]*"',
        f'\\1"{new_url}"',
        block
    )
    
    if new_block != block:
        updated += 1
    else:
        skipped += 1
    
    return new_block

# Match each faculty object block (from { to the next },)
new_content = re.sub(
    r'\{\s*"name":[^}]+\}',
    replace_image,
    content,
    flags=re.DOTALL
)

with open('../src/app/showFaculty/query_faculty.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Done! Updated {updated} image URLs, skipped {skipped}")
