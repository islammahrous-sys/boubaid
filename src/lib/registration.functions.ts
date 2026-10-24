import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdminAuth } from "@/integrations/supabase/auth-middleware";

export type RegistrationRequest = {
  id: string;
  user_id: string | null;
  status: "pending" | "approved" | "rejected";
  full_name_ar: string;
  full_name_en: string | null;
  email: string;
  phone: string | null;
  branch_slug: string | null;
  father_lineage: string | null;
  notes: string | null;
  review_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  /** Terms version this applicant accepted, if any is on record. */
  terms_version: string | null;
  terms_accepted_at: string | null;
};

export type UnappliedAccount = {
  id: string;
  full_name_ar: string | null;
  email: string | null;
  created_at: string;
};

/**
 * Everything the Registration desk needs in one round trip: every membership
 * request with its applicant's terms acceptance, plus accounts that signed up
 * but never applied (so the secretariat can follow up).
 */
export const getRegistrationDesk = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [reqRes, profilesRes, rolesRes, consentRes] = await Promise.all([
      supabase
        .from("membership_requests")
        .select(
          "id, user_id, status, full_name_ar, full_name_en, email, phone, branch_slug, father_lineage, notes, review_note, reviewed_at, created_at",
        )
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name_ar, email, created_at"),
      supabase.from("user_roles").select("user_id, role"),
      // Consent evidence is admin-only (audit_logs); service role keeps this
      // independent of how the audit-log SELECT policy evolves.
      supabaseAdmin
        .from("audit_logs")
        .select("entity_id, metadata, created_at")
        .eq("entity_type", "legal_consent")
        .order("created_at", { ascending: false })
        .limit(5000),
    ]);
    const failed = reqRes.error ?? profilesRes.error ?? rolesRes.error;
    if (failed) throw new Error(failed.message);

    const termsByUser = new Map<string, { version: string; at: string }>();
    for (const row of consentRes.data ?? []) {
      const m = (row.metadata ?? {}) as Record<string, unknown>;
      if (m.document !== "terms" || !m.granted || !row.entity_id) continue;
      if (!termsByUser.has(row.entity_id)) {
        termsByUser.set(row.entity_id, {
          version: String(m.version ?? ""),
          at: String(m.accepted_at ?? row.created_at),
        });
      }
    }

    const requests: RegistrationRequest[] = (reqRes.data ?? []).map((r) => {
      const terms = r.user_id ? termsByUser.get(r.user_id) : undefined;
      return {
        ...(r as Omit<RegistrationRequest, "terms_version" | "terms_accepted_at">),
        status: r.status as RegistrationRequest["status"],
        terms_version: terms?.version ?? null,
        terms_accepted_at: terms?.at ?? null,
      };
    });

    const applied = new Set(requests.map((r) => r.user_id).filter(Boolean) as string[]);
    const hasRole = new Set((rolesRes.data ?? []).map((r) => r.user_id));
    const unapplied: UnappliedAccount[] = (profilesRes.data ?? [])
      .filter((p) => !applied.has(p.id) && !hasRole.has(p.id))
      .map((p) => ({ id: p.id, full_name_ar: p.full_name_ar, email: p.email, created_at: p.created_at }))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));

    return { requests, unapplied };
  });

export type ConsentLogRow = {
  id: string;
  created_at: string;
  action: string;
  entity_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  document: string;
  version: string;
  source: string;
  email: string | null;
};

/** Consent evidence for the console's consent register (newest first). */
export const getConsentRegister = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .validator((input: unknown) =>
    z.object({ search: z.string().trim().max(200).optional() }).default({}).parse(input ?? {}),
  )
  .handler(async ({ data }): Promise<ConsentLogRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("audit_logs")
      .select("id, created_at, action, entity_id, ip_address, user_agent, metadata")
      .eq("entity_type", "legal_consent")
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.search) q = q.ilike("metadata->>email", `%${data.search.toLowerCase()}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => {
      const m = (r.metadata ?? {}) as Record<string, unknown>;
      return {
        id: r.id,
        created_at: r.created_at,
        action: r.action,
        entity_id: r.entity_id,
        ip_address: r.ip_address,
        user_agent: r.user_agent,
        document: String(m.document ?? ""),
        version: String(m.version ?? ""),
        source: String(m.source ?? ""),
        email: (m.email as string | null) ?? null,
      };
    });
  });
