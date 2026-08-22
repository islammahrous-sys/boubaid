import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit2, History, MapPin, Image as ImageIcon } from "lucide-react";
import { ImageUploadInput } from "@/components/console/media/ImageUploadInput";
import { useLang } from "@/i18n/LanguageProvider";
import type { FamilyHistoryInput } from "@/lib/admin-hub.schemas";
import type { PlaceOption } from "./FamilyMemberFormDialog";

export type HistoryItem = {
  id: string;
  title_ar: string;
  title_en?: string | null;
  description_ar?: string | null;
  description_en?: string | null;
  date?: string | null;
  date_end?: string | null;
  place_id?: string | null;
  media_path?: string | null;
  sort_order: number;
  visibility: "public" | "family_only" | "admin_only" | "private";
};

export function FamilyHistoryManager({
  historyItems,
  places,
  onSaveHistory,
}: {
  historyItems: HistoryItem[];
  places: PlaceOption[];
  onSaveHistory: (data: FamilyHistoryInput) => Promise<void>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const [formOpen, setFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<FamilyHistoryInput>({
    id: undefined,
    title_ar: "",
    title_en: "",
    description_ar: "",
    description_en: "",
    date: "",
    date_end: "",
    place_id: null,
    media_path: null,
    sort_order: 0,
    visibility: "public",
  });

  const handleOpenAdd = () => {
    setSelectedItem(null);
    setForm({
      id: undefined,
      title_ar: "",
      title_en: "",
      description_ar: "",
      description_en: "",
      date: "",
      date_end: "",
      place_id: null,
      media_path: null,
      sort_order: historyItems.length,
      visibility: "public",
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (item: HistoryItem) => {
    setSelectedItem(item);
    setForm({
      id: item.id,
      title_ar: item.title_ar,
      title_en: item.title_en ?? "",
      description_ar: item.description_ar ?? "",
      description_en: item.description_en ?? "",
      date: item.date ?? "",
      date_end: item.date_end ?? "",
      place_id: item.place_id ?? null,
      media_path: item.media_path ?? null,
      sort_order: item.sort_order,
      visibility: item.visibility,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSaveHistory(form);
      setFormOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2.5">
          <History className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            {isAr ? "سجل تاريخ الأسرة والمحطات التاريخية" : "Family History & Timeline"}
          </h3>
        </div>
        <Button size="sm" onClick={handleOpenAdd} className="h-8 text-xs gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          {isAr ? "إضافة محطة تاريخية" : "Add Timeline Entry"}
        </Button>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs">
              <TableHead>{isAr ? "العنوان التاريخي" : "Title"}</TableHead>
              <TableHead>{isAr ? "الفترة / التاريخ" : "Date Period"}</TableHead>
              <TableHead>{isAr ? "المكان المرتبط" : "Place"}</TableHead>
              <TableHead className="text-center">{isAr ? "الترتيب" : "Order"}</TableHead>
              <TableHead className="text-end">{isAr ? "إجراء" : "Action"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center text-muted-foreground text-xs">
                  {isAr ? "لا توجد محطات تاريخية مسجلة" : "No history entries"}
                </TableCell>
              </TableRow>
            ) : (
              historyItems.map((h) => (
                <TableRow key={h.id} className="text-xs hover:bg-muted/30">
                  <TableCell className="font-semibold text-foreground">
                    <div className="flex items-center gap-2.5">
                      {h.media_path ? (
                        <div className="w-8 h-8 rounded-lg border border-border overflow-hidden shrink-0 bg-muted/20">
                          <img src={h.media_path} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : null}
                      <span>{h.title_ar}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">{h.date || "—"}</TableCell>
                  <TableCell>{places.find((p) => p.id === h.place_id)?.name_ar || "—"}</TableCell>
                  <TableCell className="text-center font-mono">{h.sort_order}</TableCell>
                  <TableCell className="text-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenEdit(h)}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {selectedItem ? (isAr ? "تعديل محطة تاريخية" : "Edit History Entry") : isAr ? "إضافة محطة تاريخية" : "Add Entry"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "العنوان بالعربية *" : "Title (AR) *"}</Label>
              <Input
                required
                value={form.title_ar}
                onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
                placeholder="مثال: وثيقة وقف الصالحية التاريخية"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "العنوان (EN)" : "Title (EN)"}</Label>
              <Input
                value={form.title_en ?? ""}
                onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                placeholder="e.g. Historic Waqf Deed"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "التاريخ / السنة" : "Date / Year"}</Label>
                <Input
                  value={form.date ?? ""}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  placeholder="مثال: 1345 هـ / 1926 م"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "ترتيب العرض" : "Sort Order"}</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            {/* Media Upload */}
            <div className="space-y-1 pt-1 border-t border-border">
              <Label className="text-xs font-semibold">{isAr ? "صورة أو وثيقة المحطة التاريخية" : "Historical Media / Photo"}</Label>
              <ImageUploadInput
                bucket="site-media"
                value={form.media_path}
                onChange={(url) => setForm({ ...form, media_path: url })}
                placeholder={isAr ? "رابط الصورة أو ارفع صورة..." : "Image URL or upload..."}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "الوصف والتفاصيل التاريخية" : "Historical Description"}</Label>
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
                {loading ? (isAr ? "جاري الحفظ..." : "Saving...") : isAr ? "حفظ" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
