import { z } from "zod";

/** Client-safe schemas for the secretariat content console. */

export const cmsTableSchema = z.enum([
  "news_posts",
  "initiatives",
  "achievers",
  "library_items",
  "branches",
]);
export type CmsTable = z.infer<typeof cmsTableSchema>;

const text = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));
const slug = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9-]+$/, "lowercase letters, numbers and dashes only");

export const newsInputSchema = z.object({
  id: z.string().uuid().optional(),
  slug,
  section: z.enum(["fund", "family"]).default("fund"),
  title_ar: z.string().trim().min(3).max(300),
  title_en: text(300),
  excerpt_ar: text(600),
  excerpt_en: text(600),
  body_ar: text(20000),
  body_en: text(20000),
  hijri_date: text(40),
  gregorian_date: text(60),
  cover_path: text(500),
  is_published: z.boolean().default(false),
  sort_order: z.number().int().min(0).max(9999).default(0),
});

export const initiativeInputSchema = z.object({
  id: z.string().uuid().optional(),
  slug,
  status: z.enum(["ongoing", "planned", "completed"]).default("ongoing"),
  title_ar: z.string().trim().min(3).max(300),
  title_en: text(300),
  summary_ar: text(600),
  summary_en: text(600),
  body_ar: text(20000),
  body_en: text(20000),
  cover_path: text(500),
  is_published: z.boolean().default(false),
  sort_order: z.number().int().min(0).max(9999).default(0),
});

export const achieverInputSchema = z.object({
  id: z.string().uuid().optional(),
  name_ar: z.string().trim().min(2).max(200),
  name_en: text(200),
  field_ar: text(200),
  field_en: text(200),
  achievement_ar: text(3000),
  achievement_en: text(3000),
  category: z
    .enum(["academic", "military", "business", "civic", "medical", "other"])
    .default("academic"),
  branch_ar: text(120),
  branch_en: text(120),
  image_path: text(500),
  is_published: z.boolean().default(false),
  sort_order: z.number().int().min(0).max(9999).default(0),
});

export const libraryInputSchema = z.object({
  id: z.string().uuid().optional(),
  collection: z.enum(["documents", "publications", "media"]).default("documents"),
  title_ar: z.string().trim().min(3).max(300),
  title_en: text(300),
  description_ar: text(2000),
  description_en: text(2000),
  year: z.number().int().min(1000).max(1600).optional().nullable(),
  kind: text(40),
  reference: text(120),
  file_path: text(500),
  external_url: z.string().trim().url().max(500).optional().or(z.literal("")),
  is_published: z.boolean().default(false),
  sort_order: z.number().int().min(0).max(9999).default(0),
});

export const branchInputSchema = z.object({
  id: z.string().uuid().optional(),
  slug,
  name_ar: z.string().trim().min(2).max(200),
  name_en: text(200),
  description_ar: text(3000),
  description_en: text(3000),
  elder_ar: text(200),
  elder_en: text(200),
  image_path: text(500),
  is_published: z.boolean().default(false),
  sort_order: z.number().int().min(0).max(9999).default(0),
});

export const cmsUpsertSchema = z.discriminatedUnion("table", [
  z.object({ table: z.literal("news_posts"), values: newsInputSchema }),
  z.object({ table: z.literal("initiatives"), values: initiativeInputSchema }),
  z.object({ table: z.literal("achievers"), values: achieverInputSchema }),
  z.object({ table: z.literal("library_items"), values: libraryInputSchema }),
  z.object({ table: z.literal("branches"), values: branchInputSchema }),
]);
export type CmsUpsertInput = z.infer<typeof cmsUpsertSchema>;

export const cmsRowRefSchema = z.object({
  table: cmsTableSchema,
  id: z.string().uuid(),
});

export const cmsPublishSchema = cmsRowRefSchema.extend({
  is_published: z.boolean(),
});

/** ~6 MB decoded ceiling; media for the site is compressed before upload. */
const MAX_BASE64_LENGTH = 8_400_000;

export const contentMediaUploadSchema = z.object({
  folder: cmsTableSchema,
  fileName: z.string().trim().min(1).max(200),
  contentType: z
    .string()
    .trim()
    .regex(/^(image\/(jpeg|png|webp|gif|svg\+xml)|application\/pdf)$/, "unsupported_type"),
  dataBase64: z.string().min(16).max(MAX_BASE64_LENGTH),
});
export type ContentMediaUpload = z.infer<typeof contentMediaUploadSchema>;


export type NewsInput = z.infer<typeof newsInputSchema>;
export type InitiativeInput = z.infer<typeof initiativeInputSchema>;
export type AchieverInput = z.infer<typeof achieverInputSchema>;
export type LibraryInput = z.infer<typeof libraryInputSchema>;
export type BranchInput = z.infer<typeof branchInputSchema>;
