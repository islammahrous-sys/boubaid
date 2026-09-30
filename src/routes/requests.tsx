import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  Banknote,
  BookOpen,
  Briefcase,
  Calculator,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Dna,
  FileBadge,
  FileText,
  Flower2,
  Frame,
  GitBranch,
  Globe,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  Images,
  Landmark,
  LayoutTemplate,
  Mail,
  Megaphone,
  Network,
  PencilLine,
  Scale,
  ShieldCheck,
  Shirt,
  Sparkles,
  Store,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionRail, type RailSection } from "@/components/site/SectionRail";
import { Eyebrow, Ornament } from "@/components/site/Editorial";
import { getCanonicalUrl } from "@/lib/seo";
import { CouncilRequestForm } from "@/components/site/CouncilRequestForm";
import type { CouncilRequestType } from "@/lib/forms.schemas";
import {
  COMMITTEE_REQUEST_DESTINATIONS,
  COUNCIL_REQUESTS,
  TEMPLATE_REQUESTS,
} from "@/lib/council-requests";
import { copy } from "@/content/page-copy/requests";

export const Route = createFileRoute("/requests")({
  /**
   * `?request=<type>` lets any action elsewhere on the site (Roll of Honour
   * nomination, archive photo submission, …) land directly on its own request
   * form instead of asking the visitor to find the card again.
   */
  validateSearch: (search: Record<string, unknown>): { request?: CouncilRequestType } => {
    const value = search.request;
    return typeof value === "string" && value in COUNCIL_REQUESTS
      ? { request: value as CouncilRequestType }
      : {};
  },
  head: () => ({
    meta: [
      { title: "مركز الطلبات | آل بوعبيد" },
      {
        name: "description",
        content:
          "مركز الطلبات في موقع أسرة آل بوعبيد: بوابة واحدة لتقديم طلبات توثيق العضوية والاشتراك والمساهمة وإدراج الأعمال والترشيح لسجل المتميزين ومتابعة حالتها.",
      },
      { property: "og:title", content: "مركز الطلبات — آل بوعبيد" },
      {
        property: "og:description",
        content: "بوابة واحدة لجميع الطلبات: التقديم، المتابعة، والاعتماد.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: getCanonicalUrl("/requests") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/requests") }],
  }),
  component: RequestsHubPage,
});



type RequestGroup =
  | "membership"
  | "committee_requests"
  | "services"
  | "tree"
  | "fund"
  | "participation"
  | "announcements"
  | "general";

const groupTitles: Record<RequestGroup, BiText> = {
  membership: { ar: "العضوية والاشتراك", en: "Membership & subscription" },
  committee_requests: {
    ar: "طلبات لجان مجلس الأسرة",
    en: "Family Council Committee Requests",
  },
  services: { ar: "الخدمات ودليل الأعمال", en: "Services & business directory" },
  tree: { ar: "شجرة العائلة والأرشيف والتراث", en: "Family tree, archive & heritage" },
  fund: { ar: "صندوق التنمية والدعم", en: "Development fund & support" },
  participation: { ar: "المشاركة واللجان والبرامج", en: "Participation, committees & programmes" },
  announcements: { ar: "الإعلانات والمناسبات", en: "Announcements & occasions" },
  general: { ar: "طلبات عامة", en: "General requests" },
};

const groupOrder: RequestGroup[] = [
  "membership",
  "committee_requests",
  "services",
  "tree",
  "fund",
  "participation",
  "announcements",
  "general",
];

/** Logo variant with the strongest contrast against each category's colour band. */
const bandLogo: Record<RequestGroup, string> = {
  membership: "/logo-mark-cream.svg",
  committee_requests: "/logo-mark-cream.svg",
  services: "/logo-mark-cream.svg",
  tree: "/logo-mark-brown.svg",
  fund: "/logo-mark-brown.svg",
  participation: "/logo-mark-cream.svg",
  announcements: "/logo-mark-brown.svg",
  general: "/logo-mark-brown.svg",
};

type RequestEntry = {
  id: string;
  group: RequestGroup;
  /** Either an existing page on this site… */
  to?: string;
  /** …or one of the hub's own forms, submitted in place. */
  form?: CouncilRequestType;
  Icon: LucideIcon;
  name: BiText;
  desc: BiText;
  requiresAuth?: boolean;
  /** Official template code, for the announcement requests linked to a template. */
  templateCode?: string;
};

const committeeIcons: Record<
  (typeof COMMITTEE_REQUEST_DESTINATIONS)[number]["slug"],
  LucideIcon
> = {
  "development-follow-up": ClipboardList,
  "family-headquarters": Landmark,
  "finance-investment": Banknote,
  "family-communication": HeartHandshake,
  "activities-initiatives": Sparkles,
  "media-support-services": Megaphone,
};

/** Only request types that actually exist on this website. */
const requests: RequestEntry[] = [
  {
    id: "membership",
    group: "membership",
    to: "/account",
    Icon: BadgeCheck,
    name: { ar: "طلب توثيق العضوية", en: "Membership verification request" },
    desc: {
      ar: "تقديم طلب اعتماد العضوية للأمانة العامة وإصدار بطاقة العضوية الرسمية.",
      en: "Ask the secretariat to verify your membership and issue your official family card.",
    },
    requiresAuth: true,
  },
  {
    id: "membership-card",
    group: "membership",
    form: "membership_card",
    Icon: CreditCard,
    name: { ar: "طلب إصدار أو تجديد بطاقة العضوية", en: "Membership card issue or renewal" },
    desc: {
      ar: "طلب إصدار بطاقة عضوية جديدة أو تجديد بطاقة قائمة بعد توثيق العضوية.",
      en: "Request a new membership card, or renew an existing one after verification.",
    },
  },
  {
    id: "contribution",
    group: "membership",
    to: "/contribute",
    Icon: Banknote,
    name: { ar: "الاشتراك والمساهمة", en: "Subscription & contribution" },
    desc: {
      ar: "تسجيل اشتراك أو مساهمة في صندوق التنمية العائلية وإرفاق إشعار السداد للمراجعة.",
      en: "Register a subscription or contribution to the family development fund and attach your payment notice for review.",
    },
  },

  ...COMMITTEE_REQUEST_DESTINATIONS.map(
    (committee): RequestEntry => ({
      id: committee.slug,
      group: "committee_requests",
      form: committee.requestType as CouncilRequestType,
      Icon: committeeIcons[committee.slug],
      name: committee.name,
      desc: committee.desc,
    }),
  ),

  {
    id: "directory",
    group: "services",
    form: "business_listing_new",
    Icon: Briefcase,
    name: { ar: "إدراج نشاط تجاري في الدليل", en: "Business directory listing" },
    desc: {
      ar: "طلب إضافة منشأة أو نشاط تجاري لأحد أبناء الأسرة إلى دليل الأعمال.",
      en: "Request that a family member's business be added to the family business directory.",
    },
  },
  {
    id: "directory-update",
    group: "services",
    form: "business_listing_update",
    Icon: PencilLine,
    name: { ar: "طلب تحديث بيانات الدليل التجاري", en: "Business listing update request" },
    desc: {
      ar: "طلب تعديل بيانات منشأة مدرجة في دليل الأعمال: الوصف أو التواصل أو الموقع.",
      en: "Ask for a listed business entry to be updated: description, contact details, or website.",
    },
  },
  {
    id: "service-establishment",
    group: "services",
    form: "service_establishment",
    Icon: Store,
    name: { ar: "طلب اضافة خدمة – منشأت", en: "Add a service request – Establishments" },
    desc: {
      ar: "طلب إضافة خدمة تقدمها منشأة من منشآت الأسرة إلى قائمة خدمات المنشآت.",
      en: "Request that a service offered by a family establishment be added to the establishment services list.",
    },
  },
  {
    id: "service-family",
    group: "services",
    form: "service_family",
    Icon: HandHeart,
    name: {
      ar: "طلب اضافة خدمة – افراد العائلة",
      en: "Add a service request – Family members",
    },
    desc: {
      ar: "طلب إضافة خدمة يقدمها أحد أفراد الأسرة إلى قائمة خدمات أفراد الأسرة.",
      en: "Request that a service offered by a family member be added to the family member services list.",
    },
  },
  {
    id: "legal-consultancy",
    group: "services",
    form: "legal_consultancy",
    Icon: Scale,
    name: { ar: "طلب استشارة قانونية", en: "Legal consultancy request" },
    desc: {
      ar: "طلب استشارة قانونية أو تحكيم عبر خدمة الاستشارات القانونية المدرجة في دليل الخدمات.",
      en: "Request legal consultancy or arbitration through the listed legal services provider.",
    },
  },
  {
    id: "accounting-service",
    group: "services",
    form: "accounting_service",
    Icon: Calculator,
    name: { ar: "طلب خدمة محاسبية", en: "Accounting service request" },
    desc: {
      ar: "طلب خدمة محاسبية أو مراجعة مالية عبر الخدمة المحاسبية المدرجة في دليل الخدمات.",
      en: "Request accounting or bookkeeping work through the listed accounting service.",
    },
  },
  {
    id: "website-design",
    group: "services",
    form: "website_design",
    Icon: Globe,
    name: { ar: "طلب تصميم موقع إلكتروني", en: "Website design request" },
    desc: {
      ar: "طلب تصميم موقع إلكتروني أو استشارة مؤسسية عبر خدمة المنشآت المدرجة.",
      en: "Request website design or business consultancy through the listed establishment service.",
    },
  },
  {
    id: "bisht-purchase",
    group: "services",
    form: "bisht_purchase",
    Icon: Shirt,
    name: { ar: "طلب شراء بشت", en: "Bisht purchase enquiry" },
    desc: {
      ar: "الاستفسار عن أنواع البشوت ومقاساتها لدى العبادل للبشوت وطلب الشراء.",
      en: "Enquire about types and sizes from Al-Abadel Bisht and place an order.",
    },
  },
  {
    id: "oud-purchase",
    group: "services",
    form: "oud_purchase",
    Icon: Flower2,
    name: { ar: "طلب شراء عود", en: "Oud purchase enquiry" },
    desc: {
      ar: "الاستفسار عن أنواع العود وكمياته لدى العبادل للعود وطلب الشراء.",
      en: "Enquire about types and quantities from Al-Abadel Oud and place an order.",
    },
  },

  {
    id: "frame",
    group: "tree",
    to: "/official-family-tree",
    Icon: Frame,
    name: { ar: "طلب لوحة شجرة العائلة", en: "Family tree frame order" },
    desc: {
      ar: "الاطلاع على مقاسات اللوحة الرسمية المصورة لشجرة العائلة وطلب النسخة المناسبة.",
      en: "See the sizes of the Official Illustrated Family Tree and order the one you want.",
    },
  },
  {
    id: "digital-tree",
    group: "tree",
    form: "digital_family_tree",
    Icon: Network,
    name: { ar: "طلب شجرة عائلة رقمية", en: "Digital family tree request" },
    desc: {
      ar: "طلب إعداد شجرة عائلة إلكترونية أو رقمية لفرع أو أسرة محددة.",
      en: "Request an electronic or digital family tree for a specific branch or household.",
    },
  },
  {
    id: "tree-correction",
    group: "tree",
    form: "tree_data_correction",
    Icon: GitBranch,
    name: {
      ar: "طلب تصحيح أو إضافة بيانات في شجرة العائلة",
      en: "Family tree data correction or addition",
    },
    desc: {
      ar: "الإبلاغ عن خطأ في بيانات أحد الأفراد أو طلب إضافة مولود أو زواج أو وفاة إلى الشجرة.",
      en: "Report an error in a member's record, or ask for a birth, marriage, or death to be added.",
    },
  },
  {
    id: "archive-contribution",
    group: "tree",
    form: "archive_contribution",
    Icon: Images,
    name: { ar: "طلب إضافة صور إلى الأرشيف", en: "Archive photo contribution" },
    desc: {
      ar: "إتاحة صور عائلية أو وثائق للأمانة العامة لإضافتها إلى مجلدات الأرشيف المناسبة.",
      en: "Offer family photographs or documents so the secretariat can add them to the right archive folder.",
    },
  },
  {
    id: "library-submission",
    group: "tree",
    form: "library_submission",
    Icon: BookOpen,
    name: { ar: "طلب إضافة مادة إلى المكتبة الرقمية", en: "Digital library submission" },
    desc: {
      ar: "ترشيح وثيقة أو مخطوطة أو تسجيل صوتي لإضافته إلى المكتبة الرقمية للأسرة.",
      en: "Submit a document, manuscript, or recording for inclusion in the family digital library.",
    },
  },
  {
    id: "museum-visit",
    group: "tree",
    form: "museum_visit",
    Icon: Landmark,
    name: { ar: "طلب زيارة المتحف", en: "Museum visit request" },
    desc: {
      ar: "طلب تنسيق زيارة لمجموعة المتحف العائلي وتحديد الموعد وعدد الزوار.",
      en: "Ask to arrange a visit to the family museum collection, with a date and party size.",
    },
  },
  {
    id: "dna-participation",
    group: "tree",
    form: "dna_participation",
    Icon: Dna,
    name: { ar: "طلب المشاركة في الدراسة الجينية", en: "Genetic study participation request" },
    desc: {
      ar: "التقدم للمشاركة في الدراسة الجينية لتوثيق النسب عبر الفروع.",
      en: "Apply to take part in the genetic study documenting lineage across the branches.",
    },
  },

  {
    id: "fund-attestation",
    group: "fund",
    form: "fund_attestation",
    Icon: FileBadge,
    name: { ar: "طلب شهادة أو إثبات من الصندوق", en: "Fund certificate or attestation request" },
    desc: {
      ar: "طلب شهادة أو إثبات رسمي من صندوق التنمية العائلية لغرض محدد.",
      en: "Request an official certificate or attestation from the family development fund.",
    },
  },
  {
    id: "financial-statements",
    group: "fund",
    form: "financial_statement_copy",
    Icon: FileText,
    name: { ar: "طلب نسخة من القوائم المالية", en: "Financial statement copy request" },
    desc: {
      ar: "طلب نسخة من القوائم المالية المعتمدة لسنة مالية محددة.",
      en: "Request a copy of the approved financial statements for a given financial year.",
    },
  },
  {
    id: "social-assistance",
    group: "fund",
    form: "social_assistance",
    Icon: HeartHandshake,
    name: { ar: "طلب دعم أو مساعدة اجتماعية", en: "Social assistance request" },
    desc: {
      ar: "التقدم بطلب دعم عبر برنامج التكافل والدعم الاجتماعي، ويُعالج الطلب بسرّية.",
      en: "Apply for support through the social solidarity programme; requests are handled confidentially.",
    },
  },

  {
    id: "committee-nomination",
    group: "participation",
    form: "committee_nomination",
    Icon: Users,
    name: {
      ar: "طلب ترشيح عضوية في احد اللجان",
      en: "Committee membership nomination request",
    },
    desc: {
      ar: "التقدم بترشيح نفسك لعضوية إحدى لجان مجلس الأسرة مع بيان المؤهلات وأسباب الترشيح.",
      en: "Nominate yourself for membership of one of the standing committees, stating your qualifications.",
    },
  },
  {
    id: "achiever",
    group: "participation",
    form: "achiever_nomination",
    Icon: Award,
    name: { ar: "الترشيح لسجل المتميزين", en: "Roll of Honour nomination" },
    desc: {
      ar: "ترشيح أحد أفراد الأسرة لتوثيق إنجاز علمي أو مهني في سجل المتميزين.",
      en: "Nominate a family member so an academic or professional achievement is recorded in the Roll of Honour.",
    },
  },
  {
    id: "family-competencies",
    group: "participation",
    form: "family_competencies_nomination",
    Icon: Users,
    name: { ar: "ترشيح كفاءات الأسرة", en: "Family Competencies Nomination" },
    desc: {
      ar: "ترشيح أحد أفراد الأسرة من أصحاب الكفاءات العلمية أو المهنية لإدراجه في قسم كفاءات الأسرة.",
      en: "Nominate a family member with academic or professional competencies for the Family Competencies section.",
    },
  },
  {
    id: "excellence-award",
    group: "participation",
    form: "excellence_award_application",
    Icon: Trophy,
    name: { ar: "الترشح لجائزة التميز", en: "Excellence Award Application" },
    desc: {
      ar: "التقدم لجائزة آل بوعبيد للتفوق العلمي والتميز وفق مجالات الجائزة المعتمدة.",
      en: "Apply for the Al Bu Obaid Award for Academic Excellence and Distinction in its approved categories.",
    },
  },
  {
    id: "ahsa-councils-join",
    group: "participation",
    form: "ahsa_family_councils_join",
    Icon: HeartHandshake,
    name: { ar: "الانضمام إلى مجالس أسر الأحساء", en: "Join the Al-Ahsa Family Councils" },
    desc: {
      ar: "طلب الانضمام أو المشاركة في مجالس أسر الأحساء.",
      en: "Request to join or take part in the Al-Ahsa Family Councils.",
    },
  },
  {
    id: "youth-program",
    group: "participation",
    form: "youth_program_enrolment",
    Icon: GraduationCap,
    name: {
      ar: "طلب الاشتراك في برنامج تطوير مهارات الشباب",
      en: "Youth skills programme enrolment",
    },
    desc: {
      ar: "تسجيل الرغبة في الانضمام إلى برامج تطوير مهارات الشباب وورشها التدريبية.",
      en: "Register your interest in the youth skills development programmes and workshops.",
    },
  },
  {
    id: "competition-entry",
    group: "participation",
    form: "competition_entry",
    Icon: Trophy,
    name: { ar: "طلب المشاركة في مسابقة", en: "Competition entry request" },
    desc: {
      ar: "التسجيل في إحدى مسابقات الأسرة المعلنة ضمن أنشطة لجان مجلس الأسرة.",
      en: "Enter one of the family competitions announced within the Family Council committees' activities.",
    },
  },
  {
    id: "event-attendance",
    group: "participation",
    to: "/events",
    Icon: CalendarDays,
    name: { ar: "طلب تسجيل حضور فعالية", en: "Event attendance registration" },
    desc: {
      ar: "تسجيل الحضور في إحدى فعاليات الأسرة المعلنة وتحديد عدد المرافقين.",
      en: "Register your attendance at an announced family event and state the number of guests.",
    },
  },
  {
    id: "initiative-participation",
    group: "participation",
    to: "/committees",
    Icon: Sparkles,
    name: { ar: "طلب الانضمام إلى مشروع أو مبادرة", en: "Initiative participation request" },
    desc: {
      ar: "التقدم للمشاركة في إحدى مبادرات الأسرة أو مشاريعها القائمة.",
      en: "Apply to take part in one of the family's active initiatives or projects.",
    },
  },

  /**
   * Announcement requests are generated from the official template library —
   * exactly one request per template in النماذج والقوالب, carrying that
   * template's code. The three earlier generic announcement requests (a family
   * occasion request, a customised template request and an official greeting
   * request) duplicated these and have been retired in `council-requests.ts`.
   */
  ...TEMPLATE_REQUESTS.map(
    (tpl): RequestEntry => ({
      id: `template-${tpl.templateCode.toLowerCase()}`,
      group: "announcements",
      form: tpl.key,
      Icon: LayoutTemplate,
      name: tpl.title,
      desc: tpl.desc ?? tpl.details,
      templateCode: tpl.templateCode,
    }),
  ),

  {
    id: "inquiry",
    group: "general",
    to: "/contact",
    Icon: Mail,
    name: { ar: "استفسار أو طلب عام", en: "General inquiry or request" },
    desc: {
      ar: "إرسال استفسار أو طلب لا يشمله ما سبق إلى الأمانة العامة عبر صندوق الوارد.",
      en: "Send the secretariat any inquiry or request not covered above; it lands in the official inbox.",
    },
  },
];

type ApprovalEntry = {
  id: string;
  group: RequestGroup;
  name: BiText;
  desc: BiText;
  /** Either an in-console tab or a standalone review route. */
  admin?: { domain: string; tab: string };
  route?: "/treasury";
  allow: (roles: string[]) => boolean;
};

const isAdmin = (roles: string[]) => roles.includes("admin") || roles.includes("super_admin");

const approvals: ApprovalEntry[] = [
  {
    id: "ap-membership",
    group: "membership",
    name: { ar: "طلبات توثيق العضوية", en: "Membership verification requests" },
    desc: {
      ar: "مراجعة طلبات العضوية وإسناد الأدوار في شاشة المستخدمين والتوثيق.",
      en: "Review membership requests and role assignments in User Accounts & Verification.",
    },
    admin: { domain: "system", tab: "users" },
    allow: isAdmin,
  },
  {
    id: "ap-contributions",
    group: "fund",
    name: { ar: "المساهمات والاشتراكات", en: "Contributions & subscriptions" },
    desc: {
      ar: "اعتماد أو رفض إشعارات السداد في شاشة الخزينة.",
      en: "Approve or decline payment notices in the treasury screen.",
    },
    route: "/treasury",
    allow: (roles) => isAdmin(roles) || roles.includes("treasurer"),
  },
  {
    id: "ap-directory",
    group: "services",
    name: { ar: "طلبات إدراج الأعمال", en: "Business listing requests" },
    desc: {
      ar: "مراجعة المنشآت المقدَّمة قبل نشرها في دليل الأعمال.",
      en: "Review submitted businesses before they appear in the directory.",
    },
    admin: { domain: "community", tab: "directory" },
    allow: isAdmin,
  },
  {
    id: "ap-achievers",
    group: "participation",
    name: { ar: "ترشيحات سجل المتميزين", en: "Roll of Honour nominations" },
    desc: {
      ar: "اعتماد الترشيحات قبل إضافتها إلى لوحة الشرف.",
      en: "Approve nominations before they join the Roll of Honour.",
    },
    admin: { domain: "community", tab: "achievers" },
    allow: isAdmin,
  },
  {
    id: "ap-inquiries",
    group: "general",
    name: { ar: "الرسائل والاستفسارات", en: "Messages & inquiries" },
    desc: {
      ar: "معالجة رسائل التواصل وطلبات اللوحات في صندوق الوارد.",
      en: "Handle contact messages and frame orders in the inbox.",
    },
    admin: { domain: "community", tab: "inquiries" },
    allow: isAdmin,
  },
];

const railSections: RailSection[] = [
  { id: "submit", label: { ar: "تقديم طلب", en: "Submit" } },
  { id: "mine", label: { ar: "طلباتي", en: "My requests" } },
  { id: "approvals", label: { ar: "الاعتماد", en: "Approvals" } },
];

function RequestsHubPage() {
  const { t, lang } = useLang();
  const { user, roles } = useAuth();
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;

  const myApprovals = approvals.filter((a) => a.allow(roles));
  const { request: requestedForm } = Route.useSearch();
  // Committee-nomination links lead to the committee requests section, never auto-open a form.
  const autoOpen = requestedForm && requestedForm !== "committee_nomination" ? requestedForm : null;
  const [activeForm, setActiveForm] = useState<CouncilRequestType | null>(autoOpen);
  useEffect(() => {
    if (requestedForm !== "committee_nomination") return;
    const id = window.setTimeout(() => {
      document.getElementById("committee-requests")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
    return () => window.clearTimeout(id);
  }, [requestedForm]);

  return (
    <>
      <PageHeader eyebrow={t(copy.eyebrow)} title={t(copy.title)} subtitle={t(copy.subtitle)} />

      <SectionRail sections={railSections} className="print-hide" />

      <div className="container-page py-14 md:py-16">
        {/* ── مسار الطلب ─────────────────────────────────────── */}
        <section className="reveal-on-scroll">
          <Eyebrow rule>{t(copy.lifecycleTitle)}</Eyebrow>
          <ol className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12.5px] text-muted-foreground">
            {copy.steps.map((s, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2">
                  <span className="nums font-mono text-bronze/70 dark:text-gold/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{t(s)}</span>
                </span>
                {i < copy.steps.length - 1 ? (
                  <Arrow className="h-3.5 w-3.5 opacity-40" aria-hidden="true" />
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        {/* ── تقديم طلب ──────────────────────────────────────── */}
        <section
          id="submit"
          className="scroll-mt-28 reveal-on-scroll mt-14 border-t border-border pt-12"
        >
          <Eyebrow rule>{t(copy.submitTitle)}</Eyebrow>
          <p className="measure mt-3 text-[13px] leading-relaxed text-muted-foreground">
            {t(copy.submitNote)}
          </p>

          {groupOrder.map((g) => {
            const items = requests.filter((r) => r.group === g);
            if (items.length === 0) return null;
            return (
              <div
                key={g}
                id={g === "committee_requests" ? "committee-requests" : undefined}
                className="mt-10 scroll-mt-28"
              >
                <h2 className="flex items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground">
                  <span
                    className={`req-tone-${g} inline-block h-3 w-3 rounded-full bg-[var(--req-band)]`}
                    aria-hidden="true"
                  />
                  {t(groupTitles[g])}
                </h2>
                {g === "committee_requests" ? (
                  <p className="measure mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {t(copy.committeeIntro)}
                  </p>
                ) : null}
                <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((r) => {
                    const Icon = r.Icon;
                    const linkCls =
                      "mt-4 inline-flex items-center gap-2 self-start scroll-mt-28 rounded-md bg-[var(--req-band)] px-3.5 py-2 text-[13px] font-semibold text-[var(--req-on-band)] shadow-sm transition-opacity hover:opacity-90";
                    return (
                      <li
                        key={r.id}
                        className={`req-tone req-tone-${g} flex flex-col overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md`}
                      >
                        <div className="flex h-16 items-center justify-between gap-3 bg-[var(--req-band)] px-4">
                          <img
                            src={bandLogo[g]}
                            alt={t({ ar: "شعار مجلس أسرة آل بوعبيد", en: "Al Bu Obaid Family Council logo" })}
                            className="h-12 w-auto object-contain"
                            loading="lazy"
                          />
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--req-on-band)]/30 text-[var(--req-on-band)]">
                            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                        <h3 className="text-[15px] font-semibold text-[var(--req-text)]">
                          {t(r.name)}
                        </h3>
                        <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[var(--req-muted)]">
                          {t(r.desc)}
                        </p>
                        {r.templateCode ? (
                          <Link
                            to="/templates"
                            className="mt-3 inline-flex w-fit items-center gap-1.5 font-mono text-[11px] text-[var(--req-link)] underline-offset-4 hover:underline"
                          >
                            {r.templateCode}
                          </Link>
                        ) : null}
                        {r.requiresAuth && !user ? (
                          <p className="mt-3 text-[11.5px] text-[var(--req-muted)]">
                            {t(copy.signInNote)}
                          </p>
                        ) : null}
                        {r.form ? (
                          <button
                            type="button"
                            id={r.id}
                            onClick={() => setActiveForm(r.form!)}
                            className={linkCls}
                          >
                            {t(copy.action)}
                            <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        ) : (
                          <Link
                            to={r.requiresAuth && !user ? "/auth" : (r.to ?? "/contact")}
                            className={linkCls}
                          >
                            {t(copy.action)}
                            <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                        )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </section>

        <Ornament className="mt-16" />

        {/* ── طلباتي ─────────────────────────────────────────── */}
        <section
          id="mine"
          className="scroll-mt-28 reveal-on-scroll mt-16 border-t border-border pt-12"
        >
          <Eyebrow rule>{t(copy.mineTitle)}</Eyebrow>
          <p className="measure mt-3 text-[13px] leading-relaxed text-muted-foreground">
            {t(copy.mineNote)}
          </p>
          <Link
            to={user ? "/account" : "/auth"}
            className="mt-6 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
          >
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            {user ? t(copy.mineCta) : t(copy.signInCta)}
          </Link>
        </section>

        {/* ── الاعتماد ───────────────────────────────────────── */}
        {myApprovals.length > 0 ? (
          <section
            id="approvals"
            className="scroll-mt-28 reveal-on-scroll mt-16 border-t border-border pt-12"
          >
            <Eyebrow rule>{t(copy.approvalsTitle)}</Eyebrow>
            <p className="measure mt-3 text-[13px] leading-relaxed text-muted-foreground">
              {t(copy.approvalsNote)}
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {myApprovals.map((a) => {
                const reviewLinkClass =
                  "mt-4 inline-flex items-center gap-2 self-start rounded-md bg-[var(--req-band)] px-3.5 py-2 text-[13px] font-semibold text-[var(--req-on-band)] shadow-sm transition-opacity hover:opacity-90";
                return (
                  <li
                    key={a.id}
                    className={`req-tone req-tone-${a.group} flex flex-col overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md`}
                  >
                    <div className="flex h-16 items-center justify-between gap-3 bg-[var(--req-band)] px-4">
                      <img
                        src={bandLogo[a.group]}
                        alt={t({ ar: "شعار مجلس أسرة آل بوعبيد", en: "Al Bu Obaid Family Council logo" })}
                        className="h-12 w-auto max-w-[75%] object-contain"
                      />
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--req-on-band)]/30 text-[var(--req-on-band)]">
                        <ShieldCheck className="h-4.5 w-4.5" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-[15px] font-semibold text-[var(--req-text)]">{t(a.name)}</h3>
                      <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[var(--req-muted)]">
                        {t(a.desc)}
                      </p>
                      {a.route ? (
                        <Link to={a.route} className={reviewLinkClass}>
                          {lang === "ar" ? "فتح شاشة المراجعة" : "Open review screen"}
                          <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      ) : a.admin ? (
                        <Link
                          to="/admin"
                          search={{ domain: a.admin.domain, tab: a.admin.tab }}
                          className={reviewLinkClass}
                        >
                          {lang === "ar" ? "فتح شاشة المراجعة" : "Open review screen"}
                          <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </div>

      <CouncilRequestForm
        type={activeForm}
        open={activeForm !== null}
        onOpenChange={(next) => {
          if (!next) setActiveForm(null);
        }}
      />
    </>
  );
}
