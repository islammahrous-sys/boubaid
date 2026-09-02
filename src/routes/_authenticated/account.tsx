import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useRef, useMemo } from "react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { branches } from "@/content/site";
import { SaudiCulturalAvatar } from "@/components/common/SaudiCulturalAvatar";
import {
  getMyAccount,
  submitMembershipRequest,
  updateMyProfile,
  getMyNotifications,
  markMyNotificationRead,
  markAllMyNotificationsRead,
} from "@/lib/account.functions";
import { getMemberBankAccount, getMyContributions } from "@/lib/contributions.functions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getErrorMessage } from "@/lib/error-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Wallet,
  History,
  XCircle,
  Eye,
  EyeOff,
  LayoutDashboard,
  Camera,
  ExternalLink,
  Upload,
  X,
  Loader2,
  Bell,
  RefreshCw,
  AlertTriangle,
  Printer,
  Share2,
  TreePine,
  ArrowUpRight,
  Maximize2,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "حسابي وبوابة الأعضاء | مجلس أسرة آل بوعبيد" },
      {
        name: "description",
        content:
          "بوابة أفراد أسرة آل بوعبيد: السجل العائلي، بطاقة العضوية الرقمية، ومتابعة المساهمات.",
      },
      { property: "og:title", content: "حسابي | مجلس أسرة آل بوعبيد" },
      { property: "og:description", content: "بوابة أفراد أسرة آل بوعبيد." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

/** Explains why the membership-request button is disabled. Without it the
 *  button simply greys out for anyone whose profile has no Arabic name yet --
 *  which is precisely the brand-new account the flow exists for. */
function ApplyBlockedHint({ isAr }: { isAr: boolean }) {
  return (
    <p className="flex items-start gap-1.5 text-[11px] text-amber-600 dark:text-amber-500 leading-relaxed">
      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
      <span>
        {isAr
          ? "أدخل الاسم الكامل بالعربية في بيانات السجل ثم احفظ التعديلات لتفعيل تقديم الطلب."
          : "Enter your full Arabic name in the register form and save, to enable the request."}
      </span>
    </p>
  );
}

function AccountPage() {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();

  const fetchAccount = useServerFn(getMyAccount);
  const saveProfile = useServerFn(updateMyProfile);
  const requestMembership = useServerFn(submitMembershipRequest);
  const fetchNotifications = useServerFn(getMyNotifications);
  const markNotifReadFn = useServerFn(markMyNotificationRead);
  const markAllNotifsReadFn = useServerFn(markAllMyNotificationsRead);

  const {
    data,
    isLoading,
    isError: accountFailed,
    refetch: refetchAccount,
    isFetching: accountFetching,
  } = useQuery({
    queryKey: ["account"],
    queryFn: () => fetchAccount(),
  });

  const [activeTab, setActiveTab] = useState("profile");

  const {
    data: notifData,
    isLoading: notifsLoading,
    isError: notifsFailed,
    refetch: refetchNotifs,
  } = useQuery({
    queryKey: ["my-notifications"],
    queryFn: () => fetchNotifications(),
    refetchInterval: 60_000,
  });
  const unreadCount = notifData?.unreadCount ?? 0;

  const notifErrorToast = () =>
    toast.error(isAr ? "تعذر تحديث حالة الإشعار." : "Could not update the notification.");

  const markNotifRead = useMutation({
    mutationFn: (id: string) => markNotifReadFn({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-notifications"] }),
    onError: notifErrorToast,
  });
  const markAllNotifsRead = useMutation({
    mutationFn: () => markAllNotifsReadFn(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-notifications"] }),
    onError: notifErrorToast,
  });

  const fetchBankAccount = useServerFn(getMemberBankAccount);
  const fetchMyContributions = useServerFn(getMyContributions);

  const isApprovedMember =
    data?.request?.status === "approved" ||
    data?.roles?.includes("member") ||
    data?.roles?.includes("admin") ||
    data?.roles?.includes("super_admin") ||
    data?.roles?.includes("treasurer") ||
    isAdmin;

  const { data: bankAccount, isLoading: bankLoading } = useQuery({
    queryKey: ["member-bank-account"],
    queryFn: () => fetchBankAccount(),
    enabled: isApprovedMember,
    staleTime: 1000 * 60 * 10,
  });

  const { data: myContributions, isLoading: contribsLoading } = useQuery({
    queryKey: ["my-contributions"],
    queryFn: () => fetchMyContributions(),
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });

  /**
   * Notification links come from the `notifications.link` column, which is
   * written by DB triggers today but is plain admin-writable text. Rendering
   * it straight into an <a href> would execute a `javascript:` value, so only
   * same-origin absolute paths are treated as navigable; anything else is
   * shown as inert text.
   */
  const safeNotifLink = (link: string | null) =>
    link && link.startsWith("/") && !link.startsWith("//") ? link : null;

  const formatNotifTime = (iso: string) => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return isAr ? "الآن" : "just now";
    if (diffMins < 60) return isAr ? `قبل ${diffMins} دقيقة` : `${diffMins}m ago`;
    if (diffHours < 24) return isAr ? `قبل ${diffHours} ساعة` : `${diffHours}h ago`;
    return isAr ? `قبل ${diffDays} يوم` : `${diffDays}d ago`;
  };
  const [copiedIban, setCopiedIban] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMemberCode, setCopiedMemberCode] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
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

  const profileCompletion = useMemo(() => {
    let score = 0;
    if (form.full_name_ar.trim()) score += 25;
    if (form.branch_slug) score += 25;
    if (form.phone.trim()) score += 25;
    if (form.avatar_path || form.lineage_notes.trim()) score += 25;
    return score;
  }, [form]);

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

  const handleCopyVerificationLink = () => {
    if (typeof window === "undefined") return;
    const verifyUrl = `${window.location.origin}/verify?id=${memberCode}`;
    navigator.clipboard.writeText(verifyUrl);
    setCopiedLink(true);
    toast.success(
      isAr
        ? "تم نسخ رابط التحقق الرسمي للبطاقة بنجاح"
        : "Official verification link copied to clipboard",
    );
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyMemberCode = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(memberCode);
    setCopiedMemberCode(true);
    toast.success(
      isAr ? `تم نسخ رقم العضوية: ${memberCode}` : `Member ID copied: ${memberCode}`,
    );
    setTimeout(() => setCopiedMemberCode(false), 2500);
  };

  const handlePrintCard = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(
        isAr ? "يرجى اختيار ملف صورة صالح (PNG, JPG, WebP)" : "Please select an image file",
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(isAr ? "الحد الأقصى لحجم الصورة هو 10 ميغابايت" : "Maximum file size is 10MB");
      return;
    }

    if (!user?.id) {
      toast.error(isAr ? "انتهت الجلسة، يرجى تسجيل الدخول." : "Session expired, please sign in.");
      return;
    }

    try {
      setAvatarUploading(true);
      // The extension is taken from a user-supplied filename, so it is
      // whitelisted rather than pasted into the object key as-is.
      const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "";
      const fileExt = /^(jpe?g|png|webp|gif|avif)$/.test(rawExt) ? rawExt : "jpg";
      const cleanFileName = `avatar-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      // Keyed under the member's own id. The old `avatars/<file>` key put every
      // member's photo in one flat, unattributable folder inside the `avatars`
      // bucket (and produced a doubled `avatars/avatars/...` public URL); an
      // owner-prefixed key matches the convention the rest of the buckets use
      // and lets the storage policy be tightened to
      // `(storage.foldername(name))[1] = auth.uid()::text` without a migration
      // of the app code.
      const storagePath = `${user.id}/${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(storagePath);
      setForm((prev) => ({ ...prev, avatar_path: urlData.publicUrl }));
      toast.success(
        isAr
          ? "تم اختيار الصورة بنجاح. احفظ التغييرات لتثبيتها."
          : "Avatar updated. Save changes to persist.",
      );
    } catch (err: unknown) {
      console.error("Avatar upload failed:", err);
      toast.error(getErrorMessage(err, isAr ? "فشل رفع الصورة" : "Failed to upload avatar"));
    } finally {
      setAvatarUploading(false);
      if (avatarFileInputRef.current) avatarFileInputRef.current.value = "";
    }
  };

  const save = useMutation({
    mutationFn: () => saveProfile({ data: form }),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success(
          isAr ? "تم حفظ بيانات السجل والصورة بنجاح." : "Profile & avatar updated successfully.",
        );
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
          full_name_ar:
            form.full_name_ar || (user?.user_metadata?.full_name as string) || "عضو الأسرة",
          full_name_en: form.full_name_en || "",
          phone: form.phone || "",
          branch_slug: form.branch_slug || "",
          father_lineage: form.lineage_notes || "",
          notes: form.lineage_notes || "",
        },
      }),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success(
          isAr ? "تم رفع طلب العضوية للمراجعة بنجاح." : "Membership request submitted for review.",
        );
        void queryClient.invalidateQueries({ queryKey: ["account"] });
        void queryClient.invalidateQueries({ queryKey: ["my-notifications"] });
      } else if (result.error === "already_pending") {
        toast.info(
          isAr ? "لديك طلب عضوية قيد المراجعة بالفعل." : "You already have a pending request.",
        );
        // The request is on file even though this call was refused -- refresh
        // so the card switches to the "under review" state instead of
        // continuing to offer the button.
        void queryClient.invalidateQueries({ queryKey: ["account"] });
      } else if (result.error === "already_member") {
        toast.info(
          isAr ? "عضويتك معتمدة بالفعل، لا حاجة لتقديم طلب." : "Your membership is already active.",
        );
        void queryClient.invalidateQueries({ queryKey: ["account"] });
      } else if (result.error === "missing_email") {
        toast.error(
          isAr
            ? "لا يوجد بريد إلكتروني مرتبط بحسابك، يتعذر إرسال الطلب."
            : "No email is linked to your account, so the request cannot be filed.",
        );
      } else {
        toast.error(isAr ? "تعذر إرسال الطلب." : "Failed to submit request.");
      }
    },
    onError: () => toast.error(isAr ? "تعذر إرسال الطلب." : "Failed to submit request."),
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Drop every cached account/notification payload -- otherwise the next
    // person to sign in on this browser is briefly shown the previous
    // member's profile, digital ID and notifications from the cache before
    // their own queries resolve.
    queryClient.clear();
    toast.success(isAr ? "تم تسجيل الخروج بنجاح." : "Signed out successfully.");
    await navigate({ to: "/" });
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: window.location.origin + "/reset-password",
      });
      if (error) throw error;
      toast.success(
        isAr
          ? "تم إرسال رابط تعيين كلمة المرور إلى بريدك الإلكتروني."
          : "Password reset email sent.",
      );
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, isAr ? "تعذر إرسال الرابط." : "Failed to send reset email."));
    }
  };

  const request = data?.request ?? null;

  /**
   * Membership standing is derived from the roles the *server* returned for
   * this user, not from `useAuth().isMember` -- that flag is `roles.length > 0`,
   * so any staff-only role (editor, treasurer, content_manager, viewer...)
   * used to mark the holder as a fully verified member here. That contradicted
   * the public QR check in `getMemberVerification`, which only accepts
   * `member`/`admin`, so such an account was shown a "Verified Member" digital
   * ID whose own QR seal reported it as unverified -- and was never offered
   * the application form it actually still needed. The rule below is the same
   * one the verification endpoint applies.
   */
  const authRoles = data?.roles ?? [];
  const isSuperAdmin = authRoles.includes("super_admin");
  const isCouncilAdmin = authRoles.includes("admin") || isSuperAdmin;
  const isTreasurer = authRoles.includes("treasurer") || isCouncilAdmin;
  const isEditor = authRoles.includes("editor") || authRoles.includes("content_manager") || isCouncilAdmin;
  const isFamilyManager = authRoles.includes("family_manager") || isCouncilAdmin;
  const hasMemberRole = authRoles.includes("member") || isCouncilAdmin;

  const isApproved = request?.status === "approved" || hasMemberRole || isAdmin;
  const isPending = !isApproved && request?.status === "pending";
  const isRejected = !isApproved && !isPending && request?.status === "rejected";
  const isUnsubmitted = !isApproved && !isPending && !isRejected;
  const statusKnown = !isLoading && !accountFailed;

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
                {isCouncilAdmin && (
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
                    {form.full_name_ar ||
                      user?.user_metadata?.full_name ||
                      (isAr ? "عضو أسرة آل بوعبيد" : "Family Member")}
                  </h1>
                  {isSuperAdmin ? (
                    <Badge className="bg-gradient-to-r from-amber-500 to-gold text-ink font-bold text-xs border-0 shadow-sm">
                      <Sparkles className="w-3 h-3 me-1" />
                      {isAr ? "الأمين العام للمجلس" : "Super Admin"}
                    </Badge>
                  ) : isCouncilAdmin ? (
                    <Badge className="bg-gold text-ink font-semibold text-xs border-0">
                      <ShieldCheck className="w-3 h-3 me-1" />
                      {isAr ? "أمانة المجلس" : "Admin"}
                    </Badge>
                  ) : isTreasurer ? (
                    <Badge className="bg-emerald-600 text-white font-semibold text-xs border-0">
                      <Building className="w-3 h-3 me-1" />
                      {isAr ? "أمانة الخزينة والصندوق" : "Treasurer"}
                    </Badge>
                  ) : isEditor ? (
                    <Badge className="bg-sky-600 text-white font-semibold text-xs border-0">
                      <Sliders className="w-3 h-3 me-1" />
                      {isAr ? "إدارة المحتوى والإعلام" : "Content Editor"}
                    </Badge>
                  ) : isFamilyManager ? (
                    <Badge className="bg-purple-600 text-white font-semibold text-xs border-0">
                      <GitBranch className="w-3 h-3 me-1" />
                      {isAr ? "لجنة السجل والأنساب" : "Genealogy Committee"}
                    </Badge>
                  ) : accountFailed ? (
                    <Badge variant="outline" className="text-muted-foreground text-xs">
                      {isAr ? "تعذر تحديد الحالة" : "Status unavailable"}
                    </Badge>
                  ) : !statusKnown ? (
                    <span className="inline-block h-5 w-24 rounded-full bg-muted animate-pulse" />
                  ) : isApproved ? (
                    <Badge className="bg-emerald-600/90 text-white font-medium text-xs">
                      <CheckCircle2 className="w-3 h-3 me-1" />
                      {isAr ? "عضو معتمد" : "Verified Member"}
                    </Badge>
                  ) : isPending ? (
                    <Badge variant="outline" className="text-amber-500 border-amber-500/40 text-xs">
                      <Clock className="w-3 h-3 me-1" />
                      {isAr ? "قيد المراجعة" : "Pending Review"}
                    </Badge>
                  ) : isRejected ? (
                    <Badge
                      variant="outline"
                      className="text-destructive border-destructive/40 text-xs"
                    >
                      {isAr ? "لم يُعتمد الطلب" : "Not Approved"}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      <User className="w-3 h-3 me-1" />
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

            {/* Quick Actions tailored to user roles */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              {(isCouncilAdmin || isTreasurer || isEditor || isFamilyManager) && (
                <Button
                  asChild
                  size="sm"
                  className="h-9 gap-1.5 bg-primary text-primary-foreground font-semibold shadow-sm"
                >
                  <Link
                    to="/admin"
                    search={
                      isTreasurer && !isCouncilAdmin
                        ? { domain: "governance", tab: "treasury" }
                        : isEditor && !isCouncilAdmin
                          ? { domain: "content", tab: "articles" }
                          : isFamilyManager && !isCouncilAdmin
                            ? { domain: "family", tab: "members" }
                            : undefined
                    }
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {isSuperAdmin
                      ? isAr
                        ? "لوحة الأمانة العامة"
                        : "Executive Console"
                      : isTreasurer && !isCouncilAdmin
                        ? isAr
                          ? "لوحة الخزينة"
                          : "Treasury Hub"
                        : isEditor && !isCouncilAdmin
                          ? isAr
                            ? "لوحة إدارة المحتوى"
                            : "Content Studio"
                          : isFamilyManager && !isCouncilAdmin
                            ? isAr
                              ? "لوحة شجرة الأنساب"
                              : "Family Tree Admin"
                            : isAr
                              ? "لوحة الإدارة والأمانة"
                              : "Admin Console"}
                  </Link>
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 border-border hover:bg-secondary"
              >
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
        {/* Onboarding & Next-Step Guidance Banner */}
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-card via-card/95 to-secondary/30 border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 flex-1 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-gold" />
                  {isAr ? "اكتمال السجل والتوثيق العائلي" : "Profile & Verification Progress"}
                </span>
                <Badge
                  variant={profileCompletion === 100 ? "default" : "secondary"}
                  className="text-[10px] font-mono font-bold"
                >
                  {profileCompletion}%
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">
                {isApproved
                  ? isAr
                    ? "عضوية رسمية معتمدة"
                    : "Official Verified Member"
                  : isPending
                    ? isAr
                      ? "طلبك قيد المراجعة"
                      : "Request Under Review"
                    : isAr
                      ? "يرجى استكمال البيانات"
                      : "Please complete details"}
              </span>
            </div>
            <Progress value={profileCompletion} className="h-2 bg-secondary" />

            {/* Step Checkpoints */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CheckCircle2
                  className={cn(
                    "w-3.5 h-3.5 shrink-0",
                    form.full_name_ar.trim() ? "text-emerald-500" : "text-muted-foreground/40",
                  )}
                />
                <span className={cn(form.full_name_ar.trim() && "text-foreground font-medium")}>
                  {isAr ? "الاسم الرباعي" : "Full Name"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CheckCircle2
                  className={cn(
                    "w-3.5 h-3.5 shrink-0",
                    form.branch_slug ? "text-emerald-500" : "text-muted-foreground/40",
                  )}
                />
                <span className={cn(form.branch_slug && "text-foreground font-medium")}>
                  {isAr ? "الفرع العائلي" : "Family Branch"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CheckCircle2
                  className={cn(
                    "w-3.5 h-3.5 shrink-0",
                    form.phone.trim() ? "text-emerald-500" : "text-muted-foreground/40",
                  )}
                />
                <span className={cn(form.phone.trim() && "text-foreground font-medium")}>
                  {isAr ? "رقم الجوال" : "Phone Number"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CheckCircle2
                  className={cn(
                    "w-3.5 h-3.5 shrink-0",
                    isApproved
                      ? "text-emerald-500"
                      : isPending
                        ? "text-gold animate-pulse"
                        : "text-muted-foreground/40",
                  )}
                />
                <span className={cn(isApproved && "text-foreground font-medium")}>
                  {isApproved
                    ? isAr
                      ? "الاعتماد منجز"
                      : "Verified"
                    : isPending
                      ? isAr
                        ? "قيد المراجعة"
                        : "Reviewing"
                      : isAr
                        ? "طلب التوثيق"
                        : "Verification"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Context Action Button */}
          <div className="shrink-0 w-full md:w-auto flex items-center gap-2">
            {isApproved ? (
              <Button
                size="sm"
                onClick={() => setActiveTab("card")}
                className="w-full md:w-auto h-9 text-xs font-bold gap-1.5 bg-gold/15 text-gold hover:bg-gold/25 border border-gold/30 rounded-xl"
              >
                <QrCode className="w-3.5 h-3.5" />
                {isAr ? "عرض بطاقتي الرقمية" : "View My Digital ID"}
              </Button>
            ) : isPending ? (
              <Badge variant="outline" className="text-amber-500 border-amber-500/40 text-xs py-2 px-3">
                <Clock className="w-3.5 h-3.5 me-1.5 animate-pulse" />
                {isAr ? "طلبك معروض على الأمانة" : "Pending Secretariat Approval"}
              </Badge>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  if (profileCompletion < 75) {
                    setActiveTab("profile");
                    toast.info(isAr ? "أكمل بيانات الاسم والفرع أولاً ثم اضغط تقديم." : "Fill name & branch first.");
                  } else {
                    apply.mutate();
                  }
                }}
                disabled={apply.isPending}
                className="w-full md:w-auto h-9 text-xs font-bold gap-1.5 rounded-xl shadow"
              >
                <Send className="w-3.5 h-3.5" />
                {isAr ? "تقديم طلب التوثيق" : "Submit for Verification"}
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card border border-border p-1 rounded-xl h-auto flex overflow-x-auto no-scrollbar md:grid md:grid-cols-5 max-w-4xl gap-1">
            <TabsTrigger
              value="profile"
              className="shrink-0 text-xs sm:text-sm py-2 px-3 gap-1.5 data-[state=active]:bg-secondary data-[state=active]:text-foreground"
            >
              <User className="w-3.5 h-3.5" />
              {isAr ? "البيانات والنسب" : "Profile & Lineage"}
            </TabsTrigger>
            <TabsTrigger
              value="card"
              className="shrink-0 text-xs sm:text-sm py-2 px-3 gap-1.5 data-[state=active]:bg-secondary data-[state=active]:text-foreground"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              {isAr ? "بطاقة العضوية" : "Digital ID"}
            </TabsTrigger>
            <TabsTrigger
              value="treasury"
              className="shrink-0 text-xs sm:text-sm py-2 px-3 gap-1.5 data-[state=active]:bg-secondary data-[state=active]:text-foreground"
            >
              <CreditCard className="w-3.5 h-3.5" />
              {isAr ? "الخزينة والاشتراك" : "Treasury & Dues"}
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="shrink-0 relative text-xs sm:text-sm py-2 px-3 gap-1.5 data-[state=active]:bg-secondary data-[state=active]:text-foreground"
            >
              <Bell className="w-3.5 h-3.5" />
              {isAr ? "الإشعارات" : "Notifications"}
              {unreadCount > 0 && (
                <span className="ms-0.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold font-mono">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="shrink-0 text-xs sm:text-sm py-2 px-3 gap-1.5 data-[state=active]:bg-secondary data-[state=active]:text-foreground"
            >
              <Lock className="w-3.5 h-3.5" />
              {isAr ? "الأمان والحساب" : "Security"}
            </TabsTrigger>
          </TabsList>

          {/* ──────────────── TAB 1: Profile & Lineage ──────────────── */}
          <TabsContent value="profile" className="space-y-6">
            {/* Family Hub Quick Shortcuts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                to="/family-tree"
                search={{ branch: form.branch_slug || undefined }}
                className="p-3.5 rounded-2xl border border-border bg-card hover:bg-secondary/30 transition-all flex items-center justify-between group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <TreePine className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      {isAr ? "موقعك في المشجرة" : "Family Tree Lineage"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {selectedBranchName ? t(selectedBranchName) : isAr ? "استكشف الفروع" : "Explore branches"}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>

              <button
                type="button"
                onClick={() => setActiveTab("treasury")}
                className="p-3.5 rounded-2xl border border-border bg-card hover:bg-secondary/30 transition-all flex items-center justify-between group shadow-sm text-start"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      {isAr ? "صندوق الأسرة والخزينة" : "Family Fund & Dues"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {isAr ? "الاشتراكات والحساب البنكي" : "Dues & Bank Info"}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" />
              </button>

              <Link
                to="/directory"
                className="p-3.5 rounded-2xl border border-border bg-card hover:bg-secondary/30 transition-all flex items-center justify-between group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      {isAr ? "دليل الأعمال والمهن" : "Business Directory"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {isAr ? "شبكة أفراد الأسرة" : "Family Network"}
                    </span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
              </Link>
            </div>

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
                    ) : accountFailed ? (
                      // Rendering an empty form on a failed load invites the
                      // member to "save" blanks over a record that did load
                      // fine on the server -- offer a retry instead.
                      <div className="p-8 text-center space-y-3">
                        <AlertTriangle className="w-6 h-6 mx-auto text-destructive/70" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {isAr
                            ? "تعذر تحميل بيانات السجل العائلي. لم يتم تعديل أي بيانات."
                            : "Could not load your family register data. Nothing has been changed."}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1.5"
                          onClick={() => void refetchAccount()}
                          disabled={accountFetching}
                        >
                          {accountFetching ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                          )}
                          {isAr ? "إعادة المحاولة" : "Retry"}
                        </Button>
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
                        <div className="p-4 rounded-xl border border-border bg-secondary/15 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                          <div className="relative group shrink-0">
                            <SaudiCulturalAvatar
                              src={form.avatar_path}
                              alt={form.full_name_ar}
                              size="xl"
                              className="w-20 h-20 shadow-md ring-2 ring-primary/20"
                            />
                            <button
                              type="button"
                              onClick={() => avatarFileInputRef.current?.click()}
                              className="absolute inset-0 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] gap-1 cursor-pointer"
                              disabled={avatarUploading}
                              title={isAr ? "تغيير الصورة" : "Change Photo"}
                            >
                              <Camera className="w-4 h-4" />
                              <span>{isAr ? "تغيير" : "Change"}</span>
                            </button>
                          </div>

                          <div className="flex-1 w-full space-y-2 text-center sm:text-start">
                            <div>
                              <Label className="text-xs font-bold text-foreground">
                                {isAr ? "الصورة الشخصية للعضو" : "Member Profile Picture"}
                              </Label>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {form.avatar_path
                                  ? isAr
                                    ? "تم تعيين صورة شخصية خاصة بحسابك. يمكنك استبدالها أو استعادة الرمز التراثي."
                                    : "Custom photo is set. You can replace it or reset to the heritage avatar."
                                  : isAr
                                    ? "يمكنك رفع صورة شخصية حديثة، أو الاحتفاظ بالرمز التراثي السعودي الافتراضي."
                                    : "Upload a recent photo or keep the default Saudi cultural avatar."}
                              </p>
                            </div>

                            <input
                              ref={avatarFileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleAvatarFileSelect}
                            />

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs gap-1.5 rounded-lg border-primary/30 hover:bg-primary/5"
                                onClick={() => avatarFileInputRef.current?.click()}
                                disabled={avatarUploading}
                              >
                                {avatarUploading ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                                ) : (
                                  <Upload className="w-3.5 h-3.5 text-primary" />
                                )}
                                {form.avatar_path
                                  ? isAr
                                    ? "استبدال الصورة"
                                    : "Replace Photo"
                                  : isAr
                                    ? "رفع صورة شخصية"
                                    : "Upload Photo"}
                              </Button>

                              {form.avatar_path && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setForm((f) => ({ ...f, avatar_path: "" }))}
                                  className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 px-2.5 rounded-lg"
                                >
                                  <X className="w-3.5 h-3.5 me-1" />
                                  {isAr ? "استعادة الرمز التراثي" : "Use Cultural Avatar"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                              {isAr ? "الاسم الكامل (بالعربية) *" : "Full Name (Arabic) *"}
                            </Label>
                            <Input
                              required
                              value={form.full_name_ar}
                              onChange={(e) => setForm({ ...form, full_name_ar: e.target.value })}
                              placeholder="مثال: عبدالله بن محمد بن إبراهيم آل بوعبيد"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                              {isAr ? "الاسم بالإنجليزية" : "Full Name (English)"}
                            </Label>
                            <Input
                              value={form.full_name_en}
                              onChange={(e) => setForm({ ...form, full_name_en: e.target.value })}
                              placeholder="e.g. Abdullah M. Al Bu Obaid"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                              {isAr ? "فرع الأسرة *" : "Family Branch *"}
                            </Label>
                            <Select
                              value={form.branch_slug}
                              onValueChange={(val) => setForm({ ...form, branch_slug: val })}
                            >
                              <SelectTrigger className="h-9 text-xs">
                                <SelectValue
                                  placeholder={isAr ? "اختر فرع العائلة..." : "Select branch..."}
                                />
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
                            <Label className="text-xs font-semibold">
                              {isAr ? "رقم الجوال للتواصل" : "Phone Number"}
                            </Label>
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
                            <Label className="text-xs font-semibold">
                              {isAr
                                ? "سلسلة النسب والملاحظات العائلية"
                                : "Lineage & Ancestral Notes"}
                            </Label>
                            <span className="text-[10px] text-muted-foreground">
                              {isAr ? "اختياري" : "Optional"}
                            </span>
                          </div>
                          <Textarea
                            rows={3}
                            value={form.lineage_notes}
                            onChange={(e) => setForm({ ...form, lineage_notes: e.target.value })}
                            placeholder={
                              isAr
                                ? "مثال: ابن فلان بن فلان، من أهالي المبرز / الصالحية..."
                                : "Ancestral details..."
                            }
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
                                {isAr
                                  ? "الظهور في دليل الأسرة للأعضاء"
                                  : "Show in Members Directory"}
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
                          <Button
                            type="submit"
                            disabled={save.isPending}
                            className="px-6 font-bold text-xs h-9"
                          >
                            {save.isPending
                              ? isAr
                                ? "جاري الحفظ..."
                                : "Saving..."
                              : isAr
                                ? "حفظ التعديلات"
                                : "Save Changes"}
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
                    {accountFailed ? (
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-[11px] text-muted-foreground leading-relaxed">
                          <span className="font-semibold block text-foreground mb-1">
                            {isAr ? "تعذر تحميل حالة العضوية" : "Could not load membership status"}
                          </span>
                          {isAr
                            ? "لم نتمكن من قراءة حالة طلبك من السجل. لا تقدّم طلباً جديداً قبل التحديث، فقد يكون طلبك مسجلاً بالفعل."
                            : "We could not read your request status. Don't submit a new request before retrying — one may already be on file."}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void refetchAccount()}
                          disabled={accountFetching}
                          className="w-full h-8 text-xs font-semibold gap-1.5"
                        >
                          {accountFetching ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                          )}
                          {isAr ? "إعادة المحاولة" : "Retry"}
                        </Button>
                      </div>
                    ) : !statusKnown ? (
                      <div className="space-y-2.5" aria-busy="true">
                        <div className="h-10 rounded-lg bg-muted animate-pulse" />
                        <div className="h-16 rounded-lg bg-muted/60 animate-pulse" />
                      </div>
                    ) : isApproved ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                          <span className="text-muted-foreground">
                            {isAr ? "صفة العضوية:" : "Membership Status:"}
                          </span>
                          <Badge className="bg-emerald-600 text-white text-xs font-semibold">
                            {isSuperAdmin
                              ? isAr
                                ? "الأمين العام للمجلس"
                                : "Super Admin"
                              : isCouncilAdmin
                                ? isAr
                                  ? "أمانة المجلس (مسؤول معتمد)"
                                  : "Council Secretariat (Admin)"
                                : isTreasurer
                                  ? isAr
                                    ? "أمين الخزينة والصندوق"
                                    : "Treasurer"
                                  : isEditor
                                    ? isAr
                                      ? "هيئة التحرير والمحتوى"
                                      : "Content Editor"
                                    : isFamilyManager
                                      ? isAr
                                        ? "لجنة السجل والأنساب"
                                        : "Genealogy Committee"
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
                            {isSuperAdmin || isCouncilAdmin
                              ? isAr
                                ? "حسابك معتمد وموثق بصلاحيات الأمانة العامة وإدارة المنصة بالكامل."
                                : "Your account is fully verified with executive council privileges."
                              : isTreasurer
                                ? isAr
                                  ? "حسابك معتمد ومخول بالاطلاع على وإدارة الخزينة والتحويلات المالية وصندوق التنمية."
                                  : "Your account is authorized to manage the family treasury and transactions."
                                : isEditor
                                  ? isAr
                                    ? "حسابك معتمد بصلاحيات نشر وتحرير المحتوى والمقالات والمكتبة الرقمية."
                                    : "Your account is authorized to edit and publish content."
                                  : isFamilyManager
                                    ? isAr
                                      ? "حسابك معتمد بصلاحيات تحديث وإدارة فروع شجرة العائلة وسجلات الأنساب."
                                      : "Your account is authorized to manage the family tree records."
                                    : isAr
                                      ? "تم توثيق بياناتك بنجاح في السجل العائلي الرسمي وشجرة الأنساب."
                                      : "Your record has been officially verified in the family register."}
                          </p>
                        </div>
                      </div>
                    ) : isPending ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                          <span className="text-muted-foreground">
                            {isAr ? "حالة الطلب:" : "Status:"}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-amber-500 border-amber-500/40 text-xs"
                          >
                            {isAr ? "قيد مراجعة الأمانة" : "Under Review"}
                          </Badge>
                        </div>
                        {request?.review_note && (
                          <div className="p-3 rounded-lg bg-muted/40 border border-border text-[11px] text-muted-foreground space-y-1">
                            <span className="font-semibold block text-foreground">
                              {isAr ? "ملاحظة أمانة المجلس:" : "Secretariat Note:"}
                            </span>
                            <p>{request.review_note}</p>
                          </div>
                        )}
                        <p className="text-[11px] text-muted-foreground">
                          {isAr
                            ? "تم تسجيل طلبك وتوثيق بياناتك تحت إشراف لجنة الأنساب والعلاقات العائلية."
                            : "Your request is registered with the genealogical & family relations committee."}
                        </p>
                      </div>
                    ) : isRejected ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-destructive/10 border border-destructive/30">
                          <span className="text-muted-foreground">
                            {isAr ? "حالة الطلب:" : "Status:"}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-destructive border-destructive/40 text-xs"
                          >
                            {isAr ? "لم يُعتمد الطلب" : "Not Approved"}
                          </Badge>
                        </div>
                        {request?.review_note && (
                          <div className="p-3 rounded-lg bg-muted/40 border border-border text-[11px] text-muted-foreground space-y-1">
                            <span className="font-semibold block text-foreground">
                              {isAr ? "ملاحظة أمانة المجلس:" : "Secretariat Note:"}
                            </span>
                            <p>{request.review_note}</p>
                          </div>
                        )}
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {isAr
                            ? "لم يتم اعتماد طلبك السابق. راجع الملاحظة أعلاه إن وُجدت، وتأكد من استكمال بياناتك، ثم أعد تقديم الطلب."
                            : "Your previous request wasn't approved. Review the note above if any, make sure your details are complete, and submit again."}
                        </p>
                        <Button
                          type="button"
                          onClick={() => apply.mutate()}
                          disabled={apply.isPending || !form.full_name_ar.trim()}
                          className="w-full h-8 text-xs font-semibold gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {apply.isPending
                            ? isAr
                              ? "جاري الإرسال..."
                              : "Submitting..."
                            : isAr
                              ? "إعادة تقديم الطلب"
                              : "Resubmit Request"}
                        </Button>
                        {!form.full_name_ar.trim() && <ApplyBlockedHint isAr={isAr} />}
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
                          {apply.isPending
                            ? isAr
                              ? "جاري الإرسال..."
                              : "Submitting..."
                            : isAr
                              ? "تقديم طلب اعتماد العضوية"
                              : "Submit Verification"}
                        </Button>
                        {!form.full_name_ar.trim() && <ApplyBlockedHint isAr={isAr} />}
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
              <div className="printable-card relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-gold/50 bg-gradient-to-br from-ink via-stone-900 to-ink p-4 sm:p-6 md:p-7 text-ivory shadow-2xl">
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
                        {isAr
                          ? "صندوق التنمية العائلية · بطاقة العضوية الرقمية"
                          : "Family Development Fund · Digital ID"}
                      </p>
                    </div>
                  </div>

                  {/* The card used to carry a binary Verified/Pending seal, so a
                      member whose request was *rejected* -- and a brand-new
                      account that had never applied at all -- both received a
                      gold "Pending" badge on an otherwise finished-looking
                      membership card. Each real `request_status` value now maps
                      to its own seal. */}
                  {!statusKnown ? (
                    <span className="inline-block h-5 w-20 rounded-full bg-ivory/20 animate-pulse" />
                  ) : isApproved ? (
                    <Badge className="bg-gold text-ink font-bold text-[10px] border-0">
                      {isAr ? "عضو معتمد" : "Verified"}
                    </Badge>
                  ) : isPending ? (
                    <Badge className="bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold text-[10px]">
                      {isAr ? "قيد الاعتماد" : "Pending"}
                    </Badge>
                  ) : isRejected ? (
                    <Badge className="bg-destructive/20 text-red-300 border border-red-400/40 font-bold text-[10px]">
                      {isAr ? "غير معتمدة" : "Not Approved"}
                    </Badge>
                  ) : (
                    <Badge className="bg-ivory/10 text-ivory/70 border border-ivory/25 font-bold text-[10px]">
                      {isAr ? "لم تُقدَّم بعد" : "Not Submitted"}
                    </Badge>
                  )}
                </div>

                {/* An unapproved card is a preview, not credentials. Saying so
                    on the card itself keeps it from being presented as proof of
                    membership that the public /verify endpoint would refuse. */}
                {statusKnown && !isApproved && (
                  <div className="relative mt-4 flex items-start gap-2 rounded-xl border border-gold/25 bg-ivory/5 p-2.5 text-[10px] leading-relaxed text-ivory/70">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px text-gold" />
                    <span>
                      {isAr
                        ? "هذه معاينة للبطاقة ولا تُعد إثبات عضوية. لن تُصدر البطاقة رسمياً ولن يعتمدها رمز الفحص إلا بعد اعتماد الأمانة."
                        : "This is a preview, not proof of membership. The card is only issued — and the QR seal only verifies — once the secretariat approves your request."}
                    </span>
                  </div>
                )}

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
                      <span className="text-[10px] text-ivory/50 block mb-0.5">
                        {isAr ? "اسم العضو" : "Member Name"}
                      </span>
                      <h4 className="text-lg sm:text-xl font-bold font-naskh text-ivory">
                        {form.full_name_ar || (isAr ? "عضو أسرة آل بوعبيد" : "Family Member")}
                      </h4>
                      {form.full_name_en && (
                        <p className="text-xs text-ivory/60 font-mono mt-0.5">
                          {form.full_name_en}
                        </p>
                      )}

                      <div className="mt-3 flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-[9px] text-ivory/40 block">
                            {isAr ? "الفرع" : "Branch"}
                          </span>
                          <span className="font-semibold text-gold">
                            {selectedBranchName
                              ? t(selectedBranchName)
                              : isAr
                                ? "غير محدد"
                                : "Unassigned"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-ivory/40 block">
                            {isAr ? "رقم العضوية" : "Member ID"}
                          </span>
                          <span className="font-mono text-ivory/80">{memberCode}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scannable QR Code (Active only for approved members/admins) */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    {isApproved ? (
                      <a
                        href={`/verify?id=${memberCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative block p-2 rounded-2xl bg-white shadow-xl hover:scale-105 transition-all"
                        title={
                          isAr
                            ? "انقر لعرض شهادة التوثيق الرسمية"
                            : "Click to view official verification certificate"
                        }
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
                    ) : (
                      <div className="w-20 h-20 sm:w-22 sm:h-22 p-2 rounded-2xl bg-stone-900 border border-gold/30 flex flex-col items-center justify-center text-center shadow-inner">
                        <Lock className="w-6 h-6 text-gold/80 mb-1" />
                        <span className="text-[9px] text-ivory/70 font-semibold leading-tight">
                          {isPending ? (isAr ? "قيد المراجعة" : "Under Review") : isAr ? "غير مفعل" : "Locked"}
                        </span>
                      </div>
                    )}
                    <span className="text-[9px] font-mono text-ivory/60 flex items-center gap-1">
                      {isApproved ? (
                        <>
                          <ExternalLink className="w-2.5 h-2.5 text-gold" />
                          {isAr ? "باركود فحص حي" : "LIVE QR SEAL"}
                        </>
                      ) : (
                        <>
                          <Lock className="w-2.5 h-2.5 text-gold/70" />
                          {isAr ? "بانتظار الاعتماد" : "LOCKED SEAL"}
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="relative pt-3 border-t border-ivory/15 flex items-center justify-between text-[10px] text-ivory/50 font-mono">
                  <span>NCNP LIC. #1200758400</span>
                  <span>SAUDI ARABIA · AL-AHSA</span>
                </div>
              </div>

              {/* Digital Card Quick Actions Toolbar (Full features for approved members) */}
              {isApproved ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyVerificationLink}
                    className="h-9 text-xs font-semibold gap-1.5 rounded-xl border-border bg-card hover:bg-secondary"
                  >
                    {copiedLink ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5 text-gold" />
                    )}
                    <span>{copiedLink ? (isAr ? "تم النسخ" : "Copied!") : isAr ? "مشاركة الرابط" : "Share Link"}</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyMemberCode}
                    className="h-9 text-xs font-semibold gap-1.5 rounded-xl border-border bg-card hover:bg-secondary"
                  >
                    {copiedMemberCode ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-primary" />
                    )}
                    <span>{copiedMemberCode ? (isAr ? "تم النسخ" : "Copied!") : isAr ? "نسخ المعرف" : "Copy ID"}</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQrModalOpen(true)}
                    className="h-9 text-xs font-semibold gap-1.5 rounded-xl border-border bg-card hover:bg-secondary"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{isAr ? "تكبير الباركود" : "Expand QR"}</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlePrintCard}
                    className="h-9 text-xs font-semibold gap-1.5 rounded-xl border-border bg-card hover:bg-secondary"
                  >
                    <Printer className="w-3.5 h-3.5 text-foreground" />
                    <span>{isAr ? "طباعة البطاقة" : "Print Card"}</span>
                  </Button>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-gold shrink-0" />
                    <span className="text-muted-foreground text-[11px]">
                      {isPending
                        ? isAr
                          ? "سيتم تفعيل أدوات البطاقة والرابط الرسمي فور اكتمال مراجعة طلبك."
                          : "Card tools and verification link will activate once your request is approved."
                        : isAr
                          ? "أكمل بياناتك في السجل العائلي لتقديم طلب إصدار بطاقتك الرسمية."
                          : "Complete your register details to request your official digital card."}
                    </span>
                  </div>
                  {!isPending && (
                    <Button
                      size="sm"
                      onClick={() => setActiveTab("profile")}
                      className="h-7 text-xs font-bold px-3 rounded-lg shrink-0"
                    >
                      {isAr ? "استكمال البيانات" : "Complete Profile"}
                    </Button>
                  )}
                </div>
              )}

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
                      <p className="font-semibold text-foreground">
                        {isAr ? "١. إنشاء الحساب الرقمي" : "1. Account Created"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {isAr
                          ? "تم التحقق من البريد الإلكتروني والوصول للمنصة."
                          : "Email verified and access granted."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className={
                        form.full_name_ar || isAdmin
                          ? "w-4 h-4 text-emerald-500 shrink-0 mt-0.5"
                          : "w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5"
                      }
                    />
                    <div>
                      <p className="font-semibold text-foreground">
                        {isAr ? "٢. استكمال السجل والفرع" : "2. Complete Lineage & Branch"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {isAr
                          ? "تحديد الاسم الرباعي والفرع وسلسلة النسب."
                          : "Set full name, branch, and ancestral notes."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className={
                        isAdmin || isApproved
                          ? "w-4 h-4 text-emerald-500 shrink-0 mt-0.5"
                          : isPending
                            ? "w-4 h-4 text-gold shrink-0 mt-0.5"
                            : "w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5"
                      }
                    />
                    <div>
                      <p className="font-semibold text-foreground">
                        {isAr ? "٣. مطابقة الأمانة ولجنة الأنساب" : "3. Secretariat Review"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {isAr
                          ? "مراجعة بيانات النسب ومطابقتها مع شجرة العائلة الرسمية."
                          : "Cross-referenced with official family tree."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      className={
                        isAdmin || isApproved
                          ? "w-4 h-4 text-emerald-500 shrink-0 mt-0.5"
                          : "w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5"
                      }
                    />
                    <div>
                      <p className="font-semibold text-foreground">
                        {isAr ? "٤. إصدار بطاقة العضوية والاعتماد" : "4. Official Digital Badge"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {isAr
                          ? "تفعيل كامل الصلاحيات والوصول للمكتبة ودليل الأعضاء."
                          : "Full access to member directory & archive."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ──────────────── TAB 3: Treasury & Dues ────────────────── */}
          <TabsContent value="treasury" className="space-y-6">
            {/* Top Cards: Bank Account Details + Contribution Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bank Card */}
              <Card className="border-border bg-card rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gold" />
                    {isAr ? "الحساب البنكي الرسمي المعتمد" : "Official Bank Particulars"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isAr
                      ? "الحساب البنكي الرسمي لصندوق التنمية العائلية (آل بوعبيد) الخاضع للإشراف المالي والترخيص."
                      : "Official licensed bank account of Al-Boabid Family Development Fund."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  {isApprovedMember ? (
                    bankLoading ? (
                      <div className="p-8 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : bankAccount ? (
                      <div className="p-4 rounded-xl border border-border bg-secondary/30 space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">
                            {isAr ? "اسم الحساب:" : "Account Name:"}
                          </span>
                          <span className="font-bold text-foreground">
                            {isAr
                              ? bankAccount.beneficiary_name_ar || "صندوق التنمية العائلية (آل بوعبيد)"
                              : bankAccount.beneficiary_name_en || "Al-Boabid Family Fund"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">{isAr ? "البنك:" : "Bank:"}</span>
                          <span className="font-semibold text-foreground">
                            {isAr
                              ? bankAccount.bank_name_ar || "مصرف الإنماء"
                              : bankAccount.bank_name_en || "Alinma Bank"}
                          </span>
                        </div>
                        {bankAccount.accountNumber && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">
                              {isAr ? "رقم الحساب:" : "Account Number:"}
                            </span>
                            <span className="font-mono font-medium text-foreground">
                              {bankAccount.accountNumber}
                            </span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-border/50">
                          <span className="text-muted-foreground block text-[11px] mb-1">
                            {isAr ? "رقم الآيبان الدولي (IBAN):" : "IBAN:"}
                          </span>
                          <div className="flex items-center justify-between bg-background p-2.5 rounded-lg border border-border font-mono text-xs">
                            <span className="font-bold text-foreground tracking-wide">
                              {bankAccount.iban.match(/.{1,4}/g)?.join(" ") || bankAccount.iban}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-7 h-7 hover:bg-muted"
                              onClick={() => {
                                navigator.clipboard.writeText(bankAccount.iban);
                                setCopiedIban(true);
                                toast.success(isAr ? "تم نسخ الآيبان بنجاح" : "IBAN copied");
                                setTimeout(() => setCopiedIban(false), 2500);
                              }}
                            >
                              {copiedIban ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                        {bankAccount.notes && (
                          <p className="text-[10px] text-muted-foreground pt-1 leading-relaxed">
                            {bankAccount.notes}
                          </p>
                        )}
                      </div>
                    ) : null
                  ) : (
                    <div className="p-4 rounded-xl border border-border bg-amber-500/10 text-amber-800 dark:text-amber-300 space-y-2">
                      <p className="font-medium text-xs leading-relaxed">
                        {isAr
                          ? "بيانات الحساب البنكي تظهر تلقائياً بعد اعتماد العضوية الرسمية في الأسرة."
                          : "Official bank particulars will appear once membership is verified."}
                      </p>
                    </div>
                  )}

                  <Button asChild className="w-full h-9 text-xs font-bold gap-1.5 rounded-xl">
                    <Link to="/contribute">
                      <FileCheck className="w-4 h-4" />
                      {isAr ? "تسجيل اشتراك أو مساهمة جديدة" : "Record New Contribution"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Personal Contributions Stats */}
              <Card className="border-border bg-card rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-primary" />
                    {isAr ? "ملخص مساهماتي واشتراكاتي" : "My Contributions Summary"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isAr
                      ? "إجمالي المبالغ والاشتراكات المعتمدة في سجل الخزينة."
                      : "Total verified payments and registered dues."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contribsLoading ? (
                    <div className="p-8 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl border border-border bg-emerald-500/5 dark:bg-emerald-500/10">
                          <span className="text-[11px] text-muted-foreground block mb-1">
                            {isAr ? "إجمالي المساهمات المعتمدة" : "Total Verified"}
                          </span>
                          <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                            {new Intl.NumberFormat(isAr ? "ar-SA" : "en-US", {
                              style: "currency",
                              currency: "SAR",
                              maximumFractionDigits: 0,
                            }).format(
                              (myContributions ?? [])
                                .filter((c) => c.status === "verified")
                                .reduce((acc, curr) => acc + (curr.amount || 0), 0),
                            )}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl border border-border bg-secondary/30">
                          <span className="text-[11px] text-muted-foreground block mb-1">
                            {isAr ? "عدد المعاملات" : "Transactions"}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xl font-bold font-mono text-foreground">
                              {(myContributions ?? []).length}
                            </span>
                            {(myContributions ?? []).some((c) => c.status === "pending") && (
                              <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30">
                                {(myContributions ?? []).filter((c) => c.status === "pending").length}{" "}
                                {isAr ? "قيد المراجعة" : "pending"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-secondary/20 border border-border text-xs text-muted-foreground space-y-1">
                        <p className="font-bold text-foreground">
                          {isAr ? "حوكمة وتوثيق الصندوق" : "Fund Governance"}
                        </p>
                        <p className="text-[11px] leading-relaxed">
                          {isAr
                            ? "تخضع جميع المساهمات والاشتراكات للتدقيق الدوري والتوثيق من مجلس أمناء الصندوق والجمعية العمومية."
                            : "All contributions are audited and verified under the board of trustees oversight."}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Bottom Card: Personal Contribution History Table */}
            <Card className="border-border bg-card rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <History className="w-4 h-4 text-gold" />
                    {isAr ? "سجل مساهماتي السابقة" : "Contribution History"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isAr
                      ? "جميع التحويلات والاشتراكات المسجلة باسمك مع حالة الاعتماد من الخزينة."
                      : "Detailed list of your submitted payments and their verification status."}
                  </CardDescription>
                </div>
                <Button asChild size="sm" variant="outline" className="text-xs font-bold gap-1 rounded-xl">
                  <Link to="/contribute">
                    <FileCheck className="w-3.5 h-3.5" />
                    {isAr ? "تسجيل مساهمة" : "New Contribution"}
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {contribsLoading ? (
                  <div className="p-8 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (myContributions ?? []).length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-border rounded-xl">
                    <Wallet className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-muted-foreground">
                      {isAr ? "لم تقم بتسجيل أي مساهمات سابقة حتى الآن." : "No contribution records found."}
                    </p>
                    <Button asChild size="sm" className="mt-3 text-xs font-bold rounded-xl">
                      <Link to="/contribute">
                        {isAr ? "تسجيل أول مساهمة" : "Record First Contribution"}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                    {(myContributions ?? []).map((c) => (
                      <div key={c.id} className="p-4 bg-card hover:bg-muted/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm font-mono text-foreground">
                              {new Intl.NumberFormat(isAr ? "ar-SA" : "en-US", {
                                style: "currency",
                                currency: "SAR",
                                maximumFractionDigits: 0,
                              }).format(c.amount)}
                            </span>
                            <span className="text-muted-foreground font-medium">·</span>
                            <span className="font-medium text-foreground">
                              {c.purpose || (isAr ? "اشتراك عام" : "General contribution")}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span>
                              {new Date(c.created_at).toLocaleDateString(isAr ? "ar-SA" : "en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            {c.reference && (
                              <span>
                                {isAr ? "مرجع:" : "Ref:"} <span className="font-mono">{c.reference}</span>
                              </span>
                            )}
                          </div>
                          {c.review_note && (
                            <p className="text-[11px] text-muted-foreground bg-muted/40 p-2 rounded-lg mt-1.5">
                              <span className="font-bold text-foreground">
                                {isAr ? "ملاحظة الخزينة:" : "Treasury Note:"}
                              </span>{" "}
                              {c.review_note}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center">
                          {c.status === "verified" ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[11px]">
                              <CheckCircle2 className="w-3 h-3" />
                              {isAr ? "معتمدة" : "Verified"}
                            </Badge>
                          ) : c.status === "pending" ? (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 text-[11px]">
                              <Clock className="w-3 h-3 animate-pulse" />
                              {isAr ? "قيد المراجعة" : "Pending Review"}
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1 text-[11px]">
                              <XCircle className="w-3 h-3" />
                              {isAr ? "مرفوضة" : "Rejected"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ──────────────── TAB: Notifications ─────────── */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm">{isAr ? "الإشعارات" : "Notifications"}</CardTitle>
                  <CardDescription className="text-xs">
                    {isAr
                      ? "تحديثات طلب العضوية والمستجدات الموجهة لك."
                      : "Membership updates and news addressed to you."}
                  </CardDescription>
                </div>
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    disabled={markAllNotifsRead.isPending}
                    onClick={() => markAllNotifsRead.mutate()}
                  >
                    {markAllNotifsRead.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isAr ? (
                      "تمييز الكل كمقروء"
                    ) : (
                      "Mark all read"
                    )}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {/* Loading and failure both used to fall through to the empty
                    state, so a member with unread approval news was told "no
                    notifications yet" whenever the fetch was slow or failed. */}
                {notifsLoading ? (
                  <div className="space-y-3 py-2" aria-busy="true">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
                    ))}
                  </div>
                ) : notifsFailed ? (
                  <div className="py-8 px-4 text-center text-xs text-muted-foreground border border-dashed border-destructive/40 rounded-lg space-y-3">
                    <AlertTriangle className="w-6 h-6 mx-auto text-destructive/70" />
                    <p className="leading-relaxed">
                      {isAr
                        ? "تعذر تحميل الإشعارات. قد تكون هناك تحديثات لم تصلك بعد."
                        : "Could not load your notifications. There may be updates you haven't seen."}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 gap-1.5"
                      onClick={() => void refetchNotifs()}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {isAr ? "إعادة المحاولة" : "Retry"}
                    </Button>
                  </div>
                ) : !notifData?.notifications.length ? (
                  <div className="py-10 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                    <Bell className="w-6 h-6 mx-auto mb-2 opacity-40" />
                    {isAr ? "لا توجد إشعارات حتى الآن." : "No notifications yet."}
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {notifData.notifications.map((n) => {
                      const content = (
                        <div className="flex items-start gap-3 py-3">
                          {!n.is_read && (
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          )}
                          <div className={cn("flex-1 min-w-0", n.is_read && "ps-[15px]")}>
                            <p
                              className={cn(
                                "text-xs",
                                n.is_read
                                  ? "text-muted-foreground"
                                  : "font-semibold text-foreground",
                              )}
                            >
                              {isAr ? n.title_ar : n.title_en || n.title_ar}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {isAr ? n.message_ar : n.message_en || n.message_ar}
                            </p>
                            <p className="text-[10px] text-muted-foreground/70 mt-1 font-mono">
                              {formatNotifTime(n.created_at)}
                            </p>
                          </div>
                          {!n.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[10px] h-6 px-2 shrink-0"
                              onClick={(e) => {
                                e.preventDefault();
                                markNotifRead.mutate(n.id);
                              }}
                            >
                              {isAr ? "تمييز كمقروء" : "Mark read"}
                            </Button>
                          )}
                        </div>
                      );
                      const href = safeNotifLink(n.link);
                      return (
                        <li key={n.id}>
                          {href ? (
                            // n.link is an arbitrary DB-stored path, not a
                            // route known at build time, so a plain <a> is
                            // used here instead of the typed <Link>.
                            <a
                              href={href}
                              className="block hover:bg-muted/40 -mx-1 px-1 rounded transition-colors"
                              onClick={(e) => {
                                if (n.is_read) return;
                                // A full navigation tears down the in-flight
                                // mark-read POST, so the notification stayed
                                // unread every time it was opened via its link.
                                // Navigate only once the write has settled.
                                e.preventDefault();
                                void markNotifRead
                                  .mutateAsync(n.id)
                                  .catch(() => undefined)
                                  .finally(() => {
                                    window.location.href = href;
                                  });
                              }}
                            >
                              {content}
                            </a>
                          ) : (
                            content
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
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
                    {isAr
                      ? "إدارة الوصول وتأمين حسابك في البوابة."
                      : "Manage your credentials and session."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-5 text-xs">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">
                      {isAr ? "البريد الإلكتروني المعتمد" : "Registered Email"}
                    </Label>
                    <div className="p-2.5 bg-secondary/40 border border-border rounded-lg font-mono text-muted-foreground flex items-center justify-between">
                      <span>{user?.email}</span>
                      <Badge
                        variant="outline"
                        className="text-[10px] text-emerald-500 border-emerald-500/30"
                      >
                        {isAr ? "موثق" : "Verified"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">
                      {isAr ? "معرف المستخدم (UUID)" : "User Identifier"}
                    </Label>
                    <div className="p-2.5 bg-secondary/40 border border-border rounded-lg font-mono text-muted-foreground text-[11px]">
                      {user?.id}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-foreground">
                        {isAr ? "إعادة تعيين كلمة المرور" : "Reset Password"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {isAr
                          ? "سيتم إرسال رابط آمن إلى بريدك لإعادة التعيين."
                          : "We will send a secure link to your email."}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handlePasswordReset}
                      className="h-8 text-xs font-semibold"
                    >
                      {isAr ? "إرسال رابط التعيين" : "Send Reset Link"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Fullscreen QR Inspection Dialog */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="max-w-xs text-center p-6 rounded-3xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-foreground font-naskh">
              {isAr ? "رمز التحقق المباشر من العضوية" : "Live QR Verification Seal"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-mono mt-1">
              {memberCode} · {form.full_name_ar || (isAr ? "عضو الأسرة" : "Member")}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-white rounded-2xl shadow-inner my-3 flex items-center justify-center">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="QR Code"
                className="w-56 h-56 object-contain"
              />
            ) : (
              <QrCode className="w-32 h-32 text-stone-800 animate-pulse" />
            )}
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {isAr
              ? "وجّه كاميرا أي هاتف نحو الرمز للتحقق الفوري من شهادة الاعتماد الرسمية."
              : "Point any mobile camera to scan and verify the official member certificate."}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
