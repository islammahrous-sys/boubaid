import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Download,
  Play,
  Search,
  X,
  Eye,
  FileText,
  Image as ImageIcon,
  Video,
  Grid,
  List,
  Share2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  BookOpen,
  Landmark,
  Compass,
  ImageOff,
  Images,
} from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { EditorialButton, EditorialLink } from "@/components/site/Editorial";
import { libraryItems as staticLibraryItems, siteMeta } from "@/content/site";
import { getPublishedLibrary, getPublishedGalleries } from "@/lib/cms.functions";
import {
  mergeLibrary,
  type LibraryDocument,
  type LibraryPhoto,
  type LibraryVideo,
} from "@/content/cms-adapt";
import { pageImages } from "@/content/images";
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

const PAGE_SIZE = 12;

function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

function getYouTubeVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    let videoId: string | null = null;

    if (host === "youtu.be") {
      videoId = u.pathname.slice(1).split("/")[0] || null;
    } else if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      if (u.pathname === "/watch") {
        videoId = u.searchParams.get("v");
      } else if (u.pathname.startsWith("/embed/")) {
        videoId = u.pathname.split("/")[2] || null;
      } else if (u.pathname.startsWith("/shorts/")) {
        videoId = u.pathname.split("/")[2] || null;
      }
    } else {
      return null;
    }

    return videoId;
  } catch {
    return null;
  }
}

function getYouTubeEmbedUrl(url: string): string | null {
  const id = getYouTubeVideoId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

function getYouTubeThumbnailUrl(url: string): string | null {
  const id = getYouTubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

const VIDEO_FILE_EXTENSIONS = [".mp4", ".webm", ".ogg", ".ogv", ".mov", ".m4v"];

function isVideoFileUrl(url: string): boolean {
  const clean = url.split("?")[0].split("#")[0].toLowerCase();
  return VIDEO_FILE_EXTENSIONS.some((ext) => clean.endsWith(ext));
}

function isPdfUrl(url: string): boolean {
  const clean = url.split("?")[0].split("#")[0].toLowerCase();
  return clean.endsWith(".pdf");
}

export const Route = createFileRoute("/library")({
  // Lets a museum collection's "back to library" link return the visitor to
  // the museum tab specifically, instead of always landing back on Documents.
  validateSearch: (search: Record<string, unknown>): { tab?: TabKey } => {
    const tab = search.tab;
    return tab === "documents" || tab === "photographs" || tab === "recordings" || tab === "museum"
      ? { tab }
      : {};
  },
  loader: async () => {
    const [rows, collections] = await Promise.all([getPublishedLibrary(), getPublishedGalleries()]);
    return { libraryItems: mergeLibrary(rows, staticLibraryItems), collections };
  },
  head: () => ({
    meta: [
      { title: "المكتبة الرقمية والأرشيف التراثي | آل بوعبيد" },
      {
        name: "description",
        content:
          "المكتبة الرقمية والأرشيف التراثي لأسرة آل بوعبيد: الوثائق التاريخية، الدراسات النسبية والجينية، والصور والتسجيلات.",
      },
      { property: "og:title", content: "المكتبة الرقمية والأرشيف التراثي — آل بوعبيد" },
      {
        property: "og:description",
        content: "المكتبة الرقمية وأرشيف التراث: وثائق تاريخية، صور نادرة، وتسجيلات متاحة للجميع.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: getCanonicalUrl("/library") },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/library") }],
  }),
  component: LibraryRouteLayout,
});

/** `library.museum.$slug.tsx` nests under this route (file-based routing
 *  treats "library" as a shared path prefix), so without this check
 *  LibraryPage -- which renders unconditionally and has no <Outlet /> --
 *  would keep showing on top of the collection detail route: the loader
 *  and head() both run correctly, but the child's component never
 *  actually gets composed into the tree. Mirrors InitiativesLayout in
 *  routes/initiatives.tsx. */
function LibraryRouteLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDetail = pathname !== "/library" && pathname !== "/library/";
  if (isDetail) return <Outlet />;
  return <LibraryPage />;
}

type TabKey = "documents" | "photographs" | "recordings" | "museum";
type ViewMode = "table" | "grid";
type SortOrder = "newest" | "oldest" | "title";

const copy = {
  eyebrow: { ar: "التراث والتوثيق", en: "Heritage & Archives" } as BiText,
  title: {
    ar: "المكتبة الرقمية وأرشيف التراث",
    en: "Digital Library & Heritage Archive",
  } as BiText,
  subtitle: {
    ar: "مجموعة شاملة من الوثائق التاريخية، والمشجرات النسبية، والدراسات الجينية، والصور النادرة والتسجيلات المرئية المتاحة للجميع.",
    en: "A comprehensive digital collection of historical deeds, family trees, genetic studies, archival photographs, and recordings available to all.",
  } as BiText,

  metaEra: { ar: "فترة التوثيق", en: "Documented Era" } as BiText,
  metaEraValue: { ar: "منذ عام ١١٠٢ هـ حتى اليوم", en: "Since 1102 AH to present" } as BiText,
  metaScope: { ar: "نطاق المجموعة", en: "Archive Scope" } as BiText,
  metaScopeValue: { ar: "الأحساء والخليج العربي", en: "Al-Ahsa & the Arabian Gulf" } as BiText,
  metaAccess: { ar: "الإتاحة الرقمية", en: "Public Access" } as BiText,
  metaAccessValue: { ar: "متاحة رقمياً للجميع", en: "Open digital access" } as BiText,

  tabs: {
    documents: { ar: "الوثائق والمخطوطات", en: "Documents & Manuscripts" } as BiText,
    photographs: { ar: "الصور واللوحات التاريخية", en: "Photographs & Heritage Plates" } as BiText,
    recordings: { ar: "المرئيات والتسجيلات", en: "Recordings & Videos" } as BiText,
    museum: { ar: "مجموعات المتحف المصورة", en: "Museum Photo Collections" } as BiText,
  },
  museumEmpty: {
    ar: "لا توجد مجموعات منشورة حاليًا. يرجى العودة لاحقًا.",
    en: "No collections are published yet. Please check back soon.",
  } as BiText,
  museumNoResults: {
    ar: "لا توجد مجموعات مطابقة لبحثك.",
    en: "No collections match your search.",
  } as BiText,
  museumImageCount: { ar: "صورة", en: "images" } as BiText,
  museumSearchPlaceholder: { ar: "ابحث عن مجموعة...", en: "Search collections..." } as BiText,
  museumNote: {
    ar: "أرشيف مصور من تاريخ متحف آل بوعبيد — الافتتاح، الزيارات، المقتنيات، والمناسبات، موثّقة ضمن مجموعات مستقلة.",
    en: "A photographic record of the Al Boabid Museum's history — its opening, visits, artifacts, and occasions, organized into standalone collections.",
  } as BiText,

  stats: {
    totalDocs: { ar: "وثيقة ومخطوطة تاريخية", en: "Historical Documents" } as BiText,
    totalPhotos: { ar: "صورة ولوحة تراثية", en: "Heritage Photographs" } as BiText,
    totalVideos: { ar: "تسجيلاً ومادة مرئية", en: "Video Recordings" } as BiText,
    totalMuseum: { ar: "مجموعة متحف مصورة", en: "Museum Collections" } as BiText,
    heritageIndex: { ar: "أرشيف رقمي مفتوح", en: "Public Heritage Archive" } as BiText,
  },

  colRef: { ar: "الرمز", en: "Code" } as BiText,
  colTitle: { ar: "العنوان", en: "Title" } as BiText,
  colYear: { ar: "السنة", en: "Year" } as BiText,
  colFormat: { ar: "التصنيف", en: "Category" } as BiText,
  colAction: { ar: "الإجراء", en: "Action" } as BiText,

  download: { ar: "تحميل الملف", en: "Download" } as BiText,
  play: { ar: "مشاهدة التسجيل", en: "Watch Recording" } as BiText,
  plate: { ar: "لوحة", en: "Plate" } as BiText,
  preview: { ar: "معاينة الوثيقة", en: "Preview" } as BiText,

  docsNote: {
    ar: "تضم هذه المجموعة صكوكاً تاريخية تعود لأكثر من ثلاثة قرون، ولوائح تنظيمية، ودراسات جينية ونسبية موثقة لأسرة آل بوعبيد.",
    en: "This collection features historical court deeds dating back over 300 years, family charters, and documented genealogical studies.",
  } as BiText,
  photosNote: {
    ar: "سجل مصور يوثق مناسبات الأسرة واجتماعاتها وملتقياتها العامة على مدار العقود الماضية.",
    en: "A photographic record capturing family assemblies, cultural gatherings, and memorable occasions across the decades.",
  } as BiText,
  videosNote: {
    ar: "تسجيلات مرئية للأفلام الوثائقية، والكلمات الرسمية، والمناسبات والاحتفالات السنوية.",
    en: "Video recordings of documentary films, heritage addresses, and annual family assemblies.",
  } as BiText,

  pending: {
    ar: "الملف قيد الرقمنة والإتاحة — يرجى التواصل للمزيد من المعلومات.",
    en: "This file is currently being digitized — please contact us for more information.",
  } as BiText,
  searchPlaceholder: {
    ar: "البحث في الأرشيف بالعنوان، الموضوع، أو السنة...",
    en: "Search the archive by title, topic, or year...",
  } as BiText,
  clearSearch: { ar: "مسح البحث", en: "Clear search" } as BiText,
  allCategories: { ar: "كل الأقسام", en: "All Categories" } as BiText,
  close: { ar: "إغلاق", en: "Close" } as BiText,
  details: { ar: "نبذة عن الوثيقة", en: "Document Overview" } as BiText,
  shareWhatsApp: { ar: "مشاركة عبر واتساب", en: "Share via WhatsApp" } as BiText,
  copyLink: { ar: "نسخ الرابط", en: "Copy Link" } as BiText,
  copied: { ar: "تم النسخ بنجاح", en: "Copied to clipboard" } as BiText,
  noResults: {
    ar: "لا توجد نتائج تطابق معايير البحث الحالية.",
    en: "No archive records match your search or filter criteria.",
  } as BiText,

  sortNewest: { ar: "الأحدث تاريخاً", en: "Newest First" } as BiText,
  sortOldest: { ar: "الأقدم تاريخاً", en: "Oldest First" } as BiText,
  sortTitle: { ar: "أبجدياً (أ-ي)", en: "Alphabetical" } as BiText,

  depositTitle: {
    ar: "إيداع وثيقة أو صورة تاريخية",
    en: "Submit a Historical Document or Photograph",
  } as BiText,
  depositBody: {
    ar: "إذا كانت لديك صور تذكارية قديمة، أو وثائق تاريخية، أو مخطوطات عائلية ترغب في حفظها وفهرستها ضمن الأرشيف الرقمي الموحد، نرحب بتواصلك.",
    en: "If you possess historical family photographs, court deeds, or manuscripts you wish to preserve in the digital archive, we welcome your contribution.",
  } as BiText,
  depositCta: { ar: "تواصل مع فريق التوثيق", en: "Contact Archival Team" } as BiText,
};

const sheet = pageImages.library.contactSheet;

function DownloadControl({
  doc,
  onUnavailable,
  label,
  className,
}: {
  doc: LibraryDocument;
  onUnavailable: () => void;
  label: string;
  className?: string;
}) {
  return doc.href ? (
    <EditorialLink
      href={doc.href}
      target="_blank"
      rel="noopener noreferrer"
      size="sm"
      className={className}
    >
      <Download className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </EditorialLink>
  ) : (
    <EditorialButton type="button" onClick={onUnavailable} size="sm" className={className}>
      <Download className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </EditorialButton>
  );
}

function LibraryPage() {
  const { t, lang } = useLang();
  const { libraryItems, collections } = Route.useLoaderData();
  const searchParams = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [tab, setTab] = useState<TabKey>(searchParams.tab ?? "documents");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [page, setPage] = useState(1);

  const [previewModal, setPreviewModal] = useState<{
    type: TabKey;
    title: string;
    subtitle?: string;
    meta?: string;
    image?: string;
    duration?: string;
    href?: string;
    doc?: LibraryDocument;
    description?: string;
    photoIndex?: number;
  } | null>(null);

  const rtl = lang === "ar";

  const notify = () => toast.info(t(copy.pending));

  const resultsLabel = (shown: number, total: number) =>
    lang === "ar" ? `عرض ${shown} من أصل ${total} مادة` : `Showing ${shown} of ${total} items`;

  const handleTabChange = (newTab: TabKey) => {
    setTab(newTab);
    setSelectedCategory(null);
    setSearchQuery("");
    // Keeps the active tab reflected in the URL (?tab=museum) so that
    // pressing a collection's link, then the browser Back button, lands
    // back on this same tab instead of always resetting to Documents --
    // `replace` so switching tabs doesn't spam separate history entries.
    void navigate({ search: (prev) => ({ ...prev, tab: newTab }), replace: true });
  };

  // Browser Back/Forward updates `searchParams.tab` without remounting this
  // component (TanStack Router reuses it across a same-route navigation), so
  // the useState initializer above only fires once and misses it -- without
  // this, the URL flips back to ?tab=museum but the visible tab stays
  // whatever it last was.
  useEffect(() => {
    if (searchParams.tab && searchParams.tab !== tab) setTab(searchParams.tab);
  }, [searchParams.tab, tab]);

  useEffect(() => {
    setPage(1);
  }, [tab, searchQuery, selectedCategory, sortOrder]);

  const tabDefs: {
    key: TabKey;
    label: BiText;
    count: number;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      key: "documents",
      label: copy.tabs.documents,
      count: libraryItems.documents.length,
      icon: FileText,
    },
    {
      key: "photographs",
      label: copy.tabs.photographs,
      count: libraryItems.photos.length,
      icon: ImageIcon,
    },
    {
      key: "recordings",
      label: copy.tabs.recordings,
      count: libraryItems.videos.length,
      icon: Video,
    },
    {
      key: "museum",
      label: copy.tabs.museum,
      count: collections.length,
      icon: Landmark,
    },
  ];

  const currentCategories = useMemo(() => {
    if (tab === "documents") {
      return Array.from(new Set(libraryItems.documents.map((d) => d.kind))).filter(Boolean);
    }
    if (tab === "photographs") {
      return Array.from(new Set(libraryItems.photos.map((p) => p.category))).filter(Boolean);
    }
    if (tab === "recordings") {
      return Array.from(new Set(libraryItems.videos.map((v) => `${v.year} هـ`))).filter(Boolean);
    }
    return [];
  }, [tab, libraryItems]);

  const filteredDocuments = useMemo(() => {
    let list = libraryItems.documents.filter((d) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        t(d.title).toLowerCase().includes(q) ||
        d.ncnpRef.toLowerCase().includes(q) ||
        (d.description && t(d.description).toLowerCase().includes(q)) ||
        String(d.year).includes(q);
      const matchesCat = !selectedCategory || d.kind === selectedCategory;
      return matchesSearch && matchesCat;
    });

    if (sortOrder === "newest") {
      list = [...list].sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (sortOrder === "oldest") {
      list = [...list].sort((a, b) => (a.year || 0) - (b.year || 0));
    } else if (sortOrder === "title") {
      list = [...list].sort((a, b) => t(a.title).localeCompare(t(b.title)));
    }
    return list;
  }, [libraryItems.documents, searchQuery, selectedCategory, sortOrder, t]);

  const photoIndex = useMemo(() => {
    const map = new Map<LibraryPhoto, number>();
    libraryItems.photos.forEach((p, i) => map.set(p, i));
    return map;
  }, [libraryItems.photos]);

  const filteredPhotos = useMemo(() => {
    let list = libraryItems.photos.filter((p) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        t(p.title).toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description && t(p.description).toLowerCase().includes(q)) ||
        String(p.year).includes(q);
      const matchesCat = !selectedCategory || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });

    if (sortOrder === "newest") {
      list = [...list].sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (sortOrder === "oldest") {
      list = [...list].sort((a, b) => (a.year || 0) - (b.year || 0));
    } else if (sortOrder === "title") {
      list = [...list].sort((a, b) => t(a.title).localeCompare(t(b.title)));
    }
    return list;
  }, [libraryItems.photos, searchQuery, selectedCategory, sortOrder, t]);

  const filteredVideos = useMemo(() => {
    let list = libraryItems.videos.filter((v) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        t(v.title).toLowerCase().includes(q) ||
        (v.description && t(v.description).toLowerCase().includes(q)) ||
        String(v.year).includes(q);
      const matchesCat = !selectedCategory || `${v.year} هـ` === selectedCategory;
      return matchesSearch && matchesCat;
    });

    if (sortOrder === "newest") {
      list = [...list].sort((a, b) => (b.year || 0) - (a.year || 0));
    } else if (sortOrder === "oldest") {
      list = [...list].sort((a, b) => (a.year || 0) - (b.year || 0));
    } else if (sortOrder === "title") {
      list = [...list].sort((a, b) => t(a.title).localeCompare(t(b.title)));
    }
    return list;
  }, [libraryItems.videos, searchQuery, selectedCategory, sortOrder, t]);

  const filteredCollections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return collections;
    return collections.filter(
      (c) =>
        c.title_ar.toLowerCase().includes(q) ||
        (c.title_en && c.title_en.toLowerCase().includes(q)) ||
        (c.description_ar && c.description_ar.toLowerCase().includes(q)),
    );
  }, [collections, searchQuery]);

  const pagedDocuments = useMemo(
    () => paginate(filteredDocuments, page, PAGE_SIZE),
    [filteredDocuments, page],
  );
  const pagedPhotos = useMemo(
    () => paginate(filteredPhotos, page, PAGE_SIZE),
    [filteredPhotos, page],
  );
  const pagedVideos = useMemo(
    () => paginate(filteredVideos, page, PAGE_SIZE),
    [filteredVideos, page],
  );

  const activeTotal =
    tab === "documents"
      ? filteredDocuments.length
      : tab === "photographs"
        ? filteredPhotos.length
        : tab === "museum"
          ? filteredCollections.length
          : filteredVideos.length;
  const totalPages = Math.max(1, Math.ceil(activeTotal / PAGE_SIZE));

  const handleCopyLink = (text?: string) => {
    const url = text || window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success(t(copy.copied));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = (title: string, desc?: string) => {
    const text = encodeURIComponent(`${title}\n${desc ? desc + "\n" : ""}${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleNextPhoto = useCallback(() => {
    if (
      !previewModal ||
      previewModal.type !== "photographs" ||
      typeof previewModal.photoIndex !== "number"
    )
      return;
    const nextIdx = (previewModal.photoIndex + 1) % filteredPhotos.length;
    const p = filteredPhotos[nextIdx];
    const imageSrc = p.image ?? sheet[(photoIndex.get(p) ?? nextIdx) % sheet.length];
    setPreviewModal({
      type: "photographs",
      title: t(p.title),
      subtitle: `${p.category} · ${p.year} هـ`,
      image: imageSrc,
      description: p.description ? t(p.description) : undefined,
      photoIndex: nextIdx,
    });
  }, [previewModal, filteredPhotos, photoIndex, t]);

  const handlePrevPhoto = useCallback(() => {
    if (
      !previewModal ||
      previewModal.type !== "photographs" ||
      typeof previewModal.photoIndex !== "number"
    )
      return;
    const prevIdx = (previewModal.photoIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    const p = filteredPhotos[prevIdx];
    const imageSrc = p.image ?? sheet[(photoIndex.get(p) ?? prevIdx) % sheet.length];
    setPreviewModal({
      type: "photographs",
      title: t(p.title),
      subtitle: `${p.category} · ${p.year} هـ`,
      image: imageSrc,
      description: p.description ? t(p.description) : undefined,
      photoIndex: prevIdx,
    });
  }, [previewModal, filteredPhotos, photoIndex, t]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewModal(null);
      } else if (previewModal?.type === "photographs") {
        if (e.key === "ArrowRight") {
          if (rtl) {
            handlePrevPhoto();
          } else {
            handleNextPhoto();
          }
        } else if (e.key === "ArrowLeft") {
          if (rtl) {
            handleNextPhoto();
          } else {
            handlePrevPhoto();
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewModal, handleNextPhoto, handlePrevPhoto, rtl]);

  const PageControls = () =>
    totalPages > 1 ? (
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
    ) : null;

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

      {/* ── Archival Statistics Masthead ─────────────────────── */}
      <section className="border-b border-border bg-secondary/30">
        <div className="container-page py-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:gap-6">
            <button
              type="button"
              onClick={() => handleTabChange("documents")}
              className={cn(
                "flex items-center gap-3.5 border bg-card/60 p-3.5 shadow-sm rounded text-start transition-all cursor-pointer",
                tab === "documents"
                  ? "border-bronze bg-card ring-1 ring-bronze/40 dark:border-gold dark:ring-gold/40"
                  : "border-border/80 hover:border-border hover:bg-card/90",
              )}
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded bg-bronze/10 text-bronze dark:text-gold">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="nums font-mono text-lg font-bold text-foreground">
                  {libraryItems.documents.length}
                </p>
                <p className="text-xs text-muted-foreground truncate">{t(copy.stats.totalDocs)}</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("photographs")}
              className={cn(
                "flex items-center gap-3.5 border bg-card/60 p-3.5 shadow-sm rounded text-start transition-all cursor-pointer",
                tab === "photographs"
                  ? "border-bronze bg-card ring-1 ring-bronze/40 dark:border-gold dark:ring-gold/40"
                  : "border-border/80 hover:border-border hover:bg-card/90",
              )}
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded bg-bronze/10 text-bronze dark:text-gold">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="nums font-mono text-lg font-bold text-foreground">
                  {libraryItems.photos.length}
                </p>
                <p className="text-xs text-muted-foreground truncate">{t(copy.stats.totalPhotos)}</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("recordings")}
              className={cn(
                "flex items-center gap-3.5 border bg-card/60 p-3.5 shadow-sm rounded text-start transition-all cursor-pointer",
                tab === "recordings"
                  ? "border-bronze bg-card ring-1 ring-bronze/40 dark:border-gold dark:ring-gold/40"
                  : "border-border/80 hover:border-border hover:bg-card/90",
              )}
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded bg-bronze/10 text-bronze dark:text-gold">
                <Video className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="nums font-mono text-lg font-bold text-foreground">
                  {libraryItems.videos.length}
                </p>
                <p className="text-xs text-muted-foreground truncate">{t(copy.stats.totalVideos)}</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("museum")}
              className={cn(
                "flex items-center gap-3.5 border bg-card/60 p-3.5 shadow-sm rounded text-start transition-all cursor-pointer",
                tab === "museum"
                  ? "border-amber-500 bg-card ring-1 ring-amber-500/40 dark:border-amber-400 dark:ring-amber-400/40"
                  : "border-border/80 hover:border-border hover:bg-card/90",
              )}
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Landmark className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="nums font-mono text-lg font-bold text-foreground">
                  {collections.length}
                </p>
                <p className="text-xs text-muted-foreground truncate">{t(copy.stats.totalMuseum)}</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      <div className="container-page py-10 pb-20">
        {/* ── Main Tab Navigation Bar ──────────────────────────── */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-border pb-6">
          <div className="relative w-full lg:w-auto overflow-hidden">
            <div
              role="tablist"
              aria-label={t(copy.eyebrow)}
              className="flex w-full overflow-x-auto gap-1 border border-border bg-card p-1.5 rounded scroll-smooth touch-pan-x"
            >
              {tabDefs.map((d) => {
                const isSelected = tab === d.key;
                const Icon = d.icon;
                return (
                  <button
                    key={d.key}
                    role="tab"
                    type="button"
                    aria-selected={isSelected}
                    onClick={() => handleTabChange(d.key)}
                    className={cn(
                      "flex shrink-0 items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded transition-all duration-150 cursor-pointer whitespace-nowrap",
                      isSelected
                        ? "bg-bronze text-white dark:bg-gold dark:text-ink shadow-sm"
                        : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{t(d.label)}</span>
                    <span
                      className={cn(
                        "nums text-[11px] px-1.5 py-0.5 rounded font-mono font-bold",
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
          </div>

          {/* Search & Utility Bar -- the search box works for every tab
              (including Museum, filtering collections by title); sort and
              view-mode don't apply to the Museum grid, so those stay hidden
              there. */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search
                className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  tab === "museum" ? t(copy.museumSearchPlaceholder) : t(copy.searchPlaceholder)
                }
                className="w-full rounded border border-border bg-card py-2 text-xs font-sans text-foreground placeholder:text-muted-foreground outline-none transition-colors ps-9 pe-8 focus:border-bronze focus:ring-1 focus:ring-bronze dark:focus:border-gold"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label={t(copy.clearSearch)}
                  className="absolute top-1/2 -translate-y-1/2 end-2 p-1 text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            {tab !== "museum" && (
              <div className="flex items-center gap-1.5 border border-border bg-card px-2.5 py-1.5 rounded text-xs text-muted-foreground">
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="bg-transparent text-xs font-medium text-foreground outline-none cursor-pointer"
                >
                  <option value="newest">{t(copy.sortNewest)}</option>
                  <option value="oldest">{t(copy.sortOldest)}</option>
                  <option value="title">{t(copy.sortTitle)}</option>
                </select>
              </div>
            )}

            {/* View Switcher for Documents */}
            {tab === "documents" && (
              <div className="hidden sm:flex items-center border border-border bg-card p-1 rounded">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={cn(
                    "p-1.5 rounded transition-colors cursor-pointer",
                    viewMode === "table"
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  title="Table View"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-1.5 rounded transition-colors cursor-pointer",
                    viewMode === "grid"
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  title="Grid Cards View"
                >
                  <Grid className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Category Filter Pills ────────────────────────────── */}
        {tab !== "museum" && currentCategories.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "rounded border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                selectedCategory === null
                  ? "border-bronze bg-bronze text-white dark:border-gold dark:bg-gold dark:text-ink"
                  : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              {t(copy.allCategories)}
            </button>
            {currentCategories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? null : cat)}
                  className={cn(
                    "rounded border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
                    isSelected
                      ? "border-bronze bg-bronze text-white dark:border-gold dark:bg-gold dark:text-ink"
                      : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground",
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Results Counter */}
        {activeTotal > 0 && (
          <div className="mb-6 flex items-center justify-between text-xs text-muted-foreground">
            <p className="nums font-mono font-medium">
              {resultsLabel(
                tab === "documents"
                  ? pagedDocuments.length
                  : tab === "photographs"
                    ? pagedPhotos.length
                    : tab === "museum"
                      ? filteredCollections.length
                      : pagedVideos.length,
                activeTotal,
              )}
            </p>
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 bg-secondary/80 px-2 py-0.5 rounded text-[11px] text-foreground">
                <span>{selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="ms-1 hover:text-destructive cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}

        {/* ── Tab Content: Museum Collections ─────────────────── */}
        {tab === "museum" && (
          <section>
            <p className="measure mb-6 text-[13px] leading-relaxed text-muted-foreground">
              {t(copy.museumNote)}
            </p>

            {collections.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded border border-dashed border-border bg-card/40 py-24 text-center text-muted-foreground">
                <Images className="h-8 w-8 opacity-50" />
                <p className="text-sm">{t(copy.museumEmpty)}</p>
              </div>
            ) : filteredCollections.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded border border-dashed border-border bg-card/40 py-24 text-center text-muted-foreground">
                <Search className="h-8 w-8 opacity-50" />
                <p className="text-sm">{t(copy.museumNoResults)}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCollections.map((c) => (
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
                        {c.image_count} {t(copy.museumImageCount)}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5 p-4">
                      <h3 className="text-base font-bold text-foreground transition-colors group-hover:text-bronze dark:group-hover:text-gold">
                        {c.title_ar}
                      </h3>
                      {c.description_ar && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {c.description_ar}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Tab Content: Documents ──────────────────────────── */}
        {tab === "documents" && (
          <section>
            <p className="measure mb-6 text-[13px] leading-relaxed text-muted-foreground">
              {t(copy.docsNote)}
            </p>

            {filteredDocuments.length > 0 ? (
              <>
                {viewMode === "table" ? (
                  <>
                    {/* Mobile cards view (< sm) */}
                    <div className="space-y-3 sm:hidden">
                      {pagedDocuments.map((d, i) => (
                        <div
                          key={i}
                          onClick={() =>
                            setPreviewModal({
                              type: "documents",
                              title: t(d.title),
                              subtitle: `${d.kind} · ${d.year} هـ`,
                              meta: d.ncnpRef,
                              doc: d,
                              href: d.href,
                              description: d.description ? t(d.description) : undefined,
                            })
                          }
                          className="group border border-border bg-card p-4 rounded-lg hover:border-bronze dark:hover:border-gold transition-colors cursor-pointer shadow-2xs space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="nums border border-bronze/30 bg-bronze/5 dark:bg-gold/5 px-2 py-0.5 rounded font-mono text-xs font-bold text-bronze dark:text-gold">
                              {d.ncnpRef}
                            </span>
                            <span className="nums text-xs text-muted-foreground font-mono">
                              {d.year} هـ
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold leading-snug text-foreground group-hover:text-bronze dark:group-hover:text-gold transition-colors">
                              {t(d.title)}
                            </p>
                            {d.description && (
                              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                {t(d.description)}
                              </p>
                            )}
                          </div>
                          <div
                            className="flex items-center justify-between pt-2 border-t border-border/60"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="border border-border bg-secondary/80 px-2 py-0.5 rounded text-[11px] font-semibold text-foreground">
                              {d.kind}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewModal({
                                    type: "documents",
                                    title: t(d.title),
                                    subtitle: `${d.kind} · ${d.year} هـ`,
                                    meta: d.ncnpRef,
                                    doc: d,
                                    href: d.href,
                                    description: d.description ? t(d.description) : undefined,
                                  })
                                }
                                className="inline-flex items-center gap-1 border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-secondary rounded transition-colors cursor-pointer"
                              >
                                <Eye className="h-3 w-3" />
                                <span>{t(copy.preview)}</span>
                              </button>
                              <DownloadControl
                                doc={d}
                                onUnavailable={notify}
                                label={t(copy.download)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop table (>= sm) */}
                    <div className="hidden sm:block border border-border bg-card rounded overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[44rem] border-collapse">
                          <thead>
                            <tr className="border-b border-border bg-muted/40">
                              <th
                                scope="col"
                                className="py-3.5 ps-6 text-start text-xs font-bold text-muted-foreground"
                              >
                                {t(copy.colRef)}
                              </th>
                              <th
                                scope="col"
                                className="py-3.5 text-start text-xs font-bold text-muted-foreground"
                              >
                                {t(copy.colTitle)}
                              </th>
                              <th
                                scope="col"
                                className="py-3.5 text-start text-xs font-bold text-muted-foreground"
                              >
                                {t(copy.colYear)}
                              </th>
                              <th
                                scope="col"
                                className="py-3.5 text-start text-xs font-bold text-muted-foreground"
                              >
                                {t(copy.colFormat)}
                              </th>
                              <th
                                scope="col"
                                className="py-3.5 pe-6 text-end text-xs font-bold text-muted-foreground"
                              >
                                {t(copy.colAction)}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {pagedDocuments.map((d, i) => (
                              <tr
                                key={i}
                                onClick={() =>
                                  setPreviewModal({
                                    type: "documents",
                                    title: t(d.title),
                                    subtitle: `${d.kind} · ${d.year} هـ`,
                                    meta: d.ncnpRef,
                                    doc: d,
                                    href: d.href,
                                    description: d.description ? t(d.description) : undefined,
                                  })
                                }
                                className="group cursor-pointer hover:bg-secondary/40 transition-colors"
                              >
                                <td className="nums py-4 ps-6 pe-4 font-mono text-xs font-bold text-bronze dark:text-gold whitespace-nowrap">
                                  <span className="border border-bronze/30 bg-bronze/5 dark:bg-gold/5 px-2 py-1 rounded">
                                    {d.ncnpRef}
                                  </span>
                                </td>
                                <td className="py-4 pe-6 max-w-md">
                                  <p className="text-sm font-semibold leading-snug text-foreground group-hover:text-bronze dark:group-hover:text-gold transition-colors">
                                    {t(d.title)}
                                  </p>
                                  {d.description && (
                                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                      {t(d.description)}
                                    </p>
                                  )}
                                </td>
                                <td className="nums py-4 pe-6 text-xs whitespace-nowrap text-muted-foreground font-mono">
                                  {d.year} هـ
                                </td>
                                <td className="py-4 pe-6 text-xs text-muted-foreground">
                                  <span className="border border-border bg-secondary/80 px-2 py-0.5 rounded text-[11px] font-semibold text-foreground">
                                    {d.kind}
                                  </span>
                                </td>
                                <td
                                  className="py-4 pe-6 text-end"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPreviewModal({
                                          type: "documents",
                                          title: t(d.title),
                                          subtitle: `${d.kind} · ${d.year} هـ`,
                                          meta: d.ncnpRef,
                                          doc: d,
                                          href: d.href,
                                          description: d.description ? t(d.description) : undefined,
                                        })
                                      }
                                      className="inline-flex items-center gap-1 border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-secondary rounded transition-colors cursor-pointer"
                                    >
                                      <Eye className="h-3 w-3" />
                                      <span>{t(copy.preview)}</span>
                                    </button>
                                    <DownloadControl
                                      doc={d}
                                      onUnavailable={notify}
                                      label={t(copy.download)}
                                    />
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Grid View for Documents */
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {pagedDocuments.map((d, i) => (
                      <div
                        key={i}
                        onClick={() =>
                          setPreviewModal({
                            type: "documents",
                            title: t(d.title),
                            subtitle: `${d.kind} · ${d.year} هـ`,
                            meta: d.ncnpRef,
                            doc: d,
                            href: d.href,
                            description: d.description ? t(d.description) : undefined,
                          })
                        }
                        className="group flex flex-col justify-between border border-border bg-card p-5 rounded hover:border-bronze dark:hover:border-gold transition-all duration-200 cursor-pointer shadow-sm"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="nums border border-bronze/30 bg-bronze/10 px-2 py-0.5 rounded font-mono text-xs font-bold text-bronze dark:text-gold">
                              {d.ncnpRef}
                            </span>
                            <span className="nums text-xs font-mono text-muted-foreground">
                              {d.year} هـ
                            </span>
                          </div>
                          <h3 className="text-sm font-bold leading-snug text-foreground group-hover:text-bronze dark:group-hover:text-gold transition-colors mb-2">
                            {t(d.title)}
                          </h3>
                          {d.description && (
                            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground mb-4">
                              {t(d.description)}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between border-t border-border pt-3.5 mt-2">
                          <span className="border border-border bg-secondary/80 px-2 py-0.5 rounded text-[11px] font-semibold text-foreground">
                            {d.kind}
                          </span>
                          <div onClick={(e) => e.stopPropagation()}>
                            <DownloadControl
                              doc={d}
                              onUnavailable={notify}
                              label={t(copy.download)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <PageControls />
              </>
            ) : null}
          </section>
        )}

        {/* ── Tab Content: Photographs ────────────────────────── */}
        {tab === "photographs" && (
          <section>
            <p className="measure mb-6 text-[13px] leading-relaxed text-muted-foreground">
              {t(copy.photosNote)}
            </p>

            {filteredPhotos.length > 0 ? (
              <>
                <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {pagedPhotos.map((p, i) => {
                    const globalIdx = (page - 1) * PAGE_SIZE + i;
                    const imageSrc =
                      p.image ?? sheet[(photoIndex.get(p) ?? globalIdx) % sheet.length];

                    return (
                      <li key={i}>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() =>
                            setPreviewModal({
                              type: "photographs",
                              title: t(p.title),
                              subtitle: `${p.category} · ${p.year} هـ`,
                              image: imageSrc,
                              description: p.description ? t(p.description) : undefined,
                              photoIndex: globalIdx,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setPreviewModal({
                                type: "photographs",
                                title: t(p.title),
                                subtitle: `${p.category} · ${p.year} هـ`,
                                image: imageSrc,
                                description: p.description ? t(p.description) : undefined,
                                photoIndex: globalIdx,
                              });
                            }
                          }}
                          className="group flex flex-col border border-border bg-card rounded overflow-hidden hover:border-bronze dark:hover:border-gold transition-all duration-200 cursor-pointer shadow-sm"
                        >
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                            <img
                              src={imageSrc}
                              alt={t(p.title)}
                              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex flex-col justify-end p-4">
                              <span className="nums text-xs font-bold text-white/90">
                                {t(copy.plate)}{" "}
                                {String((photoIndex.get(p) ?? globalIdx) + 1).padStart(2, "0")} ·{" "}
                                {p.year} هـ
                              </span>
                              <p className="line-clamp-2 text-xs font-semibold text-white mt-1">
                                {t(p.title)}
                              </p>
                            </div>
                          </div>

                          <div className="p-4 flex flex-col justify-between flex-1">
                            <div>
                              <div className="flex items-baseline justify-between gap-2 mb-1.5">
                                <span className="nums font-mono text-xs font-bold text-bronze dark:text-gold">
                                  {t(copy.plate)}{" "}
                                  {String((photoIndex.get(p) ?? globalIdx) + 1).padStart(2, "0")}
                                </span>
                                <span className="nums text-xs font-mono text-muted-foreground">
                                  {p.year} هـ
                                </span>
                              </div>
                              <p className="text-sm font-semibold leading-snug text-foreground group-hover:text-bronze dark:group-hover:text-gold transition-colors line-clamp-2">
                                {t(p.title)}
                              </p>
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-border pt-2.5">
                              <span className="border border-border bg-secondary/80 px-2 py-0.5 rounded text-[11px] font-semibold text-foreground">
                                {p.category}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs text-bronze dark:text-gold font-medium">
                                <Eye className="h-3 w-3" />
                                {t(copy.preview)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
                <PageControls />
              </>
            ) : null}
          </section>
        )}

        {/* ── Tab Content: Recordings ─────────────────────────── */}
        {tab === "recordings" && (
          <section>
            <p className="measure mb-6 text-[13px] leading-relaxed text-muted-foreground">
              {t(copy.videosNote)}
            </p>

            {filteredVideos.length > 0 ? (
              <>
                <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {pagedVideos.map((v, i) => {
                    const thumbnail = v.href ? getYouTubeThumbnailUrl(v.href) : null;
                    const openPreview = () =>
                      setPreviewModal({
                        type: "recordings",
                        title: t(v.title),
                        subtitle: `${v.year} هـ`,
                        duration: v.duration,
                        href: v.href,
                        description: v.description ? t(v.description) : undefined,
                      });

                    return (
                      <li key={i}>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={openPreview}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openPreview();
                            }
                          }}
                          className="group flex flex-col border border-border bg-card rounded overflow-hidden hover:border-bronze dark:hover:border-gold transition-all duration-200 cursor-pointer shadow-sm"
                        >
                          <div className="relative aspect-video w-full overflow-hidden bg-muted">
                            {thumbnail ? (
                              <img
                                src={thumbnail}
                                alt={t(v.title)}
                                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <div className="grid h-full w-full place-items-center bg-gradient-to-br from-secondary to-muted">
                                <Video
                                  className="h-10 w-10 text-muted-foreground/40"
                                  aria-hidden="true"
                                />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                            <div className="absolute inset-0 grid place-items-center">
                              <span className="grid h-12 w-12 place-items-center rounded-full border border-white/50 bg-black/60 text-white backdrop-blur-sm transition-transform duration-200 group-hover:scale-110 group-hover:bg-bronze group-hover:border-bronze dark:group-hover:bg-gold dark:group-hover:text-ink">
                                <Play
                                  className={cn("h-5 w-5 fill-current", rtl && "-scale-x-100")}
                                />
                              </span>
                            </div>
                            <span
                              className="nums absolute bottom-2 end-2 rounded border border-white/20 bg-black/80 px-2 py-0.5 font-mono text-[11px] font-bold text-white"
                              dir="ltr"
                            >
                              {v.duration}
                            </span>
                          </div>

                          <div className="p-4 flex flex-col justify-between flex-1">
                            <div>
                              <p className="text-sm font-bold leading-snug text-foreground group-hover:text-bronze dark:group-hover:text-gold transition-colors line-clamp-2">
                                {t(v.title)}
                              </p>
                              {v.description && (
                                <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                                  {t(v.description)}
                                </p>
                              )}
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-border pt-2.5 text-xs text-muted-foreground">
                              <span className="nums font-mono font-semibold">{v.year} هـ</span>
                              <span className="inline-flex items-center gap-1.5 text-bronze dark:text-gold font-semibold">
                                <Play className="h-3 w-3 fill-current" />
                                {t(copy.play)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
                <PageControls />
              </>
            ) : null}
          </section>
        )}

        {/* ── Empty Filter State ──────────────────────────────── */}
        {((tab === "documents" && filteredDocuments.length === 0) ||
          (tab === "photographs" && filteredPhotos.length === 0) ||
          (tab === "recordings" && filteredVideos.length === 0)) && (
          <div className="my-12 flex flex-col items-center justify-center border border-border bg-card p-12 text-center rounded">
            <div className="grid h-14 w-14 place-items-center rounded-full border border-border bg-muted text-muted-foreground mb-4">
              <Search className="h-6 w-6 opacity-60" />
            </div>
            <p className="max-w-md text-sm font-semibold text-foreground">{t(copy.noResults)}</p>
            {(searchQuery || selectedCategory) && (
              <EditorialButton
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                }}
                className="mt-4"
                size="sm"
              >
                <X className="h-3.5 w-3.5" />
                {t(copy.clearSearch)}
              </EditorialButton>
            )}
          </div>
        )}

        {/* ── Archive Contribution & Deposit Callout ─────────── */}
        <section className="mt-16 border border-border bg-gradient-to-br from-card via-secondary/30 to-card p-8 rounded shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded bg-bronze/10 px-2.5 py-1 text-xs font-bold text-bronze dark:text-gold">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{t(copy.depositTitle)}</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-foreground">{t(copy.depositTitle)}</h2>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              {t(copy.depositBody)}
            </p>
          </div>
          <EditorialLink href="/contact" variant="primary" className="shrink-0">
            {t(copy.depositCta)}
          </EditorialLink>
        </section>
      </div>

      {/* ── High-Fidelity Modal Dialog ─────────────────────────── */}
      {previewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 backdrop-blur-sm animate-in fade-in-0 duration-200"
          onClick={() => setPreviewModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={cn(
              "relative w-full max-h-[90vh] overflow-y-auto border border-border bg-card p-6 md:p-8 rounded shadow-2xl transition-all animate-in zoom-in-95 duration-200",
              previewModal.type === "documents" && previewModal.href && isPdfUrl(previewModal.href)
                ? "max-w-4xl"
                : "max-w-2xl",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setPreviewModal(null)}
              className="absolute top-4 end-4 grid h-8 w-8 place-items-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground cursor-pointer rounded"
              aria-label={t(copy.close)}
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Header */}
            <div className="pe-10 mb-6">
              {previewModal.meta && (
                <span className="nums inline-block border border-bronze/30 bg-bronze/10 px-2.5 py-1 rounded font-mono text-xs font-bold text-bronze dark:text-gold mb-2.5">
                  {previewModal.meta}
                </span>
              )}
              <h2 className="text-xl md:text-2xl font-bold leading-snug text-foreground">
                {previewModal.title}
              </h2>
              {previewModal.subtitle && (
                <p className="nums mt-1 text-xs md:text-sm font-medium text-muted-foreground">
                  {previewModal.subtitle}
                </p>
              )}
            </div>

            {/* Photo Lightbox Mode */}
            {previewModal.type === "photographs" && previewModal.image && (
              <>
                <div className="relative border border-border bg-black/10 dark:bg-black/60 rounded mb-4 max-h-[60vh] flex items-center justify-center overflow-hidden">
                  <img
                    src={previewModal.image}
                    alt={previewModal.title}
                    className="max-h-[60vh] w-auto object-contain mx-auto"
                  />

                  {/* Previous / Next Lightbox Arrows */}
                  {filteredPhotos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevPhoto}
                        aria-label="Previous image"
                        className="absolute start-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white hover:bg-bronze transition-colors cursor-pointer"
                      >
                        <ChevronRight className={cn("h-5 w-5", !rtl && "rotate-180")} />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextPhoto}
                        aria-label="Next image"
                        className="absolute end-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white hover:bg-bronze transition-colors cursor-pointer"
                      >
                        <ChevronLeft className={cn("h-5 w-5", !rtl && "rotate-180")} />
                      </button>
                    </>
                  )}
                </div>

                {previewModal.description && (
                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground border-s-2 border-bronze dark:border-gold ps-3">
                    {previewModal.description}
                  </p>
                )}
              </>
            )}

            {/* Video Player Mode */}
            {previewModal.type === "recordings" &&
              (() => {
                const youtubeEmbed = previewModal.href
                  ? getYouTubeEmbedUrl(previewModal.href)
                  : null;
                const isFileVideo =
                  previewModal.href && !youtubeEmbed && isVideoFileUrl(previewModal.href);

                if (youtubeEmbed) {
                  return (
                    <div className="mb-6 aspect-video w-full overflow-hidden border border-border rounded bg-black">
                      <iframe
                        src={`${youtubeEmbed}?autoplay=1`}
                        title={previewModal.title}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  );
                }

                if (isFileVideo && previewModal.href) {
                  return (
                    <div className="mb-6 aspect-video w-full overflow-hidden border border-border rounded bg-black">
                      <video src={previewModal.href} controls autoPlay className="h-full w-full">
                        {t(copy.pending)}
                      </video>
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col items-center justify-center border border-border bg-muted/30 p-8 text-center mb-6 rounded">
                    <div className="grid h-14 w-14 place-items-center rounded-full border border-border bg-card text-foreground mb-4">
                      <Play className={cn("h-6 w-6 fill-current", rtl && "-scale-x-100")} />
                    </div>
                    <p className="text-sm text-foreground font-bold mb-1">{previewModal.title}</p>
                    {previewModal.duration && (
                      <span className="nums font-mono text-xs text-muted-foreground mb-6" dir="ltr">
                        {previewModal.duration}
                      </span>
                    )}
                    <EditorialButton
                      type="button"
                      variant="primary"
                      onClick={() => {
                        setPreviewModal(null);
                        notify();
                      }}
                    >
                      <Play className={cn("h-4 w-4 fill-current", rtl && "-scale-x-100")} />
                      {t(copy.play)}
                    </EditorialButton>
                  </div>
                );
              })()}

            {previewModal.type === "recordings" && previewModal.description && (
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                {previewModal.description}
              </p>
            )}

            {/* Document Reader Mode */}
            {previewModal.type === "documents" && (
              <>
                {previewModal.href && isPdfUrl(previewModal.href) ? (
                  <div className="mb-6 aspect-[4/3] w-full overflow-hidden border border-border rounded bg-muted/50">
                    <iframe
                      src={`${previewModal.href}#view=FitH`}
                      title={previewModal.title}
                      className="h-full w-full"
                    />
                  </div>
                ) : (
                  <div className="border border-border bg-muted/30 p-6 mb-6 rounded">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="h-6 w-6 text-bronze dark:text-gold" />
                      <div>
                        <h3 className="text-sm font-bold text-foreground">{t(copy.details)}</h3>
                        <p className="text-xs text-muted-foreground">{t(siteMeta.shortName)}</p>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground border-t border-border pt-3">
                      {previewModal.description || t(copy.docsNote)}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Modal Bottom Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 mt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleShareWhatsApp(previewModal.title, previewModal.description)}
                  className="inline-flex items-center gap-1.5 border border-border bg-secondary/50 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer rounded"
                >
                  <Share2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  {t(copy.shareWhatsApp)}
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyLink(previewModal.href)}
                  className="inline-flex items-center gap-1.5 border border-border bg-secondary/50 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer rounded"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? t(copy.copied) : t(copy.copyLink)}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <EditorialButton type="button" onClick={() => setPreviewModal(null)} size="sm">
                  {t(copy.close)}
                </EditorialButton>
                {previewModal.type === "documents" && previewModal.doc && (
                  <DownloadControl
                    doc={previewModal.doc}
                    onUnavailable={() => {
                      setPreviewModal(null);
                      notify();
                    }}
                    label={t(copy.download)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
