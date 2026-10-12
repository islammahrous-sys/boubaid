#!/usr/bin/env node
/**
 * Imports the Museum Archive Gallery's source photos from a locally
 * exported copy of the Google Drive "The Meusium" folder into Supabase.
 *
 * Why local export + a script, not a live Drive sync: the archive is ~28
 * folders of historical photos (hundreds of images). There's no
 * programmatic access to this project's Google Drive from a plain Node
 * script (that access only exists inside the assistant's own chat tools),
 * so the supported path is: export the folder from Drive as a ZIP, extract
 * it, then run this script against the extracted directory.
 *
 * Layout expected (mirrors the Drive structure exactly):
 *   <root>/
 *     <collection folder name>/
 *       image1.jpg
 *       image2.jpeg
 *       ...
 *     <another collection folder name>/
 *       ...
 *
 * Each immediate subfolder of <root> becomes one `galleries` row (a Museum
 * Archive collection); each image inside it becomes one `media_assets` row
 * plus one `gallery_media` link row, exactly like the CMS's own bulk
 * uploader creates them (src/components/console/museum/MuseumArchiveManager.tsx)
 * -- so everything imported here is immediately editable there.
 *
 * Idempotent reruns: a real Google Drive file/folder id isn't available
 * from a manually exported ZIP, so this script derives its own stable keys
 * instead (stored in the `source_drive_folder_id` / `source_drive_file_id`
 * columns, despite the "drive" name):
 *   - collection key  = the folder name itself
 *   - image key       = "sha256:<hex>" of the file's bytes
 * A content hash survives re-exports/renames better than a path would, and
 * means uploading the same photo into two different collections is treated
 * as two distinct images (each gets its own key: hash is per (won't dedupe
 * cross-collection) -- that's intentional, matching "do not merge images
 * from different folders" in the feature spec.
 * Rerunning this script only uploads files it hasn't seen before; existing
 * collections/images are left untouched (title/description edits made in
 * the CMS afterward are never overwritten by a rerun).
 *
 * Usage:
 *   node scripts/import-museum-archive.mjs "C:\path\to\extracted\The Meusium"
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY -- read from this
 * repo's .env if present, or from the environment (e.g. `node --env-file=.env`).
 */
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadDotEnvFallback() {
  const envPath = path.join(__dirname, "..", ".env");
  try {
    const text = readFileSync(envPath, "utf8");
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
    // no .env file -- rely on the real environment
  }
}

loadDotEnvFallback();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Set them in .env or the environment.",
  );
  process.exit(1);
}

const rootArg = process.argv[2];
if (!rootArg) {
  console.error("Usage: node scripts/import-museum-archive.mjs <path-to-extracted-folder>");
  process.exit(1);
}
const root = path.resolve(rootArg);

const BUCKET = "galleries";
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const MIME_BY_EXT = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function slugify(input, fallbackIndex) {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  // Arabic folder names (the common case here) don't survive the ASCII
  // slugify above -- fall back to a stable, still-unique numbered slug
  // rather than a meaningless hash. Admins can rename it in the CMS.
  return base || `museum-collection-${fallbackIndex + 1}`;
}

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9.-]/g, "_");
}

async function hashFile(filePath) {
  const buf = await readFile(filePath);
  return "sha256:" + createHash("sha256").update(buf).digest("hex");
}

async function ensureCollection(folderName, index) {
  const sourceKey = folderName;

  const { data: existing, error: findErr } = await supabase
    .from("galleries")
    .select("id, slug")
    .eq("source_drive_folder_id", sourceKey)
    .maybeSingle();
  if (findErr) throw findErr;
  if (existing) return existing;

  const slug = slugify(folderName, index);
  const { data: created, error: insertErr } = await supabase
    .from("galleries")
    .insert({
      slug,
      title_ar: folderName,
      title_en: null,
      // Imported as a draft on purpose -- an admin reviews and publishes
      // each collection from the CMS rather than it going live unreviewed.
      status: "draft",
      visibility: "public",
      sort_order: index,
      source_drive_folder_id: sourceKey,
    })
    .select("id, slug")
    .single();
  if (insertErr) throw insertErr;
  console.log(`  + created collection "${folderName}" -> /museum/archive/${created.slug}`);
  return created;
}

async function ensureImage(galleryId, filePath, fileName, sortOrder) {
  const sourceKey = await hashFile(filePath);

  const { data: existingAsset, error: findErr } = await supabase
    .from("media_assets")
    .select("id")
    .eq("source_drive_file_id", sourceKey)
    .maybeSingle();
  if (findErr) throw findErr;

  let assetId = existingAsset?.id;

  if (!assetId) {
    const buf = await readFile(filePath);
    const ext = path.extname(fileName).toLowerCase();
    const cleanName = sanitizeFileName(fileName);
    const storagePath = `museum/archive/${galleryId}/${Date.now()}-${cleanName}`;

    const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(storagePath, buf, {
      contentType: MIME_BY_EXT[ext] || "application/octet-stream",
      cacheControl: "3600",
    });
    if (uploadErr) throw uploadErr;

    const { data: asset, error: insertErr } = await supabase
      .from("media_assets")
      .insert({
        bucket: BUCKET,
        storage_path: storagePath,
        file_name: cleanName,
        original_file_name: fileName,
        mime_type: MIME_BY_EXT[ext] || "application/octet-stream",
        file_size: buf.byteLength,
        source_drive_file_id: sourceKey,
      })
      .select("id")
      .single();
    if (insertErr) throw insertErr;
    assetId = asset.id;
  }

  const { data: existingLink } = await supabase
    .from("gallery_media")
    .select("id")
    .eq("gallery_id", galleryId)
    .eq("media_asset_id", assetId)
    .maybeSingle();
  if (existingLink) return { created: false };

  const { error: linkErr } = await supabase.from("gallery_media").insert({
    gallery_id: galleryId,
    media_asset_id: assetId,
    sort_order: sortOrder,
    is_published: true,
  });
  if (linkErr) throw linkErr;
  return { created: true };
}

async function setCoverIfMissing(galleryId) {
  const { data: gallery } = await supabase
    .from("galleries")
    .select("cover_media_path")
    .eq("id", galleryId)
    .single();
  if (gallery?.cover_media_path) return;

  const { data: firstLink } = await supabase
    .from("gallery_media")
    .select("media_asset_id")
    .eq("gallery_id", galleryId)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!firstLink) return;

  const { data: asset } = await supabase
    .from("media_assets")
    .select("bucket, storage_path, public_url")
    .eq("id", firstLink.media_asset_id)
    .single();
  if (!asset) return;

  const url =
    asset.public_url ||
    `${SUPABASE_URL}/storage/v1/object/public/${asset.bucket}/${asset.storage_path}`;
  await supabase.from("galleries").update({ cover_media_path: url }).eq("id", galleryId);
}

async function main() {
  const rootStat = await stat(root).catch(() => null);
  if (!rootStat || !rootStat.isDirectory()) {
    console.error(`Not a directory: ${root}`);
    process.exit(1);
  }

  const entries = await readdir(root, { withFileTypes: true });
  const folders = entries
    .filter((e) => e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  console.log(`Found ${folders.length} collection folder(s) under ${root}\n`);

  let totalUploaded = 0;
  let totalSkipped = 0;

  for (let i = 0; i < folders.length; i++) {
    const folder = folders[i];
    const folderPath = path.join(root, folder.name);
    console.log(`[${i + 1}/${folders.length}] ${folder.name}`);

    const collection = await ensureCollection(folder.name, i);

    const files = (await readdir(folderPath, { withFileTypes: true }))
      .filter((f) => f.isFile() && IMAGE_EXTENSIONS.has(path.extname(f.name).toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));

    for (let j = 0; j < files.length; j++) {
      const filePath = path.join(folderPath, files[j].name);
      try {
        const result = await ensureImage(collection.id, filePath, files[j].name, j);
        if (result.created) {
          totalUploaded++;
          process.stdout.write(".");
        } else {
          totalSkipped++;
          process.stdout.write("-");
        }
      } catch (err) {
        console.error(`\n    failed: ${files[j].name}: ${err.message}`);
      }
    }
    console.log(` (${files.length} image file(s) found)`);

    await setCoverIfMissing(collection.id);
  }

  console.log(
    `\nDone. ${totalUploaded} image(s) newly imported, ${totalSkipped} already present and skipped.`,
  );
  console.log(
    "Collections were imported as drafts -- review and publish them from Admin \u2192 Museum Archive Gallery.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
