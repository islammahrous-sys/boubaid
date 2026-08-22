import { z } from "zod";

/** Client-safe schemas for member account and membership request flows. */

export const profileUpdateSchema = z.object({
  full_name_ar: z.string().trim().min(2).max(120),
  full_name_en: z.string().trim().max(120).optional().or(z.literal("")),
  branch_slug: z.string().trim().max(80).optional().or(z.literal("")),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  lineage_notes: z.string().trim().max(1000).optional().or(z.literal("")),
  avatar_path: z.string().trim().optional().or(z.literal("")),
  show_in_directory: z.boolean().default(false),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const membershipRequestSchema = z.object({
  full_name_ar: z.string().trim().min(2).max(120),
  full_name_en: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  branch_slug: z.string().trim().max(80).optional().or(z.literal("")),
  father_lineage: z.string().trim().max(300).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type MembershipRequestInput = z.infer<typeof membershipRequestSchema>;

export const reviewRequestSchema = z.object({
  id: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
  review_note: z.string().trim().max(500).optional().or(z.literal("")),
});

export const messageStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "read", "archived"]),
});
