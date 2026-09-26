import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { committees, siteMeta } from "@/content/site";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionRail, type RailSection } from "@/components/site/SectionRail";
import { Eyebrow, Ornament } from "@/components/site/Editorial";
import {
  CommitteeYearGrid,
  type CommitteeArchiveItem,
} from "@/components/site/CommitteeYearGrid";
import { getCanonicalUrl } from "@/lib/seo";
import { getPublishedLibrary } from "@/lib/cms.functions";

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
        content: `اللجان التنفيذية في صندوق التنمية العائلية (آل بوعبيد) وفق ترخيص NCNP رقم ${siteMeta.ncnpLicense}.`,
      },
      { property: "og:title", content: "اللجان — آل بوعبيد" },
      {
        property: "og:description",
        content: "اللجان التنفيذية التابعة لمجلس أسرة آل بوعبيد.",
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

  docsEyebrow: { ar: "الوثائق النظامية", en: "Constitutional documents" } as BiText,
  docsNote: {
    ar: "النسخ الموقعة مودعة لدى الأمانة العامة، وجميع نسخها الرقمية منشورة في صفحة الشهادات والإثباتات بصندوق التنمية العائلية.",
    en: "Signed copies are deposited with the secretariat; all digital copies are published on the fund's Certificates & Attestations page.",
  } as BiText,
  archiveCta: {
    ar: "الانتقال إلى الشهادات والإثباتات",
    en: "Go to Certificates & Attestations",
  } as BiText,

};

const railSections: RailSection[] = [
  { id: "committees-list", label: { ar: "اللجان", en: "Committees" } },
  { id: "y1448", label: { ar: "١٤٤٨ هـ", en: "1448 AH" } },
];

function CommitteesPage() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;
  const { charts } = Route.useLoaderData();
  const chartRecords = charts as CommitteeArchiveItem[];

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
