import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth, requireTreasuryAuth } from "@/integrations/supabase/auth-middleware";
import {
  contributionInputSchema,
  contributionReviewSchema,
  receiptRefSchema,
  treasuryConfigSchema,
  manualContributionInputSchema,
  type TreasuryConfig,
  type ContributionTier,
  type FundPurpose,
} from "./contributions.schemas";
import { OFFICIAL_BANK_ACCOUNT, resolveBankAccount } from "@/content/fund-bank";

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

    try {
      const { notifyAdminsAndTreasurersOnContribution } =
        await import("@/lib/notifications.server");
      void notifyAdminsAndTreasurersOnContribution({
        id: userId,
        contributorName: data.contributor_name,
        amount: data.amount,
        currency: data.currency,
        userId,
      }).catch((err) => console.error("[contributions] notification dispatch failed:", err));
    } catch (err) {
      console.warn("[contributions] notification hook failed:", err);
    }

    return { ok: true as const };
  });

export type MemberBankAccount = {
  bankName: string;
  beneficiaryName: string;
  accountNumber: string;
  iban: string;
  notes?: string;
  bank_name_ar?: string;
  bank_name_en?: string;
  beneficiary_name_ar?: string;
  beneficiary_name_en?: string;
} | null;

const DEFAULT_TREASURY_CONFIG: TreasuryConfig = {
  bank_account: OFFICIAL_BANK_ACCOUNT,
  tiers: [
    {
      id: "tier-adult",
      category_ar: "اشتراك العضو البالغ",
      category_en: "Adult member",
      amount_ar: "١٠٠ ريال",
      amount_en: "SAR 100",
      numeric_amount: 100,
      frequency: "monthly",
      purpose_ar: "التشغيل وبرامج التكافل",
      purpose_en: "Operations and solidarity programmes",
      is_active: true,
      sort_order: 1,
    },
    {
      id: "tier-family",
      category_ar: "اشتراك الأسرة الواحدة",
      category_en: "Household",
      amount_ar: "٢٥٠ ريال",
      amount_en: "SAR 250",
      numeric_amount: 250,
      frequency: "monthly",
      purpose_ar: "التشغيل والبرامج والملتقى السنوي",
      purpose_en: "Operations, programmes, annual assembly",
      is_active: true,
      sort_order: 2,
    },
    {
      id: "tier-hq",
      category_ar: "مساهمة مشروع المقر",
      category_en: "Headquarters contribution",
      amount_ar: "حسب الاستطاعة",
      amount_en: "As able",
      numeric_amount: 0,
      frequency: "one_off",
      purpose_ar: "شراء الأرض والإنشاءات",
      purpose_en: "Land acquisition and construction",
      is_active: true,
      sort_order: 3,
    },
    {
      id: "tier-loan",
      category_ar: "قرض حسن مساهم",
      category_en: "Interest-free loan",
      amount_ar: "بالاتفاق",
      amount_en: "By arrangement",
      numeric_amount: 0,
      frequency: "one_off",
      purpose_ar: "تمويل مرحلة الإنشاء، يُردّ وفق جدول",
      purpose_en: "Construction phase, repaid on schedule",
      is_active: true,
      sort_order: 4,
    },
  ],
  fund_purposes: [
    {
      id: "general_ops",
      name_ar: "التشغيل وبرامج التكافل",
      name_en: "Operations & Solidarity",
      description_ar: "المصاريف التشغيلية والتكافل الاجتماعي للأسر",
      description_en: "Operating costs and social solidarity support",
      is_active: true,
    },
    {
      id: "annual_assembly",
      name_ar: "الملتقى السنوي والأنشطة",
      name_en: "Annual Assembly & Activities",
      description_ar: "تنظيم اللقاءات الدورية وتكريم المتميزين",
      description_en: "Organizing family gatherings and annual events",
      is_active: true,
    },
    {
      id: "hq_project",
      name_ar: "مشروع المقر الدائم (حي الحزام الذهبي)",
      name_en: "Permanent HQ Project (Al-Hizam Al-Dhahabi)",
      description_ar: "شراء الأرض وتجهيز الإنشاءات للمقر الجامع للأسرة",
      description_en: "Land acquisition and construction for family headquarters",
      is_active: true,
    },
    {
      id: "zakat",
      name_ar: "حساب الزكاة والصدقات",
      name_en: "Zakat & Charity Fund",
      description_ar: "حساب شرعي مستقل مخصص للزكاة",
      description_en: "Independent dedicated account for zakat & charity",
      is_active: true,
    },
    {
      id: "academic_awards",
      name_ar: "جائزة التفوق العلمي والمهني",
      name_en: "Academic & Professional Excellence Award",
      description_ar: "رعاية ودعم المبتكرين والطلاب المتفوقين",
      description_en: "Honouring students and high achievers",
      is_active: true,
    },
  ],
  quick_amounts: [100, 250, 500, 1000, 2500],
  salla_store_url: "https://albouabidfamily.com/القسط-الشهري/c1360847582",
  annual_target: 0,
  application_of_funds: {
    p1_ar:
      "تُوزَّع الموارد على ثلاثة حسابات مستقلة: حساب الزكاة، وحساب التشغيل والبرامج، وحساب مشروع المقر الدائم. ولا يجوز النقل بين الحسابات إلا بقرار من مجلس الأمناء.",
    p1_en:
      "Resources are allocated across three separate accounts: the zakat account, the operations and programmes account, and the permanent headquarters account. Transfers between them require a resolution of the board of trustees.",
    p2_ar:
      "ويُعرض تقرير مالي مراجَع على الجمعية العمومية سنوياً، ويُتاح ملخصه في الأرشيف الرقمي لأبناء الأسرة.",
    p2_en:
      "An audited financial report is laid before the general assembly each year, and a summary is made available to family members in the digital archive.",
  },
};

export type PublicTreasuryConfig = {
  tiers: TreasuryConfig["tiers"];
  fundPurposes: TreasuryConfig["fund_purposes"];
  quickAmounts: number[];
  sallaStoreUrl: string;
  applicationOfFunds: TreasuryConfig["application_of_funds"];
  /** Saved bank details, blank fields filled from the official record. */
  bankAccount: TreasuryConfig["bank_account"];
};

/** Publicly accessible treasury configuration (tiers, fund purposes, quick amounts, salla url, bank details). */
export const getPublicTreasuryConfig = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicTreasuryConfig> => {
    try {
      const { createPublicServerClient } = await import("./supabase-public.server");
      const supabase = createPublicServerClient();

      const { data: setting } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "treasury_config")
        .maybeSingle();

      const val = (setting?.value as any) ?? {};
      const tiers = Array.isArray(val.tiers)
        ? val.tiers.filter((t: any) => t.is_active !== false)
        : DEFAULT_TREASURY_CONFIG.tiers;
      const fundPurposes = Array.isArray(val.fund_purposes)
        ? val.fund_purposes.filter((f: any) => f.is_active !== false)
        : DEFAULT_TREASURY_CONFIG.fund_purposes;
      const quickAmounts =
        Array.isArray(val.quick_amounts) && val.quick_amounts.length > 0
          ? val.quick_amounts
          : DEFAULT_TREASURY_CONFIG.quick_amounts;
      const sallaStoreUrl = val.salla_store_url || DEFAULT_TREASURY_CONFIG.salla_store_url;
      const applicationOfFunds =
        val.application_of_funds || DEFAULT_TREASURY_CONFIG.application_of_funds;

      return {
        tiers,
        fundPurposes,
        quickAmounts,
        sallaStoreUrl,
        applicationOfFunds,
        bankAccount: resolveBankAccount(val.bank_account),
      };
    } catch (err) {
      console.error("[contributions] getPublicTreasuryConfig fallback error", err);
      return {
        tiers: DEFAULT_TREASURY_CONFIG.tiers,
        fundPurposes: DEFAULT_TREASURY_CONFIG.fund_purposes,
        quickAmounts: DEFAULT_TREASURY_CONFIG.quick_amounts,
        sallaStoreUrl: DEFAULT_TREASURY_CONFIG.salla_store_url,
        applicationOfFunds: DEFAULT_TREASURY_CONFIG.application_of_funds,
        bankAccount: OFFICIAL_BANK_ACCOUNT,
      };
    }
  },
);

/** Full treasury config for Admin / Council Console. */
export const getAdminTreasuryConfig = createServerFn({ method: "GET" })
  .middleware([requireTreasuryAuth])
  .handler(async ({ context }): Promise<TreasuryConfig> => {
    const { supabase } = context;
    try {
      const { data: setting } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "treasury_config")
        .maybeSingle();

      if (setting?.value) {
        return {
          ...DEFAULT_TREASURY_CONFIG,
          ...(setting.value as any),
          bank_account: resolveBankAccount((setting.value as any).bank_account),
        };
      }
    } catch (err) {
      console.error("[contributions] getAdminTreasuryConfig error", err);
    }
    return DEFAULT_TREASURY_CONFIG;
  });

/** Save / update full treasury config from Admin Console. */
export const saveTreasuryConfig = createServerFn({ method: "POST" })
  .middleware([requireTreasuryAuth])
  .validator((input: unknown) => treasuryConfigSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const payload = {
      key: "treasury_config",
      category: "treasury",
      is_public: true,
      value: data,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error } = await supabase
      .from("site_settings")
      .upsert(payload as never, { onConflict: "key" })
      .select()
      .single();

    if (error) {
      console.error("[contributions] saveTreasuryConfig failed", error);
      throw new Error(`تعذر حفظ إعدادات الخزينة: ${error.message}`);
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("audit_logs").insert({
      actor_user_id: userId,
      action: "treasury_config.update",
      entity_type: "site_settings",
      entity_id: "treasury_config",
      after_data: data,
    });

    return { ok: true as const, config: updated };
  });

/** Create manual / offline contribution recorded by Treasurer or Admin. */
export const createManualContribution = createServerFn({ method: "POST" })
  .middleware([requireTreasuryAuth])
  .validator((input: unknown) => manualContributionInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: inserted, error } = await supabase
      .from("contributions")
      .insert({
        contributor_name: data.contributor_name,
        user_id: data.user_id || null,
        email: data.email || null,
        phone: data.phone || null,
        amount: data.amount,
        currency: data.currency || "SAR",
        method: data.method,
        purpose: data.purpose || null,
        reference: data.reference || null,
        status: data.status,
        review_note:
          data.review_note ||
          (data.status === "verified" ? "تم التوثيق المباشر بواسطة أمين الصندوق" : null),
        reviewed_by: data.status === "verified" ? userId : null,
        reviewed_at: data.status === "verified" ? new Date().toISOString() : null,
        created_at: data.created_at || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("[contributions] createManualContribution failed", error);
      throw new Error(`تعذر تسجيل المساهمة: ${error.message}`);
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("audit_logs").insert({
      actor_user_id: userId,
      action: "contribution.manual_create",
      entity_type: "contributions",
      entity_id: inserted.id,
      after_data: inserted,
    });

    if (inserted.user_id && (inserted.status === "verified" || inserted.status === "rejected")) {
      try {
        const { notifyMemberOnContributionDecision } = await import("@/lib/notifications.server");
        void notifyMemberOnContributionDecision(
          inserted.user_id,
          inserted.status,
          Number(inserted.amount),
          inserted.currency || "SAR",
          inserted.review_note,
        ).catch((err) =>
          console.error("[contributions] manual contribution notification failed:", err),
        );
      } catch (err) {
        console.warn("[contributions] notification hook failed:", err);
      }
    }

    return { ok: true as const, contribution: inserted };
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
      .select("id, user_id, amount, currency");

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

    const targetUserId = updated[0]?.user_id;
    if (targetUserId && (data.status === "verified" || data.status === "rejected")) {
      try {
        const { notifyMemberOnContributionDecision } = await import("@/lib/notifications.server");
        void notifyMemberOnContributionDecision(
          targetUserId,
          data.status,
          Number(updated[0].amount),
          updated[0].currency || "SAR",
          data.review_note,
        ).catch((err) =>
          console.error("[contributions] review notification dispatch failed:", err),
        );
      } catch (err) {
        console.warn("[contributions] notification hook failed:", err);
      }
    }

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
