import React from "react";
import { Download, FileText, ExternalLink, Image as ImageIcon } from "lucide-react";
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
  const { t, lang } = useLang();

  // Filter documents matching the requested ncnpRef array
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
    <div
      className={cn(
        "rounded-2xl border border-ink/15 dark:border-ivory/20 bg-background/60 dark:bg-ivory/5 backdrop-blur-md p-6 shadow-sm",
        className,
      )}
    >
      {(title || description) && (
        <div className="mb-5 border-b border-border/60 pb-4">
          {title && <h3 className="text-base font-semibold text-foreground">{t(title)}</h3>}
          {description && (
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              {t(description)}
            </p>
          )}
        </div>
      )}

      {variant === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {docs.map((doc, idx) => {
            const isImage = doc.kind === "JPG" || doc.kind === "PNG";
            return (
              <div
                key={idx}
                className="group flex flex-col justify-between rounded-xl border border-ink/10 dark:border-ivory/15 bg-background/80 dark:bg-ivory/5 p-4 transition-all duration-150 hover:border-bronze/50 dark:hover:border-gold/50"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="nums font-mono text-xs font-semibold text-bronze dark:text-gold">
                      {doc.ncnpRef}
                    </span>
                    <span className="rounded-md bg-secondary/80 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                      {doc.year} هـ · {doc.kind}
                    </span>
                  </div>
                  <h4 className="mt-2.5 text-sm font-medium leading-snug text-foreground group-hover:text-bronze dark:group-hover:text-gold transition-colors">
                    {t(doc.title)}
                  </h4>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 border-t border-border/40 pt-3">
                  {doc.href ? (
                    <a
                      href={doc.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/80 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-bronze hover:text-ivory dark:hover:bg-gold dark:hover:text-ink"
                    >
                      {isImage ? (
                        <ImageIcon className="h-3.5 w-3.5" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      <span>{t({ ar: "عرض وتحميل", en: "View & Download" })}</span>
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={handleUnavailable}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>{t({ ar: "طلب نسخة", en: "Request Copy" })}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <ul className="divide-y divide-border/50">
          {docs.map((doc, idx) => {
            const isImage = doc.kind === "JPG" || doc.kind === "PNG";
            return (
              <li
                key={idx}
                className="flex flex-wrap items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
              >
                <div className="flex items-baseline gap-3 min-w-0">
                  <span className="nums font-mono text-xs font-semibold text-bronze dark:text-gold shrink-0">
                    {doc.ncnpRef}
                  </span>
                  <span className="text-sm font-medium text-foreground truncate">
                    {t(doc.title)}
                  </span>
                  <span className="nums text-xs text-muted-foreground shrink-0 hidden sm:inline">
                    ({doc.year} هـ · {doc.kind})
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {doc.href ? (
                    <a
                      href={doc.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-ink/15 dark:border-ivory/20 bg-background/80 dark:bg-ivory/5 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:border-bronze dark:hover:border-gold hover:text-bronze dark:hover:text-gold"
                    >
                      {isImage ? (
                        <ImageIcon className="h-3.5 w-3.5" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      <span>{t({ ar: "تحميل", en: "Download" })}</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={handleUnavailable}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-ink/15 dark:border-ivory/20 bg-background/80 dark:bg-ivory/5 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>{t({ ar: "PDF (طلب الأمانة)", en: "PDF (Request)" })}</span>
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
