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

export const receiptRefSchema = z.object({
  path: receiptPathSchema,
});
