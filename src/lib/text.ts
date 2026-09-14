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
  return out.replace(/\s*هـ\s*/g, " AH ").replace(/\s+م\b/g, "").trim();
}

/**
 * Supabase Auth throws its own English-only error messages (e.g. "Invalid
 * login credentials"). Displaying them verbatim breaks the bilingual UI for
 * Arabic-mode users, so map the common ones and fall back to a generic
 * bilingual message for anything unrecognized rather than leaking raw
 * provider text.
 */
const AUTH_ERROR_TRANSLATIONS: { match: RegExp; ar: string; en: string }[] = [
  {
    match: /invalid login credentials/i,
    ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    en: "Invalid email or password.",
  },
  {
    match: /email not confirmed/i,
    ar: "لم يتم تأكيد البريد الإلكتروني بعد. تحقق من صندوق الوارد.",
    en: "Email not confirmed yet. Check your inbox.",
  },
  {
    match: /user already registered/i,
    ar: "هذا البريد الإلكتروني مسجل بالفعل.",
    en: "That email is already registered.",
  },
  {
    match: /password should be at least/i,
    ar: "كلمة المرور قصيرة جدًا.",
    en: "That password is too short.",
  },
  {
    match: /rate limit/i,
    ar: "محاولات كثيرة جدًا. حاول مرة أخرى بعد قليل.",
    en: "Too many attempts. Please try again shortly.",
  },
  {
    match: /same password/i,
    ar: "كلمة المرور الجديدة يجب أن تختلف عن الحالية.",
    en: "The new password must be different from the current one.",
  },
];

export function translateAuthError(message: string | undefined, lang: "ar" | "en"): string {
  const fallback =
    lang === "ar"
      ? "تعذر إكمال الطلب. حاول مرة أخرى."
      : "We couldn't complete that. Please try again.";
  if (!message) return fallback;
  const known = AUTH_ERROR_TRANSLATIONS.find((entry) => entry.match.test(message));
  if (known) return lang === "ar" ? known.ar : known.en;
  return fallback;
}
