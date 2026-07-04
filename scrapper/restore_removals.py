import re
import subprocess

# Get the HEAD version of the file
result = subprocess.run(['git', 'show', 'HEAD:src/app/showFaculty/query_faculty.ts'], capture_output=True, text=True, encoding='utf-8')
old_content = result.stdout

ids_to_restore = {
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

blocks = re.findall(r'\{[^{}]+\}', old_content, re.DOTALL)
blocks_to_add = []
for b in blocks:
    id_m = re.search(r'"id":\s*"([^"]+)"', b)
    if id_m and id_m.group(1) in ids_to_restore:
        blocks_to_add.append(b)

with open('../src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    current_content = f.read()

# Append the blocks to the end before ];
blocks_str = ',\n'.join(blocks_to_add)
if blocks_str:
    new_content = re.sub(r'(\s*\];?\s*$)', f',\n{blocks_str}\n\\1', current_content.rstrip(), count=1)
else:
    new_content = current_content

# Revert Ranjan Kumar
new_content = new_content.replace('"name": "Dr. Naveen Kumar Ranjan"', '"name": "Dr. Ranjan Kumar"')

# Clean up any trailing commas that might have been added if the array was empty (it's not)
with open('../src/app/showFaculty/query_faculty.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Restored {len(blocks_to_add)} blocks and reverted Ranjan Kumar.")
