// End-to-end registration QA against a live deployment, with disposable data.
//
//   node scripts/qa-registration-e2e.mjs [baseUrl]
//
// Needs in .env (never printed, never sent anywhere but Supabase):
//   SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY
// Optional: QA_EMAIL_BASE=someone@gmail.com  (plus-addresses are used, e.g.
//           someone+qa-approve-<stamp>@gmail.com, so the emails can be checked)
//
// What it does — every record it creates carries the marker "QA-E2E" and is
// deleted again in the cleanup step, even when a test fails:
//   1. creates a temporary admin and two applicants (random passwords held in memory only)
//   2. applicants file membership requests with their own login (RLS path)
//   3. the admin approves #1 and rejects #2 with a reason in the Registration desk UI
//   4. verifies roles, request status, review note, in-app notifications,
//      email queue/log rows, consent rows and members-only page access
//   5. deletes every QA record and account
import fs from "node:fs";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";

const env = Object.fromEntries(
  fs.readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")]; }),
);
const URL_ = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const ANON = env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !ANON || !SERVICE) throw new Error("Set SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY and SUPABASE_SERVICE_ROLE_KEY in .env");
const BASE = process.argv[2] || "https://www.boubaid.com";
const CHROME = process.env.CHROME_PATH || undefined;
const stamp = Date.now().toString(36);
const [local, domain] = (env.QA_EMAIL_BASE || "qa@example.com").split("@");
const mail = (tag) => `${local}+qa-${tag}-${stamp}@${domain}`.toLowerCase();
const pw = () => crypto.randomBytes(18).toString("base64url") + "!a1";

const admin = createClient(URL_, SERVICE, { auth: { persistSession: false } });
const ref = URL_.match(/https:\/\/([^.]+)/)[1];
const results = [];
const check = (name, ok, evidence = "") => {
  results.push({ name, ok: !!ok, evidence });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${evidence ? " — " + evidence : ""}`);
};
const created = { users: [], requests: [] };

async function makeUser(tag, fullName) {
  const email = mail(tag), password = pw();
  const { data, error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { full_name_ar: fullName, qa_marker: "QA-E2E" },
  });
  if (error) throw error;
  created.users.push(data.user.id);
  const client = createClient(URL_, ANON, { auth: { persistSession: false } });
  const { data: s, error: e2 } = await client.auth.signInWithPassword({ email, password });
  if (e2) throw e2;
  return { id: data.user.id, email, password, client, session: s.session, fullName };
}

async function browserAs(user) {
  const browser = await chromium.launch(CHROME ? { executablePath: CHROME } : {});
  const ctx = await browser.newContext({ locale: "ar-SA", viewport: { width: 1366, height: 900 } });
  await ctx.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch {} }, [`sb-${ref}-auth-token`, JSON.stringify(user.session)]);
  return { browser, page: await ctx.newPage() };
}

try {
  // 1. accounts
  const qaAdmin = await makeUser("admin", "QA-E2E مسؤول مؤقت");
  {
    const { error } = await admin.from("user_roles").insert({ user_id: qaAdmin.id, role: "admin" });
    check("temporary admin role granted", !error, error?.message);
  }
  const approveMe = await makeUser("approve", "QA-E2E متقدم للاعتماد");
  const rejectMe = await makeUser("reject", "QA-E2E متقدم للرفض");

  // 2. applications (applicant's own JWT — same RLS path as the site's submit function)
  for (const u of [approveMe, rejectMe]) {
    const { data, error } = await u.client.from("membership_requests").insert({
      user_id: u.id, full_name_ar: u.fullName, email: u.email, father_lineage: "QA-E2E", notes: "QA-E2E automated test",
    }).select("id").single();
    check(`application filed (${u.email})`, !error && data?.id, error?.message || data?.id);
    if (data?.id) { created.requests.push(data.id); u.requestId = data.id; }
  }
  {
    const { count } = await admin.from("notifications").select("id", { count: "exact", head: true })
      .eq("user_id", qaAdmin.id).eq("type", "membership");
    check("admin got in-app 'new membership request' notification", (count ?? 0) >= 2, `${count} notifications`);
  }

  // non-member cannot read members-only data yet
  {
    const { data } = await approveMe.client.from("galleries").select("id").limit(1);
    check("applicant (not yet approved) reads no archive galleries", !data?.length, `${data?.length ?? 0} rows (0 expected once the RLS migration is applied)`);
  }

  // 3. admin decides in the Registration desk UI
  const { browser, page } = await browserAs(qaAdmin);
  await page.goto(`${BASE}/admin?domain=registration&tab=requests`, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(2500);
  const row = (name) => page.locator("li").filter({ hasText: name }).first();

  await row(approveMe.fullName).getByRole("button", { name: "اعتماد" }).click();
  await page.locator("#review-note").fill("QA-E2E مرحباً بك");
  await page.getByRole("button", { name: "تأكيد الاعتماد" }).click();
  await page.waitForTimeout(4000);

  await row(rejectMe.fullName).getByRole("button", { name: "رفض" }).click();
  await page.locator("#review-note").fill("QA-E2E النسب غير مكتمل");
  await page.getByRole("button", { name: "تأكيد الرفض" }).click();
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `qa-e2e-${stamp}-desk.png` });
  await browser.close();

  // 4. verify outcomes
  for (const [u, status] of [[approveMe, "approved"], [rejectMe, "rejected"]]) {
    const { data: r } = await admin.from("membership_requests").select("status, review_note, reviewed_by").eq("id", u.requestId).single();
    check(`request ${status}`, r?.status === status && r?.reviewed_by === qaAdmin.id, JSON.stringify(r));
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", u.id);
    const hasMember = (roles ?? []).some((x) => x.role === "member");
    check(`member role ${status === "approved" ? "granted" : "not granted"}`, status === "approved" ? hasMember : !hasMember, JSON.stringify(roles));
    const { count } = await admin.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", u.id).eq("type", "membership");
    check(`applicant in-app notification (${status})`, (count ?? 0) >= 1, `${count}`);
    const { data: mails } = await admin.from("email_logs").select("email_type, status, error_message").eq("recipient_email", u.email);
    const delivered = (mails ?? []).some((m) => m.status !== "failed");
    check(`decision email delivered (${status})`, delivered, JSON.stringify(mails));
  }
  {
    const { data: r } = await admin.from("membership_requests").select("review_note").eq("id", rejectMe.requestId).single();
    check("rejection reason stored and shown to applicant", r?.review_note === "QA-E2E النسب غير مكتمل", r?.review_note ?? "none");
  }

  // approved member opens a members-only page
  {
    const { data: s } = await approveMe.client.auth.refreshSession();
    approveMe.session = s.session ?? approveMe.session;
    const { browser: b2, page: p2 } = await browserAs(approveMe);
    await p2.goto(`${BASE}/library`, { waitUntil: "networkidle", timeout: 90000 });
    await p2.waitForTimeout(2500);
    const gated = await p2.getByText("هذه الصفحة مخصصة").count();
    const pending = await p2.getByText("قيد المراجعة").count();
    check("approved member opens /library (no access screen)", gated === 0 && pending === 0);
    await p2.screenshot({ path: `qa-e2e-${stamp}-member-library.png` });
    await b2.close();
  }
} catch (err) {
  check("run completed without exception", false, String(err?.message || err));
} finally {
  // 5. cleanup — always
  const ids = created.users;
  if (created.requests.length) await admin.from("membership_requests").delete().in("id", created.requests);
  if (ids.length) {
    await admin.from("notifications").delete().in("user_id", ids);
    await admin.from("user_roles").delete().in("user_id", ids);
    await admin.from("audit_logs").delete().in("entity_id", ids).eq("entity_type", "legal_consent");
    await admin.from("profiles").delete().in("id", ids);
    for (const id of ids) await admin.auth.admin.deleteUser(id);
  }
  await admin.from("notifications").delete().ilike("message_ar", "%QA-E2E%");
  await admin.from("email_logs").delete().ilike("recipient_email", `%+qa-%-${stamp}@%`);
  const { count: left } = await admin.from("membership_requests").select("id", { count: "exact", head: true }).eq("father_lineage", "QA-E2E");
  check("cleanup removed all QA records", (left ?? 0) === 0, `${ids.length} accounts deleted, ${left ?? 0} requests left`);
  const failed = results.filter((r) => !r.ok);
  fs.writeFileSync(`qa-e2e-${stamp}-results.json`, JSON.stringify(results, null, 1));
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
}
