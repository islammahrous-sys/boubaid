import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  cmsPublishSchema,
  cmsRowRefSchema,
  cmsUpsertSchema,
} from "./cms.schemas";

/* ------------------------------------------------------------------ *
 * Row shapes returned to the client (published, public-safe columns). *
 * ------------------------------------------------------------------ */

export type NewsRow = {
  id: string;
  slug: string;
  section: string;
  title_ar: string;
  title_en: string | null;
  excerpt_ar: string | null;
  excerpt_en: string | null;
  body_ar: string | null;
  body_en: string | null;
  hijri_date: string | null;
  gregorian_date: string | null;
  cover_path: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
};

export type InitiativeRow = {
  id: string;
  slug: string;
  status: string;
  title_ar: string;
  title_en: string | null;
  summary_ar: string | null;
  summary_en: string | null;
  body_ar: string | null;
  body_en: string | null;
  cover_path: string | null;
  is_published: boolean;
  sort_order: number;
};

export type AchieverRow = {
  id: string;
  name_ar: string;
  name_en: string | null;
  field_ar: string | null;
  field_en: string | null;
  achievement_ar: string | null;
  achievement_en: string | null;
  category: string;
  branch_ar: string | null;
  branch_en: string | null;
  image_path: string | null;
  is_published: boolean;
  sort_order: number;
};

export type LibraryRow = {
  id: string;
  collection: string;
  title_ar: string;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  year: number | null;
  kind: string | null;
  reference: string | null;
  file_path: string | null;
  external_url: string | null;
  is_published: boolean;
  sort_order: number;
};

export type BranchRow = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  elder_ar: string | null;
  elder_en: string | null;
  image_path: string | null;
  is_published: boolean;
  sort_order: number;
};

const NEWS_COLS =
  "id, slug, section, title_ar, title_en, excerpt_ar, excerpt_en, body_ar, body_en, hijri_date, gregorian_date, cover_path, is_published, sort_order, created_at";
const INITIATIVE_COLS =
  "id, slug, status, title_ar, title_en, summary_ar, summary_en, body_ar, body_en, cover_path, is_published, sort_order";
const ACHIEVER_COLS =
  "id, name_ar, name_en, field_ar, field_en, achievement_ar, achievement_en, category, branch_ar, branch_en, image_path, is_published, sort_order";
const LIBRARY_COLS =
  "id, collection, title_ar, title_en, description_ar, description_en, year, kind, reference, file_path, external_url, is_published, sort_order";
const BRANCH_COLS =
  "id, slug, name_ar, name_en, description_ar, description_en, elder_ar, elder_en, image_path, is_published, sort_order";

/* ---------------------------- public reads ---------------------------- */

/** Published news — safe for public route loaders (anon SELECT policy). */
export const getPublishedNews = createServerFn({ method: "GET" }).handler(
  async (): Promise<NewsRow[]> => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const { data, error } = await createPublicServerClient()
      .from("news_posts")
      .select(NEWS_COLS)
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      console.error("[cms] news read failed", error.code, error.message);
      return [];
    }
    return (data ?? []) as NewsRow[];
  },
);

export const getPublishedInitiatives = createServerFn({ method: "GET" }).handler(
  async (): Promise<InitiativeRow[]> => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const { data, error } = await createPublicServerClient()
      .from("initiatives")
      .select(INITIATIVE_COLS)
      .order("sort_order", { ascending: true })
      .limit(200);
    if (error) {
      console.error("[cms] initiatives read failed", error.code, error.message);
      return [];
    }
    return (data ?? []) as InitiativeRow[];
  },
);

export const getPublishedAchievers = createServerFn({ method: "GET" }).handler(
  async (): Promise<AchieverRow[]> => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const { data, error } = await createPublicServerClient()
      .from("achievers")
      .select(ACHIEVER_COLS)
      .order("sort_order", { ascending: true })
      .limit(300);
    if (error) {
      console.error("[cms] achievers read failed", error.code, error.message);
      return [];
    }
    return (data ?? []) as AchieverRow[];
  },
);

export const getPublishedLibrary = createServerFn({ method: "GET" }).handler(
  async (): Promise<LibraryRow[]> => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const { data, error } = await createPublicServerClient()
      .from("library_items")
      .select(LIBRARY_COLS)
      .order("sort_order", { ascending: true })
      .limit(300);
    if (error) {
      console.error("[cms] library read failed", error.code, error.message);
      return [];
    }
    return (data ?? []) as LibraryRow[];
  },
);

export const getPublishedBranches = createServerFn({ method: "GET" }).handler(
  async (): Promise<BranchRow[]> => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const { data, error } = await createPublicServerClient()
      .from("branches")
      .select(BRANCH_COLS)
      .order("sort_order", { ascending: true })
      .limit(100);
    if (error) {
      console.error("[cms] branches read failed", error.code, error.message);
      return [];
    }
    return (data ?? []) as BranchRow[];
  },
);

/* ------------------------- secretariat console ------------------------- */

export type CmsOverview = {
  news: NewsRow[];
  initiatives: InitiativeRow[];
  achievers: AchieverRow[];
  library: LibraryRow[];
  branches: BranchRow[];
  canEdit: boolean;
};

/** All rows including drafts — editor/admin RLS policies are the boundary. */
export const getCmsOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CmsOverview> => {
    const { supabase, userId } = context;

    const [roles, news, initiatives, achievers, library, branches] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("news_posts").select(NEWS_COLS).order("created_at", { ascending: false }),
      supabase.from("initiatives").select(INITIATIVE_COLS).order("sort_order"),
      supabase.from("achievers").select(ACHIEVER_COLS).order("sort_order"),
      supabase.from("library_items").select(LIBRARY_COLS).order("sort_order"),
      supabase.from("branches").select(BRANCH_COLS).order("sort_order"),
    ]);

    const roleList = (roles.data ?? []).map((r) => r.role as string);

    return {
      news: (news.data ?? []) as NewsRow[],
      initiatives: (initiatives.data ?? []) as InitiativeRow[],
      achievers: (achievers.data ?? []) as AchieverRow[],
      library: (library.data ?? []) as LibraryRow[],
      branches: (branches.data ?? []) as BranchRow[],
      canEdit: roleList.includes("admin") || roleList.includes("editor"),
    };
  });

type MutationResult = { ok: true; id?: string } | { ok: false; error: string };

const blankToNull = <T extends Record<string, unknown>>(values: T) =>
  Object.fromEntries(
    Object.entries(values).map(([k, v]) => [k, v === "" ? null : v]),
  ) as Record<string, unknown>;

export const upsertCmsRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => cmsUpsertSchema.parse(input))
  .handler(async ({ data, context }): Promise<MutationResult> => {
    const { supabase, userId } = context;
    const { id, ...rest } = data.values as { id?: string } & Record<string, unknown>;
    const payload = blankToNull(rest);

    // The table name is a validated union; the generated per-table row types
    // cannot be narrowed generically, so widen the query builder here.
    const table = supabase.from(data.table) as unknown as {
      update: (v: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<{ error: { code?: string; message: string } | null }> };
      insert: (v: Record<string, unknown>) => { select: (c: string) => { maybeSingle: () => Promise<{ data: { id: string } | null; error: { code?: string; message: string } | null }> } };
    };

    if (id) {
      const { error } = await table.update(payload).eq("id", id);
      if (error) {
        console.error("[cms] update failed", data.table, error.code, error.message);
        return { ok: false, error: error.code === "23505" ? "duplicate_slug" : "update_failed" };
      }
      return { ok: true, id };
    }

    const { data: inserted, error } = await table
      .insert({ ...payload, created_by: userId })
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("[cms] insert failed", data.table, error.code, error.message);
      return { ok: false, error: error.code === "23505" ? "duplicate_slug" : "insert_failed" };
    }
    return { ok: true, id: inserted?.id };
  });

export const setCmsPublished = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => cmsPublishSchema.parse(input))
  .handler(async ({ data, context }): Promise<MutationResult> => {
    const patch: Record<string, unknown> = { is_published: data.is_published };
    if (data.table === "news_posts") {
      patch["published_at"] = data.is_published ? new Date().toISOString() : null;
    }
    const table = context.supabase.from(data.table) as unknown as {
      update: (v: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<{ error: { code?: string; message: string } | null }> };
    };
    const { error } = await table.update(patch).eq("id", data.id);
    if (error) {
      console.error("[cms] publish toggle failed", error.code, error.message);
      return { ok: false, error: "update_failed" };
    }
    return { ok: true };
  });

export const deleteCmsRow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => cmsRowRefSchema.parse(input))
  .handler(async ({ data, context }): Promise<MutationResult> => {
    const { error } = await context.supabase.from(data.table).delete().eq("id", data.id);
    if (error) {
      console.error("[cms] delete failed", error.code, error.message);
      return { ok: false, error: "delete_failed" };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("audit_log").insert({
      actor_id: context.userId,
      action: "content.deleted",
      entity: data.table,
      entity_id: data.id,
    });
    return { ok: true };
  });
