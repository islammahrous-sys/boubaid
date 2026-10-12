/**
 * Human labels for the enum-ish values the console stores (visibility,
 * status, priority, roles, audit actions …). Screens used to print the raw
 * database value — "PUBLIC", "archived", "high", "SETTINGS_CHANGE" — in the
 * middle of an Arabic interface. Unknown values fall back to a tidied version
 * of the raw value rather than disappearing.
 */

const LABELS: Record<string, [ar: string, en: string]> = {
  // visibility
  public: ["عام", "Public"],
  family_only: ["الأسرة فقط", "Family only"],
  members: ["الأعضاء فقط", "Members only"],
  members_only: ["الأعضاء فقط", "Members only"],
  admin_only: ["الإدارة فقط", "Admins only"],
  private: ["خاص", "Private"],
  // publishing / workflow status
  published: ["منشور", "Published"],
  draft: ["مسودة", "Draft"],
  archived: ["مؤرشف", "Archived"],
  in_review: ["قيد المراجعة", "In review"],
  review: ["قيد المراجعة", "In review"],
  scheduled: ["مجدول", "Scheduled"],
  active: ["نشط", "Active"],
  inactive: ["غير نشط", "Inactive"],
  pending: ["بانتظار المراجعة", "Pending"],
  approved: ["معتمد", "Approved"],
  rejected: ["مرفوض", "Rejected"],
  cancelled: ["ملغى", "Cancelled"],
  canceled: ["ملغى", "Cancelled"],
  confirmed: ["مؤكد", "Confirmed"],
  waitlisted: ["قائمة الانتظار", "Waitlisted"],
  new: ["جديد", "New"],
  open: ["قيد المتابعة", "Open"],
  in_progress: ["قيد المتابعة", "In progress"],
  resolved: ["منجز", "Resolved"],
  closed: ["مغلق", "Closed"],
  read: ["مقروء", "Read"],
  completed: ["مكتمل", "Completed"],
  ongoing: ["مستمرة", "Ongoing"],
  planned: ["مخطط لها", "Planned"],
  // priority
  urgent: ["عاجل", "Urgent"],
  high: ["عالية", "High"],
  medium: ["متوسطة", "Medium"],
  normal: ["عادية", "Normal"],
  low: ["منخفضة", "Low"],
  // notice type
  info: ["معلومة", "Info"],
  warning: ["تنبيه", "Warning"],
  success: ["نجاح", "Success"],
  error: ["خطأ", "Error"],
  danger: ["هام", "Important"],
  announcement: ["إعلان", "Announcement"],
  event: ["فعالية", "Event"],
  // roles
  super_admin: ["المشرف العام", "Super admin"],
  admin: ["مشرف النظام", "Admin"],
  editor: ["محرر المحتوى", "Editor"],
  content_manager: ["مدير المحتوى", "Content manager"],
  family_manager: ["مدير شؤون الأسرة", "Family manager"],
  treasurer: ["أمين الصندوق", "Treasurer"],
  member: ["عضو موثّق", "Verified member"],
  viewer: ["زائر", "Viewer"],
};

const tidy = (v: string) =>
  v
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());

/** "public" → "عام" / "Public"; unknown values are tidied, never dropped. */
export function consoleLabel(value: string | null | undefined, isAr: boolean): string {
  if (!value) return "—";
  const hit = LABELS[value.toLowerCase()];
  return hit ? (isAr ? hit[0] : hit[1]) : tidy(value);
}

/* ── Audit log ─────────────────────────────────────────────────────── */

/** What each audited table is called, and which console tab manages it. */
export const AUDIT_ENTITIES: Record<string, { ar: string; en: string; to?: [string, string] }> = {
  family_members: { ar: "سجل الأفراد", en: "Members", to: ["family", "members"] },
  family_relationships: { ar: "صلات القرابة", en: "Kinship", to: ["family", "relationships"] },
  branches: { ar: "الفروع", en: "Branches", to: ["family", "branches"] },
  places: { ar: "المواقع والمجالس", en: "Places", to: ["family", "places"] },
  content_pages: { ar: "الصفحات", en: "Pages", to: ["content", "pages"] },
  articles: { ar: "الأخبار والمقالات", en: "Articles", to: ["content", "articles"] },
  events: { ar: "الفعاليات", en: "Events", to: ["content", "events"] },
  event_registrations: {
    ar: "تسجيلات الفعاليات",
    en: "Event registrations",
    to: ["content", "events"],
  },
  announcements: { ar: "الإعلانات", en: "Announcements", to: ["content", "announcements"] },
  media_assets: { ar: "الوسائط", en: "Media", to: ["content", "media_library"] },
  galleries: { ar: "مجموعات المتحف", en: "Museum collections", to: ["content", "library_items"] },
  gallery_media: { ar: "صور المتحف", en: "Museum photos", to: ["content", "library_items"] },
  library_items: {
    ar: "الأرشيف والمكتبة",
    en: "Archive & library",
    to: ["content", "library_items"],
  },
  navigation_menus: { ar: "القوائم", en: "Menus", to: ["content", "navigation"] },
  navigation_items: { ar: "روابط القوائم", en: "Menu links", to: ["content", "navigation"] },
  user_roles: { ar: "أدوار المستخدمين", en: "User roles", to: ["system", "users"] },
  role_permissions: {
    ar: "صلاحيات الأدوار",
    en: "Role capabilities",
    to: ["system", "roles_matrix"],
  },
  permissions: { ar: "الصلاحيات", en: "Capabilities", to: ["system", "roles_matrix"] },
  site_settings: { ar: "إعدادات المنصة", en: "Platform settings", to: ["system", "site_settings"] },
  businesses: { ar: "دليل الأعمال", en: "Business directory", to: ["community", "directory"] },
  membership_requests: { ar: "طلبات العضوية", en: "Membership requests", to: ["system", "users"] },
  contact_messages: { ar: "رسائل التواصل", en: "Contact messages", to: ["community", "inquiries"] },
  inquiries: { ar: "الطلبات والاستفسارات", en: "Inquiries", to: ["community", "inquiries"] },
  initiatives: { ar: "المبادرات", en: "Initiatives", to: ["projects", "initiatives"] },
  initiative_registrations: {
    ar: "تسجيلات المبادرات",
    en: "Initiative sign-ups",
    to: ["projects", "initiatives"],
  },
  achievers: { ar: "لوحة الشرف", en: "Honour roll", to: ["projects", "achievers"] },
  notifications: { ar: "الإشعارات", en: "Notifications", to: ["system", "email_notifications"] },
  council_committees: { ar: "اللجان", en: "Committees", to: ["community", "committees"] },
  contributions: { ar: "المساهمات", en: "Contributions" },
};

export function auditEntityLabel(entity: string, isAr: boolean): string {
  const e = AUDIT_ENTITIES[entity];
  return e ? (isAr ? e.ar : e.en) : tidy(entity);
}

export type AuditTone = "add" | "change" | "remove" | "neutral";

export function describeAuditAction(action: string): { ar: string; en: string; tone: AuditTone } {
  const a = action.toLowerCase();
  if (a.startsWith("bulk_") && a.includes("delete"))
    return { ar: "حذف جماعي", en: "Bulk delete", tone: "remove" };
  if (a.startsWith("bulk_")) return { ar: "تعديل جماعي", en: "Bulk update", tone: "change" };
  if (a === "create" || a === "insert") return { ar: "إضافة", en: "Added", tone: "add" };
  if (a === "upload") return { ar: "رفع", en: "Uploaded", tone: "add" };
  if (a === "granted") return { ar: "منح صلاحية", en: "Access granted", tone: "add" };
  if (a.includes("delete")) return { ar: "حذف", en: "Deleted", tone: "remove" };
  if (a === "archive") return { ar: "أرشفة", en: "Archived", tone: "remove" };
  if (a === "role_change") return { ar: "تعديل أدوار", en: "Roles changed", tone: "change" };
  if (a === "permissions_change")
    return { ar: "تعديل صلاحيات", en: "Capabilities changed", tone: "change" };
  if (a === "settings_change")
    return { ar: "تعديل إعدادات", en: "Settings changed", tone: "change" };
  if (a === "broadcast_notification") return { ar: "بثّ إشعار", en: "Broadcast sent", tone: "add" };
  if (a.includes("registration_status"))
    return { ar: "تحديث حالة تسجيل", en: "Registration updated", tone: "change" };
  if (a.includes("publish")) return { ar: "نشر", en: "Published", tone: "add" };
  if (a.includes("update") || a === "edit") return { ar: "تحديث", en: "Updated", tone: "change" };
  if (a.includes("login") || a.includes("sign"))
    return { ar: "دخول", en: "Sign-in", tone: "neutral" };
  return { ar: tidy(action), en: tidy(action), tone: "neutral" };
}

/** Badge colours per audit tone, in the console's heritage palette. */
export const AUDIT_TONE_CLASS: Record<AuditTone, string> = {
  add: "bg-[#245b3f]/10 text-[#245b3f] dark:bg-[#59836e]/20 dark:text-[#9cc7ae]",
  change: "bg-[#eca654]/15 text-[#8a5a1c] dark:text-[#f1bc7d]",
  remove: "bg-[#b4532a]/10 text-[#9a4220] dark:text-[#e8a184]",
  neutral: "bg-muted text-muted-foreground",
};
