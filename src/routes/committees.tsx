import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Download, Eye, FileText } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { hqProject, siteMeta } from "@/content/site";
import { committeeDocuments } from "@/content/committee-documents";
import { openMediaViewer } from "@/components/site/GlobalMediaViewer";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionRail, type RailSection } from "@/components/site/SectionRail";
import { Eyebrow, Ornament } from "@/components/site/Editorial";
import { HqProjectVideo } from "@/components/site/HqProjectVideo";
import {
  CommitteeYearGrid,
  type CommitteeArchiveItem,
} from "@/components/site/CommitteeYearGrid";
import { getCanonicalUrl } from "@/lib/seo";
import { getPublishedInitiatives, getPublishedLibrary } from "@/lib/cms.functions";
import { mapInitiativeRow } from "@/content/cms-adapt";
import { downloadFile } from "@/lib/download";
import masterChartAr from "@/assets/committee-charts-current/master-ar.png.asset.json";
import masterChartEn from "@/assets/committee-charts-current/master-en.png.asset.json";
import { copy } from "@/content/page-copy/committees";

const LOVABLE_ASSET_ORIGIN = "https://alboabid-heritage-hub.lovable.app";

function publicAssetUrl(path: string) {
  return new URL(path, LOVABLE_ASSET_ORIGIN).toString();
}

export const Route = createFileRoute("/committees")({
  loader: async () => {
    const [rows, initiatives] = await Promise.all([
      getPublishedLibrary(),
      getPublishedInitiatives().catch(() => []),
    ]);
    const hqRow = initiatives.find((r) => r.slug === "permanent-hq");
    return {
      charts: rows
        .filter((row) => row.collection === "committee_charts" && row.is_published)
        .sort((a, b) => a.sort_order - b.sort_order),
      hq: hqRow ? mapInitiativeRow(hqRow) : null,
    };
  },
  head: () => ({
    meta: [
      { title: "اللجان | آل بوعبيد" },
      {
        name: "description",
        content: `لجان مجلس أسرة آل بوعبيد في صندوق التنمية العائلية (آل بوعبيد) وفق ترخيص NCNP رقم ${siteMeta.ncnpLicense}.`,
      },
      { property: "og:title", content: "اللجان — آل بوعبيد" },
      {
        property: "og:description",
        content: "لجان مجلس أسرة آل بوعبيد.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: getCanonicalUrl("/committees") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/committees") }],
  }),
  component: CommitteesPage,
});



const years: { id: string; year: number; eyebrow: BiText; title: BiText; note: BiText }[] = [
  {
    id: "y1445",
    year: 1445,
    eyebrow: { ar: "ثانياً", en: "Article II" },
    title: { ar: "١٤٤٥ هـ", en: "1445 AH" },
    note: {
      ar: "الهيكل التنظيمي للجان، والخطابات الرسمية وخطط اللجان لعام ١٤٤٥ هـ.",
      en: "The committees' organisational chart, official letters and standing-committee plans for 1445 AH.",
    },
  },
  {
    id: "y1444",
    year: 1444,
    eyebrow: { ar: "ثالثاً", en: "Article III" },
    title: { ar: "١٤٤٤ هـ", en: "1444 AH" },
    note: {
      ar: "خطط اللجان والخطابات الرسمية لعام ١٤٤٤ هـ.",
      en: "Plans of the standing committees and official letters for 1444 AH.",
    },
  },
];

const railSections: RailSection[] = [
  { id: "y1448", label: { ar: "١٤٤٨ هـ", en: "1448 AH" } },
  { id: "hq-project", label: { ar: "مشروع المقر", en: "HQ Project" } },
  { id: "y1445", label: { ar: "١٤٤٥ هـ", en: "1445 AH" } },
  { id: "y1444", label: { ar: "١٤٤٤ هـ", en: "1444 AH" } },
];

function CommitteesPage() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;
  const { charts, hq } = Route.useLoaderData();
  const chartRecords = charts as CommitteeArchiveItem[];
  const hqTitle = hq?.title ?? hqProject.title;
  const hqSummary = hq?.summary && (hq.summary.ar || hq.summary.en) ? hq.summary : hqProject.fundingModel;
  const masterHref = publicAssetUrl(lang === "en" ? masterChartEn.url : masterChartAr.url);

  return (
    <>
      <PageHeader
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
        meta={[
          { label: t(copy.metaLicence), value: siteMeta.ncnpLicense, mono: true },
          { label: t(copy.metaAuthority), value: t(siteMeta.ncnpAuthority) },
          { label: t(copy.metaRegistered), value: t(siteMeta.foundedHijriLabel) },
        ]}
      />

      <SectionRail sections={railSections} className="print-hide" />

      <div className="container-page py-14 md:py-16">
        {/* ── ١٤٤٨ هـ ─────────────────────────────────────────── */}
        <section id="y1448" className="scroll-mt-28 reveal-on-scroll">
          <Eyebrow>{t({ ar: "أولاً", en: "Article I" })}</Eyebrow>
          <h2 className="mt-3 text-xl leading-tight text-foreground md:text-2xl">
            {t({ ar: "١٤٤٨ هـ", en: "1448 AH" })}
          </h2>
          <div className="mt-6 rounded-md border border-bronze/40 bg-secondary/40 px-6 py-12 text-center dark:border-gold/40">
            <p className="label-caps text-bronze dark:text-gold">
              {t({ ar: "مجلس أسرة آل بوعبيد", en: "Al Bu Obaid Family Council" })}
            </p>
            <p className="mt-4 text-4xl font-bold leading-tight text-foreground md:text-6xl">
              {t({ ar: "انتظرونا قريباً", en: "Coming Soon" })}
            </p>
            <p className="measure mx-auto mt-4 text-[14px] leading-relaxed text-muted-foreground">
              {t({
                ar: "ستُنشر هنا الأنشطة المخطط لها لكل لجنة من لجان مجلس الأسرة لعام ١٤٤٨ هـ.",
                en: "The planned activities of each Family Council committee for 1448 AH will be published here.",
              })}
            </p>
          </div>
          <CommitteeYearGrid rows={chartRecords} kind="PLAN" />

          {/* مشروع مقر مجلس الأسرة — under لجنة شؤون مقر مجلس الأسرة */}
          <article
            id="hq-project"
            className="scroll-mt-28 mt-10 rounded-md border border-border bg-card p-5 md:p-8"
          >
            <p className="label-caps text-bronze dark:text-gold">
              {t({ ar: "لجنة شؤون مقر مجلس الأسرة", en: "Family Council Headquarters Affairs Committee" })}
            </p>
            <h3 className="mt-3 text-xl font-semibold leading-tight text-foreground md:text-2xl">
              {t(hqTitle)}
            </h3>
            <div className="mt-6 grid gap-8 lg:grid-cols-2">
              <HqProjectVideo label={t(hqTitle)} className="aspect-[4/3] w-full" />
              <div>
                <dl className="space-y-3 text-[14px]">
                  <div>
                    <dt className="label-caps text-muted-foreground">{t({ ar: "الموقع", en: "Location" })}</dt>
                    <dd className="mt-1 text-foreground">{t(hqProject.location)}</dd>
                  </div>
                  <div>
                    <dt className="label-caps text-muted-foreground">{t({ ar: "المرحلة", en: "Stage" })}</dt>
                    <dd className="mt-1 text-foreground">{t(hqProject.status)}</dd>
                  </div>
                  <div>
                    <dt className="label-caps text-muted-foreground">{t({ ar: "التمويل", en: "Funding" })}</dt>
                    <dd className="mt-1 leading-relaxed text-muted-foreground">{t(hqSummary)}</dd>
                  </div>
                </dl>
                <div className="mt-5">
                  <div className="flex items-baseline justify-between">
                    <span className="label-caps text-muted-foreground">
                      {t({ ar: "نسبة الإنجاز", en: "Completion" })}
                    </span>
                    <span className="nums font-mono text-xl text-foreground">{hqProject.progress}%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-border" role="progressbar" aria-valuenow={hqProject.progress} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full bg-bronze dark:bg-gold" style={{ width: `${hqProject.progress}%` }} />
                  </div>
                </div>
                <Link
                  to="/contribute"
                  search={{ purpose: "hq_project" }}
                  className="mt-6 inline-flex items-center gap-2 border border-ink bg-ink px-4 py-2.5 text-xs font-bold text-ivory transition-colors hover:bg-transparent hover:text-foreground dark:border-gold dark:bg-gold dark:text-ink dark:hover:bg-transparent dark:hover:text-gold"
                >
                  {t({ ar: "ننتظر دعمك", en: "We await your support" })}
                  <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </article>

          <Link
            to="/requests"
            hash="committee-requests"
            className="mt-8 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
          >
            {t({ ar: "رشّح نفسك لعضوية إحدى اللجان", en: "Nominate yourself for a committee" })}
            <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </section>

        {years.map((year) => {
          const documents = committeeDocuments.filter((document) => document.year === year.year);

          return (
            <section
              key={year.id}
              id={year.id}
              className="scroll-mt-28 reveal-on-scroll mt-16 border-t border-border pt-12"
            >
              <div className="grid gap-8 lg:grid-cols-[minmax(0,14rem)_1fr] lg:gap-16">
                <div>
                  <Eyebrow>{t(year.eyebrow)}</Eyebrow>
                  <h2 className="mt-3 text-xl leading-tight text-foreground md:text-2xl">
                    {t(year.title)}
                  </h2>
                </div>
                <div>
                  <p className="measure text-[13px] leading-relaxed text-muted-foreground">
                    {t(year.note)}
                  </p>

                  {year.year === 1445 ? (
                    <CommitteeChartCard
                      href={masterHref}
                      title={t(copy.masterChartTitle)}
                      viewLabel={t(copy.viewChart)}
                      downloadLabel={t(copy.downloadChart)}
                    />
                  ) : null}

                  <ul className="mt-6 border-t border-border">
                    {documents.map((document) => (
                      <li
                        key={document.id}
                        className="flex items-center justify-between gap-4 border-b border-border py-3.5 transition-colors hover:bg-secondary/30"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <FileText
                            className="h-4 w-4 shrink-0 text-bronze/70 dark:text-gold/60"
                            aria-hidden="true"
                          />
                          <span className="truncate text-[14px] font-medium text-foreground">
                            {t(document.title)}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            openMediaViewer({
                              src: `/api/public/committee-doc?id=${document.id}`,
                              kind: "pdf",
                              title: t(document.title),
                            })
                          }
                          className="shrink-0 border-b border-bronze pb-0.5 text-[13px] font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                        >
                          {t(copy.viewDoc)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          );
        })}

        <Ornament className="mt-16" />

        {/* ── الوثائق النظامية ──────────────────────────────── */}
        <section className="reveal-on-scroll mt-16">
          <Eyebrow>{t(copy.docsEyebrow)}</Eyebrow>
          <p className="measure mt-3 text-[13px] leading-relaxed text-muted-foreground">
            {t(copy.docsNote)}
          </p>

          <Link
            to="/fund-certificates"
            className="mt-8 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
          >
            {t(copy.archiveCta)}
            <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </>
  );
}

function CommitteeChartCard({
  href,
  title,
  viewLabel,
  downloadLabel,
}: {
  href: string;
  title: string;
  viewLabel: string;
  downloadLabel: string;
}) {
  return (
    <figure className="mt-6 overflow-hidden rounded-md border border-border bg-card">
      <button
        type="button"
        onClick={() => openMediaViewer({ src: href, kind: "image", title })}
        className="flex w-full items-center justify-center bg-muted/30 p-3 transition-colors hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-4"
        aria-label={`${viewLabel} — ${title}`}
      >
        <img
          src={href}
          alt={title}
          loading="lazy"
          className="block aspect-video w-full object-contain"
        />
      </button>
      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
        <span className="break-words text-[13px] font-medium text-foreground">{title}</span>
        <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <button
            type="button"
            onClick={() => openMediaViewer({ src: href, kind: "image", title })}
            className="inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-[13px] font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            {viewLabel}
          </button>
          <button
            type="button"
            onClick={() => void downloadFile(href, title)}
            className="inline-flex items-center gap-2 border-b border-transparent pb-0.5 text-[13px] font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            {downloadLabel}
          </button>
        </span>
      </figcaption>
    </figure>
  );
}
