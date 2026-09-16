import { useState, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLang } from "@/i18n/LanguageProvider";
import { supabase } from "@/integrations/supabase/client";
import {
  Image as ImageIcon,
  Upload,
  Search,
  Check,
  FileText,
  ExternalLink,
  Loader2,
  HardDrive,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { registerMediaAsset } from "@/lib/admin-hub.functions";
import { cn } from "@/lib/utils";

export type MediaItem = {
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
  caption_ar?: string | null;
  created_at: string;
};

interface MediaPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (urlOrPath: string, item?: MediaItem) => void;
  currentValue?: string | null;
  defaultBucket?: string;
  allowPdf?: boolean;
}

const BUCKETS = [
  { id: "all", label_ar: "جميع الوسائط", label_en: "All Media" },
  { id: "site-media", label_ar: "وسائط الموقع", label_en: "Site Media" },
  { id: "family-photos", label_ar: "صور العائلة", label_en: "Family Photos" },
  { id: "galleries", label_ar: "المعارض والمتحف", label_en: "Galleries & Museum" },
  { id: "documents-public", label_ar: "الوثائق العامة", label_en: "Public Docs" },
];

export function MediaPickerModal({
  open,
  onOpenChange,
  onSelect,
  currentValue,
  defaultBucket = "site-media",
  allowPdf = true,
}: MediaPickerModalProps) {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [selectedBucket, setSelectedBucket] = useState("all");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  // Uploading state
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveMedia = useServerFn(registerMediaAsset);

  // Load assets when dialog opens
  useEffect(() => {
    if (!open) return;
    let isMounted = true;

    async function loadAssets() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("media_assets")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(80);

        if (error) throw error;
        if (isMounted && data) {
          setItems(data as MediaItem[]);
        }
      } catch (err: any) {
        console.error("Failed to load media assets", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void loadAssets();
    return () => {
      isMounted = false;
    };
  }, [open]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedBucket !== "all" && item.bucket !== selectedBucket) {
        return false;
      }
      if (!allowPdf && item.mime_type === "application/pdf") {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = item.file_name.toLowerCase().includes(q);
        const matchAlt = item.alt_text_ar?.toLowerCase().includes(q);
        const matchOrig = item.original_file_name?.toLowerCase().includes(q);
        if (!matchName && !matchAlt && !matchOrig) return false;
      }
      return true;
    });
  }, [items, selectedBucket, search, allowPdf]);

  const getItemUrl = (item: MediaItem) => {
    if (item.public_url) return item.public_url;
    const { data } = supabase.storage.from(item.bucket).getPublicUrl(item.storage_path);
    return data.publicUrl;
  };

  const handleUploadFile = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const targetBucket = selectedBucket === "all" ? defaultBucket : selectedBucket;

    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/") && !file.type.includes("svg");

    if (!isImage && !(allowPdf && isPdf)) {
      toast.error(
        isAr
          ? "يرجى اختيار صورة صالحة (PNG, JPG, WebP) أو PDF"
          : "Please choose a valid image or PDF",
      );
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error(isAr ? "حجم الملف يتجاوز 25 ميغابايت" : "File exceeds 25MB limit");
      return;
    }

    setUploading(true);
    try {
      // Auto-detect image dimensions
      let width: number | undefined;
      let height: number | undefined;

      if (isImage) {
        await new Promise<void>((resolve) => {
          const img = new window.Image();
          img.onload = () => {
            width = img.naturalWidth;
            height = img.naturalHeight;
            resolve();
          };
          img.onerror = () => resolve();
          img.src = URL.createObjectURL(file);
        });
      }

      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storagePath = `${Date.now()}-${cleanName}`;

      const { error: uploadErr } = await supabase.storage
        .from(targetBucket)
        .upload(storagePath, file);
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from(targetBucket).getPublicUrl(storagePath);
      const publicUrl = urlData.publicUrl;

      const regResult = await saveMedia({
        data: {
          bucket: targetBucket,
          storage_path: storagePath,
          file_name: cleanName,
          original_file_name: file.name,
          mime_type: file.type || "application/octet-stream",
          file_size: file.size,
          width: width ?? null,
          height: height ?? null,
        },
      });

      const newItem: MediaItem = (regResult as any)?.asset || {
        id: crypto.randomUUID(),
        bucket: targetBucket,
        storage_path: storagePath,
        file_name: cleanName,
        original_file_name: file.name,
        public_url: publicUrl,
        mime_type: file.type || "application/octet-stream",
        file_size: file.size,
        width,
        height,
        created_at: new Date().toISOString(),
      };

      setItems((prev) => [newItem, ...prev]);
      setSelectedItem(newItem);
      setActiveTab("library");
      toast.success(isAr ? "تم رفع وتسجيل الملف بنجاح" : "Asset uploaded and cataloged");
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل رفع الملف" : "Failed to upload file"));
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmSelection = () => {
    if (!selectedItem) return;
    const url = getItemUrl(selectedItem);
    onSelect(url, selectedItem);
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-3xl border border-border">
        <DialogHeader className="p-5 pb-3 border-b border-border/40">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  {isAr ? "مكتبة الوسائط والملفات" : "Media & Document Library"}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  {isAr
                    ? "اختر ملفاً محفوظاً أو ارفع صورة جديدة بدون مغادرة الصفحة"
                    : "Select an existing asset or upload a new one seamlessly"}
                </p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="h-8 p-0.5 bg-muted/60">
                <TabsTrigger value="library" className="text-xs h-7 gap-1 px-3">
                  <HardDrive className="w-3 h-3" />
                  {isAr ? "المكتبة" : "Library"}
                </TabsTrigger>
                <TabsTrigger value="upload" className="text-xs h-7 gap-1 px-3">
                  <Upload className="w-3 h-3" />
                  {isAr ? "رفع جديد" : "Upload"}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </DialogHeader>

        {activeTab === "library" ? (
          <div className="flex-1 flex flex-col p-5 overflow-hidden gap-4">
            {/* Search & Filter bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={isAr ? "بحث في اسم الملف أو الوصف..." : "Search media..."}
                  className="ps-9 h-8.5 text-xs rounded-xl"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {BUCKETS.map((b) => (
                  <Button
                    key={b.id}
                    type="button"
                    variant={selectedBucket === b.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedBucket(b.id)}
                    className="h-7 text-[11px] px-2.5 rounded-lg shrink-0"
                  >
                    {isAr ? b.label_ar : b.label_en}
                  </Button>
                ))}
              </div>
            </div>

            {/* Media Grid */}
            <div className="flex-1 overflow-y-auto min-h-[300px] border border-border/60 rounded-2xl p-3 bg-muted/10">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-52 text-muted-foreground gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-xs">
                    {isAr ? "جارٍ تحميل الوسائط..." : "Loading media..."}
                  </span>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-52 text-muted-foreground gap-2 text-center p-4">
                  <ImageIcon className="w-8 h-8 stroke-1 text-muted-foreground/50" />
                  <p className="text-xs font-medium">
                    {isAr ? "لا توجد وسائط مطابقة لمعايير البحث" : "No matching assets found"}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab("upload")}
                    className="h-7 text-xs gap-1 mt-1 rounded-lg"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{isAr ? "رفع صورة الآن" : "Upload Now"}</span>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {filteredItems.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    const url = getItemUrl(item);
                    const isPdf = item.mime_type === "application/pdf";

                    return (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedItem(item)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedItem(item);
                          }
                        }}
                        className={cn(
                          "group relative flex flex-col border rounded-xl overflow-hidden cursor-pointer transition-all bg-card hover:border-primary/60",
                          isSelected
                            ? "border-primary ring-2 ring-primary/30 shadow-sm"
                            : "border-border/70",
                        )}
                      >
                        {/* Thumbnail */}
                        <div className="aspect-square bg-muted/40 flex items-center justify-center overflow-hidden relative">
                          {isPdf ? (
                            <div className="flex flex-col items-center gap-1 text-muted-foreground p-2 text-center">
                              <FileText className="w-8 h-8 text-destructive/80" />
                              <span className="text-[10px] font-mono line-clamp-1">PDF</span>
                            </div>
                          ) : (
                            <img
                              src={url}
                              alt={item.alt_text_ar || item.file_name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              loading="lazy"
                            />
                          )}

                          {isSelected && (
                            <div className="absolute top-1.5 end-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        {/* Caption & Metadata */}
                        <div className="p-2 space-y-0.5">
                          <p
                            className="text-[11px] font-medium text-foreground truncate"
                            title={item.file_name}
                          >
                            {item.alt_text_ar || item.file_name}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                            <span>{formatFileSize(item.file_size)}</span>
                            {item.width && item.height && (
                              <span>
                                {item.width}×{item.height}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected preview bar */}
            {selectedItem && (
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-primary/20 bg-primary/5 text-xs">
                <div className="flex items-center gap-2.5 truncate">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-semibold truncate">
                    {selectedItem.alt_text_ar || selectedItem.file_name}
                  </span>
                  <Badge variant="outline" className="text-[9px] font-mono h-4">
                    {formatFileSize(selectedItem.file_size)}
                  </Badge>
                  {selectedItem.width && selectedItem.height && (
                    <Badge variant="outline" className="text-[9px] font-mono h-4">
                      {selectedItem.width}×{selectedItem.height}
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={handleConfirmSelection}
                  className="h-7 text-xs font-bold gap-1 rounded-lg bg-primary text-primary-foreground shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isAr ? "اختيار هذا الملف" : "Select Asset"}</span>
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Upload Tab */
          <div className="flex-1 p-6 flex flex-col items-center justify-center">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                void handleUploadFile(e.dataTransfer.files);
              }}
              className={cn(
                "w-full max-w-lg border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-3 transition-colors",
                dragActive
                  ? "border-primary bg-primary/10"
                  : "border-border/80 bg-muted/20 hover:bg-muted/30",
              )}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                {uploading ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : (
                  <Upload className="w-7 h-7" />
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">
                  {isAr ? "اسحب الملف وأفلته هنا للرفع" : "Drag and drop your file here"}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {isAr
                    ? "يدعم PNG, JPG, WebP و PDF حتى 25 ميغابايت"
                    : "Supports PNG, JPG, WebP, and PDF up to 25MB"}
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept={
                  allowPdf
                    ? "image/png,image/jpeg,image/webp,image/gif,application/pdf"
                    : "image/png,image/jpeg,image/webp,image/gif"
                }
                className="hidden"
                onChange={(e) => void handleUploadFile(e.target.files)}
              />

              <Button
                type="button"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="h-8 text-xs font-semibold gap-1.5 rounded-xl mt-2"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {uploading
                    ? isAr
                      ? "جارٍ الرفع..."
                      : "Uploading..."
                    : isAr
                      ? "تصفح من جهازك"
                      : "Browse Files"}
                </span>
              </Button>
            </div>
          </div>
        )}

        <DialogFooter className="p-4 border-t border-border/40 bg-muted/20 flex flex-row items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs rounded-xl"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </Button>

          {activeTab === "library" && selectedItem && (
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmSelection}
              className="h-8 text-xs font-bold gap-1 rounded-xl bg-primary text-primary-foreground"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isAr ? "تأكيد الاختيار" : "Confirm Selection"}</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
