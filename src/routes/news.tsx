import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { news, siteMeta } from "@/content/site";
import { Eyebrow } from "@/components/site/Editorial";
import { newsImage } from "@/content/news-images";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "الأخبار والبيانات الرسمية | صندوق التنمية العائلية (آل بوعبيد)" },
      {
        name: "description",
        content: "أخبار وبيانات صندوق التنمية العائلية (آل بوعبيد) بالأحساء ومستجدات فعالياتها.",
      },
      { property: "og:title", content: "أخبار آل بوعبيد" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: NewsPage,
});

const copy = {
  masthead: { ar: "نشرة الأسرة", en: "The Family Bulletin" } as BiText,
  issuedBy: { ar: "تصدر عن", en: "Issued by" } as BiText,
  filterAll: { ar: "الكل", en: "All" } as BiText,
  filterFund: { ar: "شؤون الصندوق", en: "Fund Affairs" } as BiText,
  filterFamily: { ar: "شؤون الأسرة", en: "Family" } as BiText,
  lead: { ar: "الخبر الرئيسي", en: "Lead story" } as BiText,
  more: { ar: "أخبار أخرى", en: "More news" } as BiText,
  readOn: { ar: "تتمة الخبر", en: "Continue reading" } as BiText,
  empty: { ar: "لا توجد أخبار في هذا القسم.", en: "No news in this section." } as BiText,
};

export function NewsPage() {
  const { t, lang } = useLang();
  const [tab, setTab] = useState<"all" | "family" | "fund">("all");

  const filtered = tab === "all" ? news : news.filter((n) => n.section === tab);
  const [lead, ...rest] = filtered;

  const filters: { key: typeof tab; label: BiText }[] = [
    { key: "all", label: copy.filterAll },
    { key: "fund", label: copy.filterFund },
    { key: "family", label: copy.filterFamily },
  ];

  const sectionLabel = (section: string) =>
    section === "fund" ? t(copy.filterFund) : t(copy.filterFamily);

  return (
    <>
      {/* ── Masthead — this page's signature ─────────────────── */}
      <header className="border-b-2 border-ink dark:border-ivory/25">
        <div className="container-page pt-12 pb-6 text-center md:pt-16">
          <p className="label-caps text-bronze dark:text-gold">{t(copy.issuedBy)}</p>
          <p className="mt-1.5 text-sm text-muted-foreground">{t(siteMeta.officialName)}</p>

          <h1 className="mt-5 font-brand text-4xl leading-none font-bold text-foreground md:text-6xl">
            {t(copy.masthead)}
          </h1>

          <div className="mt-6 flex items-center justify-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
            <span className="nums">{siteMeta.foundedHijri} هـ —</span>
            <span className="ornament-star h-2 w-2 text-bronze dark:text-gold" aria-hidden="true" />
            <span className="nums">{siteMeta.domain}</span>
          </div>
        </div>
      </header>

      {/* Section filter */}
      <div className="border-b border-border">
        <div className="container-page flex flex-wrap items-center gap-x-7 gap-y-2 py-3.5">
          {filters.map((f) => {
            const count =
              f.key === "all" ? news.length : news.filter((n) => n.section === f.key).length;
            const active = tab === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setTab(f.key)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-baseline gap-1.5 text-sm transition-colors",
                  active
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(f.label)}
                <span className="nums text-xs text-muted-foreground">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="container-page py-20 text-center text-sm text-muted-foreground">
          {t(copy.empty)}
        </p>
      ) : (
        <div className="container-page py-12 md:py-14">
          {/* Lead */}
          <article className="border-b border-border pb-12">
            <Link to="/news/$slug" params={{ slug: lead.slug }} className="group active-scale block">
              <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
                <img
                  src={newsImage(lead.slug)}
                  alt=""
                  className="photo-plate aspect-[16/10] w-full object-cover"
                  loading="eager"
                />

                <div className="lg:pt-2">
                  <div className="flex items-center gap-3">
                    <Eyebrow rule={false}>{t(copy.lead)}</Eyebrow>
                    <span className="h-3 w-px bg-border" aria-hidden="true" />
                    <span className="label-caps text-muted-foreground">
                      {sectionLabel(lead.section)}
                    </span>
                  </div>

                  <h2 className="mt-4 text-2xl leading-tight text-foreground transition-colors group-hover:text-bronze md:text-[2rem] dark:group-hover:text-gold">
                    {t(lead.title)}
                  </h2>

                  <p className="nums mt-3 text-xs text-muted-foreground">{lead.dateGregorian}</p>

                  <p className="measure mt-4 text-sm leading-[1.85] text-ink-soft dark:text-foreground/80">
                    {t(lead.excerpt)}
                  </p>

                  <span className="mt-5 inline-block border-b border-bronze pb-0.5 text-sm font-medium text-bronze dark:border-gold dark:text-gold">
                    {t(copy.readOn)}
                  </span>
                </div>
              </div>
            </Link>
          </article>

          {/* Remaining stories, set in columns like a news page */}
          {rest.length > 0 ? (
            <section className="reveal-on-scroll pt-10">
              <Eyebrow>{t(copy.more)}</Eyebrow>

              <div className="reveal-stagger mt-6 grid gap-x-12 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((n) => (
                  <article key={n.slug} className="border-t border-border py-6">
                    <Link to="/news/$slug" params={{ slug: n.slug }} className="group active-scale block">
                      <div className="flex items-center gap-3">
                        <span className="label-caps text-bronze dark:text-gold">
                          {sectionLabel(n.section)}
                        </span>
                        <span className="h-3 w-px bg-border" aria-hidden="true" />
                        <span className="nums text-xs text-muted-foreground">
                          {n.dateGregorian}
                        </span>
                      </div>

                      <h3 className="mt-2.5 text-lg leading-snug text-foreground transition-colors group-hover:text-bronze dark:group-hover:text-gold">
                        {t(n.title)}
                      </h3>

                      <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
                        {t(n.excerpt)}
                      </p>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </>
  );
}
