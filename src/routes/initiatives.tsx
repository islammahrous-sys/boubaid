import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHero } from "@/components/site/PageHero";
import { T } from "@/i18n/translations";
import { initiatives } from "@/content/site";
import heroManuscript from "@/assets/hero-manuscript.jpg";

export const Route = createFileRoute("/initiatives")({
  head: () => ({
    meta: [
      { title: "المبادرات والمشاريع | Initiatives — Al Bu Obaid Fund" },
      { name: "description", content: "المبادرات والمشاريع التي يقودها صندوق التنمية العائلية لآل بوعبيد." },
      { property: "og:title", content: "مبادرات صندوق آل بوعبيد" },
      { property: "og:description", content: "برامج ومشاريع مستدامة." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/initiatives" },
    ],
    links: [{ rel: "canonical", href: "/initiatives" }],
  }),
  component: InitiativesPage,
});

function InitiativesPage() {
  const { t, lang } = useLang();
  return (
    <>
      <PageHero
        image={heroManuscript}
        eyebrow={lang === "ar" ? "المبادرات" : "Initiatives"}
        title={lang === "ar" ? "مبادرات ومشاريع تصنع الأثر" : "Programmes that make an impact"}
      />
      <section className="container-page py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {initiatives.map((i) => (
            <Link key={i.slug} to="/initiatives/$slug" params={{ slug: i.slug }} className="flex flex-col rounded-md border border-border bg-card p-6 transition-shadow hover:shadow-lg">
              <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${i.status === "completed" ? "bg-emerald/10 text-emerald" : i.status === "upcoming" ? "bg-gold/20 text-navy" : "bg-navy/10 text-navy"}`}>
                {t(T.status[i.status])}
              </span>
              <h3 className="mt-4 text-xl font-semibold text-navy">{t(i.title)}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{t(i.summary)}</p>
              <span className="mt-4 text-sm font-semibold text-navy">{t(T.common.details)} →</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
