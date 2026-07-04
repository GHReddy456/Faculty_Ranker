import json

with open('api_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Find the correct Sirajuddin's full attrs
correct_attrs = None
for call in data:
    if 'data' in call and 'data' in call['data']:
        items = call['data']['data']
        if isinstance(items, list):
            for item in items:
                attrs = item.get('attributes', item)
                name = attrs.get('Name', '')
                if name == 'Dr. Mohammad Sirajuddin':
                    correct_attrs = attrs
                    break

if not correct_attrs:
    print("ERROR: Could not find in API")
    exit(1)

print("Found:", correct_attrs.get('Name'))
print("Spec:", correct_attrs.get('Research_area_of_specialization'))

detail = {
    "_name": "Dr. Mohammad Sirajuddin",
    "designation": correct_attrs.get("Designation") or "",
    "department": correct_attrs.get("Department") or "",
    "email": correct_attrs.get("EMAIL") or "",
    "office_address": correct_attrs.get("Office_Address") or "",
    "contact_no": str(correct_attrs.get("Contact_No") or ""),
    "education": {
        "ug": correct_attrs.get("Education_UG") or "",
        "pg": correct_attrs.get("Education_PG") or "",
        "phd": correct_attrs.get("Education_PHD") or "",
        "other": correct_attrs.get("Education_other") or ""
    },
    "research": {
        "area": correct_attrs.get("Research_area_of_specialization") or "",
        "google_scholar": correct_attrs.get("Research_google_schloar") or "",
        "orcid": str(correct_attrs.get("Research_orchid") or ""),
        "scopus": str(correct_attrs.get("Research_Scopus_Id") or ""),
        "vidwan": correct_attrs.get("Research_vidwan") or "",
        "research_gate": correct_attrs.get("Research_Research_Gate") or ""
    },
    "linkedin": correct_attrs.get("LinkedIn") or "",
    "patents": correct_attrs.get("Patents", []),
    "projects": correct_attrs.get("Projects", []),
    "awards": correct_attrs.get("Awards_and_Recognitions", [])
}

with open('../src/data/faculty_details.json', 'r', encoding='utf-8') as f:
    details = json.load(f)

# Remove the old wrong entry (keyed by old Firebase ID) if it exists
old_id = 'ayuOqFksfJgitQjbOu89'
if old_id in details:
    del details[old_id]
    print(f"Removed wrong entry: {old_id}")

# Add the correct entry keyed by the new ID (name-based, as the entry is now in partition_number=28 format)
details['Dr. Mohammad Sirajuddin'] = detail
print("Added correct Sirajuddin to faculty_details.json")

with open('../src/data/faculty_details.json', 'w', encoding='utf-8') as f:
    json.dump(details, f, indent=2, ensure_ascii=False)

print("Done!")
