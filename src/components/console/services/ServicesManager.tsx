import { useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Upload, FileText, Layers, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLang } from "@/i18n/LanguageProvider";
import {
  getServicesAdminData,
  upsertService,
  deleteService,
  upsertDocument,
  deleteServiceDocument,
} from "@/lib/admin-hub.functions";
import { uploadContentMedia } from "@/lib/cms.functions";
import type { ServiceInput } from "@/lib/admin-hub.schemas";

type ServiceRow = {
  id: string;
  slug: string;
  category: string;
  title_ar: string;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  sort_order: number;
  is_published: boolean;
};

type DocRow = {
  id: string;
  service_id: string | null;
  title_ar: string;
  title_en: string | null;
  file_path: string | null;
  status: string;
  visibility: string;
};

const emptyForm: ServiceInput = {
  id: undefined,
  slug: "",
  category: "family",
  title_ar: "",
  title_en: "",
  description_ar: "",
  description_en: "",
  sort_order: 0,
  is_published: true,
} as unknown as ServiceInput;

/**
 * Admin console manager for «خدمات أفراد الأسرة وخدمات المنشآت»: the two service
 * categories, the services inside them, and the documents attached to each
 * service. Uploads go to the private `content` bucket and are linked through
 * `documents.service_id`, so the public page picks them up automatically.
 */
export function ServicesManager() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const qc = useQueryClient();

  const loadData = useServerFn(getServicesAdminData);
  const saveService = useServerFn(upsertService);
  const removeService = useServerFn(deleteService);
  const saveDocument = useServerFn(upsertDocument);
  const removeDocument = useServerFn(deleteServiceDocument);
  const upload = useServerFn(uploadContentMedia);

  const { data, isLoading } = useQuery({
    queryKey: ["admin_services"],
    queryFn: () => loadData(),
  });

  const services = (data?.services ?? []) as unknown as ServiceRow[];
  const documents = (data?.documents ?? []) as unknown as DocRow[];

  const [category, setCategory] = useState<"family" | "establishment">("family");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ServiceInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const rows = useMemo(
    () =>
      services
        .filter((s) => s.category === category)
        .sort((a, b) => a.sort_order - b.sort_order),
    [services, category],
  );

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin_services"] });

  const openAdd = () => {
    setForm({
      ...emptyForm,
      category,
      sort_order: rows.length + 1,
    } as unknown as ServiceInput);
    setFormOpen(true);
  };

  const openEdit = (s: ServiceRow) => {
    setForm({
      id: s.id,
      slug: s.slug,
      category: s.category === "family" ? "family" : "establishment",
      title_ar: s.title_ar,
      title_en: s.title_en ?? "",
      description_ar: s.description_ar ?? "",
      description_en: s.description_en ?? "",
      sort_order: s.sort_order,
      is_published: s.is_published,
    } as unknown as ServiceInput);
    setFormOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title_ar?.trim()) return;
    try {
      setSaving(true);
      await saveService({ data: form });
      toast.success(isAr ? "تم حفظ الخدمة" : "Service saved");
      setFormOpen(false);
      refresh();
    } catch (err) {
      toast.error(
        (err as Error)?.message || (isAr ? "تعذّر حفظ الخدمة" : "Could not save the service"),
      );
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (s: ServiceRow) => {
    if (
      !window.confirm(
        isAr
          ? `سيتم حذف الخدمة «${s.title_ar}». ستبقى الوثائق محفوظة دون ارتباط. هل تريد المتابعة؟`
          : `Service “${s.title_en || s.title_ar}” will be removed. Its documents are kept but unlinked. Continue?`,
      )
    )
      return;
    try {
      await removeService({ data: { id: s.id } });
      toast.success(isAr ? "تم حذف الخدمة" : "Service removed");
      refresh();
    } catch (err) {
      toast.error((err as Error)?.message || (isAr ? "تعذّر الحذف" : "Could not delete"));
    }
  };

  const onPickFile = async (service: ServiceRow, file: File) => {
    if (file.type !== "application/pdf") {
      toast.error(isAr ? "يُقبل ملف PDF فقط" : "Only PDF files are accepted");
      return;
    }
    try {
      setUploadingFor(service.id);
      const buffer = await file.arrayBuffer();
      let binary = "";
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.length; i += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      }
      const res = await upload({
        data: {
          folder: "documents",
          fileName: file.name,
          contentType: "application/pdf",
          dataBase64: btoa(binary),
        },
      });
      if (!res.ok) throw new Error(res.error);

      const title = file.name.replace(/\.[^.]+$/, "");
      await saveDocument({
        data: {
          title_ar: title,
          title_en: title,
          file_path: res.path,
          category: service.category === "family" ? "family_services" : "establishment_services",
          service_id: service.id,
          visibility: "public",
          status: "published",
        },
      });
      toast.success(isAr ? "تم رفع الوثيقة وربطها بالخدمة" : "Document uploaded and linked");
      refresh();
    } catch (err) {
      toast.error((err as Error)?.message || (isAr ? "تعذّر رفع الوثيقة" : "Upload failed"));
    } finally {
      setUploadingFor(null);
    }
  };

  const onDeleteDoc = async (doc: DocRow) => {
    if (!window.confirm(isAr ? "حذف هذه الوثيقة؟" : "Delete this document?")) return;
    try {
      await removeDocument({ data: { id: doc.id } });
      toast.success(isAr ? "تم حذف الوثيقة" : "Document deleted");
      refresh();
    } catch (err) {
      toast.error((err as Error)?.message || (isAr ? "تعذّر الحذف" : "Could not delete"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <Layers className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            {isAr
              ? "خدمات افراد الأسرة و خدمات المنشأت"
              : "Family Member Services & Establishment Services"}
          </h3>
        </div>
        <Button size="sm" onClick={openAdd} className="h-8 gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          {isAr ? "إضافة خدمة" : "Add service"}
        </Button>
      </div>

      <Tabs value={category} onValueChange={(v) => setCategory(v as "family" | "establishment")}>
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:w-[26rem]">
          <TabsTrigger value="family" className="h-auto whitespace-normal py-2 text-xs leading-5">
            {isAr ? "خدمات افراد الأسرة" : "Family Member Services"}
          </TabsTrigger>
          <TabsTrigger
            value="establishment"
            className="h-auto whitespace-normal py-2 text-xs leading-5"
          >
            {isAr ? "خدمات المنشأت" : "Establishment Services"}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <p className="p-6 text-center text-xs text-muted-foreground">
          {isAr ? "جارٍ التحميل…" : "Loading…"}
        </p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
          {isAr ? "لا توجد خدمات في هذا التصنيف بعد." : "No services in this category yet."}
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((s) => {
            const docs = documents.filter((d) => d.service_id === s.id);
            return (
              <li key={s.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">{s.title_ar}</p>
                    {s.title_en ? (
                      <p className="text-xs text-muted-foreground">{s.title_en}</p>
                    ) : null}
                    <p className="nums mt-1 text-[11px] text-muted-foreground">
                      {isAr ? "الترتيب" : "Order"}: {s.sort_order} ·{" "}
                      {s.is_published
                        ? isAr
                          ? "منشورة"
                          : "Published"
                        : isAr
                          ? "غير منشورة"
                          : "Unpublished"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <input
                      ref={(el) => {
                        fileInputs.current[s.id] = el;
                      }}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (file) void onPickFile(s, file);
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 text-xs"
                      disabled={uploadingFor === s.id}
                      onClick={() => fileInputs.current[s.id]?.click()}
                    >
                      {uploadingFor === s.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Upload className="h-3.5 w-3.5" />
                      )}
                      {isAr ? "رفع وثيقة" : "Upload document"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => openEdit(s)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      {isAr ? "تحرير" : "Edit"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 text-xs text-destructive"
                      onClick={() => onDelete(s)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {isAr ? "حذف" : "Delete"}
                    </Button>
                  </div>
                </div>

                {docs.length > 0 ? (
                  <ul className="mt-3 space-y-2 border-t border-border pt-3">
                    {docs.map((d) => (
                      <li
                        key={d.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
                          <span className="truncate text-xs text-foreground">{d.title_ar}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 gap-1.5 text-[11px] text-destructive"
                            onClick={() => onDeleteDoc(d)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader className="text-start">
            <DialogTitle className="text-sm">
              {form.id
                ? isAr
                  ? "تحرير الخدمة"
                  : "Edit service"
                : isAr
                  ? "إضافة خدمة"
                  : "Add service"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">{isAr ? "التصنيف" : "Category"}</Label>
              <Tabs
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as "family" | "establishment" }))
                }
              >
                <TabsList className="grid h-auto w-full grid-cols-2 gap-1">
                  <TabsTrigger value="family" className="h-auto whitespace-normal py-2 text-xs">
                    {isAr ? "خدمات افراد الأسرة" : "Family Member Services"}
                  </TabsTrigger>
                  <TabsTrigger
                    value="establishment"
                    className="h-auto whitespace-normal py-2 text-xs"
                  >
                    {isAr ? "خدمات المنشأت" : "Establishment Services"}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">{isAr ? "اسم الخدمة (عربي)" : "Service name (Arabic)"}</Label>
              <Input
                value={form.title_ar ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, title_ar: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">
                {isAr ? "اسم الخدمة (إنجليزي)" : "Service name (English)"}
              </Label>
              <Input
                value={form.title_en ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{isAr ? "الوصف (عربي)" : "Description (Arabic)"}</Label>
              <Textarea
                rows={3}
                value={form.description_ar ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, description_ar: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{isAr ? "الوصف (إنجليزي)" : "Description (English)"}</Label>
              <Textarea
                rows={3}
                value={form.description_en ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, description_en: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 items-end gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{isAr ? "الترتيب" : "Order"}</Label>
                <Input
                  type="number"
                  value={form.sort_order ?? 0}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))
                  }
                />
              </div>
              <div className="flex items-center gap-2 pb-2">
                <Switch
                  checked={!!form.is_published}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, is_published: v }))}
                />
                <Label className="text-xs">{isAr ? "منشورة" : "Published"}</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" size="sm" disabled={saving} className="text-xs">
                {saving ? (isAr ? "جارٍ الحفظ…" : "Saving…") : isAr ? "حفظ" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
