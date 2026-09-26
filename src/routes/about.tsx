import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionHeading, Ornament } from "@/components/site/Editorial";
import { SectionRail, type RailSection } from "@/components/site/SectionRail";
import { HistoryBlocks } from "@/components/site/HistoryBlocks";
import { historySections } from "@/content/history-source";

const arabicIndex = ["١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩", "١٠"];
const romanIndex = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
import { lineageChain, siteMeta } from "@/content/site";
import { pageImages } from "@/content/images";
import { getPublicFamilyHistory } from "@/lib/cms.functions";
import { getCanonicalUrl } from "@/lib/seo";
import { copy } from "@/content/page-copy/about";

export const Route = createFileRoute("/about")({
  loader: () => getPublicFamilyHistory(),
  head: () => ({
    meta: [
      { title: "النسب والتاريخ | أسرة آل بوعبيد — الأحساء" },
      {
        name: "description",
        content:
          "التاريخ والنسب الموثق لأسرة آل بوعبيد، هجرتهم واستقرارهم بالمبرز بالأحساء، وتفرعهم من بني تميم.",
      },
      { property: "og:title", content: "النسب والتاريخ — آل بوعبيد" },
      {
        property: "og:description",
        content:
          "نسب أسرة آل بوعبيد من العبادل من بني تميم، وهجرتهم واستقرارهم في المبرز بالأحساء، وأقدم وثائقهم.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: getCanonicalUrl("/about") },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/about") }],
  }),
  component: AboutPage,
});



/**
 * In-page wayfinding: the sections of the authoritative source document,
 * followed by the page's apparatus.
 */
const railSections: RailSection[] = [
  ...historySections.map((s) => ({ id: s.id, label: s.label })),
  { id: "chain", label: { ar: "عمود النسب", en: "Chain of descent" } },
];

function AboutPage() {
  const { t, lang } = useLang();
  const { history = [] } = (Route.useLoaderData() || {}) as { history: any[]; places: any[] };
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;

  return (
    <>
      <PageHeader
        variant="plate"
        image={pageImages.about.header.src}
        imageCaption={t(pageImages.about.header.caption)}
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
        meta={[
          { label: t(copy.metaOrigin), value: t(copy.metaOriginValue) },
          { label: t(copy.metaSeat), value: t(copy.metaSeatValue) },
          { label: t(copy.metaEarliest), value: t(copy.metaEarliestValue), mono: true },
        ]}
      />

      <SectionRail sections={railSections} className="print-hide" />

      {/* ── Manuscript spread: narrative with a margin column ── */}
      <section className="container-page py-16 md:py-20 reveal-on-scroll">
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-[1fr_minmax(0,15rem)]">
          <div className="space-y-16">
            {historySections.map((section, i) => (
              <article key={section.id} id={section.id} className="scroll-mt-28">
                <SectionHeading
                  index={rtl ? arabicIndex[i] : romanIndex[i]}
                  eyebrow={t(section.eyebrow)}
                  title={t(section.title)}
                />
                <HistoryBlocks blocks={section.blocks} />
              </article>
            ))}
          </div>

          {/* Margin apparatus — the scholarly note and the registration. */}
          <aside className="space-y-8 lg:pt-2">
            <div className="border-s-2 border-bronze/40 ps-4 dark:border-gold/40">
              <p className="label-caps mb-2 text-bronze dark:text-gold">
                {t(copy.marginNoteLabel)}
              </p>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {t(copy.marginNote)}
              </p>
            </div>

            <dl className="border-t border-border pt-5 text-[13px]">
              <dt className="label-caps text-muted-foreground">
                {rtl ? "الكيان الرسمي" : "Registered entity"}
              </dt>
              <dd className="mt-1.5 leading-relaxed text-foreground">{t(siteMeta.officialName)}</dd>
              <dd className="nums mt-1 font-mono text-bronze dark:text-gold">
                {siteMeta.ncnpLicense}
              </dd>
            </dl>

            <div className="flex flex-col gap-2.5 border-t border-border pt-5">
              <Link
                to="/dna"
                className="inline-flex items-center gap-2 text-[13px] font-medium text-bronze transition-colors hover:text-foreground dark:text-gold dark:hover:text-ivory"
              >
                {t(copy.dnaCta)}
                <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <Link
                to="/branches"
                className="inline-flex items-center gap-2 text-[13px] font-medium text-bronze transition-colors hover:text-foreground dark:text-gold dark:hover:text-ivory"
              >
                {t(copy.branchesCta)}
                <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ── The nasab column — this page's signature ─────────── */}
      <section
        id="chain"
        className="scroll-mt-28 border-y border-border bg-secondary/40 reveal-on-scroll"
      >
        <div className="container-page py-16 md:py-20">
          <SectionHeading
            align="center"
            eyebrow={t(copy.chainEyebrow)}
            title={t(copy.chainTitle)}
            subtitle={t(copy.chainSub)}
          />

          <ol className="mx-auto mt-12 max-w-xl">
            {lineageChain.map((node, i) => (
              <li key={i} className="relative text-center">
                {/* Connecting rule between generations */}
                {i > 0 ? (
                  <span className="mx-auto block h-7 w-px bg-border" aria-hidden="true" />
                ) : null}

                <div
                  className={
                    i === 0
                      ? "inline-block border border-bronze/50 bg-background px-6 py-3 dark:border-gold/50"
                      : i === lineageChain.length - 1
                        ? "inline-block border border-ink/30 bg-background px-6 py-3 dark:border-ivory/25"
                        : "inline-block px-4 py-2"
                  }
                >
                  <span className="nums label-caps me-3 text-muted-foreground" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span
                    className={
                      i === 0 || i === lineageChain.length - 1
                        ? "font-naskh text-lg font-bold text-foreground rtl:text-xl"
                        : "font-naskh text-base text-foreground/85 rtl:text-lg"
                    }
                  >
                    {t(node)}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {history.length > 0 && (
        <section
          id="timeline"
          className="container-page scroll-mt-28 py-16 md:py-20 reveal-on-scroll border-t border-border"
        >
          <SectionHeading
            eyebrow={rtl ? "المحطات والشواهد" : "Milestones & Records"}
            title={rtl ? "المحطات التاريخية والوقائع الموثقة" : "Documented Historical Milestones"}
            subtitle={
              rtl
                ? "سجل زمني يوثق أبرز المحطات والوثائق التاريخية المحفوظة لأسرة آل بوعبيد عبر العصور."
                : "Chronological register documenting key historical milestones and preserved family records."
            }
          />

          <div className="mt-12 space-y-8 relative before:absolute before:inset-0 before:start-4 before:w-0.5 before:bg-border md:before:start-1/2">
            {history.map((entry, idx) => (
              <div
                key={entry.id || idx}
                className="relative flex flex-col md:flex-row items-start gap-6 group"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 border-bronze dark:border-gold z-10 shrink-0 font-mono text-xs font-bold text-bronze dark:text-gold md:absolute md:start-1/2 md:-translate-x-1/2">
                  {idx + 1}
                </div>

                <div
                  className={`w-full md:w-[46%] ${idx % 2 === 0 ? "md:me-auto md:text-end" : "md:ms-auto md:text-start"} bg-card border border-border p-6 rounded-xl shadow-xs`}
                >
                  {entry.date_text_ar && (
                    <span className="inline-block px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-secondary text-bronze dark:text-gold mb-3">
                      {rtl ? entry.date_text_ar : entry.date_text_en || entry.date_text_ar}
                    </span>
                  )}
                  <h3 className="font-brand text-lg font-bold text-foreground">
                    {rtl ? entry.title_ar : entry.title_en || entry.title_ar}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {rtl ? entry.description_ar : entry.description_en || entry.description_ar}
                  </p>
                  {entry.media_path && (
                    <div className="mt-4 overflow-hidden rounded-lg border border-border">
                      <img
                        src={entry.media_path}
                        alt=""
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="container-page">
        <Ornament />
      </div>
    </>
  );
}
