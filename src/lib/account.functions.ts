import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { membershipRequestSchema, profileUpdateSchema } from "./account.schemas";

import { z } from "zod";

// --- Simple in-memory rate limiter for the public, unauthenticated
// membership-verification lookup below. This endpoint accepts only a short
// (6+ hex char) prefix of a member id, so without throttling it could be
// brute-forced/enumerated. Per-process, per-IP, sliding-window counter --
// no external dependency, resets on deploy/restart, good enough as a
// first line of defense in front of Supabase's own request limits.
const VERIFY_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const VERIFY_RATE_LIMIT_MAX_ATTEMPTS = 20; // per IP, per window
// `x-forwarded-for` is client-supplied on most hosts, so a caller can mint a
// fresh "IP" per request and walk straight past the per-IP counter. A global
// ceiling for the same window puts a hard floor under that bypass: even with
// perfectly rotated headers, the endpoint can't be hammered faster than this.
const VERIFY_RATE_LIMIT_MAX_GLOBAL = 600; // all callers, per window
const verifyAttemptsByIp = new Map<string, { count: number; windowStart: number }>();
let verifyGlobalWindowStart = 0;
let verifyGlobalCount = 0;

function isVerifyRateLimited(ip: string): boolean {
  const now = Date.now();

  if (now - verifyGlobalWindowStart > VERIFY_RATE_LIMIT_WINDOW_MS) {
    verifyGlobalWindowStart = now;
    verifyGlobalCount = 0;
  }
  verifyGlobalCount += 1;
  if (verifyGlobalCount > VERIFY_RATE_LIMIT_MAX_GLOBAL) return true;

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

/** Headers a CDN/edge sets itself and that a client therefore cannot forge
 *  end-to-end. Checked before `x-forwarded-for`, whose first entry is just
 *  whatever the caller put in the request. */
const TRUSTED_CLIENT_IP_HEADERS = [
  "cf-connecting-ip", // Cloudflare
  "x-vercel-forwarded-for", // Vercel
  "x-nf-client-connection-ip", // Netlify
  "fly-client-ip", // Fly.io
  "true-client-ip", // Akamai / Cloudflare Enterprise
  "x-real-ip", // nginx and most reverse proxies
];

function getRequestIp(): string {
  try {
    const request = getRequest();
    if (!request?.headers) return "unknown";

    for (const header of TRUSTED_CLIENT_IP_HEADERS) {
      const value = request.headers.get(header)?.split(",")[0]?.trim();
      if (value) return value;
    }

    // Last resort: spoofable, but still narrows down naive abuse, and the
    // global ceiling above bounds the damage when it is forged.
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
    return "unknown";
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
    education_level: string | null;
    city: string | null;
    address: string | null;
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
          "id, full_name_ar, full_name_en, branch_slug, phone, email, education_level, city, address, avatar_path, show_in_directory",
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

    // Every one of these drives a *state*, not just a display value: a failed
    // membership_requests read used to fall through to `request: null`, which
    // the account page renders as "you have not applied yet" complete with a
    // Submit button -- to a member who is actually pending or already
    // approved. Surfacing the failure lets the UI show an error + retry
    // instead of confidently rendering the wrong stage of the journey.
    const failed = profileRes.error ?? rolesRes.error ?? requestRes.error;
    if (failed) {
      console.error("[account] snapshot load failed", failed.code, failed.message);
      throw new Error("account_snapshot_failed");
    }

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

    // The `on_auth_user_created` trigger (public.handle_new_user) does insert
    // a profiles row at sign-up, but this stays an upsert rather than an
    // update: an UPDATE against a missing row silently affects zero rows and
    // returns no error, so any account that predates the trigger, or whose
    // row was ever removed, would report a successful save while persisting
    // nothing. Upserting makes first-save correct in every case.
    //
    // `email` is only written when the token actually carries the claim --
    // spreading it in unconditionally would overwrite the stored address with
    // NULL on any token whose email claim is absent.
    const emailClaim = String(claims.email ?? "").trim();

    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId,
        ...(emailClaim ? { email: emailClaim } : {}),
        full_name_ar: data.full_name_ar,
        full_name_en: data.full_name_en || null,
        branch_slug: data.branch_slug || null,
        phone: data.phone || null,
        education_level: data.education_level || null,
        city: data.city || null,
        address: data.address || null,
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

/** Persist a newly uploaded avatar immediately. Photo selection is a complete
 * action of its own, so it must not depend on a second profile-form submit. */
export const updateMyAvatar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) =>
    z.object({ avatar_path: z.string().trim().min(1).max(500) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ avatar_path: data.avatar_path })
      .eq("id", context.userId);

    if (error) {
      console.error("[account] avatar update failed", error.code, error.message);
      return { ok: false as const, error: "update_failed" };
    }

    return { ok: true as const };
  });

export const getMemberVerification = createServerFn({ method: "GET" })
  .validator((input: unknown) =>
    z
      .object({
        id: z
          .string()
          .trim()
          // `ABO-` + a 6+ hex-digit prefix of the member's uuid. Hyphens are
          // allowed so a full canonical uuid also validates; they're stripped
          // before the lookup.
          .regex(/^(ABO-)?[0-9a-f-]{6,40}$/i, "invalid_code"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    // This is a public, unauthenticated lookup keyed on a short hex prefix,
    // so throttle it per-IP before touching the database at all.
    if (isVerifyRateLimited(getRequestIp())) {
      return { ok: false, verified: false, member: null };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const rawId = data.id.replace(/^ABO-/i, "").trim().toLowerCase().replace(/-/g, "");

    // `profiles.id` is a `uuid` column, and Postgres has no `ILIKE` for uuid
    // (`operator does not exist: uuid ~~* unknown`) — the previous `.ilike("id",
    // …)` errored on every call, so `error` was always set and this endpoint
    // reported *every* member card as unverified. Match the hex prefix as an
    // inclusive uuid range instead: pad it out to the lowest and highest uuid
    // that share it. `rawId` is regex-validated to hex above, so both bounds are
    // always well-formed uuids.
    // After stripping `ABO-`/hyphens there must still be a usable prefix; a
    // too-short one would range-match most of the table.
    if (rawId.length < 6) {
      return { ok: false, verified: false, member: null };
    }

    const asUuid = (hex: string) =>
      `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
    const lowerBound = asUuid((rawId + "0".repeat(32)).slice(0, 32));
    const upperBound = asUuid((rawId + "f".repeat(32)).slice(0, 32));

    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name_ar, full_name_en, branch_slug, avatar_path, created_at")
      .gte("id", lowerBound)
      .lte("id", upperBound)
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

    const [existingRes, rolesRes, profileRes] = await Promise.all([
      supabase
        .from("membership_requests")
        .select("id, status")
        .eq("user_id", userId)
        .eq("status", "pending")
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("profiles").select("email").eq("id", userId).maybeSingle(),
    ]);

    if (existingRes.error || rolesRes.error) {
      console.error(
        "[account] request precheck failed",
        (existingRes.error ?? rolesRes.error)?.message,
      );
      return { ok: false as const, error: "insert_failed" };
    }

    if (existingRes.data) return { ok: false as const, error: "already_pending" };

    // The client hides the apply button for approved members, but this is a
    // plain POST endpoint -- without this check an already-approved member (or
    // anyone granted the role directly, who never filed a request at all) can
    // still open a fresh "pending" row, which both pollutes the secretariat
    // queue and flips their own account page back to "under review".
    const roleList = (rolesRes.data ?? []).map((r) => r.role as string);
    if (
      roleList.includes("member") ||
      roleList.includes("admin") ||
      roleList.includes("super_admin")
    ) {
      return { ok: false as const, error: "already_member" };
    }

    // `email` is NOT NULL on membership_requests, but an empty string
    // satisfies that constraint -- the secretariat would receive an
    // unanswerable request. Fall back to the stored profile address and
    // refuse outright rather than filing a contactless application.
    const email = String(claims.email ?? "").trim() || (profileRes.data?.email ?? "").trim();
    if (!email) return { ok: false as const, error: "missing_email" };

    const { error } = await supabase.from("membership_requests").insert({
      user_id: userId,
      full_name_ar: data.full_name_ar,
      full_name_en: data.full_name_en || null,
      email,
      phone: data.phone || null,
      branch_slug: data.branch_slug || null,
      father_lineage: data.father_lineage || null,
      notes: data.notes || null,
    });

    // `membership_requests_one_pending_per_user` is a partial unique index, so
    // the check above losing a race (two tabs, double-tap) surfaces as 23505.
    // That means the request *is* on file -- reporting a generic failure would
    // tell the member the opposite of what happened.
    if (error?.code === "23505") {
      return { ok: false as const, error: "already_pending" };
    }

    if (error) {
      console.error("[account] request insert failed", error.code, error.message);
      return { ok: false as const, error: "insert_failed" };
    }

    try {
      const { notifyAdminsOnMembershipRequest } = await import("@/lib/notifications.server");
      void notifyAdminsOnMembershipRequest({
        id: userId,
        fullName: data.full_name_ar,
        branch: data.branch_slug,
        userId,
      }).catch((err) => console.error("[account] notifyAdminsOnMembershipRequest failed:", err));
    } catch (err) {
      console.warn("[account] notification trigger failed:", err);
    }

    return { ok: true as const };
  });

/* =========================================================================
 * Member-facing notifications & preferences.
 * ========================================================================= */

export type MyNotification = {
  id: string;
  type: string;
  title_ar: string;
  title_en: string | null;
  message_ar: string;
  message_en: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export const getMyNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(
    async ({ context }): Promise<{ notifications: MyNotification[]; unreadCount: number }> => {
      const { supabase, userId } = context;

      const [listRes, unreadRes] = await Promise.all([
        supabase
          .from("notifications")
          .select("id, type, title_ar, title_en, message_ar, message_en, link, is_read, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("is_read", false),
      ]);

      if (listRes.error) throw new Error(listRes.error.message);

      const notifications = listRes.data ?? [];
      return {
        notifications,
        unreadCount: unreadRes.count ?? notifications.filter((n) => !n.is_read).length,
      };
    },
  );

export const markMyNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const markAllMyNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMyNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const notificationPreferencesSchema = z.object({
  system_alerts: z.boolean().default(true),
  family_events: z.boolean().default(true),
  contributions: z.boolean().default(true),
  lineage_updates: z.boolean().default(true),
  articles_news: z.boolean().default(true),
  email_notifications: z.boolean().default(true),
  in_app_notifications: z.boolean().default(true),
});

export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;

export const getMyNotificationPreferences = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<NotificationPreferences> => {
    const { supabase, userId } = context;

    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data) {
        return {
          system_alerts: data.system_alerts ?? true,
          family_events: data.family_events ?? true,
          contributions: data.contributions ?? true,
          lineage_updates: data.lineage_updates ?? true,
          articles_news: data.articles_news ?? true,
          email_notifications: data.email_notifications ?? true,
          in_app_notifications: data.in_app_notifications ?? true,
        };
      }
    } catch {
      // ignore
    }

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: userRes } = await supabaseAdmin.auth.admin.getUserById(userId);
      const meta = userRes?.user?.user_metadata?.notification_preferences;
      if (meta && typeof meta === "object") {
        return notificationPreferencesSchema.parse(meta);
      }
    } catch {
      // ignore
    }

    return {
      system_alerts: true,
      family_events: true,
      contributions: true,
      lineage_updates: true,
      articles_news: true,
      email_notifications: true,
      in_app_notifications: true,
    };
  });

export const updateMyNotificationPreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => notificationPreferencesSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    try {
      await supabase.from("notification_preferences").upsert(
        {
          user_id: userId,
          system_alerts: data.system_alerts,
          family_events: data.family_events,
          contributions: data.contributions,
          lineage_updates: data.lineage_updates,
          articles_news: data.articles_news,
          email_notifications: data.email_notifications,
          in_app_notifications: data.in_app_notifications,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
    } catch (err) {
      console.warn("[account] upsert notification_preferences fallback:", err);
    }

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { notification_preferences: data },
      });
    } catch (err) {
      console.warn("[account] update user_metadata preferences fallback:", err);
    }

    return { ok: true, preferences: data };
  });
