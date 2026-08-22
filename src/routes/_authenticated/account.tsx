import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { useLang } from "@/i18n/LanguageProvider";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { branches } from "@/content/site";
import { SaudiCulturalAvatar } from "@/components/common/SaudiCulturalAvatar";
import { ImageUploadInput } from "@/components/console/media/ImageUploadInput";
import {
  getMyAccount,
  submitMembershipRequest,
  updateMyProfile,
} from "@/lib/account.functions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Clock,
  LogOut,
  Sliders,
  Send,
  Lock,
  Phone,
  Mail,
  Copy,
  Check,
  CreditCard,
  Building,
  QrCode,
  Sparkles,
  GitBranch,
  FileCheck,
  Eye,
  EyeOff,
  LayoutDashboard,
  Camera,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "حسابي وبوابة الأعضاء | مجلس أسرة آل بوعبيد" },
      {
        name: "description",
        content: "بوابة أفراد أسرة آل بوعبيد: السجل العائلي، بطاقة العضوية الرقمية، ومتابعة المساهمات.",
      },
      { property: "og:title", content: "حسابي | مجلس أسرة آل بوعبيد" },
      { property: "og:description", content: "بوابة أفراد أسرة آل بوعبيد." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAdmin, isMember: authIsMember } = useAuth();

  const fetchAccount = useServerFn(getMyAccount);
  const saveProfile = useServerFn(updateMyProfile);
  const requestMembership = useServerFn(submitMembershipRequest);

  const { data, isLoading } = useQuery({
    queryKey: ["account"],
    queryFn: () => fetchAccount(),
  });

  const [activeTab, setActiveTab] = useState("profile");
  const [copiedIban, setCopiedIban] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const [form, setForm] = useState({
    full_name_ar: "",
    full_name_en: "",
    branch_slug: "",
    phone: "",
    lineage_notes: "",
    avatar_path: "",
    show_in_directory: false,
  });

  useEffect(() => {
    if (!data?.profile) return;
    setForm({
      full_name_ar: data.profile.full_name_ar ?? "",
      full_name_en: data.profile.full_name_en ?? "",
      branch_slug: data.profile.branch_slug ?? "",
      phone: data.profile.phone ?? "",
      lineage_notes: data.profile.lineage_notes ?? "",
      avatar_path: data.profile.avatar_path ?? "",
      show_in_directory: !!data.profile.show_in_directory,
    });
  }, [data?.profile]);

  const memberCode = "ABO-" + (user?.id || "0000").substring(0, 6).toUpperCase();

  useEffect(() => {
    if (typeof window === "undefined" || !user?.id) return;
    const verifyUrl = `${window.location.origin}/verify?id=${memberCode}`;
    QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 280,
      color: {
        dark: "#121614",
        light: "#ffffff",
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error("QR Code Generation Error:", err));
  }, [user?.id, memberCode]);

  const save = useMutation({
    mutationFn: () => saveProfile({ data: form }),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success(isAr ? "تم حفظ بيانات السجل والصورة بنجاح." : "Profile & avatar updated successfully.");
        void queryClient.invalidateQueries({ queryKey: ["account"] });
      } else {
        toast.error(isAr ? "تعذر حفظ البيانات." : "Failed to save profile.");
      }
    },
    onError: () => toast.error(isAr ? "تعذر حفظ البيانات." : "Failed to save profile."),
  });

  const apply = useMutation({
    mutationFn: () =>
      requestMembership({
        data: {
          full_name_ar: form.full_name_ar || (user?.user_metadata?.full_name as string) || "عضو الأسرة",
          full_name_en: form.full_name_en || "",
          phone: form.phone || "",
          branch_slug: form.branch_slug || "",
          father_lineage: form.lineage_notes || "",
          notes: form.lineage_notes || "",
        },
      }),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success(isAr ? "تم رفع طلب العضوية للمراجعة بنجاح." : "Membership request submitted for review.");
        void queryClient.invalidateQueries({ queryKey: ["account"] });
      } else if (result.error === "already_pending") {
        toast.info(isAr ? "لديك طلب عضوية قيد المراجعة بالفعل." : "You already have a pending request.");
      } else {
        toast.error(isAr ? "تعذر إرسال الطلب." : "Failed to submit request.");
      }
    },
    onError: () => toast.error(isAr ? "تعذر إرسال الطلب." : "Failed to submit request."),
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success(isAr ? "تم تسجيل الخروج بنجاح." : "Signed out successfully.");
    await navigate({ to: "/" });
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: window.location.origin + "/account",
      });
      if (error) throw error;
      toast.success(isAr ? "تم إرسال رابط تعيين كلمة المرور إلى بريدك الإلكتروني." : "Password reset email sent.");
    } catch (err: any) {
      toast.error(err.message || (isAr ? "تعذر إرسال الرابط." : "Failed to send reset email."));
    }
  };

  const request = data?.request ?? null;
  const isApproved = request?.status === "approved" || authIsMember || isAdmin;
  const isPending = request?.status === "pending";

  const selectedBranchName = branches.find((b) => b.id === form.branch_slug)?.name;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* ── Executive Header Banner ─────────────────────────────── */}
      <section className="relative border-b border-border bg-gradient-to-b from-card via-card/90 to-background pt-12 pb-8">
        <div className="container-page">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* User Details */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <SaudiCulturalAvatar
                  src={form.avatar_path}
                  alt={form.full_name_ar}
                  size="xl"
                  className="w-16 h-16 sm:w-20 sm:h-20"
                />
                {isAdmin && (
                  <div
                    title={isAr ? "مسؤول معتمد" : "Administrator"}
                    className="absolute -bottom-1 -end-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-naskh">
                    {form.full_name_ar || user?.user_metadata?.full_name || (isAr ? "عضو أسرة آل بوعبيد" : "Family Member")}
                  </h1>
                  {isAdmin ? (
                    <Badge className="bg-gold text-ink font-semibold text-xs border-0">
                      {isAr ? "أمانة المجلس" : "Admin"}
                    </Badge>
                  ) : isApproved ? (
                    <Badge className="bg-emerald-600/90 text-white font-medium text-xs">
                      {isAr ? "عضو معتمد" : "Verified"}
                    </Badge>
                  ) : isPending ? (
                    <Badge variant="outline" className="text-amber-500 border-amber-500/40 text-xs">
                      {isAr ? "قيد المراجعة" : "Pending Review"}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      {isAr ? "حساب جديد" : "New Account"}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground/70" />
                    {user?.email}
                  </span>
                  {selectedBranchName && (
                    <span className="flex items-center gap-1 text-bronze dark:text-gold font-medium">
                      <GitBranch className="w-3.5 h-3.5" />
                      {t(selectedBranchName)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              {isAdmin && (
                <Button asChild size="sm" className="h-9 gap-1.5 bg-primary text-primary-foreground font-semibold shadow-sm">
                  <Link to="/admin">
                    <LayoutDashboard className="w-4 h-4" />
                    {isAr ? "لوحة الإدارة والأمانة" : "Admin Console"}
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 border-border hover:bg-secondary">
                <Link to="/contribute">
                  <CreditCard className="w-4 h-4 text-gold" />
                  {isAr ? "المساهمة في الخزينة" : "Family Fund"}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="h-9 gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
                {isAr ? "تسجيل الخروج" : "Sign out"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Dashboard Tabs ─────────────────────────────────── */}
      <main className="container-page py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card border border-border p-1 rounded-xl h-auto grid grid-cols-2 md:grid-cols-4 max-w-2xl gap-1">
            <TabsTrigger value="profile" className="text-xs sm:text-sm py-2 gap-1.5 data-[state=active]:bg-secondary data-[state=active]:text-foreground">
              <User className="w-3.5 h-3.5" />
              {isAr ? "البيانات والنسب" : "Profile & Lineage"}
            </TabsTrigger>
            <TabsTrigger value="card" className="text-xs sm:text-sm py-2 gap-1.5 data-[state=active]:bg-secondary data-[state=active]:text-foreground">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              {isAr ? "بطاقة العضوية" : "Digital ID"}
            </TabsTrigger>
            <TabsTrigger value="treasury" className="text-xs sm:text-sm py-2 gap-1.5 data-[state=active]:bg-secondary data-[state=active]:text-foreground">
              <CreditCard className="w-3.5 h-3.5" />
              {isAr ? "الخزينة والاشتراك" : "Treasury & Dues"}
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs sm:text-sm py-2 gap-1.5 data-[state=active]:bg-secondary data-[state=active]:text-foreground">
              <Lock className="w-3.5 h-3.5" />
              {isAr ? "الأمان والحساب" : "Security"}
            </TabsTrigger>
          </TabsList>

          {/* ──────────────── TAB 1: Profile & Lineage ──────────────── */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Card */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-border bg-card shadow-sm rounded-2xl">
                  <CardHeader className="border-b border-border/50 pb-4">
                    <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-primary" />
                      {isAr ? "بيانات السجل العائلي" : "Family Register Information"}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {isAr
                        ? "حدّث بياناتك الشخصية وفرعك العائلي لتوثيق السجل والظهور في الدليل."
                        : "Update your name, branch, and contact information."}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-6">
                    {isLoading ? (
                      <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
                        {isAr ? "جاري تحميل بيانات السجل..." : "Loading record..."}
                      </div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          save.mutate();
                        }}
                        className="space-y-5"
                      >
                        {/* Avatar Customization Widget */}
                        <div className="p-4 rounded-xl border border-border bg-secondary/20 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                          <div className="relative">
                            <SaudiCulturalAvatar
                              src={form.avatar_path}
                              alt={form.full_name_ar}
                              size="xl"
                              className="w-20 h-20 shadow-md"
                            />
                          </div>
                          <div className="flex-1 w-full space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-bold text-foreground">{isAr ? "الصورة الشخصية للعضو" : "Member Avatar"}</Label>
                              {form.avatar_path && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setForm((f) => ({ ...f, avatar_path: "" }))}
                                  className="h-6 text-[10px] text-destructive hover:bg-destructive/10 px-2"
                                >
                                  {isAr ? "استعادة الرمز التراثي" : "Use Cultural Avatar"}
                                </Button>
                              )}
                            </div>
                            <ImageUploadInput
                              bucket="site-media"
                              value={form.avatar_path}
                              onChange={(url) => setForm((f) => ({ ...f, avatar_path: url }))}
                              placeholder={isAr ? "رابط الصورة أو اختر ملفاً للرفع..." : "Image URL or upload..."}
                              helperText={isAr ? "يمكنك رفع صورة شخصية، أو استخدام الرمز التراثي السعودي الافتراضي." : "Upload a photo or keep the default Saudi cultural avatar."}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">{isAr ? "الاسم الكامل (بالعربية) *" : "Full Name (Arabic) *"}</Label>
                            <Input
                              required
                              value={form.full_name_ar}
                              onChange={(e) => setForm({ ...form, full_name_ar: e.target.value })}
                              placeholder="مثال: عبدالله بن محمد بن إبراهيم آل بوعبيد"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">{isAr ? "الاسم بالإنجليزية" : "Full Name (English)"}</Label>
                            <Input
                              value={form.full_name_en}
                              onChange={(e) => setForm({ ...form, full_name_en: e.target.value })}
                              placeholder="e.g. Abdullah M. Al Bu Obaid"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">{isAr ? "فرع الأسرة *" : "Family Branch *"}</Label>
                            <Select
                              value={form.branch_slug}
                              onValueChange={(val) => setForm({ ...form, branch_slug: val })}
                            >
                              <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder={isAr ? "اختر فرع العائلة..." : "Select branch..."} />
                              </SelectTrigger>
                              <SelectContent>
                                {branches.map((b) => (
                                  <SelectItem key={b.id} value={b.id}>
                                    {t(b.name)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">{isAr ? "رقم الجوال للتواصل" : "Phone Number"}</Label>
                            <div className="relative">
                              <Input
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                placeholder="+966 50 000 0000"
                                className="font-mono"
                              />
                              <Phone className="w-3.5 h-3.5 absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold">{isAr ? "سلسلة النسب والملاحظات العائلية" : "Lineage & Ancestral Notes"}</Label>
                            <span className="text-[10px] text-muted-foreground">{isAr ? "اختياري" : "Optional"}</span>
                          </div>
                          <Textarea
                            rows={3}
                            value={form.lineage_notes}
                            onChange={(e) => setForm({ ...form, lineage_notes: e.target.value })}
                            placeholder={isAr ? "مثال: ابن فلان بن فلان، من أهالي المبرز / الصالحية..." : "Ancestral details..."}
                          />
                        </div>

                        {/* Directory Visibility Switch */}
                        <div className="p-4 rounded-xl border border-border bg-secondary/30 flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {form.show_in_directory ? (
                                <Eye className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                              )}
                              <Label className="text-xs font-bold text-foreground cursor-pointer">
                                {isAr ? "الظهور في دليل الأسرة للأعضاء" : "Show in Members Directory"}
                              </Label>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              {isAr
                                ? "يسمح لأفراد الأسرة المسجلين والمعتمدين فقط بالتواصل والتعرف على بياناتك المهنية والفرع."
                                : "Allows verified family members to see your name & branch in the internal directory."}
                            </p>
                          </div>
                          <Switch
                            checked={form.show_in_directory}
                            onCheckedChange={(val) => setForm({ ...form, show_in_directory: val })}
                          />
                        </div>

                        <div className="flex justify-end pt-2">
                          <Button type="submit" disabled={save.isPending} className="px-6 font-bold text-xs h-9">
                            {save.isPending ? (isAr ? "جاري الحفظ..." : "Saving...") : isAr ? "حفظ التعديلات" : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Side Info Cards */}
              <div className="space-y-6">
                {/* Membership Application Box */}
                <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-bronze via-gold to-primary" />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-gold" />
                      {isAr ? "حالة توثيق العضوية" : "Membership Verification"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3.5 text-xs">
                    {isAdmin || isApproved ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                          <span className="text-muted-foreground">{isAr ? "صفة العضوية:" : "Membership Status:"}</span>
                          <Badge className="bg-emerald-600 text-white text-xs font-semibold">
                            {isAdmin
                              ? isAr
                                ? "أمانة المجلس (مسؤول معتمد)"
                                : "Council Secretariat (Admin)"
                              : isAr
                              ? "عضو معتمد وموثق"
                              : "Verified Member"}
                          </Badge>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary/40 border border-border text-[11px] text-muted-foreground space-y-1">
                          <span className="font-semibold block text-foreground">
                            {isAr ? "حالة السجل العائلي:" : "Family Register Status:"}
                          </span>
                          <p>
                            {isAdmin
                              ? isAr
                                ? "حسابك معتمد وموثق بصلاحيات أمانة المجلس وإدارة المنصة، ولديك كامل الصلاحيات لإدارة السجلات والمحتوى والخزينة."
                                : "Your account is fully verified with executive council privileges to manage records, content, and the family fund."
                              : isAr
                              ? "تم توثيق بياناتك بنجاح في السجل العائلي الرسمي وشجرة الأنساب."
                              : "Your record has been officially verified in the family register."}
                          </p>
                        </div>
                      </div>
                    ) : isPending ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                          <span className="text-muted-foreground">{isAr ? "حالة الطلب:" : "Status:"}</span>
                          <Badge variant="outline" className="text-amber-500 border-amber-500/40 text-xs">
                            {isAr ? "قيد مراجعة الأمانة" : "Under Review"}
                          </Badge>
                        </div>
                        {request?.review_note && (
                          <div className="p-3 rounded-lg bg-muted/40 border border-border text-[11px] text-muted-foreground space-y-1">
                            <span className="font-semibold block text-foreground">{isAr ? "ملاحظة أمانة المجلس:" : "Secretariat Note:"}</span>
                            <p>{request.review_note}</p>
                          </div>
                        )}
                        <p className="text-[11px] text-muted-foreground">
                          {isAr
                            ? "تم تسجيل طلبك وتوثيق بياناتك تحت إشراف لجنة الأنساب والعلاقات العائلية."
                            : "Your request is registered with the genealogical & family relations committee."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-muted-foreground leading-relaxed">
                          {isAr
                            ? "لم تقدم طلب اعتماد عضوية حتى الآن. بعد استكمال بياناتك أعلاه، انقر لرفع طلب التوثيق الرسمي."
                            : "You haven't submitted a verification request yet."}
                        </p>
                        <Button
                          type="button"
                          onClick={() => apply.mutate()}
                          disabled={apply.isPending || !form.full_name_ar.trim()}
                          className="w-full h-8 text-xs font-semibold gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {apply.isPending ? (isAr ? "جاري الإرسال..." : "Submitting...") : isAr ? "تقديم طلب اعتماد العضوية" : "Submit Verification"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Privacy & Trust Badge */}
                <Card className="border-border bg-secondary/20 rounded-2xl">
                  <CardContent className="pt-5 text-xs text-muted-foreground space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <Shield className="w-4 h-4 text-primary" />
                      {isAr ? "حماية وخصوصية السجل" : "Data Privacy"}
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {isAr
                        ? "جميع البيانات المدخلة في السجل العائلي محمية ومشفرة، وتخضع لميثاق الخصوصية المعتمد من مجلس الأسرة والأنظمة المعمول بها في المملكة العربية السعودية."
                        : "All entered information is encrypted and protected under the family council privacy charter."}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ──────────────── TAB 2: Digital ID Card ───────────────── */}
          <TabsContent value="card" className="space-y-6">
            <div className="max-w-xl mx-auto space-y-6">
              {/* Gold & Emerald Digital Card */}
              <div className="relative overflow-hidden rounded-3xl border-2 border-gold/50 bg-gradient-to-br from-ink via-stone-900 to-ink p-7 text-ivory shadow-2xl">
                {/* Background Pattern Watermark */}
                <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

                {/* Card Header */}
                <div className="relative flex items-center justify-between border-b border-ivory/15 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold tracking-wide font-naskh text-gold">
                        {isAr ? "مجلس أسرة آل بوعبيد" : "Al Bu Obaid Family Council"}
                      </h3>
                      <p className="text-[10px] text-ivory/60">
                        {isAr ? "صندوق التنمية العائلية · بطاقة العضوية الرقمية" : "Family Development Fund · Digital ID"}
                      </p>
                    </div>
                  </div>

                  <Badge className="bg-gold text-ink font-bold text-[10px] border-0">
                    {isApproved ? (isAr ? "عضو معتمد" : "Verified") : (isAr ? "قيد الاعتماد" : "Pending")}
                  </Badge>
                </div>

                {/* Card Body */}
                <div className="relative my-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <SaudiCulturalAvatar
                      src={form.avatar_path}
                      alt={form.full_name_ar}
                      size="xl"
                      className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-gold/60 shrink-0 shadow-lg"
                    />

                    <div>
                      <span className="text-[10px] text-ivory/50 block mb-0.5">{isAr ? "اسم العضو" : "Member Name"}</span>
                      <h4 className="text-lg sm:text-xl font-bold font-naskh text-ivory">
                        {form.full_name_ar || (isAr ? "عضو أسرة آل بوعبيد" : "Family Member")}
                      </h4>
                      {form.full_name_en && <p className="text-xs text-ivory/60 font-mono mt-0.5">{form.full_name_en}</p>}
                      
                      <div className="mt-3 flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-[9px] text-ivory/40 block">{isAr ? "الفرع" : "Branch"}</span>
                          <span className="font-semibold text-gold">{selectedBranchName ? t(selectedBranchName) : (isAr ? "غير محدد" : "Unassigned")}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-ivory/40 block">{isAr ? "رقم العضوية" : "Member ID"}</span>
                          <span className="font-mono text-ivory/80">{memberCode}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Real Scannable QR Code */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <a
                      href={`/verify?id=${memberCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block p-2 rounded-2xl bg-white shadow-xl hover:scale-105 transition-all"
                      title={isAr ? "انقر لعرض شهادة التوثيق الرسمية" : "Click to view official verification certificate"}
                    >
                      {qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt="Official Scannable QR Verification Code"
                          className="w-20 h-20 sm:w-22 sm:h-22 object-contain"
                        />
                      ) : (
                        <div className="w-20 h-20 flex items-center justify-center">
                          <QrCode className="w-10 h-10 text-stone-800" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gold/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-ink/90 text-gold text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          {isAr ? "فحص" : "VERIFY"}
                        </span>
                      </div>
                    </a>
                    <span className="text-[9px] font-mono text-ivory/60 flex items-center gap-1">
                      <ExternalLink className="w-2.5 h-2.5 text-gold" />
                      {isAr ? "باركود فحص حي" : "LIVE QR SEAL"}
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="relative pt-3 border-t border-ivory/15 flex items-center justify-between text-[10px] text-ivory/50 font-mono">
                  <span>NCNP LIC. #1200758400</span>
                  <span>SAUDI ARABIA · AL-AHSA</span>
                </div>
              </div>

              {/* QR Explanation Banner */}
              <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border flex items-center gap-3 text-xs text-muted-foreground">
                <QrCode className="w-5 h-5 text-gold shrink-0" />
                <p className="text-[11px] leading-relaxed">
                  {isAr
                    ? "رمز الاستجابة السريع (QR Code) على بطاقتك حقيقي ومشفر: يمكنك مسحه بأي كاميرا هاتف لفتح شهادة التحقق الرسمية المعتمدة لعضويتك في مجلس الأسرة."
                    : "The QR code on your card is live and scannable by any mobile camera to verify your official family membership certificate."}
                </p>
              </div>

              {/* Timeline Info */}
              <Card className="border-border bg-card rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-foreground">
                    {isAr ? "مراحل توثيق واعتماد العضوية" : "Verification Milestones"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">{isAr ? "١. إنشاء الحساب الرقمي" : "1. Account Created"}</p>
                      <p className="text-[11px] text-muted-foreground">{isAr ? "تم التحقق من البريد الإلكتروني والوصول للمنصة." : "Email verified and access granted."}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className={form.full_name_ar || isAdmin ? "w-4 h-4 text-emerald-500 shrink-0 mt-0.5" : "w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5"} />
                    <div>
                      <p className="font-semibold text-foreground">{isAr ? "٢. استكمال السجل والفرع" : "2. Complete Lineage & Branch"}</p>
                      <p className="text-[11px] text-muted-foreground">{isAr ? "تحديد الاسم الرباعي والفرع وسلسلة النسب." : "Set full name, branch, and ancestral notes."}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className={isAdmin || isApproved ? "w-4 h-4 text-emerald-500 shrink-0 mt-0.5" : isPending ? "w-4 h-4 text-gold shrink-0 mt-0.5" : "w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5"} />
                    <div>
                      <p className="font-semibold text-foreground">{isAr ? "٣. مطابقة الأمانة ولجنة الأنساب" : "3. Secretariat Review"}</p>
                      <p className="text-[11px] text-muted-foreground">{isAr ? "مراجعة بيانات النسب ومطابقتها مع شجرة العائلة الرسمية." : "Cross-referenced with official family tree."}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ShieldCheck className={isAdmin || isApproved ? "w-4 h-4 text-emerald-500 shrink-0 mt-0.5" : "w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5"} />
                    <div>
                      <p className="font-semibold text-foreground">{isAr ? "٤. إصدار بطاقة العضوية والاعتماد" : "4. Official Digital Badge"}</p>
                      <p className="text-[11px] text-muted-foreground">{isAr ? "تفعيل كامل الصلاحيات والوصول للمكتبة ودليل الأعضاء." : "Full access to member directory & archive."}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ──────────────── TAB 3: Treasury & Dues ────────────────── */}
          <TabsContent value="treasury" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border bg-card rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gold" />
                    {isAr ? "صندوق التنمية والمساهمة العائلية" : "Family Development Fund"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isAr
                      ? "الحساب البنكي الرسمي المعتمد لأسرة آل بوعبيد تحت إشراف المركز الوطني لتنمية القطاع غير الربحي."
                      : "Official registered endowment and social contribution bank account."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isAr ? "اسم الحساب:" : "Account Name:"}</span>
                      <span className="font-bold text-foreground">{isAr ? "صندوق أسرة آل بوعبيد" : "Al Bu Obaid Family Fund"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isAr ? "البنك:" : "Bank:"}</span>
                      <span className="font-semibold text-foreground">{isAr ? "مصرف الإنماء (Alinma Bank)" : "Alinma Bank"}</span>
                    </div>
                    <div className="pt-2 border-t border-border/50">
                      <span className="text-muted-foreground block text-[11px] mb-1">{isAr ? "رقم الآيبان (IBAN):" : "IBAN:"}</span>
                      <div className="flex items-center justify-between bg-background p-2 rounded-lg border border-border font-mono text-xs">
                        <span>SA03 0500 0000 1200 7584 0001</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-6 h-6"
                          onClick={() => {
                            navigator.clipboard.writeText("SA0305000000120075840001");
                            setCopiedIban(true);
                            toast.success(isAr ? "تم نسخ الآيبان" : "IBAN copied");
                            setTimeout(() => setCopiedIban(false), 2000);
                          }}
                        >
                          {copiedIban ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button asChild className="w-full h-9 text-xs font-bold gap-1.5">
                    <Link to="/contribute">
                      <FileCheck className="w-4 h-4" />
                      {isAr ? "رفع إشعار تحويل مساهمة" : "Submit Transfer Receipt"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border bg-card rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <Building className="w-4 h-4 text-primary" />
                    {isAr ? "أوجه الصرف والبرامج" : "Programs & Initiatives"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-muted-foreground">
                  <div className="p-3 rounded-xl bg-secondary/20 border border-border">
                    <h5 className="font-bold text-foreground mb-1">{isAr ? "مشروع المقر الدائم" : "Permanent Headquarters"}</h5>
                    <p className="text-[11px]">{isAr ? "مقر اجتماعات الأسرة والديوانية العامة ومكتبة الوثائق التاريخية." : "Family majlis, assembly hall, and archive center."}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/20 border border-border">
                    <h5 className="font-bold text-foreground mb-1">{isAr ? "جائزة التفوق العلمي والمهني" : "Academic Excellence Award"}</h5>
                    <p className="text-[11px]">{isAr ? "تكريم الخريجين وأصحاب الابتكارات والشهادات العليا سنوياً." : "Annual honouring of top graduates and innovators."}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/20 border border-border">
                    <h5 className="font-bold text-foreground mb-1">{isAr ? "صندوق التكافل الاجتماعي" : "Social Solidarity Fund"}</h5>
                    <p className="text-[11px]">{isAr ? "مساعدة ودعم أسر وأفراد العائلة في الظروف الاجتماعية." : "Assisting family members in special community needs."}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ──────────────── TAB 4: Security & Credentials ─────────── */}
          <TabsContent value="security" className="space-y-6">
            <div className="max-w-2xl mx-auto space-y-6">
              <Card className="border-border bg-card rounded-2xl shadow-sm">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    {isAr ? "إعدادات الحساب وكلمة المرور" : "Security & Authentication"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isAr ? "إدارة الوصول وتأمين حسابك في البوابة." : "Manage your credentials and session."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-5 text-xs">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">{isAr ? "البريد الإلكتروني المعتمد" : "Registered Email"}</Label>
                    <div className="p-2.5 bg-secondary/40 border border-border rounded-lg font-mono text-muted-foreground flex items-center justify-between">
                      <span>{user?.email}</span>
                      <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                        {isAr ? "موثق" : "Verified"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">{isAr ? "معرف المستخدم (UUID)" : "User Identifier"}</Label>
                    <div className="p-2.5 bg-secondary/40 border border-border rounded-lg font-mono text-muted-foreground text-[11px]">
                      {user?.id}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-foreground">{isAr ? "إعادة تعيين كلمة المرور" : "Reset Password"}</p>
                      <p className="text-[11px] text-muted-foreground">{isAr ? "سيتم إرسال رابط آمن إلى بريدك لإعادة التعيين." : "We will send a secure link to your email."}</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={handlePasswordReset} className="h-8 text-xs font-semibold">
                      {isAr ? "إرسال رابط التعيين" : "Send Reset Link"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

