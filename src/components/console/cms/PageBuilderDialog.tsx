import { formatDualDateTime } from "@/lib/dates";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLang } from "@/i18n/LanguageProvider";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/useConfirm";
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Settings,
  Eye,
  Layers,
  Sparkles,
  FileCode,
  History,
  RotateCcw,
} from "lucide-react";
import { BLOCK_DEFINITIONS, type BlockType } from "./BlockRegistry";
import { ImageUploadInput } from "@/components/console/media/ImageUploadInput";
import type { ContentPageInput, ContentSectionInput } from "@/lib/admin-hub.schemas";
import {
  listGalleriesForEditor,
  listPageRevisions,
  restorePageRevision,
  type PageRevisionSummary,
} from "@/lib/cms.functions";
import { slugify } from "@/lib/slugify";

export function PageBuilderDialog({
  open,
  onOpenChange,
  initialData,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<ContentPageInput> | null;
  onSave: (data: ContentPageInput) => Promise<void>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("builder");
  const [selectedBlockIdx, setSelectedBlockIdx] = useState<number | null>(null);
  const [galleries, setGalleries] = useState<
    { id: string; title_ar: string; title_en: string | null }[]
  >([]);
  const [revisions, setRevisions] = useState<PageRevisionSummary[]>([]);
  const [revisionsLoading, setRevisionsLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const fetchGalleries = useServerFn(listGalleriesForEditor);
  const fetchRevisions = useServerFn(listPageRevisions);
  const runRestoreRevision = useServerFn(restorePageRevision);

  const [form, setForm] = useState<ContentPageInput>({
    id: undefined,
    slug: "",
    slug_ar: "",
    title_ar: "",
    title_en: "",
    excerpt_ar: "",
    excerpt_en: "",
    featured_media_path: "",
    status: "draft",
    visibility: "public",
    template: "default",
    seo_title_ar: "",
    seo_title_en: "",
    seo_description_ar: "",
    seo_description_en: "",
    canonical_url: "",
    no_index: false,
    sections: [],
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        id: initialData.id,
        slug: initialData.slug ?? "",
        slug_ar: initialData.slug_ar ?? "",
        title_ar: initialData.title_ar ?? "",
        title_en: initialData.title_en ?? "",
        excerpt_ar: initialData.excerpt_ar ?? "",
        excerpt_en: initialData.excerpt_en ?? "",
        featured_media_path: initialData.featured_media_path ?? "",
        status: initialData.status ?? "draft",
        visibility: initialData.visibility ?? "public",
        template: initialData.template ?? "default",
        seo_title_ar: initialData.seo_title_ar ?? "",
        seo_title_en: initialData.seo_title_en ?? "",
        seo_description_ar: initialData.seo_description_ar ?? "",
        seo_description_en: initialData.seo_description_en ?? "",
        canonical_url: initialData.canonical_url ?? "",
        no_index: initialData.no_index ?? false,
        sections: initialData.sections ?? [],
      });
    } else {
      setForm({
        id: undefined,
        slug: "",
        slug_ar: "",
        title_ar: "",
        title_en: "",
        excerpt_ar: "",
        excerpt_en: "",
        featured_media_path: "",
        status: "draft",
        visibility: "public",
        template: "default",
        seo_title_ar: "",
        seo_title_en: "",
        seo_description_ar: "",
        seo_description_en: "",
        canonical_url: "",
        no_index: false,
        sections: [
          {
            type: "hero",
            sort_order: 0,
            data: BLOCK_DEFINITIONS.hero.defaultData,
            settings: {},
            visibility: "public",
          },
          {
            type: "rich_text",
            sort_order: 1,
            data: BLOCK_DEFINITIONS.rich_text.defaultData,
            settings: {},
            visibility: "public",
          },
        ],
      });
    }
  }, [initialData, open]);

  // Gallery block editor needs a picker list; fetched once whenever the
  // dialog opens (cheap, editor-only — see listGalleriesForEditor).
  useEffect(() => {
    if (!open) return;
    fetchGalleries()
      .then((rows) => setGalleries(rows ?? []))
      .catch(() => setGalleries([]));
  }, [open]);

  const loadRevisions = () => {
    if (!initialData?.id) return;
    setRevisionsLoading(true);
    fetchRevisions({ data: { page_id: initialData.id } })
      .then((rows) => setRevisions(rows ?? []))
      .catch(() => setRevisions([]))
      .finally(() => setRevisionsLoading(false));
  };

  // Revision history only exists for a page that's already been saved once.
  useEffect(() => {
    if (!open || !initialData?.id) {
      setRevisions([]);
      return;
    }
    loadRevisions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData?.id]);

  const handleRestoreRevision = async (revisionId: string) => {
    setRestoringId(revisionId);
    try {
      const result = await runRestoreRevision({ data: { revision_id: revisionId } });
      if (!result.ok) {
        toast.error(isAr ? "تعذّرت استعادة هذا الإصدار" : "Failed to restore this version");
        return;
      }
      const restoredSections: ContentSectionInput[] = result.sections
        .slice()
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((s: any) => ({
          type: s.type,
          sort_order: s.sort_order,
          data: s.data ?? {},
          settings: s.settings ?? {},
          visibility: s.visibility ?? "public",
        }));
      setForm((prev) => ({ ...prev, sections: restoredSections }));
      setSelectedBlockIdx(null);
      toast.success(isAr ? "تمت استعادة الإصدار بنجاح" : "Version restored successfully");
      loadRevisions();
      setActiveTab("builder");
    } catch (err: any) {
      toast.error(
        err?.message || (isAr ? "تعذّرت استعادة هذا الإصدار" : "Failed to restore this version"),
      );
    } finally {
      setRestoringId(null);
    }
  };

  const updateNestedArrayItem = (
    idx: number,
    key: string,
    itemIdx: number,
    patch: Record<string, any>,
  ) => {
    const next = [...sections];
    const arr = [...((next[idx].data as any)?.[key] ?? [])];
    arr[itemIdx] = { ...arr[itemIdx], ...patch };
    next[idx] = { ...next[idx], data: { ...next[idx].data, [key]: arr } };
    setForm((prev) => ({ ...prev, sections: next }));
  };

  const addNestedArrayItem = (idx: number, key: string, template: Record<string, any>) => {
    const next = [...sections];
    const arr = [...((next[idx].data as any)?.[key] ?? []), template];
    next[idx] = { ...next[idx], data: { ...next[idx].data, [key]: arr } };
    setForm((prev) => ({ ...prev, sections: next }));
  };

  const removeNestedArrayItem = (idx: number, key: string, itemIdx: number) => {
    const next = [...sections];
    const arr = ((next[idx].data as any)?.[key] ?? []).filter((_: any, i: number) => i !== itemIdx);
    next[idx] = { ...next[idx], data: { ...next[idx].data, [key]: arr } };
    setForm((prev) => ({ ...prev, sections: next }));
  };

  const handleAddBlock = (type: BlockType) => {
    const def = BLOCK_DEFINITIONS[type];
    const newSection: ContentSectionInput = {
      type,
      sort_order: form.sections?.length ?? 0,
      data: { ...def.defaultData },
      settings: {},
      visibility: "public",
    };
    setForm((prev) => ({
      ...prev,
      sections: [...(prev.sections ?? []), newSection],
    }));
    setSelectedBlockIdx(form.sections?.length ?? 0);
  };

  const handleMoveBlock = (idx: number, dir: "up" | "down") => {
    if (!form.sections) return;
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= form.sections.length) return;

    const copy = [...form.sections];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);
    setForm((prev) => ({ ...prev, sections: copy }));
    setSelectedBlockIdx(targetIdx);
  };

  const handleDeleteBlock = async (idx: number) => {
    if (!form.sections) return;
    const sec = form.sections[idx];
    const def = BLOCK_DEFINITIONS[sec.type as BlockType] || BLOCK_DEFINITIONS.rich_text;
    const label = isAr ? def.label_ar : def.label_en;
    const ok = await confirm({
      title: isAr ? `حذف قسم "${label}"؟` : `Delete "${label}" block?`,
      description: isAr
        ? "سيتم حذف هذا القسم ومحتواه نهائياً من الصفحة. لا يمكن التراجع عن هذا الإجراء بعد الحفظ."
        : "This block and its content will be permanently removed from the page. This can't be undone once saved.",
      tone: "destructive",
    });
    if (!ok) return;
    const copy = form.sections.filter((_, i) => i !== idx);
    setForm((prev) => ({ ...prev, sections: copy }));
    setSelectedBlockIdx(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title_ar.trim()) return;
    if (!form.title_ar.trim()) return;
    try {
      setLoading(true);
      await onSave(form);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل حفظ الصفحة" : "Failed to save page"));
    } finally {
      setLoading(false);
    }
  };

  const sections = form.sections ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            {form.id
              ? isAr
                ? "محرر وبناء الصفحة (Page Builder)"
                : "Edit Page & Blocks"
              : isAr
                ? "إنشاء صفحة جديدة وبناء الأقسام"
                : "Create New Page & Build Blocks"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full mb-4">
              <TabsTrigger value="builder" className="text-xs gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                {isAr ? "بناء الأقسام والكتل (Blocks)" : "Block Builder"}
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs gap-1.5">
                <Settings className="w-3.5 h-3.5" />
                {isAr ? "بيانات الصفحة وSEO" : "Page Settings & SEO"}
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                {isAr ? "معاينة الصفحة" : "Live Preview"}
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs gap-1.5" disabled={!form.id}>
                <History className="w-3.5 h-3.5" />
                {isAr ? "سجل الإصدارات" : "Revision History"}
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Builder */}
            <TabsContent value="builder" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Left: Block Add Palette */}
                <div className="border border-border rounded-xl p-3 bg-muted/20 space-y-3">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-primary" />
                    {isAr ? "إضافة قسم جديد" : "Add Content Block"}
                  </h4>
                  <div className="space-y-1.5 max-h-[380px] overflow-y-auto pe-1">
                    {(Object.keys(BLOCK_DEFINITIONS) as BlockType[]).map((type) => {
                      const def = BLOCK_DEFINITIONS[type];
                      const Icon = def.icon;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleAddBlock(type)}
                          className="w-full flex items-center gap-2.5 p-2 text-start rounded-lg hover:bg-card border border-transparent hover:border-border transition-all text-xs group"
                        >
                          <div className="p-1 rounded bg-background border border-border group-hover:border-primary shrink-0">
                            <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              {isAr ? def.label_ar : def.label_en}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {isAr ? def.description_ar : def.description_en}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Center & Right: Sections List & Editor */}
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-foreground">
                      {isAr
                        ? `أقسام الصفحة الحالية (${sections.length})`
                        : `Current Page Blocks (${sections.length})`}
                    </h4>
                  </div>

                  {sections.length === 0 ? (
                    <div className="border-2 border-dashed border-border rounded-xl p-10 text-center text-xs text-muted-foreground">
                      {isAr
                        ? "لم يتم إضافة أي كتل محتوى بعد. اختر قسماً من القائمة الجانبية."
                        : "No blocks added yet. Click a block from the palette to add."}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sections.map((sec, idx) => {
                        const def =
                          BLOCK_DEFINITIONS[sec.type as BlockType] || BLOCK_DEFINITIONS.rich_text;
                        const Icon = def.icon;
                        const isSelected = selectedBlockIdx === idx;
                        // Block payloads vary by type, so `sec.data` is loosely
                        // typed (Json/Record<string, unknown>) — narrow it once
                        // here instead of casting at every field below.
                        const secData = (sec.data ?? {}) as Record<string, any>;
                        const setField = (field: string, value: any) => {
                          const next = [...sections];
                          next[idx] = { ...next[idx], data: { ...next[idx].data, [field]: value } };
                          setForm((prev) => ({ ...prev, sections: next }));
                        };

                        return (
                          <div
                            key={idx}
                            className={`border rounded-xl p-3.5 bg-card transition-all ${
                              isSelected ? "border-primary shadow-sm" : "border-border"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div
                                className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                                onClick={() => setSelectedBlockIdx(isSelected ? null : idx)}
                              >
                                <div className="p-1.5 rounded-lg bg-muted text-primary shrink-0">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 truncate">
                                  <span className="text-xs font-bold text-foreground block truncate">
                                    {isAr ? def.label_ar : def.label_en}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground font-mono">
                                    #{idx + 1} • {sec.type}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="w-7 h-7"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveBlock(idx, "up")}
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="w-7 h-7"
                                  disabled={idx === sections.length - 1}
                                  onClick={() => handleMoveBlock(idx, "down")}
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="w-7 h-7 text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDeleteBlock(idx)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>

                            {/* Block payload configuration */}
                            {isSelected && (
                              <div className="mt-3 pt-3 border-t border-border space-y-3 text-xs">
                                {sec.type === "hero" && (
                                  <>
                                    <div className="space-y-1">
                                      <Label className="text-[11px]">
                                        {isAr ? "العنوان الرئيسي" : "Title"}
                                      </Label>
                                      <Input
                                        value={secData.title_ar ?? ""}
                                        onChange={(e) => {
                                          const next = [...sections];
                                          next[idx].data = {
                                            ...next[idx].data,
                                            title_ar: e.target.value,
                                          };
                                          setForm({ ...form, sections: next });
                                        }}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[11px]">
                                        {isAr ? "النص الفرعي" : "Subtitle"}
                                      </Label>
                                      <Input
                                        value={secData.subtitle_ar ?? ""}
                                        onChange={(e) => {
                                          const next = [...sections];
                                          next[idx].data = {
                                            ...next[idx].data,
                                            subtitle_ar: e.target.value,
                                          };
                                          setForm({ ...form, sections: next });
                                        }}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[11px] font-semibold">
                                        {isAr ? "صورة خلفية القسم" : "Background Image"}
                                      </Label>
                                      <ImageUploadInput
                                        bucket="site-media"
                                        value={secData.bg_image_url}
                                        onChange={(url) => {
                                          const next = [...sections];
                                          next[idx].data = { ...next[idx].data, bg_image_url: url };
                                          setForm({ ...form, sections: next });
                                        }}
                                        placeholder={
                                          isAr
                                            ? "رابط الصورة أو ارفع صورة..."
                                            : "Image URL or upload..."
                                        }
                                      />
                                    </div>
                                  </>
                                )}

                                {sec.type === "image" && (
                                  <>
                                    <div className="space-y-1">
                                      <Label className="text-[11px] font-semibold">
                                        {isAr ? "الصورة" : "Image"}
                                      </Label>
                                      <ImageUploadInput
                                        bucket="site-media"
                                        value={secData.url}
                                        onChange={(url) => {
                                          const next = [...sections];
                                          next[idx].data = { ...next[idx].data, url };
                                          setForm({ ...form, sections: next });
                                        }}
                                        placeholder={
                                          isAr
                                            ? "رابط الصورة أو ارفع صورة..."
                                            : "Image URL or upload..."
                                        }
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[11px]">
                                        {isAr ? "التعليق التوضيحي (Caption)" : "Caption"}
                                      </Label>
                                      <Input
                                        value={secData.caption_ar ?? ""}
                                        placeholder={
                                          isAr ? "تعليق يظهر أسفل الصورة" : "Caption below image"
                                        }
                                        onChange={(e) => {
                                          const next = [...sections];
                                          next[idx].data = {
                                            ...next[idx].data,
                                            caption_ar: e.target.value,
                                          };
                                          setForm({ ...form, sections: next });
                                        }}
                                      />
                                    </div>
                                  </>
                                )}

                                {sec.type === "rich_text" && (
                                  <div className="space-y-1">
                                    <Label className="text-[11px]">
                                      {isAr ? "المحتوى النصي" : "Content Text"}
                                    </Label>
                                    <Textarea
                                      rows={4}
                                      value={secData.content_ar ?? ""}
                                      onChange={(e) => {
                                        const next = [...sections];
                                        next[idx].data = {
                                          ...next[idx].data,
                                          content_ar: e.target.value,
                                        };
                                        setForm({ ...form, sections: next });
                                      }}
                                    />
                                  </div>
                                )}

                                {sec.type === "quote" && (
                                  <>
                                    <div className="space-y-1">
                                      <Label className="text-[11px]">
                                        {isAr ? "نص الاقتباس" : "Quote Text"}
                                      </Label>
                                      <Input
                                        value={secData.quote_ar ?? ""}
                                        onChange={(e) => {
                                          const next = [...sections];
                                          next[idx].data = {
                                            ...next[idx].data,
                                            quote_ar: e.target.value,
                                          };
                                          setForm({ ...form, sections: next });
                                        }}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[11px]">
                                        {isAr ? "القائل / المصدر" : "Author"}
                                      </Label>
                                      <Input
                                        value={secData.author_ar ?? ""}
                                        onChange={(e) => {
                                          const next = [...sections];
                                          next[idx].data = {
                                            ...next[idx].data,
                                            author_ar: e.target.value,
                                          };
                                          setForm({ ...form, sections: next });
                                        }}
                                      />
                                    </div>
                                  </>
                                )}

                                {sec.type === "cta" && (
                                  <>
                                    <div className="space-y-1">
                                      <Label className="text-[11px]">
                                        {isAr ? "عنوان الإجراء" : "CTA Title"}
                                      </Label>
                                      <Input
                                        value={secData.title_ar ?? ""}
                                        onChange={(e) => {
                                          const next = [...sections];
                                          next[idx].data = {
                                            ...next[idx].data,
                                            title_ar: e.target.value,
                                          };
                                          setForm({ ...form, sections: next });
                                        }}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[11px]">
                                        {isAr ? "نص الزر والرابط" : "Button text & URL"}
                                      </Label>
                                      <div className="grid grid-cols-2 gap-2">
                                        <Input
                                          value={secData.button_text_ar ?? ""}
                                          placeholder="نص الزر"
                                          onChange={(e) => {
                                            const next = [...sections];
                                            next[idx].data = {
                                              ...next[idx].data,
                                              button_text_ar: e.target.value,
                                            };
                                            setForm({ ...form, sections: next });
                                          }}
                                        />
                                        <Input
                                          value={secData.button_url ?? ""}
                                          placeholder="/contact"
                                          onChange={(e) => {
                                            const next = [...sections];
                                            next[idx].data = {
                                              ...next[idx].data,
                                              button_url: e.target.value,
                                            };
                                            setForm({ ...form, sections: next });
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </>
                                )}

                                {sec.type === "video" && (
                                  <>
                                    <div className="space-y-1">
                                      <Label className="text-[11px] font-semibold">
                                        {isAr
                                          ? "رابط الفيديو (يوتيوب أو ملف مباشر)"
                                          : "Video URL (YouTube or direct file)"}
                                      </Label>
                                      <Input
                                        value={secData.url ?? ""}
                                        placeholder="https://youtube.com/watch?v=... أو https://.../video.mp4"
                                        onChange={(e) => setField("url", e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[11px]">
                                        {isAr ? "عنوان الفيديو" : "Title"}
                                      </Label>
                                      <Input
                                        value={secData.title_ar ?? ""}
                                        onChange={(e) => setField("title_ar", e.target.value)}
                                      />
                                    </div>
                                  </>
                                )}

                                {sec.type === "gallery" && (
                                  <>
                                    <div className="space-y-1">
                                      <Label className="text-[11px] font-semibold">
                                        {isAr ? "اختر المعرض" : "Select Gallery"}
                                      </Label>
                                      <Select
                                        value={secData.gallery_id ?? ""}
                                        onValueChange={(val) => setField("gallery_id", val)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue
                                            placeholder={
                                              isAr
                                                ? "اختر معرض صور منشور..."
                                                : "Select a published gallery..."
                                            }
                                          />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {galleries.length === 0 ? (
                                            <div className="px-3 py-2 text-xs text-muted-foreground">
                                              {isAr ? "لا توجد معارض بعد" : "No galleries yet"}
                                            </div>
                                          ) : (
                                            galleries.map((g) => (
                                              <SelectItem key={g.id} value={g.id}>
                                                {isAr ? g.title_ar : g.title_en || g.title_ar}
                                              </SelectItem>
                                            ))
                                          )}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[11px]">
                                        {isAr ? "عدد الأعمدة" : "Columns"}
                                      </Label>
                                      <Input
                                        type="number"
                                        min={1}
                                        max={6}
                                        value={secData.columns ?? 3}
                                        onChange={(e) =>
                                          setField("columns", Number(e.target.value) || 3)
                                        }
                                      />
                                    </div>
                                  </>
                                )}

                                {sec.type === "timeline" && (
                                  <div className="space-y-2">
                                    <Label className="text-[11px] font-semibold">
                                      {isAr ? "أحداث الخط الزمني" : "Timeline Events"}
                                    </Label>
                                    {(secData.items ?? []).map((item: any, i: number) => (
                                      <div
                                        key={i}
                                        className="border border-border rounded-lg p-2 space-y-1.5 bg-muted/10"
                                      >
                                        <div className="grid grid-cols-2 gap-1.5">
                                          <Input
                                            className="h-7 text-[11px]"
                                            placeholder={isAr ? "السنة" : "Year"}
                                            value={item.year ?? ""}
                                            onChange={(e) =>
                                              updateNestedArrayItem(idx, "items", i, {
                                                year: e.target.value,
                                              })
                                            }
                                          />
                                          <Input
                                            className="h-7 text-[11px]"
                                            placeholder={isAr ? "العنوان" : "Title"}
                                            value={item.title_ar ?? ""}
                                            onChange={(e) =>
                                              updateNestedArrayItem(idx, "items", i, {
                                                title_ar: e.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                        <Textarea
                                          className="text-[11px]"
                                          rows={2}
                                          placeholder={
                                            isAr
                                              ? "وصف مختصر (اختياري)"
                                              : "Short description (optional)"
                                          }
                                          value={item.description_ar ?? ""}
                                          onChange={(e) =>
                                            updateNestedArrayItem(idx, "items", i, {
                                              description_ar: e.target.value,
                                            })
                                          }
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 text-[10px] text-destructive gap-1"
                                          onClick={() => removeNestedArrayItem(idx, "items", i)}
                                        >
                                          <Trash2 className="w-3 h-3" />{" "}
                                          {isAr ? "حذف الحدث" : "Remove event"}
                                        </Button>
                                      </div>
                                    ))}
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-[11px] gap-1"
                                      onClick={() =>
                                        addNestedArrayItem(idx, "items", {
                                          year: "",
                                          title_ar: "",
                                          title_en: "",
                                          description_ar: "",
                                          description_en: "",
                                        })
                                      }
                                    >
                                      <Plus className="w-3 h-3" />{" "}
                                      {isAr ? "إضافة حدث" : "Add event"}
                                    </Button>
                                  </div>
                                )}

                                {sec.type === "statistics" && (
                                  <div className="space-y-2">
                                    <Label className="text-[11px] font-semibold">
                                      {isAr ? "بنود الإحصائية" : "Stat items"}
                                    </Label>
                                    {(secData.items ?? []).map((item: any, i: number) => (
                                      <div
                                        key={i}
                                        className="border border-border rounded-lg p-2 space-y-1.5 bg-muted/10"
                                      >
                                        <div className="grid grid-cols-3 gap-1.5">
                                          <Input
                                            className="h-7 text-[11px]"
                                            placeholder={isAr ? "الرقم" : "Number"}
                                            value={item.number ?? ""}
                                            onChange={(e) =>
                                              updateNestedArrayItem(idx, "items", i, {
                                                number: e.target.value,
                                              })
                                            }
                                          />
                                          <Input
                                            className="h-7 text-[11px] col-span-2"
                                            placeholder={isAr ? "الوصف" : "Label"}
                                            value={item.label_ar ?? ""}
                                            onChange={(e) =>
                                              updateNestedArrayItem(idx, "items", i, {
                                                label_ar: e.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 text-[10px] text-destructive gap-1"
                                          onClick={() => removeNestedArrayItem(idx, "items", i)}
                                        >
                                          <Trash2 className="w-3 h-3" /> {isAr ? "حذف" : "Remove"}
                                        </Button>
                                      </div>
                                    ))}
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-[11px] gap-1"
                                      onClick={() =>
                                        addNestedArrayItem(idx, "items", {
                                          number: "",
                                          label_ar: "",
                                          label_en: "",
                                        })
                                      }
                                    >
                                      <Plus className="w-3 h-3" /> {isAr ? "إضافة بند" : "Add item"}
                                    </Button>
                                  </div>
                                )}

                                {sec.type === "cards" && (
                                  <div className="space-y-2">
                                    <Label className="text-[11px] font-semibold">
                                      {isAr ? "بطاقات الميزات" : "Feature cards"}
                                    </Label>
                                    {(secData.cards ?? []).map((card: any, i: number) => (
                                      <div
                                        key={i}
                                        className="border border-border rounded-lg p-2 space-y-1.5 bg-muted/10"
                                      >
                                        <Input
                                          className="h-7 text-[11px]"
                                          placeholder={isAr ? "العنوان" : "Title"}
                                          value={card.title_ar ?? ""}
                                          onChange={(e) =>
                                            updateNestedArrayItem(idx, "cards", i, {
                                              title_ar: e.target.value,
                                            })
                                          }
                                        />
                                        <Textarea
                                          className="text-[11px]"
                                          rows={2}
                                          placeholder={isAr ? "الوصف" : "Description"}
                                          value={card.desc_ar ?? ""}
                                          onChange={(e) =>
                                            updateNestedArrayItem(idx, "cards", i, {
                                              desc_ar: e.target.value,
                                            })
                                          }
                                        />
                                        <Input
                                          className="h-7 text-[11px]"
                                          placeholder={
                                            isAr
                                              ? "رابط عند الضغط (اختياري)"
                                              : "Link URL (optional)"
                                          }
                                          value={card.link_url ?? ""}
                                          onChange={(e) =>
                                            updateNestedArrayItem(idx, "cards", i, {
                                              link_url: e.target.value,
                                            })
                                          }
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 text-[10px] text-destructive gap-1"
                                          onClick={() => removeNestedArrayItem(idx, "cards", i)}
                                        >
                                          <Trash2 className="w-3 h-3" />{" "}
                                          {isAr ? "حذف البطاقة" : "Remove card"}
                                        </Button>
                                      </div>
                                    ))}
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-[11px] gap-1"
                                      onClick={() =>
                                        addNestedArrayItem(idx, "cards", {
                                          title_ar: "",
                                          title_en: "",
                                          desc_ar: "",
                                          desc_en: "",
                                          link_url: "",
                                        })
                                      }
                                    >
                                      <Plus className="w-3 h-3" />{" "}
                                      {isAr ? "إضافة بطاقة" : "Add card"}
                                    </Button>
                                  </div>
                                )}

                                {sec.type === "member_spotlight" && (
                                  <>
                                    <div className="space-y-1">
                                      <Label className="text-[11px] font-semibold">
                                        {isAr
                                          ? "معرّف الفرد (ID) أو الرابط المختصر (slug)"
                                          : "Member ID or slug"}
                                      </Label>
                                      <Input
                                        value={secData.member_id ?? ""}
                                        placeholder={
                                          isAr ? "مثال: ahmad-al-bouabid" : "e.g. ahmad-al-bouabid"
                                        }
                                        onChange={(e) => setField("member_id", e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[11px]">
                                        {isAr ? "شارة الإبراز" : "Highlight badge"}
                                      </Label>
                                      <Input
                                        value={secData.highlight_ar ?? ""}
                                        onChange={(e) => setField("highlight_ar", e.target.value)}
                                      />
                                    </div>
                                  </>
                                )}

                                {sec.type === "branches" && (
                                  <div className="flex items-center justify-between">
                                    <Label className="text-[11px]">
                                      {isAr ? "إظهار أسماء عمداء الفروع" : "Show branch elders"}
                                    </Label>
                                    <Switch
                                      checked={secData.show_elders ?? true}
                                      onCheckedChange={(v) => setField("show_elders", v)}
                                    />
                                  </div>
                                )}

                                {sec.type === "tree" && (
                                  <div className="space-y-1">
                                    <Label className="text-[11px]">
                                      {isAr ? "عدد الأجيال المعروضة" : "Generations to show"}
                                    </Label>
                                    <Input
                                      type="number"
                                      min={1}
                                      max={10}
                                      value={secData.max_generations ?? 4}
                                      onChange={(e) =>
                                        setField("max_generations", Number(e.target.value) || 4)
                                      }
                                    />
                                  </div>
                                )}

                                {sec.type === "events" && (
                                  <div className="space-y-1">
                                    <Label className="text-[11px]">
                                      {isAr ? "عدد الفعاليات المعروضة" : "Number of events"}
                                    </Label>
                                    <Input
                                      type="number"
                                      min={1}
                                      max={12}
                                      value={secData.limit ?? 3}
                                      onChange={(e) =>
                                        setField("limit", Number(e.target.value) || 3)
                                      }
                                    />
                                  </div>
                                )}

                                {sec.type === "articles" && (
                                  <div className="space-y-1">
                                    <Label className="text-[11px]">
                                      {isAr ? "عدد المقالات المعروضة" : "Number of articles"}
                                    </Label>
                                    <Input
                                      type="number"
                                      min={1}
                                      max={12}
                                      value={secData.limit ?? 3}
                                      onChange={(e) =>
                                        setField("limit", Number(e.target.value) || 3)
                                      }
                                    />
                                  </div>
                                )}

                                {sec.type === "announcements" && (
                                  <div className="space-y-1">
                                    <Label className="text-[11px]">
                                      {isAr ? "شكل العرض" : "Display style"}
                                    </Label>
                                    <Select
                                      value={secData.style ?? "banner"}
                                      onValueChange={(v) => setField("style", v)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="banner">
                                          {isAr ? "شريط عرض" : "Banner"}
                                        </SelectItem>
                                        <SelectItem value="list">
                                          {isAr ? "قائمة" : "List"}
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}

                                {sec.type === "map" && (
                                  <>
                                    <div className="space-y-1">
                                      <Label className="text-[11px] font-semibold">
                                        {isAr ? "العنوان النصي" : "Address"}
                                      </Label>
                                      <Input
                                        value={secData.address ?? ""}
                                        placeholder={
                                          isAr
                                            ? "المبرز، الأحساء، السعودية"
                                            : "Al Mubarraz, Al Ahsa, Saudi Arabia"
                                        }
                                        onChange={(e) => setField("address", e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[11px]">
                                        {isAr
                                          ? "أو رابط تضمين خرائط جوجل (اختياري)"
                                          : "Or a Google Maps embed URL (optional)"}
                                      </Label>
                                      <Input
                                        value={secData.embed_url ?? ""}
                                        placeholder="https://www.google.com/maps?q=...&output=embed"
                                        onChange={(e) => setField("embed_url", e.target.value)}
                                      />
                                    </div>
                                  </>
                                )}

                                {sec.type === "contact" && (
                                  <div className="space-y-1">
                                    <Label className="text-[11px] font-semibold">
                                      {isAr ? "عنوان النموذج" : "Form title"}
                                    </Label>
                                    <Input
                                      value={secData.title_ar ?? ""}
                                      onChange={(e) => setField("title_ar", e.target.value)}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: Settings & SEO */}
            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "عنوان الصفحة (بالعربية) *" : "Page Title (AR) *"}
                  </Label>
                  <Input
                    required
                    value={form.title_ar}
                    onChange={(e) => {
                      const title = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        title_ar: title,
                        slug: prev.slug || slugify(title, { allowSlashes: true }),
                      }));
                    }}
                    placeholder="مثال: من نحن والتاريخ"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "عنوان الصفحة (EN)" : "Page Title (EN)"}
                  </Label>
                  <Input
                    value={form.title_en ?? ""}
                    onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                    placeholder="e.g. About & Heritage"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "المعرف الفريد (Slug) — يُنشأ تلقائياً" : "Slug (auto-generated)"}
                  </Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder={
                      slugify(form.title_ar, { allowSlashes: true }) || "يُنشأ تلقائياً من العنوان العربي"
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{isAr ? "حالة النشر" : "Status"}</Label>
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
                      <SelectItem value="archived">{isAr ? "مؤرشف" : "Archived"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "مستوى الظهور" : "Visibility"}
                  </Label>
                  <Select
                    value={form.visibility}
                    onValueChange={(val: any) => setForm({ ...form, visibility: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">{isAr ? "عام للجميع" : "Public"}</SelectItem>
                      <SelectItem value="family_only">
                        {isAr ? "أفراد الأسرة فقط" : "Family Only"}
                      </SelectItem>
                      <SelectItem value="admin_only">
                        {isAr ? "للإدارة فقط" : "Admin Only"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {isAr ? "مقتطف / نبذة تمهيدية" : "Excerpt"}
                </Label>
                <Textarea
                  rows={2}
                  value={form.excerpt_ar ?? ""}
                  onChange={(e) => setForm({ ...form, excerpt_ar: e.target.value })}
                />
              </div>

              {/* Cover Photo */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <Label className="text-xs font-semibold">
                  {isAr ? "صورة الغلاف / البانر للصفحة" : "Page Cover Image"}
                </Label>
                <ImageUploadInput
                  bucket="site-media"
                  value={form.featured_media_path}
                  onChange={(url) => setForm({ ...form, featured_media_path: url })}
                  placeholder={
                    isAr ? "رابط الصورة أو ارفع صورة جديدة..." : "Image URL or upload..."
                  }
                  helperText={
                    isAr
                      ? "الصورة البارزة المعروضة أعلى الصفحة"
                      : "Featured header image for this page"
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "عنوان السيو (SEO Title)" : "SEO Title"}
                  </Label>
                  <Input
                    value={form.seo_title_ar ?? ""}
                    onChange={(e) => setForm({ ...form, seo_title_ar: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "وصف السيو (SEO Description)" : "SEO Description"}
                  </Label>
                  <Input
                    value={form.seo_description_ar ?? ""}
                    onChange={(e) => setForm({ ...form, seo_description_ar: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: Preview */}
            <TabsContent
              value="preview"
              className="space-y-6 bg-muted/10 p-6 rounded-xl border border-border"
            >
              <div className="text-center space-y-2 border-b border-border pb-4">
                <Badge variant="outline">{form.template}</Badge>
                <h1 className="text-2xl font-bold text-foreground">
                  {form.title_ar || "عنوان الصفحة"}
                </h1>
                {form.excerpt_ar && (
                  <p className="text-sm text-muted-foreground">{form.excerpt_ar}</p>
                )}
              </div>

              <div className="space-y-6 max-w-2xl mx-auto">
                {sections.map((sec, idx) => {
                  const secData = (sec.data ?? {}) as Record<string, any>;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-border/60 bg-card shadow-sm"
                    >
                      <Badge variant="secondary" className="text-[10px] mb-2">
                        {sec.type}
                      </Badge>
                      {sec.type === "hero" && (
                        <div className="text-center py-6">
                          <h2 className="text-xl font-bold text-foreground">{secData.title_ar}</h2>
                          <p className="text-xs text-muted-foreground mt-1">
                            {secData.subtitle_ar}
                          </p>
                        </div>
                      )}
                      {sec.type === "rich_text" && (
                        <p className="text-xs leading-relaxed text-foreground">
                          {secData.content_ar}
                        </p>
                      )}
                      {sec.type === "quote" && (
                        <blockquote className="border-s-4 border-primary ps-3 italic text-xs">
                          "{secData.quote_ar}"
                          <span className="block not-italic font-semibold mt-1 text-muted-foreground">
                            — {secData.author_ar}
                          </span>
                        </blockquote>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* TAB 4: Revision History */}
            <TabsContent value="history" className="space-y-3">
              {!form.id ? (
                <div className="border-2 border-dashed border-border rounded-xl p-10 text-center text-xs text-muted-foreground">
                  {isAr
                    ? "احفظ الصفحة أولاً لتتوفر سجلات الإصدارات."
                    : "Save the page first to start recording revisions."}
                </div>
              ) : revisionsLoading ? (
                <div className="p-10 text-center text-xs text-muted-foreground">
                  {isAr ? "جاري تحميل السجل..." : "Loading history..."}
                </div>
              ) : revisions.length === 0 ? (
                <div className="border-2 border-dashed border-border rounded-xl p-10 text-center text-xs text-muted-foreground">
                  {isAr
                    ? "لا يوجد سجل إصدارات بعد لهذه الصفحة."
                    : "No revisions recorded for this page yet."}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] leading-relaxed text-muted-foreground border border-border rounded-lg bg-muted/40 p-2.5">
                    {isAr
                      ? "الاستعادة تُرجع كتل المحتوى فقط إلى ما كانت عليه في ذلك الإصدار. عنوان الصفحة وحالتها (منشورة/مسودة) وإعدادات SEO لا تتأثر، وتُحفظ الاستعادة كإصدار جديد."
                      : "Restore reverts the content blocks only. The page title, status (published/draft) and SEO settings are left unchanged, and the restore is saved as a new revision."}
                  </p>
                  {revisions.map((rev, i) => (
                    <div
                      key={rev.id}
                      className="flex items-center justify-between gap-3 border border-border rounded-xl p-3 bg-card"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-mono">
                            v{rev.version}
                          </Badge>
                          {i === 0 && (
                            <Badge className="text-[10px] bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                              {isAr ? "الحالي" : "Current"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-foreground mt-1 truncate">
                          {rev.change_summary || "—"}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                          {formatDualDateTime(rev.created_at, isAr ? "ar" : "en")}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px] gap-1.5 shrink-0"
                        disabled={i === 0 || restoringId === rev.id}
                        onClick={() => handleRestoreRevision(rev.id)}
                      >
                        <RotateCcw className="w-3 h-3" />
                        {restoringId === rev.id
                          ? isAr
                            ? "جاري الاستعادة..."
                            : "Restoring..."
                          : isAr
                            ? "استعادة"
                            : "Restore"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="px-6 py-3 border-t border-border bg-muted/20">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {isAr ? "إلغاء" : "Cancel"}
          </Button>
          <Button type="button" size="sm" disabled={loading} onClick={handleSubmit}>
            {loading
              ? isAr
                ? "جاري الحفظ..."
                : "Saving..."
              : isAr
                ? "حفظ ونشر الصفحة"
                : "Save Page"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
