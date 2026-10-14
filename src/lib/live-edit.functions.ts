import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdminAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Publishing for the on-page live editor.
 *
 * Unlike the console's `upsertSiteSetting` (which replaces a whole setting),
 * this merges only the keys the admin changed into `page_texts` / `page_images`
 * on the server, so a live-editor publish never wipes edits made meanwhile in
 * the console or by another admin. Every publish is kept as a revision (with
 * before/after values) in the private `live_editor_history` setting, which
 * powers the panel's history list and one-click rollback.
 */

type Bi = { ar?: string; en?: string };
type TextChange = { before: Bi; after: Bi };
type ImageChange = { before: string | null; after: string | null };

export type LiveRevision = {
  id: string;
  at: string;
  by: string;
  byName?: string | null;
  path?: string | null;
  note?: string | null;
  rollbackOf?: string | null;
  texts: Record<string, TextChange>;
  images: Record<string, ImageChange>;
};

const HISTORY_KEY = "live_editor_history";
const HISTORY_LIMIT = 30;

const textId = z
  .string()
  .max(200)
  .regex(/^[\w-]+:\S+$/, "invalid text id");
const imageId = z
  .string()
  .max(200)
  .regex(/^[\w.-]+$/, "invalid image id");
const textValue = z.string().max(20000).nullable().optional();
const imageUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((u) => /^https:\/\/\S+$/i.test(u) || /^\/(?!\/)\S*$/.test(u), "invalid image url")
  .nullable();

const publishSchema = z.object({
  texts: z.record(textId, z.object({ ar: textValue, en: textValue })).default({}),
  images: z.record(imageId, imageUrl).default({}),
  path: z.string().max(300).optional(),
  note: z.string().trim().max(200).optional(),
});
export type LiveEditPublishInput = z.input<typeof publishSchema>;

type Ctx = { supabase: any; userId: string };

async function readSettings(supabase: any) {
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["page_texts", "page_images", HOMEPAGE_KEY, HISTORY_KEY]);
  if (error) throw new Error(error.message);
  const byKey = new Map<string, any>((data ?? []).map((r: any) => [r.key, r.value]));
  const homepage = byKey.get(HOMEPAGE_KEY);
  return {
    texts: { ...(byKey.get("page_texts") ?? {}) } as Record<string, Bi>,
    images: { ...(byKey.get("page_images") ?? {}) } as Record<string, string>,
    homepage:
      homepage && Array.isArray(homepage.sections)
        ? {
            ...homepage,
            sections: homepage.sections.map((s: Record<string, unknown>) => ({ ...s })),
          }
        : null,
    revisions: (byKey.get(HISTORY_KEY)?.revisions ?? []) as LiveRevision[],
  };
}

const same = (a: Bi, b: Bi) => (a.ar ?? "") === (b.ar ?? "") && (a.en ?? "") === (b.en ?? "");

/** Applies a draft ({ar,en}: string = set, null/"" = clear, undefined = keep) to `before`. */
function applyDraft(before: Bi, draft: { ar?: string | null; en?: string | null }): Bi {
  const after: Bi = { ...before };
  for (const lang of ["ar", "en"] as const) {
    const v = draft[lang];
    if (v === undefined) continue;
    if (v === null || !v.trim()) delete after[lang];
    else after[lang] = v;
  }
  return after;
}

const HOMEPAGE_KEY = "homepage_sections_config";
const HOME_FIELDS = new Set(["badge", "title", "subtitle", "cta_label"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Merges `input` into the stored settings and records the revision. */
async function applyEdits(
  { supabase, userId }: Ctx,
  input: z.output<typeof publishSchema>,
  meta: { rollbackOf?: string },
) {
  const current = await readSettings(supabase);
  const texts = current.texts;
  const images = current.images;
  const revision: LiveRevision = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    by: userId,
    path: input.path ?? null,
    note: input.note ?? null,
    rollbackOf: meta.rollbackOf ?? null,
    texts: {},
    images: {},
  };

  const home = current.homepage;
  let copyChanged = false;
  let homeChanged = false;
  const navDrafts: [string, { ar?: string | null; en?: string | null }][] = [];

  for (const [id, draft] of Object.entries(input.texts)) {
    // Navigation Manager labels → navigation_items (handled below, in one query).
    if (id.startsWith("cms-nav:")) {
      navDrafts.push([id, draft]);
      continue;
    }

    // Homepage Manager section texts → homepage_sections_config. Clearing a
    // field makes the section fall back to its built-in copy, as in the console.
    if (id.startsWith("cms-home:")) {
      const [sectionId, field] = id.slice("cms-home:".length).split(".");
      const sec = home?.sections.find((s: Record<string, unknown>) => s.id === sectionId);
      if (!sec || !HOME_FIELDS.has(field)) continue;
      const before: Bi = {};
      if (sec[`${field}_ar`]) before.ar = sec[`${field}_ar`];
      if (sec[`${field}_en`]) before.en = sec[`${field}_en`];
      const after = applyDraft(before, draft);
      if (same(before, after)) continue;
      for (const lang of ["ar", "en"] as const) {
        if (after[lang]) sec[`${field}_${lang}`] = after[lang];
        else delete sec[`${field}_${lang}`];
      }
      homeChanged = true;
      revision.texts[id] = { before, after };
      continue;
    }

    // Registered page copy → page_texts overrides.
    const before: Bi = { ...texts[id] };
    const after = applyDraft(before, draft);
    if (same(before, after)) continue;
    if (after.ar || after.en) texts[id] = after;
    else delete texts[id];
    copyChanged = true;
    revision.texts[id] = { before, after };
  }

  if (navDrafts.length) {
    const ids = navDrafts.map(([id]) => id.slice("cms-nav:".length)).filter((u) => UUID_RE.test(u));
    const { data: navRows, error: navError } = ids.length
      ? await supabase.from("navigation_items").select("id, label_ar, label_en").in("id", ids)
      : { data: [], error: null };
    if (navError) throw new Error(navError.message);
    for (const [id, draft] of navDrafts) {
      const row = (navRows ?? []).find((r: any) => r.id === id.slice("cms-nav:".length));
      if (!row) continue;
      const before: Bi = { ar: row.label_ar };
      if (row.label_en) before.en = row.label_en;
      // The Arabic label is required: clearing it keeps the current one.
      const after = applyDraft(before, { ...draft, ar: draft.ar?.trim() ? draft.ar : undefined });
      if (same(before, after)) continue;
      const { data: updated, error } = await supabase
        .from("navigation_items")
        .update({ label_ar: after.ar, label_en: after.en ?? null })
        .eq("id", row.id)
        .select("id");
      if (error) throw new Error(error.message);
      if (!updated?.length) throw new Error("Not permitted to update the navigation menu");
      revision.texts[id] = { before, after };
    }
  }

  for (const [id, url] of Object.entries(input.images)) {
    const before = images[id] ?? null;
    const after = url && url.trim() ? url.trim() : null;
    if (before === after) continue;
    if (after) images[id] = after;
    else delete images[id];
    revision.images[id] = { before, after };
  }

  const changed = Object.keys(revision.texts).length + Object.keys(revision.images).length;
  if (!changed) return { changed: 0, revision: null, pageTexts: texts, pageImages: images };

  const now = new Date().toISOString();
  const rows: Record<string, unknown>[] = [];
  if (copyChanged) {
    rows.push({ key: "page_texts", category: "content", value: texts, is_public: true });
  }
  if (homeChanged && home) {
    rows.push({
      key: HOMEPAGE_KEY,
      category: "cms_homepage",
      value: { ...home, updated_at: now },
      is_public: true,
    });
  }
  if (Object.keys(revision.images).length) {
    rows.push({ key: "page_images", category: "media", value: images, is_public: true });
  }
  rows.push({
    key: HISTORY_KEY,
    category: "system",
    value: { revisions: [revision, ...current.revisions].slice(0, HISTORY_LIMIT) },
    is_public: false,
  });
  const { error } = await supabase.from("site_settings").upsert(
    rows.map((r) => ({ ...r, updated_by: userId, updated_at: now })),
    { onConflict: "key" },
  );
  if (error) throw new Error(error.message);

  await supabase.from("audit_logs").insert({
    actor_user_id: userId,
    action: "settings_change",
    entity_type: "site_settings",
    entity_id: "live_editor",
    after_data: {
      revision: revision.id,
      rollback_of: revision.rollbackOf,
      path: revision.path,
      texts: Object.keys(revision.texts),
      images: Object.keys(revision.images),
    },
  });

  return { changed, revision, pageTexts: texts, pageImages: images };
}

export const publishLiveEdits = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => publishSchema.parse(d))
  .handler(async ({ data, context }) => {
    return applyEdits({ supabase: context.supabase, userId: context.userId }, data, {});
  });

export const getLiveEditHistory = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { revisions } = await readSettings(context.supabase);
    const authorIds = [...new Set(revisions.map((r) => r.by).filter(Boolean))];
    const names = new Map<string, string>();
    if (authorIds.length) {
      const { data } = await context.supabase
        .from("profiles")
        .select("id, full_name_ar, full_name_en")
        .in("id", authorIds);
      for (const p of data ?? []) names.set(p.id, p.full_name_ar || p.full_name_en || "");
    }
    return revisions.map((r) => ({ ...r, byName: names.get(r.by) || null }));
  });

/** Restores every value a revision changed to what it was before it, as a new revision. */
export const rollbackLiveRevision = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { revisions } = await readSettings(context.supabase);
    const target = revisions.find((r) => r.id === data.id);
    if (!target) throw new Error("Revision not found");
    const texts: Record<string, { ar: string | null; en: string | null }> = {};
    for (const [id, change] of Object.entries(target.texts)) {
      texts[id] = { ar: change.before.ar ?? null, en: change.before.en ?? null };
    }
    const images: Record<string, string | null> = {};
    for (const [id, change] of Object.entries(target.images)) images[id] = change.before;
    return applyEdits(
      { supabase: context.supabase, userId: context.userId },
      { texts, images, path: target.path ?? undefined, note: undefined },
      { rollbackOf: target.id },
    );
  });
