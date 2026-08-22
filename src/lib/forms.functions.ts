import { createServerFn } from "@tanstack/react-start";
import {
  contactMessageSchema,
  newsletterSchema,
  achieverNominationSchema,
  businessSubmissionSchema,
} from "./forms.schemas";

/** Result shape returned to the client — never leaks provider errors. */
export type FormResult = { ok: true; already?: boolean } | { ok: false; error: string };export const submitContactMessage = createServerFn({ method: "POST" })
  .validator((input: unknown) => contactMessageSchema.parse(input))
  .handler(async ({ data }): Promise<FormResult> => {
    const { verifyTurnstileToken } = await import("./turnstile.server");
    const verification = await verifyTurnstileToken(data.turnstile_token);
    if (!verification.ok) {
      console.error("[contact] turnstile verification failed", verification.error);
      return { ok: false, error: "verification_failed" };
    }

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
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();

    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: data.email.toLowerCase(),
      name: data.name || null,
      locale: data.locale,
    });

    // Unique violation → already on the list; treat as success.
    if (error && error.code === "23505") return { ok: true, already: true };

    if (error) {
      console.error("[newsletter] insert failed", error.code, error.message);
      return { ok: false, error: "insert_failed" };
    }

    return { ok: true };
  });

export const submitAchieverNomination = createServerFn({ method: "POST" })
  .validator((input: unknown) => achieverNominationSchema.parse(input))
  .handler(async ({ data }): Promise<FormResult> => {
    if (data.website_url_check && data.website_url_check.length > 0) {
      return { ok: true };
    }

    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();

    const formattedMessage = [
      `المرشح: ${data.nominee_name}`,
      `الفرع: ${data.branch_slug || "غير محدد"}`,
      `المجال: ${data.field} (${data.category})`,
      `السنة/التاريخ: ${data.year || "غير محدد"}`,
      `ملخص الإنجاز:\n${data.achievement_summary}`,
      data.evidence_url ? `رابط الإثبات: ${data.evidence_url}` : null,
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
    if (data.website_url_check && data.website_url_check.length > 0) {
      return { ok: true };
    }

    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();

    // The `businesses` table's real columns don't line up 1:1 with this
    // public form (no single `category`/`phone`+`email`/`national_address`,
    // and `slug`/`city_ar` are required but never collected here) — mapped
    // to their closest equivalents. `owner_name_ar` has no column to land in;
    // it's folded into the description so the submission isn't lost.
    const slug = `${data.name_ar.trim().toLowerCase().replace(/[^ء-يa-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "business"}-${Date.now().toString(36)}`;
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
