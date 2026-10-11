import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLang } from "@/i18n/LanguageProvider";
import { consoleLabel } from "@/components/console/common/consoleLabels";
import { cn } from "@/lib/utils";
import {
  Plus,
  Edit2,
  Trash2,
  Newspaper,
  Star,
  Search,
  Filter,
  CheckSquare,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  FileText,
  Clock,
  Sparkles,
  Layers,
  Loader2,
} from "lucide-react";
import type { ArticleInput, BulkArticlesActionInput } from "@/lib/admin-hub.schemas";
import { toast } from "sonner";
import { ImageUploadInput } from "@/components/console/media/ImageUploadInput";
import {
  PublishReadinessChecklist,
  type ReadinessCheckItem,
} from "@/components/console/common/PublishReadinessChecklist";
import { useConfirm } from "@/hooks/useConfirm";
import { getErrorMessage } from "@/lib/error-utils";

/**
 * `articles.slug` is validated server-side against /^[a-z0-9-]+$/i
 * (articleInputSchema in admin-hub.schemas.ts) and is the public URL segment.
 * The previous auto-slug kept Arabic letters (`[^\wء-ي\s-]`), so an
 * Arabic title produced a slug the server rejected outright — "type an Arabic
 * title, press Save" failed every time with a raw Zod message. Keep only
 * URL-safe ASCII; an all-Arabic title yields "" and the editor is asked for a
 * slug explicitly instead of being handed an invalid one.
 */
export function toArticleSlug(input: string): string {
  return toArticleSlugDraft(input).replace(/^-+|-+$/g, "");
}

/**
 * While-typing variant: same character filtering, but leading/trailing dashes
 * are kept so an editor can actually type "annual-" on the way to
 * "annual-gala". `toArticleSlug` does the final trim on submit.
 */
export function toArticleSlugDraft(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 120);
}

export type ArticleRow = {
  id: string;
  slug: string;
  title_ar: string;
  title_en?: string | null;
  excerpt_ar?: string | null;
  excerpt_en?: string | null;
  content_ar?: string | null;
  content_en?: string | null;
  featured_media_path?: string | null;
  category_id?: string | null;
  status: "draft" | "in_review" | "scheduled" | "published" | "archived";
  is_featured: boolean;
  published_at?: string | null;
  created_at: string;
  updated_at?: string;
};

export function ArticlesManager({
  articles,
  categories,
  onSaveArticle,
  onBulkAction,
}: {
  articles: ArticleRow[];
  categories: { id: string; name_ar: string; name_en?: string | null }[];
  onSaveArticle: (data: ArticleInput) => Promise<void>;
  onBulkAction?: (data: BulkArticlesActionInput) => Promise<void>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const confirm = useConfirm();

  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Dialogs
  const [editorTab, setEditorTab] = useState("arabic");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleRow | null>(null);
  const [previewArticle, setPreviewArticle] = useState<ArticleRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const [form, setForm] = useState<ArticleInput>({
    id: undefined,
    slug: "",
    title_ar: "",
    title_en: "",
    excerpt_ar: "",
    excerpt_en: "",
    content_ar: "",
    content_en: "",
    featured_media_path: "",
    category_id: null,
    status: "published",
    is_featured: false,
  });

  // Calculate live word count & reading time
  const readingStats = useMemo(() => {
    const text = (form.content_ar || "") + " " + (form.content_en || "");
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return { words, minutes };
  }, [form.content_ar, form.content_en]);

  // Demographic Statistics
  const stats = useMemo(() => {
    const total = articles.length;
    const published = articles.filter((a) => a.status === "published").length;
    const drafts = articles.filter((a) => a.status === "draft").length;
    const featured = articles.filter((a) => a.is_featured).length;
    return { total, published, drafts, featured };
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        a.title_ar.toLowerCase().includes(q) ||
        (a.title_en && a.title_en.toLowerCase().includes(q)) ||
        a.slug.toLowerCase().includes(q) ||
        (a.excerpt_ar && a.excerpt_ar.toLowerCase().includes(q));

      const matchStatus = statusFilter === "all" || a.status === statusFilter;
      const matchCategory = categoryFilter === "all" || a.category_id === categoryFilter;
      const matchFeatured =
        featuredFilter === "all" ||
        (featuredFilter === "featured" && a.is_featured) ||
        (featuredFilter === "standard" && !a.is_featured);

      return matchSearch && matchStatus && matchCategory && matchFeatured;
    });
  }, [articles, search, statusFilter, categoryFilter, featuredFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / pageSize));
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredArticles.slice(start, start + pageSize);
  }, [filteredArticles, currentPage, pageSize]);

  const handleOpenAdd = () => {
    setSelectedArticle(null);
    setForm({
      id: undefined,
      slug: "",
      title_ar: "",
      title_en: "",
      excerpt_ar: "",
      excerpt_en: "",
      content_ar: "",
      content_en: "",
      featured_media_path: "",
      category_id: null,
      status: "published",
      is_featured: false,
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (art: ArticleRow) => {
    setSelectedArticle(art);
    setForm({
      id: art.id,
      slug: art.slug,
      title_ar: art.title_ar,
      title_en: art.title_en ?? "",
      excerpt_ar: art.excerpt_ar ?? "",
      excerpt_en: art.excerpt_en ?? "",
      content_ar: art.content_ar ?? "",
      content_en: art.content_en ?? "",
      featured_media_path: art.featured_media_path ?? "",
      category_id: art.category_id ?? null,
      status: art.status,
      is_featured: art.is_featured,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // The Slug/Status fields live on the "publishing" tab, which Radix
    // unmounts while another tab is active — so the browser's `required`
    // validation never fires for them and the old `return` here failed
    // silently. Validate explicitly and send the editor to the offending tab.
    if (!form.title_ar.trim()) {
      setEditorTab("arabic");
      toast.error(isAr ? "عنوان المقال بالعربية مطلوب" : "The Arabic title is required");
      return;
    }
    const slug = toArticleSlug(form.slug);
    if (!slug) {
      setEditorTab("publishing");
      toast.error(
        isAr
          ? "أدخل معرّفاً للرابط (Slug) بأحرف إنجليزية صغيرة وأرقام وشرطات فقط."
          : "Enter a URL slug using lowercase Latin letters, numbers and dashes only.",
      );
      return;
    }

    try {
      setLoading(true);
      await onSaveArticle({ ...form, slug });
      setFormOpen(false);
      toast.success(isAr ? "تم حفظ المقال بنجاح" : "Article saved successfully");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, isAr ? "فشل حفظ المقال" : "Failed to save"));
    } finally {
      setLoading(false);
    }
  };

  const readinessChecks = useMemo<ReadinessCheckItem[]>(() => {
    const slugValid = Boolean(form.slug && /^[a-z0-9-]+$/i.test(form.slug));
    const titleArValid = Boolean(form.title_ar?.trim());
    const contentArValid = Boolean(form.content_ar && form.content_ar.trim().length >= 20);
    const categoryValid = Boolean(form.category_id);
    const coverImageValid = Boolean(form.featured_media_path);
    const englishComplete = Boolean(form.title_en?.trim() && form.content_en?.trim());

    return [
      {
        id: "title_ar",
        label_ar: "عنوان المقال بالعربية",
        label_en: "Arabic Article Title",
        passed: titleArValid,
        required: true,
        hint_ar: "يجب تحديد عنوان واضح للمقال بالعربية",
        hint_en: "Clear Arabic title is required",
        onFix: () => setEditorTab("arabic"),
      },
      {
        id: "slug",
        label_ar: "معرف الرابط الدائم (Slug)",
        label_en: "URL Slug (ASCII)",
        passed: slugValid,
        required: true,
        hint_ar: "يجب أن يتكون من أحرف إنجليزية صغيرة وأرقام وشرطات فقط",
        hint_en: "Must be lowercase Latin letters, numbers, and hyphens",
        onFix: () => setEditorTab("publishing"),
      },
      {
        id: "category",
        label_ar: "تصنيف المقال",
        label_en: "Article Category",
        passed: categoryValid,
        required: true,
        hint_ar: "اختر تصنيفاً مناسباً للمقال",
        hint_en: "Select a valid category for the article",
        onFix: () => setEditorTab("publishing"),
      },
      {
        id: "content_ar",
        label_ar: "نص المقال الكامل (العربية)",
        label_en: "Full Article Content (AR)",
        passed: contentArValid,
        required: true,
        hint_ar: "يجب ألا يقل نص المقال عن 20 حرفاً",
        hint_en: "Must contain at least 20 characters of body text",
        onFix: () => setEditorTab("arabic"),
      },
      {
        id: "cover_image",
        label_ar: "الصورة البارزة للغلاف",
        label_en: "Featured Cover Image",
        passed: coverImageValid,
        required: false,
        hint_ar: "يُفضل إضافة صورة غلاف بارزة للمقال من المكتبة",
        hint_en: "Recommended: Add a cover photo from Media Library",
        onFix: () => setEditorTab("publishing"),
      },
      {
        id: "english_content",
        label_ar: "الترجمة الإنجليزية (اختياري)",
        label_en: "English Translation (Optional)",
        passed: englishComplete,
        required: false,
        hint_ar: "إضافة العنوان والمحتوى بالإنجليزية للموقع ثنائي اللغة",
        hint_en: "Provide English title and body for bilingual coverage",
        onFix: () => setEditorTab("english"),
      },
    ];
  }, [form]);

  const handleDirectPublish = async () => {
    if (!form.title_ar.trim()) {
      setEditorTab("arabic");
      toast.error(isAr ? "عنوان المقال بالعربية مطلوب" : "Arabic title is required");
      return;
    }
    const slug = toArticleSlug(form.slug);
    if (!slug) {
      setEditorTab("publishing");
      toast.error(isAr ? "معرف الرابط غير صالح" : "Invalid slug");
      return;
    }
    try {
      setLoading(true);
      await onSaveArticle({
        ...form,
        slug,
        status: "published",
        published_at: form.published_at || new Date().toISOString(),
      });
      setFormOpen(false);
      toast.success(
        isAr ? "تم اعتماد ونشر المقال بنجاح" : "Article approved & published successfully",
      );
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, isAr ? "فشل نشر المقال" : "Failed to publish"));
    } finally {
      setLoading(false);
    }
  };

  /**
   * The three bulk buttons previously used `try { … } finally { … }` with no
   * `catch`: a rejected bulk call skipped the success toast and surfaced as an
   * unhandled promise rejection, so a failed bulk publish/delete looked
   * identical to one that silently did nothing.
   */
  const runBulk = async (action: BulkArticlesActionInput["action"], successMessage: string) => {
    if (!onBulkAction) return;
    setBulkLoading(true);
    try {
      await onBulkAction({ ids: selectedIds, action });
      setSelectedIds([]);
      toast.success(successMessage);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, isAr ? "فشل تنفيذ الإجراء الجماعي" : "Bulk action failed"));
    } finally {
      setBulkLoading(false);
    }
  };

  const handleToggleFeatured = async (art: ArticleRow) => {
    try {
      await onSaveArticle({
        id: art.id,
        slug: art.slug,
        title_ar: art.title_ar,
        title_en: art.title_en ?? undefined,
        excerpt_ar: art.excerpt_ar ?? undefined,
        excerpt_en: art.excerpt_en ?? undefined,
        content_ar: art.content_ar ?? undefined,
        content_en: art.content_en ?? undefined,
        featured_media_path: art.featured_media_path ?? undefined,
        category_id: art.category_id ?? null,
        status: art.status,
        is_featured: !art.is_featured,
      });
      toast.success(isAr ? "تم تحديث تمييز المقال" : "Featured status updated");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, isAr ? "فشل التحديث" : "Failed to update"));
    }
  };

  return (
    <div className="space-y-4">
      {/* Older news items live in the secretariat content console (news_posts).
          The public Media Center shows both lists together, so point editors at it. */}
      <p className="rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
        {isAr
          ? "هذه القائمة هي المقالات الحالية. الأخبار المنشورة سابقاً من منصة المحتوى تظهر في المركز الإعلامي بجانبها، وتُعدَّل من "
          : "These are the current articles. News posted earlier from the content console appears beside them in the Media Center and is edited in the "}
        <a href="/content" className="font-semibold text-primary underline">
          {isAr ? "منصة المحتوى" : "content console"}
        </a>
        .
      </p>

      {/* 1. SUMMARY STATS BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl border border-border bg-card">
          <span className="text-[11px] text-muted-foreground block font-medium">
            {isAr ? "إجمالي المقالات" : "Total Articles"}
          </span>
          <span className="text-xl font-bold font-mono text-foreground mt-0.5 block">
            {stats.total}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-medium">
            {isAr ? "منشور ومتاح" : "Published"}
          </span>
          <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
            {stats.published}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/5">
          <span className="text-[11px] text-amber-600 dark:text-amber-400 block font-medium">
            {isAr ? "مسودات قيد الإعداد" : "Drafts"}
          </span>
          <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5 block">
            {stats.drafts}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl border border-purple-500/20 bg-purple-500/5">
          <span className="text-[11px] text-purple-600 dark:text-purple-400 block font-medium">
            {isAr ? "مقالات مميزة" : "Featured"}
          </span>
          <span className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-0.5 block">
            {stats.featured}
          </span>
        </div>
      </div>

      {/* 2. SEARCH & FILTER TOOLBAR WITH STATUS TABS */}
      <div className="flex flex-col gap-3 bg-card p-4 rounded-2xl border border-border">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-border/40">
          {[
            { id: "all", label_ar: "جميع المقالات", label_en: "All", count: stats.total },
            {
              id: "published",
              label_ar: "المنشورة والمتاحة",
              label_en: "Published",
              count: stats.published,
            },
            {
              id: "draft",
              label_ar: "المسودات",
              label_en: "Drafts",
              count: stats.drafts,
              isAlert: true,
            },
            {
              id: "in_review",
              label_ar: "قيد المراجعة",
              label_en: "In Review",
              count: articles.filter((a) => a.status === "in_review").length,
            },
            {
              id: "scheduled",
              label_ar: "مجدولة للنشر",
              label_en: "Scheduled",
              count: articles.filter((a) => a.status === "scheduled").length,
            },
            {
              id: "archived",
              label_ar: "المؤرشفة",
              label_en: "Archived",
              count: articles.filter((a) => a.status === "archived").length,
            },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={statusFilter === tab.id ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-8 text-xs gap-1.5 rounded-lg font-medium",
                statusFilter !== tab.id &&
                  tab.isAlert &&
                  tab.count > 0 &&
                  "border-amber-500/40 text-amber-600 bg-amber-500/5 hover:bg-amber-500/10",
              )}
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
            >
              <span>{isAr ? tab.label_ar : tab.label_en}</span>
              <Badge
                variant={statusFilter === tab.id ? "secondary" : "outline"}
                className={cn(
                  "h-4 px-1.5 text-[9px] font-mono",
                  tab.isAlert && tab.count > 0 && "bg-amber-500 text-white font-bold",
                )}
              >
                {tab.count}
              </Badge>
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={
                isAr ? "بحث في عناوين المقالات، المقتطفات، والمعرف..." : "Search articles..."
              }
              className="ps-9 h-9 text-xs rounded-xl"
            />
          </div>

          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="h-9 text-xs gap-1.5 font-bold rounded-xl bg-primary text-primary-foreground"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? "كتابة مقال جديد" : "New Article"}</span>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
          <Select
            value={categoryFilter}
            onValueChange={(val) => {
              setCategoryFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[130px] text-xs rounded-lg">
              <SelectValue placeholder={isAr ? "التصنيف" : "Category"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isAr ? "كل التصنيفات" : "All Categories"}</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {isAr ? c.name_ar : c.name_en || c.name_ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={featuredFilter}
            onValueChange={(val) => {
              setFeaturedFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[110px] text-xs rounded-lg">
              <SelectValue placeholder={isAr ? "التمييز" : "Featured"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isAr ? "الكل" : "All"}</SelectItem>
              <SelectItem value="featured">{isAr ? "مميز فقط" : "Featured"}</SelectItem>
              <SelectItem value="standard">{isAr ? "عادي" : "Standard"}</SelectItem>
            </SelectContent>
          </Select>

          {(search ||
            statusFilter !== "all" ||
            categoryFilter !== "all" ||
            featuredFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setCategoryFilter("all");
                setFeaturedFilter("all");
                setCurrentPage(1);
              }}
            >
              <X className="w-3 h-3 me-1" />
              {isAr ? "إعادة ضبط" : "Reset"}
            </Button>
          )}

          <div className="ms-auto text-xs text-muted-foreground font-mono">
            {isAr
              ? `النتائج: ${filteredArticles.length} من أصل ${articles.length}`
              : `${filteredArticles.length} of ${articles.length}`}
          </div>
        </div>
      </div>

      {/* 3. BULK ACTIONS TOOLBAR */}
      {selectedIds.length > 0 && onBulkAction && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-primary/10 border border-primary/30 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground">
              {isAr
                ? `تم تحديد ${selectedIds.length} مقال`
                : `${selectedIds.length} articles selected`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs rounded-lg"
              disabled={bulkLoading}
              onClick={() =>
                runBulk("published", isAr ? "تم نشر المقالات المحددة" : "Articles published")
              }
            >
              {bulkLoading && <Loader2 className="w-3.5 h-3.5 me-1 animate-spin" />}
              {isAr ? "نشر المحدد" : "Publish Selected"}
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs rounded-lg"
              disabled={bulkLoading}
              onClick={() =>
                runBulk("draft", isAr ? "تم تحويل المحدد إلى مسودات" : "Articles set to draft")
              }
            >
              {bulkLoading && <Loader2 className="w-3.5 h-3.5 me-1 animate-spin" />}
              {isAr ? "تحويل لمسودة" : "Draft Selected"}
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs rounded-lg text-destructive hover:bg-destructive/10"
              disabled={bulkLoading}
              onClick={async () => {
                const count = selectedIds.length;
                const ok = await confirm({
                  title: isAr
                    ? `حذف ${count} ${count === 1 ? "مقال" : "مقالات"}؟`
                    : `Delete ${count} article${count === 1 ? "" : "s"}?`,
                  // bulkArticlesAction("delete") sets `deleted_at` rather than
                  // dropping the row, so the old "permanently deleted" copy
                  // overstated it: the article leaves this console and the
                  // public site, but the record survives in the database.
                  description: isAr
                    ? "سيتم سحب المقالات المحددة من الموقع ومن هذه القائمة. يبقى السجل محفوظاً في قاعدة البيانات ويمكن للأمانة استرجاعه."
                    : "The selected articles will be removed from the site and from this list. The records stay in the database and the secretariat can restore them.",
                  tone: "destructive",
                });
                if (!ok) return;
                await runBulk("delete", isAr ? "تم حذف المقالات" : "Articles deleted");
              }}
            >
              {bulkLoading ? (
                <Loader2 className="w-3.5 h-3.5 me-1 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5 me-1" />
              )}
              {isAr ? "حذف المحدد" : "Delete"}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs rounded-lg"
              onClick={() => setSelectedIds([])}
            >
              <X className="w-3.5 h-3.5 me-1" />
              {isAr ? "إلغاء التحديد" : "Deselect"}
            </Button>
          </div>
        </div>
      )}

      {/* 4. ARTICLES TABLE */}
      <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs hover:bg-muted/40">
              <TableHead className="w-[44px] text-center">
                <Checkbox
                  checked={
                    paginatedArticles.length > 0 &&
                    paginatedArticles.every((a) => selectedIds.includes(a.id))
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      const newIds = Array.from(
                        new Set([...selectedIds, ...paginatedArticles.map((a) => a.id)]),
                      );
                      setSelectedIds(newIds);
                    } else {
                      const pageIds = paginatedArticles.map((a) => a.id);
                      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
                    }
                  }}
                />
              </TableHead>
              <TableHead className="w-[40px] text-center">{isAr ? "تمييز" : "Star"}</TableHead>
              <TableHead>{isAr ? "عنوان المقال" : "Title"}</TableHead>
              <TableHead>{isAr ? "التصنيف" : "Category"}</TableHead>
              <TableHead className="text-center">{isAr ? "المعرف (Slug)" : "Slug"}</TableHead>
              <TableHead className="text-center">{isAr ? "الحالة" : "Status"}</TableHead>
              <TableHead className="text-end">{isAr ? "إجراءات" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedArticles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-xs">
                  {isAr ? "لا توجد مقالات منشورة تطابق معايير البحث" : "No articles found"}
                </TableCell>
              </TableRow>
            ) : (
              paginatedArticles.map((a) => (
                <TableRow key={a.id} className="text-xs hover:bg-muted/30 transition-colors">
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedIds.includes(a.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedIds((prev) => [...prev, a.id]);
                        } else {
                          setSelectedIds((prev) => prev.filter((id) => id !== a.id));
                        }
                      }}
                    />
                  </TableCell>

                  {/* 1-Click Feature Toggle */}
                  <TableCell className="text-center">
                    <button
                      onClick={() => handleToggleFeatured(a)}
                      className="text-muted-foreground/50 hover:text-amber-500 transition-colors p-1"
                      title={isAr ? "تبديل التمييز" : "Toggle Featured"}
                    >
                      <Star
                        className={`w-4 h-4 ${a.is_featured ? "text-amber-500 fill-amber-500" : ""}`}
                      />
                    </button>
                  </TableCell>

                  <TableCell className="font-semibold text-foreground">
                    <div className="flex items-center gap-3">
                      {a.featured_media_path ? (
                        <div className="w-10 h-10 rounded-lg border border-border overflow-hidden shrink-0 bg-muted/30">
                          <img
                            src={a.featured_media_path}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg border border-dashed border-border flex items-center justify-center shrink-0 bg-muted/20 text-muted-foreground/50">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold truncate">{a.title_ar}</span>
                        {a.title_en && (
                          <span className="text-[11px] text-muted-foreground truncate">
                            {a.title_en}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {categories.find((c) => c.id === a.category_id)?.name_ar ||
                        (isAr ? "عام" : "General")}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center font-mono text-muted-foreground text-[11px]">
                    {a.slug}
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge
                      variant={
                        a.status === "published"
                          ? "default"
                          : a.status === "draft"
                            ? "secondary"
                            : a.status === "in_review"
                              ? "outline"
                              : a.status === "scheduled"
                                ? "outline"
                                : "destructive"
                      }
                      className={cn(
                        "text-[10px]",
                        a.status === "scheduled" &&
                          "border-sky-500/40 text-sky-600 bg-sky-500/10 dark:text-sky-400",
                      )}
                    >
                      {consoleLabel(a.status, isAr)}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-1.5">
                      {a.status !== "published" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/30 px-2 font-medium"
                          disabled={publishingId === a.id}
                          onClick={async () => {
                            if (!a.title_ar?.trim() || !a.slug) {
                              toast.error(
                                isAr
                                  ? "المقال غير مكتمل المتطلبات للنشر. يرجى فتح المقال واستكمال الحقول الإلزامية."
                                  : "Article is missing required fields. Please edit to complete them before publishing.",
                              );
                              return;
                            }
                            setPublishingId(a.id);
                            try {
                              await onSaveArticle({
                                id: a.id,
                                slug: a.slug,
                                title_ar: a.title_ar,
                                title_en: a.title_en ?? undefined,
                                excerpt_ar: a.excerpt_ar ?? undefined,
                                excerpt_en: a.excerpt_en ?? undefined,
                                content_ar: a.content_ar ?? undefined,
                                content_en: a.content_en ?? undefined,
                                featured_media_path: a.featured_media_path ?? undefined,
                                category_id: a.category_id ?? null,
                                status: "published",
                                is_featured: a.is_featured,
                              });
                              toast.success(
                                isAr
                                  ? "تم نشر المقال بنجاح وإتاحته للعموم"
                                  : "Article published successfully",
                              );
                            } catch (err: unknown) {
                              toast.error(
                                getErrorMessage(err, isAr ? "فشل النشر" : "Failed to publish"),
                              );
                            } finally {
                              setPublishingId(null);
                            }
                          }}
                          title={isAr ? "نشر المقال فوراً" : "Quick Publish"}
                        >
                          {publishingId === a.id ? (
                            <Loader2 className="w-3 h-3 me-1 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3 me-1" />
                          )}
                          {isAr ? "نشر" : "Publish"}
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-muted-foreground hover:text-foreground"
                        title={isAr ? "معاينة" : "Preview"}
                        onClick={() => setPreviewArticle(a)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-muted-foreground hover:text-foreground"
                        title={isAr ? "تعديل" : "Edit"}
                        onClick={() => handleOpenEdit(a)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="p-3.5 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{isAr ? "صفوف بالصفحة:" : "Rows per page:"}</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-7 w-[70px] text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>

            <span className="ms-2">
              {isAr
                ? `عرض ${(currentPage - 1) * pageSize + 1} إلى ${Math.min(currentPage * pageSize, filteredArticles.length)} من أصل ${filteredArticles.length}`
                : `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, filteredArticles.length)} of ${filteredArticles.length}`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="w-7 h-7"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              <ChevronsLeft className="w-3.5 h-3.5 rtl:rotate-180" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="w-7 h-7"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
            </Button>

            <span className="px-3 py-1 text-xs font-mono font-semibold text-foreground">
              {currentPage} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="icon"
              className="w-7 h-7"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="w-7 h-7"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              <ChevronsRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </div>

      {/* 5. TABBED ARTICLE EDITOR MODAL */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center justify-between">
              <span>
                {selectedArticle
                  ? isAr
                    ? "تعديل مقال"
                    : "Edit Article"
                  : isAr
                    ? "كتابة مقال جديد"
                    : "Write Article"}
              </span>
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {readingStats.minutes} {isAr ? "دقيقة قراءة" : "min read"}
                </span>
                <span>
                  ({readingStats.words} {isAr ? "كلمة" : "words"})
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <Tabs value={editorTab} onValueChange={setEditorTab} className="w-full">
              <TabsList className="grid grid-cols-3 w-full mb-4">
                <TabsTrigger value="arabic" className="text-xs">
                  {isAr ? "المحتوى بالعربية" : "Arabic Content"}
                </TabsTrigger>
                <TabsTrigger value="english" className="text-xs">
                  {isAr ? "English Content" : "English Content"}
                </TabsTrigger>
                <TabsTrigger value="publishing" className="text-xs">
                  {isAr ? "الوسائط والنشر والـ SEO" : "Media & SEO"}
                </TabsTrigger>
              </TabsList>

              {/* Arabic Content */}
              <TabsContent value="arabic" className="space-y-3.5">
                <div className="space-y-1">
                  <Label className="text-xs">
                    {isAr ? "عنوان المقال بالعربية *" : "Title (AR) *"}
                  </Label>
                  <Input
                    required
                    value={form.title_ar}
                    onChange={(e) => {
                      const title = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        title_ar: title,
                        // Only auto-fills while the slug is still empty; an
                        // Arabic-only title yields "" so the editor is asked
                        // for a real URL slug rather than handed an invalid one.
                        slug: prev.slug || toArticleSlug(title),
                      }));
                    }}
                    placeholder="مثال: اختتام فعاليات الملتقى السنوي لأسرة آل بوعبيد"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">
                    {isAr ? "المقتطف التمهيدي (AR)" : "Excerpt (AR)"}
                  </Label>
                  <Textarea
                    rows={2}
                    value={form.excerpt_ar ?? ""}
                    onChange={(e) => setForm({ ...form, excerpt_ar: e.target.value })}
                    placeholder="موجز يظهر في بطاقات الأخبار ومحركات البحث..."
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">
                    {isAr ? "المحتوى الكامل للمقال (AR) *" : "Full Article Content (AR) *"}
                  </Label>
                  <Textarea
                    required
                    rows={8}
                    value={form.content_ar ?? ""}
                    onChange={(e) => setForm({ ...form, content_ar: e.target.value })}
                    placeholder="نص المقال والبيان الصحفي..."
                  />
                </div>
              </TabsContent>

              {/* English Content */}
              <TabsContent value="english" className="space-y-3.5">
                <div className="space-y-1">
                  <Label className="text-xs">{isAr ? "العنوان بالإنجليزية" : "Title (EN)"}</Label>
                  <Input
                    value={form.title_en ?? ""}
                    onChange={(e) => {
                      const titleEn = e.target.value;
                      // An Arabic-only AR title can't produce a URL slug, so
                      // the English title is the next-best source while the
                      // slug is still empty.
                      setForm((prev) => ({
                        ...prev,
                        title_en: titleEn,
                        slug: prev.slug || toArticleSlug(titleEn),
                      }));
                    }}
                    placeholder="e.g. Annual Family Council Gathering 2026 Concludes"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">{isAr ? "المقتطف (EN)" : "Excerpt (EN)"}</Label>
                  <Textarea
                    rows={2}
                    value={form.excerpt_en ?? ""}
                    onChange={(e) => setForm({ ...form, excerpt_en: e.target.value })}
                    placeholder="Brief teaser for English readers..."
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">
                    {isAr ? "المحتوى الكامل (EN)" : "Full Content (EN)"}
                  </Label>
                  <Textarea
                    rows={8}
                    value={form.content_en ?? ""}
                    onChange={(e) => setForm({ ...form, content_en: e.target.value })}
                    placeholder="Full article text in English..."
                  />
                </div>
              </TabsContent>

              {/* Publishing & Media */}
              <TabsContent value="publishing" className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">
                      {isAr ? "المعرف الفريد للرابط (Slug) *" : "Slug *"}
                    </Label>
                    <Input
                      required
                      dir="ltr"
                      value={form.slug}
                      onChange={(e) =>
                        setForm({ ...form, slug: toArticleSlugDraft(e.target.value) })
                      }
                      placeholder="annual-honours-gala-1447"
                      className="font-mono"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {isAr
                        ? "يظهر في رابط المقال: /news/… — أحرف إنجليزية صغيرة وأرقام وشرطات فقط."
                        : "Used in the article URL (/news/…) — lowercase Latin letters, numbers and dashes only."}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">{isAr ? "التصنيف" : "Category"}</Label>
                    <Select
                      value={form.category_id ?? "none"}
                      onValueChange={(val) =>
                        setForm({ ...form, category_id: val === "none" ? null : val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isAr ? "اختر التصنيف" : "Select category"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{isAr ? "— بدون تصنيف —" : "— None —"}</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {isAr ? c.name_ar : c.name_en || c.name_ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{isAr ? "حالة النشر" : "Status"}</Label>
                    <Select
                      value={form.status}
                      onValueChange={(val: any) => setForm({ ...form, status: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="published">
                          {isAr ? "منشور (Published)" : "Published"}
                        </SelectItem>
                        <SelectItem value="draft">{isAr ? "مسودة (Draft)" : "Draft"}</SelectItem>
                        <SelectItem value="in_review">
                          {isAr ? "قيد المراجعة" : "In Review"}
                        </SelectItem>
                        <SelectItem value="scheduled">
                          {isAr ? "مجدول للنشر" : "Scheduled"}
                        </SelectItem>
                        <SelectItem value="archived">{isAr ? "مؤرشف" : "Archived"}</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.status === "scheduled" && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 leading-relaxed">
                        {isAr
                          ? "تنبيه: لا يوجد نشر تلقائي في الوقت الحالي — المقال المجدول يبقى مخفياً عن الزوار حتى يُنشر يدوياً من زر «نشر»."
                          : "Note: automatic publishing isn't wired up yet — a scheduled article stays hidden from visitors until someone publishes it manually with the Publish button."}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs font-semibold">
                      {isAr ? "الصورة البارزة للمقال" : "Featured Article Cover Image"}
                    </Label>
                    <ImageUploadInput
                      bucket="site-media"
                      value={form.featured_media_path}
                      onChange={(url) => setForm({ ...form, featured_media_path: url })}
                      placeholder={
                        isAr ? "رابط الصورة أو ارفع صورة المقال..." : "Image URL or upload..."
                      }
                      helperText={
                        isAr
                          ? "الصورة التي ستظهر أعلى المقال وفي بطاقة الخبر على الموقع"
                          : "Cover image shown in news cards and article header"
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-xl bg-muted/20">
                  <div>
                    <p className="font-semibold text-foreground">
                      {isAr ? "مقال مميز (Featured)" : "Featured Article"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {isAr
                        ? "يظهر في الواجهة الرئيسية للأخبار"
                        : "Showcase in homepage media rail"}
                    </p>
                  </div>
                  <Switch
                    checked={form.is_featured}
                    onCheckedChange={(checked) => setForm({ ...form, is_featured: checked })}
                  />
                </div>

                {/* Pre-Publish Readiness Checklist */}
                <PublishReadinessChecklist
                  checks={readinessChecks}
                  onPublish={handleDirectPublish}
                  isPublishing={loading}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" size="sm" onClick={() => setFormOpen(false)}>
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
                {loading
                  ? isAr
                    ? "جاري الحفظ..."
                    : "Saving..."
                  : isAr
                    ? "حفظ المقال"
                    : "Save Article"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. ARTICLE PREVIEW MODAL */}
      {previewArticle && (
        <Dialog open={!!previewArticle} onOpenChange={() => setPreviewArticle(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">{previewArticle.title_ar}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-xs pt-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    previewArticle.status === "published"
                      ? "default"
                      : previewArticle.status === "scheduled"
                        ? "outline"
                        : "secondary"
                  }
                  className={cn(
                    previewArticle.status === "scheduled" &&
                      "border-sky-500/40 text-sky-600 bg-sky-500/10 dark:text-sky-400",
                  )}
                >
                  {consoleLabel(previewArticle.status, isAr)}
                </Badge>
                {previewArticle.is_featured && (
                  <Badge variant="outline" className="border-amber-500/30 text-amber-600">
                    <Star className="w-3 h-3 me-1 fill-amber-500" />
                    {isAr ? "مقال مميز" : "Featured"}
                  </Badge>
                )}
                <span className="text-muted-foreground font-mono ms-auto">
                  /{previewArticle.slug}
                </span>
              </div>

              {previewArticle.featured_media_path && (
                <div className="h-48 rounded-xl overflow-hidden border border-border">
                  <img
                    src={previewArticle.featured_media_path}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {previewArticle.excerpt_ar && (
                <p className="text-sm font-semibold text-foreground bg-muted/30 p-3 rounded-xl border border-border/50">
                  {previewArticle.excerpt_ar}
                </p>
              )}

              <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                {previewArticle.content_ar}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const a = previewArticle;
                  setPreviewArticle(null);
                  handleOpenEdit(a);
                }}
              >
                <Edit2 className="w-3.5 h-3.5 me-1.5" />
                {isAr ? "تعديل" : "Edit"}
              </Button>
              <Button size="sm" onClick={() => setPreviewArticle(null)}>
                {isAr ? "إغلاق" : "Close"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
