import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth, requireEditorAuth } from "@/integrations/supabase/auth-middleware";
import {
  cmsPublishSchema,
  cmsRowRefSchema,
  cmsUpsertSchema,
  contentMediaUploadSchema,
  saveContentPageSectionsSchema,
  pageRevisionsQuerySchema,
  restoreRevisionSchema,
  publicGalleryIdSchema,
  publicMemberSpotlightIdSchema,
} from "./cms.schemas";

const SUPABASE_STORAGE_BASE_URL =
  process.env?.SUPABASE_URL ||
  process.env?.VITE_SUPABASE_URL ||
  "https://ywsvittlswbbyqhahorh.supabase.co";


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
  cover_url?: string | null;
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
  cover_url?: string | null;
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
  image_url?: string | null;
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
  file_url?: string | null;
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
  image_url?: string | null;
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

/**
 * Rows carry object paths for media; public consumers need loadable URLs, so
 * every reader signs its media in one batch before returning.
 */
async function withMedia<T extends Record<string, unknown>>(
  rows: T[],
  fields: { from: string; to: string }[],
): Promise<T[]> {
  const { signContentPaths, resolveMedia } = await import("./content-media.server");
  const signed = await signContentPaths(
    rows.flatMap((row) => fields.map((f) => row[f.from] as string | null)),
  );
  return rows.map((row) => {
    const next = { ...row } as Record<string, unknown>;
    for (const f of fields) {
      next[f.to] = resolveMedia(row[f.from] as string | null, signed);
    }
    return next as T;
  });
}

/** Published news — safe for public route loaders (anon SELECT policy). */
export const getPublishedNews = createServerFn({ method: "GET" }).handler(
  async (): Promise<NewsRow[]> => {
    try {
      const { createPublicServerClient } = await import("./supabase-public.server");
      const supabase = createPublicServerClient();

      const [{ data: articlesData }, { data: newsPostsData, error: newsPostsError }] = await Promise.all([
        supabase
          .from("articles")
          .select("id, slug, title_ar, title_en, excerpt_ar, excerpt_en, content_ar, content_en, featured_media_path, status, published_at, created_at")
          .eq("status", "published")
          .order("created_at", { ascending: false }),
        supabase
          .from("news_posts")
          .select(NEWS_COLS)
          .order("sort_order", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(200),
      ]);

      if (newsPostsError) {
        console.error("[cms] news read failed", newsPostsError.code, newsPostsError.message);
      }

      const mappedArticles: NewsRow[] = (articlesData ?? []).map((a: any, idx: number) => ({
        id: a.id,
        slug: a.slug,
        section: "fund",
        title_ar: a.title_ar,
        title_en: a.title_en,
        excerpt_ar: a.excerpt_ar,
        excerpt_en: a.excerpt_en,
        body_ar: a.content_ar,
        body_en: a.content_en,
        hijri_date: "1447",
        gregorian_date: (a.published_at ?? a.created_at)
          ? new Date(a.published_at ?? a.created_at).toISOString().split("T")[0]
          : null,
        cover_path: a.featured_media_path,
        is_published: true,
        sort_order: idx + 1,
        created_at: a.created_at,
      }));

      const merged: NewsRow[] = [...mappedArticles, ...((newsPostsData ?? []) as NewsRow[])].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      return withMedia(merged, [{ from: "cover_path", to: "cover_url" }]);
    } catch (err) {
      console.error("[cms] getPublishedNews caught error", err);
      return [];
    }
  },
);

export const getPublishedInitiatives = createServerFn({ method: "GET" }).handler(
  async (): Promise<InitiativeRow[]> => {
    try {
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
      return withMedia((data ?? []) as InitiativeRow[], [{ from: "cover_path", to: "cover_url" }]);
    } catch (err) {
      console.error("[cms] getPublishedInitiatives caught error", err);
      return [];
    }
  },
);

export const getPublishedAchievers = createServerFn({ method: "GET" }).handler(
  async (): Promise<AchieverRow[]> => {
    try {
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
      return withMedia((data ?? []) as AchieverRow[], [{ from: "image_path", to: "image_url" }]);
    } catch (err) {
      console.error("[cms] getPublishedAchievers caught error", err);
      return [];
    }
  },
);

export const getPublishedLibrary = createServerFn({ method: "GET" }).handler(
  async (): Promise<LibraryRow[]> => {
    try {
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
      return withMedia((data ?? []) as LibraryRow[], [{ from: "file_path", to: "file_url" }]);
    } catch (err) {
      console.error("[cms] getPublishedLibrary caught error", err);
      return [];
    }
  },
);

export const getPublishedBranches = createServerFn({ method: "GET" }).handler(
  async (): Promise<BranchRow[]> => {
    try {
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
      return withMedia((data ?? []) as BranchRow[], [{ from: "image_path", to: "image_url" }]);
    } catch (err) {
      console.error("[cms] getPublishedBranches caught error", err);
      return [];
    }
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

/** Every content mutation leaves a trail; failures here never block the edit. */
async function writeAudit(
  actorId: string,
  action: string,
  entity: string,
  entityId?: string,
): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("audit_logs").insert({
      actor_user_id: actorId,
      action,
      entity_type: entity,
      entity_id: entityId ?? null,
    });
  } catch (err) {
    console.error("[cms] audit write failed", (err as Error).message);
  }
}

export const upsertCmsRow = createServerFn({ method: "POST" })
  .middleware([requireEditorAuth])
  .validator((input: unknown) => cmsUpsertSchema.parse(input))
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
      await writeAudit(userId, "content.updated", data.table, id);
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
    await writeAudit(userId, "content.created", data.table, inserted?.id);
    return { ok: true, id: inserted?.id };
  });


export const setCmsPublished = createServerFn({ method: "POST" })
  .middleware([requireEditorAuth])
  .validator((input: unknown) => cmsPublishSchema.parse(input))
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
    await writeAudit(
      context.userId,
      data.is_published ? "content.published" : "content.unpublished",
      data.table,
      data.id,
    );
    return { ok: true };
  });


export const deleteCmsRow = createServerFn({ method: "POST" })
  .middleware([requireEditorAuth])
  .validator((input: unknown) => cmsRowRefSchema.parse(input))
  .handler(async ({ data, context }): Promise<MutationResult> => {
    const { error } = await context.supabase.from(data.table).delete().eq("id", data.id);
    if (error) {
      console.error("[cms] delete failed", error.code, error.message);
      return { ok: false, error: "delete_failed" };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("audit_logs").insert({
      actor_user_id: context.userId,
      action: "delete",
      entity_type: data.table,
      entity_id: data.id,
    });
    return { ok: true };
  });

/* ---------------------------- media uploads ---------------------------- */

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
};

/**
 * Editors upload cover images, portraits and documents here. The file lands in
 * the private `content` bucket and the returned path is what the row stores.
 */
export const uploadContentMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => contentMediaUploadSchema.parse(input))
  .handler(
    async ({ data, context }): Promise<{ ok: true; path: string } | { ok: false; error: string }> => {
      const { supabase, userId } = context;

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      const roleList = (roles ?? []).map((r) => r.role as string);
      if (!roleList.includes("admin") && !roleList.includes("super_admin") && !roleList.includes("editor")) {
        return { ok: false, error: "forbidden" };
      }

      const ext = EXT_BY_TYPE[data.contentType] ?? "bin";
      const stem =
        data.fileName
          .replace(/\.[^.]+$/, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 60) || "file";
      const path = `${data.folder}/${Date.now()}-${stem}.${ext}`;

      let bytes: Uint8Array;
      try {
        const binary = atob(data.dataBase64);
        bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      } catch {
        return { ok: false, error: "upload_failed" };
      }

      const { uploadContentFile } = await import("./content-media.server");
      return uploadContentFile(path, bytes, data.contentType);
    },
  );

/**
 * Public DNA studies data loader from site_settings table.
 */
export const getPublicDnaStudiesData = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicServerClient } = await import("./supabase-public.server");
  const supabase = createPublicServerClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "dna_studies_data")
    .maybeSingle();

  return data?.value ?? null;
});

/**
 * Public Family Tree data loader from Supabase.
 */
export const getPublicFamilyTreeData = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();
    const [membersRes, branchesRes, relationshipsRes] = await Promise.all([
      supabase.from("family_members").select("*").order("generation", { ascending: true }),
      supabase.from("branches").select("*").order("sort_order", { ascending: true }),
      supabase.from("family_relationships").select("*"),
    ]);

    return {
      members: membersRes.data ?? [],
      branches: branchesRes.data ?? [],
      relationships: relationshipsRes.data ?? [],
    };
  } catch (err) {
    console.error("[cms] getPublicFamilyTreeData error", err);
    return { members: [], branches: [], relationships: [] };
  }
});

/**
 * Public Homepage Layout & Sections Config loader from site_settings.
 */
export const getPublicHomepageConfig = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "homepage_sections_config")
      .maybeSingle();

    return data?.value ?? null;
  } catch (err) {
    console.error("[cms] getPublicHomepageConfig error", err);
    return null;
  }
});

/**
 * Public dynamic page loader from content_pages table by slug.
 */
export const getPublicContentPageBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => z.string().min(1).parse(slug))
  .handler(async ({ data: slug }) => {
    try {
      const { createPublicServerClient } = await import("./supabase-public.server");
      const supabase = createPublicServerClient();

      const [{ data: bySlug }, { data: bySlugAr }] = await Promise.all([
        supabase.from("content_pages").select("*").eq("slug", slug).eq("status", "published").maybeSingle(),
        supabase.from("content_pages").select("*").eq("slug_ar", slug).eq("status", "published").maybeSingle(),
      ]);
      const page = bySlug ?? bySlugAr;

      if (!page) return null;

      const { data: sections } = await supabase
        .from("content_sections")
        .select("*")
        .eq("page_id", page.id)
        .order("sort_order", { ascending: true });

      return {
        page,
        sections: sections ?? [],
      };
    } catch (err) {
      console.error("[cms] getPublicContentPageBySlug error", err);
      return null;
    }
  });

/**
 * Public Announcements Loader (Active alerts, breaking news, congratulations, condolences).
 */
export const getPublicAnnouncements = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();

    const { data } = await supabase
      .from("announcements")
      .select("*")
      .or("status.eq.active,status.eq.published")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    return data ?? [];
  } catch (err) {
    console.error("[cms] getPublicAnnouncements error", err);
    return [];
  }
});

/**
 * Public Site Settings Loader (Contact info, license, WhatsApp, social links).
 */
export const getPublicSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();

    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .eq("is_public", true);

    const settingsMap: Record<string, any> = {};
    if (data) {
      for (const item of data) {
        settingsMap[item.key] = item.value;
      }
    }

    return settingsMap;
  } catch (err) {
    console.error("[cms] getPublicSiteSettings error", err);
    return {};
  }
});

/**
 * Public Family History Timeline Loader for /about page.
 */
export const getPublicFamilyHistory = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();

    const [historyRes, placesRes] = await Promise.all([
      supabase
        .from("family_history_entries")
        .select("*")
        .eq("visibility", "public")
        .order("sort_order", { ascending: true }),
      supabase.from("places").select("*"),
    ]);

    return {
      history: historyRes.data ?? [],
      places: placesRes.data ?? [],
    };
  } catch (err) {
    console.error("[cms] getPublicFamilyHistory error", err);
    return { history: [], places: [] };
  }
});

/**
 * Public Global Search across members, news, initiatives, achievers, and documents.
 */
export const getPublicGlobalSearch = createServerFn({ method: "GET" })
  .validator((query: string) => z.string().min(1).max(100).parse(query))
  .handler(async ({ data: query }) => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();
    // `.or(...)` builds a raw PostgREST filter string where `,` separates
    // conditions and `(` `)` nest logical groups. Left unescaped, user input
    // containing those characters could append or restructure filter
    // clauses (e.g. smuggling in an extra condition). Strip them so the
    // query text can only ever land inside the intended ilike value slots.
    const cleanQuery = query.trim().replace(/[,()]/g, "");

    const [membersRes, articlesRes, initiativesRes, achieversRes, libraryRes, branchesRes] = await Promise.all([
      supabase
        .from("family_members")
        .select("id, slug, first_name_ar, last_name_ar, first_name_en, last_name_en, occupation_ar, avatar_path")
        .eq("visibility", "public")
        .or(
          `first_name_ar.ilike.%${cleanQuery}%,last_name_ar.ilike.%${cleanQuery}%,first_name_en.ilike.%${cleanQuery}%,last_name_en.ilike.%${cleanQuery}%,slug.ilike.%${cleanQuery}%`,
        )
        .limit(6),
      supabase
        .from("articles")
        .select("id, slug, title_ar, excerpt_ar, title_en, excerpt_en, featured_media_path")
        .eq("status", "published")
        .or(`title_ar.ilike.%${cleanQuery}%,excerpt_ar.ilike.%${cleanQuery}%,title_en.ilike.%${cleanQuery}%,excerpt_en.ilike.%${cleanQuery}%`)
        .limit(4),
      supabase
        .from("initiatives")
        .select("id, slug, title_ar, summary_ar, title_en, summary_en, cover_path")
        .or(`title_ar.ilike.%${cleanQuery}%,summary_ar.ilike.%${cleanQuery}%,title_en.ilike.%${cleanQuery}%,summary_en.ilike.%${cleanQuery}%`)
        .limit(4),
      supabase
        .from("achievers")
        .select("id, name_ar, field_ar, achievement_ar, name_en, field_en, image_path")
        .eq("is_published", true)
        .or(`name_ar.ilike.%${cleanQuery}%,field_ar.ilike.%${cleanQuery}%,name_en.ilike.%${cleanQuery}%,field_en.ilike.%${cleanQuery}%`)
        .limit(4),
      supabase
        .from("library_items")
        .select("id, title_ar, title_en, collection, kind, file_path")
        .eq("is_published", true)
        .or(`title_ar.ilike.%${cleanQuery}%,title_en.ilike.%${cleanQuery}%`)
        .limit(4),
      supabase
        .from("branches")
        .select("id, slug, name_ar, elder_ar, name_en, elder_en")
        .or(`name_ar.ilike.%${cleanQuery}%,elder_ar.ilike.%${cleanQuery}%,name_en.ilike.%${cleanQuery}%,elder_en.ilike.%${cleanQuery}%`)
        .limit(4),
    ]);

    return {
      members: membersRes.data ?? [],
      articles: articlesRes.data ?? [],
      initiatives: initiativesRes.data ?? [],
      achievers: achieversRes.data ?? [],
      library: libraryRes.data ?? [],
      branches: branchesRes.data ?? [],
    };
  });

/**
 * Public Navigation Loader — reads the CMS-managed `navigation_menus` /
 * `navigation_items` tables so edits made in the admin Navigation Manager
 * take effect on the live site. Only top-level (parent_id is null), public
 * items are returned, per menu `code`, ordered by `sort_order`.
 *
 * Callers should treat an empty array for a given menu code as "not
 * configured" and fall back to the static defaults in `@/content/navigation`.
 */
export type PublicNavItem = {
  to: string;
  label: { ar: string; en: string };
  children?: PublicNavItem[];
};

export const getPublicNavigation = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();

    const [menusRes, itemsRes] = await Promise.all([
      supabase.from("navigation_menus").select("id, code"),
      supabase
        .from("navigation_items")
        .select("id, menu_id, label_ar, label_en, url, parent_id, sort_order, visibility")
        .eq("visibility", "public")
        .order("sort_order", { ascending: true }),
    ]);

    const menusByCode = new Map((menusRes.data ?? []).map((m) => [m.id, m.code]));
    const byCode: Record<string, PublicNavItem[]> = {};

    // Group all items by menu_id
    const itemsByMenu = new Map<
      string,
      Array<{
        id: string;
        menu_id: string;
        label_ar: string;
        label_en: string | null;
        url: string;
        parent_id: string | null;
        sort_order: number;
      }>
    >();

    for (const item of itemsRes.data ?? []) {
      const list = itemsByMenu.get(item.menu_id) ?? [];
      list.push(item);
      itemsByMenu.set(item.menu_id, list);
    }

    for (const [menuId, menuItems] of itemsByMenu.entries()) {
      const code = menusByCode.get(menuId);
      if (!code) continue;

      const topLevel = menuItems.filter((i) => !i.parent_id);
      const structured: PublicNavItem[] = [];

      for (const top of topLevel) {
        const subItems = menuItems
          .filter((i) => i.parent_id === top.id)
          .map((sub) => ({
            to: sub.url,
            label: { ar: sub.label_ar, en: sub.label_en || sub.label_ar },
          }));

        structured.push({
          to: top.url,
          label: { ar: top.label_ar, en: top.label_en || top.label_ar },
          ...(subItems.length > 0 ? { children: subItems } : {}),
        });
      }

      byCode[code] = structured;
    }

    return byCode;
  } catch (err) {
    console.error("[cms] getPublicNavigation error", err);
    return {} as Record<string, PublicNavItem[]>;
  }
});

/* ========================================================================
 * Page Builder block data — gallery embed & member spotlight
 *
 * Both back a Page Builder block type (BlockRegistry.tsx) with real rows
 * from tables that already carry public SELECT policies (`galleries` /
 * `gallery_media` / `media_assets` and `family_members`), so the public
 * renderer (routes/p.$slug.tsx) never needs elevated privileges to hydrate
 * these blocks.
 * ======================================================================== */

export type PublicGalleryMediaItem = {
  id: string;
  url: string;
  caption_ar: string | null;
  caption_en: string | null;
  width: number | null;
  height: number | null;
};

export type PublicGallery = {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string | null;
  media: PublicGalleryMediaItem[];
};

/** Resolves a media_assets row to a loadable URL — mirrors MediaLibrary.tsx's
 *  client-side `getPublicUrl` fallback (assets live in public buckets, keyed
 *  by their own `bucket` column, unlike the private `content` bucket used
 *  elsewhere in this file). */
function mediaAssetUrl(asset: { bucket: string; storage_path: string; public_url: string | null }): string {
  return asset.public_url || `${SUPABASE_STORAGE_BASE_URL}/storage/v1/object/public/${asset.bucket}/${asset.storage_path}`;
}

/** Public gallery block data — a published, public-visibility gallery and its ordered media. */
export const getPublicGallery = createServerFn({ method: "GET" })
  .validator((galleryId: string) => publicGalleryIdSchema.parse(galleryId))
  .handler(async ({ data: galleryId }): Promise<PublicGallery | null> => {
    try {
      const { createPublicServerClient } = await import("./supabase-public.server");
      const supabase = createPublicServerClient();

      const { data: gallery } = await supabase
        .from("galleries")
        .select("id, slug, title_ar, title_en")
        .eq("id", galleryId)
        .eq("status", "published")
        .eq("visibility", "public")
        .maybeSingle();
      if (!gallery) return null;

      const { data: links } = await supabase
        .from("gallery_media")
        .select("media_asset_id, caption_ar, caption_en, sort_order")
        .eq("gallery_id", galleryId)
        .order("sort_order", { ascending: true });

      const assetIds = [...new Set((links ?? []).map((l) => l.media_asset_id))];
      if (assetIds.length === 0) return { ...gallery, media: [] };

      const { data: assets } = await supabase
        .from("media_assets")
        .select("id, bucket, storage_path, public_url, width, height, caption_ar, caption_en")
        .in("id", assetIds);

      const assetsById = new Map((assets ?? []).map((a) => [a.id, a]));

      const media = (links ?? [])
        .map((l): PublicGalleryMediaItem | null => {
          const asset = assetsById.get(l.media_asset_id);
          if (!asset) return null;
          return {
            id: asset.id,
            url: mediaAssetUrl(asset),
            caption_ar: l.caption_ar ?? asset.caption_ar,
            caption_en: l.caption_en ?? asset.caption_en,
            width: asset.width,
            height: asset.height,
          };
        })
        .filter((m): m is PublicGalleryMediaItem => m !== null);

      return { ...gallery, media };
    } catch (err) {
      console.error("[cms] getPublicGallery error", err);
      return null;
    }
  });

/** Editor-only picker list for the gallery block (id + title, no media payload). */
export const listGalleriesForEditor = createServerFn({ method: "GET" })
  .middleware([requireEditorAuth])
  .handler(async (): Promise<{ id: string; title_ar: string; title_en: string | null }[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("galleries")
      .select("id, title_ar, title_en")
      .order("sort_order", { ascending: true })
      .limit(200);
    if (error) {
      console.error("[cms] listGalleriesForEditor failed", error.code, error.message);
      return [];
    }
    return data ?? [];
  });

export type PublicMemberSpotlight = {
  id: string;
  slug: string;
  display_name_ar: string;
  display_name_en: string | null;
  occupation_ar: string | null;
  occupation_en: string | null;
  biography_ar: string | null;
  biography_en: string | null;
  avatar_url: string | null;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Public member-spotlight block data — one published, public-visibility family member by id or slug. */
export const getPublicMemberSpotlight = createServerFn({ method: "GET" })
  .validator((memberIdOrSlug: string) => publicMemberSpotlightIdSchema.parse(memberIdOrSlug))
  .handler(async ({ data: memberIdOrSlug }): Promise<PublicMemberSpotlight | null> => {
    try {
      const { createPublicServerClient } = await import("./supabase-public.server");
      const supabase = createPublicServerClient();

      const cols =
        "id, slug, display_name_ar, display_name_en, first_name_ar, last_name_ar, first_name_en, last_name_en, occupation_ar, occupation_en, biography_ar, biography_en, avatar_path";

      const base = supabase
        .from("family_members")
        .select(cols)
        .eq("visibility", "public")
        .eq("status", "published")
        .is("deleted_at", null);

      const { data } = UUID_RE.test(memberIdOrSlug)
        ? await base.eq("id", memberIdOrSlug).maybeSingle()
        : await base.eq("slug", memberIdOrSlug).maybeSingle();

      if (!data) return null;

      const fullNameAr = data.display_name_ar || `${data.first_name_ar} ${data.last_name_ar}`.trim();
      const fullNameEn =
        data.display_name_en || (data.first_name_en ? `${data.first_name_en} ${data.last_name_en ?? ""}`.trim() : null);

      return {
        id: data.id,
        slug: data.slug,
        display_name_ar: fullNameAr,
        display_name_en: fullNameEn,
        occupation_ar: data.occupation_ar,
        occupation_en: data.occupation_en,
        biography_ar: data.biography_ar,
        biography_en: data.biography_en,
        // avatar_path already stores a full public storage URL (see
        // FamilyMemberFormDialog's upload flow) — no signing needed here.
        avatar_url: data.avatar_path,
      };
    } catch (err) {
      console.error("[cms] getPublicMemberSpotlight error", err);
      return null;
    }
  });

/* ========================================================================
 * Page Builder — atomic section save & revision restore
 *
 * Both bridge to Postgres functions (migration
 * 20260822070000_atomic_content_page_sections.sql) that run the
 * delete-then-insert of content_sections inside a single PL/pgSQL function
 * call, i.e. a single implicit transaction: a failure partway through rolls
 * back the whole call instead of leaving the page's sections half-deleted.
 * Both RPCs are SECURITY INVOKER, so they run as the calling (authenticated)
 * user and stay fully subject to the existing `*_editor_all` RLS policies —
 * this bridge grants no privilege the caller didn't already have.
 * ======================================================================== */

export type ContentSectionRow = {
  id: string;
  page_id: string;
  type: string;
  sort_order: number;
  data: Record<string, any>;
  settings: Record<string, any>;
  visibility: string;
};

/**
 * Both RPCs were added by migration 20260822070000 and aren't in the
 * generated `Database` type (src/integrations/supabase/types.ts is
 * regenerated from the live schema separately from this task), so `.rpc()`
 * is called through a narrow, explicitly-typed wrapper here rather than
 * widening the whole `supabase` client.
 */
type SectionsRpcClient = {
  rpc: (
    fn: "replace_content_page_sections" | "restore_content_revision",
    args: Record<string, unknown>,
  ) => Promise<{ data: ContentSectionRow[] | null; error: { code?: string; message: string } | null }>;
};

/** Atomically replaces every content_sections row for a page. */
export const saveContentPageSectionsAtomic = createServerFn({ method: "POST" })
  .middleware([requireEditorAuth])
  .validator((input: unknown) => saveContentPageSectionsSchema.parse(input))
  .handler(async ({ data, context }): Promise<{ ok: true; sections: ContentSectionRow[] } | { ok: false; error: string }> => {
    const rpcClient = context.supabase as unknown as SectionsRpcClient;
    const { data: rows, error } = await rpcClient.rpc("replace_content_page_sections", {
      p_page_id: data.page_id,
      p_sections: data.sections,
    });
    if (error) {
      console.error("[cms] saveContentPageSectionsAtomic failed", error.code, error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true, sections: rows ?? [] };
  });

export type PageRevisionSummary = {
  id: string;
  version: number;
  change_summary: string | null;
  created_at: string;
  created_by: string | null;
};

/** Revision history for one page, newest first — powers the Page Builder's restore panel. */
export const listPageRevisions = createServerFn({ method: "GET" })
  .middleware([requireEditorAuth])
  .validator((input: unknown) => pageRevisionsQuerySchema.parse(input))
  .handler(async ({ data, context }): Promise<PageRevisionSummary[]> => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("content_revisions")
      .select("id, version, change_summary, created_at, created_by")
      .eq("content_page_id", data.page_id)
      .order("version", { ascending: false })
      .limit(50);
    if (error) {
      console.error("[cms] listPageRevisions failed", error.code, error.message);
      return [];
    }
    return rows ?? [];
  });

/** Restores a page's content_sections from a chosen revision's snapshot (atomically), then records the restore as a new revision. */
export const restorePageRevision = createServerFn({ method: "POST" })
  .middleware([requireEditorAuth])
  .validator((input: unknown) => restoreRevisionSchema.parse(input))
  .handler(async ({ data, context }): Promise<{ ok: true; sections: ContentSectionRow[] } | { ok: false; error: string }> => {
    const rpcClient = context.supabase as unknown as SectionsRpcClient;
    const { data: rows, error } = await rpcClient.rpc("restore_content_revision", {
      p_revision_id: data.revision_id,
    });
    if (error) {
      console.error("[cms] restorePageRevision failed", error.code, error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true, sections: (rows ?? []) as ContentSectionRow[] };
  });



