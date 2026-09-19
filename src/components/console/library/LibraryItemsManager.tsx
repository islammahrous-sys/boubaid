import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLang } from "@/i18n/LanguageProvider";
import { useConfirm } from "@/hooks/useConfirm";
import {
  Plus,
  Edit2,
  Trash2,
  Library,
  FileText,
  Image as ImageIcon,
  Video,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { ImageUploadInput } from "@/components/console/media/ImageUploadInput";
import type { LibraryItemInput } from "@/lib/admin-hub.schemas";

export type LibraryItemRow = {
  id: string;
  collection: string;
  title_ar: string;
  title_en?: string | null;
  description_ar?: string | null;
  description_en?: string | null;
  year?: number | null;
  kind?: string | null;
  reference?: string | null;
  file_path?: string | null;
  external_url?: string | null;
  sort_order: number;
  is_published: boolean;
};

export function LibraryItemsManager({
  libraryItems,
  onSaveLibraryItem,
  onDeleteLibraryItem,
}: {
  libraryItems: LibraryItemRow[];
  onSaveLibraryItem: (data: LibraryItemInput) => Promise<void>;
  onDeleteLibraryItem: (id: string) => Promise<void>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const confirm = useConfirm();

  const [collectionFilter, setCollectionFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LibraryItemRow | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<LibraryItemInput>({
    id: undefined,
    collection: "documents",
    title_ar: "",
    title_en: "",
    description_ar: "",
    description_en: "",
    year: new Date().getFullYear(),
    kind: "PDF",
    reference: "",
    file_path: "",
    external_url: "",
    sort_order: 0,
    is_published: true,
  });

  const handleOpenAdd = () => {
    setSelectedItem(null);
    const collection = collectionFilter === "all" ? "documents" : (collectionFilter as any);
    setForm({
      id: undefined,
      collection,
      title_ar: "",
      title_en: "",
      description_ar: "",
      description_en: "",
      year: 1447,
      // `kind` means something different per collection (see the label logic
      // below) — default it to a sensible starting value for whichever
      // collection this new item was opened in, not always the document format.
      kind: collection === "recordings" ? "" : collection === "photographs" ? "" : "PDF",
      reference: "",
      file_path: "",
      external_url: "",
      sort_order: libraryItems.length,
      is_published: true,
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (item: LibraryItemRow) => {
    setSelectedItem(item);
    setForm({
      id: item.id,
      collection: item.collection as any,
      title_ar: item.title_ar,
      title_en: item.title_en ?? "",
      description_ar: item.description_ar ?? "",
      description_en: item.description_en ?? "",
      year: item.year ?? null,
      kind: item.kind ?? "",
      reference: item.reference ?? "",
      file_path: item.file_path ?? "",
      external_url: item.external_url ?? "",
      sort_order: item.sort_order,
      is_published: item.is_published,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title_ar.trim()) return;
    try {
      setLoading(true);
      await onSaveLibraryItem(form);
      setFormOpen(false);
      toast.success(isAr ? "تم حفظ الوثيقة / الوسيط بنجاح" : "Archive item saved");
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل الحفظ" : "Failed to save"));
    } finally {
      setLoading(false);
    }
  };

  const filtered = libraryItems.filter((item) => {
    return collectionFilter === "all" || item.collection === collectionFilter;
  });

  const getCollectionIcon = (col: string) => {
    switch (col) {
      case "photographs":
        return <ImageIcon className="w-3.5 h-3.5 text-pink-500" />;
      case "recordings":
        return <Video className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2.5">
          <Library className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            {isAr ? "إدارة المكتبة الرقمية والأرشيف التراثي" : "Digital Library & Heritage Archive"}
          </h3>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <Select value={collectionFilter} onValueChange={setCollectionFilter}>
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isAr ? "جميع المجموعات" : "All Collections"}</SelectItem>
              <SelectItem value="documents">{isAr ? "الوثائق واللوائح" : "Documents"}</SelectItem>
              <SelectItem value="photographs">
                {isAr ? "الصور التاريخية" : "Photographs"}
              </SelectItem>
              <SelectItem value="recordings">
                {isAr ? "التسجيلات المرئية" : "Recordings"}
              </SelectItem>
              <SelectItem value="templates">
                {isAr ? "النماذج و القوالب" : "Forms & Templates"}
              </SelectItem>
              <SelectItem value="templates_editable">
                {isAr
                  ? "قوالب المناسبات القابلة للتحرير يدويًا"
                  : "Occasions Manual Editable Templates"}
              </SelectItem>
              <SelectItem value="visual_identity">
                {isAr ? "هوية المجلس البصرية" : "Visual Identity"}
              </SelectItem>
              <SelectItem value="collaterals">
                {isAr ? "المواد التعريفية" : "Collaterals"}
              </SelectItem>
              <SelectItem value="videos">{isAr ? "الفيديوهات" : "Videos"}</SelectItem>
              <SelectItem value="financials">
                {isAr ? "القوائم المالية وكشوف الحسابات" : "Financial statements"}
              </SelectItem>
            </SelectContent>
          </Select>

          <Button size="sm" onClick={handleOpenAdd} className="h-8 text-xs gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            {isAr ? "إضافة وثيقة / مادة" : "Add Item"}
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs">
              <TableHead>{isAr ? "المجموعة والعنوان" : "Collection & Title"}</TableHead>
              <TableHead>{isAr ? "المرجع" : "Ref."}</TableHead>
              <TableHead className="text-center">{isAr ? "السنة" : "Year"}</TableHead>
              <TableHead className="text-center">{isAr ? "النوع" : "Kind"}</TableHead>
              <TableHead className="text-center">{isAr ? "الترتيب" : "Order"}</TableHead>
              <TableHead className="text-end">{isAr ? "إجراءات" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-muted-foreground text-xs">
                  {isAr ? "لا توجد مواد في هذه المجموعة" : "No items found"}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id} className="text-xs hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      {item.file_path &&
                      (item.file_path.endsWith(".jpg") ||
                        item.file_path.endsWith(".jpeg") ||
                        item.file_path.endsWith(".png") ||
                        item.file_path.endsWith(".webp")) ? (
                        <div className="w-8 h-8 rounded-lg border border-border overflow-hidden shrink-0 bg-muted/20">
                          <img src={item.file_path} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        getCollectionIcon(item.collection)
                      )}
                      <div>
                        <span className="font-semibold text-foreground block">{item.title_ar}</span>
                        {item.title_en && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {item.title_en}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    {item.reference || "—"}
                  </TableCell>
                  <TableCell className="text-center font-mono">{item.year || "—"}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {item.kind || "DOC"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-mono">{item.sort_order}</TableCell>
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-muted-foreground hover:text-foreground"
                        onClick={() => handleOpenEdit(item)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                        onClick={async () => {
                          if (
                            !(await confirm({
                              title: isAr
                                ? `حذف مادة "${item.title_ar}"؟`
                                : `Delete "${item.title_ar}"?`,
                              description: isAr
                                ? "سيتم حذف هذه المادة الأرشيفية وملفها المرفق نهائيًا من المكتبة الرقمية ولا يمكن التراجع عن هذا الإجراء."
                                : "This archive item and its attached file will be permanently removed from the digital library. This can't be undone.",
                              tone: "destructive",
                            }))
                          )
                            return;
                          onDeleteLibraryItem(item.id);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {selectedItem
                ? isAr
                  ? "تعديل مادة أرشيفية"
                  : "Edit Archive Item"
                : isAr
                  ? "إضافة مادة أرشيفية جديدة"
                  : "Add Archive Item"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "المجموعة الأرشيفية *" : "Collection *"}</Label>
                <Select
                  value={form.collection}
                  onValueChange={(val: any) => setForm({ ...form, collection: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="documents">
                      {isAr ? "الوثائق واللوائح (Documents)" : "Documents"}
                    </SelectItem>
                    <SelectItem value="photographs">
                      {isAr ? "المجموعة المصورة (Photographs)" : "Photographs"}
                    </SelectItem>
                    <SelectItem value="recordings">
                      {isAr ? "التسجيلات المرئية (Recordings)" : "Recordings"}
                    </SelectItem>
                    <SelectItem value="templates">
                      {isAr ? "النماذج و القوالب (Templates)" : "Forms & Templates"}
                    </SelectItem>
                    <SelectItem value="templates_editable">
                      {isAr
                        ? "قوالب المناسبات القابلة للتحرير يدويًا (Editable)"
                        : "Occasions Manual Editable Templates"}
                    </SelectItem>
                    <SelectItem value="videos">
                      {isAr ? "الفيديوهات (Videos)" : "Videos"}
                    </SelectItem>
                    <SelectItem value="financials">
                      {isAr
                        ? "القوائم المالية وكشوف الحسابات (Financials)"
                        : "Financial statements & accounts"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "رقم المرجع (Ref code)" : "Reference"}</Label>
                <Input
                  value={form.reference ?? ""}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  placeholder="مثال: BY-01"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "العنوان بالعربية *" : "Title (AR) *"}</Label>
              <Input
                required
                value={form.title_ar}
                onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
                placeholder="مثال: اللائحة الأساسية لصندوق التنمية العائلية"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "العنوان (EN)" : "Title (EN)"}</Label>
              <Input
                value={form.title_en ?? ""}
                onChange={(e) => setForm({ ...form, title_en: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "سنة الوثيقة / الإصدار" : "Year"}</Label>
                <Input
                  type="number"
                  value={form.year ?? ""}
                  onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || null })}
                />
              </div>
              <div className="space-y-1">
                {/* This single DB column (`kind`) is reused for three different
                    meanings depending on `collection` — the public library
                    page (src/routes/library.tsx via mergeLibrary) reads it as
                    the document format, the photo category pill, or the
                    recording's displayed duration respectively. The label and
                    placeholder must match whichever meaning is live, or an
                    editor will type a format string ("MP4") into what the
                    public page renders as a video's duration badge. */}
                <Label className="text-xs">
                  {form.collection === "recordings"
                    ? isAr
                      ? "المدة (مثال 12:34)"
                      : "Duration"
                    : form.collection === "photographs"
                      ? isAr
                        ? "تصنيف الصورة"
                        : "Category"
                      : isAr
                        ? "النوع والامتداد"
                        : "Kind / Format"}
                </Label>
                <Input
                  value={form.kind ?? ""}
                  onChange={(e) => setForm({ ...form, kind: e.target.value })}
                  placeholder={
                    form.collection === "recordings"
                      ? "12:34"
                      : form.collection === "photographs"
                        ? isAr
                          ? "مثال: الاجتماعات العامة"
                          : "e.g. General assemblies"
                        : "PDF / DOCX"
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "ترتيب الظهور" : "Sort Order"}</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            {form.collection === "videos" && (
              <div className="space-y-1 pt-1 border-t border-border">
                <Label className="text-xs font-semibold">
                  {isAr ? "رابط ملف الفيديو *" : "Video file URL *"}
                </Label>
                <Input
                  value={form.external_url ?? ""}
                  onChange={(e) => setForm({ ...form, external_url: e.target.value })}
                  placeholder="https://.../video.mp4"
                />
                <p className="text-[11px] text-muted-foreground">
                  {isAr
                    ? "يُشغّل المقطع مباشرة على الموقع، لذا يجب أن يكون الرابط لملف فيديو مرفوع على الموقع (mp4 أو webm أو mov)."
                    : "The clip plays directly on the site, so the link must point to a video file hosted on the site (mp4, webm or mov)."}
                </p>
                {(form.external_url ?? "").trim() !== "" &&
                  !/\.(mp4|webm|ogv|ogg|mov|m4v)(\?|#|$)/i.test(
                    (form.external_url ?? "").trim(),
                  ) && (
                    <p className="text-[11px] font-semibold text-destructive">
                      {isAr
                        ? "هذا الرابط ليس ملف فيديو، ولن يظهر المقطع في قسم الأرشيف ← الفيديوهات. روابط المنصات (مثل إنستغرام) غير مدعومة — يُرجى رفع ملف الفيديو واستخدام رابطه."
                        : "This is not a video file link, so the clip will not appear under Archive → Videos. Platform links (such as Instagram) are not supported — upload the video file and use its link."}
                    </p>
                  )}
              </div>
            )}

            {/* Visual File / Image / PDF Upload */}
            <div className="space-y-1 pt-1 border-t border-border">
              <Label className="text-xs font-semibold">
                {isAr
                  ? "الملف / الصورة / الوثيقة المرفقة (PDF / صور)"
                  : "Attached File / PDF Document / Photo"}
              </Label>
              <ImageUploadInput
                bucket="site-media"
                value={form.file_path}
                allowPdf={true}
                onChange={(url) => setForm({ ...form, file_path: url, external_url: url })}
                placeholder={
                  isAr
                    ? "رابط الوثيقة أو ارفع ملف PDF / صورة..."
                    : "Document URL or upload PDF/photo..."
                }
                helperText={
                  isAr
                    ? "يدعم رفع ملفات PDF واللوائح والصور والوثائق حتى 25 ميغابايت"
                    : "Supports PDF documents, bylaws, scans and photos up to 25MB"
                }
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "الوصف والإيضاح" : "Description"}</Label>
              <Textarea
                rows={3}
                value={form.description_ar ?? ""}
                onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setFormOpen(false)}>
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
                {loading
                  ? isAr
                    ? "جاري الحفظ..."
                    : "Saving..."
                  : isAr
                    ? "حفظ المادة"
                    : "Save Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
