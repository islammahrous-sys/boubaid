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
import { pageImages } from "@/content/images";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionRail, type RailSection } from "@/components/site/SectionRail";
import { Eyebrow, Prose, Ornament } from "@/components/site/Editorial";
import { Seal } from "@/components/site/Seal";
import { getCanonicalUrl } from "@/lib/seo";
import { getPublicSiteSettings } from "@/lib/cms.functions";

export const Route = createFileRoute("/foundation")({
  loader: () => getPublicSiteSettings(),
  head: () => ({
    meta: [
      { title: "الحوكمة ومجلس الأمناء | آل بوعبيد" },
      {
        name: "description",
        content: `الإطار النظامي لصندوق التنمية العائلية (آل بوعبيد): مجلس الأمناء، اللجان الخمس، والحوكمة المالية وفق ترخيص NCNP رقم ${siteMeta.ncnpLicense}.`,
      },
      { property: "og:title", content: "الحوكمة ومجلس الأمناء — آل بوعبيد" },
      {
        property: "og:description",
        content:
          "مجلس الأمناء واللجان الخمس والحوكمة المالية لصندوق التنمية العائلية (آل بوعبيد) المرخّص من المركز الوطني.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: getCanonicalUrl("/foundation") },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/foundation") }],
  }),
  component: FoundationPage,
});

const copy = {
  eyebrow: { ar: "الإطار النظامي", en: "Constitution" } as BiText,
  title: { ar: "الحوكمة ومجلس الأمناء", en: "Governance & Board of Trustees" } as BiText,
  subtitle: {
    ar: "تعمل الصندوق بموجب لائحة أساسية معتمدة من المركز الوطني لتنمية القطاع غير الربحي، ويتولى إدارتها مجلس أمناء وخمس لجان تنفيذية تمثل الفروع السبعة.",
    en: "The organisation operates under a charter approved by the National Center for Nonprofit Sector. It is administered by a board of trustees and five standing committees representing the seven branches.",
  } as BiText,
  imageCaption: {
    ar: "اجتماع مجلس الأمناء — المبرز، الأحساء.",
    en: "A sitting of the board of trustees — Al-Mubarraz, Al-Ahsa.",
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
  certificateLabel: { ar: "شهادة الترخيص الرسمية", en: "Official License Certificate" } as BiText,
  certificateCta: {
    ar: "استعراض الشهادات والإثباتات النظامية كاملة",
    en: "Browse all statutory certificates & attestations",
  } as BiText,
  mandateP2: {
    ar: "وتلتزم الصندوق بمتطلبات الحوكمة والإفصاح المالي والامتثال الزكوي المقررة على القطاع غير الربحي، ويخضع حسابها لمراجعة سنوية مستقلة، بما يتسق مع مستهدفات رؤية المملكة ٢٠٣٠.",
    en: "The organisation is bound by the governance, financial disclosure, and zakat compliance requirements set for the nonprofit sector. Its accounts are subject to independent annual audit, consistent with the aims of Saudi Vision 2030.",
  } as BiText,

  boardEyebrow: { ar: "ثانياً", en: "Article II" } as BiText,
  boardTitle: { ar: "مجلس الأمناء", en: "The Board of Trustees" } as BiText,
  boardNote: {
    ar: "يتولى مجلس الأمناء الإشراف العام على الاستراتيجية والامتثال، ويجتمع دورياً برئاسة رئيس المجلس وبحضور عميد الأسرة.",
    en: "The board holds general oversight of strategy and compliance. It convenes periodically under its chair, with the Family Dean in attendance.",
  } as BiText,
  officeLabel: { ar: "المنصب", en: "Office" } as BiText,
  holderLabel: { ar: "شاغل المنصب", en: "Holder" } as BiText,

  committeesEyebrow: { ar: "ثالثاً", en: "Article III" } as BiText,
  committeesTitle: { ar: "اللجان التنفيذية", en: "The Standing Committees" } as BiText,
  committeesNote: {
    ar: "تنبثق عن مجلس الأمناء خمس لجان تنفيذية، لكل منها اختصاص محدد ورئيس مسؤول أمام المجلس.",
    en: "Five standing committees issue from the board, each with a defined remit and a chair answerable to the board.",
  } as BiText,
  chairLabel: { ar: "رئيس اللجنة", en: "Chair" } as BiText,

  financeEyebrow: { ar: "رابعاً", en: "Article IV" } as BiText,
  financeTitle: { ar: "الحوكمة المالية", en: "Financial governance" } as BiText,
  financeItems: [
    {
      ar: "حساب بنكي مستقل باسم الصندوق، منفصل عن الذمم الشخصية لأعضاء المجلس واللجان.",
      en: "An independent bank account in the organisation's name, separate from the personal accounts of board and committee members.",
    },
    {
      ar: "فصل حساب الزكاة عن حساب الاشتراكات وحساب مشروع المقر.",
      en: "Segregation of the zakat account from the subscriptions account and the headquarters project account.",
    },
    {
      ar: "مراجعة سنوية خارجية مستقلة، وتقرير مالي يُعرض على الجمعية العمومية.",
      en: "Independent external audit each year, with a financial report laid before the general assembly.",
    },
    {
      ar: "إفصاح دوري عن مصارف الاشتراكات والقروض الحسنة المساهمة في مشروع المقر.",
      en: "Periodic disclosure of how subscriptions and interest-free contributory loans to the headquarters project are applied.",
    },
  ] as BiText[],

  foundersEyebrow: { ar: "الأعضاء المؤسسون", en: "Founding members" } as BiText,
  foundersNote: {
    ar: `يتولى الأعضاء المؤسسون الستة قيادة اللجان التنفيذية الخمس، ويُشترط في المدير التنفيذي للصندوق حاملاً درجة البكالوريوس مع خبرة إدارية تتجاوز 16 عاماً. ${ceoRequirement.ar}`,
    en: `The six founding members lead the five executive committees. The bylaws require the fund's Chief Executive to hold a bachelor's degree with over 16 years of administrative experience.`,
  } as BiText,

  financeReportEyebrow: { ar: "خامساً", en: "Article V" } as BiText,
  financeReportTitle: {
    ar: "التقرير المالي (٢٠٢٣–٢٠٢٥)",
    en: "Financial Report (2023–2025)",
  } as BiText,
  financeReportNote: {
    ar: "الفحص المالي الدقيق للقوائم المالية، المعدة وفق المعيار الدولي للتقرير المالي للمنشآت الصغيرة والمتوسطة في المملكة.",
    en: "A rigorous financial examination of the statements, prepared per the IFRS for SMEs standard applicable in the Kingdom.",
  } as BiText,
  totalRevenueLabel: { ar: "إجمالي الإيرادات والسيولة", en: "Total revenue & liquidity" } as BiText,
  totalExpensesLabel: { ar: "إجمالي المصروفات", en: "Total expenditure" } as BiText,
  deficitLabel: { ar: "العجز المحاسبي الشامل", en: "Comprehensive accounting deficit" } as BiText,
  budgetTitle: {
    ar: "أوجه الصرف الرأسمالي والتشغيلي",
    en: "Capital & operating expenditure",
  } as BiText,
  shareholderLoansTitle: {
    ar: "القروض الحسنة المساهمة (مسدد / إجمالي)",
    en: "Interest-free shareholder loans (repaid / total)",
  } as BiText,
  shareholderLoansNote: {
    ar: "ثمانية أعضاء مؤسسين موّلوا فجوة النقد بقروض حسنة إجمالية 820,000 ريال؛ سُدّد منها 350,000 ريال حتى نهاية 2025.",
    en: "Eight founding members covered the cash gap via SAR 820,000 in interest-free loans; SAR 350,000 had been repaid by the end of 2025.",
  } as BiText,
  eidDeficitTitle: {
    ar: "عجز اجتماع العيد بحسب السنة الهجرية",
    en: "Eid-gathering deficit by Hijri year",
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
  pending: {
    ar: "الوثيقة متاحة في الأرشيف الرقمي.",
    en: "This document is available in the digital archive.",
  } as BiText,
};

const railSections: RailSection[] = [
  { id: "mandate", label: { ar: "الاختصاص", en: "Mandate" } },
  { id: "board", label: { ar: "مجلس الأمناء", en: "Board" } },
  { id: "finance", label: { ar: "الموارد", en: "Resources" } },
  { id: "documents", label: { ar: "الوثائق", en: "Documents" } },
];

function FoundationPage() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;

  // Live overrides are saved by the admin console under the "site_governance"
  // category (see SiteSettingsManager.tsx / upsertSiteSetting) — currently
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
        variant="plate"
        image={pageImages.foundation.header.src}
        imageCaption={t(pageImages.foundation.header.caption)}
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
        meta={[
          { label: t(copy.metaLicence), value: siteMeta.ncnpLicense, mono: true },
          { label: t(copy.metaAuthority), value: t(siteMeta.ncnpAuthority) },
          { label: t(copy.metaRegistered), value: `${siteMeta.foundedHijri} هـ` },
        ]}
      />

      <SectionRail sections={railSections} className="print-hide" />

      <div className="container-page py-14 md:py-16">
        {/* ── Article I — mandate ────────────────────────────── */}
        <section
          id="mandate"
          className="scroll-mt-28 reveal-on-scroll grid gap-8 lg:grid-cols-[minmax(0,14rem)_1fr] lg:gap-16"
        >
          <div>
            <Eyebrow>{t(copy.mandateEyebrow)}</Eyebrow>
            <h2 className="mt-3 text-xl leading-tight text-foreground md:text-2xl">
              {t(copy.mandateTitle)}
            </h2>

            {/* The seal — this document's one certifying mark. */}
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

        {/* ── Article II — the board as a table of offices ───── */}
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
        </section>



        {/* ── Article IV — financial governance ──────────────── */}
        <section
          id="finance"
          className="scroll-mt-28 reveal-on-scroll mt-16 border-t border-border pt-12"
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,14rem)_1fr] lg:gap-16">
            <div>
              <Eyebrow>{t(copy.financeEyebrow)}</Eyebrow>
              <h2 className="mt-3 text-xl leading-tight text-foreground md:text-2xl">
                {t(copy.financeTitle)}
              </h2>
            </div>

            <div>
              <ol className="measure">
                {copy.financeItems.map((item, i) => (
                  <li
                    key={i}
                    className="grid grid-cols-[1.75rem_1fr] gap-x-4 border-b border-border py-4 first:border-t"
                  >
                    <span
                      className="nums font-mono text-[13px] text-bronze/70 dark:text-gold/60"
                      aria-hidden="true"
                    >
                      {i + 1}.
                    </span>
                    <span className="text-sm leading-relaxed text-foreground">{t(item)}</span>
                  </li>
                ))}
              </ol>

            </div>
          </div>
        </section>


        <Ornament className="mt-16" />

        {/* ── Constitutional documents ───────────────────────── */}
        <section id="documents" className="scroll-mt-28 reveal-on-scroll mt-16">
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
