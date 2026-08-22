import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/i18n/LanguageProvider";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Image as ImageIcon, X, Link as LinkIcon, Loader2, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export interface ImageUploadInputProps {
  label?: string;
  value?: string | null;
  onChange: (url: string) => void;
  bucket?: string;
  placeholder?: string;
  helperText?: string;
  allowPdf?: boolean;
  hidePreview?: boolean;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export function ImageUploadInput({
  label,
  value,
  onChange,
  bucket = "site-media",
  placeholder,
  helperText,
  allowPdf = true,
  hidePreview = false,
  accept,
  maxSizeMB = 25,
  className = "",
}: ImageUploadInputProps) {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // SVG files can embed <script> and are a stored-XSS vector when later
  // rendered inline or served back with an image content-type, so they are
  // excluded from the accepted image types for this general-purpose upload
  // input (none of its current uses need vector/logo uploads).
  const fileAccept =
    accept || (allowPdf ? "image/png,image/jpeg,image/webp,image/gif,application/pdf,.pdf" : "image/png,image/jpeg,image/webp,image/gif");
  const isPdf = value ? (value.toLowerCase().includes(".pdf") || value.toLowerCase().endsWith(".pdf")) : false;

  const processFile = async (file: File) => {
    const isFilePdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isSvg = file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
    const isImage = file.type.startsWith("image/") && !isSvg;

    if (isSvg) {
      toast.error(
        isAr
          ? "ملفات SVG غير مسموح بها لأسباب أمنية. يرجى استخدام PNG أو JPG أو WebP"
          : "SVG files are not allowed for security reasons. Please use PNG, JPG, or WebP"
      );
      return;
    }

    if (!isImage && !(allowPdf && isFilePdf)) {
      toast.error(
        allowPdf
          ? isAr
            ? "يرجى اختيار ملف صالح (PDF أو صورة PNG, JPG, WebP)"
            : "Please choose a valid PDF or image file (PNG, JPG, WebP)"
          : isAr
            ? "يرجى اختيار ملف صورة صالح (PNG, JPG, WebP)"
            : "Please choose a valid image file"
      );
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(
        isAr
          ? `حجم الملف يتجاوز الحد الأقصى المسموح به (${maxSizeMB} ميغابايت)`
          : `File size exceeds ${maxSizeMB}MB limit`
      );
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop() || (isFilePdf ? "pdf" : "png");
      const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const storagePath = `uploads/${cleanFileName}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type || (isFilePdf ? "application/pdf" : undefined),
      });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
      onChange(urlData.publicUrl);
      toast.success(
        isFilePdf
          ? isAr
            ? "تم رفع ملف الـ PDF بنجاح"
            : "PDF document uploaded successfully"
          : isAr
            ? "تم رفع الصورة بنجاح"
            : "Image uploaded successfully"
      );
    } catch (err: any) {
      console.error("Storage upload failed:", err);
      toast.error(err.message || (isAr ? "فشل رفع الملف إلى وحدة التخزين" : "Failed to upload file to storage"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-foreground">{label}</Label>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            <LinkIcon className="w-3 h-3" />
            {showUrlInput
              ? isAr
                ? "إخفاء إدخال الرابط"
                : "Hide URL input"
              : isAr
                ? "إدخال رابط مخصص"
                : "Enter custom URL"}
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={fileAccept}
        onChange={handleFileSelected}
        className="hidden"
      />

      <div className="flex flex-col gap-2.5">
        {value ? (
          <div className="relative group flex items-center gap-3 p-2.5 bg-muted/40 rounded-xl border border-border">
            {!hidePreview && (
              isPdf ? (
                <div className="relative w-16 h-16 rounded-lg bg-rose-500/10 border border-rose-500/20 shrink-0 flex flex-col items-center justify-center shadow-xs">
                  <FileText className="w-6 h-6 text-rose-500" />
                  <Badge variant="destructive" className="h-3.5 px-1 text-[8px] font-mono mt-0.5">
                    PDF
                  </Badge>
                </div>
              ) : (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-background border border-border shrink-0 flex items-center justify-center shadow-xs">
                  <img
                    src={value}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <ImageIcon className="w-5 h-5 text-muted-foreground/40 -z-10 absolute" />
                </div>
              )
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                  {isPdf ? "PDF" : isAr ? "صورة" : "Image"}
                </Badge>
                <span className="truncate text-[11px] text-muted-foreground font-mono" dir="ltr" title={value}>
                  {value.split("/").pop() || (isAr ? "ملف مرفوع" : "Uploaded file")}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px] px-2.5 gap-1 rounded-lg"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                  {isPdf
                    ? isAr
                      ? "استبدال ملف PDF"
                      : "Replace PDF"
                    : isAr
                      ? "استبدال الصورة"
                      : "Replace Image"}
                </Button>

                {isPdf && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px] px-2.5 gap-1 rounded-lg text-primary"
                    onClick={() => window.open(value, "_blank")}
                  >
                    <ExternalLink className="w-3 h-3" />
                    {isAr ? "معاينة الملف" : "View PDF"}
                  </Button>
                )}

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 text-[11px] px-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                  onClick={() => onChange("")}
                >
                  <X className="w-3.5 h-3.5 me-1" />
                  {isAr ? "إزالة" : "Remove"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`cursor-pointer border-2 border-dashed transition-all rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-center group ${
              isDragging
                ? "border-primary bg-primary/10 scale-[1.01]"
                : "border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/40"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center group-hover:scale-110 transition-transform text-muted-foreground group-hover:text-primary shadow-xs">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Upload className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                {uploading
                  ? isAr
                    ? "جاري رفع الملف إلى التخزين..."
                    : "Uploading to storage..."
                  : allowPdf
                    ? isAr
                      ? "انقر لاختيار ملف أو اسحب وأفلت هنا"
                      : "Click to upload file or drag and drop here"
                    : isAr
                      ? "انقر لاختيار صورة أو اسحب وأفلت الملف هنا"
                      : "Click to upload or drag and drop image here"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {allowPdf ? `PDF, PNG, JPG, WebP (حتى ${maxSizeMB}MB)` : `PNG, JPG, WebP (حتى ${maxSizeMB}MB)`}
              </p>
            </div>
          </div>
        )}

        {showUrlInput && (
          <div className="space-y-1">
            <Input
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder={
                placeholder ||
                (allowPdf
                  ? isAr
                    ? "أو الصق رابط الملف أو الـ PDF المباشر هنا (URL)..."
                    : "Or paste direct document or PDF URL..."
                  : isAr
                    ? "أو الصق رابط الصورة المباشر هنا (URL)..."
                    : "Or paste direct image URL...")
              }
              className="text-xs font-mono h-8 rounded-lg"
            />
          </div>
        )}
      </div>

      {helperText && <p className="text-[11px] text-muted-foreground">{helperText}</p>}
    </div>
  );
}

