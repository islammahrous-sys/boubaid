import { FileText } from "lucide-react";
import { committees } from "@/content/site";
import { useLang } from "@/i18n/LanguageProvider";
import { downloadFile } from "@/lib/download";
import { openMediaViewer } from "@/components/site/GlobalMediaViewer";

export type CommitteeArchiveItem = {
  id: string;
  reference: string | null;
  title_ar: string;
  title_en: string | null;
  file_path: string | null;
  file_url?: string | null;
  external_url: string | null;
};

function itemHref(item: CommitteeArchiveItem) {
  return item.file_url || item.file_path || item.external_url || null;
}

function itemsFor(
  rows: CommitteeArchiveItem[],
  kind: "PLAN" | "ARCH",
  committeeId: string,
) {
  const prefix = `COMM-1448-${kind}-${committeeId}`.toUpperCase();
  return rows.filter((row) => (row.reference ?? "").toUpperCase().startsWith(prefix));
}

export function CommitteeYearGrid({
  rows,
  kind,
}: {
  rows: CommitteeArchiveItem[];
  kind: "PLAN" | "ARCH";
}) {
  const { t } = useLang();

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {committees.map((committee) => {
        const items = itemsFor(rows, kind, committee.id);
        return (
          <div key={committee.id} className="rounded-md border border-border bg-card p-5">
            <h3 className="text-[15px] font-semibold text-foreground">{t(committee.name)}</h3>
            {items.length === 0 ? (
              <p className="mt-3 text-[13px] text-muted-foreground">
                {kind === "PLAN"
                  ? t({
                      ar: "ستُضاف الأنشطة المخطط لها قريباً.",
                      en: "Planned activities will be added soon.",
                    })
                  : t({ ar: "لا توجد مواد مؤرشفة بعد.", en: "No archived materials yet." })}
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {items.map((item) => {
                  const href = itemHref(item);
                  const title = t({ ar: item.title_ar, en: item.title_en || item.title_ar });
                  const isImage = href
                    ? /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(href)
                    : false;
                  const isPdf = href ? /\.pdf(\?|$)/i.test(href) : false;

                  return (
                    <li key={item.id} className="flex items-center justify-between gap-3 text-[13px]">
                      <span className="flex min-w-0 items-center gap-2">
                        <FileText
                          className="h-4 w-4 shrink-0 text-bronze/70 dark:text-gold/60"
                          aria-hidden="true"
                        />
                        <span className="truncate text-foreground">{title}</span>
                      </span>
                      {href ? (
                        isImage || isPdf ? (
                          <button
                            type="button"
                            onClick={() =>
                              openMediaViewer({
                                src: href,
                                kind: isImage ? "image" : "pdf",
                                title,
                              })
                            }
                            className="shrink-0 border-b border-bronze pb-0.5 font-medium text-bronze dark:border-gold dark:text-gold"
                          >
                            {t({ ar: "عرض", en: "View" })}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void downloadFile(href, title)}
                            className="shrink-0 border-b border-bronze pb-0.5 font-medium text-bronze dark:border-gold dark:text-gold"
                          >
                            {t({ ar: "تحميل", en: "Download" })}
                          </button>
                        )
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}