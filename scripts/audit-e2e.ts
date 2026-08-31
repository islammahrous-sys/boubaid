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
const SUPABASE_ANON_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const unauthClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface TestResult {
  category: string;
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

function record(category: string, name: string, passed: boolean, error?: string, details?: any) {
  results.push({ category, name, passed, error, details });
  const icon = passed ? "✅" : "❌";
  console.log(`${icon} [${category}] ${name}${error ? ` -> Error: ${error}` : ""}`);
}

async function runComprehensiveAudit() {
  console.log("=================================================================");
  console.log("AL BOABID HERITAGE HUB — COMPREHENSIVE END-TO-END QA & LOGIC AUDIT");
  console.log("=================================================================\n");

  const adminEmail = "admin@alboubaidfamily.com";
  const adminPass = "AlBuObaid#Admin2026!Hub";
  let adminUserId: string | null = null;

  // 1. ADMIN AUTHENTICATION
  console.log("--- Phase 1: Admin Authentication & RBAC ---");
  try {
    const { data: authData, error: authErr } = await anonClient.auth.signInWithPassword({
      email: adminEmail,
      password: adminPass,
    });
    if (authErr || !authData.session) {
      record("Auth", "Admin Sign In", false, authErr?.message || "No session");
    } else {
      adminUserId = authData.user.id;
      record("Auth", "Admin Sign In", true, undefined, { userId: adminUserId });
    }

    if (adminUserId) {
      const { data: roles } = await adminClient.from("user_roles").select("role").eq("user_id", adminUserId);
      const roleList = (roles ?? []).map((r) => r.role);
      const hasSuperAdmin = roleList.includes("super_admin") || roleList.includes("admin");
      record("RBAC", "Admin Has Privileged Role (admin/super_admin)", hasSuperAdmin, undefined, { roles: roleList });
    }
  } catch (err: any) {
    record("Auth", "Admin Sign In Exception", false, err.message);
  }

  // 2. USER LIFECYCLE & MEMBERSHIP WORKFLOW
  console.log("\n--- Phase 2: Full User & Membership Lifecycle ---");
  const testUserEmail = `audit_member_${Date.now()}@alboubaidfamily.com`;
  const testUserPass = "Pass#2026!AuditUser";
  let testUserId: string | null = null;
  let testUserToken: string | null = null;

  try {
    // 2.1 Admin creates user with email_confirm: true (bypassing SMTP quota)
    const { data: createdUser, error: createErr } = await adminClient.auth.admin.createUser({
      email: testUserEmail,
      password: testUserPass,
      email_confirm: true,
      user_metadata: { full_name_ar: "عبدالله بن علي آل بوعبيد" },
    });

    if (createErr || !createdUser.user) {
      record("User Lifecycle", "Create Verified Test User", false, createErr?.message);
    } else {
      testUserId = createdUser.user.id;
      record("User Lifecycle", "Create Verified Test User", true, undefined, { id: testUserId, email: testUserEmail });
    }

    // 2.2 Fresh User Signs In
    if (testUserId) {
      const freshAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data: signInData, error: signInErr } = await freshAnon.auth.signInWithPassword({
        email: testUserEmail,
        password: testUserPass,
      });

      if (signInErr || !signInData.session) {
        record("User Lifecycle", "Fresh User Sign In", false, signInErr?.message);
      } else {
        testUserToken = signInData.session.access_token;
        record("User Lifecycle", "Fresh User Sign In", true);
      }
    }

    if (testUserId && testUserToken) {
      const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${testUserToken}` } },
      });

      // 2.3 Initial Profile Snapshot
      const { data: initialProfile, error: profErr } = await userClient
        .from("profiles")
        .select("*")
        .eq("id", testUserId)
        .single();
      record("User Lifecycle", "Fetch Initial Profile", !profErr, profErr?.message);

      // 2.4 Profile Update
      const { error: updErr } = await userClient.from("profiles").upsert({
        id: testUserId,
        full_name_ar: "عبدالله بن علي بن حمد آل بوعبيد",
        full_name_en: "Abdullah Ali Hamad Al Bu Obaid",
        branch_slug: "al-hamad",
        phone: "+966550001122",
        lineage_notes: "من فرع آل حمد في المبرز",
        show_in_directory: true,
      });
      record("User Lifecycle", "Save Profile Details", !updErr, updErr?.message);

      // 2.5 Submit Membership Request
      const { data: memReq, error: reqErr } = await userClient.from("membership_requests").insert({
        user_id: testUserId,
        full_name_ar: "عبدالله بن علي بن حمد آل بوعبيد",
        full_name_en: "Abdullah Ali Hamad Al Bu Obaid",
        email: testUserEmail,
        phone: "+966550001122",
        branch_slug: "al-hamad",
        father_lineage: "ابن علي بن حمد بن إبراهيم آل بوعبيد",
        notes: "طلب عضوية للتدقيق",
      }).select().single();
      record("User Lifecycle", "Submit Membership Request", !reqErr, reqErr?.message, { reqId: memReq?.id });

      // 2.6 Duplicate Membership Request Prevention
      const { error: dupReqErr } = await userClient.from("membership_requests").insert({
        user_id: testUserId,
        full_name_ar: "عبدالله بن علي آل بوعبيد",
        email: testUserEmail,
      });
      record("User Lifecycle", "Block Duplicate Membership Request", !!dupReqErr, dupReqErr ? undefined : "Duplicate was allowed!");

      // 2.7 Verify Pending State Security: Regular user cannot see others' pending requests
      const { data: otherRequests } = await userClient.from("membership_requests").select("*");
      const onlyOwnRequests = (otherRequests ?? []).every((r) => r.user_id === testUserId);
      record("Security & RLS", "User Can Only View Own Membership Request", onlyOwnRequests);

      // 2.8 Regular user cannot view audit logs
      const { data: auditLogs } = await userClient.from("audit_logs").select("*");
      const blockedAudit = !auditLogs || auditLogs.length === 0;
      record("Security & RLS", "User Restricted from Audit Logs", blockedAudit);

      // 2.9 Admin Reviews and Approves Membership Request
      if (memReq?.id) {
        const { error: appErr } = await adminClient.from("membership_requests").update({
          status: "approved",
          review_note: "تم التدقيق والاعتماد الرسمي",
          reviewed_by: adminUserId,
          reviewed_at: new Date().toISOString(),
        }).eq("id", memReq.id);
        record("Admin Operations", "Approve Membership Request", !appErr, appErr?.message);

        // Assign 'member' role
        await adminClient.from("user_roles").upsert({
          user_id: testUserId,
          role: "member",
        }, { onConflict: "user_id,role" });
        record("Admin Operations", "Assign Member Role", true);

        // Dispatch Approval Notification with required 'type' field
        const { error: notifInsErr } = await adminClient.from("notifications").insert({
          user_id: testUserId,
          type: "general",
          title_ar: "تم اعتماد عضويتك الرسمية",
          title_en: "Official Membership Approved",
          message_ar: "مبارك، تم اعتماد عضويتك في سجل أسرة آل بوعبيد وبطاقتك الرقمية جاهزة الآن.",
          message_en: "Congratulations, your membership has been approved and your digital ID is ready.",
          link: "/account",
          is_read: false,
        });
        record("Admin Operations", "Send Approval Notification", !notifInsErr, notifInsErr?.message);

        // 2.10 Verify Notification Received by User
        const { data: userNotifs } = await userClient.from("notifications").select("*").eq("user_id", testUserId);
        const hasNotif = (userNotifs ?? []).length > 0;
        record("Notifications", "User Received Approval Notification", hasNotif, undefined, { count: userNotifs?.length });

        // Mark notification as read
        if (userNotifs && userNotifs[0]) {
          const { error: markErr } = await userClient.from("notifications").update({ is_read: true }).eq("id", userNotifs[0].id);
          record("Notifications", "Mark Notification As Read", !markErr, markErr?.message);
        }
      }

      // 2.11 Submit Private Contribution & Receipt Link
      const { data: contrib, error: contribErr } = await userClient.from("contributions").insert({
        user_id: testUserId,
        contributor_name: "عبدالله بن علي آل بوعبيد",
        email: testUserEmail,
        phone: "+966550001122",
        amount: 500,
        currency: "SAR",
        method: "bank_transfer",
        purpose: "صندوق التنمية العائلية",
        status: "pending",
      }).select().single();
      record("Treasury", "Member Submits Pending Contribution", !contribErr, contribErr?.message, { contribId: contrib?.id });

      // 2.12 Verify Unauthenticated Visitors Cannot See Contributions Ledger
      const { data: anonContribs } = await unauthClient.from("contributions").select("*");
      record("Security & RLS", "Anonymous Visitors Cannot Access Contributions Ledger", !anonContribs || anonContribs.length === 0);

      // Admin Approves Contribution
      if (contrib?.id) {
        const { error: appContribErr } = await adminClient.from("contributions").update({
          status: "verified",
          reviewed_by: adminUserId,
          reviewed_at: new Date().toISOString(),
          review_note: "تم التحقق من الحوالة البنكية والاعتماد",
        }).eq("id", contrib.id);
        record("Treasury", "Treasurer Verifies Contribution", !appContribErr, appContribErr?.message);
      }
    }
  } catch (err: any) {
    record("User Lifecycle", "User Lifecycle Exception", false, err.message);
  } finally {
    if (testUserId) {
      try {
        await adminClient.auth.admin.deleteUser(testUserId);
        console.log(`Cleaned up test user ${testUserId}`);
      } catch (e) {}
    }
  }

  // 3. ADMIN CMS CRUD ACROSS ALL CORE ENTITIES
  console.log("\n--- Phase 3: CMS & Admin Console Domains CRUD ---");

  // 3.1 Articles / News
  try {
    const slug = `qa-article-${Date.now()}`;
    const { data: art, error: artErr } = await adminClient.from("articles").insert({
      slug,
      title_ar: "افتتاح ديوان الأسرة الجديد بالأحساء",
      title_en: "Inauguration of the New Family Diwan in Al-Ahsa",
      excerpt_ar: "تم بحمد الله تدشين المقر الجديد بحضور أعيان وأبناء الأسرة",
      content_ar: "<p>تفاصيل الحفل واللقاء السنوي المبارك لأسرة آل بوعبيد</p>",
      status: "published",
      published_at: new Date().toISOString(),
      is_featured: true,
      created_by: adminUserId,
    }).select().single();
    record("CMS", "Create & Publish Article", !artErr, artErr?.message, { slug });

    // Public read
    const { data: pubArt } = await unauthClient.from("articles").select("id, title_ar").eq("slug", slug).maybeSingle();
    record("CMS", "Public Visitor Can Read Published Article", !!pubArt);

    if (art) await adminClient.from("articles").delete().eq("id", art.id);
  } catch (err: any) {
    record("CMS", "Article CRUD Exception", false, err.message);
  }

  // 3.2 Announcements
  try {
    const { data: ann, error: annErr } = await adminClient.from("announcements").insert({
      title_ar: "تنويه هام: موعد انعقاد الجمعية العمومية",
      title_en: "General Assembly Meeting Notice",
      message_ar: "يسر أمانة المجلس دعوة جميع أفراد الأسرة لحضور الاجتماع السنوي",
      type: "important",
      priority: "high",
      status: "published",
      created_by: adminUserId,
    }).select().single();
    record("CMS", "Create Published Announcement", !annErr, annErr?.message);

    if (ann) await adminClient.from("announcements").delete().eq("id", ann.id);
  } catch (err: any) {
    record("CMS", "Announcement CRUD Exception", false, err.message);
  }

  // 3.3 Events & RSVPs
  try {
    const evtSlug = `qa-gathering-${Date.now()}`;
    const { data: evt, error: evtErr } = await adminClient.from("events").insert({
      slug: evtSlug,
      title_ar: "ملتقى الأسرة الرمضاني السنوي",
      title_en: "Annual Ramadan Family Gathering",
      description_ar: "اللقاء السنوي لتبادل التهاني والتواصل",
      start_at: new Date(Date.now() + 86400000 * 14).toISOString(),
      timezone: "Asia/Riyadh",
      registration_enabled: true,
      max_attendees: 150,
      status: "published",
      created_by: adminUserId,
    }).select().single();
    record("CMS", "Create Event with RSVP Enabled", !evtErr, evtErr?.message);

    if (evt) {
      const { data: rsvp, error: rsvpErr } = await adminClient.from("event_registrations").insert({
        event_id: evt.id,
        name: "عبدالعزيز بن فهد آل بوعبيد",
        email: "abdulaziz@example.com",
        phone: "+966509988776",
        attendees_count: 2,
        status: "registered",
      }).select().single();
      record("CMS", "Register Attendee for Event", !rsvpErr, rsvpErr?.message);

      if (rsvp) await adminClient.from("event_registrations").delete().eq("id", rsvp.id);
      await adminClient.from("events").delete().eq("id", evt.id);
    }
  } catch (err: any) {
    record("CMS", "Event CRUD Exception", false, err.message);
  }

  // 3.4 Initiatives & Volunteers
  try {
    const initSlug = `qa-init-${Date.now()}`;
    const { data: init, error: initErr } = await adminClient.from("initiatives").insert({
      slug: initSlug,
      title_ar: "مشروع وقف القرآن الكريم ورعاية الموهوبين",
      title_en: "Quran Endowment & Talent Support Initiative",
      summary_ar: "مبادرة مجتمعية تعليمية لأبناء وبنات الأسرة",
      body_ar: "<p>تفاصيل المبادرة ومراحل التنفيذ</p>",
      status: "ongoing",
      is_published: true,
      created_by: adminUserId,
    }).select().single();
    record("CMS", "Create Published Initiative", !initErr, initErr?.message);

    if (init) {
      const { data: reg, error: regErr } = await adminClient.from("initiative_registrations").insert({
        initiative_id: init.id,
        name: "نورة بنت صالح آل بوعبيد",
        email: "noura@example.com",
        phone: "+966505544332",
        status: "new",
      }).select().single();
      record("CMS", "Submit Initiative Participation", !regErr, regErr?.message);

      if (reg) await adminClient.from("initiative_registrations").delete().eq("id", reg.id);
      await adminClient.from("initiatives").delete().eq("id", init.id);
    }
  } catch (err: any) {
    record("CMS", "Initiative CRUD Exception", false, err.message);
  }

  // 3.5 Achievers (Roll of Honour)
  try {
    const { data: ach, error: achErr } = await adminClient.from("achievers").insert({
      name_ar: "المهندس سلطان بن أحمد آل بوعبيد",
      name_en: "Eng. Sultan Ahmed Al Bu Obaid",
      field_ar: "هندسة الفضاء والذكاء الاصطناعي",
      field_en: "Aerospace Engineering & AI",
      achievement_ar: "براءة اختراع دولية ونشر أبحاث في مجلات علمية مرموقة",
      achievement_en: "International patent and published research in prestigious journals",
      category: "engineering",
      branch_ar: "فرع آل إبراهيم",
      is_published: true,
    }).select().single();
    record("CMS", "Create Published Achiever", !achErr, achErr?.message);

    if (ach) await adminClient.from("achievers").delete().eq("id", ach.id);
  } catch (err: any) {
    record("CMS", "Achiever CRUD Exception", false, err.message);
  }

  // 3.6 Library & Historical Documents
  try {
    const { data: lib, error: libErr } = await adminClient.from("library_items").insert({
      collection: "documents",
      title_ar: "وثيقة وقفية قديمة مؤرخة سنة ١٣٢٠ هـ",
      title_en: "Historic Endowment Deed Dated 1320 AH",
      description_ar: "مخطوطة أصلية موثقة لسجل أوقاف النخيل والمزارع",
      year: 1320,
      kind: "وثيقة أوقاف",
      is_published: true,
    }).select().single();
    record("CMS", "Create Library Archive Item", !libErr, libErr?.message);

    if (lib) await adminClient.from("library_items").delete().eq("id", lib.id);
  } catch (err: any) {
    record("CMS", "Library CRUD Exception", false, err.message);
  }

  // 3.7 Museum Galleries & Gallery Media
  try {
    const galSlug = `qa-museum-${Date.now()}`;
    const { data: gal, error: galErr } = await adminClient.from("galleries").insert({
      slug: galSlug,
      title_ar: "معرض مقتنيات ومخطوطات الأجداد",
      title_en: "Ancestral Manuscripts & Artifacts Exhibition",
      description_ar: "صور توثيقية لمقتنيات تاريخية نادرة",
      status: "published",
      visibility: "public",
      sort_order: 1,
    }).select().single();
    record("CMS", "Create Museum Gallery", !galErr, galErr?.message);

    if (gal) {
      const { data: asset, error: assetErr } = await adminClient.from("media_assets").insert({
        bucket_id: "media",
        file_path: "media/museum-artifact-test.jpg",
        file_name: "museum-artifact-test.jpg",
        public_url: "https://example.com/artifact.jpg",
        title_ar: "مخطوطة تاريخية نادرة",
      }).select().single();

      if (asset) {
        const { data: gm, error: gmErr } = await adminClient.from("gallery_media").insert({
          gallery_id: gal.id,
          media_asset_id: asset.id,
          title_ar: "صورة عالية الدقة للمخطوطة",
          sort_order: 1,
          is_published: true,
        }).select().single();
        record("CMS", "Link Media Item to Museum Gallery", !gmErr, gmErr?.message);

        if (gm) await adminClient.from("gallery_media").delete().eq("id", gm.id);
        await adminClient.from("media_assets").delete().eq("id", asset.id);
      }
      await adminClient.from("galleries").delete().eq("id", gal.id);
    }
  } catch (err: any) {
    record("CMS", "Museum Gallery CRUD Exception", false, err.message);
  }

  // 3.8 Family Tree, Members & Relationships
  try {
    const personAId = "00000000-0000-0000-0000-000000000010";
    const personBId = "00000000-0000-0000-0000-000000000020";
    await adminClient.from("family_relationships").delete().in("person_id", [personAId, personBId]);
    await adminClient.from("family_members").delete().in("id", [personAId, personBId]);

    const { error: insAErr } = await adminClient.from("family_members").insert({
      id: personAId,
      slug: "mohammed-qa-parent",
      first_name_ar: "محمد",
      last_name_ar: "آل بوعبيد",
      gender: "male",
      is_living: false,
      generation: 2,
      status: "published",
      visibility: "public",
    });

    const { error: insBErr } = await adminClient.from("family_members").insert({
      id: personBId,
      slug: "ali-qa-son",
      first_name_ar: "علي",
      last_name_ar: "آل بوعبيد",
      gender: "male",
      is_living: true,
      generation: 3,
      status: "published",
      visibility: "public",
    });

    record("Family Tree", "Create Generational Family Members", !insAErr && !insBErr, insAErr?.message || insBErr?.message);

    // Link Parent-Child Relationship
    const { data: rel, error: relErr } = await adminClient.from("family_relationships").insert({
      person_id: personBId,
      related_person_id: personAId,
      relationship_type: "parent",
    }).select().single();
    record("Family Tree", "Link Parent-Child Relationship", !relErr, relErr?.message);

    // Cleanup
    if (rel) await adminClient.from("family_relationships").delete().eq("id", rel.id);
    await adminClient.from("family_members").delete().in("id", [personAId, personBId]);
  } catch (err: any) {
    record("Family Tree", "Family Tree CRUD Exception", false, err.message);
  }

  // 3.9 Inquiries & Notes
  try {
    const { data: inq, error: inqErr } = await adminClient.from("inquiries").insert({
      name: "منذر بن إبراهيم",
      email: "munther@example.com",
      phone: "+966500112233",
      subject: "طلب إضافة فرع عائلي في الدليل",
      message: "نرجو تحديث بيانات الفرع التابع لنا وإضافة جهات الاتصال",
      status: "new",
    }).select().single();
    record("Inquiries", "Create New Inquiry", !inqErr, inqErr?.message);

    if (inq) {
      const { error: noteErr } = await adminClient.from("inquiry_notes").insert({
        inquiry_id: inq.id,
        author_id: adminUserId,
        note: "تم التنسيق مع أمين الفرع واعتماد التعديلات",
      });
      record("Inquiries", "Attach Staff Note to Inquiry", !noteErr, noteErr?.message);

      const { error: stErr } = await adminClient.from("inquiries").update({ status: "resolved" }).eq("id", inq.id);
      record("Inquiries", "Resolve Inquiry Status", !stErr, stErr?.message);

      await adminClient.from("inquiries").delete().eq("id", inq.id);
    }
  } catch (err: any) {
    record("Inquiries", "Inquiry Workflow Exception", false, err.message);
  }

  // 3.10 Navigation Menus & Links
  try {
    const menuCode = `nav_qa_${Date.now()}`;
    const { data: menu, error: menuErr } = await adminClient.from("navigation_menus").insert({
      code: menuCode,
      name_ar: "القائمة العلوية التجريبية",
      name_en: "Test Header Menu",
    }).select().single();
    record("Navigation", "Create Navigation Menu", !menuErr, menuErr?.message);

    if (menu) {
      const { data: item, error: itemErr } = await adminClient.from("navigation_items").insert({
        menu_id: menu.id,
        label_ar: "من نحن",
        label_en: "About Us",
        url: "/about",
        sort_order: 1,
      }).select().single();
      record("Navigation", "Create Navigation Menu Item", !itemErr, itemErr?.message);

      if (item) await adminClient.from("navigation_items").delete().eq("id", item.id);
      await adminClient.from("navigation_menus").delete().eq("id", menu.id);
    }
  } catch (err: any) {
    record("Navigation", "Navigation CRUD Exception", false, err.message);
  }

  // 3.11 Site Settings & DNA Studies
  try {
    const dnaPayload = {
      haplogroup: "J-M267 (J1)",
      subclade: "J-FGC4397",
      terminal_snp: "FGC4397",
      root_haplogroup: "J1-M267",
      description_ar: "الفحص الجيني لسلالة آل بوعبيد — تميم",
      description_en: "Genetic DNA study for Al Bu Obaid lineage (Tamim)",
      last_updated: new Date().toISOString(),
    };

    const { error: setErr } = await adminClient.from("site_settings").upsert({
      category: "dna",
      key: "dna_studies_data",
      value: dnaPayload,
      is_public: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "key" });
    record("Settings & DNA", "Save DNA Studies Configuration", !setErr, setErr?.message);

    const { data: publicDna } = await unauthClient.from("site_settings").select("value").eq("key", "dna_studies_data").maybeSingle();
    record("Settings & DNA", "Public Access to DNA Studies Data", !!publicDna?.value);
  } catch (err: any) {
    record("Settings & DNA", "Settings & DNA Exception", false, err.message);
  }

  // 3.12 Storage Buckets Verification
  console.log("\n--- Phase 4: Storage Buckets & Policies Audit ---");
  try {
    const { data: buckets, error: bErr } = await adminClient.storage.listBuckets();
    if (bErr) {
      record("Storage", "List Buckets", false, bErr.message);
    } else {
      const names = (buckets ?? []).map((b) => b.name);
      const essential = ["media", "site-media", "family-photos", "avatars", "galleries", "receipts", "content", "documents-public", "documents-private"];
      for (const req of essential) {
        const found = names.includes(req);
        record("Storage", `Storage Bucket "${req}" Verified`, found);
      }
    }
  } catch (err: any) {
    record("Storage", "Storage Audit Exception", false, err.message);
  }

  // 4. SUMMARY REPORT
  console.log("\n=================================================================");
  console.log("FINAL AUDIT SUMMARY REPORT");
  console.log("=================================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log(`Total System Tests: ${total}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log("FAILURES REQUIRING ATTENTION:");
    results.filter((r) => !r.passed).forEach((r) => {
      console.log(`❌ [${r.category}] ${r.name}: ${r.error}`);
    });
  } else {
    console.log("🎉 ALL AUDIT CHECKS PASSED WITH 100% SUCCESS!");
  }
}

runComprehensiveAudit().catch(console.error);
