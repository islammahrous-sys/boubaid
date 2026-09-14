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
} from "lucide-react";
import type { ComponentType } from "react";
import { useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionRail, type RailSection } from "@/components/site/SectionRail";
import { Eyebrow, Ornament } from "@/components/site/Editorial";
import { getCanonicalUrl } from "@/lib/seo";
import { CouncilRequestForm } from "@/components/site/CouncilRequestForm";
import type { CouncilRequestType } from "@/lib/forms.schemas";

export const Route = createFileRoute("/requests")({
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

const copy = {
  eyebrow: { ar: "بوابة واحدة", en: "One front door" } as BiText,
  title: { ar: "مركز الطلبات", en: "Requests Hub" } as BiText,
  subtitle: {
    ar: "كل ما يمكن طلبه من الأسرة في مكان واحد: اختر نوع الطلب، قدّمه، ثم تابع حالته من حسابك.",
    en: "Everything you can request from the family council in one place: pick a request, submit it, then follow its status from your account.",
  } as BiText,

  submitTitle: { ar: "تقديم طلب", en: "Submit a Request" } as BiText,
  submitNote: {
    ar: "يفتح كل بند الصفحة الرسمية الخاصة به على الموقع، ولا يوجد نموذج بديل أو مواز.",
    en: "Each item opens its own official page on this site; there is no parallel or duplicate form.",
  } as BiText,

  mineTitle: { ar: "طلباتي ومتابعتها", en: "My Requests & Tracking" } as BiText,
  mineNote: {
    ar: "حالة الطلبات والإشعارات والسجل المالي تظهر في حسابك بعد تسجيل الدخول.",
    en: "Request status, notifications, and your contribution record appear in your account after signing in.",
  } as BiText,
  mineCta: { ar: "الانتقال إلى حسابي", en: "Go to my account" } as BiText,
  signInCta: { ar: "تسجيل الدخول لمتابعة طلباتي", en: "Sign in to track my requests" } as BiText,

  approvalsTitle: { ar: "طلبات تنتظر اعتمادي", en: "Awaiting My Approval" } as BiText,
  approvalsNote: {
    ar: "تظهر هذه الروابط لأصحاب الصلاحية فقط، وتفتح شاشات المراجعة النظامية في لوحة الإدارة كما هي.",
    en: "These links appear only to authorised reviewers and open the existing review screens in the console unchanged.",
  } as BiText,

  lifecycleTitle: { ar: "مسار الطلب", en: "How a request travels" } as BiText,
  steps: [
    { ar: "تقديم الطلب", en: "Submit" },
    { ar: "المراجعة", en: "Review" },
    { ar: "الاعتماد أو الاعتذار", en: "Approval or rejection" },
    { ar: "المتابعة والحالة", en: "Status & follow-up" },
    { ar: "الإنجاز", en: "Completion" },
  ] as BiText[],

  action: { ar: "تقديم الطلب", en: "Submit request" } as BiText,
  signInNote: { ar: "يتطلب تسجيل الدخول", en: "Requires sign-in" } as BiText,
};

type RequestGroup =
  | "membership"
  | "services"
  | "tree"
  | "fund"
  | "participation"
  | "announcements"
  | "general";

const groupTitles: Record<RequestGroup, BiText> = {
  membership: { ar: "العضوية والاشتراك", en: "Membership & subscription" },
  services: { ar: "الخدمات ودليل الأعمال", en: "Services & business directory" },
  tree: { ar: "شجرة العائلة والأرشيف والتراث", en: "Family tree, archive & heritage" },
  fund: { ar: "صندوق التنمية والدعم", en: "Development fund & support" },
  participation: { ar: "المشاركة واللجان والبرامج", en: "Participation, committees & programmes" },
  announcements: { ar: "الإعلانات والمناسبات", en: "Announcements & occasions" },
  general: { ar: "طلبات عامة", en: "General requests" },
};

const groupOrder: RequestGroup[] = [
  "membership",
  "services",
  "tree",
  "fund",
  "participation",
  "announcements",
  "general",
];

type RequestEntry = {
  id: string;
  group: RequestGroup;
  /** Either an existing page on this site… */
  to?: string;
  /** …or one of the hub's own forms, submitted in place. */
  form?: CouncilRequestType;
  Icon: ComponentType<{ className?: string }>;
  name: BiText;
  desc: BiText;
  requiresAuth?: boolean;
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

  {
    id: "directory",
    group: "services",
    to: "/directory",
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
      ar: "التقدم بترشيح نفسك لعضوية إحدى اللجان التنفيذية مع بيان المؤهلات وأسباب الترشيح.",
      en: "Nominate yourself for membership of one of the standing committees, stating your qualifications.",
    },
  },
  {
    id: "achiever",
    group: "participation",
    to: "/achievers",
    Icon: Award,
    name: { ar: "الترشيح لسجل المتميزين", en: "Roll of Honour nomination" },
    desc: {
      ar: "ترشيح أحد أفراد الأسرة لتوثيق إنجاز علمي أو مهني في سجل المتميزين.",
      en: "Nominate a family member so an academic or professional achievement is recorded in the Roll of Honour.",
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
      ar: "التسجيل في إحدى مسابقات الأسرة المعلنة في صفحة المسابقات والجوائز.",
      en: "Enter one of the family competitions announced on the competitions and awards page.",
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
    to: "/initiatives",
    Icon: Sparkles,
    name: { ar: "طلب الانضمام إلى مشروع أو مبادرة", en: "Initiative participation request" },
    desc: {
      ar: "التقدم للمشاركة في إحدى مبادرات الأسرة أو مشاريعها القائمة.",
      en: "Apply to take part in one of the family's active initiatives or projects.",
    },
  },

  {
    id: "occasion-announcement",
    group: "announcements",
    form: "occasion_announcement",
    Icon: Megaphone,
    name: {
      ar: "طلب إعلان مناسبة عائلية (مولود / زواج / تخرج)",
      en: "Family occasion announcement request",
    },
    desc: {
      ar: "طلب نشر إعلان رسمي عن مناسبة عائلية عبر قنوات الأسرة المعتمدة.",
      en: "Ask for an official announcement of a family occasion through the family's channels.",
    },
  },
  {
    id: "custom-template",
    group: "announcements",
    form: "custom_template",
    Icon: LayoutTemplate,
    name: { ar: "طلب قالب معدّل بالبيانات", en: "Customised announcement template request" },
    desc: {
      ar: "طلب إعداد أحد القوالب الرسمية مع كتابة بيانات المناسبة داخله.",
      en: "Request one of the official templates prepared with the details of your occasion.",
    },
  },
  {
    id: "official-greeting",
    group: "announcements",
    form: "official_greeting",
    Icon: Mail,
    name: {
      ar: "طلب تعزية أو تهنئة رسمية من المجلس",
      en: "Official condolence or greeting request",
    },
    desc: {
      ar: "طلب إصدار تعزية أو تهنئة رسمية باسم مجلس الأسرة في مناسبة محددة.",
      en: "Request an official condolence or greeting issued in the family council's name.",
    },
  },

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
  const [activeForm, setActiveForm] = useState<CouncilRequestType | null>(null);

  return (
    <>
      <PageHeader
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
      />

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
        <section id="submit" className="scroll-mt-28 reveal-on-scroll mt-14 border-t border-border pt-12">
          <Eyebrow rule>{t(copy.submitTitle)}</Eyebrow>
          <p className="measure mt-3 text-[13px] leading-relaxed text-muted-foreground">
            {t(copy.submitNote)}
          </p>

          {groupOrder.map((g) => {
            const items = requests.filter((r) => r.group === g);
            if (items.length === 0) return null;
            return (
              <div key={g} className="mt-10">
                <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-bronze dark:text-gold">
                  {t(groupTitles[g])}
                </h2>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((r) => {
                    const Icon = r.Icon;
                    return (
                      <li
                        key={r.id}
                        className="flex flex-col border border-border bg-card p-5 transition-colors hover:border-bronze dark:hover:border-gold rounded-md"
                      >
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded border border-border bg-secondary/50 text-bronze dark:text-gold">
                          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                        </span>
                        <h3 className="mt-4 text-[15px] font-semibold text-foreground">
                          {t(r.name)}
                        </h3>
                        <p className="mt-2 flex-1 text-[13px] leading-relaxed text-muted-foreground">
                          {t(r.desc)}
                        </p>
                        {r.requiresAuth && !user ? (
                          <p className="mt-3 text-[11.5px] text-muted-foreground">
                            {t(copy.signInNote)}
                          </p>
                        ) : null}
                        {r.form ? (
                          <button
                            type="button"
                            id={r.id}
                            onClick={() => setActiveForm(r.form!)}
                            className="mt-4 inline-flex items-center gap-2 self-start scroll-mt-28 border-b border-bronze pb-0.5 text-[13px] font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                          >
                            {t(copy.action)}
                            <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        ) : (
                          <Link
                            to={r.requiresAuth && !user ? "/auth" : (r.to ?? "/contact")}
                            className="mt-4 inline-flex items-center gap-2 self-start border-b border-bronze pb-0.5 text-[13px] font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                          >
                            {t(copy.action)}
                            <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                        )}
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
        <section id="mine" className="scroll-mt-28 reveal-on-scroll mt-16 border-t border-border pt-12">
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
              {myApprovals.map((a) => (
                <li key={a.id} className="border border-border bg-card p-5 rounded-md">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded border border-border bg-secondary/50 text-bronze dark:text-gold">
                    <ShieldCheck className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold text-foreground">{t(a.name)}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {t(a.desc)}
                  </p>
                  {a.route ? (
                    <Link
                      to={a.route}
                      className="mt-4 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-[13px] font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                    >
                      {lang === "ar" ? "فتح شاشة المراجعة" : "Open review screen"}
                      <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  ) : (
                    <Link
                      to="/admin"
                      search={{ domain: a.admin!.domain, tab: a.admin!.tab }}
                      className="mt-4 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-[13px] font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                    >
                      {lang === "ar" ? "فتح شاشة المراجعة" : "Open review screen"}
                      <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  )}
                </li>
              ))}
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
