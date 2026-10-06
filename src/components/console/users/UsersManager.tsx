import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import {
  Shield,
  ShieldAlert,
  User,
  Plus,
  X,
  Lock,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  FileCheck,
  Eye,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/useConfirm";
import { useAuth } from "@/hooks/useAuth";
import { MemberProfileModal } from "./MemberProfileModal";

export type ProfileRow = {
  id: string;
  email?: string | null;
  full_name_ar?: string | null;
  full_name_en?: string | null;
  display_name?: string | null;
  status?: string | null;
  timezone?: string | null;
  created_at: string;
};

export type UserRoleRow = {
  id: string;
  user_id: string;
  role: string;
};

export function UsersManager({
  profiles,
  userRoles,
  membershipRequests = [],
  familyMembers = [],
  onAssignRole,
  onRemoveRole,
  onReviewRequest,
  onNavigateTab,
}: {
  profiles: ProfileRow[];
  userRoles: UserRoleRow[];
  membershipRequests?: any[];
  familyMembers?: any[];
  onAssignRole: (userId: string, role: string) => Promise<void>;
  onRemoveRole: (userId: string, role: string) => Promise<void>;
  onReviewRequest?: (
    requestId: string,
    status: "approved" | "rejected",
    note?: string,
  ) => Promise<void>;
  onNavigateTab?: (domainId: string, tabId: string) => void;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const confirm = useConfirm();
  const { user: currentUser } = useAuth();

  const [roleModalUser, setRoleModalUser] = useState<ProfileRow | null>(null);
  const [profileModalUser, setProfileModalUser] = useState<ProfileRow | null>(null);
  const [selectedRoleToAdd, setSelectedRoleToAdd] = useState<string>("editor");
  const [loading, setLoading] = useState(false);

  const getMembershipRequest = (userId: string) => {
    return membershipRequests.find((r) => r.user_id === userId);
  };

  const isApprovedMember = (userId: string) => {
    const roles = userRoles.filter((r) => r.user_id === userId).map((r) => r.role);
    if (roles.includes("member") || roles.includes("admin") || roles.includes("super_admin"))
      return true;
    const req = getMembershipRequest(userId);
    return req?.status === "approved";
  };

  /** Roles whose removal can permanently lock the council out of this console.
   *  `removeUserRole` on the server happily deletes any row it is asked to,
   *  and `super_admin` can only ever be re-granted BY a super_admin -- so the
   *  last one revoking their own would be unrecoverable without direct DB
   *  access. These two guards are enforced here before the call is made. */
  const PRIVILEGED_ROLES = ["admin", "super_admin"];

  const superAdminCount = useMemo(
    () => userRoles.filter((r) => r.role === "super_admin").length,
    [userRoles],
  );

  /** Returns a bilingual reason string when this role removal must be blocked,
   *  or null when it is safe to proceed. */
  const getRemovalBlockReason = (userId: string, role: string): string | null => {
    const isSelf = !!currentUser && currentUser.id === userId;
    if (isSelf && PRIVILEGED_ROLES.includes(role)) {
      return isAr
        ? "لا يمكنك سحب صلاحياتك الإدارية من حسابك أنت. اطلب من مشرف آخر تنفيذ ذلك."
        : "You can't revoke your own administrative role. Ask another administrator to do it.";
    }
    if (role === "super_admin" && superAdminCount <= 1) {
      return isAr
        ? "هذا هو المدير الأعلى الوحيد في المنظومة. أسند الدور لحساب آخر أولًا قبل سحبه."
        : "This is the only Super Admin left. Assign the role to another account before revoking it.";
    }
    return null;
  };

  const ALL_ROLES = [
    { role: "super_admin", label_ar: "مدير أعلى (Super Admin)", label_en: "Super Admin" },
    { role: "admin", label_ar: "مشرف أمانة المجلس (Admin)", label_en: "Admin" },
    { role: "family_manager", label_ar: "مدير شجرة وأنساب الأسرة", label_en: "Family Manager" },
    {
      role: "content_manager",
      label_ar: "مدير المحتوى والمركز الإعلامي",
      label_en: "Content Manager",
    },
    { role: "editor", label_ar: "محرر محتوى", label_en: "Editor" },
    { role: "member", label_ar: "عضو موثق في الأسرة", label_en: "Verified Member" },
    { role: "viewer", label_ar: "مشاهد فقط", label_en: "Viewer" },
  ];

  const getUserDisplayName = (user: ProfileRow) =>
    user.full_name_ar || user.full_name_en || user.email || (isAr ? "هذا المستخدم" : "this user");

  const getRoleLabel = (role: string) => {
    const def = ALL_ROLES.find((r) => r.role === role);
    return def ? (isAr ? def.label_ar : def.label_en) : role;
  };

  const handleMakeMember = async (user: ProfileRow) => {
    const userName = getUserDisplayName(user);
    const ok = await confirm({
      title: isAr
        ? `اعتماد وتوثيق عضوية "${userName}" مباشرة؟`
        : `Grant verified membership to "${userName}"?`,
      description: isAr
        ? "سيحصل المستخدم فورًا على صفة عضو معتمد في أسرة آل بوعبيد والوصول إلى بوابة الأعضاء وبطاقة العضوية الرقمية دون اشتراط تقديم طلب مسبق."
        : "The user will immediately gain verified membership and access to the members portal and digital ID without requiring an application.",
    });
    if (!ok) return;
    try {
      setLoading(true);
      await onAssignRole(user.id, "member");
      toast.success(
        isAr ? "تم توثيق ومنح العضوية بنجاح" : "Verified membership granted successfully",
      );
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل منح العضوية" : "Failed to grant membership"));
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (!roleModalUser || !selectedRoleToAdd) return;

    const userName = getUserDisplayName(roleModalUser);
    const roleLabel = getRoleLabel(selectedRoleToAdd);
    // The server insert swallows a duplicate-key (23505) as a no-op success, so
    // re-assigning an existing role would report "assigned" while changing
    // nothing. Say so plainly instead.
    if (getUserRoles(roleModalUser.id).includes(selectedRoleToAdd)) {
      toast.info(
        isAr
          ? `${userName} يملك دور "${roleLabel}" بالفعل.`
          : `${userName} already has the "${roleLabel}" role.`,
      );
      return;
    }
    const ok = await confirm({
      title: isAr
        ? `إسناد دور "${roleLabel}" إلى ${userName}؟`
        : `Assign the "${roleLabel}" role to ${userName}?`,
      description: isAr
        ? "سيحصل المستخدم فورًا على جميع صلاحيات هذا الدور."
        : "The user will immediately gain all permissions granted by this role.",
    });
    if (!ok) return;
    try {
      setLoading(true);
      await onAssignRole(roleModalUser.id, selectedRoleToAdd);
      toast.success(isAr ? "تم إسناد الصلاحية بنجاح" : "Role assigned successfully");
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل إسناد الصلاحية" : "Failed to assign role"));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (userId: string, role: string, userName: string) => {
    const roleLabel = getRoleLabel(role);
    const blockReason = getRemovalBlockReason(userId, role);
    if (blockReason) {
      toast.error(blockReason);
      return;
    }
    const ok = await confirm({
      title: isAr
        ? `إزالة دور "${roleLabel}" من ${userName}؟`
        : `Remove the "${roleLabel}" role from ${userName}?`,
      description: isAr
        ? "سيفقد المستخدم فورًا كافة الصلاحيات المرتبطة بهذا الدور. يمكن إعادة إسناده لاحقًا إذا لزم الأمر."
        : "The user will immediately lose all permissions tied to this role. It can be reassigned again later if needed.",
      tone: "destructive",
    });
    if (!ok) return;
    try {
      setLoading(true);
      await onRemoveRole(userId, role);
      toast.success(isAr ? "تمت إزالة الصلاحية" : "Role removed");
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل إزالة الصلاحية" : "Failed to remove role"));
    } finally {
      setLoading(false);
    }
  };

  const getUserRoles = (userId: string) => {
    return userRoles.filter((r) => r.user_id === userId).map((r) => r.role);
  };

  const getUserStatusBadge = (status?: string | null) => {
    switch (status || "ACTIVE") {
      case "DISABLED":
        return (
          <Badge variant="destructive" className="text-[10px]">
            {isAr ? "معطل" : "Disabled"}
          </Badge>
        );
      case "SUSPENDED":
        return (
          <Badge
            variant="outline"
            className="text-[10px] border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
          >
            {isAr ? "موقوف مؤقتًا" : "Suspended"}
          </Badge>
        );
      case "INVITED":
        return (
          <Badge
            variant="outline"
            className="text-[10px] border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-400"
          >
            {isAr ? "بانتظار التفعيل" : "Invited"}
          </Badge>
        );
      case "ACTIVE":
      default:
        return (
          <Badge variant="secondary" className="text-[10px]">
            {isAr ? "نشط" : "Active"}
          </Badge>
        );
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "no_request" | "council"
  >("all");
  const [profileModalInitialTab, setProfileModalInitialTab] = useState<string>("overview");
  const [showAdminGuide, setShowAdminGuide] = useState<boolean>(true);

  const statusCounts = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let noRequest = 0;
    let council = 0;

    for (const p of profiles) {
      const req = getMembershipRequest(p.id);
      const isAppr = isApprovedMember(p.id);
      if (req?.status === "pending") {
        pending++;
      } else if (isAppr) {
        approved++;
      } else if (!req) {
        noRequest++;
      }

      const roles = userRoles.filter((r) => r.user_id === p.id).map((r) => r.role);
      if (roles.some((r) => r !== "member" && r !== "viewer")) {
        council++;
      }
    }

    return {
      all: profiles.length,
      pending,
      approved,
      noRequest,
      council,
    };
  }, [profiles, membershipRequests, userRoles]);

  const filteredProfiles = useMemo(() => {
    return profiles.filter((user) => {
      const q = searchQuery.toLowerCase().trim();
      const nameAr = (user.full_name_ar || "").toLowerCase();
      const nameEn = (user.full_name_en || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      const matchesSearch = !q || nameAr.includes(q) || nameEn.includes(q) || email.includes(q);

      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter === "pending") {
        const req = getMembershipRequest(user.id);
        if (req?.status !== "pending") return false;
      } else if (statusFilter === "approved") {
        if (!isApprovedMember(user.id)) return false;
      } else if (statusFilter === "no_request") {
        if (getMembershipRequest(user.id) || isApprovedMember(user.id)) return false;
      } else if (statusFilter === "council") {
        const roles = userRoles.filter((r) => r.user_id === user.id).map((r) => r.role);
        if (!roles.some((r) => r !== "member" && r !== "viewer")) return false;
      }

      if (roleFilter === "all") return true;

      const roles = userRoles.filter((r) => r.user_id === user.id).map((r) => r.role);
      return roles.includes(roleFilter);
    });
  }, [profiles, userRoles, membershipRequests, searchQuery, roleFilter, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {isAr ? "إدارة المستخدمين وتوثيق العضوية" : "User Accounts & Verification Management"}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {isAr
                ? "مراجعة طلبات التوثيق والانضمام، وإدارة الحسابات المسجلة، وإسناد الصلاحيات الإدارية"
                : "Review verification applications, manage registered accounts, and assign administrative roles"}
            </p>
          </div>
        </div>

        {/* Search & Role Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? "بحث بالاسم أو البريد..." : "Search by name or email..."}
            className="h-8 px-3 rounded-lg border border-border bg-background text-xs text-foreground outline-none focus:border-primary w-44 sm:w-56"
          />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-8 text-xs w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isAr ? "جميع الصلاحيات" : "All Roles"}</SelectItem>
              {ALL_ROLES.map((r) => (
                <SelectItem key={r.role} value={r.role}>
                  {isAr ? r.label_ar : r.label_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Non-Technical Admin Quick Assistant / Council Guide */}
      <div className="bg-card border border-primary/20 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-xs">
            <Sparkles className="w-4 h-4 text-gold shrink-0" />
            <span>
              {isAr
                ? "دليل أمانة المجلس السريع: إدارة وتوثيق أفراد الأسرة"
                : "Council Quick Guide: Verification & Roles"}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 text-[11px] text-muted-foreground hover:text-foreground px-2"
            onClick={() => setShowAdminGuide(!showAdminGuide)}
          >
            {showAdminGuide ? (
              <span className="flex items-center gap-1">
                {isAr ? "إخفاء الدليل" : "Hide"}
                <ChevronUp className="w-3 h-3" />
              </span>
            ) : (
              <span className="flex items-center gap-1">
                {isAr ? "عرض الدليل" : "Show"}
                <ChevronDown className="w-3 h-3" />
              </span>
            )}
          </Button>
        </div>

        {showAdminGuide && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-3 border-t border-border/60">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{isAr ? "1. طلبات قيد المراجعة" : "1. Pending Applications"}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {isAr
                  ? "أفراد سجلوا بالموقع ورفعوا بياناتهم ورسالتهم للمجلس. اضغط 'مراجعة الطلب والرسالة' لقراءتها واعتمادهم بضغطة زر."
                  : "Applicants submitted their lineage and personal note. Click 'Review Request' to inspect and approve in one click."}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isAr ? "2. أعضاء معتمدون في الأسرة" : "2. Verified Members"}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {isAr
                  ? "تم توثيق انتسابهم رسمياً وشجرتهم وبطاقتهم الرقمية. يمكنك الآن إسناد مهام إدارية لهم (الخزينة، التحرير، الأنساب)."
                  : "Officially documented in the family register. You can now assign operational roles to grant access."}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-muted/40 border border-border space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{isAr ? "3. حسابات مسجلة (بدون طلب)" : "3. Registered Accounts"}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {isAr
                  ? "حسابات مسجلة عبر الموقع ولم ترفع طلب توثيق بعد. يمكن للمشرف اعتمادهم كأعضاء موثقين أو إسناد الصلاحيات لهم مباشرة دون اشتراط تقديم طلب مسبق."
                  : "Registered users who haven't submitted an application. Admins can grant them verified membership or assign roles directly without a prior request."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Smart Status Filter Bar with Live Counters */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-muted/40 rounded-xl border border-border">
        <Button
          type="button"
          variant={statusFilter === "all" ? "default" : "ghost"}
          size="sm"
          className={cn(
            "h-8 text-xs font-medium rounded-lg gap-1.5",
            statusFilter === "all" && "shadow-sm",
          )}
          onClick={() => setStatusFilter("all")}
        >
          <span>{isAr ? "جميع الحسابات" : "All Accounts"}</span>
          <Badge variant="secondary" className="text-[10px] h-4 px-1 rounded-md">
            {statusCounts.all}
          </Badge>
        </Button>

        <Button
          type="button"
          variant={statusFilter === "pending" ? "default" : "ghost"}
          size="sm"
          className={cn(
            "h-8 text-xs font-medium rounded-lg gap-1.5",
            statusFilter === "pending" && "bg-amber-600 hover:bg-amber-700 text-white shadow-sm",
            statusFilter !== "pending" &&
              statusCounts.pending > 0 &&
              "text-amber-700 dark:text-amber-400 font-bold",
          )}
          onClick={() => setStatusFilter("pending")}
        >
          <Clock className={cn("w-3.5 h-3.5", statusCounts.pending > 0 && "animate-pulse")} />
          <span>{isAr ? "بانتظار المراجعة والاعتماد" : "Pending Review"}</span>
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px] h-4 px-1 rounded-md",
              statusCounts.pending > 0 && "bg-amber-500 text-white font-bold",
            )}
          >
            {statusCounts.pending}
          </Badge>
        </Button>

        <Button
          type="button"
          variant={statusFilter === "approved" ? "default" : "ghost"}
          size="sm"
          className={cn(
            "h-8 text-xs font-medium rounded-lg gap-1.5",
            statusFilter === "approved" &&
              "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm",
          )}
          onClick={() => setStatusFilter("approved")}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isAr ? "أعضاء الأسرة المعتمدون" : "Verified Members"}</span>
          <Badge variant="secondary" className="text-[10px] h-4 px-1 rounded-md">
            {statusCounts.approved}
          </Badge>
        </Button>

        <Button
          type="button"
          variant={statusFilter === "council" ? "default" : "ghost"}
          size="sm"
          className={cn(
            "h-8 text-xs font-medium rounded-lg gap-1.5",
            statusFilter === "council" && "shadow-sm",
          )}
          onClick={() => setStatusFilter("council")}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>{isAr ? "أعضاء المجلس والمشرفين" : "Council & Admins"}</span>
          <Badge variant="secondary" className="text-[10px] h-4 px-1 rounded-md">
            {statusCounts.council}
          </Badge>
        </Button>

        <Button
          type="button"
          variant={statusFilter === "no_request" ? "default" : "ghost"}
          size="sm"
          className={cn(
            "h-8 text-xs font-medium rounded-lg gap-1.5",
            statusFilter === "no_request" && "shadow-sm",
          )}
          onClick={() => setStatusFilter("no_request")}
        >
          <User className="w-3.5 h-3.5" />
          <span>{isAr ? "مسجلون بدون طلب" : "No Request"}</span>
          <Badge variant="secondary" className="text-[10px] h-4 px-1 rounded-md">
            {statusCounts.noRequest}
          </Badge>
        </Button>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs">
              <TableHead>{isAr ? "المستخدم" : "User"}</TableHead>
              <TableHead>{isAr ? "البريد الإلكتروني" : "Email"}</TableHead>
              <TableHead className="text-center">
                {isAr ? "حالة العضوية والطلب" : "Membership Status"}
              </TableHead>
              <TableHead>{isAr ? "الصلاحيات والمهام الإدارية" : "Assigned Roles"}</TableHead>
              <TableHead className="text-center">{isAr ? "حالة الحساب" : "Account"}</TableHead>
              <TableHead className="text-end">
                {isAr ? "إجراءات أمانة المجلس" : "Council Actions"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProfiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">
                  {isAr
                    ? "لا يوجد مستخدمون مطابقون لمعايير البحث والتصنيف"
                    : "No users matched the search and filter criteria"}
                </TableCell>
              </TableRow>
            ) : (
              filteredProfiles.map((user) => {
                const roles = getUserRoles(user.id);
                const req = getMembershipRequest(user.id);
                const approved = isApprovedMember(user.id);
                const isPending = req?.status === "pending";

                return (
                  <TableRow key={user.id} className="text-xs hover:bg-muted/30">
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileModalInitialTab(isPending ? "membership" : "overview");
                          setProfileModalUser(user);
                        }}
                        className="flex items-center gap-2.5 text-start group cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors block">
                              {user.full_name_ar ||
                                user.full_name_en ||
                                (isAr ? "مستخدم جديد" : "New User")}
                            </span>
                            {req?.branch_slug && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                                {req.branch_slug}
                              </span>
                            )}
                          </div>
                          {user.display_name && (
                            <span className="text-[10px] text-muted-foreground block font-mono">
                              @{user.display_name}
                            </span>
                          )}
                        </div>
                      </button>
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {user.email || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      {approved ? (
                        <Badge
                          variant="default"
                          className="text-[10px] bg-emerald-600 text-white gap-1 font-medium"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isAr ? "عضو معتمد وموثق" : "Verified Member"}</span>
                        </Badge>
                      ) : isPending ? (
                        <div className="flex flex-col items-center gap-1">
                          <Badge
                            variant="outline"
                            className="text-[10px] border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400 gap-1 font-bold"
                          >
                            <Clock className="w-3 h-3 animate-pulse text-amber-600" />
                            <span>{isAr ? "طلب قيد المراجعة" : "Pending Review"}</span>
                          </Badge>
                          {req?.notes && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded-md">
                              <MessageSquare className="w-2.5 h-2.5" />
                              <span>{isAr ? "رسالة مرفقة" : "Has note"}</span>
                            </span>
                          )}
                        </div>
                      ) : req?.status === "rejected" ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] border-destructive/40 text-destructive font-normal"
                        >
                          {isAr ? "طلب غير معتمد" : "Rejected"}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-muted-foreground font-normal"
                        >
                          {isAr ? "مسجل فقط (بدون طلب)" : "No request"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {roles.length === 0 ? (
                          <span className="text-[11px] text-muted-foreground">
                            {isAr ? "مستخدم عام (بدون أدوار)" : "No roles"}
                          </span>
                        ) : (
                          roles.map((r) => (
                            <Badge
                              key={r}
                              variant="outline"
                              className={cn(
                                "text-[10px] font-medium border-border",
                                r === "super_admin" &&
                                  "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400 font-bold",
                                r === "admin" &&
                                  "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold",
                                r === "treasurer" &&
                                  "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                                r === "family_manager" &&
                                  "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-400",
                                r === "content_manager" &&
                                  "border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-400",
                                r === "editor" &&
                                  "border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
                                r === "member" && "border-stone-500/30 text-muted-foreground",
                              )}
                            >
                              {getRoleLabel(r)}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{getUserStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        {!approved && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 font-medium"
                            onClick={() => handleMakeMember(user)}
                            title={
                              isAr
                                ? "اعتماد وتوثيق العضوية مباشرة دون انتظار تقديم طلب"
                                : "Grant verified membership directly without waiting for an application"
                            }
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{isAr ? "منح العضوية" : "Make Member"}</span>
                          </Button>
                        )}

                        {isPending ? (
                          <Button
                            size="sm"
                            className="h-7 text-xs font-bold gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                            onClick={() => {
                              setProfileModalInitialTab("membership");
                              setProfileModalUser(user);
                            }}
                            title={
                              isAr
                                ? "الاطلاع على بيانات العضو ورسالته واعتماده"
                                : "Review application and message"
                            }
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{isAr ? "مراجعة الطلب" : "Review"}</span>
                          </Button>
                        ) : approved ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                            onClick={() => {
                              setProfileModalInitialTab("overview");
                              setProfileModalUser(user);
                            }}
                            title={isAr ? "فتح ملف العضو الشامل" : "Open 360° Profile"}
                          >
                            <User className="w-3 h-3" />
                            <span>{isAr ? "ملف العضو" : "Profile"}</span>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1 text-muted-foreground hover:bg-muted"
                            onClick={() => {
                              setProfileModalInitialTab("overview");
                              setProfileModalUser(user);
                            }}
                            title={isAr ? "عرض تفاصيل الحساب" : "Account details"}
                          >
                            <User className="w-3 h-3" />
                            <span>{isAr ? "التفاصيل" : "Details"}</span>
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1 text-foreground hover:bg-muted"
                          onClick={() => setRoleModalUser(user)}
                          title={isAr ? "إدارة الصلاحيات والأدوار" : "Manage Roles"}
                        >
                          <Shield className="w-3 h-3 text-primary" />
                          <span>{isAr ? "الصلاحيات" : "Roles"}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Role Management Dialog */}
      {roleModalUser && (
        <Dialog open={!!roleModalUser} onOpenChange={() => setRoleModalUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">
                {isAr
                  ? `إدارة صلاحيات: ${roleModalUser.full_name_ar || roleModalUser.email}`
                  : `Manage Roles for: ${getUserDisplayName(roleModalUser)}`}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {isAr
                  ? "تسري التغييرات فورًا. يتم تسجيل كل إسناد أو سحب في سجل الرقابة."
                  : "Changes take effect immediately. Every grant and revoke is written to the audit log."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <p className="font-semibold text-foreground">
                  {isAr ? "الأدوار الحالية:" : "Current Roles:"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {getUserRoles(roleModalUser.id).length === 0 ? (
                    <span className="text-[11px] text-muted-foreground">
                      {isAr ? "لا توجد أدوار" : "No roles"}
                    </span>
                  ) : (
                    getUserRoles(roleModalUser.id).map((role) => {
                      const blockReason = getRemovalBlockReason(roleModalUser.id, role);
                      return (
                        <span
                          key={role}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted border border-border text-xs font-mono"
                        >
                          {role}
                          <button
                            type="button"
                            disabled={loading || !!blockReason}
                            aria-label={
                              isAr
                                ? `إزالة دور ${getRoleLabel(role)}`
                                : `Remove the ${getRoleLabel(role)} role`
                            }
                            title={
                              blockReason ??
                              (isAr
                                ? `إزالة دور ${getRoleLabel(role)}`
                                : `Remove the ${getRoleLabel(role)} role`)
                            }
                            onClick={() =>
                              handleRemoveRole(
                                roleModalUser.id,
                                role,
                                getUserDisplayName(roleModalUser),
                              )
                            }
                            className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })
                  )}
                </div>
                {getUserRoles(roleModalUser.id).some(
                  (role) => !!getRemovalBlockReason(roleModalUser.id, role),
                ) && (
                  <p className="flex items-start gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-px" />
                    <span>
                      {isAr
                        ? "بعض الأدوار محمية من السحب لتفادي فقدان الوصول الإداري للمنظومة."
                        : "Some roles are protected from removal to prevent locking the council out of the console."}
                    </span>
                  </p>
                )}
              </div>

              {!isApprovedMember(roleModalUser.id) && (
                <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {isAr
                        ? "يمكنك منح هذا المستخدم صفة عضو معتمد وتفعيل بطاقته مباشرة دون اشتراط تقديم طلب مسبق."
                        : "You can grant verified membership directly without requiring a prior application."}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 gap-1 font-medium rounded-lg"
                    onClick={() => {
                      const target = roleModalUser;
                      setRoleModalUser(null);
                      handleMakeMember(target);
                    }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAr ? "منح العضوية الآن" : "Make Member Now"}</span>
                  </Button>
                </div>
              )}

              <div className="space-y-2 pt-3 border-t border-border">
                <p className="font-semibold text-foreground">
                  {isAr ? "إسناد دور جديد:" : "Assign New Role:"}
                </p>
                <div className="flex gap-2">
                  <Select value={selectedRoleToAdd} onValueChange={setSelectedRoleToAdd}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_ROLES.map((r) => {
                        const alreadyHas = getUserRoles(roleModalUser.id).includes(r.role);
                        return (
                          <SelectItem key={r.role} value={r.role} disabled={alreadyHas}>
                            {isAr ? r.label_ar : r.label_en}
                            {alreadyHas && (
                              <span className="ms-1.5 text-[10px] text-muted-foreground">
                                {isAr ? "(مسند بالفعل)" : "(already assigned)"}
                              </span>
                            )}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    className="h-8 text-xs gap-1"
                    disabled={loading}
                    onClick={handleAddRole}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {loading
                      ? isAr
                        ? "جاري الإسناد..."
                        : "Assigning..."
                      : isAr
                        ? "إسناد"
                        : "Assign"}
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRoleModalUser(null)}
              >
                {isAr ? "إغلاق" : "Close"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 360° Unified Member Profile Workspace */}
      {profileModalUser && (
        <MemberProfileModal
          open={!!profileModalUser}
          onOpenChange={(isOpen) => {
            if (!isOpen) setProfileModalUser(null);
          }}
          initialTab={profileModalInitialTab}
          profile={profileModalUser}
          userRoles={userRoles}
          membershipRequest={getMembershipRequest(profileModalUser.id)}
          familyMember={familyMembers.find(
            (f: any) =>
              f.user_id === profileModalUser.id ||
              f.id === getMembershipRequest(profileModalUser.id)?.family_member_id,
          )}
          onAssignRole={onAssignRole}
          onRemoveRole={onRemoveRole}
          onReviewRequest={onReviewRequest}
          onNavigateTab={onNavigateTab}
        />
      )}
    </div>
  );
}
