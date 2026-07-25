import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHero } from "@/components/site/PageHero";
import { news } from "@/content/site";
import heroManuscript from "@/assets/hero-manuscript.jpg";
import heroGathering from "@/assets/hero-gathering.jpg";

export const Route = createFileRoute("/news/$slug")({
  loader: ({ params }) => {
    const item = news.find((n) => n.slug === params.slug);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.item.title.ar ?? "خبر";
    return {
      meta: [
        { title },
        { name: "description", content: loaderData?.item.excerpt.ar ?? "" },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData?.item.excerpt.en ?? "" },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: NewsDetail,
});

function NewsDetail() {
  const { item } = Route.useLoaderData();
  const { t, lang } = useLang();
  const shareText = encodeURIComponent(t(item.title));

  return (
    <>
      <PageHero
        image={item.section === "fund" ? heroManuscript : heroGathering}
        eyebrow={`${item.date} · ${item.section === "fund" ? (lang === "ar" ? "الصندوق" : "Fund") : (lang === "ar" ? "الأسرة" : "Family")}`}
        title={t(item.title)}
        subtitle={t(item.excerpt)}
      />
      <article className="container-page py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-lg leading-loose text-navy/85">{t(item.body)}</p>
          <div className="gold-divider my-10 w-24" />
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-navy">{lang === "ar" ? "شارك:" : "Share:"}</span>
            <a href={`https://twitter.com/intent/tweet?text=${shareText}`} target="_blank" rel="noopener noreferrer" className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:border-gold">X</a>
            <a href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noopener noreferrer" className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:border-gold">WhatsApp</a>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard?.writeText(window.location.href);
                  toast.success(lang === "ar" ? "تم نسخ الرابط" : "Link copied");
                }
              }}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:border-gold"
            >
              {lang === "ar" ? "نسخ الرابط" : "Copy link"}
            </button>
          </div>
          <div className="mt-10">
            <Link to="/news" className="text-sm font-semibold text-navy underline decoration-gold underline-offset-8">
              ← {lang === "ar" ? "كل الأخبار" : "All news"}
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
