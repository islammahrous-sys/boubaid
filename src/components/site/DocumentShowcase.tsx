import { Eye, FileText, Image as ImageIcon } from "lucide-react";
import { openMediaViewer } from "@/components/site/GlobalMediaViewer";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { libraryItems } from "@/content/site";
import { fundDocuments } from "@/content/fund-documents";
import { cn } from "@/lib/utils";
import { formatDualHijriYear } from "@/lib/dates";

/**
 * Reference aliases used by editorial pages (Contact / About) mapped onto the
 * statutory documents that live in `fundDocuments`. Files are delivered through
 * the view-only endpoint, exactly like on /fund-certificates.
 */
const fundDocRefs: Record<string, string> = {
  "Lic. 1200758400": "licence-certificate",
  "Saudi Post": "national-address",
};

type ShowcaseDoc = {
  title: BiText;
  year: number;
  kind: string;
  ncnpRef: string;
  href?: string;
};

function resolveDocs(refs: string[]): ShowcaseDoc[] {
  const out: ShowcaseDoc[] = [];
  for (const ref of refs) {
    const fundId = fundDocRefs[ref];
    if (fundId) {
      const fd = fundDocuments.find((d) => d.id === fundId);
      if (fd) {
        out.push({
          title: fd.title,
          year: fd.year,
          kind: fd.kind,
          ncnpRef: ref,
          href: `/api/public/fund-doc?id=${encodeURIComponent(fd.id)}`,
        });
        continue;
      }
    }
    out.push(...libraryItems.documents.filter((d) => d.ncnpRef === ref));
  }
  return out;
}

interface DocumentShowcaseProps {
  /** Array of NCNP references to filter and display from libraryItems.documents */
  refs: string[];
  /** Optional custom title for the showcase section */
  title?: BiText;
  /** Optional custom description/subtitle for the showcase section */
  description?: BiText;
  /** Optional visual variant: 'list' (default) or 'grid' */
  variant?: "list" | "grid";
  /** Optional extra class name */
  className?: string;
}

export function DocumentShowcase({
  refs,
  title,
  description,
  variant = "list",
  className,
}: DocumentShowcaseProps) {
  const { t, lang } = useLang();

  const docs = resolveDocs(refs);

  if (docs.length === 0) return null;

  const handleUnavailable = () => {
    toast(
      t({
        ar: "الملف الأصلي محفوظ في أرشيف الأمانة العامة ويخضع لضوابط الاطلاع الرسمية.",
        en: "Original document is archived with the Secretariat under standard access procedures.",
      }),
    );
  };

  return (
    <div className={cn("min-w-0 overflow-hidden border border-border p-4 sm:p-6", className)}>
      {title || description ? (
        <div className="mb-5 border-b border-border pb-4">
          {title ? <h3 className="text-base font-semibold text-foreground">{t(title)}</h3> : null}
          {description ? (
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              {t(description)}
            </p>
          ) : null}
        </div>
      ) : null}

      {variant === "grid" ? (
        <div className="grid gap-x-8 sm:grid-cols-2">
          {docs.map((doc, idx) => {
            const isImage = doc.kind === "JPG" || doc.kind === "PNG";
            return (
              <div key={idx} className="group flex flex-col border-t border-border py-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="nums font-mono text-xs font-semibold text-bronze dark:text-gold">
                    {doc.ncnpRef}
                  </span>
                  <span className="nums label-caps text-muted-foreground">
                    {formatDualHijriYear(doc.year, lang)} · {doc.kind}
                  </span>
                </div>
                <h4 className="mt-2 text-sm leading-snug font-medium text-foreground transition-colors group-hover:text-bronze dark:group-hover:text-gold">
                  {t(doc.title)}
                </h4>

                <div className="mt-3">
                  {doc.href ? (
                    <button
                      type="button"
                      onClick={() =>
                        openMediaViewer({
                          src: doc.href!,
                          kind: isImage ? "image" : "pdf",
                          title: t(doc.title),
                        })
                      }
                      className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                    >
                      {isImage ? (
                        <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {t({ ar: "عرض الوثيقة", en: "View document" })}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleUnavailable}
                      className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                      {t({ ar: "طلب نسخة", en: "Request copy" })}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {docs.map((doc, idx) => {
            const isImage = doc.kind === "JPG" || doc.kind === "PNG";
            return (
              <li
                key={idx}
                className="flex min-w-0 flex-col items-start gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
              >
                <div className="flex w-full min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1 sm:flex-1">
                  <span
                    dir="ltr"
                    className="nums max-w-full break-all font-mono text-xs font-semibold text-bronze dark:text-gold"
                  >
                    {doc.ncnpRef}
                  </span>
                  <span dir="auto" className="min-w-0 max-w-full break-words text-sm font-medium text-foreground [overflow-wrap:anywhere]">
                    {t(doc.title)}
                  </span>
                  <span
                    dir="ltr"
                    className="nums max-w-full break-words text-xs text-muted-foreground [overflow-wrap:anywhere]"
                  >
                    ({formatDualHijriYear(doc.year, lang)} · {doc.kind})
                  </span>
                </div>

                <div className="max-w-full shrink-0">
                  {doc.href ? (
                    <button
                      type="button"
                      onClick={() =>
                        openMediaViewer({
                          src: doc.href!,
                          kind: isImage ? "image" : "pdf",
                          title: t(doc.title),
                        })
                      }
                      className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                    >
                      {isImage ? (
                        <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {t({ ar: "عرض", en: "View" })}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleUnavailable}
                      className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                      {t({ ar: "PDF (طلب الأمانة)", en: "PDF (request)" })}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
