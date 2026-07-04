with open('../src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    content = f.read()

new_content = content.replace('"name": "Dr. Ranjan Kumar"', '"name": "Dr. Naveen Kumar Ranjan"')

with open('../src/app/showFaculty/query_faculty.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Renamed Ranjan Kumar")
