import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLang } from "@/i18n/LanguageProvider";
import { Plus, Edit2, Trash2, Building2, UserCheck, Phone, Globe, ExternalLink, Check, X, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { ImageUploadInput } from "@/components/console/media/ImageUploadInput";
import type { BusinessInput, MembershipRequestReviewInput } from "@/lib/admin-hub.schemas";

export type BusinessRow = {
  id: string;
  slug: string;
  name_ar: string;
  name_en?: string | null;
  category_ar: string;
  category_en: string;
  city_ar: string;
  city_en?: string | null;
  description_ar?: string | null;
  description_en?: string | null;
  owner_branch_ar?: string | null;
  owner_branch_en?: string | null;
  contact: string;
  website?: string | null;
  logo_path?: string | null;
  is_published: boolean;
  sort_order: number;
};

export type MembershipRequestRow = {
  id: string;
  user_id?: string | null;
  full_name_ar: string;
  full_name_en?: string | null;
  email: string;
  phone?: string | null;
  branch_slug?: string | null;
  father_lineage?: string | null;
  notes?: string | null;
  status: "pending" | "approved" | "rejected";
  review_note?: string | null;
  reviewed_at?: string | null;
  created_at: string;
};

export function DirectoryManager({
  businesses,
  membershipRequests,
  defaultTab = "businesses",
  onSaveBusiness,
  onDeleteBusiness,
  onReviewRequest,
}: {
  businesses: BusinessRow[];
  membershipRequests: MembershipRequestRow[];
  defaultTab?: "businesses" | "requests";
  onSaveBusiness: (data: BusinessInput) => Promise<void>;
  onDeleteBusiness: (id: string) => Promise<void>;
  onReviewRequest: (data: MembershipRequestReviewInput) => Promise<void>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const [activeTab, setActiveTab] = useState(defaultTab);

  // Sync tab when navigating directly from triage cards or sidebar
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const [bizModalOpen, setBizModalOpen] = useState(false);
  const [selectedBiz, setSelectedBiz] = useState<BusinessRow | null>(null);

  const [reqModalOpen, setReqModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<MembershipRequestRow | null>(null);
  const [reqReviewNote, setReqReviewNote] = useState("");
  const [loading, setLoading] = useState(false);

  const [bizForm, setBizForm] = useState<BusinessInput>({
    id: undefined,
    slug: "",
    name_ar: "",
    name_en: "",
    category_ar: "الخدمات المهنية والاستشارية",
    category_en: "Professional & Consulting Services",
    city_ar: "الأحساء",
    city_en: "Al-Ahsa",
    description_ar: "",
    description_en: "",
    owner_branch_ar: "فرع الصالحية",
    owner_branch_en: "Al-Salihiyah",
    contact: "",
    website: "",
    is_published: true,
    sort_order: 0,
  });

  const handleOpenAddBiz = () => {
    setSelectedBiz(null);
    setBizForm({
      id: undefined,
      slug: "",
      name_ar: "",
      name_en: "",
      category_ar: "الخدمات المهنية والاستشارية",
      category_en: "Professional & Consulting Services",
      city_ar: "الأحساء",
      city_en: "Al-Ahsa",
      description_ar: "",
      description_en: "",
      owner_branch_ar: "فرع الصالحية",
      owner_branch_en: "Al-Salihiyah",
      contact: "",
      website: "",
      is_published: true,
      sort_order: businesses.length,
    });
    setBizModalOpen(true);
  };

  const [bizSearch, setBizSearch] = useState("");
  const [bizFilterStatus, setBizFilterStatus] = useState<"all" | "published" | "pending">("all");

  const pendingCount = businesses.filter((b) => !b.is_published).length;

  const filteredBusinesses = businesses.filter((b) => {
    if (bizFilterStatus === "published" && !b.is_published) return false;
    if (bizFilterStatus === "pending" && b.is_published) return false;
    if (bizSearch.trim()) {
      const q = bizSearch.toLowerCase();
      const match =
        b.name_ar.toLowerCase().includes(q) ||
        (b.name_en && b.name_en.toLowerCase().includes(q)) ||
        b.category_ar.toLowerCase().includes(q) ||
        b.city_ar.toLowerCase().includes(q) ||
        (b.owner_branch_ar && b.owner_branch_ar.toLowerCase().includes(q)) ||
        b.contact.includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleQuickTogglePublish = async (b: BusinessRow) => {
    try {
      setLoading(true);
      await onSaveBusiness({
        ...b,
        name_en: b.name_en ?? "",
        city_en: b.city_en ?? "",
        description_ar: b.description_ar ?? "",
        description_en: b.description_en ?? "",
        owner_branch_ar: b.owner_branch_ar ?? "",
        owner_branch_en: b.owner_branch_en ?? "",
        website: b.website ?? "",
        is_published: !b.is_published,
      });
      toast.success(
        isAr
          ? !b.is_published
            ? "تم اعتماد المنشأة ونشرها في الدليل العام"
            : "تم تحويل المنشأة إلى مسودة"
          : !b.is_published
          ? "Business approved and published"
          : "Business moved to draft"
      );
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل تحديث الحالة" : "Failed to update status"));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditBiz = (b: BusinessRow) => {
    setSelectedBiz(b);
    setBizForm({
      id: b.id,
      slug: b.slug,
      name_ar: b.name_ar,
      name_en: b.name_en ?? "",
      category_ar: b.category_ar,
      category_en: b.category_en,
      city_ar: b.city_ar,
      city_en: b.city_en ?? "",
      description_ar: b.description_ar ?? "",
      description_en: b.description_en ?? "",
      owner_branch_ar: b.owner_branch_ar ?? "",
      owner_branch_en: b.owner_branch_en ?? "",
      contact: b.contact,
      website: b.website ?? "",
      is_published: b.is_published,
      sort_order: b.sort_order,
    });
    setBizModalOpen(true);
  };

  const handleSubmitBiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizForm.name_ar.trim() || !bizForm.contact.trim() || !bizForm.slug.trim()) return;
    try {
      setLoading(true);
      await onSaveBusiness(bizForm);
      setBizModalOpen(false);
      toast.success(isAr ? "تم حفظ المنشأة بنجاح" : "Business saved successfully");
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل حفظ المنشأة" : "Failed to save"));
    } finally {
      setLoading(false);
    }
  };

  const handleReviewReqSubmit = async (status: "approved" | "rejected") => {
    if (!selectedReq) return;
    try {
      setLoading(true);
      await onReviewRequest({
        id: selectedReq.id,
        status,
        review_note: reqReviewNote,
      });
      setReqModalOpen(false);
      toast.success(isAr ? `تم تحديث الطلب إلى: ${status === "approved" ? "معتمد" : "مرفوض"}` : `Request updated to ${status}`);
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل تحديث الطلب" : "Failed to update"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2.5">
          <Building2 className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            {isAr ? "إدارة دليل المنشآت وطلبات توثيق الأعضاء" : "Directory & Membership Verification"}
          </h3>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-card p-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "businesses" | "requests")} className="w-full">
          <TabsList className="grid grid-cols-2 max-w-md mb-4">
            <TabsTrigger value="businesses" className="text-xs gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              {isAr ? `دليل الأعمال (${businesses.length})` : `Businesses (${businesses.length})`}
              {pendingCount > 0 && (
                <span className="ms-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" className="text-xs gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              {isAr ? `طلبات العضوية (${membershipRequests.length})` : `Applications (${membershipRequests.length})`}
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Businesses */}
          <TabsContent value="businesses" className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search & Status Filters */}
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <Input
                  value={bizSearch}
                  onChange={(e) => setBizSearch(e.target.value)}
                  placeholder={isAr ? "بحث في المنشآت…" : "Search businesses…"}
                  className="h-8 text-xs w-full sm:w-56"
                />
                <div className="flex items-center border border-border rounded-md p-0.5 bg-muted/30">
                  <button
                    type="button"
                    onClick={() => setBizFilterStatus("all")}
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                      bizFilterStatus === "all" ? "bg-background text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isAr ? "الكل" : "All"} ({businesses.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBizFilterStatus("published")}
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                      bizFilterStatus === "published" ? "bg-background text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isAr ? "المنشور" : "Published"} ({businesses.length - pendingCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBizFilterStatus("pending")}
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                      bizFilterStatus === "pending" ? "bg-background text-foreground font-semibold shadow-xs text-amber-600 dark:text-amber-400" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isAr ? "بانتظار المراجعة" : "Pending Audit"} ({pendingCount})
                  </button>
                </div>
              </div>

              <Button size="sm" onClick={handleOpenAddBiz} className="h-8 text-xs gap-1.5 shrink-0">
                <Plus className="w-3.5 h-3.5" />
                {isAr ? "إدراج منشأة جديدة" : "Add Business"}
              </Button>
            </div>

            <div className="border border-border rounded-xl bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 text-xs">
                    <TableHead>{isAr ? "اسم المنشأة" : "Business Name"}</TableHead>
                    <TableHead>{isAr ? "القطاع" : "Sector"}</TableHead>
                    <TableHead>{isAr ? "المدينة / الفرع" : "City / Branch"}</TableHead>
                    <TableHead>{isAr ? "التواصل" : "Contact"}</TableHead>
                    <TableHead className="text-center">{isAr ? "الحالة" : "Status"}</TableHead>
                    <TableHead className="text-end">{isAr ? "إجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBusinesses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-28 text-center text-muted-foreground text-xs">
                        {isAr ? "لا توجد منشآت مطابقة لمعايير البحث" : "No matching business listings found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBusinesses.map((b) => (
                      <TableRow key={b.id} className="text-xs hover:bg-muted/30">
                        <TableCell className="font-semibold text-foreground">
                          {b.name_ar}
                          {b.name_en && <span className="block text-[11px] text-muted-foreground font-mono">{b.name_en}</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-normal">{b.category_ar}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="block text-foreground">{b.city_ar}</span>
                          {b.owner_branch_ar && <span className="text-[10px] text-muted-foreground">{b.owner_branch_ar}</span>}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            {b.contact}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <button
                            type="button"
                            onClick={() => handleQuickTogglePublish(b)}
                            disabled={loading}
                            className="cursor-pointer"
                            title={isAr ? "اضغط لتغيير حالة النشر" : "Click to toggle publish"}
                          >
                            <Badge
                              variant={b.is_published ? "default" : "outline"}
                              className={`text-[10px] transition-colors ${
                                !b.is_published
                                  ? "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
                              }`}
                            >
                              {b.is_published ? (isAr ? "معتمد ومنشور" : "Published") : (isAr ? "بانتظار المراجعة" : "Pending Audit")}
                            </Badge>
                          </button>
                        </TableCell>
                        <TableCell className="text-end">
                          <div className="flex items-center justify-end gap-1">
                            {!b.is_published && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-[11px] text-emerald-600 hover:bg-emerald-500/10 gap-1 font-semibold"
                                onClick={() => handleQuickTogglePublish(b)}
                                title={isAr ? "اعتماد ونشر فوري" : "Approve & Publish"}
                              >
                                <Check className="w-3 h-3" />
                                {isAr ? "اعتماد" : "Approve"}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-7 h-7 text-muted-foreground hover:text-foreground"
                              onClick={() => handleOpenEditBiz(b)}
                              title={isAr ? "تعديل التفاصيل" : "Edit Details"}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-7 h-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                if (window.confirm(isAr ? "هل أنت متأكد من حذف هذه المنشأة؟" : "Are you sure?")) {
                                  onDeleteBusiness(b.id);
                                }
                              }}
                              title={isAr ? "حذف المنشأة" : "Delete"}
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
          </TabsContent>

          {/* Tab 2: Membership Applications */}
          <TabsContent value="requests" className="space-y-4">
            <div className="border border-border rounded-xl bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 text-xs">
                    <TableHead>{isAr ? "مقدم الطلب" : "Applicant"}</TableHead>
                    <TableHead>{isAr ? "البريد والهاتف" : "Contact"}</TableHead>
                    <TableHead>{isAr ? "الفرع والنسب" : "Branch & Lineage"}</TableHead>
                    <TableHead>{isAr ? "تاريخ التقديم" : "Date"}</TableHead>
                    <TableHead className="text-center">{isAr ? "الحالة" : "Status"}</TableHead>
                    <TableHead className="text-end">{isAr ? "مراجعة" : "Review"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {membershipRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-28 text-center text-muted-foreground text-xs">
                        {isAr ? "لا توجد طلبات عضوية معلقة" : "No membership requests found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    membershipRequests.map((req) => (
                      <TableRow key={req.id} className="text-xs hover:bg-muted/30">
                        <TableCell className="font-semibold text-foreground">
                          {req.full_name_ar}
                          {req.full_name_en && <span className="block text-[11px] text-muted-foreground font-mono">{req.full_name_en}</span>}
                        </TableCell>
                        <TableCell>
                          <span className="block font-mono text-muted-foreground">{req.email}</span>
                          {req.phone && <span className="block font-mono text-[10px] text-muted-foreground">{req.phone}</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                            {req.branch_slug || "غير محدد"}
                          </Badge>
                          {req.notes && <span className="block text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{req.notes}</span>}
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground">
                          {new Date(req.created_at).toLocaleDateString(isAr ? "ar-SA" : "en-US")}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={req.status === "approved" ? "default" : req.status === "rejected" ? "destructive" : "secondary"}
                            className="text-[10px]"
                          >
                            {req.status === "approved" ? (isAr ? "معتمد" : "Approved") : req.status === "rejected" ? (isAr ? "مرفوض" : "Rejected") : (isAr ? "قيد المراجعة" : "Pending")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setSelectedReq(req);
                              setReqReviewNote(req.review_note ?? "");
                              setReqModalOpen(true);
                            }}
                          >
                            {isAr ? "فحص واعتماد" : "Review"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Business Add/Edit Dialog */}
      <Dialog open={bizModalOpen} onOpenChange={setBizModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {selectedBiz ? (isAr ? "تعديل بيانات المنشأة" : "Edit Business Listing") : isAr ? "إدراج منشأة جديدة" : "Add Business"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitBiz} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "اسم المنشأة (بالعربية) *" : "Business Name (AR) *"}</Label>
                <Input
                  required
                  value={bizForm.name_ar}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBizForm((prev) => ({
                      ...prev,
                      name_ar: val,
                      slug: prev.slug || val.toLowerCase().replace(/\s+/g, "-"),
                    }));
                  }}
                  placeholder="مثال: شركة رواسي الأحساء للمقاولات"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "اسم المنشأة (EN)" : "Business Name (EN)"}</Label>
                <Input
                  value={bizForm.name_en ?? ""}
                  onChange={(e) => setBizForm({ ...bizForm, name_en: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "المعرف الفريد (Slug) *" : "Slug *"}</Label>
                <Input
                  required
                  value={bizForm.slug}
                  onChange={(e) => setBizForm({ ...bizForm, slug: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "القطاع (بالعربية) *" : "Sector (AR) *"}</Label>
                <Input
                  required
                  value={bizForm.category_ar}
                  onChange={(e) => setBizForm({ ...bizForm, category_ar: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "القطاع (EN) *" : "Sector (EN) *"}</Label>
                <Input
                  required
                  value={bizForm.category_en}
                  onChange={(e) => setBizForm({ ...bizForm, category_en: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "المدينة *" : "City *"}</Label>
                <Input
                  required
                  value={bizForm.city_ar}
                  onChange={(e) => setBizForm({ ...bizForm, city_ar: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "فرع الأسرة للمالك" : "Owner Branch"}</Label>
                <Input
                  value={bizForm.owner_branch_ar ?? ""}
                  onChange={(e) => setBizForm({ ...bizForm, owner_branch_ar: e.target.value })}
                  placeholder="مثال: فرع الصالحية"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "رقم الهاتف / الواتساب *" : "Phone *"}</Label>
                <Input
                  required
                  value={bizForm.contact}
                  onChange={(e) => setBizForm({ ...bizForm, contact: e.target.value })}
                  placeholder="+966 13 000 0000"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "الموقع الإلكتروني" : "Website URL"}</Label>
              <Input
                value={bizForm.website ?? ""}
                onChange={(e) => setBizForm({ ...bizForm, website: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "نبذة عن المنشأة والأنشطة" : "Description"}</Label>
              <Textarea
                rows={3}
                value={bizForm.description_ar ?? ""}
                onChange={(e) => setBizForm({ ...bizForm, description_ar: e.target.value })}
              />
            </div>

            <ImageUploadInput
              label={isAr ? "شعار أو صورة المنشأة" : "Business Logo / Image"}
              value={bizForm.logo_path}
              onChange={(url) => setBizForm({ ...bizForm, logo_path: url })}
              bucket="site-media"
            />

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setBizModalOpen(false)}>
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? (isAr ? "جاري الحفظ..." : "Saving...") : isAr ? "حفظ المنشأة" : "Save Business"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Membership Request Review Dialog */}
      {selectedReq && (
        <Dialog open={reqModalOpen} onOpenChange={setReqModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                {isAr ? "مراجعة واعتماد طلب انتساب عائلي" : "Review Membership Application"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 bg-muted/20 border border-border rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold text-foreground text-sm">{selectedReq.full_name_ar}</span>
                  <Badge variant="outline">{selectedReq.branch_slug || "بدون فرع"}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground font-mono">
                  <span>{selectedReq.email}</span>
                  <span>{selectedReq.phone || "—"}</span>
                </div>
                {selectedReq.notes && (
                  <div className="mt-2 pt-2 border-t border-border/50 text-[11px]">
                    <span className="text-muted-foreground block font-semibold">{isAr ? "ملاحظات النسب والانتساب:" : "Lineage notes:"}</span>
                    <p className="text-foreground mt-0.5">{selectedReq.notes}</p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">{isAr ? "ملاحظات وتوجيه الأمانة العامة" : "Secretariat Review Note"}</Label>
                <Textarea
                  rows={3}
                  value={reqReviewNote}
                  onChange={(e) => setReqReviewNote(e.target.value)}
                  placeholder={isAr ? "اكتب ملاحظة أو سبب الاعتماد/الرفض..." : "Review notes..."}
                />
              </div>
            </div>

            <DialogFooter className="flex sm:justify-between gap-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={loading}
                onClick={() => handleReviewReqSubmit("rejected")}
                className="gap-1 text-xs"
              >
                <X className="w-3.5 h-3.5" />
                {isAr ? "رفض الطلب" : "Reject"}
              </Button>

              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setReqModalOpen(false)}>
                  {isAr ? "إغلاق" : "Cancel"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={loading}
                  onClick={() => handleReviewReqSubmit("approved")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  {isAr ? "اعتماد وتوثيق العضوية" : "Approve & Verify"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
