"""
VIT-AP Faculty Scraper using Playwright (handles JavaScript-rendered pages).
Fetches all faculty from vitap.ac.in/allfaculty and exports to JSON.
"""
import asyncio
import json
import re
import sys
from playwright.async_api import async_playwright

TARGET_URL = "https://vitap.ac.in/allfaculty"
OUTPUT_FILE = "scraped_faculty.json"

async def scrape_faculty():
    print(f"Launching browser to scrape: {TARGET_URL}")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Intercept network requests to find the actual API call
        api_data = []

        async def handle_response(response):
            url = response.url
            # The VIT-AP site fetches from their CMS API
            if "cms.vitap.ac.in" in url and "faculty" in url.lower():
                print(f"  -> Intercepted API call: {url}")
                try:
                    body = await response.json()
                    api_data.append({"url": url, "data": body})
                except Exception as e:
                    print(f"    Could not parse response: {e}")

        page.on("response", handle_response)

        print("Navigating to page...")
        await page.goto(TARGET_URL, wait_until="networkidle", timeout=60000)

        # Wait extra time for dynamic content
        await page.wait_for_timeout(5000)

        # Try to extract faculty cards from the DOM
        print("Extracting faculty data from DOM...")
        faculty_from_dom = await page.evaluate("""
        () => {
            const results = [];
            // Try various selectors that VIT-AP might use for faculty cards
            const selectors = [
                '[class*="faculty"]',
                '[class*="Faculty"]', 
                '[class*="card"]',
                '[class*="profile"]',
                '[class*="member"]',
                'img[src*="vitap"]',
                'img[src*="wp-content"]',
                'img[src*="amazonaws"]',
            ];
            
            // Try to find all img elements with faculty-related src
            const imgs = document.querySelectorAll('img');
            const seen = new Set();
            
            imgs.forEach(img => {
                const src = img.src || img.getAttribute('src') || '';
                if (!src || seen.has(src)) return;
                
                // Look for faculty image patterns
                if (src.includes('wp-content/uploads') || src.includes('amazonaws.com')) {
                    seen.add(src);
                    
                    // Try to find the name near this image
                    let name = img.alt || '';
                    let specialization = '';
                    
                    // Look at parent elements for text
                    let parent = img.parentElement;
                    for (let i = 0; i < 6; i++) {
                        if (!parent) break;
                        const text = parent.innerText || parent.textContent || '';
                        const lines = text.split('\\n').map(s => s.trim()).filter(s => s);
                        if (lines.length >= 2) {
                            name = lines[0] || name;
                            specialization = lines.slice(1).join(' ');
                            break;
                        }
                        parent = parent.parentElement;
                    }
                    
                    results.push({
                        name: name.trim(),
                        image_url: src,
                        specialization: specialization.trim()
                    });
                }
            });
            
            return results;
        }
        """)

        # Also try to get the page's internal state / props
        print("Attempting to extract Next.js page data...")
        nextjs_data = await page.evaluate("""
        () => {
            // Next.js stores initial data in __NEXT_DATA__
            const nextDataEl = document.getElementById('__NEXT_DATA__');
            if (nextDataEl) {
                try {
                    return JSON.parse(nextDataEl.textContent);
                } catch(e) {
                    return null;
                }
            }
            return null;
        }
        """)

        await browser.close()

        print(f"\nResults:")
        print(f"  API calls intercepted: {len(api_data)}")
        print(f"  Faculty from DOM: {len(faculty_from_dom)}")

        # Compile all results
        all_faculty = {}

        # Process API data (most reliable)
        for api_item in api_data:
            data = api_item.get("data", {})
            items = data.get("data", [])
            if isinstance(items, list):
                for item in items:
                    attrs = item.get("attributes", item)
                    name = attrs.get("Name", attrs.get("name", ""))
                    spec = attrs.get("Specialization", attrs.get("specialization", ""))
                    img_data = attrs.get("Profile_Image", attrs.get("image", {}))
                    img_url = ""
                    if isinstance(img_data, dict):
                        img_attrs = img_data.get("data", {})
                        if img_attrs:
                            img_attrs = img_attrs.get("attributes", {})
                            img_url = img_attrs.get("url", "")
                    if img_url and img_url.startswith("/"):
                        img_url = "https://cms.vitap.ac.in" + img_url
                    
                    if name:
                        all_faculty[name] = {
                            "name": name,
                            "specialization": spec,
                            "image_url": img_url,
                        }

        # Process DOM-extracted data
        for item in faculty_from_dom:
            name = item.get("name", "")
            if name and name not in all_faculty:
                all_faculty[name] = item

        # Process Next.js data
        if nextjs_data:
            print(f"\nNext.js __NEXT_DATA__ found! Keys: {list(nextjs_data.keys())}")
            # Save raw next data for inspection
            with open("nextjs_data.json", "w", encoding="utf-8") as f:
                json.dump(nextjs_data, f, indent=2, ensure_ascii=False)
            print("  Saved raw Next.js data to nextjs_data.json")

        # Save API data for inspection
        if api_data:
            with open("api_data.json", "w", encoding="utf-8") as f:
                json.dump(api_data, f, indent=2, ensure_ascii=False)
            print(f"  Saved raw API data to api_data.json")

        # Save final results
        final_list = list(all_faculty.values())
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(final_list, f, indent=2, ensure_ascii=False)

        print(f"\n✓ Total unique faculty found: {len(final_list)}")
        print(f"✓ Results saved to: {OUTPUT_FILE}")

        # Print first 5 for verification
        print("\nSample faculty:")
        for f in final_list[:5]:
            print(f"  - {f['name']} | {f['image_url'][:60]}...")

        return final_list

if __name__ == "__main__":
    asyncio.run(scrape_faculty())
