import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageProvider";
import { getPublicContentPageBySlug } from "@/lib/cms.functions";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Rule } from "@/components/site/Editorial";
import { getCanonicalUrl } from "@/lib/seo";

export const Route = createFileRoute("/p/$slug")({
  loader: async ({ params }) => {
    const data = await getPublicContentPageBySlug({ data: params.slug });
    if (!data || !data.page) {
      throw notFound();
    }
    return data;
  },
  head: ({ params, loaderData }) => {
    const page = loaderData?.page;
    if (!page) return { meta: [{ title: "الصفحة غير موجودة | أسرة آل بوعبيد" }] };
    const title = `${page.seo_title_ar || page.title_ar} | أسرة آل بوعبيد`;
    const desc = page.seo_description_ar || page.excerpt_ar || "";
    const url = getCanonicalUrl(`/p/${params.slug}`);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: DynamicCmsPageComponent,
});

function DynamicCmsPageComponent() {
  const { page, sections } = Route.useLoaderData();
  const { lang } = useLang();
  const isAr = lang === "ar";
  const title = isAr ? page.title_ar : (page.title_en || page.title_ar);

  return (
    <div className="min-h-screen pb-20">
      <PageHeader
        eyebrow={isAr ? "صفحة مخصصة" : "Special Page"}
        title={title}
        subtitle={page.excerpt_ar ? (isAr ? page.excerpt_ar : page.excerpt_en || page.excerpt_ar) : undefined}
      />

      {page.featured_media_path && (
        <div className="container-page mt-8">
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl border border-border shadow-md">
            <img
              src={page.featured_media_path}
              alt={title}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      )}

      <div className="container-page mt-12 space-y-16">
        {sections && sections.length > 0 ? (
          sections.map((section: any, idx: number) => (
            <DynamicBlockRenderer key={section.id || idx} section={section} isAr={isAr} />
          ))
        ) : (
          <div className="py-16 text-center text-muted-foreground">
            <p>{isAr ? "لا توجد أقسام مٶافة لهذه الصفحة بعد." : "No sections added to this page yet."}</p>
          </div>
        )}
      </div>

      <div className="container-page mt-20">
        <Rule variant="hair" />
      </div>
    </div>
  );
}


function DynamicBlockRenderer({ section, isAr }: { section: any; isAr: boolean }) {
  const { type, data } = section;
  if (!data) return null;

  switch (type) {
    case "hero":
      return (
        <div className="rounded-3xl border border-border bg-card p-8 md:p-12 text-center relative overflow-hidden">
          {data.bg_image_url && (
            <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: `url(${data.bg_image_url})` }} />
          )}
          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <h2 className="text-2xl md:text-4xl font-bold font-brand text-foreground">
              {isAr ? data.title_ar : (data.title_en || data.title_ar)}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {isAr ? data.subtitle_ar : (data.subtitle_en || data.subtitle_ar)}
            </p>
            {data.button_text_ar && data.button_url && (
              <div className="pt-4">
                <Link
                  to={data.button_url}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md hover:bg-primary/90 transition-all"
                >
                  <span>{isAr ? data.button_text_ar : (data.button_text_en || data.button_text_ar)}</span>
                  {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </Link>
              </div>
            )}
          </div>
        </div>
      );


    case "rich_text":
      return (
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg dark:prose-invert max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
            {isAr ? data.content_ar : (data.content_en || data.content_ar)}
          </div>
        </div>
      );


    case "image":
      return (
        <figure className="max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
            <img src={data.url} alt={data.alt_ar || ""} className="w-full object-cover" />
          </div>
          {(data.caption_ar || data.caption_en) && (
            <figcaption className="mt-3 text-center text-xs text-muted-foreground">
              {isAr ? data.caption_ar : (data.caption_en || data.caption_ar)}
            </figcaption>
          )}
        </figure>
      );


    case "quote":
      return (
        <div className="max-w-3xl mx-auto p-8 rounded-2xl border-y border-border bg-secondary/30 text-center relative">
          <Quote className="w-8 h-8 text-primary/30 mx-auto mb-4" />
          <blockquote className="text-lg md:text-xl font-medium text-foreground leading-relaxed font-naskh">
            &quot;{isAr ? data.quote_ar : (data.quote_en || data.quote_ar)}&quot;
          </blockquote>
          {data.author_ar && (
            <cite className="block mt-4 text-xs font-bold text-primary not-italic">
              — {isAr ? data.author_ar : (data.author_en || data.author_ar)}
            </cite>
          )}
        </div>
      );


    case "statistics":
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {(data.items || []).map((item: any, i: number) => (
            <div key={i} className="p-6 rounded-2xl border border-border bg-card text-center space-y-1">
              <span className="font-mono text-3xl md:text-4xl font-bold text-primary block">
                {item.number}
              </span>
              <span className="text-xs text-muted-foreground font-medium block">
                {isAr ? item.label_ar : (item.label_en || item.label_ar)}
              </span>
            </div>
          ))}
        </div>
      );


    case "cta":
      return (
        <div className="max-w-3xl mx-auto rounded-3xl border border-border bg-secondary/30 p-8 md:p-12 text-center space-y-4">
          <h2 className="text-xl md:text-2xl font-bold font-brand text-foreground">
            {isAr ? data.title_ar : (data.title_en || data.title_ar)}
          </h2>
          {(data.desc_ar || data.desc_en) && (
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {isAr ? data.desc_ar : (data.desc_en || data.desc_ar)}
            </p>
          )}
          {data.button_text_ar && data.button_url && (
            <div className="pt-2">
              <Link
                to={data.button_url}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md hover:bg-primary/90 transition-all"
              >
                <span>{isAr ? data.button_text_ar : (data.button_text_en || data.button_text_ar)}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </Link>
            </div>
          )}
        </div>
      );

    case "divider":
      return <Rule variant="hair" />;

    default:
      return (
        <div className="p-4 rounded-xl border border-border bg-muted/20 text-xs text-muted-foreground text-center">
          {isAr ? `قسم مخصى (${type})` : `Custom Section (${type})`}
        </div>
      );
  }
}
