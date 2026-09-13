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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useLang } from "@/i18n/LanguageProvider";
import { useConfirm } from "@/hooks/useConfirm";
import { getErrorMessage } from "@/lib/error-utils";
import {
  Plus,
  Edit2,
  Trash2,
  Award,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  AlertCircle,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { ImageUploadInput } from "@/components/console/media/ImageUploadInput";
import { SaudiCulturalAvatar } from "@/components/common/SaudiCulturalAvatar";
import { cn } from "@/lib/utils";
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
  section: "family_competency" | "excellence_award";
  award_year?: string | null;
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
  const { lang, dir } = useLang();
  const isAr = lang === "ar";
  const confirm = useConfirm();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedAchiever, setSelectedAchiever] = useState<AchieverItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const [form, setForm] = useState<AchieverInput>({
    id: undefined,
    name_ar: "",
    name_en: "",
    field_ar: "الطب والعلوم الصحية",
    field_en: "Medicine & Health Sciences",
    achievement_ar: "",
    achievement_en: "",
    category: "academic",
    section: "excellence_award",
    award_year: "1447",
    branch_ar: "فرع الصالحية",
    branch_en: "Al-Salihiyah",
    sort_order: 0,
    is_published: true,
  });

  const publishedCount = achievers.filter((a) => a.is_published).length;
  const draftCount = achievers.filter((a) => !a.is_published).length;

  const filteredAchievers = achievers.filter((a) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "published") return a.is_published;
    if (statusFilter === "draft") return !a.is_published;
    return true;
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
      section: "excellence_award",
      award_year: "1447",
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
      section: item.section,
      award_year: item.award_year ?? "",
      branch_ar: item.branch_ar ?? "",
      branch_en: item.branch_en ?? "",
      sort_order: item.sort_order,
      is_published: item.is_published,
      image_path: item.image_path ?? undefined,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSaveAchiever(form);
      setFormOpen(false);
      toast.success(isAr ? "تم حفظ السجل بنجاح" : "Achiever saved successfully");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, isAr ? "حدث خطأ أثناء الحفظ" : "Failed to save"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: AchieverItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !(await confirm({
        title: isAr ? `حذف سجل "${item.name_ar}"؟` : `Delete "${item.name_ar}"?`,
        description: isAr
          ? "سيتم حذف هذا السجل من قائمة المتميزين ولوحة الشرف نهائيًا ولا يمكن التراجع عن هذا الإجراء."
          : "This achiever record will be permanently removed from the Achievers list and Roll of Honour. This can't be undone.",
        tone: "destructive",
      }))
    )
      return;
    await onDeleteAchiever(item.id);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12">
      {/* 1. Page Context / Welcome Summary */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            {isAr ? "لوحة شرف المتميزين" : "Roll of Honour"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? "إدارة سجلات المتميزين والرواد في العائلة"
              : "Manage achievers and pioneers records"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {draftCount > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-lg border border-amber-500/20 shadow-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm font-bold">
                {isAr
                  ? `لديك ${draftCount} سجلات غير منشورة`
                  : `You have ${draftCount} unpublished records`}
              </span>
            </div>
          )}
          <Button
            onClick={handleOpenAdd}
            className="h-10 px-5 gap-2 font-bold shadow-sm rounded-lg"
          >
            <Plus className="w-4 h-4" />
            {isAr ? "إضافة متميز جديد" : "Add New Achiever"}
          </Button>
        </div>
      </div>

      {/* 2. Needs Your Attention / Operational KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={cn(
            "p-5 rounded-2xl border bg-card relative overflow-hidden group transition-all",
            draftCount > 0 ? "border-amber-500/30 shadow-sm" : "border-border",
          )}
        >
          {draftCount > 0 && (
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          )}
          <div className="flex flex-col h-full">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  draftCount > 0 ? "bg-amber-500 animate-pulse" : "bg-muted-foreground",
                )}
              />
              {isAr ? "مسودات وسجلات مخفية" : "Drafts & Hidden Records"}
            </h3>
            <div className="mb-6 flex-1">
              <span className="text-3xl font-black font-mono text-foreground block">
                {draftCount}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  {isAr ? "سجل" : "records"}
                </span>
              </span>
            </div>
            <button
              onClick={() => setStatusFilter("draft")}
              className="text-xs font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all w-fit"
            >
              {isAr ? "مراجعة المسودات" : "Review Drafts"}{" "}
              {dir === "rtl" ? (
                <ArrowLeft className="w-3 h-3" />
              ) : (
                <ArrowRight className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="flex flex-col h-full">
            <h3 className="text-sm font-bold text-muted-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              {isAr ? "السجلات المنشورة" : "Published Records"}
            </h3>
            <div className="mb-6 flex-1">
              <span className="text-3xl font-black font-mono text-foreground block">
                {publishedCount}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  {isAr ? "سجل" : "records"}
                </span>
              </span>
            </div>
            <button
              onClick={() => setStatusFilter("published")}
              className="text-xs font-bold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors w-fit"
            >
              {isAr ? "عرض المنشورات" : "View Published"}{" "}
              {dir === "rtl" ? (
                <ArrowLeft className="w-3 h-3" />
              ) : (
                <ArrowRight className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="flex flex-col h-full">
            <h3 className="text-sm font-bold text-muted-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              {isAr ? "إجمالي رواد العائلة" : "Total Pioneers"}
            </h3>
            <div className="mb-6 flex-1">
              <span className="text-3xl font-black font-mono text-foreground block">
                {achievers.length}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  {isAr ? "رائد" : "pioneers"}
                </span>
              </span>
            </div>
            <button
              onClick={() => setStatusFilter("all")}
              className="text-xs font-bold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors w-fit"
            >
              {isAr ? "عرض الكل" : "View All"}{" "}
              {dir === "rtl" ? (
                <ArrowLeft className="w-3 h-3" />
              ) : (
                <ArrowRight className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Primary Work Queue / Filters */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="border-b border-border p-2 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
          <div className="flex items-center gap-4 text-sm font-medium overflow-x-auto no-scrollbar">
            <button
              onClick={() => setStatusFilter("all")}
              className={cn(
                "py-2.5 px-1 relative whitespace-nowrap transition-colors",
                statusFilter === "all"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isAr ? "الكل" : "All"}{" "}
              <span className="text-[10px] font-mono opacity-60 ml-1">({achievers.length})</span>
              {statusFilter === "all" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setStatusFilter("published")}
              className={cn(
                "py-2.5 px-1 relative whitespace-nowrap transition-colors",
                statusFilter === "published"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isAr ? "منشور" : "Published"}{" "}
              <span className="text-[10px] font-mono opacity-60 ml-1">({publishedCount})</span>
              {statusFilter === "published" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setStatusFilter("draft")}
              className={cn(
                "py-2.5 px-1 relative whitespace-nowrap transition-colors",
                statusFilter === "draft"
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isAr ? "مسودات" : "Drafts"}{" "}
              <span className="text-[10px] font-mono opacity-60 ml-1">({draftCount})</span>
              {statusFilter === "draft" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          </div>
        </div>

        {/* 4. Streamlined Main Table */}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="font-semibold">{isAr ? "المتميز" : "Achiever"}</TableHead>
              <TableHead className="font-semibold">
                {isAr ? "المجال والإنجاز" : "Field & Achievement"}
              </TableHead>
              <TableHead className="font-semibold">{isAr ? "القسم والسنة" : "Section & Year"}</TableHead>
              <TableHead className="font-semibold">{isAr ? "الترتيب" : "Order"}</TableHead>
              <TableHead className="font-semibold text-end">
                {isAr ? "الإجراء" : "Action"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAchievers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Award className="w-8 h-8 mb-3 opacity-20" />
                    <p className="text-sm font-medium">
                      {isAr ? "لا توجد سجلات في هذه القائمة" : "No records found"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAchievers.map((item) => (
                <TableRow
                  key={item.id}
                  className="group cursor-pointer hover:bg-muted/30"
                  onClick={() => handleOpenEdit(item)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <SaudiCulturalAvatar src={item.image_path} alt={item.name_ar} size="sm" />
                      <div>
                        <div className="font-bold text-foreground flex items-center gap-2">
                          {item.name_ar}
                          {!item.is_published && (
                            <Badge
                              variant="outline"
                              className="text-[9px] bg-amber-500/10 text-amber-600 border-amber-500/20 px-1 py-0 h-4"
                            >
                              {isAr ? "مسودة" : "Draft"}
                            </Badge>
                          )}
                        </div>
                        {item.name_en && (
                          <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                            {item.name_en}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[250px]">
                    <div className="font-medium text-foreground truncate">{item.field_ar}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {item.achievement_ar}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {item.section === "excellence_award"
                        ? isAr ? "جائزة التميز" : "Excellence Award"
                        : isAr ? "كفاءات أفراد الأسرة" : "Family Members’ Competencies"}
                    </div>
                    <div className="text-xs text-muted-foreground nums">
                      {item.award_year ? `${item.award_year} ${isAr ? "هـ" : "AH"}` : "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-mono">{item.sort_order}</div>
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs font-bold transition-all text-primary hover:bg-primary/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(item);
                        }}
                      >
                        {isAr ? "تعديل" : "Edit"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleDelete(item, e)}
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

      {/* 5. Contextual Side Drawer for Add/Edit */}
      <Sheet open={formOpen} onOpenChange={setFormOpen}>
        <SheetContent
          side={isAr ? "left" : "right"}
          className="w-full sm:max-w-md p-0 flex flex-col border-border gap-0 bg-background overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-border bg-muted/10 flex items-center justify-between z-10">
            <div>
              <SheetTitle className="text-lg font-bold">
                {selectedAchiever
                  ? isAr
                    ? "تعديل سجل متميز"
                    : "Edit Achiever"
                  : isAr
                    ? "إضافة متميز جديد"
                    : "Add Achiever"}
              </SheetTitle>
              <SheetDescription className="text-xs font-mono mt-1">
                {selectedAchiever
                  ? `ID: ${selectedAchiever.id.split("-")[0]}`
                  : isAr
                    ? "سجل جديد"
                    : "New Record"}
              </SheetDescription>
            </div>

            {/* Visibility Toggle built into header */}
            <div className="flex items-center gap-2">
              <Label className="text-xs font-bold text-muted-foreground">
                {isAr ? "منشور" : "Published"}
              </Label>
              <Switch
                checked={form.is_published}
                onCheckedChange={(c) => setForm({ ...form, is_published: c })}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
            <form id="achiever-form" onSubmit={handleSubmit} className="space-y-6">
              <ImageUploadInput
                label={isAr ? "صورة الشخصية / المكرم" : "Honouree Photo"}
                value={form.image_path}
                onChange={(url) => setForm({ ...form, image_path: url })}
                bucket="family-photos"
                helperText={
                  isAr
                    ? "تظهر في لوحة الشرف وقائمة المتميزين"
                    : "Appears on Roll of Honour and Achievers cards"
                }
              />

              <div className="space-y-4">
                <h4 className="font-bold text-sm text-foreground border-b border-border pb-2">
                  {isAr ? "المعلومات الأساسية" : "Basic Info"}
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">
                      {isAr ? "الاسم الكامل (بالعربية) *" : "Full Name (AR) *"}
                    </Label>
                    <Input
                      required
                      value={form.name_ar}
                      onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                      placeholder="مثال: د. عبدالمحسن بن محمد آل بوعبيد"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">
                      {isAr ? "الاسم (EN)" : "Full Name (EN)"}
                    </Label>
                    <Input
                      value={form.name_en ?? ""}
                      onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-sm text-foreground border-b border-border pb-2">
                  {isAr ? "التخصص والإنجاز" : "Field & Achievement"}
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">{isAr ? "قسم سجل الشرف *" : "Roll Section *"}</Label>
                      <Select
                        value={form.section}
                        onValueChange={(value: "family_competency" | "excellence_award") =>
                          setForm({ ...form, section: value, award_year: value === "family_competency" ? null : form.award_year || "1447" })
                        }
                      >
                        <SelectTrigger className="h-10 text-xs bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="family_competency">{isAr ? "كفاءات أفراد الأسرة" : "Family Members’ Competencies"}</SelectItem>
                          <SelectItem value="excellence_award">{isAr ? "جائزة التميز" : "Excellence Award"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {form.section === "excellence_award" ? (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold">{isAr ? "السنة الهجرية *" : "Hijri Year *"}</Label>
                        <Input
                          required
                          inputMode="numeric"
                          value={form.award_year ?? ""}
                          onChange={(e) => setForm({ ...form, award_year: e.target.value })}
                          placeholder="1447"
                          className="bg-background nums"
                        />
                      </div>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">
                        {isAr ? "المجال (AR)" : "Field (AR)"}
                      </Label>
                      <Input
                        value={form.field_ar ?? ""}
                        onChange={(e) => setForm({ ...form, field_ar: e.target.value })}
                        placeholder="الهندسة والذكاء الاصطناعي"
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">
                        {isAr ? "المجال (EN)" : "Field (EN)"}
                      </Label>
                      <Input
                        value={form.field_en ?? ""}
                        onChange={(e) => setForm({ ...form, field_en: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">
                      {isAr ? "تصنيف التميز *" : "Category *"}
                    </Label>
                    <Select
                      value={form.category}
                      onValueChange={(value) => setForm({ ...form, category: value })}
                    >
                      <SelectTrigger className="h-10 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">
                          {isAr ? "أكاديمي وتعليمي" : "Academic"}
                        </SelectItem>
                        <SelectItem value="medical">
                          {isAr ? "طب وصحة" : "Medical & Health"}
                        </SelectItem>
                        <SelectItem value="military">
                          {isAr ? "خدمة عسكرية ووطنية" : "Military & Defense"}
                        </SelectItem>
                        <SelectItem value="business">
                          {isAr ? "أعمال وابتكار وتقنية" : "Business & Technology"}
                        </SelectItem>
                        <SelectItem value="sports">{isAr ? "رياضة وبطولات" : "Sports"}</SelectItem>
                        <SelectItem value="public">
                          {isAr ? "الخدمة العامة" : "Public Service"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">
                      {isAr ? "الإنجاز أو التميز العلمي" : "Achievement / Distinction"}
                    </Label>
                    <Input
                      value={form.achievement_ar ?? ""}
                      onChange={(e) => setForm({ ...form, achievement_ar: e.target.value })}
                      placeholder="مثال: براءة اختراع دولية في تقنيات النانو"
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-sm text-foreground border-b border-border pb-2">
                  {isAr ? "معلومات إضافية" : "Additional Info"}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">
                      {isAr ? "فرع الأسرة" : "Family Branch"}
                    </Label>
                    <Input
                      value={form.branch_ar ?? ""}
                      onChange={(e) => setForm({ ...form, branch_ar: e.target.value })}
                      placeholder="مثال: فرع الصالحية"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">
                      {isAr ? "ترتيب الظهور" : "Sort Order"}
                    </Label>
                    <Input
                      type="number"
                      value={form.sort_order}
                      onChange={(e) =>
                        setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })
                      }
                      className="bg-background font-mono"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="px-6 py-4 border-t border-border bg-muted/10 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-1/3 h-11 rounded-xl font-bold"
              onClick={() => setFormOpen(false)}
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              form="achiever-form"
              disabled={loading}
              className="w-2/3 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : null}
              {loading
                ? isAr
                  ? "جاري الحفظ..."
                  : "Saving..."
                : isAr
                  ? "حفظ السجل"
                  : "Save Achiever"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
