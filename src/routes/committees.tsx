import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Download, Eye, FileText } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { committees, siteMeta } from "@/content/site";
import { committeeDocuments } from "@/content/committee-documents";
import { openMediaViewer } from "@/components/site/GlobalMediaViewer";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionRail, type RailSection } from "@/components/site/SectionRail";
import { Eyebrow, Ornament } from "@/components/site/Editorial";
import { getCanonicalUrl } from "@/lib/seo";
import { getPublishedLibrary } from "@/lib/cms.functions";
import { downloadFile } from "@/lib/download";
import masterChartAr from "@/assets/committee-charts-1445/master-ar.png.asset.json";
import masterChartEn from "@/assets/committee-charts-1445/master-en.png.asset.json";

export const Route = createFileRoute("/committees")({
  loader: async () => {
    const rows = await getPublishedLibrary();
    return {
      charts: rows
        .filter((row) => row.collection === "committee_charts" && row.is_published)
        .sort((a, b) => a.sort_order - b.sort_order),
    };
  },
  head: () => ({
    meta: [
      { title: "اللجان | آل بوعبيد" },
      {
        name: "description",
        content: `اللجان التنفيذية في صندوق التنمية العائلية (آل بوعبيد): أعمال اللجان لعامي ١٤٤٤هـ و١٤٤٥هـ وفق ترخيص NCNP رقم ${siteMeta.ncnpLicense}.`,
      },
      { property: "og:title", content: "اللجان — آل بوعبيد" },
      {
        property: "og:description",
        content: "أعمال اللجان التنفيذية لعامي ١٤٤٤هـ و١٤٤٥هـ.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: getCanonicalUrl("/committees") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/committees") }],
  }),
  component: CommitteesPage,
});

const copy = {
  eyebrow: { ar: "الإطار النظامي", en: "Constitution" } as BiText,
  title: { ar: "اللجان", en: "Committees" } as BiText,
  subtitle: {
    ar: "تنبثق عن مجلس الأمناء ست لجان تنفيذية تمثل الفروع السبعة، لكل منها اختصاص محدد ورئيس مسؤول أمام المجلس.",
    en: "Six executive committees issue from the board of trustees, representing the seven branches, each with a defined remit and a chair answerable to the board.",
  } as BiText,

  metaLicence: { ar: "رقم الترخيص", en: "Licence no." } as BiText,
  metaAuthority: { ar: "جهة الإصدار", en: "Issuing authority" } as BiText,
  metaRegistered: { ar: "تاريخ الإشهار", en: "Registered" } as BiText,

  chairLabel: { ar: "رئيس اللجنة", en: "Chair" } as BiText,
  listTitle: { ar: "اللجان التنفيذية", en: "The Standing Committees" } as BiText,
  listNote: {
    ar: "تنبثق عن مجلس الأمناء ست لجان تنفيذية تمثل الفروع السبعة، لكل منها اختصاص محدد ورئيس مسؤول أمام المجلس.",
    en: "Six executive committees issue from the board, each with a defined remit and a chair answerable to the board.",
  } as BiText,

  masterChartTitle: {
    ar: "الهيكل التنظيمي للجان مجلس أسرة آل بوعبيد",
    en: "Organisational Chart of the Al Bu Obaid Family Council Committees",
  } as BiText,
  chartsEyebrow: { ar: "المخططات التنظيمية", en: "Organisational charts" } as BiText,
  viewChart: { ar: "عرض المخطط", en: "View chart" } as BiText,
  downloadChart: { ar: "تحميل المخطط", en: "Download chart" } as BiText,

  docsEyebrow: { ar: "الوثائق النظامية", en: "Constitutional documents" } as BiText,
  docsNote: {
    ar: "النسخ الموقعة مودعة لدى الأمانة العامة، وجميع نسخها الرقمية منشورة في صفحة الشهادات والإثباتات بصندوق التنمية العائلية.",
    en: "Signed copies are deposited with the secretariat; all digital copies are published on the fund's Certificates & Attestations page.",
  } as BiText,
  archiveCta: {
    ar: "الانتقال إلى الشهادات والإثباتات",
    en: "Go to Certificates & Attestations",
  } as BiText,

  viewDoc: { ar: "عرض الوثيقة", en: "View document" } as BiText,
};

const years: { id: string; year: number; eyebrow: BiText; title: BiText; note: BiText }[] = [
  {
    id: "y1445",
    year: 1445,
    eyebrow: { ar: "ثانياً", en: "Article II" },
    title: { ar: "١٤٤٥ هـ", en: "1445 AH" },
    note: {
      ar: "الهيكل التنظيمي للجان، والخطابات الرسمية وخطط اللجان التنفيذية لعام ١٤٤٥ هـ.",
      en: "The committees' organisational chart, official letters and standing-committee plans for 1445 AH.",
    },
  },
  {
    id: "y1444",
    year: 1444,
    eyebrow: { ar: "ثالثاً", en: "Article III" },
    title: { ar: "١٤٤٤ هـ", en: "1444 AH" },
    note: {
      ar: "خطط اللجان التنفيذية والخطابات الرسمية لعام ١٤٤٤ هـ.",
      en: "Plans of the standing committees and official letters for 1444 AH.",
    },
  },
];

const railSections: RailSection[] = [
  { id: "committees-list", label: { ar: "اللجان", en: "Committees" } },
  { id: "y1448", label: { ar: "١٤٤٨ هـ", en: "1448 AH" } },
  { id: "y1445", label: { ar: "١٤٤٥ هـ", en: "1445 AH" } },
  { id: "y1444", label: { ar: "١٤٤٤ هـ", en: "1444 AH" } },
  { id: "archive", label: { ar: "الأرشيف", en: "Archive" } },
];

/**
 * 1448H uploads are managed from Admin → Library (collection "committee_charts")
 * using the reference convention:
 *   COMM-1448-PLAN-<committee-id>-<n>   → Committees → 1448H planned activities
 *   COMM-1448-ARCH-<committee-id>-<n>   → Archive → 1448H
 */
function itemsFor(rows: CommitteeChart[], kind: "PLAN" | "ARCH", committeeId: string) {
  const prefix = `COMM-1448-${kind}-${committeeId}`.toUpperCase();
  return rows.filter((r) => (r.reference ?? "").toUpperCase().startsWith(prefix));
}

type CommitteeChart = {
  id: string;
  reference: string | null;
  title_ar: string;
  title_en: string | null;
  file_path: string | null;
  file_url?: string | null;
  external_url: string | null;
};

function chartHref(chart: CommitteeChart | null | undefined) {
  return chart?.file_url || chart?.file_path || chart?.external_url || null;
}

function CommitteesPage() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;
  const { charts } = Route.useLoaderData();
  const chartRecords = charts as CommitteeChart[];
  const masterHref = lang === "en" ? masterChartEn.url : masterChartAr.url;

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
        {/* ── اللجان التنفيذية ──────────────────────────────── */}
        <section id="committees-list" className="scroll-mt-28 reveal-on-scroll">
          <Eyebrow rule>{t(copy.listTitle)}</Eyebrow>
          <p className="measure mt-3 text-[13px] leading-relaxed text-muted-foreground">
            {t(copy.listNote)}
          </p>
          <dl className="mt-6 border-t border-border">
            {committees.map((c, i) => (
              <div
                key={c.id}
                className="grid grid-cols-[2.5rem_1fr] gap-x-5 border-b border-border py-5 transition-colors hover:bg-secondary/30"
              >
                <span
                  className="nums font-mono text-sm text-bronze/70 dark:text-gold/60"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <dt className="text-[15px] font-semibold text-foreground">{t(c.name)}</dt>
                  <dd className="measure mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {t(c.desc)}
                  </dd>
                  <dd className="mt-2.5 text-[13px]">
                    <span className="label-caps me-2 text-muted-foreground">
                      {t(copy.chairLabel)}
                    </span>
                    <span className="text-foreground">{t(c.lead)}</span>
                  </dd>
                </div>
              </div>
            ))}
          </dl>

          {/* "رشح نفسك" — nomination is submitted through the Requests Hub. */}
          <Link
            to="/requests"
            search={{ request: "committee_nomination" }}
            className="mt-6 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
          >
            {t({ ar: "رشّح نفسك لعضوية إحدى اللجان", en: "Nominate yourself for a committee" })}
            <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </section>

        {/* ── ١٤٤٨ هـ ─────────────────────────────────────────── */}
        <section
          id="y1448"
          className="scroll-mt-28 reveal-on-scroll mt-16 border-t border-border pt-12"
        >
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
        </section>

        {/* ── عام ١٤٤٤ / عام ١٤٤٥ ───────────────────────────── */}
        {years.map((y) => (
          <section
            key={y.id}
            id={y.id}
            className="scroll-mt-28 reveal-on-scroll mt-16 border-t border-border pt-12"
          >
            <div className="grid gap-8 lg:grid-cols-[minmax(0,14rem)_1fr] lg:gap-16">
              <div>
                <Eyebrow>{t(y.eyebrow)}</Eyebrow>
                <h2 className="mt-3 text-xl leading-tight text-foreground md:text-2xl">
                  {t(y.title)}
                </h2>
              </div>
              <div>
                <p className="measure text-[13px] leading-relaxed text-muted-foreground">
                  {t(y.note)}
                </p>
                {y.year === 1445 ? (
                  <div className="mt-6">
                    <CommitteeChartCard
                      chart={{ id: "master-1445", reference: null, title_ar: t(copy.masterChartTitle), title_en: null, file_path: null, external_url: null }}
                      hrefOverride={masterHref}
                      title={t(copy.masterChartTitle)}
                      labels={{ view: t(copy.viewChart), download: t(copy.downloadChart) }}
                      featured
                    />
                  </div>
                ) : null}
                {(() => {
                  const docs = committeeDocuments.filter((d) => d.year === y.year);
                  if (docs.length === 0) return null;
                  return (
                    <ul className="mt-6 border-t border-border">
                      {docs.map((doc) => (
                        <li
                          key={doc.id}
                          className="flex items-center justify-between gap-4 border-b border-border py-3.5 transition-colors hover:bg-secondary/30"
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <FileText
                              className="h-4 w-4 shrink-0 text-bronze/70 dark:text-gold/60"
                              aria-hidden="true"
                            />
                            <span className="truncate text-[14px] font-medium text-foreground">
                              {t(doc.title)}
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              openMediaViewer({
                                src: `/api/public/committee-doc?id=${doc.id}`,
                                kind: "pdf",
                                title: t(doc.title),
                              })
                            }
                            className="shrink-0 border-b border-bronze pb-0.5 text-[13px] font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                          >
                            {t(copy.viewDoc)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
            </div>
          </section>
        ))}

        {/* ── الأرشيف ───────────────────────────────────────────── */}
        <section id="archive" className="scroll-mt-28 reveal-on-scroll mt-16 border-t border-border pt-12">
          <Eyebrow rule>{t({ ar: "الأرشيف", en: "Archive" })}</Eyebrow>
          <h3 className="mt-6 text-lg font-semibold text-foreground">
            {t({ ar: "١٤٤٨ هـ", en: "1448 AH" })}
          </h3>
          <CommitteeYearGrid rows={chartRecords} kind="ARCH" />
          {years.map((y) => (
            <div key={y.id} className="mt-8 border-t border-border pt-6">
              <h3 className="text-lg font-semibold text-foreground">{t(y.title)}</h3>
              <a
                href={`#${y.id}`}
                className="mt-2 inline-block border-b border-bronze pb-0.5 text-[13px] font-medium text-bronze dark:border-gold dark:text-gold"
              >
                {t({ ar: "عرض المحتوى المؤرشف", en: "View archived content" })}
              </a>
            </div>
          ))}
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
  chart,
  hrefOverride,
  title,
  labels,
  featured = false,
}: {
  chart: CommitteeChart;
  hrefOverride?: string;
  title: string;
  labels: { view: string; download: string };
  featured?: boolean;
}) {
  const href = hrefOverride || chartHref(chart);
  if (!href) return null;
  const safeTitle = title || chart.title_ar;

  return (
    <figure
      className={
        featured
          ? "mt-6 overflow-hidden rounded-md border border-border bg-card"
          : "overflow-hidden rounded-md border border-border bg-card"
      }
    >
      <button
        type="button"
        onClick={() => openMediaViewer({ src: href, kind: "image", title: safeTitle })}
        className="flex w-full items-center justify-center bg-muted/30 p-3 transition-colors hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-4"
        aria-label={`${labels.view} — ${safeTitle}`}
      >
        <img
          src={href}
          alt={safeTitle}
          loading={featured ? "eager" : "lazy"}
          className="block aspect-video w-full object-contain"
        />
      </button>
      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
        <span className="break-words text-[13px] font-medium text-foreground">{safeTitle}</span>
        <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <button
            type="button"
            onClick={() => openMediaViewer({ src: href, kind: "image", title: safeTitle })}
            className="inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-[13px] font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            {labels.view}
          </button>
          <button
            type="button"
            onClick={() => void downloadFile(href, safeTitle)}
            className="inline-flex items-center gap-2 border-b border-transparent pb-0.5 text-[13px] font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            {labels.download}
          </button>
        </span>
      </figcaption>
    </figure>
  );
}

function CommitteeYearGrid({ rows, kind }: { rows: CommitteeChart[]; kind: "PLAN" | "ARCH" }) {
  const { t } = useLang();
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {committees.map((c) => {
        const items = itemsFor(rows, kind, c.id);
        return (
          <div key={c.id} className="rounded-md border border-border bg-card p-5">
            <h4 className="text-[15px] font-semibold text-foreground">{t(c.name)}</h4>
            {items.length === 0 ? (
              <p className="mt-3 text-[13px] text-muted-foreground">
                {kind === "PLAN"
                  ? t({ ar: "ستُضاف الأنشطة المخطط لها قريباً.", en: "Planned activities will be added soon." })
                  : t({ ar: "لا توجد مواد مؤرشفة بعد.", en: "No archived materials yet." })}
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {items.map((item) => {
                  const href = chartHref(item);
                  const title = t({ ar: item.title_ar, en: item.title_en || item.title_ar });
                  const isImg = href ? /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(href) : false;
                  const isPdf = href ? /\.pdf(\?|$)/i.test(href) : false;
                  return (
                    <li key={item.id} className="flex items-center justify-between gap-3 text-[13px]">
                      <span className="flex min-w-0 items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-bronze/70 dark:text-gold/60" aria-hidden="true" />
                        <span className="truncate text-foreground">{title}</span>
                      </span>
                      {href ? (
                        isImg || isPdf ? (
                          <button
                            type="button"
                            onClick={() => openMediaViewer({ src: href, kind: isImg ? "image" : "pdf", title })}
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
