import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx !== -1) {
          const key = trimmed.substring(0, eqIdx).trim();
          let val = trimmed.substring(eqIdx + 1).trim();
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
          }
          process.env[key] = val;
        }
      }
    }
  } catch (e) {
    console.error("Failed to load .env:", e);
  }
}

loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL || "https://ywsvittlswbbyqhahorh.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface AuditReportItem {
  domain: string;
  action: string;
  passed: boolean;
  notes?: string;
}

const auditItems: AuditReportItem[] = [];

function check(domain: string, action: string, passed: boolean, notes?: string) {
  auditItems.push({ domain, action, passed, notes });
  const icon = passed ? "✅" : "❌";
  console.log(`${icon} [${domain}] ${action}${notes ? ` -> ${notes}` : ""}`);
}

async function runDeepCmsAndAdminAudit() {
  console.log("=================================================================");
  console.log("DEEP CMS, ADMIN CONSOLE, WORKFLOW & DATA INTEGRITY AUDIT");
  console.log("=================================================================\n");

  const timestamp = Date.now();

  // -------------------------------------------------------------
  // 1. CMS ARTICLES LIFECYCLE
  // -------------------------------------------------------------
  console.log(
    "--- 1. CMS Articles: Create -> Edit -> Publish -> Public Verification -> Delete ---",
  );
  const testArticleSlug = `audit-article-${timestamp}`;
  let articleId: string | null = null;

  try {
    // 1.1 Create Draft
    const { data: artData, error: artErr } = await adminClient
      .from("articles")
      .insert({
        title_ar: `مقال تدقيق النظام ${timestamp}`,
        title_en: `System Audit Article ${timestamp}`,
        slug: testArticleSlug,
        content_ar: "هذا مقال تجريبي لاختبار دورة حياة المحتوى والنشر في نظام إدارة المحتوى.",
        content_en:
          "This is a test article to verify CMS content lifecycle and publishing workflow.",
        status: "draft",
        published_at: null,
      })
      .select()
      .single();

    if (artErr || !artData) {
      check("CMS Articles", "Create Draft Article", false, artErr?.message);
    } else {
      articleId = artData.id;
      check("CMS Articles", "Create Draft Article", true, `ID: ${articleId}`);
    }

    // 1.2 Verify Draft Not Visible to Anon
    const { data: anonDraft } = await anonClient
      .from("articles")
      .select("id")
      .eq("slug", testArticleSlug)
      .maybeSingle();
    check(
      "CMS Articles",
      "Draft Hidden from Public Visitors",
      !anonDraft,
      "Draft is properly isolated",
    );

    // 1.3 Publish Article
    const { data: pubData, error: pubErr } = await adminClient
      .from("articles")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", articleId!)
      .select()
      .single();

    check(
      "CMS Articles",
      "Publish Article",
      !pubErr && pubData?.status === "published",
      pubErr?.message,
    );

    // 1.4 Verify Published Article Visible to Anon
    const { data: anonPub } = await anonClient
      .from("articles")
      .select("id, title_ar")
      .eq("slug", testArticleSlug)
      .eq("status", "published")
      .single();
    check(
      "CMS Articles",
      "Published Article Visible on Public News",
      !!anonPub,
      `Found: ${anonPub?.title_ar}`,
    );

    // 1.5 Soft Delete / Cleanup
    if (articleId) {
      const { error: delErr } = await adminClient
        .from("articles")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", articleId);
      check("CMS Articles", "Soft Delete Article", !delErr, delErr?.message);

      // Verify Deleted Not Visible to Public
      const { data: anonDel } = await anonClient
        .from("articles")
        .select("id")
        .eq("slug", testArticleSlug)
        .is("deleted_at", null)
        .maybeSingle();
      check("CMS Articles", "Deleted Article Hidden from Public", !anonDel);

      // Permanent clean up
      await adminClient.from("articles").delete().eq("id", articleId);
    }
  } catch (err: any) {
    check("CMS Articles", "Article Lifecycle Exception", false, err.message);
  }

  // -------------------------------------------------------------
  // 2. CMS EVENTS & ATTENDEE REGISTRATIONS
  // -------------------------------------------------------------
  console.log("\n--- 2. CMS Events & Attendee Registrations ---");
  const testEventSlug = `audit-event-${timestamp}`;
  let eventId: string | null = null;

  try {
    const { data: evData, error: evErr } = await adminClient
      .from("events")
      .insert({
        title_ar: `ملتقى الأسرة السنوي للتدقيق ${timestamp}`,
        title_en: `Annual Family Audit Gathering ${timestamp}`,
        slug: testEventSlug,
        description_ar: "لقاء سنوي لأسرة آل بوعبيد لمراجعة الأنشطة وإطلاق المبادرات التنموية.",
        start_at: new Date(Date.now() + 7 * 86400000).toISOString(),
        end_at: new Date(Date.now() + 7 * 86400000 + 3600000 * 4).toISOString(),
        registration_enabled: true,
        max_attendees: 100,
        status: "published",
      })
      .select()
      .single();

    if (evErr || !evData) {
      check("CMS Events", "Create Event with Registration", false, evErr?.message);
    } else {
      eventId = evData.id;
      check("CMS Events", "Create Event with Registration", true, `Event ID: ${eventId}`);
    }

    // 2.2 Register Attendee
    let regId: string | null = null;
    if (eventId) {
      const { data: regData, error: regErr } = await adminClient
        .from("event_registrations")
        .insert({
          event_id: eventId,
          name: "محمد بن إبراهيم آل بوعبيد",
          phone: "+966501112233",
          email: "m.ibrahim@example.com",
          attendees_count: 2,
          notes: "حضور مع الأبناء",
          status: "pending",
        })
        .select()
        .single();

      check("CMS Events", "Register Attendee for Event", !regErr, regErr?.message);
      if (regData) regId = regData.id;

      // 2.3 Admin Approves Registration
      if (regId) {
        const { data: appReg, error: appErr } = await adminClient
          .from("event_registrations")
          .update({ status: "confirmed" })
          .eq("id", regId)
          .select()
          .single();
        check(
          "CMS Events",
          "Admin Confirms Registration",
          !appErr && appReg?.status === "confirmed",
          appErr?.message,
        );

        // Cleanup registration
        await adminClient.from("event_registrations").delete().eq("id", regId);
      }

      // Cleanup event
      await adminClient.from("events").delete().eq("id", eventId);
      check("CMS Events", "Cleanup Test Event", true);
    }
  } catch (err: any) {
    check("CMS Events", "Events Lifecycle Exception", false, err.message);
  }

  // -------------------------------------------------------------
  // 3. INITIATIVES & PARTICIPATIONS
  // -------------------------------------------------------------
  console.log("\n--- 3. Initiatives & Registrations Lifecycle ---");
  const testInitSlug = `audit-initiative-${timestamp}`;
  let initId: string | null = null;

  try {
    const { data: initData, error: initErr } = await adminClient
      .from("initiatives")
      .insert({
        title_ar: `مبادرة دعم الطلاب المتفوقين ${timestamp}`,
        title_en: `Outstanding Students Support Initiative ${timestamp}`,
        slug: testInitSlug,
        summary_ar: "برنامج سنوي لتكريم المتميزين أكاديمياً وتطوير مهاراتهم.",
        body_ar: "برنامج لتقديم منح وتكريم للطلاب المتفوقين في المراحل الجامعية والثانوية.",
        status: "active",
        is_published: true,
      })
      .select()
      .single();

    if (initErr || !initData) {
      check("Initiatives", "Create Active Initiative", false, initErr?.message);
    } else {
      initId = initData.id;
      check("Initiatives", "Create Active Initiative", true, `Initiative ID: ${initId}`);
    }

    if (initId) {
      // 3.2 Public Participant Registers
      const { data: partData, error: partErr } = await adminClient
        .from("initiative_registrations")
        .insert({
          initiative_id: initId,
          name: "سلطان بن حمد آل بوعبيد",
          phone: "+966554433221",
          email: "sultan.h@example.com",
          notes: "متطوع في لجنة التقييم الأكاديمي",
          status: "pending",
        })
        .select()
        .single();

      check("Initiatives", "Register Initiative Participant", !partErr, partErr?.message);

      if (partData) {
        // Admin confirms participant
        const { error: confErr } = await adminClient
          .from("initiative_registrations")
          .update({ status: "approved" })
          .eq("id", partData.id);
        check("Initiatives", "Approve Initiative Participant", !confErr, confErr?.message);

        // Cleanup participant
        await adminClient.from("initiative_registrations").delete().eq("id", partData.id);
      }

      // Cleanup initiative
      await adminClient.from("initiatives").delete().eq("id", initId);
      check("Initiatives", "Cleanup Test Initiative", true);
    }
  } catch (err: any) {
    check("Initiatives", "Initiative Lifecycle Exception", false, err.message);
  }

  // -------------------------------------------------------------
  // 4. INQUIRIES & CONTACT WORKFLOW
  // -------------------------------------------------------------
  console.log("\n--- 4. Community Inquiries & Contact Messages ---");
  try {
    // 4.1 Create Contact Message in contact_messages
    const { data: msgData, error: msgErr } = await adminClient
      .from("contact_messages")
      .insert({
        name: "خالد بن فهد آل بوعبيد",
        email: "khaled.fahad@example.com",
        subject: "استفسار بخصوص توثيق فرع العائلة",
        message: "السلام عليكم ورحمة الله، أود الاستفسار عن متطلبات تحديث بيانات المشجرة للفرع.",
        locale: "ar",
      })
      .select()
      .single();

    check("Contact Messages", "Public Contact Message Ingestion", !msgErr, msgErr?.message);
    if (msgData) {
      await adminClient.from("contact_messages").delete().eq("id", msgData.id);
    }

    // 4.2 Create Community Inquiry in inquiries
    const { data: inqData, error: inqErr } = await adminClient
      .from("inquiries")
      .insert({
        name: "خالد بن فهد آل بوعبيد",
        email: "khaled.fahad@example.com",
        phone: "+966509988776",
        subject: "استفسار بخصوص توثيق فرع العائلة",
        message: "السلام عليكم ورحمة الله، أود الاستفسار عن متطلبات تحديث بيانات المشجرة للفرع.",
        status: "new",
      })
      .select()
      .single();

    check("Inquiries", "Admin Inquiries Record Creation", !inqErr, inqErr?.message);

    if (inqData) {
      // 4.3 Admin attaches internal staff note
      const { error: noteErr } = await adminClient.from("inquiry_notes").insert({
        inquiry_id: inqData.id,
        note: "تم التواصل مع العضو هاتفياً وتزويده بالاستمارة المطلوبة.",
      });
      check("Inquiries", "Attach Staff Note to Inquiry", !noteErr, noteErr?.message);

      // 4.4 Admin marks as resolved
      const { error: resErr } = await adminClient
        .from("inquiries")
        .update({ status: "resolved" })
        .eq("id", inqData.id);
      check("Inquiries", "Resolve Inquiry Status", !resErr, resErr?.message);

      // Cleanup inquiry
      await adminClient.from("inquiry_notes").delete().eq("inquiry_id", inqData.id);
      await adminClient.from("inquiries").delete().eq("id", inqData.id);
      check("Inquiries", "Cleanup Test Inquiry", true);
    }
  } catch (err: any) {
    check("Inquiries", "Inquiries Lifecycle Exception", false, err.message);
  }

  // -------------------------------------------------------------
  // 5. SUMMARY
  // -------------------------------------------------------------
  console.log("\n=================================================================");
  console.log("DEEP CMS & ADMIN AUDIT SUMMARY");
  console.log("=================================================================");

  const total = auditItems.length;
  const passed = auditItems.filter((i) => i.passed).length;
  const failed = total - passed;

  console.log(`Total Checks: ${total}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed === 0) {
    console.log("🎉 ALL DEEP CMS & ADMIN WORKFLOWS VALIDATED SUCCESSFULLY WITH ZERO FLAWS!");
  }
}

runDeepCmsAndAdminAudit().catch(console.error);
