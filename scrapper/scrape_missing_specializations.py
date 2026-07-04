"""
Uses Playwright to scrape individual faculty profile pages from VIT-AP website
to fill in missing specialization data for faculty not covered by api_data.json.
"""

import asyncio
import json
import re
# pyrefly: ignore [missing-import]
from playwright.async_api import async_playwright

MISSING_FACULTY = [
    "Dr. Jagadish Chandra Mudiganti",
    "Dr. V R K Murty",
    "Dr. Khadheer Pasha Sk",
    "Dr. Anshul Gopal",
    "Dr.Habiba Khatun",
    "Dr. P Arulmozhivarman",
    "Dr. Rupa Chiramadasu",
    "Dr. Mithilesh Kumar Dubey",
    "Dr. Kiran Kumar Nallamekala",
    "Dr. K Uma Mahendra Kumar",
    "Dr. Amit Bhaskar",
    "Dr. Paritala Jhansirani",
    "Dr. Manimuthu A",
    "Dr. Pallepogu Prasanna Kumar",
    "Dr. Kadiyam Rajshekar",
    "Dr. Pranav Anand Ojha",
    "Dr. T Rama Thulasi",
    "Dr. K Aravind",
    "Dr. Shaik Moinuddin Ahmed",
    "Dr. Lanka Divya",
    "Dr. Kranthi Kumar Reddy Missal",
    "Dr. Balaraju Ramesh",
    "Dr. Siba Prasad Mishra",
    "Dr. Sonia Das",
    "Dr. Krishna Prasad Bera",
    "Dr. Anindita Roy",
    "Dr. Keerthi Jain Kushal Jain",
]

async def main():
    results = {}
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Intercept API calls
        api_data_map = {}
        
        async def handle_response(response):
            url = response.url
            if "cms.vitap.ac.in/api/faculty-profiles" in url:
                try:
                    data = await response.json()
                    items = data.get("data", []) if isinstance(data, dict) else []
                    for item in items:
                        attrs = item.get("attributes", {})
                        name = (attrs.get("Name") or "").strip()
                        spec = attrs.get("Research_area_of_specialization")
                        photo = attrs.get("Photo", {})
                        photo_data = photo.get("data") if photo else None
                        img = photo_data.get("attributes", {}).get("url") if photo_data else None
                        if name:
                            api_data_map[name.lower().replace(" ", "").replace(".", "")] = {
                                "name": name,
                                "specialization": spec,
                                "image_url": img
                            }
                except Exception as e:
                    pass
        
        page.on("response", handle_response)
        
        print("Loading VIT-AP faculty page...")
        await page.goto("https://vitap.ac.in/allfaculty", wait_until="networkidle")
        await page.wait_for_timeout(3000)
        
        # Try to load more by scrolling/clicking
        for i in range(20):
            try:
                btn = page.get_by_role("button", name=re.compile(r"load more|show more", re.IGNORECASE))
                if await btn.count() > 0:
                    await btn.click()
                    await page.wait_for_timeout(2000)
                else:
                    break
            except:
                break
        
        await page.wait_for_timeout(2000)
        print(f"Intercepted {len(api_data_map)} faculty from API")
        
        # Search for missing faculty by name
        for name in MISSING_FACULTY:
            key = name.lower().replace(" ", "").replace(".", "")
            if key in api_data_map:
                entry = api_data_map[key]
                results[name] = {
                    "specialization": entry.get("specialization"),
                    "image_url": entry.get("image_url")
                }
                print(f"FOUND: {name} -> {(entry.get('specialization') or '')[:60]}")
            else:
                print(f"NOT FOUND via API: {name}")
                results[name] = {"specialization": None, "image_url": None}
        
        await browser.close()
    
    # Save results
    with open("missing_specializations.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print("\nSaved to missing_specializations.json")

if __name__ == "__main__":
    asyncio.run(main())
