import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Public "join this initiative" interest form.
 *
 * `initiatives` carries a public SELECT policy, but `initiative_registrations`
 * only grants anon an INSERT policy (no public SELECT) — matching
 * `event_registrations` — so the initiative lookup below has to run through
 * the service-role client, same reasoning as `submitEventRegistration` in
 * events-public.functions.ts.
 *
 * Keyed by the initiative's `slug` rather than its DB id: the public
 * `InitiativeItem` type (content/cms-adapt.ts) never exposes the row id, and
 * this keeps the lookup self-validating — a slug that isn't a real,
 * published initiative simply reports `initiative_not_found`.
 */

const initiativeJoinSchema = z.object({
  initiative_slug: z.string().trim().min(1).max(200),
  name: z.string().trim().min(2, "الاسم مطلوب").max(100),
  email: z.string().trim().email("البريد الإلكتروني غير صحيح").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  locale: z.enum(["ar", "en"]).default("ar"),
  // Anti-bot honeypot — real visitors never fill this in. Accepted (not capped
  // at length 0) so the handler can silently drop the submission instead of
  // failing validation; see forms.schemas.ts for the same reasoning.
  website_url_check: z.string().max(200).optional(),
  turnstile_token: z.string().max(2048).optional(),
});

export type InitiativeJoinInput = z.infer<typeof initiativeJoinSchema>;

export type InitiativeJoinResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | "verification_failed"
        | "rate_limited"
        | "initiative_not_found"
        | "already_registered"
        | "insert_failed";
    };

export const joinInitiative = createServerFn({ method: "POST" })
  .validator((input: unknown) => initiativeJoinSchema.parse(input))
  .handler(async ({ data }): Promise<InitiativeJoinResult> => {
    if (data.website_url_check && data.website_url_check.length > 0) {
      // Bot tripped the honeypot — report success without writing anything.
      return { ok: true };
    }

    // This handler writes with the service-role client, so RLS is not a second
    // line of defence here — throttle before doing anything else.
    const { isPublicSubmissionRateLimited, getRequestIp } =
      await import("./public-forms-rate-limit.server");
    if (isPublicSubmissionRateLimited("initiative_join", { max: 6 })) {
      console.warn("[initiatives-public] rate limited");
      return { ok: false, error: "rate_limited" };
    }

    const { verifyTurnstileToken } = await import("./turnstile.server");
    const verification = await verifyTurnstileToken(data.turnstile_token, getRequestIp());
    if (!verification.ok) {
      console.error("[initiatives-public] turnstile verification failed", verification.error);
      return { ok: false, error: "verification_failed" };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: initiative, error: initiativeError } = await supabaseAdmin
      .from("initiatives")
      .select("id, is_published")
      .eq("slug", data.initiative_slug)
      .maybeSingle();

    if (initiativeError) {
      console.error(
        "[initiatives-public] initiative lookup failed",
        initiativeError.code,
        initiativeError.message,
      );
      return { ok: false, error: "initiative_not_found" };
    }
    if (!initiative || !initiative.is_published) {
      return { ok: false, error: "initiative_not_found" };
    }

    const { error: insertError } = await supabaseAdmin.from("initiative_registrations").insert({
      initiative_id: initiative.id,
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone || null,
      notes: data.notes || null,
      status: "new",
    });

    if (insertError) {
      // Unique violation -- same email already registered interest for this initiative.
      if (insertError.code === "23505") {
        return { ok: false, error: "already_registered" };
      }
      console.error("[initiatives-public] insert failed", insertError.code, insertError.message);
      return { ok: false, error: "insert_failed" };
    }

    return { ok: true };
  });
