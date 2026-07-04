import re

with open('../src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Blocks to DELETE completely
delete_names = [
    'Ms. Kritika Sahu',
    'Dr. Manimaran',
    'Dr. M M Venkata Chalapathi',
    'Dr. Sukara Kalyani',
    'Dr. Mohammad Sirajuddin'
]

# 2. Blocks to RENAME
rename_map = {
    'Ms. Kirtika Sahu': 'Ms. Kritika Sahu',
    'Dr. Manimaran Aridoss': 'Dr. Manimaran',
    'Dr. M M Venkata Chalapthi': 'Dr. M M Venkata Chalapathi',
    'Dr. Y Mohamed Sirajudeen': 'Dr. Mohammad Sirajuddin'
}

matches = list(re.finditer(r'(\s*\{[^{}]*?"name":\s*"([^"]+)"[^{}]*?\}(?:,)?)(?=\s*\{|\s*\])', content, flags=re.DOTALL))

new_content = content
for m in reversed(matches):
    block = m.group(1)
    name = m.group(2)
    
    if name in delete_names:
        # Delete block
        new_content = new_content[:m.start()] + new_content[m.end():]
        print(f"Deleted: {name}")
    elif name in rename_map:
        # Rename block
        new_name = rename_map[name]
        new_block = block.replace(f'"name": "{name}"', f'"name": "{new_name}"')
        new_content = new_content[:m.start()] + new_block + new_content[m.end():]
        print(f"Renamed: {name} -> {new_name}")

with open('../src/app/showFaculty/query_faculty.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)
