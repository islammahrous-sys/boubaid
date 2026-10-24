import { createFileRoute, Link } from "@tanstack/react-router";
import { FileCheck2, Wallet, ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow, Prose } from "@/components/site/Editorial";
import { copy } from "@/content/page-copy/fund";
import { GatedPage, resolvePageAccess } from "@/components/access/AccessGate";

export const Route = createFileRoute("/fund")({
  // Registered family members only (Pages Access). Client-rendered so nothing
  // reaches server HTML or search indexes; access is decided before data loads.
  ssr: false,
  beforeLoad: async () => ({ access: await resolvePageAccess("members") }),
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
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: () => (
    <GatedPage title={{ ar: "صندوق التنمية العائلية", en: "Family Development Fund" }}>
      <FundPage />
    </GatedPage>
  ),
});

function FundPage() {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const cards = [
    {
      to: "/fund-certificates",
      icon: FileCheck2,
      title: t(copy.text1),
      body: t(copy.text2),
    },
    {
      to: "/fund-financials",
      icon: Wallet,
      title: t(copy.text3),
      body: t(copy.text4),
    },
  ];

  return (
    <div>
      <PageHeader eyebrow={t(copy.text5)} title={t(copy.text6)} subtitle={t(copy.text7)} />

      <section className="container-page py-12">
        <Eyebrow rule>{t(copy.text8)}</Eyebrow>
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
                  {t(copy.text9)}
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
