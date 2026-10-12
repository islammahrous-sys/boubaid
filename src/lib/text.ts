/**
 * Several content strings in `site.ts` carry their own leading label, e.g.
 *   "الأفرع الداخلية: ذرية محمد (…)"
 *   "ملاحظة منهجية: تُعرض نتائج علم الجينات…"
 *   "Methodological Disclaimer: Genetic genealogy results…"
 *
 * Pages set their own heading above these, so rendering the raw string prints
 * the label twice. Strip it at the point of render rather than editing the
 * source data, which may be maintained elsewhere or reused for print.
 *
 * Only a short prefix before the first colon is treated as a label, so ordinary
 * prose containing a colon further in is left untouched.
 */
export function stripLeadingLabel(text: string, maxLabelLength = 32): string {
  const colon = text.indexOf(":");
  if (colon === -1 || colon > maxLabelLength) return text;
  return text.slice(colon + 1).trimStart();
}

/**
 * Split a bullet-separated lineage string into its parts, dropping any embedded
 * label. Each part is divided into its head and the names in parentheses:
 *   "ذرية محمد (عبدالإله، تركي)"  →  { head: "ذرية محمد", names: "عبدالإله، تركي" }
 *
 * Strings without bullets or parentheses fall through as a single head-only
 * entry, which is how the English translations are written.
 */
export function parseLineageList(text: string): { head: string; names: string }[] {
  return stripLeadingLabel(text)
    .split("•")
    .map((chunk) => {
      const trimmed = chunk.trim();
      const match = trimmed.match(/^(.*?)\s*\((.*)\)$/);
      return match
        ? { head: match[1].trim(), names: match[2].trim() }
        : { head: trimmed, names: "" };
    })
    .filter((entry) => entry.head.length > 0);
}

/**
 * Eastern-Arabic numerals. Hijri years, references and counts are set in the
 * numerals of the script they sit in, which is what a reader of an Arabic
 * document expects; the English side keeps Western digits.
 */
const EASTERN_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toEasternNumerals(value: string | number): string {
  return String(value).replace(/\d/g, (d) => EASTERN_DIGITS[Number(d)] ?? d);
}

export function formatNumber(value: string | number, lang: "ar" | "en"): string {
  return lang === "ar" ? toEasternNumerals(value) : String(value);
}

/**
 * One formatting for every Hijri year on the site: "١٤٤٧ هـ" in Arabic and
 * "1447 AH" in English. Pages were previously hardcoding the suffix, so the
 * English side read "1447 هـ".
 */
export function formatHijri(year: string | number, lang: "ar" | "en"): string {
  return lang === "ar" ? `${toEasternNumerals(year)} هـ` : `${year} AH`;
}

/** Arabic Gregorian month names -> English, for dates authored in Arabic. */
const ARABIC_MONTHS: Record<string, string> = {
  يناير: "January",
  فبراير: "February",
  مارس: "March",
  أبريل: "April",
  ابريل: "April",
  مايو: "May",
  يونيو: "June",
  يوليو: "July",
  أغسطس: "August",
  اغسطس: "August",
  سبتمبر: "September",
  أكتوبر: "October",
  اكتوبر: "October",
  نوفمبر: "November",
  ديسمبر: "December",
};

/**
 * Content dates are authored in Arabic ("14 أغسطس 2025"). In English mode the
 * month name is swapped for its English equivalent and digits normalised, so
 * the English pages never show an Arabic date string.
 */
export function formatContentDate(value: string, lang: "ar" | "en"): string {
  if (lang === "ar" || !value) return value;
  let out = value.replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660));
  for (const [ar, en] of Object.entries(ARABIC_MONTHS)) {
    out = out.replace(ar, en);
  }
  return out
    .replace(/\s*هـ\s*/g, " AH ")
    .replace(/\s+م\b/g, "")
    .trim();
}

/**
 * Supabase Auth throws its own English-only messages (e.g. "Invalid login
 * credentials"). Displaying them verbatim breaks the bilingual UI, so map them
 * and fall back to a generic bilingual message rather than leaking raw
 * provider text, status codes or traces.
 *
 * Prefer the machine-readable `code` the provider sends: the message text for
 * two very different 429s ("email rate limit exceeded" vs. "request rate limit
 * reached") both contain "rate limit", which previously made an exhausted
 * *confirmation-email quota* — a server-side sending limit that has nothing to
 * do with how many times this visitor tried — read as "too many attempts".
 */
const AUTH_ERROR_CODES: Record<string, { ar: string; en: string }> = {
  over_email_send_rate_limit: {
    ar: "تعذّر إرسال رسالة تأكيد البريد حاليًا لبلوغ الحد المسموح لإرسال الرسائل من النظام. الرجاء المحاولة بعد ساعة أو التواصل مع أمانة المجلس لتفعيل الحساب.",
    en: "The confirmation email couldn't be sent right now because the system's email sending limit was reached. Please try again in an hour or contact the council secretariat.",
  },
  over_request_rate_limit: {
    ar: "محاولات كثيرة جدًا. الرجاء الانتظار قليلًا ثم المحاولة مرة أخرى.",
    en: "Too many attempts. Please wait a moment and try again.",
  },
  over_sms_send_rate_limit: {
    ar: "تعذّر إرسال رسالة التحقق حاليًا لبلوغ الحد المسموح. حاول مرة أخرى لاحقًا.",
    en: "The verification message couldn't be sent right now because the sending limit was reached. Please try later.",
  },
  user_already_exists: {
    ar: "هذا البريد الإلكتروني مسجل بالفعل. استخدم «تسجيل الدخول» أو «نسيت كلمة المرور».",
    en: "That email is already registered. Use sign-in or password reset.",
  },
  email_exists: {
    ar: "هذا البريد الإلكتروني مسجل بالفعل. استخدم «تسجيل الدخول» أو «نسيت كلمة المرور».",
    en: "That email is already registered. Use sign-in or password reset.",
  },
  email_address_invalid: {
    ar: "صيغة البريد الإلكتروني غير صحيحة. الرجاء إدخال بريد إلكتروني صالح.",
    en: "That email address isn't valid. Please enter a valid email.",
  },
  weak_password: {
    ar: "كلمة المرور ضعيفة. اختر كلمة مرور أطول تتضمن حروفًا وأرقامًا.",
    en: "That password is too weak. Choose a longer one with letters and numbers.",
  },
  invalid_credentials: {
    ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    en: "Invalid email or password.",
  },
  email_not_confirmed: {
    ar: "لم يتم تأكيد البريد الإلكتروني بعد. تحقق من صندوق الوارد.",
    en: "Email not confirmed yet. Check your inbox.",
  },
  signup_disabled: {
    ar: "تسجيل الحسابات الجديدة موقوف حاليًا. الرجاء التواصل مع أمانة المجلس.",
    en: "New sign-ups are currently disabled. Please contact the secretariat.",
  },
  same_password: {
    ar: "كلمة المرور الجديدة يجب أن تختلف عن الحالية.",
    en: "The new password must be different from the current one.",
  },
  validation_failed: {
    ar: "تحقق من صحة البيانات المُدخلة ثم أعد المحاولة.",
    en: "Please check the details you entered and try again.",
  },
  unexpected_failure: {
    ar: "خدمة الحسابات غير متاحة مؤقتًا. الرجاء المحاولة بعد قليل.",
    en: "The accounts service is temporarily unavailable. Please try again shortly.",
  },
};

const AUTH_ERROR_TRANSLATIONS: { match: RegExp; ar: string; en: string }[] = [
  { match: /invalid login credentials/i, ...AUTH_ERROR_CODES.invalid_credentials },
  { match: /email not confirmed/i, ...AUTH_ERROR_CODES.email_not_confirmed },
  { match: /(user already registered|already been registered)/i, ...AUTH_ERROR_CODES.email_exists },
  {
    match: /password should be at least/i,
    ar: "كلمة المرور قصيرة جدًا (٨ أحرف على الأقل).",
    en: "That password is too short (8 characters minimum).",
  },
  { match: /email rate limit/i, ...AUTH_ERROR_CODES.over_email_send_rate_limit },
  { match: /rate limit|too many requests/i, ...AUTH_ERROR_CODES.over_request_rate_limit },
  { match: /same password/i, ...AUTH_ERROR_CODES.same_password },
  {
    match: /(unable to validate email|invalid email|email address .*invalid)/i,
    ...AUTH_ERROR_CODES.email_address_invalid,
  },
  {
    match: /(failed to fetch|network|load failed|timeout)/i,
    ar: "تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت ثم أعد المحاولة.",
    en: "Could not reach the server. Check your connection and try again.",
  },
  { match: /(signups? not allowed|signup is disabled)/i, ...AUTH_ERROR_CODES.signup_disabled },
];

/**
 * Accepts the thrown provider error (preferred — carries `code`) or a bare
 * message string, so existing call sites keep working.
 */
export function translateAuthError(error: unknown, lang: "ar" | "en"): string {
  const fallback =
    lang === "ar"
      ? "تعذر إكمال الطلب. حاول مرة أخرى."
      : "We couldn't complete that. Please try again.";
  if (!error) return fallback;

  let message: string | undefined;
  let code: string | undefined;
  let status: number | undefined;

  if (typeof error === "string") {
    message = error;
  } else if (typeof error === "object") {
    const e = error as { message?: unknown; code?: unknown; status?: unknown };
    if (typeof e.message === "string") message = e.message;
    if (typeof e.code === "string") code = e.code;
    if (typeof e.status === "number") status = e.status;
  }

  if (code && AUTH_ERROR_CODES[code]) {
    const entry = AUTH_ERROR_CODES[code];
    return lang === "ar" ? entry.ar : entry.en;
  }
  if (message) {
    const known = AUTH_ERROR_TRANSLATIONS.find((entry) => entry.match.test(message!));
    if (known) return lang === "ar" ? known.ar : known.en;
  }
  if (status && status >= 500) {
    const entry = AUTH_ERROR_CODES.unexpected_failure;
    return lang === "ar" ? entry.ar : entry.en;
  }
  return fallback;
}
