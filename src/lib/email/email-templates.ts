import type { EmailCategory, EmailLanguage, EmailPriority } from "./email-types";
import { wrapInEmailShell } from "./email-shell";
import {
  renderGreeting,
  renderTitle,
  renderParagraph,
  renderInformationCard,
  renderDetailsTable,
  renderActionButton,
  renderAlertBox,
  renderTrackingTroubleNotice,
  type DetailRow,
} from "./email-components";

export interface TemplateDefinition {
  key: string;
  category: EmailCategory;
  defaultPriority: EmailPriority;
  nameAr: string;
  nameEn: string;
  subjectAr: (vars: Record<string, any>) => string;
  subjectEn: (vars: Record<string, any>) => string;
  renderBody: (
    vars: Record<string, any>,
    lang: EmailLanguage,
  ) => {
    title: string;
    preheader: string;
    badgeText?: string;
    contentHtml: string;
    actionUrl: string;
    actionLabel: string;
    isNewsletter?: boolean;
    unsubscribeUrl?: string;
  };
}

const DEFAULT_BASE_URL = "https://www.boubaid.com";

function getUrl(path?: string): string {
  if (!path) return DEFAULT_BASE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${DEFAULT_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export const EMAIL_TEMPLATE_CATALOG: Record<string, TemplateDefinition> = {
  // ─────────────────────────────────────────────────────────────
  // A. ACCOUNT / AUTHENTICATION (1 - 10)
  // ─────────────────────────────────────────────────────────────
  auth_welcome: {
    key: "auth_welcome",
    category: "auth",
    defaultPriority: "HIGH",
    nameAr: "الترحيب وإنشاء الحساب",
    nameEn: "Welcome / Account Created",
    subjectAr: () => "أهلاً بك في بوابة مجلس أسرة آل بوعبيد الرسمية",
    subjectEn: () => "Welcome to the Official Al Bu Obaid Family Portal",
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl(vars.action_url || "/account");
      return {
        title: isAr ? "مرحباً بك في منصة الأسرة" : "Welcome to the Family Portal",
        preheader: isAr
          ? "تم إنشاء وتفعيل حسابك في بوابة الأسرة بنجاح"
          : "Your family portal account was created successfully",
        badgeText: isAr ? "حساب جديد" : "New Account",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "أهلاً بك في منصة أسرة آل بوعبيد" : "Welcome to Al Bu Obaid Portal")}
          ${renderParagraph(
            isAr
              ? "يسر مجلس الأسرة وصندوق التنمية العائلية الترحيب بكم في البوابة الرسمية، منصتكم الموحدة للتواصل، ومتابعة الطلبات، وتوثيق العضوية والاطلاع على أخبار ومناسبات الأسرة."
              : "The Family Council and Development Fund welcome you to the official portal, your unified home for member services, council requests, and family records.",
          )}
          ${renderInformationCard(
            renderDetailsTable(
              [
                { label: isAr ? "البريد الإلكتروني" : "Email", value: vars.user_email || "" },
                {
                  label: isAr ? "تاريخ التسجيل" : "Registration Date",
                  value: vars.date || new Date().toLocaleDateString(isAr ? "ar-SA" : "en-US"),
                },
                {
                  label: isAr ? "حالة الحساب" : "Account Status",
                  value: isAr ? "نشط ومسجل" : "Active & Registered",
                  isBadge: true,
                  badgeVariant: "success",
                },
              ],
              lang,
            ),
          )}
          ${renderParagraph(
            isAr
              ? "يمكنكم الآن الدخول إلى ملفكم الشخصي لتوثيق بيانات العضوية أو الاطلاع على الخدمات ومستجدات الصندوق."
              : "You can now log in to update your profile, verify your family membership, and view fund initiatives.",
          )}
          ${renderActionButton(actionUrl, isAr ? "الدخول إلى حسابي" : "Go to My Account", lang)}
          ${renderTrackingTroubleNotice(actionUrl, lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "الدخول إلى حسابي" : "Go to My Account",
      };
    },
  },

  auth_email_verification: {
    key: "auth_email_verification",
    category: "auth",
    defaultPriority: "CRITICAL",
    nameAr: "تأكيد وتوثيق البريد الإلكتروني",
    nameEn: "Email Verification",
    subjectAr: () => "تأكيد بريدك الإلكتروني — مجلس أسرة آل بوعبيد",
    subjectEn: () => "Verify Your Email Address — Al Bu Obaid Family Council",
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl(vars.verification_url || "/verify");
      return {
        title: isAr ? "تأكيد البريد الإلكتروني" : "Verify Email Address",
        preheader: isAr
          ? "يرجى تأكيد بريدك الإلكتروني لإكمال التفعيل"
          : "Please verify your email address to complete registration",
        badgeText: isAr ? "أمان الحساب" : "Security",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تأكيد عنوان بريدك الإلكتروني" : "Confirm Your Email Address")}
          ${renderParagraph(
            isAr
              ? "نرجو النقر على الزر أدناه لتأكيد بريدك الإلكتروني وتأمين حسابك في بوابة أسرة آل بوعبيد."
              : "Please click the button below to verify your email address and secure your account.",
          )}
          ${vars.otp_code ? renderAlertBox(isAr ? `رمز التحقق الخاص بك هو: ${vars.otp_code}` : `Your verification code is: ${vars.otp_code}`, "info", isAr ? "رمز التحقق" : "Verification Code") : ""}
          ${renderActionButton(actionUrl, isAr ? "تأكيد البريد الإلكتروني" : "Verify Email", lang)}
          ${renderAlertBox(
            isAr
              ? "هذا الرابط صالح للاستخدام لمرة واحدة وينتهي خلال 60 دقيقة لحمايتكم."
              : "This link is valid for single use and expires in 60 minutes.",
            "info",
          )}
          ${renderTrackingTroubleNotice(actionUrl, lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "تأكيد البريد الإلكتروني" : "Verify Email",
      };
    },
  },

  auth_password_reset: {
    key: "auth_password_reset",
    category: "auth",
    defaultPriority: "CRITICAL",
    nameAr: "إعادة تعيين كلمة المرور",
    nameEn: "Password Reset",
    subjectAr: () => "طلب إعادة تعيين كلمة المرور — مجلس أسرة آل بوعبيد",
    subjectEn: () => "Reset Your Password — Al Bu Obaid Family Council",
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl(vars.reset_url || "/reset-password");
      return {
        title: isAr ? "إعادة تعيين كلمة المرور" : "Reset Password Request",
        preheader: isAr
          ? "تعليمات إعادة تعيين كلمة المرور لحسابك"
          : "Instructions to reset your family portal password",
        badgeText: isAr ? "أمان وخصوصية" : "Security",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "طلب إعادة تعيين كلمة المرور" : "Password Reset Request")}
          ${renderParagraph(
            isAr
              ? "تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابكم في بوابة أسرة آل بوعبيد. انقر على الزر أدناه لإنشاء كلمة مرور جديدة:"
              : "We received a request to reset your password. Click the button below to set a new password:",
          )}
          ${renderActionButton(actionUrl, isAr ? "إعادة تعيين كلمة المرور" : "Reset Password", lang)}
          ${renderAlertBox(
            isAr
              ? "ينتهي هذا الرابط خلال 60 دقيقة. إذا لم تقم بطلب إعادة التعيين، يرجى تجاهل هذا البريد فوراً."
              : "This link expires in 60 minutes. If you did not make this request, please disregard this email.",
            "critical",
            isAr ? "تنبيه أمني" : "Security Alert",
          )}
          ${renderTrackingTroubleNotice(actionUrl, lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "إعادة تعيين كلمة المرور" : "Reset Password",
      };
    },
  },

  auth_password_changed: {
    key: "auth_password_changed",
    category: "auth",
    defaultPriority: "CRITICAL",
    nameAr: "تم تغيير كلمة المرور بنجاح",
    nameEn: "Password Changed Confirmation",
    subjectAr: () => "إشعار أمني: تم تغيير كلمة مرور حسابكم",
    subjectEn: () => "Security Alert: Your Password Was Changed",
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/account");
      return {
        title: isAr ? "تأكيد تغيير كلمة المرور" : "Password Changed",
        preheader: isAr
          ? "تم تحديث كلمة المرور الخاصة بحسابكم بنجاح"
          : "Your account password was updated successfully",
        badgeText: isAr ? "أمان الحساب" : "Security",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تم تغيير كلمة المرور بنجاح" : "Password Changed Successfully")}
          ${renderParagraph(
            isAr
              ? "نحيطكم علماً بأنه تم تغيير كلمة المرور لحسابكم في بوابة أسرة آل بوعبيد."
              : "This is a confirmation that the password for your family portal account was recently updated.",
          )}
          ${renderInformationCard(
            renderDetailsTable(
              [
                {
                  label: isAr ? "التاريخ والوقت" : "Timestamp",
                  value: vars.timestamp || new Date().toLocaleString(isAr ? "ar-SA" : "en-US"),
                },
                {
                  label: isAr ? "الجهاز / المتصفح" : "Client / Device",
                  value: vars.client_info || (isAr ? "متصفح موثق" : "Web browser"),
                },
              ],
              lang,
            ),
          )}
          ${renderAlertBox(
            isAr
              ? "إذا لم تكن أنت من قام بهذا التغيير، يرجى استعادة حسابك والتواصل فوراً مع الدعم الفني."
              : "If you did not perform this change, please recover your account immediately and contact technical support.",
            "critical",
            isAr ? "هل لم تكن أنت؟" : "Wasn't you?",
          )}
          ${renderActionButton(actionUrl, isAr ? "مراجعة أمان الحساب" : "Review Account Security", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "مراجعة أمان الحساب" : "Review Account Security",
      };
    },
  },

  auth_email_changed: {
    key: "auth_email_changed",
    category: "auth",
    defaultPriority: "CRITICAL",
    nameAr: "تغيير عنوان البريد الإلكتروني",
    nameEn: "Email Address Changed",
    subjectAr: () => "إشعار أمني: تم تغيير عنوان البريد الإلكتروني — آل بوعبيد",
    subjectEn: () => "Security Alert: Email Address Changed — Al Bu Obaid Family Council",
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/account");
      return {
        title: isAr ? "تغيير البريد الإلكتروني" : "Email Address Changed",
        preheader: isAr
          ? "تم تحديث عنوان البريد الإلكتروني المرتبط بحسابك"
          : "The email address associated with your account was updated",
        badgeText: isAr ? "أمان الحساب" : "Security Alert",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تم تحديث البريد الإلكتروني بنجاح" : "Email Address Successfully Changed")}
          ${renderParagraph(
            isAr
              ? "نحيطكم علماً بأنه تم تعديل عنوان البريد الإلكتروني المرتبط بحسابكم في بوابة أسرة آل بوعبيد."
              : "This is to notify you that the email address associated with your family portal account has been updated.",
          )}
          ${renderInformationCard(
            renderDetailsTable(
              [
                ...(vars.old_email
                  ? [{ label: isAr ? "البريد السابق" : "Previous Email", value: vars.old_email }]
                  : []),
                {
                  label: isAr ? "البريد الجديد" : "New Email",
                  value: vars.new_email || vars.user_email || "",
                },
                {
                  label: isAr ? "التاريخ والوقت" : "Timestamp",
                  value: vars.timestamp || new Date().toLocaleString(isAr ? "ar-SA" : "en-US"),
                },
              ],
              lang,
            ),
          )}
          ${renderAlertBox(
            isAr
              ? "إذا لم تكن أنت من أجرى هذا التغيير، يرجى المسارعة إلى استعادة حسابك والتواصل فوراً مع الدعم الفني لحماية بياناتك."
              : "If you did not make this change, please recover your account immediately and contact technical support.",
            "critical",
            isAr ? "تنبيه أمني هام" : "Important Security Alert",
          )}
          ${renderActionButton(actionUrl, isAr ? "مراجعة أمان الحساب" : "Review Account Security", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "مراجعة أمان الحساب" : "Review Account Security",
      };
    },
  },

  auth_new_login: {
    key: "auth_new_login",
    category: "auth",
    defaultPriority: "HIGH",
    nameAr: "تسجيل دخول جديد لحسابكم",
    nameEn: "New Login Notification",
    subjectAr: () => "إشعار تسجيل دخول جديد إلى حسابكم — آل بوعبيد",
    subjectEn: () => "New Sign-in Alert — Al Bu Obaid Family Council",
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/account");
      return {
        title: isAr ? "تسجيل دخول جديد" : "New Sign-in Detected",
        preheader: isAr
          ? "تم تسجيل الدخول إلى حسابك من جهاز أو موقع جديد"
          : "Your account was accessed from a new device or location",
        badgeText: isAr ? "نشاط الحساب" : "Activity",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تسجيل دخول جديد إلى حسابكم" : "New Sign-in to Your Account")}
          ${renderParagraph(
            isAr
              ? "تم رصد تسجيل دخول جديد إلى حسابكم في بوابة أسرة آل بوعبيد بالبيانات التالية:"
              : "A new sign-in to your family portal account was recorded with the following details:",
          )}
          ${renderInformationCard(
            renderDetailsTable(
              [
                {
                  label: isAr ? "وقت التسجيل" : "Time",
                  value: vars.timestamp || new Date().toLocaleString(isAr ? "ar-SA" : "en-US"),
                },
                {
                  label: isAr ? "الموقع التقريبي" : "Location",
                  value: vars.location || (isAr ? "المملكة العربية السعودية" : "Saudi Arabia"),
                },
                {
                  label: isAr ? "المتصفح / النظام" : "Device",
                  value: vars.device || "Chrome / Windows",
                },
              ],
              lang,
            ),
          )}
          ${renderActionButton(actionUrl, isAr ? "تفاصيل الحساب" : "View Account", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "تفاصيل الحساب" : "View Account",
      };
    },
  },

  auth_security_alert: {
    key: "auth_security_alert",
    category: "auth",
    defaultPriority: "CRITICAL",
    nameAr: "تنبيه أمني للحساب",
    nameEn: "Account Security Alert",
    subjectAr: () => "تنبيه أمني عاجل بشأن حسابكم — آل بوعبيد",
    subjectEn: () => "Urgent Security Alert Regarding Your Account",
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/reset-password");
      return {
        title: isAr ? "تنبيه أمني عاجل" : "Security Alert",
        preheader: isAr
          ? "إشعار أمني مهم لحماية حسابك في بوابة الأسرة"
          : "Important security notice regarding your family portal account",
        badgeText: isAr ? "حرج" : "Critical",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تنبيه أمني مهم" : "Important Security Notice")}
          ${renderAlertBox(
            vars.alert_details ||
              (isAr
                ? "تم رصد نشاط غير معتاد أو محاولات متكررة غير صحيحة لتسجيل الدخول إلى حسابك."
                : "Unusual activity or multiple failed login attempts were detected on your account."),
            "critical",
            isAr ? "تنبيه النظام" : "System Alert",
          )}
          ${renderParagraph(
            isAr
              ? "حرصاً على أمن وسلامة بياناتكم في منصة الأسرة، نوصي بتحديث كلمة المرور ومراجعة تفاصيل تسجيل الدخول فوراً."
              : "To protect your family portal account and personal information, we recommend changing your password immediately.",
          )}
          ${renderActionButton(actionUrl, isAr ? "تغيير كلمة المرور الآن" : "Change Password Now", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "تغيير كلمة المرور الآن" : "Change Password Now",
      };
    },
  },

  auth_account_activated: {
    key: "auth_account_activated",
    category: "auth",
    defaultPriority: "HIGH",
    nameAr: "تفعيل الحساب",
    nameEn: "Account Activated",
    subjectAr: () => "تم تفعيل حسابكم بنجاح في بوابة آل بوعبيد",
    subjectEn: () => "Your Account Has Been Activated",
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/account");
      return {
        title: isAr ? "تم تفعيل الحساب" : "Account Activated",
        preheader: isAr
          ? "حسابكم الآن نشط ومتاح للاستفادة من كافة الخدمات"
          : "Your account is now active and ready for all services",
        badgeText: isAr ? "مفعل" : "Active",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "حسابكم الآن مفعل وجاهز" : "Your Account is Now Active")}
          ${renderParagraph(
            isAr
              ? "نحيطكم علماً بأن حسابكم في بوابة أسرة آل بوعبيد أصبح مفعلاً بالكامل. يمكنكم الآن الاستفادة من جميع خدمات الأعضاء وتقديم ومتابعة الطلبات."
              : "We are pleased to inform you that your account is now fully active. You can now access member services and submit requests.",
          )}
          ${renderActionButton(actionUrl, isAr ? "فتح الحساب" : "Open Account", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "فتح الحساب" : "Open Account",
      };
    },
  },

  auth_account_suspended: {
    key: "auth_account_suspended",
    category: "auth",
    defaultPriority: "CRITICAL",
    nameAr: "تعليق الحساب مؤقتاً",
    nameEn: "Account Suspended",
    subjectAr: () => "إشعار بشأن تعليق الحساب مؤقتاً — آل بوعبيد",
    subjectEn: () => "Notice Regarding Account Suspension",
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/contact");
      return {
        title: isAr ? "إشعار تعليق الحساب" : "Account Suspended",
        preheader: isAr
          ? "تم تعليق حسابكم مؤقتاً لمراجعة إدارية"
          : "Your account has been temporarily suspended for review",
        badgeText: isAr ? "معلق" : "Suspended",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تعليق مؤقت للحساب" : "Temporary Account Suspension")}
          ${renderAlertBox(
            vars.suspension_reason ||
              (isAr
                ? "تم تعليق حسابكم مؤقتاً من قِبل إدارة المنظومة لإجراء مراجعة تنظيمية أو تدقيق في البيانات."
                : "Your account was temporarily suspended for administrative review or data verification."),
            "critical",
            isAr ? "سبب التعليق" : "Reason",
          )}
          ${renderParagraph(
            isAr
              ? "إذا كان لديكم أي استفسار أو لطلب إعادة التنشيط، يرجى التواصل مع أمانة المجلس عبر صفحة التواصل."
              : "If you have any questions or wish to request reactivation, please reach out via our contact page.",
          )}
          ${renderActionButton(actionUrl, isAr ? "التواصل مع أمانة المجلس" : "Contact Secretariat", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "التواصل مع أمانة المجلس" : "Contact Secretariat",
      };
    },
  },

  auth_account_restored: {
    key: "auth_account_restored",
    category: "auth",
    defaultPriority: "HIGH",
    nameAr: "استعادة وتنشيط الحساب",
    nameEn: "Account Restored",
    subjectAr: () => "تمت استعادة وتنشيط حسابكم بنجاح — آل بوعبيد",
    subjectEn: () => "Your Account Has Been Restored",
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/account");
      return {
        title: isAr ? "تم استعادة الحساب" : "Account Restored",
        preheader: isAr
          ? "تم رفع التعليق وتنشيط حسابكم بالكامل"
          : "Suspension lifted and your account is active again",
        badgeText: isAr ? "مستعاد" : "Restored",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تمت استعادة وتنشيط حسابكم" : "Your Account Has Been Restored")}
          ${renderParagraph(
            isAr
              ? "يسرنا إشعاركم بانتهاء المراجعة ورفع التعليق عن حسابكم في بوابة الأسرة. يمكنكم الآن تسجيل الدخول بصورة طبيعية."
              : "We are pleased to inform you that the administrative review has concluded and your account has been restored.",
          )}
          ${renderActionButton(actionUrl, isAr ? "تسجيل الدخول إلى حسابي" : "Log In to Account", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "تسجيل الدخول إلى حسابي" : "Log In to Account",
      };
    },
  },

  auth_profile_updated: {
    key: "auth_profile_updated",
    category: "auth",
    defaultPriority: "NORMAL",
    nameAr: "تحديث بيانات الملف الشخصي",
    nameEn: "Profile Updated",
    subjectAr: () => "تم تحديث بيانات ملفكم الشخصي بنجاح",
    subjectEn: () => "Your Profile Information Was Updated",
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/account");
      return {
        title: isAr ? "تحديث الملف الشخصي" : "Profile Updated",
        preheader: isAr
          ? "إشعار بتحديث بيانات حسابك في المنظومة"
          : "Your profile details have been successfully updated",
        badgeText: isAr ? "تحديث بيانات" : "Updated",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تم حفظ التعديلات على ملفكم الشخصي" : "Profile Changes Saved")}
          ${renderParagraph(
            isAr
              ? "تم حفظ وتحديث بيانات ملفكم الشخصي بنجاح في سجلات أسرة آل بوعبيد."
              : "Your profile information has been successfully updated in the official family database.",
          )}
          ${renderActionButton(actionUrl, isAr ? "معاينة الملف الشخصي" : "View Profile", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "معاينة الملف الشخصي" : "View Profile",
      };
    },
  },

  // ─────────────────────────────────────────────────────────────
  // B. MEMBERSHIP (11 - 21)
  // ─────────────────────────────────────────────────────────────
  membership_application_received: {
    key: "membership_application_received",
    category: "membership",
    defaultPriority: "HIGH",
    nameAr: "استلام طلب توثيق العضوية",
    nameEn: "Membership Application Received",
    subjectAr: (v) => `تم استلام طلب توثيق عضويتكم (${v.request_number || "قيد المراجعة"})`,
    subjectEn: (v) => `Membership Application Received (${v.request_number || "Under Review"})`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/account");
      return {
        title: isAr ? "استلام طلب العضوية" : "Membership Application Received",
        preheader: isAr
          ? "طلبكم قيد المراجعة والتدقيق لدى أمانة المجلس"
          : "Your application has been received and is under review",
        badgeText: isAr ? "قيد المراجعة" : "Under Review",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تم استلام طلب توثيق عضويتكم" : "Application Received Successfully")}
          ${renderParagraph(
            isAr
              ? "نشكركم على تقديم طلب توثيق العضوية في مجلس أسرة آل بوعبيد. تم تسجيل طلبكم وأُحيل إلى أمانة المجلس ولجنة الأنساب للمراجعة والتحقق."
              : "Thank you for submitting your family membership verification request. It has been forwarded to the General Secretariat for review.",
          )}
          ${renderInformationCard(
            renderDetailsTable(
              [
                {
                  label: isAr ? "رقم الطلب" : "Request No.",
                  value: vars.request_number || "قيد التعيين",
                },
                {
                  label: isAr ? "اسم مقدم الطلب" : "Applicant Name",
                  value: vars.applicant_name || vars.user_name || "",
                },
                {
                  label: isAr ? "فرع الأسرة" : "Family Branch",
                  value: vars.branch_name || (isAr ? "عام" : "General"),
                },
                {
                  label: isAr ? "تاريخ التقديم" : "Submission Date",
                  value: vars.date || new Date().toLocaleDateString(isAr ? "ar-SA" : "en-US"),
                },
                {
                  label: isAr ? "الحالة الحالية" : "Current Status",
                  value: isAr ? "قيد المراجعة والتدقيق" : "Pending Verification",
                  isBadge: true,
                  badgeVariant: "warning",
                },
              ],
              lang,
            ),
          )}
          ${renderParagraph(
            isAr
              ? "سيتم إشعاركم فور الانتهاء من فحص وتدقيق الطلب، كما يمكنكم متابعة حالة الطلب في أي وقت من خلال شاشة الحساب."
              : "You will be notified once verification is complete. You can also monitor your request status on your account page.",
          )}
          ${renderActionButton(actionUrl, isAr ? "متابعة حالة العضوية" : "Check Membership Status", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "متابعة حالة العضوية" : "Check Membership Status",
      };
    },
  },

  membership_under_review: {
    key: "membership_under_review",
    category: "membership",
    defaultPriority: "NORMAL",
    nameAr: "طلب العضوية قيد التدقيق والمراجعة",
    nameEn: "Membership Under Review",
    subjectAr: (v) => `طلب العضوية (${v.request_number || ""}) قيد المراجعة الآن`,
    subjectEn: (v) => `Membership Application (${v.request_number || ""}) Under Review`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/account");
      return {
        title: isAr ? "الطلب قيد التدقيق" : "Application Under Review",
        preheader: isAr
          ? "بدأت أمانة المجلس تدقيق بيانات نسب وعضوية طلبكم"
          : "The Secretariat has commenced verification of your application",
        badgeText: isAr ? "تدقيق نشط" : "In Progress",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "بدء مرحلة التدقيق والتحقق" : "Verification in Progress")}
          ${renderParagraph(
            isAr
              ? "نحيطكم علماً بأن أمانة المجلس ولجنة الأنساب قد بدأت دراسة طلبكم لمطابقة وثائق النسب وإصدار بطاقة الانتساب الرسمية."
              : "The Secretariat has begun reviewing your genealogical details and family documentation.",
          )}
          ${renderActionButton(actionUrl, isAr ? "عرض تفاصيل الطلب" : "View Application", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "عرض تفاصيل الطلب" : "View Application",
      };
    },
  },

  membership_approved: {
    key: "membership_approved",
    category: "membership",
    defaultPriority: "HIGH",
    nameAr: "اعتماد وقبول العضوية",
    nameEn: "Membership Approved",
    subjectAr: () => "نبارك لكم: تم اعتماد عضويتكم الرسمية في مجلس أسرة آل بوعبيد",
    subjectEn: () => "Congratulations: Your Family Membership Has Been Approved",
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/account");
      return {
        title: isAr ? "تم اعتماد العضوية" : "Membership Approved",
        preheader: isAr
          ? "نبارك لك اعتماد عضويتك وإصدار بطاقة الأسرة الرسمية"
          : "Congratulations on your verified family membership",
        badgeText: isAr ? "معتمد وموثق" : "Approved",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "نبارك لكم اعتماد العضوية الرسمية" : "Congratulations on Your Family Membership")}
          ${renderParagraph(
            isAr
              ? "يسر أمانة مجلس أسرة آل بوعبيد إشعاركم باعتماد طلب توثيق عضويتكم في سجلات الأسرة الرسمية. أهلاً بكم في مجتمع الأسرة الموثق."
              : "The Secretariat is delighted to announce that your family membership verification has been officially approved.",
          )}
          ${renderInformationCard(
            renderDetailsTable(
              [
                {
                  label: isAr ? "رقم العضوية" : "Membership ID",
                  value: vars.membership_number || "ABF-MBR-VERIFIED",
                },
                {
                  label: isAr ? "الاسم المعتمد" : "Approved Name",
                  value: vars.full_name || vars.user_name || "",
                },
                {
                  label: isAr ? "فرع الأسرة" : "Family Branch",
                  value: vars.branch_name || (isAr ? "الفرع الموثق" : "Verified Branch"),
                },
                {
                  label: isAr ? "الحالة" : "Status",
                  value: isAr ? "عضو موثق رسمياً" : "Verified Member",
                  isBadge: true,
                  badgeVariant: "success",
                },
              ],
              lang,
            ),
          )}
          ${renderParagraph(
            isAr
              ? "بطاقة عضويتكم الرقمية متاحة الآن عبر حسابكم، ويمكنكم تحميلها بصيغة PDF أو طباعتها والاستفادة من كافة برامج الصندوق."
              : "Your digital membership card is now available on your account dashboard for viewing or download.",
          )}
          ${renderActionButton(actionUrl, isAr ? "عرض وتحميل بطاقة العضوية" : "View & Download Card", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "عرض وتحميل بطاقة العضوية" : "View & Download Card",
      };
    },
  },

  membership_rejected: {
    key: "membership_rejected",
    category: "membership",
    defaultPriority: "HIGH",
    nameAr: "تعذر اعتماد طلب العضوية",
    nameEn: "Membership Request Not Approved",
    subjectAr: () => "إشعار بشأن نتيجة مراجعة طلب توثيق العضوية",
    subjectEn: () => "Update Regarding Your Membership Application",
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/account");
      return {
        title: isAr ? "تحديث حول طلب العضوية" : "Membership Update",
        preheader: isAr
          ? "تحديث أمانة المجلس بشأن طلب توثيق العضوية"
          : "Notice regarding your family membership application",
        badgeText: isAr ? "غير معتمد" : "Not Approved",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "نتيجة مراجعة طلب العضوية" : "Membership Review Result")}
          ${renderParagraph(
            isAr
              ? "نحيطكم علماً بأنه بعد دراسة ومراجعة البيانات والمستندات المرفقة بطلبكم، تعذر على أمانة المجلس اعتماد الطلب في الوقت الحالي للأسباب التالية:"
              : "Following careful review of the submitted information, the Secretariat was unable to approve the application due to the following reason:",
          )}
          ${renderAlertBox(
            vars.rejection_reason ||
              (isAr
                ? "عدم اكتمال وثائق النسب المطلوبة أو عدم تطابق البيانات."
                : "Insufficient genealogical documentation or data discrepancy."),
            "critical",
            isAr ? "ملاحظات المراجعة" : "Review Notes",
          )}
          ${renderParagraph(
            isAr
              ? "يمكنكم مراجعة وتعديل بياناتكم وإرفاق المستندات الإضافية المطلوبة ثم إعادة التقديم."
              : "You may review your details, attach required supporting documents, and resubmit.",
          )}
          ${renderActionButton(actionUrl, isAr ? "مراجعة تفاصيل الطلب" : "Review Application Details", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "مراجعة تفاصيل الطلب" : "Review Application Details",
      };
    },
  },

  membership_correction_required: {
    key: "membership_correction_required",
    category: "membership",
    defaultPriority: "HIGH",
    nameAr: "طلب تصحيح أو استكمال بيانات العضوية",
    nameEn: "Membership Correction Required",
    subjectAr: (v) => `مطلوب استكمال بيانات طلب العضوية (${v.request_number || ""})`,
    subjectEn: (v) =>
      `Action Required: Complete Your Membership Application (${v.request_number || ""})`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/account");
      return {
        title: isAr ? "مطلوب تصحيح بيانات" : "Action Required",
        preheader: isAr
          ? "يرجى استكمال البيانات والمستندات المطلوبة لاعتماد طلبك"
          : "Please complete the required details to finalize your application",
        badgeText: isAr ? "مطلوب إجراء" : "Action Required",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "استكمال وتصحيح بيانات العضوية" : "Additional Information Needed")}
          ${renderParagraph(
            isAr
              ? "أثناء تدقيق طلب عضويتكم، لوحظت الحاجة إلى تصحيح أو إرفاق معلومات إضافية قبل المتابعة في إجراءات الاعتماد."
              : "During verification, our team identified additional details needed before your application can be completed.",
          )}
          ${renderAlertBox(
            vars.instructions ||
              (isAr
                ? "يرجى توضيح سلسلة النسب وإرفاق صورة الهوية الوطنية أو بطاقة العائلة."
                : "Please provide additional genealogical documentation or valid ID proof."),
            "info",
            isAr ? "المطلوب استكماله" : "Required Corrections",
          )}
          ${renderActionButton(actionUrl, isAr ? "تحديث البيانات الآن" : "Update Details Now", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "تحديث البيانات الآن" : "Update Details Now",
      };
    },
  },

  membership_renewed: {
    key: "membership_renewed",
    category: "membership",
    defaultPriority: "NORMAL",
    nameAr: "تجديد بطاقة العضوية",
    nameEn: "Membership Card Renewed",
    subjectAr: () => "تم تجديد بطاقة عضويتكم في مجلس أسرة آل بوعبيد",
    subjectEn: () => "Your Membership Card Has Been Renewed",
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/account");
      return {
        title: isAr ? "تم تجديد العضوية" : "Membership Renewed",
        preheader: isAr
          ? "تم تجديد بطاقة عضويتكم الرقمية بنجاح"
          : "Your digital membership card has been renewed",
        badgeText: isAr ? "مجدد" : "Renewed",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تم تجديد بطاقة العضوية بنجاح" : "Membership Card Renewed")}
          ${renderParagraph(
            isAr
              ? "تم بنجاح تجديد بطاقة عضويتكم الرسمية في مجلس الأسرة، وتم تحديث تاريخ الصلاحية."
              : "Your official family membership card has been successfully renewed with an extended validity date.",
          )}
          ${renderActionButton(actionUrl, isAr ? "عرض البطاقة المجددة" : "View Renewed Card", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "عرض البطاقة المجددة" : "View Renewed Card",
      };
    },
  },

  membership_expired: {
    key: "membership_expired",
    category: "membership",
    defaultPriority: "HIGH",
    nameAr: "انتهاء صلاحية بطاقة العضوية",
    nameEn: "Membership Card Expired",
    subjectAr: () => "تذكير: انتهت صلاحية بطاقة عضويتكم — آل بوعبيد",
    subjectEn: () => "Reminder: Your Family Membership Card Has Expired",
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/requests?request=membership_card");
      return {
        title: isAr ? "انتهاء صلاحية البطاقة" : "Card Expired",
        preheader: isAr
          ? "يرجى تقديم طلب تجديد بطاقة العضوية"
          : "Please request renewal of your membership card",
        badgeText: isAr ? "منتهية" : "Expired",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تذكير بانتهاء صلاحية البطاقة" : "Membership Card Expiration Notice")}
          ${renderParagraph(
            isAr
              ? "نحيطكم علماً بأن صلاحية بطاقة عضويتكم قد انتهت. ندعوكم لتقديم طلب تجديد سريع عبر مركز الطلبات لضمان استمرار الاستفادة من خدمات الأسرة."
              : "Your family membership card has reached its expiration date. You can request a renewal via the Request Hub.",
          )}
          ${renderActionButton(actionUrl, isAr ? "طلب تجديد البطاقة" : "Renew Membership Card", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "طلب تجديد البطاقة" : "Renew Membership Card",
      };
    },
  },

  membership_status_changed: {
    key: "membership_status_changed",
    category: "membership",
    defaultPriority: "HIGH",
    nameAr: "تحديث حالة العضوية",
    nameEn: "Membership Status Changed",
    subjectAr: (v) => `تحديث في حالة عضويتكم (${v.new_status || ""})`,
    subjectEn: (v) => `Your Membership Status Has Changed to ${v.new_status || ""}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/account");
      return {
        title: isAr ? "تحديث حالة العضوية" : "Membership Status Update",
        preheader: isAr
          ? "تم تحديث تصنيف أو حالة عضويتكم في سجلات الأسرة"
          : "Your family membership classification or status was updated",
        badgeText: isAr ? "تحديث حالة" : "Status Change",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تحديث حالة العضوية" : "Membership Status Update")}
          ${renderParagraph(
            isAr
              ? `تم تحديث حالة عضويتكم في سجلات مجلس الأسرة إلى: <strong>${vars.new_status || "محدث"}</strong>.`
              : `Your membership status in the family records has been updated to: <strong>${vars.new_status || "Updated"}</strong>.`,
          )}
          ${renderActionButton(actionUrl, isAr ? "الاطلاع على الملف" : "View Profile", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "الاطلاع على الملف" : "View Profile",
      };
    },
  },

  membership_document_uploaded: {
    key: "membership_document_uploaded",
    category: "membership",
    defaultPriority: "NORMAL",
    nameAr: "تم استلام وثيقة توثيق العضوية",
    nameEn: "Membership Document Uploaded",
    subjectAr: () => "تم استلام وثيقة العضوية المرفقة بنجاح",
    subjectEn: () => "Membership Document Upload Received",
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/account");
      return {
        title: isAr ? "استلام الوثيقة" : "Document Received",
        preheader: isAr
          ? "تم رفع وثيقتكم بنجاح وهي قيد الفحص والتدقيق"
          : "Your document upload was received and is under review",
        badgeText: isAr ? "تم الرفع" : "Uploaded",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تم استلام الوثيقة المرفقة" : "Document Upload Received")}
          ${renderParagraph(
            isAr
              ? `تم استلام الوثيقة المرفقة (${vars.document_name || "وثيقة توثيق"}) وأُحيلت لأمانة المجلس للتحقق منها.`
              : `Your attached document (${vars.document_name || "Verification Document"}) was received and queued for review.`,
          )}
          ${renderActionButton(actionUrl, isAr ? "متابعة الطلب" : "Check Request", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "متابعة الطلب" : "Check Request",
      };
    },
  },

  membership_document_approved: {
    key: "membership_document_approved",
    category: "membership",
    defaultPriority: "NORMAL",
    nameAr: "اعتماد وثيقة العضوية",
    nameEn: "Membership Document Approved",
    subjectAr: () => "تم اعتماد الوثيقة المرفقة لطلب عضويتكم",
    subjectEn: () => "Your Membership Document Has Been Approved",
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/account");
      return {
        title: isAr ? "اعتماد الوثيقة" : "Document Approved",
        preheader: isAr
          ? "تمت مطابقة واعتماد وثيقة النسب المرفقة"
          : "Your submitted document has been approved",
        badgeText: isAr ? "معتمد" : "Approved",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تم اعتماد الوثيقة المرفقة" : "Document Approved")}
          ${renderParagraph(
            isAr
              ? `تمت مراجعة واعتماد الوثيقة المرفقة (${vars.document_name || "وثيقة النسب"}) بنجاح.`
              : `Your submitted document (${vars.document_name || "Genealogical Document"}) has passed verification.`,
          )}
          ${renderActionButton(actionUrl, isAr ? "عرض الحساب" : "View Account", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "عرض الحساب" : "View Account",
      };
    },
  },

  membership_document_rejected: {
    key: "membership_document_rejected",
    category: "membership",
    defaultPriority: "HIGH",
    nameAr: "تعذر اعتماد الوثيقة المرفقة",
    nameEn: "Membership Document Rejected",
    subjectAr: () => "تنبيه: تعذر اعتماد الوثيقة المرفقة لطلب العضوية",
    subjectEn: () => "Action Required: Submitted Document Rejected",
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/account");
      return {
        title: isAr ? "تعذر اعتماد الوثيقة" : "Document Rejected",
        preheader: isAr
          ? "الوثيقة المرفقة غير واضحة أو غير مطابقة"
          : "The attached document could not be accepted",
        badgeText: isAr ? "مرفوضة" : "Rejected",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تعذر اعتماد الوثيقة المرفقة" : "Document Verification Unsuccessful")}
          ${renderAlertBox(
            vars.reason ||
              (isAr
                ? "الوثيقة غير مقروءة أو غير مكتملة الأختام الرسمية."
                : "Document is illegible or missing official verification stamps."),
            "critical",
            isAr ? "سبب الرفض" : "Reason",
          )}
          ${renderParagraph(
            isAr
              ? "يرجى إعادة رفع نسخة واضحة وموثقة عبر صفحة حسابكم."
              : "Please re-upload a clear and verified copy on your account page.",
          )}
          ${renderActionButton(actionUrl, isAr ? "إعادة رفع الوثيقة" : "Re-upload Document", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "إعادة رفع الوثيقة" : "Re-upload Document",
      };
    },
  },

  // ─────────────────────────────────────────────────────────────
  // C. REQUEST HUB (22 - 33)
  // ─────────────────────────────────────────────────────────────
  request_submitted: {
    key: "request_submitted",
    category: "requests",
    defaultPriority: "HIGH",
    nameAr: "استلام وتأكيد تقديم الطلب",
    nameEn: "Request Submitted Confirmation",
    subjectAr: (v) =>
      `تأكيد استلام طلبكم: ${v.request_number || "طلب جديد"} — ${v.request_title || ""}`,
    subjectEn: (v) =>
      `Request Received: ${v.request_number || "New Request"} — ${v.request_title || ""}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl(`/requests`);
      return {
        title: isAr ? "تأكيد استلام الطلب" : "Request Received",
        preheader: isAr
          ? `تم تسجيل طلبكم بنجاح برقم قيد ${vars.request_number || ""}`
          : `Your request was registered with reference ${vars.request_number || ""}`,
        badgeText: vars.request_type || (isAr ? "طلب وارد" : "New Request"),
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تم استلام وتسجيل طلبكم بنجاح" : "Your Request Has Been Received")}
          ${renderParagraph(
            isAr
              ? "نشكركم على تواصلكم مع مجلس أسرة آل بوعبيد. تم قيد وتسجيل طلبكم رسمياً وتوجيهه إلى اللجنة المختصة للمتابعة والمعالجة."
              : "Thank you for contacting the Al Bu Obaid Family Council. Your request has been logged and assigned to the relevant committee.",
          )}
          ${renderInformationCard(
            renderDetailsTable(
              [
                {
                  label: isAr ? "رقم الطلب" : "Reference Number",
                  value: vars.request_number || "قيد التعيين",
                },
                {
                  label: isAr ? "نوع الطلب" : "Request Type",
                  value:
                    vars.request_type_label ||
                    vars.request_type ||
                    (isAr ? "طلب عام" : "General Request"),
                },
                {
                  label: isAr ? "عنوان / موضوع الطلب" : "Subject",
                  value: vars.request_title || "",
                },
                {
                  label: isAr ? "اللجنة المختصة" : "Committee",
                  value:
                    vars.committee_name || (isAr ? "أمانة المجلس العام" : "General Secretariat"),
                },
                {
                  label: isAr ? "تاريخ التقديم" : "Submission Date",
                  value:
                    vars.submission_date || new Date().toLocaleDateString(isAr ? "ar-SA" : "en-US"),
                },
                {
                  label: isAr ? "الحالة الحالية" : "Current Status",
                  value: isAr ? "جديد — قيد التوجيه" : "New — Queued",
                  isBadge: true,
                  badgeVariant: "info",
                },
              ],
              lang,
            ),
          )}
          ${renderParagraph(
            isAr
              ? "يرجى الاحتفاظ برقم الطلب أعلاه لأي مراجعة مستقبلية. سنقوم بإشعاركم فور حدوث أي تحديث على مسار الطلب."
              : "Please retain the reference number for your records. You will receive updates as your request progresses.",
          )}
          ${renderActionButton(actionUrl, isAr ? "متابعة مسار الطلب" : "Track Request Status", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "متابعة مسار الطلب" : "Track Request Status",
      };
    },
  },

  request_received_by_committee: {
    key: "request_received_by_committee",
    category: "requests",
    defaultPriority: "NORMAL",
    nameAr: "استلام الطلب من قِبل اللجنة",
    nameEn: "Request Received by Committee",
    subjectAr: (v) =>
      `أُحيل طلبكم (${v.request_number || ""}) إلى ${v.committee_name || "اللجنة المختصة"}`,
    subjectEn: (v) =>
      `Request (${v.request_number || ""}) Received by ${v.committee_name || "Committee"}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/requests");
      return {
        title: isAr ? "إحالة إلى اللجنة" : "Assigned to Committee",
        preheader: isAr
          ? `أحيل طلبكم إلى ${vars.committee_name || "اللجنة المختصة"}`
          : `Your request was routed to ${vars.committee_name || "the committee"}`,
        badgeText: vars.committee_name || (isAr ? "لجنة المجلس" : "Committee"),
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تمت إحالة الطلب إلى اللجنة المختصة" : "Request Routed to Committee")}
          ${renderParagraph(
            isAr
              ? `نحيطكم علماً بأنه تمت إحالة طلبكم رقم <strong>${vars.request_number || ""}</strong> إلى <strong>${vars.committee_name || "اللجنة المختصة"}</strong> لبدء المعالجة الإجرائية.`
              : `Your request (${vars.request_number || ""}) has been assigned to <strong>${vars.committee_name || "the committee"}</strong> for operational handling.`,
          )}
          ${renderActionButton(actionUrl, isAr ? "عرض الطلب" : "View Request", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "عرض الطلب" : "View Request",
      };
    },
  },

  request_assigned: {
    key: "request_assigned",
    category: "requests",
    defaultPriority: "NORMAL",
    nameAr: "تعيين مسؤول لمعالجة الطلب",
    nameEn: "Request Officer Assigned",
    subjectAr: (v) => `تم تعيين مسؤول لمتابعة طلبكم (${v.request_number || ""})`,
    subjectEn: (v) => `Officer Assigned to Your Request (${v.request_number || ""})`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/requests");
      return {
        title: isAr ? "تعيين مسؤول للطلب" : "Officer Assigned",
        preheader: isAr
          ? "تم تعيين عضو مسؤول لمتابعة ومعالجة طلبكم"
          : "A staff officer was assigned to handle your request",
        badgeText: isAr ? "معين" : "Assigned",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تم تكليف مسؤول لمعالجة طلبكم" : "Officer Assigned to Your Request")}
          ${renderParagraph(
            isAr
              ? `تم تعيين مسؤول من قِبل اللجنة لمتابعة طلبكم رقم <strong>${vars.request_number || ""}</strong> والإشراف على كافة متطلبات إنجازه.`
              : `An officer has been designated to oversee and process your request (${vars.request_number || ""}).`,
          )}
          ${renderActionButton(actionUrl, isAr ? "متابعة الطلب" : "Track Request", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "متابعة الطلب" : "Track Request",
      };
    },
  },

  request_under_review: {
    key: "request_under_review",
    category: "requests",
    defaultPriority: "NORMAL",
    nameAr: "الطلب قيد الدراسة والمراجعة",
    nameEn: "Request Under Review",
    subjectAr: (v) => `طلبكم (${v.request_number || ""}) قيد الدراسة والمراجعة الآن`,
    subjectEn: (v) => `Your Request (${v.request_number || ""}) is Under Review`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/requests");
      return {
        title: isAr ? "الطلب قيد المراجعة" : "Under Review",
        preheader: isAr
          ? "تجري دراسة طلبكم وفق السياسات المعتمدة"
          : "Your request is currently being reviewed",
        badgeText: isAr ? "قيد الدراسة" : "In Review",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "طلبكم قيد المراجعة والدراسة" : "Your Request is Under Review")}
          ${renderParagraph(
            isAr
              ? `تجري حالياً دراسة تفاصيل طلبكم رقم <strong>${vars.request_number || ""}</strong> (${vars.request_title || ""}) من قِبل اللجنة المختصة للتأكد من استيفاء كافة المتطلبات والمعايير.`
              : `Your request (${vars.request_number || ""}) is currently under active review by the committee.`,
          )}
          ${renderActionButton(actionUrl, isAr ? "متابعة حالة الطلب" : "Track Status", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "متابعة حالة الطلب" : "Track Status",
      };
    },
  },

  request_requires_info: {
    key: "request_requires_info",
    category: "requests",
    defaultPriority: "HIGH",
    nameAr: "الطلب يتطلب معلومات إضافية",
    nameEn: "Request Requires Additional Information",
    subjectAr: (v) => `مطلوب معلومات إضافية لإكمال طلبكم (${v.request_number || ""})`,
    subjectEn: (v) =>
      `Action Required: Additional Information for Request (${v.request_number || ""})`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/requests");
      return {
        title: isAr ? "مطلوب معلومات إضافية" : "Additional Info Required",
        preheader: isAr
          ? "يرجى تزويد اللجنة بالمعلومات الموضحة لإكمال الطلب"
          : "Please provide the requested information to complete your request",
        badgeText: isAr ? "مطلوب رد" : "Action Required",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "مطلوب استكمال معلومات بالطلب" : "Additional Information Needed")}
          ${renderParagraph(
            isAr
              ? `بشأن طلبكم رقم <strong>${vars.request_number || ""}</strong>، نحيطكم علماً بالحاجة لاستكمال المعلومات أو المستندات التالية للمتابعة في إنجازه:`
              : `Regarding your request (${vars.request_number || ""}), the committee requires the following information to proceed:`,
          )}
          ${renderAlertBox(
            vars.requested_info ||
              (isAr
                ? "يرجى مراجعة تفاصيل الملاحظات المدونة بالطلب وإرفاق المستندات المطلوبة."
                : "Please review the notes and attach the requested supporting files."),
            "info",
            isAr ? "المعلومات المطلوبة" : "Requested Details",
          )}
          ${renderActionButton(actionUrl, isAr ? "إضافة المعلومات المطلوبة" : "Submit Required Info", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "إضافة المعلومات المطلوبة" : "Submit Required Info",
      };
    },
  },

  request_approved: {
    key: "request_approved",
    category: "requests",
    defaultPriority: "HIGH",
    nameAr: "اعتماد وقبول الطلب",
    nameEn: "Request Approved",
    subjectAr: (v) => `تمت الموافقة على طلبكم (${v.request_number || ""}) بنجاح`,
    subjectEn: (v) => `Your Request (${v.request_number || ""}) Has Been Approved`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/requests");
      return {
        title: isAr ? "تم اعتماد الطلب" : "Request Approved",
        preheader: isAr
          ? "يسرنا إشعاركم بالموافقة على طلبكم واعتماده"
          : "We are pleased to inform you that your request has been approved",
        badgeText: isAr ? "معتمد ومقبول" : "Approved",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تمت الموافقة على طلبكم بنجاح" : "Your Request Has Been Approved")}
          ${renderParagraph(
            isAr
              ? `يسر مجلس أسرة آل بوعبيد إشعاركم بالموافقة على طلبكم رقم <strong>${vars.request_number || ""}</strong> (${vars.request_title || ""}) من قِبل اللجنة المعنية.`
              : `We are pleased to inform you that your request (${vars.request_number || ""}) has been approved.`,
          )}
          ${vars.approval_notes ? renderAlertBox(vars.approval_notes, "info", isAr ? "ملاحظات الاعتماد" : "Approval Notes") : ""}
          ${renderActionButton(actionUrl, isAr ? "عرض تفاصيل الاعتماد" : "View Approval Details", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "عرض تفاصيل الاعتماد" : "View Approval Details",
      };
    },
  },

  request_rejected: {
    key: "request_rejected",
    category: "requests",
    defaultPriority: "HIGH",
    nameAr: "الاعتذار عن قبول الطلب",
    nameEn: "Request Rejected",
    subjectAr: (v) => `تحديث بشأن طلبكم (${v.request_number || ""})`,
    subjectEn: (v) => `Update Regarding Your Request (${v.request_number || ""})`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/requests");
      return {
        title: isAr ? "تحديث حول الطلب" : "Request Update",
        preheader: isAr
          ? "تحديث نتيجة دراسة طلبكم لدى اللجنة"
          : "Update regarding the outcome of your request review",
        badgeText: isAr ? "غير معتمد" : "Not Approved",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "نتيجة دراسة الطلب" : "Request Decision")}
          ${renderParagraph(
            isAr
              ? `نعتذر عن عدم إمكانية اعتماد طلبكم رقم <strong>${vars.request_number || ""}</strong> في الوقت الحالي للأسباب الموضحة أدناه:`
              : `We regret to inform you that we are unable to approve request (${vars.request_number || ""}) at this time due to:`,
          )}
          ${renderAlertBox(
            vars.rejection_reason ||
              (isAr
                ? "الطلب لا يقع ضمن نطاق اللائحة المعتمدة أو عدم توفر الشروط المطلوبة."
                : "Request does not meet the necessary regulatory criteria."),
            "critical",
            isAr ? "سبب الاعتذار" : "Reason",
          )}
          ${renderActionButton(actionUrl, isAr ? "عرض تفاصيل الطلب" : "View Request Details", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "عرض تفاصيل الطلب" : "View Request Details",
      };
    },
  },

  request_completed: {
    key: "request_completed",
    category: "requests",
    defaultPriority: "HIGH",
    nameAr: "اكتمال وإنجاز الطلب",
    nameEn: "Request Completed",
    subjectAr: (v) => `تم إنجاز واكتمال طلبكم بنجاح (${v.request_number || ""})`,
    subjectEn: (v) => `Request Completed Successfully (${v.request_number || ""})`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/requests");
      return {
        title: isAr ? "تم إنجاز الطلب" : "Request Completed",
        preheader: isAr
          ? "تم إكمال تنفيذ كافة متطلبات طلبكم بنجاح"
          : "All requirements for your request have been fulfilled",
        badgeText: isAr ? "مكتمل ومنجز" : "Completed",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تم إنجاز طلبكم واكتماله بنجاح" : "Request Completed Successfully")}
          ${renderParagraph(
            isAr
              ? `يسرنا إبلاغكم بإتمام وتنفيذ كافة الإجراءات المتعلقة بطلبكم رقم <strong>${vars.request_number || ""}</strong> (${vars.request_title || ""}). نشكركم على تعاونكم الدائم مع مجلس الأسرة.`
              : `We are pleased to inform you that all actions regarding your request (${vars.request_number || ""}) have been completed.`,
          )}
          ${vars.completion_notes ? renderAlertBox(vars.completion_notes, "info", isAr ? "مخرجات الطلب" : "Summary") : ""}
          ${renderActionButton(actionUrl, isAr ? "معاينة النتيجة" : "View Outcome", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "معاينة النتيجة" : "View Outcome",
      };
    },
  },

  request_cancelled: {
    key: "request_cancelled",
    category: "requests",
    defaultPriority: "NORMAL",
    nameAr: "إلغاء الطلب",
    nameEn: "Request Cancelled",
    subjectAr: (v) => `تم إلغاء الطلب (${v.request_number || ""})`,
    subjectEn: (v) => `Request (${v.request_number || ""}) Has Been Cancelled`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/requests");
      return {
        title: isAr ? "تم إلغاء الطلب" : "Request Cancelled",
        preheader: isAr
          ? "تم تسجيل إلغاء الطلب بناءً على الإجراء المتخذ"
          : "The request was marked as cancelled",
        badgeText: isAr ? "ملغى" : "Cancelled",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "إلغاء الطلب" : "Request Cancelled")}
          ${renderParagraph(
            isAr
              ? `نحيطكم علماً بأنه تم إلغاء الطلب رقم <strong>${vars.request_number || ""}</strong>.`
              : `This is to confirm that request (${vars.request_number || ""}) has been cancelled.`,
          )}
          ${vars.cancellation_reason ? renderAlertBox(vars.cancellation_reason, "info", isAr ? "سبب الإلغاء" : "Cancellation Reason") : ""}
          ${renderActionButton(actionUrl, isAr ? "مركز الطلبات" : "Request Hub", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "مركز الطلبات" : "Request Hub",
      };
    },
  },

  request_reopened: {
    key: "request_reopened",
    category: "requests",
    defaultPriority: "NORMAL",
    nameAr: "إعادة فتح الطلب",
    nameEn: "Request Reopened",
    subjectAr: (v) => `تمت إعادة فتح الطلب (${v.request_number || ""}) للمتابعة`,
    subjectEn: (v) => `Request (${v.request_number || ""}) Reopened`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/requests");
      return {
        title: isAr ? "إعادة فتح الطلب" : "Request Reopened",
        preheader: isAr
          ? "تمت إعادة فتح الطلب لمواصلة المتابعة والتدقيق"
          : "The request was reopened for continued processing",
        badgeText: isAr ? "مُعاد فتحه" : "Reopened",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تمت إعادة فتح الطلب" : "Request Reopened")}
          ${renderParagraph(
            isAr
              ? `تمت إعادة فتح الطلب رقم <strong>${vars.request_number || ""}</strong> لإجراء متابعة إضافية مع اللجنة المعنية.`
              : `Request (${vars.request_number || ""}) has been reopened for further processing.`,
          )}
          ${renderActionButton(actionUrl, isAr ? "عرض الطلب" : "View Request", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "عرض الطلب" : "View Request",
      };
    },
  },

  request_comment_added: {
    key: "request_comment_added",
    category: "requests",
    defaultPriority: "HIGH",
    nameAr: "إضافة رد أو تعليق جديد على الطلب",
    nameEn: "New Reply / Comment on Request",
    subjectAr: (v) => `رد جديد وارد بشأن طلبكم (${v.request_number || ""})`,
    subjectEn: (v) => `New Comment on Your Request (${v.request_number || ""})`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/requests");
      return {
        title: isAr ? "رد جديد على الطلب" : "New Reply on Request",
        preheader: isAr
          ? "أضافت أمانة المجلس أو اللجنة رداً جديداً على طلبكم"
          : "A new response has been posted to your request",
        badgeText: isAr ? "رد جديد" : "New Response",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "ورد رد جديد بخصوص طلبكم" : "New Reply on Your Request")}
          ${renderParagraph(
            isAr
              ? `تمت إضافة رد رسمي جديد بخصوص طلبكم رقم <strong>${vars.request_number || ""}</strong> (${vars.request_title || ""}):`
              : `A new official reply was added to your request (${vars.request_number || ""}):`,
          )}
          ${renderAlertBox(
            vars.comment ||
              (isAr
                ? "يرجى مراجعة محتوى الرد في المنظومة."
                : "Please review the response in the portal."),
            "info",
            isAr ? "نص الرد" : "Response Message",
          )}
          ${renderActionButton(actionUrl, isAr ? "عرض الرد والرد عليه" : "View & Reply", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "عرض الرد والرد عليه" : "View & Reply",
      };
    },
  },

  request_status_changed: {
    key: "request_status_changed",
    category: "requests",
    defaultPriority: "HIGH",
    nameAr: "تغيير وتحديث حالة الطلب",
    nameEn: "Request Status Updated",
    subjectAr: (v) => `تحديث حالة طلبكم (${v.request_number || ""}): ${v.status_label || ""}`,
    subjectEn: (v) =>
      `Status Update for Request (${v.request_number || ""}): ${v.status_label || ""}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/requests");
      return {
        title: isAr ? "تحديث حالة الطلب" : "Request Status Updated",
        preheader: isAr
          ? `أصبح طلبكم في حالة: ${vars.status_label || ""}`
          : `Your request status changed to ${vars.status_label || ""}`,
        badgeText: vars.status_label || (isAr ? "تحديث حالة" : "Status"),
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تحديث حالة الطلب" : "Request Status Updated")}
          ${renderParagraph(
            isAr
              ? `نحيطكم علماً بتحديث حالة طلبكم رقم <strong>${vars.request_number || ""}</strong> (${vars.request_title || ""}).`
              : `The status of your request (${vars.request_number || ""}) has been updated.`,
          )}
          ${renderInformationCard(
            renderDetailsTable(
              [
                { label: isAr ? "رقم الطلب" : "Request No.", value: vars.request_number || "" },
                {
                  label: isAr ? "الحالة الجديدة" : "New Status",
                  value: vars.status_label || (isAr ? "محدث" : "Updated"),
                  isBadge: true,
                  badgeVariant: "info",
                },
                {
                  label: isAr ? "تاريخ التحديث" : "Date",
                  value: vars.date || new Date().toLocaleDateString(isAr ? "ar-SA" : "en-US"),
                },
              ],
              lang,
            ),
          )}
          ${vars.notes ? renderAlertBox(vars.notes, "info", isAr ? "ملاحظات إضافية" : "Notes") : ""}
          ${renderActionButton(actionUrl, isAr ? "متابعة الطلب في البوابة" : "View Request in Portal", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "متابعة الطلب في البوابة" : "View Request in Portal",
      };
    },
  },

  // ─────────────────────────────────────────────────────────────
  // D. FAMILY COUNCIL / COMMITTEES (34 - 40)
  // ─────────────────────────────────────────────────────────────
  committee_assignment: {
    key: "committee_assignment",
    category: "committees",
    defaultPriority: "HIGH",
    nameAr: "تكليف أو تعيين في لجنة بمجلس الأسرة",
    nameEn: "Committee Assignment",
    subjectAr: (v) => `قرار تكليف بعضوية ${v.committee_name || "إحدى لجان مجلس الأسرة"}`,
    subjectEn: (v) => `Appointment Notice: ${v.committee_name || "Family Council Committee"}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/committees");
      return {
        title: isAr ? "قرار تكليف بلجنة" : "Committee Appointment",
        preheader: isAr
          ? `نبارك لك تعيينك في ${vars.committee_name || "لجان مجلس الأسرة"}`
          : `Appointment to ${vars.committee_name || "Family Committee"}`,
        badgeText: isAr ? "تكليف رسمي" : "Appointment",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "قرار تعيين وتكليف بعضوية لجنة" : "Official Committee Appointment")}
          ${renderParagraph(
            isAr
              ? `بناءً على اعتماد أمانة مجلس أسرة آل بوعبيد، يسرنا إشعاركم بصدور قرار تكليفكم بعضوية <strong>${vars.committee_name || "اللجنة"}</strong>، متمنين لكم دوام التوفيق والسداد في خدمة الأسرة الكريمة.`
              : `The Secretariat is pleased to inform you of your official appointment to <strong>${vars.committee_name || "the committee"}</strong>.`,
          )}
          ${renderActionButton(actionUrl, isAr ? "الاطلاع على مهام اللجنة" : "View Committee Duties", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "الاطلاع على مهام اللجنة" : "View Committee Duties",
      };
    },
  },

  committee_request_received: {
    key: "committee_request_received",
    category: "committees",
    defaultPriority: "HIGH",
    nameAr: "إشعار للجنة بورود طلب جديد",
    nameEn: "Committee: New Request Assigned",
    subjectAr: (v) => `طلب جديد وارد للجنة ${v.committee_name || ""}: ${v.request_number || ""}`,
    subjectEn: (v) =>
      `New Request Assigned to ${v.committee_name || "Committee"}: ${v.request_number || ""}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/admin");
      return {
        title: isAr ? "طلب جديد وارد للجنة" : "New Committee Request",
        preheader: isAr
          ? `طلب جديد بحاجة لمراجعة أعضاء ${vars.committee_name || "اللجنة"}`
          : `A new request has been assigned to ${vars.committee_name || "your committee"}`,
        badgeText: isAr ? "وارد جديد" : "New Item",
        contentHtml: `
          ${renderGreeting(vars.officer_name, lang)}
          ${renderTitle(isAr ? "طلب جديد يتطلب معالجة اللجنة" : "New Request Assigned to Committee")}
          ${renderParagraph(
            isAr
              ? `ورد طلب جديد إلى <strong>${vars.committee_name || "اللجنة"}</strong> برقم <strong>${vars.request_number || ""}</strong> (${vars.request_title || ""}) يتطلب المراجعة واتخاذ الإجراء اللازم.`
              : `A new request (${vars.request_number || ""}) has been routed to <strong>${vars.committee_name || "the committee"}</strong> for processing.`,
          )}
          ${renderActionButton(actionUrl, isAr ? "فتح لوحة الإدارة للمراجعة" : "Open Console to Review", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "فتح لوحة الإدارة للمراجعة" : "Open Console to Review",
      };
    },
  },

  committee_action_required: {
    key: "committee_action_required",
    category: "committees",
    defaultPriority: "HIGH",
    nameAr: "مطلوب إجراء عاجل من اللجنة",
    nameEn: "Committee Action Required",
    subjectAr: (v) => `مطلوب إجراء من اللجنة بشأن (${v.request_number || "معاملة"})`,
    subjectEn: (v) => `Urgent Action Required on Request (${v.request_number || ""})`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/admin");
      return {
        title: isAr ? "مطلوب إجراء من اللجنة" : "Action Required",
        preheader: isAr
          ? "تذكير بمعاملة متأخرة أو تتطلب اعتماد أعضاء اللجنة"
          : "Reminder: pending committee action required",
        badgeText: isAr ? "عاجل" : "Urgent",
        contentHtml: `
          ${renderGreeting(vars.officer_name, lang)}
          ${renderTitle(isAr ? "مطلوب إجراء واعتماد من اللجنة" : "Committee Action Required")}
          ${renderAlertBox(
            vars.action_details ||
              (isAr
                ? "يرجى مراجعة المعاملة وتسجيل قرار اللجنة المعتمد."
                : "Please review the item and record the committee decision."),
            "info",
            isAr ? "المعاملة المعلقة" : "Pending Item",
          )}
          ${renderActionButton(actionUrl, isAr ? "اتخاذ الإجراء في المنظومة" : "Take Action in Console", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "اتخاذ الإجراء في المنظومة" : "Take Action in Console",
      };
    },
  },

  committee_decision_recorded: {
    key: "committee_decision_recorded",
    category: "committees",
    defaultPriority: "NORMAL",
    nameAr: "توثيق قرار اللجنة",
    nameEn: "Committee Decision Recorded",
    subjectAr: (v) => `تم توثيق قرار اللجنة بشأن المعاملة (${v.request_number || ""})`,
    subjectEn: (v) => `Committee Decision Recorded for (${v.request_number || ""})`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/admin");
      return {
        title: isAr ? "توثيق قرار اللجنة" : "Decision Recorded",
        preheader: isAr
          ? "تم تسجيل قرار اللجنة الرسمي بالمنظومة"
          : "The official committee decision has been logged",
        badgeText: isAr ? "قرار موثق" : "Logged",
        contentHtml: `
          ${renderGreeting(vars.officer_name, lang)}
          ${renderTitle(isAr ? "تم توثيق قرار اللجنة" : "Committee Decision Recorded")}
          ${renderParagraph(
            isAr
              ? `تم بنجاح توثيق قرار <strong>${vars.committee_name || "اللجنة"}</strong> بشأن المعاملة رقم <strong>${vars.request_number || ""}</strong>.`
              : `The official decision for (${vars.request_number || ""}) has been registered.`,
          )}
          ${renderActionButton(actionUrl, isAr ? "عرض سجل القرارات" : "View Decision Log", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "عرض سجل القرارات" : "View Decision Log",
      };
    },
  },

  committee_meeting_notification: {
    key: "committee_meeting_notification",
    category: "committees",
    defaultPriority: "HIGH",
    nameAr: "دعوة لحضور اجتماع لجنة",
    nameEn: "Committee Meeting Invitation",
    subjectAr: (v) => `دعوة لاجتماع ${v.committee_name || "اللجنة"}: ${v.meeting_date || ""}`,
    subjectEn: (v) =>
      `Meeting Invitation: ${v.committee_name || "Committee"} (${v.meeting_date || ""})`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl(vars.meeting_url || "/committees");
      return {
        title: isAr ? "دعوة اجتماع لجنة" : "Meeting Invitation",
        preheader: isAr
          ? `موعد اجتماع ${vars.committee_name || "اللجنة"} القادم`
          : `Upcoming meeting for ${vars.committee_name || "the committee"}`,
        badgeText: isAr ? "اجتماع" : "Meeting",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? `دعوة لاجتماع ${vars.committee_name || "اللجنة"}` : "Committee Meeting Notice")}
          ${renderParagraph(
            isAr
              ? "يسرنا دعوتكم لحضور الاجتماع الدوري للجنة لمناقشة جدول الأعمال التالي:"
              : "You are cordially invited to attend the committee meeting to discuss the following agenda:",
          )}
          ${renderInformationCard(
            renderDetailsTable(
              [
                { label: isAr ? "اللجنة" : "Committee", value: vars.committee_name || "" },
                {
                  label: isAr ? "الموعد والتاريخ" : "Date & Time",
                  value: `${vars.meeting_date || ""} ${vars.meeting_time || ""}`,
                },
                {
                  label: isAr ? "المكان / الرابط" : "Location / Link",
                  value:
                    vars.location || (isAr ? "مقر الأسرة / عن بُعد" : "Family Majlis / Remote"),
                },
                {
                  label: isAr ? "الموضوع الرئيسي" : "Agenda",
                  value: vars.agenda || (isAr ? "مناقشة بنود ومستجدات الخطة" : "Regular Review"),
                },
              ],
              lang,
            ),
          )}
          ${renderActionButton(actionUrl, isAr ? "تأكيد الحضور والاطلاع على التفاصيل" : "Confirm Attendance", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "تأكيد الحضور والاطلاع على التفاصيل" : "Confirm Attendance",
      };
    },
  },

  committee_meeting_reminder: {
    key: "committee_meeting_reminder",
    category: "committees",
    defaultPriority: "HIGH",
    nameAr: "تذكير باجتماع اللجنة",
    nameEn: "Committee Meeting Reminder",
    subjectAr: (v) => `تذكير: موعد اجتماع ${v.committee_name || "اللجنة"} اليوم / غداً`,
    subjectEn: (v) => `Reminder: Upcoming Meeting for ${v.committee_name || "Committee"}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl(vars.meeting_url || "/committees");
      return {
        title: isAr ? "تذكير بالاجتماع" : "Meeting Reminder",
        preheader: isAr
          ? `تذكير بموعد اجتماع ${vars.committee_name || "اللجنة"}`
          : `Reminder for ${vars.committee_name || "the committee"} meeting`,
        badgeText: isAr ? "تذكير" : "Reminder",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تذكير بموعد اجتماع اللجنة" : "Meeting Reminder")}
          ${renderParagraph(
            isAr
              ? `نذكركم بموعد اجتماع <strong>${vars.committee_name || "اللجنة"}</strong> المقرر عقده في: <strong>${vars.meeting_date || ""} ${vars.meeting_time || ""}</strong>.`
              : `This is a reminder that the meeting for <strong>${vars.committee_name || "the committee"}</strong> is scheduled for: <strong>${vars.meeting_date || ""} ${vars.meeting_time || ""}</strong>.`,
          )}
          ${renderActionButton(actionUrl, isAr ? "الانضمام أو تفاصيل الاجتماع" : "Join / View Details", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "الانضمام أو تفاصيل الاجتماع" : "Join / View Details",
      };
    },
  },

  committee_announcement: {
    key: "committee_announcement",
    category: "committees",
    defaultPriority: "NORMAL",
    nameAr: "إعلان داخلي للجان",
    nameEn: "Committee Internal Announcement",
    subjectAr: (v) => `تعميم داخلي من ${v.committee_name || "أمانة المجلس"}: ${v.title || ""}`,
    subjectEn: (v) =>
      `Internal Circular from ${v.committee_name || "Secretariat"}: ${v.title || ""}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/committees");
      return {
        title: isAr ? "تعميم داخلي" : "Internal Circular",
        preheader: isAr
          ? "تعميم داخلي صادر لأعضاء اللجان بمجلس الأسرة"
          : "Internal circular for committee members",
        badgeText: isAr ? "تعميم" : "Circular",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(vars.title || (isAr ? "تعميم صادر لأعضاء اللجان" : "Committee Circular"))}
          ${renderParagraph(vars.announcement_body || "")}
          ${renderActionButton(actionUrl, isAr ? "الاطلاع على المنصة" : "View in Portal", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "الاطلاع على المنصة" : "View in Portal",
      };
    },
  },

  // ─────────────────────────────────────────────────────────────
  // E. EVENTS (41 - 48)
  // ─────────────────────────────────────────────────────────────
  event_announcement: {
    key: "event_announcement",
    category: "events",
    defaultPriority: "NORMAL",
    nameAr: "الإعلان عن فعالية عائلية جديدة",
    nameEn: "New Event Announcement",
    subjectAr: (v) => `دعوة لحضور: ${v.event_title || "فعالية عائلية جديدة"} — آل بوعبيد`,
    subjectEn: (v) => `Invitation: ${v.event_title || "New Family Event"} — Al Bu Obaid`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl(vars.event_slug ? `/events` : "/events");
      return {
        title: isAr ? "فعالية عائلية جديدة" : "New Family Event",
        preheader: isAr
          ? `يسر مجلس الأسرة دعوتكم لحضور ${vars.event_title || ""}`
          : `You are invited to attend ${vars.event_title || ""}`,
        badgeText: isAr ? "فعالية عائلية" : "Family Event",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(vars.event_title || (isAr ? "فعالية عائلية جديدة" : "New Family Event"))}
          ${renderParagraph(
            isAr
              ? `يسر مجلس أسرة آل بوعبيد دعوة عموم أفراد الأسرة الكريمة لحضور <strong>"${vars.event_title || ""}"</strong>.`
              : `The Al Bu Obaid Family Council warmly invites all family members to attend <strong>"${vars.event_title || ""}"</strong>.`,
          )}
          ${renderInformationCard(
            renderDetailsTable(
              [
                {
                  label: isAr ? "الموعد والتاريخ" : "Date & Time",
                  value: `${vars.event_date || ""} ${vars.event_time || ""}`,
                },
                {
                  label: isAr ? "المكان" : "Venue",
                  value:
                    vars.event_location ||
                    (isAr ? "الأحساء — المقر العائلي" : "Al-Ahsa — Family Majlis"),
                },
                {
                  label: isAr ? "التسجيل" : "Registration",
                  value: isAr ? "متاح ومطلوب لتأكيد الحضور" : "Open for RSVP",
                  isBadge: true,
                  badgeVariant: "success",
                },
              ],
              lang,
            ),
          )}
          ${vars.event_description ? renderParagraph(vars.event_description) : ""}
          ${renderActionButton(actionUrl, isAr ? "تسجيل الحضور في الفعالية" : "Register Attendance", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "تسجيل الحضور في الفعالية" : "Register Attendance",
      };
    },
  },

  event_registration_confirmation: {
    key: "event_registration_confirmation",
    category: "events",
    defaultPriority: "HIGH",
    nameAr: "تأكيد تسجيل حضور فعالية",
    nameEn: "Event Registration Confirmation",
    subjectAr: (v) => `تأكيد تسجيل حضوركم في: ${v.event_title || "الفعالية"}`,
    subjectEn: (v) => `RSVP Confirmed: ${v.event_title || "Event Attendance"}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/events");
      return {
        title: isAr ? "تأكيد تسجيل الحضور" : "Attendance Confirmed",
        preheader: isAr
          ? `تم تأكيد تسجيلكم في فعالية ${vars.event_title || ""}`
          : `Your registration for ${vars.event_title || ""} is confirmed`,
        badgeText: isAr ? "مؤكد" : "Confirmed",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تم تأكيد تسجيل حضوركم بنجاح" : "Your Attendance is Confirmed")}
          ${renderParagraph(
            isAr
              ? `يسعدنا تأكيد تسجيل حضوركم في <strong>"${vars.event_title || ""}"</strong>. نتطلع لرؤيتكم ولقائكم في هذا المحفل العائلي المبارك.`
              : `We are pleased to confirm your registration for <strong>"${vars.event_title || ""}"</strong>.`,
          )}
          ${renderInformationCard(
            renderDetailsTable(
              [
                { label: isAr ? "الفعالية" : "Event", value: vars.event_title || "" },
                {
                  label: isAr ? "الموعد" : "Date & Time",
                  value: `${vars.event_date || ""} ${vars.event_time || ""}`,
                },
                {
                  label: isAr ? "عدد الحضور المسجلين" : "Attendees",
                  value: String(vars.attendees_count || "1"),
                },
                { label: isAr ? "الموقع" : "Location", value: vars.event_location || "" },
              ],
              lang,
            ),
          )}
          ${renderActionButton(actionUrl, isAr ? "تفاصيل الفعالية" : "Event Details", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "تفاصيل الفعالية" : "Event Details",
      };
    },
  },

  event_registration_cancelled: {
    key: "event_registration_cancelled",
    category: "events",
    defaultPriority: "NORMAL",
    nameAr: "إلغاء تسجيل حضور فعالية",
    nameEn: "Event Registration Cancelled",
    subjectAr: (v) => `تم إلغاء تسجيل حضوركم في: ${v.event_title || ""}`,
    subjectEn: (v) => `Registration Cancelled: ${v.event_title || ""}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/events");
      return {
        title: isAr ? "إلغاء التسجيل" : "Registration Cancelled",
        preheader: isAr
          ? `تم إلغاء تسجيل حضوركم في ${vars.event_title || ""}`
          : `Your registration for ${vars.event_title || ""} was cancelled`,
        badgeText: isAr ? "ملغى" : "Cancelled",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تم إلغاء تسجيل الحضور" : "Registration Cancelled")}
          ${renderParagraph(
            isAr
              ? `تم تسجيل إلغاء حضوركم في فعالية <strong>"${vars.event_title || ""}"</strong> بناءً على طلبكم.`
              : `Your registration for <strong>"${vars.event_title || ""}"</strong> has been cancelled.`,
          )}
          ${renderActionButton(actionUrl, isAr ? "جدول الفعاليات" : "Events Calendar", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "جدول الفعاليات" : "Events Calendar",
      };
    },
  },

  event_reminder: {
    key: "event_reminder",
    category: "events",
    defaultPriority: "NORMAL",
    nameAr: "تذكير بموعد الفعالية",
    nameEn: "Event Reminder",
    subjectAr: (v) => `تذكير: موعد ${v.event_title || "الفعالية"} خلال 24 ساعة`,
    subjectEn: (v) => `Reminder: ${v.event_title || "Event"} is in 24 Hours`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/events");
      return {
        title: isAr ? "تذكير بموعد الفعالية" : "Event Reminder",
        preheader: isAr
          ? `نذكركم بموعد فعالية ${vars.event_title || ""} القادمة`
          : `Reminder: upcoming event ${vars.event_title || ""}`,
        badgeText: isAr ? "تذكير" : "Reminder",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تذكير بموعد الفعالية القادمة" : "Upcoming Event Reminder")}
          ${renderParagraph(
            isAr
              ? `نذكركم بموعد انطلاق <strong>"${vars.event_title || ""}"</strong> غداً بإذن الله.`
              : `This is a reminder that <strong>"${vars.event_title || ""}"</strong> will take place tomorrow.`,
          )}
          ${renderInformationCard(
            renderDetailsTable(
              [
                {
                  label: isAr ? "الموعد" : "Date & Time",
                  value: `${vars.event_date || ""} ${vars.event_time || ""}`,
                },
                { label: isAr ? "الموقع" : "Location", value: vars.event_location || "" },
              ],
              lang,
            ),
          )}
          ${renderActionButton(actionUrl, isAr ? "معاينة الموقع والتفاصيل" : "View Location & Details", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "معاينة الموقع والتفاصيل" : "View Location & Details",
      };
    },
  },

  event_updated: {
    key: "event_updated",
    category: "events",
    defaultPriority: "HIGH",
    nameAr: "تحديث تفاصيل الفعالية",
    nameEn: "Event Details Updated",
    subjectAr: (v) => `تحديث في تفاصيل فعالية: ${v.event_title || ""}`,
    subjectEn: (v) => `Update on Event: ${v.event_title || ""}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/events");
      return {
        title: isAr ? "تحديث في تفاصيل الفعالية" : "Event Updated",
        preheader: isAr
          ? `تم تحديث تفاصيل أو برنامج فعالية ${vars.event_title || ""}`
          : `Details updated for event ${vars.event_title || ""}`,
        badgeText: isAr ? "تحديث" : "Updated",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تحديث تفاصيل الفعالية" : "Event Update Notice")}
          ${renderParagraph(
            isAr
              ? `تم إجراء تحديث على تفاصيل فعالية <strong>"${vars.event_title || ""}"</strong>.`
              : `Details for <strong>"${vars.event_title || ""}"</strong> have been updated.`,
          )}
          ${vars.update_details ? renderAlertBox(vars.update_details, "info", isAr ? "التعديلات الجديدة" : "Updates") : ""}
          ${renderActionButton(actionUrl, isAr ? "الاطلاع على التفاصيل المحدثة" : "View Updated Details", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "الاطلاع على التفاصيل المحدثة" : "View Updated Details",
      };
    },
  },

  event_cancelled: {
    key: "event_cancelled",
    category: "events",
    defaultPriority: "HIGH",
    nameAr: "إلغاء أو تأجيل الفعالية",
    nameEn: "Event Cancelled or Postponed",
    subjectAr: (v) => `تنبيه: تم تأجيل أو إلغاء فعالية ${v.event_title || ""}`,
    subjectEn: (v) => `Notice: Event ${v.event_title || ""} Postponed / Cancelled`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/events");
      return {
        title: isAr ? "إشعار بشأن الفعالية" : "Event Notice",
        preheader: isAr
          ? `إشعار تأجيل أو إلغاء فعالية ${vars.event_title || ""}`
          : `Cancellation or postponement notice for ${vars.event_title || ""}`,
        badgeText: isAr ? "تأجيل / إلغاء" : "Postponed",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "إشعار تأجيل أو إلغاء الفعالية" : "Event Cancellation / Postponement")}
          ${renderAlertBox(
            vars.reason ||
              (isAr
                ? "تقرر تأجيل الفعالية لظروف تنظيمية، وسيتم الإعلان عن الموعد البديل لاحقاً."
                : "The event has been postponed. A rescheduled date will be announced."),
            "critical",
            isAr ? "بيان المجلس" : "Notice",
          )}
          ${renderActionButton(actionUrl, isAr ? "صفحة الفعاليات" : "Events Page", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "صفحة الفعاليات" : "Events Page",
      };
    },
  },

  event_schedule_location_changed: {
    key: "event_schedule_location_changed",
    category: "events",
    defaultPriority: "HIGH",
    nameAr: "تغيير موعد أو موقع الفعالية",
    nameEn: "Event Schedule / Location Changed",
    subjectAr: (v) => `هام: تعديل موعد أو موقع فعالية ${v.event_title || ""}`,
    subjectEn: (v) => `Important: Schedule / Location Change for ${v.event_title || ""}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/events");
      return {
        title: isAr ? "تعديل الموعد أو الموقع" : "Schedule / Location Change",
        preheader: isAr
          ? `تنبيه بتعديل موعد أو مكان فعالية ${vars.event_title || ""}`
          : `Venue or schedule change for ${vars.event_title || ""}`,
        badgeText: isAr ? "تعديل مهم" : "Notice",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "تعديل موعد أو موقع الفعالية" : "Venue or Schedule Change")}
          ${renderInformationCard(
            renderDetailsTable(
              [
                { label: isAr ? "الفعالية" : "Event", value: vars.event_title || "" },
                {
                  label: isAr ? "الموعد المعدل" : "New Date & Time",
                  value: `${vars.new_date || ""} ${vars.new_time || ""}`,
                },
                { label: isAr ? "الموقع الجديد" : "New Venue", value: vars.new_location || "" },
              ],
              lang,
            ),
          )}
          ${renderActionButton(actionUrl, isAr ? "معاينة التفاصيل في البوابة" : "View Updated Venue", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "معاينة التفاصيل في البوابة" : "View Updated Venue",
      };
    },
  },

  event_post_followup: {
    key: "event_post_followup",
    category: "events",
    defaultPriority: "NORMAL",
    nameAr: "شكر ومتابعة ما بعد الفعالية",
    nameEn: "Post-Event Thank You & Photos",
    subjectAr: (v) => `شكراً لحضوركم ومشاركتكم في: ${v.event_title || "الفعالية"}`,
    subjectEn: (v) => `Thank You for Attending: ${v.event_title || "The Event"}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl(vars.gallery_url || "/library");
      return {
        title: isAr ? "شكراً لحضوركم" : "Thank You for Attending",
        preheader: isAr
          ? `شكر وتقدير لمشاركتكم وتغطية صور ${vars.event_title || ""}`
          : `Thank you for participating in ${vars.event_title || ""}`,
        badgeText: isAr ? "ألبوم الصور" : "Gallery",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "شكر وتقدير لحضوركم ومشاركتكم" : "Thank You for Participating")}
          ${renderParagraph(
            isAr
              ? `يتقدم مجلس أسرة آل بوعبيد بجزيل الشكر لحضوركم وتفاعلكم في <strong>"${vars.event_title || ""}"</strong>. صور وتغطيات الفعالية متاحة الآن في مكتبة وأرشيف الأسرة.`
              : `The Council thanks you for your warm participation in <strong>"${vars.event_title || ""}"</strong>. Photos and event records are now available in the family archive.`,
          )}
          ${renderActionButton(actionUrl, isAr ? "مشاهدة ألبوم الصور والتغطية" : "View Event Gallery", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "مشاهدة ألبوم الصور والتغطية" : "View Event Gallery",
      };
    },
  },

  // ─────────────────────────────────────────────────────────────
  // F. FAMILY DEVELOPMENT FUND (49 - 56)
  // ─────────────────────────────────────────────────────────────
  fund_project_update: {
    key: "fund_project_update",
    category: "fund",
    defaultPriority: "NORMAL",
    nameAr: "تحديث مشاريع الصندوق",
    nameEn: "Fund Project Progress Update",
    subjectAr: (v) => `تقرير إنجاز مشروع: ${v.project_name || "مشاريع صندوق الأسرة"}`,
    subjectEn: (v) => `Project Progress Update: ${v.project_name || "Family Development Project"}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/fund");
      return {
        title: isAr ? "تقرير إنجاز مشاريع الصندوق" : "Project Progress Report",
        preheader: isAr
          ? `مستجدات وإنجازات ${vars.project_name || "مشاريع صندوق التنمية"}`
          : `Latest progress on ${vars.project_name || "family development projects"}`,
        badgeText: isAr ? "تقرير إنجاز" : "Progress",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(vars.project_name || (isAr ? "تحديث مشاريع صندوق التنمية العائلية" : "Family Fund Project Update"))}
          ${renderParagraph(
            isAr
              ? "يسر إدارة صندوق التنمية العائلية موافاتكم بأحدث تطورات ونسب إنجاز المشاريع المدعومة من مساهماتكم المباركة."
              : "The Family Development Fund is pleased to present the latest milestone progress report for our ongoing projects.",
          )}
          ${vars.update_body ? renderParagraph(vars.update_body) : ""}
          ${renderActionButton(actionUrl, isAr ? "الاطلاع على تقارير الصندوق" : "View Fund Reports", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "الاطلاع على تقارير الصندوق" : "View Fund Reports",
      };
    },
  },

  fund_development_announcement: {
    key: "fund_development_announcement",
    category: "fund",
    defaultPriority: "NORMAL",
    nameAr: "إعلان مشروع تنموي جديد",
    nameEn: "New Development Project Announcement",
    subjectAr: (v) => `إطلاق مشروع تنموي جديد: ${v.project_name || ""}`,
    subjectEn: (v) => `Launch of New Development Project: ${v.project_name || ""}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/fund");
      return {
        title: isAr ? "إطلاق مشروع تنموي جديد" : "New Development Project",
        preheader: isAr
          ? `يعلن صندوق التنمية عن إطلاق ${vars.project_name || ""}`
          : `Announcing the launch of ${vars.project_name || ""}`,
        badgeText: isAr ? "مشروع جديد" : "New Initiative",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(vars.project_name || (isAr ? "مشروع تنموي جديد" : "New Development Project"))}
          ${renderParagraph(
            isAr
              ? `يعلن مجلس إدارة صندوق التنمية العائلية عن تدشين مشروع <strong>"${vars.project_name || ""}"</strong> الموجه لخدمة وتنمية أبناء وبنات الأسرة.`
              : `The Family Development Fund Board announces the launch of <strong>"${vars.project_name || ""}"</strong>.`,
          )}
          ${vars.project_description ? renderParagraph(vars.project_description) : ""}
          ${renderActionButton(actionUrl, isAr ? "تفاصيل المشروع والمساهمة" : "Project Details & Support", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "تفاصيل المشروع والمساهمة" : "Project Details & Support",
      };
    },
  },

  // ─────────────────────────────────────────────────────────────
  // G. FAMILY NEWS / MEDIA (57 - 61)
  // ─────────────────────────────────────────────────────────────
  news_family_announcement: {
    key: "news_family_announcement",
    category: "news",
    defaultPriority: "NORMAL",
    nameAr: "إعلان عائلي",
    nameEn: "Family Announcement",
    subjectAr: (v) => `إعلان عائلي: ${v.title || "خبر من أسرة آل بوعبيد"}`,
    subjectEn: (v) => `Family Announcement: ${v.title || "Al Bu Obaid Family"}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl(vars.article_url || "/news");
      return {
        title: vars.title || (isAr ? "إعلان عائلي" : "Family Announcement"),
        preheader: isAr
          ? "إعلان من مجلس أسرة آل بوعبيد"
          : "Announcement from Al Bu Obaid Family Council",
        badgeText: isAr ? "إعلان عائلي" : "Announcement",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(vars.title || (isAr ? "إعلان عائلي" : "Family Announcement"))}
          ${renderParagraph(vars.body || "")}
          ${renderActionButton(actionUrl, isAr ? "قراءة التفاصيل في البوابة" : "Read in Portal", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "قراءة التفاصيل في البوابة" : "Read in Portal",
      };
    },
  },

  news_official_announcement: {
    key: "news_official_announcement",
    category: "news",
    defaultPriority: "HIGH",
    nameAr: "بيان وإعلان رسمي من المجلس",
    nameEn: "Official Council Announcement",
    subjectAr: (v) => `بيان رسمي من مجلس أسرة آل بوعبيد: ${v.title || ""}`,
    subjectEn: (v) => `Official Statement from Family Council: ${v.title || ""}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl(vars.article_url || "/news");
      return {
        title: isAr ? "بيان رسمي من مجلس الأسرة" : "Official Council Statement",
        preheader: isAr
          ? "بيان رسمي صادر عن أمانة مجلس أسرة آل بوعبيد"
          : "Official statement from the Family Council Secretariat",
        badgeText: isAr ? "بيان رسمي" : "Official Statement",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(vars.title || (isAr ? "بيان رسمي من مجلس الأسرة" : "Official Statement"))}
          ${renderAlertBox(
            vars.statement || vars.body || "",
            "info",
            isAr ? "نص البيان" : "Statement",
          )}
          ${renderActionButton(actionUrl, isAr ? "الاطلاع على البيان الكامل" : "Read Full Statement", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "الاطلاع على البيان الكامل" : "Read Full Statement",
      };
    },
  },

  news_article_published: {
    key: "news_article_published",
    category: "news",
    defaultPriority: "NORMAL",
    nameAr: "نشر مقال أو خبر عائلي جديد",
    nameEn: "New Article Published",
    subjectAr: (v) => `مقال جديد: ${v.article_title || ""}`,
    subjectEn: (v) => `New Article Published: ${v.article_title || ""}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl(vars.article_slug ? `/news/${vars.article_slug}` : "/news");
      return {
        title: vars.article_title || (isAr ? "مقال جديد" : "New Article"),
        preheader: isAr
          ? "مقال جديد نُشر عبر بوابة الأسرة"
          : "A new article has been published on the family portal",
        badgeText: isAr ? "مقالات الأسرة" : "Articles",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(vars.article_title || (isAr ? "مقال جديد في المنصة" : "New Article"))}
          ${renderParagraph(vars.summary || (isAr ? "ندعوكم لقراءة المقال الجديد المنشور في بوابة الأسرة." : "You are invited to read the latest article published on the portal."))}
          ${renderActionButton(actionUrl, isAr ? "قراءة المقال كاملاً" : "Read Full Article", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "قراءة المقال كاملاً" : "Read Full Article",
      };
    },
  },

  news_archive_document_added: {
    key: "news_archive_document_added",
    category: "news",
    defaultPriority: "NORMAL",
    nameAr: "إضافة وثيقة تاريخية جديدة للأرشيف",
    nameEn: "New Archive Document Added",
    subjectAr: (v) => `وثيقة تاريخية جديدة في الأرشيف: ${v.document_title || ""}`,
    subjectEn: (v) => `New Archive Document Added: ${v.document_title || ""}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/library");
      return {
        title: isAr ? "وثيقة تاريخية جديدة" : "Historical Document Added",
        preheader: isAr
          ? "إدراج وثيقة تاريخية جديدة في الأرشيف العائلي"
          : "A new historical record was added to the family archive",
        badgeText: isAr ? "الأرشيف العائلي" : "Archive",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(vars.document_title || (isAr ? "وثيقة جديدة في الأرشيف" : "New Document in Archive"))}
          ${renderParagraph(
            isAr
              ? `تمت إضافة وثيقة تاريخية جديدة إلى المكتبة الرقمية للأرشيف: <strong>"${vars.document_title || ""}"</strong>.`
              : `A new historical document has been cataloged in the digital archive: <strong>"${vars.document_title || ""}"</strong>.`,
          )}
          ${renderActionButton(actionUrl, isAr ? "تصفح الوثيقة في الأرشيف" : "Browse Document", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "تصفح الوثيقة في الأرشيف" : "Browse Document",
      };
    },
  },

  news_heritage_collection_added: {
    key: "news_heritage_collection_added",
    category: "news",
    defaultPriority: "NORMAL",
    nameAr: "إضافة مقتنى تراثي لمتحف الأسرة",
    nameEn: "New Heritage Collection Added",
    subjectAr: (v) => `مقتنى تراثي جديد في متحف الأسرة: ${v.item_title || ""}`,
    subjectEn: (v) => `New Heritage Item in Family Museum: ${v.item_title || ""}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/library");
      return {
        title: isAr ? "مقتنى تراثي جديد" : "New Heritage Item",
        preheader: isAr
          ? "إضافة عنصر تراثي جديد لمجموعة المتحف"
          : "A new item has been added to the family heritage collection",
        badgeText: isAr ? "متحف الأسرة" : "Museum",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(vars.item_title || (isAr ? "مقتنى تراثي جديد" : "New Heritage Piece"))}
          ${renderParagraph(
            isAr
              ? `أُضيف مقتنى تراثي جديد إلى المتحف الرقمي للأسرة: <strong>"${vars.item_title || ""}"</strong>.`
              : `A new heritage piece has been added to the family museum collection: <strong>"${vars.item_title || ""}"</strong>.`,
          )}
          ${renderActionButton(actionUrl, isAr ? "معاينة المقتنى بالمتحف" : "View in Museum", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "معاينة المقتنى بالمتحف" : "View in Museum",
      };
    },
  },

  // ─────────────────────────────────────────────────────────────
  // H. NEWSLETTER (62 - 65)
  // ─────────────────────────────────────────────────────────────
  newsletter_edition: {
    key: "newsletter_edition",
    category: "newsletter",
    defaultPriority: "LOW",
    nameAr: "النشرة البريدية العائلية",
    nameEn: "Family Newsletter Edition",
    subjectAr: (v) => `نشرة أسرة آل بوعبيد — ${v.edition_title || "العدد الدوري"}`,
    subjectEn: (v) => `Al Bu Obaid Family Newsletter — ${v.edition_title || "Latest Issue"}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl(vars.read_online_url || "/news");
      const unsubscribeUrl = getUrl(vars.unsubscribe_url || "/account");
      return {
        title:
          vars.edition_title ||
          (isAr ? "النشرة البريدية لأسرة آل بوعبيد" : "Al Bu Obaid Family Newsletter"),
        preheader: isAr
          ? "أبرز أخبار ومستجدات ومناسبات الأسرة لهذا الشهر"
          : "Highlights of family news, events, and milestones",
        badgeText: isAr ? "النشرة البريدية" : "Newsletter",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(vars.edition_title || (isAr ? "نشرة الأسرة الدورية" : "Family Newsletter"))}
          ${vars.intro ? renderParagraph(vars.intro) : ""}
          ${renderAlertBox(
            vars.highlights ||
              (isAr
                ? "تصفح أحدث أخبار المتميزين، الفعاليات القادمة، ومشاريع صندوق التنمية."
                : "Explore the latest accomplishments, upcoming gatherings, and fund projects."),
            "info",
            isAr ? "أبرز العناوين" : "Highlights",
          )}
          ${renderActionButton(actionUrl, isAr ? "قراءة النشرة الكاملة في البوابة" : "Read Full Newsletter Online", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "قراءة النشرة الكاملة في البوابة" : "Read Full Newsletter Online",
        isNewsletter: true,
        unsubscribeUrl,
      };
    },
  },

  newsletter_monthly_update: {
    key: "newsletter_monthly_update",
    category: "newsletter",
    defaultPriority: "LOW",
    nameAr: "التقرير الشهري لمجلس الأسرة",
    nameEn: "Monthly Council Update",
    subjectAr: (v) => `التقرير الشهري لأعمال مجلس الأسرة — ${v.month_name || ""}`,
    subjectEn: (v) => `Monthly Council Digest — ${v.month_name || ""}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/governance");
      const unsubscribeUrl = getUrl(vars.unsubscribe_url || "/account");
      return {
        title: isAr ? "التقرير الشهري لأعمال المجلس" : "Monthly Council Digest",
        preheader: isAr
          ? "ملخص قرارات ومشاريع مجلس الأسرة خلال الشهر"
          : "Summary of Council decisions and initiatives this month",
        badgeText: isAr ? "تقرير شهري" : "Monthly Digest",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? `التقرير الشهري — ${vars.month_name || ""}` : `Monthly Digest — ${vars.month_name || ""}`)}
          ${renderParagraph(vars.summary || (isAr ? "ملخص بأهم القرارات والاجتماعات والإنجازات التي تمت خلال الشهر المنصرم." : "A summary of major council meetings, resolutions, and projects completed this month."))}
          ${renderActionButton(actionUrl, isAr ? "عرض التقرير المفصل" : "View Detailed Report", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "عرض التقرير المفصل" : "View Detailed Report",
        isNewsletter: true,
        unsubscribeUrl,
      };
    },
  },

  newsletter_bulletin: {
    key: "newsletter_bulletin",
    category: "newsletter",
    defaultPriority: "NORMAL",
    nameAr: "نشرة المناسبات والأفراح",
    nameEn: "Family Occasions Bulletin",
    subjectAr: (v) => `نشرة مناسبات وأفراح الأسرة: ${v.bulletin_title || ""}`,
    subjectEn: (v) => `Family Celebrations Bulletin: ${v.bulletin_title || ""}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/news");
      const unsubscribeUrl = getUrl(vars.unsubscribe_url || "/account");
      return {
        title:
          vars.bulletin_title || (isAr ? "نشرة المناسبات والأفراح" : "Family Occasions Bulletin"),
        preheader: isAr
          ? "مشاركة أفراح ومناسبات أبناء وبنات الأسرة"
          : "Celebrating family marriages, births, and accomplishments",
        badgeText: isAr ? "مناسبات وأفراح" : "Celebrations",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(vars.bulletin_title || (isAr ? "نشرة أفراح ومناسبات الأسرة" : "Family Bulletin"))}
          ${renderParagraph(vars.bulletin_content || "")}
          ${renderActionButton(actionUrl, isAr ? "تقديم التهاني في البوابة" : "Share Congratulations", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "تقديم التهاني في البوابة" : "Share Congratulations",
        isNewsletter: true,
        unsubscribeUrl,
      };
    },
  },

  newsletter_event_digest: {
    key: "newsletter_event_digest",
    category: "newsletter",
    defaultPriority: "LOW",
    nameAr: "موجز الفعاليات القادمة",
    nameEn: "Upcoming Events Digest",
    subjectAr: () => "موجز فعاليات ومناسبات أسرة آل بوعبيد القادمة",
    subjectEn: () => "Upcoming Family Gatherings & Events Digest",
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/events");
      const unsubscribeUrl = getUrl(vars.unsubscribe_url || "/account");
      return {
        title: isAr ? "موجز الفعاليات القادمة" : "Upcoming Events Digest",
        preheader: isAr
          ? "جدول بالفعاليات والمناسبات العائلية المجدولة"
          : "Schedule of upcoming family events and gatherings",
        badgeText: isAr ? "جدول الفعاليات" : "Events Digest",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(isAr ? "موجز الفعاليات والمناسبات المجدولة" : "Upcoming Events Calendar")}
          ${renderParagraph(
            isAr
              ? "نضع بين أيديكم موجزاً بأبرز الفعاليات واللقاءات العائلية المرتقبة، وندعوكم للتسجيل والمشاركة."
              : "Here is your upcoming schedule of family gatherings and initiatives. We warmly invite your participation.",
          )}
          ${renderActionButton(actionUrl, isAr ? "استعراض جدول الفعاليات والتسجيل" : "Explore Calendar & RSVP", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "استعراض جدول الفعاليات والتسجيل" : "Explore Calendar & RSVP",
        isNewsletter: true,
        unsubscribeUrl,
      };
    },
  },

  // ─────────────────────────────────────────────────────────────
  // I. ADMINISTRATIVE / SYSTEM (66 - 70)
  // ─────────────────────────────────────────────────────────────
  system_notification: {
    key: "system_notification",
    category: "system",
    defaultPriority: "NORMAL",
    nameAr: "إشعار نظام عام",
    nameEn: "General System Notification",
    subjectAr: (v) => `إشعار نظام: ${v.title || "منصة آل بوعبيد"}`,
    subjectEn: (v) => `System Notification: ${v.title || "Family Portal"}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl(vars.action_url || "/");
      return {
        title: vars.title || (isAr ? "إشعار نظام" : "System Notification"),
        preheader: isAr
          ? "إشعار صادر عن النظام التقني للمنصة"
          : "System notification from portal operations",
        badgeText: isAr ? "النظام" : "System",
        contentHtml: `
          ${renderGreeting(vars.user_name, lang)}
          ${renderTitle(vars.title || (isAr ? "إشعار نظام" : "System Notification"))}
          ${renderParagraph(vars.message || "")}
          ${renderActionButton(actionUrl, vars.action_label || (isAr ? "فتح المنصة" : "Open Portal"), lang)}
        `,
        actionUrl,
        actionLabel: vars.action_label || (isAr ? "فتح المنصة" : "Open Portal"),
      };
    },
  },

  system_failed_workflow_alert: {
    key: "system_failed_workflow_alert",
    category: "system",
    defaultPriority: "CRITICAL",
    nameAr: "تنبيه تعثر مسار عمل أو مهمة",
    nameEn: "Workflow Failure Alert",
    subjectAr: (v) => `تنبيه إداري: تعثر مسار عمل (${v.workflow_name || ""})`,
    subjectEn: (v) => `Administrative Alert: Workflow Failure (${v.workflow_name || ""})`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/admin");
      return {
        title: isAr ? "تنبيه تعثر مسار عمل" : "Workflow Failure Alert",
        preheader: isAr
          ? "تنبيه إداري عاجل للمشرفين عن تعثر عملية بالنظام"
          : "Administrative alert: a system workflow has encountered an error",
        badgeText: isAr ? "حرج" : "Critical",
        contentHtml: `
          ${renderGreeting(vars.admin_name, lang)}
          ${renderTitle(isAr ? "تنبيه بتعثر مسار عمل في المنظومة" : "Workflow Execution Failed")}
          ${renderAlertBox(
            vars.error_details ||
              (isAr
                ? "حدث خطأ أثناء معالجة مسار العمل الآلي."
                : "An error occurred during automated workflow processing."),
            "critical",
            isAr ? "تفاصيل الخطأ" : "Error Details",
          )}
          ${renderInformationCard(
            renderDetailsTable(
              [
                { label: isAr ? "المسار / المهمة" : "Workflow", value: vars.workflow_name || "" },
                {
                  label: isAr ? "التاريخ والوقت" : "Timestamp",
                  value: vars.timestamp || new Date().toLocaleString(isAr ? "ar-SA" : "en-US"),
                },
              ],
              lang,
            ),
          )}
          ${renderActionButton(actionUrl, isAr ? "فحص سجلات الإدارة" : "Open Admin Logs", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "فحص سجلات الإدارة" : "Open Admin Logs",
      };
    },
  },

  system_delivery_failure_alert: {
    key: "system_delivery_failure_alert",
    category: "system",
    defaultPriority: "HIGH",
    nameAr: "تنبيه تعثر تسليم بريد إلكتروني",
    nameEn: "Email Delivery Failure Alert",
    subjectAr: (v) => `تنبيه: تعثر إرسال بريد إلكتروني إلى (${v.recipient_email || ""})`,
    subjectEn: (v) => `Alert: Email Delivery Failure (${v.recipient_email || ""})`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/admin");
      return {
        title: isAr ? "تعثر تسليم البريد" : "Delivery Failure",
        preheader: isAr
          ? `تعذر تسليم بريد إلكتروني إلى ${vars.recipient_email || ""}`
          : `Email delivery failed for ${vars.recipient_email || ""}`,
        badgeText: isAr ? "خطأ إرسال" : "Delivery Error",
        contentHtml: `
          ${renderGreeting(vars.admin_name, lang)}
          ${renderTitle(isAr ? "تنبيه بتعثر إرسال بريد إلكتروني" : "Email Delivery Failed")}
          ${renderAlertBox(
            vars.error_message ||
              (isAr
                ? "فشل المزود في إيصال البريد (ارتداد أو عنوان غير صالح)."
                : "Failed to deliver email due to provider error or bounce."),
            "critical",
            isAr ? "رسالة الخطأ" : "Provider Error",
          )}
          ${renderInformationCard(
            renderDetailsTable(
              [
                { label: isAr ? "المستلم" : "Recipient", value: vars.recipient_email || "" },
                { label: isAr ? "نوع البريد" : "Email Type", value: vars.email_type || "" },
                { label: isAr ? "رقم المحاولة" : "Attempt", value: String(vars.attempts || "1") },
              ],
              lang,
            ),
          )}
          ${renderActionButton(actionUrl, isAr ? "مراجعة مركز الإشعارات" : "Review in Admin Center", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "مراجعة مركز الإشعارات" : "Review in Admin Center",
      };
    },
  },

  system_admin_alert: {
    key: "system_admin_alert",
    category: "system",
    defaultPriority: "HIGH",
    nameAr: "تنبيه إداري عام",
    nameEn: "General Administrative Alert",
    subjectAr: (v) => `تنبيه إداري: ${v.title || "مجلس أسرة آل بوعبيد"}`,
    subjectEn: (v) => `Admin Alert: ${v.title || "Family Council Intranet"}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/admin");
      return {
        title: vars.title || (isAr ? "تنبيه إداري" : "Admin Alert"),
        preheader: isAr
          ? "تنبيه إداري مخصص للمشرفين وأعضاء المجلس"
          : "Administrative alert for council staff and administrators",
        badgeText: isAr ? "تنبيه إداري" : "Admin Notice",
        contentHtml: `
          ${renderGreeting(vars.admin_name, lang)}
          ${renderTitle(vars.title || (isAr ? "تنبيه إداري" : "Admin Alert"))}
          ${renderParagraph(vars.message || "")}
          ${renderActionButton(actionUrl, isAr ? "فتح لوحة الإدارة" : "Open Console", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "فتح لوحة الإدارة" : "Open Console",
      };
    },
  },

  system_scheduled_summary: {
    key: "system_scheduled_summary",
    category: "system",
    defaultPriority: "NORMAL",
    nameAr: "الملخص الإداري الدوري المجدول",
    nameEn: "Scheduled Periodic Summary",
    subjectAr: (v) => `الملخص الإداري الدوري — ${v.period || "أسبوعي"}`,
    subjectEn: (v) => `Periodic Operations Summary — ${v.period || "Weekly"}`,
    renderBody: (vars, lang) => {
      const isAr = lang === "ar";
      const actionUrl = getUrl("/admin");
      return {
        title: isAr ? "الملخص الإداري الدوري" : "Periodic Operations Summary",
        preheader: isAr
          ? "تقرير إحصائي دوري عن الطلبات والمساهمات ومستجدات المنظومة"
          : "Periodic operations report on requests, contributions, and memberships",
        badgeText: isAr ? "تقرير دوري" : "Summary",
        contentHtml: `
          ${renderGreeting(vars.admin_name, lang)}
          ${renderTitle(isAr ? `الملخص الدوري — ${vars.period || "أسبوعي"}` : "Periodic Operations Digest")}
          ${renderInformationCard(
            renderDetailsTable(
              [
                {
                  label: isAr ? "طلبات العضوية الجديدة" : "New Membership Requests",
                  value: String(vars.new_memberships_count || "0"),
                },
                {
                  label: isAr ? "طلبات اللجان الواردة" : "Committee Requests",
                  value: String(vars.new_requests_count || "0"),
                },
                {
                  label: isAr ? "المساهمات المالية" : "New Contributions",
                  value: String(vars.contributions_count || "0"),
                },
                {
                  label: isAr ? "المستخدمون الجدد" : "New Users",
                  value: String(vars.new_users_count || "0"),
                },
              ],
              lang,
            ),
          )}
          ${renderActionButton(actionUrl, isAr ? "فتح لوحة الإحصائيات الكاملة" : "Open Full Dashboard", lang)}
        `,
        actionUrl,
        actionLabel: isAr ? "فتح لوحة الإحصائيات الكاملة" : "Open Full Dashboard",
      };
    },
  },
};

// Alias auth_verify_email to auth_email_verification
EMAIL_TEMPLATE_CATALOG.auth_verify_email = EMAIL_TEMPLATE_CATALOG.auth_email_verification;

/**
 * Renders a full email payload (HTML and plain text) for any catalog template key.
 */
export function renderEmail(
  templateKey: string,
  variables: Record<string, any> = {},
  language: EmailLanguage = "ar",
): {
  subject: string;
  html: string;
  text: string;
  category: EmailCategory;
  priority: EmailPriority;
} {
  const template =
    EMAIL_TEMPLATE_CATALOG[templateKey] || EMAIL_TEMPLATE_CATALOG.system_notification;
  const isAr = language === "ar";
  const subject = isAr ? template.subjectAr(variables) : template.subjectEn(variables);

  const bodyData = template.renderBody(variables, language);

  const html = wrapInEmailShell({
    language,
    title: subject,
    preheader: bodyData.preheader,
    badgeText: bodyData.badgeText,
    contentHtml: bodyData.contentHtml,
    isNewsletter: bodyData.isNewsletter,
    unsubscribeUrl: bodyData.unsubscribeUrl,
  });

  const text =
    `${subject}\n\n` +
    (isAr ? "السلام عليكم ورحمة الله وبركاته،" : "Dear Member,") +
    "\n\n" +
    (bodyData.preheader || "") +
    "\n\n" +
    `${bodyData.actionLabel || (isAr ? "فتح الرابط" : "Open Link")}: ${bodyData.actionUrl}\n\n` +
    `--\n${isAr ? "مجلس أسرة آل بوعبيد — صندوق التنمية العائلية" : "Al Bu Obaid Family Council"}\nhttps://www.boubaid.com\nteam@boubaid.com`;

  return {
    subject,
    html,
    text,
    category: template.category,
    priority: template.defaultPriority,
  };
}

export { EMAIL_TEMPLATE_CATALOG as EMAIL_TEMPLATES_REGISTRY };
