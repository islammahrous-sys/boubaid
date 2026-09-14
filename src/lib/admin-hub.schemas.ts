import { z } from "zod";
import { autoSlug, slugify } from "@/lib/slugify";

/**
 * The console is Arabic-first: editors never type a Latin slug. Slug inputs
 * accept anything (or nothing) and each schema derives a clean, URL-safe slug
 * from the Arabic title/name via `withAutoSlug` below. Uniqueness is resolved
 * server-side in admin-hub.functions.ts before the row is written.
 */
const autoSlugField = z.string().trim().max(200).optional().nullable();

function withAutoSlug<T extends { slug?: string | null }>(
  values: T,
  titles: Array<string | null | undefined>,
  fallbackPrefix: string,
  options: { allowSlashes?: boolean } = {},
): T & { slug: string } {
  const typed = values.slug?.trim() ? slugify(values.slug, options) : "";
  return {
    ...values,
    slug: typed.length >= 2 ? typed : autoSlug(titles, fallbackPrefix, options),
  };
}

export const genderSchema = z.enum(["male", "female"]);
export const visibilityLevelSchema = z.enum(["public", "family_only", "admin_only", "private"]);
export const recordStatusSchema = z.enum([
  "draft",
  "in_review",
  "scheduled",
  "published",
  "archived",
]);
export const relationshipTypeSchema = z.enum(["parent", "child", "spouse"]);
export const userStatusSchema = z.enum(["ACTIVE", "INVITED", "SUSPENDED", "DISABLED"]);

// 1. Family Member Schema
export const familyMemberInputSchema = z.object({
  id: z.string().uuid().optional(),
  first_name_ar: z.string().trim().min(2, "الاسم الأول بالعربية مطلوب"),
  middle_name_ar: z.string().trim().optional().nullable(),
  last_name_ar: z.string().trim().min(2, "اسم العائلة بالعربية مطلوب"),
  display_name_ar: z.string().trim().optional().nullable(),
  first_name_en: z.string().trim().optional().nullable(),
  middle_name_en: z.string().trim().optional().nullable(),
  last_name_en: z.string().trim().optional().nullable(),
  display_name_en: z.string().trim().optional().nullable(),
  slug: autoSlugField,
  gender: genderSchema.default("male"),
  date_of_birth: z.string().optional().nullable(),
  date_of_death: z.string().optional().nullable(),
  is_living: z.boolean().default(true),
  biography_ar: z.string().optional().nullable(),
  biography_en: z.string().optional().nullable(),
  occupation_ar: z.string().optional().nullable(),
  occupation_en: z.string().optional().nullable(),
  education_ar: z.string().optional().nullable(),
  education_en: z.string().optional().nullable(),
  birth_place_id: z.string().uuid().optional().nullable(),
  current_place_id: z.string().uuid().optional().nullable(),
  branch_id: z.string().uuid().optional().nullable(),
  avatar_path: z.string().optional().nullable(),
  cover_path: z.string().optional().nullable(),
  generation: z.number().int().min(1).default(1),
  sort_order: z.number().int().default(0),
  visibility: visibilityLevelSchema.default("public"),
  status: recordStatusSchema.default("published"),
}).transform((v) => withAutoSlug(v, [[v.first_name_ar, v.middle_name_ar, v.last_name_ar].filter(Boolean).join(" "), v.display_name_ar, [v.first_name_en, v.last_name_en].filter(Boolean).join(" ")], "member"));
export type FamilyMemberInput = z.infer<typeof familyMemberInputSchema>;

// 2. Family Branch Schema
export const familyBranchInputSchema = z.object({
  id: z.string().uuid().optional(),
  slug: autoSlugField,
  name_ar: z.string().trim().min(2, "اسم الفرع بالعربية مطلوب"),
  name_en: z.string().trim().optional().nullable(),
  description_ar: z.string().optional().nullable(),
  description_en: z.string().optional().nullable(),
  elder_ar: z.string().optional().nullable(),
  elder_en: z.string().optional().nullable(),
  image_path: z.string().optional().nullable(),
  sort_order: z.number().int().default(0),
  is_published: z.boolean().default(true),
}).transform((v) => withAutoSlug(v, [v.name_ar, v.name_en], "branch"));
export type FamilyBranchInput = z.infer<typeof familyBranchInputSchema>;

// 3. Family Relationship Schema
export const familyRelationshipInputSchema = z.object({
  id: z.string().uuid().optional(),
  person_id: z.string().uuid("المعرف غير صالح"),
  related_person_id: z.string().uuid("المعرف غير صالح"),
  relationship_type: relationshipTypeSchema,
  metadata: z.record(z.unknown()).optional().nullable(),
});
export type FamilyRelationshipInput = z.infer<typeof familyRelationshipInputSchema>;

// 4. Place Schema
export const placeInputSchema = z.object({
  id: z.string().uuid().optional(),
  name_ar: z.string().trim().min(2, "اسم المكان بالعربية مطلوب"),
  name_en: z.string().trim().optional().nullable(),
  country: z.string().default("SA"),
  region: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  description_ar: z.string().optional().nullable(),
  description_en: z.string().optional().nullable(),
  media_path: z.string().optional().nullable(),
});
export type PlaceInput = z.infer<typeof placeInputSchema>;

// 5. Family History Entry Schema
export const familyHistoryInputSchema = z.object({
  id: z.string().uuid().optional(),
  title_ar: z.string().trim().min(2, "العنوان بالعربية مطلوب"),
  title_en: z.string().trim().optional().nullable(),
  description_ar: z.string().optional().nullable(),
  description_en: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  date_end: z.string().optional().nullable(),
  place_id: z.string().uuid().optional().nullable(),
  media_path: z.string().optional().nullable(),
  sort_order: z.number().int().default(0),
  visibility: visibilityLevelSchema.default("public"),
});
export type FamilyHistoryInput = z.infer<typeof familyHistoryInputSchema>;

// 6. Content Section (Block) Schema
export const contentSectionInputSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.string().min(1),
  sort_order: z.number().int().default(0),
  data: z.record(z.unknown()).default({}),
  settings: z.record(z.unknown()).default({}),
  visibility: visibilityLevelSchema.default("public"),
});
export type ContentSectionInput = z.infer<typeof contentSectionInputSchema>;

// 7. Content Page Schema
export const contentPageInputSchema = z.object({
  id: z.string().uuid().optional(),
  slug: autoSlugField,
  slug_ar: z.string().trim().optional().nullable(),
  title_ar: z.string().trim().min(2, "عنوان الصفحة بالعربية مطلوب"),
  title_en: z.string().trim().optional().nullable(),
  excerpt_ar: z.string().optional().nullable(),
  excerpt_en: z.string().optional().nullable(),
  featured_media_path: z.string().optional().nullable(),
  status: recordStatusSchema.default("draft"),
  visibility: visibilityLevelSchema.default("public"),
  template: z.string().default("default"),
  seo_title_ar: z.string().optional().nullable(),
  seo_title_en: z.string().optional().nullable(),
  seo_description_ar: z.string().optional().nullable(),
  seo_description_en: z.string().optional().nullable(),
  canonical_url: z.string().optional().nullable(),
  no_index: z.boolean().default(false),
  sections: z.array(contentSectionInputSchema).optional(),
}).transform((v) => withAutoSlug(v, [v.title_ar, v.title_en], "page", { allowSlashes: true }));
export type ContentPageInput = z.infer<typeof contentPageInputSchema>;

// 8. Navigation Menu & Items Schema
export const navigationItemInputSchema = z.object({
  id: z.string().uuid().optional(),
  menu_id: z.string().uuid(),
  label_ar: z.string().trim().min(1, "العنوان بالعربية مطلوب"),
  label_en: z.string().trim().optional().nullable(),
  url: z.string().trim().min(1, "الرابط مطلوب"),
  type: z.enum(["page", "article", "event", "family", "external", "custom"]).default("custom"),
  parent_id: z.string().uuid().optional().nullable(),
  sort_order: z.number().int().default(0),
  target: z.string().default("_self"),
  icon: z.string().optional().nullable(),
  visibility: visibilityLevelSchema.default("public"),
});
export type NavigationItemInput = z.infer<typeof navigationItemInputSchema>;

// 9. Articles Schema
export const articleInputSchema = z.object({
  id: z.string().uuid().optional(),
  slug: autoSlugField,
  slug_ar: z.string().trim().optional().nullable(),
  title_ar: z.string().trim().min(2, "عنوان المقال مطلوب"),
  title_en: z.string().trim().optional().nullable(),
  excerpt_ar: z.string().optional().nullable(),
  excerpt_en: z.string().optional().nullable(),
  content_ar: z.string().optional().nullable(),
  content_en: z.string().optional().nullable(),
  featured_media_path: z.string().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  status: recordStatusSchema.default("draft"),
  published_at: z.string().optional().nullable(),
  is_featured: z.boolean().default(false),
  seo_title_ar: z.string().optional().nullable(),
  seo_title_en: z.string().optional().nullable(),
  seo_description_ar: z.string().optional().nullable(),
  seo_description_en: z.string().optional().nullable(),
  tag_ids: z.array(z.string().uuid()).optional(),
}).transform((v) => withAutoSlug(v, [v.title_ar, v.title_en], "article"));
export type ArticleInput = z.infer<typeof articleInputSchema>;

// 10. Events Schema
export const eventInputSchema = z.object({
  id: z.string().uuid().optional(),
  slug: autoSlugField,
  title_ar: z.string().trim().min(2, "عنوان الفعالية مطلوب"),
  title_en: z.string().trim().optional().nullable(),
  description_ar: z.string().optional().nullable(),
  description_en: z.string().optional().nullable(),
  start_at: z.string().min(1, "تاريخ ووقت البدء مطلوب"),
  end_at: z.string().optional().nullable(),
  timezone: z.string().default("Asia/Riyadh"),
  place_id: z.string().uuid().optional().nullable(),
  cover_path: z.string().optional().nullable(),
  registration_enabled: z.boolean().default(false),
  registration_deadline: z.string().optional().nullable(),
  max_attendees: z.number().int().optional().nullable(),
  status: z.enum(["draft", "published", "cancelled", "completed"]).default("published"),
}).transform((v) => withAutoSlug(v, [v.title_ar, v.title_en], "event"));
export type EventInput = z.infer<typeof eventInputSchema>;

// 11. Announcements Schema
export const announcementInputSchema = z.object({
  id: z.string().uuid().optional(),
  title_ar: z.string().trim().min(2, "عنوان الإعلان مطلوب"),
  title_en: z.string().trim().optional().nullable(),
  message_ar: z.string().trim().min(2, "نص الإعلان مطلوب"),
  message_en: z.string().trim().optional().nullable(),
  type: z.enum(["info", "success", "warning", "important"]).default("info"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  start_at: z.string().optional().nullable(),
  end_at: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).default("published"),
});
export type AnnouncementInput = z.infer<typeof announcementInputSchema>;

// 12. Media Asset Schema
export const mediaAssetInputSchema = z.object({
  id: z.string().uuid().optional(),
  bucket: z.string().default("media"),
  storage_path: z.string().min(1),
  file_name: z.string().min(1),
  original_file_name: z.string().optional().nullable(),
  mime_type: z.string().min(1),
  file_size: z
    .number()
    .int()
    .min(0)
    // Matches the 25MB ceiling ImageUploadInput.tsx already enforces
    // client-side elsewhere in the app (e.g. LibraryItemsManager)  --
    // museum archive scans routinely exceed the old 10MB cap.
    .max(25 * 1024 * 1024, "الحد الأقصى 25 ميغابايت"),
  width: z.number().int().optional().nullable(),
  height: z.number().int().optional().nullable(),
  alt_text_ar: z.string().optional().nullable(),
  alt_text_en: z.string().optional().nullable(),
  caption_ar: z.string().optional().nullable(),
  caption_en: z.string().optional().nullable(),
  copyright: z.string().optional().nullable(),
});
export type MediaAssetInput = z.infer<typeof mediaAssetInputSchema>;

// 13. Gallery Schema
export const galleryInputSchema = z.object({
  id: z.string().uuid().optional(),
  slug: autoSlugField,
  title_ar: z.string().trim().min(2, "عنوان المعرض مطلوب"),
  title_en: z.string().trim().optional().nullable(),
  description_ar: z.string().optional().nullable(),
  description_en: z.string().optional().nullable(),
  cover_media_path: z.string().optional().nullable(),
  status: z.string().default("published"),
  visibility: visibilityLevelSchema.default("public"),
  sort_order: z.number().int().default(0),
  /** "museum" = Museum Collection (protected legacy set), "archive" = Archive folder tree. */
  section: z.enum(["museum", "archive"]).default("museum"),
  /** Parent Archive folder, for sub-folders. Null for a top-level folder. */
  parent_id: z.string().uuid().optional().nullable(),
}).transform((v) => withAutoSlug(v, [v.title_ar, v.title_en], "gallery"));
export type GalleryInput = z.infer<typeof galleryInputSchema>;

// 14. Document Schema
export const documentInputSchema = z.object({
  id: z.string().uuid().optional(),
  title_ar: z.string().trim().min(2, "عنوان الوثيقة مطلوب"),
  title_en: z.string().trim().optional().nullable(),
  description_ar: z.string().optional().nullable(),
  description_en: z.string().optional().nullable(),
  file_path: z.string().min(1, "مسار الملف مطلوب"),
  category: z.string().default("governance"),
  /** Optional link to a row in `services`, used by the services catalogue. */
  service_id: z.string().uuid().optional().nullable(),
  visibility: visibilityLevelSchema.default("public"),
  status: z.string().default("published"),
});
export type DocumentInput = z.infer<typeof documentInputSchema>;

// 14b. Service Schema (خدمات أفراد الأسرة / خدمات المنشآت)
export const serviceInputSchema = z
  .object({
    id: z.string().uuid().optional(),
    slug: z.string().trim().optional(),
    category: z.enum(["family", "establishment"]),
    title_ar: z.string().trim().min(2, "اسم الخدمة بالعربية مطلوب"),
    title_en: z.string().trim().optional().nullable(),
    description_ar: z.string().optional().nullable(),
    description_en: z.string().optional().nullable(),
    sort_order: z.number().int().default(0),
    is_published: z.boolean().default(true),
  })
  .transform((v) => withAutoSlug(v, [v.title_ar, v.title_en], "service"));
export type ServiceInput = z.infer<typeof serviceInputSchema>;

// 15. Inquiries & Notes Schema
export const inquiryStatusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "open", "in_progress", "resolved", "spam"]),
  assigned_to: z.string().uuid().optional().nullable(),
});
export const inquiryNoteInputSchema = z.object({
  inquiry_id: z.string().uuid(),
  note: z.string().trim().min(1, "الملاحظة لا يمكن أن تكون فارغة"),
});
export const contactMessageStatusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "read", "archived"]),
});

// 16. Site Settings Schema
export const siteSettingInputSchema = z.object({
  key: z.string().min(1),
  category: z.string().min(1).default("general"),
  value: z.record(z.unknown()),
  is_public: z.boolean().default(true),
});
export type SiteSettingInput = z.infer<typeof siteSettingInputSchema>;

// 17. Business Directory Schema
export const businessInputSchema = z.object({
  id: z.string().uuid().optional(),
  slug: autoSlugField,
  name_ar: z.string().trim().min(2, "اسم المنشأة بالعربية مطلوب"),
  name_en: z.string().trim().optional().nullable(),
  category_ar: z.string().trim().min(2, "القطاع بالعربية مطلوب"),
  category_en: z.string().trim().min(2, "Category in English is required"),
  city_ar: z.string().trim().min(2, "المدينة مطلوبة"),
  city_en: z.string().trim().optional().nullable(),
  description_ar: z.string().optional().nullable(),
  description_en: z.string().optional().nullable(),
  owner_branch_ar: z.string().optional().nullable(),
  owner_branch_en: z.string().optional().nullable(),
  contact: z.string().trim().min(3, "رقم التواصل مطلوب"),
  website: z.string().optional().nullable(),
  logo_path: z.string().optional().nullable(),
  is_published: z.boolean().default(true),
  sort_order: z.number().int().default(0),
}).transform((v) => withAutoSlug(v, [v.name_ar, v.name_en], "business"));
export type BusinessInput = z.infer<typeof businessInputSchema>;

// 18. Membership Request Review Schema
// A review decision is only ever "approved" or "rejected" — "pending" is the
// initial state, and the `review_membership_request_as_admin` RPC rejects it
// with a raw `Invalid membership review status` exception, so it is refused
// here as a validation error instead.
export const membershipRequestReviewSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
  review_note: z.string().trim().max(2000).optional().nullable(),
});
export type MembershipRequestReviewInput = z.infer<typeof membershipRequestReviewSchema>;

// 19. Treasury Contribution Review Schema
/** Mirrors the live `contribution_status` Postgres enum. */
export const contributionStatusSchema = z.enum(["pending", "verified", "rejected"]);

export const treasuryContributionReviewSchema = z.object({
  id: z.string().uuid(),
  status: contributionStatusSchema,
  review_note: z.string().optional().nullable(),
});
export type TreasuryContributionReviewInput = z.infer<typeof treasuryContributionReviewSchema>;

// 20. Initiative Schema
export const initiativeInputSchema = z.object({
  id: z.string().uuid().optional(),
  slug: autoSlugField,
  title_ar: z.string().trim().min(2, "عنوان المبادرة مطلوب"),
  title_en: z.string().trim().optional().nullable(),
  summary_ar: z.string().optional().nullable(),
  summary_en: z.string().optional().nullable(),
  body_ar: z.string().optional().nullable(),
  body_en: z.string().optional().nullable(),
  status: z.enum(["ongoing", "planned", "completed"]).default("ongoing"),
  /** Section this record belongs to: المشاريع (project) or البرامج (program). */
  kind: z.enum(["project", "program", "competition"]).default("project"),
  cover_path: z.string().optional().nullable(),
  sort_order: z.number().int().default(0),
  is_published: z.boolean().default(true),
}).transform((v) => withAutoSlug(v, [v.title_ar, v.title_en], "initiative"));
export type InitiativeInput = z.infer<typeof initiativeInputSchema>;

// 21. Achiever (Roll of Honour) Schema
export const achieverInputSchema = z.object({
  id: z.string().uuid().optional(),
  name_ar: z.string().trim().min(2, "الاسم بالعربية مطلوب"),
  name_en: z.string().trim().optional().nullable(),
  field_ar: z.string().optional().nullable(),
  field_en: z.string().optional().nullable(),
  achievement_ar: z.string().optional().nullable(),
  achievement_en: z.string().optional().nullable(),
  section: z.enum(["family_competency", "excellence_award"]).default("excellence_award"),
  award_year: z.string().trim().max(10).optional().nullable(),
  category: z.string().min(1).default("academic"),
  branch_ar: z.string().optional().nullable(),
  branch_en: z.string().optional().nullable(),
  image_path: z.string().optional().nullable(),
  sort_order: z.number().int().default(0),
  is_published: z.boolean().default(true),
});
export type AchieverInput = z.infer<typeof achieverInputSchema>;

// 22. Library Item Schema
export const libraryItemInputSchema = z.object({
  id: z.string().uuid().optional(),
  collection: z
    .enum(["documents", "photographs", "recordings", "templates", "videos"])
    .default("documents"),
  title_ar: z.string().trim().min(2, "العنوان بالعربية مطلوب"),
  title_en: z.string().trim().optional().nullable(),
  description_ar: z.string().optional().nullable(),
  description_en: z.string().optional().nullable(),
  year: z.number().int().optional().nullable(),
  kind: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
  file_path: z.string().optional().nullable(),
  external_url: z.string().optional().nullable(),
  sort_order: z.number().int().default(0),
  is_published: z.boolean().default(true),
});
export type LibraryItemInput = z.infer<typeof libraryItemInputSchema>;

// 23. Navigation Menu Schema
export const navigationMenuInputSchema = z.object({
  id: z.string().uuid().optional(),
  name_ar: z.string().trim().min(2, "اسم القائمة بالعربية مطلوب"),
  name_en: z.string().trim().optional().nullable(),
  code: z.string().trim().min(2),
});
export type NavigationMenuInput = z.infer<typeof navigationMenuInputSchema>;

// 24. Event Registration Update Schema
export const eventRegistrationUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["registered", "attended", "cancelled", "waitlist"]),
});
export type EventRegistrationUpdateInput = z.infer<typeof eventRegistrationUpdateSchema>;

// 25. Initiative Registration Update Schema
export const initiativeRegistrationUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "contacted", "confirmed", "declined"]),
});
export type InitiativeRegistrationUpdateInput = z.infer<typeof initiativeRegistrationUpdateSchema>;

// 25. Bulk Actions Schemas
export const bulkMembersActionSchema = z
  .object({
    ids: z.array(z.string().uuid()).min(1, "اختر عنصراً واحداً على الأقل").max(500),
    action: z.enum([
      "delete",
      "change_branch",
      "set_living",
      "set_deceased",
      "publish",
      "draft",
      "change_visibility",
    ]),
    branch_id: z.string().uuid().optional().nullable(),
    visibility: visibilityLevelSchema.optional(),
  })
  // Both of these actions used to silently no-op (and still report success)
  // when their required field was missing — require it up front instead.
  .refine((v) => v.action !== "change_branch" || !!v.branch_id, {
    message: "اختر الفرع المستهدف",
    path: ["branch_id"],
  })
  .refine((v) => v.action !== "change_visibility" || !!v.visibility, {
    message: "اختر مستوى الظهور",
    path: ["visibility"],
  });
export type BulkMembersActionInput = z.infer<typeof bulkMembersActionSchema>;

export const bulkArticlesActionSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "اختر عنصراً واحداً على الأقل").max(500),
  action: z.enum(["published", "draft", "archived", "delete"]),
});
export type BulkArticlesActionInput = z.infer<typeof bulkArticlesActionSchema>;

// 26. Broadcast Notification Schema
export const broadcastNotificationSchema = z.object({
  title_ar: z.string().trim().min(2, "عنوان الإشعار مطلوب"),
  title_en: z.string().trim().optional().nullable(),
  body_ar: z.string().trim().min(2, "نص الإشعار مطلوب"),
  body_en: z.string().trim().optional().nullable(),
  type: z.enum(["announcement", "event", "financial", "general"]).default("general"),
  link_url: z.string().optional().nullable(),
});
export type BroadcastNotificationInput = z.infer<typeof broadcastNotificationSchema>;

// 27. DNA & Genetic Studies Schema
export const dnaStudiesDataSchema = z.object({
  haplogroup: z.string().default("J-Z20777"),
  terminal_mutation: z.string().default("J-BY37877"),
  root_haplogroup: z.string().default("J1-M267"),
  hierarchy: z
    .array(
      z.object({
        mutation: z.string(),
        label_ar: z.string(),
        label_en: z.string(),
        description_ar: z.string().optional(),
      }),
    )
    .default([]),
  chronology: z
    .array(
      z.object({
        mutation: z.string(),
        approx_date: z.string(),
        tmrca: z.string(),
        note_ar: z.string(),
        note_en: z.string(),
      }),
    )
    .default([]),
  sibling_families: z
    .array(
      z.object({
        name_ar: z.string(),
        name_en: z.string(),
        origin_ar: z.string(),
        origin_en: z.string(),
        notes_ar: z.string().optional(),
      }),
    )
    .default([]),
  distribution: z
    .array(
      z.object({
        country_ar: z.string(),
        country_en: z.string(),
        samples_count: z.number().int(),
        regions_ar: z.string(),
        note_ar: z.string().optional(),
      }),
    )
    .default([]),
});
export type DnaStudiesDataInput = z.infer<typeof dnaStudiesDataSchema>;

// 26. Museum Archive Gallery Image Link Schema
// Links an already-registered media_assets row (see mediaAssetInputSchema)
// into a gallery as one of its images -- the Museum Archive's "collection ->
// image" relationship rides on the existing galleries / gallery_media /
// media_assets tables rather than a parallel schema.
export const galleryMediaInputSchema = z.object({
  id: z.string().uuid().optional(),
  gallery_id: z.string().uuid("اختر المجموعة الأرشيفية"),
  media_asset_id: z.string().uuid(),
  caption_ar: z.string().optional().nullable(),
  caption_en: z.string().optional().nullable(),
  sort_order: z.number().int().default(0),
  is_published: z.boolean().default(true),
});
export type GalleryMediaInput = z.infer<typeof galleryMediaInputSchema>;

// 27. Generic Sort Order Reorder Schema
export const sortOrderUpdateSchema = z.object({
  table: z.enum(["galleries", "gallery_media"]),
  items: z
    .array(z.object({ id: z.string().uuid(), sort_order: z.number().int() }))
    .min(1)
    .max(1000),
});
export type SortOrderUpdateInput = z.infer<typeof sortOrderUpdateSchema>;
