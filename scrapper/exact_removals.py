import re

with open('../src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    content = f.read()

names_to_remove = [
    "Dr.Anil Vitthalrao Turukmane",
    "Dr. Ramesh Vatambeti",
    "Dr. Shobhit Kumar Srivastava",
    "Dr. Sunil Kumar Singh",
    "Dr. S. Manimaran",
    "Dr. Asish Kumar Dalai",
    "Dr. Pranav Anand Ojha",
    "Dr. Kolluri Rajesh",
    "Dr. Nihar Ranjan Nayak",
    "Dr.Chilukamari Rajesh",
    "Dr. Aswathy M",
    "Dr. Venkata Bhikshapathi Chenam",
    "Mr. Srinivas Arukonda"
]

matches = list(re.finditer(r'(,?\s*\{[^{}]*?"name":\s*"([^"]+)"[^{}]*?\})', content, flags=re.DOTALL))

new_content = content
removed = []

for m in reversed(matches):
    block = m.group(1)
    name = m.group(2)

    # EXACT string match
    if name in names_to_remove:
        new_content = new_content[:m.start()] + new_content[m.end():]
        removed.append(name)

print(f"Removed exactly ({len(removed)}):")
for n in removed:
    print(f"  - {n}")

with open('../src/app/showFaculty/query_faculty.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("\nDone exact removal.")
