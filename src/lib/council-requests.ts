import type { BiText } from "@/i18n/LanguageProvider";

/**
 * Catalogue of the request types served by the Requests Hub's shared form.
 *
 * Each entry supplies the dialog title plus the two content field labels. The
 * Zod enum, the dialog, and the server handler all derive from this single
 * table, so adding a new request type is one entry here.
 */
export type CouncilRequestDef = {
  title: BiText;
  topic: BiText;
  details: BiText;
};

export const COUNCIL_REQUESTS = {
  committee_nomination: {
    title: {
      ar: "طلب ترشيح عضوية في إحدى اللجان",
      en: "Committee membership nomination request",
    },
    topic: { ar: "اللجنة المطلوبة", en: "Requested committee" },
    details: { ar: "المؤهلات وأسباب الترشيح", en: "Qualifications and reasons" },
  },
  service_establishment: {
    title: { ar: "طلب إضافة خدمة – منشآت", en: "Add a service request – Establishments" },
    topic: { ar: "اسم المنشأة والخدمة", en: "Establishment and service name" },
    details: { ar: "وصف الخدمة", en: "Service description" },
  },
  service_family: {
    title: {
      ar: "طلب إضافة خدمة – أفراد العائلة",
      en: "Add a service request – Family members",
    },
    topic: { ar: "الخدمة المقدمة", en: "Service offered" },
    details: { ar: "وصف الخدمة", en: "Service description" },
  },

  legal_consultancy: {
    title: { ar: "طلب استشارة قانونية", en: "Legal consultancy request" },
    topic: { ar: "موضوع الاستشارة", en: "Subject of the consultation" },
    details: { ar: "تفاصيل الاستشارة المطلوبة", en: "Details of the consultation" },
  },
  accounting_service: {
    title: { ar: "طلب خدمة محاسبية", en: "Accounting service request" },
    topic: { ar: "نوع الخدمة المحاسبية", en: "Type of accounting service" },
    details: { ar: "تفاصيل الطلب", en: "Request details" },
  },
  website_design: {
    title: { ar: "طلب تصميم موقع إلكتروني", en: "Website design request" },
    topic: { ar: "اسم الجهة أو المشروع", en: "Organisation or project name" },
    details: { ar: "وصف المشروع والمتطلبات", en: "Project scope and requirements" },
  },
  digital_family_tree: {
    title: { ar: "طلب شجرة عائلة رقمية", en: "Digital family tree request" },
    topic: { ar: "الفرع أو النطاق المطلوب", en: "Requested branch or scope" },
    details: { ar: "تفاصيل الطلب", en: "Request details" },
  },
  tree_data_correction: {
    title: {
      ar: "طلب تصحيح أو إضافة بيانات في شجرة العائلة",
      en: "Family tree data correction or addition",
    },
    topic: { ar: "الاسم المعنيّ في الشجرة", en: "Person concerned in the tree" },
    details: { ar: "التصحيح أو الإضافة المطلوبة", en: "Requested correction or addition" },
  },
  archive_contribution: {
    title: { ar: "طلب إضافة صور إلى الأرشيف", en: "Archive photo contribution" },
    topic: { ar: "المناسبة أو المجلد المقترح", en: "Occasion or suggested folder" },
    details: { ar: "وصف الصور وعددها", en: "Description and number of photographs" },
  },
  fund_attestation: {
    title: {
      ar: "طلب شهادة أو إثبات من الصندوق",
      en: "Fund certificate or attestation request",
    },
    topic: { ar: "نوع الشهادة المطلوبة", en: "Type of certificate requested" },
    details: { ar: "الغرض من الشهادة", en: "Purpose of the certificate" },
  },
  financial_statement_copy: {
    title: { ar: "طلب نسخة من القوائم المالية", en: "Financial statement copy request" },
    topic: { ar: "السنة المالية المطلوبة", en: "Financial year requested" },
    details: { ar: "الغرض من الطلب", en: "Purpose of the request" },
  },
  social_assistance: {
    title: { ar: "طلب دعم أو مساعدة اجتماعية", en: "Social assistance request" },
    topic: { ar: "نوع الدعم المطلوب", en: "Type of assistance requested" },
    details: { ar: "تفاصيل الحالة", en: "Details of the case" },
  },
  youth_program_enrolment: {
    title: {
      ar: "طلب الاشتراك في برنامج تطوير مهارات الشباب",
      en: "Youth skills programme enrolment",
    },
    topic: { ar: "المسار أو المهارة المطلوبة", en: "Track or skill requested" },
    details: { ar: "بيانات المتقدم وخبراته", en: "Applicant background and experience" },
  },
  competition_entry: {
    title: { ar: "طلب المشاركة في مسابقة", en: "Competition entry request" },
    topic: { ar: "المسابقة المطلوبة", en: "Competition" },
    details: { ar: "بيانات المشارك", en: "Participant details" },
  },
  occasion_announcement: {
    title: {
      ar: "طلب إعلان مناسبة عائلية",
      en: "Family occasion announcement request",
    },
    topic: {
      ar: "نوع المناسبة (مولود / زواج / تخرج)",
      en: "Occasion type (birth / wedding / graduation)",
    },
    details: { ar: "تفاصيل الإعلان المطلوب نشره", en: "Details of the announcement" },
  },
  custom_template: {
    title: { ar: "طلب قالب معدّل بالبيانات", en: "Customised announcement template request" },
    topic: { ar: "رمز القالب المطلوب", en: "Requested template code" },
    details: { ar: "البيانات المطلوب إضافتها إلى القالب", en: "Text to be added to the template" },
  },
  official_greeting: {
    title: {
      ar: "طلب تعزية أو تهنئة رسمية من المجلس",
      en: "Official condolence or greeting request",
    },
    topic: { ar: "المناسبة والمعنيّ بها", en: "Occasion and person concerned" },
    details: { ar: "نص التعزية أو التهنئة المطلوب", en: "Requested wording" },
  },
  museum_visit: {
    title: { ar: "طلب زيارة المتحف", en: "Museum visit request" },
    topic: {
      ar: "التاريخ المقترح وعدد الزوار",
      en: "Preferred date and number of visitors",
    },
    details: { ar: "تفاصيل الزيارة", en: "Visit details" },
  },
  bisht_purchase: {
    title: { ar: "طلب شراء بشت", en: "Bisht purchase enquiry" },
    topic: { ar: "النوع والمقاس المطلوب", en: "Type and size requested" },
    details: { ar: "تفاصيل الطلب", en: "Request details" },
  },
  oud_purchase: {
    title: { ar: "طلب شراء عود", en: "Oud purchase enquiry" },
    topic: { ar: "النوع والكمية المطلوبة", en: "Type and quantity requested" },
    details: { ar: "تفاصيل الطلب", en: "Request details" },
  },
  business_listing_update: {
    title: {
      ar: "طلب تحديث بيانات الدليل التجاري",
      en: "Business listing update request",
    },
    topic: { ar: "اسم المنشأة في الدليل", en: "Business name in the directory" },
    details: { ar: "البيانات المطلوب تحديثها", en: "Information to be updated" },
  },
  library_submission: {
    title: { ar: "طلب إضافة مادة إلى المكتبة الرقمية", en: "Digital library submission" },
    topic: { ar: "عنوان المادة ونوعها", en: "Item title and type" },
    details: { ar: "وصف المادة ومصدرها", en: "Description and source of the item" },
  },
  dna_participation: {
    title: {
      ar: "طلب المشاركة في الدراسة الجينية",
      en: "Genetic study participation request",
    },
    topic: { ar: "الفرع والنسب المباشر", en: "Branch and direct lineage" },
    details: { ar: "بيانات المتقدم", en: "Applicant details" },
  },
  membership_card: {
    title: {
      ar: "طلب إصدار أو تجديد بطاقة العضوية",
      en: "Membership card issue or renewal",
    },
    topic: { ar: "نوع الطلب (إصدار / تجديد)", en: "Request type (issue / renewal)" },
    details: { ar: "بيانات مقدم الطلب", en: "Applicant details" },
  },
} satisfies Record<string, CouncilRequestDef>;

export type CouncilRequestTypeKey = keyof typeof COUNCIL_REQUESTS;

export const COUNCIL_REQUEST_TYPES = Object.keys(COUNCIL_REQUESTS) as [
  CouncilRequestTypeKey,
  ...CouncilRequestTypeKey[],
];
