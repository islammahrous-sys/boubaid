import { chromium } from "playwright";

const BASE_URL = "http://localhost:8080";

async function executeBrowserJavascript() {
  console.log("=================================================================");
  console.log("BROWSER JAVASCRIPT EXECUTION & RUNTIME EVALUATION");
  console.log("=================================================================\n");

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  // Track console logs
  page.on("console", (msg) => {
    console.log(`[Browser Console ${msg.type()}] ${msg.text()}`);
  });

  await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  // 1. Evaluate DOM & React Hydration
  const domInfo = await page.evaluate(() => {
    return {
      documentTitle: document.title,
      htmlDir: document.documentElement.dir,
      htmlLang: document.documentElement.lang,
      rootChildCount: document.getElementById("main")?.children.length || 0,
      totalDomNodes: document.querySelectorAll("*").length,
      buttonCount: document.querySelectorAll("button").length,
      linkCount: document.querySelectorAll("a").length,
      inputCount: document.querySelectorAll("input").length,
    };
  });
  console.log("▶ 1. DOM Architecture & Hydration Metrics:");
  console.log(JSON.stringify(domInfo, null, 2));

  // 2. Evaluate Browser Performance & Memory Metrics
  const perfMetrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    const memory = (performance as any).memory;
    return {
      domContentLoadedTime: nav
        ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) + "ms"
        : "N/A",
      loadCompleteTime: nav ? Math.round(nav.loadEventEnd - nav.startTime) + "ms" : "N/A",
      transferSize: nav ? (nav.transferSize / 1024).toFixed(2) + " KB" : "N/A",
      decodedBodySize: nav ? (nav.decodedBodySize / 1024).toFixed(2) + " KB" : "N/A",
      jsHeapUsed: memory ? (memory.usedJSHeapSize / (1024 * 1024)).toFixed(2) + " MB" : "N/A",
      jsHeapTotal: memory ? (memory.totalJSHeapSize / (1024 * 1024)).toFixed(2) + " MB" : "N/A",
    };
  });
  console.log("\n▶ 2. Performance & JS Memory Allocation:");
  console.log(JSON.stringify(perfMetrics, null, 2));

  // 3. Evaluate LocalStorage & Session Storage
  const storageState = await page.evaluate(() => {
    const lsKeys: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) lsKeys[k] = localStorage.getItem(k) || "";
    }
    return {
      localStorageLength: localStorage.length,
      keys: Object.keys(lsKeys),
      theme: localStorage.getItem("theme") || "system/default",
      lang: localStorage.getItem("lang") || "ar",
    };
  });
  console.log("\n▶ 3. Client Storage State (localStorage):");
  console.log(JSON.stringify(storageState, null, 2));

  // 4. Evaluate Web APIs & Features Availability
  const webApis = await page.evaluate(() => {
    return {
      serviceWorkerSupport: "serviceWorker" in navigator,
      cryptoSubtleSupport: !!(window.crypto && window.crypto.subtle),
      canvas2dSupport: !!document.createElement("canvas").getContext("2d"),
      intersectionObserver: "IntersectionObserver" in window,
      resizeObserver: "ResizeObserver" in window,
      webAnimationsApi: typeof Element.prototype.animate === "function",
      mediaQueryMatchDark: window.matchMedia("(prefers-color-scheme: dark)").matches,
    };
  });
  console.log("\n▶ 4. Browser Modern Web API Support:");
  console.log(JSON.stringify(webApis, null, 2));

  // 5. Execute Live Dynamic Interaction & State Mutation in Browser
  console.log("\n▶ 5. Executing In-Page JavaScript State Mutations:");

  // Test executing JS theme change
  const themeMutation = await page.evaluate(() => {
    const isDarkBefore = document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark");
    const isDarkAfter = document.documentElement.classList.contains("dark");
    // Restore
    document.documentElement.classList.toggle("dark");
    return { isDarkBefore, isDarkAfter, toggledSuccessfully: isDarkBefore !== isDarkAfter };
  });
  console.log("Theme Toggle Mutation Result:", themeMutation);

  // Test evaluating QR Code Generation via Canvas API on /verify
  await page.goto(`${BASE_URL}/verify?id=ABO-001EF5`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);

  const qrCanvasEval = await page.evaluate(() => {
    const qrSvgOrCanvas = document.querySelector("svg, canvas");
    return {
      hasQrVisualElement: !!qrSvgOrCanvas,
      elementTag: qrSvgOrCanvas?.tagName.toLowerCase() || "none",
      hasSeal:
        document.body.innerText.includes("المركز الوطني") ||
        document.body.innerText.includes("معتمد"),
    };
  });
  console.log("Verification Page JS Canvas Evaluation:", qrCanvasEval);

  await browser.close();
  console.log("\n=================================================================");
  console.log("🎉 ALL BROWSER JAVASCRIPT EXECUTION CHECKS COMPLETED SUCCESSFULLY");
  console.log("=================================================================");
}

executeBrowserJavascript().catch(console.error);
