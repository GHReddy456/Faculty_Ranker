import re

with open('../src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the WRONG Cloud Computing Sirajuddin (id: ayuOqFksfJgitQjbOu89)
# It only appears once, so simple targeted removal
wrong_block_pattern = re.compile(
    r',?\s*\{\s*"name":\s*"Dr\. Mohammad Sirajuddin".*?"id":\s*"ayuOqFksfJgitQjbOu89".*?\}',
    flags=re.DOTALL
)
new_content, count = wrong_block_pattern.subn('', content)
print(f"Removed wrong Sirajuddin: {count} match(es)")

# 2. Insert the CORRECT Sirajuddin (Wireless Adhoc - from vitapfaculty) before the closing ]
correct_entry = """  {
    "name": "Dr. Mohammad Sirajuddin",
    "specialization": "Wireless Adhoc & Sensor Networks, Cyber Security, Edge & Fog Computing",
    "image_url": "https://vitap-backend.s3.ap-south-1.amazonaws.com/Dr_Mohammad_Sirajuddin_SCOPE_af96733760.avif",
    "partition_number": 28,
    "id": "Dr. Mohammad Sirajuddin"
  }"""

# Insert just before the final closing ];
new_content = re.sub(r'(\s*\];?\s*$)', f',\n{correct_entry}\n\\1', new_content.rstrip(), count=1)

with open('../src/app/showFaculty/query_faculty.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done! Correct Sirajuddin added.")
