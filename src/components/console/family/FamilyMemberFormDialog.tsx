import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLang } from "@/i18n/LanguageProvider";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  User,
  MapPin,
  BookOpen,
  Shield,
  Upload,
  AlertTriangle,
  Image as ImageIcon,
} from "lucide-react";
import { SaudiCulturalAvatar } from "@/components/common/SaudiCulturalAvatar";
import { ImageUploadInput } from "@/components/console/media/ImageUploadInput";
import type { FamilyMemberInput } from "@/lib/admin-hub.schemas";

export type BranchOption = { id: string; name_ar: string; name_en?: string | null };
export type PlaceOption = { id: string; name_ar: string; name_en?: string | null };

export function FamilyMemberFormDialog({
  open,
  onOpenChange,
  initialData,
  branches,
  places,
  existingMembers,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<FamilyMemberInput> | null;
  branches: BranchOption[];
  places: PlaceOption[];
  existingMembers: { id: string; first_name_ar: string; last_name_ar: string }[];
  onSave: (data: FamilyMemberInput) => Promise<void>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [form, setForm] = useState<FamilyMemberInput>({
    id: undefined,
    first_name_ar: "",
    middle_name_ar: "",
    last_name_ar: "آل بوعبيد",
    display_name_ar: "",
    first_name_en: "",
    middle_name_en: "",
    last_name_en: "Al Bu Obaid",
    display_name_en: "",
    slug: "",
    gender: "male",
    date_of_birth: "",
    date_of_death: "",
    is_living: true,
    biography_ar: "",
    biography_en: "",
    occupation_ar: "",
    occupation_en: "",
    education_ar: "",
    education_en: "",
    birth_place_id: null,
    current_place_id: null,
    branch_id: null,
    avatar_path: null,
    cover_path: null,
    generation: 1,
    sort_order: 0,
    visibility: "public",
    status: "published",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        id: initialData.id,
        first_name_ar: initialData.first_name_ar ?? "",
        middle_name_ar: initialData.middle_name_ar ?? "",
        last_name_ar: initialData.last_name_ar ?? "آل بوعبيد",
        display_name_ar: initialData.display_name_ar ?? "",
        first_name_en: initialData.first_name_en ?? "",
        middle_name_en: initialData.middle_name_en ?? "",
        last_name_en: initialData.last_name_en ?? "Al Bu Obaid",
        display_name_en: initialData.display_name_en ?? "",
        slug: initialData.slug ?? "",
        gender: initialData.gender ?? "male",
        date_of_birth: initialData.date_of_birth ?? "",
        date_of_death: initialData.date_of_death ?? "",
        is_living: initialData.is_living ?? true,
        biography_ar: initialData.biography_ar ?? "",
        biography_en: initialData.biography_en ?? "",
        occupation_ar: initialData.occupation_ar ?? "",
        occupation_en: initialData.occupation_en ?? "",
        education_ar: initialData.education_ar ?? "",
        education_en: initialData.education_en ?? "",
        birth_place_id: initialData.birth_place_id ?? null,
        current_place_id: initialData.current_place_id ?? null,
        branch_id: initialData.branch_id ?? null,
        avatar_path: initialData.avatar_path ?? null,
        cover_path: initialData.cover_path ?? null,
        generation: initialData.generation ?? 1,
        sort_order: initialData.sort_order ?? 0,
        visibility: initialData.visibility ?? "public",
        status: initialData.status ?? "published",
      });
    } else {
      setForm({
        id: undefined,
        first_name_ar: "",
        middle_name_ar: "",
        last_name_ar: "آل بوعبيد",
        display_name_ar: "",
        first_name_en: "",
        middle_name_en: "",
        last_name_en: "Al Bu Obaid",
        display_name_en: "",
        slug: "",
        gender: "male",
        date_of_birth: "",
        date_of_death: "",
        is_living: true,
        biography_ar: "",
        biography_en: "",
        occupation_ar: "",
        occupation_en: "",
        education_ar: "",
        education_en: "",
        birth_place_id: null,
        current_place_id: null,
        branch_id: null,
        avatar_path: null,
        cover_path: null,
        generation: 1,
        sort_order: 0,
        visibility: "public",
        status: "published",
      });
    }
  }, [initialData, open]);

  // Generate slug if empty
  const handleFirstNameChange = (val: string) => {
    setForm((prev) => {
      const next = { ...prev, first_name_ar: val };
      if (!prev.slug && val) {
        next.slug = "member-" + Date.now().toString(36);
      }
      return next;
    });
  };

  // Duplicate warning detection
  const isPossibleDuplicate =
    !form.id &&
    form.first_name_ar.trim().length > 1 &&
    existingMembers.some(
      (m) =>
        m.first_name_ar.trim().toLowerCase() === form.first_name_ar.trim().toLowerCase() &&
        m.last_name_ar.trim().toLowerCase() === form.last_name_ar.trim().toLowerCase(),
    );

  const handleAvatarUpload = async (file: File) => {
    try {
      setUploadingAvatar(true);
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `avatars/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("family-photos").upload(path, file);
      if (error) throw error;
      const { data: pubUrl } = supabase.storage.from("family-photos").getPublicUrl(path);
      setForm((prev) => ({ ...prev, avatar_path: pubUrl.publicUrl }));
      toast.success(isAr ? "تم رفع الصورة بنجاح" : "Avatar uploaded successfully");
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل رفع الصورة" : "Failed to upload avatar"));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name_ar.trim()) {
      toast.error(isAr ? "يرجى كتابة الاسم الأول" : "First name is required");
      return;
    }
    if (!form.slug.trim()) {
      toast.error(isAr ? "يرجى تحديد المعرف الفريد (Slug)" : "Slug is required");
      return;
    }

    try {
      setLoading(true);
      await onSave(form);
      toast.success(isAr ? "تم حفظ بيانات الفرد بنجاح" : "Family member saved successfully");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || (isAr ? "حدث خطأ أثناء الحفظ" : "Error saving member"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {form.id
              ? isAr
                ? "تعديل بيانات فرد في الأسرة"
                : "Edit Family Member"
              : isAr
                ? "إضافة فرد جديد للأسرة"
                : "Add New Family Member"}
          </DialogTitle>
        </DialogHeader>

        {isPossibleDuplicate && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3 text-amber-600 dark:text-amber-400 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {isAr
                ? "تنبيه: يوجد فرد مسجل مسبقاً بنفس الاسم الكامل. تأكد من عدم تكرار السجل."
                : "Warning: A member with the exact same name already exists. Please verify duplicate."}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="identity" className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="identity" className="gap-1.5 text-xs">
                <User className="w-3.5 h-3.5" />
                {isAr ? "الهوية" : "Identity"}
              </TabsTrigger>
              <TabsTrigger value="life" className="gap-1.5 text-xs">
                <MapPin className="w-3.5 h-3.5" />
                {isAr ? "الحياة والموقع" : "Life & Places"}
              </TabsTrigger>
              <TabsTrigger value="bio" className="gap-1.5 text-xs">
                <BookOpen className="w-3.5 h-3.5" />
                {isAr ? "السيرة والمهنة" : "Bio & Career"}
              </TabsTrigger>
              <TabsTrigger value="privacy" className="gap-1.5 text-xs">
                <Shield className="w-3.5 h-3.5" />
                {isAr ? "الخصوصية والنشر" : "Privacy & Status"}
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Identity */}
            <TabsContent value="identity" className="space-y-4 pt-3">
              <div className="p-4 border border-border rounded-2xl bg-muted/20 space-y-3">
                <div className="flex items-center gap-4">
                  <SaudiCulturalAvatar
                    src={form.avatar_path}
                    alt={form.first_name_ar || "عضو الأسرة"}
                    size="xl"
                    className="shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <Label className="text-xs font-semibold block">
                      {isAr ? "الصورة الشخصية للعضو" : "Profile Avatar"}
                    </Label>
                    <p className="text-[11px] text-muted-foreground mt-0.5 mb-2">
                      {isAr
                        ? "في حال عدم رفع صورة مخصصة، سيتم عرض الرمز التراثي السعودي تلقائياً."
                        : "If no photo is uploaded, a Saudi cultural avatar is displayed by default."}
                    </p>
                    <ImageUploadInput
                      bucket="family-photos"
                      value={form.avatar_path}
                      onChange={(url) => setForm((prev) => ({ ...prev, avatar_path: url }))}
                      placeholder={
                        isAr ? "رابط الصورة أو ارفع صورة شخصية..." : "Avatar URL or upload..."
                      }
                      hidePreview={true}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "الاسم الأول (بالعربية) *" : "First Name (AR) *"}
                  </Label>
                  <Input
                    required
                    value={form.first_name_ar}
                    onChange={(e) => handleFirstNameChange(e.target.value)}
                    placeholder="مثال: عبدالله"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "اسم الأب / الجد (بالعربية)" : "Middle Name (AR)"}
                  </Label>
                  <Input
                    value={form.middle_name_ar ?? ""}
                    onChange={(e) => setForm({ ...form, middle_name_ar: e.target.value })}
                    placeholder="مثال: بن محمد"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "اسم العائلة (بالعربية) *" : "Last Name (AR) *"}
                  </Label>
                  <Input
                    required
                    value={form.last_name_ar}
                    onChange={(e) => setForm({ ...form, last_name_ar: e.target.value })}
                    placeholder="آل بوعبيد"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "الاسم الأول (EN)" : "First Name (EN)"}
                  </Label>
                  <Input
                    value={form.first_name_en ?? ""}
                    onChange={(e) => setForm({ ...form, first_name_en: e.target.value })}
                    placeholder="e.g. Abdullah"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "اسم الأب (EN)" : "Middle Name (EN)"}
                  </Label>
                  <Input
                    value={form.middle_name_en ?? ""}
                    onChange={(e) => setForm({ ...form, middle_name_en: e.target.value })}
                    placeholder="e.g. M."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "اسم العائلة (EN)" : "Last Name (EN)"}
                  </Label>
                  <Input
                    value={form.last_name_en ?? ""}
                    onChange={(e) => setForm({ ...form, last_name_en: e.target.value })}
                    placeholder="Al Bu Obaid"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "المعرف الفريد (Slug) *" : "Unique Slug *"}
                  </Label>
                  <Input
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="abdullah-mohammed"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{isAr ? "الجنس" : "Gender"}</Label>
                  <Select
                    value={form.gender}
                    onValueChange={(val: any) => setForm({ ...form, gender: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{isAr ? "ذكر" : "Male"}</SelectItem>
                      <SelectItem value="female">{isAr ? "أنثى" : "Female"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "الجيل في الشجرة" : "Generation"}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.generation}
                    onChange={(e) =>
                      setForm({ ...form, generation: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: Life & Places */}
            <TabsContent value="life" className="space-y-4 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                  <div>
                    <p className="text-xs font-semibold">{isAr ? "على قيد الحياة" : "Is Living"}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {isAr ? "حدد إذا كان الفرد حياً حفظه الله" : "Select if living"}
                    </p>
                  </div>
                  <Switch
                    checked={form.is_living}
                    onCheckedChange={(checked) => setForm({ ...form, is_living: checked })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "فرع العائلة" : "Family Branch"}
                  </Label>
                  <Select
                    value={form.branch_id ?? "none"}
                    onValueChange={(val) =>
                      setForm({ ...form, branch_id: val === "none" ? null : val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isAr ? "اختر الفرع" : "Select branch"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{isAr ? "— غير محدد —" : "— None —"}</SelectItem>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {isAr ? b.name_ar : b.name_en || b.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "تاريخ الميلاد (ميلادي)" : "Date of Birth"}
                  </Label>
                  <Input
                    type="date"
                    value={form.date_of_birth ?? ""}
                    onChange={(e) => setForm({ ...form, date_of_birth: e.target.value || null })}
                  />
                </div>
                {!form.is_living && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      {isAr ? "تاريخ الوفاة (رحمه الله)" : "Date of Death"}
                    </Label>
                    <Input
                      type="date"
                      value={form.date_of_death ?? ""}
                      onChange={(e) => setForm({ ...form, date_of_death: e.target.value || null })}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "مكان الميلاد / النشأة" : "Birth Place"}
                  </Label>
                  <Select
                    value={form.birth_place_id ?? "none"}
                    onValueChange={(val) =>
                      setForm({ ...form, birth_place_id: val === "none" ? null : val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isAr ? "اختر المكان" : "Select place"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{isAr ? "— غير محدد —" : "— None —"}</SelectItem>
                      {places.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {isAr ? p.name_ar : p.name_en || p.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "مكان الإقامة الحالي" : "Current Residence Place"}
                  </Label>
                  <Select
                    value={form.current_place_id ?? "none"}
                    onValueChange={(val) =>
                      setForm({ ...form, current_place_id: val === "none" ? null : val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isAr ? "اختر المكان" : "Select place"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{isAr ? "— غير محدد —" : "— None —"}</SelectItem>
                      {places.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {isAr ? p.name_ar : p.name_en || p.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: Bio & Career */}
            <TabsContent value="bio" className="space-y-4 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "المهنة / المنصب (بالعربية)" : "Occupation (AR)"}
                  </Label>
                  <Input
                    value={form.occupation_ar ?? ""}
                    onChange={(e) => setForm({ ...form, occupation_ar: e.target.value })}
                    placeholder="مثال: مهندس برمجيات / مستشار قانوني"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "المهنة / المنصب (EN)" : "Occupation (EN)"}
                  </Label>
                  <Input
                    value={form.occupation_en ?? ""}
                    onChange={(e) => setForm({ ...form, occupation_en: e.target.value })}
                    placeholder="e.g. Software Engineer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "المؤهل التعليمي (بالعربية)" : "Education (AR)"}
                  </Label>
                  <Input
                    value={form.education_ar ?? ""}
                    onChange={(e) => setForm({ ...form, education_ar: e.target.value })}
                    placeholder="مثال: بكالوريوس هندسة — جامعة الملك فهد"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "المؤهل التعليمي (EN)" : "Education (EN)"}
                  </Label>
                  <Input
                    value={form.education_en ?? ""}
                    onChange={(e) => setForm({ ...form, education_en: e.target.value })}
                    placeholder="e.g. BSc in Engineering"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {isAr ? "السيرة الذاتية ونبذة عن الإنجازات (بالعربية)" : "Biography (AR)"}
                </Label>
                <Textarea
                  rows={4}
                  value={form.biography_ar ?? ""}
                  onChange={(e) => setForm({ ...form, biography_ar: e.target.value })}
                  placeholder="نبذة تاريخية وسيرة الفرد ومساهماته..."
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {isAr ? "السيرة الذاتية (EN)" : "Biography (EN)"}
                </Label>
                <Textarea
                  rows={3}
                  value={form.biography_en ?? ""}
                  onChange={(e) => setForm({ ...form, biography_en: e.target.value })}
                  placeholder="Biography and achievements in English..."
                />
              </div>
            </TabsContent>

            {/* TAB 4: Privacy & Status */}
            <TabsContent value="privacy" className="space-y-4 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "مستوى الظهور والخصوصية" : "Visibility Level"}
                  </Label>
                  <Select
                    value={form.visibility}
                    onValueChange={(val: any) => setForm({ ...form, visibility: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        {isAr ? "عام للجميع (Public)" : "Public"}
                      </SelectItem>
                      <SelectItem value="family_only">
                        {isAr ? "لأفراد الأسرة فقط (Family Only)" : "Family Only"}
                      </SelectItem>
                      <SelectItem value="admin_only">
                        {isAr ? "للإدارة فقط (Admin Only)" : "Admin Only"}
                      </SelectItem>
                      <SelectItem value="private">
                        {isAr ? "خاص وسري (Private)" : "Private"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "حالة السجل" : "Record Status"}
                  </Label>
                  <Select
                    value={form.status}
                    onValueChange={(val: any) => setForm({ ...form, status: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">
                        {isAr ? "منشور (Published)" : "Published"}
                      </SelectItem>
                      <SelectItem value="draft">{isAr ? "مسودة (Draft)" : "Draft"}</SelectItem>
                      <SelectItem value="in_review">
                        {isAr ? "قيد المراجعة (In Review)" : "In Review"}
                      </SelectItem>
                      <SelectItem value="archived">
                        {isAr ? "مؤرشف (Archived)" : "Archived"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? isAr
                  ? "جاري الحفظ..."
                  : "Saving..."
                : isAr
                  ? "حفظ التغييرات"
                  : "Save Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
