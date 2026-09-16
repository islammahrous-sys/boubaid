import { formatDualDate } from "@/lib/dates";
import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLang } from "@/i18n/LanguageProvider";
import {
  User,
  Shield,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Building,
  GitBranch,
  FileCheck,
  Award,
  Lock,
  Plus,
  Trash2,
  ExternalLink,
  History,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import {
  WorkflowStepper,
  type WorkflowStepItem,
} from "@/components/console/common/WorkflowStepper";
import { NextActionCard } from "@/components/console/common/NextActionCard";
import { useConfirm } from "@/hooks/useConfirm";
import { cn } from "@/lib/utils";

export type MemberProfileData = {
  id: string;
  email?: string | null;
  full_name_ar?: string | null;
  full_name_en?: string | null;
  branch_slug?: string | null;
  phone?: string | null;
  avatar_path?: string | null;
  created_at: string;
};

export type MemberRequestData = {
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

interface MemberProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: MemberProfileData | null;
  userRoles: { id: string; user_id: string; role: string }[];
  membershipRequest?: MemberRequestData | null;
  familyMember?: {
    id: string;
    first_name_ar: string;
    last_name_ar: string;
    branch_id?: string | null;
    slug?: string | null;
    branch_slug?: string | null;
  } | null;
  onAssignRole: (userId: string, role: string) => Promise<void>;
  onRemoveRole: (userId: string, role: string) => Promise<void>;
  onReviewRequest?: (
    requestId: string,
    status: "approved" | "rejected",
    note?: string,
  ) => Promise<void>;
  onNavigateTab?: (domainId: string, tabId: string) => void;
  initialTab?: string;
}

const ROLE_DEFINITIONS = [
  {
    role: "super_admin",
    label_ar: "مدير أعلى للنظام",
    label_en: "Super Admin",
    desc_ar: "تحكم كامل في كافة إعدادات المنظومة وصلاحيات المشرفين وحذف السجلات الحساسة.",
    desc_en: "Full platform governance, role assignment, and administrative control.",
  },
  {
    role: "admin",
    label_ar: "مشرف أمانة المجلس",
    label_en: "Council Admin",
    desc_ar: "إدارة الأعضاء، اعتماد طلبات العضوية، مراجعة المساهمات، ونشر القرارات.",
    desc_en: "Manage members, verify requests, review contributions, and publish records.",
  },
  {
    role: "family_manager",
    label_ar: "مدير شجرة وأنساب الأسرة",
    label_en: "Genealogy Manager",
    desc_ar: "تعديل سجلات الأفراد، إضافة المواليد والوفيات، وتوثيق شبكة القرابة والنسب.",
    desc_en: "Manage lineage records, family branches, marriages, and generational tree.",
  },
  {
    role: "content_manager",
    label_ar: "مدير المحتوى والمركز الإعلامي",
    label_en: "Content Studio Manager",
    desc_ar: "إعداد ونشر المقالات والأخبار والمكتبة الرقمية وإدارة وتنسيق صفحات الموقع.",
    desc_en: "Publish news, manage media studio, oversee digital library and pages.",
  },
  {
    role: "editor",
    label_ar: "محرر محتوى",
    label_en: "Content Editor",
    desc_ar: "كتابة المسودات ورفع الصور وتقديم المقالات والأخبار للمراجعة والاعتماد.",
    desc_en: "Draft articles, upload media, and submit news for council approval.",
  },
  {
    role: "treasurer",
    label_ar: "أمين الخزينة والمالية",
    label_en: "Treasurer",
    desc_ar: "مراجعة التحويلات البنكية، مطابقة إيصالات المساهمات، وإدارة حملات الدعم.",
    desc_en: "Audit bank receipts, verify financial contributions, and track fund targets.",
  },
  {
    role: "member",
    label_ar: "عضو معتمد في الأسرة",
    label_en: "Verified Family Member",
    desc_ar: "الوصول إلى بوابة الأعضاء، بطاقة العضوية الرقمية، دليل الأعمال، والتصويت.",
    desc_en: "Access to member portal, digital ID, family directory, and private events.",
  },
];

export function MemberProfileModal({
  open,
  onOpenChange,
  profile,
  userRoles,
  membershipRequest,
  familyMember,
  onAssignRole,
  onRemoveRole,
  onReviewRequest,
  onNavigateTab,
  initialTab,
}: MemberProfileModalProps) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const confirm = useConfirm();

  const [activeTab, setActiveTab] = useState(initialTab || "overview");
  const [roleToAssign, setRoleToAssign] = useState("editor");
  const [assigning, setAssigning] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    if (initialTab && open) {
      setActiveTab(initialTab);
    }
  }, [initialTab, open, profile?.id]);

  if (!profile) return null;

  const currentRoles = userRoles.filter((r) => r.user_id === profile.id).map((r) => r.role);
  const hasMemberRole = currentRoles.includes("member");
  const hasAdminRole = currentRoles.includes("admin") || currentRoles.includes("super_admin");
  const isMembershipApproved = membershipRequest?.status === "approved" || hasMemberRole;
  const isMembershipPending = membershipRequest?.status === "pending";
  const isMembershipRejected = membershipRequest?.status === "rejected";

  // Build workflow steps
  const workflowSteps: WorkflowStepItem[] = [
    {
      id: "registered",
      label_ar: "تسجيل الحساب",
      label_en: "Account Created",
      description_ar: "تم إنشاء الحساب عبر المنصة",
      description_en: "User registered via portal",
      status: "completed",
    },
    {
      id: "request",
      label_ar: "طلب العضوية",
      label_en: "Membership Request",
      description_ar: membershipRequest
        ? isAr
          ? `حالة الطلب: ${isMembershipApproved ? "معتمد" : isMembershipRejected ? "مرفوض" : "قيد المراجعة"}`
          : `Request: ${membershipRequest.status}`
        : isAr
          ? "لم يُقدّم طلب توثيق بعد"
          : "No request submitted",
      status: isMembershipApproved
        ? "completed"
        : isMembershipPending
          ? "current"
          : isMembershipRejected
            ? "rejected"
            : "upcoming",
    },
    {
      id: "approval",
      label_ar: "اعتماد العضوية",
      label_en: "Lineage Verified",
      description_ar: isMembershipApproved
        ? "تمت مراجعة النسب وتأكيد الانتساب"
        : isMembershipPending
          ? "بانتظار تدقيق الأمانة"
          : "متاح للاعتماد المباشر من الأمانة",
      description_en: isMembershipApproved
        ? "Lineage confirmed"
        : isMembershipPending
          ? "Awaiting review"
          : "Available for direct council approval",
      status: isMembershipApproved
        ? "completed"
        : isMembershipPending
          ? "current"
          : isMembershipRejected
            ? "rejected"
            : "upcoming",
    },
    {
      id: "role",
      label_ar: "إسناد الأدوار والصلاحيات",
      label_en: "Role & Access",
      description_ar:
        currentRoles.length > 0
          ? `${currentRoles.length} أدوار مسندة`
          : "إسناد الأدوار متاح للمشرف",
      description_en:
        currentRoles.length > 0 ? `${currentRoles.length} roles` : "Ready for assignment",
      status: currentRoles.some((r) => r !== "member") ? "completed" : "current",
    },
    {
      id: "active",
      label_ar: "تفعيل الحساب",
      label_en: "Active & Provisioned",
      description_ar: isMembershipApproved
        ? "الخدمات والبطاقة الرقمية مفعّلة"
        : "الحساب غير مفعّل للخدمات الخاصة",
      description_en: isMembershipApproved ? "Digital ID & services active" : "Inactive",
      status: isMembershipApproved ? "completed" : "upcoming",
    },
  ];

  const handleDirectGrantMembership = async () => {
    if (!profile) return;
    const userName =
      profile.full_name_ar ||
      profile.full_name_en ||
      profile.email ||
      (isAr ? "هذا المستخدم" : "this user");
    const ok = await confirm({
      title: isAr
        ? `اعتماد وتوثيق عضوية "${userName}" مباشرة؟`
        : `Grant verified membership to "${userName}"?`,
      description: isAr
        ? "سيحصل المستخدم فورًا على صفة عضو معتمد في أسرة آل بوعبيد والوصول إلى بوابة الأعضاء وبطاقة العضوية الرقمية دون اشتراط تقديم طلب مسبق."
        : "The user will immediately receive verified membership, digital ID, and access to member portals without requiring a prior application.",
    });
    if (!ok) return;

    try {
      setAssigning(true);
      await onAssignRole(profile.id, "member");
      toast.success(
        isAr ? "تم توثيق ومنح العضوية بنجاح" : "Verified membership granted successfully",
      );
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل منح العضوية" : "Failed to grant membership"));
    } finally {
      setAssigning(false);
    }
  };

  const handleQuickApprove = async () => {
    if (!membershipRequest || !onReviewRequest) return;
    try {
      setReviewing(true);
      await onReviewRequest(membershipRequest.id, "approved", "تم الاعتماد وتوثيق العضوية بنجاح");
      toast.success(isAr ? "تم اعتماد العضوية وتفعيل دور العضو الموثق" : "Membership approved");
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل الاعتماد" : "Failed to approve"));
    } finally {
      setReviewing(false);
    }
  };

  const handleAddRole = async () => {
    if (currentRoles.includes(roleToAssign)) {
      toast.info(isAr ? "المستخدم يملك هذا الدور بالفعل" : "User already has this role");
      return;
    }

    const roleDef = ROLE_DEFINITIONS.find((r) => r.role === roleToAssign);
    const ok = await confirm({
      title: isAr
        ? `إسناد دور "${roleDef?.label_ar || roleToAssign}"؟`
        : `Assign "${roleDef?.label_en || roleToAssign}" role?`,
      description: isAr
        ? "سيحصل العضو فوراً على كافة صلاحيات هذا الدور التشغيلي في لوحة التحكم."
        : "The member will gain immediate administrative access tied to this role.",
    });
    if (!ok) return;

    try {
      setAssigning(true);
      await onAssignRole(profile.id, roleToAssign);
      toast.success(isAr ? "تم إسناد الدور بنجاح" : "Role assigned successfully");
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل إسناد الدور" : "Failed to assign role"));
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveRole = async (role: string) => {
    const roleDef = ROLE_DEFINITIONS.find((r) => r.role === role);
    const ok = await confirm({
      title: isAr
        ? `سحب دور "${roleDef?.label_ar || role}"؟`
        : `Revoke "${roleDef?.label_en || role}" role?`,
      description: isAr
        ? "سيفقد العضو فوراً الصلاحيات المرتبطة بهذا الدور."
        : "The member will immediately lose permissions associated with this role.",
      tone: "destructive",
    });
    if (!ok) return;

    try {
      setAssigning(true);
      await onRemoveRole(profile.id, role);
      toast.success(isAr ? "تم سحب الدور" : "Role revoked");
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل سحب الدور" : "Failed to revoke role"));
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-3xl border border-border">
        {/* Header with Member Info */}
        <DialogHeader className="p-6 pb-4 border-b border-border/40 bg-linear-to-b from-card to-muted/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20 shrink-0">
                {profile.full_name_ar ? profile.full_name_ar[0] : <User className="w-6 h-6" />}
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="text-base sm:text-lg font-bold">
                    {profile.full_name_ar || profile.full_name_en || profile.email}
                  </DialogTitle>
                  <Badge
                    variant={
                      isMembershipApproved
                        ? "default"
                        : isMembershipPending
                          ? "secondary"
                          : "outline"
                    }
                    className={cn(
                      "text-[10px] px-2 py-0.5 font-medium",
                      isMembershipApproved && "bg-emerald-600 text-white",
                      isMembershipPending &&
                        "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40",
                    )}
                  >
                    {isMembershipApproved
                      ? isAr
                        ? "عضو موثق ومفعل"
                        : "Verified Member"
                      : isMembershipPending
                        ? isAr
                          ? "طلب العضوية قيد المراجعة"
                          : "Verification Pending"
                        : isAr
                          ? "حساب غير موثق"
                          : "Unverified Account"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {profile.email} {profile.phone ? `• ${profile.phone}` : ""}
                </p>
              </div>
            </div>

            {profile.branch_slug && (
              <Badge
                variant="outline"
                className="text-xs px-2.5 py-1 border-primary/30 text-primary self-start sm:self-auto"
              >
                <GitBranch className="w-3 h-3 me-1" />
                {profile.branch_slug}
              </Badge>
            )}
          </div>

          {/* Workflow Stepper */}
          <div className="pt-3">
            <WorkflowStepper
              steps={workflowSteps}
              onStepClick={(stepId) => {
                if (stepId === "request" || stepId === "approval") setActiveTab("membership");
                if (stepId === "role") setActiveTab("roles");
                if (stepId === "registered" || stepId === "active") setActiveTab("overview");
              }}
            />
          </div>
        </DialogHeader>

        {/* Next Best Action Card */}
        <div className="px-6 pt-3">
          {isMembershipPending ? (
            <NextActionCard
              tone="warning"
              title_ar="مطلوب اتخاذ إجراء: تدقيق طلب العضوية"
              title_en="Action Required: Audit Membership Request"
              description_ar="هذا العضو بانتظار مراجعة طلب العضوية وتأكيد النسب قبل إتاحة إسناد الأدوار أو الخدمات الرقمية."
              description_en="Member is awaiting lineage verification before role assignment or digital ID can be provisioned."
              badge_ar="بانتظار المراجعة"
              badge_en="Pending Audit"
              primaryAction={{
                label_ar: "اعتماد العضوية الآن",
                label_en: "Approve Membership Now",
                onClick: handleQuickApprove,
                loading: reviewing,
              }}
              secondaryAction={{
                label_ar: "عرض تفاصيل الطلب",
                label_en: "View Details",
                onClick: () => setActiveTab("membership"),
              }}
            />
          ) : !isMembershipApproved ? (
            <NextActionCard
              tone="primary"
              title_ar="منح صفة عضو معتمد مباشرة"
              title_en="Grant Direct Membership"
              description_ar="هذا الحساب مسجل في المنظومة. يمكنك منحه صفة عضو معتمد في أسرة آل بوعبيد بضغطة زر دون الحاجة لتقديم طلب توثيق مسبق."
              description_en="User is registered. You can grant verified family membership directly without requiring an application."
              badge_ar="حساب مسجل"
              badge_en="Registered Account"
              primaryAction={{
                label_ar: "منح العضوية المعتمدة الآن",
                label_en: "Grant Verified Membership Now",
                onClick: handleDirectGrantMembership,
                loading: assigning,
              }}
              secondaryAction={{
                label_ar: "إسناد دور إداري",
                label_en: "Assign Role",
                onClick: () => setActiveTab("roles"),
              }}
            />
          ) : isMembershipApproved && currentRoles.filter((r) => r !== "member").length === 0 ? (
            <NextActionCard
              tone="primary"
              title_ar="الخطوة التالية: إسناد دور تشغيلي أو مسؤولية إدارية"
              title_en="Next Step: Assign Operational Role"
              description_ar="تم اعتماد العضوية بنجاح. يمكنك الآن إسناد دور تشغيلي (محرر، أمين صندوق، مدير شجرة، مشرف) لمنح صلاحيات العمل."
              description_en="Membership verified. You can now assign administrative roles to grant console access."
              badge_ar="عضوية معتمدة"
              badge_en="Approved"
              primaryAction={{
                label_ar: "إسناد دور إداري",
                label_en: "Assign Role",
                onClick: () => setActiveTab("roles"),
              }}
            />
          ) : null}
        </div>

        {/* Tabbed Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="overview" className="text-xs gap-1">
                <User className="w-3.5 h-3.5" />
                <span>{isAr ? "نظرة عامة" : "Overview"}</span>
              </TabsTrigger>
              <TabsTrigger value="membership" className="text-xs gap-1">
                <FileCheck className="w-3.5 h-3.5" />
                <span>{isAr ? "طلب العضوية" : "Application"}</span>
              </TabsTrigger>
              <TabsTrigger value="roles" className="text-xs gap-1">
                <Shield className="w-3.5 h-3.5" />
                <span>{isAr ? "الأدوار والصلاحيات" : "Roles & Access"}</span>
              </TabsTrigger>
              <TabsTrigger value="genealogy" className="text-xs gap-1">
                <GitBranch className="w-3.5 h-3.5" />
                <span>{isAr ? "شجرة النسب" : "Genealogy"}</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Overview */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <User className="w-4 h-4 text-primary" />
                    <span>{isAr ? "بيانات الحساب الشخصي" : "Personal Profile"}</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">
                        {isAr ? "الاسم بالعربية" : "Arabic Name"}
                      </span>
                      <span className="font-semibold text-foreground">
                        {profile.full_name_ar || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">
                        {isAr ? "الاسم بالإنجليزية" : "English Name"}
                      </span>
                      <span className="font-semibold text-foreground">
                        {profile.full_name_en || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">
                        {isAr ? "البريد الإلكتروني" : "Email"}
                      </span>
                      <span className="font-mono text-foreground">{profile.email}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">
                        {isAr ? "تاريخ إنشاء الحساب" : "Registered On"}
                      </span>
                      <span className="font-mono text-foreground">
                        {formatDualDate(profile.created_at, isAr ? "ar" : "en", "short")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>{isAr ? "ملخص الصلاحيات والوصول" : "Access Summary"}</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">
                        {isAr ? "حالة العضوية" : "Membership"}
                      </span>
                      <span className="font-bold text-foreground">
                        {isMembershipApproved
                          ? isAr
                            ? "معتمد وموثق"
                            : "Approved"
                          : isMembershipPending
                            ? isAr
                              ? "قيد المراجعة"
                              : "Pending"
                            : isAr
                              ? "غير موثق"
                              : "Unverified"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">
                        {isAr ? "الأدوار النشطة" : "Active Roles"}
                      </span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {currentRoles.map((r) => (
                          <Badge key={r} variant="outline" className="text-[10px] font-mono">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">
                        {isAr ? "الفرع العائلي" : "Family Branch"}
                      </span>
                      <span className="font-semibold text-foreground">
                        {profile.branch_slug || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Membership Request */}
            <TabsContent value="membership" className="space-y-4">
              {membershipRequest ? (
                <div className="p-4 rounded-2xl border border-border bg-card space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-foreground">
                        {isAr ? "تفاصيل طلب التوثيق والانتساب" : "Membership Application Details"}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        {isAr ? "قُدّم الطلب بتاريخ:" : "Submitted on:"}{" "}
                        {formatDualDate(membershipRequest.created_at, isAr ? "ar" : "en", "short")}
                      </p>
                    </div>
                    <Badge
                      variant={
                        membershipRequest.status === "approved"
                          ? "default"
                          : membershipRequest.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                      className={cn(
                        "text-xs px-2.5 py-0.5 font-bold",
                        membershipRequest.status === "approved" && "bg-emerald-600 text-white",
                      )}
                    >
                      {membershipRequest.status === "approved"
                        ? isAr
                          ? "طلب معتمد"
                          : "Approved"
                        : membershipRequest.status === "rejected"
                          ? isAr
                            ? "طلب مرفوض"
                            : "Rejected"
                          : isAr
                            ? "بانتظار مراجعة الأمانة"
                            : "Pending Audit"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-muted/20 p-3 rounded-xl">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">
                        {isAr ? "سلسلة النسب والأجداد" : "Father & Lineage"}
                      </span>
                      <p className="font-semibold text-foreground mt-0.5">
                        {membershipRequest.father_lineage || "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">
                        {isAr ? "الفرع المنتمي له" : "Claimed Branch"}
                      </span>
                      <p className="font-semibold text-foreground mt-0.5">
                        {membershipRequest.branch_slug || "—"}
                      </p>
                    </div>
                    {membershipRequest.notes ? (
                      <div className="md:col-span-2 p-3.5 rounded-xl border border-primary/30 bg-primary/5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-primary font-bold text-xs">
                            <MessageSquare className="w-4 h-4" />
                            <span>
                              {isAr
                                ? "رسالة وملاحظات العضو إلى مجلس الأسرة:"
                                : "Applicant's Message to the Council:"}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-primary/10 text-primary border-primary/30 font-medium"
                          >
                            {isAr ? "رسالة مرفقة مع الطلب" : "Attached Note"}
                          </Badge>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed bg-background/80 p-3 rounded-lg border border-border/60">
                          {membershipRequest.notes}
                        </p>
                      </div>
                    ) : (
                      <div className="md:col-span-2 p-2.5 rounded-lg border border-dashed border-border bg-muted/20 text-muted-foreground text-[11px] flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 opacity-60" />
                        <span>
                          {isAr
                            ? "لم يرفق مقدم الطلب رسالة أو ملاحظات إضافية مع هذا الطلب."
                            : "No additional applicant note provided."}
                        </span>
                      </div>
                    )}

                    {membershipRequest.review_note && (
                      <div className="md:col-span-2 p-2.5 rounded-lg border border-border bg-card">
                        <span className="text-muted-foreground block text-[11px]">
                          {isAr ? "ملاحظة تدقيق الأمانة" : "Reviewer Note"}
                        </span>
                        <p className="text-foreground font-medium mt-0.5">
                          {membershipRequest.review_note}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Guidance when Approved: 1-click jump to Roles */}
                  {membershipRequest.status === "approved" && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-bold">
                            {isAr
                              ? "العضوية معتمدة وموثقة رسمياً في الأسرة"
                              : "Membership Officially Verified"}
                          </p>
                          <p className="text-[11px] opacity-90">
                            {isAr
                              ? "تم قيد العضو في السجل. يمكنك الآن إسناد المهام والصلاحيات الإدارية له من تبويب الصلاحيات."
                              : "Member is registered. You can now assign administrative roles."}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveTab("roles")}
                        className="h-8 text-xs font-bold border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15 shrink-0 gap-1.5"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>{isAr ? "الانتقال لإسناد الصلاحيات ➔" : "Assign Roles ➔"}</span>
                      </Button>
                    </div>
                  )}

                  {membershipRequest.status === "pending" && onReviewRequest && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                      <Button
                        size="sm"
                        disabled={reviewing}
                        onClick={handleQuickApprove}
                        className="h-8 text-xs font-bold gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isAr ? "اعتماد الطلب وتوثيق العضوية" : "Approve Membership"}</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={reviewing}
                        onClick={async () => {
                          const note = window.prompt(
                            isAr
                              ? "سبب رفض الطلب أو الملاحظات المطلوبة:"
                              : "Rejection reason / requested note:",
                          );
                          if (note === null) return;
                          try {
                            setReviewing(true);
                            await onReviewRequest(
                              membershipRequest.id,
                              "rejected",
                              note || "طلب غير مكتمل",
                            );
                            toast.success(isAr ? "تم تحديث حالة الطلب" : "Request status updated");
                          } catch (e: any) {
                            toast.error(e.message || "فشل التحديث");
                          } finally {
                            setReviewing(false);
                          }
                        }}
                        className="h-8 text-xs text-destructive hover:bg-destructive/10 border-destructive/30 rounded-xl"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>
                          {isAr ? "رفض الطلب أو طلب استكمال بيانات" : "Reject / Request Info"}
                        </span>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center border border-border rounded-2xl bg-card space-y-3">
                  <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-xs font-bold text-foreground">
                    {isAr
                      ? "لم يقم هذا المستخدم بتقديم طلب عضوية بعد"
                      : "No membership request on record"}
                  </p>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    {isAr
                      ? "يمكن للأمانة منحه صفة عضو معتمد وتفعيل بطاقته وخدماته مباشرة دون اشتراط تقديم طلب مسبق."
                      : "The council can grant verified membership and activate digital services directly without requiring a prior application."}
                  </p>
                  {!isMembershipApproved && (
                    <div className="pt-2">
                      <Button
                        size="sm"
                        disabled={assigning}
                        onClick={handleDirectGrantMembership}
                        className="h-8 text-xs font-bold gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          {isAr
                            ? "منح صفة عضو معتمد مباشرة الآن"
                            : "Grant Verified Membership Directly"}
                        </span>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Tab 3: Roles & Permissions */}
            <TabsContent value="roles" className="space-y-4">
              {!isMembershipApproved && (
                <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {isAr
                        ? "هذا الحساب لم يتم توثيق عضويته بعد. يمكنك إسناد دور 'عضو معتمد' أو أي دور إداري مباشرة."
                        : "This account is unverified. You can assign 'Verified Member' or any administrative role directly."}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    disabled={assigning}
                    onClick={handleDirectGrantMembership}
                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 gap-1 font-medium rounded-lg"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAr ? "منح العضوية" : "Make Member"}</span>
                  </Button>
                </div>
              )}

              {/* Current Roles List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground">
                  {isAr ? "الأدوار المسندة الحالية" : "Currently Assigned Roles"}
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {currentRoles.map((role) => {
                    const def = ROLE_DEFINITIONS.find((r) => r.role === role);
                    const isProtectedMember = role === "member";

                    return (
                      <div
                        key={role}
                        className="flex items-center justify-between p-3 rounded-xl border border-border bg-card text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">
                              {isAr ? def?.label_ar || role : def?.label_en || role}
                            </span>
                            <Badge variant="outline" className="text-[9px] font-mono">
                              {role}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {isAr ? def?.desc_ar : def?.desc_en}
                          </p>
                        </div>

                        {!isProtectedMember && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={assigning}
                            onClick={() => handleRemoveRole(role)}
                            className="h-7 px-2 text-destructive hover:bg-destructive/10 rounded-lg text-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5 me-1" />
                            <span>{isAr ? "سحب" : "Revoke"}</span>
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Role Form */}
              <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-3">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-primary" />
                  <span>{isAr ? "إسناد دور وصلاحيات جديدة" : "Assign New Role"}</span>
                </h4>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <select
                    value={roleToAssign}
                    onChange={(e) => setRoleToAssign(e.target.value)}
                    className="h-8.5 text-xs rounded-xl border border-border bg-background px-3 flex-1"
                  >
                    {ROLE_DEFINITIONS.filter((r) => !currentRoles.includes(r.role)).map((r) => (
                      <option key={r.role} value={r.role}>
                        {isAr ? r.label_ar : r.label_en} ({r.role})
                      </option>
                    ))}
                  </select>

                  <Button
                    size="sm"
                    disabled={assigning}
                    onClick={handleAddRole}
                    className="h-8.5 text-xs font-bold gap-1.5 rounded-xl bg-primary text-primary-foreground shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? "إسناد الدور" : "Assign"}</span>
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Tab 4: Genealogy Link */}
            <TabsContent value="genealogy" className="space-y-4">
              <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <GitBranch className="w-4 h-4 text-primary" />
                    <span>
                      {isAr ? "الربط مع شجرة العائلة وسجل الأنساب" : "Genealogy Tree Link"}
                    </span>
                  </h4>
                </div>

                {familyMember ? (
                  <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-foreground">
                        {familyMember.first_name_ar} {familyMember.last_name_ar}
                      </span>
                      {familyMember.branch_slug && (
                        <Badge variant="outline" className="text-[10px]">
                          {familyMember.branch_slug}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {isAr
                        ? "هذا الحساب مرتبط بسجل موثق في شجرة العائلة."
                        : "Account linked to genealogy record."}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-border bg-muted/20 text-xs text-center space-y-2">
                    <p className="text-muted-foreground">
                      {isAr
                        ? "هذا الحساب غير مرتبط بعد بفرد محدد في شجرة العائلة التفاعلية."
                        : "Account is not yet linked to an individual node in the family tree."}
                    </p>
                    {onNavigateTab && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onOpenChange(false);
                          onNavigateTab("family", "members");
                        }}
                        className="h-7 text-xs rounded-lg gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{isAr ? "فتح سجل شجرة العائلة للربط" : "Open Family Directory"}</span>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="p-4 border-t border-border/40 bg-muted/20 flex flex-row items-center justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs rounded-xl"
          >
            {isAr ? "إغلاق" : "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
