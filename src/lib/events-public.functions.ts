import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Public events: listing + RSVP.
 *
 * Reads use the anon-key client (`createPublicServerClient`) — `events` and
 * `places` both carry public SELECT policies, so this never needs elevated
 * privileges. `event_registrations`, by contrast, only grants anon an INSERT
 * policy (no public SELECT), so the registration count used to enforce
 * `max_attendees` has to run through the service-role client instead — see
 * `submitEventRegistration`. That also means this listing intentionally does
 * NOT show a live "X of Y seats taken" count (it would need the same
 * elevated read); capacity is enforced, and surfaced to the visitor, at
 * submission time via the `event_full` error below.
 */

export type PublicPlace = {
  id: string;
  name_ar: string;
  name_en: string | null;
  city: string | null;
  address: string | null;
};

export type PublicEventRow = {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  start_at: string;
  end_at: string | null;
  timezone: string;
  cover_path: string | null;
  cover_url: string | null;
  registration_enabled: boolean;
  registration_deadline: string | null;
  max_attendees: number | null;
  place: PublicPlace | null;
};

const EVENT_COLS =
  "id, slug, title_ar, title_en, description_ar, description_en, start_at, end_at, timezone, place_id, cover_path, registration_enabled, registration_deadline, max_attendees, status";

/** Published events that haven't finished yet, soonest first. */
export const getPublishedEvents = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicEventRow[]> => {
    try {
      const { createPublicServerClient } = await import("./supabase-public.server");
      const supabase = createPublicServerClient();
      const nowIso = new Date().toISOString();

      const { data, error } = await supabase
        .from("events")
        .select(EVENT_COLS)
        .eq("status", "published")
        // Still upcoming: multi-day events count until they end; point-in-time
        // events (no end_at) count until they start.
        .or(`end_at.gte.${nowIso},and(end_at.is.null,start_at.gte.${nowIso})`)
        .order("start_at", { ascending: true })
        .limit(100);

      if (error) {
        console.error("[events-public] read failed", error.code, error.message);
        return [];
      }

      const rows = data ?? [];
      if (rows.length === 0) return [];

      const placeIds = [...new Set(rows.map((r) => r.place_id).filter((id): id is string => Boolean(id)))];

      const [placesRes, { signContentPaths, resolveMedia }] = await Promise.all([
        placeIds.length
          ? supabase.from("places").select("id, name_ar, name_en, city, address").in("id", placeIds)
          : Promise.resolve({ data: [] as PublicPlace[] }),
        import("./content-media.server"),
      ]);

      const placesById = new Map((placesRes.data ?? []).map((p: any) => [p.id, p as PublicPlace]));
      const signedCovers = await signContentPaths(rows.map((r) => r.cover_path));

      return rows.map((r: any) => ({
        id: r.id,
        slug: r.slug,
        title_ar: r.title_ar,
        title_en: r.title_en,
        description_ar: r.description_ar,
        description_en: r.description_en,
        start_at: r.start_at,
        end_at: r.end_at,
        timezone: r.timezone,
        cover_path: r.cover_path,
        cover_url: resolveMedia(r.cover_path, signedCovers),
        registration_enabled: r.registration_enabled,
        registration_deadline: r.registration_deadline,
        max_attendees: r.max_attendees,
        place: r.place_id ? placesById.get(r.place_id) ?? null : null,
      }));
    } catch (err) {
      console.error("[events-public] getPublishedEvents caught error", err);
      return [];
    }
  },
);

const eventRegistrationSchema = z.object({
  event_id: z.string().uuid(),
  name: z.string().trim().min(2, "الاسم مطلوب").max(100),
  email: z.string().trim().email("البريد الإلكتروني غير صحيح").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  attendees_count: z.coerce.number().int().min(1).max(20),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  locale: z.enum(["ar", "en"]).default("ar"),
  // Anti-bot honeypot — real visitors never fill this in.
  website_url_check: z.string().max(0).optional(),
  turnstile_token: z.string().max(2048).optional(),
});

export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>;

export type EventRegistrationResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | "verification_failed"
        | "event_not_found"
        | "registration_closed"
        | "deadline_passed"
        | "event_full"
        | "insert_failed";
    };

/**
 * Public RSVP. Runs entirely through the service-role client because the
 * capacity check (summing `attendees_count` across existing registrations)
 * needs to read rows anon can't see under RLS — see the module note above.
 * Note: the read-then-insert capacity check below is not atomic; two
 * near-simultaneous submissions could both pass the check and slightly
 * overshoot `max_attendees`. Acceptable for a family-fund event RSVP at this
 * scale — a DB-level constraint/trigger would be the fix if it ever matters.
 */
export const submitEventRegistration = createServerFn({ method: "POST" })
  .validator((input: unknown) => eventRegistrationSchema.parse(input))
  .handler(async ({ data }): Promise<EventRegistrationResult> => {
    if (data.website_url_check && data.website_url_check.length > 0) {
      // Bot tripped the honeypot — report success without writing anything.
      return { ok: true };
    }

    const { verifyTurnstileToken } = await import("./turnstile.server");
    const verification = await verifyTurnstileToken(data.turnstile_token);
    if (!verification.ok) {
      console.error("[events-public] turnstile verification failed", verification.error);
      return { ok: false, error: "verification_failed" };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("id, status, registration_enabled, registration_deadline, max_attendees")
      .eq("id", data.event_id)
      .maybeSingle();

    if (eventError) {
      console.error("[events-public] event lookup failed", eventError.code, eventError.message);
      return { ok: false, error: "event_not_found" };
    }
    if (!event || event.status !== "published") {
      return { ok: false, error: "event_not_found" };
    }
    if (!event.registration_enabled) {
      return { ok: false, error: "registration_closed" };
    }
    if (event.registration_deadline && new Date(event.registration_deadline).getTime() < Date.now()) {
      return { ok: false, error: "deadline_passed" };
    }

    if (event.max_attendees != null) {
      const { data: existing, error: countError } = await supabaseAdmin
        .from("event_registrations")
        .select("attendees_count")
        .eq("event_id", data.event_id)
        .neq("status", "cancelled");

      if (countError) {
        console.error("[events-public] registration count failed", countError.code, countError.message);
        return { ok: false, error: "insert_failed" };
      }

      const currentTotal = (existing ?? []).reduce((sum, r) => sum + (r.attendees_count ?? 1), 0);
      if (currentTotal + data.attendees_count > event.max_attendees) {
        return { ok: false, error: "event_full" };
      }
    }

    const { error: insertError } = await supabaseAdmin.from("event_registrations").insert({
      event_id: data.event_id,
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone || null,
      attendees_count: data.attendees_count,
      notes: data.notes || null,
      // Matches the status values the admin console's attendee list expects
      // (registered / attended / cancelled / waitlist) — not the column's
      // own 'confirmed' default, which that UI has no option for.
      status: "registered",
    });

    if (insertError) {
      console.error("[events-public] insert failed", insertError.code, insertError.message);
      return { ok: false, error: "insert_failed" };
    }

    return { ok: true };
  });
