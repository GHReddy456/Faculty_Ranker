import json, re

def normalize(name):
    n = name.lower()
    n = re.sub(r'dr\.?\s*|ms\.?\s*|mr\.?\s*', '', n)
    n = re.sub(r'[^a-z\s]', ' ', n)
    n = re.sub(r'\s+', ' ', n).strip()
    return n

print("Loading api_data.json...")
with open('api_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

api_faculty = []
api_by_name = {}
api_by_norm = {}

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
                    api_faculty.append((name, attrs, img_url))
                    api_by_name[name] = (attrs, img_url)
                    api_by_norm[normalize(name)] = (name, attrs, img_url)

with open('../src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    ts_content = f.read()

blocks = re.findall(r'\{[^{}]+\}', ts_content, re.DOTALL)
ts_faculty = []
for b in blocks:
    name_m = re.search(r'"name":\s*"([^"]+)"', b)
    id_m   = re.search(r'"id":\s*"([^"]+)"', b)
    if name_m and id_m:
        ts_faculty.append({'name': name_m.group(1), 'id': id_m.group(1)})

def build_detail(attrs):
    return {
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

faculty_details = {}
image_url_map = {}
matched = 0
unmatched = []

known_overrides = {
    "Ms. Kirtika Sahu": "Ms. Kritika Sahu",
    "Dr. M M Venkata Chalapthi": "Dr. M M Venkata Chalapathi",
    "Dr. Sukara Kalyani": "Dr. Sunkara Kalyani",
    "Dr. Y Mohamed Sirajudeen": "Dr. Mohammad Sirajuddin"
}

for fac in ts_faculty:
    ts_name = fac['name']
    ts_id   = fac['id']
    ts_norm = normalize(ts_name)
    
    # 0. Manual Typo Overrides
    if ts_name in known_overrides:
        api_name_target = known_overrides[ts_name]
        attrs, img_url = api_by_name[api_name_target]
        faculty_details[ts_id] = build_detail(attrs)
        faculty_details[ts_id]['_name'] = ts_name
        if img_url:
            image_url_map[ts_name] = img_url
        matched += 1
        continue

    # a. Exact match
    if ts_name in api_by_name:
        attrs, img_url = api_by_name[ts_name]
        faculty_details[ts_id] = build_detail(attrs)
        faculty_details[ts_id]['_name'] = ts_name
        if img_url:
            image_url_map[ts_name] = img_url
        matched += 1
        continue

    # b. Normalized match
    if ts_norm in api_by_norm:
        api_name, attrs, img_url = api_by_norm[ts_norm]
        faculty_details[ts_id] = build_detail(attrs)
        faculty_details[ts_id]['_name'] = ts_name
        if img_url:
            image_url_map[ts_name] = img_url
        matched += 1
        continue

    # c. Word fuzzy match
    ts_words = set(w for w in ts_norm.split() if len(w) > 2)
    best_score = 0
    best_match = None
    for api_name, attrs, img_url in api_faculty:
        api_norm = normalize(api_name)
        api_words = set(w for w in api_norm.split() if len(w) > 2)
        common = ts_words & api_words
        if len(common) >= 2:
            score = len(common) / max(len(ts_words), len(api_words), 1)
            if score > best_score:
                best_score = score
                best_match = (api_name, attrs, img_url)

    if best_match and best_score >= 0.55:
        api_name, attrs, img_url = best_match
        faculty_details[ts_id] = build_detail(attrs)
        faculty_details[ts_id]['_name'] = ts_name
        if img_url:
            image_url_map[ts_name] = img_url
        matched += 1
        continue
        
    # d. Subset match (only if exactly 1 match to avoid false positives)
    subset_matches = []
    for api_name, attrs, img_url in api_faculty:
        api_norm = normalize(api_name)
        api_w = set(w for w in api_norm.split() if len(w) > 2)
        if len(api_w) == 0 or len(ts_words) == 0:
            continue
        if api_w.issubset(ts_words) or ts_words.issubset(api_w):
            subset_matches.append((api_name, attrs, img_url))
            
    if len(subset_matches) == 1:
        api_name, attrs, img_url = subset_matches[0]
        faculty_details[ts_id] = build_detail(attrs)
        faculty_details[ts_id]['_name'] = ts_name
        if img_url:
            image_url_map[ts_name] = img_url
        matched += 1
    else:
        unmatched.append(ts_name)

print(f"\nMatched: {matched}/{len(ts_faculty)}")
print(f"Unmatched: {len(unmatched)}")
print("Unmatched:")
for u in unmatched:
    print(f"  - {repr(u)}")

# ---- Save ----
with open('../src/data/faculty_details.json', 'w', encoding='utf-8') as f:
    json.dump(faculty_details, f, indent=2, ensure_ascii=False)

with open('image_url_map.json', 'w', encoding='utf-8') as f:
    json.dump(image_url_map, f, indent=2, ensure_ascii=False)

print(f"\nSaved faculty_details.json with {len(faculty_details)} entries (keyed by Firestore ID)")
