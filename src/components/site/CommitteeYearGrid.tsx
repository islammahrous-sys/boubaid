import { FileText } from "lucide-react";
import { committees } from "@/content/site";
import { useLang } from "@/i18n/LanguageProvider";
import { downloadFile } from "@/lib/download";
import { openMediaViewer } from "@/components/site/GlobalMediaViewer";
import { inl } from "@/content/page-copy/committeeyeargrid-inline";

export type CommitteeArchiveItem = {
  id: string;
  reference: string | null;
  title_ar: string;
  title_en: string | null;
  file_path: string | null;
  file_url?: string | null;
  external_url: string | null;
};

/**
 * Built-in 1448 activities per committee. Add entries here (or upload
 * COMM-1448-PLAN-<committee> records in the CMS) to extend a committee's list.
 */
const planned1448: Record<string, { ar: string; en: string }[]> = {
  "activities-initiatives": [inl.t_2b8d6ac1, inl.t_c1732587],
  "finance-investment": [inl.t_d170f0ca],
};

function itemHref(item: CommitteeArchiveItem) {
  return item.file_url || item.file_path || item.external_url || null;
}

function itemsFor(rows: CommitteeArchiveItem[], kind: "PLAN" | "ARCH", committeeId: string) {
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
          <div
            key={committee.id}
            id={kind === "PLAN" ? `committee-${committee.id}` : undefined}
            className="flex flex-col scroll-mt-28 rounded-md border border-border bg-card p-5"
          >
            <h3 className="text-[15px] font-semibold text-foreground">{t(committee.name)}</h3>
            {kind === "PLAN" ? (
              <>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {t(committee.desc)}
                </p>
                {committee.id === "hq-affairs" ? (
                  <a
                    href="#hq-project"
                    className="mt-2 self-start border-b border-bronze pb-0.5 text-[13px] font-medium text-bronze dark:border-gold dark:text-gold"
                  >
                    {t(inl.t_9560802a)}
                  </a>
                ) : null}
                <p className="label-caps mt-4 border-t border-border pt-3 text-bronze dark:text-gold">
                  {t(inl.t_9bd0a74d)}
                </p>
              </>
            ) : null}
            {kind === "PLAN" && planned1448[committee.id] ? (
              <ul className="mt-3 space-y-2">
                {planned1448[committee.id].map((activity) => (
                  <li
                    key={activity.ar}
                    className="flex items-center gap-2 text-[13px] text-foreground"
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-bronze dark:bg-gold"
                      aria-hidden="true"
                    />
                    {t(activity)}
                  </li>
                ))}
              </ul>
            ) : null}
            {items.length === 0 && !(kind === "PLAN" && planned1448[committee.id]) ? (
              <p className="mt-3 text-[13px] text-muted-foreground">
                {kind === "PLAN" ? t(inl.t_6715c119) : t(inl.t_a3f57888)}
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {items.map((item) => {
                  const href = itemHref(item);
                  const title = t({ ar: item.title_ar, en: item.title_en || item.title_ar });
                  const isImage = href ? /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(href) : false;
                  const isPdf = href ? /\.pdf(\?|$)/i.test(href) : false;

                  return (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 text-[13px]"
                    >
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
                            {t(inl.t_c47895fb)}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void downloadFile(href, title)}
                            className="shrink-0 border-b border-bronze pb-0.5 font-medium text-bronze dark:border-gold dark:text-gold"
                          >
                            {t(inl.t_ee037f30)}
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
