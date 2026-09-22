import { createServerFn } from "@tanstack/react-start";
import {
  requireAdminAuth,
  requireTreasuryAuth,
  requireFamilyManagementAuth,
} from "@/integrations/supabase/auth-middleware";
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
  serviceInputSchema,
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
  initiativeRegistrationUpdateSchema,
  bulkMembersActionSchema,
  bulkArticlesActionSchema,
  broadcastNotificationSchema,
  dnaStudiesDataSchema,
  contributionStatusSchema,
  galleryMediaInputSchema,
  sortOrderUpdateSchema,
} from "./admin-hub.schemas";
import { z } from "zod";
import { resolveUniqueSlug } from "@/lib/slugify";

/** JSON-serializable value — satisfies TanStack Start's serialization
 *  validator unlike `unknown` while avoiding `any`. */
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/**
 * Arabic-first slugs: schemas already derive a URL-safe slug from the Arabic
 * title/name, so the only remaining job here is uniqueness — duplicate Arabic
 * titles get `-2`, `-3`, ... instead of a 23505 error shown to the editor.
 */
async function ensureUniqueSlug(
  client: { from: (t: string) => any },
  table: string,
  payload: Record<string, any>,
  id?: string | null,
): Promise<void> {
  if (typeof payload["slug"] !== "string" || !payload["slug"]) return;
  payload["slug"] = await resolveUniqueSlug({
    client,
    table,
    base: payload["slug"],
    excludeId: id ?? null,
  });
}

export const paginationSchema = z.object({
  page: z.number().int().min(1).max(100000).default(1),
  pageSize: z.number().int().min(1).max(100).default(50),
  // Capped so a caller cannot push a multi-megabyte ILIKE pattern (or a
  // non-integer page offset) through the admin list endpoints.
  search: z.string().trim().max(120).optional(),
  status: z.string().trim().max(40).optional(),
  committeeSlug: z.string().trim().max(80).optional(),
});

/* =========================================================================
 * Shared server-side guards
 * ========================================================================= */

/** PostgREST's `.or()` grammar separates conditions with "," and groups them
 *  with "()", so leaving those characters in caller-supplied text lets the
 *  caller append filter clauses of their own to the query. Every `.or()`
 *  built from user input in this file must run its term through here. */
function sanitizeFilterTerm(raw: string): string {
  return raw.trim().replace(/[,()]/g, "");
}

/** Postgres treats an UPDATE/DELETE matching zero rows as a success with an
 *  empty result, so a mutation that never inspects what came back happily
 *  reports "saved" for a row it never touched (wrong id, already deleted, or
 *  filtered out by RLS). Mutations here pass their `.select(...)` rows through
 *  this so a no-op becomes a real, visible error. */
function assertRowsAffected(rows: unknown[] | null, entity: string, id: string): void {
  if (!rows || rows.length === 0) {
    throw new Error(
      `لم يُعثر على السجل المطلوب في "${entity}" (المعرّف ${id}) ولم يتغيّر أي صف. ` +
        `No matching "${entity}" row for id ${id} — nothing was changed.`,
    );
  }
}

/** Supabase returns read errors in-band; ignoring them turns an RLS rejection
 *  or a transport fault into a silently empty admin screen that looks like
 *  "no data yet" instead of a failure. */
function unwrapRows<T>(
  res: { data: T[] | null; error: { message: string } | null },
  label: string,
): T[] {
  if (res.error)
    throw new Error(`تعذّر تحميل ${label}. Failed to load ${label}: ${res.error.message}`);
  return res.data ?? [];
}

/* =========================================================================
 * Global Admin Search (Command Palette)
 * ========================================================================= */
export const globalAdminSearch = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => z.object({ query: z.string().trim().min(1).max(120) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    // PostgREST's .or() syntax uses "," to separate conditions and "()" to
    // nest logical groups -- unescaped input could smuggle in extra filter
    // clauses (same class of bug fixed earlier in getPublicGlobalSearch).
    const cleanQuery = sanitizeFilterTerm(data.query);
    if (!cleanQuery) return [];
    const term = `%${cleanQuery}%`;

    const [profiles, members, articles, treasury] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name_ar, full_name_en, email")
        .or(`full_name_ar.ilike.${term},full_name_en.ilike.${term},email.ilike.${term}`)
        .limit(5),
      supabase
        .from("family_members")
        .select("id, first_name_ar, last_name_ar, first_name_en, last_name_en")
        .or(
          `first_name_ar.ilike.${term},last_name_ar.ilike.${term},first_name_en.ilike.${term},last_name_en.ilike.${term}`,
        )
        .is("deleted_at", null)
        .limit(5),
      supabase
        .from("articles")
        .select("id, title_ar, slug")
        .ilike("title_ar", term)
        .is("deleted_at", null)
        .limit(5),
      supabase
        .from("contributions")
        .select("id, contributor_name, amount")
        .ilike("contributor_name", term)
        .limit(5),
    ]);

    type SearchResult = {
      id: string;
      title: string;
      subtitle?: string | null;
      category: string;
      tab: string;
    };

    const results: SearchResult[] = [];
    if (profiles.data)
      profiles.data.forEach((p) =>
        results.push({
          id: p.id,
          title: p.full_name_ar || p.full_name_en || p.email || "",
          subtitle: p.email,
          category: "directory",
          tab: "users",
        }),
      );
    if (members.data)
      members.data.forEach((m) =>
        results.push({
          id: m.id,
          title: `${m.first_name_ar} ${m.last_name_ar}`,
          subtitle: `${m.first_name_en || ""} ${m.last_name_en || ""}`.trim(),
          category: "family",
          tab: "members",
        }),
      );
    if (articles.data)
      articles.data.forEach((a) =>
        results.push({
          id: a.id,
          title: a.title_ar,
          subtitle: a.slug,
          category: "content",
          tab: "articles",
        }),
      );
    if (treasury.data)
      treasury.data.forEach((t) =>
        results.push({
          id: t.id,
          title: t.contributor_name,
          subtitle: `${t.amount} SAR`,
          category: "treasury",
          tab: "contributions",
        }),
      );

    return results;
  });

/* =========================================================================
 * 1. Admin Overview Stats & Global Search
 * ========================================================================= */

export type DashboardStats = {
  /** Documented individuals in the genealogy (`family_members`). */
  totalMembers: number;
  livingMembers: number;
  deceasedMembers: number;
  totalBranches: number;
  totalArticles: number;
  totalPages: number;
  totalEvents: number;
  totalMedia: number;
  pendingInquiries: number;
  /** Website accounts (`profiles`). */
  totalUsers: number;
  /** Website accounts holding the `member` role (an approved membership). */
  approvedMembers: number;
  /** Sum of contributions still awaiting verification (SAR). */
  treasuryPending: number;
  /** Annual fundraising target from treasury_config; 0 = not set. */
  treasuryTarget: number;
  /** Number of verified contribution records. */
  treasuryContributionCount: number;
  // Enrichment for dashboard to prevent huge array fetches
  draftArticles: number;
  pendingReceipts: number;
  pendingVerifications: number;
  totalBusinesses: number;
  totalInitiatives: number;
  totalAchievers: number;
  treasuryVerified: number;
  pendingMembersWithoutRoles: number;
  healthScore: number;
  recentActivity: {
    id: string;
    action: string;
    entity_type: string;
    created_at: string;
    metadata: JsonValue | null;
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
      approvedMembersRes,
      pendingAmountsRes,
      treasuryConfigRes,
    ] = await Promise.all([
      supabase
        .from("family_members")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null),
      supabase
        .from("family_members")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null)
        .eq("is_living", true),
      supabase.from("branches").select("*", { count: "exact", head: true }),
      supabase.from("articles").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null)
        .eq("status", "draft"),
      supabase
        .from("content_pages")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null),
      supabase.from("events").select("*", { count: "exact", head: true }),
      supabase.from("media_assets").select("*", { count: "exact", head: true }),
      supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
      supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("status", "new"),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("contributions")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase.from("contributions").select("amount").eq("status", "verified"),
      supabase
        .from("membership_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase.from("businesses").select("*", { count: "exact", head: true }),
      supabase.from("initiatives").select("*", { count: "exact", head: true }),
      supabase.from("achievers").select("*", { count: "exact", head: true }),
      supabase
        .from("audit_logs")
        .select("id, action, entity_type, created_at, metadata")
        .order("created_at", { ascending: false })
        .limit(10),
      // Website accounts that hold the `member` role (an approved membership),
      // as opposed to `family_members` (the documented genealogy).
      supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "member"),
      supabase.from("contributions").select("amount").eq("status", "pending"),
      supabase.from("site_settings").select("value").eq("key", "treasury_config").maybeSingle(),
    ]);

    const totalMembers = membersTotalRes.count ?? 0;
    const livingMembers = membersLivingRes.count ?? 0;
    const treasuryVerified = (verifiedAmountsRes.data ?? []).reduce(
      (sum, row) => sum + Number(row.amount || 0),
      0,
    );
    const treasuryPending = (pendingAmountsRes.data ?? []).reduce(
      (sum, row) => sum + Number(row.amount || 0),
      0,
    );
    const treasuryTarget = Math.max(
      0,
      Number((treasuryConfigRes.data?.value as { annual_target?: unknown })?.annual_target ?? 0),
    );

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
      approvedMembers: approvedMembersRes.count ?? 0,
      pendingMembersWithoutRoles: Math.max(0, (approvedMembersRes.count ?? 0) - 5),
      healthScore: Math.max(
        65,
        Math.min(
          100,
          100 -
            ((verificationsRes.count ?? 0) * 3 +
              (receiptsRes.count ?? 0) * 3 +
              (articlesDraftRes.count ?? 0) * 2 +
              ((inquiriesRes.count ?? 0) + (contactRes.count ?? 0)) * 2),
        ),
      ),
      treasuryPending,
      treasuryTarget,
      treasuryContributionCount: (verifiedAmountsRes.data ?? []).length,
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

    // The official dataset is 550 members and 1,098 relationship rows, which is
    // past PostgREST's default 1,000-row ceiling -- an unpaged select silently
    // dropped ~100 kinship links and the console's tree lost whole sub-branches.
    const PAGE = 1000;
    const memberPage = (from: number) =>
      supabase
        .from("family_members")
        .select(
          "id, first_name_ar, middle_name_ar, last_name_ar, first_name_en, middle_name_en, last_name_en, slug, branch_id, generation, gender, is_living, sort_order, status, visibility, updated_at",
        )
        .is("deleted_at", null)
        .order("generation", { ascending: true })
        .order("sort_order", { ascending: true })
        .range(from, from + PAGE - 1);
    const relationshipPage = (from: number) =>
      supabase
        .from("family_relationships")
        .select("*")
        .range(from, from + PAGE - 1);

    const [firstMembers, branchesRes, firstRelationships, placesRes, historyRes] =
      await Promise.all([
        memberPage(0),
        supabase.from("branches").select("*").order("sort_order", { ascending: true }),
        relationshipPage(0),
        supabase.from("places").select("*").order("name_ar", { ascending: true }),
        supabase
          .from("family_history_entries")
          .select("*")
          .order("sort_order", { ascending: true }),
      ]);

    const members = unwrapRows(firstMembers, "أفراد العائلة / family members");
    for (let from = PAGE; members.length === from; from += PAGE) {
      members.push(...unwrapRows(await memberPage(from), "أفراد العائلة / family members"));
    }

    const relationships = unwrapRows(firstRelationships, "صلات القرابة / relationships");
    for (let from = PAGE; relationships.length === from; from += PAGE) {
      relationships.push(
        ...unwrapRows(await relationshipPage(from), "صلات القرابة / relationships"),
      );
    }

    return {
      members,
      branches: unwrapRows(branchesRes, "الفروع / branches"),
      relationships,
      places: unwrapRows(placesRes, "الأماكن / places"),
      history: unwrapRows(historyRes, "تاريخ العائلة / family history"),
    };
  });

export const getFamilyMembersPaginated = createServerFn({ method: "POST" })
  .middleware([requireFamilyManagementAuth])
  .validator((d: unknown) =>
    paginationSchema
      // A free-form string here reaches `.eq("branch_id", ...)` and a non-UUID
      // value comes back as a raw Postgres "invalid input syntax" error.
      .extend({ branchId: z.union([z.string().uuid(), z.literal("all")]).optional() })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { page, pageSize, search, branchId, status } = data;

    let query = supabase
      .from("family_members")
      .select("*", { count: "exact" })
      .is("deleted_at", null);

    // `search` is interpolated straight into a PostgREST `.or()` group, so it
    // has to be stripped of the "," / "()" that delimit that grammar -- without
    // this a caller can append arbitrary filter clauses to the query.
    const cleanSearch = search ? sanitizeFilterTerm(search) : "";
    if (cleanSearch) {
      const term = `%${cleanSearch}%`;
      query = query.or(
        `first_name_ar.ilike.${term},last_name_ar.ilike.${term},first_name_en.ilike.${term},last_name_en.ilike.${term}`,
      );
    }
    if (branchId && branchId !== "all") {
      query = query.eq("branch_id", branchId);
    }
    if (status === "living") {
      query = query.eq("is_living", true);
    } else if (status === "deceased") {
      query = query.eq("is_living", false);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const {
      data: members,
      count,
      error,
    } = await query.order("sort_order", { ascending: true }).range(from, to);
    if (error) throw new Error(error.message);

    return { data: members ?? [], count: count ?? 0, page, pageSize };
  });

export const upsertFamilyMember = createServerFn({ method: "POST" })
  .middleware([requireFamilyManagementAuth])
  .validator((d: unknown) => familyMemberInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;

    const payload: Record<string, any> = {
      ...data,
      updated_by: context.userId || session?.user?.id || (context.claims?.sub as string),
      updated_at: new Date().toISOString(),
    };

    if (!payload.id) {
      payload.created_by = context.userId || session?.user?.id || (context.claims?.sub as string);
    }

    await ensureUniqueSlug(supabase as any, "family_members", payload, data.id);

    const { data: member, error } = await supabase
      .from("family_members")
      .upsert(payload as never)
      .select()
      .single();

    if (error) throw new Error(`Failed to save family member: ${error.message}`);

    // Audit log
    await supabase.from("audit_logs").insert({
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
      action: data.id ? "update" : "create",
      entity_type: "family_members",
      entity_id: member.id,
      after_data: member,
    });

    try {
      const { notifyFamilyManagersOnLineageUpdate } = await import("@/lib/notifications.server");
      const fullName =
        `${member.first_name_ar || ""} ${member.last_name_ar || ""}`.trim() || "فرد من الأسرة";
      void notifyFamilyManagersOnLineageUpdate({
        actorId: context.userId || session?.user?.id || "",
        memberName: fullName,
        actionDesc: data.id ? "تعديل في سجل النسب" : "إضافة فرد جديد في شجرة العائلة",
      }).catch((err) => console.error("[admin-hub] lineage notification failed:", err));
    } catch (err) {
      console.warn("[admin-hub] notification hook failed:", err);
    }

    return { ok: true, member };
  });

export const deleteFamilyMember = createServerFn({ method: "POST" })
  .middleware([requireFamilyManagementAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;

    const { data: archived, error } = await supabase
      .from("family_members")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", data.id)
      .is("deleted_at", null)
      .select("id, first_name_ar, last_name_ar");

    if (error) throw new Error(error.message);
    assertRowsAffected(archived, "family_members", data.id);

    await supabase.from("audit_logs").insert({
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
      action: "archive",
      entity_type: "family_members",
      entity_id: data.id,
    });

    try {
      const { notifyFamilyManagersOnLineageUpdate } = await import("@/lib/notifications.server");
      const name = archived[0]
        ? `${archived[0].first_name_ar || ""} ${archived[0].last_name_ar || ""}`.trim()
        : "فرد من الأسرة";
      void notifyFamilyManagersOnLineageUpdate({
        actorId: context.userId || session?.user?.id || "",
        memberName: name,
        actionDesc: "أرشفة سجل فرد من شجرة الأسرة",
      }).catch((err) => console.error("[admin-hub] lineage archive notification failed:", err));
    } catch (err) {
      console.warn("[admin-hub] notification hook failed:", err);
    }

    return { ok: true };
  });

export const upsertFamilyBranch = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => familyBranchInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;

    const payload: Record<string, any> = { ...data };
    await ensureUniqueSlug(supabase as any, "branches", payload, data.id);

    const { data: branch, error } = await supabase
      .from("branches")
      .upsert(payload as never)
      .select()
      .single();

    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
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
    const { data: deleted, error } = await supabase
      .from("family_relationships")
      .delete()
      .eq("id", data.id)
      .select("id");
    if (error) throw new Error(error.message);
    assertRowsAffected(deleted, "family_relationships", data.id);
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
    const { data: item, error } = await supabase
      .from("family_history_entries")
      .upsert(data)
      .select()
      .single();
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
      supabase
        .from("content_pages")
        .select("*")
        .is("deleted_at", null)
        .order("updated_at", { ascending: false }),
      supabase.from("content_sections").select("*").order("sort_order", { ascending: true }),
      supabase
        .from("content_revisions")
        .select("id, content_page_id, version, change_summary, created_at")
        .order("version", { ascending: false }),
    ]);

    return {
      pages: unwrapRows(pagesRes, "الصفحات / pages"),
      sections: unwrapRows(sectionsRes, "أقسام الصفحات / page sections"),
      revisions: unwrapRows(revisionsRes, "النسخ / revisions"),
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
      updated_by: context.userId || session?.user?.id || (context.claims?.sub as string),
      updated_at: new Date().toISOString(),
    };

    if (!payload.id) {
      payload.created_by = context.userId || session?.user?.id || (context.claims?.sub as string);
    }

    if (payload.status === "published" && !payload.published_at) {
      payload.published_at = new Date().toISOString();
    }

    await ensureUniqueSlug(supabase as any, "content_pages", payload, data.id);

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

    // Save revision snapshot. The next version comes from the highest existing
    // version rather than a row count -- a count hands out a number that
    // already exists as soon as any older revision is pruned.
    const { data: latestRevision, error: revisionLookupError } = await supabase
      .from("content_revisions")
      .select("version")
      .eq("content_page_id", page.id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (revisionLookupError) {
      throw new Error(`Failed to read page revisions: ${revisionLookupError.message}`);
    }
    const nextVersion = (latestRevision?.version ?? 0) + 1;

    // Surfaced rather than ignored: the page itself is already saved at this
    // point, but silently losing the snapshot leaves the revision history
    // lying about what happened.
    const { error: revisionError } = await supabase.from("content_revisions").insert({
      content_page_id: page.id,
      version: nextVersion,
      snapshot: { page, sections: sections ?? [] } as never,
      change_summary: `Version ${nextVersion} saved by user`,
      created_by: context.userId || session?.user?.id || (context.claims?.sub as string),
    });
    if (revisionError) {
      throw new Error(
        `تم حفظ الصفحة لكن تعذّر حفظ نسخة المراجعة. Page saved, but its revision snapshot failed: ${revisionError.message}`,
      );
    }

    // Audit log
    await supabase.from("audit_logs").insert({
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
      action: data.id ? "update" : "create",
      entity_type: "content_pages",
      entity_id: page.id,
      after_data: page,
    });

    return { ok: true, page };
  });

export const deleteCmsPage = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;

    // Soft-delete, same shape as deleteFamilyMember: `getCmsPagesData` and the
    // public `getPublicContentPageBySlug` loader both filter on
    // `deleted_at IS NULL`, so stamping it removes the page from the console
    // list and the public site at once without destroying its revision history.
    // There was previously no delete path for content_pages at all —
    // `cms.functions.ts::deleteCmsRow` only covers the flat content tables —
    // so abandoned pages could never be cleared.
    const { data: archived, error } = await supabase
      .from("content_pages")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", data.id)
      .is("deleted_at", null)
      .select("id");

    if (error) throw new Error(error.message);
    assertRowsAffected(archived, "content_pages", data.id);

    await supabase.from("audit_logs").insert({
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
      action: "archive",
      entity_type: "content_pages",
      entity_id: data.id,
    });

    return { ok: true };
  });

/* =========================================================================
 * 4. Articles, Categories & Tags
 * ========================================================================= */

export const getArticlesData = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;

    const [articlesRes, categoriesRes, tagsRes] = await Promise.all([
      supabase
        .from("articles")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase.from("article_categories").select("*").order("sort_order", { ascending: true }),
      supabase.from("article_tags").select("*").order("name_ar", { ascending: true }),
    ]);

    return {
      articles: unwrapRows(articlesRes, "المقالات / articles"),
      categories: unwrapRows(categoriesRes, "التصنيفات / categories"),
      tags: unwrapRows(tagsRes, "الوسوم / tags"),
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
      updated_by: context.userId || session?.user?.id || (context.claims?.sub as string),
      updated_at: new Date().toISOString(),
    };

    if (!payload.id) {
      payload.created_by = context.userId || session?.user?.id || (context.claims?.sub as string);
    }

    if (payload.status === "published" && !payload.published_at) {
      payload.published_at = new Date().toISOString();
    }

    await ensureUniqueSlug(supabase as any, "articles", payload, data.id);

    const { data: article, error } = await supabase
      .from("articles")
      .upsert(payload as never)
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (tag_ids) {
      const { error: delError } = await supabase
        .from("article_tag_relations")
        .delete()
        .eq("article_id", article.id);
      if (delError) throw new Error(`Failed to save article tags: ${delError.message}`);
      if (tag_ids.length > 0) {
        const { error: insError } = await supabase
          .from("article_tag_relations")
          .insert(tag_ids.map((tagId) => ({ article_id: article.id, tag_id: tagId })));
        if (insError) throw new Error(`Failed to save article tags: ${insError.message}`);
      }
    }

    await supabase.from("audit_logs").insert({
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
      action: data.id ? "update" : "create",
      entity_type: "articles",
      entity_id: article.id,
      after_data: article,
    });

    if (!data.id && article.status === "draft") {
      try {
        const { notifyContentStaffOnArticleDraft } = await import("@/lib/notifications.server");
        void notifyContentStaffOnArticleDraft({
          id: article.id,
          title_ar: article.title_ar,
          title_en: article.title_en,
        }).catch((err) => console.error("[admin-hub] article draft notification failed:", err));
      } catch (err) {
        console.warn("[admin-hub] notification hook failed:", err);
      }
    } else if (
      article.status === "published" &&
      (!data.id || (payload.status === "published" && !data.published_at))
    ) {
      try {
        const { notifyMembersOnNewArticle } = await import("@/lib/notifications.server");
        void notifyMembersOnNewArticle({
          id: article.id,
          title_ar: article.title_ar,
          title_en: article.title_en,
          slug: article.slug,
        }).catch((err) => console.error("[admin-hub] article published notification failed:", err));
      } catch (err) {
        console.warn("[admin-hub] notification hook failed:", err);
      }
    }

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
      events: unwrapRows(eventsRes, "الفعاليات / events"),
      registrations: unwrapRows(registrationsRes, "التسجيلات / registrations"),
    };
  });

export const upsertEvent = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => eventInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;

    const payload: Record<string, any> = {
      ...data,
      updated_by: context.userId || session?.user?.id || (context.claims?.sub as string),
      updated_at: new Date().toISOString(),
    };

    if (!payload.id) {
      payload.created_by = context.userId || session?.user?.id || (context.claims?.sub as string);
    }

    await ensureUniqueSlug(supabase as any, "events", payload, data.id);

    const { data: event, error } = await supabase
      .from("events")
      .upsert(payload as never)
      .select()
      .single();

    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
      action: data.id ? "update" : "create",
      entity_type: "events",
      entity_id: event.id,
      after_data: event,
    });

    if (!data.id && event.status === "published") {
      try {
        const { notifyMembersOnNewEvent } = await import("@/lib/notifications.server");
        void notifyMembersOnNewEvent({
          title_ar: event.title_ar,
          title_en: event.title_en,
          slug: event.slug,
        }).catch((err) => console.error("[admin-hub] event notification failed:", err));
      } catch (err) {
        console.warn("[admin-hub] notification hook failed:", err);
      }
    }

    return { ok: true, event };
  });

/* =========================================================================
 * 6. Announcements, Media, Galleries, Documents
 * ========================================================================= */

export const getAnnouncementsData = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const res = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    return unwrapRows(res, "الإعلانات / announcements");
  });

export const upsertAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => announcementInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    // `created_by` is stamped only when the row is first created -- sending it
    // on every upsert rewrites the original author to whoever edited last.
    const payload = data.id
      ? { ...data }
      : {
          ...data,
          created_by: context.userId || session?.user?.id || (context.claims?.sub as string),
        };
    const { data: ann, error } = await supabase
      .from("announcements")
      .upsert(payload as never)
      .select()
      .single();
    if (error) throw new Error(error.message);

    if (!data.id && ann.status === "published") {
      try {
        const { notifyMembersOnNewAnnouncement } = await import("@/lib/notifications.server");
        void notifyMembersOnNewAnnouncement({
          title_ar: ann.title_ar,
          title_en: ann.title_en,
          link: "/news",
          type: "announcement",
        }).catch((err) => console.error("[admin-hub] announcement notification failed:", err));
      } catch (err) {
        console.warn("[admin-hub] notification hook failed:", err);
      }
    }

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
      media: unwrapRows(mediaRes, "الوسائط / media"),
      galleries: unwrapRows(galleriesRes, "المعارض / galleries"),
      galleryMedia: unwrapRows(galleryMediaRes, "وسائط المعارض / gallery media"),
      documents: unwrapRows(docsRes, "الوثائق / documents"),
    };
  });

export const registerMediaAsset = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => mediaAssetInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const payload = {
      ...data,
      uploaded_by: context.userId || session?.user?.id || (context.claims?.sub as string),
    };
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
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
      action: "upload",
      entity_type: "media_assets",
      entity_id: asset.id,
      after_data: asset,
    });

    if (!payload.id) {
      try {
        const { notifyContentStaffOnMediaSubmission } = await import("@/lib/notifications.server");
        void notifyContentStaffOnMediaSubmission({
          id: asset.id,
          title_ar: asset.caption_ar || asset.alt_text_ar || "ملف وسائط جديد",
          title_en: asset.caption_en || asset.alt_text_en || "New media asset",
        }).catch((err) => console.error("[admin-hub] media upload notification failed:", err));
      } catch (err) {
        console.warn("[admin-hub] notification hook failed:", err);
      }
    }

    return { ok: true, asset };
  });

export const upsertGallery = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => galleryInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    // Stamp the creator only on insert -- see upsertAnnouncement.
    const payload: Record<string, any> = data.id
      ? { ...data }
      : {
          ...data,
          created_by: context.userId || session?.user?.id || (context.claims?.sub as string),
        };
    await ensureUniqueSlug(supabase as any, "galleries", payload, data.id);
    const { data: gal, error } = await supabase
      .from("galleries")
      .upsert(payload as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, gallery: gal };
  });

/* ---------------- services catalogue (family / establishment) ---------------- */

/** Every service row plus the documents attached to each one. */
export const getServicesAdminData = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const [servicesRes, docsRes] = await Promise.all([
      supabase.from("services").select("*").order("sort_order", { ascending: true }),
      supabase
        .from("documents")
        .select("*")
        .not("service_id", "is", null)
        .order("created_at", { ascending: false }),
    ]);
    return {
      services: unwrapRows(servicesRes, "الخدمات / services"),
      documents: unwrapRows(docsRes, "وثائق الخدمات / service documents"),
    };
  });

export const upsertService = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => serviceInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const payload: Record<string, any> = data.id
      ? { ...data }
      : {
          ...data,
          created_by: context.userId || session?.user?.id || (context.claims?.sub as string),
        };
    await ensureUniqueSlug(supabase as any, "services", payload, data.id);
    const { data: svc, error } = await supabase
      .from("services")
      .upsert(payload as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, service: svc };
  });

export const deleteService = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    // Documents keep their rows; only the service link is cleared so nothing
    // an administrator uploaded is lost when a service is removed.
    await supabase.from("documents").update({ service_id: null }).eq("service_id", data.id);
    const { error } = await supabase.from("services").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteServiceDocument = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("documents").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const upsertDocument = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => documentInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    // Stamp the uploader only on insert -- see upsertAnnouncement.
    const payload = data.id
      ? { ...data }
      : {
          ...data,
          uploaded_by: context.userId || session?.user?.id || (context.claims?.sub as string),
        };
    const { data: doc, error } = await supabase
      .from("documents")
      .upsert(payload as never)
      .select()
      .single();
    if (error) throw new Error(error.message);

    if (!data.id) {
      try {
        const { notifyContentStaffOnMediaSubmission } = await import("@/lib/notifications.server");
        void notifyContentStaffOnMediaSubmission({
          id: doc.id,
          title_ar: doc.title_ar || "وثيقة جديدة",
          title_en: doc.title_en,
        }).catch((err) => console.error("[admin-hub] document upload notification failed:", err));
      } catch (err) {
        console.warn("[admin-hub] notification hook failed:", err);
      }
    }

    return { ok: true, document: doc };
  });

export const deleteGallery = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    // gallery_media rows cascade with the gallery (ON DELETE CASCADE), but
    // their media_assets rows and storage objects don't -- clean those up
    // first so deleting a collection doesn't leave orphaned files/library
    // entries behind. Each museum-archive upload creates a dedicated
    // media_assets row for its one gallery_media link, so it's always safe
    // to remove here.
    const { data: links } = await supabase
      .from("gallery_media")
      .select("media_asset_id, media_assets(bucket, storage_path)")
      .eq("gallery_id", data.id);

    const { data: deleted, error } = await supabase
      .from("galleries")
      .delete()
      .eq("id", data.id)
      .select("id");
    if (error) throw new Error(error.message);
    assertRowsAffected(deleted, "galleries", data.id);

    const assetIds = (links ?? []).map((l: any) => l.media_asset_id).filter(Boolean);
    if (assetIds.length > 0) {
      const byBucket = new Map<string, string[]>();
      for (const l of links ?? []) {
        const asset = (l as any).media_assets;
        if (!asset?.bucket || !asset?.storage_path) continue;
        const arr = byBucket.get(asset.bucket) ?? [];
        arr.push(asset.storage_path);
        byBucket.set(asset.bucket, arr);
      }
      for (const [bucket, paths] of byBucket) {
        await supabase.storage.from(bucket).remove(paths);
      }
      await supabase.from("media_assets").delete().in("id", assetIds);
    }

    await supabase.from("audit_logs").insert({
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
      action: "delete",
      entity_type: "galleries",
      entity_id: data.id,
    });

    return { ok: true };
  });

export const upsertGalleryMedia = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => galleryMediaInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: link, error } = await supabase
      .from("gallery_media")
      .upsert(data as never)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, galleryMedia: link };
  });

export const deleteGalleryMedia = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const { data: link } = await supabase
      .from("gallery_media")
      .select("gallery_id, media_asset_id, media_assets(bucket, storage_path)")
      .eq("id", data.id)
      .single();

    const { data: deleted, error } = await supabase
      .from("gallery_media")
      .delete()
      .eq("id", data.id)
      .select("id");
    if (error) throw new Error(error.message);
    assertRowsAffected(deleted, "gallery_media", data.id);

    // If the gallery had this image set as its cover, clear it rather than
    // leaving cover_media_path pointing at a deleted file.
    if (link?.gallery_id) {
      const asset = (link as any).media_assets;
      if (asset?.storage_path) {
        const { data: gallery } = await supabase
          .from("galleries")
          .select("id, cover_media_path")
          .eq("id", link.gallery_id)
          .single();
        if (gallery?.cover_media_path?.includes(asset.storage_path)) {
          await supabase.from("galleries").update({ cover_media_path: null }).eq("id", gallery.id);
        }
      }
    }

    // Same one-image-one-asset assumption as deleteGallery: safe to remove
    // the underlying media_assets row and storage object with it.
    if (link?.media_asset_id) {
      const asset = (link as any).media_assets;
      if (asset?.bucket && asset?.storage_path) {
        await supabase.storage.from(asset.bucket).remove([asset.storage_path]);
      }
      await supabase.from("media_assets").delete().eq("id", link.media_asset_id);
    }

    await supabase.from("audit_logs").insert({
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
      action: "delete",
      entity_type: "gallery_media",
      entity_id: data.id,
    });

    return { ok: true };
  });

export const updateSortOrder = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => sortOrderUpdateSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    // RLS re-checks private.can_edit per statement, so this is no more
    // privileged than the equivalent one-row-at-a-time edits already allow.
    await Promise.all(
      data.items.map((item) =>
        supabase.from(data.table).update({ sort_order: item.sort_order }).eq("id", item.id),
      ),
    );
    return { ok: true };
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

    const inquiryRows = unwrapRows(inquiriesRes, "الاستفسارات / inquiries").map((row) => ({
      ...row,
      source_table: "inquiries" as const,
    }));

    const contactRows = unwrapRows(contactRes, "رسائل التواصل / contact messages").map((row) => ({
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
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return {
      inquiries: merged,
      notes: unwrapRows(notesRes, "ملاحظات الاستفسارات / inquiry notes"),
    };
  });

export const getInquiriesPaginated = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => paginationSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { page, pageSize, search, status } = data;
    const committeeSlug =
      data.committeeSlug && /^[a-z0-9-]+$/.test(data.committeeSlug) ? data.committeeSlug : "";

    // There is no SQL view for the inquiries + contact_messages union, so the
    // two are merged, sorted and sliced here. The search term is pushed down to
    // Postgres and each side is capped so a growing mailbox cannot drag both
    // tables through the server in full on every keystroke. The term is
    // sanitized first because it is interpolated into a PostgREST `.or()` group.
    const MAX_ROWS_PER_SOURCE = 2000;
    const cleanSearch = search ? sanitizeFilterTerm(search) : "";

    let inquiriesQuery = supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(MAX_ROWS_PER_SOURCE);
    let contactQuery = supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(MAX_ROWS_PER_SOURCE);

    if (committeeSlug) {
      inquiriesQuery = inquiriesQuery.contains("request_metadata", { committee_slug: committeeSlug });
    }

    if (cleanSearch) {
      const term = `%${cleanSearch}%`;
      inquiriesQuery = inquiriesQuery.or(
        `name.ilike.${term},email.ilike.${term},subject.ilike.${term},message.ilike.${term},source.ilike.${term}`,
      );
      contactQuery = contactQuery.or(
        `name.ilike.${term},email.ilike.${term},subject.ilike.${term},message.ilike.${term}`,
      );
    }

    const [inqRes, contactRes] = await Promise.all([
      inquiriesQuery,
      committeeSlug ? Promise.resolve({ data: [], error: null }) : contactQuery,
    ]);

    let all = [
      ...unwrapRows(inqRes, "الاستفسارات / inquiries").map((i) => ({
        ...i,
        source_table: "inquiries" as const,
      })),
      ...unwrapRows(contactRes, "رسائل التواصل / contact messages").map((i) => ({
        ...i,
        source_table: "contact_messages" as const,
      })),
    ];

    if (status && status !== "all") {
      if (status === "in_progress") {
        all = all.filter((i) => i.status === "in_progress" || i.status === "open");
      } else if (status === "resolved") {
        all = all.filter((i) => i.status === "resolved" || i.status === "read");
      } else {
        all = all.filter((i) => i.status === status);
      }
    }

    all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const count = all.length;
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    const paginated = all.slice(from, to);

    return { data: paginated, count, page, pageSize };
  });

export const updateInquiryStatus = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => inquiryStatusUpdateSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    // The admin Inquiries panel shows a merged list of `inquiries` and
    // `contact_messages`; without a row-count check, calling this with a
    // contact_messages id (or any stale id) updates nothing and still reports
    // success, so the row silently keeps its old status in the UI.
    const { data: updated, error } = await supabase
      .from("inquiries")
      .update({ status: data.status, assigned_to: data.assigned_to })
      .eq("id", data.id)
      .select("id");
    if (error) throw new Error(error.message);
    assertRowsAffected(updated, "inquiries", data.id);
    return { ok: true };
  });

export const updateContactMessageStatus = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => contactMessageStatusUpdateSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: updated, error } = await supabase
      .from("contact_messages")
      .update({ status: data.status })
      .eq("id", data.id)
      .select("id");
    if (error) throw new Error(error.message);
    assertRowsAffected(updated, "contact_messages", data.id);
    return { ok: true };
  });

export const addInquiryNote = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => inquiryNoteInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const { data: note, error } = await supabase
      .from("inquiry_notes")
      .insert({
        inquiry_id: data.inquiry_id,
        note: data.note,
        author_id: context.userId || session?.user?.id || (context.claims?.sub as string),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { ok: true, note };
  });

/** Permanently remove a message from the merged Inbox. `contact_messages` has
 *  no DELETE policy for `authenticated` and `inquiries` none either, so the
 *  RLS-bypassing client is used — `requireAdminAuth` above is the boundary. */
export const deleteInquiry = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        source_table: z.enum(["inquiries", "contact_messages"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const actorId = context.userId || (context.claims?.sub as string);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.source_table === "inquiries") {
      // inquiry_notes has a FK to inquiries; clear it first in case the
      // constraint isn't ON DELETE CASCADE.
      await supabaseAdmin.from("inquiry_notes").delete().eq("inquiry_id", data.id);
    }

    const { data: deleted, error } = await supabaseAdmin
      .from(data.source_table)
      .delete()
      .eq("id", data.id)
      .select("id");
    if (error) throw new Error(error.message);
    assertRowsAffected(deleted, data.source_table, data.id);

    await supabaseAdmin.from("audit_logs").insert({
      actor_user_id: actorId,
      action: "delete",
      entity_type: data.source_table,
      entity_id: data.id,
    });

    return { ok: true };
  });

export const getUsersAndRolesData = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;

    const [
      profilesRes,
      rolesRes,
      permissionsRes,
      rolePermissionsRes,
      membershipRequestsRes,
      familyMembersRes,
    ] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
      supabase.from("permissions").select("*"),
      supabase.from("role_permissions").select("*"),
      supabase
        .from("membership_requests")
        .select(
          "id, user_id, status, branch_slug, full_name_ar, full_name_en, email, phone, father_lineage, notes, review_note, reviewed_at, created_at",
        ),
      supabase
        .from("family_members")
        .select("id, first_name_ar, last_name_ar, first_name_en, last_name_en, branch_id, slug")
        .is("deleted_at", null),
    ]);

    return {
      profiles: unwrapRows(profilesRes, "الحسابات / profiles"),
      userRoles: unwrapRows(rolesRes, "الأدوار / user roles"),
      permissions: unwrapRows(permissionsRes, "الصلاحيات / permissions"),
      rolePermissions: unwrapRows(rolePermissionsRes, "صلاحيات الأدوار / role permissions"),
      membershipRequests: unwrapRows(membershipRequestsRes, "طلبات العضوية / membership requests"),
      familyMembers: unwrapRows(familyMembersRes, "أفراد الأسرة / family members"),
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
async function requireCallerCanGrantRole(
  supabase: unknown,
  userId: string,
  role: string,
): Promise<void> {
  if (role !== "super_admin") {
    await requireCallerIsAdmin(supabase, userId);
    return;
  }
  const { data } = await (supabase as any)
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin");
  if (!data || data.length === 0)
    throw new Error("forbidden: only super_admin may grant super_admin");
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
    // 23505 = the (user_id, role) unique constraint, i.e. the user already had
    // this role. That is a no-op rather than a failure, but the audit trail
    // must not claim a grant that never happened.
    const alreadyAssigned = error?.code === "23505";
    if (error && !alreadyAssigned) throw new Error(error.message);

    // If an admin assigned member, admin, or staff role, auto-approve any pending request
    if (data.role === "member" || data.role === "admin" || data.role === "editor") {
      await (supabaseAdmin as any)
        .from("membership_requests")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          review_note: "تم اعتماد العضوية وتعيين الدور مباشرة من قبل الإدارة",
        })
        .eq("user_id", data.user_id)
        .eq("status", "pending");
    }

    await (supabase as any).from("audit_logs").insert({
      actor_user_id: userId,
      action: "role_change",
      entity_type: "user_roles",
      entity_id: data.user_id,
      metadata: { role: data.role, already_assigned: alreadyAssigned },
    });

    if (!alreadyAssigned) {
      try {
        const { notifyMemberOnRoleAssignment } = await import("@/lib/notifications.server");
        void notifyMemberOnRoleAssignment(data.user_id, data.role, "granted").catch((err) =>
          console.error("[admin-hub] role grant notification failed:", err),
        );
      } catch (err) {
        console.warn("[admin-hub] notification hook failed:", err);
      }
    }

    return { ok: true, alreadyAssigned };
  });

export const removeUserRole = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => z.object({ user_id: z.string().uuid(), role: appRoleSchema }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireCallerCanGrantRole(supabase, userId, data.role);

    // Removing the final admin/super_admin permanently locks everyone out of
    // the console: `user_roles` has no INSERT policy for `authenticated`, so
    // nobody left inside the app could ever grant the role back.
    if (data.role === "admin" || data.role === "super_admin") {
      const { data: privileged, error: privilegedError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("role", ["admin", "super_admin"]);
      if (privilegedError) throw new Error(privilegedError.message);
      const remaining = (privileged ?? []).filter(
        (r) => !(r.user_id === data.user_id && (r.role as string) === data.role),
      );
      if (remaining.length === 0) {
        throw new Error(
          "لا يمكن إزالة آخر دور إداري؛ سيؤدي ذلك إلى فقدان الوصول إلى لوحة التحكم نهائياً. " +
            "Refusing to remove the last remaining admin/super_admin role — that would lock everyone out of the console.",
        );
      }
    }

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
      // Diagnostic: a live query at the time this was written confirmed the
      // target role genuinely exists for the intended user, so a "not found"
      // here means the client sent a user_id/role that doesn't match either
      // -- surface exactly what was searched for rather than guessing.
      throw new Error(
        `Role "${data.role}" was not found for user_id "${data.user_id}" (nothing removed). ` +
          `If that user_id looks wrong, the bug is in what the UI sent, not in this delete.`,
      );
    }

    await supabase.from("audit_logs").insert({
      actor_user_id: userId,
      action: "role_change",
      entity_type: "user_roles",
      entity_id: data.user_id,
      metadata: { removed_role: data.role },
    });

    try {
      const { notifyMemberOnRoleAssignment } = await import("@/lib/notifications.server");
      void notifyMemberOnRoleAssignment(data.user_id, data.role, "revoked").catch((err) =>
        console.error("[admin-hub] role revocation notification failed:", err),
      );
    } catch (err) {
      console.warn("[admin-hub] notification hook failed:", err);
    }

    return { ok: true };
  });

export const getAuditLogsData = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const res = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    return unwrapRows(res, "سجل النشاط / audit logs");
  });

export const getSiteSettingsData = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const res = await supabase.from("site_settings").select("*");
    return unwrapRows(res, "إعدادات الموقع / site settings");
  });

export const upsertSiteSetting = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => siteSettingInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const payload: Record<string, any> = {
      ...data,
      updated_by: context.userId || session?.user?.id || (context.claims?.sub as string),
      updated_at: new Date().toISOString(),
    };
    const { data: setting, error } = await supabase
      .from("site_settings")
      .upsert(payload as never, { onConflict: "key" })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
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
      businesses: unwrapRows(bizRes, "المنشآت / businesses"),
      membershipRequests: unwrapRows(reqRes, "طلبات العضوية / membership requests"),
    };
  });

export const upsertBusiness = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => businessInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const payload: Record<string, any> = {
      ...data,
      updated_at: new Date().toISOString(),
    };
    // Stamp the creator only on insert -- see upsertAnnouncement.
    if (!data.id) {
      payload.created_by = context.userId || session?.user?.id || (context.claims?.sub as string);
    }
    await ensureUniqueSlug(supabase as any, "businesses", payload, data.id);
    const { data: biz, error } = await supabase
      .from("businesses")
      .upsert(payload as never)
      .select()
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
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
    const { data: deleted, error } = await supabase
      .from("businesses")
      .delete()
      .eq("id", data.id)
      .select("id");
    if (error) throw new Error(error.message);
    assertRowsAffected(deleted, "businesses", data.id);

    await supabase.from("audit_logs").insert({
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
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

    const targetUserId = req?.user_id;
    if (targetUserId) {
      try {
        const { notifyMemberOnMembershipDecision } = await import("@/lib/notifications.server");
        void notifyMemberOnMembershipDecision(
          targetUserId,
          data.status as "approved" | "rejected",
          data.review_note,
        ).catch((err) => console.error("[admin-hub] membership review notification failed:", err));
      } catch (err) {
        console.warn("[admin-hub] notification hook failed:", err);
      }
    }

    return { ok: true, request: req };
  });

/* =========================================================================
 * 9. Treasury & Contributions Management
 * ========================================================================= */

export const getTreasuryManagementData = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const [contribsRes, configRes] = await Promise.all([
      supabase
        .from("contributions")
        .select("id, amount, status, purpose, method, created_at, user_id, currency"),
      supabase.from("site_settings").select("value").eq("key", "treasury_config").maybeSingle(),
    ]);

    if (contribsRes.error) throw new Error(contribsRes.error.message);
    const contributions = contribsRes.data ?? [];

    const verifiedTotal = contributions
      .filter((c) => c.status === "verified")
      .reduce((sum, c) => sum + Number(c.amount || 0), 0);

    const pendingTotal = contributions
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + Number(c.amount || 0), 0);

    const rejectedTotal = contributions
      .filter((c) => c.status === "rejected")
      .reduce((sum, c) => sum + Number(c.amount || 0), 0);

    const byPurpose: Record<string, { count: number; total: number }> = {};
    for (const c of contributions) {
      if (c.status === "verified") {
        const p = c.purpose?.trim() || "غير محدد / عام";
        if (!byPurpose[p]) byPurpose[p] = { count: 0, total: 0 };
        byPurpose[p].count += 1;
        byPurpose[p].total += Number(c.amount || 0);
      }
    }

    return {
      contributions,
      verifiedTotal,
      pendingTotal,
      rejectedTotal,
      totalCount: contributions.length,
      totals: {
        verified: verifiedTotal,
        pending: pendingTotal,
        count: contributions.length,
      },
      byPurpose,
      treasuryConfig: configRes.data?.value || null,
    };
  });

export const getTreasuryContributionsPaginated = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => paginationSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { page, pageSize, search, status } = data;

    let query = supabase.from("contributions").select("*", { count: "exact" });

    if (search) {
      // Strip LIKE/PostgREST wildcards so a typed "%" or "*" searches for that
      // character instead of silently matching every contributor.
      const term = sanitizeFilterTerm(search).replace(/[%_*\\]/g, "");
      if (term) query = query.ilike("contributor_name", `%${term}%`);
    }
    if (status && status !== "all") {
      // Previously cast straight into `.eq("status", ...)`; an unknown value
      // came back to the admin as a raw Postgres "invalid input value for enum
      // contribution_status" error instead of a validation failure.
      const parsedStatus = contributionStatusSchema.safeParse(status);
      if (!parsedStatus.success) {
        throw new Error(
          `حالة مساهمة غير معروفة: "${status}". Unknown contribution status "${status}".`,
        );
      }
      query = query.eq("status", parsedStatus.data);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const {
      data: contributions,
      count,
      error,
    } = await query.order("created_at", { ascending: false }).range(from, to);
    if (error) throw new Error(error.message);

    return { data: contributions ?? [], count: count ?? 0, page, pageSize };
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
        reviewed_by: context.userId || session?.user?.id || (context.claims?.sub as string),
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
      action: "update",
      entity_type: "contributions",
      entity_id: data.id,
      after_data: updated,
    });

    const targetUserId = updated?.user_id;
    if (targetUserId) {
      try {
        const { notifyMemberOnContributionDecision } = await import("@/lib/notifications.server");
        void notifyMemberOnContributionDecision(
          targetUserId,
          data.status as "verified" | "rejected",
          Number(updated.amount),
          updated.currency || "SAR",
          data.review_note,
        ).catch((err) => console.error("[admin-hub] treasury review notification failed:", err));
      } catch (err) {
        console.warn("[admin-hub] notification hook failed:", err);
      }
    }

    return { ok: true, contribution: updated };
  });

/* =========================================================================
 * 10. Initiatives & Capital Projects Management
 * ========================================================================= */

export const getInitiativesManagementData = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const [initiativesRes, registrationsRes] = await Promise.all([
      supabase.from("initiatives").select("*").order("sort_order", { ascending: true }),
      supabase
        .from("initiative_registrations")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    return {
      initiatives: unwrapRows(initiativesRes, "المبادرات / initiatives"),
      registrations: unwrapRows(registrationsRes, "تسجيلات المبادرات / registrations"),
    };
  });

export const upsertInitiative = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => initiativeInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const payload: Record<string, any> = {
      ...data,
      updated_at: new Date().toISOString(),
    };
    // Stamp the creator only on insert -- see upsertAnnouncement.
    if (!data.id) {
      payload.created_by = context.userId || session?.user?.id || (context.claims?.sub as string);
    }
    await ensureUniqueSlug(supabase as any, "initiatives", payload, data.id);
    const { data: init, error } = await supabase
      .from("initiatives")
      .upsert(payload as never)
      .select()
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
      action: data.id ? "update" : "create",
      entity_type: "initiatives",
      entity_id: init.id,
      after_data: init,
    });

    if (!data.id && init.is_published !== false) {
      try {
        const { notifyMembersOnNewAnnouncement } = await import("@/lib/notifications.server");
        void notifyMembersOnNewAnnouncement({
          title_ar: init.title_ar,
          title_en: init.title_en,
          link: `/initiatives/${init.slug}`,
          type: "initiative",
        }).catch((err) => console.error("[admin-hub] initiative notification failed:", err));
      } catch (err) {
        console.warn("[admin-hub] notification hook failed:", err);
      }
    }

    return { ok: true, initiative: init };
  });

export const deleteInitiative = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const { data: deleted, error } = await supabase
      .from("initiatives")
      .delete()
      .eq("id", data.id)
      .select("id");
    if (error) throw new Error(error.message);
    assertRowsAffected(deleted, "initiatives", data.id);

    await supabase.from("audit_logs").insert({
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
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
      .order("award_year", { ascending: true })
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
      award_year: data.section === "family_competency" ? null : data.award_year,
      updated_at: new Date().toISOString(),
    };
    // Stamp the creator only on insert -- see upsertAnnouncement.
    if (!data.id) {
      payload.created_by = context.userId || session?.user?.id || (context.claims?.sub as string);
    }
    const { data: ach, error } = await supabase
      .from("achievers")
      .upsert(payload as never)
      .select()
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
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
    const { data: deleted, error } = await supabase
      .from("achievers")
      .delete()
      .eq("id", data.id)
      .select("id");
    if (error) throw new Error(error.message);
    assertRowsAffected(deleted, "achievers", data.id);

    await supabase.from("audit_logs").insert({
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
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
      updated_at: new Date().toISOString(),
    };
    // Stamp the creator only on insert -- see upsertAnnouncement.
    if (!data.id) {
      payload.created_by = context.userId || session?.user?.id || (context.claims?.sub as string);
    }
    const { data: lib, error } = await supabase
      .from("library_items")
      .upsert(payload as never)
      .select()
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
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
    const { data: deleted, error } = await supabase
      .from("library_items")
      .delete()
      .eq("id", data.id)
      .select("id");
    if (error) throw new Error(error.message);
    assertRowsAffected(deleted, "library_items", data.id);

    await supabase.from("audit_logs").insert({
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
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
      menus: unwrapRows(menusRes, "القوائم / navigation menus"),
      items: unwrapRows(itemsRes, "عناصر القوائم / navigation items"),
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
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
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
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
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
    const { data: deleted, error } = await supabase
      .from("navigation_items")
      .delete()
      .eq("id", data.id)
      .select("id");
    if (error) throw new Error(error.message);
    assertRowsAffected(deleted, "navigation_items", data.id);

    await supabase.from("audit_logs").insert({
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
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
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
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
    const { data: deleted, error } = await supabase
      .from("event_registrations")
      .delete()
      .eq("id", data.id)
      .select("id");
    if (error) throw new Error(error.message);
    assertRowsAffected(deleted, "event_registrations", data.id);

    await supabase.from("audit_logs").insert({
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
      action: "delete_registration",
      entity_type: "event_registrations",
      entity_id: data.id,
    });

    return { ok: true };
  });

export const updateInitiativeRegistrationStatus = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => initiativeRegistrationUpdateSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const { data: reg, error } = await supabase
      .from("initiative_registrations")
      .update({ status: data.status })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
      action: "update_registration_status",
      entity_type: "initiative_registrations",
      entity_id: data.id,
      after_data: reg,
    });

    return { ok: true, registration: reg };
  });

export const deleteInitiativeRegistration = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, session } = context;
    const { data: deleted, error } = await supabase
      .from("initiative_registrations")
      .delete()
      .eq("id", data.id)
      .select("id");
    if (error) throw new Error(error.message);
    assertRowsAffected(deleted, "initiative_registrations", data.id);

    await supabase.from("audit_logs").insert({
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
      action: "delete_registration",
      entity_type: "initiative_registrations",
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
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
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
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
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
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
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
      actor_user_id: context.userId || session?.user?.id || (context.claims?.sub as string),
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
    const userId = context.userId || session?.user?.id || (context.claims?.sub as string);

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
    const userId = context.userId || session?.user?.id || (context.claims?.sub as string);

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
    const userId = context.userId || session?.user?.id || (context.claims?.sub as string);

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
    const userId = context.userId || session?.user?.id || (context.claims?.sub as string);

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", data.id)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });
