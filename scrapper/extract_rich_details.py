import json
import os

def run():
    print("Loading api_data.json...")
    with open('api_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    faculty_details = {}

    for call in data:
        if 'data' in call and 'data' in call['data']:
            items = call['data']['data']
            if isinstance(items, list):
                for item in items:
                    attrs = item.get('attributes', item)
                    name = attrs.get('Name', attrs.get('name', ''))
                    if not name:
                        continue
                    
                    # Clean the name to exactly match what's in query_faculty.ts
                    name = name.strip()

                    # Extract all the requested fields
                    details = {
                        "designation": attrs.get("Designation") or "",
                        "department": attrs.get("Department") or "",
                        "email": attrs.get("EMAIL") or "",
                        "office_address": attrs.get("Office_Address") or "",
                        "contact_no": attrs.get("Contact_No") or "",
                        "education": {
                            "ug": attrs.get("Education_UG") or "",
                            "pg": attrs.get("Education_PG") or "",
                            "phd": attrs.get("Education_PHD") or "",
                            "other": attrs.get("Education_other") or ""
                        },
                        "research": {
                            "area": attrs.get("Research_area_of_specialization") or "",
                            "google_scholar": attrs.get("Research_google_schloar") or "",
                            "orcid": attrs.get("Research_orchid") or "",
                            "scopus": attrs.get("Research_Scopus_Id") or "",
                            "vidwan": attrs.get("Research_vidwan") or "",
                            "research_gate": attrs.get("Research_Research_Gate") or ""
                        },
                        "linkedin": attrs.get("LinkedIn") or "",
                        "patents": attrs.get("Patents", []),
                        "projects": attrs.get("Projects", []),
                        "awards": attrs.get("Awards_and_Recognitions", [])
                    }

                    faculty_details[name] = details

    # Save to src/data/faculty_details.json
    out_dir = '../src/data'
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'faculty_details.json')
    
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(faculty_details, f, indent=2, ensure_ascii=False)
        
    print(f"Saved rich details for {len(faculty_details)} faculty members to {out_path}!")

if __name__ == '__main__':
    run()
