import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
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
} from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { getPublishedGalleries, getPublishedArchiveFolders } from "@/lib/cms.functions";
import { cn } from "@/lib/utils";
import { getCanonicalUrl } from "@/lib/seo";

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
    const [collections, folders] = await Promise.all([
      getPublishedGalleries(),
      getPublishedArchiveFolders(),
    ]);
    return { collections, folders };
  },
  head: () => ({
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
    links: [{ rel: "canonical", href: getCanonicalUrl("/library") }],
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

const copy = {
  eyebrow: { ar: "التراث والتوثيق", en: "Heritage & Archives" } as BiText,
  title: { ar: "الأرشيف التراثي المصور", en: "Heritage Photo Archive" } as BiText,
  subtitle: {
    ar: "أرشيف مصور موثّق لمناسبات الأسرة وأنشطتها الاجتماعية ومسابقاتها، وصور كبارنا وأبناء العم، إلى جانب مجموعات المتحف.",
    en: "A documented photographic archive of family occasions, social activities and competitions, portraits of our elders and cousins, alongside the museum collections.",
  } as BiText,

  metaEra: { ar: "فترة التوثيق", en: "Documented Era" } as BiText,
  metaEraValue: { ar: "منذ عام ١١٠٢ هـ حتى اليوم", en: "Since 1102 AH to present" } as BiText,
  metaScope: { ar: "نطاق المجموعة", en: "Archive Scope" } as BiText,
  metaScopeValue: { ar: "الأحساء والخليج العربي", en: "Al-Ahsa & the Arabian Gulf" } as BiText,
  metaAccess: { ar: "الإتاحة الرقمية", en: "Public Access" } as BiText,
  metaAccessValue: { ar: "متاحة رقمياً للجميع", en: "Open digital access" } as BiText,

  museumTab: { ar: "مجموعات المتحف المصورة", en: "Museum Photo Collections" } as BiText,
  museumNote: {
    ar: "أرشيف مصور من تاريخ متحف آل بوعبيد — الافتتاح، الزيارات، المقتنيات، والمناسبات، موثّقة ضمن مجموعات مستقلة.",
    en: "A photographic record of the Al Boabid Museum's history — its opening, visits, artifacts, and occasions, organized into standalone collections.",
  } as BiText,
  museumEmpty: {
    ar: "لا توجد مجموعات منشورة حاليًا. يرجى العودة لاحقًا.",
    en: "No collections are published yet. Please check back soon.",
  } as BiText,
  noResults: { ar: "لا توجد نتائج مطابقة لبحثك.", en: "Nothing matches your search." } as BiText,
  folderEmpty: {
    ar: "لم تُضف صور إلى هذا القسم بعد. تُرفع الصور من لوحة الإدارة وتظهر هنا مباشرة.",
    en: "No photographs have been added to this section yet. They are uploaded from the admin console and appear here immediately.",
  } as BiText,
  imageCount: { ar: "صورة", en: "images" } as BiText,
  searchPlaceholder: { ar: "ابحث في الأرشيف...", en: "Search the archive..." } as BiText,
  clearSearch: { ar: "مسح البحث", en: "Clear search" } as BiText,
  openFolder: { ar: "استعراض الصور", en: "Browse photographs" } as BiText,
  depositTitle: {
    ar: "إيداع صورة أو وثيقة تاريخية",
    en: "Submit a Historical Photograph or Document",
  } as BiText,
  depositBody: {
    ar: "إذا كانت لديك صور تذكارية قديمة أو وثائق عائلية ترغب في حفظها وفهرستها ضمن الأرشيف الرقمي الموحد، نرحب بتواصلك.",
    en: "If you possess historical family photographs or documents you wish to preserve in the digital archive, we welcome your contribution.",
  } as BiText,
  depositCta: { ar: "تواصل مع فريق التوثيق", en: "Contact Archival Team" } as BiText,
};

type FolderCard = {
  id: string;
  slug: string;
  title_ar: string;
  title_en?: string | null;
  description_ar?: string | null;
  cover_media_path?: string | null;
  image_count: number;
};

function FolderGrid({ items, countLabel }: { items: FolderCard[]; countLabel: string }) {
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
              {c.title_ar}
            </h3>
            {c.description_ar && (
              <p className="line-clamp-2 text-sm text-muted-foreground">{c.description_ar}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

function LibraryPage() {
  const { t, lang } = useLang();
  const { collections, folders } = Route.useLoaderData();
  const searchParams = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  const defaultTab = folders[0]?.slug ?? MUSEUM_TAB;
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
  const isMuseum = tab === MUSEUM_TAB || (!activeFolder && folders.length === 0);

  /** A folder shows its published sub-folders; a folder with no sub-folders is
   *  itself a photo collection, so it links straight through to its images. */
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
      label: f.title_ar,
      count:
        f.children.length > 0
          ? f.children.reduce((sum, c) => sum + c.image_count, 0)
          : f.image_count,
      icon: FolderOpen,
    })),
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
            {isMuseum
              ? t(copy.museumNote)
              : (activeFolder?.description_ar ?? `${activeFolder?.title_ar ?? ""}`)}
          </p>

          {visibleItems.length > 0 ? (
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
            to="/contact"
            className="mt-5 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
          >
            {t(copy.depositCta)}
            <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </>
  );
}
