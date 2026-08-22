import { createServerFn } from "@tanstack/react-start";
import { requireAdminAuth, requireTreasuryAuth, requireFamilyManagementAuth } from "@/integrations/supabase/auth-middleware";
import {
  familyMemberInputSchema,
  familyBranchInputSchema,
  familyRelationshipInputSchema,
  placeInputSchema,
  familyHistoryInputSchema,
  contentPageInputSchema,
  articleInputSchema,
  eventInputSchema,
  announcementInputSchema,
  mediaAssetInputSchema,
  galleryInputSchema,
  documentInputSchema,
  inquiryStatusUpdateSchema,
  inquiryNoteInputSchema,
  contactMessageStatusUpdateSchema,
  siteSettingInputSchema,
  businessInputSchema,
  membershipRequestReviewSchema,
  treasuryContributionReviewSchema,
  initiativeInputSchema,
  achieverInputSchema,
  libraryItemInputSchema,
  navigationMenuInputSchema,
  navigationItemInputSchema,
  eventRegistrationUpdateSchema,
  bulkMembersActionSchema,
  bulkArticlesActionSchema,
  broadcastNotificationSchema,
  dnaStudiesDataSchema,
} from "./admin-hub.schemas";
import { z } from "zod";

/* =========================================================================
 * 1. Admin Overview Stats & Global Search
 * ========================================================================= */

export type DashboardStats = {
  totalMembers: number;
  livingMembers: number;
  deceasedMembers: number;
  totalBranches: number;
  totalArticles: number;
  totalPages: number;
  totalEvents: number;
  totalMedia: number;
  pendingInquiries: number;
  totalUsers: number;
  // Enrichment for dashboard to prevent huge array fetches
  draftArticles: number;
  pendingReceipts: number;
  pendingVerifications: number;
  totalBusinesses: number;
  totalInitiatives: number;
  totalAchievers: number;
  treasuryVerified: number;
  recentActivity: {
    id: string;
    action: string;
    entity_type: string;
    created_at: string;
    // Loosely typed: audit metadata is arbitrary JSON from the log rows.
    metadata: any;
  }[];
};

export const getDashboardOverview = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }): Promise<DashboardStats> => {
    const { supabase } = context;

    const [
      membersTotalRes,
      membersLivingRes,
      branchesRes,
      articlesTotalRes,
      articlesDraftRes,
      pagesRes,
      eventsRes,
      mediaRes,
      inquiriesRes,
      contactRes,
      usersRes,
      receiptsRes,
      verifiedAmountsRes,
      verificationsRes,
      businessesRes,
      initiativesRes,
      achieversRes,
      activityRes,
    ] = await Promise.all([
      supabase.from("family_members").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("family_members").select("*", { count: "exact", head: true }).is("deleted_at", null).eq("is_living", true),
      supabase.from("branches").select("*", { count: "exact", head: true }),
      supabase.from("articles").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("articles").select("*", { count: "exact", head: true }).is("deleted_at", null).eq("status", "draft"),
      supabase.from("content_pages").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("events").select("*", { count: "exact", head: true }),
      supabase.from("media_assets").select("*", { count: "exact", head: true }),
      supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("contributions").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("contributions").select("amount").eq("status", "verified"),
      supabase.from("membership_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("businesses").select("*", { count: "exact", head: true }),
      supabase.from("initiatives").select("*", { count: "exact", head: true }),
      supabase.from("achievers").select("*", { count: "exact", head: true }),
      supabase.from("audit_logs").select("id, action, entity_type, created_at, metadata").order("created_at", { ascending: false }).limit(10),
    ]);

    const totalMembers = membersTotalRes.count ?? 0;
    const livingMembers = membersLivingRes.count ?? 0;
    const treasuryVerified = (verifiedAmountsRes.data ?? []).reduce((sum, row) => sum + Number(row.amount || 0), 0);

    return {
      totalMembers,
      livingMembers,
      deceasedMembers: totalMembers - livingMembers,
      totalBranches: branchesRes.count ?? 0,
      totalArticles: articlesTotalRes.count ?? 0,
      draftArticles: articlesDraftRes.count ?? 0,
      totalPages: pagesRes.count ?? 0,
      totalEvents: eventsRes.count ?? 0,
      totalMedia: mediaRes.count ?? 0,
      pendingInquiries: (inquiriesRes.count ?? 0) + (contactRes.count ?? 0),
      totalUsers: usersRes.count ?? 0,
      pendingReceipts: receiptsRes.count ?? 0,
      pendingVerifications: verificationsRes.count ?? 0,
      totalBusinesses: businessesRes.count ?? 0,
      totalInitiatives: initiativesRes.count ?? 0,
      totalAchievers: achieversRes.count ?? 0,
      treasuryVerified,
      recentActivity: (activityRes.data ?? []) as DashboardStats["recentActivity"],
    };
  });

/* =========================================================================
 * 2. Family Genealogical Hub (Members, Branches, Relationships, Places, Tree)
 * ========================================================================= */

export const getFamilyHubData = createServerFn({ method: "GET" })
  .middleware([requireFamilyManagementAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;

    const [membersRes, branchesRes, relationshipsRes, placesRes, historyRes] = await Promise.all([
      supabase.from("family_members").select("*").is("deleted_at", null).order("sort_order", { ascending: true }),
      supabase.from("branches").select("*").order("sort_order", { ascending: true }),
      supabase.from("family_relationships").select("*"),
      supabase.from("places").select("*").order("name_ar", { ascending: true }),
      supabase.from("family_history_entries").select("*").order("sort_order", { ascending: true }),
    ]);

    return {
      members: membersRes.data ?? [],
      branches: branchesRes.data ?? [],
      relationships: relationshipsRes.data ?? [],
      places: placesRes.data ?? [],
      history: historyRes.data ?? [],
    };
  });

export const upsertFamilyMember = createServerFn({ method: "POST" })
  .middleware([requireFamilyManagementAuth])
  .validator((d: unknown) => familyMemberInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;

    const payload: Record<string, any> = {
      ...data,
      updated_by: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      updated_at: new Date().toISOString(),
    };

    if (!payload.id) {
      payload.created_by = (context.userId || session?.user?.id || (context.claims?.sub as string));
    }

    const { data: member, error } = await supabase
      .from("family_members")
      .upsert(payload as never)
      .select()
      .single();

    if (error) throw new Error(`Failed to save family member: ${error.message}`);

    // Audit log
    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: data.id ? "update" : "create",
      entity_type: "family_members",
      entity_id: member.id,
      after_data: member,
    });

    return { ok: true, member };
  });

export const deleteFamilyMember = createServerFn({ method: "POST" })
  .middleware([requireFamilyManagementAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;

    const { error } = await supabase
      .from("family_members")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", data.id);

    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: "archive",
      entity_type: "family_members",
      entity_id: data.id,
    });

    return { ok: true };
  });

export const upsertFamilyBranch = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => familyBranchInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;

    const { data: branch, error } = await supabase
      .from("branches")
      .upsert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: data.id ? "update" : "create",
      entity_type: "branches",
      entity_id: branch.id,
      after_data: branch,
    });

    return { ok: true, branch };
  });

export const upsertFamilyRelationship = createServerFn({ method: "POST" })
  .middleware([requireFamilyManagementAuth])
  .validator((d: unknown) => familyRelationshipInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    if (data.person_id === data.related_person_id) {
      throw new Error("لا يمكن ربط الشخص بنفسه");
    }

    const { data: rel, error } = await supabase
      .from("family_relationships")
      .upsert(data as never)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { ok: true, rel };
  });

export const deleteFamilyRelationship = createServerFn({ method: "POST" })
  .middleware([requireFamilyManagementAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("family_relationships").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const upsertPlace = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => placeInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: place, error } = await supabase.from("places").upsert(data).select().single();
    if (error) throw new Error(error.message);
    return { ok: true, place };
  });

export const upsertFamilyHistory = createServerFn({ method: "POST" })
  .middleware([requireFamilyManagementAuth])
  .validator((d: unknown) => familyHistoryInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: item, error } = await supabase.from("family_history_entries").upsert(data).select().single();
    if (error) throw new Error(error.message);
    return { ok: true, item };
  });

/* =========================================================================
 * 3. CMS Pages & Structured Blocks
 * ========================================================================= */

export const getCmsPagesData = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;

    const [pagesRes, sectionsRes, revisionsRes] = await Promise.all([
      supabase.from("content_pages").select("*").is("deleted_at", null).order("updated_at", { ascending: false }),
      supabase.from("content_sections").select("*").order("sort_order", { ascending: true }),
      supabase.from("content_revisions").select("id, content_page_id, version, change_summary, created_at").order("version", { ascending: false }),
    ]);

    return {
      pages: pagesRes.data ?? [],
      sections: sectionsRes.data ?? [],
      revisions: revisionsRes.data ?? [],
    };
  });

export const upsertCmsPage = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => contentPageInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const { sections, ...pageData } = data;

    const payload: Record<string, any> = {
      ...pageData,
      updated_by: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      updated_at: new Date().toISOString(),
    };

    if (!payload.id) {
      payload.created_by = (context.userId || session?.user?.id || (context.claims?.sub as string));
    }

    if (payload.status === "published" && !payload.published_at) {
      payload.published_at = new Date().toISOString();
    }

    const { data: page, error } = await supabase
      .from("content_pages")
      .upsert(payload as never, { onConflict: payload.id ? "id" : "slug" })
      .select()
      .single();

    if (error) throw new Error(`Failed to save page: ${error.message}`);

    // If sections were provided, replace them atomically (delete+insert in a
    // single DB transaction via the RPC below) so a failure partway through
    // can never leave the page with some sections deleted and the rest never
    // inserted — see supabase/migrations/20260822070000_atomic_content_page_sections.sql.
    if (sections) {
      const sectionsToReplace = sections.map((s, idx) => ({
        type: s.type,
        sort_order: idx,
        data: s.data,
        settings: s.settings,
        visibility: s.visibility,
      }));
      const { error: sectionsError } = await supabase.rpc("replace_content_page_sections", {
        p_page_id: page.id,
        p_sections: sectionsToReplace as never,
      });
      if (sectionsError) throw new Error(`Failed to save page sections: ${sectionsError.message}`);
    }

    // Save revision snapshot
    const { count } = await supabase.from("content_revisions").select("*", { count: "exact", head: true }).eq("content_page_id", page.id);
    const nextVersion = (count ?? 0) + 1;

    await supabase.from("content_revisions").insert({
      content_page_id: page.id,
      version: nextVersion,
      snapshot: { page, sections: sections ?? [] } as never,
      change_summary: `Version ${nextVersion} saved by user`,
      created_by: (context.userId || session?.user?.id || (context.claims?.sub as string)),
    });

    // Audit log
    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: data.id ? "update" : "create",
      entity_type: "content_pages",
      entity_id: page.id,
      after_data: page,
    });

    return { ok: true, page };
  });

/* =========================================================================
 * 4. Articles, Categories & Tags
 * ========================================================================= */

export const getArticlesData = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;

    const [articlesRes, categoriesRes, tagsRes] = await Promise.all([
      supabase.from("articles").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("article_categories").select("*").order("sort_order", { ascending: true }),
      supabase.from("article_tags").select("*").order("name_ar", { ascending: true }),
    ]);

    return {
      articles: articlesRes.data ?? [],
      categories: categoriesRes.data ?? [],
      tags: tagsRes.data ?? [],
    };
  });

export const upsertArticle = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => articleInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const { tag_ids, ...articleData } = data;

    const payload: Record<string, any> = {
      ...articleData,
      updated_by: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      updated_at: new Date().toISOString(),
    };

    if (!payload.id) {
      payload.created_by = (context.userId || session?.user?.id || (context.claims?.sub as string));
    }

    if (payload.status === "published" && !payload.published_at) {
      payload.published_at = new Date().toISOString();
    }

    const { data: article, error } = await supabase
      .from("articles")
      .upsert(payload as never)
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (tag_ids) {
      const { error: delError } = await supabase.from("article_tag_relations").delete().eq("article_id", article.id);
      if (delError) throw new Error(`Failed to save article tags: ${delError.message}`);
      if (tag_ids.length > 0) {
        const { error: insError } = await supabase.from("article_tag_relations").insert(
          tag_ids.map((tagId) => ({ article_id: article.id, tag_id: tagId })),
        );
        if (insError) throw new Error(`Failed to save article tags: ${insError.message}`);
      }
    }

    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: data.id ? "update" : "create",
      entity_type: "articles",
      entity_id: article.id,
      after_data: article,
    });

    return { ok: true, article };
  });

/* =========================================================================
 * 5. Events & Registrations
 * ========================================================================= */

export const getEventsData = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;

    const [eventsRes, registrationsRes] = await Promise.all([
      supabase.from("events").select("*").order("start_at", { ascending: false }),
      supabase.from("event_registrations").select("*").order("created_at", { ascending: false }),
    ]);

    return {
      events: eventsRes.data ?? [],
      registrations: registrationsRes.data ?? [],
    };
  });

export const upsertEvent = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => eventInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;

    const payload: Record<string, any> = {
      ...data,
      updated_by: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      updated_at: new Date().toISOString(),
    };

    if (!payload.id) {
      payload.created_by = (context.userId || session?.user?.id || (context.claims?.sub as string));
    }

    const { data: event, error } = await supabase
      .from("events")
      .upsert(payload as never)
      .select()
      .single();

    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: data.id ? "update" : "create",
      entity_type: "events",
      entity_id: event.id,
      after_data: event,
    });

    return { ok: true, event };
  });

/* =========================================================================
 * 6. Announcements, Media, Galleries, Documents
 * ========================================================================= */

export const getAnnouncementsData = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    return data ?? [];
  });

export const upsertAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => announcementInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const payload = { ...data, created_by: (context.userId || session?.user?.id || (context.claims?.sub as string)) };
    const { data: ann, error } = await supabase.from("announcements").upsert(payload as never).select().single();
    if (error) throw new Error(error.message);
    return { ok: true, announcement: ann };
  });

export const getMediaAssetsData = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const [mediaRes, galleriesRes, galleryMediaRes, docsRes] = await Promise.all([
      supabase.from("media_assets").select("*").order("created_at", { ascending: false }),
      supabase.from("galleries").select("*").order("sort_order", { ascending: true }),
      supabase.from("gallery_media").select("*").order("sort_order", { ascending: true }),
      supabase.from("documents").select("*").order("created_at", { ascending: false }),
    ]);

    return {
      media: mediaRes.data ?? [],
      galleries: galleriesRes.data ?? [],
      galleryMedia: galleryMediaRes.data ?? [],
      documents: docsRes.data ?? [],
    };
  });

export const registerMediaAsset = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => mediaAssetInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const payload = { ...data, uploaded_by: (context.userId || session?.user?.id || (context.claims?.sub as string)) };
    // A plain insert for new uploads — `onConflict: "storage_path"` would
    // silently overwrite an unrelated existing row's metadata (including its
    // uploaded_by) if a storage path ever collided, rather than surfacing it.
    // Registering metadata for an already-known asset (an explicit `id`) is
    // still an update.
    const { data: asset, error } = payload.id
      ? await supabase.from("media_assets").update(payload).eq("id", payload.id).select().single()
      : await supabase.from("media_assets").insert(payload).select().single();
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: "upload",
      entity_type: "media_assets",
      entity_id: asset.id,
      after_data: asset,
    });

    return { ok: true, asset };
  });

export const upsertGallery = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => galleryInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const payload = { ...data, created_by: (context.userId || session?.user?.id || (context.claims?.sub as string)) };
    const { data: gal, error } = await supabase.from("galleries").upsert(payload as never).select().single();
    if (error) throw new Error(error.message);
    return { ok: true, gallery: gal };
  });

export const upsertDocument = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => documentInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const payload = { ...data, uploaded_by: (context.userId || session?.user?.id || (context.claims?.sub as string)) };
    const { data: doc, error } = await supabase.from("documents").upsert(payload as never).select().single();
    if (error) throw new Error(error.message);
    return { ok: true, document: doc };
  });

/* =========================================================================
 * 7. Inquiries, Users, RBAC, Settings & Audit Logs
 * ========================================================================= */

export const getInquiriesData = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    // The public contact form (src/lib/forms.functions.ts) writes to `contact_messages`,
    // a separate table from `inquiries` (which only ever receives achiever-nomination
    // submissions). Both are merged here so real visitor messages actually show up
    // in the admin Inquiries panel instead of only nominations.
    const [inquiriesRes, notesRes, contactRes] = await Promise.all([
      supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("inquiry_notes").select("*").order("created_at", { ascending: true }),
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
    ]);

    const inquiryRows = (inquiriesRes.data ?? []).map((row) => ({
      ...row,
      source_table: "inquiries" as const,
    }));

    const contactRows = (contactRes.data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      subject: row.subject,
      message: row.message,
      status: row.status,
      assigned_to: null,
      source: "contact_form",
      created_at: row.created_at,
      source_table: "contact_messages" as const,
    }));

    const merged = [...inquiryRows, ...contactRows].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return {
      inquiries: merged,
      notes: notesRes.data ?? [],
    };
  });

export const updateInquiryStatus = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => inquiryStatusUpdateSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("inquiries").update({ status: data.status, assigned_to: data.assigned_to }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateContactMessageStatus = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => contactMessageStatusUpdateSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("contact_messages").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addInquiryNote = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => inquiryNoteInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const { data: note, error } = await supabase.from("inquiry_notes").insert({
      inquiry_id: data.inquiry_id,
      note: data.note,
      author_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
    }).select().single();

    if (error) throw new Error(error.message);
    return { ok: true, note };
  });

export const getUsersAndRolesData = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;

    const [profilesRes, rolesRes, permissionsRes, rolePermissionsRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
      supabase.from("permissions").select("*"),
      supabase.from("role_permissions").select("*"),
    ]);

    return {
      profiles: profilesRes.data ?? [],
      userRoles: rolesRes.data ?? [],
      permissions: permissionsRes.data ?? [],
      rolePermissions: rolePermissionsRes.data ?? [],
    };
  });

// Matches the live `app_role` Postgres enum (verified against the database —
// this list is broader than what the checked-in migrations define, since
// several roles were added directly against the live project).
const appRoleSchema = z.enum([
  "admin",
  "editor",
  "treasurer",
  "member",
  "super_admin",
  "content_manager",
  "family_manager",
  "viewer",
]);

/** Only service_role may write `user_roles` (there is no INSERT/UPDATE/DELETE
 *  policy for `authenticated`), so every caller must be confirmed admin here —
 *  through the RLS-safe client — before we reach for the RLS-bypassing admin
 *  client to perform the write. Mirrors `private.can_manage_users` in the DB. */
async function requireCallerIsAdmin(supabase: unknown, userId: string): Promise<void> {
  const { data } = await (supabase as any)
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["admin", "super_admin"]);
  if (!data || data.length === 0) throw new Error("forbidden");
}

/** A plain `admin` must not be able to mint `super_admin` (including for
 *  themselves) — only an existing `super_admin` may grant or revoke that
 *  specific role. Every other role stays grantable by any admin. */
async function requireCallerCanGrantRole(supabase: unknown, userId: string, role: string): Promise<void> {
  if (role !== "super_admin") {
    await requireCallerIsAdmin(supabase, userId);
    return;
  }
  const { data } = await (supabase as any)
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin");
  if (!data || data.length === 0) throw new Error("forbidden: only super_admin may grant super_admin");
}

export const assignUserRole = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => z.object({ user_id: z.string().uuid(), role: appRoleSchema }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireCallerCanGrantRole(supabase, userId, data.role);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("user_roles").insert({
      user_id: data.user_id,
      role: data.role,
      granted_by: userId,
    });
    if (error && error.code !== "23505") throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: userId,
      action: "role_change",
      entity_type: "user_roles",
      entity_id: data.user_id,
      metadata: { role: data.role },
    });

    return { ok: true };
  });

export const removeUserRole = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => z.object({ user_id: z.string().uuid(), role: appRoleSchema }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireCallerCanGrantRole(supabase, userId, data.role);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // DELETE matching zero rows is not an error as far as Supabase/Postgres
    // is concerned -- it succeeds with an empty result, so without checking
    // what actually came back this would report success even when the
    // target row didn't exist (wrong user_id, role already removed, a stale
    // client reference, etc.).
    const { data: deleted, error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.user_id)
      .eq("role", data.role)
      .select("id");
    if (error) throw new Error(error.message);
    if (!deleted || deleted.length === 0) {
      throw new Error(`Role "${data.role}" was not found for this user (nothing removed).`);
    }

    await supabase.from("audit_logs").insert({
      actor_user_id: userId,
      action: "role_change",
      entity_type: "user_roles",
      entity_id: data.user_id,
      metadata: { removed_role: data.role },
    });

    return { ok: true };
  });

export const getAuditLogsData = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200);
    return data ?? [];
  });

export const getSiteSettingsData = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data } = await supabase.from("site_settings").select("*");
    return data ?? [];
  });

export const upsertSiteSetting = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => siteSettingInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const payload: Record<string, any> = {
      ...data,
      updated_by: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      updated_at: new Date().toISOString(),
    };
    const { data: setting, error } = await supabase
      .from("site_settings")
      .upsert(payload as never, { onConflict: "key" })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: "settings_change",
      entity_type: "site_settings",
      entity_id: data.key,
      after_data: setting,
    });

    return { ok: true, setting };
  });

/* =========================================================================
 * 8. Directory & Membership Applications Management
 * ========================================================================= */

export const getDirectoryManagementData = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const [bizRes, reqRes] = await Promise.all([
      supabase.from("businesses").select("*").order("sort_order", { ascending: true }),
      supabase.from("membership_requests").select("*").order("created_at", { ascending: false }),
    ]);

    return {
      businesses: bizRes.data ?? [],
      membershipRequests: reqRes.data ?? [],
    };
  });

export const upsertBusiness = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => businessInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const payload: Record<string, any> = {
      ...data,
      created_by: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      updated_at: new Date().toISOString(),
    };
    const { data: biz, error } = await supabase.from("businesses").upsert(payload as never).select().single();
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: data.id ? "update" : "create",
      entity_type: "businesses",
      entity_id: biz.id,
      after_data: biz,
    });

    return { ok: true, business: biz };
  });

export const deleteBusiness = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const { error } = await supabase.from("businesses").delete().eq("id", data.id);
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: "delete",
      entity_type: "businesses",
      entity_id: data.id,
    });

    return { ok: true };
  });

export const reviewMembershipRequest = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => membershipRequestReviewSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const actorId = context.userId || session?.user?.id || (context.claims?.sub as string);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: req, error } = await supabaseAdmin.rpc("review_membership_request_as_admin", {
      p_request_id: data.id,
      p_status: data.status,
      // The RPC's p_review_note is a required string param; it does its own
      // NULLIF(trim(p_review_note), '') to treat an empty string as "no note".
      p_review_note: data.review_note || "",
      p_actor_id: actorId,
    });

    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: actorId,
      action: "update",
      entity_type: "membership_requests",
      entity_id: data.id,
      after_data: req,
    });

    return { ok: true, request: req };
  });

/* =========================================================================
 * 9. Treasury & Contributions Management
 * ========================================================================= */

export const getTreasuryManagementData = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: list, error } = await supabase
      .from("contributions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    const contributions = list ?? [];

    const verifiedTotal = contributions
      .filter((c) => c.status === "verified")
      .reduce((sum, c) => sum + Number(c.amount || 0), 0);

    const pendingTotal = contributions
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + Number(c.amount || 0), 0);

    return {
      contributions,
      verifiedTotal,
      pendingTotal,
    };
  });

export const reviewTreasuryContribution = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => treasuryContributionReviewSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const { data: updated, error } = await supabase
      .from("contributions")
      .update({
        status: data.status,
        review_note: data.review_note,
        reviewed_by: (context.userId || session?.user?.id || (context.claims?.sub as string)),
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: "update",
      entity_type: "contributions",
      entity_id: data.id,
      after_data: updated,
    });

    return { ok: true, contribution: updated };
  });

/* =========================================================================
 * 10. Initiatives & Capital Projects Management
 * ========================================================================= */

export const getInitiativesManagementData = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("initiatives")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertInitiative = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => initiativeInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const payload: Record<string, any> = {
      ...data,
      created_by: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      updated_at: new Date().toISOString(),
    };
    const { data: init, error } = await supabase.from("initiatives").upsert(payload as never).select().single();
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: data.id ? "update" : "create",
      entity_type: "initiatives",
      entity_id: init.id,
      after_data: init,
    });

    return { ok: true, initiative: init };
  });

export const deleteInitiative = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const { error } = await supabase.from("initiatives").delete().eq("id", data.id);
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: "delete",
      entity_type: "initiatives",
      entity_id: data.id,
    });

    return { ok: true };
  });

/* =========================================================================
 * 11. Achievers (Roll of Honour) Management
 * ========================================================================= */

export const getAchieversManagementData = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("achievers")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertAchiever = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => achieverInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const payload: Record<string, any> = {
      ...data,
      created_by: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      updated_at: new Date().toISOString(),
    };
    const { data: ach, error } = await supabase.from("achievers").upsert(payload as never).select().single();
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: data.id ? "update" : "create",
      entity_type: "achievers",
      entity_id: ach.id,
      after_data: ach,
    });

    return { ok: true, achiever: ach };
  });

export const deleteAchiever = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const { error } = await supabase.from("achievers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: "delete",
      entity_type: "achievers",
      entity_id: data.id,
    });

    return { ok: true };
  });

/* =========================================================================
 * 12. Library & Heritage Archive Management
 * ========================================================================= */

export const getLibraryManagementData = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("library_items")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertLibraryItem = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => libraryItemInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const payload: Record<string, any> = {
      ...data,
      created_by: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      updated_at: new Date().toISOString(),
    };
    const { data: lib, error } = await supabase.from("library_items").upsert(payload as never).select().single();
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: data.id ? "update" : "create",
      entity_type: "library_items",
      entity_id: lib.id,
      after_data: lib,
    });

    return { ok: true, libraryItem: lib };
  });

export const deleteLibraryItem = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const { error } = await supabase.from("library_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: "delete",
      entity_type: "library_items",
      entity_id: data.id,
    });

    return { ok: true };
  });

/* =========================================================================
 * 12. Navigation Menus & Items Management
 * ========================================================================= */

export const getNavigationManagementData = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const [menusRes, itemsRes] = await Promise.all([
      supabase.from("navigation_menus").select("*").order("name_ar", { ascending: true }),
      supabase.from("navigation_items").select("*").order("sort_order", { ascending: true }),
    ]);
    return {
      menus: menusRes.data ?? [],
      items: itemsRes.data ?? [],
    };
  });

export const upsertNavigationMenu = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => navigationMenuInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const { data: menu, error } = await supabase
      .from("navigation_menus")
      .upsert({ ...data })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: data.id ? "update" : "create",
      entity_type: "navigation_menus",
      entity_id: menu.id,
      after_data: menu,
    });

    return { ok: true, menu };
  });

export const upsertNavigationItem = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => navigationItemInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const { data: item, error } = await supabase
      .from("navigation_items")
      .upsert({ ...data, updated_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: data.id ? "update" : "create",
      entity_type: "navigation_items",
      entity_id: item.id,
      after_data: item,
    });

    return { ok: true, item };
  });

export const deleteNavigationItem = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const { error } = await supabase.from("navigation_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: "delete",
      entity_type: "navigation_items",
      entity_id: data.id,
    });

    return { ok: true };
  });

/* =========================================================================
 * 13. Event Registrations & Attendee Management
 * ========================================================================= */

export const updateEventRegistrationStatus = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => eventRegistrationUpdateSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const { data: reg, error } = await supabase
      .from("event_registrations")
      .update({ status: data.status })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: "update_registration_status",
      entity_type: "event_registrations",
      entity_id: data.id,
      after_data: reg,
    });

    return { ok: true, registration: reg };
  });

export const deleteEventRegistration = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const { error } = await supabase.from("event_registrations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: "delete_registration",
      entity_type: "event_registrations",
      entity_id: data.id,
    });

    return { ok: true };
  });

/* =========================================================================
 * 14. Bulk Operations for Data Records
 * ========================================================================= */

export const bulkFamilyMembersAction = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => bulkMembersActionSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const { ids, action, branch_id, visibility } = data;

    if (action === "delete") {
      const { error } = await supabase
        .from("family_members")
        .update({ deleted_at: new Date().toISOString() })
        .in("id", ids);
      if (error) throw new Error(error.message);
    } else if (action === "change_branch" && branch_id) {
      const { error } = await supabase
        .from("family_members")
        .update({ branch_id, updated_at: new Date().toISOString() })
        .in("id", ids);
      if (error) throw new Error(error.message);
    } else if (action === "set_living") {
      const { error } = await supabase
        .from("family_members")
        .update({ is_living: true, updated_at: new Date().toISOString() })
        .in("id", ids);
      if (error) throw new Error(error.message);
    } else if (action === "set_deceased") {
      const { error } = await supabase
        .from("family_members")
        .update({ is_living: false, updated_at: new Date().toISOString() })
        .in("id", ids);
      if (error) throw new Error(error.message);
    } else if (action === "publish") {
      const { error } = await supabase
        .from("family_members")
        .update({ status: "published", updated_at: new Date().toISOString() })
        .in("id", ids);
      if (error) throw new Error(error.message);
    } else if (action === "draft") {
      const { error } = await supabase
        .from("family_members")
        .update({ status: "draft", updated_at: new Date().toISOString() })
        .in("id", ids);
      if (error) throw new Error(error.message);
    } else if (action === "change_visibility" && visibility) {
      const { error } = await supabase
        .from("family_members")
        .update({ visibility, updated_at: new Date().toISOString() })
        .in("id", ids);
      if (error) throw new Error(error.message);
    }

    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: `bulk_${action}`,
      entity_type: "family_members",
      metadata: { target_count: ids.length, ids },
    });

    return { ok: true, count: ids.length };
  });

export const bulkArticlesAction = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => bulkArticlesActionSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const { ids, action } = data;

    if (action === "delete") {
      const { error } = await supabase
        .from("articles")
        .update({ deleted_at: new Date().toISOString() })
        .in("id", ids);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("articles")
        .update({ status: action, updated_at: new Date().toISOString() })
        .in("id", ids);
      if (error) throw new Error(error.message);
    }

    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: `bulk_article_${action}`,
      entity_type: "articles",
      metadata: { target_count: ids.length, ids },
    });

    return { ok: true, count: ids.length };
  });

/* =========================================================================
 * 15. Broadcast System Notifications
 * ========================================================================= */

export const broadcastNotification = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => broadcastNotificationSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const { data: users, error: userError } = await supabase.from("profiles").select("id");
    if (userError) throw new Error(userError.message);

    const rows = (users ?? []).map((u) => ({
      user_id: u.id,
      title_ar: data.title_ar,
      title_en: data.title_en ?? data.title_ar,
      message_ar: data.body_ar,
      message_en: data.body_en ?? data.body_ar,
      type: data.type,
      link: data.link_url,
      is_read: false,
    }));

    if (rows.length > 0) {
      // `notifications`' RLS policy only allows a row where user_id = auth.uid(),
      // so broadcasting to every profile needs the service-role client — the
      // `requireAdminAuth` middleware above is what keeps this admin-only.
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.from("notifications").insert(rows);
      if (error) throw new Error(error.message);
    }

    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: "broadcast_notification",
      entity_type: "notifications",
      metadata: { recipients_count: rows.length, title: data.title_ar },
    });

    return { ok: true, sent_to: rows.length };
  });

/* =========================================================================
 * 16. DNA Studies & Genetic Markers Management
 * ========================================================================= */

export const getDnaStudiesData = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "dna_studies_data")
      .maybeSingle();

    return data?.value ?? null;
  });

export const saveDnaStudiesData = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => dnaStudiesDataSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const { data: setting, error } = await supabase
      .from("site_settings")
      .upsert(
        {
          category: "dna",
          key: "dna_studies_data",
          value: data,
          is_public: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      )
      .select()
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: (context.userId || session?.user?.id || (context.claims?.sub as string)),
      action: "update_dna_studies",
      entity_type: "site_settings",
      entity_id: setting.id,
      after_data: data,
    });

    return { ok: true };
  });

/* =========================================================================
 * 17. Live Admin Notifications & Real-Time Alert System
 * ========================================================================= */

export const getAdminNotificationsList = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase, session } = context;
    const userId = (context.userId || session?.user?.id || (context.claims?.sub as string));

    const { data: notifs, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) throw new Error(error.message);

    const items = notifs ?? [];
    const unreadCount = items.filter((n) => !n.is_read).length;

    return {
      notifications: items,
      unreadCount,
    };
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const userId = (context.userId || session?.user?.id || (context.claims?.sub as string));

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", data.id)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const markAllNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase, session } = context;
    const userId = (context.userId || session?.user?.id || (context.claims?.sub as string));

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteNotification = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const userId = (context.userId || session?.user?.id || (context.claims?.sub as string));

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", data.id)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });
