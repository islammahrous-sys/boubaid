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
import { Shield, ShieldAlert, User, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/useConfirm";
import { useAuth } from "@/hooks/useAuth";

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
  onAssignRole,
  onRemoveRole,
}: {
  profiles: ProfileRow[];
  userRoles: UserRoleRow[];
  onAssignRole: (userId: string, role: string) => Promise<void>;
  onRemoveRole: (userId: string, role: string) => Promise<void>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const confirm = useConfirm();
  const { user: currentUser } = useAuth();

  const [roleModalUser, setRoleModalUser] = useState<ProfileRow | null>(null);
  const [selectedRoleToAdd, setSelectedRoleToAdd] = useState<string>("editor");
  const [loading, setLoading] = useState(false);

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
    { role: "treasurer", label_ar: "أمين الصندوق والمالية", label_en: "Treasurer" },
    { role: "member", label_ar: "عضو موثق في الأسرة", label_en: "Verified Member" },
    { role: "viewer", label_ar: "مشاهد فقط", label_en: "Viewer" },
  ];

  const getUserDisplayName = (user: ProfileRow) =>
    user.full_name_ar || user.full_name_en || user.email || (isAr ? "هذا المستخدم" : "this user");

  const getRoleLabel = (role: string) => {
    const def = ALL_ROLES.find((r) => r.role === role);
    return def ? (isAr ? def.label_ar : def.label_en) : role;
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

  const filteredProfiles = useMemo(() => {
    return profiles.filter((user) => {
      const q = searchQuery.toLowerCase().trim();
      const nameAr = (user.full_name_ar || "").toLowerCase();
      const nameEn = (user.full_name_en || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      const matchesSearch = !q || nameAr.includes(q) || nameEn.includes(q) || email.includes(q);

      if (!matchesSearch) return false;
      if (roleFilter === "all") return true;

      const roles = userRoles.filter((r) => r.user_id === user.id).map((r) => r.role);
      return roles.includes(roleFilter);
    });
  }, [profiles, userRoles, searchQuery, roleFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {isAr ? "إدارة المستخدمين وصلاحيات الوصول (RBAC)" : "User Management & RBAC Roles"}
            </h3>
            <span className="text-[11px] text-muted-foreground font-mono">
              {filteredProfiles.length} {isAr ? "مستخدم مسجل" : "registered users"}
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
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

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs">
              <TableHead>{isAr ? "المستخدم" : "User"}</TableHead>
              <TableHead>{isAr ? "البريد الإلكتروني" : "Email"}</TableHead>
              <TableHead>{isAr ? "الصلاحيات والأدوار المسندة" : "Assigned Roles"}</TableHead>
              <TableHead className="text-center">{isAr ? "الحالة" : "Status"}</TableHead>
              <TableHead className="text-end">{isAr ? "إجراء" : "Action"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProfiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-xs text-muted-foreground">
                  {isAr
                    ? "لا يوجد مستخدمون مطابقون لمعايير البحث"
                    : "No users matched the search criteria"}
                </TableCell>
              </TableRow>
            ) : (
              filteredProfiles.map((user) => {
                const roles = getUserRoles(user.id);

                return (
                  <TableRow key={user.id} className="text-xs hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-foreground">
                          {user.full_name_ar ||
                            user.full_name_en ||
                            (isAr ? "مستخدم جديد" : "New User")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {user.email || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {roles.length === 0 ? (
                          <span className="text-[11px] text-muted-foreground">
                            {isAr ? "لا توجد أدوار" : "No roles"}
                          </span>
                        ) : (
                          roles.map((r) => (
                            <Badge
                              key={r}
                              variant="outline"
                              className="text-[10px] font-mono border-primary/30"
                            >
                              {r}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{getUserStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => setRoleModalUser(user)}
                      >
                        <Shield className="w-3 h-3" />
                        {isAr ? "تعديل الأدوار" : "Manage Roles"}
                      </Button>
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
    </div>
  );
}
