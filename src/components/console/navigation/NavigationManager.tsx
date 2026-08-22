import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLang } from "@/i18n/LanguageProvider";
import { Menu, Plus, Edit2, Trash2, ExternalLink, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import type { NavigationMenuInput, NavigationItemInput } from "@/lib/admin-hub.schemas";

export type NavMenuRow = {
  id: string;
  name_ar: string;
  name_en?: string | null;
  code: string;
};

export type NavItemRow = {
  id: string;
  menu_id: string;
  parent_id?: string | null;
  label_ar: string;
  label_en?: string | null;
  url: string;
  type: string;
  target: string;
  sort_order: number;
  icon?: string | null;
  visibility: "public" | "family_only" | "admin_only" | "private";
};

export function NavigationManager({
  menus,
  items,
  onSaveMenu,
  onSaveItem,
  onDeleteItem,
}: {
  menus: NavMenuRow[];
  items: NavItemRow[];
  onSaveMenu: (data: NavigationMenuInput) => Promise<void>;
  onSaveItem: (data: NavigationItemInput) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const [selectedMenuId, setSelectedMenuId] = useState<string>(menus[0]?.id || "");
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<NavItemRow | null>(null);
  const [loading, setLoading] = useState(false);

  const [itemForm, setItemForm] = useState<NavigationItemInput>({
    id: undefined,
    menu_id: selectedMenuId,
    parent_id: null,
    label_ar: "",
    label_en: "",
    url: "/",
    type: "custom",
    target: "_self",
    sort_order: 0,
    icon: null,
    visibility: "public",
  });

  const currentItems = items
    .filter((i) => i.menu_id === selectedMenuId)
    .sort((a, b) => a.sort_order - b.sort_order);

  const handleOpenAddItem = () => {
    setSelectedItem(null);
    setItemForm({
      id: undefined,
      menu_id: selectedMenuId,
      parent_id: null,
      label_ar: "",
      label_en: "",
      url: "/",
      type: "custom",
      target: "_self",
      sort_order: currentItems.length,
      icon: null,
      visibility: "public",
    });
    setItemModalOpen(true);
  };

  const handleOpenEditItem = (it: NavItemRow) => {
    setSelectedItem(it);
    setItemForm({
      id: it.id,
      menu_id: it.menu_id,
      parent_id: it.parent_id ?? null,
      label_ar: it.label_ar,
      label_en: it.label_en ?? "",
      url: it.url,
      type: (it.type as any) || "custom",
      target: it.target || "_self",
      sort_order: it.sort_order,
      icon: it.icon ?? null,
      visibility: it.visibility,
    });
    setItemModalOpen(true);
  };

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.label_ar.trim() || !itemForm.url.trim()) return;
    try {
      setLoading(true);
      await onSaveItem({ ...itemForm, menu_id: selectedMenuId });
      setItemModalOpen(false);
      toast.success(isAr ? "تم حفظ عنصر القائمة بنجاح" : "Navigation item saved");
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل الحفظ" : "Failed to save"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2.5">
          <Menu className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            {isAr ? "إدارة قوائم التصفح والروابط (Header & Footer)" : "Navigation & Menu Management"}
          </h3>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {menus.length > 0 && (
            <Select value={selectedMenuId} onValueChange={setSelectedMenuId}>
              <SelectTrigger className="h-8 w-[180px] text-xs">
                <SelectValue placeholder={isAr ? "اختر القائمة" : "Select Menu"} />
              </SelectTrigger>
              <SelectContent>
                {menus.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name_ar} ({m.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button size="sm" onClick={handleOpenAddItem} className="h-8 text-xs gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            {isAr ? "إضافة رابط جديد" : "Add Link"}
          </Button>
        </div>
      </div>

      {/* Navigation Items Table */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs">
              <TableHead>{isAr ? "عنوان الرابط" : "Link Title"}</TableHead>
              <TableHead>{isAr ? "المسار / الرابط (URL)" : "Path / URL"}</TableHead>
              <TableHead className="text-center">{isAr ? "الفتح في" : "Target"}</TableHead>
              <TableHead className="text-center">{isAr ? "الظهور" : "Visibility"}</TableHead>
              <TableHead className="text-center">{isAr ? "الترتيب" : "Order"}</TableHead>
              <TableHead className="text-end">{isAr ? "إجراءات" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-muted-foreground text-xs">
                  {isAr ? "لا توجد روابط مسجلة في هذه القائمة" : "No links found in this menu"}
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((it) => (
                <TableRow key={it.id} className="text-xs hover:bg-muted/30">
                  <TableCell className="font-semibold text-foreground">
                    {it.label_ar}
                    {it.label_en && <span className="block text-[11px] text-muted-foreground font-mono">{it.label_en}</span>}
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <LinkIcon className="w-3 h-3 text-muted-foreground" />
                      {it.url}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-mono text-[11px]">
                    {it.target === "_blank" ? (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <ExternalLink className="w-2.5 h-2.5" />
                        {isAr ? "نافذة جديدة" : "New window"}
                      </Badge>
                    ) : (
                      isAr ? "نفس الصفحة" : "Same page"
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="text-[10px]">
                      {it.visibility}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-mono">{it.sort_order}</TableCell>
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-muted-foreground hover:text-foreground"
                        onClick={() => handleOpenEditItem(it)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (window.confirm(isAr ? "هل أنت متأكد من حذف هذا الرابط؟" : "Are you sure?")) {
                            onDeleteItem(it.id);
                          }
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

      {/* Add / Edit Nav Item Dialog */}
      <Dialog open={itemModalOpen} onOpenChange={setItemModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {selectedItem ? (isAr ? "تعديل رابط القائمة" : "Edit Link") : isAr ? "إضافة رابط جديد" : "Add Link"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitItem} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "عنوان الرابط (بالعربية) *" : "Title (AR) *"}</Label>
              <Input
                required
                value={itemForm.label_ar}
                onChange={(e) => setItemForm({ ...itemForm, label_ar: e.target.value })}
                placeholder="مثال: شجرة الأسرة"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "عنوان الرابط (EN)" : "Title (EN)"}</Label>
              <Input
                value={itemForm.label_en ?? ""}
                onChange={(e) => setItemForm({ ...itemForm, label_en: e.target.value })}
                placeholder="Family Tree"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "المسار / الرابط (URL) *" : "Path / URL *"}</Label>
              <Input
                required
                value={itemForm.url}
                onChange={(e) => setItemForm({ ...itemForm, url: e.target.value })}
                placeholder="/family-tree أو https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "طريقة الفتح" : "Target"}</Label>
                <Select
                  value={itemForm.target}
                  onValueChange={(val: any) => setItemForm({ ...itemForm, target: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_self">{isAr ? "في نفس الصفحة (_self)" : "Same Tab"}</SelectItem>
                    <SelectItem value="_blank">{isAr ? "في نافذة جديدة (_blank)" : "New Tab"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "الترتيب" : "Sort Order"}</Label>
                <Input
                  type="number"
                  value={itemForm.sort_order}
                  onChange={(e) => setItemForm({ ...itemForm, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setItemModalOpen(false)}>
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? (isAr ? "جاري الحفظ..." : "Saving...") : isAr ? "حفظ الرابط" : "Save Link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
