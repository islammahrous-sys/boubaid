import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
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
    const { verifyTurnstileToken } = await import("./turnstile.server");
    const verification = await verifyTurnstileToken(data.turnstile_token);
    if (!verification.ok) {
      console.error("[contributions] turnstile verification failed", verification.error);
      return { ok: false as const, error: "verification_failed" };
    }

    const { supabase, userId, claims } = context;

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

/** Treasury ledger — treasurer/admin RLS policies are the boundary. */
export const getTreasuryOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TreasuryOverview> => {
    const { supabase, userId } = context;

    const [roles, rows] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("contributions").select(COLS).order("created_at", { ascending: false }).limit(500),
    ]);

    const roleList = (roles.data ?? []).map((r) => r.role as string);
    const contributions = (rows.data ?? []) as ContributionRow[];

    const sum = (status: string) =>
      contributions
        .filter((c) => c.status === status)
        .reduce((total, c) => total + Number(c.amount ?? 0), 0);

    return {
      contributions,
      canReview: roleList.includes("admin") || roleList.includes("super_admin") || roleList.includes("treasurer"),
      totals: { verified: sum("verified"), pending: sum("pending"), count: contributions.length },
    };
  });

export const reviewContribution = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => contributionReviewSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("contributions")
      .update({
        status: data.status,
        review_note: data.review_note || null,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    if (error) {
      console.error("[contributions] review failed", error.code, error.message);
      return { ok: false as const, error: "update_failed" };
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
