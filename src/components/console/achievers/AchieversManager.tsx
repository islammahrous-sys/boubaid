import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLang } from "@/i18n/LanguageProvider";
import { useConfirm } from "@/hooks/useConfirm";
import { Plus, Edit2, Trash2, Award } from "lucide-react";
import { toast } from "sonner";
import { ImageUploadInput } from "@/components/console/media/ImageUploadInput";
import { SaudiCulturalAvatar } from "@/components/common/SaudiCulturalAvatar";
import type { AchieverInput } from "@/lib/admin-hub.schemas";

export type AchieverItem = {
  id: string;
  name_ar: string;
  name_en?: string | null;
  field_ar?: string | null;
  field_en?: string | null;
  achievement_ar?: string | null;
  achievement_en?: string | null;
  category: string;
  branch_ar?: string | null;
  branch_en?: string | null;
  image_path?: string | null;
  sort_order: number;
  is_published: boolean;
};

export function AchieversManager({
  achievers,
  onSaveAchiever,
  onDeleteAchiever,
}: {
  achievers: AchieverItem[];
  onSaveAchiever: (data: AchieverInput) => Promise<void>;
  onDeleteAchiever: (id: string) => Promise<void>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const confirm = useConfirm();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedAchiever, setSelectedAchiever] = useState<AchieverItem | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<AchieverInput>({
    id: undefined,
    name_ar: "",
    name_en: "",
    field_ar: "الطب والعلوم الصحية",
    field_en: "Medicine & Health Sciences",
    achievement_ar: "",
    achievement_en: "",
    category: "academic",
    branch_ar: "فرع الصالحية",
    branch_en: "Al-Salihiyah",
    sort_order: 0,
    is_published: true,
  });

  const handleOpenAdd = () => {
    setSelectedAchiever(null);
    setForm({
      id: undefined,
      name_ar: "",
      name_en: "",
      field_ar: "الطب والعلوم الصحية",
      field_en: "Medicine & Health Sciences",
      achievement_ar: "",
      achievement_en: "",
      category: "academic",
      branch_ar: "فرع الصالحية",
      branch_en: "Al-Salihiyah",
      sort_order: achievers.length,
      is_published: true,
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (item: AchieverItem) => {
    setSelectedAchiever(item);
    setForm({
      id: item.id,
      name_ar: item.name_ar,
      name_en: item.name_en ?? "",
      field_ar: item.field_ar ?? "",
      field_en: item.field_en ?? "",
      achievement_ar: item.achievement_ar ?? "",
      achievement_en: item.achievement_en ?? "",
      category: item.category,
      branch_ar: item.branch_ar ?? "",
      branch_en: item.branch_en ?? "",
      sort_order: item.sort_order,
      is_published: item.is_published,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name_ar.trim()) return;
    try {
      setLoading(true);
      await onSaveAchiever(form);
      setFormOpen(false);
      toast.success(isAr ? "تم حفظ سجل المتميز بنجاح" : "Achiever record saved");
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل الحفظ" : "Failed to save"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2.5">
          <Award className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            {isAr ? "سجل الكفاءات والمتميزين ولوحة الشرف" : "Register of Achievers & Roll of Honour"}
          </h3>
        </div>
        <Button size="sm" onClick={handleOpenAdd} className="h-8 text-xs gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          {isAr ? "إضافة متميز جديد" : "Add Achiever"}
        </Button>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs">
              <TableHead>{isAr ? "الاسم" : "Name"}</TableHead>
              <TableHead>{isAr ? "المجال والتميز" : "Field & Distinction"}</TableHead>
              <TableHead>{isAr ? "الفرع" : "Branch"}</TableHead>
              <TableHead className="text-center">{isAr ? "الترتيب" : "Order"}</TableHead>
              <TableHead className="text-end">{isAr ? "إجراءات" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {achievers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center text-muted-foreground text-xs">
                  {isAr ? "لا توجد سجلات متميزين مسجلة" : "No achievers found"}
                </TableCell>
              </TableRow>
            ) : (
              achievers.map((item) => (
                <TableRow key={item.id} className="text-xs hover:bg-muted/30">
                  <TableCell className="font-semibold text-foreground">
                    <div className="flex items-center gap-2.5">
                      <SaudiCulturalAvatar
                        src={item.image_path}
                        alt={item.name_ar}
                        size="sm"
                      />
                      <div>
                        <span>{item.name_ar}</span>
                        {item.name_en && <span className="block text-[11px] text-muted-foreground font-mono">{item.name_en}</span>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-normal mb-1">{item.field_ar}</Badge>
                    <span className="block text-muted-foreground text-[11px]">{item.achievement_ar}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.branch_ar || "—"}</TableCell>
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
                                ? `حذف سجل "${item.name_ar}"؟`
                                : `Delete "${item.name_ar}"?`,
                              description: isAr
                                ? "سيتم حذف هذا السجل من قائمة المتميزين ولوحة الشرف نهائيًا ولا يمكن التراجع عن هذا الإجراء."
                                : "This achiever record will be permanently removed from the Achievers list and Roll of Honour. This can't be undone.",
                              tone: "destructive",
                            }))
                          )
                            return;
                          onDeleteAchiever(item.id);
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
              {selectedAchiever ? (isAr ? "تعديل سجل متميز" : "Edit Achiever") : isAr ? "إضافة متميز جديد" : "Add Achiever"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "الاسم الكامل (بالعربية) *" : "Full Name (AR) *"}</Label>
                <Input
                  required
                  value={form.name_ar}
                  onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                  placeholder="مثال: د. عبدالمحسن بن محمد آل بوعبيد"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "الاسم (EN)" : "Full Name (EN)"}</Label>
                <Input
                  value={form.name_en ?? ""}
                  onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "المجال (بالعربية)" : "Field (AR)"}</Label>
                <Input
                  value={form.field_ar ?? ""}
                  onChange={(e) => setForm({ ...form, field_ar: e.target.value })}
                  placeholder="مثال: الهندسة والذكاء الاصطناعي"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "المجال (EN)" : "Field (EN)"}</Label>
                <Input
                  value={form.field_en ?? ""}
                  onChange={(e) => setForm({ ...form, field_en: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "الإنجاز أو التميز العلمي والمهني" : "Achievement / Distinction"}</Label>
              <Input
                value={form.achievement_ar ?? ""}
                onChange={(e) => setForm({ ...form, achievement_ar: e.target.value })}
                placeholder="مثال: براءة اختراع دولية في تقنيات النانو"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "فرع الأسرة" : "Family Branch"}</Label>
                <Input
                  value={form.branch_ar ?? ""}
                  onChange={(e) => setForm({ ...form, branch_ar: e.target.value })}
                  placeholder="مثال: فرع الصالحية"
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

            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "تصنيف التميز *" : "Category *"}</Label>
              <Select
                value={form.category}
                onValueChange={(value) => setForm({ ...form, category: value })}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">{isAr ? "أكاديمي وتعليمي" : "Academic"}</SelectItem>
                  <SelectItem value="medical">{isAr ? "طب وصحة" : "Medical & Health"}</SelectItem>
                  <SelectItem value="military">{isAr ? "خدمة عسكرية ووطنية" : "Military & Defense"}</SelectItem>
                  <SelectItem value="business">{isAr ? "أعمال وابتكار وتقنية" : "Business & Technology"}</SelectItem>
                  <SelectItem value="sports">{isAr ? "رياضة وبطولات" : "Sports"}</SelectItem>
                  <SelectItem value="public">{isAr ? "الخدمة العامة" : "Public Service"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ImageUploadInput
              label={isAr ? "صورة الشخصية / المكرم" : "Honouree Photo"}
              value={form.image_path}
              onChange={(url) => setForm({ ...form, image_path: url })}
              bucket="family-photos"
              helperText={isAr ? "تظهر في لوحة الشرف وقائمة المتميزين" : "Appears on Roll of Honour and Achievers cards"}
            />

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setFormOpen(false)}>
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? (isAr ? "جاري الحفظ..." : "Saving...") : isAr ? "حفظ السجل" : "Save Achiever"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
