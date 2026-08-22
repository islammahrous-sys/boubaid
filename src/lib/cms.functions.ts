import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  cmsPublishSchema,
  cmsRowRefSchema,
  cmsUpsertSchema,
  contentMediaUploadSchema,
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
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();

    const { data: articlesData } = await supabase
      .from("articles")
      .select("id, slug, title_ar, title_en, excerpt_ar, excerpt_en, content_ar, content_en, featured_media_path, status, published_at, created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (articlesData && articlesData.length > 0) {
      const mapped: NewsRow[] = articlesData.map((a: any, idx: number) => ({
        id: a.id,
        slug: a.slug,
        section: "fund",
        title_ar: a.title_ar,
        title_en: a.title_en,
        excerpt_ar: a.excerpt_ar,
        excerpt_en: a.excerpt_en,
        body_ar: a.content_ar,
        body_en: a.content_en,
        // `formatHijri()` on the client expects a bare year, not a
        // pre-formatted string — there's no Gregorian→Hijri conversion
        // available server-side, so this is a placeholder year, not derived
        // from the article's actual publish date.
        hijri_date: "1447",
        gregorian_date: (a.published_at ?? a.created_at)
          ? new Date(a.published_at ?? a.created_at).toISOString().split("T")[0]
          : null,
        cover_path: a.featured_media_path,
        is_published: true,
        sort_order: idx + 1,
        created_at: a.created_at,
      }));
      return withMedia(mapped, [{ from: "cover_path", to: "cover_url" }]);
    }

    const { data, error } = await supabase
      .from("news_posts")
      .select(NEWS_COLS)
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      console.error("[cms] news read failed", error.code, error.message);
      return [];
    }
    return withMedia((data ?? []) as NewsRow[], [{ from: "cover_path", to: "cover_url" }]);
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
    return withMedia((data ?? []) as InitiativeRow[], [{ from: "cover_path", to: "cover_url" }]);
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
    return withMedia((data ?? []) as AchieverRow[], [{ from: "image_path", to: "image_url" }]);
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
    return withMedia((data ?? []) as LibraryRow[], [{ from: "file_path", to: "file_url" }]);
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
    return withMedia((data ?? []) as BranchRow[], [{ from: "image_path", to: "image_url" }]);
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
    await supabaseAdmin.from("audit_log").insert({
      actor_id: actorId,
      action,
      entity,
      entity_id: entityId ?? null,
    });
  } catch (err) {
    console.error("[cms] audit write failed", (err as Error).message);
  }
}

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
    await writeAudit(
      context.userId,
      data.is_published ? "content.published" : "content.unpublished",
      data.table,
      data.id,
    );
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
  .inputValidator((input: unknown) => contentMediaUploadSchema.parse(input))
  .handler(
    async ({ data, context }): Promise<{ ok: true; path: string } | { ok: false; error: string }> => {
      const { supabase, userId } = context;

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      const roleList = (roles ?? []).map((r) => r.role as string);
      if (!roleList.includes("admin") && !roleList.includes("editor")) {
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
});

/**
 * Public Homepage Layout & Sections Config loader from site_settings.
 */
export const getPublicHomepageConfig = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicServerClient } = await import("./supabase-public.server");
  const supabase = createPublicServerClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "homepage_sections_config")
    .maybeSingle();

  return data?.value ?? null;
});

/**
 * Public dynamic page loader from content_pages table by slug.
 */
export const getPublicContentPageBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => z.string().min(1).parse(slug))
  .handler(async ({ data: slug }) => {
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
  });

/**
 * Public Announcements Loader (Active alerts, breaking news, congratulations, condolences).
 */
export const getPublicAnnouncements = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicServerClient } = await import("./supabase-public.server");
  const supabase = createPublicServerClient();

  const { data } = await supabase
    .from("announcements")
    .select("*")
    .or("status.eq.active,status.eq.published")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  return data ?? [];
});

/**
 * Public Site Settings Loader (Contact info, license, WhatsApp, social links).
 */
export const getPublicSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
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
});

/**
 * Public Family History Timeline Loader for /about page.
 */
export const getPublicFamilyHistory = createServerFn({ method: "GET" }).handler(async () => {
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
});

/**
 * Public Global Search across members, news, initiatives, achievers, and documents.
 */
export const getPublicGlobalSearch = createServerFn({ method: "GET" })
  .validator((query: string) => z.string().min(1).max(100).parse(query))
  .handler(async ({ data: query }) => {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const supabase = createPublicServerClient();
    const cleanQuery = query.trim();

    const [membersRes, articlesRes, initiativesRes, achieversRes, libraryRes, branchesRes] = await Promise.all([
      supabase
        .from("family_members")
        .select("id, slug, first_name_ar, last_name_ar, occupation_ar, avatar_path")
        .eq("visibility", "public")
        .or(`first_name_ar.ilike.%${cleanQuery}%,last_name_ar.ilike.%${cleanQuery}%,slug.ilike.%${cleanQuery}%`)
        .limit(6),
      supabase
        .from("articles")
        .select("id, slug, title_ar, excerpt_ar, featured_media_path")
        .eq("status", "published")
        .or(`title_ar.ilike.%${cleanQuery}%,excerpt_ar.ilike.%${cleanQuery}%`)
        .limit(4),
      supabase
        .from("initiatives")
        .select("id, slug, title_ar, excerpt_ar, image_path")
        .or(`title_ar.ilike.%${cleanQuery}%,excerpt_ar.ilike.%${cleanQuery}%`)
        .limit(4),
      supabase
        .from("achievers")
        .select("id, name_ar, field_ar, achievement_ar, image_path")
        .eq("is_published", true)
        .or(`name_ar.ilike.%${cleanQuery}%,field_ar.ilike.%${cleanQuery}%`)
        .limit(4),
      supabase
        .from("library_items")
        .select("id, title_ar, collection, kind, file_path")
        .eq("is_published", true)
        .ilike("title_ar", `%${cleanQuery}%`)
        .limit(4),
      supabase
        .from("branches")
        .select("id, slug, name_ar, elder_ar")
        .or(`name_ar.ilike.%${cleanQuery}%,elder_ar.ilike.%${cleanQuery}%`)
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



