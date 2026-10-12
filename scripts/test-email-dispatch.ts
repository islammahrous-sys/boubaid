import { enqueueNotificationEmail } from "../src/lib/email/notification-queue.server";
import { supabaseAdmin } from "../src/integrations/supabase/client.server";

async function main() {
  console.log("==================================================");
  console.log("AL BU OBAID NOTIFICATION SYSTEM — END-TO-END VERIFICATION");
  console.log("==================================================");

  // 1. Check DB tables exist and read count
  const { count: templateCount, error: templateErr } = await supabaseAdmin
    .from("notification_email_templates")
    .select("*", { count: "exact", head: true });

  if (templateErr) {
    console.error("❌ Error checking notification_email_templates:", templateErr.message);
  } else {
    console.log(`✅ Database table 'notification_email_templates' verified: ${templateCount} official templates synced.`);
  }

  // 2. Dispatch a diagnostic test notification
  console.log("\nEnqueuing diagnostic test email via enqueueNotificationEmail...");
  const testIdempotencyKey = `diagnostic-test-${Date.now()}`;

  const dispatchResult = await enqueueNotificationEmail({
    templateKey: "system_admin_alert",
    recipientEmail: "delivered@resend.dev",
    recipientName: "فريق الإدارة والتشغيل",
    variables: {
      user_name: "مدير النظام",
      alert_title: "اكتمال تدشين منظومة البريد والإشعارات المركزية",
      alert_body: "تم بنجاح تركيب وتشغيل المنظومة المركزية لقوالب البريد الـ 70 لأسرة آل بوعبيد عبر Resend و Supabase مع تفعيل طابور الإرسال وسجلات التدقيق.",
      severity: "info",
      action_url: "/admin?domain=system&tab=email_notifications",
    },
    priority: "CRITICAL",
    idempotencyKey: testIdempotencyKey,
    bypassPreferences: true,
  });

  console.log("Dispatch result:", JSON.stringify(dispatchResult, null, 2));

  if (dispatchResult.emailLogId) {
    const { data: logRecord } = await supabaseAdmin
      .from("email_logs")
      .select("id, recipient_email, subject, status, provider_message_id, error_message, attempts, created_at, sent_at")
      .eq("id", dispatchResult.emailLogId)
      .single();

    console.log("\nVerified email_logs database record:");
    console.log(JSON.stringify(logRecord, null, 2));

    if (logRecord?.status === "sent" || logRecord?.status === "delivered") {
      console.log("\n🎉 LIVE EMAIL DISPATCH SUCCESSFUL!");
      console.log(`Provider Message ID: ${logRecord.provider_message_id}`);
    } else if (logRecord?.status === "failed") {
      console.log(`\n⚠️ Dispatch recorded as failed: ${logRecord.error_message}`);
    } else {
      console.log(`\nStatus: ${logRecord?.status}`);
    }
  }

  // 3. Test RPC statistics
  const { data: stats, error: statsErr } = await supabaseAdmin.rpc("get_email_statistics");
  if (statsErr) {
    console.error("RPC statistics error:", statsErr.message);
  } else {
    console.log("\nLive Database Email Statistics KPI:");
    console.log(JSON.stringify(stats, null, 2));
  }
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
