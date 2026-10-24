import { useMemo, useState, type ComponentType } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { AUDIT_TONE_CLASS, describeAuditAction } from "@/components/console/common/consoleLabels";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  FolderArchive,
  GitBranch,
  Globe,
  Image as ImageIcon,
  Layers,
  Megaphone,
  Menu,
  MessageSquare,
  Newspaper,
  Rocket,
  Settings,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  Activity,
} from "lucide-react";

export type DashboardOverviewProps = {
  overviewData: {
    /** Documented individuals in the genealogy (`family_members`). */
    totalMembers: number;
    livingMembers: number;
    deceasedMembers: number;
    /** Website accounts (`profiles`). */
    totalUsers: number;
    /** Website accounts with an approved membership (`member` role). */
    approvedMembers: number;
    pendingInquiries: number;
    totalArticles: number;
    draftArticles: number;
    totalEvents: number;
    pendingVerifications: number;
    totalBusinesses: number;
    totalInitiatives: number;
    totalAchievers: number;
    totalBranches?: number;
    totalPages?: number;
    totalMedia?: number;
    recentActivity: Array<{
      id: string;
      action: string;
      entity_type: string;
      created_at: string;
      actor_user_id?: string | null;
      metadata?: unknown;
    }>;
  };
  onNavigateTab: (domainId: string, tabId: string) => void;
  onQuickAction: (actionId: string) => void;
};

type Icon = ComponentType<{ className?: string }>;
type ActivityItem = DashboardOverviewProps["overviewData"]["recentActivity"][number];

/** What each audit-log entity is called, and where it lives in the console. */
const ENTITIES: Record<string, { ar: string; en: string; icon: Icon; to?: [string, string] }> = {
  family_members: { ar: "سجل الأفراد", en: "Members", icon: Users, to: ["family", "members"] },
  branches: { ar: "الفروع", en: "Branches", icon: GitBranch, to: ["family", "branches"] },
  content_pages: { ar: "الصفحات", en: "Pages", icon: Layers, to: ["content", "pages"] },
  articles: {
    ar: "الأخبار والمقالات",
    en: "Articles",
    icon: Newspaper,
    to: ["content", "articles"],
  },
  events: { ar: "الفعاليات", en: "Events", icon: Calendar, to: ["content", "events"] },
  event_registrations: {
    ar: "تسجيلات الفعاليات",
    en: "Event registrations",
    icon: Calendar,
    to: ["content", "events"],
  },
  media_assets: { ar: "الوسائط", en: "Media", icon: ImageIcon, to: ["content", "media_library"] },
  galleries: {
    ar: "مجموعات المتحف",
    en: "Museum collections",
    icon: FolderArchive,
    to: ["content", "library_items"],
  },
  gallery_media: {
    ar: "صور المتحف",
    en: "Museum photos",
    icon: FolderArchive,
    to: ["content", "library_items"],
  },
  library_items: {
    ar: "الأرشيف والمكتبة",
    en: "Archive & library",
    icon: FolderArchive,
    to: ["content", "library_items"],
  },
  navigation_menus: { ar: "القوائم", en: "Menus", icon: Menu, to: ["content", "navigation"] },
  navigation_items: {
    ar: "روابط القوائم",
    en: "Menu links",
    icon: Menu,
    to: ["content", "navigation"],
  },
  user_roles: { ar: "الأدوار والصلاحيات", en: "Roles", icon: ShieldCheck, to: ["system", "users"] },
  site_settings: {
    ar: "إعدادات المنصة",
    en: "Platform settings",
    icon: Settings,
    to: ["system", "site_settings"],
  },
  businesses: {
    ar: "دليل الأعمال",
    en: "Business directory",
    icon: Building2,
    to: ["community", "directory"],
  },
  membership_requests: {
    ar: "طلبات العضوية",
    en: "Membership requests",
    icon: UserCheck,
    to: ["registration", "requests"],
  },
  initiatives: {
    ar: "المبادرات",
    en: "Initiatives",
    icon: Rocket,
    to: ["projects", "initiatives"],
  },
  initiative_registrations: {
    ar: "تسجيلات المبادرات",
    en: "Initiative sign-ups",
    icon: Rocket,
    to: ["projects", "initiatives"],
  },
  achievers: { ar: "لوحة الشرف", en: "Honour roll", icon: Award, to: ["projects", "achievers"] },
  notifications: {
    ar: "الإشعارات",
    en: "Notifications",
    icon: Megaphone,
    to: ["system", "email_notifications"],
  },
  council_committees: {
    ar: "اللجان",
    en: "Committees",
    icon: Users,
    to: ["community", "committees"],
  },
};

/** Arabic number agreement for "item": عنصر واحد، عنصران، ٣–١٠ عناصر، ١١+ عنصرًا. */
function arabicCount(n: number, nf: Intl.NumberFormat) {
  if (n === 1) return "عنصر واحد";
  if (n === 2) return "عنصران";
  return `${nf.format(n)} ${n % 100 >= 3 && n % 100 <= 10 ? "عناصر" : "عنصرًا"}`;
}

export function AdminDashboardOverview({
  overviewData,
  onNavigateTab,
  onQuickAction,
}: DashboardOverviewProps) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const { profile, user } = useAuth();
  const [activityFilter, setActivityFilter] = useState<string>("all");
  const Arrow = isAr ? ArrowLeft : ArrowRight;
  const nf = useMemo(() => new Intl.NumberFormat(isAr ? "ar-SA-u-nu-latn" : "en-US"), [isAr]);

  const now = new Date();
  const hour = now.getHours();
  const greeting = isAr
    ? hour < 12
      ? "صباح الخير"
      : "مساء الخير"
    : hour < 12
      ? "Good morning"
      : hour < 18
        ? "Good afternoon"
        : "Good evening";
  const fullName = isAr
    ? profile?.full_name_ar || profile?.full_name_en
    : profile?.full_name_en || profile?.full_name_ar;
  // A person is greeted by first name; an office account ("أمانة المجلس العام —
  // أسرة آل بوعبيد") by its short title, since its first word alone reads oddly.
  const lead = (fullName || user?.email?.split("@")[0] || "").split(/\s+[—–-]\s+/)[0].trim();
  const leadWords = lead.split(/\s+/);
  const firstName =
    leadWords.length <= 3 && !/^(بن|ابن)$/.test(leadWords[1] ?? "") ? lead : leadWords[0];
  const gregorian = new Intl.DateTimeFormat(isAr ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
  const hijri = new Intl.DateTimeFormat(
    isAr ? "ar-SA-u-ca-islamic-umalqura-nu-latn" : "en-u-ca-islamic-umalqura",
    { day: "numeric", month: "long", year: "numeric" },
  ).format(now);

  // ── The work queue: only real, actionable counts ──
  const tasks = [
    {
      id: "verify",
      count: overviewData.pendingVerifications,
      icon: UserCheck,
      title: isAr ? "طلبات عضوية بانتظار التوثيق" : "Membership requests to verify",
      hint: isAr
        ? "تحقق من النسب والفرع ثم اعتمد أو ارفض"
        : "Check lineage and branch, then approve or decline",
      cta: isAr ? "مراجعة الطلبات" : "Review requests",
      to: ["registration", "requests"] as const,
    },
    {
      id: "inbox",
      count: overviewData.pendingInquiries,
      icon: MessageSquare,
      title: isAr ? "رسائل واستفسارات جديدة" : "New messages & inquiries",
      hint: isAr ? "من نموذج التواصل ومركز الطلبات" : "From the contact form and requests hub",
      cta: isAr ? "فتح صندوق الوارد" : "Open inbox",
      to: ["community", "inquiries"] as const,
    },
    {
      id: "drafts",
      count: overviewData.draftArticles,
      icon: FileText,
      title: isAr ? "مسودات أخبار ومقالات" : "Draft news & articles",
      hint: isAr ? "راجعها وانشرها أو أكمل تحريرها" : "Review, publish or finish editing",
      cta: isAr ? "فتح المسودات" : "Open drafts",
      to: ["content", "articles"] as const,
    },
  ];
  const openTasks = tasks.filter((t) => t.count > 0);
  const totalOpen = openTasks.reduce((s, t) => s + t.count, 0);

  const quickActions = [
    {
      id: "add_member",
      icon: UserPlus,
      ar: "إضافة فرد",
      en: "Add member",
      to: ["family", "members"],
    },
    {
      id: "add_article",
      icon: Newspaper,
      ar: "كتابة خبر",
      en: "Write news",
      to: ["content", "articles"],
    },
    {
      id: "add_event",
      icon: Calendar,
      ar: "فعالية جديدة",
      en: "New event",
      to: ["content", "events"],
    },
    {
      id: "announce",
      icon: Megaphone,
      ar: "إعلان",
      en: "Announcement",
      to: ["content", "announcements"],
    },
  ] as const;

  const living = overviewData.livingMembers;
  const deceased = overviewData.deceasedMembers;
  const livingPct = overviewData.totalMembers
    ? Math.round((living / overviewData.totalMembers) * 100)
    : 0;

  const metrics = [
    {
      icon: UserCheck,
      value: overviewData.totalUsers,
      label: isAr ? "حسابات المنصة" : "Platform accounts",
      sub: isAr
        ? `${nf.format(overviewData.approvedMembers)} عضوية معتمدة`
        : `${nf.format(overviewData.approvedMembers)} approved members`,
      to: ["system", "users"],
    },
    {
      icon: Newspaper,
      value: overviewData.totalArticles,
      label: isAr ? "الأخبار والمقالات" : "News & articles",
      sub: isAr
        ? `${nf.format(overviewData.draftArticles)} مسودة`
        : `${nf.format(overviewData.draftArticles)} drafts`,
      to: ["content", "articles"],
    },
    {
      icon: Calendar,
      value: overviewData.totalEvents,
      label: isAr ? "الفعاليات" : "Events",
      sub: isAr ? "مجدولة ومؤرشفة" : "scheduled & past",
      to: ["content", "events"],
    },
    {
      icon: Rocket,
      value: overviewData.totalInitiatives,
      label: isAr ? "المبادرات" : "Initiatives",
      sub: isAr ? "مشاريع الأسرة" : "family projects",
      to: ["projects", "initiatives"],
    },
    {
      icon: Award,
      value: overviewData.totalAchievers,
      label: isAr ? "لوحة الشرف" : "Honour roll",
      sub: isAr ? "متميز مكرّم" : "honorees",
      to: ["projects", "achievers"],
    },
    {
      icon: Building2,
      value: overviewData.totalBusinesses,
      label: isAr ? "دليل الأعمال" : "Businesses",
      sub: isAr ? "منشأة مسجلة" : "listings",
      to: ["community", "directory"],
    },
    ...(overviewData.totalMedia !== undefined
      ? [
          {
            icon: ImageIcon,
            value: overviewData.totalMedia,
            label: isAr ? "ملفات الوسائط" : "Media files",
            sub: isAr ? "صور ووثائق" : "photos & documents",
            to: ["content", "media_library"],
          },
        ]
      : []),
    ...(overviewData.totalPages !== undefined
      ? [
          {
            icon: Layers,
            value: overviewData.totalPages,
            label: isAr ? "الصفحات المخصصة" : "Custom pages",
            sub: isAr ? "صفحات المحرر" : "builder pages",
            to: ["content", "pages"],
          },
        ]
      : []),
  ];

  const shortcuts = [
    { icon: Globe, ar: "واجهة الموقع", en: "Homepage", to: ["content", "homepage"] },
    { icon: Menu, ar: "القوائم والروابط", en: "Menus", to: ["content", "navigation"] },
    {
      icon: FolderArchive,
      ar: "الأرشيف والمكتبة",
      en: "Archive",
      to: ["content", "library_items"],
    },
    { icon: ShieldCheck, ar: "الأدوار والصلاحيات", en: "Roles", to: ["system", "roles_matrix"] },
    { icon: Settings, ar: "إعدادات المنصة", en: "Settings", to: ["system", "site_settings"] },
  ];

  // ── Activity, humanised and grouped by day ──
  const activity = useMemo(() => {
    const filterOf = (type: string) => {
      if (/member|branch|relationship|history|place/.test(type)) return "family";
      if (/initiative|achiever/.test(type)) return "projects";
      if (/article|event|page|announcement|media|galler|library|navigation/.test(type))
        return "content";
      return "system";
    };
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const dayMs = 86400000;
    const bucket = (iso: string) => {
      const t = new Date(iso).getTime();
      if (t >= startOfToday.getTime()) return isAr ? "اليوم" : "Today";
      if (t >= startOfToday.getTime() - dayMs) return isAr ? "أمس" : "Yesterday";
      if (t >= startOfToday.getTime() - 6 * dayMs) return isAr ? "هذا الأسبوع" : "This week";
      return isAr ? "أقدم" : "Earlier";
    };
    const groups: { label: string; items: ActivityItem[] }[] = [];
    for (const item of overviewData.recentActivity) {
      if (activityFilter !== "all" && filterOf(item.entity_type.toLowerCase()) !== activityFilter)
        continue;
      const label = bucket(item.created_at);
      const g = groups.find((x) => x.label === label);
      if (g) g.items.push(item);
      else groups.push({ label, items: [item] });
    }
    return groups;
  }, [overviewData.recentActivity, activityFilter, isAr]);

  const timeOf = (iso: string) =>
    new Intl.DateTimeFormat(isAr ? "ar-SA-u-nu-latn" : "en-GB", {
      hour: "numeric",
      minute: "2-digit",
      day: "numeric",
      month: "short",
    }).format(new Date(iso));

  return (
    <div className="space-y-6">
      {/* ═════ 1. Welcome — the council seal on green ═════ */}
      <section className="console-hero console-rise p-6 md:p-9">
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm text-[#f1bc7d]">
              {gregorian}
              <span className="mx-2 opacity-50">•</span>
              {hijri}
            </p>
            <h1 className="console-title mt-3 text-[30px] text-white md:text-[40px]">
              {greeting}
              {firstName ? (isAr ? `، ${firstName}` : `, ${firstName}`) : ""}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[#f7ecdf]/80">
              {isAr ? "مرحباً بك في مركز الإدارة" : "Welcome to the Administration Hub"}
              {" — "}
              {totalOpen > 0
                ? isAr
                  ? `لديك ${nf.format(totalOpen)} عناصر بانتظار قرارك اليوم.`
                  : `you have ${nf.format(totalOpen)} items awaiting your decision today.`
                : isAr
                  ? "لا شيء بانتظارك الآن، كل الطلبات والرسائل مُعالجة."
                  : "nothing is waiting on you — every request and message is handled."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickActions.map((qa) => (
              <button
                key={qa.id}
                type="button"
                onClick={() => {
                  onNavigateTab(qa.to[0], qa.to[1]);
                  onQuickAction(qa.id);
                }}
                className="group inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.07] px-4 text-sm font-semibold text-white backdrop-blur-sm transition-[background-color,transform] duration-300 hover:bg-white/[0.14] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f1bc7d] active:scale-[0.97]"
              >
                <qa.icon className="h-4 w-4 text-[#f1bc7d]" />
                {isAr ? qa.ar : qa.en}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═════ 2. Work queue + family at a glance ═════ */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="console-card console-rise-2 p-5 md:p-6 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="console-eyebrow">{isAr ? "قائمة العمل" : "Work queue"}</p>
              <h2 className="console-title mt-1 text-xl text-foreground">
                {isAr ? "بانتظار قرارك" : "Awaiting your decision"}
              </h2>
            </div>
            {totalOpen > 0 && (
              <span className="rounded-full bg-[#eca654]/15 px-3 py-1 text-sm font-bold tabular-nums text-[#8a5a1c] dark:text-[#f1bc7d]">
                {nf.format(totalOpen)}
              </span>
            )}
          </div>

          {openTasks.length === 0 ? (
            <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-[var(--console-hairline)] px-6 py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="h-7 w-7" />
              </span>
              <p className="mt-4 text-base font-bold text-foreground">
                {isAr ? "كل شيء محدّث" : "You're all caught up"}
              </p>
              <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {isAr
                  ? "لا توجد طلبات عضوية أو رسائل أو مسودات تنتظرك. سنعرضها هنا فور وصولها."
                  : "No membership requests, messages or drafts are waiting. They will appear here as soon as they arrive."}
              </p>
            </div>
          ) : (
            <ul className="mt-5 divide-y divide-[var(--console-hairline)]">
              {openTasks.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => onNavigateTab(t.to[0], t.to[1])}
                    className="group flex w-full items-center gap-4 rounded-xl px-2 py-4 text-start transition-colors hover:bg-[var(--console-canvas)] focus-visible:outline-2 focus-visible:outline-ring active:bg-muted"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <t.icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-foreground">{t.title}</span>
                      <span className="block text-sm text-muted-foreground">{t.hint}</span>
                    </span>
                    <span className="text-2xl font-bold tabular-nums text-foreground">
                      {nf.format(t.count)}
                    </span>
                    <span className="hidden items-center gap-1 text-sm font-semibold text-primary sm:flex">
                      {t.cta}
                      <Arrow className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5 ltr:group-hover:translate-x-0.5" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="console-card console-rise-3 flex flex-col p-5 md:p-6">
          <p className="console-eyebrow">{isAr ? "الأسرة" : "The family"}</p>
          <h2 className="console-title mt-1 text-xl text-foreground">
            {isAr ? "المشجرة الرسمية" : "Official family tree"}
          </h2>
          <button
            type="button"
            onClick={() => onNavigateTab("family", "members")}
            className="mt-4 text-start focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <span className="console-title block text-[48px] leading-none text-primary tabular-nums">
              {nf.format(overviewData.totalMembers)}
            </span>
            <span className="mt-2 block text-sm text-muted-foreground">
              {isAr ? "فرداً موثقاً في سجل الأنساب" : "documented members in the genealogy"}
            </span>
          </button>

          <div className="mt-5">
            <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
              <span className="h-full bg-primary" style={{ width: `${livingPct}%` }} />
              <span className="h-full bg-[#ba734a]" style={{ width: `${100 - livingPct}%` }} />
            </div>
            <div className="mt-2.5 flex justify-between text-sm">
              <span className="flex items-center gap-2 text-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                {isAr ? "أحياء" : "Living"} <b className="tabular-nums">{nf.format(living)}</b>
              </span>
              <span className="flex items-center gap-2 text-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ba734a]" />
                {isAr ? "متوفون" : "Deceased"} <b className="tabular-nums">{nf.format(deceased)}</b>
              </span>
            </div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2 pt-6">
            <button
              type="button"
              onClick={() => onNavigateTab("family", "tree")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-transform duration-300 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97]"
            >
              <GitBranch className="h-4 w-4" />
              {isAr ? "الشجرة" : "Tree"}
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab("family", "branches")}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--console-hairline)] text-sm font-semibold text-foreground transition-colors hover:bg-[var(--console-canvas)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97]"
            >
              {isAr ? "الفروع" : "Branches"}
              {overviewData.totalBranches !== undefined && (
                <span className="tabular-nums text-muted-foreground">
                  {nf.format(overviewData.totalBranches)}
                </span>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* ═════ 3. The platform in numbers ═════ */}
      <section className="console-rise-3">
        <div className="mb-3 flex items-end justify-between px-1">
          <div>
            <p className="console-eyebrow">
              {isAr ? "المنصة بالأرقام" : "The platform in numbers"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {metrics.map((m) => (
            <button
              key={m.label}
              type="button"
              onClick={() => onNavigateTab(m.to[0], m.to[1])}
              className="console-card console-card-interactive group p-4 text-start md:p-5"
            >
              <span className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{m.label}</span>
                <m.icon className="h-[18px] w-[18px] text-[#ba734a] transition-transform duration-300 group-hover:scale-110" />
              </span>
              <span className="mt-3 block text-[28px] font-bold leading-none tabular-nums text-foreground">
                {nf.format(m.value)}
              </span>
              <span className="mt-2 block truncate text-xs text-muted-foreground">{m.sub}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ═════ 4. Activity + shortcuts ═════ */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="console-card console-rise-4 p-5 md:p-6 lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="console-eyebrow">{isAr ? "سجل العمل" : "Activity"}</p>
              <h2 className="console-title mt-1 text-xl text-foreground">
                {isAr ? "آخر التعديلات" : "Latest changes"}
              </h2>
            </div>
            <div className="flex flex-wrap gap-1 rounded-xl bg-[var(--console-canvas)] p-1">
              {[
                { id: "all", ar: "الكل", en: "All" },
                { id: "family", ar: "الأسرة", en: "Family" },
                { id: "content", ar: "المحتوى", en: "Content" },
                { id: "projects", ar: "المبادرات", en: "Projects" },
                { id: "system", ar: "النظام", en: "System" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActivityFilter(f.id)}
                  aria-pressed={activityFilter === f.id}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                    activityFilter === f.id
                      ? "bg-card text-foreground shadow-[var(--console-shadow-sm)]"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {isAr ? f.ar : f.en}
                </button>
              ))}
            </div>
          </div>

          {activity.length === 0 ? (
            <div className="mt-6 flex flex-col items-center py-10 text-center text-muted-foreground">
              <Activity className="h-8 w-8 opacity-40" />
              <p className="mt-3 text-sm">
                {isAr ? "لا توجد تعديلات حديثة في هذا القسم." : "No recent changes in this area."}
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              {activity.map((group) => (
                <div key={group.label}>
                  <p className="mb-2 text-xs font-semibold text-muted-foreground">{group.label}</p>
                  <ol className="relative space-y-1 ps-5">
                    <span
                      aria-hidden
                      className="absolute inset-y-2 start-[7px] w-px bg-[var(--console-hairline)]"
                    />
                    {group.items.map((item) => {
                      const entity = ENTITIES[item.entity_type] ?? {
                        ar: item.entity_type,
                        en: item.entity_type,
                        icon: Activity,
                      };
                      const act = describeAuditAction(item.action);
                      const meta =
                        item.metadata &&
                        typeof item.metadata === "object" &&
                        !Array.isArray(item.metadata)
                          ? (item.metadata as Record<string, unknown>)
                          : null;
                      const detail =
                        typeof meta?.title === "string"
                          ? meta.title
                          : typeof meta?.target_count === "number"
                            ? isAr
                              ? arabicCount(meta.target_count, nf)
                              : `${nf.format(meta.target_count)} ${meta.target_count === 1 ? "item" : "items"}`
                            : null;
                      const EntityIcon = entity.icon;
                      return (
                        <li key={item.id} className="relative">
                          <span
                            aria-hidden
                            className="absolute -start-5 top-4 h-[15px] w-[15px] rounded-full border-[3px] border-card bg-[#ba734a]"
                          />
                          <button
                            type="button"
                            disabled={!entity.to}
                            onClick={() => entity.to && onNavigateTab(entity.to[0], entity.to[1])}
                            className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-start transition-colors enabled:hover:bg-[var(--console-canvas)] focus-visible:outline-2 focus-visible:outline-ring"
                          >
                            <EntityIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-foreground">
                                {isAr ? entity.ar : entity.en}
                                {detail && (
                                  <span className="font-normal text-muted-foreground">
                                    {" "}
                                    — {detail}
                                  </span>
                                )}
                              </span>
                            </span>
                            <span
                              className={cn(
                                "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                                AUDIT_TONE_CLASS[act.tone],
                              )}
                            >
                              {isAr ? act.ar : act.en}
                            </span>
                            <span className="hidden w-28 shrink-0 text-end text-xs tabular-nums text-muted-foreground sm:block">
                              {timeOf(item.created_at)}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => onNavigateTab("system", "audit_logs")}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
          >
            {isAr ? "السجل الكامل" : "Full audit log"}
            <Arrow className="h-4 w-4" />
          </button>
        </section>

        <section className="console-card console-rise-4 p-5 md:p-6">
          <p className="console-eyebrow">{isAr ? "اختصارات" : "Shortcuts"}</p>
          <h2 className="console-title mt-1 text-xl text-foreground">
            {isAr ? "إدارة الموقع" : "Run the website"}
          </h2>
          <ul className="mt-4 space-y-1">
            {shortcuts.map((s) => (
              <li key={s.en}>
                <button
                  type="button"
                  onClick={() => onNavigateTab(s.to[0], s.to[1])}
                  className="group flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-start transition-colors hover:bg-[var(--console-canvas)] focus-visible:outline-2 focus-visible:outline-ring active:bg-muted"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ba734a]/10 text-[#ba734a]">
                    <s.icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-sm font-medium text-foreground">
                    {isAr ? s.ar : s.en}
                  </span>
                  <Arrow className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
