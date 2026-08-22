import { z } from "zod";

/** Client-safe schemas for the contributions (fund giving) flow. */

export const contributionInputSchema = z.object({
  contributor_name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  amount: z.number().positive().max(10_000_000),
  currency: z.enum(["SAR"]).default("SAR"),
  method: z.enum(["bank_transfer", "in_person", "other"]).default("bank_transfer"),
  purpose: z.string().trim().max(200).optional().or(z.literal("")),
  reference: z.string().trim().max(120).optional().or(z.literal("")),
  receipt_path: z.string().trim().max(400).optional().or(z.literal("")),
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
  path: z.string().trim().min(3).max(400),
});
