import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Download, Play, Search, X, Eye, FileText, Image as ImageIcon, Video } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { Record, EditorialButton, EditorialLink } from "@/components/site/Editorial";
import { libraryItems, siteMeta } from "@/content/site";
import { pageImages } from "@/content/images";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "الأرشيف والمكتبة الرقمية | آل بوعبيد" },
      { name: "description", content: "الأرشيف الرقمي المعتمد آل بوعبيد: اللوائح الرسمية، الدراسات التاريخية والجينية، ومجموعات الصور والتسجيلات." },
      { property: "og:title", content: "الأرشيف والمكتبة الرقمية — آل بوعبيد" },
      { property: "og:description", content: "الأرشيف الرقمي المعتمد لأسرة آل بوعبيد: اللوائح الرسمية، الدراسات التاريخية والجينية، ومجموعات الصور." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://alboabid-heritage-hub.lovable.app/library" },
    ],
    links: [{ rel: "canonical", href: "https://alboabid-heritage-hub.lovable.app/library" }],
  }),
  component: LibraryPage,
});

type TabKey = "documents" | "photographs" | "recordings";

const copy = {
  eyebrow: { ar: "الأرشيف", en: "Archive" } as BiText,
  title: {
    ar: "المكتبة الرقمية وأرشيف الوثائق",
    en: "Digital Library & Document Archive",
  } as BiText,
  subtitle: {
    ar: "اللوائح المعتمدة، والدراسات النسبية والجينية، ومجموعات الصور والتسجيلات — مفهرسة ومتاحة لأبناء الأسرة والباحثين.",
    en: "Approved bylaws, genealogical and genetic studies, and collections of photographs and recordings — catalogued and available to family members and researchers.",
  } as BiText,

  metaHolder: { ar: "الجهة الحافظة", en: "Held by" } as BiText,
  metaRef: { ar: "مرجع المجموعة", en: "Collection ref." } as BiText,
  metaAccess: { ar: "الإتاحة", en: "Access" } as BiText,
  metaAccessValue: { ar: "أبناء الأسرة والباحثون", en: "Family members & researchers" } as BiText,

  tabs: {
    documents: { ar: "الوثائق واللوائح", en: "Documents & Bylaws" } as BiText,
    photographs: { ar: "المجموعة المصورة", en: "Photographs" } as BiText,
    recordings: { ar: "التسجيلات المرئية", en: "Recordings" } as BiText,
  },

  colRef: { ar: "المرجع", en: "Ref." } as BiText,
  colTitle: { ar: "العنوان", en: "Title" } as BiText,
  colYear: { ar: "السنة", en: "Year" } as BiText,
  colFormat: { ar: "الصيغة", en: "Format" } as BiText,
  colDuration: { ar: "المدة", en: "Duration" } as BiText,
  colAction: { ar: "الإجراء", en: "" } as BiText,

  download: { ar: "تحميل", en: "Download" } as BiText,
  play: { ar: "تشغيل", en: "Play" } as BiText,
  plate: { ar: "صورة", en: "Plate" } as BiText,

  docsNote: {
    ar: "الوثائق أدناه صادرة عن الصندوق أو معتمدة منها. ويُرجع في النصوص الرسمية إلى النسخة الموقعة المودعة لدى الأمانة العامة.",
    en: "The documents below are issued or approved by the organisation. For official purposes, reference is made to the signed copy deposited with the secretariat.",
  } as BiText,
  photosNote: {
    ar: "مجموعة مصورة موثقة لمناسبات الأسرة واجتماعاتها الرسمية.",
    en: "A documented photographic collection of family occasions and official assemblies.",
  } as BiText,
  videosNote: {
    ar: "تسجيلات الكلمات والعروض والأفلام الوثائقية.",
    en: "Recordings of addresses, presentations, and documentary films.",
  } as BiText,

  pending: {
    ar: "الملف قيد الرفع على الأرشيف الرقمي — يرجى مراجعة الأمانة العامة.",
    en: "This file is still being uploaded to the digital archive — please contact the secretariat.",
  } as BiText,
  searchPlaceholder: {
    ar: "البحث بالاسم، المرجع، أو السنة...",
    en: "Search by title, ref, or year...",
  } as BiText,
  clearSearch: { ar: "مسح البحث", en: "Clear search" } as BiText,
  allCategories: { ar: "الكل", en: "All" } as BiText,
  preview: { ar: "معاينة", en: "Preview" } as BiText,
  close: { ar: "إغلاق", en: "Close" } as BiText,
  details: { ar: "تفاصيل الوثيقة", en: "Document Details" } as BiText,
  noResults: {
    ar: "لا توجد نتائج تطابق بحثك أو تصنيف الفرع المختار.",
    en: "No results match your search query or selected category.",
  } as BiText,
};

const sheet = pageImages.library.contactSheet;

type LibraryDocument = (typeof libraryItems.documents)[number];

/** Shared between the table cell and the mobile record — a real download
 * where the archive holds the file, an honest "not yet uploaded" notice
 * otherwise, rather than pretending every row is downloadable. */
function DownloadControl({
  doc,
  onUnavailable,
  label,
}: {
  doc: LibraryDocument;
  onUnavailable: () => void;
  label: string;
}) {
  return doc.href ? (
    <EditorialLink href={doc.href} target="_blank" rel="noopener noreferrer" size="sm">
      <Download className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </EditorialLink>
  ) : (
    <EditorialButton type="button" onClick={onUnavailable} size="sm">
      <Download className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </EditorialButton>
  );
}

export function LibraryPage() {
  const { t, lang } = useLang();
  const [tab, setTab] = useState<TabKey>("documents");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewModal, setPreviewModal] = useState<{
    type: TabKey;
    title: string;
    subtitle?: string;
    meta?: string;
    image?: string;
    duration?: string;
    doc?: LibraryDocument;
  } | null>(null);

  const rtl = lang === "ar";

  const notify = () => toast(t(copy.pending));

  const handleTabChange = (newTab: TabKey) => {
    setTab(newTab);
    setSelectedCategory(null);
  };

  const tabDefs: { key: TabKey; label: BiText; count: number }[] = [
    { key: "documents", label: copy.tabs.documents, count: libraryItems.documents.length },
    { key: "photographs", label: copy.tabs.photographs, count: libraryItems.photos.length },
    { key: "recordings", label: copy.tabs.recordings, count: libraryItems.videos.length },
  ];

  // Derive category pills per tab
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
  }, [tab]);

  // Filter items by search query and selected category
  const filteredDocuments = useMemo(() => {
    return libraryItems.documents.filter((d) => {
      const matchesSearch =
        !searchQuery.trim() ||
        t(d.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.ncnpRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(d.year).includes(searchQuery.trim());
      const matchesCat = !selectedCategory || d.kind === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory, t]);

  const filteredPhotos = useMemo(() => {
    return libraryItems.photos.filter((p) => {
      const matchesSearch =
        !searchQuery.trim() ||
        t(p.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(p.year).includes(searchQuery.trim());
      const matchesCat = !selectedCategory || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory, t]);

  const filteredVideos = useMemo(() => {
    return libraryItems.videos.filter((v) => {
      const matchesSearch =
        !searchQuery.trim() ||
        t(v.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(v.year).includes(searchQuery.trim());
      const matchesCat = !selectedCategory || `${v.year} هـ` === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory, t]);

  return (
    <>
      <PageHeader
        variant="document"
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
        meta={[
          { label: t(copy.metaHolder), value: t(siteMeta.shortName) },
          { label: t(copy.metaRef), value: `NCNP/${siteMeta.ncnpLicense}`, mono: true },
          { label: t(copy.metaAccess), value: t(copy.metaAccessValue) },
        ]}
      />

      <div className="container-page pb-20">
        {/* Flat editorial filter tabs and search bar */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div
            role="tablist"
            aria-label={t(copy.eyebrow)}
            className="inline-flex gap-1 overflow-x-auto no-scrollbar border border-border bg-card p-1"
          >
            {tabDefs.map((d) => {
              const isSelected = tab === d.key;
              return (
                <button
                  key={d.key}
                  role="tab"
                  type="button"
                  aria-selected={isSelected}
                  onClick={() => handleTabChange(d.key)}
                  className={cn(
                    "label-caps flex shrink-0 items-center gap-2 border px-3.5 py-1.5 text-xs transition-colors duration-150",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground font-semibold"
                      : "border-transparent text-muted-foreground hover:border-border hover:bg-accent/40 hover:text-foreground",
                  )}
                >
                  {d.key === "documents" && <FileText className="h-3.5 w-3.5 shrink-0 opacity-70" />}
                  {d.key === "photographs" && <ImageIcon className="h-3.5 w-3.5 shrink-0 opacity-70" />}
                  {d.key === "recordings" && <Video className="h-3.5 w-3.5 shrink-0 opacity-70" />}
                  <span>{t(d.label)}</span>
                  <span
                    className={cn(
                      "nums text-[11px] px-1.5 py-0.2",
                      isSelected
                        ? "bg-primary-foreground/20 text-primary-foreground font-bold"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {d.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search
              className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(copy.searchPlaceholder)}
              className="w-full border border-border bg-card py-2 text-xs font-serif text-foreground placeholder:text-muted-foreground outline-none transition-colors duration-150 ps-9 pe-8 focus:border-foreground focus:ring-1 focus:ring-ring"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label={t(copy.clearSearch)}
                className="absolute top-1/2 -translate-y-1/2 end-2 p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Buttons */}
        {currentCategories.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "label-caps border px-3 py-1 text-xs transition-colors duration-150",
                selectedCategory === null
                  ? "border-primary bg-primary text-primary-foreground font-semibold"
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
                    "label-caps border px-3 py-1 text-xs transition-colors duration-150",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground font-semibold"
                      : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground",
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Documents ──────────────────────────────────────── */}
        {tab === "documents" ? (
          <section className="reveal-on-scroll">
            <p className="measure mb-7 text-[13px] leading-relaxed text-muted-foreground">
              {t(copy.docsNote)}
            </p>

            {filteredDocuments.length > 0 ? (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <div className="border border-border bg-card">
                    <table className="w-full min-w-[40rem] border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th
                            scope="col"
                            className="label-caps py-3 ps-6 text-start text-muted-foreground"
                          >
                            {t(copy.colRef)}
                          </th>
                          <th
                            scope="col"
                            className="label-caps py-3 text-start text-muted-foreground"
                          >
                            {t(copy.colTitle)}
                          </th>
                          <th
                            scope="col"
                            className="label-caps py-3 text-start text-muted-foreground"
                          >
                            {t(copy.colYear)}
                          </th>
                          <th
                            scope="col"
                            className="label-caps py-3 text-start text-muted-foreground"
                          >
                            {t(copy.colFormat)}
                          </th>
                          <th scope="col" className="py-3 pe-6">
                            <span className="sr-only">{t(copy.download)}</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDocuments.map((d, i) => (
                          <tr
                            key={i}
                            onClick={() =>
                              setPreviewModal({
                                type: "documents",
                                title: t(d.title),
                                subtitle: `${d.kind} · ${d.year} هـ`,
                                meta: d.ncnpRef,
                                doc: d,
                              })
                            }
                            className="group cursor-pointer border-b border-border align-baseline transition-colors hover:bg-accent/40 last:border-0"
                          >
                            <td className="nums py-4 ps-6 pe-4 font-mono text-xs whitespace-nowrap font-semibold text-bronze dark:text-gold">
                              {d.ncnpRef}
                            </td>
                            <td className="py-4 pe-6 text-sm leading-snug font-medium text-foreground group-hover:text-bronze transition-colors">
                              {t(d.title)}
                            </td>
                            <td className="nums py-4 pe-6 text-[13px] whitespace-nowrap text-muted-foreground">
                              {d.year} هـ
                            </td>
                            <td className="py-4 pe-6 text-[13px] text-muted-foreground">
                              <span className="border border-border bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                                {d.kind}
                              </span>
                            </td>
                            <td className="py-4 pe-6 text-end" onClick={(e) => e.stopPropagation()}>
                              <DownloadControl
                                doc={d}
                                onUnavailable={notify}
                                label={t(copy.download)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="reveal-stagger grid gap-3 md:hidden">
                  {filteredDocuments.map((d, i) => (
                    <div
                      key={i}
                      onClick={() =>
                        setPreviewModal({
                          type: "documents",
                          title: t(d.title),
                          subtitle: `${d.kind} · ${d.year} هـ`,
                          meta: d.ncnpRef,
                          doc: d,
                        })
                      }
                      className="group card-craft active-scale cursor-pointer border border-border bg-card p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="nums inline-block border border-bronze/30 bg-bronze/10 px-2 py-0.5 font-mono text-xs font-semibold text-bronze dark:text-gold mb-2">
                            {d.ncnpRef}
                          </span>
                          <h3 className="text-sm font-medium leading-snug text-foreground group-hover:text-bronze transition-colors">
                            {t(d.title)}
                          </h3>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="nums font-medium">{d.year} هـ</span>
                          <span>·</span>
                          <span className="border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground">
                            {d.kind}
                          </span>
                        </div>
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
              </>
            ) : null}
          </section>
        ) : null}

        {/* ── Photographs — archive cards ─────────────────────── */}
        {tab === "photographs" ? (
          <section className="reveal-on-scroll">
            <p className="measure mb-7 text-[13px] leading-relaxed text-muted-foreground">
              {t(copy.photosNote)}
            </p>

            {filteredPhotos.length > 0 ? (
              <ol className="reveal-stagger grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPhotos.map((p, i) => {
                  const imageSrc = sheet[libraryItems.photos.indexOf(p) % sheet.length];
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
                            });
                          }
                        }}
                        className="group card-craft active-scale cursor-pointer border border-border bg-card focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                          <img
                            src={imageSrc}
                            alt={t(p.title)}
                            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 transition-opacity duration-150 group-hover:opacity-100 flex flex-col justify-end gap-0.5 p-4">
                            <p className="line-clamp-2 text-xs font-serif text-white">
                              {t(p.title)}
                            </p>
                            <p className="text-[11px] text-white/80">
                              {p.category} · {p.year} هـ
                            </p>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="nums label-caps text-xs font-semibold text-bronze dark:text-gold">
                              {t(copy.plate)}{" "}
                              {String(libraryItems.photos.indexOf(p) + 1).padStart(2, "0")}
                            </span>
                            <span className="nums text-xs text-muted-foreground">{p.year} هـ</span>
                          </div>
                          <p className="mt-2 text-sm font-medium leading-snug text-foreground group-hover:text-bronze transition-colors line-clamp-2">
                            {t(p.title)}
                          </p>
                          <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5">
                            <span className="label-caps text-xs text-muted-foreground">
                              {p.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : null}
          </section>
        ) : null}

        {/* ── Recordings — video cards ────────────────────────── */}
        {tab === "recordings" ? (
          <section className="reveal-on-scroll">
            <p className="measure mb-7 text-[13px] leading-relaxed text-muted-foreground">
              {t(copy.videosNote)}
            </p>

            {filteredVideos.length > 0 ? (
              <ol className="reveal-stagger grid gap-3">
                {filteredVideos.map((v, i) => (
                  <li key={i}>
                    <div
                      onClick={() =>
                        setPreviewModal({
                          type: "recordings",
                          title: t(v.title),
                          subtitle: `${v.year} هـ`,
                          duration: v.duration,
                        })
                      }
                      className="group card-craft active-scale flex cursor-pointer items-center justify-between gap-5 border border-border bg-card p-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            notify();
                          }}
                          aria-label={`${t(copy.play)} — ${t(v.title)}`}
                          className="grid h-10 w-10 shrink-0 place-items-center border border-border bg-muted text-foreground transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
                        >
                          <Play
                            className={cn("h-4 w-4 fill-current", rtl && "-scale-x-100")}
                            aria-hidden="true"
                          />
                        </button>

                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-snug text-foreground group-hover:text-bronze transition-colors">
                            {t(v.title)}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="nums label-caps font-semibold">{v.year} هـ</span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <Video className="h-3 w-3" />
                              {t(copy.tabs.recordings)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <span
                          className="nums border border-border bg-muted px-2.5 py-1 font-mono text-xs font-medium text-muted-foreground"
                          dir="ltr"
                        >
                          {v.duration}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            ) : null}
          </section>
        ) : null}

        {/* Empty state when search or category filter yields no results */}
        {((tab === "documents" && filteredDocuments.length === 0) ||
          (tab === "photographs" && filteredPhotos.length === 0) ||
          (tab === "recordings" && filteredVideos.length === 0)) && (
          <div className="my-12 flex flex-col items-center justify-center border border-border bg-card p-12 text-center">
            <div className="grid h-12 w-12 place-items-center border border-border bg-muted text-muted-foreground mb-4">
              <Search className="h-5 w-5 opacity-60" />
            </div>
            <p className="max-w-md text-sm font-medium text-foreground">{t(copy.noResults)}</p>
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
      </div>

      {/* ── Editorial Modal Dialog ───────────────── */}
      {previewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPreviewModal(null)}
        >
          <div
            className="relative w-full max-w-2xl border border-border bg-card p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              type="button"
              onClick={() => setPreviewModal(null)}
              aria-label={t(copy.close)}
              className="absolute top-4 end-4 grid h-8 w-8 place-items-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="pe-10 mb-6">
              {previewModal.meta && (
                <span className="nums inline-block border border-bronze/30 bg-bronze/10 px-2.5 py-1 font-mono text-xs font-semibold text-bronze dark:text-gold mb-2.5">
                  {previewModal.meta}
                </span>
              )}
              <h2
                id="modal-title"
                className="text-lg md:text-xl font-semibold leading-snug text-foreground"
              >
                {previewModal.title}
              </h2>
              {previewModal.subtitle && (
                <p className="nums mt-1.5 text-xs md:text-sm text-muted-foreground">
                  {previewModal.subtitle}
                </p>
              )}
            </div>

            {previewModal.type === "photographs" && previewModal.image && (
              <div className="border border-border bg-black/5 dark:bg-black/40 mb-6 max-h-[60vh] flex items-center justify-center">
                <img
                  src={previewModal.image}
                  alt={previewModal.title}
                  className="max-h-[60vh] w-auto object-contain mx-auto"
                />
              </div>
            )}

            {previewModal.type === "recordings" && (
              <div className="flex flex-col items-center justify-center border border-border bg-muted/30 p-8 text-center mb-6">
                <div className="grid h-14 w-14 place-items-center border border-border bg-card text-foreground mb-4">
                  <Play className={cn("h-6 w-6 fill-current", rtl && "-scale-x-100")} />
                </div>
                <p className="text-sm text-foreground font-medium mb-1">{previewModal.title}</p>
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
            )}

            {previewModal.type === "documents" && (
              <div className="border border-border bg-muted/30 p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-bronze dark:text-gold" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{t(copy.details)}</h3>
                    <p className="text-xs text-muted-foreground">
                      {t(copy.metaHolder)}: {t(siteMeta.shortName)}
                    </p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground border-t border-border pt-3">
                  {t(copy.docsNote)}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
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
      )}
    </>
  );
}


