import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";
import { ceoRequirement } from "@/content/site";

export const copy = registerCopy("governance", {
  eyebrow: { ar: "الإطار النظامي", en: "Constitution" } as BiText,
  title: { ar: "الحوكمة و مجلس الامناء", en: "Governance & Board of Trustees" } as BiText,
  subtitle: {
    ar: "تعمل الصندوق بموجب لائحة أساسية معتمدة من المركز الوطني لتنمية القطاع غير الربحي، ويتولى إدارتها مجلس أمناء وست لجان تنفيذية تمثل الفروع السبعة.",
    en: "The organisation operates under a charter approved by the National Center for Nonprofit Sector. It is administered by a board of trustees and six executive committees representing the seven branches.",
  } as BiText,

  metaLicence: { ar: "رقم الترخيص", en: "Licence no." } as BiText,
  metaAuthority: { ar: "جهة الإصدار", en: "Issuing authority" } as BiText,
  metaRegistered: { ar: "تاريخ الإشهار", en: "Registered" } as BiText,

  mandateEyebrow: { ar: "أولاً", en: "Article I" } as BiText,
  mandateTitle: { ar: "الغرض والاختصاص", en: "Purpose and remit" } as BiText,
  mandateP1: {
    ar: "تأسست صندوق التنمية العائلية (آل بوعبيد) ككيان أهلي غير ربحي يعنى بتنظيم شؤون الأسرة الجامعة: توثيق النسب وحفظ الأرشيف، وإدارة الأوقاف والاشتراكات، وتنفيذ برامج التكافل والتنمية بين أبناء الفروع السبعة.",
    en: "The Al Bu Obaid Family Development Fund was established as a nonprofit civic entity to administer the collective affairs of the family: documenting lineage and preserving the archive, managing endowments and subscriptions, and delivering solidarity and development programmes across the seven branches.",
  } as BiText,
  mandateP2: {
    ar: "وتلتزم الصندوق بمتطلبات الحوكمة والإفصاح المالي والامتثال الزكوي المقررة على القطاع غير الربحي، ويخضع حسابها لمراجعة سنوية مستقلة، بما يتسق مع مستهدفات رؤية المملكة ٢٠٣٠.",
    en: "The organisation is bound by the governance, financial disclosure, and zakat compliance requirements set for the nonprofit sector. Its accounts are subject to independent annual audit, consistent with the aims of Saudi Vision 2030.",
  } as BiText,
  certificateLabel: { ar: "شهادة الترخيص الرسمية", en: "Official License Certificate" } as BiText,
  certificateCta: {
    ar: "استعراض الشهادات والإثباتات النظامية كاملة",
    en: "Browse all statutory certificates & attestations",
  } as BiText,

  boardEyebrow: { ar: "ثانياً", en: "Article II" } as BiText,
  boardTitle: { ar: "مجلس الأمناء", en: "The Board of Trustees" } as BiText,
  boardNote: {
    ar: "يتولى مجلس الأمناء الإشراف العام على الاستراتيجية والامتثال، ويجتمع دورياً برئاسة رئيس المجلس وبحضور عميد الأسرة.",
    en: "The board holds general oversight of strategy and compliance. It convenes periodically under its chair, with the Family Dean in attendance.",
  } as BiText,
  officeLabel: { ar: "المنصب", en: "Office" } as BiText,
  holderLabel: { ar: "شاغل المنصب", en: "Holder" } as BiText,
  foundersEyebrow: { ar: "الأعضاء المؤسسون", en: "Founding members" } as BiText,
  foundersNote: {
    ar: `يتولى الأعضاء المؤسسون الستة قيادة لجان مجلس الأسرة الست، ويُشترط في المدير التنفيذي للصندوق حاملاً درجة البكالوريوس مع خبرة إدارية تتجاوز 16 عاماً. ${ceoRequirement.ar}`,
    en: `The six founding members lead the six executive committees. The bylaws require the fund's Chief Executive to hold a bachelor's degree with over 16 years of administrative experience.`,
  } as BiText,

  docsEyebrow: { ar: "الوثائق النظامية", en: "Constitutional documents" } as BiText,
  docsNote: {
    ar: "النسخ الموقعة مودعة لدى الأمانة العامة، وجميع نسخها الرقمية منشورة في صفحة الشهادات والإثباتات بصندوق التنمية العائلية.",
    en: "Signed copies are deposited with the secretariat; all digital copies are published on the fund's Certificates & Attestations page.",
  } as BiText,
  archiveCta: {
    ar: "الانتقال إلى الشهادات والإثباتات",
    en: "Go to Certificates & Attestations",
  } as BiText,
});
