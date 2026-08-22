import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLang } from "@/i18n/LanguageProvider";
import { Plus, Edit2, GitBranch } from "lucide-react";
import { ImageUploadInput } from "@/components/console/media/ImageUploadInput";
import type { FamilyBranchInput } from "@/lib/admin-hub.schemas";

export type BranchItem = {
  id: string;
  slug: string;
  name_ar: string;
  name_en?: string | null;
  description_ar?: string | null;
  description_en?: string | null;
  elder_ar?: string | null;
  elder_en?: string | null;
  image_path?: string | null;
  sort_order: number;
  is_published: boolean;
};

export function FamilyBranchesManager({
  branches,
  onSaveBranch,
}: {
  branches: BranchItem[];
  onSaveBranch: (data: FamilyBranchInput) => Promise<void>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const [formOpen, setFormOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchItem | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<FamilyBranchInput>({
    id: undefined,
    slug: "",
    name_ar: "",
    name_en: "",
    description_ar: "",
    description_en: "",
    elder_ar: "",
    elder_en: "",
    image_path: "",
    sort_order: 0,
    is_published: true,
  });

  const handleOpenAdd = () => {
    setSelectedBranch(null);
    setForm({
      id: undefined,
      slug: "",
      name_ar: "",
      name_en: "",
      description_ar: "",
      description_en: "",
      elder_ar: "",
      elder_en: "",
      image_path: "",
      sort_order: branches.length,
      is_published: true,
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (b: BranchItem) => {
    setSelectedBranch(b);
    setForm({
      id: b.id,
      slug: b.slug,
      name_ar: b.name_ar,
      name_en: b.name_en ?? "",
      description_ar: b.description_ar ?? "",
      description_en: b.description_en ?? "",
      elder_ar: b.elder_ar ?? "",
      elder_en: b.elder_en ?? "",
      image_path: b.image_path ?? "",
      sort_order: b.sort_order,
      is_published: b.is_published,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSaveBranch(form);
      setFormOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2.5">
          <GitBranch className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            {isAr ? "إدارة فروع الأسرة" : "Family Branches"}
          </h3>
        </div>
        <Button size="sm" onClick={handleOpenAdd} className="h-8 text-xs gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          {isAr ? "إضافة فرع جديد" : "Add Branch"}
        </Button>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs">
              <TableHead>{isAr ? "اسم الفرع (بالعربية)" : "Branch Name (AR)"}</TableHead>
              <TableHead>{isAr ? "اسم الفرع (EN)" : "Branch Name (EN)"}</TableHead>
              <TableHead>{isAr ? "عميد الفرع" : "Elder"}</TableHead>
              <TableHead>{isAr ? "المعرف (Slug)" : "Slug"}</TableHead>
              <TableHead className="text-center">{isAr ? "الترتيب" : "Order"}</TableHead>
              <TableHead className="text-end">{isAr ? "إجراءات" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {branches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-muted-foreground text-xs">
                  {isAr ? "لا توجد فروع مسجلة" : "No branches registered"}
                </TableCell>
              </TableRow>
            ) : (
              branches.map((b) => (
                <TableRow key={b.id} className="text-xs hover:bg-muted/30">
                  <TableCell className="font-semibold text-foreground">{b.name_ar}</TableCell>
                  <TableCell className="text-muted-foreground font-mono">{b.name_en || "—"}</TableCell>
                  <TableCell>{b.elder_ar || "—"}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{b.slug}</TableCell>
                  <TableCell className="text-center font-mono">{b.sort_order}</TableCell>
                  <TableCell className="text-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenEdit(b)}
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
              {selectedBranch ? (isAr ? "تعديل فرع" : "Edit Branch") : isAr ? "إضافة فرع جديد" : "Add Branch"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "اسم الفرع (بالعربية) *" : "Branch Name (AR) *"}</Label>
              <Input
                required
                value={form.name_ar}
                onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                placeholder="مثال: فرع الصالحية"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "اسم الفرع (EN)" : "Branch Name (EN)"}</Label>
              <Input
                value={form.name_en ?? ""}
                onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                placeholder="e.g. Al Salihiyah Branch"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "المعرف الفريد (Slug) *" : "Slug *"}</Label>
              <Input
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="salihiyah"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "عميد أو وجيه الفرع" : "Elder"}</Label>
              <Input
                value={form.elder_ar ?? ""}
                onChange={(e) => setForm({ ...form, elder_ar: e.target.value })}
                placeholder="اسم عميد الفرع"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "نبذة عن الفرع" : "Description"}</Label>
              <Textarea
                rows={3}
                value={form.description_ar ?? ""}
                onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
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
            <ImageUploadInput
              label={isAr ? "صورة أو شعار الفرع" : "Branch Photo / Logo"}
              value={form.image_path}
              onChange={(url) => setForm({ ...form, image_path: url })}
              bucket="site-media"
              helperText={isAr ? "تظهر هذه الصورة في صفحة الفروع وبطاقات التعريف بالفرع" : "Appears in the Branches page and branch cards"}
            />
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
