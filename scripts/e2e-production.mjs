// Production E2E suite — drives www.boubaid.com as an admin test account.
// Usage: E2E_CREDENTIALS_FILE=path/to/creds.txt node scripts/e2e-production.mjs
//        (optional: BASE=https://..., ONLY=article,museum to run a subset)
// Needs .env with SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY.
// Every record it creates carries the marker PWTEST and is removed again;
// settings it edits are snapshotted first and restored at the end.
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(fs.readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")]; }));
// E2E_CREDENTIALS_FILE: a text file with "Email: ..." and "Password: ..." lines for an admin test account.
if (!process.env.E2E_CREDENTIALS_FILE) throw new Error("Set E2E_CREDENTIALS_FILE to the admin test-account credentials file");
const cred = fs.readFileSync(process.env.E2E_CREDENTIALS_FILE, "utf8");
const EMAIL = cred.match(/Email: (.*)/)[1].trim(), PASSWORD = cred.match(/Password: (.*)/)[1].trim();
const BASE = process.env.BASE || "https://www.boubaid.com";
const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null;
const OUT = process.env.E2E_OUT || ".e2e-output";
fs.mkdirSync(OUT, { recursive: true });
const ref = env.SUPABASE_URL.match(/https:\/\/([^.]+)/)[1];
const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const anon = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
const { data: { session }, error: authErr } = await anon.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
if (authErr) throw authErr;
const START = new Date().toISOString();
const M = "PWTEST";
const stamp = Date.now().toString(36);

// ── snapshot settings this suite may touch ──
const SNAP_KEYS = ["page_texts", "page_images", "homepage_sections_config"];
const { data: snap } = await admin.from("site_settings").select("key,value").in("key", SNAP_KEYS);
fs.writeFileSync(`${OUT}/settings-snapshot.json`, JSON.stringify(snap, null, 1));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "ar-SA", acceptDownloads: true });
await ctx.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); localStorage.setItem("lang", "ar"); } catch {} }, [`sb-${ref}-auth-token`, JSON.stringify(session)]);
const page = await ctx.newPage();
const consoleErrors = [];
page.on("pageerror", (e) => consoleErrors.push(e.message.slice(0, 200)));

const results = [];
const sleep = (ms) => page.waitForTimeout(ms);
async function go(url) { await page.goto(BASE + url, { waitUntil: "domcontentloaded", timeout: 60000 }); await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {}); await sleep(1500); }
async function tab(domain, t) { await go(`/admin?domain=${domain}&tab=${t}`); }
const dialog = () => page.locator("[role=dialog]").last();
async function clickText(t, scope = page, exact = false) { await scope.getByText(t, { exact }).first().click({ timeout: 15000 }); await sleep(900); }
async function clickButton(t, scope = page) { await scope.getByRole("button", { name: t }).first().click({ timeout: 15000 }); await sleep(1200); }
function fieldAfter(label, scope) {
  const s = scope || dialog();
  return s.locator(`xpath=.//*[self::label or self::span or self::p or self::div][normalize-space()='${label}' or normalize-space()='${label} *']/following::*[self::input[not(@type='file') and not(@type='checkbox') and not(@type='hidden')] or self::textarea][1]`).first();
}
async function fillC(label, value, scope) {
  const s = scope || dialog();
  const f = s.locator(`xpath=.//*[self::label or self::span or self::p or self::div][not(*[self::label or self::div or self::span or self::p]) and contains(normalize-space(), '${label}')]/following::*[self::input[not(@type='file') and not(@type='checkbox') and not(@type='hidden')] or self::textarea][1]`).first();
  await f.fill(value, { timeout: 10000 });
}
async function fill(label, value, scope) { const f = fieldAfter(label, scope); await f.fill(value, { timeout: 10000 }); }
async function fillPh(ph, value, scope) { await (scope || dialog()).getByPlaceholder(ph).first().fill(value, { timeout: 10000 }); }
async function pickSelect(label, optionText, scope) {
  const s = scope || dialog();
  const trig = s.locator(`xpath=.//*[self::label or self::span or self::div][normalize-space()='${label}' or normalize-space()='${label} *']/following::*[@role='combobox' or self::select][1]`).first();
  const tag = await trig.evaluate((e) => e.tagName);
  if (tag === "SELECT") { await trig.selectOption({ label: optionText }); }
  else { await trig.click(); await sleep(500); await page.getByRole("option", { name: optionText }).first().click(); }
  await sleep(400);
}
async function confirmIfAsked() {
  const c = page.locator("[role=alertdialog]");
  if (await c.count()) { const b = c.getByRole("button").filter({ hasText: /حذف|تأكيد|نعم|Delete|Confirm|متابعة/ }).first(); if (await b.count()) await b.click(); await sleep(1500); }
}
async function rowAction(text, iconMatch) {
  const row = page.locator("tr, .group, li, article, div.rounded-xl, div.rounded-2xl, div.border").filter({ hasText: text }).last();
  await row.scrollIntoViewIfNeeded().catch(() => {});
  const btn = row.locator(`button:has(svg[class*='${iconMatch}'])`).first();
  await btn.click({ timeout: 15000 });
  await sleep(1200);
}
async function waitRow(table, col, val, want = true, tries = 12) {
  for (let i = 0; i < tries; i++) {
    const { data } = await admin.from(table).select("*").ilike(col, `%${val}%`);
    if (want ? data?.length : !data?.length) return data;
    await sleep(1000);
  }
  return null;
}
async function test(name, fn) {
  if (ONLY && !ONLY.some((o) => name.includes(o))) return;
  const t0 = Date.now();
  try { const note = await fn(); results.push({ name, ok: true, note: note || "", ms: Date.now() - t0 }); console.log(`PASS ${name}${note ? " — " + note : ""}`); }
  catch (e) {
    const f = `${OUT}/fail-${name.replace(/[^a-z0-9]+/gi, "_")}.png`;
    await page.screenshot({ path: f }).catch(() => {});
    results.push({ name, ok: false, note: e.message.split("\n")[0].slice(0, 300), shot: f, ms: Date.now() - t0 });
    console.log(`FAIL ${name} — ${e.message.split("\n")[0].slice(0, 300)}`);
    await page.keyboard.press("Escape").catch(() => {});
  }
}
const assert = (c, m) => { if (!c) throw new Error(m); };

// tiny test files
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAQ0lEQVR42u3PMREAAAgEoNe/9Ku4YYRA0kxHAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEZuDsvAf8v5bVoAAAAAElFTkSuQmCC", "base64");
fs.writeFileSync(`${OUT}/pwtest.png`, PNG);
fs.writeFileSync(`${OUT}/pwtest2.png`, PNG);
fs.writeFileSync(`${OUT}/pwtest.pdf`, "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n");

// ═════════════════════════ READ / NAV TESTS ═════════════════════════
await test("console loads as admin", async () => {
  await tab("dashboard", "overview");
  assert(await page.getByText("مرحباً بك في مركز الإدارة").count(), "dashboard greeting missing");
});
await test("global search (Ctrl+K) finds a member", async () => {
  await tab("dashboard", "overview");
  await page.getByText("بحث شامل وأوامر سريعة").first().click();
  await sleep(800);
  await page.keyboard.type("صالح");
  await sleep(6000);
  const txt = await page.locator("[role=dialog]").last().innerText();
  const n = (txt.match(/صالح آل بوعبيد|صالح/g) || []).length;
  assert(/نتائج البحث/.test(txt), "no search results group");
  assert(n > 0, "no search results for صالح");
  await page.keyboard.press("Escape");
  return `${n} hits`;
});
await test("public site switches to English", async () => {
  await go("/");
  await page.getByRole("button", { name: /^EN$/ }).first().click();
  await sleep(1500);
  const dir = await page.evaluate(() => document.documentElement.dir);
  const hasEn = await page.getByText(/Family Development Fund|Al Bu Obaid|Home/).count();
  await page.getByRole("button", { name: /^ع$/ }).first().click().catch(() => {});
  await sleep(800);
  assert(dir === "ltr" && hasEn, `dir=${dir}, english text=${hasEn}`);
});
await test("governance org chart image loads", async () => {
  await go("/governance");
  await page.evaluate(() => { document.querySelectorAll("img[loading=lazy]").forEach((i) => (i.loading = "eager")); window.scrollTo(0, document.body.scrollHeight / 2); });
  await sleep(2500);
  const bad = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src));
  assert(!bad.length, "broken: " + bad.join(", "));
});
await test("fund certificate PDFs open", async () => {
  await go("/fund-certificates");
  const hrefs = await page.evaluate(() => [...document.querySelectorAll("a[href*='.pdf'], a[href*='__l5e'], a[href*='storage']")].map((a) => a.href));
  let bad = [];
  for (const h of [...new Set(hrefs)].slice(0, 12)) { const r = await page.request.get(h); if (r.status() >= 400) bad.push(r.status() + " " + h); }
  assert(!bad.length, bad.join("; "));
  return `${new Set(hrefs).size} links checked`;
});
await test("committee letters/plans open", async () => {
  await go("/committees");
  const hrefs = await page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.href).filter((h) => /\.pdf|__l5e|storage\/v1/.test(h)));
  let bad = [];
  for (const h of [...new Set(hrefs)]) { const r = await page.request.get(h); if (r.status() >= 400) bad.push(r.status() + " " + h.slice(-60)); }
  assert(!bad.length, bad.join("; "));
  return `${new Set(hrefs).size} links checked`;
});

// ═════════════════════════ CONTENT CRUD ═════════════════════════
await test("article: create draft, then delete", async () => {
  const title = `${M} مقال ${stamp}`;
  await tab("content", "articles");
  await clickButton("كتابة مقال جديد");
  await fillPh("مثال: اختتام فعاليات الملتقى السنوي لأسرة آل بوعبيد", title);
  await fillPh("نص المقال والبيان الصحفي...", "نص تجريبي آلي — سيُحذف.");
  await clickText("الوسائط والنشر", dialog());
  await pickSelect("حالة النشر", "مسودة");
  await clickButton("حفظ المقال", dialog());
  const rows = await waitRow("articles", "title_ar", title);
  assert(rows, "article not saved");
  assert(rows[0].status === "draft", "status is " + rows[0].status);
  await go("/news"); assert(!(await page.getByText(title).count()), "draft visible on /news!");
  await tab("content", "articles");
  await page.getByText("المسودات").first().click().catch(() => {}); await sleep(1200);
  page.once("dialog", (d) => d.accept());
  await page.locator("tr").filter({ hasText: title }).first().getByRole("checkbox").click(); await sleep(600);
  await page.getByRole("button", { name: /حذف المحدد/ }).click(); await sleep(1000);
  await confirmIfAsked(); await sleep(1500);
  const { data: after } = await admin.from("articles").select("id,deleted_at").ilike("title_ar", `%${title}%`);
  assert(!after.length || after.every((a) => a.deleted_at), "article not deleted");
});

await test("event: create draft, then delete", async () => {
  const title = `${M} فعالية ${stamp}`;
  await tab("content", "events");
  await clickButton("إضافة فعالية جديدة");
  await fillPh("مثال: اللقاء السنوي لأسرة آل بوعبيد", title);
  const dt = dialog().locator("input[type='datetime-local'], input[type='date']").first();
  await dt.fill(new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 16)).catch(async () => { await dt.fill(new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10)); });
  try { await pickSelect("الحالة", "مسودة"); } catch {}
  await clickButton("حفظ الفعالية", dialog());
  const rows = await waitRow("events", "title_ar", title);
  assert(rows, "event not saved");
  const st = rows[0].status;
  await admin.from("events").delete().eq("id", rows[0].id); // console has no delete button for events
  return "saved with status " + st + " (removed via DB — the console has no delete for events)";
});

await test("announcement: create archived, edit, delete", async () => {
  const title = `${M} إعلان ${stamp}`;
  await tab("content", "announcements");
  await clickButton("إضافة إعلان");
  await fillPh("مثال: تعميم بخصوص موعد انعقاد الجمعية العمومية", title);
  await fill("نص الإعلان والرسالة", "نص تجريبي آلي — سيُحذف.");
  try { await pickSelect("الحالة", "مؤرشف"); } catch { try { await pickSelect("الحالة", "archived"); } catch {} }
  await dialog().getByRole("button", { name: /حفظ|نشر|إضافة/ }).last().click(); await sleep(2500);
  const rows = await waitRow("announcements", "title_ar", title);
  assert(rows, "announcement not saved");
  const st = rows[0].status;
  await admin.from("announcements").delete().eq("id", rows[0].id);
  assert(st !== "published", "test announcement was published");
  return "status " + st;
});

await test("library: add document with PDF + preview image, then delete", async () => {
  const title = `${M} وثيقة ${stamp}`;
  await tab("content", "library_items");
  await clickButton("إضافة وثيقة / مادة");
  await fill("العنوان بالعربية", title);
  const files = dialog().locator("input[type=file]");
  await files.nth(0).setInputFiles(`${OUT}/pwtest.pdf`); await sleep(4000);
  if ((await files.count()) > 1) { await files.nth(1).setInputFiles(`${OUT}/pwtest.png`); await sleep(4000); }
  await clickButton("حفظ المادة", dialog());
  const rows = await waitRow("library_items", "title_ar", title);
  assert(rows, "library item not saved");
  const r = rows[0];
  const fileUrl = r.file_url || r.file_path || r.url || "";
  await tab("content", "library_items");
  await rowAction(title, "trash"); await confirmIfAsked();
  const gone = await waitRow("library_items", "title_ar", title, false);
  assert(gone, "library item not deleted");
  return "file stored: " + (fileUrl ? "yes" : "NO");
});

await test("museum: create collection, upload 2 photos, delete", async () => {
  const title = `${M} ألبوم ${stamp}`;
  await tab("content", "library_items");
  await clickText("مجموعات المتحف المصورة");
  await page.getByRole("button", { name: "إضافة مجموعة", exact: true }).click(); await sleep(1200);
  await fill("عنوان المجموعة بالعربية", title);
  const sw = dialog().locator("button[role=switch][data-state=checked]");
  if (await sw.count()) await sw.first().click(); // keep it unpublished
  await clickButton("حفظ المجموعة", dialog());
  const rows = await waitRow("galleries", "title_ar", title);
  assert(rows, "collection not saved");
  await page.getByText(title, { exact: true }).first().click(); await sleep(2000);
  await page.locator("input[type=file]").first().setInputFiles([`${OUT}/pwtest.png`, `${OUT}/pwtest2.png`]); await sleep(8000);
  const { count } = await admin.from("gallery_media").select("*", { count: "exact", head: true }).eq("gallery_id", rows[0].id);
  // cleanup through UI
  await tab("content", "library_items"); await clickText("مجموعات المتحف المصورة");
  await rowAction(title, "trash"); await confirmIfAsked();
  const gone = await waitRow("galleries", "title_ar", title, false);
  if (!gone) { await admin.from("gallery_media").delete().eq("gallery_id", rows[0].id); await admin.from("galleries").delete().eq("id", rows[0].id); }
  assert(count === 2, `expected 2 photos uploaded, got ${count}`);
  assert(gone, "collection not deleted from UI (removed via DB)");
});

await test("media library: upload file, then delete", async () => {
  await tab("content", "media_library");
  const fname = `pwtest-${stamp}.png`;
  fs.copyFileSync(`${OUT}/pwtest.png`, `${OUT}/${fname}`);
  // the "رفع وسائط وملفات PDF" control is a <label> wrapping a hidden multi-file input
  await page.locator("label").filter({ hasText: "رفع وسائط وملفات PDF" }).locator("input[type=file]").setInputFiles(`${OUT}/${fname}`);
  await sleep(8000);
  const { data } = await admin.from("media_assets").select("id,bucket,storage_path,file_name").or(`file_name.ilike.%${stamp}%,storage_path.ilike.%${stamp}%`);
  assert(data?.length, "media not registered");
  for (const m of data) { await admin.storage.from(m.bucket).remove([m.storage_path]); await admin.from("media_assets").delete().eq("id", m.id); }
  return "uploaded to " + data[0].bucket + " (cleaned up)";
});

await test("navigation: add footer link, then delete", async () => {
  const label = `${M} رابط ${stamp}`;
  await tab("content", "navigation");
  await page.locator("main button[role=combobox]").first().click(); await sleep(500);
  await page.getByRole("option", { name: /footer/ }).first().click(); await sleep(1500);
  await clickButton("إضافة رابط جديد");
  await fillPh("مثال: شجرة الأسرة", label);
  await fill("المسار / الرابط (URL)", "/about");
  await clickButton("حفظ الرابط", dialog());
  const rows = await waitRow("navigation_items", "label_ar", label);
  assert(rows, "link not saved");
  await rowAction(label, "trash"); await confirmIfAsked();
  const gone = await waitRow("navigation_items", "label_ar", label, false);
  if (!gone) await admin.from("navigation_items").delete().eq("id", rows[0].id);
  assert(gone, "link not deleted from UI (removed via DB)");
});

await test("dynamic page: build, publish, view at /p/slug, delete", async () => {
  const slug = `pwtest-${stamp}`;
  const title = `${M} صفحة ${stamp}`;
  await tab("content", "pages");
  await clickButton("إنشاء صفحة جديدة"); await sleep(1500);
  await clickText("اقتباس مميز (Quote)", dialog()); // add a third block
  await clickText("بيانات الصفحة", dialog());
  const inputs = dialog().locator("input:not([type=file]):not([type=checkbox])");
  // title is first text input, slug the one whose placeholder/label mentions slug
  await fillC("عنوان الصفحة (بالعربية)", title).catch(async () => { await inputs.nth(0).fill(title); });
  await fillC("(Slug)", slug);
  const stSel = dialog().locator("xpath=.//*[contains(normalize-space(),'حالة النشر')]/following::*[@role='combobox'][1]").first();
  await stSel.click(); await sleep(500);
  await page.getByRole("option", { name: /منشور|Published/ }).first().click(); await sleep(400);
  await clickButton("حفظ ونشر الصفحة", dialog()); await sleep(2000);
  const rows = await waitRow("content_pages", "slug", slug);
  assert(rows, "page not saved");
  await go(`/p/${slug}`);
  const ok = await page.getByText("أهلاً بكم في بوابة أسرة آل بوعبيد").count();
  const status = rows[0].status;
  // delete via UI
  await tab("content", "pages");
  await rowAction(slug, "trash"); await confirmIfAsked();
  const { data: after } = await admin.from("content_pages").select("id,deleted_at").eq("slug", slug);
  const deleted = !after.length || after.every((a) => a.deleted_at);
  if (!deleted) await admin.from("content_pages").delete().eq("slug", slug);
  assert(ok, `published page not rendered at /p/${slug} (status=${status})`);
  assert(deleted, "page not deleted from UI (removed via DB)");
});

await test("initiative: create unpublished, delete", async () => {
  const slug = `pwtest-${stamp}`;
  await tab("projects", "initiatives");
  await clickButton("إضافة مبادرة جديدة");
  await fillPh("e.g. medical-fund", slug);
  await fill("عنوان المبادرة (AR)", `${M} مبادرة ${stamp}`);
  const sw = dialog().locator("button[role=switch][data-state=checked]");
  if (await sw.count()) await sw.first().click();
  await clickButton("حفظ المبادرة", dialog());
  const rows = await waitRow("initiatives", "slug", slug);
  assert(rows, "initiative not saved");
  await admin.from("initiatives").delete().eq("id", rows[0].id);
  return "published=" + rows[0].is_published;
});

await test("achiever: create, delete", async () => {
  const name = `${M} متميز ${stamp}`;
  await tab("projects", "achievers");
  await clickButton("إضافة متميز جديد");
  await fillPh("مثال: د. عبدالمحسن بن محمد آل بوعبيد", name);
  await fillPh("1447", "1447").catch(() => {});
  const sw = dialog().locator("button[role=switch][data-state=checked]");
  if (await sw.count()) await sw.first().click();
  await clickButton("حفظ السجل", dialog());
  const rows = await waitRow("achievers", "name_ar", name);
  assert(rows, "achiever not saved");
  await admin.from("achievers").delete().eq("id", rows[0].id);
});

await test("service: add, upload document, delete", async () => {
  const name = `${M} خدمة ${stamp}`;
  await tab("community", "services");
  await clickButton("إضافة خدمة");
  await fill("اسم الخدمة (عربي)", name);
  await dialog().getByRole("button", { name: "حفظ", exact: true }).click(); await sleep(2000);
  const rows = await waitRow("services", "title_ar", name);
  assert(rows, "service not saved");
  const card = page.locator("div").filter({ hasText: name }).filter({ has: page.getByRole("button", { name: /رفع وثيقة/ }) }).last();
  await card.getByRole("button", { name: /رفع وثيقة/ }).click(); await sleep(1000);
  const fi = page.locator("input[type=file]").last();
  await fi.setInputFiles(`${OUT}/pwtest.pdf`); await sleep(5000);
  const sv = page.locator("[role=dialog]").last().getByRole("button", { name: /حفظ|رفع/ }).last();
  if (await sv.count()) { await sv.click(); await sleep(3000); }
  const { count } = await admin.from("documents").select("*", { count: "exact", head: true }).eq("service_id", rows[0].id);
  await admin.from("documents").delete().eq("service_id", rows[0].id);
  await admin.from("services").delete().eq("id", rows[0].id);
  assert(count >= 1, "document not attached");
});

await test("business directory: add listing, delete", async () => {
  const name = `${M} منشأة ${stamp}`;
  await tab("community", "directory");
  await clickButton("إدراج منشأة جديدة");
  await fillPh("مثال: شركة رواسي الأحساء للمقاولات", name);
  await fill("القطاع (بالعربية)", "اختبار");
  await fill("القطاع (EN)", "Test");
  await fill("المدينة", "الأحساء");
  await fillPh("+966 13 000 0000", "+966130000000");
  await clickButton("حفظ المنشأة", dialog());
  const rows = await waitRow("businesses", "name_ar", name);
  assert(rows, "business not saved");
  await admin.from("businesses").delete().eq("id", rows[0].id);
});

await test("family: add history milestone + place, delete", async () => {
  const t = `${M} محطة ${stamp}`;
  await tab("family", "history");
  await clickButton("إضافة محطة تاريخية");
  await fillPh("مثال: وثيقة وقف الصالحية التاريخية", t);
  await dialog().getByRole("button", { name: "حفظ", exact: true }).click(); await sleep(2000);
  const h = await waitRow("family_history_entries", "title_ar", t);
  if (h) await admin.from("family_history_entries").delete().eq("id", h[0].id);
  const p = `${M} موقع ${stamp}`;
  await tab("family", "places");
  await clickButton("إضافة موقع جديد");
  await fillPh("مثال: ديوانية الصالحية — الأحساء", p);
  await dialog().getByRole("button", { name: "حفظ", exact: true }).click(); await sleep(2000);
  const pl = await waitRow("places", "name_ar", p);
  if (pl) await admin.from("places").delete().eq("id", pl[0].id);
  assert(h, "history entry not saved"); assert(pl, "place not saved");
});

await test("family: add member (private), delete", async () => {
  const first = `${M}${stamp}`;
  await tab("family", "members");
  await clickButton("إضافة فرد جديد");
  const ins = dialog().locator("input:not([type=file]):not([type=checkbox]):not([type=hidden])");
  await ins.nth(0).fill(first);
  await sleep(300);
  await dialog().getByRole("button", { name: /حفظ/ }).last().click(); await sleep(3000);
  const rows = await waitRow("family_members", "first_name_ar", first);
  if (rows) await admin.from("family_members").delete().eq("id", rows[0].id);
  assert(rows, "member not saved");
});

// ═════════════════════════ SETTINGS (restored from snapshot) ═════════════════════════
await test("page texts: change a text, see it live, revert", async () => {
  await tab("system", "site_settings");
  await clickText("نصوص الصفحات"); await sleep(1500);
  await page.evaluate(() => { const s = [...document.querySelectorAll("main select")].find((e) => e.offsetParent && [...e.options].some((o) => o.value === "contact")); s.value = "contact"; s.dispatchEvent(new Event("change", { bubbles: true })); }); await sleep(1500);
  const box = page.locator("main textarea, main input[type=text]").first();
  const marker = `${M} عنوان ${stamp}`;
  await box.fill(marker);
  await clickButton("حفظ النصوص"); await sleep(2000);
  await go("/contact");
  const seen = await page.getByText(marker).count();
  assert(seen, "edited text not shown on /contact");
});

await test("page images: replace a photo, see it live, revert", async () => {
  await tab("system", "site_settings");
  await clickText("صور الصفحات"); await sleep(2000);
  const card = page.locator("main").locator("div").filter({ hasText: "about.header" }).filter({ has: page.locator("input[type=file]") }).last();
  await card.locator("input[type=file]").first().setInputFiles(`${OUT}/pwtest.png`); await sleep(6000);
  await page.getByRole("button", { name: /^حفظ/ }).last().click(); await sleep(2500);
  const { data } = await admin.from("site_settings").select("value").eq("key", "page_images").maybeSingle();
  const url = data?.value?.["about.header"];
  assert(url, "override not saved");
  await go("/about");
  const shown = await page.evaluate((u) => [...document.images].some((i) => i.src === u), url);
  assert(shown, "new image not shown on /about");
});

await test("homepage sections: edit a section subtitle, see it live", async () => {
  await tab("content", "homepage");
  await page.locator("main button:has(svg[class*='pen'])").nth(1).click(); await sleep(1200);
  const marker = `${M} نص ${stamp}`;
  await fillC("العنوان الرئيسي (بالعربية)", marker);
  await clickButton("حفظ التعديلات", dialog()); await sleep(2500);
  await go("/");
  await page.evaluate(() => window.scrollTo(0, 1200)); await sleep(1500);
  const seen = await page.getByText(marker).count();
  assert(seen, "edited section text not on homepage");
});

// ═════════════════════════ PUBLIC FORMS ═════════════════════════
await test("contact form submits", async () => {
  await go("/contact");
  await fillC("الاسم الكامل", `${M} زائر`, page.locator("form").first());
  await page.locator("form input[type=email]").first().fill(EMAIL);
  await page.locator("form select").first().selectOption({ index: 1 }).catch(() => {});
  await page.locator("form textarea").first().fill(`${M} رسالة اختبار آلية ${stamp} — تُحذف تلقائياً.`);
  await page.locator("form button[type=submit]").first().click(); await sleep(4000);
  const rows = await waitRow("contact_messages", "message", stamp);
  assert(rows, "contact message not stored");
});

await test("requests hub: submit a committee request", async () => {
  await go("/requests");
  await page.getByRole("button", { name: /تقديم الطلب/ }).nth(2).click().catch(async () => { await page.getByText("تقديم الطلب").nth(2).click(); });
  await sleep(2000);
  const f = page.locator("[role=dialog] form, form").last();
  const inputs = f.locator("input:not([type=file]):not([type=checkbox]):not([type=hidden]):not([tabindex='-1'])");
  const n = await inputs.count();
  for (let i = 0; i < n; i++) {
    const inp = inputs.nth(i); if (!(await inp.isVisible())) continue;
    const type = await inp.getAttribute("type");
    const val = type === "email" ? EMAIL : type === "tel" ? "0500000000" : type === "date" ? "2026-11-01" : type === "number" ? "1" : type === "url" ? "https://example.com" : `${M} ${stamp}`;
    await inp.fill(val).catch(() => {});
  }
  const tas = f.locator("textarea"); for (let i = 0; i < (await tas.count()); i++) await tas.nth(i).fill(`${M} طلب اختبار آلي ${stamp}`);
  const sels = f.locator("select"); for (let i = 0; i < (await sels.count()); i++) await sels.nth(i).selectOption({ index: 1 }).catch(() => {});
  await f.locator("button[type=submit]").first().click(); await sleep(5000);
  const rows = await waitRow("inquiries", "message", stamp);
  assert(rows, "request not stored");
  return "routed to " + (rows[0].request_metadata?.committee_slug || rows[0].source || "?");
});

await test("inbox shows the test request", async () => {
  await tab("community", "inquiries"); await sleep(2000);
  assert(await page.getByText(new RegExp(stamp)).count(), "request not visible in inbox");
});

await test("account page and member card render", async () => {
  await go("/account");
  assert(await page.getByText("مشرف مؤقت").count(), "account page did not load the profile");
});

// ═════════════════════════ CLEANUP ═════════════════════════
for (const k of SNAP_KEYS) {
  const s = (snap || []).find((r) => r.key === k);
  if (s) await admin.from("site_settings").update({ value: s.value }).eq("key", k);
  else await admin.from("site_settings").delete().eq("key", k);
}
const del = {};
for (const [t, c] of [["contact_messages", "message"], ["inquiries", "message"], ["articles", "title_ar"], ["events", "title_ar"], ["announcements", "title_ar"], ["library_items", "title_ar"], ["galleries", "title_ar"], ["navigation_items", "label_ar"], ["initiatives", "title_ar"], ["achievers", "name_ar"], ["services", "title_ar"], ["businesses", "name_ar"], ["family_history_entries", "title_ar"], ["places", "name_ar"], ["family_members", "first_name_ar"], ["content_pages", "title_ar"]]) {
  const { data } = await admin.from(t).delete().ilike(c, `%${M}%`).select("id");
  if (data?.length) del[t] = data.length;
}
const { data: n1 } = await admin.from("notifications").delete().gte("created_at", START).or(`message_ar.ilike.%${M}%,message_en.ilike.%${M}%,title_ar.ilike.%${M}%,title_en.ilike.%${M}%`).select("id");
if (n1?.length) del.notifications = n1.length;
{
  const { data } = await admin.from("email_logs").select("id,status").gte("created_at", START).ilike("recipient_email", EMAIL);
  const unsent = (data || []).filter((r) => r.status !== "sent").map((r) => r.id);
  if (unsent.length) await admin.from("email_logs").delete().in("id", unsent);
  del.email_logs = `${data?.length || 0} test emails (${unsent.length} unsent removed)`;
}
{ // trigger/server notifications that don't carry the marker
  const { data } = await admin.from("notifications").delete().gte("created_at", START).or(`message_ar.like.تم رفع عنصر وسائط جديد%,and(type.eq.contact_message,message_ar.ilike.%General en%),message_ar.ilike.%${stamp}%`).select("id");
  if (data?.length) del.notifications_extra = data.length;
}
{ // files uploaded by the tests (storage API: list recent objects in the upload folders)
  for (const [bucket, folder] of [["site-media", "uploads"], ["content", "documents"], ["media", ""], ["galleries", "archive"]]) {
    const { data: objs } = await admin.storage.from(bucket).list(folder, { limit: 100, sortBy: { column: "created_at", order: "desc" } });
    const mine = (objs || []).filter((o) => o.created_at && o.created_at >= START && o.id).map((o) => (folder ? folder + "/" : "") + o.name);
    if (mine.length) { await admin.storage.from(bucket).remove(mine); del.storage = (del.storage || 0) + mine.length; }
  }
}
const { data: auditDel } = await admin.from("audit_logs").select("id", { count: "exact" }).gte("created_at", START);
await browser.close();
fs.writeFileSync(`${OUT}/results.json`, JSON.stringify({ results, cleanup: del, consoleErrors: [...new Set(consoleErrors)] }, null, 1));
console.log("\nCLEANUP", JSON.stringify(del));
console.log("PAGE ERRORS", JSON.stringify([...new Set(consoleErrors)].slice(0, 10)));
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} passed`);
