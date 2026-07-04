import re

with open('src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    content = f.read()

ids_to_remove = ['8qcmWqwugi6l2Le9GrJQ', 'vvfhMb5qtOJAjVRNVATb']

matches = list(re.finditer(
    r'(,?\s*\{[^{}]*?"id":\s*"([^"]+)"[^{}]*?\})',
    content, flags=re.DOTALL
))

new_content = content
removed = []

for m in reversed(matches):
    block = m.group(1)
    fid = m.group(2)

    if fid in ids_to_remove:
        name_m = re.search(r'"name":\s*"([^"]+)"', block)
        name = name_m.group(1) if name_m else fid
        new_content = new_content[:m.start()] + new_content[m.end():]
        removed.append(name)

print(f"Removed ({len(removed)}):")
for n in removed:
    print(f"  - {n}")

with open('src/app/showFaculty/query_faculty.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("\nDone.")
