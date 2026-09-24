import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { news as staticNews, siteMeta } from "@/content/site";
import { getPublishedNews } from "@/lib/cms.functions";
import { mergeNews } from "@/content/cms-adapt";
import { Eyebrow } from "@/components/site/Editorial";
import { newsImage } from "@/content/news-images";
import { formatContentDate } from "@/lib/text";
import { cn } from "@/lib/utils";
import { getCanonicalUrl } from "@/lib/seo";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

/** How many "more news" stories are shown per page, after the pinned lead story. */
const NEWS_PAGE_SIZE = 9;

export const Route = createFileRoute("/news")({
  loader: async () => {
    const rows = await getPublishedNews();
    return { news: mergeNews(rows, staticNews) };
  },
  head: ({ matches, match }) => (console.log("HEADDBG", matches.map((m) => m.routeId), match.routeId), {
    meta: [
      { title: "الأخبار والبيانات الرسمية | آل بوعبيد" },
      {
        name: "description",
        content:
          "أخبار وبيانات صندوق التنمية العائلية (آل بوعبيد) بالأحساء ومستجدات فعالياتها ومبادراتها.",
      },
      { property: "og:title", content: "أخبار آل بوعبيد" },
      {
        property: "og:description",
        content:
          "أخبار وبيانات صندوق التنمية العائلية (آل بوعبيد) بالأحساء ومستجدات فعالياتها ومبادراتها.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: getCanonicalUrl("/news") },
    ],
    links:
      matches[matches.length - 1]?.routeId === match.routeId
        ? [{ rel: "canonical", href: getCanonicalUrl("/news") }]
        : [],
  }),
  component: NewsLayout,
});

function NewsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDetail = pathname !== "/news" && pathname !== "/news/";
  if (isDetail) {
    return <Outlet />;
  }
  return <NewsPage />;
}

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

function NewsPage() {
  const { t, lang } = useLang();
  const { news } = Route.useLoaderData();
  const [tab, setTab] = useState<"all" | "family" | "fund">("all");
  const [page, setPage] = useState(1);

  const filtered = tab === "all" ? news : news.filter((n) => n.section === tab);
  const [lead, ...rest] = filtered;

  // Switching sections resets to page 1 so the reader never lands on an
  // out-of-range page for the newly selected filter.
  useEffect(() => {
    setPage(1);
  }, [tab]);

  const totalPages = Math.max(1, Math.ceil(rest.length / NEWS_PAGE_SIZE));
  const pagedRest = useMemo(
    () => rest.slice((page - 1) * NEWS_PAGE_SIZE, page * NEWS_PAGE_SIZE),
    [rest, page],
  );

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
            <span className="nums">{t(siteMeta.foundedHijriLabel)} —</span>
            <span className="ornament-star h-2 w-2 text-bronze dark:text-gold" aria-hidden="true" />
            <span className="nums">{siteMeta.domain}</span>
          </div>
        </div>
      </header>

      {/* Section filter */}
      <div className="border-b border-border">
        <div className="container-page flex items-center gap-2 overflow-x-auto py-3 scrollbar-none touch-pan-x -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:gap-x-7 sm:py-3.5">
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
                  "shrink-0 inline-flex items-baseline gap-1.5 rounded-full sm:rounded-none px-3.5 sm:px-0 py-1 sm:py-0 border sm:border-0 text-xs sm:text-sm transition-all duration-150 active:scale-95 cursor-pointer",
                  active
                    ? "border-bronze bg-bronze/10 text-bronze dark:border-gold dark:bg-gold/10 dark:text-gold font-bold sm:bg-transparent sm:text-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground sm:border-transparent sm:bg-transparent",
                )}
              >
                <span>{t(f.label)}</span>
                <span className="nums text-[10px] sm:text-xs opacity-75">({count})</span>
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
            <Link
              to="/news/$slug"
              params={{ slug: lead.slug }}
              className="group active-scale block"
            >
              <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
                <img
                  src={lead.image ?? newsImage(lead.slug)}
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

                  <p className="nums mt-3 text-xs text-muted-foreground">
                    {formatContentDate(lead.dateGregorian, lang)}
                  </p>

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
                {pagedRest.map((n) => (
                  <article key={n.slug} className="border-t border-border py-6">
                    <Link
                      to="/news/$slug"
                      params={{ slug: n.slug }}
                      className="group active-scale block"
                    >
                      <div className="flex items-center gap-3">
                        <span className="label-caps text-bronze dark:text-gold">
                          {sectionLabel(n.section)}
                        </span>
                        <span className="h-3 w-px bg-border" aria-hidden="true" />
                        <span className="nums text-xs text-muted-foreground">
                          {formatContentDate(n.dateGregorian, lang)}
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

              {totalPages > 1 && (
                <Pagination className="mt-10">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage((p) => Math.max(1, p - 1));
                        }}
                        className={cn(page <= 1 && "pointer-events-none opacity-40")}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={p === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(p);
                          }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage((p) => Math.min(totalPages, p + 1));
                        }}
                        className={cn(page >= totalPages && "pointer-events-none opacity-40")}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </section>
          ) : null}
        </div>
      )}
    </>
  );
}
