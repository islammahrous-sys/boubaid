import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { committees, siteMeta } from "@/content/site";
import { committeeDocuments } from "@/content/committee-documents";
import { openMediaViewer } from "@/components/site/GlobalMediaViewer";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionRail, type RailSection } from "@/components/site/SectionRail";
import { Eyebrow, Ornament } from "@/components/site/Editorial";
import { getCanonicalUrl } from "@/lib/seo";

export const Route = createFileRoute("/committees")({
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
    ar: "تنبثق عن مجلس الأمناء خمس لجان تنفيذية تمثل الفروع السبعة، لكل منها اختصاص محدد ورئيس مسؤول أمام المجلس.",
    en: "Five standing committees issue from the board of trustees, representing the seven branches, each with a defined remit and a chair answerable to the board.",
  } as BiText,

  metaLicence: { ar: "رقم الترخيص", en: "Licence no." } as BiText,
  metaAuthority: { ar: "جهة الإصدار", en: "Issuing authority" } as BiText,
  metaRegistered: { ar: "تاريخ الإشهار", en: "Registered" } as BiText,

  chairLabel: { ar: "رئيس اللجنة", en: "Chair" } as BiText,
  listTitle: { ar: "اللجان التنفيذية", en: "The Standing Committees" } as BiText,
  listNote: {
    ar: "تنبثق عن مجلس الأمناء خمس لجان تنفيذية، لكل منها اختصاص محدد ورئيس مسؤول أمام المجلس.",
    en: "Five standing committees issue from the board, each with a defined remit and a chair answerable to the board.",
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

  viewDoc: { ar: "عرض الوثيقة", en: "View document" } as BiText,
};

const years: { id: string; year: number; eyebrow: BiText; title: BiText; note: BiText }[] = [
  {
    id: "y1444",
    year: 1444,
    eyebrow: { ar: "أولاً", en: "Article I" },
    title: { ar: "عام ١٤٤٤هـ", en: "Year 1444H" },
    note: {
      ar: "خطط اللجان التنفيذية والخطابات الرسمية لعام ١٤٤٤هـ.",
      en: "Plans of the standing committees and official letters for 1444H.",
    },
  },
  {
    id: "y1445",
    year: 1445,
    eyebrow: { ar: "ثانياً", en: "Article II" },
    title: { ar: "عام ١٤٤٥هـ", en: "Year 1445H" },
    note: {
      ar: "الخطابات الرسمية وخطط اللجان التنفيذية لعام ١٤٤٥هـ.",
      en: "Official letters and plans of the standing committees for 1445H.",
    },
  },
];

const railSections: RailSection[] = [
  { id: "y1444", label: { ar: "عام ١٤٤٤", en: "Year 1444" } },
  { id: "y1445", label: { ar: "عام ١٤٤٥", en: "Year 1445" } },
];

function CommitteesPage() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;

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
        <section className="reveal-on-scroll">
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
