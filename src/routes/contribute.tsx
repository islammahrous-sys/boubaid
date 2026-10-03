import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpLeft, ArrowUpRight, Building2, ShieldCheck } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow } from "@/components/site/Editorial";
import { CopyButton } from "@/components/site/CopyButton";
import { getCanonicalUrl } from "@/lib/seo";
import { copy } from "@/content/page-copy/contribute";
import { inl } from "@/content/page-copy/contribute-inline";
import { getPublicTreasuryConfig } from "@/lib/contributions.functions";
import { OFFICIAL_BANK_ACCOUNT } from "@/content/fund-bank";
import { siteMeta } from "@/content/site";
import type { BankAccountConfig } from "@/lib/contributions.schemas";

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
  // Bank details come from the treasury console (blank fields fall back to the
  // official record), so a change saved there shows here without a deploy.
  loader: async () => {
    const config = await getPublicTreasuryConfig();
    return { bank: config.bankAccount };
  },
  component: ContributePage,
});

function bankRows(
  b: BankAccountConfig,
): { label: BiText; value: string; mono?: boolean; copy?: boolean }[] {
  return [
    { label: inl.t_5bd3ce0b, value: `${b.bank_name_ar} — ${b.bank_name_en}` },
    { label: inl.t_2d5a1294, value: `${b.beneficiary_name_ar} — ${b.beneficiary_name_en}` },
    ...(b.customer_number
      ? [{ label: inl.t_4a27396d, value: b.customer_number, mono: true, copy: true }]
      : []),
    { label: inl.t_5d70aa49, value: b.account_number, mono: true, copy: true },
    { label: inl.t_39d195d6, value: b.iban, mono: true, copy: true },
  ].filter((row) => row.value);
}

function ContributePage() {
  const { t, lang } = useLang();
  const bankAccount = Route.useLoaderData()?.bank ?? OFFICIAL_BANK_ACCOUNT;
  const bank = bankRows(bankAccount);

  return (
    <>
      <PageHeader
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
        meta={[
          {
            label: t(inl.t_80fbdcaf),
            value: lang === "en" ? bankAccount.bank_name_en : bankAccount.bank_name_ar,
          },
          {
            label: t(inl.t_2f3fb2d5),
            value: bankAccount.iban,
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
            {t(inl.t_34bf31bf)}
          </p>
        </section>

        {/* Trust panel: who the account belongs to and where to verify it. */}
        <aside className="reveal-on-scroll mt-10 border border-bronze/30 bg-card p-5 sm:p-6 dark:border-gold/30">
          <div className="flex items-start gap-4">
            <ShieldCheck
              className="h-9 w-9 shrink-0 text-bronze dark:text-gold"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <h2 className="font-semibold text-foreground">{t(inl.verifiedTitle)}</h2>
              <p className="measure mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                {t(inl.verifiedBody)}
              </p>
              <dl className="mt-4 grid gap-3 text-[13px] sm:grid-cols-3">
                <div>
                  <dt className="label-caps text-muted-foreground">{t(inl.verifiedAuthority)}</dt>
                  <dd className="mt-1 text-foreground">{t(siteMeta.ncnpAuthority)}</dd>
                </div>
                <div>
                  <dt className="label-caps text-muted-foreground">{t(inl.verifiedLicense)}</dt>
                  <dd dir="ltr" className="nums mt-1 font-mono text-foreground">
                    {siteMeta.ncnpLicense}
                  </dd>
                </div>
                <div>
                  <dt className="label-caps text-muted-foreground">{t(inl.verifiedUnified)}</dt>
                  <dd dir="ltr" className="nums mt-1 font-mono text-foreground">
                    {siteMeta.unifiedNationalNumber}
                  </dd>
                </div>
              </dl>
              <Link
                to="/fund-certificates"
                className="tap-target-y mt-4 inline-flex items-center gap-1.5 border-b border-bronze/50 text-sm font-semibold text-bronze transition-colors hover:border-bronze dark:border-gold/50 dark:text-gold"
              >
                {t(inl.verifiedLink)}
                {lang === "en" ? (
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <ArrowUpLeft className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
