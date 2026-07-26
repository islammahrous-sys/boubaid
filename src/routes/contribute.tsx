import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow, Prose, Ornament, Record, RecordField } from "@/components/site/Editorial";
import { siteMeta } from "@/content/site";
import { pageImages } from "@/content/images";

export const Route = createFileRoute("/contribute")({
  head: () => ({
    meta: [
      { title: "الاشتراك والمساهمة | صندوق التنمية العائلية (آل بوعبيد)" },
      {
        name: "description",
        content:
          "الاشتراكات الشهرية والمساهمات في أوقاف ومشاريع صندوق التنمية العائلية (آل بوعبيد) عبر القنوات المعتمدة.",
      },
      { property: "og:title", content: "الاشتراك والمساهمة — آل بوعبيد" },
      { property: "og:type", content: "article" },
    ],
  }),
  component: ContributePage,
});

const copy = {
  eyebrow: { ar: "الاشتراكات والأوقاف", en: "Subscriptions & endowments" } as BiText,
  title: { ar: "الاشتراك والمساهمة", en: "Subscribe & Contribute" } as BiText,
  subtitle: {
    ar: "تعتمد الصندوق في تمويلها على اشتراكات أبناء الأسرة والقروض الحسنة المساهمة. وتُدار المبالغ عبر حسابات مستقلة وتخضع للمراجعة السنوية.",
    en: "The organisation is funded by members' subscriptions and interest-free contributory loans. Funds are held in separate accounts and subject to annual audit.",
  } as BiText,

  metaChannel: { ar: "قناة السداد", en: "Payment channel" } as BiText,
  metaChannelValue: { ar: "متجر سلة المعتمد", en: "Approved Salla store" } as BiText,
  metaAudit: { ar: "المراجعة", en: "Audit" } as BiText,
  metaAuditValue: { ar: "سنوية مستقلة", en: "Independent, annual" } as BiText,
  metaLicence: { ar: "رقم الترخيص", en: "Licence no." } as BiText,

  scheduleEyebrow: { ar: "جدول الاشتراكات", en: "Schedule of contributions" } as BiText,
  scheduleTitle: { ar: "فئات الاشتراك والمساهمة", en: "Categories of subscription" } as BiText,
  colCategory: { ar: "الفئة", en: "Category" } as BiText,
  colAmount: { ar: "المبلغ", en: "Amount" } as BiText,
  colPurpose: { ar: "وجه الصرف", en: "Applied to" } as BiText,
  monthly: { ar: "شهرياً", en: "monthly" } as BiText,
  oneOff: { ar: "دفعة واحدة", en: "one-off" } as BiText,

  channelsEyebrow: { ar: "قنوات السداد", en: "How to pay" } as BiText,
  channelsTitle: { ar: "القنوات المعتمدة", en: "Approved channels" } as BiText,
  sallaTitle: { ar: "المتجر الإلكتروني (سلة)", en: "Online store (Salla)" } as BiText,
  sallaBody: {
    ar: "الاشتراك الشهري المتكرر يُدار عبر متجر الصندوق على منصة سلة، وتصدر الإيصالات آلياً باسم الصندوق.",
    en: "Recurring monthly subscriptions are handled through the organisation's Salla storefront, which issues receipts automatically in the organisation's name.",
  } as BiText,
  sallaCta: { ar: "الانتقال إلى المتجر", en: "Go to the store" } as BiText,

  transferTitle: { ar: "التحويل البنكي", en: "Bank transfer" } as BiText,
  transferBody: {
    ar: "للمساهمات الكبيرة والقروض الحسنة، تُطلب بيانات الحساب من الأمانة العامة مباشرة. ولا تُنشر أرقام الحسابات على الموقع.",
    en: "For larger contributions and interest-free loans, account details are obtained from the secretariat directly. Account numbers are not published on this site.",
  } as BiText,
  transferCta: { ar: "طلب بيانات الحساب", en: "Request account details" } as BiText,

  useEyebrow: { ar: "أوجه الصرف", en: "Application of funds" } as BiText,
  useTitle: { ar: "أين تذهب المساهمات", en: "Where contributions go" } as BiText,
  useP1: {
    ar: "تُوزَّع الموارد على ثلاثة حسابات مستقلة: حساب الزكاة، وحساب التشغيل والبرامج، وحساب مشروع المقر الدائم. ولا يجوز النقل بين الحسابات إلا بقرار من مجلس الأمناء.",
    en: "Resources are allocated across three separate accounts: the zakat account, the operations and programmes account, and the permanent headquarters account. Transfers between them require a resolution of the board of trustees.",
  } as BiText,
  useP2: {
    ar: "ويُعرض تقرير مالي مراجَع على الجمعية العمومية سنوياً، ويُتاح ملخصه في الأرشيف الرقمي لأبناء الأسرة.",
    en: "An audited financial report is laid before the general assembly each year, and a summary is made available to family members in the digital archive.",
  } as BiText,
  governanceCta: { ar: "الاطلاع على إطار الحوكمة", en: "Read the governance framework" } as BiText,

  safetyTitle: { ar: "تنبيه", en: "Important" } as BiText,
  safetyBody: {
    ar: "لا تطلب الصندوق أرقام بطاقات أو بيانات بنكية عبر الرسائل أو مجموعات الواتساب. وأي طلب من هذا النوع يُبلَّغ عنه للأمانة العامة فوراً.",
    en: "The organisation never requests card numbers or banking details through messages or WhatsApp groups. Any such request should be reported to the secretariat immediately.",
  } as BiText,
};

const tiers: { category: BiText; amount: BiText; purpose: BiText }[] = [
  {
    category: { ar: "اشتراك العضو البالغ", en: "Adult member" },
    amount: { ar: "١٠٠ ريال", en: "SAR 100" },
    purpose: { ar: "التشغيل وبرامج التكافل", en: "Operations and solidarity programmes" },
  },
  {
    category: { ar: "اشتراك الأسرة الواحدة", en: "Household" },
    amount: { ar: "٢٥٠ ريال", en: "SAR 250" },
    purpose: {
      ar: "التشغيل والبرامج والملتقى السنوي",
      en: "Operations, programmes, annual assembly",
    },
  },
  {
    category: { ar: "مساهمة مشروع المقر", en: "Headquarters contribution" },
    amount: { ar: "حسب الاستطاعة", en: "As able" },
    purpose: { ar: "شراء الأرض والإنشاءات", en: "Land acquisition and construction" },
  },
  {
    category: { ar: "قرض حسن مساهم", en: "Interest-free loan" },
    amount: { ar: "بالاتفاق", en: "By arrangement" },
    purpose: {
      ar: "تمويل مرحلة الإنشاء، يُردّ وفق جدول",
      en: "Construction phase, repaid on schedule",
    },
  },
];

export function ContributePage() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;

  return (
    <>
      <PageHeader
        variant="document"
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
        meta={[
          { label: t(copy.metaChannel), value: t(copy.metaChannelValue) },
          { label: t(copy.metaAudit), value: t(copy.metaAuditValue) },
          { label: t(copy.metaLicence), value: siteMeta.ncnpLicense, mono: true },
        ]}
      />

      <div className="container-page pb-20">
        {/* ── Schedule of contributions ──────────────────────── */}
        <section>
          <Eyebrow>{t(copy.scheduleEyebrow)}</Eyebrow>
          <h2 className="mt-3 text-2xl leading-tight text-foreground md:text-3xl">
            {t(copy.scheduleTitle)}
          </h2>

          {/* Table at md+; a stacked record card below, so nothing scrolls
              sideways on a phone. */}
          <div className="mt-7 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[36rem] border-collapse">
              <thead>
                <tr className="border-y border-ink/25 dark:border-ivory/20">
                  <th scope="col" className="label-caps py-2.5 text-start text-muted-foreground">
                    {t(copy.colCategory)}
                  </th>
                  <th scope="col" className="label-caps py-2.5 text-start text-muted-foreground">
                    {t(copy.colAmount)}
                  </th>
                  <th scope="col" className="label-caps py-2.5 text-start text-muted-foreground">
                    {t(copy.colPurpose)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier, i) => (
                  <tr key={i} className="border-b border-border align-baseline">
                    <td className="py-4 pe-6 text-sm font-medium text-foreground">
                      {t(tier.category)}
                    </td>
                    <td className="nums py-4 pe-6 text-sm whitespace-nowrap text-bronze dark:text-gold">
                      {t(tier.amount)}
                      {i < 2 ? (
                        <span className="ms-1.5 text-xs text-muted-foreground">
                          {t(copy.monthly)}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-4 text-[13px] leading-snug text-muted-foreground">
                      {t(tier.purpose)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-7 border-t border-ink/25 md:hidden dark:border-ivory/20">
            {tiers.map((tier, i) => (
              <Record key={i} title={t(tier.category)}>
                <RecordField label={t(copy.colAmount)} mono>
                  {t(tier.amount)}
                  {i < 2 ? (
                    <span className="ms-1.5 text-xs text-muted-foreground">{t(copy.monthly)}</span>
                  ) : null}
                </RecordField>
                <p className="pt-1 text-[13px] leading-snug text-muted-foreground">
                  {t(tier.purpose)}
                </p>
              </Record>
            ))}
          </div>
        </section>

        {/* ── Channels ───────────────────────────────────────── */}
        <section className="mt-16 border-t border-border pt-12">
          <Eyebrow>{t(copy.channelsEyebrow)}</Eyebrow>
          <h2 className="mt-3 text-2xl leading-tight text-foreground md:text-3xl">
            {t(copy.channelsTitle)}
          </h2>

          <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-14">
            <div className="border-t-2 border-ink pt-5 dark:border-gold">
              <h3 className="text-lg text-foreground">{t(copy.sallaTitle)}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t(copy.sallaBody)}
              </p>
              <a
                href={siteMeta.sallaStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 border border-ink bg-ink px-5 py-3 text-sm font-medium text-ivory transition-colors hover:bg-transparent hover:text-foreground dark:border-gold dark:bg-gold dark:text-ink dark:hover:bg-transparent dark:hover:text-gold"
              >
                {t(copy.sallaCta)}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>

            <div className="border-t border-border pt-5">
              <h3 className="text-lg text-foreground">{t(copy.transferTitle)}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t(copy.transferBody)}
              </p>
              <Link
                to="/contact"
                className="mt-5 inline-flex items-center gap-2 border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                {t(copy.transferCta)}
                <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Application of funds ───────────────────────────── */}
        <section className="mt-16 border-t border-border pt-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,14rem)_1fr] lg:gap-16">
            <div>
              <Eyebrow>{t(copy.useEyebrow)}</Eyebrow>
              <h2 className="mt-3 text-xl leading-tight text-foreground md:text-2xl">
                {t(copy.useTitle)}
              </h2>
            </div>

            <div>
              <figure className="mb-7">
                <img
                  src={pageImages.contribute.endowment.src}
                  alt=""
                  className="aspect-[16/9] w-full object-cover"
                  loading="lazy"
                />
                <figcaption className="mt-3 flex items-start gap-2.5 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
                  <span className="mt-1.5 h-px w-5 shrink-0 bg-bronze" aria-hidden="true" />
                  <span>{t(pageImages.contribute.endowment.caption)}</span>
                </figcaption>
              </figure>

              <Prose>
                <p>{t(copy.useP1)}</p>
                <p>{t(copy.useP2)}</p>
              </Prose>

              <Link
                to="/foundation"
                className="mt-6 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
              >
                {t(copy.governanceCta)}
                <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <Ornament className="mt-16" />

        {/* ── Fraud warning ──────────────────────────────────── */}
        <aside className="mt-12 border border-ink/30 p-6 dark:border-ivory/20">
          <p className="label-caps mb-2.5 text-bronze dark:text-gold">{t(copy.safetyTitle)}</p>
          <p className="measure text-sm leading-relaxed text-foreground">{t(copy.safetyBody)}</p>
        </aside>
      </div>
    </>
  );
}
