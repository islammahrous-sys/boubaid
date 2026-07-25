import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHero } from "@/components/site/PageHero";
import { achievers } from "@/content/site";
import heroGathering from "@/assets/hero-gathering.jpg";

export const Route = createFileRoute("/achievers")({
  head: () => ({
    meta: [
      { title: "متميزو الأسرة | Achievers — Al Bu Obaid" },
      { name: "description", content: "شخصيات ومنجزات لافتة من أبناء أسرة آل بوعبيد في الطب، الأكاديميا، الأعمال، الرياضة، وأكثر." },
      { property: "og:title", content: "متميزو أسرة آل بوعبيد" },
      { property: "og:description", content: "قصص نجاح من أبناء الأسرة." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/achievers" },
    ],
    links: [{ rel: "canonical", href: "/achievers" }],
  }),
  component: AchieversPage,
});

const categories = [
  { key: "all", ar: "الكل", en: "All" },
  { key: "medical", ar: "طب", en: "Medical" },
  { key: "academic", ar: "أكاديمي", en: "Academic" },
  { key: "business", ar: "أعمال", en: "Business" },
  { key: "sports", ar: "رياضة", en: "Sports" },
  { key: "public", ar: "خدمة عامة", en: "Public service" },
] as const;

function AchieversPage() {
  const { t, lang } = useLang();
  const [cat, setCat] = useState<(typeof categories)[number]["key"]>("all");

  const filtered = cat === "all" ? achievers : achievers.filter((a) => a.category === cat);

  return (
    <>
      <PageHero
        image={heroGathering}
        eyebrow={lang === "ar" ? "المتميزون" : "Achievers"}
        title={lang === "ar" ? "قامات من الأسرة" : "Members who have led the way"}
        subtitle={lang === "ar" ? "قصص نجاح من مختلف الميادين." : "Stories of impact across many fields."}
      />

      <section className="container-page py-20">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${cat === c.key ? "bg-navy text-ivory" : "border border-border bg-background text-navy/70 hover:text-navy"}`}
            >
              {t({ ar: c.ar, en: c.en })}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a, i) => (
            <article key={i} className="flex gap-4 rounded-md border border-border bg-card p-5">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-navy text-xl font-bold text-gold">
                {t(a.name).charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-widest text-gold">{t(a.field)}</div>
                <h3 className="mt-1 truncate text-lg font-semibold text-navy">{t(a.name)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t(a.achievement)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
