import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ZoomIn, Eye } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { branches } from "@/content/site";
import { getPublishedBranches, getPublicFamilyStats } from "@/lib/cms.functions";
import { branchPortraits } from "@/content/images";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow, Record, RecordField } from "@/components/site/Editorial";
import { parseLineageList } from "@/lib/text";
import { getCanonicalUrl } from "@/lib/seo";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { copy } from "@/content/page-copy/branches";
import { inl } from "@/content/page-copy/branches-inline";

export const Route = createFileRoute("/branches")({
  loader: async () => {
    const [branchRows, familyStats] = await Promise.all([
      getPublishedBranches(),
      getPublicFamilyStats(),
    ]);
    return { branchRows, familyStats };
  },
  head: () => ({
    meta: [
      { title: "الفروع السبعة | أسرة آل بوعبيد" },
      {
        name: "description",
        content:
          "سجل الفروع السبعة الموثقة لأسرة آل بوعبيد وفق المشجرات المعتمدة: الجد الجامع لكل فرع، أفرعه الداخلية، مناطق استقراره، وأعلامه.",
      },
      { property: "og:title", content: "الفروع السبعة — آل بوعبيد" },
      {
        property: "og:description",
        content:
          "الفروع السبعة الموثقة لأسرة آل بوعبيد: الجد الجامع لكل فرع، أفرعه الداخلية، ومناطق استقراره وأعلامه.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: getCanonicalUrl("/branches") },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/branches") }],
  }),
  component: BranchesPage,
});

const ordinals = ["١", "٢", "٣", "٤", "٥", "٦", "٧"];

function BranchesPage() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;
  const { branchRows, familyStats } = Route.useLoaderData();
  const [activePoster, setActivePoster] = useState<{ url: string; title: string } | null>(null);

  // Live member count for an editorial branch = the sum of its DB chart-level
  // rows (`dbSlugs`). Falls back to the static `count` if the live stats
  // endpoint is unavailable.
  const liveCount = (b: (typeof branches)[number]) => {
    if (!familyStats) return b.count;
    const sum = b.dbSlugs.reduce((s, slug) => s + (familyStats.byBranch[slug] ?? 0), 0);
    return sum > 0 ? sum : b.count;
  };

  const totalMembers = familyStats?.total ?? branches.reduce((sum, b) => sum + b.count, 0);
  const generations = familyStats?.generations || 10;
  const nf = (n: number, l: "ar" | "en") => n.toLocaleString(l === "ar" ? "ar-EG" : "en-US");

  // The register's structure (sub-lineages, plates) stays editorial; the
  // secretariat may override a branch's name, text, elder and portrait from
  // the content console by matching the branch slug. Member counts are live.
  const overrides = new Map(branchRows.map((r) => [r.slug, r]));
  const knownIds = new Set(branches.map((b) => b.id));
  const branchList = branches.map((b) => {
    const count = liveCount(b);
    const o = overrides.get(b.id);
    if (!o) return { ...b, count };
    return {
      ...b,
      count,
      name: { ar: o.name_ar, en: o.name_en ?? o.name_ar },
      description: o.description_ar
        ? { ar: o.description_ar, en: o.description_en ?? o.description_ar }
        : b.description,
      image: o.image_url ?? b.image,
    };
  });

  // This page is the family's fixed editorial register of the *seven* documented
  // branches (its heading and lineage prose both say so). `content_pages`-style
  // console rows only *override* the seven static entries by matching slug — a
  // console row whose slug matches none of them is a data-entry mismatch, not an
  // eighth branch, and appending it here produced a register showing ten
  // "branches" (three static + a slug-drifted duplicate set from the DB). Any
  // genuine change to the seven is an editorial change to this file; the console
  // is only for text/photo overrides.
  const unmatchedConsoleBranches = branchRows.filter((r) => !knownIds.has(r.slug));
  if (import.meta.env.DEV && unmatchedConsoleBranches.length > 0) {
    console.warn(
      "[branches] console branch rows with no matching static slug (not rendered):",
      unmatchedConsoleBranches.map((r) => `${r.slug} — ${r.name_ar}`),
    );
  }

  const fullBranchList = branchList;
  const branchSum = branchList.reduce((s, b) => s + b.count, 0);
  // Members not under any branch = the root ancestors above the branch split
  // (their sons head the seven branches). Keeps the table total honest.
  const rootAncestors = familyStats ? Math.max(0, totalMembers - branchSum) : 0;

  return (
    <>
      <PageHeader
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle(nf(totalMembers, "ar"), nf(totalMembers, "en")))}
        meta={[
          { label: t(copy.metaBranches), value: t(inl.t_f92a2d84) },
          { label: t(copy.metaMembers), value: nf(totalMembers, lang), mono: true },
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
                    <span className="sr-only">{t(inl.t_de3d384a)}</span>
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
                {fullBranchList.map((b, i) => (
                  <tr key={b.id} className="border-b border-border align-baseline">
                    <td className="nums py-3 font-naskh text-base text-bronze/70 dark:text-gold/60">
                      {rtl ? (ordinals[i] ?? String(i + 1)) : i + 1}
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
                {rootAncestors > 0 && (
                  <tr className="border-b border-border text-muted-foreground">
                    <td colSpan={4} className="py-2 text-[13px]">
                      {rtl
                        ? `الجدود الجوامع فوق انقسام الفروع`
                        : `Root ancestors above the branch split`}
                    </td>
                    <td className="nums py-2 text-end text-[13px]">{nf(rootAncestors, lang)}</td>
                  </tr>
                )}
                <tr className="border-b border-ink/25 dark:border-ivory/20">
                  <td colSpan={4} className="label-caps py-2.5 text-muted-foreground">
                    {t(copy.metaMembers)}
                  </td>
                  <td className="nums py-2.5 text-end text-sm font-semibold text-foreground">
                    {nf(totalMembers, lang)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <ol className="mt-6 border-t border-ink/25 md:hidden dark:border-ivory/20">
            {fullBranchList.map((b, i) => (
              <li key={b.id}>
                <a
                  href={`#${b.id}`}
                  className="flex items-baseline gap-3 border-b border-border py-3"
                >
                  <span
                    className="nums font-naskh text-base text-bronze/70 dark:text-gold/60"
                    aria-hidden="true"
                  >
                    {rtl ? (ordinals[i] ?? String(i + 1)) : i + 1}
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
        {fullBranchList.map((b, i) => (
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
                <figure className="max-w-[16rem] mx-auto sm:max-w-none">
                  <div className="plate-frame">
                    <img
                      src={branchPortraits[b.id] || b.image || "/images/sheikh-mohammed-ahmed.png"}
                      alt={t({
                        ar: `صورة ${b.ancestor.ar} — الجد الجامع لفرع ${b.name.ar}`,
                        en: `Portrait of ${b.ancestor.en}, patriarch of the ${b.name.en} branch`,
                      })}
                      className="photo-plate aspect-[3/4] w-full object-cover object-top"
                      loading="lazy"
                    />
                  </div>
                  <figcaption className="nums label-caps mt-2.5 border-t border-border pt-2.5 text-bronze dark:text-gold text-center sm:text-start">
                    {t(copy.entryLabel)} {rtl ? (ordinals[i] ?? String(i + 1)) : `0${i + 1}`}
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

                {parseLineageList(t(b.subBranches)).length ? (
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
                ) : null}

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
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() =>
                        setActivePoster({
                          url: b.treePoster!,
                          title: t({
                            ar: `لوحة شجرة فرع ${b.name.ar}`,
                            en: `Family tree plate of the ${b.name.en} branch`,
                          }),
                        })
                      }
                      className="group card-craft active-scale block max-w-xs border border-border text-start cursor-pointer"
                    >
                      <div className="relative">
                        <img
                          src={b.treePoster}
                          alt={t({
                            ar: `لوحة شجرة فرع ${b.name.ar}`,
                            en: `Family tree plate of the ${b.name.en} branch`,
                          })}
                          className="w-full bg-card object-contain"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
                            <ZoomIn className="h-3.5 w-3.5" />
                            {t(copy.posterOpen)}
                          </span>
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() =>
                        setActivePoster({
                          url: b.treePoster!,
                          title: t({
                            ar: `لوحة شجرة فرع ${b.name.ar}`,
                            en: `Family tree plate of the ${b.name.en} branch`,
                          }),
                        })
                      }
                      className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-bronze transition-colors hover:text-foreground dark:text-gold dark:hover:text-ivory cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      {t(copy.posterOpen)}
                    </button>
                  </figure>
                ) : null}

                {/* Direct Link to Tree for this Branch */}
                <div className="mt-7 border-t border-border pt-5">
                  <Link
                    to="/family-tree"
                    search={{ branch: b.id }}
                    className="inline-flex items-center gap-2 border border-bronze/40 bg-bronze/10 px-4 py-2 text-xs font-bold text-bronze hover:bg-bronze hover:text-white transition-colors dark:border-gold/40 dark:bg-gold/10 dark:text-gold dark:hover:bg-gold dark:hover:text-ink"
                  >
                    {rtl
                      ? `استعرض أفراد ${b.name.ar} في المشجرة التفاعلية`
                      : `Explore ${b.name.en} in Interactive Tree`}
                    <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* ── High-Resolution Poster Dialog Modal ─────────────────── */}
      <Dialog open={!!activePoster} onOpenChange={(open) => !open && setActivePoster(null)}>
        <DialogContent className="max-w-4xl p-4 md:p-6 bg-card border-border">
          <DialogTitle className="text-lg font-bold text-foreground mb-4">
            {activePoster?.title}
          </DialogTitle>
          {activePoster ? (
            <div className="max-h-[75vh] overflow-auto rounded border border-border bg-background p-2">
              <img
                src={activePoster.url}
                alt={activePoster.title}
                className="w-full h-auto object-contain rounded"
              />
            </div>
          ) : null}
          <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground">
            <span>{t(inl.t_f05616f7)}</span>
            {activePoster ? (
              <a
                href={activePoster.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-bronze dark:text-gold hover:underline font-semibold"
              >
                {t(inl.t_11cb866d)}
                <Arrow className="h-3 w-3" />
              </a>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Onward to the tree ───────────────────────────────── */}
      <section className="reveal-on-scroll border-t border-border bg-secondary/40">
        <div className="container-page flex flex-wrap items-center justify-between gap-6 py-12">
          <p className="measure text-sm leading-relaxed text-muted-foreground">
            {t(
              copy.treeBody(
                nf(totalMembers, "ar"),
                nf(totalMembers, "en"),
                nf(generations, "ar"),
                nf(generations, "en"),
              ),
            )}
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
