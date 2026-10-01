import type { BiText } from "@/i18n/LanguageProvider";

/**
 * Catalogue of the request types served by the Requests Hub's shared form.
 *
 * Each entry supplies the dialog title plus the two content field labels. The
 * Zod enum, the dialog, and the server handler all derive from this single
 * table, so adding a new request type is one entry here.
 */
export type CouncilRequestField = {
  /** Key stored in the submission's `extra` map. */
  name: string;
  label: BiText;
  kind?: "text" | "date" | "textarea";
  required?: boolean;
  maxLength?: number;
};

export type CouncilRequestDef = {
  title: BiText;
  topic: BiText;
  details: BiText;
  /** Short card description shown in the Requests Hub. */
  desc?: BiText;
  /**
   * Reference of the official template in the template library
   * (`library_items.reference`, collection = "templates"). This is the explicit
   * request → template relationship: the server resolves the code against the
   * library row and records the template's id on the submission, so the
   * approved request is produced on the exact official template.
   */
  templateCode?: string;
  /** Template-specific information needed to fill that template. */
  fields?: CouncilRequestField[];
  /** Accepts supporting photographs or documents. */
  allowAttachments?: boolean;
  /** Official committee destination for committee-addressed requests. */
  committeeSlug?: (typeof COMMITTEE_REQUEST_DESTINATIONS)[number]["slug"];
  /**
   * Legacy definition replaced by a template-linked request. Kept in the enum so
   * historical submissions filed under this `source` stay readable in the
   * console, but no longer offered in the Requests Hub.
   */
  retired?: boolean;
};

/** Shared identity fields reused by the announcement requests. */
const personField = (ar: string, en: string, name = "person"): CouncilRequestField => ({
  name,
  label: { ar, en },
  required: true,
  maxLength: 160,
});

const dateField = (ar: string, en: string, name = "date"): CouncilRequestField => ({
  name,
  label: { ar, en },
  kind: "date",
  required: true,
});

export const COMMITTEE_REQUEST_DESTINATIONS = [
  {
    slug: "development-follow-up",
    requestType: "committee_development_follow_up",
    name: { ar: "لجنة التطوير والمتابعة", en: "Development & Follow-up Committee" },
    desc: {
      ar: "طلبات التطوير المؤسسي والمتابعة وتحسين مسارات العمل في مجلس الأسرة.",
      en: "Requests about institutional development, follow-up, and improving council workflows.",
    },
  },
  {
    slug: "family-headquarters",
    requestType: "committee_family_headquarters",
    name: { ar: "لجنة شؤون مقر مجلس الأسرة", en: "Family Council Headquarters Committee" },
    desc: {
      ar: "طلبات استخدام المقر، مرافقه، احتياجاته، وتنظيم شؤونه التشغيلية.",
      en: "Requests about headquarters use, facilities, needs, and operational matters.",
    },
  },
  {
    slug: "finance-investment",
    requestType: "committee_finance_investment",
    name: { ar: "اللجنة المالية والاستثمارية", en: "Finance & Investment Committee" },
    desc: {
      ar: "طلبات الاشتراكات، الدعم، المقترحات المالية، وفرص تنمية موارد الأسرة.",
      en: "Requests about contributions, support, financial proposals, and resource development.",
    },
  },
  {
    slug: "family-communication",
    requestType: "committee_family_communication",
    name: { ar: "لجنة التواصل الأسري", en: "Family Communication Committee" },
    desc: {
      ar: "طلبات التواصل بين الفروع، تحديث البيانات، وصلة الرحم والمناسبات الأسرية.",
      en: "Requests about branch communication, data updates, kinship, and family occasions.",
    },
  },
  {
    slug: "activities-initiatives",
    requestType: "committee_activities_initiatives",
    name: { ar: "لجنة الأنشطة والمبادرات", en: "Activities & Initiatives Committee" },
    desc: {
      ar: "طلبات الفعاليات، المبادرات، البرامج، والمسابقات التي تخدم أبناء الأسرة.",
      en: "Requests about events, initiatives, programmes, and competitions for the family.",
    },
  },
  {
    slug: "media-support-services",
    requestType: "committee_media_support_services",
    name: { ar: "لجنة الإعلام والخدمات المساندة", en: "Media & Support Services Committee" },
    desc: {
      ar: "طلبات النشر، التغطية الإعلامية، التصاميم، والخدمات التقنية أو المساندة.",
      en: "Requests about publishing, media coverage, design, and technical or support services.",
    },
  },
] as const satisfies readonly {
  slug: string;
  requestType: string;
  name: BiText;
  desc: BiText;
}[];

const committeeRequest = (
  committee: (typeof COMMITTEE_REQUEST_DESTINATIONS)[number],
): CouncilRequestDef => ({
  title: committee.name,
  desc: committee.desc,
  topic: { ar: "موضوع الطلب", en: "Request subject" },
  details: { ar: "تفاصيل الطلب والمساعدة المطلوبة", en: "Request details and assistance needed" },
  committeeSlug: committee.slug,
  allowAttachments: true,
});

export const COUNCIL_REQUESTS = {
  committee_nomination: {
    title: {
      ar: "طلب ترشيح عضوية في إحدى اللجان",
      en: "Committee membership nomination request",
    },
    topic: { ar: "اللجنة المطلوبة", en: "Requested committee" },
    details: { ar: "المؤهلات وأسباب الترشيح", en: "Qualifications and reasons" },
  },
  committee_development_follow_up: committeeRequest(COMMITTEE_REQUEST_DESTINATIONS[0]),
  committee_family_headquarters: committeeRequest(COMMITTEE_REQUEST_DESTINATIONS[1]),
  committee_finance_investment: committeeRequest(COMMITTEE_REQUEST_DESTINATIONS[2]),
  committee_family_communication: committeeRequest(COMMITTEE_REQUEST_DESTINATIONS[3]),
  committee_activities_initiatives: committeeRequest(COMMITTEE_REQUEST_DESTINATIONS[4]),
  committee_media_support_services: committeeRequest(COMMITTEE_REQUEST_DESTINATIONS[5]),
  family_competencies_nomination: {
    title: { ar: "ترشيح كفاءات الأسرة", en: "Family Competencies Nomination" },
    topic: { ar: "اسم المرشّح ومجال الكفاءة", en: "Nominee name and field of competency" },
    details: { ar: "المؤهلات والخبرات وأسباب الترشيح", en: "Qualifications, experience and reasons" },
    allowAttachments: true,
  },
  excellence_award_application: {
    title: { ar: "الترشح لجائزة التميز", en: "Excellence Award Application" },
    topic: { ar: "اسم المتقدم ومجال الجائزة", en: "Applicant name and award category" },
    details: { ar: "تفاصيل الإنجاز والشهادات", en: "Achievement details and certificates" },
    allowAttachments: true,
  },
  ahsa_family_councils_join: {
    title: { ar: "الانضمام إلى مجالس أسر الأحساء", en: "Join the Al-Ahsa Family Councils" },
    topic: { ar: "اسم المجلس أو الأسرة", en: "Council or family name" },
    details: { ar: "تفاصيل طلب الانضمام", en: "Details of the joining request" },
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
  /**
   * ── Retired announcement definitions ───────────────────────────────────────
   * Replaced by the template-linked requests below (a generic occasion request,
   * a generic template request and a generic greeting request all overlapped
   * with the official templates). Kept in the enum only so historical
   * submissions filed under these sources remain readable in the console.
   */
  occasion_announcement: {
    retired: true,
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
    retired: true,
    title: { ar: "طلب قالب معدّل بالبيانات", en: "Customised announcement template request" },
    topic: { ar: "رمز القالب المطلوب", en: "Requested template code" },
    details: { ar: "البيانات المطلوب إضافتها إلى القالب", en: "Text to be added to the template" },
  },
  official_greeting: {
    retired: true,
    title: {
      ar: "طلب تعزية أو تهنئة رسمية من المجلس",
      en: "Official condolence or greeting request",
    },
    topic: { ar: "المناسبة والمعنيّ بها", en: "Occasion and person concerned" },
    details: { ar: "نص التعزية أو التهنئة المطلوب", en: "Requested wording" },
  },

  /**
   * ── Official template requests ─────────────────────────────────────────────
   * One request per official template in النماذج والقوالب. `templateCode` is the
   * template's `library_items.reference`, so every submission carries the exact
   * template the approved announcement must be produced on.
   */
  announce_birth_male: {
    templateCode: "ABF-BIRTH-MALE-01",
    title: { ar: "طلب إعلان بشارة مولود", en: "Birth announcement request — baby boy" },
    desc: {
      ar: "طلب إصدار بشارة مولود على القالب الرسمي المعتمد.",
      en: "Request a baby-boy birth announcement on the approved official template.",
    },
    topic: { ar: "اسم المولود", en: "Name of the newborn" },
    details: { ar: "نص البشارة المطلوب", en: "Wording of the announcement" },
    fields: [
      personField("اسم الأب", "Father's name", "father"),
      personField("اسم الجد أو الفرع", "Grandfather or branch", "branch_line"),
      dateField("تاريخ الميلاد", "Date of birth"),
    ],
    allowAttachments: true,
  },
  announce_birth_female: {
    templateCode: "ABF-BIRTH-FEMALE-01",
    title: { ar: "طلب إعلان بشارة مولودة", en: "Birth announcement request — baby girl" },
    desc: {
      ar: "طلب إصدار بشارة مولودة على القالب الرسمي المعتمد.",
      en: "Request a baby-girl birth announcement on the approved official template.",
    },
    topic: { ar: "اسم المولودة", en: "Name of the newborn" },
    details: { ar: "نص البشارة المطلوب", en: "Wording of the announcement" },
    fields: [
      personField("اسم الأب", "Father's name", "father"),
      personField("اسم الجد أو الفرع", "Grandfather or branch", "branch_line"),
      dateField("تاريخ الميلاد", "Date of birth"),
    ],
    allowAttachments: true,
  },
  announce_condolence_male: {
    templateCode: "ABF-CONDOLENCE-MALE-01",
    title: { ar: "طلب إعلان خبر نعي — ذكر", en: "Obituary announcement request — male" },
    desc: {
      ar: "طلب نشر خبر نعي لأحد أبناء الأسرة على القالب الرسمي.",
      en: "Request an obituary notice for a male family member on the official template.",
    },
    topic: { ar: "اسم الفقيد", en: "Name of the deceased" },
    details: { ar: "نص النعي المطلوب", en: "Wording of the notice" },
    fields: [
      dateField("تاريخ الوفاة", "Date of death"),
      personField("مكان الصلاة والدفن", "Prayer and burial location", "burial_place"),
      personField("مكان العزاء ووقته", "Condolence location and time", "condolence_place"),
    ],
    allowAttachments: true,
  },
  announce_condolence_female: {
    templateCode: "ABF-CONDOLENCE-FEMALE-01",
    title: { ar: "طلب إعلان خبر نعي — أنثى", en: "Obituary announcement request — female" },
    desc: {
      ar: "طلب نشر خبر نعي لإحدى بنات الأسرة على القالب الرسمي.",
      en: "Request an obituary notice for a female family member on the official template.",
    },
    topic: { ar: "اسم الفقيدة", en: "Name of the deceased" },
    details: { ar: "نص النعي المطلوب", en: "Wording of the notice" },
    fields: [
      dateField("تاريخ الوفاة", "Date of death"),
      personField("مكان الصلاة والدفن", "Prayer and burial location", "burial_place"),
      personField("مكان العزاء ووقته", "Condolence location and time", "condolence_place"),
    ],
    allowAttachments: true,
  },
  announce_graduation_male: {
    templateCode: "ABF-GRADUATION-MALE-01",
    title: { ar: "طلب إعلان تهنئة تخرج — ذكر", en: "Graduation congratulations request — male" },
    desc: {
      ar: "طلب تهنئة رسمية بمناسبة التخرج على القالب الرسمي.",
      en: "Request an official graduation congratulation on the official template.",
    },
    topic: { ar: "اسم المتخرج", en: "Name of the graduate" },
    details: { ar: "نص التهنئة المطلوب", en: "Wording of the congratulation" },
    fields: [
      personField("الجهة التعليمية", "Educational institution", "institution"),
      personField("الدرجة والتخصص", "Degree and major", "degree"),
      dateField("تاريخ التخرج", "Graduation date"),
    ],
    allowAttachments: true,
  },
  announce_graduation_female: {
    templateCode: "ABF-GRADUATION-FEMALE-01",
    title: {
      ar: "طلب إعلان تهنئة تخرج — أنثى",
      en: "Graduation congratulations request — female",
    },
    desc: {
      ar: "طلب تهنئة رسمية بمناسبة التخرج على القالب الرسمي.",
      en: "Request an official graduation congratulation on the official template.",
    },
    topic: { ar: "اسم المتخرجة", en: "Name of the graduate" },
    details: { ar: "نص التهنئة المطلوب", en: "Wording of the congratulation" },
    fields: [
      personField("الجهة التعليمية", "Educational institution", "institution"),
      personField("الدرجة والتخصص", "Degree and major", "degree"),
      dateField("تاريخ التخرج", "Graduation date"),
    ],
    allowAttachments: true,
  },
  announce_wedding: {
    templateCode: "ABF-WEDDING-CONGRATS-01",
    title: { ar: "طلب إعلان تهنئة زواج", en: "Wedding congratulations request" },
    desc: {
      ar: "طلب تهنئة رسمية بمناسبة الزواج على القالب الرسمي.",
      en: "Request an official wedding congratulation on the official template.",
    },
    topic: { ar: "اسم العريس", en: "Name of the groom" },
    details: { ar: "نص التهنئة المطلوب", en: "Wording of the congratulation" },
    fields: [
      personField("أسرة العروس", "Bride's family", "bride_family"),
      dateField("تاريخ الزفاف", "Wedding date"),
      personField("مكان الحفل", "Venue", "venue"),
    ],
    allowAttachments: true,
  },
  announce_achievement: {
    templateCode: "ABF-ACHIEVEMENT-01",
    title: { ar: "طلب إعلان مبارك الإنجاز", en: "Achievement announcement request" },
    desc: {
      ar: "طلب إعلان تهنئة بإنجاز علمي أو مهني أو رياضي على القالب الرسمي.",
      en: "Request a congratulation for an academic, professional or sporting achievement.",
    },
    topic: { ar: "اسم صاحب الإنجاز", en: "Name of the achiever" },
    details: { ar: "وصف الإنجاز", en: "Description of the achievement" },
    fields: [
      personField("الجهة المانحة أو الراعية", "Awarding or hosting body", "awarding_body"),
      dateField("تاريخ الإنجاز", "Date of the achievement"),
    ],
    allowAttachments: true,
  },
  announce_promotion: {
    templateCode: "ABF-PROMOTION-01",
    title: { ar: "طلب إعلان مبارك التعيين", en: "Appointment announcement request" },
    desc: {
      ar: "طلب تهنئة بمناسبة الترقية أو التعيين على القالب الرسمي.",
      en: "Request a promotion or appointment congratulation on the official template.",
    },
    topic: { ar: "اسم المُعيَّن", en: "Name of the appointee" },
    details: { ar: "نص التهنئة المطلوب", en: "Wording of the congratulation" },
    fields: [
      personField("المنصب أو المسمى الجديد", "New position or title", "position"),
      personField("جهة العمل", "Organisation", "organisation"),
      dateField("تاريخ التعيين", "Date of appointment"),
    ],
    allowAttachments: true,
  },
  announce_new_job: {
    templateCode: "ABF-NEWJOB-01",
    title: { ar: "طلب إعلان وظيفة جديدة", en: "New job announcement request" },
    desc: {
      ar: "طلب تهنئة بمناسبة الالتحاق بوظيفة جديدة على القالب الرسمي.",
      en: "Request a new-job congratulation on the official template.",
    },
    topic: { ar: "اسم الموظف", en: "Name of the employee" },
    details: { ar: "نص التهنئة المطلوب", en: "Wording of the congratulation" },
    fields: [
      personField("الوظيفة الجديدة", "New role", "position"),
      personField("جهة العمل", "Employer", "organisation"),
      dateField("تاريخ المباشرة", "Start date"),
    ],
    allowAttachments: true,
  },
  announce_recovery: {
    templateCode: "ABF-RECOVERY-01",
    title: { ar: "طلب إعلان طهور ونور", en: "Recovery announcement request" },
    desc: {
      ar: "طلب إعلان بمناسبة الشفاء والعافية على القالب الرسمي.",
      en: "Request a recovery and well-being announcement on the official template.",
    },
    topic: { ar: "اسم المعنيّ بالمناسبة", en: "Name of the person concerned" },
    details: { ar: "نص الإعلان المطلوب", en: "Wording of the announcement" },
    fields: [dateField("تاريخ المناسبة", "Date of the occasion")],
    allowAttachments: true,
  },
  announce_official: {
    templateCode: "ABF-OFFICIAL-01",
    title: { ar: "طلب إعلان رسمي", en: "Official announcement request" },
    desc: {
      ar: "طلب نشر إعلان رسمي صادر عن المجلس أو إحدى لجانه.",
      en: "Request publication of an official announcement from the council or a committee.",
    },
    topic: { ar: "موضوع الإعلان", en: "Subject of the announcement" },
    details: { ar: "نص الإعلان المطلوب", en: "Wording of the announcement" },
    fields: [
      personField("الجهة المُصدِرة", "Issuing body", "issuing_body"),
      dateField("تاريخ النشر المطلوب", "Requested publication date"),
    ],
    allowAttachments: true,
  },
  announce_meeting: {
    templateCode: "ABF-MEETING-01",
    title: { ar: "طلب دعوة حضور", en: "Meeting invitation request" },
    desc: {
      ar: "طلب إصدار دعوة حضور لاجتماع أو لقاء على القالب الرسمي.",
      en: "Request an attendance invitation for a meeting on the official template.",
    },
    topic: { ar: "موضوع الاجتماع", en: "Subject of the meeting" },
    details: { ar: "جدول الأعمال أو تفاصيل الدعوة", en: "Agenda or invitation details" },
    fields: [
      dateField("تاريخ الاجتماع", "Meeting date"),
      personField("وقت الاجتماع", "Meeting time", "time"),
      personField("مكان الاجتماع", "Meeting venue", "venue"),
    ],
    allowAttachments: true,
  },
  announce_general: {
    templateCode: "ABF-GENERAL-01",
    title: { ar: "طلب تهنئة عامة", en: "General congratulation request" },
    desc: {
      ar: "طلب تهنئة عامة بمناسبة لا يشملها أحد القوالب الأخرى.",
      en: "Request a general congratulation for an occasion no other template covers.",
    },
    topic: { ar: "المناسبة", en: "Occasion" },
    details: { ar: "نص التهنئة المطلوب", en: "Wording of the congratulation" },
    fields: [dateField("تاريخ المناسبة", "Date of the occasion")],
    allowAttachments: true,
  },
  /**
   * Roll of Honour nomination — the single request behind the «تقديم ترشيح جديد»
   * action on /achievers. It keeps the historical `achiever_nomination` source,
   * so nominations filed before the hub took over stay in the same inbox thread.
   */
  achiever_nomination: {
    title: { ar: "طلب ترشيح لسجل المتميزين", en: "Roll of Honour nomination request" },
    desc: {
      ar: "ترشيح أحد أفراد الأسرة لتوثيق تفوق علمي أو تميز مهني في سجل المتميزين.",
      en: "Nominate a family member so an academic or professional distinction is recorded in the Roll of Honour.",
    },
    topic: { ar: "اسم المرشَّح", en: "Name of the nominee" },
    details: { ar: "وصف الإنجاز وأسباب الترشيح", en: "The achievement and reasons for nomination" },
    fields: [
      personField("الفرع", "Branch", "branch_line"),
      personField("المجال أو التخصص", "Field or speciality", "field"),
      personField("سنة الترشيح", "Nomination year", "award_year"),
      {
        name: "evidence_url",
        label: { ar: "رابط إثبات (اختياري)", en: "Evidence link (optional)" },
        maxLength: 300,
      },
    ],
    allowAttachments: true,
  },
  /**
   * New establishment listing — the request behind the directory's invitation to
   * family members who own a business. Updates to an existing listing keep using
   * `business_listing_update`.
   */
  business_listing_new: {
    title: { ar: "طلب إدراج منشأة في دليل الأعمال", en: "Business directory listing request" },
    desc: {
      ar: "إدراج منشأة عائلية جديدة في دليل المنشآت بعد مراجعة الأمانة العامة.",
      en: "List a family establishment in the business directory after secretariat review.",
    },
    topic: { ar: "اسم المنشأة", en: "Establishment name" },
    details: { ar: "وصف النشاط والخدمات", en: "Activity and services offered" },
    fields: [
      personField("النشاط أو القطاع", "Sector or activity", "sector"),
      personField("المدينة", "City", "city"),
      personField("الفرع", "Branch", "branch_line"),
      {
        name: "website",
        label: { ar: "الموقع الإلكتروني (اختياري)", en: "Website (optional)" },
        maxLength: 300,
      },
    ],
    allowAttachments: true,
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
  membership_verification: {
    title: { ar: "طلب توثيق العضوية", en: "Membership verification request" },
    desc: {
      ar: "تقديم طلب اعتماد العضوية للأمانة العامة وإصدار بطاقة العضوية الرسمية.",
      en: "Ask the secretariat to verify your membership and issue your official family card.",
    },
    topic: { ar: "الاسم الكامل والفرع المطلوب توثيقه", en: "Full name and branch to verify" },
    details: { ar: "بيانات النسب والتفاصيل الإضافية", en: "Lineage details and additional information" },
    fields: [
      personField("الفرع العائلي", "Family branch", "branch_line"),
      personField("عمود النسب حتى الجد الأكبر", "Lineage to eldest ancestor", "father_lineage"),
      personField("المدينة ومقر الإقامة", "City and residence", "city"),
      {
        name: "national_id",
        label: { ar: "رقم الهوية الوطنية (اختياري)", en: "National ID (optional)" },
        maxLength: 20,
      },
    ],
    allowAttachments: true,
  },
  fund_contribution: {
    title: { ar: "الاشتراك والمساهمة", en: "Subscription & contribution" },
    desc: {
      ar: "تسجيل اشتراك أو مساهمة في صندوق التنمية العائلية وإرفاق إشعار السداد للمراجعة.",
      en: "Register a subscription or contribution to the family development fund and attach your payment notice for review.",
    },
    topic: { ar: "نوع المساهمة أو الاشتراك", en: "Contribution or subscription type" },
    details: { ar: "تفاصيل المساهمة أو ملاحظات السداد", en: "Contribution details or payment notes" },
    fields: [
      personField("المبلغ (ريال سعودي)", "Amount (SAR)", "amount"),
      personField("اسم البنك المحول منه", "Bank name", "bank_name"),
      dateField("تاريخ التحويل", "Transfer date", "transfer_date"),
    ],
    allowAttachments: true,
  },
  family_tree_frame: {
    title: { ar: "طلب لوحة شجرة العائلة", en: "Family tree frame order" },
    desc: {
      ar: "طلب اللوحة الرسمية المصورة لشجرة العائلة وتحديد المقاس وموقع التسليم.",
      en: "Order the official illustrated family tree frame with size and delivery details.",
    },
    topic: { ar: "المقاس المطلوب للوحة", en: "Requested frame size" },
    details: { ar: "عنوان التوصيل وأية ملاحظات خاصة", en: "Delivery address and notes" },
    fields: [
      personField("المقاس المطلوب (كبير جداري / متوسط / مكتبي)", "Frame size (Large wall / Medium / Desk)", "frame_size"),
      personField("مدينة التوصيل", "Delivery city", "city"),
      personField("العدد المطلوب", "Quantity", "quantity"),
    ],
    allowAttachments: false,
  },
  event_attendance: {
    title: { ar: "طلب تسجيل حضور فعالية", en: "Event attendance registration" },
    desc: {
      ar: "تسجيل الحضور في إحدى فعاليات الأسرة المعلنة وتحديد عدد المرافقين.",
      en: "Register attendance at an announced family event with guest count.",
    },
    topic: { ar: "اسم الفعالية المراد حضورها", en: "Event name" },
    details: { ar: "ملاحظات أو استفسارات حول الحضور", en: "Notes or inquiries regarding attendance" },
    fields: [
      personField("عدد الحاضرين والمرافقين", "Number of attendees / guests", "attendees_count"),
      dateField("تاريخ الفعالية التقريبي", "Approximate event date", "attendance_date"),
    ],
    allowAttachments: false,
  },
  initiative_participation: {
    title: { ar: "طلب الانضمام إلى مشروع أو مبادرة", en: "Initiative participation request" },
    desc: {
      ar: "التقدم للمشاركة في إحدى مبادرات الأسرة أو مشاريعها القائمة.",
      en: "Apply to take part in one of the family's active initiatives or projects.",
    },
    topic: { ar: "المبادرة أو المشروع المستهدف", en: "Target initiative or project" },
    details: { ar: "طبيعة المشاركة والخبرات والمقترحات", en: "Nature of participation, skills, and proposals" },
    fields: [
      personField("اسم المبادرة أو نوع المشروع", "Initiative name or project type", "initiative_name"),
      personField("الدور المقترح للمشاركة", "Proposed role", "role_proposed"),
    ],
    allowAttachments: true,
  },
  general_inquiry: {
    title: { ar: "استفسار أو طلب عام", en: "General inquiry or request" },
    desc: {
      ar: "إرسال استفسار أو طلب إلى الأمانة العامة لمجلس الأسرة عبر صندوق الوارد.",
      en: "Send the secretariat any inquiry or request not covered by specific forms.",
    },
    topic: { ar: "موضوع الاستفسار أو الطلب", en: "Subject of the inquiry or request" },
    details: { ar: "نص الاستفسار وتفاصيل الطلب", en: "Inquiry text and details" },
    allowAttachments: true,
  },
} satisfies Record<string, CouncilRequestDef>;

export type CouncilRequestTypeKey = keyof typeof COUNCIL_REQUESTS;

export const COUNCIL_REQUEST_TYPES = Object.keys(COUNCIL_REQUESTS) as [
  CouncilRequestTypeKey,
  ...CouncilRequestTypeKey[],
];

/**
 * The template-linked announcement requests, in template order — one per
 * official template. The Requests Hub renders this list, so a future template
 * only needs an entry above (with its `templateCode`) to appear as a request.
 */
export const TEMPLATE_REQUESTS = (
  Object.entries(COUNCIL_REQUESTS) as [CouncilRequestTypeKey, CouncilRequestDef][]
)
  .filter(([, def]) => !!def.templateCode && !def.retired)
  .map(([key, def]) => ({ key, ...def, templateCode: def.templateCode! }));
