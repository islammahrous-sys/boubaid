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
  Landmark,
  Rocket,
  Award,
  UserCog,
  ShieldAlert,
  Clock,
  Settings,
  Sliders,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import type { ComponentType } from "react";

export type AdminRole = "admin" | "super_admin" | "editor" | "treasurer";

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
    label_ar: "الرئيسية والمتابعة",
    label_en: "Dashboard & Attention",
    description_ar: "المؤشرات التشغيلية والمهام المعلقة",
    description_en: "KPIs and pending tasks",
    icon: LayoutDashboard,
    tabs: [
      {
        id: "overview",
        label_ar: "لوحة القيادة والمهام",
        label_en: "Overview & Tasks",
        description_ar: "نظرة عامة على نشاط المنظومة والمهام التي تتطلب تدخلك",
        description_en: "System activity and actionable items requiring attention",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: "family",
    label_ar: "الأسرة وشجرة الأنساب",
    label_en: "Family & Heritage",
    description_ar: "سجلات الأفراد، شجرة النسب، والفروع",
    description_en: "Member records, genealogy tree, and branches",
    icon: Users,
    roles: ["admin", "super_admin", "editor"],
    tabs: [
      {
        id: "members",
        label_ar: "سجل أفراد الأسرة",
        label_en: "Family Directory",
        description_ar: "إدارة بيانات وسجلات أفراد الأسرة وتحديث معلوماتهم",
        description_en: "Manage and update family member records",
        icon: Users,
      },
      {
        id: "tree",
        label_ar: "شجرة العائلة التفاعلية",
        label_en: "Interactive Family Tree",
        description_ar: "استعراض وتتبع الأجيال وشجرة النسب البصرية",
        description_en: "Visual genealogy chart and generational lineage",
        icon: Network,
      },
      {
        id: "branches",
        label_ar: "الفروع السبعة",
        label_en: "Seven Branches",
        description_ar: "إدارة فروع القبيلة وأعيان كل فرع",
        description_en: "Manage tribal branches and branch leaders",
        icon: GitBranch,
      },
      {
        id: "relationships",
        label_ar: "شبكة القرابة والنسب",
        label_en: "Kinship & Links",
        description_ar: "ربط علاقات الأبوة والأمومة والزواج بين الأفراد",
        description_en: "Manage parent-child and spousal relationships",
        icon: GitBranch,
      },
      {
        id: "history",
        label_ar: "تاريخ الأسرة والوثائق",
        label_en: "Family History",
        description_ar: "الأحداث التاريخية والمخطوطات التوثيقية",
        description_en: "Historical timeline and heritage entries",
        icon: History,
      },
      {
        id: "places",
        label_ar: "دليل المواقع والديوانيات",
        label_en: "Places & Diwaniyas",
        description_ar: "المعالم التاريخية، القرى، ومجالس الأسرة",
        description_en: "Historic landmarks, diwaniyas, and council halls",
        icon: MapPin,
      },
      {
        id: "privacy",
        label_ar: "الخصوصية وإعدادات الظهور",
        label_en: "Privacy Settings",
        description_ar: "مستويات إتاحة وظهور البيانات للعموم والأسرة",
        description_en: "Control public and family-only visibility",
        icon: ShieldCheck,
      },
    ],
  },
  {
    id: "content",
    label_ar: "المحتوى والنشر الرقمي",
    label_en: "Content & Publishing",
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
        label_ar: "الصفحات التفاعلية",
        label_en: "Dynamic Pages",
        description_ar: "تعديل وتخصيص صفحات الموقع والأقسام المخصصة",
        description_en: "Create and edit custom landing pages",
        icon: Layers,
      },
      {
        id: "events",
        label_ar: "الفعاليات واللقاءات",
        label_en: "Events & RSVPs",
        description_ar: "جدولة اللقاءات الدورية وتسجيل حضور الضيوف",
        description_en: "Schedule family gatherings and track registrations",
        icon: Calendar,
      },
      {
        id: "announcements",
        label_ar: "التنبيهات والإعلانات",
        label_en: "Announcements",
        description_ar: "الشريط الإخباري العاجل والإعلانات الهامة",
        description_en: "Urgent announcements ticker and notices",
        icon: Bell,
      },
      {
        id: "media_library",
        label_ar: "مكتبة الوسائط والتخزين",
        label_en: "Media Library",
        description_ar: "رفع وإدارة الصور والفيديوهات والتخزين السحابي",
        description_en: "Upload and manage photos, videos, and cloud storage",
        icon: ImageIcon,
      },
      {
        id: "library_items",
        label_ar: "الأرشيف والمستندات",
        label_en: "Document Archive",
        description_ar: "الكتب التاريخية والوثائق والمخطوطات الرقمية",
        description_en: "Historical books, official papers, and documents",
        icon: FolderArchive,
      },
      {
        id: "homepage",
        label_ar: "أقسام الصفحة الرئيسية",
        label_en: "Homepage Layout",
        description_ar: "ترتيب وتفعيل الأقسام الظاهرة في واجهة الموقع",
        description_en: "Manage home page hero sections and widgets",
        icon: Globe,
      },
      {
        id: "navigation",
        label_ar: "قوائم التصفح والروابط",
        label_en: "Navigation Menus",
        description_ar: "تخصيص روابط القائمة العلوية والسفلية للموقع",
        description_en: "Configure header and footer navigation menus",
        icon: Menu,
      },
      {
        id: "dna",
        label_ar: "دراسات الـ DNA الجينية",
        label_en: "DNA Studies (Y-DNA)",
        description_ar: "نتائج الفحوصات الجينية والتحورات السلالية",
        description_en: "Genetic analysis and haplogroup results",
        icon: Dna,
      },
    ],
  },
  {
    id: "community",
    label_ar: "التواصل والمجتمع",
    label_en: "Community & Inquiries",
    description_ar: "صندوق الرسائل، دليل الأعمال، وتوثيق العضويات",
    description_en: "Inbox, business directory, and verification requests",
    icon: MessageSquare,
    badgeKey: "pendingInquiries",
    roles: ["admin", "super_admin", "editor"],
    tabs: [
      {
        id: "inquiries",
        label_ar: "صندوق الوارد والرسائل",
        label_en: "Inbox & Messages",
        description_ar: "رسائل التواصل واستفسارات أفراد الأسرة والزوار",
        description_en: "Contact inquiries and user messages",
        icon: MessageSquare,
        badgeKey: "pendingInquiries",
      },
      {
        id: "directory",
        label_ar: "دليل الأعمال والمنشآت",
        label_en: "Business Directory",
        description_ar: "منشآت وشركات أبناء الأسرة ومشاريعهم التجارية",
        description_en: "Family member businesses and ventures",
        icon: ClipboardList,
      },
      {
        id: "verification",
        label_ar: "طلبات توثيق العضوية",
        label_en: "Membership Verification",
        description_ar: "مراجعة طلبات الانضمام وتأكيد الانتساب العائلي",
        description_en: "Review membership requests and lineage verification",
        icon: UserCheck,
        badgeKey: "pendingVerifications",
      },
    ],
  },
  {
    id: "treasury",
    label_ar: "الخزينة والمشاريع",
    label_en: "Treasury & Projects",
    description_ar: "المساهمات المالية، مبادرات المقر، ولوحة الشرف",
    description_en: "Contributions, initiatives, and honor roll",
    icon: Landmark,
    badgeKey: "pendingReceipts",
    roles: ["admin", "super_admin", "treasurer"],
    tabs: [
      {
        id: "treasury_ledger",
        label_ar: "سجل العمليات والمساهمات",
        label_en: "Contributions & Ledger",
        description_ar: "مراجعة التحويلات البنكية وإيصالات المساهمة المالية",
        description_en: "Audit bank receipts and contribution payments",
        icon: Landmark,
        badgeKey: "pendingReceipts",
      },
      {
        id: "initiatives",
        label_ar: "المبادرات ومقر الأسرة",
        label_en: "Initiatives & HQ Fund",
        description_ar: "مشاريع التطوير وحملات جمع الدعم للمقر الدائم",
        description_en: "Family headquarters fund and development campaigns",
        icon: Rocket,
      },
      {
        id: "achievers",
        label_ar: "لوحة الشرف والمتميزين",
        label_en: "Roll of Honour",
        description_ar: "تكريم أصحاب الإنجازات والدرجات العلمية الرفيعة",
        description_en: "Academic and professional excellence awards",
        icon: Award,
      },
    ],
  },
  {
    id: "system",
    label_ar: "الإدارة والنظام",
    label_en: "System & Governance",
    description_ar: "إدارة الحسابات، الصلاحيات، وسجل العمليات",
    description_en: "Users, access control, audit logs, and settings",
    icon: Settings,
    roles: ["admin", "super_admin"],
    tabs: [
      {
        id: "users",
        label_ar: "المستخدمون والحسابات",
        label_en: "User Accounts",
        description_ar: "إدارة حسابات المشرفين والأعضاء المسجلين",
        description_en: "Manage administrator and member accounts",
        icon: UserCog,
      },
      {
        id: "roles_matrix",
        label_ar: "مصفوفة الصلاحيات والأدوار",
        label_en: "Roles & Permissions",
        description_ar: "تحديد صلاحيات الوصول والمسؤوليات الإدارية",
        description_en: "Configure role-based access control (RBAC)",
        icon: ShieldAlert,
      },
      {
        id: "audit_logs",
        label_ar: "سجل الرقابة والعمليات",
        label_en: "Audit & Security Logs",
        description_ar: "سجل زمني لجميع الإجراءات والتعديلات في المنظومة",
        description_en: "Traceable log of all system changes and logins",
        icon: Clock,
      },
      {
        id: "site_settings",
        label_ar: "إعدادات المنصة والحوكمة",
        label_en: "Platform Settings",
        description_ar: "بيانات التواصل، الهوية البصرية، وقواعد النشر",
        description_en: "Platform identity, contact details, and policies",
        icon: Sliders,
      },
    ],
  },
];
