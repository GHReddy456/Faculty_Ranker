"""
This script:
1. Loads all API data from api_data.json (500 faculty)
2. Loads current query_faculty.ts names (577 faculty)
3. Performs fuzzy name matching to find missing faculty in the API
4. Re-generates faculty_details.json with ALL matched faculty
5. Also generates a name->image_url map for use in patching query_faculty.ts
"""
import json
import re

def normalize(name):
    """Normalize a name for fuzzy matching"""
    n = name.lower()
    n = re.sub(r'dr\.?\s*', '', n)
    n = re.sub(r'\s+', ' ', n).strip()
    return n

# ---- 1. Load API data ----
print("Loading api_data.json...")
with open('api_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

api_faculty = {}  # name -> full attrs
for call in data:
    if 'data' in call and 'data' in call['data']:
        items = call['data']['data']
        if isinstance(items, list):
            for item in items:
                attrs = item.get('attributes', item)
                name = attrs.get('Name', '').strip()
                if name:
                    api_faculty[name] = attrs

print(f"API faculty loaded: {len(api_faculty)}")

# ---- 2. Load query_faculty.ts names ----
with open('../src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    ts_content = f.read()

ts_names = re.findall(r'"name":\s*"([^"]+)"', ts_content)
print(f"query_faculty.ts names: {len(ts_names)}")

# ---- 3. Build normalized lookup from API ----
normalized_api = {}
for api_name, attrs in api_faculty.items():
    normalized_api[normalize(api_name)] = (api_name, attrs)

# ---- 4. Match each TS name to an API faculty ----
matched = {}
image_url_map = {}  # ts_name -> s3 image_url
unmatched = []

for ts_name in ts_names:
    # Exact match first
    if ts_name in api_faculty:
        matched[ts_name] = api_faculty[ts_name]
        img = api_faculty[ts_name].get('Photo', {})
        if img and img.get('data'):
            url = img['data']['attributes'].get('url', '')
            if url:
                image_url_map[ts_name] = url
        continue
    
    # Normalized fuzzy match
    ts_norm = normalize(ts_name)
    if ts_norm in normalized_api:
        api_name, attrs = normalized_api[ts_norm]
        matched[ts_name] = attrs
        img = attrs.get('Photo', {})
        if img and img.get('data'):
            url = img['data']['attributes'].get('url', '')
            if url:
                image_url_map[ts_name] = url
        continue

    # Partial word match (all significant words must be in the api name)
    ts_words = [w for w in ts_norm.split() if len(w) > 3]
    best = None
    for norm_api_name, (api_name, attrs) in normalized_api.items():
        if all(w in norm_api_name for w in ts_words):
            best = (api_name, attrs)
            break
    
    if best:
        api_name, attrs = best
        matched[ts_name] = attrs
        img = attrs.get('Photo', {})
        if img and img.get('data'):
            url = img['data']['attributes'].get('url', '')
            if url:
                image_url_map[ts_name] = url
    else:
        unmatched.append(ts_name)

print(f"\nMatched: {len(matched)}")
print(f"Image URLs found: {len(image_url_map)}")
print(f"Unmatched: {len(unmatched)}")
print("Unmatched faculty (no API record):")
for u in unmatched:
    print(f"  - {repr(u)}")

# ---- 5. Build the faculty_details.json ----
faculty_details = {}
for ts_name, attrs in matched.items():
    details = {
        "designation": attrs.get("Designation") or "",
        "department": attrs.get("Department") or "",
        "email": attrs.get("EMAIL") or "",
        "office_address": attrs.get("Office_Address") or "",
        "contact_no": str(attrs.get("Contact_No") or ""),
        "education": {
            "ug": attrs.get("Education_UG") or "",
            "pg": attrs.get("Education_PG") or "",
            "phd": attrs.get("Education_PHD") or "",
            "other": attrs.get("Education_other") or ""
        },
        "research": {
            "area": attrs.get("Research_area_of_specialization") or "",
            "google_scholar": attrs.get("Research_google_schloar") or "",
            "orcid": str(attrs.get("Research_orchid") or ""),
            "scopus": str(attrs.get("Research_Scopus_Id") or ""),
            "vidwan": attrs.get("Research_vidwan") or "",
            "research_gate": attrs.get("Research_Research_Gate") or ""
        },
        "linkedin": attrs.get("LinkedIn") or "",
        "patents": attrs.get("Patents", []),
        "projects": attrs.get("Projects", []),
        "awards": attrs.get("Awards_and_Recognitions", [])
    }
    faculty_details[ts_name] = details

with open('../src/data/faculty_details.json', 'w', encoding='utf-8') as f:
    json.dump(faculty_details, f, indent=2, ensure_ascii=False)

print(f"\nSaved faculty_details.json with {len(faculty_details)} entries")

# ---- 6. Save image URL map for patching query_faculty.ts ----
with open('image_url_map.json', 'w', encoding='utf-8') as f:
    json.dump(image_url_map, f, indent=2, ensure_ascii=False)

print(f"Saved image_url_map.json with {len(image_url_map)} entries")
