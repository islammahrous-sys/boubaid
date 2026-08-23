import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLang } from "@/i18n/LanguageProvider";
import { useConfirm } from "@/hooks/useConfirm";
import { Plus, Edit2, Trash2, Rocket } from "lucide-react";
import { toast } from "sonner";
import { ImageUploadInput } from "@/components/console/media/ImageUploadInput";
import type { InitiativeInput } from "@/lib/admin-hub.schemas";

export type InitiativeItem = {
  id: string;
  slug: string;
  title_ar: string;
  title_en?: string | null;
  summary_ar?: string | null;
  summary_en?: string | null;
  body_ar?: string | null;
  body_en?: string | null;
  status: string;
  cover_path?: string | null;
  sort_order: number;
  is_published: boolean;
};

export function InitiativesManager({
  initiatives,
  onSaveInitiative,
  onDeleteInitiative,
}: {
  initiatives: InitiativeItem[];
  onSaveInitiative: (data: InitiativeInput) => Promise<void>;
  onDeleteInitiative: (id: string) => Promise<void>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const confirm = useConfirm();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedInit, setSelectedInit] = useState<InitiativeItem | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<InitiativeInput>({
    id: undefined,
    slug: "",
    title_ar: "",
    title_en: "",
    summary_ar: "",
    summary_en: "",
    body_ar: "",
    body_en: "",
    status: "ongoing",
    sort_order: 0,
    is_published: true,
  });

  const handleOpenAdd = () => {
    setSelectedInit(null);
    setForm({
      id: undefined,
      slug: "",
      title_ar: "",
      title_en: "",
      summary_ar: "",
      summary_en: "",
      body_ar: "",
      body_en: "",
      status: "ongoing",
      sort_order: initiatives.length,
      is_published: true,
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (item: InitiativeItem) => {
    setSelectedInit(item);
    setForm({
      id: item.id,
      slug: item.slug,
      title_ar: item.title_ar,
      title_en: item.title_en ?? "",
      summary_ar: item.summary_ar ?? "",
      summary_en: item.summary_en ?? "",
      body_ar: item.body_ar ?? "",
      body_en: item.body_en ?? "",
      status: item.status as any,
      sort_order: item.sort_order,
      is_published: item.is_published,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title_ar.trim() || !form.slug.trim()) return;
    try {
      setLoading(true);
      await onSaveInitiative(form);
      setFormOpen(false);
      toast.success(isAr ? "تم حفظ المبادرة بنجاح" : "Initiative saved successfully");
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل حفظ المبادرة" : "Failed to save"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2.5">
          <Rocket className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            {isAr ? "إدارة المبادرات والمشاريع التنموية" : "Initiatives & Development Projects"}
          </h3>
        </div>
        <Button size="sm" onClick={handleOpenAdd} className="h-8 text-xs gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          {isAr ? "إضافة مبادرة جديدة" : "Add Initiative"}
        </Button>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs">
              <TableHead>{isAr ? "عنوان المبادرة" : "Initiative Title"}</TableHead>
              <TableHead>{isAr ? "المعرف (Slug)" : "Slug"}</TableHead>
              <TableHead className="text-center">{isAr ? "المرحلة / الحالة" : "Status"}</TableHead>
              <TableHead className="text-center">{isAr ? "الترتيب" : "Order"}</TableHead>
              <TableHead className="text-end">{isAr ? "إجراءات" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initiatives.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center text-muted-foreground text-xs">
                  {isAr ? "لا توجد مبادرات مسجلة" : "No initiatives found"}
                </TableCell>
              </TableRow>
            ) : (
              initiatives.map((item) => (
                <TableRow key={item.id} className="text-xs hover:bg-muted/30">
                  <TableCell className="font-semibold text-foreground">
                    <div className="flex items-center gap-2.5">
                      {item.cover_path ? (
                        <div className="w-9 h-9 rounded-lg border border-border overflow-hidden shrink-0 bg-muted/20">
                          <img src={item.cover_path} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : null}
                      <div>
                        <span>{item.title_ar}</span>
                        {item.title_en && <span className="block text-[11px] text-muted-foreground font-mono">{item.title_en}</span>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">{item.slug}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={item.status === "ongoing" ? "default" : item.status === "completed" ? "outline" : "secondary"}
                      className="text-[10px]"
                    >
                      {item.status === "ongoing"
                        ? isAr ? "جارية" : "Ongoing"
                        : item.status === "completed"
                          ? isAr ? "مكتملة" : "Completed"
                          : isAr ? "مخططة" : "Planned"}
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
                                ? `حذف مبادرة "${item.title_ar}"؟`
                                : `Delete "${item.title_ar}"?`,
                              description: isAr
                                ? "سيتم حذف هذه المبادرة وكل تفاصيلها المنشورة نهائيًا ولا يمكن التراجع عن هذا الإجراء."
                                : "This initiative and its published details will be permanently removed. This can't be undone.",
                              tone: "destructive",
                            }))
                          )
                            return;
                          onDeleteInitiative(item.id);
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
              {selectedInit ? (isAr ? "تعديل مبادرة" : "Edit Initiative") : isAr ? "إضافة مبادرة جديدة" : "Add Initiative"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "عنوان المبادرة بالعربية *" : "Initiative Title (AR) *"}</Label>
              <Input
                required
                value={form.title_ar}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    title_ar: val,
                    slug: prev.slug || val.toLowerCase().replace(/\s+/g, "-"),
                  }));
                }}
                placeholder="مثال: جائزة التفوق العلمي السنوية"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "العنوان (EN)" : "Title (EN)"}</Label>
              <Input
                value={form.title_en ?? ""}
                onChange={(e) => setForm({ ...form, title_en: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "المعرف الفريد (Slug) *" : "Slug *"}</Label>
                <Input
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "حالة البرنامج" : "Status"}</Label>
                <Select value={form.status} onValueChange={(val: any) => setForm({ ...form, status: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ongoing">{isAr ? "جارية وقائمة (Ongoing)" : "Ongoing"}</SelectItem>
                    <SelectItem value="planned">{isAr ? "مخططة (Planned)" : "Planned"}</SelectItem>
                    <SelectItem value="completed">{isAr ? "مكتملة (Completed)" : "Completed"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "الموجز / النبذة التمهيدية" : "Summary"}</Label>
              <Textarea
                rows={2}
                value={form.summary_ar ?? ""}
                onChange={(e) => setForm({ ...form, summary_ar: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "التفاصيل والأهداف وآليات التنفيذ" : "Body Details"}</Label>
              <Textarea
                rows={5}
                value={form.body_ar ?? ""}
                onChange={(e) => setForm({ ...form, body_ar: e.target.value })}
              />
            </div>
            <ImageUploadInput
              label={isAr ? "صورة غلاف المبادرة" : "Initiative Cover Photo"}
              value={form.cover_path}
              onChange={(url) => setForm({ ...form, cover_path: url })}
              bucket="site-media"
            />
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setFormOpen(false)}>
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? (isAr ? "جاري الحفظ..." : "Saving...") : isAr ? "حفظ المبادرة" : "Save Initiative"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
