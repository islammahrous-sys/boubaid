import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ImageOff } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { ArchiveLightbox } from "@/components/site/ArchiveLightbox";
import { getPublicGalleryBySlug } from "@/lib/cms.functions";
import { getCanonicalUrl } from "@/lib/seo";

const PAGE_SIZE = 24;

export const Route = createFileRoute("/library/museum/$slug")({
  loader: async ({ params }) => {
    const gallery = await getPublicGalleryBySlug({ data: params.slug });
    if (!gallery) throw notFound();
    return { gallery };
  },
  head: ({ loaderData }) => {
    const gallery = loaderData?.gallery;
    const title = gallery
      ? `${gallery.title_ar} | مجموعات المتحف المصورة`
      : "مجموعات المتحف المصورة";
    return {
      meta: [
        { title: `${title} | المكتبة الرقمية | آل بوعبيد` },
        { name: "description", content: gallery?.description_ar || title },
        { property: "og:title", content: title },
        { property: "og:type", content: "article" },
        ...(gallery
          ? [{ property: "og:url", content: getCanonicalUrl(`/library/museum/${gallery.slug}`) }]
          : []),
      ],
    };
  },
  component: MuseumCollectionPage,
});

const copy = {
  back: { ar: "المكتبة الرقمية", en: "Digital Library" } as BiText,
  empty: {
    ar: "لا توجد صور منشورة في هذه المجموعة بعد.",
    en: "No published images yet.",
  } as BiText,
  loadMore: { ar: "عرض المزيد من الصور", en: "Load more images" } as BiText,
};

function MuseumCollectionPage() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowRight : ArrowLeft;
  const { gallery } = Route.useLoaderData();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const visible = gallery.media.slice(0, visibleCount);

  return (
    <>
      <PageHeader
        variant="document"
        eyebrow={
          <Link
            to="/library"
            search={{ tab: "museum" }}
            className="inline-flex items-center gap-1.5 hover:text-primary"
          >
            <Arrow className="h-3.5 w-3.5" />
            {t(copy.back)}
          </Link>
        }
        title={gallery.title_ar}
        subtitle={gallery.description_ar ?? undefined}
      />

      <section className="container-page py-10 md:py-14">
        {gallery.media.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded border border-dashed border-border bg-card/40 py-24 text-center text-muted-foreground">
            <ImageOff className="h-8 w-8 opacity-50" />
            <p className="text-sm">{t(copy.empty)}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {visible.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  className="group relative aspect-square overflow-hidden rounded border border-border bg-secondary/40"
                >
                  <img
                    src={item.url}
                    alt={(rtl ? item.alt_text_ar : item.alt_text_en) || gallery.title_ar}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>

            {visibleCount < gallery.media.length && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="rounded border border-border bg-card px-5 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/40"
                >
                  {t(copy.loadMore)}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <ArchiveLightbox
        items={visible.map((item) => ({
          id: item.id,
          url: item.url,
          alt: (rtl ? item.alt_text_ar : item.alt_text_en) || gallery.title_ar,
          caption: rtl ? item.caption_ar : item.caption_en,
        }))}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </>
  );
}
