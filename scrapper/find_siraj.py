import re

with open('../src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    content = f.read()

matches = list(re.finditer(r'\{[^{}]*?"name":\s*"Dr\. Mohammad Sirajuddin"[^{}]*?\}', content, flags=re.DOTALL))
for i, m in enumerate(matches):
    print(f"--- Match {i+1} ---")
    print(m.group(0))
    print()
