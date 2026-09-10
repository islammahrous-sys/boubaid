import { Eye, FileText, Image as ImageIcon } from "lucide-react";
import { openMediaViewer } from "@/components/site/GlobalMediaViewer";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { libraryItems } from "@/content/site";
import { cn } from "@/lib/utils";

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
  const { t } = useLang();

  const docs = libraryItems.documents.filter((d) => refs.includes(d.ncnpRef));

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
    <div className={cn("border border-border p-6", className)}>
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
                    {doc.year} هـ · {doc.kind}
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
                className="flex flex-wrap items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-baseline gap-3">
                  <span className="nums shrink-0 font-mono text-xs font-semibold text-bronze dark:text-gold">
                    {doc.ncnpRef}
                  </span>
                  <span className="truncate text-sm font-medium text-foreground">
                    {t(doc.title)}
                  </span>
                  <span className="nums hidden shrink-0 text-xs text-muted-foreground sm:inline">
                    ({doc.year} هـ · {doc.kind})
                  </span>
                </div>

                <div className="shrink-0">
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
