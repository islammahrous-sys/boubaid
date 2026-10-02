import { Download, Eye, FileSpreadsheet, FileText, Presentation } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { Eyebrow } from "@/components/site/Editorial";
import { downloadFile } from "@/lib/download";
import { copy } from "@/content/page-copy/collateralslibrary";

/**
 * «المواد التعريفية» / Collaterals — the official collateral documents supplied
 * with the visual identity package.
 *
 * Records live in the existing `library_items` CMS table under the
 * `collaterals` collection. `file_path` points at the untouched original
 * document (DOCX / PPTX / XLSX) and `external_url` carries the separately
 * generated first-page image used only as the on-page visual preview. Nothing
 * here alters a source document: View opens the preview of the document, and
 * Download always delivers the original editable file.
 */

export interface CollateralRecord {
  id: string;
  reference: string | null;
  title_ar: string;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  kind: string | null;
  href: string;
  previewUrl: string | null;
}

const KIND_LABEL: Record<string, BiText> = {
  DOCX: { ar: "مستند نصي", en: "Word" },
  PPTX: { ar: "عرض تقديمي", en: "PowerPoint" },
  XLSX: { ar: "جدول بيانات", en: "Excel" },
};

/**
 * Only an actual image URL may be rendered as the card's visual preview or
 * opened in the site's image viewer. Records added from the admin console can
 * carry a document URL (or nothing) in the preview field, in which case the
 * card falls back to the file-type icon and offers to open the document itself.
 */
const IMAGE_URL = /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i;

function KindIcon({ kind }: { kind: string | null }) {
  const cls = "h-5 w-5 text-bronze dark:text-gold";
  const k = (kind ?? "").toUpperCase();
  if (k === "PPTX") return <Presentation className={cls} aria-hidden="true" />;
  if (k === "XLSX") return <FileSpreadsheet className={cls} aria-hidden="true" />;
  return <FileText className={cls} aria-hidden="true" />;
}

export function CollateralsLibrary({
  items,
  onView,
}: {
  items: CollateralRecord[];
  /** Opens the document's visual preview in the site's media viewer. */
  onView: (src: string, title: string) => void;
}) {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  if (items.length === 0) return null;

  return (
    <section className="reveal-on-scroll mt-16">
      <Eyebrow rule>
        {rtl ? "المواد التعريفية — Collaterals" : "Collaterals — المواد التعريفية"}
      </Eyebrow>
      <p className="measure mt-4 text-[13px] leading-relaxed text-muted-foreground">
        {t(copy.intro)}
      </p>

      <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((r) => {
          const name = (rtl ? r.title_ar : r.title_en || r.title_ar) || r.title_ar;
          const description = (rtl ? r.description_ar : r.description_en) || null;
          const kindLabel = KIND_LABEL[(r.kind ?? "").toUpperCase()];
          const imagePreview = r.previewUrl && IMAGE_URL.test(r.previewUrl) ? r.previewUrl : null;
          return (
            <li
              key={r.id}
              className="flex flex-col overflow-hidden rounded-md border border-border bg-card"
            >
              {imagePreview ? (
                <button
                  type="button"
                  onClick={() => onView(imagePreview, name)}
                  aria-label={`${t(copy.view)} ${name}`}
                  className="flex w-full items-center justify-center border-b border-border bg-muted/30 p-4 transition-colors hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <img
                    src={imagePreview}
                    alt={`${t(copy.previewTitle)} — ${name}`}
                    loading="lazy"
                    className="block max-h-72 w-auto max-w-full object-contain"
                  />
                </button>
              ) : null}

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2">
                  <KindIcon kind={r.kind} />
                  <span className="nums font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                    {kindLabel ? t(kindLabel) : (r.kind ?? "FILE")}
                  </span>
                </div>

                <h3 className="mt-3 break-words text-[15px] font-semibold leading-snug text-foreground">
                  {name}
                </h3>
                {description ? (
                  <p className="mt-2 break-words text-[13px] leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                ) : null}
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                  {t(imagePreview ? copy.previewNote : copy.originalNote)}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                  {imagePreview ? (
                    <button
                      type="button"
                      onClick={() => onView(imagePreview, name)}
                      aria-label={`${t(copy.view)} ${name}`}
                      className="tap-target-y inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-[13px] font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      {t(copy.view)}
                    </button>
                  ) : (
                    <a
                      href={r.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${t(copy.open)} ${name}`}
                      className="tap-target-y inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-[13px] font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      {t(copy.open)}
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => void downloadFile(r.href, name)}
                    aria-label={`${t(copy.download)} ${name}`}
                    className="inline-flex items-center gap-2 border-b border-transparent pb-0.5 text-[13px] font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    {t(copy.download)}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
