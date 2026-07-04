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
                if name:
                    api_faculty.append((name, attrs))
                    api_by_name[name] = attrs
                    api_by_norm[normalize(name)] = (name, attrs)

with open('../src/app/showFaculty/query_faculty.ts', 'r', encoding='utf-8') as f:
    ts_content = f.read()

blocks = re.findall(r'\{[^{}]+\}', ts_content, re.DOTALL)
ts_faculty = []
for b in blocks:
    name_m = re.search(r'"name":\s*"([^"]+)"', b)
    if name_m:
        ts_faculty.append(name_m.group(1))

unmatched = []

for ts_name in ts_faculty:
    ts_norm = normalize(ts_name)
    if ts_name in api_by_name or ts_norm in api_by_norm:
        continue
    
    # Try fuzzy match
    ts_words = set(w for w in ts_norm.split() if len(w) > 2)
    best_score = 0
    best_match = None
    for api_name, attrs in api_faculty:
        api_norm = normalize(api_name)
        api_words = set(w for w in api_norm.split() if len(w) > 2)
        common = ts_words & api_words
        if len(common) >= 2:
            score = len(common) / max(len(ts_words), len(api_words), 1)
            if score > best_score:
                best_score = score
                best_match = api_name

    if best_match and best_score >= 0.55:
        continue
    
    # Subset matching
    # If all words of one name are present in another (e.g. "Manimaran" in "Manimaran Aridoss")
    found_aggressive = None
    for api_name, attrs in api_faculty:
        api_norm = normalize(api_name)
        api_w = set(w for w in api_norm.split() if len(w) > 2)
        
        if len(api_w) == 0 or len(ts_words) == 0:
            continue
            
        # Is api_w a strict subset of ts_words or vice-versa?
        if api_w.issubset(ts_words) or ts_words.issubset(api_w):
            found_aggressive = api_name
            break
            
    if found_aggressive:
        print(f"[SUBSET] {ts_name} -> {found_aggressive}")
    else:
        unmatched.append(ts_name)
        
print(f"Still unmatched: {len(unmatched)}")
