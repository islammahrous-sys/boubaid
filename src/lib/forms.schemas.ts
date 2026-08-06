import { z } from "zod";

/** Client-safe validation schemas shared by forms and their server functions. */

export const localeSchema = z.enum(["ar", "en"]).default("ar");

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(1).max(160).optional().or(z.literal("")),
  message: z.string().trim().min(5).max(1000),
  locale: localeSchema,
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

export const newsletterSchema = z.object({
  email: z.string().trim().email().max(255),
  name: z.string().trim().max(100).optional().or(z.literal("")),
  locale: localeSchema,
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
