import re

with open('src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    content = f.read()

matches = re.finditer(r'\{[^{}]*?"name":\s*"[^"]*Ranjan[^"]*"[^{}]*?\}', content, flags=re.DOTALL)
for m in matches:
    print(m.group(0))

matches2 = re.finditer(r'\{[^{}]*?"name":\s*"[^"]*Manimaran[^"]*"[^{}]*?\}', content, flags=re.DOTALL)
for m in matches2:
    print(m.group(0))
