import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow } from "@/components/site/Editorial";
import { CopyButton } from "@/components/site/CopyButton";
import { getCanonicalUrl } from "@/lib/seo";
import { copy } from "@/content/page-copy/contribute";

export const Route = createFileRoute("/contribute")({
  head: () => ({
    meta: [
      { title: "الاشتراك والمساهمة | آل بوعبيد" },
      {
        name: "description",
        content:
          "بيانات حساب صندوق التنمية العائلية (آل بوعبيد) لدى بنك البلاد لاشتراكات ومساهمات أفراد الأسرة.",
      },
      { property: "og:title", content: "الاشتراك والمساهمة — آل بوعبيد" },
      {
        property: "og:description",
        content: "بيانات الحساب البنكي المعتمد لاشتراكات ومساهمات صندوق التنمية العائلية.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: getCanonicalUrl("/contribute") },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/contribute") }],
  }),
  component: ContributePage,
});



/** Values are transcribed exactly from the fund's official bank record. */
const bank: { label: BiText; value: string; mono?: boolean; copy?: boolean }[] = [
  { label: { ar: "اسم البنك", en: "Bank name" }, value: "بنك البلاد — Bank Albilad" },
  {
    label: { ar: "اسم الحساب", en: "Account name" },
    value: "صندوق التنمية العائلية — Family Development Fund",
  },
  {
    label: {
      ar: "رقم العميل / الهوية / السجل",
      en: "Customer ID / National ID / CR number",
    },
    value: "7001473102",
    mono: true,
    copy: true,
  },
  {
    label: { ar: "رقم الحساب", en: "Account number" },
    value: "999146092730006",
    mono: true,
    copy: true,
  },
  {
    label: { ar: "رقم الآيبان", en: "IBAN number" },
    value: "SA1915000999146092730006",
    mono: true,
    copy: true,
  },
];

function ContributePage() {
  const { t } = useLang();

  return (
    <>
      <PageHeader
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
        meta={[
          {
            label: t({ ar: "البنك", en: "Bank" }),
            value: t({ ar: "بنك البلاد", en: "Bank Albilad" }),
          },
          {
            label: t({ ar: "رقم الآيبان", en: "IBAN" }),
            value: "SA1915000999146092730006",
            mono: true,
          },
        ]}
      />

      <div className="container-page py-14 md:py-16">
        <section className="reveal-on-scroll">
          <Eyebrow rule>{t(copy.sectionTitle)}</Eyebrow>

          <dl className="mt-6 border-t border-border">
            {bank.map((row) => (
              <div
                key={row.value}
                className="grid gap-2 border-b border-border py-4 sm:grid-cols-[minmax(0,15rem)_1fr] sm:items-center sm:gap-6"
              >
                <dt className="label-caps text-muted-foreground">{t(row.label)}</dt>
                <dd className="flex flex-wrap items-center gap-3">
                  <span
                    dir="ltr"
                    className={
                      row.mono
                        ? "nums font-mono text-[15px] tracking-wide text-foreground break-all"
                        : "text-[15px] text-foreground"
                    }
                  >
                    {row.value}
                  </span>
                  {row.copy ? <CopyButton value={row.value} /> : null}
                </dd>
              </div>
            ))}
          </dl>

          <p className="measure mt-6 flex items-start gap-2 text-[13px] leading-relaxed text-muted-foreground">
            <Building2
              className="mt-0.5 h-4 w-4 shrink-0 text-bronze dark:text-gold"
              aria-hidden="true"
            />
            {t({
              ar: "يُرجى التحقق من مطابقة اسم الحساب ورقم الآيبان قبل أي تحويل.",
              en: "Please verify the account name and IBAN match before making any transfer.",
            })}
          </p>
        </section>
      </div>
    </>
  );
}
