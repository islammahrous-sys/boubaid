import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { initiatives as staticInitiatives, hqProject } from "@/content/site";
import { getPublishedInitiatives } from "@/lib/cms.functions";
import { mergeInitiatives } from "@/content/cms-adapt";
import { pageImages } from "@/content/images";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow, Status, Prose } from "@/components/site/Editorial";
import { getCanonicalUrl } from "@/lib/seo";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { copy } from "@/content/page-copy/initiatives";

/** How many programmes are shown per page in the schedule table. */
const PAGE_SIZE = 20;

export const Route = createFileRoute("/initiatives")({
  // The standalone Projects page was retired: the headquarters project now
  // lives under Committees → 1448. Individual detail pages still resolve.
  beforeLoad: ({ location }) => {
    if (location.pathname === "/initiatives" || location.pathname === "/initiatives/") {
      throw redirect({ to: "/committees", hash: "hq-project", statusCode: 301 });
    }
  },
  loader: async () => {
    const rows = await getPublishedInitiatives();
    return { initiatives: mergeInitiatives(rows, staticInitiatives) };
  },
  head: ({ matches, match }) => ({
    meta: [
      { title: "المبادرات والمشاريع | آل بوعبيد" },
      {
        name: "description",
        content:
          "المبادرات التنموية والاجتماعية لصندوق التنمية العائلية (آل بوعبيد) ومشروع المقر الدائم بحي الحزام الذهبي.",
      },
      { property: "og:title", content: "مبادرات آل بوعبيد" },
      {
        property: "og:description",
        content:
          "المبادرات التنموية والاجتماعية لصندوق التنمية العائلية (آل بوعبيد) ومشروع المقر الدائم بحي الحزام الذهبي.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: getCanonicalUrl("/initiatives") },
    ],
    links:
      matches[matches.length - 1]?.routeId === match.routeId
        ? [{ rel: "canonical", href: getCanonicalUrl("/initiatives") }]
        : [],
  }),
  component: InitiativesLayout,
});

function InitiativesLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDetail = pathname !== "/initiatives" && pathname !== "/initiatives/";
  if (isDetail) {
    return <Outlet />;
  }
  return <InitiativesPage />;
}

function InitiativesPage() {
  const { t, lang } = useLang();
  const { initiatives } = Route.useLoaderData();
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;
  const [page, setPage] = useState(1);

  const activeCount = initiatives.filter((i) => i.status === "ongoing").length;
  const plannedCount = initiatives.filter((i) => i.status === "upcoming").length;

  const liveHq = initiatives.find(
    (i) => i.slug === "hq" || i.slug === "permanent-hq" || i.slug.includes("hq"),
  );
  const hqTitle = liveHq?.title ?? hqProject.title;
  const hqFunding = liveHq?.summary ?? hqProject.fundingModel;
  const hqImage = liveHq?.image || pageImages.initiatives.flagship.src;

  const totalPages = Math.max(1, Math.ceil(initiatives.length / PAGE_SIZE));
  const pagedInitiatives = useMemo(
    () => initiatives.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [initiatives, page],
  );

  return (
    <>
      <PageHeader
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
        meta={[
          { label: t(copy.metaActive), value: activeCount.toString(), mono: true },
          { label: t(copy.metaPlanned), value: plannedCount.toString(), mono: true },
          { label: t(copy.metaCapital), value: t(copy.metaCapitalValue) },
        ]}
      />

      {/* ── Flagship: the headquarters, given a spec sheet ──── */}
      <section className="reveal-on-scroll border-b border-border bg-secondary/40">
        <div className="container-page py-14 md:py-16">
          <Eyebrow>{t(copy.flagshipEyebrow)}</Eyebrow>
          <h2 className="mt-3 max-w-3xl text-2xl leading-tight text-foreground md:text-3xl">
            {t(hqTitle)}
          </h2>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
            <figure>
              <img
                src={hqImage}
                alt={t(hqTitle)}
                className="photo-plate aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
              <figcaption className="mt-3 flex items-start gap-2.5 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 h-px w-5 shrink-0 bg-bronze" aria-hidden="true" />
                <span>{t(pageImages.initiatives.flagship.caption)}</span>
              </figcaption>
            </figure>

            <div>
              <p className="label-caps border-b border-ink/25 pb-2.5 text-muted-foreground dark:border-ivory/20">
                {t(copy.specTitle)}
              </p>

              <div className="mt-5">
                <div className="flex items-baseline justify-between">
                  <span className="label-caps text-muted-foreground">{t(copy.specProgress)}</span>
                  <span className="nums font-mono text-2xl text-foreground">
                    {hqProject.progress}%
                  </span>
                </div>
                <div
                  className="mt-3 h-1.5 w-full bg-border"
                  role="progressbar"
                  aria-valuenow={hqProject.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={t(copy.specProgress)}
                >
                  <div
                    className="h-full bg-bronze dark:bg-gold"
                    style={{ width: `${hqProject.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-5">
                <p className="label-caps mb-2 text-muted-foreground">
                  {rtl ? "تكلفة البناء والتمويل" : "Construction cost & funding"}
                </p>
                <Prose className="text-[13px]">
                  <p>{t(hqFunding)}</p>
                </Prose>
                <div className="mt-5">
                  <Link
                    to="/contribute"
                    search={{ initiative: liveHq?.slug || "hq", purpose: "hq_project" }}
                    className="inline-flex items-center gap-2 border border-ink bg-ink px-4 py-2.5 text-xs font-bold text-ivory transition-colors hover:bg-transparent hover:text-foreground dark:border-gold dark:bg-gold dark:text-ink dark:hover:bg-transparent dark:hover:text-gold"
                  >
                    <span>{rtl ? "ننتظر دعمك" : "We await your support"}</span>
                    <Arrow className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Programme schedule ──────────────────────────────── */}
      <section className="reveal-on-scroll container-page py-14 md:py-16">
        <Eyebrow>{t(copy.scheduleEyebrow)}</Eyebrow>
        <h2 className="mt-3 text-2xl leading-tight text-foreground md:text-3xl">
          {t(copy.scheduleTitle)}
        </h2>

        <ol className="mt-8 border-t border-ink/25 dark:border-ivory/20">
          {pagedInitiatives.map((init, i) => (
            <li key={init.slug} className="border-b border-border">
              <Link
                to="/initiatives/$slug"
                params={{ slug: init.slug }}
                className="group grid gap-x-6 gap-y-2 py-6 transition-[color,background-color,transform] duration-200 ease-out hover:bg-secondary/40 active:scale-[0.99] md:grid-cols-[2.5rem_minmax(0,18rem)_1fr_auto] md:items-baseline cursor-pointer"
              >
                <span
                  className="nums font-mono text-sm text-bronze/70 dark:text-gold/60"
                  aria-hidden="true"
                >
                  {String((page - 1) * PAGE_SIZE + i + 1).padStart(2, "0")}
                </span>

                <h3 className="text-[15px] leading-snug font-semibold text-foreground transition-colors group-hover:text-bronze dark:group-hover:text-gold">
                  {t(init.title)}
                </h3>

                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {t(init.summary)}
                </p>

                <span className="justify-self-start md:justify-self-end">
                  <Status
                    tone={
                      init.status === "ongoing"
                        ? "active"
                        : init.status === "completed"
                          ? "neutral"
                          : "pending"
                    }
                  >
                    {init.status === "ongoing"
                      ? t(copy.active)
                      : init.status === "completed"
                        ? t(copy.completed)
                        : t(copy.planned)}
                  </Status>
                </span>
              </Link>
            </li>
          ))}
        </ol>

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

      {/* ── Support ─────────────────────────────────────────── */}
      <section className="reveal-on-scroll border-t border-border bg-secondary/40">
        <div className="container-page flex flex-wrap items-center justify-between gap-6 py-12">
          <div className="measure">
            <h2 className="text-xl text-foreground">{t(copy.supportTitle)}</h2>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
              {t(copy.supportBody)}
            </p>
          </div>
          <Link
            to="/contribute"
            className="inline-flex shrink-0 items-center gap-2 border border-ink bg-ink px-5 py-3 text-sm font-medium text-ivory transition-colors hover:bg-transparent hover:text-foreground dark:border-gold dark:bg-gold dark:text-ink dark:hover:bg-transparent dark:hover:text-gold"
          >
            {t(copy.supportCta)}
            <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
