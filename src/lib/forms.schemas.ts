import { z } from "zod";

/** Client-safe validation schemas shared by forms and their server functions. */

export const localeSchema = z.enum(["ar", "en"]).default("ar");

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(1).max(160).optional().or(z.literal("")),
  message: z.string().trim().min(5).max(1000),
  locale: localeSchema,
  website_url_check: z.string().max(0).optional(),
  // Cloudflare Turnstile response token (present only when the widget is
  // configured client-side). Verified server-side only if a secret key is set.
  turnstile_token: z.string().max(2048).optional(),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

export const newsletterSchema = z.object({
  email: z.string().trim().email().max(255),
  name: z.string().trim().max(100).optional().or(z.literal("")),
  locale: localeSchema,
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

export const achieverNominationSchema = z.object({
  nominee_name: z.string().trim().min(2, "الاسم مطلوب").max(120),
  branch_slug: z.string().trim().optional(),
  category: z.enum(["medical", "academic", "military", "business", "sports", "other"]).default("academic"),
  field: z.string().trim().min(2, "المجال أو التخصص مطلوب").max(100),
  achievement_summary: z.string().trim().min(10, "نبذة عن الإنجاز مطلوبة (10 أحرف على الأقل)").max(1000),
  year: z.string().trim().max(20).optional(),
  evidence_url: z.string().trim().url().optional().or(z.literal("")),
  nominator_name: z.string().trim().min(2, "اسم مقدم الترشيح مطلوب").max(100),
  nominator_phone: z.string().trim().min(7, "رقم التواصل مطلوب").max(30),
  nominator_email: z.string().trim().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional(),
  website_url_check: z.string().max(0).optional(),
});

export type AchieverNominationInput = z.infer<typeof achieverNominationSchema>;

export const businessSubmissionSchema = z.object({
  name_ar: z.string().trim().min(2, "اسم المنشأة بالعربية مطلوب").max(120),
  name_en: z.string().trim().max(120).optional().or(z.literal("")),
  category: z.string().trim().min(2, "النشاط مطلوب").max(60),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  owner_name_ar: z.string().trim().min(2, "اسم صاحب المنشأة مطلوب").max(120),
  branch_slug: z.string().trim().optional(),
  phone: z.string().trim().min(7, "رقم التواصل مطلوب").max(30),
  email: z.string().trim().email().optional().or(z.literal("")),
  website: z.string().trim().url().optional().or(z.literal("")),
  national_address: z.string().trim().max(255).optional(),
  description_ar: z.string().trim().min(10, "وصف النشاط مطلوب").max(600),
  description_en: z.string().trim().max(600).optional(),
  website_url_check: z.string().max(0).optional(),
});

export type BusinessSubmissionInput = z.infer<typeof businessSubmissionSchema>;
