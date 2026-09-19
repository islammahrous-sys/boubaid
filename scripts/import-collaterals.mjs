#!/usr/bin/env node
/**
 * Publishes the official collateral documents («المواد التعريفية») supplied in
 * Collaterals.zip. Every original document is uploaded unchanged to the `media`
 * bucket under `collaterals/documents/`, and a separately generated first-page
 * image is uploaded to `collaterals/previews/` purely for on-page display.
 *
 * Idempotent: media_assets are keyed by storage_path and library_items by
 * reference, so reruns update instead of duplicating.
 *
 * Usage: bun scripts/import-collaterals.mjs <sourceDir> <previewDir>
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
  console.error("Usage: bun scripts/import-collaterals.mjs <sourceDir> <previewDir>");
  process.exit(1);
}

/** Inventory: original file, ASCII storage key, MSA label, English label. */
const INVENTORY = [
  {
    ref: "COLL-001",
    file: "Letterhead Template - قالب الترويسة الرسمية.docx",
    key: "letterhead-template",
    ar: "قالب الترويسة الرسمية",
    en: "Letterhead Template",
    descAr: "الترويسة الرسمية للمخاطبات الصادرة عن مجلس أسرة آل بوعبيد، بصيغة مستند قابل للتحرير.",
    descEn: "The official letterhead for the Council's outgoing correspondence, as an editable document.",
  },
  {
    ref: "COLL-002",
    file: "Envelope Template - قالب الظرف الرسمي.docx",
    key: "envelope-template",
    ar: "قالب الظرف الرسمي",
    en: "Envelope Template",
    descAr: "الظرف الرسمي المعتمد للمراسلات، بصيغة مستند قابل للتحرير.",
    descEn: "The approved official envelope for correspondence, as an editable document.",
  },
  {
    ref: "COLL-003",
    file: "Business Card Template - قالب بطاقة العمل.docx",
    key: "business-card-template",
    ar: "قالب بطاقة العمل",
    en: "Business Card Template",
    descAr: "بطاقة العمل الرسمية لأعضاء المجلس ولجانه، بصيغة مستند قابل للتحرير.",
    descEn: "The official business card for Council and committee members, as an editable document.",
  },
  {
    ref: "COLL-004",
    file: "Email Signature Template - قالب التوقيع الإلكتروني.docx",
    key: "email-signature-template",
    ar: "قالب التوقيع الإلكتروني",
    en: "Email Signature Template",
    descAr: "التوقيع الإلكتروني الموحَّد للبريد الرسمي، بصيغة مستند قابل للتحرير.",
    descEn: "The unified email signature for official correspondence, as an editable document.",
  },
  {
    ref: "COLL-005",
    file: "Certificate Template - قالب شهادة التقدير.docx",
    key: "certificate-template",
    ar: "قالب شهادة التقدير",
    en: "Certificate Template",
    descAr: "شهادة التقدير المعتمدة للتكريم والمناسبات، بصيغة مستند قابل للتحرير.",
    descEn: "The approved certificate of appreciation for honouring and occasions, as an editable document.",
  },
  {
    ref: "COLL-006",
    file: "Report Cover Template - قالب غلاف التقرير.docx",
    key: "report-cover-template",
    ar: "قالب غلاف التقرير",
    en: "Report Cover Template",
    descAr: "غلاف التقارير الرسمية الصادرة عن المجلس ولجانه، بصيغة مستند قابل للتحرير.",
    descEn: "The cover page for official reports issued by the Council and its committees, as an editable document.",
  },
  {
    ref: "COLL-007",
    file: "Fact Sheet Template - قالب ورقة الحقائق.docx",
    key: "fact-sheet-template",
    ar: "قالب ورقة الحقائق",
    en: "Fact Sheet Template",
    descAr: "ورقة الحقائق التعريفية الموجزة، بصيغة مستند قابل للتحرير.",
    descEn: "The concise introductory fact sheet, as an editable document.",
  },
  {
    ref: "COLL-008",
    file: "PowerPoint Slides Template - قالب شرائح العرض التقديمي.pptx",
    key: "presentation-slides-template",
    ar: "قالب شرائح العرض التقديمي",
    en: "Presentation Slides Template",
    descAr: "شرائح العرض التقديمي الرسمية، بصيغة عرض تقديمي قابل للتحرير.",
    descEn: "The official presentation slides, as an editable PowerPoint file.",
  },
  {
    ref: "COLL-009",
    file: "Excel Table Template - قالب جدول البيانات.xlsx",
    key: "data-table-template",
    ar: "قالب جدول البيانات",
    en: "Data Table Template",
    descAr: "جدول البيانات الرسمي الموحَّد، بصيغة جدول بيانات قابل للتحرير.",
    descEn: "The unified official data table, as an editable spreadsheet.",
  },
];

const MIME = {
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".jpg": "image/jpeg",
};
const KIND = { ".docx": "DOCX", ".pptx": "PPTX", ".xlsx": "XLSX" };

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
  if (existing?.id) {
    const { error: e } = await supabase.from("media_assets").update(row).eq("id", existing.id);
    if (e) throw new Error(`media_assets update ${storagePath}: ${e.message}`);
  } else {
    const { error: e } = await supabase.from("media_assets").insert(row);
    if (e) throw new Error(`media_assets insert ${storagePath}: ${e.message}`);
  }
  return row.public_url;
}

let order = 1;
for (const item of INVENTORY) {
  const ext = path.extname(item.file).toLowerCase();
  const original = await readFile(path.join(sourceDir, item.file));
  const docPath = `collaterals/documents/${item.key}${ext}`;
  const docUrl = await upload(docPath, original, MIME[ext], item.file);

  const previewFile = `${item.file.slice(0, -ext.length)}-1.jpg`;
  const preview = await readFile(path.join(previewDir, previewFile));
  const previewPath = `collaterals/previews/${item.key}.jpg`;
  const previewUrl = await upload(previewPath, preview, MIME[".jpg"], previewFile);

  const record = {
    collection: "collaterals",
    reference: item.ref,
    title_ar: item.ar,
    title_en: item.en,
    description_ar: item.descAr,
    description_en: item.descEn,
    kind: KIND[ext],
    file_path: docUrl,
    // The generated first-page image used only as the on-page visual preview.
    external_url: previewUrl,
    is_published: true,
    sort_order: order++,
  };

  const { data: existing } = await supabase
    .from("library_items")
    .select("id")
    .eq("reference", item.ref)
    .maybeSingle();
  if (existing?.id) {
    const { error } = await supabase.from("library_items").update(record).eq("id", existing.id);
    if (error) throw new Error(`library_items update ${item.ref}: ${error.message}`);
  } else {
    const { error } = await supabase.from("library_items").insert(record);
    if (error) throw new Error(`library_items insert ${item.ref}: ${error.message}`);
  }
  console.log(`${item.ref}  ${item.ar}  ${KIND[ext]}  ${docPath}`);
}
console.log(`done: ${INVENTORY.length} collateral documents published.`);
