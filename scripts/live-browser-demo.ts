import { chromium } from "playwright";

const BASE_URL = "http://localhost:8080";

async function runLiveInteractiveSession() {
  console.log("=================================================================");
  console.log("LAUNCHING LIVE INTERACTIVE BROWSER SESSION ON YOUR SCREEN");
  console.log("=================================================================\n");

  let browser;
  try {
    browser = await chromium.launch({
      headless: false, // Opens visible browser on the user's screen
      slowMo: 700, // Human-like speed so the user can watch every action
      args: ["--start-maximized", "--no-sandbox"],
    });
  } catch (err: any) {
    try {
      browser = await chromium.launch({
        channel: "msedge",
        headless: false,
        slowMo: 700,
        args: ["--start-maximized"],
      });
    } catch (e: any) {
      console.error("Failed to launch visible browser:", e);
      process.exit(1);
    }
  }

  const context = await browser.newContext({
    viewport: null, // Full-screen window
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  try {
    // -------------------------------------------------------------
    // Step 1: Homepage & UI Polish
    // -------------------------------------------------------------
    console.log("▶ 1. Visiting Homepage...");
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    console.log("▶ Scrolling through Homepage sections...");
    await page.evaluate(() => window.scrollBy({ top: 600, behavior: "smooth" }));
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.scrollBy({ top: 800, behavior: "smooth" }));
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.scrollBy({ top: 800, behavior: "smooth" }));
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await page.waitForTimeout(1000);

    // Toggle English Language
    console.log("▶ Testing Language Switch to English...");
    const enBtn = await page.$('button:has-text("EN"), button:has-text("English")');
    if (enBtn) {
      await enBtn.click();
      await page.waitForTimeout(1500);

      // Toggle back to Arabic
      console.log("▶ Testing Language Switch back to Arabic...");
      const arBtn = await page.$(
        'button:has-text("عربي"), button:has-text("العربية"), button:has-text("AR")',
      );
      if (arBtn) {
        await arBtn.click();
        await page.waitForTimeout(1500);
      }
    }

    // -------------------------------------------------------------
    // Step 2: Interactive Family Tree
    // -------------------------------------------------------------
    console.log("▶ 2. Visiting Interactive Family Tree...");
    await page.goto(`${BASE_URL}/family-tree`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // Search in Family Tree
    const searchInput = await page.$('input[type="search"], input[placeholder*="بحث"]');
    if (searchInput) {
      console.log("▶ Searching in Family Tree for 'محمد'...");
      await searchInput.fill("محمد");
      await page.waitForTimeout(1500);
      await searchInput.fill("");
      await page.waitForTimeout(1000);
    }

    // -------------------------------------------------------------
    // Step 3: DNA Genetic Study
    // -------------------------------------------------------------
    console.log("▶ 3. Visiting DNA Studies...");
    await page.goto(`${BASE_URL}/dna`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollBy({ top: 500, behavior: "smooth" }));
    await page.waitForTimeout(1500);

    // -------------------------------------------------------------
    // Step 4: Official Member Digital ID Verification
    // -------------------------------------------------------------
    console.log("▶ 4. Visiting Digital ID Verification Certificate...");
    await page.goto(`${BASE_URL}/verify?id=ABO-001EF5`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // -------------------------------------------------------------
    // Step 5: Admin Login & Member Portal
    // -------------------------------------------------------------
    console.log("▶ 5. Logging in with Official Admin Credentials...");
    await page.goto(`${BASE_URL}/auth`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    console.log("▶ Entering Admin Email...");
    await page.fill('input[type="email"]', "admin@alboubaidfamily.com");
    await page.waitForTimeout(500);

    console.log("▶ Entering Admin Password...");
    await page.fill('input[type="password"]', "AlBuObaid#Admin2026!Hub");
    await page.waitForTimeout(500);

    console.log("▶ Submitting Sign In Form...");
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await page.waitForTimeout(3000);
    }

    // -------------------------------------------------------------
    // Step 6: Account & Digital ID Portal
    // -------------------------------------------------------------
    console.log("▶ 6. Exploring Member Account Portal (/account)...");
    await page.goto(`${BASE_URL}/account`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // Click digital card tab
    const cardTab = await page.$('[data-state][value="card"]');
    if (cardTab) {
      console.log("▶ Viewing Digital Membership Card & QR Code...");
      await cardTab.click();
      await page.waitForTimeout(1500);
    }

    // Click notifications tab
    const notifTab = await page.$('[data-state][value="notifications"]');
    if (notifTab) {
      console.log("▶ Viewing Notifications Center...");
      await notifTab.click();
      await page.waitForTimeout(1500);
    }

    // -------------------------------------------------------------
    // Step 7: Admin Console Master Workflow
    // -------------------------------------------------------------
    console.log("▶ 7. Navigating to Admin Console Master Tabs (/admin)...");
    await page.goto(`${BASE_URL}/admin?tab=overview`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);

    // 7.1 Family Members Tab & Modal
    console.log("▶ Navigating to Family Members Tab...");
    await page.goto(`${BASE_URL}/admin?tab=members`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);

    const addMemberBtn = await page.$('button:has-text("إضافة فرد"), button:has-text("فرد جديد")');
    if (addMemberBtn) {
      console.log("▶ Opening Add Member Modal Dialog...");
      await addMemberBtn.click();
      await page.waitForTimeout(2000);

      // Close modal
      const closeDialogBtn = await page.$(
        'button:has-text("إلغاء"), button[aria-label="Close"], button:has-text("Close")',
      );
      if (closeDialogBtn) {
        console.log("▶ Closing Add Member Modal...");
        await closeDialogBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    // 7.2 Treasury Tab
    console.log("▶ Navigating to Treasury & Financial Ledger...");
    await page.goto(`${BASE_URL}/admin?tab=treasury`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // 7.3 Articles Tab
    console.log("▶ Navigating to Media Center & Articles...");
    await page.goto(`${BASE_URL}/admin?tab=articles`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // 7.4 Inquiries Tab
    console.log("▶ Navigating to Inquiries & Support Tickets...");
    await page.goto(`${BASE_URL}/admin?tab=inquiries`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // 7.5 Site Settings Tab
    console.log("▶ Navigating to Platform Governance & Settings...");
    await page.goto(`${BASE_URL}/admin?tab=settings`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);

    console.log("=================================================================");
    console.log("🎉 LIVE INTERACTIVE SESSION COMPLETED SUCCESSFULLY!");
    console.log("The browser window will remain open for your inspection.");
    console.log("=================================================================");

    // Keep the browser open for 15 seconds so the user can see the final state
    await page.waitForTimeout(15000);
  } catch (err: any) {
    console.error("Error during live interactive session:", err);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runLiveInteractiveSession().catch(console.error);
