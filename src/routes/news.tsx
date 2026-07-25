import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHero } from "@/components/site/PageHero";
import { news } from "@/content/site";
import heroGathering from "@/assets/hero-gathering.jpg";
import heroManuscript from "@/assets/hero-manuscript.jpg";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "الأخبار | News — Al Bu Obaid" },
      { name: "description", content: "أخبار الأسرة وأخبار صندوق التنمية العائلية." },
      { property: "og:title", content: "أخبار آل بوعبيد" },
      { property: "og:description", content: "أخبار الأسرة والصندوق." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/news" },
    ],
    links: [{ rel: "canonical", href: "/news" }],
  }),
  component: NewsPage,
});

function NewsPage() {
  const { t, lang } = useLang();
  const [tab, setTab] = useState<"all" | "family" | "fund">("all");

  const filtered = tab === "all" ? news : news.filter((n) => n.section === tab);

  return (
    <>
      <PageHero
        image={heroGathering}
        eyebrow={lang === "ar" ? "الأخبار" : "News"}
        title={lang === "ar" ? "أخبار الأسرة والصندوق" : "News from the family & the Fund"}
      />

      <section className="container-page py-16">
        <div className="flex gap-2">
          {(["all", "family", "fund"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${tab === k ? "bg-navy text-ivory" : "border border-border bg-background text-navy/70 hover:text-navy"}`}
            >
              {k === "all"
                ? lang === "ar" ? "الكل" : "All"
                : k === "family"
                  ? lang === "ar" ? "أخبار الأسرة" : "Family News"
                  : lang === "ar" ? "أخبار الصندوق" : "Fund News"}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((n) => (
            <Link key={n.slug} to="/news/$slug" params={{ slug: n.slug }} className="group flex flex-col overflow-hidden rounded-md border border-border bg-card transition-shadow hover:shadow-lg">
              <div className="aspect-[16/10] w-full overflow-hidden bg-navy/10">
                <img src={n.section === "fund" ? heroManuscript : heroGathering} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="text-xs uppercase tracking-widest text-gold">{n.date} · {n.section === "fund" ? (lang === "ar" ? "الصندوق" : "Fund") : (lang === "ar" ? "الأسرة" : "Family")}</div>
                <h3 className="mt-2 text-lg font-semibold text-navy">{t(n.title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(n.excerpt)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
