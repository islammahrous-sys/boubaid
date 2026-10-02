import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { dnaInfo } from "@/content/site";
import { pageImages } from "@/content/images";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionRail, type RailSection } from "@/components/site/SectionRail";
import { Eyebrow, Prose, Record, RecordField } from "@/components/site/Editorial";
import { DocumentShowcase } from "@/components/site/DocumentShowcase";
import { stripLeadingLabel } from "@/lib/text";
import { getPublicDnaStudiesData } from "@/lib/cms.functions";
import type { DnaStudiesDataInput } from "@/lib/admin-hub.schemas";
import { getCanonicalUrl } from "@/lib/seo";
import { copy } from "@/content/page-copy/dna";

export const Route = createFileRoute("/dna")({
  loader: async () => {
    const dynamicDna = await getPublicDnaStudiesData();
    return { dynamicDna };
  },
  head: () => ({
    meta: [
      { title: "الدراسة الجينية J-Z20777 | آل بوعبيد" },
      {
        name: "description",
        content:
          "نتائج فحوصات سلالة الكروموسوم الذكري (Y-DNA) لأسرة آل بوعبيد ضمن شجرة التحور J-Z20777 وتحورها الطرفي J-BY37877.",
      },
      { property: "og:title", content: "الدراسة الجينية — آل بوعبيد" },
      {
        property: "og:description",
        content:
          "نتائج فحوصات الحمض النووي (Y-DNA) لأسرة آل بوعبيد ضمن شجرة التحور J-Z20777 والتحور الطرفي J-BY37877.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: getCanonicalUrl("/dna") },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/dna") }],
  }),
  component: DnaPage,
});

const railSections: RailSection[] = [
  { id: "overview", label: { ar: "الخلاصة", en: "Overview" } },
  { id: "clade", label: { ar: "السلالة", en: "Haplogroup" } },
  { id: "timeline", label: { ar: "التسلسل الزمني", en: "Timeline" } },
  { id: "distribution", label: { ar: "الانتشار", en: "Distribution" } },
  { id: "method", label: { ar: "المنهجية", en: "Method" } },
  { id: "dna-sources", label: { ar: "المصادر", en: "Sources" } },
];

/** Renders an Arabic TMRCA label ("١٦٥٠ سنة") in English ("1650 years"). */
function localizeYearLabel(value: string): string {
  const latin = value.replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660));
  return latin.replace(/سنة/g, "years").replace(/هـ/g, "AH").trim();
}

function DnaPage() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;
  const { dynamicDna: rawDynamicDna } = Route.useLoaderData();
  const dynamicDna = rawDynamicDna as DnaStudiesDataInput | null;

  const activeHaplogroup = dynamicDna?.haplogroup || dnaInfo.haplogroup;
  const activeRoot = dynamicDna?.root_haplogroup || "J1-M267";
  const activeTerminal = dynamicDna?.terminal_mutation || "J-BY37877";

  const clades =
    dynamicDna?.hierarchy && dynamicDna.hierarchy.length > 0
      ? dynamicDna.hierarchy.map((c) => c.mutation)
      : dnaInfo.parentClade.split(">").map((c) => c.trim());

  const timelineEntries =
    dynamicDna?.chronology && dynamicDna.chronology.length > 0
      ? dynamicDna.chronology.map((entry) => ({
          snp: entry.mutation,
          year: entry.tmrca || entry.approx_date,
          note: { ar: entry.note_ar, en: entry.note_en || entry.note_ar } as BiText,
        }))
      : dnaInfo.haplogroupTimeline;

  const siblingFamilyNames =
    dynamicDna?.sibling_families && dynamicDna.sibling_families.length > 0
      ? dynamicDna.sibling_families.map((f) => (lang === "ar" ? f.name_ar : f.name_en || f.name_ar))
      : dnaInfo.siblingFamilies.names;

  const distributionData =
    dynamicDna?.distribution && dynamicDna.distribution.length > 0
      ? dynamicDna.distribution.map((d) => {
          const maxSamples = Math.max(
            ...dynamicDna.distribution.map((x) => x.samples_count || 1),
            1,
          );
          const pct = Math.round((d.samples_count / maxSamples) * 100);
          const match = dnaInfo.geographicDistribution.find(
            (g) =>
              g.country.ar === d.country_ar ||
              g.country.en.toLowerCase() === (d.country_en || "").toLowerCase(),
          );
          return {
            country: { ar: d.country_ar, en: d.country_en || d.country_ar } as BiText,
            flagCode: match?.flagCode || "sa",
            regions: { ar: d.regions_ar, en: d.regions_ar } as BiText,
            families: { ar: d.note_ar || "", en: d.note_ar || "" } as BiText,
            sampleLabel: {
              ar: `${d.samples_count} عينة`,
              en: `${d.samples_count} samples`,
            } as BiText,
            barWidth: `${pct}%`,
            note: { ar: "", en: "" } as BiText,
          };
        })
      : dnaInfo.geographicDistribution;

  return (
    <>
      <PageHeader
        variant="document"
        eyebrow={t(copy.eyebrow)}
        title={t(dnaInfo.title)}
        subtitle={t(copy.subtitle)}
        meta={[
          { label: t(copy.metaHaplogroup), value: activeHaplogroup, mono: true },
          { label: t(copy.metaSystem), value: t(copy.metaSystemValue) },
          { label: t(copy.metaSamples), value: t(copy.metaSamplesValue) },
        ]}
      />

      <SectionRail sections={railSections} className="print-hide" />

      <div className="container-page pb-20">
        {/* ── Methodological note, stated up front ───────────── */}
        <aside className="border-s-2 border-bronze/50 ps-5 dark:border-gold/50">
          <p className="label-caps mb-2 text-bronze dark:text-gold">{t(copy.noteLabel)}</p>
          <p className="measure text-[13px] leading-relaxed text-muted-foreground">
            {stripLeadingLabel(t(dnaInfo.disclaimer))}
          </p>
        </aside>

        {/* ── Summary ────────────────────────────────────────── */}
        <section
          id="overview"
          className="scroll-mt-28 reveal-on-scroll mt-14 grid gap-10 lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-16"
        >
          <div>
            <Eyebrow>{t(copy.overviewEyebrow)}</Eyebrow>
            <p className="nums mt-4 font-mono text-4xl text-foreground">{activeHaplogroup}</p>
            <p className="label-caps mt-2 text-muted-foreground">{t(copy.metaSystemValue)}</p>

            <figure className="mt-8">
              <div className="plate-frame">
                <img
                  src={pageImages.about.dnaAbstract.src}
                  alt=""
                  className="photo-plate aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
              </div>
              <figcaption className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                {t(pageImages.about.dnaAbstract.caption)}
              </figcaption>
            </figure>
          </div>

          <div>
            <h2 className="text-2xl leading-tight text-foreground md:text-[1.75rem]">
              {t(copy.overviewTitle)}
            </h2>
            <Prose dropCap className="mt-4">
              <p>{t(dnaInfo.overview)}</p>
            </Prose>
          </div>
        </section>

        {/* ── Clade ladder — this page's signature device ─────── */}
        <section
          id="clade"
          className="scroll-mt-28 reveal-on-scroll mt-16 border-t border-border pt-10"
        >
          <Eyebrow>{t(copy.cladeEyebrow)}</Eyebrow>
          <h2 className="mt-3 text-xl text-foreground md:text-2xl">{t(copy.cladeTitle)}</h2>
          <p className="mt-2 text-[13px] text-muted-foreground">{t(copy.cladeNote)}</p>

          <ol className="mt-7 max-w-2xl" dir="ltr">
            {clades.map((clade, i) => {
              const isRoot = i === 0;
              const isTerminal = i === clades.length - 1;
              return (
                <li key={clade} className="flex items-stretch gap-4">
                  {/* Ladder rail */}
                  <div className="flex w-3 shrink-0 flex-col items-center">
                    <span
                      className={`h-3 w-3 shrink-0 border ${
                        isTerminal
                          ? "border-bronze bg-bronze dark:border-gold dark:bg-gold"
                          : "border-muted-foreground/50 bg-background"
                      }`}
                      aria-hidden="true"
                    />
                    {!isTerminal ? (
                      <span className="w-px flex-1 bg-border" aria-hidden="true" />
                    ) : null}
                  </div>

                  <div className={isTerminal ? "pb-0" : "pb-6"}>
                    <p
                      className={`nums font-mono ${
                        isTerminal
                          ? "text-lg font-semibold text-foreground"
                          : "text-sm text-muted-foreground"
                      }`}
                    >
                      {clade}
                    </p>
                    {isRoot || isTerminal ? (
                      <p className="label-caps mt-1 text-bronze dark:text-gold">
                        {isTerminal ? t(copy.cladeTerminal) : t(copy.cladeRoot)}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* ── SNP chronology ─────────────────────────────────── */}
        <section
          id="timeline"
          className="scroll-mt-28 reveal-on-scroll mt-16 border-t border-border pt-10"
        >
          <Eyebrow>{t(copy.timelineEyebrow)}</Eyebrow>
          <h2 className="mt-3 text-xl text-foreground md:text-2xl">{t(copy.timelineTitle)}</h2>
          <p className="measure mt-2 text-[13px] leading-relaxed text-muted-foreground">
            {t(copy.timelineNote)}
          </p>

          <ol className="mt-8">
            {timelineEntries.map((entry, i, arr) => {
              /* The terminal mutation under which "Al Bu Obaid" is named on the source chart. */
              const isFamily = i === arr.length - 1;
              return (
                <li key={entry.snp} className="flex items-stretch gap-5">
                  {/* Rail */}
                  <div className="flex w-3 shrink-0 flex-col items-center pt-1.5">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rotate-45 border ${
                        isFamily
                          ? "border-bronze bg-bronze dark:border-gold dark:bg-gold"
                          : "border-muted-foreground/50 bg-background"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="w-px flex-1 bg-border" aria-hidden="true" />
                  </div>

                  <div className="grid flex-1 gap-x-8 gap-y-1 pb-7 md:grid-cols-[8rem_9rem_1fr]">
                    <p
                      className={`nums font-mono ${
                        isFamily
                          ? "text-base font-semibold text-foreground"
                          : "text-sm text-muted-foreground"
                      }`}
                      dir="ltr"
                    >
                      {entry.snp}
                    </p>

                    <p className="nums text-[13px] text-bronze dark:text-gold" dir="auto">
                      {lang === "en" ? localizeYearLabel(entry.year) : entry.year}
                    </p>

                    <div>
                      <p className="text-[13px] leading-relaxed text-muted-foreground">
                        {t(entry.note)}
                      </p>
                      {isFamily ? (
                        <p className="label-caps mt-1.5 text-bronze dark:text-gold">
                          {t(copy.familyMutation)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-2 mb-8">
            <p className="label-caps mb-2.5 text-muted-foreground">{t(copy.siblingEyebrow)}</p>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              {t(copy.siblingNote)}
              <span className="ms-1 text-[13px] text-foreground/85">
                ({t(dnaInfo.siblingFamilies.region)})
              </span>
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
              {siblingFamilyNames.map((name) => (
                <li key={name} className="font-naskh text-sm text-foreground rtl:text-[15px]">
                  {name}
                </li>
              ))}
            </ul>
          </div>

          <p className="measure border-s-2 border-bronze/40 ps-5 text-[13px] leading-relaxed text-muted-foreground dark:border-gold/40">
            {t(dnaInfo.timelineNote)}
          </p>

          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            <figure>
              <a
                href="/images/dna_z20777_haplogroup_tree.png"
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-border"
              >
                <img
                  src="/images/dna_z20777_haplogroup_tree.png"
                  alt=""
                  className="w-full bg-white object-contain"
                  loading="lazy"
                />
              </a>
              <figcaption className="mt-3 flex items-start gap-2.5 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
                <span
                  className="mt-1.5 h-px w-5 shrink-0 bg-bronze dark:bg-gold"
                  aria-hidden="true"
                />
                <span>{t(copy.chartCaption)}</span>
              </figcaption>
            </figure>

            <figure>
              <a
                href="/images/dna_haplogroup_tree_v2_full.png"
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-border"
              >
                <img
                  src="/images/dna_haplogroup_tree_v2_full.png"
                  alt=""
                  className="w-full bg-white object-contain"
                  loading="lazy"
                />
              </a>
              <figcaption className="mt-3 flex items-start gap-2.5 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
                <span
                  className="mt-1.5 h-px w-5 shrink-0 bg-bronze dark:bg-gold"
                  aria-hidden="true"
                />
                <span>{t(copy.chartCaption2)}</span>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* ── Distribution table ─────────────────────────────── */}
        <section
          id="distribution"
          className="scroll-mt-28 reveal-on-scroll mt-16 border-t border-border pt-10"
        >
          <Eyebrow>{t(copy.distEyebrow)}</Eyebrow>
          <h2 className="mt-3 text-xl text-foreground md:text-2xl">{t(copy.distTitle)}</h2>
          <p className="measure mt-2 text-[13px] leading-relaxed text-muted-foreground">
            {t(copy.distNote)}
          </p>

          <div className="mt-7 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[48rem] border-collapse">
              <thead>
                <tr className="border-y border-ink/25 dark:border-ivory/20">
                  <th scope="col" className="label-caps py-2.5 text-start text-muted-foreground">
                    {t(copy.colRegion)}
                  </th>
                  <th scope="col" className="label-caps py-2.5 text-start text-muted-foreground">
                    {t(copy.colAreas)}
                  </th>
                  <th scope="col" className="label-caps py-2.5 text-start text-muted-foreground">
                    {t(copy.colFamilies)}
                  </th>
                  <th scope="col" className="label-caps w-44 py-2.5 text-end text-muted-foreground">
                    {t(copy.colShare)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {distributionData.map((row, i) => (
                  <tr key={i} className="border-b border-border align-baseline">
                    <td className="py-4 pe-6 text-sm font-medium text-foreground">
                      <img
                        src={`https://flagcdn.com/24x18/${row.flagCode}.png`}
                        srcSet={`https://flagcdn.com/48x36/${row.flagCode}.png 2x`}
                        width={20}
                        height={15}
                        alt=""
                        loading="lazy"
                        className="me-2 inline-block rounded-[2px] align-middle ring-1 ring-ink/10 dark:ring-ivory/15"
                      />
                      {t(row.country)}
                    </td>
                    <td className="py-4 pe-6 text-[13px] leading-snug text-muted-foreground">
                      {t(row.regions)}
                    </td>
                    <td className="py-4 pe-6 text-[13px] leading-snug text-muted-foreground">
                      {t(row.families)}
                      <span className="mt-1.5 block text-muted-foreground">{t(row.note)}</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-end gap-3">
                        <span className="h-1.5 w-20 shrink-0 bg-border" aria-hidden="true">
                          <span
                            className="block h-full bg-bronze dark:bg-gold"
                            style={{ width: row.barWidth }}
                          />
                        </span>
                        <span className="nums w-20 shrink-0 text-end font-mono text-[13px] whitespace-nowrap text-foreground">
                          {t(row.sampleLabel)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-7 border-t border-ink/25 md:hidden dark:border-ivory/20">
            {distributionData.map((row, i) => (
              <Record
                key={i}
                title={
                  <>
                    <img
                      src={`https://flagcdn.com/24x18/${row.flagCode}.png`}
                      srcSet={`https://flagcdn.com/48x36/${row.flagCode}.png 2x`}
                      width={20}
                      height={15}
                      alt=""
                      loading="lazy"
                      className="me-2 inline-block rounded-[2px] align-middle ring-1 ring-ink/10 dark:ring-ivory/15"
                    />
                    {t(row.country)}
                  </>
                }
              >
                <RecordField label={t(copy.colAreas)}>{t(row.regions)}</RecordField>
                <RecordField label={t(copy.colShare)} mono>
                  {t(row.sampleLabel)}
                </RecordField>
                <div className="h-1.5 w-full bg-border" aria-hidden="true">
                  <span
                    className="block h-full bg-bronze dark:bg-gold"
                    style={{ width: row.barWidth }}
                  />
                </div>
                <p className="pt-1 text-[13px] leading-snug text-muted-foreground">
                  {t(row.families)}
                  <span className="mt-1 block text-muted-foreground">{t(row.note)}</span>
                </p>
              </Record>
            ))}
          </div>
        </section>

        {/* ── Genetic Documents Showcase ───────────────────────── */}
        <section
          id="method"
          className="scroll-mt-28 reveal-on-scroll mt-16 border-t border-border pt-10"
        >
          <Eyebrow>
            {t({ ar: "الوثائق والأرشيف الجيني", en: "Genomic & Lineage Archives" })}
          </Eyebrow>
          <p className="measure mt-3 text-[13px] leading-relaxed text-muted-foreground">
            {t({
              ar: "الوثائق العلمية والتقارير الجينية المعتمدة، بما في ذلك لوحات الشجرة الجينية المصورة وثيقة النسب.",
              en: "Approved scientific documents and genetic reports, including illustrated haplogroup charts and lineage documentation.",
            })}
          </p>
          <DocumentShowcase
            refs={["Genealogy Archive", "DNA Archive", "IP-Registered"]}
            variant="grid"
            className="mt-6"
          />
        </section>

        {/* ── Databases ──────────────────────────────────────── */}
        <section
          id="dna-sources"
          className="scroll-mt-28 reveal-on-scroll mt-16 border-t border-border pt-10"
        >
          <Eyebrow>{t(copy.sourcesEyebrow)}</Eyebrow>
          <p className="measure mt-3 text-[13px] leading-relaxed text-muted-foreground">
            {t(copy.sourcesNote)}
          </p>

          <ul className="mt-5 max-w-2xl">
            {dnaInfo.databases.map((db) => (
              <li key={db.name} className="border-b border-border first:border-t">
                <a
                  href={db.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 py-4"
                >
                  <span className="text-sm font-medium text-foreground transition-colors group-hover:text-bronze dark:group-hover:text-gold">
                    {db.name}
                  </span>
                  <ExternalLink
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-bronze dark:group-hover:text-gold"
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>

          <Link
            to="/about"
            className="tap-target-y mt-8 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
          >
            {t(copy.lineageCta)}
            <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </>
  );
}
