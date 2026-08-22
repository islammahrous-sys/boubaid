import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLang } from "@/i18n/LanguageProvider";
import { toast } from "sonner";
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
} from "lucide-react";
import { BLOCK_DEFINITIONS, type BlockType } from "./BlockRegistry";
import { ImageUploadInput } from "@/components/console/media/ImageUploadInput";
import type { ContentPageInput, ContentSectionInput } from "@/lib/admin-hub.schemas";

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
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("builder");
  const [selectedBlockIdx, setSelectedBlockIdx] = useState<number | null>(null);

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

  const handleAddBlock = (type: BlockType) => {
    const def = BLOCK_DEFINITIONS[type];
    const newSection: ContentSectionInput = {
      type,
      sort_order: (form.sections?.length ?? 0),
      data: { ...def.defaultData },
      settings: {},
      visibility: "public",
    };
    setForm((prev) => ({
      ...prev,
      sections: [...(prev.sections ?? []), newSection],
    }));
    setSelectedBlockIdx((form.sections?.length ?? 0));
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

  const handleDeleteBlock = (idx: number) => {
    if (!form.sections) return;
    const copy = form.sections.filter((_, i) => i !== idx);
    setForm((prev) => ({ ...prev, sections: copy }));
    setSelectedBlockIdx(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title_ar.trim()) return;
    if (!form.slug.trim()) return;
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
            <TabsList className="grid grid-cols-3 w-full mb-4">
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
                            <p className="font-semibold text-foreground truncate">{isAr ? def.label_ar : def.label_en}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{isAr ? def.description_ar : def.description_en}</p>
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
                      {isAr ? `أقسام الصفحة الحالية (${sections.length})` : `Current Page Blocks (${sections.length})`}
                    </h4>
                  </div>

                  {sections.length === 0 ? (
                    <div className="border-2 border-dashed border-border rounded-xl p-10 text-center text-xs text-muted-foreground">
                      {isAr ? "لم يتم إضافة أي كتل محتوى بعد. اختر قسماً من القائمة الجانبية." : "No blocks added yet. Click a block from the palette to add."}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sections.map((sec, idx) => {
                        const def = BLOCK_DEFINITIONS[sec.type as BlockType] || BLOCK_DEFINITIONS.rich_text;
                        const Icon = def.icon;
                        const isSelected = selectedBlockIdx === idx;
                        // Block payloads vary by type, so `sec.data` is loosely
                        // typed (Json/Record<string, unknown>) — narrow it once
                        // here instead of casting at every field below.
                        const secData = (sec.data ?? {}) as Record<string, any>;

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
                                      <Label className="text-[11px]">{isAr ? "العنوان الرئيسي" : "Title"}</Label>
                                      <Input
                                        value={secData.title_ar ?? ""}
                                        onChange={(e) => {
                                          const next = [...sections];
                                          next[idx].data = { ...next[idx].data, title_ar: e.target.value };
                                          setForm({ ...form, sections: next });
                                        }}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[11px]">{isAr ? "النص الفرعي" : "Subtitle"}</Label>
                                      <Input
                                        value={secData.subtitle_ar ?? ""}
                                        onChange={(e) => {
                                          const next = [...sections];
                                          next[idx].data = { ...next[idx].data, subtitle_ar: e.target.value };
                                          setForm({ ...form, sections: next });
                                        }}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[11px] font-semibold">{isAr ? "صورة خلفية القسم" : "Background Image"}</Label>
                                      <ImageUploadInput
                                        bucket="site-media"
                                        value={secData.bg_image_url}
                                        onChange={(url) => {
                                          const next = [...sections];
                                          next[idx].data = { ...next[idx].data, bg_image_url: url };
                                          setForm({ ...form, sections: next });
                                        }}
                                        placeholder={isAr ? "رابط الصورة أو ارفع صورة..." : "Image URL or upload..."}
                                      />
                                    </div>
                                  </>
                                )}

                                {sec.type === "image" && (
                                  <>
                                    <div className="space-y-1">
                                      <Label className="text-[11px] font-semibold">{isAr ? "الصورة" : "Image"}</Label>
                                      <ImageUploadInput
                                        bucket="site-media"
                                        value={secData.url}
                                        onChange={(url) => {
                                          const next = [...sections];
                                          next[idx].data = { ...next[idx].data, url };
                                          setForm({ ...form, sections: next });
                                        }}
                                        placeholder={isAr ? "رابط الصورة أو ارفع صورة..." : "Image URL or upload..."}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[11px]">{isAr ? "التعليق التوضيحي (Caption)" : "Caption"}</Label>
                                      <Input
                                        value={secData.caption_ar ?? ""}
                                        placeholder={isAr ? "تعليق يظهر أسفل الصورة" : "Caption below image"}
                                        onChange={(e) => {
                                          const next = [...sections];
                                          next[idx].data = { ...next[idx].data, caption_ar: e.target.value };
                                          setForm({ ...form, sections: next });
                                        }}
                                      />
                                    </div>
                                  </>
                                )}

                                {sec.type === "rich_text" && (
                                  <div className="space-y-1">
                                    <Label className="text-[11px]">{isAr ? "المحتوى النصي" : "Content Text"}</Label>
                                    <Textarea
                                      rows={4}
                                      value={secData.content_ar ?? ""}
                                      onChange={(e) => {
                                        const next = [...sections];
                                        next[idx].data = { ...next[idx].data, content_ar: e.target.value };
                                        setForm({ ...form, sections: next });
                                      }}
                                    />
                                  </div>
                                )}

                                {sec.type === "quote" && (
                                  <>
                                    <div className="space-y-1">
                                      <Label className="text-[11px]">{isAr ? "نص الاقتباس" : "Quote Text"}</Label>
                                      <Input
                                        value={secData.quote_ar ?? ""}
                                        onChange={(e) => {
                                          const next = [...sections];
                                          next[idx].data = { ...next[idx].data, quote_ar: e.target.value };
                                          setForm({ ...form, sections: next });
                                        }}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[11px]">{isAr ? "القائل / المصدر" : "Author"}</Label>
                                      <Input
                                        value={secData.author_ar ?? ""}
                                        onChange={(e) => {
                                          const next = [...sections];
                                          next[idx].data = { ...next[idx].data, author_ar: e.target.value };
                                          setForm({ ...form, sections: next });
                                        }}
                                      />
                                    </div>
                                  </>
                                )}

                                {sec.type === "cta" && (
                                  <>
                                    <div className="space-y-1">
                                      <Label className="text-[11px]">{isAr ? "عنوان الإجراء" : "CTA Title"}</Label>
                                      <Input
                                        value={secData.title_ar ?? ""}
                                        onChange={(e) => {
                                          const next = [...sections];
                                          next[idx].data = { ...next[idx].data, title_ar: e.target.value };
                                          setForm({ ...form, sections: next });
                                        }}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-[11px]">{isAr ? "نص الزر والرابط" : "Button text & URL"}</Label>
                                      <div className="grid grid-cols-2 gap-2">
                                        <Input
                                          value={secData.button_text_ar ?? ""}
                                          placeholder="نص الزر"
                                          onChange={(e) => {
                                            const next = [...sections];
                                            next[idx].data = { ...next[idx].data, button_text_ar: e.target.value };
                                            setForm({ ...form, sections: next });
                                          }}
                                        />
                                        <Input
                                          value={secData.button_url ?? ""}
                                          placeholder="/contact"
                                          onChange={(e) => {
                                            const next = [...sections];
                                            next[idx].data = { ...next[idx].data, button_url: e.target.value };
                                            setForm({ ...form, sections: next });
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </>
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
                  <Label className="text-xs font-semibold">{isAr ? "عنوان الصفحة (بالعربية) *" : "Page Title (AR) *"}</Label>
                  <Input
                    required
                    value={form.title_ar}
                    onChange={(e) => {
                      const title = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        title_ar: title,
                        slug: prev.slug || title.toLowerCase().replace(/\s+/g, "-"),
                      }));
                    }}
                    placeholder="مثال: من نحن والتاريخ"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{isAr ? "عنوان الصفحة (EN)" : "Page Title (EN)"}</Label>
                  <Input
                    value={form.title_en ?? ""}
                    onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                    placeholder="e.g. About & Heritage"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{isAr ? "المعرف الفريد (Slug) *" : "Slug *"}</Label>
                  <Input
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="about-us"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{isAr ? "حالة النشر" : "Status"}</Label>
                  <Select value={form.status} onValueChange={(val: any) => setForm({ ...form, status: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">{isAr ? "منشور (Published)" : "Published"}</SelectItem>
                      <SelectItem value="draft">{isAr ? "مسودة (Draft)" : "Draft"}</SelectItem>
                      <SelectItem value="in_review">{isAr ? "قيد المراجعة" : "In Review"}</SelectItem>
                      <SelectItem value="archived">{isAr ? "مؤرشف" : "Archived"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{isAr ? "مستوى الظهور" : "Visibility"}</Label>
                  <Select value={form.visibility} onValueChange={(val: any) => setForm({ ...form, visibility: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">{isAr ? "عام للجميع" : "Public"}</SelectItem>
                      <SelectItem value="family_only">{isAr ? "أفراد الأسرة فقط" : "Family Only"}</SelectItem>
                      <SelectItem value="admin_only">{isAr ? "للإدارة فقط" : "Admin Only"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{isAr ? "مقتطف / نبذة تمهيدية" : "Excerpt"}</Label>
                <Textarea
                  rows={2}
                  value={form.excerpt_ar ?? ""}
                  onChange={(e) => setForm({ ...form, excerpt_ar: e.target.value })}
                />
              </div>

              {/* Cover Photo */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <Label className="text-xs font-semibold">{isAr ? "صورة الغلاف / البانر للصفحة" : "Page Cover Image"}</Label>
                <ImageUploadInput
                  bucket="site-media"
                  value={form.featured_media_path}
                  onChange={(url) => setForm({ ...form, featured_media_path: url })}
                  placeholder={isAr ? "رابط الصورة أو ارفع صورة جديدة..." : "Image URL or upload..."}
                  helperText={isAr ? "الصورة البارزة المعروضة أعلى الصفحة" : "Featured header image for this page"}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{isAr ? "عنوان السيو (SEO Title)" : "SEO Title"}</Label>
                  <Input
                    value={form.seo_title_ar ?? ""}
                    onChange={(e) => setForm({ ...form, seo_title_ar: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{isAr ? "وصف السيو (SEO Description)" : "SEO Description"}</Label>
                  <Input
                    value={form.seo_description_ar ?? ""}
                    onChange={(e) => setForm({ ...form, seo_description_ar: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: Preview */}
            <TabsContent value="preview" className="space-y-6 bg-muted/10 p-6 rounded-xl border border-border">
              <div className="text-center space-y-2 border-b border-border pb-4">
                <Badge variant="outline">{form.template}</Badge>
                <h1 className="text-2xl font-bold text-foreground">{form.title_ar || "عنوان الصفحة"}</h1>
                {form.excerpt_ar && <p className="text-sm text-muted-foreground">{form.excerpt_ar}</p>}
              </div>

              <div className="space-y-6 max-w-2xl mx-auto">
                {sections.map((sec, idx) => {
                  const secData = (sec.data ?? {}) as Record<string, any>;
                  return (
                    <div key={idx} className="p-4 rounded-xl border border-border/60 bg-card shadow-sm">
                      <Badge variant="secondary" className="text-[10px] mb-2">{sec.type}</Badge>
                      {sec.type === "hero" && (
                        <div className="text-center py-6">
                          <h2 className="text-xl font-bold text-foreground">{secData.title_ar}</h2>
                          <p className="text-xs text-muted-foreground mt-1">{secData.subtitle_ar}</p>
                        </div>
                      )}
                      {sec.type === "rich_text" && (
                        <p className="text-xs leading-relaxed text-foreground">{secData.content_ar}</p>
                      )}
                      {sec.type === "quote" && (
                        <blockquote className="border-s-4 border-primary ps-3 italic text-xs">
                          "{secData.quote_ar}"
                          <span className="block not-italic font-semibold mt-1 text-muted-foreground">— {secData.author_ar}</span>
                        </blockquote>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="px-6 py-3 border-t border-border bg-muted/20">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {isAr ? "إلغاء" : "Cancel"}
          </Button>
          <Button type="button" size="sm" disabled={loading} onClick={handleSubmit}>
            {loading ? (isAr ? "جاري الحفظ..." : "Saving...") : isAr ? "حفظ ونشر الصفحة" : "Save Page"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
