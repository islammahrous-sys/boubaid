import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { dnaInfo } from "@/content/site";
import { pageImages } from "@/content/images";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow, Prose, Record, RecordField } from "@/components/site/Editorial";
import { DocumentShowcase } from "@/components/site/DocumentShowcase";
import { stripLeadingLabel } from "@/lib/text";

export const Route = createFileRoute("/dna")({
  head: () => ({
    meta: [
      { title: "الدراسة الجينية J-Z20777 | أسرة آل بوعبيد" },
      {
        name: "description",
        content:
          "نتائج فحوصات سلالة الكروموسوم الذكري (Y-DNA) لأسرة آل بوعبيد ضمن شجرة التحور J-Z20777، وصولاً إلى التحور الطرفي J-BY37877 حيث يظهر اسم آل بوعبيد صراحةً في لوحتي الأسرة الجينيتين، والتسلسل الزمني للطفرات وانتشارها الجغرافي.",
      },
      { property: "og:title", content: "الدراسة الجينية — آل بوعبيد" },
      { property: "og:type", content: "article" },
    ],
  }),
  component: DnaPage,
});

const copy = {
  eyebrow: { ar: "دراسة علمية", en: "Scientific study" } as BiText,
  subtitle: {
    ar: "نتائج فحوصات سلالة الكروموسوم الذكري (Y-DNA) لعينات من أبناء الأسرة، وموضع التحور في الشجرة الجينية العالمية، وانتشاره الجغرافي في الجزيرة العربية والخليج.",
    en: "Results of Y-chromosome testing on samples from family members, the position of the haplogroup within the global genetic tree, and its geographic distribution across Arabia and the Gulf.",
  } as BiText,

  metaHaplogroup: { ar: "التحور", en: "Haplogroup" } as BiText,
  metaSystem: { ar: "النظام", en: "System" } as BiText,
  metaSystemValue: { ar: "Y-DNA (خط الأب)", en: "Y-DNA (paternal line)" } as BiText,
  metaSamples: { ar: "نطاق العينات", en: "Sample range" } as BiText,
  metaSamplesValue: { ar: "الفروع السبعة", en: "All seven branches" } as BiText,

  noteLabel: { ar: "تنويه منهجي", en: "Methodological note" } as BiText,

  overviewEyebrow: { ar: "ملخص", en: "Summary" } as BiText,
  overviewTitle: {
    ar: "موضع الأسرة في الشجرة الجينية",
    en: "The family's position in the genetic tree",
  } as BiText,

  cladeEyebrow: { ar: "السلسلة التحورية", en: "Clade hierarchy" } as BiText,
  cladeTitle: { ar: "من J1-M267 إلى J-BY37877", en: "From J1-M267 to J-BY37877" } as BiText,
  cladeNote: {
    ar: "يُقرأ التسلسل من التحور الجذري الأعلى إلى التحور الطرفي الخاص بالأسرة.",
    en: "Read from the upstream root haplogroup down to the terminal clade specific to the family.",
  } as BiText,
  cladeRoot: { ar: "التحور الجذري", en: "Root" } as BiText,
  cladeTerminal: { ar: "التحور الطرفي", en: "Terminal" } as BiText,

  timelineEyebrow: { ar: "التسلسل الزمني", en: "Chronology" } as BiText,
  timelineTitle: {
    ar: "من J-Z20775 إلى J-BY37877",
    en: "From J-Z20775 to J-BY37877",
  } as BiText,
  timelineNote: {
    ar: "تقديرات زمن السلف المشترك الأحدث (TMRCA)، مأخوذة من لوحتي الشجرة الجينية المعتمدتين من الأسرة، مقروءة من الأقدم إلى الأحدث.",
    en: "Estimated time to most recent common ancestor (TMRCA), taken from the family's two haplogroup charts, read oldest to most recent.",
  } as BiText,
  familyMutation: {
    ar: "التحور الطرفي — تظهر تحته «آل بوعبيد»",
    en: 'Terminal mutation — "Al Bu Obaid" is named here',
  } as BiText,

  siblingEyebrow: { ar: "العوائل المتحالفة جينياً", en: "Genetically allied families" } as BiText,
  siblingNote: {
    ar: "عوائل تشترك مع آل بوعبيد في التحور الطرفي ذاته (J-BY37877)، بحسب لوحتي الشجرة الجينية للأسرة:",
    en: "Families sharing the same terminal mutation (J-BY37877) with Al Bu Obaid, per the family's two haplogroup charts:",
  } as BiText,
  chartCaption: {
    ar: "الإصدار الأول للشجرة الجينية الرسمية للتحور J-Z20777 (وثيقة مصورة كاملة قابلة للتكبير).",
    en: "The first edition of the family's official haplogroup chart for the J-Z20777 mutation (full source document — click to enlarge).",
  } as BiText,
  chartCaption2: {
    ar: "الإصدار الثاني (المنقّح) لشجرة السلالة الجينية، ويُظهر السلسلة الكاملة من J-Z20775 وحتى J-BY37877.",
    en: "The second (revised) edition of the haplogroup chart, showing the full chain from J-Z20775 to J-BY37877.",
  } as BiText,

  distEyebrow: { ar: "بيانات", en: "Data" } as BiText,
  distTitle: { ar: "الانتشار الجغرافي للتحور", en: "Geographic distribution" } as BiText,
  distNote: {
    ar: "أعداد العينات الموثقة في قواعد البيانات العالمية، لا نسب سكانية. والأعمدة نسبية إلى أكبر تجمع موثق.",
    en: "Counts of documented samples in the international databases — not population percentages. Bars are relative to the largest documented cluster.",
  } as BiText,
  colRegion: { ar: "الدولة", en: "Country" } as BiText,
  colAreas: { ar: "المناطق", en: "Regions" } as BiText,
  colFamilies: { ar: "العوائل والملاحظة", en: "Families & note" } as BiText,
  colShare: { ar: "العينات", en: "Samples" } as BiText,

  sourcesEyebrow: { ar: "قواعد البيانات", en: "Databases" } as BiText,
  sourcesNote: {
    ar: "نتائج التحور مقيدة ومتاحة للمراجعة في قواعد البيانات الجينية العالمية التالية.",
    en: "The haplogroup results are registered and available for review in the following international genetic databases.",
  } as BiText,

  lineageCta: {
    ar: "النسب الموثق بالمصادر التاريخية",
    en: "The documented historical lineage",
  } as BiText,
};

export function DnaPage() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;

  const clades = dnaInfo.parentClade.split(">").map((c) => c.trim());

  return (
    <>
      <PageHeader
        variant="document"
        eyebrow={t(copy.eyebrow)}
        title={t(dnaInfo.title)}
        subtitle={t(copy.subtitle)}
        meta={[
          { label: t(copy.metaHaplogroup), value: dnaInfo.haplogroup, mono: true },
          { label: t(copy.metaSystem), value: t(copy.metaSystemValue) },
          { label: t(copy.metaSamples), value: t(copy.metaSamplesValue) },
        ]}
      />

      <div className="container-page pb-20">
        {/* ── Methodological note, stated up front ───────────── */}
        <aside className="border-s-2 border-bronze/50 ps-5 dark:border-gold/50">
          <p className="label-caps mb-2 text-bronze dark:text-gold">{t(copy.noteLabel)}</p>
          <p className="measure text-[13px] leading-relaxed text-muted-foreground">
            {stripLeadingLabel(t(dnaInfo.disclaimer))}
          </p>
        </aside>

        {/* ── Summary ────────────────────────────────────────── */}
        <section className="reveal-on-scroll mt-14 grid gap-10 lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-16">
          <div>
            <Eyebrow>{t(copy.overviewEyebrow)}</Eyebrow>
            <p className="nums mt-4 font-mono text-4xl text-foreground">{dnaInfo.haplogroup}</p>
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
        <section className="reveal-on-scroll mt-16 border-t border-border pt-10">
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
        <section className="reveal-on-scroll mt-16 border-t border-border pt-10">
          <Eyebrow>{t(copy.timelineEyebrow)}</Eyebrow>
          <h2 className="mt-3 text-xl text-foreground md:text-2xl">{t(copy.timelineTitle)}</h2>
          <p className="measure mt-2 text-[13px] leading-relaxed text-muted-foreground">
            {t(copy.timelineNote)}
          </p>

          <ol className="mt-8">
            {dnaInfo.haplogroupTimeline.map((entry, i, arr) => {
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
                      {entry.year}
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
              {dnaInfo.siblingFamilies.names.map((name) => (
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
        <section className="reveal-on-scroll mt-16 border-t border-border pt-10">
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
                {dnaInfo.geographicDistribution.map((row, i) => (
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
            {dnaInfo.geographicDistribution.map((row, i) => (
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
        <section className="reveal-on-scroll mt-16 border-t border-border pt-10">
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
        <section className="reveal-on-scroll mt-16 border-t border-border pt-10">
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
            className="mt-8 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
          >
            {t(copy.lineageCta)}
            <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </>
  );
}
