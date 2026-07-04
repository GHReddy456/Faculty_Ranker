import re

with open('src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace multiple commas with a single comma
new_content = re.sub(r',\s*,+', ',', content)

# Remove comma right after [
new_content = re.sub(r'\[\s*,', '[', new_content)

# Remove comma right before ]
new_content = re.sub(r',\s*\]', ']', new_content)

with open('src/app/showFaculty/query_faculty.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Cleaned extra commas!")
