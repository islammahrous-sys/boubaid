import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { AppRole } from "@/hooks/useAuth";
import {
  type NotificationType,
  type NotificationCategory,
  getCategoryForType,
} from "./notifications.types";

export { type NotificationType, type NotificationCategory, getCategoryForType };

interface NotificationPayload {
  title_ar: string;
  title_en?: string | null;
  message_ar: string;
  message_en?: string | null;
  type: string;
  link?: string | null;
}

/**
 * Checks if a user has opted out of notifications for a given type.
 * Gracefully falls back to true (enabled) if preferences are not set or table is pending.
 */
async function isNotificationAllowedForUser(userId: string, type: string): Promise<boolean> {
  try {
    const { data: pref, error } = await supabaseAdmin
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !pref) {
      // If table does not exist or user has no custom row, check user_metadata or default to allowed
      return true;
    }

    if (pref.in_app_notifications === false) return false;

    const cat = getCategoryForType(type);
    if (cat === "system" && pref.system_alerts === false) return false;
    if (cat === "events" && pref.family_events === false) return false;
    if (cat === "contributions" && pref.contributions === false) return false;
    if (
      cat === "heritage" &&
      pref.lineage_updates === false &&
      (type === "lineage" || type === "family_tree")
    )
      return false;
    if (
      cat === "heritage" &&
      pref.articles_news === false &&
      (type === "article" || type === "announcement" || type === "initiative")
    )
      return false;

    return true;
  } catch {
    return true;
  }
}

/**
 * Creates an in-app notification row for a specific user, respecting user preferences.
 */
export async function createNotification(
  userId: string,
  payload: NotificationPayload,
): Promise<boolean> {
  try {
    const allowed = await isNotificationAllowedForUser(userId, payload.type);
    if (!allowed) return false;

    const { error } = await supabaseAdmin.from("notifications").insert({
      user_id: userId,
      title_ar: payload.title_ar,
      title_en: payload.title_en || payload.title_ar,
      message_ar: payload.message_ar,
      message_en: payload.message_en || payload.message_ar,
      type: payload.type,
      link: payload.link || null,
      is_read: false,
    });

    if (error) {
      console.error("[notifications.server] Failed to insert notification:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[notifications.server] Error creating notification:", err);
    return false;
  }
}

/**
 * Dispatches notifications in batch to multiple users.
 */
export async function notifyUsers(
  userIds: string[],
  payload: NotificationPayload,
  excludeUserId?: string,
): Promise<number> {
  const uniqueIds = Array.from(new Set(userIds)).filter(
    (id) => Boolean(id) && id !== excludeUserId,
  );
  if (uniqueIds.length === 0) return 0;

  try {
    // Check preferences in bulk
    const { data: prefs } = await supabaseAdmin
      .from("notification_preferences")
      .select("*")
      .in("user_id", uniqueIds);

    const prefMap = new Map((prefs ?? []).map((p) => [p.user_id, p]));
    const cat = getCategoryForType(payload.type);

    const eligibleIds = uniqueIds.filter((uid) => {
      const p = prefMap.get(uid);
      if (!p) return true;
      if (p.in_app_notifications === false) return false;
      if (cat === "system" && p.system_alerts === false) return false;
      if (cat === "events" && p.family_events === false) return false;
      if (cat === "contributions" && p.contributions === false) return false;
      if (
        cat === "heritage" &&
        p.lineage_updates === false &&
        (payload.type === "lineage" || payload.type === "family_tree")
      )
        return false;
      if (
        cat === "heritage" &&
        p.articles_news === false &&
        (payload.type === "article" ||
          payload.type === "announcement" ||
          payload.type === "initiative")
      )
        return false;
      return true;
    });

    if (eligibleIds.length === 0) return 0;

    const rows = eligibleIds.map((userId) => ({
      user_id: userId,
      title_ar: payload.title_ar,
      title_en: payload.title_en || payload.title_ar,
      message_ar: payload.message_ar,
      message_en: payload.message_en || payload.message_ar,
      type: payload.type,
      link: payload.link || null,
      is_read: false,
    }));

    const { error } = await supabaseAdmin.from("notifications").insert(rows);
    if (error) {
      console.error("[notifications.server] Batch insert error:", error.message);
      return 0;
    }
    return rows.length;
  } catch (err) {
    console.error("[notifications.server] Error in notifyUsers:", err);
    return 0;
  }
}

/**
 * Dispatches notifications to all members holding any of the specified roles.
 */
export async function notifyRoles(
  roles: AppRole[],
  payload: NotificationPayload,
  excludeUserId?: string,
): Promise<number> {
  try {
    const { data: userRoles, error } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .in("role", roles);

    if (error) {
      console.error("[notifications.server] Error querying roles:", error.message);
      return 0;
    }

    const userIds = (userRoles ?? []).map((r) => r.user_id);
    return await notifyUsers(userIds, payload, excludeUserId);
  } catch (err) {
    console.error("[notifications.server] Error in notifyRoles:", err);
    return 0;
  }
}

/**
 * Dispatches notifications to all registered family members/profiles.
 */
export async function notifyAllMembers(
  payload: NotificationPayload,
  excludeUserId?: string,
): Promise<number> {
  try {
    const { data: profiles, error } = await supabaseAdmin.from("profiles").select("id");

    if (error) {
      console.error("[notifications.server] Error querying profiles:", error.message);
      return 0;
    }

    const userIds = (profiles ?? []).map((p) => p.id);
    return await notifyUsers(userIds, payload, excludeUserId);
  } catch (err) {
    console.error("[notifications.server] Error in notifyAllMembers:", err);
    return 0;
  }
}

/* =========================================================================
 * Trigger-Specific Notification Handlers
 * ========================================================================= */

/**
 * Trigger: User registers a new account.
 * Audience: Council Admins, Super Admins, Family Managers.
 */
export async function notifyAdminsOnNewRegistration(user: {
  id: string;
  name?: string | null;
  email?: string | null;
}) {
  const displayName = user.name || user.email || "عضو جديد";
  await notifyRoles(
    ["admin", "super_admin", "family_manager"],
    {
      title_ar: "تسجيل مستخدم جديد في المنظومة",
      title_en: "New User Registration",
      message_ar: `انضم مستخدم جديد للمنظومة: ${displayName}`,
      message_en: `A new user has registered: ${displayName}`,
      type: "registration",
      link: "/admin",
    },
    user.id,
  );
}

/**
 * Trigger: User submits membership verification request.
 * Audience: Council Admins, Super Admins, Family Managers.
 */
export async function notifyAdminsOnMembershipRequest(request: {
  id: string;
  fullName: string;
  branch?: string | null;
  userId?: string | null;
}) {
  const branchText = request.branch ? ` (فرع: ${request.branch})` : "";
  await notifyRoles(
    ["admin", "super_admin", "family_manager"],
    {
      title_ar: "طلب توثيق عضوية جديد",
      title_en: "New Membership Request",
      message_ar: `تقدم ${request.fullName}${branchText} بطلب توثيق عضوية وبطاقة انتساب للأسرة.`,
      message_en: `${request.fullName}${branchText} submitted a new family membership verification request.`,
      type: "membership",
      link: "/admin",
    },
    request.userId || undefined,
  );
}

/**
 * Trigger: Membership request is reviewed (approved/rejected).
 * Audience: The member who requested membership.
 */
/**
 * Trigger: Membership request is reviewed (approved/rejected).
 * Audience: The member who requested membership.
 */
export async function notifyMemberOnMembershipDecision(
  userId: string,
  status: "approved" | "rejected",
  reviewNote?: string | null,
) {
  const isApproved = status === "approved";
  await createNotification(userId, {
    title_ar: isApproved ? "تم اعتماد عضويتك في الأسرة" : "تحديث حول طلب العضوية",
    title_en: isApproved ? "Membership Approved" : "Membership Request Update",
    message_ar: isApproved
      ? "نبارك لك اعتماد عضويتك في مجلس أسرة آل بوعبيد! بطاقة عضويتك الرقمية وخدمات الصندوق متاحة الآن."
      : `تمت مراجعة طلب عضويتك: ${reviewNote || "يرجى مراجعة تفاصيل حسابك."}`,
    message_en: isApproved
      ? "Congratulations! Your family membership has been approved. Your digital ID and member services are now available."
      : `Your membership request was reviewed: ${reviewNote || "Please check your account for notes."}`,
    type: "membership",
    link: "/account",
  });

  // Dispatch professional email notification
  try {
    const { enqueueNotificationEmail } = await import("./email/notification-queue.server");
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name_ar, full_name_en, branch_slug")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.email) {
      void enqueueNotificationEmail({
        userId,
        recipientEmail: profile.email,
        recipientName: profile.full_name_ar || profile.full_name_en,
        emailType: isApproved ? "membership_approved" : "membership_rejected",
        category: "membership",
        priority: "HIGH",
        variables: {
          user_name: profile.full_name_ar || profile.full_name_en || "",
          full_name: profile.full_name_ar || profile.full_name_en || "",
          branch_name: profile.branch_slug || "",
          membership_number: `ABF-MBR-${userId.slice(0, 8).toUpperCase()}`,
          rejection_reason: reviewNote || "",
          action_url: "/account",
        },
        idempotencyKey: `email-mbr-dec-${userId}-${status}`,
      }).catch((err) => console.error("[notifications.server] Email enqueue failed:", err));
    }
  } catch (err) {
    console.warn("[notifications.server] Email dispatch error:", err);
  }
}

/**
 * Trigger: Role assigned or revoked.
 * Audience: The target user whose roles were updated.
 */
export async function notifyMemberOnRoleAssignment(
  userId: string,
  role: string,
  action: "granted" | "revoked",
) {
  const isGranted = action === "granted";
  const roleNamesAr: Record<string, string> = {
    admin: "مدير نظام",
    super_admin: "مشرف عام",
    editor: "محرر محتوى",
    content_manager: "مدير محتوى",
    treasurer: "أمين الصندوق والخزينة",
    family_manager: "مسؤول أنساب وشجرة العائلة",
    member: "عضو موثق",
    viewer: "قارئ",
  };
  const roleNamesEn: Record<string, string> = {
    admin: "Administrator",
    super_admin: "Super Admin",
    editor: "Editor",
    content_manager: "Content Manager",
    treasurer: "Treasurer",
    family_manager: "Family Genealogist",
    member: "Verified Member",
    viewer: "Viewer",
  };

  const nameAr = roleNamesAr[role] || role;
  const nameEn = roleNamesEn[role] || role;

  await createNotification(userId, {
    title_ar: isGranted ? `تم منحك دور صلاحية جديد: ${nameAr}` : `تحديث صلاحيات الحساب: ${nameAr}`,
    title_en: isGranted ? `New Role Assigned: ${nameEn}` : `Role Updated: ${nameEn}`,
    message_ar: isGranted
      ? `تم تعيين دور (${nameAr}) لحسابك في منصة مجلس أسرة آل بوعبيد.`
      : `تم تحديث صلاحياتك وإلغاء دور (${nameAr}).`,
    message_en: isGranted
      ? `You have been assigned the role of (${nameEn}) in Al Bu Obaid Family Intranet.`
      : `Your account role (${nameEn}) has been revoked.`,
    type: "role_change",
    link: "/account",
  });

  // Email notification on role granting
  if (isGranted) {
    try {
      const { enqueueNotificationEmail } = await import("./email/notification-queue.server");
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("email, full_name_ar, full_name_en")
        .eq("id", userId)
        .maybeSingle();

      if (profile?.email) {
        void enqueueNotificationEmail({
          userId,
          recipientEmail: profile.email,
          recipientName: profile.full_name_ar || profile.full_name_en,
          emailType: "system_notification",
          category: "system",
          priority: "HIGH",
          variables: {
            title: `تم منحكم صلاحية جديدة: ${nameAr}`,
            user_name: profile.full_name_ar || profile.full_name_en || "",
            message: `تم اعتماد إسناد دور (${nameAr}) إلى حسابكم في منصة مجلس أسرة آل بوعبيد.`,
            action_url: "/account",
            action_label: "فتح الملف الشخصي",
          },
          idempotencyKey: `email-role-${userId}-${role}-${action}`,
        }).catch((err) => console.error("[notifications.server] Email enqueue failed:", err));
      }
    } catch (err) {
      console.warn("[notifications.server] Email role error:", err);
    }
  }
}

/**
 * Trigger: Member submits financial support/contribution.
 * Audience: Council Admins, Super Admins, Treasurers.
 */
export async function notifyAdminsAndTreasurersOnContribution(contribution: {
  id: string;
  contributorName: string;
  amount: number;
  currency: string;
  userId?: string | null;
}) {
  await notifyRoles(
    ["admin", "super_admin", "treasurer"],
    {
      title_ar: "مساهمة مالية جديدة قيد التحقق",
      title_en: "New Financial Contribution",
      message_ar: `وردت مساهمة مالية جديدة بمبلغ ${contribution.amount} ${contribution.currency} من ${contribution.contributorName} تتطلب مراجعة أمين الصندوق.`,
      message_en: `New contribution of ${contribution.amount} ${contribution.currency} received from ${contribution.contributorName} awaiting treasury verification.`,
      type: "financial",
      link: "/treasury",
    },
    contribution.userId || undefined,
  );
}

/**
 * Trigger: Treasurer or Admin reviews contribution receipt.
 * Audience: The contributing member.
 */
export async function notifyMemberOnContributionDecision(
  userId: string,
  status: "verified" | "rejected",
  amount: number,
  currency: string,
  reviewNote?: string | null,
) {
  const isVerified = status === "verified";
  await createNotification(userId, {
    title_ar: isVerified ? "تم توثيق وقيد مساهمتك المالية" : "تحديث حول مساهمتك المالية",
    title_en: isVerified ? "Contribution Verified" : "Contribution Review Update",
    message_ar: isVerified
      ? `تم التحقق من إيصال تحويلك بمبلغ ${amount} ${currency} وإيداعها في سجلات الصندوق بنجاح. بارك الله في عطائك.`
      : `تمت مراجعة مساهمتك بمبلغ ${amount} ${currency}: ${reviewNote || "يرجى مراجعة إيصال التحويل في حسابك."}`,
    message_en: isVerified
      ? `Your contribution of ${amount} ${currency} has been verified and recorded in the family fund. Thank you for your support.`
      : `Your contribution of ${amount} ${currency} was reviewed: ${reviewNote || "Please check transaction details in your account."}`,
    type: "financial",
    link: "/account",
  });

  // Dispatch professional email notification
  try {
    const { enqueueNotificationEmail } = await import("./email/notification-queue.server");
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name_ar, full_name_en")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.email) {
      void enqueueNotificationEmail({
        userId,
        recipientEmail: profile.email,
        recipientName: profile.full_name_ar || profile.full_name_en,
        emailType: isVerified ? "fund_contribution_confirmed" : "fund_contribution_rejected",
        category: "fund",
        priority: "HIGH",
        variables: {
          user_name: profile.full_name_ar || profile.full_name_en || "",
          amount: String(amount),
          currency,
          reason: reviewNote || "",
          action_url: "/account",
        },
        idempotencyKey: `email-contrib-${userId}-${status}-${amount}`,
      }).catch((err) => console.error("[notifications.server] Contribution email enqueue failed:", err));
    }
  } catch (err) {
    console.warn("[notifications.server] Contribution email error:", err);
  }
}

/**
 * Trigger: Lineage record change (family member added/updated/archived).
 * Audience: Family Managers, Genealogists, Admins.
 */
export async function notifyFamilyManagersOnLineageUpdate(change: {
  actorId: string;
  memberName: string;
  actionDesc: string;
}) {
  await notifyRoles(
    ["family_manager", "admin", "super_admin"],
    {
      title_ar: "تحديث في سجل أنساب الأسرة",
      title_en: "Lineage & Family Tree Update",
      message_ar: `تم إجراء تعديل على بيانات الفرد (${change.memberName}): ${change.actionDesc}`,
      message_en: `Lineage record updated for (${change.memberName}): ${change.actionDesc}`,
      type: "lineage",
      link: "/family-tree",
    },
    change.actorId,
  );
}

/**
 * Trigger: New inquiry or contact message received.
 * Audience: Editors, Content Managers, Admins.
 */
export async function notifyContentStaffOnInquiryOrMessage(item: {
  type: "inquiry" | "contact_message";
  title: string;
}) {
  await notifyRoles(["editor", "content_manager", "admin", "super_admin"], {
    title_ar: item.type === "inquiry" ? "استفسار جديد وارد" : "رسالة تواصل جديدة",
    title_en: item.type === "inquiry" ? "New Inquiry Received" : "New Contact Message",
    message_ar: `ورد ${item.type === "inquiry" ? "استفسار جديد" : "رسالة تواصل"}: ${item.title}`,
    message_en: `New ${item.type === "inquiry" ? "inquiry" : "contact message"}: ${item.title}`,
    type: item.type,
    link: "/admin",
  });
}

/**
 * Trigger: New family event scheduled/published.
 * Audience: All Members.
 */
export async function notifyMembersOnNewEvent(event: {
  title_ar: string;
  title_en?: string | null;
  slug?: string | null;
}) {
  await notifyAllMembers({
    title_ar: `فعالية عائلية جديدة: ${event.title_ar}`,
    title_en: `New Family Event: ${event.title_en || event.title_ar}`,
    message_ar: `يسر المجلس دعوتكم لحضور "${event.title_ar}". تفضلوا بالاطلاع على التفاصيل والمشاركة.`,
    message_en: `The Council invites you to attend "${event.title_en || event.title_ar}". Check details and participate.`,
    type: "event",
    link: event.slug ? `/events` : "/events",
  });
}

/**
 * Trigger: Major announcement or initiative published.
 * Audience: All Members.
 */
export async function notifyMembersOnNewAnnouncement(item: {
  title_ar: string;
  title_en?: string | null;
  link?: string | null;
  type?: "announcement" | "initiative";
}) {
  const isInitiative = item.type === "initiative";
  await notifyAllMembers({
    title_ar: isInitiative ? `مبادرة أسرية جديدة: ${item.title_ar}` : `إعلان هام: ${item.title_ar}`,
    title_en: isInitiative
      ? `New Initiative: ${item.title_en || item.title_ar}`
      : `Announcement: ${item.title_en || item.title_ar}`,
    message_ar: isInitiative
      ? `أطلق مجلس الأسرة مبادرة جديدة: "${item.title_ar}". ندعوكم للتعرف عليها والمساهمة.`
      : `نشر مجلس الأسرة إعلاناً جديداً: "${item.title_ar}".`,
    message_en: isInitiative
      ? `The Family Council launched a new initiative: "${item.title_en || item.title_ar}". Learn more and get involved.`
      : `A new family announcement has been posted: "${item.title_en || item.title_ar}".`,
    type: item.type || "announcement",
    link: item.link || "/news",
  });
}

/**
 * Trigger: New article draft submitted or saved.
 * Audience: Content Editors, Content Managers, Admins.
 */
export async function notifyContentStaffOnArticleDraft(article: {
  id: string;
  title_ar: string;
  title_en?: string | null;
}) {
  await notifyRoles(["editor", "content_manager", "admin", "super_admin"], {
    title_ar: "مسودة مقال جديدة بانتظار المراجعة",
    title_en: "New Article Draft for Review",
    message_ar: `تم حفظ مسودة مقال جديدة: "${article.title_ar}". يرجى مراجعتها وتدقيقها للنشر.`,
    message_en: `New article draft saved: "${article.title_en || article.title_ar}". Please review for publication.`,
    type: "article",
    link: "/admin",
  });
}

/**
 * Trigger: New media asset or document uploaded.
 * Audience: Content Editors, Content Managers, Admins.
 */
export async function notifyContentStaffOnMediaSubmission(asset: {
  id: string;
  title_ar: string;
  title_en?: string | null;
}) {
  await notifyRoles(["editor", "content_manager", "admin", "super_admin"], {
    title_ar: "إضافة وسائط ومستندات جديدة للأرشيف",
    title_en: "New Media Asset Uploaded",
    message_ar: `تم رفع عنصر وسائط جديد: "${asset.title_ar}". متاح الآن في خزانة الأرشيف.`,
    message_en: `New media asset uploaded: "${asset.title_en || asset.title_ar}". Available in archive library.`,
    type: "article",
    link: "/admin",
  });
}

/**
 * Trigger: New article published.
 * Audience: All Members.
 */
export async function notifyMembersOnNewArticle(article: {
  id: string;
  title_ar: string;
  title_en?: string | null;
  slug?: string | null;
}) {
  await notifyAllMembers({
    title_ar: `مقال جديد: ${article.title_ar}`,
    title_en: `New Article: ${article.title_en || article.title_ar}`,
    message_ar: `نُشر مقال جديد في منصة الأسرة: "${article.title_ar}". ندعوكم لقراءته ومشاركته.`,
    message_en: `A new article was published: "${article.title_en || article.title_ar}". Enjoy reading.`,
    type: "article",
    link: article.slug ? `/articles/${article.slug}` : "/news",
  });
}

// Convenience alias helpers matching dispatch naming conventions
export const notifyAdminsAndTreasurers = notifyAdminsAndTreasurersOnContribution;
export const notifyAdminsAndGenealogists = notifyFamilyManagersOnLineageUpdate;
export const notifyAdminsAndEditors = notifyContentStaffOnInquiryOrMessage;
export const notifyAdminsForNewMember = notifyAdminsOnNewRegistration;
export const notifyUser = createNotification;
