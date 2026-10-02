import { createFileRoute } from "@tanstack/react-router";
import { Maximize2, ExternalLink, Sparkles, MousePointerClick } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow } from "@/components/site/Editorial";
import { siteMeta } from "@/content/site";
import { getCanonicalUrl } from "@/lib/seo";
import { getPublicSiteSettings } from "@/lib/cms.functions";
import { copy } from "@/content/page-copy/official-family-tree";

/** Bundled fallback used only if the managed media record is unavailable. */
const FALLBACK_PLATE = "/images/family_tree_official_artwork.jpg";

export const Route = createFileRoute("/official-family-tree")({
  loader: () => getPublicSiteSettings(),
  errorComponent: () => (
    <div className="container-page py-20 text-center text-sm text-muted-foreground">
      تعذّر تحميل الصفحة، يرجى المحاولة مرة أخرى.
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-page py-20 text-center text-sm text-muted-foreground">
      الصفحة غير متوفرة.
    </div>
  ),
  head: () => ({
    meta: [
      { title: "شجرة العائلة — اللوحة الرسمية المصورة لشجرة العائلة | آل بوعبيد" },
      {
        name: "description",
        content:
          "اللوحة الرسمية المصورة لشجرة العائلة لأسرة آل بوعبيد: للاقتناء والاطلاع على المقاسات والطلب عبر متجر الأسرة الرسمي.",
      },
      { property: "og:title", content: "اللوحة الرسمية المصورة لشجرة العائلة — آل بوعبيد" },
      {
        property: "og:description",
        content: "للاقتناء والاطلاع على المقاسات وطلب اللوحة عبر متجر الأسرة الرسمي.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: getCanonicalUrl("/official-family-tree") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/official-family-tree") }],
  }),
  component: OfficialFamilyTreePage,
});

function OfficialFamilyTreePage() {
  const { t, lang } = useLang();
  const isAr = lang === "ar";
  const settings = Route.useLoaderData();
  const plateSrc: string = settings?.family_tree_plate?.url || FALLBACK_PLATE;

  return (
    <div>
      <PageHeader
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
        meta={[
          {
            label: isAr ? "الإصدار" : "Edition",
            value: isAr ? "الأول ١٤٤٧هـ" : "First 1447H",
            mono: true,
          },
          {
            label: isAr ? "التوصيل" : "Delivery",
            value: isAr ? "مؤطر وجاهز" : "Framed & ready",
          },
          {
            label: isAr ? "مقاس خاص" : "Custom size",
            value: isAr ? "متاح" : "Available",
          },
        ]}
      />

      {/* ── Purchasing notice ─────────────────────────────────── */}
      <section className="container-page pt-10">
        <div className="relative overflow-hidden border border-gold/50 bg-gold/10 p-5 md:p-6 dark:border-gold/30 dark:bg-gold/[0.08] rounded-md">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
            <div className="flex items-start gap-3">
              <span
                className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center border border-gold/50 bg-background/60 text-bronze dark:text-gold rounded-md"
                aria-hidden="true"
              >
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="font-serif text-base font-bold leading-snug text-foreground md:text-lg">
                  {t(copy.noticeTitle)}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  {t(copy.noticeBody)}
                </p>
              </div>
            </div>
            <a
              href={siteMeta.frameStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 border border-gold bg-gold px-5 py-2.5 text-[13px] font-bold text-ink transition-colors hover:bg-transparent hover:text-gold rounded-md"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              {isAr ? "الشراء الآن" : "Buy now"}
            </a>
          </div>
        </div>
      </section>

      {/* ── The official commissioned artwork ─────────────────── */}
      <section className="reveal-on-scroll container-page py-12 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
          <div>
            <Eyebrow>{t(copy.eyebrow)}</Eyebrow>
            <h2 className="mt-3 font-serif text-xl leading-tight text-foreground md:text-2xl">
              {t(copy.title)}
            </h2>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
              {t(copy.artworkBody)}
            </p>
            <a
              href={plateSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 border-b border-bronze pb-0.5 label-caps text-xs font-semibold text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
            >
              {t(copy.artworkOpen)}
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>

          <a
            href={plateSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="block border border-border bg-card p-3 transition-colors hover:border-foreground"
          >
            <img
              src={plateSrc}
              alt={
                isAr
                  ? "اللوحة الرسمية المصورة لشجرة العائلة لأسرة آل بوعبيد"
                  : "The official illustrated family tree of the Al Bu Obaid family"
              }
              className="mx-auto h-auto max-h-[36rem] w-auto object-contain"
              loading="lazy"
            />
          </a>
        </div>
      </section>

      {/* ── Catalog CTA ───────────────────────────────────────── */}
      <section className="container-page border-t border-border py-12 md:py-16">
        <div className="relative mx-auto max-w-3xl overflow-hidden border border-gold/40 bg-gold/[0.06] p-6 text-center dark:border-gold/30 dark:bg-gold/[0.05] md:p-10 rounded-md">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-70"
            aria-hidden="true"
          />
          <Eyebrow className="justify-center">{t(copy.ctaEyebrow)}</Eyebrow>
          <h2 className="mt-4 font-serif text-2xl leading-tight text-foreground md:text-3xl">
            {t(copy.ctaTitle)}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
            {t(copy.ctaHint)}
          </p>
          <a
            href={siteMeta.frameStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center gap-2 border border-gold bg-gold px-6 py-3 text-[14px] font-bold text-ink transition-colors hover:bg-transparent hover:text-gold rounded-md"
          >
            <MousePointerClick className="h-4 w-4" aria-hidden="true" />
            {t(copy.ctaButton)}
          </a>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-70"
            aria-hidden="true"
          />
        </div>
      </section>
    </div>
  );
}
