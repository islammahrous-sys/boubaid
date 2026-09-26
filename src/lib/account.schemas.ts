import { z } from "zod";

/** Client-safe schemas for member account and membership request flows. */

/** Branch ids come from `branches` in `@/content/site` and are ASCII slugs
 *  (e.g. "al-saad"). The UI only ever offers those via a <Select>, but the
 *  server function is a public POST endpoint -- so the shape is enforced
 *  here rather than trusted from the client. */
const branchSlugField = z
  .string()
  .trim()
  .max(80)
  .regex(/^[A-Za-z0-9_-]*$/, "invalid_branch")
  .optional()
  .or(z.literal(""));

/** Permissive on purpose (international dialling, spaces, dashes, parens)
 *  but bounded, so the column can't be used as free-text storage. */
const phoneField = z
  .string()
  .trim()
  .max(32)
  .regex(/^[0-9+()\-\s.]*$/, "invalid_phone")
  .optional()
  .or(z.literal(""));

/** `avatar_path` holds either a Supabase public URL, a `data:` image, or a
 *  bucket-relative path (see AdminConsoleLayout, which resolves all three).
 *  It is rendered straight into an <img src>, so anything with an unexpected
 *  URL scheme (`javascript:`, `vbscript:`, ...) is rejected here rather than
 *  stored and replayed to every viewer of the member directory. It is also
 *  length-bounded -- the column is otherwise unbounded text on a row any
 *  authenticated caller can write to. */
const avatarPathField = z
  .string()
  .trim()
  .max(500)
  .refine((value) => {
    if (value === "") return true;
    const scheme = /^([A-Za-z][A-Za-z0-9+.-]*):/.exec(value);
    if (!scheme) return !value.startsWith("//"); // relative path / bucket key
    const proto = scheme[1]!.toLowerCase();
    if (proto === "http" || proto === "https") return true;
    return proto === "data" && /^data:image\//i.test(value);
  }, "invalid_avatar_path")
  .optional()
  .or(z.literal(""));

export const EDUCATION_LEVELS = [
  { value: "phd", ar: "دكتوراه", en: "PhD" },
  { value: "masters", ar: "ماجستير", en: "Master's" },
  { value: "university", ar: "جامعي", en: "University" },
  { value: "intermediate", ar: "متوسط", en: "Intermediate" },
  { value: "high_school", ar: "ثانوية عامة", en: "High School" },
  { value: "below_high_school", ar: "أقل من ثانوية عامة", en: "Below High School" },
] as const;

export const PROFILE_CITIES = [
  { value: "al_khobar", ar: "الخبر", en: "Al Khobar" },
  { value: "dammam", ar: "الدمام", en: "Dammam" },
  { value: "al_ahsa", ar: "الأحساء", en: "Al Ahsa" },
  { value: "al_jubail", ar: "الجبيل", en: "Al Jubail" },
] as const;

const optionalEnum = (values: readonly { value: string }[]) =>
  z.enum(values.map((v) => v.value) as [string, ...string[]]).optional().or(z.literal(""));

export const profileUpdateSchema = z.object({
  full_name_ar: z.string().trim().min(2).max(120),
  full_name_en: z.string().trim().max(120).optional().or(z.literal("")),
  branch_slug: branchSlugField,
  phone: phoneField,
  education_level: optionalEnum(EDUCATION_LEVELS),
  city: optionalEnum(PROFILE_CITIES),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  avatar_path: avatarPathField,
  show_in_directory: z.boolean().default(false),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const membershipRequestSchema = z.object({
  full_name_ar: z.string().trim().min(2).max(120),
  full_name_en: z.string().trim().max(120).optional().or(z.literal("")),
  phone: phoneField,
  branch_slug: branchSlugField,
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
