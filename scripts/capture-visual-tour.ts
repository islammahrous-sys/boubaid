import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const ARTIFACTS_DIR =
  "C:/Users/mahro/.gemini/antigravity/brain/3d3eb414-c641-4024-b807-098259af270a";
const BASE_URL = "http://localhost:8080";

async function captureVisualTour() {
  console.log("Starting visual screenshot tour...");

  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  // 1. Homepage
  console.log("Capturing Homepage...");
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, "shot-1-homepage.png"), fullPage: false });

  // 2. Family Tree
  console.log("Capturing Family Tree...");
  await page.goto(`${BASE_URL}/family-tree`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, "shot-2-family-tree.png"),
    fullPage: false,
  });

  // 3. DNA Studies
  console.log("Capturing DNA Studies...");
  await page.goto(`${BASE_URL}/dna`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, "shot-3-dna-studies.png"),
    fullPage: false,
  });

  // 4. Governance & Foundation
  console.log("Capturing Foundation & Governance...");
  await page.goto(`${BASE_URL}/foundation`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, "shot-4-governance.png"),
    fullPage: false,
  });

  // 5. Member Verification Certificate
  console.log("Capturing Verification Certificate...");
  await page.goto(`${BASE_URL}/verify?id=ABO-001EF5`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, "shot-5-verify-card.png"),
    fullPage: false,
  });

  // 6. Login as Admin and Capture Member Account Portal
  console.log("Signing in as Admin...");
  await page.goto(`${BASE_URL}/auth`, { waitUntil: "domcontentloaded" });
  await page.fill('input[type="email"]', "admin@alboubaidfamily.com");
  await page.fill('input[type="password"]', "AlBuObaid#Admin2026!Hub");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log("Capturing Member Portal (/account)...");
  await page.goto(`${BASE_URL}/account`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, "shot-6-member-account.png"),
    fullPage: false,
  });

  // 7. Admin Console Overview
  console.log("Capturing Admin Console Overview (/admin)...");
  await page.goto(`${BASE_URL}/admin?tab=overview`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, "shot-7-admin-overview.png"),
    fullPage: false,
  });

  // 8. Admin Console Family Members
  console.log("Capturing Admin Family Members (/admin?tab=members)...");
  await page.goto(`${BASE_URL}/admin?tab=members`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, "shot-8-admin-members.png"),
    fullPage: false,
  });

  // 9. Admin Treasury Ledger
  console.log("Capturing Admin Treasury (/admin?tab=treasury)...");
  await page.goto(`${BASE_URL}/admin?tab=treasury`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, "shot-9-admin-treasury.png"),
    fullPage: false,
  });

  // 10. Mobile Homepage View
  console.log("Capturing Mobile Homepage View (390x844)...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, "shot-10-mobile-view.png"),
    fullPage: false,
  });

  await browser.close();
  console.log("🎉 All visual screenshots captured successfully!");
}

captureVisualTour().catch(console.error);
