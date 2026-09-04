import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Award,
  Sparkles,
  Send,
  CheckCircle2,
  ExternalLink,
  User,
  GitBranch,
} from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow } from "@/components/site/Editorial";
import { achievers as staticAchievers, branches } from "@/content/site";
import { getPublishedAchievers } from "@/lib/cms.functions";
import { submitAchieverNomination } from "@/lib/forms.functions";
import { mergeAchievers } from "@/content/cms-adapt";
import { pageImages } from "@/content/images";
import { SaudiCulturalAvatar } from "@/components/common/SaudiCulturalAvatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

/** How many entries are shown per page in the register. */
const PAGE_SIZE = 20;

export const Route = createFileRoute("/achievers")({
  loader: async () => {
    const rows = await getPublishedAchievers();
    return { achievers: mergeAchievers(rows, staticAchievers) };
  },
  head: () => ({
    meta: [
      { title: "سجل المتميزين | آل بوعبيد" },
      {
        name: "description",
        content:
          "كفاءات ومتميزو أسرة آل بوعبيد من أبنائها وبناتها في الطب والأكاديميا والهندسة والخدمة العامة.",
      },
      { property: "og:title", content: "سجل المتميزين — آل بوعبيد" },
      {
        property: "og:description",
        content:
          "كفاءات ومتميزو أسرة آل بوعبيد من أبنائها وبناتها في الطب والأكاديميا والهندسة والخدمة العامة.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: getCanonicalUrl("/achievers") },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/achievers") }],
  }),
  component: AchieversPage,
});

const copy = {
  eyebrow: { ar: "سجل التميز", en: "Roll of honour" } as BiText,
  title: { ar: "من كفاءات ومتميزين الأسرة", en: "Among the Family's Achievers" } as BiText,
  subtitle: {
    ar: "يقيّد هذا السجل أصحاب التحصيل العلمي والمهني من أبناء وبنات الفروع السبعة. ويُحدَّث سنوياً عند حفل التكريم بالملتقى العام.",
    en: "This register records the academic and professional achievements of the sons and daughters of the seven branches. It is updated each year at the honours ceremony of the general assembly.",
  } as BiText,

  metaEntries: { ar: "عدد المقيدين", en: "Entries" } as BiText,
  metaFields: { ar: "المجالات", en: "Fields" } as BiText,
  metaUpdated: { ar: "آخر تحديث", en: "Last updated" } as BiText,
  metaUpdatedValue: { ar: "١٤٤٧ هـ", en: "1447 AH" } as BiText,

  filterLabel: { ar: "تصفية حسب المجال", en: "Filter by field" } as BiText,
  searchPlaceholder: {
    ar: "ابحث بالاسم، المجال، أو الفرع…",
    en: "Search by name, field, or branch…",
  } as BiText,
  empty: {
    ar: "لا توجد قيود مطابقة لبحثك في هذا المجال.",
    en: "No matching entries found for your search.",
  } as BiText,

  colName: { ar: "الاسم", en: "Name" } as BiText,
  colField: { ar: "المجال", en: "Field" } as BiText,
  colAchievement: { ar: "التميز", en: "Distinction" } as BiText,
  colBranch: { ar: "الفرع", en: "Branch" } as BiText,

  nominateTitle: { ar: "الترشيح لسجل المتميزين", en: "Nominations" } as BiText,
  nominateBody: {
    ar: "يُفتح باب الترشح لجائزة التفوق العلمي والتميز المهني لأبناء وبنات الأسرة. ويجري القيد بعد اعتماد أمانة المجلس واللجان المختصة.",
    en: "Nominations for academic and professional distinction are open to family members. Additions are confirmed following approval by the Secretariat and relevant committees.",
  } as BiText,
  nominateCta: { ar: "تقديم ترشيح جديد", en: "Submit a nomination" } as BiText,
};

const categories: { key: string; label: BiText }[] = [
  { key: "all", label: { ar: "الكل", en: "All" } },
  { key: "medical", label: { ar: "الطب", en: "Medicine" } },
  { key: "academic", label: { ar: "الأكاديميا", en: "Academia" } },
  { key: "military", label: { ar: "الخدمة العسكرية", en: "Military" } },
  { key: "business", label: { ar: "الأعمال والتقنية", en: "Business & Technology" } },
  { key: "sports", label: { ar: "الرياضة", en: "Sport" } },
  { key: "public", label: { ar: "الخدمة العامة", en: "Public service" } },
];

function AchieversPage() {
  const { t, lang } = useLang();
  const { achievers } = Route.useLoaderData();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [activeAchiever, setActiveAchiever] = useState<any | null>(null);
  const [nominationOpen, setNominationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    nominee_name: "",
    branch_slug: "",
    category: "academic" as "medical" | "academic" | "military" | "business" | "sports" | "other",
    field: "",
    achievement_summary: "",
    biography: "",
    nomination_reason: "",
    year: "1447",
    evidence_url: "",
    nominator_name: "",
    nominator_phone: "",
    nominator_email: "",
    notes: "",
    website_url_check: "",
  });

  const sendNomination = useServerFn(submitAchieverNomination);

  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;

  const ATTACH_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
  const ATTACH_MAX_BYTES = 10 * 1024 * 1024;
  const ATTACH_MAX_COUNT = 6;

  const addAttachments = (files: FileList | null) => {
    if (!files) return;
    const next = [...attachments];
    for (const f of Array.from(files)) {
      if (next.length >= ATTACH_MAX_COUNT) {
        toast.error(
          rtl ? `الحد الأقصى ${ATTACH_MAX_COUNT} ملفات` : `Maximum ${ATTACH_MAX_COUNT} files`,
        );
        break;
      }
      if (!ATTACH_TYPES.includes(f.type)) {
        toast.error(rtl ? `صيغة غير مدعومة: ${f.name}` : `Unsupported file: ${f.name}`);
        continue;
      }
      if (f.size > ATTACH_MAX_BYTES) {
        toast.error(rtl ? `الملف كبير جداً: ${f.name}` : `File too large: ${f.name}`);
        continue;
      }
      if (!next.some((x) => x.name === f.name && x.size === f.size)) next.push(f);
    }
    setAttachments(next);
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result);
        resolve(result.slice(result.indexOf(",") + 1));
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return achievers.filter((a) => {
      if (selectedCategory !== "all" && a.category !== selectedCategory) return false;
      if (!q) return true;
      const name = t(a.name).toLowerCase();
      const field = t(a.field).toLowerCase();
      const achievement = t(a.achievement).toLowerCase();
      const branch = a.branch ? t(a.branch).toLowerCase() : "";
      return name.includes(q) || field.includes(q) || achievement.includes(q) || branch.includes(q);
    });
  }, [achievers, selectedCategory, searchQuery, t]);

  const fieldCount = new Set(achievers.map((a) => a.category)).size;

  // Switching the search or category filter starts a fresh page 1 so the
  // reader never lands on an out-of-range page for the new result set.
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  const handleNominationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.nominee_name ||
      !formData.field ||
      !formData.achievement_summary ||
      !formData.nominator_name ||
      !formData.nominator_phone
    ) {
      toast.error(rtl ? "يرجى تعبئة الحقول المطلوبة" : "Please fill in required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const encoded = await Promise.all(
        attachments.map(async (f) => ({
          name: f.name,
          type: f.type as "application/pdf" | "image/jpeg" | "image/png" | "image/webp",
          data: await fileToBase64(f),
        })),
      );
      const res = await sendNomination({ data: { ...formData, attachments: encoded } });
      if (res.ok) {
        setSubmittedSuccess(true);
        setAttachments([]);
        toast.success(
          rtl ? "تم إرسال الترشيح بنجاح إلى أمانة المجلس" : "Nomination submitted successfully",
        );
      } else {
        toast.error(
          rtl ? "تعذر إرسال الترشيح، يرجى المحاولة لاحقاً" : "Failed to submit nomination",
        );
      }
    } catch {
      toast.error(rtl ? "حدث خطأ أثناء الإرسال" : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        variant="plate"
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
        image={pageImages.achievers.header.src}
        imageCaption={t(pageImages.achievers.header.caption)}
        meta={[
          { label: t(copy.metaEntries), value: achievers.length.toString(), mono: true },
          { label: t(copy.metaFields), value: fieldCount.toString(), mono: true },
          { label: t(copy.metaUpdated), value: t(copy.metaUpdatedValue) },
        ]}
      />

      <div className="container-page py-12 md:py-14">
        {/* Search & Category Filter Controls */}
        <div className="border-b border-border pb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <Eyebrow>{t(copy.filterLabel)}</Eyebrow>
            <div className="relative w-full md:w-80">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(copy.searchPlaceholder)}
                className="w-full rounded-md border border-border bg-background ps-9 pe-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none touch-pan-x -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
            {categories.map((c) => {
              const count =
                c.key === "all"
                  ? achievers.length
                  : achievers.filter((a) => a.category === c.key).length;
              const active = selectedCategory === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setSelectedCategory(c.key)}
                  aria-pressed={active}
                  className={cn(
                    "shrink-0 inline-flex items-baseline gap-1.5 rounded-full sm:rounded-none px-3 sm:px-0 py-1 sm:py-0 border sm:border-0 sm:border-b text-xs sm:text-sm transition-all duration-150 active:scale-95 cursor-pointer",
                    active
                      ? "border-bronze bg-bronze/10 text-bronze dark:border-gold dark:bg-gold/10 dark:text-gold font-semibold sm:bg-transparent sm:text-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground sm:border-transparent sm:bg-transparent",
                  )}
                >
                  <span>{t(c.label)}</span>
                  <span className="nums text-[10px] sm:text-xs opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* The register itself */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <p className="text-sm text-muted-foreground">{t(copy.empty)}</p>
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="text-xs font-semibold text-bronze dark:text-gold underline cursor-pointer"
              >
                {rtl ? "مسح البحث وعوامل التصفية" : "Clear search & filters"}
              </button>
            ) : null}
          </div>
        ) : (
          <>
            {/* Column headings, shown once at the top of the register */}
            <div className="mt-8 hidden border-b border-ink/25 pb-2.5 md:grid md:grid-cols-[2.5rem_4rem_minmax(0,14rem)_minmax(0,10rem)_1fr] md:gap-6 dark:border-ivory/20">
              <span className="label-caps text-muted-foreground" aria-hidden="true" />
              <span className="label-caps text-muted-foreground" aria-hidden="true" />
              <span className="label-caps text-muted-foreground">{t(copy.colName)}</span>
              <span className="label-caps text-muted-foreground">{t(copy.colField)}</span>
              <span className="label-caps text-muted-foreground">{t(copy.colAchievement)}</span>
            </div>

            <ol>
              {paged.map((person, i) => (
                <li
                  key={`${t(person.name)}-${(page - 1) * PAGE_SIZE + i}`}
                  onClick={() => setActiveAchiever(person)}
                  className="group grid grid-cols-[4rem_1fr] items-start gap-x-5 gap-y-1.5 border-b border-border py-5 md:grid-cols-[2.5rem_4rem_minmax(0,14rem)_minmax(0,10rem)_1fr] md:gap-x-6 cursor-pointer hover:bg-secondary/30 transition-colors px-2 rounded-sm"
                >
                  <span
                    className="nums order-2 hidden font-mono text-sm text-bronze/70 md:order-none md:block dark:text-gold/60"
                    aria-hidden="true"
                  >
                    {String((page - 1) * PAGE_SIZE + i + 1).padStart(2, "0")}
                  </span>

                  <div className="w-16 h-20 rounded-md overflow-hidden border border-border shrink-0 bg-secondary/50">
                    <SaudiCulturalAvatar
                      src={person.image}
                      alt={t(person.name)}
                      className="w-full h-full object-cover rounded-none"
                    />
                  </div>

                  <span className="md:pt-0.5">
                    <span className="block font-naskh text-base font-bold text-foreground rtl:text-lg group-hover:text-bronze dark:group-hover:text-gold transition-colors">
                      {t(person.name)}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-bronze dark:text-gold">
                      <span>{t(person.field)}</span>
                      {person.branch ? (
                        <>
                          <span className="hidden text-border md:inline" aria-hidden="true">
                            ·
                          </span>
                          <span className="hidden text-muted-foreground md:inline">
                            {t(person.branch)}
                          </span>
                        </>
                      ) : null}
                    </span>
                  </span>

                  <span className="hidden text-[13px] text-bronze md:block md:pt-1 dark:text-gold">
                    {t(person.field)}
                  </span>

                  <span className="col-start-2 text-[13px] leading-relaxed text-muted-foreground md:col-start-auto md:pt-1">
                    {t(person.achievement)}
                    {person.branch ? (
                      <span className="mt-1 block text-xs text-muted-foreground md:hidden">
                        {t(person.branch)}
                      </span>
                    ) : null}
                  </span>
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
          </>
        )}
      </div>

      {/* ── Achiever Detail Dialog Modal ──────────────────────── */}
      <Dialog open={!!activeAchiever} onOpenChange={(open) => !open && setActiveAchiever(null)}>
        <DialogContent className="max-w-xl p-6 bg-card border-border">
          {activeAchiever ? (
            <div>
              <div className="flex items-start gap-4">
                <div className="w-20 h-24 rounded-lg overflow-hidden border border-border shrink-0 bg-secondary/60">
                  <SaudiCulturalAvatar
                    src={activeAchiever.image}
                    alt={t(activeAchiever.name)}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-bronze dark:text-gold px-2.5 py-0.5 rounded-full bg-bronze/10 dark:bg-gold/10">
                    <Award className="w-3.5 h-3.5" />
                    {t(activeAchiever.field)}
                  </span>
                  <DialogTitle className="font-naskh text-xl md:text-2xl font-bold text-foreground">
                    {t(activeAchiever.name)}
                  </DialogTitle>
                  {activeAchiever.branch ? (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <GitBranch className="w-3.5 h-3.5 text-primary" />
                      {t(activeAchiever.branch)}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-4 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    {rtl ? "التميز والإنجاز" : "Distinction & Recognition"}
                  </h4>
                  <p className="text-sm leading-relaxed text-foreground bg-secondary/40 p-3.5 rounded-md border border-border">
                    {t(activeAchiever.achievement)}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setActiveAchiever(null)}
                  className="text-xs"
                >
                  {rtl ? "إغلاق" : "Close"}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* ── Interactive Nomination Dialog Modal ───────────────── */}
      <Dialog
        open={nominationOpen}
        onOpenChange={(open) => {
          setNominationOpen(open);
          if (!open) {
            setSubmittedSuccess(false);
          }
        }}
      >
        <DialogContent className="max-w-2xl p-6 bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-bronze dark:text-gold">
              <Sparkles className="w-4 h-4" />
              {rtl ? "جائزة التميز العائلي" : "Family Excellence Award"}
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              {t(copy.nominateTitle)}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {rtl
                ? "يتم مراجعة كافة الترشيحات وتدقيقها من قبل أمانة المجلس واللجان لإدراجها في لوحة الشرف الرسمية."
                : "All nominations are reviewed and audited by the council secretariat before inclusion on the official honor roll."}
            </DialogDescription>
          </DialogHeader>

          {submittedSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                {rtl ? "تم استلام طلب الترشيح بنجاح" : "Nomination Received Successfully"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {rtl
                  ? "شكراً لمساهمتك في توثيق تميز أبناء وبنات الأسرة. سيتم مراجعة الطلب والتواصل مع مقدم الترشيح عند الحاجة."
                  : "Thank you for documenting our family achievers. The submission will be reviewed by the council secretariat."}
              </p>
              <Button
                type="button"
                onClick={() => {
                  setNominationOpen(false);
                  setSubmittedSuccess(false);
                }}
                className="mt-4"
              >
                {rtl ? "تم" : "Done"}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleNominationSubmit} className="space-y-4 mt-2">
              <input
                type="text"
                name="website_url_check"
                value={formData.website_url_check}
                onChange={(e) => setFormData({ ...formData, website_url_check: e.target.value })}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {rtl ? "اسم المرشح الكامل *" : "Nominee Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nominee_name}
                    onChange={(e) => setFormData({ ...formData, nominee_name: e.target.value })}
                    placeholder={
                      rtl ? "د. محمد بن أحمد آل بوعبيد" : "e.g. Dr. Mohammed Al Bu Obaid"
                    }
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {rtl ? "الفرع العائلي" : "Family Branch"}
                  </label>
                  <select
                    value={formData.branch_slug}
                    onChange={(e) => setFormData({ ...formData, branch_slug: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="">
                      {rtl ? "-- اختر الفرع (اختياري) --" : "-- Select Branch (Optional) --"}
                    </option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {t(b.name)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {rtl ? "تصنيف التميز *" : "Category *"}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="academic">{rtl ? "أكاديمي وتعليمي" : "Academic"}</option>
                    <option value="medical">{rtl ? "طب وصحة" : "Medical & Health"}</option>
                    <option value="military">
                      {rtl ? "خدمة عسكرية ووطنية" : "Military & Defense"}
                    </option>
                    <option value="business">
                      {rtl ? "أعمال وابتكار وتقنية" : "Business & Tech"}
                    </option>
                    <option value="sports">{rtl ? "رياضة وبطولات" : "Sports"}</option>
                    <option value="other">{rtl ? "مجال آخر" : "Other Field"}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    {rtl ? "التخصص الدقيق / المسمى *" : "Field / Specialty *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.field}
                    onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                    placeholder={
                      rtl ? "استشاري جراحة قلب / بروفيسور" : "e.g. Consultant Surgeon / Professor"
                    }
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {rtl ? "ملخص الإنجاز والتميز *" : "Achievement Summary *"}
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.achievement_summary}
                  onChange={(e) =>
                    setFormData({ ...formData, achievement_summary: e.target.value })
                  }
                  placeholder={
                    rtl
                      ? "اذكر تفاصيل الإنجاز، الشهادات، براءات الاختراع، أو التكريمات الرسمية…"
                      : "Provide details of the achievement, degree, award or distinction…"
                  }
                  className="w-full rounded-md border border-border bg-background p-3 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {rtl ? "نبذة مختصرة عن المرشح (اختياري)" : "Short Biography (Optional)"}
                </label>
                <textarea
                  rows={3}
                  value={formData.biography}
                  onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                  placeholder={
                    rtl
                      ? "المسيرة العلمية والمهنية، المناصب، أبرز المحطات…"
                      : "Academic and professional path, positions, key milestones…"
                  }
                  className="w-full rounded-md border border-border bg-background p-3 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {rtl ? "أسباب الترشيح (اختياري)" : "Reasons for the Nomination (Optional)"}
                </label>
                <textarea
                  rows={2}
                  value={formData.nomination_reason}
                  onChange={(e) => setFormData({ ...formData, nomination_reason: e.target.value })}
                  placeholder={
                    rtl
                      ? "لماذا يستحق المرشح الإدراج في سجل كفاءات ومتميزي الأسرة؟"
                      : "Why should the nominee be added to the register of achievers?"
                  }
                  className="w-full rounded-md border border-border bg-background p-3 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {rtl
                    ? "إرفاق الشهادات (خبرة / تقدير / تدريب / تخرج)"
                    : "Attach Certificates (experience / recognition / training / graduation)"}
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    addAttachments(e.target.files);
                    e.target.value = "";
                  }}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground file:me-3 file:rounded file:border-0 file:bg-secondary file:px-2 file:py-1 file:text-xs file:text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {rtl
                    ? "PDF أو صورة، حتى ٦ ملفات، وبحد أقصى ١٠ ميغابايت للملف."
                    : "PDF or image, up to 6 files, 10 MB each."}
                </p>
                {attachments.length > 0 && (
                  <ul className="space-y-1">
                    {attachments.map((f, i) => (
                      <li
                        key={`${f.name}-${i}`}
                        className="flex items-center justify-between gap-2 rounded border border-border bg-secondary/40 px-2 py-1 text-[11px]"
                      >
                        <span className="truncate">{f.name}</span>
                        <button
                          type="button"
                          onClick={() => setAttachments(attachments.filter((_, x) => x !== i))}
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          aria-label={rtl ? "إزالة" : "Remove"}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {rtl
                    ? "أو رابط الشهادات / السيرة الذاتية (اختياري)"
                    : "Or a Certificates / CV Link (Optional)"}
                </label>
                <input
                  type="url"
                  value={formData.evidence_url}
                  onChange={(e) => setFormData({ ...formData, evidence_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="border-t border-border pt-3 space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground">
                  {rtl ? "بيانات مقدم الترشيح" : "Nominator Contact Info"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder={rtl ? "اسمك الكامل *" : "Your Name *"}
                    value={formData.nominator_name}
                    onChange={(e) => setFormData({ ...formData, nominator_name: e.target.value })}
                    className="rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <input
                    type="tel"
                    required
                    placeholder={rtl ? "رقم الجوال * (05xxxxxxx)" : "Mobile Phone *"}
                    value={formData.nominator_phone}
                    onChange={(e) => setFormData({ ...formData, nominator_phone: e.target.value })}
                    className="rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <input
                    type="email"
                    placeholder={rtl ? "البريد الإلكتروني" : "Email"}
                    value={formData.nominator_email}
                    onChange={(e) => setFormData({ ...formData, nominator_email: e.target.value })}
                    className="rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNominationOpen(false)}
                  className="text-xs"
                >
                  {rtl ? "إلغاء" : "Cancel"}
                </Button>
                <Button type="submit" disabled={isSubmitting} className="text-xs font-bold gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting
                    ? rtl
                      ? "جاري الإرسال…"
                      : "Submitting…"
                    : rtl
                      ? "إرسال الترشيح"
                      : "Submit Nomination"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Nominations CTA section ──────────────────────────── */}
      <section className="reveal-on-scroll border-t border-border bg-secondary/40">
        <div className="container-page flex flex-wrap items-center justify-between gap-6 py-12">
          <div className="measure">
            <h2 className="text-xl text-foreground font-bold">{t(copy.nominateTitle)}</h2>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
              {t(copy.nominateBody)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNominationOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 border border-ink bg-ink px-5 py-3 text-sm font-bold text-ivory transition-colors hover:bg-transparent hover:text-foreground dark:border-gold dark:bg-gold dark:text-ink dark:hover:bg-transparent dark:hover:text-gold cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-gold dark:text-ink" />
            {t(copy.nominateCta)}
          </button>
        </div>
      </section>
    </>
  );
}
