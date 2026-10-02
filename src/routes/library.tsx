import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useMemo, useEffect } from "react";
import {
  Search,
  X,
  Landmark,
  FolderOpen,
  ImageOff,
  Images,
  ArrowLeft,
  ArrowRight,
  Loader2,
  PlayCircle,
  Video,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { ArchiveVideoPlayer } from "@/components/site/ArchiveVideoPlayer";
import { ArchiveLightbox } from "@/components/site/ArchiveLightbox";
import { CommitteeYearGrid, type CommitteeArchiveItem } from "@/components/site/CommitteeYearGrid";
import { Eyebrow } from "@/components/site/Editorial";
import { resolveCommitteeDocuments } from "@/content/committee-documents";
import { openMediaViewer } from "@/components/site/GlobalMediaViewer";
import {
  getPublishedGalleries,
  getPublishedArchiveFolders,
  getPublishedArchiveVideos,
  getPublishedLibrary,
  getPublicGalleryBySlug,
} from "@/lib/cms.functions";
import { cn } from "@/lib/utils";
import { getCanonicalUrl } from "@/lib/seo";
import { copy } from "@/content/page-copy/library";

/**
 * Archive (/library).
 *
 * The page is entirely data-driven from the `galleries` table:
 *  - `section = "archive"` rows build the folder hierarchy (top-level folder →
 *    sub-folders via `parent_id`); editors add folders and photos from
 *    Admin → المتحف والمعارض with no code change here.
 *  - `section = "museum"` rows are the existing Museum Collection, rendered by
 *    its own tab exactly as before and never mixed into the Archive folders.
 *
 * Folder labels are stored (and displayed) without any numerical prefix — the
 * numbers in the source material are ordering identifiers only and live in
 * `sort_order`.
 */
export const Route = createFileRoute("/library")({
  // Lets a collection's "back to library" link return the visitor to the tab
  // they came from (e.g. ?tab=museum) instead of the first Archive folder.
  validateSearch: (search: Record<string, unknown>): { tab?: string } => {
    const tab = search.tab;
    return typeof tab === "string" && tab.length > 0 && tab.length < 120 ? { tab } : {};
  },
  loader: async () => {
    const [collections, folders, library, archiveVideos] = await Promise.all([
      getPublishedGalleries(),
      getPublishedArchiveFolders(),
      getPublishedLibrary(),
      getPublishedArchiveVideos(),
    ]);

    /**
     * Videos are served from the website's own storage so they play here, on
     * this page, with the site's native player. Two data sources feed the tab,
     * both CMS-driven and both needing no code change for new clips:
     *  - film clips uploaded into any Archive folder (Admin → المتحف والمعارض);
     *  - library records in the "videos" collection whose file/link points at a
     *    real video file (Admin → المكتبة الرقمية).
     * A library record that only carries an external platform link is kept as
     * source metadata but is not shown, because it could not be played here.
     */
    const isPlayableVideoUrl = (url: string | null | undefined) =>
      !!url && /\.(mp4|webm|ogv|ogg|mov|m4v)(\?|#|$)/i.test(url);

    const libraryVideos = library
      .filter(
        (i) =>
          i.collection === "videos" &&
          i.is_published &&
          isPlayableVideoUrl(i.file_url ?? i.file_path ?? i.external_url),
      )
      .map((i) => ({
        id: i.id,
        url: (i.file_url ?? i.file_path ?? i.external_url)!,
        mime_type: null as string | null,
        title_ar: i.title_ar,
        title_en: i.title_en,
        folder_ar: i.description_ar ?? "",
        folder_en: i.description_en ?? null,
      }));

    const videos = [
      ...archiveVideos.map((v) => ({
        id: v.id,
        url: v.url,
        mime_type: v.mime_type,
        title_ar: v.title_ar,
        title_en: v.title_en,
        folder_ar: v.folder_ar,
        folder_en: v.folder_en,
      })),
      ...libraryVideos,
    ];

    const committeeArchive = library
      .filter(
        (item) =>
          item.collection === "committee_charts" &&
          item.is_published &&
          (item.reference ?? "").toUpperCase().startsWith("COMM-1448-ARCH-"),
      )
      .sort((a, b) => a.sort_order - b.sort_order);

    return {
      collections,
      folders,
      videos,
      committeeArchive,
      committeeDocs: resolveCommitteeDocuments(library),
    };
  },
  head: ({ matches, match }) => ({
    meta: [
      { title: "الأرشيف التراثي المصور | آل بوعبيد" },
      {
        name: "description",
        content:
          "الأرشيف التراثي المصور لأسرة آل بوعبيد: الأنشطة الاجتماعية، المناسبات، المسابقات، وصور كبارنا وأبناء العم، ومجموعات المتحف.",
      },
      { property: "og:title", content: "الأرشيف التراثي المصور — آل بوعبيد" },
      {
        property: "og:description",
        content: "أرشيف مصور موثّق لمناسبات الأسرة وأنشطتها ومسابقاتها ومجموعات المتحف.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: getCanonicalUrl("/library") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links:
      matches[matches.length - 1]?.routeId === match.routeId
        ? [{ rel: "canonical", href: getCanonicalUrl("/library") }]
        : [],
  }),
  component: LibraryRouteLayout,
});

/** `library.museum.$slug.tsx` nests under this route (file-based routing
 *  treats "library" as a shared path prefix), so without this check
 *  LibraryPage -- which renders unconditionally and has no <Outlet /> --
 *  would keep showing on top of the collection detail route. */
function LibraryRouteLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDetail = pathname !== "/library" && pathname !== "/library/";
  if (isDetail) return <Outlet />;
  return <LibraryPage />;
}

const MUSEUM_TAB = "museum";
const VIDEOS_TAB = "videos";

const PHOTO_PAGE_SIZE = 24;

type GalleryMediaItem = NonNullable<
  Awaited<ReturnType<typeof getPublicGalleryBySlug>>
>["media"][number];

/**
 * A folder that has no sub-folders is itself a photo collection, so its
 * photographs are shown here in full instead of behind a cover card. Each photo
 * still opens in the shared lightbox for a closer look.
 */
function ArchiveFolderPhotos({ slug, title }: { slug: string; title: string }) {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  const loadGallery = useServerFn(getPublicGalleryBySlug);
  const [media, setMedia] = useState<GalleryMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PHOTO_PAGE_SIZE);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setVisibleCount(PHOTO_PAGE_SIZE);
    loadGallery({ data: slug })
      .then((gallery) => {
        if (!cancelled) setMedia(gallery?.media ?? []);
      })
      .catch(() => {
        if (!cancelled) setMedia([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, loadGallery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded border border-dashed border-border bg-card/40 py-24 text-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin opacity-70" aria-hidden="true" />
        <p className="text-sm">{t(copy.photosLoading)}</p>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded border border-dashed border-border bg-card/40 px-6 py-24 text-center text-muted-foreground">
        <Images className="h-8 w-8 opacity-50" />
        <p className="measure text-sm">{t(copy.folderEmpty)}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
        {media.slice(0, visibleCount).map((item, i) => {
          const isVideo = Boolean(item.mime_type?.startsWith("video/"));
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-border bg-secondary/40 shadow-2xs transition-all hover:border-bronze/50 active:scale-[0.98] dark:hover:border-gold/50"
            >
              {isVideo ? (
                <>
                  <video
                    src={item.url}
                    preload="metadata"
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                  <span className="pointer-events-none absolute inset-0 grid place-items-center bg-black/25">
                    <PlayCircle className="h-9 w-9 text-white/90" aria-hidden="true" />
                  </span>
                </>
              ) : (
                <img
                  src={item.url}
                  alt={(rtl ? item.alt_text_ar : item.alt_text_en) || title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </button>
          );
        })}
      </div>

      {visibleCount < media.length && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PHOTO_PAGE_SIZE)}
            className="cursor-pointer rounded-lg border border-border bg-card px-5 py-2.5 text-xs font-medium text-foreground shadow-xs transition-colors hover:bg-secondary/60 active:scale-95 sm:text-sm"
          >
            {t(copy.loadMore)}
          </button>
        </div>
      )}

      <ArchiveLightbox
        items={media.map((item) => ({
          id: item.id,
          url: item.url,
          alt: (rtl ? item.alt_text_ar : item.alt_text_en) || title,
          caption: rtl ? item.caption_ar : item.caption_en,
          kind: item.mime_type?.startsWith("video/") ? ("video" as const) : ("image" as const),
        }))}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </>
  );
}

type FolderCard = {
  id: string;
  slug: string;
  title_ar: string;
  title_en?: string | null;
  description_ar?: string | null;
  description_en?: string | null;
  cover_media_path?: string | null;
  image_count: number;
};

function FolderGrid({ items, countLabel }: { items: FolderCard[]; countLabel: string }) {
  const { lang } = useLang();
  const pick = (ar: string, en?: string | null) => (lang === "en" ? en || ar : ar);
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((c) => (
        <Link
          key={c.id}
          to="/library/museum/$slug"
          params={{ slug: c.slug }}
          className="group flex flex-col overflow-hidden rounded border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-bronze/50 hover:shadow-md dark:hover:border-gold/50"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary/40">
            {c.cover_media_path ? (
              <img
                src={c.cover_media_path}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageOff className="h-8 w-8 text-muted-foreground/40" />
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            <span className="absolute bottom-2 end-2 rounded bg-black/60 px-2 py-0.5 text-[11px] font-mono text-white">
              {c.image_count} {countLabel}
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-1.5 p-4">
            <h3 className="break-words text-base font-bold leading-snug text-foreground transition-colors group-hover:text-bronze dark:group-hover:text-gold">
              {pick(c.title_ar, c.title_en)}
            </h3>
            {c.description_ar && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {pick(c.description_ar, c.description_en)}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

function LibraryPage() {
  const { t, lang } = useLang();
  const { collections, folders, videos, committeeArchive, committeeDocs } = Route.useLoaderData();
  const searchParams = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  // Land on the first folder that actually has photographs; while the new
  // folders are still empty, the Museum Collection stays the default view.
  const defaultTab =
    folders.find((f) =>
      f.children.length > 0 ? f.children.some((c) => c.image_count > 0) : f.image_count > 0,
    )?.slug ?? MUSEUM_TAB;
  const [tab, setTab] = useState<string>(searchParams.tab ?? defaultTab);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (searchParams.tab && searchParams.tab !== tab) setTab(searchParams.tab);
  }, [searchParams.tab, tab]);

  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    setSearchQuery("");
    void navigate({ search: (prev) => ({ ...prev, tab: newTab }), replace: true });
  };

  const activeFolder = folders.find((f) => f.slug === tab) ?? null;
  const isVideos = tab === VIDEOS_TAB;
  const isMuseum = tab === MUSEUM_TAB || (!activeFolder && !isVideos && folders.length === 0);
  /** A folder with no sub-folders is itself a photo collection, so all of its
   *  photographs are shown here directly rather than behind a cover card. */
  const isLeafFolder =
    !isMuseum && !isVideos && !!activeFolder && activeFolder.children.length === 0;

  /** A folder shows its published sub-folders as cards. */
  const visibleItems = useMemo<FolderCard[]>(() => {
    const source: FolderCard[] = isMuseum
      ? collections
      : activeFolder
        ? activeFolder.children.length > 0
          ? activeFolder.children
          : [activeFolder]
        : [];
    // Empty folders stay in the admin console but are not surfaced publicly.
    const withPhotos = source.filter((c) => c.image_count > 0);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return withPhotos;
    return withPhotos.filter(
      (c) =>
        c.title_ar.toLowerCase().includes(q) ||
        (c.title_en ?? "").toLowerCase().includes(q) ||
        (c.description_ar ?? "").toLowerCase().includes(q),
    );
  }, [isMuseum, collections, activeFolder, searchQuery]);

  const tabDefs = [
    ...folders.map((f) => ({
      key: f.slug,
      label: lang === "en" ? f.title_en || f.title_ar : f.title_ar,
      count:
        f.children.length > 0
          ? f.children.reduce((sum, c) => sum + c.image_count, 0)
          : f.image_count,
      icon: FolderOpen,
    })),
    {
      key: VIDEOS_TAB,
      label: t(copy.videosTab),
      count: videos.length,
      icon: Video,
    },
    {
      key: MUSEUM_TAB,
      label: t(copy.museumTab),
      count: collections.length,
      icon: Landmark,
    },
  ];

  return (
    <>
      <PageHeader
        variant="document"
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
        meta={[
          { label: t(copy.metaEra), value: t(copy.metaEraValue) },
          { label: t(copy.metaScope), value: t(copy.metaScopeValue) },
          { label: t(copy.metaAccess), value: t(copy.metaAccessValue) },
        ]}
      />

      <div className="container-page py-10 pb-20">
        <section
          className="mb-12 border-b border-border pb-12"
          aria-labelledby="committee-archive-1448"
        >
          <Eyebrow rule>{t({ ar: "الأرشيف", en: "Archive" })}</Eyebrow>
          <h2 id="committee-archive-1448" className="mt-6 text-xl font-semibold text-foreground">
            {t({ ar: "١٤٤٨ هـ", en: "1448 AH" })}
          </h2>
          <CommitteeYearGrid rows={committeeArchive as CommitteeArchiveItem[]} kind="ARCH" />

          {[{ year: 1444, label: { ar: "١٤٤٤ هـ", en: "1444 AH" } }].map(({ year, label }) => (
            <div key={year} className="mt-10" aria-labelledby={`committee-archive-${year}`}>
              <h2
                id={`committee-archive-${year}`}
                className="text-xl font-semibold text-foreground"
              >
                {t(label)}
              </h2>
              <ul className="mt-4 border-t border-border">
                {committeeDocs
                  .filter((d) => d.year === year)
                  .map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between gap-4 border-b border-border py-3"
                    >
                      <span className="min-w-0 break-words text-[14px] text-foreground">
                        {t(d.title)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          openMediaViewer({
                            src: d.src,
                            kind: "pdf",
                            title: t(d.title),
                          })
                        }
                        className="shrink-0 border-b border-bronze pb-0.5 text-[13px] font-medium text-bronze hover:text-foreground dark:border-gold dark:text-gold"
                      >
                        {t({ ar: "عرض الوثيقة", en: "View document" })}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </section>

        {/* ── Archive sections ─────────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="tablist"
            aria-label={t(copy.eyebrow)}
            className="flex w-full gap-1 overflow-x-auto rounded border border-border bg-card p-1.5 touch-pan-x"
          >
            {tabDefs.map((d) => {
              const isSelected = isMuseum ? d.key === MUSEUM_TAB : d.key === tab;
              const Icon = d.icon;
              return (
                <button
                  key={d.key}
                  role="tab"
                  type="button"
                  aria-selected={isSelected}
                  onClick={() => handleTabChange(d.key)}
                  className={cn(
                    "flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded px-3.5 py-2 text-xs font-semibold transition-all duration-150",
                    isSelected
                      ? "bg-bronze text-white shadow-sm dark:bg-gold dark:text-ink"
                      : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{d.label}</span>
                  <span
                    className={cn(
                      "nums rounded px-1.5 py-0.5 font-mono text-[11px] font-bold",
                      isSelected
                        ? "bg-white/20 text-white dark:bg-ink/20 dark:text-ink"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {d.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(copy.searchPlaceholder)}
              className="w-full rounded border border-border bg-card py-2 ps-9 pe-9 font-sans text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-bronze focus:ring-1 focus:ring-bronze sm:text-xs dark:focus:border-gold"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label={t(copy.clearSearch)}
                className="absolute end-1 top-1/2 grid h-7 w-7 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <section>
          <p className="measure mb-6 text-[13px] leading-relaxed text-muted-foreground">
            {isVideos
              ? t(copy.videosNote)
              : isMuseum
                ? t(copy.museumNote)
                : lang === "en"
                  ? (activeFolder?.description_en ??
                    activeFolder?.title_en ??
                    activeFolder?.description_ar ??
                    activeFolder?.title_ar ??
                    "")
                  : (activeFolder?.description_ar ?? `${activeFolder?.title_ar ?? ""}`)}
          </p>

          {isVideos ? (
            videos.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {videos.map((v) => (
                  <ArchiveVideoPlayer
                    key={v.id}
                    src={v.url}
                    mimeType={v.mime_type}
                    title={lang === "en" ? v.title_en || v.title_ar : v.title_ar}
                    subtitle={lang === "en" ? v.folder_en || v.folder_ar : v.folder_ar}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded border border-dashed border-border bg-card/40 px-6 py-24 text-center text-muted-foreground">
                <Video className="h-8 w-8 opacity-50" />
                <p className="measure text-sm">{t(copy.videosEmpty)}</p>
              </div>
            )
          ) : isLeafFolder && activeFolder ? (
            <ArchiveFolderPhotos
              slug={activeFolder.slug}
              title={
                lang === "en"
                  ? activeFolder.title_en || activeFolder.title_ar
                  : activeFolder.title_ar
              }
            />
          ) : visibleItems.length > 0 ? (
            <FolderGrid items={visibleItems} countLabel={t(copy.imageCount)} />
          ) : searchQuery.trim() ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded border border-dashed border-border bg-card/40 py-24 text-center text-muted-foreground">
              <Search className="h-8 w-8 opacity-50" />
              <p className="text-sm">{t(copy.noResults)}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded border border-dashed border-border bg-card/40 px-6 py-24 text-center text-muted-foreground">
              <Images className="h-8 w-8 opacity-50" />
              <p className="measure text-sm">
                {isMuseum ? t(copy.museumEmpty) : t(copy.folderEmpty)}
              </p>
            </div>
          )}
        </section>

        {/* ── Deposit call to action ───────────────────────────── */}
        <section className="mt-16 rounded border border-border bg-secondary/30 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-foreground">{t(copy.depositTitle)}</h2>
          <p className="measure mt-2 text-[13px] leading-relaxed text-muted-foreground">
            {t(copy.depositBody)}
          </p>
          <Link
            to="/requests"
            search={{ request: "archive_contribution" }}
            className="tap-target-y mt-5 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
          >
            {t(copy.depositCta)}
            <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </>
  );
}
