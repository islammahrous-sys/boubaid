import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import {
  boardOfTrustees,
  boardTerm,
  foundingMembers,
  ceoRequirement,
  siteMeta,
} from "@/content/site";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionRail, type RailSection } from "@/components/site/SectionRail";
import { Eyebrow, Prose, Ornament } from "@/components/site/Editorial";
import { Seal } from "@/components/site/Seal";
import { getCanonicalUrl } from "@/lib/seo";
import { getPublicSiteSettings } from "@/lib/cms.functions";
import { openMediaViewer } from "@/components/site/GlobalMediaViewer";
import boardChartAr from "@/assets/fund-board/chart-ar.png.asset.json";
import boardChartEn from "@/assets/fund-board/chart-en.png.asset.json";

export const Route = createFileRoute("/governance")({
  loader: () => getPublicSiteSettings(),
  head: () => ({
    meta: [
      { title: "الحوكمة و مجلس الامناء | آل بوعبيد" },
      {
        name: "description",
        content: `الحوكمة ومجلس الأمناء في صندوق التنمية العائلية (آل بوعبيد): الغرض والاختصاص، وتشكيل مجلس الأمناء وفق ترخيص NCNP رقم ${siteMeta.ncnpLicense}.`,
      },
      { property: "og:title", content: "الحوكمة و مجلس الامناء — آل بوعبيد" },
      {
        property: "og:description",
        content: "الغرض والاختصاص وتشكيل مجلس الأمناء في صندوق التنمية العائلية.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: getCanonicalUrl("/governance") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/governance") }],
  }),
  component: GovernancePage,
});

const copy = {
  eyebrow: { ar: "الإطار النظامي", en: "Constitution" } as BiText,
  title: { ar: "الحوكمة و مجلس الامناء", en: "Governance & Board of Trustees" } as BiText,
  subtitle: {
    ar: "تعمل الصندوق بموجب لائحة أساسية معتمدة من المركز الوطني لتنمية القطاع غير الربحي، ويتولى إدارتها مجلس أمناء وست لجان تنفيذية تمثل الفروع السبعة.",
    en: "The organisation operates under a charter approved by the National Center for Nonprofit Sector. It is administered by a board of trustees and six executive committees representing the seven branches.",
  } as BiText,

  metaLicence: { ar: "رقم الترخيص", en: "Licence no." } as BiText,
  metaAuthority: { ar: "جهة الإصدار", en: "Issuing authority" } as BiText,
  metaRegistered: { ar: "تاريخ الإشهار", en: "Registered" } as BiText,

  mandateEyebrow: { ar: "أولاً", en: "Article I" } as BiText,
  mandateTitle: { ar: "الغرض والاختصاص", en: "Purpose and remit" } as BiText,
  mandateP1: {
    ar: "تأسست صندوق التنمية العائلية (آل بوعبيد) ككيان أهلي غير ربحي يعنى بتنظيم شؤون الأسرة الجامعة: توثيق النسب وحفظ الأرشيف، وإدارة الأوقاف والاشتراكات، وتنفيذ برامج التكافل والتنمية بين أبناء الفروع السبعة.",
    en: "The Al Bu Obaid Family Development Fund was established as a nonprofit civic entity to administer the collective affairs of the family: documenting lineage and preserving the archive, managing endowments and subscriptions, and delivering solidarity and development programmes across the seven branches.",
  } as BiText,
  mandateP2: {
    ar: "وتلتزم الصندوق بمتطلبات الحوكمة والإفصاح المالي والامتثال الزكوي المقررة على القطاع غير الربحي، ويخضع حسابها لمراجعة سنوية مستقلة، بما يتسق مع مستهدفات رؤية المملكة ٢٠٣٠.",
    en: "The organisation is bound by the governance, financial disclosure, and zakat compliance requirements set for the nonprofit sector. Its accounts are subject to independent annual audit, consistent with the aims of Saudi Vision 2030.",
  } as BiText,
  certificateLabel: { ar: "شهادة الترخيص الرسمية", en: "Official License Certificate" } as BiText,
  certificateCta: {
    ar: "استعراض الشهادات والإثباتات النظامية كاملة",
    en: "Browse all statutory certificates & attestations",
  } as BiText,

  boardEyebrow: { ar: "ثانياً", en: "Article II" } as BiText,
  boardTitle: { ar: "مجلس الأمناء", en: "The Board of Trustees" } as BiText,
  boardNote: {
    ar: "يتولى مجلس الأمناء الإشراف العام على الاستراتيجية والامتثال، ويجتمع دورياً برئاسة رئيس المجلس وبحضور عميد الأسرة.",
    en: "The board holds general oversight of strategy and compliance. It convenes periodically under its chair, with the Family Dean in attendance.",
  } as BiText,
  officeLabel: { ar: "المنصب", en: "Office" } as BiText,
  holderLabel: { ar: "شاغل المنصب", en: "Holder" } as BiText,
  foundersEyebrow: { ar: "الأعضاء المؤسسون", en: "Founding members" } as BiText,
  foundersNote: {
    ar: `يتولى الأعضاء المؤسسون الستة قيادة لجان مجلس الأسرة الست، ويُشترط في المدير التنفيذي للصندوق حاملاً درجة البكالوريوس مع خبرة إدارية تتجاوز 16 عاماً. ${ceoRequirement.ar}`,
    en: `The six founding members lead the six executive committees. The bylaws require the fund's Chief Executive to hold a bachelor's degree with over 16 years of administrative experience.`,
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
  { id: "mandate", label: { ar: "الغرض والاختصاص", en: "Purpose & remit" } },
  { id: "board", label: { ar: "مجلس الأمناء", en: "Board of Trustees" } },
];

function BoardChartFigure({ title, href, className = "" }: { title: string; href: string; className?: string }) {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  return (
    <figure className={`overflow-hidden rounded-md border border-border bg-card ${className}`}>
      <figcaption
        lang={rtl ? "ar" : "en"}
        dir={rtl ? "rtl" : "ltr"}
        className="break-words border-b border-border p-4 text-[15px] font-semibold text-foreground"
      >
        {title}
      </figcaption>
      <button
        type="button"
        onClick={() => openMediaViewer({ src: href, kind: "image", title })}
        className="block w-full overflow-x-auto bg-muted/30 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-4"
        aria-label={rtl ? "عرض المخطط بالحجم الكامل" : "Open chart full size"}
      >
        <img
          key={href}
          src={href}
          alt={title}
          width={1920}
          height={1350}
          loading="lazy"
          className="mx-auto block h-auto w-full min-w-[640px] max-w-5xl object-contain sm:min-w-0"
        />
      </button>
      <p className="border-t border-border p-3 text-[12px] text-muted-foreground">
        {rtl ? "اضغط على المخطط لعرضه بالحجم الكامل." : "Tap the chart to view it full size."}
      </p>
    </figure>
  );
}

function GovernancePage() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;

  const dynamicSettings = (Route.useLoaderData() || {}) as Record<string, any>;
  const siteGovernance = dynamicSettings.site_governance || {};
  const boardNameOverrides: Record<number, string | undefined> = {
    0: siteGovernance.dean_name,
    1: siteGovernance.chairman_name,
    2: siteGovernance.vice_chairman_name,
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
        {/* ── الغرض والاختصاص ───────────────────────────────── */}
        <section
          id="mandate"
          className="scroll-mt-28 reveal-on-scroll grid gap-8 lg:grid-cols-[minmax(0,14rem)_1fr] lg:gap-16"
        >
          <div>
            <Eyebrow>{t(copy.mandateEyebrow)}</Eyebrow>
            <h2 className="mt-3 text-xl leading-tight text-foreground md:text-2xl">
              {t(copy.mandateTitle)}
            </h2>
            <Seal
              className="mt-8 hidden h-28 w-28 text-bronze/70 lg:block dark:text-gold/60"
              ringText={
                rtl
                  ? "المركز الوطني لتنمية القطاع غير الربحي"
                  : "NATIONAL CENTER FOR NONPROFIT SECTOR"
              }
              centerLine1={siteMeta.ncnpLicense}
              centerLine2={rtl ? "مرخص رسمياً" : "REGISTERED"}
            />
          </div>
          <Prose>
            <p>{t(copy.mandateP1)}</p>
            <p>{t(copy.mandateP2)}</p>

            <Link
              to="/fund-certificates"
              className="not-prose group mt-6 flex max-w-sm items-center gap-4 border border-border p-3 transition-colors hover:border-bronze dark:hover:border-gold"
            >
              <img
                src="/images/ncnp_license_certificate.jpg"
                alt=""
                className="h-16 w-24 shrink-0 border border-border object-cover"
                loading="lazy"
              />
              <span className="text-[13px] leading-relaxed text-foreground">
                <span className="label-caps block text-bronze dark:text-gold">
                  {t(copy.certificateLabel)}
                </span>
                {t(copy.certificateCta)}
              </span>
            </Link>
          </Prose>
        </section>

        {/* ── مجلس الأمناء ──────────────────────────────────── */}
        <section
          id="board"
          className="scroll-mt-28 reveal-on-scroll mt-16 border-t border-border pt-12"
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,14rem)_1fr] lg:gap-16">
            <div>
              <Eyebrow>{t(copy.boardEyebrow)}</Eyebrow>
              <h2 className="mt-3 text-xl leading-tight text-foreground md:text-2xl">
                {t(copy.boardTitle)}
              </h2>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                {t(copy.boardNote)}
              </p>
              <p className="label-caps mt-4 text-muted-foreground">{t(boardTerm)}</p>
            </div>

            <div>
              <div className="hidden border-b border-ink/25 pb-2.5 md:grid md:grid-cols-[minmax(0,14rem)_1fr] md:gap-8 dark:border-ivory/20">
                <span className="label-caps text-muted-foreground">{t(copy.officeLabel)}</span>
                <span className="label-caps text-muted-foreground">{t(copy.holderLabel)}</span>
              </div>

              <ol>
                {boardOfTrustees.map((member, i) => (
                  <li
                    key={i}
                    className="grid gap-x-8 gap-y-1 border-b border-border py-5 md:grid-cols-[minmax(0,14rem)_1fr]"
                  >
                    <p className="label-caps pt-1 text-bronze dark:text-gold">{t(member.role)}</p>
                    <div>
                      <p className="font-naskh text-base font-bold text-foreground rtl:text-lg">
                        {boardNameOverrides[i] || t(member.name)}
                      </p>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                        {t(member.bio)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-8 border-t border-border pt-6">
                <p className="label-caps mb-3 text-muted-foreground">{t(copy.foundersEyebrow)}</p>
                <ul className="flex flex-wrap gap-x-6 gap-y-1.5">
                  {foundingMembers.map((m, i) => (
                    <li key={i} className="text-[13px] text-foreground">
                      {t(m)}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                  {t(copy.foundersNote)}
                </p>
              </div>
            </div>
          </div>

          {/* الهيكل التنظيمي لمجلس أمناء الصندوق — language-specific source images */}
          <BoardChartFigure
            className="mt-10"
            title={
              rtl
                ? "الهيكل التنظيمي لمجلس أمناء الصندوق"
                : "Organizational Chart of the Fund's Board of Trustees"
            }
            href={
              new URL(rtl ? boardChartAr.url : boardChartEn.url, "https://alboabid-heritage-hub.lovable.app").toString()
            }
          />
          <BoardChartFigure
            className="mt-6"
            title={
              rtl
                ? "الهيكل التنظيمي لمجلس أمناء الصندوق — النسخة الإنجليزية"
                : "Organizational Chart of the Fund's Board of Trustees — The Arabic version"
            }
            href={
              new URL(rtl ? boardChartEn.url : boardChartAr.url, "https://alboabid-heritage-hub.lovable.app").toString()
            }
          />
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
