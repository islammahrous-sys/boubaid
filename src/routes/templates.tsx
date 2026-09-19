import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Eye, FileArchive, FileText, Image as ImageIcon, Palette, Type } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { getPublishedLibrary } from "@/lib/cms.functions";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow } from "@/components/site/Editorial";
import { MediaViewerDialog, type MediaViewerKind } from "@/components/site/MediaViewerDialog";
import {
  EditableTemplatesLibrary,
  type EditableTemplateRecord,
} from "@/components/site/EditableTemplatesLibrary";
import { getCanonicalUrl } from "@/lib/seo";
import { downloadFile } from "@/lib/download";
import { AiDocumentPrompts } from "@/components/site/AiDocumentPrompts";
import { CollateralsLibrary, type CollateralRecord } from "@/components/site/CollateralsLibrary";


/**
 * الهوية البصرية — official family identity assets plus the
 * reference documents that govern them.
 *
 * Records live in the existing `library_items` CMS table under the
 * `templates` collection. `reference` carries the official template code and
 * `kind` decides the surface: image records render in the visible gallery,
 * document records render in the documents list with an in-browser viewer.
 * Anything an administrator adds in Admin → الأرشيف والمكتبة with the
 * collection set to «النماذج و القوالب» appears here with no code change.
 */
export const Route = createFileRoute("/templates")({
  loader: async () => {
    const rows = await getPublishedLibrary();
    return {
      items: rows
        .filter((r) => r.collection === "templates" && r.is_published)
        .sort((a, b) => a.sort_order - b.sort_order),
      editable: rows
        .filter((r) => r.collection === "templates_editable" && r.is_published)
        .sort((a, b) => a.sort_order - b.sort_order),
      visualIdentity: rows
        .filter((r) => r.collection === "visual_identity" && r.is_published)
        .sort((a, b) => a.sort_order - b.sort_order),
      collaterals: rows
        .filter((r) => r.collection === "collaterals" && r.is_published)
        .sort((a, b) => a.sort_order - b.sort_order),
    };
  },
  head: () => ({
    meta: [
      { title: "Al Bu Obaid Family Council Visual Identity | مجلس أسرة آل بوعبيد" },
      {
        name: "description",
        content:
          "الدليل الرسمي للهوية البصرية واللونية والطباعة والمواد التعريفية لمجلس أسرة آل بوعبيد، مع الأصول الرسمية القابلة للعرض والتحميل.",
      },
      {
        property: "og:title",
        content: "Al Bu Obaid Family Council Visual Identity — مجلس أسرة آل بوعبيد",
      },
      {
        property: "og:description",
        content: "دليل الهوية البصرية الرسمي وأصوله مع قوالب المناسبات القابلة للتحرير.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: getCanonicalUrl("/templates") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/templates") }],
  }),
  component: TemplatesPage,
});

const copy = {
  eyebrow: { ar: "الهوية والمراسلات", en: "Identity and correspondence" } as BiText,
  title: {
    ar: "الهوية البصرية لمجلس أسرة آل بوعبيد",
    en: "Al Bu Obaid Family Council Visual Identity",
  } as BiText,
  subtitle: {
    ar: "الدليل الرسمي للهوية البصرية واللونية والطباعة والمواد التعريفية، مع الأصول الرسمية وقوالب المناسبات القابلة للتحرير.",
    en: "The official visual identity, colour, typography and introductory-materials system, with official assets and editable occasion templates.",
  } as BiText,
  visualTitle: {
    ar: "نظام الهوية البصرية واللونية والطباعة والمواد التعريفية - مجلس أسرة آل بوعبيد",
    en: "Visual Identity, Colour, Typography and Introductory Materials System",
  } as BiText,
  visualIntro: {
    ar: "المستند الرسمي والأصول الأصلية المرفقة بحزمة الهوية البصرية، مع إمكانية العرض والتحميل لكل ملف.",
    en: "The official document and original assets supplied in the visual identity package, with view and download actions for every file.",
  } as BiText,
  assetsTitle: { ar: "أصول الهوية البصرية", en: "Visual Identity Assets" } as BiText,
  paletteTitle: { ar: "الألوان والطباعة", en: "Colour and Typography" } as BiText,
  view: { ar: "عرض الملف", en: "View Document" } as BiText,
  open: { ar: "فتح الملف", en: "Open File" } as BiText,
  download: { ar: "تحميل الملف", en: "Download File" } as BiText,
  preview: { ar: "معاينة", en: "Preview" } as BiText,
  empty: {
    ar: "لم تُنشر مواد هوية بصرية حتى الآن. تُضاف من لوحة الإدارة وتظهر في هذه الصفحة مباشرة.",
    en: "No visual identity materials have been published yet. They are added from the admin console and appear here immediately.",
  } as BiText,
};

/** Image records are either flagged IMAGE or point at an image file. */
function isImageRecord(kind: string | null | undefined, href: string | null) {
  if (kind && /image|png|jpg|jpeg|webp|svg|icon/i.test(kind)) return true;
  return Boolean(href && /\.(png|jpe?g|webp|gif|avif|svg|ico)(\?|#|$)/i.test(href));
}

function isPdfRecord(kind: string | null | undefined, href: string | null) {
  if ((kind ?? "").toUpperCase() === "PDF") return true;
  return Boolean(href && /\.pdf(\?|#|$)/i.test(href));
}

function isPaletteRecord(reference: string | null | undefined) {
  return reference === "VIFC-COLOUR-PALETTE-01" || reference === "VIFC-TYPOGRAPHY-SYSTEM-01";
}

function viewerKind(kind: string | null | undefined, href: string | null): MediaViewerKind | null {
  if (isPdfRecord(kind, href)) return "pdf";
  if (isImageRecord(kind, href)) return "image";
  return null;
}

function TemplatesPage() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  const { items, editable, visualIdentity } = Route.useLoaderData();

  const [assetViewer, setAssetViewer] = useState<{
    src: string;
    title: string;
    kind: MediaViewerKind;
  } | null>(null);

  const resolved = items.map((item) => ({
    item,
    href: item.file_url || item.external_url || null,
    title: (rtl ? item.title_ar : item.title_en) || item.title_ar,
    description: (rtl ? item.description_ar : item.description_en) || null,
  }));

  const templates = resolved.filter((r) => isImageRecord(r.item.kind, r.href) && r.href);
  const documents = resolved.filter((r) => !isImageRecord(r.item.kind, r.href) && r.href);
  const visualRecords = visualIdentity
    .map((item) => ({
      item,
      href: item.file_url || item.external_url || item.file_path || null,
      title: (rtl ? item.title_ar : item.title_en) || item.title_ar,
      description: (rtl ? item.description_ar : item.description_en) || null,
    }))
    .filter((r) => r.href);

  /**
   * Published announcement artwork, keyed by official template code, reused as
   * the website preview for the matching editable master. No file is altered.
   */
  const previews: Record<string, string> = {};
  for (const r of templates) {
    if (r.item.reference && r.href) previews[r.item.reference] = r.href;
  }

  const editableRecords: EditableTemplateRecord[] = editable
    .map((item) => ({
      id: item.id,
      reference: item.reference,
      title_ar: item.title_ar,
      title_en: item.title_en,
      description_ar: item.description_ar,
      description_en: item.description_en,
      kind: item.kind,
      href: item.file_path || item.external_url || "",
    }))
    .filter((r) => r.href);

  const referenceRecords: EditableTemplateRecord[] = documents.map((record) => ({
    id: record.item.id,
    reference: record.item.reference,
    title_ar: record.item.title_ar,
    title_en: record.item.title_en,
    description_ar: record.item.description_ar,
    description_en: record.item.description_en,
    kind: record.item.kind,
    href: record.href as string,
  }));

  return (
    <>
      <PageHeader eyebrow={t(copy.eyebrow)} title={t(copy.title)} subtitle={t(copy.subtitle)} />

      <div className="container-page py-14 md:py-16">
        {visualRecords.length === 0 ? (
          <p className="measure text-[13px] leading-relaxed text-muted-foreground">
            {t(copy.empty)}
          </p>
        ) : null}

        {visualRecords.length > 0 ? (
          <section className="reveal-on-scroll">
            <Eyebrow rule>{t(copy.visualTitle)}</Eyebrow>
            <p className="measure mt-4 text-[13px] leading-relaxed text-muted-foreground">
              {t(copy.visualIntro)}
            </p>

            <VisualIdentityLibrary
              records={visualRecords}
              labels={{
                assetsTitle: t(copy.assetsTitle),
                paletteTitle: t(copy.paletteTitle),
                view: t(copy.view),
                open: t(copy.open),
                download: t(copy.download),
                preview: t(copy.preview),
                file: rtl ? "ملف" : "File",
                image: rtl ? "صورة" : "Image",
                document: rtl ? "مستند" : "PDF",
                font: rtl ? "خط" : "Font",
                styles: rtl ? "أنماط" : "CSS",
                showReference: !rtl,
              }}
              onView={(src, title, kind) => setAssetViewer({ src, title, kind })}
            />
          </section>
        ) : null}

      </div>

      <div className="container-page pb-14 md:pb-16">
        <EditableTemplatesLibrary
          items={editableRecords}
          referenceItems={referenceRecords}
          previews={previews}
        />
        <AiDocumentPrompts />
      </div>

      <MediaViewerDialog
        open={assetViewer !== null}
        onClose={() => setAssetViewer(null)}
        src={assetViewer?.src ?? null}
        kind={assetViewer?.kind ?? "image"}
        title={assetViewer?.title}
      />
    </>
  );
}

type VisualIdentityRecord = {
  item: {
    id: string;
    kind: string | null;
    reference: string | null;
  };
  href: string | null;
  title: string;
  description: string | null;
};

function VisualIdentityLibrary({
  records,
  labels,
  onView,
}: {
  records: VisualIdentityRecord[];
  labels: {
    assetsTitle: string;
    paletteTitle: string;
    view: string;
    open: string;
    download: string;
    preview: string;
    file: string;
    image: string;
    document: string;
    font: string;
    styles: string;
    showReference: boolean;
  };
  onView: (src: string, title: string, kind: MediaViewerKind) => void;
}) {
  const mainDocument = records.find((r) => r.item.reference === "VIFC-DOCUMENT-01");
  const paletteRecords = records.filter((r) => isPaletteRecord(r.item.reference));
  const assetRecords = records.filter(
    (r) => r.item.reference?.startsWith("VI-ASSET-") && r.href,
  );

  return (
    <div className="mt-8 space-y-10">
      {mainDocument ? (
        <VisualIdentityCard
          record={mainDocument}
          featured
          labels={labels}
          onView={onView}
        />
      ) : null}

      {paletteRecords.length > 0 ? (
        <div>
          <h3 className="text-[15px] font-semibold text-foreground">{labels.paletteTitle}</h3>
          <ul className="mt-4 grid gap-6 lg:grid-cols-2">
            {paletteRecords.map((record) => (
              <VisualIdentityCard
                key={record.item.id}
                record={record}
                labels={labels}
                onView={onView}
              />
            ))}
          </ul>
        </div>
      ) : null}

      {assetRecords.length > 0 ? (
        <div>
          <h3 className="text-[15px] font-semibold text-foreground">{labels.assetsTitle}</h3>
          <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assetRecords.map((record) => (
              <VisualIdentityCard
                key={record.item.id}
                record={record}
                compact
                labels={labels}
                onView={onView}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function VisualIdentityCard({
  record,
  labels,
  onView,
  featured = false,
  compact = false,
}: {
  record: VisualIdentityRecord;
  labels: {
    view: string;
    open: string;
    download: string;
    preview: string;
    file: string;
    image: string;
    document: string;
    font: string;
    styles: string;
    showReference: boolean;
  };
  onView: (src: string, title: string, kind: MediaViewerKind) => void;
  featured?: boolean;
  compact?: boolean;
}) {
  const href = record.href;
  if (!href) return null;

  const kind = viewerKind(record.item.kind, href);
  const isImage = kind === "image";
  const isPdf = kind === "pdf";
  const rawType = (record.item.kind || "FILE").toUpperCase();
  const typeLabel = isPdf
    ? labels.document
    : isImage
      ? labels.image
      : rawType === "FONT"
        ? labels.font
        : rawType === "CSS"
          ? labels.styles
          : labels.file;
  const Icon = isPdf
    ? FileText
    : isImage
      ? ImageIcon
      : rawType === "FONT"
        ? Type
        : rawType === "CSS"
          ? Palette
          : FileArchive;
  const primaryAction = kind ? labels.view : labels.open;

  const handleOpen = () => {
    if (kind) {
      onView(href, record.title, kind);
      return;
    }
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <li
      className={
        featured
          ? "flex flex-col rounded-md border border-border bg-card p-5"
          : "flex flex-col overflow-hidden rounded-md border border-border bg-card"
      }
    >
      {!featured ? (
        <button
          type="button"
          onClick={handleOpen}
          aria-label={`${primaryAction} — ${record.title}`}
          className={
            compact
              ? "flex aspect-[4/3] w-full items-center justify-center bg-muted/30 p-5 transition-colors hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              : "flex aspect-video w-full items-center justify-center bg-muted/30 p-4 transition-colors hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          }
        >
          {isImage ? (
            <img
              src={href}
              alt={record.title}
              loading="lazy"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <span className="flex flex-col items-center gap-3 text-muted-foreground">
              <Icon className="h-8 w-8 text-bronze dark:text-gold" aria-hidden="true" />
              <span className="nums rounded-sm border border-border px-2 py-1 font-mono text-[11px]">
                {typeLabel}
              </span>
            </span>
          )}
        </button>
      ) : null}

      <div className={featured ? "flex flex-col" : "flex flex-1 flex-col p-5"}>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-bronze dark:text-gold" aria-hidden="true" />
          <span className="nums font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
            {typeLabel}
          </span>
          {record.item.reference && labels.showReference ? (
            <span className="nums font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
              {record.item.reference}
            </span>
          ) : null}
        </div>

        <h3 className="mt-3 break-words text-[15px] font-semibold leading-snug text-foreground">
          {record.title}
        </h3>
        {record.description ? (
          <p className="mt-2 break-words text-[13px] leading-relaxed text-muted-foreground">
            {record.description}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <button
            type="button"
            onClick={handleOpen}
            aria-label={`${primaryAction} — ${record.title}`}
            className="inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-[13px] font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            {primaryAction}
          </button>
          <button
            type="button"
            onClick={() => void downloadFile(href, record.title)}
            aria-label={`${labels.download} — ${record.title}`}
            className="inline-flex items-center gap-2 border-b border-transparent pb-0.5 text-[13px] font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            {labels.download}
          </button>
        </div>
      </div>
    </li>
  );
}
