import { z } from "zod";

/** Client-safe validation schemas shared by forms and their server functions. */

export const localeSchema = z.enum(["ar", "en"]).default("ar");

/**
 * Anti-bot honeypot. Real visitors never fill this in.
 *
 * Deliberately NOT `.max(0)`: a zero-length cap makes validation throw before
 * the handler runs, which both surfaces a validation error to the bot and makes
 * the handlers' honeypot checks unreachable. Accepting the value and dropping
 * the submission in the handler is what lets the server answer "ok" without
 * writing anything, which is the whole point of a honeypot.
 */
const honeypotSchema = z.string().max(200).optional();

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(1).max(160).optional().or(z.literal("")),
  message: z.string().trim().min(5).max(1000),
  locale: localeSchema,
  website_url_check: honeypotSchema,
  // Cloudflare Turnstile response token (present only when the widget is
  // configured client-side). Verified server-side only if a secret key is set.
  turnstile_token: z.string().max(2048).optional(),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

export const newsletterSchema = z.object({
  email: z.string().trim().email().max(255),
  name: z.string().trim().max(100).optional().or(z.literal("")),
  locale: localeSchema,
  website_url_check: honeypotSchema,
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

export const achieverNominationSchema = z.object({
  nominee_name: z.string().trim().min(2, "الاسم مطلوب").max(120),
  branch_slug: z.string().trim().max(80).optional(),
  category: z
    .enum(["medical", "academic", "military", "business", "sports", "other"])
    .default("academic"),
  field: z.string().trim().min(2, "المجال أو التخصص مطلوب").max(100),
  achievement_summary: z
    .string()
    .trim()
    .min(10, "نبذة عن الإنجاز مطلوبة (10 أحرف على الأقل)")
    .max(1000),
  year: z.string().trim().max(20).optional(),
  /** Short biography of the nominee (optional free text). */
  biography: z.string().trim().max(1500).optional().or(z.literal("")),
  /** Why the nominee should be added to the register (optional free text). */
  nomination_reason: z.string().trim().max(1000).optional().or(z.literal("")),
  evidence_url: z.string().trim().url().optional().or(z.literal("")),
  /**
   * Certificate files (experience / recognition / training / graduation).
   * `data` is a base64 payload without the data-URI prefix. Server-side the
   * count, size and MIME type are re-checked before anything is stored.
   */
  attachments: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(200),
        type: z.enum(["application/pdf", "image/jpeg", "image/png", "image/webp"]),
        // ~10 MB binary -> ~13.4 MB base64. Cap a little above that.
        data: z.string().min(1).max(14_000_000),
      }),
    )
    .max(6)
    .optional()
    .default([]),
  nominator_name: z.string().trim().min(2, "اسم مقدم الترشيح مطلوب").max(100),
  nominator_phone: z.string().trim().min(7, "رقم التواصل مطلوب").max(30),
  nominator_email: z
    .string()
    .trim()
    .email("البريد الإلكتروني غير صحيح")
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().max(500).optional(),
  website_url_check: honeypotSchema,
});

export type AchieverNominationInput = z.infer<typeof achieverNominationSchema>;

export const businessSubmissionSchema = z.object({
  name_ar: z.string().trim().min(2, "اسم المنشأة بالعربية مطلوب").max(120),
  name_en: z.string().trim().max(120).optional().or(z.literal("")),
  category: z.string().trim().min(2, "النشاط مطلوب").max(60),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  owner_name_ar: z.string().trim().min(2, "اسم صاحب المنشأة مطلوب").max(120),
  branch_slug: z.string().trim().max(80).optional(),
  phone: z.string().trim().min(7, "رقم التواصل مطلوب").max(30),
  email: z.string().trim().email().optional().or(z.literal("")),
  website: z.string().trim().url().optional().or(z.literal("")),
  national_address: z.string().trim().max(255).optional(),
  description_ar: z.string().trim().min(10, "وصف النشاط مطلوب").max(600),
  description_en: z.string().trim().max(600).optional(),
  website_url_check: honeypotSchema,
});

export type BusinessSubmissionInput = z.infer<typeof businessSubmissionSchema>;


/**
 * Council request forms served from the Requests Hub (`/requests`).
 *
 * Three distinct request types share one schema and one handler because they
 * collect the same identity fields and land in the same official inbox
 * (`inquiries`), separated by `source`. Adding a further type later is a
 * one-line change to the enum below plus its label in the hub.
 */
export const councilRequestTypeSchema = z.enum([
  /** طلب ترشيح عضوية في احد اللجان */
  "committee_nomination",
  /** طلب اضافة خدمة – منشأت */
  "service_establishment",
  /** طلب اضافة خدمة – افراد العائلة */
  "service_family",
]);

export type CouncilRequestType = z.infer<typeof councilRequestTypeSchema>;

export const councilRequestSchema = z.object({
  type: councilRequestTypeSchema,
  full_name: z.string().trim().min(2, "الاسم الكامل مطلوب").max(120),
  phone: z.string().trim().min(7, "رقم التواصل مطلوب").max(30),
  email: z.string().trim().email("البريد الإلكتروني غير صحيح").max(255).optional().or(z.literal("")),
  branch: z.string().trim().max(120).optional().or(z.literal("")),
  /** Committee requested, or the service/establishment name for service requests. */
  topic: z.string().trim().min(2, "هذا الحقل مطلوب").max(160),
  /** Qualifications, or the service description. */
  details: z.string().trim().min(10, "التفاصيل مطلوبة (10 أحرف على الأقل)").max(1500),
  link: z.string().trim().url("الرابط غير صحيح").max(500).optional().or(z.literal("")),
  locale: localeSchema,
  website_url_check: honeypotSchema,
});

export type CouncilRequestInput = z.infer<typeof councilRequestSchema>;
