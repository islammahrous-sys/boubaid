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
} from "lucide-react";
import type { ComponentType } from "react";

export type AdminSubTab = {
  id: string;
  label_ar: string;
  label_en: string;
  icon: ComponentType<{ className?: string }>;
  badgeKey?: string;
  roles?: ("admin" | "super_admin" | "editor" | "treasurer")[];
};

export type AdminDomainGroup = {
  id: string;
  label_ar: string;
  label_en: string;
  icon: ComponentType<{ className?: string }>;
  badgeKey?: string;
  roles?: ("admin" | "super_admin" | "editor" | "treasurer")[];
  tabs: AdminSubTab[];
};

export const ADMIN_DOMAINS: AdminDomainGroup[] = [
  {
    id: "dashboard",
    label_ar: "لوحة القيادة والمتابعة",
    label_en: "Command Center",
    icon: LayoutDashboard,
    tabs: [
      { id: "overview", label_ar: "نظرة عامة والمهام", label_en: "Overview & Attention", icon: LayoutDashboard },
    ],
  },
  {
    id: "family",
    label_ar: "الأسرة وشجرة الأنساب",
    label_en: "Genealogy & Family",
    icon: Users,
    tabs: [
      { id: "members", label_ar: "سجل أفراد الأسرة", label_en: "Family Members", icon: Users },
      { id: "tree", label_ar: "شجرة العائلة التفاعلية", label_en: "Family Tree", icon: Network },
      { id: "branches", label_ar: "الفروع السبعة", label_en: "Seven Branches", icon: GitBranch },
      { id: "relationships", label_ar: "روابط القرابة والنسب", label_en: "Kinship & Links", icon: GitBranch },
      { id: "history", label_ar: "سجل التاريخ والوثائق", label_en: "Family History", icon: History },
      { id: "places", label_ar: "دليل المواقع والديوانيات", label_en: "Places & Diwaniyas", icon: MapPin },
      { id: "privacy", label_ar: "الخصوصية والظهور", label_en: "Privacy Settings", icon: ShieldCheck },
    ],
  },
  {
    id: "content",
    label_ar: "المحتوى وإدارة الـ CMS",
    label_en: "Content & CMS",
    icon: Layers,
    tabs: [
      { id: "homepage", label_ar: "أقسام الصفحة الرئيسية", label_en: "Homepage Manager", icon: Globe },
      { id: "pages", label_ar: "صفحات الموقع الديناميكية", label_en: "Dynamic Pages", icon: Layers },
      { id: "articles", label_ar: "المقالات والأخبار", label_en: "Articles & News", icon: Newspaper },
      { id: "announcements", label_ar: "شريط الإعلانات العاجلة", label_en: "Announcements", icon: Bell },
      { id: "events", label_ar: "الفعاليات واللقاءات", label_en: "Events & RSVPs", icon: Calendar },
      { id: "navigation", label_ar: "قوائم التصفح والروابط", label_en: "Navigation Menus", icon: Menu },
      { id: "dna", label_ar: "الدراسة الجينية (Y-DNA)", label_en: "DNA Studies", icon: Dna },
    ],
  },
  {
    id: "media",
    label_ar: "الوسائط والأرشيف الرقمي",
    label_en: "Media & Digital Archive",
    icon: ImageIcon,
    tabs: [
      { id: "media_library", label_ar: "مكتبة الوسائط والتخزين", label_en: "Media Library", icon: ImageIcon },
      { id: "library_items", label_ar: "الأرشيف والمكتبة الرقمية", label_en: "Archive & Documents", icon: FolderArchive },
    ],
  },
  {
    id: "community",
    label_ar: "التواصل والمشاركات",
    label_en: "Community & Inquiries",
    icon: MessageSquare,
    badgeKey: "pendingInquiries",
    tabs: [
      { id: "inquiries", label_ar: "صندوق الرسائل الواردة", label_en: "Inquiries Inbox", icon: MessageSquare, badgeKey: "pendingInquiries" },
      { id: "directory", label_ar: "دليل الأعمال والمنشآت", label_en: "Business Directory", icon: ClipboardList },
      { id: "verification", label_ar: "طلبات توثيق العضوية", label_en: "Membership Verification", icon: UserCheck, badgeKey: "pendingVerifications" },
    ],
  },
  {
    id: "treasury",
    label_ar: "الخزينة والمبادرات",
    label_en: "Treasury & Initiatives",
    icon: Landmark,
    badgeKey: "pendingReceipts",
    tabs: [
      { id: "treasury_ledger", label_ar: "سجل الخزينة والمساهمات", label_en: "Treasury & Funds", icon: Landmark, badgeKey: "pendingReceipts" },
      { id: "initiatives", label_ar: "المبادرات والمقر الدائم", label_en: "Initiatives & HQ", icon: Rocket },
      { id: "achievers", label_ar: "سجل المتميزين ولوحة الشرف", label_en: "Roll of Honour", icon: Award },
    ],
  },
  {
    id: "system",
    label_ar: "المستخدمون والإعدادات والرقابة",
    label_en: "System & Governance",
    icon: Settings,
    tabs: [
      { id: "users", label_ar: "إدارة المستخدمين والحسابات", label_en: "User Management", icon: UserCog },
      { id: "roles_matrix", label_ar: "مصفوفة الصلاحيات (RBAC)", label_en: "Permissions Matrix", icon: ShieldAlert },
      { id: "audit_logs", label_ar: "سجل الرقابة والعمليات", label_en: "Security Audit Logs", icon: Clock },
      { id: "site_settings", label_ar: "إعدادات المنصة والحوكمة", label_en: "Platform Settings", icon: Sliders },
    ],
  },
];
