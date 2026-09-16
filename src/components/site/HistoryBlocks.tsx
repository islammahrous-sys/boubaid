import { ExternalLink, Maximize2 } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { Prose, Pullquote } from "@/components/site/Editorial";
import { openMediaViewer } from "@/components/site/GlobalMediaViewer";
import type { HistoryBlock } from "@/content/history-source";

/**
 * Renders the transcribed source document blocks with the site's existing
 * editorial components — nothing here invents styling of its own.
 */
export function HistoryBlocks({ blocks }: { blocks: HistoryBlock[] }) {
  const { t, lang } = useLang();
  const rtl = lang === "ar";

  return (
    <div className="mt-5 space-y-6">
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "para":
            return (
              <Prose key={i}>
                <p>{t(block.text)}</p>
              </Prose>
            );

          case "subheading":
            return (
              <h3
                key={i}
                className="mt-10 font-serif text-lg font-bold leading-snug text-foreground md:text-xl"
              >
                {t(block.text)}
              </h3>
            );

          case "quote":
            return (
              <Pullquote key={i} className="my-2">
                {t(block.text)}
              </Pullquote>
            );

          case "source":
            return (
              <p
                key={i}
                className="border-s-2 border-bronze/40 ps-4 text-[12.5px] leading-relaxed text-muted-foreground dark:border-gold/40"
              >
                {block.url ? (
                  <>
                    {t(block.text).replace(block.url, "").trim()}{" "}
                    <a
                      href={block.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-bronze underline underline-offset-2 hover:text-foreground dark:text-gold"
                    >
                      {block.url}
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </>
                ) : (
                  t(block.text)
                )}
              </p>
            );

          case "list":
            return (
              <ol key={i} className="space-y-3 border-t border-border pt-5">
                {block.items.map((item, j) => (
                  <li key={j} className="grid grid-cols-[1.75rem_1fr] gap-3">
                    <span className="nums label-caps text-bronze dark:text-gold" aria-hidden="true">
                      {j + 1}.
                    </span>
                    <span className="text-sm leading-relaxed text-foreground/90">{t(item)}</span>
                  </li>
                ))}
              </ol>
            );

          case "poem":
            return (
              <div
                key={i}
                dir="rtl"
                className="mx-auto w-full max-w-2xl border-y border-border bg-secondary/40 px-4 py-5"
              >
                <ol className="space-y-2.5">
                  {block.lines.map(([a, b], j) => (
                    <li
                      key={j}
                      className="grid gap-1.5 text-center font-naskh text-base leading-loose text-foreground/90 sm:grid-cols-2 sm:gap-6 sm:text-start"
                    >
                      <span>{a}</span>
                      <span className="sm:text-end">{b}</span>
                    </li>
                  ))}
                </ol>
              </div>
            );

          case "figure":
            return (
              <figure key={i} className="my-4">
                <button
                  type="button"
                  onClick={() =>
                    openMediaViewer({ src: block.src, kind: "image", title: t(block.caption) })
                  }
                  className="group relative block w-full border border-border bg-card p-3 transition-colors hover:border-foreground"
                  aria-label={rtl ? "تكبير الصورة" : "Enlarge image"}
                >
                  <img
                    src={block.src}
                    alt={t(block.caption)}
                    loading="lazy"
                    decoding="async"
                    className={
                      block.portrait
                        ? "mx-auto h-auto max-h-[42rem] w-auto max-w-full object-contain"
                        : "mx-auto h-auto max-h-[34rem] w-auto max-w-full object-contain"
                    }
                  />
                  <span className="pointer-events-none absolute end-4 top-4 inline-flex items-center gap-1.5 border border-border bg-background/90 px-2 py-1 text-[11px] font-semibold text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    <Maximize2 className="h-3 w-3" aria-hidden="true" />
                    {rtl ? "عرض بالحجم الكامل" : "View full size"}
                  </span>
                </button>
                <figcaption className="mt-3 border-t border-border pt-3 text-center text-[13px] font-semibold leading-relaxed text-foreground">
                  {t(block.caption)}
                </figcaption>
              </figure>
            );

          case "table":
            return (
              <div key={i} className="my-6">
                <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
                  <table
                    dir={rtl ? "rtl" : "ltr"}
                    className="w-full min-w-[52rem] border-collapse border border-border text-[13px]"
                  >
                    <thead>
                      <tr className="bg-secondary/70">
                        {block.columns.map((col, j) => (
                          <th
                            key={j}
                            scope="col"
                            className="border border-border px-3 py-2.5 text-start align-top font-bold text-foreground"
                          >
                            {t(col)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map((row, j) => (
                        <tr key={j} className="odd:bg-background even:bg-secondary/25">
                          {row.map((cell, k) => (
                            <td
                              key={k}
                              className={
                                k === 0
                                  ? "whitespace-nowrap border border-border px-3 py-2.5 align-top font-mono font-bold text-bronze dark:text-gold"
                                  : "border border-border px-3 py-2.5 align-top leading-relaxed text-foreground/90"
                              }
                            >
                              {t(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-[12px] text-muted-foreground md:hidden">
                  {rtl
                    ? "اسحب الجدول أفقياً لعرض جميع الأعمدة."
                    : "Scroll the table horizontally to see all columns."}
                </p>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
