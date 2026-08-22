#!/usr/bin/env node
/**
 * Regenerates public/sitemap.xml from live Supabase data.
 *
 * Runs as a `prebuild` step (see package.json) so every deploy ships a
 * sitemap that includes the current published detail pages — news/$slug,
 * initiatives/$slug, and p/$slug — each with a real <lastmod> derived from
 * the record's own updated_at/published_at, instead of a static file that
 * only lists top-level routes under one fake date.
 *
 * Uses the same public (anon) Supabase client fallbacks as
 * src/lib/supabase-public.server.ts — the publishable key is safe to embed
 * client-side, so it is safe to bake in here too.
 */
import { createClient } from "@supabase/supabase-js";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const DEFAULT_SUPABASE_URL = "https://ywsvittlswbbyqhahorh.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3c3ZpdHRsc3diYnlxaGFob3JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMjgwODcsImV4cCI6MjEwMjkwNDA4N30.TK3AgqMh5vHDzi16S7ILBP7fyIwoKuDDJURjT9r26K4";

const SITE_URL = (
  process.env.VITE_SITE_URL ||
  process.env.SITE_URL ||
  "https://albouabidfamily.com"
).replace(/\/+$/, "");

function getSupabase() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_PUBLISHABLE_KEY;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** ISO date -> YYYY-MM-DD, or null if unparsable/absent. */
function toLastmod(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
}

function latest(...values) {
  const dates = values.map(toLastmod).filter(Boolean);
  if (dates.length === 0) return null;
  return dates.sort().at(-1);
}

function xmlEscape(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  })[c]);
}

function urlEntry(loc, lastmod, changefreq, priority) {
  return [
    "  <url>",
    `    <loc>${xmlEscape(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

async function main() {
  const supabase = getSupabase();
  const today = new Date().toISOString().split("T")[0];

  const [
    { data: newsPosts, error: newsPostsErr },
    { data: articles, error: articlesErr },
    { data: initiatives, error: initiativesErr },
    { data: contentPages, error: contentPagesErr },
  ] = await Promise.all([
    supabase
      .from("news_posts")
      .select("slug, updated_at, created_at")
      .eq("is_published", true),
    supabase
      .from("articles")
      .select("slug, updated_at, published_at, created_at")
      .eq("status", "published")
      .is("deleted_at", null),
    supabase
      .from("initiatives")
      .select("slug, updated_at, created_at")
      .eq("is_published", true),
    supabase
      .from("content_pages")
      .select("slug, updated_at, published_at, no_index, visibility")
      .eq("status", "published")
      .eq("visibility", "public")
      .is("deleted_at", null),
  ]);

  for (const [label, err] of [
    ["news_posts", newsPostsErr],
    ["articles", articlesErr],
    ["initiatives", initiativesErr],
    ["content_pages", contentPagesErr],
  ]) {
    if (err) console.error(`[sitemap] ${label} read failed:`, err.message);
  }

  const newsEntries = [
    ...(newsPosts ?? []).map((r) => ({
      loc: `${SITE_URL}/news/${r.slug}`,
      lastmod: latest(r.updated_at, r.created_at) ?? today,
    })),
    ...(articles ?? []).map((r) => ({
      loc: `${SITE_URL}/news/${r.slug}`,
      lastmod: latest(r.updated_at, r.published_at, r.created_at) ?? today,
    })),
  ];

  const initiativeEntries = (initiatives ?? []).map((r) => ({
    loc: `${SITE_URL}/initiatives/${r.slug}`,
    lastmod: latest(r.updated_at, r.created_at) ?? today,
  }));

  const contentPageEntries = (contentPages ?? [])
    .filter((r) => !r.no_index)
    .map((r) => ({
      loc: `${SITE_URL}/p/${r.slug}`,
      lastmod: latest(r.updated_at, r.published_at) ?? today,
    }));

  // Listing pages get the most recent lastmod among the records they list,
  // so the crawl hint reflects real content changes rather than a fixed date.
  const newsListLastmod = latest(...newsEntries.map((e) => e.lastmod)) ?? today;
  const initiativesListLastmod = latest(...initiativeEntries.map((e) => e.lastmod)) ?? today;

  const staticEntries = [
    { loc: `${SITE_URL}/`, lastmod: today, changefreq: "daily", priority: "1.0" },
    { loc: `${SITE_URL}/about`, lastmod: today, changefreq: "monthly", priority: "0.9" },
    { loc: `${SITE_URL}/foundation`, lastmod: today, changefreq: "monthly", priority: "0.9" },
    { loc: `${SITE_URL}/branches`, lastmod: today, changefreq: "monthly", priority: "0.9" },
    { loc: `${SITE_URL}/family-tree`, lastmod: today, changefreq: "weekly", priority: "0.9" },
    { loc: `${SITE_URL}/dna`, lastmod: today, changefreq: "monthly", priority: "0.8" },
    { loc: `${SITE_URL}/achievers`, lastmod: today, changefreq: "weekly", priority: "0.8" },
    { loc: `${SITE_URL}/initiatives`, lastmod: initiativesListLastmod, changefreq: "weekly", priority: "0.8" },
    { loc: `${SITE_URL}/news`, lastmod: newsListLastmod, changefreq: "daily", priority: "0.8" },
    { loc: `${SITE_URL}/library`, lastmod: today, changefreq: "monthly", priority: "0.7" },
    { loc: `${SITE_URL}/directory`, lastmod: today, changefreq: "weekly", priority: "0.7" },
    { loc: `${SITE_URL}/contribute`, lastmod: today, changefreq: "monthly", priority: "0.7" },
    { loc: `${SITE_URL}/contact`, lastmod: today, changefreq: "monthly", priority: "0.6" },
  ];

  const dynamicUrls = [
    ...newsEntries.map((e) => urlEntry(e.loc, e.lastmod, "monthly", "0.6")),
    ...initiativeEntries.map((e) => urlEntry(e.loc, e.lastmod, "monthly", "0.6")),
    ...contentPageEntries.map((e) => urlEntry(e.loc, e.lastmod, "monthly", "0.5")),
  ];

  const staticUrls = staticEntries.map((e) => urlEntry(e.loc, e.lastmod, e.changefreq, e.priority));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
    ...staticUrls,
    ...dynamicUrls,
  ].join("\n")}\n</urlset>\n`;

  const outPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "public",
    "sitemap.xml",
  );
  await writeFile(outPath, xml, "utf8");
  console.log(
    `[sitemap] wrote ${staticUrls.length} static + ${dynamicUrls.length} dynamic URLs to ${outPath}`,
  );
}

main().catch((err) => {
  console.error("[sitemap] generation failed:", err);
  // Never fail the build over a sitemap regeneration error — fall back to
  // whatever public/sitemap.xml already has on disk.
  process.exit(0);
});
