import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface AuthEmailResult {
  ok: boolean;
  error?: string;
  message?: string;
  requiresVerification?: boolean;
}

const passwordResetSchema = z.object({
  email: z.string().email(),
  redirectTo: z.string().optional(),
  locale: z.enum(["ar", "en"]).optional(),
  turnstileToken: z.string().optional(),
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  redirectTo: z.string().optional(),
  locale: z.enum(["ar", "en"]).optional(),
  turnstileToken: z.string().optional(),
});

const passwordChangedSchema = z.object({
  locale: z.enum(["ar", "en"]).optional(),
  clientInfo: z.string().optional(),
});

const emailChangedSchema = z.object({
  oldEmail: z.string().email(),
  newEmail: z.string().email(),
  locale: z.enum(["ar", "en"]).optional(),
});

const welcomeEmailSchema = z.object({
  userId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  fullName: z.string().optional(),
  locale: z.enum(["ar", "en"]).optional(),
});

/**
 * Initiates a branded password reset flow.
 * Uses Supabase Auth Admin to securely generate a single-use recovery link,
 * then immediately dispatches the official Al Bu Obaid branded email
 * through the centralized email notification system.
 * Returns ok: true uniformly to prevent email enumeration attacks.
 */
export const requestPasswordReset = createServerFn({ method: "POST" })
  .validator((input: unknown) => passwordResetSchema.parse(input))
  .handler(async ({ data }): Promise<AuthEmailResult> => {
    const email = data.email.trim().toLowerCase();
    const locale = data.locale || "ar";
    const isAr = locale === "ar";

    try {
      const { guardAuthEmail, resolveSafeRedirect } = await import("./auth-guard.server");
      const guard = await guardAuthEmail({
        scope: "auth_reset",
        email,
        turnstileToken: data.turnstileToken,
      });
      if (!guard.ok) {
        // Throttled / failed-bot-check callers get the same uniform answer as
        // unknown addresses, except for the explicit bot-check error the UI handles.
        return guard.error === "turnstile_failed" ? { ok: false, error: "turnstile_failed" } : { ok: true };
      }

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const redirectTo = resolveSafeRedirect(data.redirectTo, "/reset-password");

      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo },
      });

      // If user is not found, return ok: true without error to protect user privacy (anti-enumeration)
      if (linkError || !linkData?.properties?.action_link) {
        console.warn(`[auth-email] Password reset requested for ${email}, but user was not found or link generation failed:`, linkError?.message);
        return { ok: true };
      }

      const actionLink = linkData.properties.action_link;
      const hashedToken = linkData.properties.hashed_token;

      // Construct direct, seamless reset URL on official domain to avoid external redirect bounces
      const directResetUrl = hashedToken
        ? `${redirectTo}${redirectTo.includes("?") ? "&" : "?"}token_hash=${encodeURIComponent(hashedToken)}&type=recovery`
        : actionLink;

      // Lookup recipient name from profiles table for personalized greeting
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("full_name_ar, full_name_en")
        .eq("email", email)
        .maybeSingle();

      const recipientName =
        (isAr ? profile?.full_name_ar : profile?.full_name_en) ||
        profile?.full_name_ar ||
        profile?.full_name_en ||
        (isAr ? "عضو الأسرة الكريمة" : "Honored Member");

      // Dispatch branded email via centralized notification engine
      const { enqueueNotificationEmail } = await import("@/lib/email/notification-queue.server");
      await enqueueNotificationEmail({
        userId: linkData.user?.id,
        recipientEmail: email,
        recipientName,
        emailType: "auth_password_reset",
        category: "auth",
        priority: "CRITICAL",
        language: locale,
        variables: {
          user_name: recipientName,
          reset_url: directResetUrl,
          action_url: directResetUrl,
        },
        bypassPreferences: true,
      });

      return { ok: true };
    } catch (err: any) {
      console.error("[auth-email] requestPasswordReset failed:", err);
      // Uniform response prevents leaking backend details
      return { ok: true };
    }
  });

/**
 * Registers a new user and dispatches our official branded verification email
 * containing the cryptographically genuine Supabase confirmation link.
 */
export const signUpWithBrandedVerification = createServerFn({ method: "POST" })
  .validator((input: unknown) => signUpSchema.parse(input))
  .handler(async ({ data }): Promise<AuthEmailResult> => {
    const email = data.email.trim().toLowerCase();
    const fullName = data.fullName.trim();
    const locale = data.locale || "ar";

    try {
      const { guardAuthEmail, resolveSafeRedirect } = await import("./auth-guard.server");
      const guard = await guardAuthEmail({
        scope: "auth_signup",
        email,
        turnstileToken: data.turnstileToken,
      });
      if (!guard.ok) return { ok: false, error: guard.error };

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const redirectTo = resolveSafeRedirect(data.redirectTo, "/auth");

      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "signup",
        email,
        password: data.password,
        options: {
          data: { full_name_ar: fullName },
          redirectTo,
        },
      });

      if (linkError) {
        const msg = linkError.message.toLowerCase();
        if (msg.includes("already") || (linkError as any).status === 422) {
          return { ok: false, error: "user_already_registered" };
        }
        return { ok: false, error: linkError.message };
      }

      const actionLink = linkData?.properties?.action_link;
      const hashedToken = linkData?.properties?.hashed_token;
      const userId = linkData?.user?.id;

      const directVerifyUrl = hashedToken
        ? `${redirectTo}${redirectTo.includes("?") ? "&" : "?"}token_hash=${encodeURIComponent(hashedToken)}&type=signup`
        : actionLink;

      if (directVerifyUrl) {
        const { enqueueNotificationEmail } = await import("@/lib/email/notification-queue.server");
        await enqueueNotificationEmail({
          userId,
          recipientEmail: email,
          recipientName: fullName,
          emailType: "auth_email_verification",
          category: "auth",
          priority: "CRITICAL",
          language: locale,
          variables: {
            user_name: fullName,
            verification_url: directVerifyUrl,
            action_url: directVerifyUrl,
          },
          bypassPreferences: true,
        });
      }

      return { ok: true, requiresVerification: true };
    } catch (err: any) {
      console.error("[auth-email] signUpWithBrandedVerification failed:", err);
      return { ok: false, error: err.message || "signup_failed" };
    }
  });

/**
 * Dispatches a security notification immediately after a password has been updated.
 * Must be called with an authenticated user session.
 */
export const notifyPasswordChanged = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => passwordChangedSchema.parse(input))
  .handler(async ({ data, context }): Promise<AuthEmailResult> => {
    const { userId, claims } = context;
    const email = claims.email;
    if (!email) return { ok: false, error: "missing_email" };

    const locale = data.locale || "ar";
    const isAr = locale === "ar";

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("full_name_ar, full_name_en")
        .eq("id", userId)
        .maybeSingle();

      const recipientName =
        (isAr ? profile?.full_name_ar : profile?.full_name_en) ||
        profile?.full_name_ar ||
        profile?.full_name_en ||
        (isAr ? "عضو الأسرة" : "Family Member");

      const { enqueueNotificationEmail } = await import("@/lib/email/notification-queue.server");
      await enqueueNotificationEmail({
        userId,
        recipientEmail: email,
        recipientName,
        emailType: "auth_password_changed",
        category: "auth",
        priority: "CRITICAL",
        language: locale,
        variables: {
          user_name: recipientName,
          timestamp: new Date().toLocaleString(isAr ? "ar-SA" : "en-US"),
          client_info: data.clientInfo || (isAr ? "جلسة مصادقة نشطة" : "Active web session"),
        },
        bypassPreferences: true,
      });

      return { ok: true };
    } catch (err: any) {
      console.error("[auth-email] notifyPasswordChanged failed:", err);
      return { ok: false, error: err.message };
    }
  });

/**
 * Dispatches security notices to both previous and new email addresses
 * when an account's email is modified.
 */
export const notifyEmailChanged = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => emailChangedSchema.parse(input))
  .handler(async ({ data, context }): Promise<AuthEmailResult> => {
    const { userId } = context;
    const locale = data.locale || "ar";
    const isAr = locale === "ar";

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("full_name_ar, full_name_en")
        .eq("id", userId)
        .maybeSingle();

      const recipientName =
        (isAr ? profile?.full_name_ar : profile?.full_name_en) ||
        profile?.full_name_ar ||
        profile?.full_name_en ||
        (isAr ? "عضو الأسرة" : "Family Member");

      const timestamp = new Date().toLocaleString(isAr ? "ar-SA" : "en-US");
      const { enqueueNotificationEmail } = await import("@/lib/email/notification-queue.server");

      // Dispatch alert to previous email
      await enqueueNotificationEmail({
        userId,
        recipientEmail: data.oldEmail,
        recipientName,
        emailType: "auth_email_changed",
        category: "auth",
        priority: "CRITICAL",
        language: locale,
        variables: {
          user_name: recipientName,
          old_email: data.oldEmail,
          new_email: data.newEmail,
          timestamp,
        },
        bypassPreferences: true,
      });

      // Dispatch confirmation to new email
      await enqueueNotificationEmail({
        userId,
        recipientEmail: data.newEmail,
        recipientName,
        emailType: "auth_email_changed",
        category: "auth",
        priority: "CRITICAL",
        language: locale,
        variables: {
          user_name: recipientName,
          old_email: data.oldEmail,
          new_email: data.newEmail,
          timestamp,
        },
        bypassPreferences: true,
      });

      return { ok: true };
    } catch (err: any) {
      console.error("[auth-email] notifyEmailChanged failed:", err);
      return { ok: false, error: err.message };
    }
  });

/**
 * Dispatches an official welcome email to a new member.
 */
export const sendWelcomeEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => welcomeEmailSchema.parse(input))
  .handler(async ({ data, context }): Promise<AuthEmailResult> => {
    const locale = data.locale || "ar";
    const isAr = locale === "ar";
    const { userId, claims } = context;

    try {
      // The recipient is always the signed-in user's own address. Caller-supplied
      // `email` / `userId` are ignored, otherwise this endpoint is an open relay.
      const email = claims.email;
      let name = data.fullName;

      const { checkKeyRateLimit } = await import("@/lib/public-forms-rate-limit.server");
      if (await checkKeyRateLimit("auth_welcome", userId, { max: 2, windowMs: 24 * 60 * 60 * 1000 })) {
        return { ok: false, error: "rate_limited" };
      }

      {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("full_name_ar, full_name_en")
          .eq("id", userId)
          .maybeSingle();
        if (profile) {
          name = name || (isAr ? profile.full_name_ar : profile.full_name_en) || profile.full_name_ar || undefined;
        }
      }

      if (!email) return { ok: false, error: "missing_email" };

      const recipientName = name || (isAr ? "عضو الأسرة الكريمة" : "Honored Member");

      const { enqueueNotificationEmail } = await import("@/lib/email/notification-queue.server");
      await enqueueNotificationEmail({
        userId,
        recipientEmail: email,
        recipientName,
        emailType: "auth_welcome",
        category: "auth",
        priority: "HIGH",
        language: locale,
        variables: {
          user_name: recipientName,
          user_email: email,
          date: new Date().toLocaleDateString(isAr ? "ar-SA" : "en-US"),
        },
      });

      return { ok: true };
    } catch (err: any) {
      console.error("[auth-email] sendWelcomeEmail failed:", err);
      return { ok: false, error: err.message };
    }
  });
