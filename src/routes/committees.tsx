import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { hqProject, siteMeta } from "@/content/site";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionRail, type RailSection } from "@/components/site/SectionRail";
import { Eyebrow, Ornament } from "@/components/site/Editorial";
import { HqProjectVideo } from "@/components/site/HqProjectVideo";
import { CommitteeYearGrid, type CommitteeArchiveItem } from "@/components/site/CommitteeYearGrid";
import { getCanonicalUrl } from "@/lib/seo";
import { getPublishedInitiatives, getPublishedLibrary } from "@/lib/cms.functions";
import { mapInitiativeRow } from "@/content/cms-adapt";
import { copy } from "@/content/page-copy/committees";
import { resolveCommitteeDocuments } from "@/content/committee-documents";
import { formatDualHijriYear } from "@/lib/dates";
import { openMediaViewer } from "@/components/site/GlobalMediaViewer";
// 1445 org maps are served as plain static files from public/ so they render
// on every host (Lovable, Vercel, custom domains) — not only Lovable's asset CDN.
const map1445Ar = {
  url: "/images/committee-charts-1445/org-map-1445-ar.png",
  original_filename: "org-map-1445-ar.png",
};
const map1445En = {
  url: "/images/committee-charts-1445/org-map-1445-en.png",
  original_filename: "org-map-1445-en.png",
};

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
      documents: resolveCommitteeDocuments(rows),
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

const railSections: RailSection[] = [
  { id: "y1448", label: { ar: "١٤٤٨ هـ", en: "1448 AH" } },
  { id: "hq-project", label: { ar: "مشروع المقر", en: "HQ Project" } },
  { id: "y1445", label: { ar: "١٤٤٥ هـ", en: "1445 AH" } },
];

function CommitteesPage() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;
  const { charts, hq, documents } = Route.useLoaderData();
  // Work years that only exist in the CMS (e.g. a future year) get their own list.
  const extraYears = [...new Set(documents.map((d) => d.year))]
    .filter((y) => ![1444, 1445, 1448].includes(y))
    .sort((a, b) => b - a);
  const chartRecords = charts as CommitteeArchiveItem[];
  const hqTitle = hq?.title ?? hqProject.title;
  const hqSummary =
    hq?.summary && (hq.summary.ar || hq.summary.en) ? hq.summary : hqProject.fundingModel;
  const map1445 = rtl ? map1445Ar : map1445En;
  const map1445Title = {
    ar: "الخريطة التنظيمية للجان ١٤٤٥ هـ",
    en: "Committees Organizational Map 1445 AH",
  };

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
            <p className="mt-4 text-3xl font-bold leading-tight text-foreground md:text-5xl">
              {t({ ar: "خطة أنشطة اللجان لعام ١٤٤٨ هـ", en: "Committee Annual Plan 1448 AH" })}
            </p>
            <p className="measure mx-auto mt-4 text-[14px] leading-relaxed text-muted-foreground">
              {t({
                ar: "البرامج والمبادرات المعتمدة لكل لجنة من لجان مجلس الأسرة وفق الجدول الزمني لعام ١٤٤٨ هـ.",
                en: "Approved programs and initiatives for each Family Council committee according to the schedule for 1448 AH.",
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
              {t({
                ar: "لجنة شؤون مقر مجلس الأسرة",
                en: "Family Council Headquarters Affairs Committee",
              })}
            </p>
            <h3 className="mt-3 text-xl font-semibold leading-tight text-foreground md:text-2xl">
              {t(hqTitle)}
            </h3>
            <div className="mt-6 grid gap-8 lg:grid-cols-2">
              <HqProjectVideo label={t(hqTitle)} className="aspect-[4/3] w-full" />
              <div>
                <dl className="space-y-3 text-[14px]">
                  <div>
                    <dt className="label-caps text-muted-foreground">
                      {t({ ar: "الموقع", en: "Location" })}
                    </dt>
                    <dd className="mt-1 text-foreground">{t(hqProject.location)}</dd>
                  </div>
                  <div>
                    <dt className="label-caps text-muted-foreground">
                      {t({ ar: "المرحلة", en: "Stage" })}
                    </dt>
                    <dd className="mt-1 text-foreground">{t(hqProject.status)}</dd>
                  </div>
                  <div>
                    <dt className="label-caps text-muted-foreground">
                      {t({ ar: "التمويل", en: "Funding" })}
                    </dt>
                    <dd className="mt-1 leading-relaxed text-muted-foreground">{t(hqSummary)}</dd>
                  </div>
                </dl>
                <div className="mt-5">
                  <div className="flex items-baseline justify-between">
                    <span className="label-caps text-muted-foreground">
                      {t({ ar: "نسبة الإنجاز", en: "Completion" })}
                    </span>
                    <span className="nums font-mono text-xl text-foreground">
                      {hqProject.progress}%
                    </span>
                  </div>
                  <div
                    className="mt-2 h-1.5 w-full bg-border"
                    role="progressbar"
                    aria-valuenow={hqProject.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full bg-bronze dark:bg-gold"
                      style={{ width: `${hqProject.progress}%` }}
                    />
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

          {/* ١٤٤٥ هـ — organisational map and documents, nested under 1448 */}
          <div
            id="y1445"
            className="scroll-mt-28 mt-10 overflow-hidden rounded-md border border-border bg-card md:p-8"
          >
            <div className="px-4 pt-5 md:px-0 md:pt-0">
              <p className="label-caps text-bronze dark:text-gold">
                {t({ ar: "الخريطة التنظيمية ١٤٤٥ هـ", en: "1445 AH Organizational Map" })}
              </p>
              <h3 className="mt-3 text-xl font-semibold leading-tight text-foreground md:text-2xl">
                {t({ ar: "١٤٤٥ هـ", en: "1445 AH" })}
              </h3>
            </div>
            <figure className="mt-5 md:mt-6">
              <button
                type="button"
                onClick={() =>
                  openMediaViewer({ src: map1445.url, kind: "image", title: t(map1445Title) })
                }
                className="block aspect-video w-full overflow-hidden border-y border-border bg-background md:rounded md:border"
                aria-label={t({ ar: "تكبير الخريطة التنظيمية", en: "Enlarge organizational map" })}
              >
                <img
                  key={map1445.url}
                  src={map1445.url}
                  alt={t(map1445Title)}
                  className="h-full w-full object-contain"
                  width={1280}
                  height={720}
                  decoding="async"
                />
              </button>
              <div className="mt-3 flex flex-wrap gap-4 px-4 text-[13px] font-medium md:px-0">
                <button
                  type="button"
                  onClick={() =>
                    openMediaViewer({ src: map1445.url, kind: "image", title: t(map1445Title) })
                  }
                  className="border-b border-bronze pb-0.5 text-bronze hover:text-foreground dark:border-gold dark:text-gold"
                >
                  {t({ ar: "عرض وتكبير", en: "View / enlarge" })}
                </button>
                <a
                  href={map1445.url}
                  download={map1445.original_filename}
                  className="border-b border-bronze pb-0.5 text-bronze hover:text-foreground dark:border-gold dark:text-gold"
                >
                  {t({ ar: "تنزيل", en: "Download" })}
                </a>
              </div>
            </figure>
            <ul className="mt-6 border-t border-border px-4 md:px-0">
              {documents
                .filter((d) => d.year === 1445)
                .map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between gap-4 border-b border-border py-3"
                  >
                    <span className="min-w-0 break-words text-[14px] text-foreground">
                      {t(d.title)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        openMediaViewer({
                          src: d.src,
                          kind: "pdf",
                          title: t(d.title),
                        })
                      }
                      className="shrink-0 border-b border-bronze pb-0.5 text-[13px] font-medium text-bronze hover:text-foreground dark:border-gold dark:text-gold"
                    >
                      {t({ ar: "عرض الوثيقة", en: "View document" })}
                    </button>
                  </li>
                ))}
            </ul>
          </div>

          {/* Work years added through the CMS (committee_documents) */}
          {extraYears.map((year) => (
            <div
              key={year}
              id={`y${year}`}
              className="scroll-mt-28 mt-10 overflow-hidden rounded-md border border-border bg-card px-4 py-5 md:p-8"
            >
              <h3 className="text-xl font-semibold leading-tight text-foreground md:text-2xl">
                {formatDualHijriYear(year, lang)}
              </h3>
              <ul className="mt-5 border-t border-border">
                {documents
                  .filter((d) => d.year === year)
                  .map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between gap-4 border-b border-border py-3"
                    >
                      <span className="min-w-0 break-words text-[14px] text-foreground">
                        {t(d.title)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          openMediaViewer({ src: d.src, kind: "pdf", title: t(d.title) })
                        }
                        className="shrink-0 border-b border-bronze pb-0.5 text-[13px] font-medium text-bronze hover:text-foreground dark:border-gold dark:text-gold"
                      >
                        {t({ ar: "عرض الوثيقة", en: "View document" })}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ))}

          <Link
            to="/requests"
            hash="committee-requests"
            className="tap-target-y mt-8 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
          >
            {t({ ar: "رشّح نفسك لعضوية إحدى اللجان", en: "Nominate yourself for a committee" })}
            <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </section>

        <Ornament className="mt-16" />

        {/* ── الوثائق النظامية ──────────────────────────────── */}
        <section className="reveal-on-scroll mt-16">
          <Eyebrow>{t(copy.docsEyebrow)}</Eyebrow>
          <p className="measure mt-3 text-[13px] leading-relaxed text-muted-foreground">
            {t(copy.docsNote)}
          </p>

          <Link
            to="/fund-certificates"
            className="tap-target-y mt-8 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
          >
            {t(copy.archiveCta)}
            <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </>
  );
}
