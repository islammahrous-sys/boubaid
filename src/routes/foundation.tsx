import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Download } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import {
  boardOfTrustees,
  boardTerm,
  committees,
  foundingMembers,
  ceoRequirement,
  hqProject,
  siteMeta,
} from "@/content/site";
import { pageImages } from "@/content/images";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow, Prose, Ornament } from "@/components/site/Editorial";

export const Route = createFileRoute("/foundation")({
  head: () => ({
    meta: [
      { title: "الحوكمة ومجلس الأمناء | صندوق التنمية العائلية (آل بوعبيد)" },
      {
        name: "description",
        content: `الإطار النظامي لصندوق التنمية العائلية (آل بوعبيد): مجلس الأمناء، اللجان الخمس، والحوكمة المالية وفق ترخيص NCNP رقم ${siteMeta.ncnpLicense}.`,
      },
      { property: "og:title", content: "الحوكمة ومجلس الأمناء — آل بوعبيد" },
      { property: "og:type", content: "article" },
    ],
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
    ar: "عرض شهادة ترخيص NCNP كاملة (صيغة PDF/JPG)",
    en: "View the full NCNP license certificate",
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
    ar: "النسخ الموقعة مودعة لدى الأمانة العامة، ونسخها الرقمية متاحة في الأرشيف.",
    en: "Signed copies are deposited with the secretariat; digital copies are available in the archive.",
  } as BiText,
  archiveCta: { ar: "الانتقال إلى الأرشيف", en: "Go to the archive" } as BiText,
  pending: {
    ar: "الوثيقة متاحة في الأرشيف الرقمي.",
    en: "This document is available in the digital archive.",
  } as BiText,
};

const constitutionalDocs: { ref: string; title: BiText }[] = [
  { ref: "CHTR-1447", title: { ar: "اللائحة الأساسية للصندوق", en: "Charter and basic bylaws" } },
  {
    ref: "GOV-1447",
    title: { ar: "لائحة الحوكمة وتنظيم اللجان", en: "Governance and committee regulations" },
  },
  { ref: "FIN-1447", title: { ar: "التقرير المالي المراجَع", en: "Audited financial report" } },
];

export function FoundationPage() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;

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

      <div className="container-page py-14 md:py-16">
        {/* ── Article I — mandate ────────────────────────────── */}
        <section className="grid gap-8 lg:grid-cols-[minmax(0,14rem)_1fr] lg:gap-16">
          <div>
            <Eyebrow>{t(copy.mandateEyebrow)}</Eyebrow>
            <h2 className="mt-3 text-xl leading-tight text-foreground md:text-2xl">
              {t(copy.mandateTitle)}
            </h2>
          </div>
          <Prose>
            <p>{t(copy.mandateP1)}</p>
            <p>{t(copy.mandateP2)}</p>

            <a
              href="/images/ncnp_license_certificate.jpg"
              target="_blank"
              rel="noopener noreferrer"
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
            </a>
          </Prose>
        </section>

        {/* ── Article II — the board as a table of offices ───── */}
        <section className="mt-16 border-t border-border pt-12">
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
                        {t(member.name)}
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

        {/* ── Article III — committees ───────────────────────── */}
        <section className="mt-16 border-t border-border pt-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,14rem)_1fr] lg:gap-16">
            <div>
              <Eyebrow>{t(copy.committeesEyebrow)}</Eyebrow>
              <h2 className="mt-3 text-xl leading-tight text-foreground md:text-2xl">
                {t(copy.committeesTitle)}
              </h2>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                {t(copy.committeesNote)}
              </p>
            </div>

            <ol>
              {committees.map((c, i) => (
                <li
                  key={c.id}
                  className="grid grid-cols-[2.5rem_1fr] gap-x-5 border-b border-border py-5 first:border-t"
                >
                  <span
                    className="nums font-mono text-sm text-bronze/70 dark:text-gold/60"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground">{t(c.name)}</h3>
                    <p className="measure mt-2 text-[13px] leading-relaxed text-muted-foreground">
                      {t(c.desc)}
                    </p>
                    <p className="mt-2.5 text-[13px]">
                      <span className="label-caps me-2 text-muted-foreground">
                        {t(copy.chairLabel)}
                      </span>
                      <span className="text-foreground">{t(c.lead)}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Article IV — financial governance ──────────────── */}
        <section className="mt-16 border-t border-border pt-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,14rem)_1fr] lg:gap-16">
            <div>
              <Eyebrow>{t(copy.financeEyebrow)}</Eyebrow>
              <h2 className="mt-3 text-xl leading-tight text-foreground md:text-2xl">
                {t(copy.financeTitle)}
              </h2>
            </div>

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
        </section>

        {/* ── Article V — the audited financial report ───────── */}
        <section className="mt-16 border-t border-border pt-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,14rem)_1fr] lg:gap-16">
            <div>
              <Eyebrow>{t(copy.financeReportEyebrow)}</Eyebrow>
              <h2 className="mt-3 text-xl leading-tight text-foreground md:text-2xl">
                {t(copy.financeReportTitle)}
              </h2>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                {t(copy.financeReportNote)}
              </p>
            </div>

            <div>
              <dl className="grid grid-cols-1 gap-6 border-b border-border pb-8 sm:grid-cols-3">
                <div>
                  <dt className="label-caps text-muted-foreground">{t(copy.totalRevenueLabel)}</dt>
                  <dd className="nums mt-1.5 font-mono text-2xl text-foreground">
                    {hqProject.financials.totalRevenue.toLocaleString("en-US")}
                    <span className="ms-1.5 text-xs text-muted-foreground">SAR</span>
                  </dd>
                </div>
                <div>
                  <dt className="label-caps text-muted-foreground">{t(copy.totalExpensesLabel)}</dt>
                  <dd className="nums mt-1.5 font-mono text-2xl text-foreground">
                    {hqProject.financials.totalExpenses.toLocaleString("en-US")}
                    <span className="ms-1.5 text-xs text-muted-foreground">SAR</span>
                  </dd>
                </div>
                <div>
                  <dt className="label-caps text-bronze dark:text-gold">{t(copy.deficitLabel)}</dt>
                  <dd className="nums mt-1.5 font-mono text-2xl text-bronze dark:text-gold">
                    ({hqProject.financials.deficit.toLocaleString("en-US")})
                    <span className="ms-1.5 text-xs text-muted-foreground">SAR</span>
                  </dd>
                </div>
              </dl>

              <p className="measure mt-5 text-[13px] leading-relaxed text-muted-foreground">
                {t(hqProject.financials.note)}
              </p>

              <p className="label-caps mt-8 mb-3 text-muted-foreground">{t(copy.budgetTitle)}</p>
              <ol>
                {hqProject.budgetBreakdown.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-baseline justify-between gap-4 border-b border-border py-3 first:border-t"
                  >
                    <span className="text-sm text-foreground">{t(b.item)}</span>
                    <span className="nums shrink-0 font-mono text-sm text-bronze dark:text-gold">
                      {b.amount.toLocaleString("en-US")}
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-8 grid gap-8 sm:grid-cols-2">
                <div>
                  <p className="label-caps mb-3 text-muted-foreground">
                    {t(copy.shareholderLoansTitle)}
                  </p>
                  <ol>
                    {hqProject.shareholderLoans.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-baseline justify-between gap-4 border-b border-border py-2 text-[13px] first:border-t"
                      >
                        <span className="text-foreground">{t(s.label)}</span>
                        <span className="nums font-mono text-muted-foreground">
                          {s.repaid.toLocaleString("en-US")} / {s.amount.toLocaleString("en-US")}
                        </span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t(copy.shareholderLoansNote)}
                  </p>
                </div>

                <div>
                  <p className="label-caps mb-3 text-muted-foreground">
                    {t(copy.eidDeficitTitle)}
                  </p>
                  <ol>
                    {hqProject.eidDeficitByYear.map((e, i) => (
                      <li
                        key={i}
                        className="flex items-baseline justify-between gap-4 border-b border-border py-2 text-[13px] first:border-t"
                      >
                        <span className="text-foreground">{e.year}</span>
                        <span className="nums font-mono text-muted-foreground">
                          {e.amount.toLocaleString("en-US")}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <p className="label-caps mt-8 text-muted-foreground">
                {t(hqProject.financials.approvedBy)}
              </p>
            </div>
          </div>
        </section>

        <Ornament className="mt-16" />

        {/* ── Constitutional documents ───────────────────────── */}
        <section className="mt-16">
          <Eyebrow>{t(copy.docsEyebrow)}</Eyebrow>
          <p className="measure mt-3 text-[13px] leading-relaxed text-muted-foreground">
            {t(copy.docsNote)}
          </p>

          <ul className="mt-6 max-w-3xl">
            {constitutionalDocs.map((doc) => (
              <li key={doc.ref} className="border-b border-border first:border-t">
                <div className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <div className="flex items-baseline gap-5">
                    <span className="nums font-mono text-xs text-bronze dark:text-gold">
                      {doc.ref}
                    </span>
                    <span className="text-sm font-medium text-foreground">{t(doc.title)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast(t(copy.pending))}
                    className="inline-flex shrink-0 items-center gap-1.5 border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    PDF
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <Link
            to="/library"
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
