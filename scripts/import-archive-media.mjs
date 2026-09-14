#!/usr/bin/env node
/**
 * Imports photographs (and videos) from locally extracted source folders into
 * existing Archive folders (`galleries` rows with section = 'archive').
 *
 * Unlike scripts/import-museum-archive.mjs, this script does NOT create
 * galleries: the Archive hierarchy is already established in the CMS, so each
 * source folder is mapped explicitly to an existing gallery slug. That keeps
 * "no duplicate folders" guaranteed by construction.
 *
 * Usage:
 *   node scripts/import-archive-media.mjs <root> <folderName>=<gallery-slug> ...
 *
 * where <root>/<folderName>/ holds the media files. Reruns are idempotent:
 * media are keyed by a sha256 content hash stored in
 * media_assets.source_drive_file_id, so already-imported files are skipped.
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (read from .env).
 */
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  const text = readFileSync(path.join(__dirname, "..", ".env"), "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
} catch {
  /* rely on the real environment */
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const [root, ...pairs] = process.argv.slice(2);
if (!root || pairs.length === 0) {
  console.error("Usage: node scripts/import-archive-media.mjs <root> <folder>=<gallery-slug> ...");
  process.exit(1);
}

const BUCKET = "galleries";
const MIME_BY_EXT = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
};

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const sanitize = (name) => name.replace(/[^a-zA-Z0-9.-]/g, "_");

async function galleryBySlug(slug) {
  const { data, error } = await supabase
    .from("galleries")
    .select("id, slug, section, cover_media_path")
    .eq("slug", slug)
    .single();
  if (error) throw new Error(`gallery "${slug}" not found: ${error.message}`);
  if (data.section !== "archive") {
    throw new Error(`refusing to touch gallery "${slug}" (section = ${data.section})`);
  }
  return data;
}

async function importFile(galleryId, filePath, fileName, sortOrder) {
  const buf = await readFile(filePath);
  const key = "sha256:" + createHash("sha256").update(buf).digest("hex");

  const { data: existing } = await supabase
    .from("media_assets")
    .select("id")
    .eq("source_drive_file_id", key)
    .maybeSingle();

  let assetId = existing?.id;
  if (!assetId) {
    const ext = path.extname(fileName).toLowerCase();
    const mime = MIME_BY_EXT[ext] || "application/octet-stream";
    const clean = sanitize(fileName);
    const storagePath = `archive/${galleryId}/${Date.now()}-${clean}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buf, { contentType: mime, cacheControl: "3600" });
    if (upErr) throw upErr;
    const { data: asset, error: insErr } = await supabase
      .from("media_assets")
      .insert({
        bucket: BUCKET,
        storage_path: storagePath,
        file_name: clean,
        original_file_name: fileName,
        mime_type: mime,
        file_size: buf.byteLength,
        source_drive_file_id: key,
      })
      .select("id")
      .single();
    if (insErr) throw insErr;
    assetId = asset.id;
  }

  const { data: link } = await supabase
    .from("gallery_media")
    .select("id")
    .eq("gallery_id", galleryId)
    .eq("media_asset_id", assetId)
    .maybeSingle();
  if (link) return false;

  const { error: linkErr } = await supabase
    .from("gallery_media")
    .insert({ gallery_id: galleryId, media_asset_id: assetId, sort_order: sortOrder, is_published: true });
  if (linkErr) throw linkErr;
  return true;
}

async function setCoverIfMissing(gallery) {
  if (gallery.cover_media_path) return;
  const { data: links } = await supabase
    .from("gallery_media")
    .select("media_asset_id")
    .eq("gallery_id", gallery.id)
    .order("sort_order", { ascending: true });
  for (const link of links ?? []) {
    const { data: asset } = await supabase
      .from("media_assets")
      .select("bucket, storage_path, public_url, mime_type")
      .eq("id", link.media_asset_id)
      .single();
    if (!asset || !asset.mime_type?.startsWith("image/")) continue;
    const url =
      asset.public_url ||
      `${SUPABASE_URL}/storage/v1/object/public/${asset.bucket}/${asset.storage_path}`;
    await supabase.from("galleries").update({ cover_media_path: url }).eq("id", gallery.id);
    return;
  }
}

let uploaded = 0;
let skipped = 0;

for (const pair of pairs) {
  const eq = pair.lastIndexOf("=");
  const folder = pair.slice(0, eq);
  const slug = pair.slice(eq + 1);
  const dir = path.join(root, folder);

  const gallery = await galleryBySlug(slug);
  const files = (await readdir(dir, { withFileTypes: true }))
    .filter((f) => f.isFile() && MIME_BY_EXT[path.extname(f.name).toLowerCase()])
    .sort((a, b) => a.name.localeCompare(b.name, "en"));

  process.stdout.write(`${folder} -> ${slug} (${files.length} file(s)) `);
  for (let i = 0; i < files.length; i++) {
    try {
      const created = await importFile(gallery.id, path.join(dir, files[i].name), files[i].name, i);
      if (created) {
        uploaded++;
        process.stdout.write(".");
      } else {
        skipped++;
        process.stdout.write("-");
      }
    } catch (err) {
      console.error(`\n  failed ${files[i].name}: ${err.message}`);
    }
  }
  await setCoverIfMissing(gallery);
  console.log("");
}

console.log(`\nDone. ${uploaded} newly imported, ${skipped} already present.`);
