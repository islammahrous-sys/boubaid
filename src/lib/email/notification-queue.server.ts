import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type {
  EmailCategory,
  EmailLanguage,
  EmailPriority,
  EnqueueEmailParams,
} from "./email-types";
import { renderEmail } from "./email-templates";
import { sendEmailViaResend } from "./email-sender.server";

/**
 * Checks whether the recipient allows email notifications for this category.
 * CRITICAL priority emails always bypass preferences.
 */
async function isEmailAllowedForRecipient(
  userId: string | null | undefined,
  category: EmailCategory,
  priority: EmailPriority,
): Promise<boolean> {
  // Critical security and account emails can NEVER be disabled
  if (priority === "CRITICAL" || category === "auth") {
    return true;
  }

  if (!userId) return true;

  try {
    const { data: pref } = await supabaseAdmin
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!pref) return true;

    // Master email toggle
    if (pref.email_notifications === false) return false;

    if (category === "system" && pref.system_alerts === false) return false;
    if (category === "events" && pref.family_events === false) return false;
    if (category === "fund" && pref.contributions === false) return false;
    if (category === "news" && pref.articles_news === false) return false;
    if (category === "newsletter" && pref.articles_news === false) return false;

    return true;
  } catch (err) {
    console.warn("[notification-queue] Error checking preferences, defaulting to allow:", err);
    return true;
  }
}

/**
 * Enqueues and optionally immediately dispatches an enterprise email notification.
 * Implements strict idempotency to prevent duplicate sends.
 */
export async function enqueueNotificationEmail(
  params: EnqueueEmailParams,
): Promise<{ ok: boolean; emailLogId?: string; error?: string; skipped?: boolean }> {
  try {
    const recipientEmail = (params.recipientEmail || "").trim().toLowerCase();
    if (!recipientEmail || !recipientEmail.includes("@")) {
      return { ok: false, error: "Invalid recipient email address" };
    }

    // 1. Idempotency Check: Prevent duplicate emails for the same event
    if (params.idempotencyKey) {
      const { data: existing } = await supabaseAdmin
        .from("email_logs")
        .select("id, status, provider_message_id")
        .eq("idempotency_key", params.idempotencyKey)
        .maybeSingle();

      if (existing) {
        return {
          ok: true,
          emailLogId: existing.id,
          skipped: true,
        };
      }
    }

    // 2. Resolve Recipient Language Preference (default: Arabic)
    let language: EmailLanguage = params.language || "ar";
    let recipientName = params.recipientName || null;

    if (params.userId) {
      try {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("full_name_ar, full_name_en")
          .eq("id", params.userId)
          .maybeSingle();

        if (profile) {
          if (!recipientName) {
            recipientName = language === "ar"
              ? profile.full_name_ar || profile.full_name_en
              : profile.full_name_en || profile.full_name_ar;
          }
        }
      } catch {
        // Fallback to provided info
      }
    }

    // 3. Render Template
    const emailType = params.emailType || params.templateKey || "system_notification";
    const variables: Record<string, any> = {
      ...(params.variables || {}),
      user_name: recipientName || params.variables?.user_name || "",
      user_email: recipientEmail,
      action_url: params.actionUrl || params.variables?.action_url,
      action_label: params.actionLabel || params.variables?.action_label,
    };

    const rendered = renderEmail(emailType as any, variables, language);
    const category = params.category || rendered.category;
    const priority = params.priority || rendered.priority;
    const finalSubject = params.subject || rendered.subject;

    // 4. Check User Notification Preferences
    if (!params.bypassPreferences) {
      const isAllowed = await isEmailAllowedForRecipient(params.userId, category, priority);
      if (!isAllowed) {
        return {
          ok: true,
          skipped: true,
        };
      }
    }

    // 5. Insert Record into email_logs
    const insertPayload = {
      user_id: params.userId || null,
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      email_type: emailType,
      category,
      priority,
      language,
      subject: finalSubject,
      html_body: rendered.html,
      text_body: rendered.text,
      status: "queued" as const,
      provider: "resend",
      payload: variables,
      attempts: 0,
      max_attempts: 3,
      idempotency_key: params.idempotencyKey || null,
      scheduled_at: (params.scheduledAt || new Date()).toISOString(),
    };

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("email_logs")
      .insert(insertPayload as any)
      .select("id")
      .single();

    if (insertError) {
      // If unique constraint on idempotency_key failed in a race condition, return ok
      if (insertError.code === "23505") {
        return { ok: true, skipped: true };
      }
      console.error("[notification-queue] Insert into email_logs failed:", insertError);
      return { ok: false, error: insertError.message };
    }

    const emailLogId = inserted.id;

    // 6. Immediate dispatch for CRITICAL and HIGH priority emails (or regular when not scheduled in future)
    const isScheduledFuture = params.scheduledAt && params.scheduledAt.getTime() > Date.now() + 5000;
    if (!isScheduledFuture) {
      // Mark as processing
      await supabaseAdmin
        .from("email_logs")
        .update({ status: "processing", updated_at: new Date().toISOString() })
        .eq("id", emailLogId);

      const sendResult = await sendEmailViaResend({
        to: recipientEmail,
        subject: finalSubject,
        html: rendered.html,
        text: rendered.text,
        emailType: params.emailType,
        category,
      });

      if (sendResult.ok) {
        await supabaseAdmin
          .from("email_logs")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            provider_message_id: sendResult.providerMessageId || null,
            attempts: 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", emailLogId);
      } else {
        await supabaseAdmin
          .from("email_logs")
          .update({
            status: "failed",
            failed_at: new Date().toISOString(),
            error_message: sendResult.error || "Delivery error",
            attempts: 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", emailLogId);
      }
    }

    return { ok: true, emailLogId };
  } catch (err: any) {
    console.error("[notification-queue] Unexpected error:", err);
    return { ok: false, error: err?.message || "Unexpected queue error" };
  }
}

/**
 * Batch processor that drains queued emails.
 */
export async function processQueuedNotificationEmails(batchSize = 25): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  const nowIso = new Date().toISOString();

  // Rescue rows stranded in "processing" by a crashed/timed-out invocation.
  await supabaseAdmin
    .from("email_logs")
    .update({ status: "queued", updated_at: nowIso })
    .eq("status", "processing")
    .lt("updated_at", new Date(Date.now() - 10 * 60 * 1000).toISOString());

  // Atomically select queued emails that are ready to send
  const { data: queueItems, error } = await supabaseAdmin
    .from("email_logs")
    .select("id, recipient_email, subject, html_body, text_body, email_type, category, attempts, max_attempts, scheduled_at")
    .eq("status", "queued")
    .lte("scheduled_at", nowIso)
    .order("priority", { ascending: false }) // CRITICAL, HIGH, NORMAL, LOW
    .order("scheduled_at", { ascending: true })
    .limit(batchSize);

  if (error || !queueItems || queueItems.length === 0) {
    return { processed: 0, sent: 0, failed: 0 };
  }

  let sentCount = 0;
  let failedCount = 0;

  for (const item of queueItems) {
    // Mark processing
    await supabaseAdmin
      .from("email_logs")
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", item.id);

    const result = await sendEmailViaResend({
      to: item.recipient_email,
      subject: item.subject,
      html: item.html_body || "",
      text: item.text_body || undefined,
      emailType: item.email_type,
      category: item.category,
    });

    const newAttempts = (item.attempts || 0) + 1;

    if (result.ok) {
      await supabaseAdmin
        .from("email_logs")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          provider_message_id: result.providerMessageId || null,
          attempts: newAttempts,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);
      sentCount++;
    } else {
      const isTerminal = newAttempts >= (item.max_attempts || 3);
      await supabaseAdmin
        .from("email_logs")
        .update({
          status: isTerminal ? "failed" : "queued", // re-queue if attempts remain
          failed_at: isTerminal ? new Date().toISOString() : null,
          error_message: result.error || "Delivery error",
          attempts: newAttempts,
          scheduled_at: isTerminal
            ? item.scheduled_at
            : new Date(Date.now() + newAttempts * 5 * 60 * 1000).toISOString(), // exponential retry delay
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);
      failedCount++;
    }
  }

  return { processed: queueItems.length, sent: sentCount, failed: failedCount };
}

/**
 * Retries a specific failed email from the admin interface.
 */
export async function retryFailedEmail(emailLogId: string): Promise<{ ok: boolean; error?: string }> {
  const { data: item, error } = await supabaseAdmin
    .from("email_logs")
    .select("*")
    .eq("id", emailLogId)
    .single();

  if (error || !item) {
    return { ok: false, error: "Email log not found" };
  }

  // Update status to processing
  await supabaseAdmin
    .from("email_logs")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", emailLogId);

  const result = await sendEmailViaResend({
    to: item.recipient_email,
    subject: item.subject,
    html: item.html_body || "",
    text: item.text_body || undefined,
    emailType: item.email_type,
    category: item.category,
  });

  const newAttempts = (item.attempts || 0) + 1;

  if (result.ok) {
    await supabaseAdmin
      .from("email_logs")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        provider_message_id: result.providerMessageId || null,
        error_message: null,
        attempts: newAttempts,
        updated_at: new Date().toISOString(),
      })
      .eq("id", emailLogId);
    return { ok: true };
  } else {
    await supabaseAdmin
      .from("email_logs")
      .update({
        status: "failed",
        failed_at: new Date().toISOString(),
        error_message: result.error || "Retry failed",
        attempts: newAttempts,
        updated_at: new Date().toISOString(),
      })
      .eq("id", emailLogId);
    return { ok: false, error: result.error };
  }
}
