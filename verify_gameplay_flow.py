from playwright.sync_api import sync_playwright

def verify_gameplay_flow():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to home page...")
            page.goto("http://localhost:3000")

            print("Creating room...")
            page.click("text=Tạo Phòng")
            page.fill("input[placeholder='Nhập tên bạn...']", "GameplayTester")
            page.click("text=🚀 BẮT ĐẦU NGAY")

            page.wait_for_selector("text=Room ID", timeout=10000)
            page.click("text=START GAME")

            page.wait_for_selector("text=Draw Pile", timeout=10000)
            print("Game Board loaded.")
            page.wait_for_timeout(4000) # Wait for dealing

            # 1. Test Selection
            print("Testing Selection...")
            # Click first card
            cards = page.locator(".relative.flex-none.w-36.h-52")
            if cards.count() > 0:
                cards.nth(0).click()
                # Check for "PLAY 1 CARD" button
                play_btn = page.locator("text=Play 1 Card")
                if play_btn.is_visible():
                    print("Selection triggered Play button.")
                else:
                    print("FAILURE: Play button not visible.")

            # 2. Test Play Action (Untargeted)
            # Assuming first card is playable (might fail if it's Defuse/Nope but we can try)
            # Actually, "Play" button is visible, let's click it.
            if play_btn.is_visible():
                play_btn.click()
                # Should trigger Nope timer state?
                # We can check if pendingAction is set by seeing if "Play" button disappears or Nope button enables
                page.wait_for_timeout(500)
                nope_btn = page.locator("button:has-text('NOPE')")
                # Nope button might be disabled if I don't have a Nope card, but it should be visible.
                if nope_btn.is_visible():
                    print("Nope button visible.")

            page.screenshot(path="verification_gameplay.png")
            print("Screenshot saved.")

        except Exception as e:
            print(f"Error occurred: {e}")
            page.screenshot(path="verification_error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_gameplay_flow()
