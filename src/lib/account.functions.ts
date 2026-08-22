import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  membershipRequestSchema,
  profileUpdateSchema,
} from "./account.schemas";

import { z } from "zod";

// --- Simple in-memory rate limiter for the public, unauthenticated
// membership-verification lookup below. This endpoint accepts only a short
// (6+ hex char) prefix of a member id, so without throttling it could be
// brute-forced/enumerated. Per-process, per-IP, sliding-window counter --
// no external dependency, resets on deploy/restart, good enough as a
// first line of defense in front of Supabase's own request limits.
const VERIFY_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const VERIFY_RATE_LIMIT_MAX_ATTEMPTS = 20; // per IP, per window
const verifyAttemptsByIp = new Map<string, { count: number; windowStart: number }>();

function isVerifyRateLimited(ip: string): boolean {
  const now = Date.now();

  // Opportunistically prune stale entries so the map can't grow unbounded.
  if (verifyAttemptsByIp.size > 5000) {
    for (const [key, entry] of verifyAttemptsByIp) {
      if (now - entry.windowStart > VERIFY_RATE_LIMIT_WINDOW_MS) {
        verifyAttemptsByIp.delete(key);
      }
    }
  }

  const entry = verifyAttemptsByIp.get(ip);
  if (!entry || now - entry.windowStart > VERIFY_RATE_LIMIT_WINDOW_MS) {
    verifyAttemptsByIp.set(ip, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  return entry.count > VERIFY_RATE_LIMIT_MAX_ATTEMPTS;
}

function getRequestIp(): string {
  try {
    const request = getRequest();
    const forwardedFor = request?.headers.get("x-forwarded-for");
    if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
    return request?.headers.get("x-real-ip")?.trim() || "unknown";
  } catch {
    return "unknown";
  }
}

export type AccountSnapshot = {
  profile: {
    id: string;
    full_name_ar: string | null;
    full_name_en: string | null;
    branch_slug: string | null;
    phone: string | null;
    email: string | null;
    lineage_notes: string | null;
    avatar_path: string | null;
    show_in_directory: boolean;
  } | null;
  roles: string[];
  request: {
    id: string;
    status: "pending" | "approved" | "rejected";
    review_note: string | null;
    created_at: string;
  } | null;
};

export const getMyAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AccountSnapshot> => {
    const { supabase, userId } = context;

    const [profileRes, rolesRes, requestRes] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, full_name_ar, full_name_en, branch_slug, phone, email, lineage_notes, avatar_path, show_in_directory",
        )
        .eq("id", userId)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase
        .from("membership_requests")
        .select("id, status, review_note, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    return {
      profile: profileRes.data ?? null,
      roles: (rolesRes.data ?? []).map((r) => r.role as string),
      request: requestRes.data ?? null,
    };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => profileUpdateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;

    // Nothing creates a profiles row on sign-up or membership approval, so
    // this must be able to create it on a member's first save, not only
    // update an existing one. An UPDATE against a non-existent row silently
    // affects zero rows and returns no error -- every first-time save would
    // otherwise report success while persisting nothing.
    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId,
        email: String(claims.email ?? "") || null,
        full_name_ar: data.full_name_ar,
        full_name_en: data.full_name_en || null,
        branch_slug: data.branch_slug || null,
        phone: data.phone || null,
        lineage_notes: data.lineage_notes || null,
        avatar_path: data.avatar_path || null,
        show_in_directory: data.show_in_directory,
      },
      { onConflict: "id" },
    );

    if (error) {
      console.error("[account] profile update failed", error.code, error.message);
      return { ok: false as const, error: "update_failed" };
    }
    return { ok: true as const };
  });

export const getMemberVerification = createServerFn({ method: "GET" })
  .validator((input: unknown) =>
    z
      .object({ id: z.string().trim().regex(/^(ABO-)?[0-9a-f]{6,}$/i, "invalid_code") })
      .parse(input),
  )
  .handler(async ({ data }) => {
    // This is a public, unauthenticated lookup keyed on a short hex prefix,
    // so throttle it per-IP before touching the database at all.
    if (isVerifyRateLimited(getRequestIp())) {
      return { ok: false, verified: false, member: null };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const rawId = data.id.replace(/^ABO-/i, "").trim().toLowerCase();

    // A single `.ilike` prefix match — not a hand-built `.or()` filter string —
    // so nothing in `rawId` (already regex-validated to hex above) can change
    // the shape of the query.
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name_ar, full_name_en, branch_slug, avatar_path, created_at")
      .ilike("id", `${rawId}%`)
      .order("id")
      .limit(5);

    // Require the prefix to resolve to exactly one profile. Picking
    // `profiles[0]` when several ids share the same short prefix would
    // silently reveal a different member's name/photo/role than the one the
    // scanned code actually belongs to, so any ambiguity is treated the same
    // as "not found" rather than guessed at.
    if (error || !profiles || profiles.length !== 1) {
      return { ok: false, verified: false, member: null };
    }

    const match = profiles[0];

    // Check active role in user_roles
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", match.id);

    const roleList = (roles ?? []).map((r) => r.role as string);
    const isMember = roleList.includes("member");
    const isAdmin = roleList.includes("admin");

    // Only active members and admins are verified official members
    if (!isMember && !isAdmin) {
      return {
        ok: true,
        verified: false,
        member: null,
        message: "العضوية غير معتمدة أو قيد المراجعة",
      };
    }

    return {
      ok: true,
      verified: true,
      member: {
        id: match.id,
        member_code: "ABO-" + match.id.substring(0, 6).toUpperCase(),
        full_name_ar: match.full_name_ar ?? "عضو الأسرة المعتمد",
        full_name_en: match.full_name_en ?? "Verified Family Member",
        branch_slug: match.branch_slug ?? "عام",
        avatar_path: match.avatar_path,
        created_at: match.created_at,
        role: isAdmin ? "أمانة المجلس (مسؤول معتمد)" : "عضو معتمد وموثق",
        is_admin: isAdmin,
      },
    };
  });

export const submitMembershipRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => membershipRequestSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;

    const { data: existing } = await supabase
      .from("membership_requests")
      .select("id, status")
      .eq("user_id", userId)
      .eq("status", "pending")
      .maybeSingle();

    if (existing) return { ok: false as const, error: "already_pending" };

    const { error } = await supabase.from("membership_requests").insert({
      user_id: userId,
      full_name_ar: data.full_name_ar,
      full_name_en: data.full_name_en || null,
      email: String(claims.email ?? ""),
      phone: data.phone || null,
      branch_slug: data.branch_slug || null,
      father_lineage: data.father_lineage || null,
      notes: data.notes || null,
    });

    if (error) {
      console.error("[account] request insert failed", error.code, error.message);
      return { ok: false as const, error: "insert_failed" };
    }
    return { ok: true as const };
  });
