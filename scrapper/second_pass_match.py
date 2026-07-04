"""
Second pass: even for the 69 'unmatched' faculty, try to find their image in api_data.json
using a broader word-by-word search on the image filename itself.
Also tries matching via partial last-name searching.
"""
import json, re

with open('api_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

with open('../src/data/faculty_details.json', 'r', encoding='utf-8') as f:
    details = json.load(f)

with open('image_url_map.json', 'r', encoding='utf-8') as f:
    image_url_map = json.load(f)

# Collect ALL api entries including their photo filename
api_all = []
for call in data:
    if 'data' in call and 'data' in call['data']:
        items = call['data']['data']
        if isinstance(items, list):
            for item in items:
                attrs = item.get('attributes', item)
                name = attrs.get('Name', '').strip()
                photo = attrs.get('Photo', {})
                img_url = ''
                if photo and photo.get('data'):
                    img_url = photo['data']['attributes'].get('url', '')
                if name:
                    api_all.append((name, attrs, img_url))

# Which TS names are still missing both details and images?
with open('../src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    ts_content = f.read()
ts_names = re.findall(r'"name":\s*"([^"]+)"', ts_content)

still_missing_details = [n for n in ts_names if n not in details]
still_missing_images = [n for n in ts_names if n not in image_url_map]

print(f"Still missing details: {len(still_missing_details)}")
print(f"Still missing images: {len(still_missing_images)}")

def clean(name):
    n = name.lower()
    n = re.sub(r'dr\.?\s*|ms\.?\s*|mr\.?\s*', '', n)
    n = re.sub(r'[^a-z\s]', ' ', n)
    n = re.sub(r'\s+', ' ', n).strip()
    return n

# Try to find matches for the unmatched ones
new_details = 0
new_images = 0

for ts_name in still_missing_details:
    ts_clean = clean(ts_name)
    ts_words = set(w for w in ts_clean.split() if len(w) > 2)
    
    best_score = 0
    best_match = None
    for api_name, attrs, img_url in api_all:
        api_clean = clean(api_name)
        api_words = set(w for w in api_clean.split() if len(w) > 2)
        
        common = ts_words & api_words
        if len(common) >= 2:  # at least 2 significant words match
            score = len(common) / max(len(ts_words), len(api_words), 1)
            if score > best_score:
                best_score = score
                best_match = (api_name, attrs, img_url)
    
    if best_match and best_score >= 0.6:
        api_name, attrs, img_url = best_match
        print(f"Matched: {repr(ts_name)} -> {repr(api_name)} (score={best_score:.2f})")
        
        # Add to details
        details[ts_name] = {
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
        new_details += 1
        
        if img_url and ts_name not in image_url_map:
            image_url_map[ts_name] = img_url
            new_images += 1

print(f"\nNew details found: {new_details}")
print(f"New images found: {new_images}")

# Save updated files
with open('../src/data/faculty_details.json', 'w', encoding='utf-8') as f:
    json.dump(details, f, indent=2, ensure_ascii=False)

with open('image_url_map.json', 'w', encoding='utf-8') as f:
    json.dump(image_url_map, f, indent=2, ensure_ascii=False)

print(f"\nFinal faculty_details.json: {len(details)} entries")
print(f"Final image_url_map.json: {len(image_url_map)} entries")
