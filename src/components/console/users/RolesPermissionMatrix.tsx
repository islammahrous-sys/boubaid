import { useState, useMemo } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, X, Shield, ShieldCheck, Search, Info, Lock } from "lucide-react";

type RoleDef = {
  key: string;
  name_ar: string;
  name_en: string;
  badgeColor: string;
  desc_ar: string;
  desc_en: string;
};

const SYSTEM_ROLES: RoleDef[] = [
  {
    key: "super_admin",
    name_ar: "أمين عام المجلس (Super Admin)",
    name_en: "Super Admin",
    badgeColor: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
    desc_ar: "صلاحيات سيادية مطلقة للتحكم في كافة الأنظمة، قواعد البيانات، الصلاحيات، والرقابة.",
    desc_en: "Unrestricted sovereignty across all databases, RBAC roles, and settings.",
  },
  {
    key: "admin",
    name_ar: "مشرف النظام (Admin)",
    name_en: "Administrator",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    desc_ar: "إدارة العمليات اليومية للشجرة، المحتوى، والتحقق من المستخدمين.",
    desc_en: "Management of daily operations, CMS, genealogy records, and directory.",
  },
  {
    key: "editor",
    name_ar: "محرر المحتوى (Editor)",
    name_en: "Content Editor",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    desc_ar: "إنشاء وتحرير المقالات، الأخبار، الفعاليات، ومكتبة الوسائط.",
    desc_en: "Creation and publishing of news, articles, events, and media assets.",
  },
  {
    key: "content_manager",
    name_ar: "مدير المحتوى (Content Manager)",
    name_en: "Content Manager",
    badgeColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
    desc_ar: "تحرير ونشر الأخبار والمبادرات والمتفوقين ومكتبة الموارد عبر لوحة المحتوى.",
    desc_en: "Editor-equivalent access to news, initiatives, achievers, and the resource library.",
  },
  {
    key: "family_manager",
    name_ar: "مدير شؤون العائلة (Family Manager)",
    name_en: "Family Manager",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    desc_ar: "إدارة أفراد العائلة والقرابة وسجل التاريخ العائلي، دون الفروع أو الأماكن.",
    desc_en: "Manages family members, relationships, and family history (not branches or places).",
  },
  {
    key: "treasurer",
    name_ar: "أمين الصندوق (Treasurer)",
    name_en: "Treasurer",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    desc_ar: "مراجعة إيصالات التحويل البنكي، تدقيق المساهمات، وسجل الخزينة.",
    desc_en: "Review of bank transfer receipts, funds ledger, and initiative budgets.",
  },
  {
    key: "member",
    name_ar: "عضو موثق (Member)",
    name_en: "Verified Member",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    desc_ar: "استعراض شجرة العائلة الكاملة، الوثائق الخاصة، والمشاركة في الفعاليات.",
    desc_en: "Access to private family tree records, digital library, and registrations.",
  },
  {
    key: "viewer",
    name_ar: "زائر / ضيف (Viewer)",
    name_en: "Public Guest",
    badgeColor: "bg-muted text-muted-foreground border-border",
    desc_ar: "استعراض المحتوى والبيانات المصنفة كـ عامة فقط.",
    desc_en: "Read-only access to public articles, heritage documents, and contact forms.",
  },
];

type PermissionItem = {
  key: string;
  category_ar: string;
  category_en: string;
  name_ar: string;
  name_en: string;
  allowedRoles: string[];
};

const PERMISSIONS_MATRIX: PermissionItem[] = [
  // 1. Genealogy
  { key: "family.read_public", category_ar: "شجرة العائلة والأنساب", category_en: "Genealogy", name_ar: "عرض السجلات العامة للأفراد", name_en: "View Public Members", allowedRoles: ["super_admin", "admin", "editor", "content_manager", "family_manager", "treasurer", "member", "viewer"] },
  { key: "family.read_private", category_ar: "شجرة العائلة والأنساب", category_en: "Genealogy", name_ar: "عرض السجلات الخاصة بالأفراد والأحياء", name_en: "View Private & Living Members", allowedRoles: ["super_admin", "admin", "family_manager", "member"] },
  { key: "family.create", category_ar: "شجرة العائلة والأنساب", category_en: "Genealogy", name_ar: "إضافة أفراد جدد للشجرة", name_en: "Create Family Members", allowedRoles: ["super_admin", "admin", "family_manager"] },
  { key: "family.update", category_ar: "شجرة العائلة والأنساب", category_en: "Genealogy", name_ar: "تعديل بيانات الأفراد والقرابة", name_en: "Update Member Details", allowedRoles: ["super_admin", "admin", "family_manager"] },
  { key: "family.delete", category_ar: "شجرة العائلة والأنساب", category_en: "Genealogy", name_ar: "حذف أو أرشفة أفراد من السجل", name_en: "Delete / Archive Members", allowedRoles: ["super_admin", "admin", "family_manager"] },
  { key: "family.branches", category_ar: "شجرة العائلة والأنساب", category_en: "Genealogy", name_ar: "إدارة الفروع السبعة وتعيين الرؤساء", name_en: "Manage 7 Branches", allowedRoles: ["super_admin", "admin"] },

  // 2. CMS & Content
  { key: "cms.pages_manage", category_ar: "المحتوى والـ CMS", category_en: "CMS & Content", name_ar: "بناء وتعديل صفحات الـ CMS الديناميكية", name_en: "Build & Edit CMS Pages", allowedRoles: ["super_admin", "admin", "editor"] },
  { key: "cms.homepage_manage", category_ar: "المحتوى والـ CMS", category_en: "CMS & Content", name_ar: "إدارة أقسام وترتيب الصفحة الرئيسية", name_en: "Manage Homepage Layout", allowedRoles: ["super_admin", "admin"] },
  { key: "cms.articles_write", category_ar: "المحتوى والـ CMS", category_en: "CMS & Content", name_ar: "كتابة ونشر المقالات والأخبار", name_en: "Create & Publish Articles", allowedRoles: ["super_admin", "admin", "editor", "content_manager"] },
  { key: "cms.events_manage", category_ar: "المحتوى والـ CMS", category_en: "CMS & Content", name_ar: "جدولة الفعاليات وإدارة الحضور", name_en: "Schedule Events & RSVPs", allowedRoles: ["super_admin", "admin", "editor"] },
  { key: "cms.announcements", category_ar: "المحتوى والـ CMS", category_en: "CMS & Content", name_ar: "بث الإعلانات العاجلة وتنبيهات الأعضاء", name_en: "Broadcast Urgent Announcements", allowedRoles: ["super_admin", "admin"] },
  { key: "cms.dna_studies", category_ar: "المحتوى والـ CMS", category_en: "CMS & Content", name_ar: "إدارة الدراسات الجينية وتفرعات الهابلوغروب", name_en: "Manage Y-DNA Studies Data", allowedRoles: ["super_admin", "admin"] },

  // 3. Media & Storage
  { key: "media.upload", category_ar: "الوسائط والتخزين", category_en: "Media & Assets", name_ar: "رفع ملفات إلى الحاويات السحابية", name_en: "Upload to Storage Buckets", allowedRoles: ["super_admin", "admin", "editor", "content_manager"] },
  { key: "media.delete", category_ar: "الوسائط والتخزين", category_en: "Media & Assets", name_ar: "حذف وسائط وتعديل النصوص البديلة", name_en: "Delete Media Assets", allowedRoles: ["super_admin", "admin"] },
  { key: "media.private_docs", category_ar: "الوسائط والتخزين", category_en: "Media & Assets", name_ar: "استعراض الوثائق والمخطوطات الخاصة", name_en: "Access Private Documents", allowedRoles: ["super_admin", "admin", "member"] },

  // 4. Treasury & Funds
  { key: "treasury.view_ledger", category_ar: "الخزينة والمساهمات", category_en: "Treasury", name_ar: "استعراض سجل الخزينة والمبالغ المعتمدة", name_en: "View Treasury Ledger", allowedRoles: ["super_admin", "admin", "treasurer"] },
  { key: "treasury.verify_receipts", category_ar: "الخزينة والمساهمات", category_en: "Treasury", name_ar: "مراجعة واعتماد إيصالات التحويل البنكي", name_en: "Verify Bank Transfer Receipts", allowedRoles: ["super_admin", "treasurer"] },
  { key: "treasury.export", category_ar: "الخزينة والمساهمات", category_en: "Treasury", name_ar: "تصدير التقارير المالية كملفات CSV", name_en: "Export Financial Reports", allowedRoles: ["super_admin", "treasurer"] },

  // 5. Directory & Verification
  { key: "directory.manage", category_ar: "الدليل والعضوية", category_en: "Directory & Verification", name_ar: "إدارة دليل المنشآت والأعمال الأسرية", name_en: "Manage Business Listings", allowedRoles: ["super_admin", "admin"] },
  { key: "verification.review", category_ar: "الدليل والعضوية", category_en: "Directory & Verification", name_ar: "تدقيق واعتماد طلبات توثيق العضوية", name_en: "Approve Membership Requests", allowedRoles: ["super_admin", "admin"] },

  // 6. System & Governance
  { key: "users.manage_roles", category_ar: "النظام والحوكمة", category_en: "System & Governance", name_ar: "إسناد وسحب أدوار المستخدمين (RBAC)", name_en: "Assign & Revoke User Roles", allowedRoles: ["super_admin"] },
  { key: "audit.view_logs", category_ar: "النظام والحوكمة", category_en: "System & Governance", name_ar: "استعراض سجل الرقابة الأمنية والعمليات", name_en: "View Security Audit Trail", allowedRoles: ["super_admin", "admin"] },
  { key: "settings.update", category_ar: "النظام والحوكمة", category_en: "System & Governance", name_ar: "تعديل بيانات الترخيص والهوية ومجلس الأمناء", name_en: "Update Platform Identity & SEO", allowedRoles: ["super_admin"] },
];

export function RolesPermissionMatrix() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [filterQuery, setFilterQuery] = useState("");

  const filteredPermissions = useMemo(() => {
    if (!filterQuery.trim()) return PERMISSIONS_MATRIX;
    const q = filterQuery.toLowerCase();
    return PERMISSIONS_MATRIX.filter(
      (p) =>
        p.name_ar.toLowerCase().includes(q) ||
        p.name_en.toLowerCase().includes(q) ||
        p.category_ar.toLowerCase().includes(q) ||
        p.category_en.toLowerCase().includes(q)
    );
  }, [filterQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h2 className="text-sm font-bold text-foreground">
                {isAr ? "مصفوفة الصلاحيات وقواعد الوصول (RBAC Matrix)" : "Role-Based Access Control (RBAC) Matrix"}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "توضيح شامل للصلاحيات الممنوحة لكل دور قيادي وتشغيلي عبر 47 قاعدة حماية ومستوى أمان مشدد."
                : "Full visualization of permission rules mapped to system roles enforced by database RLS and server guards."}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder={isAr ? "تصفية الصلاحيات..." : "Filter permissions..."}
              className="h-8 text-xs ps-8"
            />
          </div>
        </div>

        {/* Role Descriptions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2 border-t border-border/40">
          {SYSTEM_ROLES.map((role) => (
            <div key={role.key} className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={`text-[10px] font-bold ${role.badgeColor}`}>
                  {isAr ? role.name_ar : role.name_en}
                </Badge>
                <span className="text-[10px] font-mono text-muted-foreground">{role.key}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {isAr ? role.desc_ar : role.desc_en}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions Matrix Table */}
      <div className="border border-border rounded-2xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs">
              <TableHead className="w-[300px]">{isAr ? "الصلاحية / الإجراء" : "Permission / Operation"}</TableHead>
              <TableHead className="text-center">{isAr ? "القسم" : "Domain"}</TableHead>
              {SYSTEM_ROLES.map((r) => (
                <TableHead key={r.key} className="text-center font-bold">
                  {r.key === "super_admin" ? (
                    <span className="text-red-600 dark:text-red-400">Super Admin</span>
                  ) : r.key === "admin" ? (
                    <span className="text-amber-600 dark:text-amber-400">Admin</span>
                  ) : r.key === "editor" ? (
                    <span className="text-blue-600 dark:text-blue-400">Editor</span>
                  ) : r.key === "content_manager" ? (
                    <span className="text-sky-600 dark:text-sky-400">Content Mgr</span>
                  ) : r.key === "family_manager" ? (
                    <span className="text-indigo-600 dark:text-indigo-400">Family Mgr</span>
                  ) : r.key === "treasurer" ? (
                    <span className="text-emerald-600 dark:text-emerald-400">Treasurer</span>
                  ) : r.key === "member" ? (
                    <span className="text-purple-600 dark:text-purple-400">Member</span>
                  ) : (
                    <span>Viewer</span>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPermissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={SYSTEM_ROLES.length + 2} className="h-28 text-center text-muted-foreground text-xs">
                  {isAr ? "لا توجد نتائج مطابقة لبحثك" : "No permissions matching search"}
                </TableCell>
              </TableRow>
            ) : (
              filteredPermissions.map((perm) => (
                <TableRow key={perm.key} className="text-xs hover:bg-muted/30">
                  <TableCell className="font-semibold text-foreground">
                    <span>{isAr ? perm.name_ar : perm.name_en}</span>
                    <span className="block text-[10px] text-muted-foreground font-mono">{perm.key}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      {isAr ? perm.category_ar : perm.category_en}
                    </Badge>
                  </TableCell>
                  {SYSTEM_ROLES.map((r) => {
                    const isAllowed = perm.allowedRoles.includes(r.key);
                    return (
                      <TableCell key={r.key} className="text-center">
                        {isAllowed ? (
                          <div className="w-5 h-5 mx-auto rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 mx-auto rounded-full bg-muted text-muted-foreground/40 flex items-center justify-center">
                            <X className="w-3 h-3" />
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
