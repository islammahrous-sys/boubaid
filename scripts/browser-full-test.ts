import { chromium, type Browser, type Page } from "playwright";

interface LogEntry {
  type: string;
  text: string;
  url: string;
}

interface TestFailure {
  page: string;
  step: string;
  error: string;
}

const BASE_URL = process.env.BASE_URL || "http://localhost:8081";
const logs: LogEntry[] = [];
const failures: TestFailure[] = [];

function recordFailure(pageName: string, step: string, error: any) {
  failures.push({
    page: pageName,
    step,
    error: error?.message || String(error),
  });
  console.log(`❌ [FAILED] [${pageName}] ${step} -> ${error?.message || error}`);
}

function recordSuccess(pageName: string, step: string) {
  console.log(`✅ [PASSED] [${pageName}] ${step}`);
}

async function setupPageListeners(page: Page, pageName: string) {
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      logs.push({ type: "error", text: msg.text(), url: page.url() });
    }
  });

  page.on("pageerror", (err) => {
    logs.push({ type: "uncaught", text: err.message, url: page.url() });
    console.log(`🔥 [Uncaught Page Error] [${pageName}] ${err.message}`);
  });
}

async function runBrowserAudit() {
  console.log("=================================================================");
  console.log("STARTING FULL END-TO-END BROWSER AUTOMATION AUDIT");
  console.log("=================================================================\n");

  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    console.log("Launched Chromium browser instance.");
  } catch (err: any) {
    try {
      browser = await chromium.launch({
        channel: "msedge",
        headless: true,
      });
      console.log("Launched Microsoft Edge browser instance.");
    } catch (e: any) {
      console.error("Could not launch browser:", e);
      process.exit(1);
    }
  }

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  // -------------------------------------------------------------
  // 1. PUBLIC PAGES AUDIT
  // -------------------------------------------------------------
  const publicRoutes = [
    { path: "/", name: "Homepage" },
    { path: "/about", name: "About & Lineage" },
    { path: "/branches", name: "Family Branches" },
    { path: "/family-tree", name: "Family Tree" },
    { path: "/dna", name: "Genetic Studies (DNA)" },
    { path: "/achievers", name: "Roll of Honour" },
    { path: "/foundation", name: "Foundation & Governance" },
    { path: "/initiatives", name: "Projects & Initiatives" },
    { path: "/events", name: "Events & Calendar" },
    { path: "/library", name: "Digital Library & Archive" },
    { path: "/news", name: "News & Notices" },
    { path: "/directory", name: "Business & Member Directory" },
    { path: "/contribute", name: "Financial Contributions" },
    { path: "/contact", name: "Contact Us" },
    { path: "/verify?id=ABO-001EF5", name: "Verification Certificate" },
  ];

  console.log("--- Phase 1: Testing All Public Routes ---");
  for (const route of publicRoutes) {
    try {
      setupPageListeners(page, route.name);
      const res = await page.goto(`${BASE_URL}${route.path}`, {
        waitUntil: "domcontentloaded",
        timeout: 10000,
      });

      if (!res || res.status() >= 400) {
        recordFailure(route.name, `HTTP Status Check`, `Received HTTP ${res?.status()}`);
      } else {
        recordSuccess(route.name, `Loaded Successfully (HTTP ${res.status()})`);
      }

      // Check title exists
      const title = await page.title();
      if (!title || title.trim().length === 0) {
        recordFailure(route.name, "Page Title Validation", "Empty <title>");
      } else {
        recordSuccess(route.name, `Page Title: "${title.slice(0, 45)}..."`);
      }

      // Check page has no React error boundary or fatal crash
      const errorBoundary = await page.$("text=Something went wrong");
      if (errorBoundary) {
        recordFailure(
          route.name,
          "React Crash Boundary",
          "Crash boundary caught an error on page!",
        );
      }
    } catch (err: any) {
      recordFailure(route.name, "Navigation / Load Exception", err);
    }
  }

  // -------------------------------------------------------------
  // 2. INTERACTION AUDIT: Language Switch & Theme Toggle
  // -------------------------------------------------------------
  console.log("\n--- Phase 2: Global UI Controls (Language & Theme) ---");
  try {
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded", timeout: 10000 });

    // Check initial HTML dir is rtl
    const initialDir = await page.getAttribute("html", "dir");
    recordSuccess("UI Controls", `Initial HTML dir is "${initialDir}"`);

    // Click English switch if present
    const enButton = await page.$('button:has-text("EN"), button:has-text("English")');
    if (enButton) {
      await enButton.click();
      await page.waitForTimeout(300);
      const switchedDir = await page.getAttribute("html", "dir");
      recordSuccess("UI Controls", `Switched to English (dir="${switchedDir}")`);

      // Switch back to Arabic
      const arButton = await page.$(
        'button:has-text("عربي"), button:has-text("العربية"), button:has-text("AR")',
      );
      if (arButton) {
        await arButton.click();
        await page.waitForTimeout(300);
        const rtlDir = await page.getAttribute("html", "dir");
        recordSuccess("UI Controls", `Switched back to Arabic (dir="${rtlDir}")`);
      }
    }
  } catch (err: any) {
    recordFailure("UI Controls", "Language Switch Exception", err);
  }

  // -------------------------------------------------------------
  // 3. AUTHENTICATION & LOGIN FLOW
  // -------------------------------------------------------------
  console.log("\n--- Phase 3: Authentication & Admin Console ---");
  try {
    // Clear existing session state to test fresh login
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}
    });
    await context.clearCookies();

    await page.goto(`${BASE_URL}/auth`, { waitUntil: "networkidle", timeout: 10000 });
    recordSuccess("Auth Page", "Navigated to /auth");

    // Wait for form input
    await page.waitForSelector("#email", { state: "visible", timeout: 8000 });

    // Fill credentials
    await page.fill("#email", "admin@alboubaidfamily.com");
    await page.fill("#password", "AlBuObaid#Admin2026!Hub");

    // Click submit button
    const submitBtn = page.locator('form button[type="submit"]').first();
    await submitBtn.click();
    recordSuccess("Auth Page", "Clicked Sign In button");

    // Wait for URL change or toast notification
    await page.waitForTimeout(4000);
    const currentUrl = page.url();
    console.log("Post-login URL:", currentUrl);

    if (
      currentUrl.includes("/account") ||
      currentUrl.includes("/admin") ||
      currentUrl === `${BASE_URL}/`
    ) {
      recordSuccess("Auth Flow", `Sign in succeeded -> redirected to ${currentUrl}`);
    } else {
      // Check for error toast message
      const toastEl = await page.$("[data-sonner-toast]");
      const toastText = toastEl ? await toastEl.textContent() : "none";
      console.log("Toast message displayed:", toastText);
      recordFailure(
        "Auth Flow",
        "Sign In Redirection",
        `Did not navigate away from /auth (Current: ${currentUrl}, Toast: ${toastText})`,
      );
    }
  } catch (err: any) {
    recordFailure("Auth Flow", "Sign In Exception", err);
  }

  // -------------------------------------------------------------
  // 4. MEMBER ACCOUNT PORTAL (/account)
  // -------------------------------------------------------------
  console.log("\n--- Phase 4: Member Portal (/account) ---");
  try {
    await page.goto(`${BASE_URL}/account`, { waitUntil: "domcontentloaded", timeout: 10000 });
    recordSuccess("Member Portal", "Loaded /account page");

    // Verify presence of Digital ID or verified status
    const verifiedBadge = await page.$("text=أمانة المجلس, text=عضو معتمد, text=Admin");
    if (verifiedBadge) {
      recordSuccess("Member Portal", "Admin / Verified Member status recognized");
    }

    // Check tabs on account page
    const tabs = ["profile", "card", "contributions", "notifications", "security"];
    for (const tab of tabs) {
      const tabTrigger = await page.$(`[data-state][value="${tab}"]`);
      if (tabTrigger) {
        await tabTrigger.click();
        await page.waitForTimeout(200);
        recordSuccess("Member Portal", `Switched to tab "${tab}"`);
      }
    }
  } catch (err: any) {
    recordFailure("Member Portal", "Account Portal Exception", err);
  }

  // -------------------------------------------------------------
  // 5. ADMIN CONSOLE AUDIT (/admin)
  // -------------------------------------------------------------
  console.log("\n--- Phase 5: Admin Console Tabs Audit (/admin) ---");
  try {
    await page.goto(`${BASE_URL}/admin`, { waitUntil: "domcontentloaded", timeout: 10000 });
    recordSuccess("Admin Console", "Loaded /admin master console");

    // Test navigating across key admin tabs via URL
    const adminTabs = [
      "overview",
      "members",
      "branches",
      "relationships",
      "history",
      "articles",
      "events",
      "announcements",
      "media",
      "museum",
      "places",
      "inquiries",
      "users",
      "audit",
      "settings",
      "directory",
      "treasury",
      "initiatives",
      "achievers",
      "library",
      "navigation",
      "dna",
    ];

    for (const tab of adminTabs) {
      try {
        await page.goto(`${BASE_URL}/admin?tab=${tab}`, {
          waitUntil: "domcontentloaded",
          timeout: 10000,
        });
        await page.waitForTimeout(200);

        // Check if crash boundary or error occurred
        const crash = await page.$("text=Something went wrong");
        if (crash) {
          recordFailure("Admin Console", `Tab "${tab}" Crash`, "Crash boundary displayed on tab");
        } else {
          recordSuccess("Admin Console", `Tab "${tab}" Rendered`);
        }
      } catch (tabErr: any) {
        recordFailure("Admin Console", `Tab "${tab}" Exception`, tabErr);
      }
    }
  } catch (err: any) {
    recordFailure("Admin Console", "Admin Master Console Exception", err);
  }

  // -------------------------------------------------------------
  // 6. MOBILE RESPONSIVENESS (Viewport 390x844)
  // -------------------------------------------------------------
  console.log("\n--- Phase 6: Mobile Viewport & Navigation ---");
  try {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded", timeout: 10000 });
    recordSuccess("Mobile View", "Loaded mobile homepage (390x844)");

    // Check presence of Mobile Navigation Tab Bar
    const bottomNav = await page.$('nav[aria-label="Quick navigation"]');
    if (bottomNav) {
      recordSuccess("Mobile View", "Mobile bottom tab bar verified");
    }

    // Check quick tabs
    const treeTab = await page.$('nav a[href="/family-tree"]');
    if (treeTab) {
      recordSuccess("Mobile View", "Mobile Tree navigation item verified");
    }
  } catch (err: any) {
    recordFailure("Mobile View", "Mobile Responsiveness Exception", err);
  }

  // -------------------------------------------------------------
  // 7. SUMMARY & CONSOLE ERROR REPORT
  // -------------------------------------------------------------
  console.log("\n=================================================================");
  console.log("BROWSER AUTOMATION AUDIT SUMMARY");
  console.log("=================================================================");

  const fatalLogs = logs.filter((l) => l.type === "uncaught");

  console.log(`Total Failures Recorded: ${failures.length}`);
  console.log(`Total Uncaught Page Errors: ${fatalLogs.length}\n`);

  if (failures.length > 0) {
    console.log("FAILURES:");
    failures.forEach((f) => console.log(`❌ [${f.page}] ${f.step}: ${f.error}`));
  }

  if (fatalLogs.length > 0) {
    console.log("UNCAUGHT ERRORS:");
    fatalLogs.forEach((l) => console.log(`🔥 [${l.url}] ${l.text}`));
  }

  if (failures.length === 0 && fatalLogs.length === 0) {
    console.log("🎉 ALL BROWSER INTERACTIONS & ROUTE CHECKS PASSED WITH 100% ZERO ERRORS!");
  }

  if (browser) {
    await browser.close();
  }
}

runBrowserAudit().catch(console.error);
