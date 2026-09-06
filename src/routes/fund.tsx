import { createFileRoute, Link } from "@tanstack/react-router";
import { FileCheck2, Wallet, ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow, Prose } from "@/components/site/Editorial";
import { getCanonicalUrl } from "@/lib/seo";

export const Route = createFileRoute("/fund")({
  head: () => ({
    meta: [
      { title: "صندوق التنمية العائلية | آل بوعبيد" },
      {
        name: "description",
        content:
          "صندوق التنمية العائلية لأسرة آل بوعبيد: الشهادات والإثباتات الرسمية، والقوائم المالية والموازنة وكشوف الحسابات.",
      },
      { property: "og:title", content: "صندوق التنمية العائلية — آل بوعبيد" },
      {
        property: "og:description",
        content:
          "الشهادات والإثباتات الرسمية للصندوق، والقوائم المالية والموازنة وكشوف الحسابات المعتمدة.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: getCanonicalUrl("/fund") },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/fund") }],
  }),
  component: FundPage,
});

function FundPage() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const cards = [
    {
      to: "/fund-certificates",
      icon: FileCheck2,
      title: isAr ? "الشهادات و الاثباتات" : "Certificates & Attestations",
      body: isAr
        ? "الترخيص الرسمي وشهادات التسجيل والإثباتات النظامية المعتمدة للصندوق."
        : "The official licence, registration certificates, and statutory attestations of the fund.",
    },
    {
      to: "/fund-financials",
      icon: Wallet,
      title: isAr
        ? "القوائم المالية والموازنة والحسابات"
        : "Financial Statements, Budget & Accounts",
      body: isAr
        ? "القوائم المالية السنوية، والموازنة التقديرية، وكشوف الحسابات التاريخية للصندوق."
        : "Annual financial statements, the approved budget, and historical account statements.",
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow={isAr ? "الشأن المالي" : "Financial affairs"}
        title={isAr ? "صندوق التنمية العائلية" : "Family Development Fund"}
        subtitle={
          isAr
            ? "الوعاء المالي المرخّص للأسرة: توثيق نظامي معلن، وقوائم مالية وموازنة تُعرض على مجلس الأسرة."
            : "The family's licensed financial vehicle: published statutory documentation, financial statements, and a budget presented to the Family Council."
        }
      />

      <section className="container-page py-12">
        <Eyebrow rule>{isAr ? "الأقسام" : "Sections"}</Eyebrow>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.to}
                to={c.to}
                className="group flex flex-col border border-border bg-card p-6 transition-colors hover:border-bronze/60 dark:hover:border-gold/50"
              >
                <Icon className="h-6 w-6 text-bronze dark:text-gold" aria-hidden="true" />
                <h2 className="mt-4 font-brand text-lg font-bold text-foreground group-hover:text-bronze dark:group-hover:text-gold">
                  {c.title}
                </h2>
                <Prose className="mt-2 text-sm text-muted-foreground">{c.body}</Prose>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-bronze dark:text-gold">
                  {isAr ? "استعراض" : "View"}
                  <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
