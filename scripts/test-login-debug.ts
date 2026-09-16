import { chromium } from "playwright";

async function debugLogin() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("console", (msg) => console.log(`[BROWSER CONSOLE ${msg.type()}]`, msg.text()));
  page.on("pageerror", (err) => console.log(`[PAGE ERROR]`, err.message));
  page.on("requestfailed", (req) =>
    console.log(`[REQUEST FAILED]`, req.url(), req.failure()?.errorText),
  );

  console.log("Navigating to http://localhost:8081/auth ...");
  await page.goto("http://localhost:8081/auth", { waitUntil: "networkidle" });

  console.log("Filling credentials...");
  await page.fill("#email", "admin@alboubaidfamily.com");
  await page.fill("#password", "AlBuObaid#Admin2026!Hub");

  console.log("Submitting login form...");
  const btn = page.locator('form button[type="submit"]').first();
  await btn.click();

  await page.waitForTimeout(5000);
  console.log("Current URL after 5s:", page.url());

  const localStorageDump = await page.evaluate(() => JSON.stringify(localStorage));
  console.log("LocalStorage dump:", localStorageDump.slice(0, 200));

  await browser.close();
}

debugLogin().catch(console.error);
