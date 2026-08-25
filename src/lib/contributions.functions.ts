import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth, requireTreasuryAuth } from "@/integrations/supabase/auth-middleware";
import {
  contributionInputSchema,
  contributionReviewSchema,
  receiptRefSchema,
} from "./contributions.schemas";

export type ContributionRow = {
  id: string;
  user_id: string | null;
  contributor_name: string;
  email: string | null;
  phone: string | null;
  amount: number;
  currency: string;
  method: string;
  purpose: string | null;
  reference: string | null;
  receipt_path: string | null;
  status: "pending" | "verified" | "rejected";
  review_note: string | null;
  created_at: string;
};

const COLS =
  "id, user_id, contributor_name, email, phone, amount, currency, method, purpose, reference, receipt_path, status, review_note, created_at";

/** Record a contribution/pledge. Bound to the signed-in member by RLS. */
export const submitContribution = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => contributionInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;

    const { isUserSubmissionRateLimited, getRequestIp } =
      await import("./public-forms-rate-limit.server");
    if (isUserSubmissionRateLimited("contribution", userId, { max: 15 })) {
      console.warn("[contributions] rate limited", userId);
      return { ok: false as const, error: "rate_limited" };
    }

    const { verifyTurnstileToken } = await import("./turnstile.server");
    const verification = await verifyTurnstileToken(data.turnstile_token, getRequestIp());
    if (!verification.ok) {
      console.error("[contributions] turnstile verification failed", verification.error);
      return { ok: false as const, error: "verification_failed" };
    }

    // A receipt may only be claimed from the caller's own folder. The path is
    // supplied by the client (the file is uploaded straight to storage from the
    // browser), so without this a member could point their pending contribution
    // at somebody else's receipt to make it look substantiated to the treasury.
    if (data.receipt_path && !data.receipt_path.startsWith(`${userId}/`)) {
      console.error("[contributions] receipt path does not belong to caller", userId);
      return { ok: false as const, error: "invalid_receipt" };
    }

    // NOTE: `status` is deliberately NOT part of the insert payload — it falls
    // to the column default ('pending') and only reviewContribution (treasury
    // middleware) can move it. Do not add it here.
    const { error } = await supabase.from("contributions").insert({
      user_id: userId,
      contributor_name: data.contributor_name,
      email: (data.email || String(claims.email ?? "")).toLowerCase() || null,
      phone: data.phone || null,
      amount: data.amount,
      currency: data.currency,
      method: data.method,
      purpose: data.purpose || null,
      reference: data.reference || null,
      receipt_path: data.receipt_path || null,
    });

    if (error) {
      console.error("[contributions] insert failed", error.code, error.message);
      return { ok: false as const, error: "insert_failed" };
    }
    return { ok: true as const };
  });

export const getMyContributions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ContributionRow[]> => {
    const { data, error } = await context.supabase
      .from("contributions")
      .select(COLS)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      console.error("[contributions] own read failed", error.code, error.message);
      return [];
    }
    return (data ?? []) as ContributionRow[];
  });

export type TreasuryOverview = {
  contributions: ContributionRow[];
  canReview: boolean;
  totals: { verified: number; pending: number; count: number };
};

/** Treasury ledger — requireTreasuryAuth is the boundary (RLS is defense-in-depth). */
export const getTreasuryOverview = createServerFn({ method: "GET" })
  .middleware([requireTreasuryAuth])
  .handler(async ({ context }): Promise<TreasuryOverview> => {
    const { supabase, userId } = context;

    const [roles, rows] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase
        .from("contributions")
        .select(COLS)
        .order("created_at", { ascending: false })
        .limit(500),
    ]);

    const roleList = (roles.data ?? []).map((r) => r.role as string);
    const contributions = (rows.data ?? []) as ContributionRow[];

    const sum = (status: string) =>
      contributions
        .filter((c) => c.status === status)
        .reduce((total, c) => total + Number(c.amount ?? 0), 0);

    return {
      contributions,
      canReview:
        roleList.includes("admin") ||
        roleList.includes("super_admin") ||
        roleList.includes("treasurer"),
      totals: { verified: sum("verified"), pending: sum("pending"), count: contributions.length },
    };
  });

export const reviewContribution = createServerFn({ method: "POST" })
  .middleware([requireTreasuryAuth])
  .validator((input: unknown) => contributionReviewSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: updated, error } = await context.supabase
      .from("contributions")
      .update({
        status: data.status,
        review_note: data.review_note || null,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select("id");

    if (error) {
      console.error("[contributions] review failed", error.code, error.message);
      return { ok: false as const, error: "update_failed" };
    }

    if (!updated || updated.length === 0) {
      console.error("[contributions] review affected zero rows", data.id);
      return { ok: false as const, error: "not_found" };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("audit_logs").insert({
      actor_user_id: context.userId,
      action: `contribution.${data.status}`,
      entity_type: "contributions",
      entity_id: data.id,
    });

    return { ok: true as const };
  });

/** Short-lived signed link to a private receipt; storage RLS gates access. */
export const getReceiptUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => receiptRefSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: signed, error } = await context.supabase.storage
      .from("receipts")
      .createSignedUrl(data.path, 120);
    if (error || !signed) {
      console.error("[contributions] sign failed", error?.message);
      return { ok: false as const, error: "sign_failed" };
    }
    return { ok: true as const, url: signed.signedUrl };
  });
