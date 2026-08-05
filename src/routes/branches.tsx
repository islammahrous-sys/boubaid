import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { branches } from "@/content/site";
import { branchPortraits } from "@/content/images";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow, Record, RecordField } from "@/components/site/Editorial";
import { parseLineageList } from "@/lib/text";

export const Route = createFileRoute("/branches")({
  head: () => ({
    meta: [
      { title: "الفروع السبعة | أسرة آل بوعبيد" },
      { name: "description", content: "سجل الفروع السبعة الموثقة لأسرة آل بوعبيد: الجد الجامع لكل فرع، أفرعه الداخلية، مناطق استقراره، وأعلامه." },
      { property: "og:title", content: "الفروع السبعة — آل بوعبيد" },
      { property: "og:description", content: "الفروع السبعة الموثقة لأسرة آل بوعبيد: الجد الجامع لكل فرع، أفرعه الداخلية، ومناطق استقراره وأعلامه." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://alboabid-heritage-hub.lovable.app/branches" },
    ],
    links: [{ rel: "canonical", href: "https://alboabid-heritage-hub.lovable.app/branches" }],
  }),
  component: BranchesPage,
});

const copy = {
  eyebrow: { ar: "البنية العائلية", en: "Family structure" } as BiText,
  title: { ar: "سجل الفروع السبعة", en: "Register of the Seven Branches" } as BiText,
  subtitle: {
    ar: "تنتظم الأسرة في سبعة فروع رئيسية تنحدر من أبناء الجد أحمد بن صالح. ولكل فرع أفرعه الداخلية ومناطق استقراره وتمثيله في مجلس الأسرة واللجان.",
    en: "The family is organised into seven principal branches descending from the sons of the patriarch Ahmed bin Salih. Each has its own sub-lineages, areas of settlement, and representation on the family council and its committees.",
  } as BiText,

  metaBranches: { ar: "عدد الفروع", en: "Branches" } as BiText,
  metaMembers: { ar: "الأفراد الموثقون", en: "Documented members" } as BiText,
  metaSeat: { ar: "المرجع", en: "Seat" } as BiText,
  metaSeatValue: { ar: "المبرز، الأحساء", en: "Al-Mubarraz, Al-Ahsa" } as BiText,

  indexTitle: { ar: "فهرس الفروع", en: "Index of branches" } as BiText,
  colBranch: { ar: "الفرع", en: "Branch" } as BiText,
  colAncestor: { ar: "الجد الجامع", en: "Patriarch" } as BiText,
  colSettlement: { ar: "مناطق الاستقرار", en: "Settlement" } as BiText,
  colCount: { ar: "العدد", en: "Members" } as BiText,

  entryLabel: { ar: "الفرع", en: "Branch" } as BiText,
  ancestorLabel: { ar: "الجد الجامع", en: "Patriarch" } as BiText,
  settlementLabel: { ar: "مناطق الاستقرار", en: "Settlement" } as BiText,
  countLabel: { ar: "الأفراد الموثقون", en: "Documented members" } as BiText,
  subLabel: { ar: "الأفرع الداخلية", en: "Sub-lineages" } as BiText,
  figuresLabel: { ar: "من أعلام الفرع", en: "Notable figures" } as BiText,
  posterLabel: { ar: "اللوحة الرسمية لشجرة الفرع", en: "Official branch tree plate" } as BiText,
  posterOpen: { ar: "فتح اللوحة كاملة", en: "Open full plate" } as BiText,

  treeCta: { ar: "المشجرة التفاعلية الكاملة", en: "The full interactive tree" } as BiText,
  treeBody: {
    ar: "يعرض هذا السجل رؤوس الفروع فقط. أما التفريع الكامل للأجيال فمتاح في المشجرة التفاعلية.",
    en: "This register lists the heads of the branches only. The complete generational tree is available in the interactive view.",
  } as BiText,
};

const ordinals = ["١", "٢", "٣", "٤", "٥", "٦", "٧"];

export function BranchesPage() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;
  const totalMembers = branches.reduce((sum, b) => sum + b.count, 0);

  return (
    <>
      <PageHeader
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
        meta={[
          { label: t(copy.metaBranches), value: rtl ? "سبعة" : "Seven" },
          { label: t(copy.metaMembers), value: totalMembers.toLocaleString(), mono: true },
          { label: t(copy.metaSeat), value: t(copy.metaSeatValue) },
        ]}
      />

      {/* ── Index table — this page's signature device ───────── */}
      <section className="reveal-on-scroll border-b border-border bg-secondary/40">
        <div className="container-page py-12 md:py-14">
          <Eyebrow>{t(copy.indexTitle)}</Eyebrow>

          {/* Table at md+. Every field in it is repeated in full in each
              branch's own entry below, so the phone view trades the table
              for what a small screen actually wants here — a fast jump
              list — rather than a second, more cramped copy of the table. */}
          <div className="mt-6 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[42rem] border-collapse text-start">
              <thead>
                <tr className="border-y border-ink/25 dark:border-ivory/20">
                  <th
                    scope="col"
                    className="label-caps w-10 py-2.5 text-start text-muted-foreground"
                  >
                    <span className="sr-only">{rtl ? "الرقم" : "No."}</span>
                  </th>
                  <th scope="col" className="label-caps py-2.5 text-start text-muted-foreground">
                    {t(copy.colBranch)}
                  </th>
                  <th scope="col" className="label-caps py-2.5 text-start text-muted-foreground">
                    {t(copy.colAncestor)}
                  </th>
                  <th scope="col" className="label-caps py-2.5 text-start text-muted-foreground">
                    {t(copy.colSettlement)}
                  </th>
                  <th scope="col" className="label-caps py-2.5 text-end text-muted-foreground">
                    {t(copy.colCount)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {branches.map((b, i) => (
                  <tr key={b.id} className="border-b border-border align-baseline">
                    <td className="nums py-3 font-naskh text-base text-bronze/70 dark:text-gold/60">
                      {rtl ? ordinals[i] : i + 1}
                    </td>
                    <td className="py-3 pe-6 text-sm font-semibold">
                      <a
                        href={`#${b.id}`}
                        className="text-foreground transition-colors hover:text-bronze dark:hover:text-gold"
                      >
                        {t(b.name)}
                      </a>
                    </td>
                    <td className="py-3 pe-6 text-[13px] leading-snug text-muted-foreground">
                      {t(b.ancestor)}
                    </td>
                    <td className="py-3 pe-6 text-[13px] leading-snug text-muted-foreground">
                      {t(b.settlement)}
                    </td>
                    <td className="nums py-3 text-end text-[13px] text-foreground">{b.count}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-b border-ink/25 dark:border-ivory/20">
                  <td colSpan={4} className="label-caps py-2.5 text-muted-foreground">
                    {t(copy.metaMembers)}
                  </td>
                  <td className="nums py-2.5 text-end text-sm font-semibold text-foreground">
                    {totalMembers.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <ol className="mt-6 border-t border-ink/25 md:hidden dark:border-ivory/20">
            {branches.map((b, i) => (
              <li key={b.id}>
                <a
                  href={`#${b.id}`}
                  className="flex items-baseline gap-3 border-b border-border py-3"
                >
                  <span
                    className="nums font-naskh text-base text-bronze/70 dark:text-gold/60"
                    aria-hidden="true"
                  >
                    {rtl ? ordinals[i] : i + 1}
                  </span>
                  <span className="flex-1 text-sm font-semibold text-foreground">{t(b.name)}</span>
                  <span className="nums text-xs text-muted-foreground">{b.count}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Full entries ─────────────────────────────────────── */}
      <div className="container-page">
        {branches.map((b, i) => (
          <article
            key={b.id}
            id={b.id}
            className="scroll-mt-32 border-b border-border py-14 last:border-b-0 md:py-16"
          >
            <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,15rem)_1fr]">
              {/* Plate column — one portrait per branch. Where the archive
                  holds a dedicated portrait of the patriarch it is used in
                  place of the generic branch plate, never in addition to it. */}
              <div className="lg:sticky lg:top-32 lg:self-start">
                <figure>
                  <div className="plate-frame">
                    <img
                      src={branchPortraits[b.id] ?? b.image}
                      alt={t({
                        ar: `صورة ${b.ancestor.ar} — الجد الجامع لفرع ${b.name.ar}`,
                        en: `Portrait of ${b.ancestor.en}, patriarch of the ${b.name.en} branch`,
                      })}
                      className="photo-plate aspect-[3/4] w-full object-cover object-top"
                      loading="lazy"
                    />
                  </div>
                  <figcaption className="nums label-caps mt-2.5 border-t border-border pt-2.5 text-bronze dark:text-gold">
                    {t(copy.entryLabel)} {rtl ? ordinals[i] : `0${i + 1}`}
                  </figcaption>
                </figure>

                <dl className="mt-5 space-y-3 text-[13px]">
                  <div>
                    <dt className="label-caps text-muted-foreground">{t(copy.settlementLabel)}</dt>
                    <dd className="mt-1 leading-relaxed text-foreground">{t(b.settlement)}</dd>
                  </div>
                  <div>
                    <dt className="label-caps text-muted-foreground">{t(copy.countLabel)}</dt>
                    <dd className="nums mt-1 font-mono text-foreground">{b.count}</dd>
                  </div>
                </dl>
              </div>

              {/* Entry body */}
              <div>
                <h2 className="text-2xl leading-tight text-foreground md:text-3xl">{t(b.name)}</h2>

                <p className="mt-3 border-s-2 border-bronze/40 ps-4 text-sm leading-relaxed text-muted-foreground dark:border-gold/40">
                  <span className="label-caps me-2 text-bronze dark:text-gold">
                    {t(copy.ancestorLabel)}
                  </span>
                  <span className="text-foreground">{t(b.ancestor)}</span>
                </p>

                <p className="measure mt-6 text-[0.9375rem] leading-[1.9] text-ink-soft md:text-base dark:text-foreground/85">
                  {t(b.description)}
                </p>

                <div className="mt-7 border-t border-border pt-5">
                  <p className="label-caps mb-3 text-muted-foreground">{t(copy.subLabel)}</p>
                  <ul className="divide-y divide-border/70">
                    {parseLineageList(t(b.subBranches)).map((sub, si) => (
                      <li
                        key={si}
                        className="grid gap-x-6 gap-y-0.5 py-2.5 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,10rem)_1fr]"
                      >
                        <span className="text-sm font-semibold text-foreground">{sub.head}</span>
                        {sub.names ? (
                          <span className="text-sm leading-relaxed text-muted-foreground">
                            {sub.names}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>

                {b.keyFigures?.length ? (
                  <div className="mt-6 border-t border-border pt-5">
                    <p className="label-caps mb-2.5 text-muted-foreground">
                      {t(copy.figuresLabel)}
                    </p>
                    <ul className="space-y-1.5">
                      {b.keyFigures.map((fig, fi) => (
                        <li key={fi} className="flex gap-2.5 text-sm text-foreground">
                          <span
                            className="mt-2 h-1 w-1 shrink-0 bg-bronze dark:bg-gold"
                            aria-hidden="true"
                          />
                          {t(fig)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {b.treePoster ? (
                  <figure className="mt-7 border-t border-border pt-5">
                    <p className="label-caps mb-3 text-muted-foreground">{t(copy.posterLabel)}</p>
                    <a
                      href={b.treePoster}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group card-craft active-scale block max-w-xs border border-border"
                    >
                      <img
                        src={b.treePoster}
                        alt={t({
                          ar: `لوحة شجرة فرع ${b.name.ar}`,
                          en: `Family tree plate of the ${b.name.en} branch`,
                        })}
                        className="w-full bg-white object-contain"
                        loading="lazy"
                      />
                    </a>
                    <a
                      href={b.treePoster}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-bronze transition-colors hover:text-foreground dark:text-gold dark:hover:text-ivory"
                    >
                      {t(copy.posterOpen)}
                      <Arrow className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </figure>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* ── Onward to the tree ───────────────────────────────── */}
      <section className="reveal-on-scroll border-t border-border bg-secondary/40">
        <div className="container-page flex flex-wrap items-center justify-between gap-6 py-12">
          <p className="measure text-sm leading-relaxed text-muted-foreground">
            {t(copy.treeBody)}
          </p>
          <Link
            to="/family-tree"
            className="inline-flex shrink-0 items-center gap-2 border border-ink bg-ink px-5 py-3 text-sm font-medium text-ivory transition-colors hover:bg-transparent hover:text-foreground dark:border-gold dark:bg-gold dark:text-ink dark:hover:bg-transparent dark:hover:text-gold"
          >
            {t(copy.treeCta)}
            <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
