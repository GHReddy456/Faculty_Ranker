import re

with open('../src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Use EXACT Firestore IDs to remove - safest, no name ambiguity
# (IDs obtained from get_dupe_ids.py / find_extras.py earlier)
ids_to_remove = {
    '5i5VicVgMLRiUdcRsrvj',        # Dr. Anil Vithalrao Turukmane
    'DKvploEjb8TBcqIpGco1',        # Dr. Ramesh Vatambeti
    'hOUYJGn8vzWefaQ1LRCo',        # Dr. Shobhit Kumar Srivastav
    'fuGcJyKP6hGzq9IxSUu1',        # Dr. Sunil Kumar Singh
    'vvfhMb5qtOJAjVRNVATb',        # Dr.S.Manimaran
    'VdcABTbe3lu822N2y9Xx',        # Mr. Asish Kumar Dalai
    'ZRkMEPuIxT9XaDVw8Blz',        # Mr. Pranav Anand Ojha
    'tFcF4M9RJV0L7FzZHwnD',        # Dr. Kolluri Rajesh
    'Wu46V7ifz3AJ737nJ7t2',        # Dr. Nihar Ranjan Pradhan
    'Dr.Chilukamari Rajesh',        # Dr.Chilukamari Rajesh
    'Dr. Aswathy M',               # Dr. Aswathy M
    'Mr. Venkata Bhikshapathi Chenam', # Mr. Venkata Bhikshapathi Chenam
    'Mr. Srinivas Arukonda',        # Mr. Srinivas Arukonda
}

# Rename: Ranjan Kumar -> Naveen Kumar Ranjan (ID: 8qcmWqwugi6l2Le9GrJQ)
rename_id = '8qcmWqwugi6l2Le9GrJQ'
rename_to = 'Dr. Naveen Kumar Ranjan'

matches = list(re.finditer(
    r'(,?\s*\{[^{}]*?"id":\s*"([^"]+)"[^{}]*?\})',
    content, flags=re.DOTALL
))

new_content = content
removed = []
renamed = []

for m in reversed(matches):
    block = m.group(1)
    fid = m.group(2)

    if fid in ids_to_remove:
        name_m = re.search(r'"name":\s*"([^"]+)"', block)
        name = name_m.group(1) if name_m else fid
        new_content = new_content[:m.start()] + new_content[m.end():]
        removed.append(name)
    elif fid == rename_id:
        name_m = re.search(r'"name":\s*"([^"]+)"', block)
        old_name = name_m.group(1) if name_m else fid
        new_block = block.replace(f'"name": "{old_name}"', f'"name": "{rename_to}"')
        new_content = new_content[:m.start()] + new_block + new_content[m.end():]
        renamed.append(f'{old_name} -> {rename_to}')

print(f"Removed ({len(removed)}):")
for n in removed:
    print(f"  - {n}")
print(f"\nRenamed ({len(renamed)}):")
for n in renamed:
    print(f"  - {n}")

with open('../src/app/showFaculty/query_faculty.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("\nDone.")
