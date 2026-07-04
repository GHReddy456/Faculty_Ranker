import asyncio
from playwright.async_api import async_playwright

async def find_bandaru():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        await page.goto("https://vitap.ac.in/allfaculty", wait_until="networkidle")
        await page.wait_for_timeout(3000)
        
        # Click "Load More" repeatedly until we find him
        print("Searching for Bandaru Ramakrishna...")
        
        # We can also just search the Next.js state
        next_data = await page.evaluate("() => document.getElementById('__NEXT_DATA__') ? document.getElementById('__NEXT_DATA__').textContent : null")
        if next_data:
            with open("next_state.json", "w", encoding="utf-8") as f:
                f.write(next_data)
            print("Saved next_state.json")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(find_bandaru())
