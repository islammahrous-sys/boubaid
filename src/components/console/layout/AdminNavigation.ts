import {
  LayoutDashboard,
  Users,
  GitBranch,
  Network,
  History,
  MapPin,
  ShieldCheck,
  Globe,
  Layers,
  Newspaper,
  Bell,
  Calendar,
  Menu,
  Dna,
  Image as ImageIcon,
  FolderArchive,
  MessageSquare,
  ClipboardList,
  UserCheck,
  Megaphone,
  Rocket,
  Award,
  UserCog,
  ShieldAlert,
  Clock,
  Settings,
  Sliders,
  Sparkles,
  AlertTriangle,
  BookUser,
  Building2,
  Mail,
} from "lucide-react";
import type { ComponentType } from "react";

/**
 * Console roles. These mirror the database helpers the RLS policies use, so a
 * tab is only offered to someone whose server calls (and RLS) will accept it:
 *   editor         -> private.can_edit_content  (editor, content_manager)
 *   family_manager -> private.can_manage_family
 * admin / super_admin satisfy all of them.
 */
export type AdminRole = "admin" | "super_admin" | "editor" | "family_manager";

const ADMINS: AdminRole[] = ["admin", "super_admin"];

export type AdminSubTab = {
  id: string;
  label_ar: string;
  label_en: string;
  description_ar?: string;
  description_en?: string;
  icon: ComponentType<{ className?: string }>;
  badgeKey?: string;
  roles?: AdminRole[];
};

export type AdminDomainGroup = {
  id: string;
  label_ar: string;
  label_en: string;
  description_ar?: string;
  description_en?: string;
  icon: ComponentType<{ className?: string }>;
  badgeKey?: string;
  roles?: AdminRole[];
  tabs: AdminSubTab[];
};

export const ADMIN_DOMAINS: AdminDomainGroup[] = [
  {
    id: "dashboard",
    label_ar: "الرئيسية",
    label_en: "Overview",
    description_ar: "المؤشرات التشغيلية والمهام المعلقة",
    description_en: "KPIs and pending tasks",
    icon: LayoutDashboard,
    roles: ADMINS,
    tabs: [
      {
        id: "overview",
        label_ar: "لوحة اليوم",
        label_en: "Today",
        description_ar: "نظرة عامة على نشاط المنظومة والمهام التي تتطلب تدخلك",
        description_en: "System activity and actionable items requiring attention",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: "family",
    label_ar: "الأسرة والأنساب",
    label_en: "Family & Lineage",
    description_ar: "سجلات الأفراد، شجرة النسب، والفروع",
    description_en: "Member records, genealogy tree, and branches",
    icon: Users,
    roles: [...ADMINS, "family_manager"],
    tabs: [
      {
        id: "members",
        label_ar: "سجل الأفراد",
        label_en: "Members",
        description_ar: "السجل المدني للمشجرة وقاعدة بيانات أفراد ونسب الأسرة",
        description_en: "Genealogy database of family members and lineage",
        icon: BookUser,
      },
      {
        id: "tree",
        label_ar: "الشجرة التفاعلية",
        label_en: "Family Tree",
        description_ar: "استعراض وتتبع الأجيال وشجرة النسب البصرية",
        description_en: "Visual genealogy chart and generational lineage",
        icon: Network,
      },
      {
        id: "branches",
        label_ar: "الفروع",
        label_en: "Branches",
        description_ar: "إدارة فروع القبيلة وأعيان كل فرع",
        description_en: "Manage tribal branches and branch leaders",
        icon: GitBranch,
      },
      {
        id: "relationships",
        label_ar: "صلات القرابة",
        label_en: "Kinship",
        description_ar: "ربط علاقات الأبوة والأمومة والزواج بين الأفراد",
        description_en: "Manage parent-child and spousal relationships",
        icon: GitBranch,
      },
      {
        id: "history",
        label_ar: "تاريخ الأسرة",
        label_en: "History",
        description_ar: "الأحداث التاريخية والمخطوطات التوثيقية",
        description_en: "Historical timeline and heritage entries",
        icon: History,
      },
      {
        id: "places",
        label_ar: "المواقع والمجالس",
        label_en: "Places",
        description_ar: "المعالم التاريخية، القرى، ومجالس الأسرة",
        description_en: "Historic landmarks, diwaniyas, and council halls",
        icon: MapPin,
      },
      {
        id: "privacy",
        label_ar: "الخصوصية",
        label_en: "Privacy",
        description_ar: "مستويات إتاحة وظهور البيانات للعموم والأسرة",
        description_en: "Control public and family-only visibility",
        icon: ShieldCheck,
      },
    ],
  },
  {
    id: "content",
    label_ar: "المحتوى والنشر",
    label_en: "Content",
    description_ar: "المقالات، الصفحات، الأخبار، والوسائط",
    description_en: "Articles, pages, announcements, and media archive",
    icon: Layers,
    roles: ["admin", "super_admin", "editor"],
    tabs: [
      {
        id: "articles",
        label_ar: "الأخبار والمقالات",
        label_en: "News & Articles",
        description_ar: "إعداد ونشر مقالات وأخبار المجلس والأسرة",
        description_en: "Publish and manage news and articles",
        icon: Newspaper,
        badgeKey: "draftArticles",
      },
      {
        id: "pages",
        label_ar: "الصفحات",
        label_en: "Pages",
        description_ar: "تعديل وتخصيص صفحات الموقع والأقسام المخصصة",
        description_en: "Create and edit custom landing pages",
        icon: Layers,
      },
      {
        id: "events",
        label_ar: "الفعاليات",
        label_en: "Events",
        description_ar: "جدولة اللقاءات الدورية وتسجيل حضور الضيوف",
        description_en: "Schedule family gatherings and track registrations",
        icon: Calendar,
      },
      {
        id: "announcements",
        label_ar: "الإعلانات",
        label_en: "Announcements",
        description_ar: "الشريط الإخباري العاجل والإعلانات الهامة",
        description_en: "Urgent announcements ticker and notices",
        icon: Bell,
      },
      {
        id: "media_library",
        label_ar: "الوسائط",
        label_en: "Media",
        description_ar: "رفع وإدارة الصور والفيديوهات والتخزين السحابي",
        description_en: "Upload and manage photos, videos, and cloud storage",
        icon: ImageIcon,
      },
      {
        id: "library_items",
        label_ar: "الأرشيف والمكتبة",
        label_en: "Archive & Library",
        description_ar: "الوثائق والمخطوطات، ومجموعات صور المتحف وترتيبها ونشرها",
        description_en: "Documents & manuscripts, plus museum photo collections",
        icon: FolderArchive,
      },
      {
        id: "homepage",
        label_ar: "واجهة الموقع",
        label_en: "Homepage",
        description_ar: "ترتيب وتفعيل الأقسام الظاهرة في واجهة الموقع",
        description_en: "Manage home page hero sections and widgets",
        icon: Globe,
        roles: ADMINS,
      },
      {
        id: "navigation",
        label_ar: "القوائم والروابط",
        label_en: "Menus",
        description_ar: "تخصيص روابط القائمة العلوية والسفلية للموقع",
        description_en: "Configure header and footer navigation menus",
        icon: Menu,
      },
      {
        id: "dna",
        label_ar: "الدراسات الجينية",
        label_en: "DNA Studies",
        description_ar: "نتائج الفحوصات الجينية والتحورات السلالية",
        description_en: "Genetic analysis and haplogroup results",
        icon: Dna,
        roles: ADMINS,
      },
    ],
  },
  {
    id: "community",
    label_ar: "التواصل",
    label_en: "Community",
    description_ar: "صندوق الرسائل واستفسارات التواصل، ودليل المنشآت والأعمال",
    description_en: "Contact inquiries, messages, and family business directory",
    icon: MessageSquare,
    badgeKey: "pendingInquiries",
    roles: ["admin", "super_admin", "editor"],
    tabs: [
      {
        id: "inquiries",
        label_ar: "صندوق الوارد",
        label_en: "Inbox",
        description_ar: "رسائل التواصل واستفسارات أفراد الأسرة والزوار",
        description_en: "Contact inquiries and user messages",
        icon: MessageSquare,
        badgeKey: "pendingInquiries",
      },
      {
        id: "directory",
        label_ar: "دليل الأعمال",
        label_en: "Business Directory",
        description_ar: "منشآت وشركات أبناء الأسرة ومشاريعهم التجارية",
        description_en: "Family member businesses and ventures",
        icon: Building2,
        roles: ADMINS,
      },
      {
        id: "services",
        label_ar: "خدمات «أسرتي تنتج»",
        label_en: "Family Services",
        description_ar: "إدارة الخدمات في التصنيفين ورفع وثائقها",
        description_en: "Manage both service categories and upload their documents",
        icon: Layers,
        roles: ADMINS,
      },
      {
        id: "committees",
        label_ar: "اللجان",
        label_en: "Committees",
        description_ar: "أسماء اللجان وترتيبها واستقبالها للطلبات في مركز الطلبات",
        description_en: "Committee names, order and whether they accept Requests Hub requests",
        icon: Users,
        roles: ADMINS,
      },
    ],
  },
  {
    id: "projects",
    label_ar: "المبادرات والتكريم",
    label_en: "Initiatives & Honours",
    description_ar: "مبادرات المقر ومشاريع التطوير، ولوحة الشرف",
    description_en: "Initiatives, development projects, and honour roll",
    icon: Rocket,
    roles: [...ADMINS, "editor"],
    tabs: [
      {
        id: "initiatives",
        label_ar: "المبادرات",
        label_en: "Initiatives",
        description_ar: "مشاريع التطوير ومبادرات المقر الدائم",
        description_en: "Family headquarters and development initiatives",
        icon: Rocket,
      },
      {
        id: "achievers",
        label_ar: "لوحة الشرف",
        label_en: "Honour Roll",
        description_ar: "تكريم أصحاب الإنجازات والدرجات العلمية الرفيعة",
        description_en: "Academic and professional excellence awards",
        icon: Award,
      },
    ],
  },
  {
    id: "system",
    label_ar: "الإدارة",
    label_en: "Administration",
    description_ar: "حسابات المستخدمين، مراجعة طلبات التوثيق، الصلاحيات، وسجل العمليات",
    description_en: "User accounts, verification requests, access control, and audit logs",
    icon: Settings,
    badgeKey: "pendingVerifications",
    roles: ["admin", "super_admin"],
    tabs: [
      {
        id: "users",
        label_ar: "المستخدمون والتوثيق",
        label_en: "Users & Verification",
        description_ar: "إدارة حسابات المستخدمين، مراجعة طلبات التوثيق، وإسناد الأدوار",
        description_en: "Manage administrator and member accounts, verify lineage requests",
        icon: UserCheck,
        badgeKey: "pendingVerifications",
      },
      {
        id: "roles_matrix",
        label_ar: "الأدوار والصلاحيات",
        label_en: "Roles & Permissions",
        description_ar: "تحديد صلاحيات الوصول والمسؤوليات الإدارية",
        description_en: "Configure role-based access control (RBAC)",
        icon: ShieldAlert,
      },
      {
        id: "audit_logs",
        label_ar: "سجل العمليات",
        label_en: "Audit Log",
        description_ar: "سجل زمني لجميع الإجراءات والتعديلات في المنظومة",
        description_en: "Traceable log of all system changes and logins",
        icon: Clock,
      },
      {
        id: "site_settings",
        label_ar: "إعدادات المنصة",
        label_en: "Settings",
        description_ar: "بيانات التواصل، الهوية البصرية، وقواعد النشر",
        description_en: "Platform identity, contact details, and policies",
        icon: Sliders,
      },
      {
        id: "email_notifications",
        label_ar: "البريد والإشعارات",
        label_en: "Email & Alerts",
        description_ar: "سجل الرسائل المرسلة، فحص التسليم، قوالب البريد، وإعادة المحاولة",
        description_en: "Delivery logs, delivery status, email templates, and retries",
        icon: Mail,
      },
    ],
  },
];

/** Maps the account's database roles onto the console roles used above. */
export function consoleRolesFor(roles: readonly string[] | undefined | null): AdminRole[] {
  const has = (r: string) => !!roles?.includes(r);
  const list: AdminRole[] = [];
  if (has("super_admin")) list.push("super_admin");
  if (has("admin")) list.push("admin");
  if (has("editor") || has("content_manager")) list.push("editor");
  if (has("family_manager")) list.push("family_manager");
  return list;
}

const allowed = (needed: AdminRole[] | undefined, mine: AdminRole[]) =>
  !needed || needed.some((r) => mine.includes(r));

/** First domain/tab a given set of console roles may open (the landing page). */
export function defaultConsoleLocation(mine: AdminRole[]): { domain: string; tab: string } {
  if (mine.includes("admin") || mine.includes("super_admin")) {
    return { domain: "dashboard", tab: "overview" };
  }
  for (const dom of ADMIN_DOMAINS) {
    if (!allowed(dom.roles, mine)) continue;
    const tab = dom.tabs.find((t) => allowed(t.roles, mine));
    if (tab) return { domain: dom.id, tab: tab.id };
  }
  return { domain: "dashboard", tab: "overview" };
}

/**
 * Preloads the chunk for an admin tab's manager component so that when the
 * user clicks or touches a sidebar button, the chunk is already cached and
 * React Suspense never displays a fallback skeleton.
 */
export const preloadAdminManager = (tabId: string) => {
  if (typeof window === "undefined") return;
  switch (tabId) {
    case "overview":
      void import("@/components/console/dashboard/AdminDashboardOverview");
      break;
    case "members":
    case "privacy":
      void import("@/components/console/family/FamilyMembersTable");
      break;
    case "tree":
      void import("@/components/console/family/FamilyTreeViewer");
      break;
    case "branches":
      void import("@/components/console/family/FamilyBranchesManager");
      break;
    case "relationships":
      void import("@/components/console/family/FamilyRelationshipsManager");
      break;
    case "history":
      void import("@/components/console/family/FamilyHistoryManager");
      break;
    case "places":
      void import("@/components/console/places/PlacesManager");
      break;
    case "articles":
      void import("@/components/console/articles/ArticlesManager");
      break;
    case "pages":
      void import("@/components/console/cms/PagesManager");
      break;
    case "events":
      void import("@/components/console/events/EventsManager");
      break;
    case "announcements":
      void import("@/components/console/announcements/AnnouncementsManager");
      break;
    case "media_library":
      void import("@/components/console/media/MediaLibrary");
      break;
    case "library_items":
      void import("@/components/console/library/LibraryItemsManager");
      void import("@/components/console/museum/MuseumArchiveManager");
      break;
    case "homepage":
      void import("@/components/console/cms/HomepageManager");
      break;
    case "navigation":
      void import("@/components/console/navigation/NavigationManager");
      break;
    case "dna":
      void import("@/components/console/dna/DnaStudiesManager");
      break;
    case "inquiries":
      void import("@/components/console/inquiries/InquiriesManager");
      break;
    case "directory":
      void import("@/components/console/directory/DirectoryManager");
      break;
    case "services":
      void import("@/components/console/services/ServicesManager");
      break;
    case "committees":
      void import("@/components/console/committees/CouncilCommitteesManager");
      break;
    case "initiatives":
      void import("@/components/console/initiatives/InitiativesManager");
      break;
    case "achievers":
      void import("@/components/console/achievers/AchieversManager");
      break;
    case "verification":
    case "users":
      void import("@/components/console/users/UsersManager");
      break;
    case "roles_matrix":
      void import("@/components/console/users/RolesPermissionMatrix");
      break;
    case "audit_logs":
      void import("@/components/console/activity/AuditLogsViewer");
      break;
    case "site_settings":
      void import("@/components/console/settings/SiteSettingsManager");
      break;
    case "email_notifications":
      void import("@/components/console/notifications/AdminNotificationCenter");
      break;
  }
};
