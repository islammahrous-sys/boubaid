import { createServerFn } from "@tanstack/react-start";
import {
  contactMessageSchema,
  newsletterSchema,
  achieverNominationSchema,
  businessSubmissionSchema,
} from "./forms.schemas";

/**
 * Result shape returned to the client — never leaks provider errors.
 *
 * `already` is kept in the type for backwards compatibility with existing
 * callers but is no longer set by `subscribeToNewsletter`: telling an anonymous
 * caller whether an address is already on the list is an email-enumeration
 * oracle on a public endpoint. See that handler for the details.
 */
export type FormResult = { ok: true; already?: boolean } | { ok: false; error: string };

/**
 * Shared anti-abuse gate for the public (anonymous) form handlers.
 *
 * Order matters: honeypot first (free), then the per-IP throttle (free), then
 * Turnstile (a network round-trip to Cloudflare). Returns a `FormResult` to
 * return straight to the caller, or `null` to continue with the write.
 */
async function guardPublicSubmission(options: {
  scope: string;
  honeypot: string | undefined;
  /**
   * Pass this ONLY for forms that actually render a TurnstileWidget. Omitting
   * it skips verification for that form: `verifyTurnstileToken` rejects a
   * missing token once TURNSTILE_SECRET_KEY is set, so passing `{ token:
   * undefined }` from a form with no widget would reject every genuine
   * submission the moment the secret is configured.
   */
  turnstile?: { token: string | undefined };
  max?: number;
  windowMs?: number;
}): Promise<FormResult | null> {
  // Bot tripped the honeypot — report success without writing anything.
  if (options.honeypot && options.honeypot.length > 0) return { ok: true };

  const { isPublicSubmissionRateLimited, getRequestIp } =
    await import("./public-forms-rate-limit.server");
  if (
    isPublicSubmissionRateLimited(options.scope, {
      max: options.max,
      windowMs: options.windowMs,
    })
  ) {
    console.warn(`[${options.scope}] rate limited`);
    return { ok: false, error: "rate_limited" };
  }

  if (options.turnstile) {
    const { verifyTurnstileToken } = await import("./turnstile.server");
    const verification = await verifyTurnstileToken(options.turnstile.token, getRequestIp());
    if (!verification.ok) {
      console.error(`[${options.scope}] turnstile verification failed`, verification.error);
      return { ok: false, error: "verification_failed" };
    }
  }

  return null;
}

export const submitContactMessage = createServerFn({ method: "POST" })
  .validator((input: unknown) => contactMessageSchema.parse(input))
  .handler(async ({ data }): Promise<FormResult> => {
    const blocked = await guardPublicSubmission({
      scope: "contact",
      honeypot: data.website_url_check,
      turnstile: { token: data.turnstile_token },
      max: 5,
    });
    if (blocked) return blocked;

    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();

    const { error } = await supabase.from("contact_messages").insert({
      name: data.name,
      email: data.email.toLowerCase(),
      subject: data.subject || null,
      message: data.message,
      locale: data.locale,
    });

    if (error) {
      console.error("[contact] insert failed", error.code, error.message);
      return { ok: false, error: "insert_failed" };
    }

    return { ok: true };
  });

export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .validator((input: unknown) => newsletterSchema.parse(input))
  .handler(async ({ data }): Promise<FormResult> => {
    // No Turnstile here on purpose: the footer form doesn't render the widget,
    // so it never sends a token and enforcing one would reject every genuine
    // subscription the moment TURNSTILE_SECRET_KEY is configured. Honeypot +
    // per-IP throttle are the protection until the widget is added to Footer.tsx.
    const blocked = await guardPublicSubmission({
      scope: "newsletter",
      honeypot: data.website_url_check,
      max: 5,
    });
    if (blocked) return blocked;

    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();

    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: data.email.toLowerCase(),
      name: data.name || null,
      locale: data.locale,
    });

    // Unique violation → already on the list. Reported as a plain success, NOT
    // as `already: true`: this endpoint is anonymous, so a distinguishable
    // "already subscribed" answer lets anyone probe arbitrary addresses to learn
    // who is on the family's list.
    if (error && error.code === "23505") return { ok: true };

    if (error) {
      console.error("[newsletter] insert failed", error.code, error.message);
      return { ok: false, error: "insert_failed" };
    }

    return { ok: true };
  });

export const submitAchieverNomination = createServerFn({ method: "POST" })
  .validator((input: unknown) => achieverNominationSchema.parse(input))
  .handler(async ({ data }): Promise<FormResult> => {
    const blocked = await guardPublicSubmission({
      scope: "nomination",
      honeypot: data.website_url_check,
      // The nomination form doesn't render a Turnstile widget, so `turnstile`
      // is intentionally omitted — see the note on subscribeToNewsletter.
      max: 5,
      windowMs: 30 * 60 * 1000,
    });
    if (blocked) return blocked;

    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();

    // Store any attached certificates in the private `nomination-docs` bucket
    // (server-side, service-role) and reference their paths in the message.
    const MAX_BYTES = 10 * 1024 * 1024;
    const EXT: Record<string, string> = {
      "application/pdf": "pdf",
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const storedAttachments: string[] = [];
    const attachments = data.attachments ?? [];
    if (attachments.length > 0) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const folder = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      for (let i = 0; i < attachments.length; i++) {
        const att = attachments[i];
        let bytes: Buffer;
        try {
          bytes = Buffer.from(att.data, "base64");
        } catch {
          return { ok: false, error: "attachment_invalid" };
        }
        if (bytes.length === 0 || bytes.length > MAX_BYTES) {
          return { ok: false, error: "attachment_too_large" };
        }
        const path = `${folder}/${i + 1}.${EXT[att.type] ?? "bin"}`;
        const { error: upErr } = await supabaseAdmin.storage
          .from("nomination-docs")
          .upload(path, bytes, { contentType: att.type, upsert: false });
        if (upErr) {
          console.error("[nomination] attachment upload failed", upErr.message);
          return { ok: false, error: "attachment_failed" };
        }
        storedAttachments.push(`nomination-docs/${path} — ${att.name}`);
      }
    }

    const formattedMessage = [
      `المرشح: ${data.nominee_name}`,
      `الفرع: ${data.branch_slug || "غير محدد"}`,
      `المجال: ${data.field} (${data.category})`,
      `السنة/التاريخ: ${data.year || "غير محدد"}`,
      `ملخص الإنجاز:\n${data.achievement_summary}`,
      data.biography ? `نبذة مختصرة:\n${data.biography}` : null,
      data.nomination_reason ? `أسباب الترشيح:\n${data.nomination_reason}` : null,
      data.evidence_url ? `رابط الإثبات: ${data.evidence_url}` : null,
      storedAttachments.length > 0
        ? `المرفقات (${storedAttachments.length}):\n${storedAttachments.join("\n")}`
        : null,
      data.notes ? `ملاحظات إضافية: ${data.notes}` : null,
      `---`,
      `مقدم الترشيح: ${data.nominator_name}`,
      `هاتف التواصل: ${data.nominator_phone}`,
      data.nominator_email ? `البريد: ${data.nominator_email}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const { error } = await supabase.from("inquiries").insert({
      name: data.nominator_name,
      email: data.nominator_email || "nomination@albouabidfamily.com",
      subject: `ترشيح لسجل المتميزين: ${data.nominee_name}`,
      message: formattedMessage,
      source: "achiever_nomination",
      status: "new",
    });

    if (error) {
      console.error("[nomination] insert failed", error.code, error.message);
      return { ok: false, error: "insert_failed" };
    }

    return { ok: true };
  });

export const submitBusinessListing = createServerFn({ method: "POST" })
  .validator((input: unknown) => businessSubmissionSchema.parse(input))
  .handler(async ({ data }): Promise<FormResult> => {
    const blocked = await guardPublicSubmission({
      scope: "business_submission",
      honeypot: data.website_url_check,
      // No Turnstile widget on this form — `turnstile` intentionally omitted.
      max: 3,
      windowMs: 60 * 60 * 1000,
    });
    if (blocked) return blocked;

    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();

    // The `businesses` table's real columns don't line up 1:1 with this
    // public form (no single `category`/`phone`+`email`/`national_address`,
    // and `slug`/`city_ar` are required but never collected here) — mapped
    // to their closest equivalents. `owner_name_ar` has no column to land in;
    // it's folded into the description so the submission isn't lost.
    const slug = `${
      data.name_ar
        .trim()
        .toLowerCase()
        .replace(/[^ء-يa-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60) || "business"
    }-${Date.now().toString(36)}`;
    const contact = data.email ? `${data.phone} / ${data.email}` : data.phone;
    const description_ar = `صاحب المنشأة: ${data.owner_name_ar}\n\n${data.description_ar}`;

    const { error } = await supabase.from("businesses").insert({
      slug,
      name_ar: data.name_ar,
      name_en: data.name_en || null,
      category_ar: data.category,
      category_en: data.category,
      city_ar: data.city || data.national_address || "المبرز، الأحساء",
      owner_branch_ar: data.branch_slug || null,
      contact,
      website: data.website || null,
      description_ar,
      description_en: data.description_en || null,
      is_published: false,
      sort_order: 99,
    });

    if (error) {
      console.error("[business_submission] insert failed", error.code, error.message);
      return { ok: false, error: "insert_failed" };
    }

    return { ok: true };
  });

