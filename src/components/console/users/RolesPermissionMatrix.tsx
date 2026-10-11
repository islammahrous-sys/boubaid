import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageProvider";
import { useConfirm } from "@/hooks/useConfirm";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Check,
  Info,
  Loader2,
  Lock,
  Minus,
  Plus,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";

/** Rows of the live `permissions` / `role_permissions` tables, as returned by
 *  `getUsersAndRolesData`. */
export type PermissionRow = {
  id: string;
  name: string;
  description?: string | null;
  category: string;
};

export type RolePermissionRow = {
  id: string;
  role: string;
  permission_id: string;
};

type RoleDef = {
  key: string;
  name_ar: string;
  name_en: string;
  scope_ar: string;
  scope_en: string;
  desc_ar: string;
  desc_en: string;
  /** How the server actually decides access for this role today. */
  enforced_ar: string;
  enforced_en: string;
  /** admin / super_admin pass every capability check, so nothing to edit. */
  locked?: boolean;
  dot: string;
};

const ROLES: RoleDef[] = [
  {
    key: "editor",
    name_ar: "محرر المحتوى",
    name_en: "Content Editor",
    scope_ar: "المحتوى",
    scope_en: "Content",
    desc_ar: "يكتب ويحرر الأخبار والمقالات والفعاليات ومكتبة الوسائط.",
    desc_en: "Writes and edits news, articles, events and the media library.",
    enforced_ar: "الخادم يفتح له قسم «المحتوى والنشر» بحكم الدور نفسه.",
    enforced_en: "The server opens the Content section to this role by name.",
    dot: "#2c6648",
  },
  {
    key: "content_manager",
    name_ar: "مدير المحتوى",
    name_en: "Content Manager",
    scope_ar: "المحتوى",
    scope_en: "Content",
    desc_ar: "صلاحيات المحرر، ويدير المبادرات ولوحة الشرف ومكتبة الموارد.",
    desc_en: "Editor access plus initiatives, honour roll and the resource library.",
    enforced_ar: "الخادم يعامله كمحرر محتوى بحكم الدور نفسه.",
    enforced_en: "The server treats this role as a content editor by name.",
    dot: "#457f71",
  },
  {
    key: "family_manager",
    name_ar: "مدير شؤون الأسرة",
    name_en: "Family Manager",
    scope_ar: "الأسرة والأنساب",
    scope_en: "Family & lineage",
    desc_ar: "يدير أفراد الأسرة وصلات القرابة وتاريخ الأسرة.",
    desc_en: "Manages family members, kinship links and family history.",
    enforced_ar: "الخادم يفتح له قسم «الأسرة والأنساب» بحكم الدور نفسه.",
    enforced_en: "The server opens the Family section to this role by name.",
    dot: "#ba734a",
  },
  {
    key: "member",
    name_ar: "عضو موثّق",
    name_en: "Verified Member",
    scope_ar: "الموقع",
    scope_en: "Website",
    desc_ar: "يطّلع على السجلات الخاصة بالأعضاء والمكتبة ويسجّل في الفعاليات.",
    desc_en: "Sees member-only records and library, and registers for events.",
    enforced_ar: "لا يدخل لوحة الإدارة؛ صلاحياته على الموقع العام فقط.",
    enforced_en: "No console access; applies to the public website only.",
    dot: "#8b5638",
  },
  {
    key: "viewer",
    name_ar: "زائر",
    name_en: "Viewer",
    scope_ar: "الموقع",
    scope_en: "Website",
    desc_ar: "يطّلع على المحتوى العام فقط.",
    desc_en: "Read-only access to public content.",
    enforced_ar: "لا يدخل لوحة الإدارة؛ صلاحياته على الموقع العام فقط.",
    enforced_en: "No console access; applies to the public website only.",
    dot: "#8a7768",
  },
  {
    key: "admin",
    name_ar: "مشرف النظام",
    name_en: "Administrator",
    scope_ar: "المنصة كاملة",
    scope_en: "Whole platform",
    desc_ar: "يدير العمليات اليومية: الأسرة والمحتوى والمستخدمين.",
    desc_en: "Runs daily operations: family, content and users.",
    enforced_ar: "يملك كل الصلاحيات دائماً — الخادم يتجاوز هذا الجدول لهذا الدور.",
    enforced_en: "Always has every capability — the server bypasses this table.",
    locked: true,
    dot: "#d98c3a",
  },
  {
    key: "super_admin",
    name_ar: "المشرف العام",
    name_en: "Super Admin",
    scope_ar: "المنصة كاملة",
    scope_en: "Whole platform",
    desc_ar: "كل صلاحيات المشرف، وهو وحده من يمنح دور المشرف العام.",
    desc_en: "Everything an admin can do, and the only one who can grant super admin.",
    enforced_ar: "يملك كل الصلاحيات دائماً — الخادم يتجاوز هذا الجدول لهذا الدور.",
    enforced_en: "Always has every capability — the server bypasses this table.",
    locked: true,
    dot: "#a84a2b",
  },
];

const CATEGORY: Record<string, { ar: string; en: string; noun_ar: string }> = {
  articles: { ar: "المقالات والأخبار", en: "Articles", noun_ar: "المقالات" },
  audit: { ar: "سجل العمليات", en: "Audit", noun_ar: "سجل العمليات" },
  content: { ar: "الصفحات والمحتوى", en: "Content", noun_ar: "الصفحات" },
  dashboard: { ar: "لوحة القيادة", en: "Dashboard", noun_ar: "لوحة القيادة" },
  documents: { ar: "الوثائق", en: "Documents", noun_ar: "الوثائق" },
  events: { ar: "الفعاليات", en: "Events", noun_ar: "الفعاليات" },
  family: { ar: "الأسرة والأنساب", en: "Family", noun_ar: "سجلات الأسرة" },
  galleries: { ar: "معارض الصور", en: "Galleries", noun_ar: "معارض الصور" },
  inquiries: { ar: "الرسائل والاستفسارات", en: "Inquiries", noun_ar: "الرسائل" },
  media: { ar: "الوسائط", en: "Media", noun_ar: "الوسائط" },
  navigation: { ar: "القوائم", en: "Navigation", noun_ar: "القوائم" },
  notifications: { ar: "الإشعارات", en: "Notifications", noun_ar: "الإشعارات" },
  settings: { ar: "الإعدادات", en: "Settings", noun_ar: "الإعدادات" },
  users: { ar: "المستخدمون", en: "Users", noun_ar: "المستخدمين" },
};

const VERB_AR: Record<string, string> = {
  create: "إضافة",
  read: "عرض",
  view: "عرض",
  update: "تعديل",
  delete: "حذف",
  publish: "نشر",
  review: "مراجعة",
  manage: "إدارة",
  export: "تصدير",
  import: "استيراد",
  upload: "رفع",
  roles: "إدارة أدوار",
  relationships: "إدارة صلات القرابة في",
};

const categoryOf = (p: PermissionRow) => p.category || p.id.split(".")[0];
const catLabel = (key: string, isAr: boolean) =>
  CATEGORY[key] ? (isAr ? CATEGORY[key].ar : CATEGORY[key].en) : key;

/** Arabic, human-readable name derived from the capability key. */
function humanName(p: PermissionRow, isAr: boolean) {
  if (!isAr) return p.name;
  const [area, action] = p.id.split(".");
  const verb = VERB_AR[action];
  const noun = CATEGORY[area]?.noun_ar;
  return verb && noun ? `${verb} ${noun}` : p.name;
}

const sameSet = (a: Set<string>, b: Set<string>) =>
  a.size === b.size && [...a].every((x) => b.has(x));

export function RolesPermissionMatrix({
  permissions = [],
  rolePermissions = [],
  userRoles = [],
  onSaveRole,
  onCreatePermission,
  onDeletePermission,
}: {
  permissions?: PermissionRow[];
  rolePermissions?: RolePermissionRow[];
  userRoles?: { user_id: string; role: string }[];
  onSaveRole?: (role: string, grant: string[], revoke: string[]) => Promise<unknown>;
  onCreatePermission?: (p: { id: string; name: string; description?: string }) => Promise<unknown>;
  onDeletePermission?: (id: string) => Promise<unknown>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const confirm = useConfirm();

  const [roleKey, setRoleKey] = useState("editor");
  const [group, setGroup] = useState("all");
  const [query, setQuery] = useState("");
  const [grantedOnly, setGrantedOnly] = useState(false);
  const [columns, setColumns] = useState(3);
  const [readable, setReadable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newCap, setNewCap] = useState({ id: "", name: "", description: "" });
  const [creating, setCreating] = useState(false);

  const role = ROLES.find((r) => r.key === roleKey) ?? ROLES[0];
  const locked = !!role.locked;

  const savedByRole = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const g of rolePermissions) {
      if (!map.has(g.role)) map.set(g.role, new Set());
      map.get(g.role)!.add(g.permission_id);
    }
    return map;
  }, [rolePermissions]);

  const saved = useMemo(
    () =>
      locked
        ? new Set(permissions.map((p) => p.id))
        : (savedByRole.get(roleKey) ?? new Set<string>()),
    [locked, permissions, savedByRole, roleKey],
  );
  const [draft, setDraft] = useState<Set<string>>(saved);
  // Re-seed the draft when the role changes or fresh server data arrives.
  useEffect(() => setDraft(new Set(saved)), [saved]);

  const dirty = !sameSet(draft, saved);
  const toGrant = [...draft].filter((id) => !saved.has(id));
  const toRevoke = [...saved].filter((id) => !draft.has(id));

  const peopleByRole = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of userRoles) m.set(r.role, (m.get(r.role) ?? 0) + 1);
    return m;
  }, [userRoles]);

  const groups = useMemo(() => {
    const m = new Map<string, { total: number; granted: number }>();
    for (const p of permissions) {
      const c = categoryOf(p);
      const g = m.get(c) ?? { total: 0, granted: 0 };
      g.total += 1;
      if (draft.has(p.id)) g.granted += 1;
      m.set(c, g);
    }
    return [...m.entries()].sort((a, b) =>
      catLabel(a[0], isAr).localeCompare(catLabel(b[0], isAr)),
    );
  }, [permissions, draft, isAr]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return permissions
      .filter((p) => group === "all" || categoryOf(p) === group)
      .filter((p) => !grantedOnly || draft.has(p.id))
      .filter(
        (p) =>
          !q ||
          p.id.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          humanName(p, true).includes(q) ||
          (p.description ?? "").toLowerCase().includes(q),
      )
      .sort((a, b) => categoryOf(a).localeCompare(categoryOf(b)) || a.id.localeCompare(b.id));
  }, [permissions, group, grantedOnly, draft, query]);

  const visibleGranted = visible.filter((p) => draft.has(p.id)).length;
  const allState: boolean | "mixed" =
    visible.length > 0 && visibleGranted === visible.length
      ? true
      : visibleGranted > 0
        ? "mixed"
        : false;

  const toggle = (id: string) => {
    if (locked) return;
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAllVisible = () => {
    if (locked) return;
    setDraft((prev) => {
      const next = new Set(prev);
      if (allState === true) visible.forEach((p) => next.delete(p.id));
      else visible.forEach((p) => next.add(p.id));
      return next;
    });
  };

  const switchRole = async (key: string) => {
    if (key === roleKey) return;
    if (dirty) {
      const ok = await confirm({
        title: isAr ? "تجاهل التغييرات غير المحفوظة؟" : "Discard unsaved changes?",
        description: isAr
          ? `لديك ${toGrant.length + toRevoke.length} تغييرات على دور «${role.name_ar}» لم تُحفظ.`
          : `You have ${toGrant.length + toRevoke.length} unsaved changes to ${role.name_en}.`,
        confirmLabel: isAr ? "تجاهل والمتابعة" : "Discard",
        tone: "destructive",
      });
      if (!ok) return;
    }
    setRoleKey(key);
  };

  const handleSave = async () => {
    if (!onSaveRole || !dirty || locked) return;
    setSaving(true);
    try {
      await onSaveRole(roleKey, toGrant, toRevoke);
      toast.success(
        isAr ? `تم تحديث صلاحيات «${role.name_ar}»` : `${role.name_en} capabilities updated`,
      );
    } catch {
      // the console's mutation runner already showed the error
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCreatePermission) return;
    setCreating(true);
    try {
      await onCreatePermission({
        id: newCap.id.trim(),
        name: newCap.name.trim(),
        description: newCap.description.trim() || undefined,
      });
      toast.success(isAr ? "أُضيفت الصلاحية" : "Capability added");
      setAddOpen(false);
      setNewCap({ id: "", name: "", description: "" });
    } catch {
      // surfaced by the mutation runner
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (p: PermissionRow) => {
    if (!onDeletePermission) return;
    const holders = ROLES.filter((r) => !r.locked && savedByRole.get(r.key)?.has(p.id));
    const ok = await confirm({
      title: isAr ? `حذف الصلاحية «${humanName(p, true)}»؟` : `Delete “${p.name}”?`,
      description: isAr
        ? `ستُحذف الصلاحية ${p.id}${holders.length ? ` وتُسحب من ${holders.map((r) => r.name_ar).join("، ")}` : ""}. لا يمكن التراجع.`
        : `${p.id} will be removed${holders.length ? ` and revoked from ${holders.map((r) => r.name_en).join(", ")}` : ""}. This can't be undone.`,
      confirmLabel: isAr ? "حذف" : "Delete",
      tone: "destructive",
    });
    if (!ok) return;
    try {
      await onDeletePermission(p.id);
      toast.success(isAr ? "حُذفت الصلاحية" : "Capability deleted");
    } catch {
      // surfaced by the mutation runner
    }
  };

  const onTileKey = (e: KeyboardEvent<HTMLDivElement>, id: string) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle(id);
    }
  };

  const gridCols =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
        ? "sm:grid-cols-2"
        : "sm:grid-cols-2 2xl:grid-cols-3";
  const byId = new Map(permissions.map((p) => [p.id, p]));

  return (
    <div className="space-y-5">
      <div className="console-card overflow-hidden">
        {/* ── Role picker ── */}
        <div className="border-b border-[var(--console-hairline)] p-4 md:p-5">
          <p className="mb-3 text-sm font-semibold text-foreground">
            {isAr ? "اختر الدور ثم حدّد صلاحياته" : "Choose a role and set its capabilities"}
          </p>
          <div
            role="tablist"
            aria-label={isAr ? "الأدوار" : "Roles"}
            className="no-scrollbar flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible"
          >
            {ROLES.map((r) => {
              const active = r.key === roleKey;
              const people = peopleByRole.get(r.key) ?? 0;
              return (
                <button
                  key={r.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => void switchRole(r.key)}
                  className={cn(
                    "group flex shrink-0 items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-start transition-[background-color,border-color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98]",
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-[var(--console-shadow-md)]"
                      : "border-[var(--console-hairline)] bg-card hover:border-primary/40 hover:bg-[var(--console-canvas)]",
                  )}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/40"
                    style={{ backgroundColor: r.dot }}
                  />
                  <span>
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      {isAr ? r.name_ar : r.name_en}
                      {r.locked && <Lock className="h-3 w-3 opacity-70" />}
                    </span>
                    <span
                      className={cn(
                        "block font-mono text-[11px]",
                        active ? "text-primary-foreground/70" : "text-muted-foreground",
                      )}
                    >
                      {r.key} · {people} {isAr ? "شخص" : people === 1 ? "person" : "people"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Role summary ── */}
        <div className="flex flex-col gap-3 bg-[var(--console-canvas)] px-4 py-3.5 md:flex-row md:items-center md:justify-between md:px-5">
          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            <span className="rounded-lg bg-card px-2.5 py-1 font-semibold text-foreground shadow-[var(--console-shadow-sm)]">
              {isAr ? "النطاق: " : "Scope: "}
              {isAr ? role.scope_ar : role.scope_en}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-card px-2.5 py-1 font-semibold text-foreground shadow-[var(--console-shadow-sm)]">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              {peopleByRole.get(role.key) ?? 0} {isAr ? "شخص" : "people"}
            </span>
            <span className="rounded-lg bg-card px-2.5 py-1 font-semibold text-foreground shadow-[var(--console-shadow-sm)]">
              {isAr ? "دور أساسي" : "Built-in role"}
            </span>
            <span className="text-muted-foreground">{isAr ? role.desc_ar : role.desc_en}</span>
          </div>
          <label className="flex shrink-0 cursor-pointer items-center gap-2 text-[13px] text-foreground">
            <Switch checked={readable} onCheckedChange={setReadable} />
            {isAr ? "أسماء مقروءة" : "Readable names"}
          </label>
        </div>

        {/* ── Editor ── */}
        <div className="grid grid-cols-[minmax(0,1fr)] border-t border-[var(--console-hairline)] lg:grid-cols-[230px_minmax(0,1fr)_230px]">
          {/* Groups */}
          <nav
            aria-label={isAr ? "مجموعات الصلاحيات" : "Capability groups"}
            className="min-w-0 border-b border-[var(--console-hairline)] p-3 lg:border-b-0 lg:border-e"
          >
            <p className="flex justify-between px-2 pb-2 text-xs font-semibold text-muted-foreground">
              <span>{isAr ? "المجموعة" : "Group"}</span>
              <span>{isAr ? "ممنوح/الكل" : "Granted/Total"}</span>
            </p>
            <div className="no-scrollbar flex gap-1 overflow-x-auto lg:block lg:max-h-[560px] lg:space-y-0.5 lg:overflow-y-auto">
              {[
                ["all", { total: permissions.length, granted: draft.size }] as const,
                ...groups,
              ].map(([key, g]) => {
                const active = group === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setGroup(key)}
                    aria-pressed={active}
                    className={cn(
                      "flex shrink-0 items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-start text-[13.5px] transition-colors focus-visible:outline-2 focus-visible:outline-ring lg:w-full",
                      active
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-foreground hover:bg-[var(--console-canvas)]",
                    )}
                  >
                    <span className="truncate">
                      {key === "all" ? (isAr ? "الكل" : "All") : catLabel(key, isAr)}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-xs",
                        g.granted === g.total && g.total > 0
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    >
                      {g.granted}/{g.total}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Capabilities */}
          <section className="min-w-0">
            <div className="flex flex-wrap items-center gap-3 border-b border-[var(--console-hairline)] px-4 py-3">
              <button
                type="button"
                role="checkbox"
                aria-checked={allState}
                aria-label={isAr ? "تحديد كل الظاهر" : "Select all shown"}
                disabled={locked || visible.length === 0}
                onClick={toggleAllVisible}
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50",
                  allState === false
                    ? "border-[var(--input)] bg-card"
                    : "border-primary bg-primary text-primary-foreground",
                )}
              >
                {allState === true && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                {allState === "mixed" && <Minus className="h-3.5 w-3.5 stroke-[3]" />}
              </button>
              <div className="relative min-w-[180px] flex-1">
                <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={isAr ? "بحث في الصلاحيات..." : "Search capabilities..."}
                  className="h-10 ps-9"
                  aria-label={isAr ? "بحث في الصلاحيات" : "Search capabilities"}
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-[13.5px] text-foreground">
                <Switch checked={grantedOnly} onCheckedChange={setGrantedOnly} />
                {isAr ? "الممنوحة فقط" : "Granted only"}
              </label>
              <div
                className="hidden items-center rounded-lg border border-[var(--console-hairline)] p-0.5 sm:flex"
                role="group"
                aria-label={isAr ? "عدد الأعمدة" : "Columns"}
              >
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setColumns(n)}
                    aria-pressed={columns === n}
                    className={cn(
                      "h-8 w-8 rounded-md text-[13px] font-semibold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                      columns === n
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {locked && (
              <div className="mx-4 mt-4 flex items-start gap-3 rounded-xl border border-[#eca654]/40 bg-[#eca654]/10 px-4 py-3 text-[13.5px] text-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#b0692f]" />
                <span>{isAr ? role.enforced_ar : role.enforced_en}</span>
              </div>
            )}

            {visible.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-16 text-center text-muted-foreground">
                <Search className="h-7 w-7 opacity-40" />
                <p className="mt-3 text-sm">
                  {permissions.length === 0
                    ? isAr
                      ? "لم تُحمّل الصلاحيات بعد."
                      : "Capabilities haven't loaded yet."
                    : isAr
                      ? "لا توجد صلاحيات مطابقة."
                      : "No matching capabilities."}
                </p>
              </div>
            ) : (
              <div className={cn("grid max-h-[620px] gap-2 overflow-y-auto p-4", gridCols)}>
                {visible.map((p) => {
                  const on = draft.has(p.id);
                  const changed = on !== saved.has(p.id);
                  return (
                    <div
                      key={p.id}
                      role="checkbox"
                      aria-checked={on}
                      aria-disabled={locked}
                      tabIndex={locked ? -1 : 0}
                      onClick={() => toggle(p.id)}
                      onKeyDown={(e) => onTileKey(e, p.id)}
                      title={p.description || undefined}
                      className={cn(
                        "group relative flex items-start gap-3 rounded-xl border px-3.5 py-3 transition-[background-color,border-color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        locked ? "cursor-default" : "cursor-pointer",
                        on
                          ? "border-primary/35 bg-primary/[0.06]"
                          : "border-[var(--console-hairline)] bg-card hover:border-primary/30 hover:bg-[var(--console-canvas)]",
                        changed && "ring-2 ring-[#eca654]/60",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                          on
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-[var(--input)] bg-card",
                        )}
                      >
                        {on && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-semibold leading-snug text-foreground">
                          {readable ? humanName(p, isAr) : p.id}
                        </span>
                        <span
                          className="mt-0.5 block font-mono text-xs break-all text-muted-foreground"
                          dir="ltr"
                        >
                          {readable ? p.id : p.name}
                        </span>
                      </span>
                      {onDeletePermission && !locked && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDelete(p);
                          }}
                          className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-ring group-hover:opacity-100"
                          aria-label={isAr ? `حذف ${p.id}` : `Delete ${p.id}`}
                          title={isAr ? "حذف الصلاحية" : "Delete capability"}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Actions */}
          <aside className="space-y-3 border-t border-[var(--console-hairline)] p-4 lg:border-s lg:border-t-0">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={!dirty || saving || locked || !onSaveRole}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-[var(--console-shadow-md)] transition-[transform,opacity] duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {dirty
                ? isAr
                  ? `حفظ ${toGrant.length + toRevoke.length} تغيير`
                  : `Save ${toGrant.length + toRevoke.length} change${toGrant.length + toRevoke.length === 1 ? "" : "s"}`
                : isAr
                  ? "لا تغييرات"
                  : "No changes"}
            </button>
            <button
              type="button"
              onClick={() => setDraft(new Set(saved))}
              disabled={!dirty || saving}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[var(--console-hairline)] bg-card text-sm font-semibold text-foreground transition-colors hover:bg-[var(--console-canvas)] focus-visible:outline-2 focus-visible:outline-ring active:scale-[0.98] disabled:opacity-45"
            >
              <RotateCcw className="h-4 w-4" />
              {isAr ? "تراجع" : "Discard"}
            </button>

            {dirty && (
              <div className="rounded-xl bg-[var(--console-canvas)] p-3 text-[13px]">
                <p className="mb-2 font-semibold text-foreground">
                  {isAr ? "قبل الحفظ" : "Pending"}
                </p>
                <ul className="max-h-52 space-y-1 overflow-y-auto">
                  {toGrant.map((id) => (
                    <li
                      key={`g-${id}`}
                      className="flex items-center gap-1.5 text-[#2c6648] dark:text-[#9cc7ae]"
                    >
                      <Plus className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {byId.get(id) ? humanName(byId.get(id)!, isAr) : id}
                      </span>
                    </li>
                  ))}
                  {toRevoke.map((id) => (
                    <li
                      key={`r-${id}`}
                      className="flex items-center gap-1.5 text-[#a84a2b] dark:text-[#e8957a]"
                    >
                      <Minus className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {byId.get(id) ? humanName(byId.get(id)!, isAr) : id}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {onCreatePermission && (
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-ring active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                {isAr ? "إضافة صلاحية" : "Add capability"}
              </button>
            )}

            <div className="rounded-xl border border-[var(--console-hairline)] p-3 text-[12.5px] leading-relaxed text-muted-foreground">
              <p className="mb-1 flex items-center gap-1.5 font-semibold text-foreground">
                <Info className="h-3.5 w-3.5 text-primary" />
                {isAr ? "كيف يُطبَّق الوصول" : "How access is enforced"}
              </p>
              {isAr ? role.enforced_ar : role.enforced_en}{" "}
              {!locked &&
                (isAr
                  ? "هذه الصلاحيات تُحفظ في قاعدة البيانات وتتحقق منها دالة has_permission."
                  : "These capabilities are stored in the database and checked by has_permission.")}
            </div>
          </aside>
        </div>
      </div>

      {/* Add capability */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isAr ? "إضافة صلاحية جديدة" : "Add a capability"}</DialogTitle>
            <DialogDescription>
              {isAr
                ? "المفتاح بصيغة القسم.الإجراء، مثل events.publish. القسم يحدد مجموعتها."
                : "Key as area.action, e.g. events.publish. The area becomes its group."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cap-id">{isAr ? "المفتاح" : "Key"}</Label>
              <Input
                id="cap-id"
                dir="ltr"
                required
                pattern="[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*"
                value={newCap.id}
                onChange={(e) => setNewCap({ ...newCap, id: e.target.value.toLowerCase() })}
                placeholder="events.publish"
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cap-name">{isAr ? "الاسم" : "Name"}</Label>
              <Input
                id="cap-name"
                required
                minLength={2}
                value={newCap.name}
                onChange={(e) => setNewCap({ ...newCap, name: e.target.value })}
                placeholder="Publish Event"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cap-desc">
                {isAr ? "الوصف (اختياري)" : "Description (optional)"}
              </Label>
              <Textarea
                id="cap-desc"
                rows={2}
                value={newCap.description}
                onChange={(e) => setNewCap({ ...newCap, description: e.target.value })}
              />
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="h-10 rounded-xl px-4 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition-transform hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
              >
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                {isAr ? "إضافة" : "Add"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
