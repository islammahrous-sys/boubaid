import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * The signed-in member's consent history plus the current state of each
 * consent (latest event wins). Powers the "My agreements" card and its
 * printable acceptance certificate on /account.
 */
export const getMyConsents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { listConsents } = await import("./consent.server");
    const history = await listConsents(context.userId);
    const current: Record<string, (typeof history)[number]> = {};
    for (const event of history) {
      if (!current[event.document]) current[event.document] = event;
    }
    return { history, current, email: context.claims.email ?? null };
  });

/**
 * Grant or withdraw one optional consent. Terms acceptance is not toggleable
 * here: withdrawing it means closing the account, which goes through the
 * secretariat.
 */
export const setMyOptionalConsent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z
      .object({
        document: z.enum(["marketing", "media_publication"]),
        granted: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { recordConsents } = await import("./consent.server");
    await recordConsents([
      {
        document: data.document,
        granted: data.granted,
        source: "account",
        userId: context.userId,
        email: context.claims.email,
      },
    ]);

    // Marketing consent is what the newsletter list acts on, so keep the two
    // in step: withdrawing stops sending immediately.
    const email = context.claims.email?.toLowerCase();
    if (data.document === "marketing" && email) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: updated, error } = await supabaseAdmin
        .from("newsletter_subscribers")
        .update({ is_active: data.granted })
        .eq("email", email)
        .select("id");
      if (error) console.error("[consent] newsletter sync failed:", error.message);
      else if (data.granted && !updated?.length) {
        const { error: insertError } = await supabaseAdmin
          .from("newsletter_subscribers")
          .insert({ email, locale: "ar" });
        if (insertError && insertError.code !== "23505") {
          console.error("[consent] newsletter opt-in failed:", insertError.message);
        }
      }
    }
    return { ok: true as const };
  });

/**
 * Members who signed up before consent capture existed accept the current
 * terms once from their account page (the "renewed acceptance" of Article 12).
 */
export const acceptCurrentTerms = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { recordConsents } = await import("./consent.server");
    await recordConsents([
      { document: "terms", granted: true, source: "account", userId: context.userId, email: context.claims.email },
      { document: "privacy", granted: true, source: "account", userId: context.userId, email: context.claims.email },
    ]);
    return { ok: true as const };
  });
