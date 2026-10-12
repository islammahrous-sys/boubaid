import { useState } from "react";
import { Edit2, Users } from "lucide-react";
import { toast } from "sonner";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLang } from "@/i18n/LanguageProvider";
import type { CouncilCommitteeInput } from "@/lib/admin-hub.schemas";

export type CouncilCommitteeRow = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  is_active: boolean;
  sort_order: number;
};

/**
 * The council's standing committees as used by the Requests Hub: a request
 * addressed to a committee is filed under the name stored here, and an
 * inactive committee stops receiving new requests. The set of committees is
 * tied to the request types defined in code, so committees are edited here but
 * not created or deleted.
 */
export function CouncilCommitteesManager({
  committees,
  onSave,
}: {
  committees: CouncilCommitteeRow[];
  onSave: (data: CouncilCommitteeInput) => Promise<void>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CouncilCommitteeInput | null>(null);

  const edit = (c: CouncilCommitteeRow) => {
    setForm({
      id: c.id,
      name_ar: c.name_ar,
      name_en: c.name_en ?? "",
      description_ar: c.description_ar ?? "",
      description_en: c.description_en ?? "",
      is_active: c.is_active,
      sort_order: c.sort_order,
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form) return;
    try {
      setSaving(true);
      await onSave(form);
      toast.success(isAr ? "تم حفظ اللجنة" : "Committee saved");
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.message || (isAr ? "تعذر الحفظ" : "Could not save"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-4">
        <Users className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-sm font-bold text-foreground">
            {isAr ? "لجان المجلس ووجهات الطلبات" : "Council committees & request destinations"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isAr
              ? "الاسم والوصف وترتيب كل لجنة كما تظهر في مركز الطلبات. اللجنة غير النشطة لا تستقبل طلبات جديدة."
              : "Each committee's name, description and order as used in the Requests Hub. An inactive committee stops receiving new requests."}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs">
              <TableHead>{isAr ? "اللجنة" : "Committee"}</TableHead>
              <TableHead className="text-center">{isAr ? "الترتيب" : "Order"}</TableHead>
              <TableHead className="text-center">{isAr ? "الحالة" : "Status"}</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {committees.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <p className="text-sm font-semibold text-foreground">{c.name_ar}</p>
                  <p className="text-xs text-muted-foreground">{c.name_en}</p>
                  <code className="text-[10px] text-muted-foreground">{c.slug}</code>
                </TableCell>
                <TableCell className="text-center text-xs">{c.sort_order}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={c.is_active ? "default" : "secondary"} className="text-[10px]">
                    {c.is_active ? (isAr ? "نشطة" : "Active") : isAr ? "متوقفة" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost" onClick={() => edit(c)} className="h-8 w-8">
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isAr ? "تعديل اللجنة" : "Edit committee"}</DialogTitle>
          </DialogHeader>
          {form && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "الاسم بالعربية *" : "Name (AR) *"}</Label>
                <Input
                  dir="rtl"
                  value={form.name_ar}
                  onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "الاسم بالإنجليزية" : "Name (EN)"}</Label>
                <Input
                  dir="ltr"
                  value={form.name_en ?? ""}
                  onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "الوصف بالعربية" : "Description (AR)"}</Label>
                <Textarea
                  dir="rtl"
                  rows={2}
                  value={form.description_ar ?? ""}
                  onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "الوصف بالإنجليزية" : "Description (EN)"}</Label>
                <Textarea
                  dir="ltr"
                  rows={2}
                  value={form.description_en ?? ""}
                  onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">{isAr ? "الترتيب" : "Order"}</Label>
                  <Input
                    type="number"
                    className="w-28"
                    value={form.sort_order}
                    onChange={(e) =>
                      setForm({ ...form, sort_order: Number.parseInt(e.target.value, 10) || 0 })
                    }
                  />
                </div>
                <label className="flex items-center gap-2 text-xs">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                  />
                  {isAr ? "تستقبل الطلبات" : "Accepts requests"}
                </label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button size="sm" disabled={saving || !form?.name_ar?.trim()} onClick={submit}>
              {saving ? (isAr ? "جاري الحفظ..." : "Saving...") : isAr ? "حفظ" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
