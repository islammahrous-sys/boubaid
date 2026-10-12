import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

async function generateOgImage() {
  const logoSvg = fs.readFileSync("public/logo-mark-gold.svg", "utf-8");
  const heroImageBase64 = fs.existsSync("public/images/al-masmak-hero.jpg")
    ? `data:image/jpeg;base64,${fs.readFileSync("public/images/al-masmak-hero.jpg").toString("base64")}`
    : "";

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      width: 1200px;
      height: 630px;
      overflow: hidden;
      background-color: #101412;
      font-family: 'IBM Plex Sans Arabic', -apple-system, BlinkMacSystemFont, sans-serif;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
    }

    /* Hero Background with Dark Heritage Gradient Overlay */
    .bg-hero {
      position: absolute;
      inset: 0;
      background-image: url('${heroImageBase64}');
      background-size: cover;
      background-position: center 38%;
      filter: saturate(1.1) brightness(0.65);
      transform: scale(1.04);
      z-index: 1;
    }
    .bg-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 50% 40%, rgba(16, 20, 18, 0.72) 0%, rgba(13, 16, 14, 0.90) 65%, #0b0e0c 100%),
                  linear-gradient(180deg, rgba(16, 20, 18, 0.6) 0%, rgba(16, 20, 18, 0.95) 100%);
      z-index: 2;
    }

    /* Ambient Gold Glow */
    .ambient-glow {
      position: absolute;
      top: 30%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 540px;
      height: 380px;
      background: radial-gradient(circle, rgba(237, 167, 70, 0.22) 0%, rgba(204, 137, 43, 0.08) 50%, transparent 75%);
      filter: blur(40px);
      z-index: 3;
      pointer-events: none;
    }

    /* Outer Framing Frame */
    .frame-border {
      position: absolute;
      inset: 22px;
      border: 1px solid rgba(237, 167, 70, 0.35);
      border-radius: 12px;
      z-index: 4;
      pointer-events: none;
    }
    .frame-corner {
      position: absolute;
      width: 16px;
      height: 16px;
      border-color: #EDA746;
      z-index: 5;
    }
    .fc-tl { top: 18px; left: 18px; border-top: 3px solid #EDA746; border-left: 3px solid #EDA746; }
    .fc-tr { top: 18px; right: 18px; border-top: 3px solid #EDA746; border-right: 3px solid #EDA746; }
    .fc-bl { bottom: 18px; left: 18px; border-bottom: 3px solid #EDA746; border-left: 3px solid #EDA746; }
    .fc-br { bottom: 18px; right: 18px; border-bottom: 3px solid #EDA746; border-right: 3px solid #EDA746; }

    /* Content Area */
    .content-box {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 0 40px;
      width: 100%;
    }

    /* Eyebrow badge */
    .eyebrow-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 18px;
      border-radius: 9999px;
      background: rgba(237, 167, 70, 0.12);
      border: 1px solid rgba(237, 167, 70, 0.4);
      color: #F8D8A0;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.05em;
      margin-bottom: 14px;
    }

    /* Logo Container */
    .logo-container {
      width: 320px;
      height: 220px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      filter: drop-shadow(0 10px 28px rgba(237, 167, 70, 0.4));
    }
    .logo-container svg {
      width: 100%;
      height: 100%;
    }

    /* Main Title */
    .main-title {
      font-family: 'Amiri', serif;
      font-size: 38px;
      font-weight: 700;
      color: #FFFFFF;
      line-height: 1.3;
      text-shadow: 0 3px 12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(237, 167, 70, 0.25);
      margin-bottom: 8px;
      letter-spacing: -0.01em;
    }

    /* Subtitle */
    .subtitle {
      font-size: 19px;
      font-weight: 600;
      color: #EDA746;
      line-height: 1.4;
      margin-bottom: 24px;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
      letter-spacing: 0.02em;
    }

    /* Footer Meta Bar */
    .meta-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 22px;
      font-size: 13.5px;
      color: rgba(255, 255, 255, 0.75);
      border-top: 1px solid rgba(237, 167, 70, 0.28);
      padding-top: 16px;
      width: 82%;
      max-width: 840px;
    }
    .meta-dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: #EDA746;
      opacity: 0.8;
    }
    .latin-text {
      font-family: 'Inter', -apple-system, sans-serif;
      direction: ltr;
      letter-spacing: 0.04em;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="bg-hero"></div>
  <div class="bg-overlay"></div>
  <div class="ambient-glow"></div>

  <div class="frame-border"></div>
  <div class="frame-corner fc-tl"></div>
  <div class="frame-corner fc-tr"></div>
  <div class="frame-corner fc-bl"></div>
  <div class="frame-corner fc-br"></div>

  <div class="content-box">
    <div class="eyebrow-badge">
      <span>المملكة العربية السعودية</span>
      <span>•</span>
      <span>الأحساء — بني تميم</span>
    </div>

    <div class="logo-container">
      ${logoSvg}
    </div>

    <h1 class="main-title">مجلس أسرة آل بوعبيد وصندوق التنمية العائلية</h1>
    <h2 class="subtitle">البوابة الرسمية المعتمدة | Official Family Portal</h2>

    <div class="meta-bar">
      <span>توثيق النسب وشجرة العائلة</span>
      <div class="meta-dot"></div>
      <span>الأرشيف والتراث</span>
      <div class="meta-dot"></div>
      <span>ترخيص NCNP: 1200758400</span>
      <div class="meta-dot"></div>
      <span class="latin-text">boubaid.com</span>
    </div>
  </div>
</body>
</html>`;

  console.log("Launching headless browser to render 1200x630 OG image...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });

  await page.setContent(html, { waitUntil: "networkidle" });
  // Allow Google Fonts to render
  await page.evaluate(() => document.fonts.ready);

  const outDir = "public/images";
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const pngPath = path.join(outDir, "og-share.png");
  const jpgPath = path.join(outDir, "og-share.jpg");

  await page.screenshot({ path: pngPath, type: "png" });
  await page.screenshot({ path: jpgPath, type: "jpeg", quality: 92 });

  await browser.close();
  console.log(`Successfully generated:\n- ${pngPath} (${fs.statSync(pngPath).size} bytes)\n- ${jpgPath} (${fs.statSync(jpgPath).size} bytes)`);
}

generateOgImage().catch((err) => {
  console.error("Error generating OG image:", err);
  process.exit(1);
});
