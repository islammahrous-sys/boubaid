import type { BiText } from "@/i18n/LanguageProvider";
import { registerCopy } from "@/i18n/editable-copy";

export const copy = registerCopy("directory", {
  eyebrow: { ar: "دليل الخدمات", en: "Services index" } as BiText,
  title: {
    ar: "خدمات افراد الأسرة و خدمات المنشأت – اسرتي تنتج",
    en: "Family Member & Establishment Services – My Family Produces",
  } as BiText,
  subtitle: {
    ar: "بوابة موحدة تجمع الخدمات المتاحة لأفراد أسرة آل بوعبيد وخدمات منشآتها، مع دليل المنشآت المعتمدة ودليل الأفراد.",
    en: "A single gateway to the services available to Al Bu Obaid family members and to their establishments, alongside the verified establishment and member directories.",
  } as BiText,

  tabs: {
    businesses: { ar: "خدمات المنشأت", en: "Establishment Services" } as BiText,
    members: { ar: "خدمات افراد الأسرة", en: "Family Member Services" } as BiText,
  },

  metaListings: { ar: "عدد القيود", en: "Listings" } as BiText,
  metaSectors: { ar: "القطاعات", en: "Sectors" } as BiText,
  metaUpdated: { ar: "آخر تحديث", en: "Updated" } as BiText,
  metaUpdatedValue: { ar: "١٤٤٧ هـ", en: "1447 AH" } as BiText,

  searchLabel: { ar: "بحث في الدليل", en: "Search directory" } as BiText,
  searchPlaceholder: {
    ar: "ابحث باسم المنشأة، النشاط، الفرع، أو المدينة…",
    en: "Search by business name, sector, branch, or city…",
  } as BiText,
  memberSearchPlaceholder: {
    ar: "بحث بالاسم، الفرع، أو البريد…",
    en: "Search by name, branch, or email…",
  } as BiText,
  resultsCount: { ar: "منشأة مطابقة", en: "matching businesses" } as BiText,
  empty: {
    ar: "لا توجد منشآت مطابقة لمعايير البحث الحالية.",
    en: "No businesses match the current filter criteria.",
  } as BiText,

  labelCity: { ar: "المدينة", en: "City" } as BiText,
  labelBranch: { ar: "الفرع", en: "Branch" } as BiText,
  labelContact: { ar: "الهاتف", en: "Telephone" } as BiText,
  labelEmail: { ar: "البريد", en: "Email" } as BiText,
  visit: { ar: "الموقع الإلكتروني", en: "Visit Website" } as BiText,
  call: { ar: "اتصال", en: "Call" } as BiText,
  whatsapp: { ar: "واتساب", en: "WhatsApp" } as BiText,
  copyContact: { ar: "نسخ البيانات", en: "Copy Info" } as BiText,
  viewDetails: { ar: "تفاصيل المنشأة", en: "Details" } as BiText,
  verifiedBadge: { ar: "منشأة عائلية معتمدة", en: "Verified Family Enterprise" } as BiText,

  listTitle: {
    ar: "هل تمتلك منشأة أو نشاطاً تجارياً؟",
    en: "Own a business or professional venture?",
  } as BiText,
  listBody: {
    ar: "ندعو أبناء وبنات الأسرة لإدراج منشآتهم في الدليل لتعزيز التكامل والتعاون الاقتصادي وتبادل الخبرات بين أفراد العائلة.",
    en: "We invite family members to list their enterprises to foster mutual business synergy and professional networking.",
  } as BiText,

  memberGated: {
    title: { ar: "دليل خاص بالأعضاء المعتمدين", en: "Members-Only Directory" } as BiText,
    body: {
      ar: "هذا القسم مخصص للتواصل بين أبناء الأسرة الموثقين فقط. يرجى تسجيل الدخول أو إتمام توثيق العضوية لعرض البيانات.",
      en: "This directory is for verified family members only. Please sign in to view details.",
    },
    action: { ar: "تسجيل الدخول", en: "Sign In" } as BiText,
  },
  memberPending: {
    title: { ar: "العضوية قيد المراجعة والاعتماد", en: "Membership Pending" } as BiText,
    body: {
      ar: "حسابك قيد المراجعة لدى الأمانة العامة. ستتمكن من تصفح دليل الأفراد فور اعتماد التوثيق.",
      en: "Your account is awaiting verification by the secretariat. You'll see the directory once approved.",
    },
    action: { ar: "متابعة حالة الحساب", en: "Account Settings" } as BiText,
  },
  memberOptInNote: {
    ar: "تنويه الخصوصية: يظهر في دليل الأفراد حصرياً الأعضاء الذين فعّلوا خيار مشاركة بياناتهم من إعدادات الملف الشخصي.",
    en: "Privacy note: Only family members who opted to share their details via profile settings appear in the member directory.",
  } as BiText,
});
