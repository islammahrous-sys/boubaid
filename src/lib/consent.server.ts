import { getRequest } from "@tanstack/react-start/server";
import { LEGAL_VERSION, type OptionalConsentKey } from "@/content/legal";
import { getRequestIp } from "./public-forms-rate-limit.server";

/**
 * Consent evidence lives in `audit_logs` (service-role write, admin-only read
 * through RLS) so it is append-only from the member's side: every acceptance,
 * grant and withdrawal is a new row, and the current state is simply the
 * latest row per consent. `entity_id` is the account id, or the lower-cased
 * email for anonymous forms such as the newsletter.
 */
export const CONSENT_ENTITY = "legal_consent";

export type ConsentEvent = {
  /** What the person agreed to (or withdrew). */
  document: "terms" | "privacy" | OptionalConsentKey;
  granted: boolean;
  /** Where it happened, e.g. "signup", "account", "newsletter", "membership_request". */
  source: string;
  userId?: string | null;
  email?: string | null;
};

export async function recordConsents(events: ConsentEvent[]): Promise<void> {
  if (events.length === 0) return;
  const request = getRequest();
  const ip = getRequestIp();
  const userAgent = request?.headers.get("user-agent")?.slice(0, 400) ?? null;
  const acceptedAt = new Date().toISOString();

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("audit_logs").insert(
    events.map((e) => ({
      actor_user_id: e.userId ?? null,
      action: e.granted ? "consent_granted" : "consent_withdrawn",
      entity_type: CONSENT_ENTITY,
      entity_id: e.userId ?? e.email?.toLowerCase() ?? null,
      ip_address: ip === "unknown" ? null : ip,
      user_agent: userAgent,
      metadata: {
        document: e.document,
        granted: e.granted,
        version: LEGAL_VERSION,
        accepted_at: acceptedAt,
        source: e.source,
        email: e.email?.toLowerCase() ?? null,
      },
    })),
  );
  // Consent evidence must never be silently lost: callers decide whether a
  // failure blocks the action (sign-up does), so surface it.
  if (error) throw new Error(`consent_record_failed: ${error.message}`);
}

export type ConsentRecord = {
  document: string;
  granted: boolean;
  version: string;
  accepted_at: string;
  source: string;
};

/** Every consent event for one account, newest first. */
export async function listConsents(userId: string): Promise<ConsentRecord[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("audit_logs")
    .select("metadata, created_at")
    .eq("entity_type", CONSENT_ENTITY)
    .eq("entity_id", userId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => {
    const m = (row.metadata ?? {}) as Record<string, unknown>;
    return {
      document: String(m.document ?? ""),
      granted: Boolean(m.granted),
      version: String(m.version ?? ""),
      accepted_at: String(m.accepted_at ?? row.created_at),
      source: String(m.source ?? ""),
    };
  });
}
