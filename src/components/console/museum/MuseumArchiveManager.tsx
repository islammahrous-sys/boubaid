import { useMemo, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLang } from "@/i18n/LanguageProvider";
import { useConfirm } from "@/hooks/useConfirm";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus,
  Edit2,
  Trash2,
  Landmark,
  Images,
  GripVertical,
  ArrowRight,
  Upload,
  Loader2,
  Star,
  ImageOff,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import type { GalleryInput, GalleryMediaInput, MediaAssetInput } from "@/lib/admin-hub.schemas";

export type GalleryRow = {
  id: string;
  slug: string;
  title_ar: string;
  title_en?: string | null;
  description_ar?: string | null;
  description_en?: string | null;
  cover_media_path?: string | null;
  status: string;
  visibility: string;
  sort_order: number;
};

export type GalleryMediaRow = {
  id: string;
  gallery_id: string;
  media_asset_id: string;
  caption_ar?: string | null;
  caption_en?: string | null;
  sort_order: number;
  is_published: boolean;
};

export type MediaAssetRow = {
  id: string;
  bucket: string;
  storage_path: string;
  file_name: string;
  original_file_name?: string | null;
  public_url?: string | null;
  mime_type: string;
  file_size: number;
  width?: number | null;
  height?: number | null;
  alt_text_ar?: string | null;
  alt_text_en?: string | null;
};

const GALLERY_BUCKET = "galleries";
const MAX_FILE_SIZE = 25 * 1024 * 1024;

function slugify(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || `gallery-${Date.now().toString(36)}`;
}

function assetUrl(asset: MediaAssetRow | undefined): string {
  if (!asset) return "";
  if (asset.public_url) return asset.public_url;
  const { data } = supabase.storage.from(asset.bucket).getPublicUrl(asset.storage_path);
  return data.publicUrl;
}

export function MuseumArchiveManager({
  galleries,
  galleryMedia,
  mediaAssets,
  onSaveGallery,
  onDeleteGallery,
  onRegisterMedia,
  onSaveGalleryMedia,
  onDeleteGalleryMedia,
  onReorder,
  onRefresh,
}: {
  galleries: GalleryRow[];
  galleryMedia: GalleryMediaRow[];
  mediaAssets: MediaAssetRow[];
  onSaveGallery: (data: GalleryInput) => Promise<{ ok: boolean; gallery: GalleryRow }>;
  onDeleteGallery: (id: string) => Promise<{ ok: boolean }>;
  onRegisterMedia: (data: MediaAssetInput) => Promise<{ ok: boolean; asset: MediaAssetRow }>;
  onSaveGalleryMedia: (
    data: GalleryMediaInput,
  ) => Promise<{ ok: boolean; galleryMedia: GalleryMediaRow }>;
  onDeleteGalleryMedia: (id: string) => Promise<{ ok: boolean }>;
  onReorder: (
    table: "galleries" | "gallery_media",
    items: { id: string; sort_order: number }[],
  ) => Promise<{ ok: boolean }>;
  onRefresh: () => void;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const confirm = useConfirm();

  const [activeGalleryId, setActiveGalleryId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<GalleryRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<GalleryInput>({
    id: undefined,
    slug: "",
    title_ar: "",
    title_en: "",
    description_ar: "",
    description_en: "",
    cover_media_path: "",
    status: "draft",
    visibility: "public",
    sort_order: 0,
  });

  const mediaById = useMemo(() => {
    const map = new Map<string, MediaAssetRow>();
    for (const m of mediaAssets) map.set(m.id, m);
    return map;
  }, [mediaAssets]);

  const sortedGalleries = useMemo(
    () => [...galleries].sort((a, b) => a.sort_order - b.sort_order),
    [galleries],
  );

  const imageCountByGallery = useMemo(() => {
    const map = new Map<string, number>();
    for (const gm of galleryMedia) map.set(gm.gallery_id, (map.get(gm.gallery_id) ?? 0) + 1);
    return map;
  }, [galleryMedia]);

  const activeGallery = sortedGalleries.find((g) => g.id === activeGalleryId) ?? null;
  const activeGalleryImages = useMemo(
    () =>
      galleryMedia
        .filter((gm) => gm.gallery_id === activeGalleryId)
        .sort((a, b) => a.sort_order - b.sort_order),
    [galleryMedia, activeGalleryId],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // ---------- Collection (gallery) CRUD ----------

  const handleOpenAdd = () => {
    setSelectedGallery(null);
    setForm({
      id: undefined,
      slug: "",
      title_ar: "",
      title_en: "",
      description_ar: "",
      description_en: "",
      cover_media_path: "",
      status: "draft",
      visibility: "public",
      sort_order: sortedGalleries.length,
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (gallery: GalleryRow) => {
    setSelectedGallery(gallery);
    setForm({
      id: gallery.id,
      slug: gallery.slug,
      title_ar: gallery.title_ar,
      title_en: gallery.title_en ?? "",
      description_ar: gallery.description_ar ?? "",
      description_en: gallery.description_en ?? "",
      cover_media_path: gallery.cover_media_path ?? "",
      status: gallery.status,
      visibility: "public",
      sort_order: gallery.sort_order,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title_ar.trim()) return;
    try {
      setSaving(true);
      const slug = form.slug.trim() || slugify(form.title_en || form.title_ar);
      await onSaveGallery({ ...form, slug, visibility: "public" });
      onRefresh();
      setFormOpen(false);
      toast.success(isAr ? "تم حفظ المجموعة بنجاح" : "Collection saved");
    } catch (err: any) {
      toast.error(err?.message || (isAr ? "فشل الحفظ" : "Failed to save"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGallery = async (gallery: GalleryRow) => {
    const count = imageCountByGallery.get(gallery.id) ?? 0;
    if (
      !(await confirm({
        title: isAr ? `حذف مجموعة "${gallery.title_ar}"؟` : `Delete "${gallery.title_ar}"?`,
        description: isAr
          ? `سيتم حذف هذه المجموعة الأرشيفية وكل صورها (${count}) نهائيًا من المتحف ولا يمكن التراجع عن هذا الإجراء.`
          : `This collection and all ${count} of its images will be permanently removed. This can't be undone.`,
        tone: "destructive",
      }))
    )
      return;
    try {
      await onDeleteGallery(gallery.id);
      onRefresh();
      if (activeGalleryId === gallery.id) setActiveGalleryId(null);
      toast.success(isAr ? "تم حذف المجموعة" : "Collection deleted");
    } catch (err: any) {
      toast.error(err?.message || (isAr ? "فشل الحذف" : "Failed to delete"));
    }
  };

  const handleTogglePublish = async (gallery: GalleryRow) => {
    try {
      await onSaveGallery({
        id: gallery.id,
        slug: gallery.slug,
        title_ar: gallery.title_ar,
        title_en: gallery.title_en,
        description_ar: gallery.description_ar,
        description_en: gallery.description_en,
        cover_media_path: gallery.cover_media_path,
        status: gallery.status === "published" ? "draft" : "published",
        visibility: "public",
        sort_order: gallery.sort_order,
      });
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || (isAr ? "فشل تحديث حالة النشر" : "Failed to update"));
    }
  };

  const handleGalleryDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sortedGalleries.findIndex((g) => g.id === active.id);
    const newIndex = sortedGalleries.findIndex((g) => g.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(sortedGalleries, oldIndex, newIndex);
    try {
      await onReorder(
        "galleries",
        reordered.map((g, i) => ({ id: g.id, sort_order: i })),
      );
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || (isAr ? "فشل إعادة الترتيب" : "Failed to reorder"));
    }
  };

  // ---------- Image (gallery_media) CRUD ----------

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUploadImages = async (files: FileList | null) => {
    if (!files || files.length === 0 || !activeGallery) return;

    const oversized = Array.from(files).filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      toast.error(
        isAr
          ? `${oversized.length} صورة تتجاوز الحد الأقصى (25 ميغابايت) ولم تُرفع`
          : `${oversized.length} image(s) exceed the 25MB limit and were not uploaded`,
      );
    }
    const toUpload = Array.from(files).filter(
      (f) => f.size <= MAX_FILE_SIZE && f.type.startsWith("image/") && f.type !== "image/svg+xml",
    );
    if (toUpload.length === 0) return;

    setUploading(true);
    let succeeded = 0;
    let failed = 0;
    let nextSort = activeGalleryImages.length;

    for (const file of toUpload) {
      try {
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const storagePath = `museum/archive/${activeGallery.id}/${Date.now()}-${cleanName}`;

        const { error: uploadErr } = await supabase.storage
          .from(GALLERY_BUCKET)
          .upload(storagePath, file, { cacheControl: "3600" });
        if (uploadErr) throw uploadErr;

        const dims = await readImageDimensions(file).catch(() => null);

        const { asset } = await onRegisterMedia({
          bucket: GALLERY_BUCKET,
          storage_path: storagePath,
          file_name: cleanName,
          original_file_name: file.name,
          mime_type: file.type || "image/jpeg",
          file_size: file.size,
          width: dims?.width ?? null,
          height: dims?.height ?? null,
        });

        await onSaveGalleryMedia({
          gallery_id: activeGallery.id,
          media_asset_id: asset.id,
          sort_order: nextSort++,
          is_published: true,
        });

        succeeded++;
      } catch (err) {
        console.error("Museum archive upload failed:", file.name, err);
        failed++;
      }
    }

    setUploading(false);
    onRefresh();
    if (succeeded > 0) {
      toast.success(
        isAr ? `تم رفع ${succeeded} صورة بنجاح` : `Uploaded ${succeeded} image(s) successfully`,
      );
    }
    if (failed > 0) {
      toast.error(isAr ? `فشل رفع ${failed} صورة` : `Failed to upload ${failed} image(s)`);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteImage = async (gm: GalleryMediaRow) => {
    if (
      !(await confirm({
        title: isAr ? "حذف هذه الصورة؟" : "Delete this image?",
        description: isAr
          ? "سيتم حذف الصورة نهائيًا من المجموعة ومن التخزين ولا يمكن التراجع عن هذا الإجراء."
          : "The image will be permanently removed from this collection and from storage. This can't be undone.",
        tone: "destructive",
      }))
    )
      return;
    try {
      await onDeleteGalleryMedia(gm.id);
      onRefresh();
      toast.success(isAr ? "تم حذف الصورة" : "Image deleted");
    } catch (err: any) {
      toast.error(err?.message || (isAr ? "فشل الحذف" : "Failed to delete"));
    }
  };

  const handleToggleImagePublish = async (gm: GalleryMediaRow) => {
    try {
      await onSaveGalleryMedia({
        id: gm.id,
        gallery_id: gm.gallery_id,
        media_asset_id: gm.media_asset_id,
        caption_ar: gm.caption_ar,
        caption_en: gm.caption_en,
        sort_order: gm.sort_order,
        is_published: !gm.is_published,
      });
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || (isAr ? "فشل التحديث" : "Failed to update"));
    }
  };

  const handleSetCover = async (gm: GalleryMediaRow) => {
    if (!activeGallery) return;
    const asset = mediaById.get(gm.media_asset_id);
    if (!asset) return;
    try {
      await onSaveGallery({
        id: activeGallery.id,
        slug: activeGallery.slug,
        title_ar: activeGallery.title_ar,
        title_en: activeGallery.title_en,
        description_ar: activeGallery.description_ar,
        description_en: activeGallery.description_en,
        cover_media_path: assetUrl(asset),
        status: activeGallery.status,
        visibility: "public",
        sort_order: activeGallery.sort_order,
      });
      onRefresh();
      toast.success(isAr ? "تم تعيين صورة الغلاف" : "Cover image set");
    } catch (err: any) {
      toast.error(err?.message || (isAr ? "فشل التحديث" : "Failed to update"));
    }
  };

  const handleSaveCaption = async (
    gm: GalleryMediaRow,
    captionAr: string,
    captionEn: string,
    altAr: string,
    altEn: string,
  ) => {
    try {
      await onSaveGalleryMedia({
        id: gm.id,
        gallery_id: gm.gallery_id,
        media_asset_id: gm.media_asset_id,
        caption_ar: captionAr,
        caption_en: captionEn,
        sort_order: gm.sort_order,
        is_published: gm.is_published,
      });
      // alt text lives on media_assets, not gallery_media -- registered via
      // registerMediaAsset's upsert-on-id path (onRegisterMedia handles both).
      if (gm.media_asset_id) {
        const asset = mediaById.get(gm.media_asset_id);
        if (asset) {
          await onRegisterMedia({
            id: asset.id,
            bucket: asset.bucket,
            storage_path: asset.storage_path,
            file_name: asset.file_name,
            original_file_name: asset.original_file_name,
            mime_type: asset.mime_type,
            file_size: asset.file_size,
            width: asset.width,
            height: asset.height,
            alt_text_ar: altAr,
            alt_text_en: altEn,
          } as any);
        }
      }
      onRefresh();
      toast.success(isAr ? "تم حفظ الوصف" : "Caption saved");
    } catch (err: any) {
      toast.error(err?.message || (isAr ? "فشل الحفظ" : "Failed to save"));
    }
  };

  const handleImageDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = activeGalleryImages.findIndex((g) => g.id === active.id);
    const newIndex = activeGalleryImages.findIndex((g) => g.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(activeGalleryImages, oldIndex, newIndex);
    try {
      await onReorder(
        "gallery_media",
        reordered.map((g, i) => ({ id: g.id, sort_order: i })),
      );
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || (isAr ? "فشل إعادة الترتيب" : "Failed to reorder"));
    }
  };

  // ---------- Render: image detail view ----------
  if (activeGallery) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 shrink-0"
              onClick={() => setActiveGalleryId(null)}
              title={isAr ? "العودة للمجموعات" : "Back to collections"}
            >
              <ArrowRight className={isAr ? "" : "rotate-180"} />
            </Button>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">
                {activeGallery.title_ar}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {isAr
                  ? `${activeGalleryImages.length} صورة`
                  : `${activeGalleryImages.length} image(s)`}
              </p>
            </div>
          </div>

          <div>
            <label
              className={`inline-flex items-center gap-2 px-3.5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold rounded-xl transition-colors shadow-xs ${
                uploading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {uploading
                ? isAr
                  ? "جاري الرفع..."
                  : "Uploading..."
                : isAr
                  ? "رفع صور (متعدد)"
                  : "Upload Images (multiple)"}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                disabled={uploading}
                onChange={(e) => handleUploadImages(e.target.files)}
              />
            </label>
          </div>
        </div>

        {activeGalleryImages.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-xl p-16 text-center text-xs text-muted-foreground bg-card">
            <ImageOff className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
            <p>
              {isAr
                ? "لا توجد صور في هذه المجموعة بعد — ابدأ برفع الصور"
                : "No images in this collection yet — start by uploading some"}
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleImageDragEnd}
          >
            <SortableContext
              items={activeGalleryImages.map((g) => g.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {activeGalleryImages.map((gm) => (
                  <SortableImageCard
                    key={gm.id}
                    gm={gm}
                    asset={mediaById.get(gm.media_asset_id)}
                    isCover={
                      !!activeGallery.cover_media_path &&
                      !!mediaById.get(gm.media_asset_id) &&
                      activeGallery.cover_media_path.includes(
                        mediaById.get(gm.media_asset_id)!.storage_path,
                      )
                    }
                    isAr={isAr}
                    onDelete={() => handleDeleteImage(gm)}
                    onTogglePublish={() => handleToggleImagePublish(gm)}
                    onSetCover={() => handleSetCover(gm)}
                    onSaveCaption={(cap_ar, cap_en, alt_ar, alt_en) =>
                      handleSaveCaption(gm, cap_ar, cap_en, alt_ar, alt_en)
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    );
  }

  // ---------- Render: collections list ----------
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2.5">
          <Landmark className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            {isAr ? "مجموعات أرشيف المتحف المصورة" : "Museum Archive Photo Collections"}
          </h3>
        </div>
        <Button size="sm" onClick={handleOpenAdd} className="h-8 text-xs gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          {isAr ? "إضافة مجموعة" : "Add Collection"}
        </Button>
      </div>

      {sortedGalleries.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-16 text-center text-xs text-muted-foreground bg-card">
          <Images className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
          <p>{isAr ? "لا توجد مجموعات أرشيفية بعد" : "No collections yet"}</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleGalleryDragEnd}
        >
          <SortableContext
            items={sortedGalleries.map((g) => g.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sortedGalleries.map((gallery) => (
                <SortableGalleryRow
                  key={gallery.id}
                  gallery={gallery}
                  imageCount={imageCountByGallery.get(gallery.id) ?? 0}
                  isAr={isAr}
                  onOpen={() => setActiveGalleryId(gallery.id)}
                  onEdit={() => handleOpenEdit(gallery)}
                  onDelete={() => handleDeleteGallery(gallery)}
                  onTogglePublish={() => handleTogglePublish(gallery)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {selectedGallery
                ? isAr
                  ? "تعديل المجموعة الأرشيفية"
                  : "Edit Collection"
                : isAr
                  ? "إضافة مجموعة أرشيفية جديدة"
                  : "Add Collection"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">
                {isAr ? "عنوان المجموعة بالعربية *" : "Title (AR) *"}
              </Label>
              <Input
                required
                value={form.title_ar}
                onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
                placeholder={isAr ? "مثال: افتتاح المتحف" : "e.g. Museum Opening"}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "العنوان (EN)" : "Title (EN)"}</Label>
              <Input
                value={form.title_en ?? ""}
                onChange={(e) => setForm({ ...form, title_en: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "المعرّف الفريد (Slug)" : "Slug"}</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder={slugify(form.title_en || form.title_ar || "collection")}
                dir="ltr"
                className="font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                {isAr
                  ? "يُستخدم في رابط الصفحة العامة — اتركه فارغًا للتوليد التلقائي"
                  : "Used in the public page URL — leave blank to auto-generate"}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "الوصف والإيضاح" : "Description"}</Label>
              <Textarea
                rows={3}
                value={form.description_ar ?? ""}
                onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
              <Label className="text-xs">{isAr ? "نشر المجموعة" : "Publish collection"}</Label>
              <Switch
                checked={form.status === "published"}
                onCheckedChange={(checked) =>
                  setForm({ ...form, status: checked ? "published" : "draft" })
                }
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setFormOpen(false)}>
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" size="sm" disabled={saving}>
                {saving
                  ? isAr
                    ? "جاري الحفظ..."
                    : "Saving..."
                  : isAr
                    ? "حفظ المجموعة"
                    : "Save Collection"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("could not read dimensions"));
    };
    img.src = url;
  });
}

function SortableGalleryRow({
  gallery,
  imageCount,
  isAr,
  onOpen,
  onEdit,
  onDelete,
  onTogglePublish,
}: {
  gallery: GalleryRow;
  imageCount: number;
  isAr: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: gallery.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const isPublished = gallery.status === "published";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 border border-border rounded-xl bg-card p-2.5 hover:border-primary/40 transition-colors ${
        isDragging ? "opacity-60 shadow-lg" : ""
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="shrink-0 text-muted-foreground/60 hover:text-foreground cursor-grab active:cursor-grabbing p-1"
        title={isAr ? "اسحب لإعادة الترتيب" : "Drag to reorder"}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onOpen}
        className="w-14 h-14 rounded-lg overflow-hidden bg-muted/40 border border-border shrink-0 flex items-center justify-center"
      >
        {gallery.cover_media_path ? (
          <img
            src={gallery.cover_media_path}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <Images className="w-5 h-5 text-muted-foreground/50" />
        )}
      </button>

      <button type="button" onClick={onOpen} className="flex-1 min-w-0 text-start">
        <p className="text-xs font-semibold text-foreground truncate">{gallery.title_ar}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant="outline" className="text-[9px] px-1.5 h-4 font-mono">
            {imageCount} {isAr ? "صورة" : "images"}
          </Badge>
          <span className="text-[10px] text-muted-foreground font-mono truncate" dir="ltr">
            /{gallery.slug}
          </span>
        </div>
      </button>

      <div className="flex items-center gap-1.5 shrink-0">
        <Switch checked={isPublished} onCheckedChange={onTogglePublish} />
        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={onEdit}>
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-7 h-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
          onClick={onDelete}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

function SortableImageCard({
  gm,
  asset,
  isCover,
  isAr,
  onDelete,
  onTogglePublish,
  onSetCover,
  onSaveCaption,
}: {
  gm: GalleryMediaRow;
  asset: MediaAssetRow | undefined;
  isCover: boolean;
  isAr: boolean;
  onDelete: () => void;
  onTogglePublish: () => void;
  onSetCover: () => void;
  onSaveCaption: (captionAr: string, captionEn: string, altAr: string, altEn: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: gm.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const [editOpen, setEditOpen] = useState(false);
  const [captionAr, setCaptionAr] = useState(gm.caption_ar ?? "");
  const [captionEn, setCaptionEn] = useState(gm.caption_en ?? "");
  const [altAr, setAltAr] = useState(asset?.alt_text_ar ?? "");
  const [altEn, setAltEn] = useState(asset?.alt_text_en ?? "");

  const url = assetUrl(asset);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative border border-border rounded-xl bg-card overflow-hidden hover:border-primary/50 transition-all shadow-sm ${
        isDragging ? "opacity-60 shadow-lg" : ""
      } ${!gm.is_published ? "opacity-60" : ""}`}
    >
      <div className="aspect-square bg-muted/40 relative overflow-hidden">
        {url ? (
          <img
            src={url}
            alt={altAr || asset?.file_name || ""}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="w-6 h-6 text-muted-foreground/40" />
          </div>
        )}

        <button
          type="button"
          {...attributes}
          {...listeners}
          className="absolute top-1.5 start-1.5 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          title={isAr ? "اسحب لإعادة الترتيب" : "Drag to reorder"}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        {isCover && (
          <Badge className="absolute top-1.5 end-1.5 h-5 px-1.5 text-[9px] gap-1 bg-amber-500 text-white border-0">
            <Star className="w-2.5 h-2.5 fill-current" />
            {isAr ? "الغلاف" : "Cover"}
          </Badge>
        )}

        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
          <Button
            variant="secondary"
            size="icon"
            className="w-7 h-7 rounded-full"
            onClick={onSetCover}
            title={isAr ? "تعيين كصورة غلاف" : "Set as cover"}
          >
            <Star className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="w-7 h-7 rounded-full"
            onClick={onTogglePublish}
            title={
              gm.is_published
                ? isAr
                  ? "إخفاء الصورة"
                  : "Unpublish"
                : isAr
                  ? "نشر الصورة"
                  : "Publish"
            }
          >
            {gm.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </Button>
          <Popover open={editOpen} onOpenChange={setEditOpen}>
            <PopoverTrigger asChild>
              <Button variant="secondary" size="icon" className="w-7 h-7 rounded-full">
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 space-y-2.5 text-xs" align="center">
              <div className="space-y-1">
                <Label className="text-[11px]">{isAr ? "وصف الصورة (تعليق)" : "Caption"}</Label>
                <Textarea
                  rows={2}
                  value={captionAr}
                  onChange={(e) => setCaptionAr(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">
                  {isAr ? "النص البديل (لذوي الإعاقة البصرية)" : "Alt text (accessibility)"}
                </Label>
                <Input
                  value={altAr}
                  onChange={(e) => setAltAr(e.target.value)}
                  className="text-xs h-7"
                />
              </div>
              <Button
                size="sm"
                className="w-full h-7 text-[11px]"
                onClick={() => {
                  onSaveCaption(captionAr, captionEn, altAr, altEn);
                  setEditOpen(false);
                }}
              >
                {isAr ? "حفظ" : "Save"}
              </Button>
            </PopoverContent>
          </Popover>
          <Button
            variant="secondary"
            size="icon"
            className="w-7 h-7 rounded-full text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
