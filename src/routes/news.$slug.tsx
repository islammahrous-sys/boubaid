import { ContentNotFound } from "@/components/site/ContentNotFound";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Link2, Clock, Share2, Check } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { news as staticNews, siteMeta } from "@/content/site";
import { getPublishedNews } from "@/lib/cms.functions";
import { mergeNews } from "@/content/cms-adapt";
import { Ornament } from "@/components/site/Editorial";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ReadingProgress } from "@/components/site/ReadingProgress";
import { newsImage } from "@/content/news-images";
import { formatContentDate } from "@/lib/text";
import { formatDualHijriYear } from "@/lib/dates";
import { getCanonicalUrl } from "@/lib/seo";
import { copy } from "@/content/page-copy/news-slug";

export const Route = createFileRoute("/news/$slug")({
  loader: async ({ params }) => {
    const rows = await getPublishedNews();
    const news = mergeNews(rows, staticNews);
    const item = news.find((n) => n.slug === params.slug);
    if (!item) throw notFound();
    return { item, news };
  },
  head: ({ params, loaderData }) => {
    const title = loaderData ? `${loaderData.item.title.ar} — ${loaderData.item.title.en}` : "خبر";
    const url = getCanonicalUrl(`/news/${params.slug}`);
    return {
      meta: [
        { title },
        { name: "description", content: loaderData?.item.excerpt.ar ?? "" },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: loaderData?.item.excerpt.en ?? loaderData?.item.excerpt.ar ?? "",
        },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: NewsDetail,
  notFoundComponent: () => <ContentNotFound kind="news" />,
});

function NewsDetail() {
  const { item, news } = Route.useLoaderData();
  const { t, lang } = useLang();
  const [copied, setCopied] = useState(false);
  const rtl = lang === "ar";
  const BackArrow = rtl ? ArrowRight : ArrowLeft;

  const wordCount = t(item.body).trim().split(/\s+/).length;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 180));

  const shareText = encodeURIComponent(`${t(item.title)}\n\n${t(item.excerpt)}`);
  const sectionLabel = item.section === "fund" ? t(copy.fund) : t(copy.family);
  const others = news.filter((n) => n.slug !== item.slug).slice(0, 3);

  // Sequential reading: the bulletin is ordered, so offer the neighbouring
  // dispatches rather than making the reader return to the index.
  const index = news.findIndex((n) => n.slug === item.slug);
  const prev = index > 0 ? news[index - 1] : undefined;
  const next = index >= 0 && index < news.length - 1 ? news[index + 1] : undefined;

  const copyLink = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      toast.success(t(copy.copied));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(rtl ? "تعذر نسخ الرابط" : "Failed to copy link");
    }
  };

  return (
    <article className="container-page py-12 md:py-16">
      <ReadingProgress />

      {/* Dateline */}
      <div className="mx-auto max-w-3xl">
        <Breadcrumbs
          className="print-hide"
          items={[
            { label: copy.home, to: "/" },
            { label: copy.bulletin, to: "/news" },
            { label: item.title },
          ]}
        />

        <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-ink/25 pb-3 dark:border-ivory/20">
          <span className="label-caps text-bronze dark:text-gold">{sectionLabel}</span>
          <span className="h-3 w-px bg-border" aria-hidden="true" />
          <span className="nums text-xs text-muted-foreground">
            {formatContentDate(item.dateGregorian, lang)}
          </span>
          <span className="h-3 w-px bg-border" aria-hidden="true" />
          <span className="nums text-xs text-muted-foreground">
            {formatDualHijriYear(item.date.match(/^\d+/)?.[0] ?? item.date, lang)}
          </span>
          <span className="h-3 w-px bg-border" aria-hidden="true" />
          <span className="nums text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3 text-bronze dark:text-gold" />
            {lang === "ar" ? `${readingMinutes} دقائق للقراءة` : `${readingMinutes} min read`}
          </span>
        </div>

        <h1 className="mt-6 text-balance text-3xl leading-[1.25] text-foreground md:text-[2.5rem]">
          {t(item.title)}
        </h1>

        {/* Standfirst, set apart from the body */}
        <p className="mt-5 border-s-2 border-bronze/50 ps-5 text-base leading-relaxed text-ink-soft dark:border-gold/50 dark:text-foreground/80">
          {t(item.excerpt)}
        </p>
      </div>

      <figure className="mx-auto mt-10 max-w-4xl">
        <img
          src={item.image ?? newsImage(item.slug)}
          alt=""
          className="photo-plate aspect-[16/9] w-full object-cover"
          loading="eager"
        />
      </figure>

      {/* Body */}
      <div className="mx-auto mt-10 max-w-3xl">
        <div className="measure mx-auto text-[0.95rem] leading-[1.95] text-ink-soft dark:text-foreground/85">
          <p className="drop-cap whitespace-pre-line">{t(item.body)}</p>
        </div>

        <Ornament className="my-10" />

        {/* Colophon */}
        <div className="border-t border-border pt-5">
          <p className="label-caps text-muted-foreground">{t(copy.issuedBy)}</p>
          <p className="mt-1.5 text-sm text-foreground">{t(siteMeta.officialName)}</p>
          <p className="nums mt-0.5 font-mono text-xs text-bronze dark:text-gold">
            {siteMeta.ncnpLicense}
          </p>
        </div>

        {/* Share */}
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-border py-4">
          <span className="label-caps text-muted-foreground">{t(copy.share)}</span>
          <a
            href={`https://wa.me/?text=${shareText}%20${encodeURIComponent(getCanonicalUrl(`/news/${item.slug}`))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 transition-colors hover:underline font-semibold"
          >
            <Share2 className="w-3.5 h-3.5" />
            WhatsApp
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(getCanonicalUrl(`/news/${item.slug}`))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-foreground transition-colors hover:text-bronze dark:hover:text-gold font-medium"
          >
            X (Twitter)
          </a>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center gap-1.5 text-sm text-foreground transition-colors hover:text-bronze dark:hover:text-gold cursor-pointer"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {copied ? (rtl ? "تم النسخ" : "Copied") : t(copy.copyLink)}
          </button>
        </div>

        {/* Also in this issue */}
        {others.length > 0 ? (
          <section className="reveal-on-scroll mt-12">
            <p className="label-caps border-b border-border pb-2 text-bronze dark:text-gold">
              {t(copy.alsoIn)}
            </p>
            <ol>
              {others.map((n) => (
                <li key={n.slug}>
                  <Link
                    to="/news/$slug"
                    params={{ slug: n.slug }}
                    className="group block border-b border-border py-4"
                  >
                    <p className="nums label-caps text-muted-foreground">
                      {formatContentDate(n.dateGregorian, lang)}
                    </p>
                    <p className="mt-1.5 text-[15px] leading-snug font-medium text-foreground transition-colors group-hover:text-bronze dark:group-hover:text-gold">
                      {t(n.title)}
                    </p>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {/* Continue reading */}
        {prev || next ? (
          <nav
            aria-label={t({ ar: "متابعة القراءة", en: "Continue reading" })}
            className="reveal-on-scroll mt-12 grid gap-px border-t border-border sm:grid-cols-2"
          >
            {[
              { entry: prev, label: copy.prev, align: "start" as const },
              { entry: next, label: copy.next, align: "end" as const },
            ].map(({ entry, label, align }, i) =>
              entry ? (
                <Link
                  key={i}
                  to="/news/$slug"
                  params={{ slug: entry.slug }}
                  className={`card-craft active-scale group block p-5 ${align === "end" ? "sm:text-end" : ""}`}
                >
                  <span className="label-caps text-muted-foreground">{t(label)}</span>
                  <span className="mt-2 block text-[15px] leading-snug font-medium text-foreground transition-colors group-hover:text-bronze dark:group-hover:text-gold">
                    {t(entry.title)}
                  </span>
                </Link>
              ) : (
                <span key={i} aria-hidden="true" className="hidden sm:block" />
              ),
            )}
          </nav>
        ) : null}

        <Link
          to="/news"
          className="tap-target-y mt-10 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
        >
          <BackArrow className="h-3.5 w-3.5" aria-hidden="true" />
          {t(copy.back)}
        </Link>
      </div>
    </article>
  );
}
