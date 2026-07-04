import re

with open('../src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Sample a few faculty with their image URLs
blocks = re.findall(r'\{[^{}]+\}', content, re.DOTALL)
print(f'Total faculty blocks found: {len(blocks)}')

# Show first 3
for i, b in enumerate(blocks[:3]):
    name = re.search(r'"name":\s*"([^"]+)"', b)
    img = re.search(r'"image_url":\s*"([^"]+)"', b)
    if name and img:
        print(f'\n#{i+1}: {name.group(1)}')
        print(f'  img: {img.group(1)[:90]}')
