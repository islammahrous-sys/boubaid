import { z } from "zod";

/** Client-safe schemas for the contributions (fund giving) flow. */

/**
 * A key inside the private `receipts` bucket: `<uuid>/<filename>`.
 *
 * Shape is pinned here so a caller can't hand the server a traversal-ish or
 * absolute path. Ownership is a separate check — `submitContribution` requires
 * the prefix to be the caller's own user id, while `getReceiptUrl` leaves
 * ownership to storage RLS because the treasury legitimately reads other
 * members' receipts.
 */
export const receiptPathSchema = z
  .string()
  .trim()
  .min(3)
  .max(400)
  .regex(/^[0-9a-fA-F-]{36}\/[A-Za-z0-9._-]{1,200}$/, "مسار الإيصال غير صالح")
  .refine((value) => !value.includes(".."), "مسار الإيصال غير صالح");

export const contributionInputSchema = z.object({
  contributor_name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  amount: z.number().min(1).max(10_000_000),
  currency: z.enum(["SAR"]).default("SAR"),
  method: z.enum(["bank_transfer", "in_person", "other"]).default("bank_transfer"),
  purpose: z.string().trim().max(200).optional().or(z.literal("")),
  reference: z.string().trim().max(120).optional().or(z.literal("")),
  receipt_path: receiptPathSchema.optional().or(z.literal("")),
  // Cloudflare Turnstile response token (present only when the widget is
  // configured client-side). Verified server-side only if a secret key is set.
  turnstile_token: z.string().max(2048).optional(),
});
export type ContributionInput = z.infer<typeof contributionInputSchema>;

export const contributionReviewSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["verified", "rejected", "pending"]),
  review_note: z.string().trim().max(500).optional().or(z.literal("")),
});
export type ContributionReviewInput = z.infer<typeof contributionReviewSchema>;

export const receiptRefSchema = z.object({
  path: receiptPathSchema,
});

/* =========================================================================
 * Dynamic Treasury & Bank Configuration Schemas
 * ========================================================================= */

export const bankAccountConfigSchema = z.object({
  bank_name_ar: z.string().trim().min(2).max(120),
  bank_name_en: z.string().trim().min(2).max(120),
  beneficiary_name_ar: z.string().trim().min(2).max(160),
  beneficiary_name_en: z.string().trim().min(2).max(160),
  account_number: z.string().trim().max(60).default(""),
  iban: z.string().trim().max(40).default(""),
  notes_ar: z.string().trim().max(500).optional().or(z.literal("")),
  notes_en: z.string().trim().max(500).optional().or(z.literal("")),
});
export type BankAccountConfig = z.infer<typeof bankAccountConfigSchema>;

export const contributionTierSchema = z.object({
  id: z.string().trim().min(1).max(60),
  category_ar: z.string().trim().min(2).max(120),
  category_en: z.string().trim().min(2).max(120),
  amount_ar: z.string().trim().min(1).max(60),
  amount_en: z.string().trim().min(1).max(60),
  numeric_amount: z.number().min(0).max(10_000_000),
  frequency: z.enum(["monthly", "one_off", "annual", "custom"]).default("monthly"),
  purpose_ar: z.string().trim().min(2).max(200),
  purpose_en: z.string().trim().min(2).max(200),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});
export type ContributionTier = z.infer<typeof contributionTierSchema>;

export const fundPurposeSchema = z.object({
  id: z.string().trim().min(1).max(60),
  name_ar: z.string().trim().min(2).max(120),
  name_en: z.string().trim().min(2).max(120),
  description_ar: z.string().trim().max(300).optional().or(z.literal("")),
  description_en: z.string().trim().max(300).optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});
export type FundPurpose = z.infer<typeof fundPurposeSchema>;

export const treasuryConfigSchema = z.object({
  bank_account: bankAccountConfigSchema,
  tiers: z.array(contributionTierSchema),
  fund_purposes: z.array(fundPurposeSchema),
  quick_amounts: z.array(z.number().positive()).default([100, 250, 500, 1000, 2500]),
  salla_store_url: z.string().trim().url().max(300),
  /**
   * Optional annual fundraising target in SAR. 0 / unset hides the progress
   * bar on the admin dashboard (a real snapshot of verified + pending is
   * shown instead of a made-up goal).
   */
  annual_target: z.number().min(0).max(1_000_000_000).default(0),
  application_of_funds: z.object({
    p1_ar: z.string().trim().max(1000),
    p1_en: z.string().trim().max(1000),
    p2_ar: z.string().trim().max(1000),
    p2_en: z.string().trim().max(1000),
  }),
});
export type TreasuryConfig = z.infer<typeof treasuryConfigSchema>;

export const manualContributionInputSchema = z.object({
  contributor_name: z.string().trim().min(2).max(160),
  user_id: z.string().uuid().optional().nullable(),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  amount: z.number().min(1).max(10_000_000),
  currency: z.enum(["SAR"]).default("SAR"),
  method: z.enum(["bank_transfer", "in_person", "cash", "pos", "other"]).default("bank_transfer"),
  purpose: z.string().trim().max(200).optional().or(z.literal("")),
  reference: z.string().trim().max(120).optional().or(z.literal("")),
  status: z.enum(["verified", "pending", "rejected"]).default("verified"),
  review_note: z.string().trim().max(500).optional().or(z.literal("")),
  created_at: z.string().optional(),
});
export type ManualContributionInput = z.infer<typeof manualContributionInputSchema>;
