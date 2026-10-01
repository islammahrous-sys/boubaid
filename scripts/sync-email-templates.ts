import { createClient } from "@supabase/supabase-js";
import { EMAIL_TEMPLATE_CATALOG } from "../src/lib/email/email-templates";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://ywsvittlswbbyqhahorh.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3c3ZpdHRsc3diYnlxaGFob3JoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzMyODA4NywiZXhwIjoyMTAyOTA0MDg3fQ.2hu3Wo1TyTvTUuweNbeeNClvHI3lA5-hyjLQjfFem9k";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function syncTemplates() {
  console.log("Syncing email template catalog to Supabase database...");
  const entries = Object.values(EMAIL_TEMPLATE_CATALOG);
  console.log(`Found ${entries.length} template definitions in catalog.`);

  let synced = 0;
  for (const tpl of entries) {
    const dummyVars = {
      user_name: "محمد بوعبيد",
      request_number: "ABF-REQ-261001-TEST1",
      request_title: "طلب توثيق",
      committee_name: "لجنة المتابعة والتطوير",
      event_title: "اللقاء العائلي السنوي",
      event_date: "1448/01/15",
      event_time: "08:00 PM",
      amount: "1,000",
      currency: "SAR",
    };

    const subjectAr = tpl.subjectAr(dummyVars);
    const subjectEn = tpl.subjectEn(dummyVars);

    const row = {
      template_key: tpl.key,
      category: tpl.category,
      name_ar: tpl.nameAr,
      name_en: tpl.nameEn,
      subject_template_ar: subjectAr,
      subject_template_en: subjectEn,
      default_priority: tpl.defaultPriority,
      available_variables: [
        "user_name",
        "user_email",
        "request_number",
        "request_title",
        "committee_name",
        "action_url",
        "action_label",
        "date",
        "amount",
        "currency",
      ],
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("notification_email_templates")
      .upsert(row, { onConflict: "template_key" });

    if (error) {
      console.error(`Error syncing template ${tpl.key}:`, error.message);
    } else {
      synced++;
    }
  }

  console.log(`Successfully synced ${synced}/${entries.length} email templates to database.`);
}

syncTemplates().catch(console.error);
