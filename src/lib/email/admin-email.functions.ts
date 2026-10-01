import { createServerFn } from "@tanstack/react-start";
import { requireAdminAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import type {
  EmailCategory,
  EmailLanguage,
  EmailLogRecord,
  EmailPriority,
  EmailTemplateKey,
} from "./email-types";
import { EMAIL_TEMPLATES_REGISTRY, renderEmail } from "./email-templates";
import { enqueueNotificationEmail, retryFailedEmail } from "./notification-queue.server";

export interface EmailStatsSummary {
  total_emails: number;
  queued: number;
  processing: number;
  sent: number;
  delivered: number;
  failed: number;
  bounced: number;
  complained: number;
  opened: number;
  clicked: number;
  last_24_hours: number;
  failed_last_24_hours: number;
}

export const getEmailStats = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async (): Promise<EmailStatsSummary> => {
    try {
      const { data, error } = await supabaseAdmin.rpc("get_email_statistics");
      if (error) {
        console.warn("[admin-email] RPC get_email_statistics error, falling back to direct count:", error);
        throw error;
      }
      return (data as unknown as EmailStatsSummary) || {
        total_emails: 0,
        queued: 0,
        processing: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        bounced: 0,
        complained: 0,
        opened: 0,
        clicked: 0,
        last_24_hours: 0,
        failed_last_24_hours: 0,
      };
    } catch {
      // Fallback direct count
      const { count: total } = await supabaseAdmin.from("email_logs").select("*", { count: "exact", head: true });
      const { count: queued } = await supabaseAdmin.from("email_logs").select("*", { count: "exact", head: true }).eq("status", "queued");
      const { count: sent } = await supabaseAdmin.from("email_logs").select("*", { count: "exact", head: true }).eq("status", "sent");
      const { count: delivered } = await supabaseAdmin.from("email_logs").select("*", { count: "exact", head: true }).eq("status", "delivered");
      const { count: failed } = await supabaseAdmin.from("email_logs").select("*", { count: "exact", head: true }).eq("status", "failed");
      const { count: bounced } = await supabaseAdmin.from("email_logs").select("*", { count: "exact", head: true }).eq("status", "bounced");

      return {
        total_emails: total ?? 0,
        queued: queued ?? 0,
        processing: 0,
        sent: sent ?? 0,
        delivered: delivered ?? 0,
        failed: failed ?? 0,
        bounced: bounced ?? 0,
        complained: 0,
        opened: 0,
        clicked: 0,
        last_24_hours: total ?? 0,
        failed_last_24_hours: failed ?? 0,
      };
    }
  });

export const emailLogsFilterSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(25),
  search: z.string().trim().max(120).optional(),
  status: z.string().trim().max(40).optional(),
  priority: z.string().trim().max(20).optional(),
  category: z.string().trim().max(40).optional(),
});

export const getEmailLogsPaginated = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => emailLogsFilterSchema.parse(d))
  .handler(async ({ data }) => {
    const { page, pageSize, search, status, priority, category } = data;

    let query = supabaseAdmin
      .from("email_logs")
      .select("id, recipient_email, recipient_name, email_type, category, priority, language, subject, status, attempts, error_message, provider_message_id, created_at, scheduled_at, sent_at, delivered_at, opened_at, clicked_at, failed_at, payload", { count: "exact" });

    if (search) {
      const clean = search.replace(/[,()]/g, "").trim();
      if (clean) {
        query = query.or(`recipient_email.ilike.%${clean}%,recipient_name.ilike.%${clean}%,subject.ilike.%${clean}%,email_type.ilike.%${clean}%`);
      }
    }

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (priority && priority !== "all") {
      query = query.eq("priority", priority);
    }

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: logs, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`Failed to load email logs: ${error.message}`);
    }

    return {
      data: (logs || []) as any,
      count: count ?? 0,
      page,
      pageSize,
    };
  });

export const getEmailLogById = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { data: log, error } = await supabaseAdmin
      .from("email_logs")
      .select("*")
      .eq("id", data.id)
      .single();

    if (error || !log) {
      throw new Error(error?.message || "Email log not found");
    }

    return log as any;
  });

export const retryEmailAction = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const res = await retryFailedEmail(data.id);
    if (!res.ok) {
      throw new Error(res.error || "Failed to retry email");
    }
    return { ok: true };
  });

export const getTemplatesCatalog = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("notification_email_templates")
      .select("*")
      .order("category", { ascending: true })
      .order("key", { ascending: true });

    if (error) {
      console.warn("[admin-email] Could not fetch DB templates catalog, using registry fallback:", error);
      return Object.values(EMAIL_TEMPLATES_REGISTRY).map((t: any) => ({
        key: t.key,
        category: t.category,
        default_priority: t.defaultPriority,
        name_ar: t.nameAr,
        name_en: t.nameEn,
        description_ar: t.nameAr,
        description_en: t.nameEn,
        is_active: true,
      }));
    }

    return data;
  });

export const previewTemplateAction = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) =>
    z
      .object({
        templateKey: z.string(),
        language: z.enum(["ar", "en"]).default("ar"),
        variables: z.record(z.any()).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { templateKey, language, variables } = data;
    const sampleVars: Record<string, any> = {
      user_name: language === "ar" ? "أحمد بن عبد الرحمن آل بوعبيد" : "Ahmed Al Bu Obaid",
      request_number: "ABF-REQ-2610-0042",
      request_title: language === "ar" ? "طلب مساندة مبادرة توثيق التراث" : "Heritage Documentation Support Request",
      request_type: language === "ar" ? "مبادرة مجتمعية" : "Community Initiative",
      committee_name: language === "ar" ? "لجنة التنمية والمبادرات" : "Development Committee",
      status_label: language === "ar" ? "معتمد ومقبول" : "Approved",
      amount: "5,000",
      currency: "SAR",
      receipt_number: "REC-2026-0891",
      event_title: language === "ar" ? "الملتقى السنوي لأسرة آل بوعبيد ١٤٤٨هـ" : "Annual Family Gathering 1448H",
      event_date: "15-11-1448 هـ",
      event_location: language === "ar" ? "قاعة المجلس الكبرى — الأحساء" : "Grand Council Hall — Al-Ahsa",
      article_title: language === "ar" ? "صدور كتاب تاريخ ووثائق الأسرة — المجلد الثاني" : "Publication of Family History Book — Vol. 2",
      ...(variables || {}),
    };

    const rendered = renderEmail(templateKey as EmailTemplateKey, sampleVars, language as EmailLanguage);

    return {
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      category: rendered.category,
      priority: rendered.priority,
    };
  });

export const sendTestEmailAction = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) =>
    z
      .object({
        templateKey: z.string(),
        recipientEmail: z.string().email(),
        language: z.enum(["ar", "en"]).default("ar"),
        customVariables: z.record(z.any()).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { templateKey, recipientEmail, language, customVariables } = data;

    const sampleVars: Record<string, any> = {
      user_name: language === "ar" ? "عضو أسرة آل بوعبيد التجريبي" : "Test Family Member",
      request_number: "ABF-TEST-" + Math.floor(1000 + Math.random() * 9000),
      request_title: language === "ar" ? "رسالة تجريبية من لوحة إدارة البريد" : "Email Center Diagnostic Test",
      committee_name: language === "ar" ? "أمانة مجلس الأسرة" : "Family Council Secretariat",
      status_label: language === "ar" ? "تجريبي / نشط" : "Test / Active",
      amount: "1,000",
      currency: "SAR",
      ...(customVariables || {}),
    };

    const res = await enqueueNotificationEmail({
      emailType: templateKey,
      recipientEmail,
      recipientName: sampleVars.user_name,
      variables: sampleVars,
      language: language as EmailLanguage,
      priority: "CRITICAL", // Deliver immediately
      bypassPreferences: true,
      userId: context.userId,
    });

    if (!res.ok) {
      throw new Error(res.error || "Failed to send test email");
    }

    return { ok: true, emailLogId: res.emailLogId };
  });
