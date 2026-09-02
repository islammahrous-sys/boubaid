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
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
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
  Trash2,
  Rocket,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  BookOpen,
  TrendingUp,
  Loader2,
  HeartHandshake,
} from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-utils";
import { ImageUploadInput } from "@/components/console/media/ImageUploadInput";
import { cn } from "@/lib/utils";
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

export type InitiativeRegistrationRow = {
  id: string;
  initiative_id: string;
  name: string;
  email: string;
  phone?: string | null;
  notes?: string | null;
  status: string;
  created_at: string;
};

export function InitiativesManager({
  initiatives,
  registrations = [],
  onSaveInitiative,
  onDeleteInitiative,
  onUpdateRegistrationStatus,
  onDeleteRegistration,
}: {
  initiatives: InitiativeItem[];
  registrations?: InitiativeRegistrationRow[];
  onSaveInitiative: (data: InitiativeInput) => Promise<void>;
  onDeleteInitiative: (id: string) => Promise<void>;
  onUpdateRegistrationStatus?: (
    id: string,
    status: "new" | "contacted" | "confirmed" | "declined",
  ) => Promise<void>;
  onDeleteRegistration?: (id: string) => Promise<void>;
}) {
  const { lang, dir } = useLang();
  const isAr = lang === "ar";
  const confirm = useConfirm();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedInit, setSelectedInit] = useState<InitiativeItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [registrationsModalOpen, setRegistrationsModalOpen] = useState(false);
  const [activeInitForRegistrations, setActiveInitForRegistrations] =
    useState<InitiativeItem | null>(null);

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

  const publishedCount = initiatives.filter((i) => i.is_published).length;
  const draftCount = initiatives.filter((i) => !i.is_published).length;

  const filteredInitiatives = initiatives.filter((i) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "published") return i.is_published;
    if (statusFilter === "draft") return !i.is_published;
    return true;
  });

  const getStatusDisplay = (st: string) => {
    switch (st) {
      case "completed":
        return (
          <Badge
            variant="secondary"
            className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]"
          >
            {isAr ? "مكتملة" : "Completed"}
          </Badge>
        );
      case "ongoing":
        return (
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
            {isAr ? "مستمرة" : "Ongoing"}
          </Badge>
        );
      case "planned":
        return (
          <Badge variant="outline" className="text-muted-foreground text-[10px]">
            {isAr ? "مخطط لها" : "Planned"}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            {st}
          </Badge>
        );
    }
  };

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
      status: (item.status as "ongoing" | "planned" | "completed") || "ongoing",
      sort_order: item.sort_order,
      is_published: item.is_published,
      cover_path: item.cover_path ?? undefined,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSaveInitiative(form);
      setFormOpen(false);
      toast.success(isAr ? "تم الحفظ بنجاح" : "Saved successfully");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, isAr ? "حدث خطأ" : "Failed to save"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: InitiativeItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !(await confirm({
        title: isAr ? `حذف مبادرة "${item.title_ar}"؟` : `Delete "${item.title_ar}"?`,
        description: isAr ? "سيتم الحذف نهائياً ولن يمكن التراجع." : "Will be permanently deleted.",
        tone: "destructive",
      }))
    )
      return;
    await onDeleteInitiative(item.id);
  };

  const handleOpenRegistrations = (item: InitiativeItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveInitForRegistrations(item);
    setRegistrationsModalOpen(true);
  };

  const initRegistrations = activeInitForRegistrations
    ? registrations.filter((r) => r.initiative_id === activeInitForRegistrations.id)
    : [];

  const getRegistrationStatusLabel = (st: string) => {
    switch (st) {
      case "contacted":
        return isAr ? "تم التواصل" : "Contacted";
      case "confirmed":
        return isAr ? "منضم" : "Confirmed";
      case "declined":
        return isAr ? "اعتذر" : "Declined";
      default:
        return isAr ? "جديد" : "New";
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12">
      {/* 1. Page Context / Welcome Summary */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            {isAr ? "مبادرات وبرامج العائلة" : "Family Initiatives"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? "إدارة المبادرات والمشاريع التنموية والخيرية"
              : "Manage development and charitable initiatives"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {draftCount > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-lg border border-amber-500/20 shadow-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm font-bold">
                {isAr
                  ? `لديك ${draftCount} مبادرة غير منشورة`
                  : `You have ${draftCount} unpublished initiatives`}
              </span>
            </div>
          )}
          <Button
            onClick={handleOpenAdd}
            className="h-10 px-5 gap-2 font-bold shadow-sm rounded-lg"
          >
            <Plus className="w-4 h-4" />
            {isAr ? "إضافة مبادرة جديدة" : "Add New Initiative"}
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
              {isAr ? "مسودات ومبادرات قيد التجهيز" : "Drafts & Prep Initiatives"}
            </h3>
            <div className="mb-6 flex-1">
              <span className="text-3xl font-black font-mono text-foreground block">
                {draftCount}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  {isAr ? "مبادرة" : "initiatives"}
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
              {isAr ? "المبادرات المنشورة للعامة" : "Published Initiatives"}
            </h3>
            <div className="mb-6 flex-1">
              <span className="text-3xl font-black font-mono text-foreground block">
                {publishedCount}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  {isAr ? "مبادرة" : "initiatives"}
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
              {isAr ? "إجمالي برامج العائلة" : "Total Programs"}
            </h3>
            <div className="mb-6 flex-1">
              <span className="text-3xl font-black font-mono text-foreground block">
                {initiatives.length}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  {isAr ? "برنامج" : "programs"}
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
              <span className="text-[10px] font-mono opacity-60 ml-1">({initiatives.length})</span>
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
              <TableHead className="font-semibold">{isAr ? "المبادرة" : "Initiative"}</TableHead>
              <TableHead className="font-semibold">{isAr ? "الملخص" : "Summary"}</TableHead>
              <TableHead className="font-semibold">{isAr ? "الحالة" : "Status"}</TableHead>
              <TableHead className="font-semibold text-center">
                {isAr ? "الراغبون بالمشاركة" : "Interested"}
              </TableHead>
              <TableHead className="font-semibold text-end">
                {isAr ? "الإجراء" : "Action"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInitiatives.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Rocket className="w-8 h-8 mb-3 opacity-20" />
                    <p className="text-sm font-medium">
                      {isAr ? "لا توجد مبادرات في هذه القائمة" : "No initiatives found"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredInitiatives.map((item) => (
                <TableRow
                  key={item.id}
                  className="group cursor-pointer hover:bg-muted/30"
                  onClick={() => handleOpenEdit(item)}
                >
                  <TableCell className="max-w-[200px]">
                    <div className="font-bold text-foreground flex items-center gap-2 truncate">
                      {item.title_ar}
                      {!item.is_published && (
                        <Badge
                          variant="outline"
                          className="shrink-0 text-[9px] bg-amber-500/10 text-amber-600 border-amber-500/20 px-1 py-0 h-4"
                        >
                          {isAr ? "مسودة" : "Draft"}
                        </Badge>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1 font-mono truncate">
                      /{item.slug}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <div className="text-xs text-muted-foreground truncate">{item.summary_ar}</div>
                  </TableCell>
                  <TableCell>{getStatusDisplay(item.status)}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] gap-1 text-primary hover:underline"
                      onClick={(e) => handleOpenRegistrations(item, e)}
                    >
                      <HeartHandshake className="w-3 h-3" />
                      {registrations.filter((r) => r.initiative_id === item.id).length}
                    </Button>
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
                {selectedInit
                  ? isAr
                    ? "تعديل مبادرة"
                    : "Edit Initiative"
                  : isAr
                    ? "إضافة مبادرة جديدة"
                    : "Add Initiative"}
              </SheetTitle>
              <SheetDescription className="text-xs font-mono mt-1">
                {selectedInit
                  ? `ID: ${selectedInit.id.split("-")[0]}`
                  : isAr
                    ? "سجل جديد"
                    : "New Record"}
              </SheetDescription>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-xs font-bold text-muted-foreground">
                {isAr ? "منشور ومتاح للعامة" : "Published"}
              </Label>
              <Switch
                checked={form.is_published}
                onCheckedChange={(c) => setForm({ ...form, is_published: c })}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
            <form id="initiative-form" onSubmit={handleSubmit} className="space-y-6">
              <ImageUploadInput
                label={isAr ? "صورة الغلاف" : "Cover Image"}
                value={form.cover_path}
                onChange={(url) => setForm({ ...form, cover_path: url })}
                bucket="cms-media"
                helperText={isAr ? "تظهر كخلفية أو غلاف للمبادرة" : "Appears as initiative cover"}
              />

              <div className="space-y-4">
                <h4 className="font-bold text-sm text-foreground border-b border-border pb-2">
                  {isAr ? "المعلومات الأساسية" : "Basic Info"}
                </h4>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">
                      {isAr ? "رابط المبادرة (Slug) *" : "URL Slug *"}
                    </Label>
                    <Input
                      required
                      value={form.slug}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                        })
                      }
                      placeholder="e.g. medical-fund"
                      className="bg-background font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">
                      {isAr ? "عنوان المبادرة (AR) *" : "Title (AR) *"}
                    </Label>
                    <Input
                      required
                      value={form.title_ar}
                      onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">
                      {isAr ? "عنوان المبادرة (EN)" : "Title (EN)"}
                    </Label>
                    <Input
                      value={form.title_en ?? ""}
                      onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-sm text-foreground border-b border-border pb-2">
                  {isAr ? "ملخص وتفاصيل المبادرة" : "Summary & Details"}
                </h4>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">
                      {isAr ? "ملخص قصير (AR)" : "Summary (AR)"}
                    </Label>
                    <Textarea
                      rows={2}
                      value={form.summary_ar ?? ""}
                      onChange={(e) => setForm({ ...form, summary_ar: e.target.value })}
                      className="bg-background text-xs resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">
                      {isAr ? "تفاصيل إضافية (AR)" : "Full Description (AR)"}
                    </Label>
                    <Textarea
                      rows={4}
                      value={form.body_ar ?? ""}
                      onChange={(e) => setForm({ ...form, body_ar: e.target.value })}
                      className="bg-background text-xs resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-sm text-foreground border-b border-border pb-2">
                  {isAr ? "الحالة والترتيب" : "Status & Ordering"}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">
                      {isAr ? "حالة التنفيذ *" : "Status *"}
                    </Label>
                    <Select
                      value={form.status}
                      onValueChange={(value) => setForm({ ...form, status: value as any })}
                    >
                      <SelectTrigger className="h-10 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">{isAr ? "مخطط لها" : "Planned"}</SelectItem>
                        <SelectItem value="ongoing">{isAr ? "مستمرة" : "Ongoing"}</SelectItem>
                        <SelectItem value="completed">{isAr ? "مكتملة" : "Completed"}</SelectItem>
                      </SelectContent>
                    </Select>
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
              form="initiative-form"
              disabled={loading}
              className="w-2/3 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : null}
              {loading
                ? isAr
                  ? "جاري الحفظ..."
                  : "Saving..."
                : isAr
                  ? "حفظ المبادرة"
                  : "Save Initiative"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Interested Members Dialog */}
      {activeInitForRegistrations && (
        <Dialog open={registrationsModalOpen} onOpenChange={setRegistrationsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-primary" />
                {isAr
                  ? `الراغبون بالمشاركة: ${activeInitForRegistrations.title_ar}`
                  : `Interested members: ${activeInitForRegistrations.title_ar}`}
              </DialogTitle>
            </DialogHeader>

            <div className="border border-border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 text-xs">
                    <TableHead>{isAr ? "الاسم" : "Name"}</TableHead>
                    <TableHead>{isAr ? "البريد والهاتف" : "Contact"}</TableHead>
                    <TableHead>{isAr ? "ملاحظات" : "Notes"}</TableHead>
                    <TableHead className="text-center">{isAr ? "الحالة" : "Status"}</TableHead>
                    <TableHead className="text-end">{isAr ? "إجراء" : "Action"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initRegistrations.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-muted-foreground text-xs"
                      >
                        {isAr
                          ? "لم يبدِ أحد رغبته بالمشاركة بعد"
                          : "No one has expressed interest yet"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    initRegistrations.map((r) => (
                      <TableRow key={r.id} className="text-xs hover:bg-muted/30">
                        <TableCell className="font-semibold">{r.name}</TableCell>
                        <TableCell className="font-mono text-muted-foreground">
                          <span>{r.email}</span>
                          {r.phone && <span className="block text-[10px]">{r.phone}</span>}
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate text-muted-foreground">
                          {r.notes || "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Select
                            value={r.status}
                            onValueChange={async (val: any) => {
                              if (onUpdateRegistrationStatus) {
                                await onUpdateRegistrationStatus(r.id, val);
                                toast.success(isAr ? "تم تحديث الحالة" : "Status updated");
                              }
                            }}
                          >
                            <SelectTrigger className="h-6 text-[10px] w-24">
                              <SelectValue>{getRegistrationStatusLabel(r.status)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">{isAr ? "جديد" : "New"}</SelectItem>
                              <SelectItem value="contacted">
                                {isAr ? "تم التواصل" : "Contacted"}
                              </SelectItem>
                              <SelectItem value="confirmed">
                                {isAr ? "منضم" : "Confirmed"}
                              </SelectItem>
                              <SelectItem value="declined">
                                {isAr ? "اعتذر" : "Declined"}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                            onClick={async () => {
                              if (
                                !(await confirm({
                                  title: isAr
                                    ? `حذف تسجيل "${r.name}"؟`
                                    : `Delete ${r.name}'s registration?`,
                                  description: isAr
                                    ? "سيتم حذف هذا التسجيل نهائيًا ولا يمكن التراجع عن هذا الإجراء."
                                    : "This registration will be permanently removed. This can't be undone.",
                                  tone: "destructive",
                                }))
                              )
                                return;
                              if (onDeleteRegistration) {
                                await onDeleteRegistration(r.id);
                                toast.success(isAr ? "تم حذف التسجيل" : "Registration deleted");
                              }
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRegistrationsModalOpen(false)}
              >
                {isAr ? "إغلاق" : "Close"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
