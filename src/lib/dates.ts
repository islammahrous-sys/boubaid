/**
 * One place formats every user-facing date on the site.
 *
 * House rule: a date is never shown in a single calendar. The Gregorian date
 * stays canonical (that is what the database stores, in ISO form) and the
 * Hijri presentation is derived from the very same instant through the
 * Umm al-Qura calendar that Saudi official documents use — never hardcoded,
 * never converted by hand.
 */

export type DateLang = "ar" | "en";

/** Every date on the site is read at the council's own day boundary. */
export const SITE_TIMEZONE = "Asia/Riyadh";

export function toDate(value: string | number | Date | null | undefined): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

type Style = "long" | "short";

/** Gregorian half, e.g. "15 September 2026" / "١٥ سبتمبر ٢٠٢٦". */
export function formatGregorian(
  value: string | number | Date | null | undefined,
  lang: DateLang,
  style: Style = "long",
): string {
  const d = toDate(value);
  if (!d) return "";
  try {
    return new Intl.DateTimeFormat(lang === "ar" ? "ar-SA" : "en-GB", {
      // Pinned: "ar-SA" resolves to the Hijri calendar in some ICU builds,
      // and differently between the SSR render and the browser.
      calendar: "gregory",
      timeZone: SITE_TIMEZONE,
      day: "numeric",
      month: style === "short" ? "short" : "long",
      year: "numeric",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

/** Hijri half, e.g. "23 ربيع الأول 1448 هـ" / "23 Rabiʻ I 1448 AH". */
export function formatHijri(
  value: string | number | Date | null | undefined,
  lang: DateLang,
  style: Style = "long",
): string {
  const d = toDate(value);
  if (!d) return "";
  try {
    const formatted = new Intl.DateTimeFormat(
      lang === "ar" ? "ar-SA-u-ca-islamic-umalqura" : "en-GB-u-ca-islamic-umalqura",
      {
        timeZone: SITE_TIMEZONE,
        day: "numeric",
        month: style === "short" ? "short" : "long",
        year: "numeric",
      },
    ).format(d);
    // Arabic ICU output already carries "هـ"; English carries "AH".
    return formatted;
  } catch {
    return "";
  }
}

/** Both calendars, one line: "15 September 2026 — 23 ربيع الأول 1448 هـ". */
export function formatDualDate(
  value: string | number | Date | null | undefined,
  lang: DateLang,
  style: Style = "long",
): string {
  const gregorian = formatGregorian(value, lang, style);
  const hijri = formatHijri(value, lang, style);
  if (!gregorian) return "";
  return hijri ? `${gregorian} — ${hijri}` : gregorian;
}

/** The two halves separately, for stacked layouts where space is tight. */
export function dualDateParts(
  value: string | number | Date | null | undefined,
  lang: DateLang,
  style: Style = "long",
): { gregorian: string; hijri: string } {
  return {
    gregorian: formatGregorian(value, lang, style),
    hijri: formatHijri(value, lang, style),
  };
}

/** A range, both calendars on each end. */
export function formatDualDateRange(
  from: string | number | Date | null | undefined,
  to: string | number | Date | null | undefined,
  lang: DateLang,
  style: Style = "long",
): string {
  const start = formatDualDate(from, lang, style);
  const end = formatDualDate(to, lang, style);
  if (!start) return end;
  if (!end || end === start) return start;
  return `${start} ${lang === "ar" ? "إلى" : "to"} ${end}`;
}

/** Date plus clock time, both calendars (used for logs and timestamps). */
export function formatDualDateTime(
  value: string | number | Date | null | undefined,
  lang: DateLang,
): string {
  const d = toDate(value);
  if (!d) return "";
  const time = new Intl.DateTimeFormat(lang === "ar" ? "ar-SA" : "en-GB", {
    calendar: "gregory",
    timeZone: SITE_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return `${formatDualDate(d, lang, "short")} · ${time}`;
}
