import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/i18n/LanguageProvider";
import { supabase } from "@/integrations/supabase/client";
import { Image as ImageIcon, Upload, Search, Copy, Check, Filter, FileText, HardDrive, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { MediaAssetInput } from "@/lib/admin-hub.schemas";

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
  caption_ar?: string | null;
  created_at: string;
};

export function MediaLibrary({
  mediaAssets,
  onRegisterMedia,
}: {
  mediaAssets: MediaAssetRow[];
  onRegisterMedia: (data: MediaAssetInput) => Promise<void>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const [selectedBucket, setSelectedBucket] = useState("all");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const BUCKETS = [
    { id: "family-photos", label_ar: "صور العائلة والأفراد", label_en: "Family Photos" },
    { id: "site-media", label_ar: "وسائط الموقع والصفحات", label_en: "Site Media" },
    { id: "galleries", label_ar: "ألبومات المعارض", label_en: "Galleries" },
    { id: "documents-public", label_ar: "الوثائق واللوائح العامة", label_en: "Public Documents" },
    { id: "documents-private", label_ar: "الوثائق الخاصة والمحمية", label_en: "Private Documents" },
    { id: "avatars", label_ar: "الصور الرمزية (Avatars)", label_en: "Avatars" },
    { id: "media", label_ar: "الوسائط العامة", label_en: "General Media" },
  ];

  const MAX_FILE_SIZE = 25 * 1024 * 1024;

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const bucket = selectedBucket === "all" ? "site-media" : selectedBucket;

    const oversized = Array.from(files).filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      toast.error(
        isAr
          ? `${oversized.length} ملف يتجاوز الحد الأقصى (25 ميغابايت) ولم يُرفع`
          : `${oversized.length} file(s) exceed the 25MB limit and were not uploaded`,
      );
    }
    const toUpload = Array.from(files).filter((f) => f.size <= MAX_FILE_SIZE);
    if (toUpload.length === 0) return;

    setUploading(true);
    let succeeded = 0;
    let failed = 0;
    for (const file of toUpload) {
      try {
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const storagePath = `${Date.now()}-${cleanName}`;

        const { error: uploadErr } = await supabase.storage.from(bucket).upload(storagePath, file);
        if (uploadErr) throw uploadErr;

        await onRegisterMedia({
          bucket,
          storage_path: storagePath,
          file_name: cleanName,
          original_file_name: file.name,
          mime_type: file.type || "application/octet-stream",
          file_size: file.size,
        });
        succeeded++;
      } catch (err: any) {
        console.error("Failed to upload file:", file.name, err);
        failed++;
      }
    }
    setUploading(false);

    if (succeeded > 0) {
      toast.success(
        isAr ? `تم رفع ${succeeded} ملف بنجاح` : `Uploaded ${succeeded} file(s) successfully`,
      );
    }
    if (failed > 0) {
      toast.error(
        isAr ? `فشل رفع ${failed} ملف` : `Failed to upload ${failed} file(s)`,
      );
    }
  };

  const getMediaUrl = (asset: MediaAssetRow) => {
    if (asset.public_url) return asset.public_url;
    const { data } = supabase.storage.from(asset.bucket).getPublicUrl(asset.storage_path);
    return data.publicUrl;
  };

  const handleCopyUrl = async (asset: MediaAssetRow) => {
    const url = getMediaUrl(asset);
    await navigator.clipboard.writeText(url);
    setCopiedId(asset.id);
    toast.success(isAr ? "تم نسخ رابط الملف" : "File URL copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const filteredAssets = mediaAssets.filter((a) => {
    const matchBucket = selectedBucket === "all" || a.bucket === selectedBucket;
    const matchSearch =
      !search ||
      a.file_name.toLowerCase().includes(search.toLowerCase()) ||
      (a.caption_ar && a.caption_ar.toLowerCase().includes(search.toLowerCase()));
    return matchBucket && matchSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? "بحث في الملفات والوسائط..." : "Search media..."}
              className="ps-9 h-9 text-xs"
            />
          </div>

          <Select value={selectedBucket} onValueChange={setSelectedBucket}>
            <SelectTrigger className="h-9 w-[180px] text-xs">
              <Filter className="w-3.5 h-3.5 me-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isAr ? "جميع حاويات التخزين" : "All Buckets"}</SelectItem>
              {BUCKETS.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {isAr ? b.label_ar : b.label_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-xs">
            <Upload className="w-4 h-4" />
            {uploading ? (isAr ? "جاري الرفع..." : "Uploading...") : isAr ? "رفع وسائط وملفات PDF" : "Upload Media / PDF"}
            <input
              type="file"
              multiple
              accept="image/*,application/pdf,.pdf"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </label>
        </div>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-16 text-center text-xs text-muted-foreground bg-card">
          <ImageIcon className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
          <p>{isAr ? "لا توجد وسائط مسجلة في هذا القسم" : "No media assets found"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredAssets.map((asset) => {
            const isPdf = asset.mime_type === "application/pdf" || asset.file_name.toLowerCase().endsWith(".pdf");
            const isImage = asset.mime_type.startsWith("image/");
            const url = getMediaUrl(asset);

            return (
              <div
                key={asset.id}
                className="group relative border border-border rounded-xl bg-card overflow-hidden hover:border-primary/50 transition-all shadow-sm flex flex-col"
              >
                <div className="aspect-square bg-muted/40 relative flex items-center justify-center overflow-hidden">
                  {isPdf ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-rose-500/5 p-2 text-center">
                      <FileText className="w-10 h-10 text-rose-500 mb-1" />
                      <Badge variant="destructive" className="h-4 px-1.5 text-[9px] font-mono">
                        PDF
                      </Badge>
                    </div>
                  ) : isImage ? (
                    <img src={url} alt={asset.file_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="w-8 h-8 rounded-full shadow"
                      onClick={() => handleCopyUrl(asset)}
                      title={isAr ? "نسخ الرابط المباشر" : "Copy URL"}
                    >
                      {copiedId === asset.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="w-8 h-8 rounded-full shadow"
                      onClick={() => window.open(url, "_blank")}
                      title={isAr ? "معاينة الملف" : "View File"}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="p-2.5 text-xs flex-1 flex flex-col justify-between">
                  <p className="font-semibold text-foreground truncate" title={asset.file_name}>
                    {asset.file_name}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 font-mono">
                      {asset.bucket}
                    </Badge>
                    <span className="font-mono">{formatFileSize(asset.file_size)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
