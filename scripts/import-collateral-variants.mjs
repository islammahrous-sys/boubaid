#!/usr/bin/env node
/**
 * Publishes the nine official gold, clay, and copper collateral variants.
 * Originals remain unchanged; generated first-page images are previews only.
 *
 * Idempotent: media_assets are keyed by storage_path and library_items by
 * reference, so reruns update rather than duplicate records.
 *
 * Usage: bun scripts/import-collateral-variants.mjs <sourceDir> <previewDir>
 */
import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const BUCKET = "media";
const [sourceDir, previewDir] = process.argv.slice(2);
if (!sourceDir || !previewDir) {
  console.error("Usage: bun scripts/import-collateral-variants.mjs <sourceDir> <previewDir>");
  process.exit(1);
}

const TYPES = [
  {
    key: "business-card",
    filePrefix: "Business_Card_Template",
    ar: "بطاقة العمل",
    en: "Business Card",
    descAr: "قالب بطاقة العمل الرسمية القابل للتحرير",
    descEn: "Editable official business card template",
  },
  {
    key: "certificate",
    filePrefix: "Certificate_Template",
    ar: "شهادة التقدير",
    en: "Certificate of Appreciation",
    descAr: "قالب شهادة التقدير الرسمية القابل للتحرير",
    descEn: "Editable official certificate of appreciation template",
  },
  {
    key: "report-cover",
    filePrefix: "Report_Cover_Template",
    ar: "غلاف التقرير",
    en: "Report Cover",
    descAr: "قالب غلاف التقرير الرسمي القابل للتحرير",
    descEn: "Editable official report cover template",
  },
];

const VARIANTS = [
  { key: "gold", ar: "النسخة الذهبية", en: "Gold Edition", file: "الذهبي_Gold" },
  { key: "clay", ar: "النسخة الطينية", en: "Clay Edition", file: "الطيني_Clay" },
  { key: "copper", ar: "النسخة النحاسية", en: "Copper Edition", file: "النحاسي_Copper" },
];

const INVENTORY = TYPES.flatMap((type, typeIndex) =>
  VARIANTS.map((variant, variantIndex) => ({
    ref: `COLL-${String(10 + typeIndex * 3 + variantIndex).padStart(3, "0")}`,
    file: `${type.filePrefix}_-_${variant.file}.docx`,
    key: `${type.key}-${variant.key}`,
    ar: `${type.ar} — ${variant.ar}`,
    en: `${type.en} — ${variant.en}`,
    descAr: `${type.descAr}، ${variant.ar}.`,
    descEn: `${type.descEn}, ${variant.en.toLowerCase()}.`,
    sortOrder: 10 + typeIndex * 3 + variantIndex,
  })),
);

function publicUrl(storagePath) {
  return supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

async function upload(storagePath, bytes, mime, originalName) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, bytes, { contentType: mime, upsert: true });
  if (error) throw new Error(`upload ${storagePath}: ${error.message}`);

  const { data: existing } = await supabase
    .from("media_assets")
    .select("id")
    .eq("bucket", BUCKET)
    .eq("storage_path", storagePath)
    .maybeSingle();
  const row = {
    bucket: BUCKET,
    storage_path: storagePath,
    file_name: path.basename(storagePath),
    original_file_name: originalName,
    mime_type: mime,
    file_size: bytes.byteLength,
    public_url: publicUrl(storagePath),
  };
  const query = existing?.id
    ? supabase.from("media_assets").update(row).eq("id", existing.id)
    : supabase.from("media_assets").insert(row);
  const { error: rowError } = await query;
  if (rowError) throw new Error(`media_assets ${storagePath}: ${rowError.message}`);
  return row.public_url;
}

for (const item of INVENTORY) {
  const original = await readFile(path.join(sourceDir, item.file));
  const documentPath = `collaterals/documents/${item.key}.docx`;
  const documentUrl = await upload(
    documentPath,
    original,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    item.file,
  );

  const previewName = `${path.parse(item.file).name}.jpg`;
  const preview = await readFile(path.join(previewDir, previewName));
  const previewPath = `collaterals/previews/${item.key}.jpg`;
  const previewUrl = await upload(previewPath, preview, "image/jpeg", previewName);
  const record = {
    collection: "collaterals",
    reference: item.ref,
    title_ar: item.ar,
    title_en: item.en,
    description_ar: item.descAr,
    description_en: item.descEn,
    kind: "DOCX",
    file_path: documentUrl,
    external_url: previewUrl,
    is_published: true,
    sort_order: item.sortOrder,
  };

  const { data: existing } = await supabase
    .from("library_items")
    .select("id")
    .eq("reference", item.ref)
    .maybeSingle();
  const query = existing?.id
    ? supabase.from("library_items").update(record).eq("id", existing.id)
    : supabase.from("library_items").insert(record);
  const { error } = await query;
  if (error) throw new Error(`library_items ${item.ref}: ${error.message}`);
  console.log(`${item.ref}  ${item.ar}  ${documentPath}`);
}

console.log(`done: ${INVENTORY.length} collateral variants published.`);