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

/** Hijri year (Umm al-Qura) that a given Gregorian instant falls in. */
function hijriYear(value: Date): string {
  try {
    return (
      new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
        timeZone: SITE_TIMEZONE,
        year: "numeric",
      })
        .formatToParts(value)
        .find((p) => p.type === "year")?.value ?? ""
    );
  } catch {
    return "";
  }
}

/**
 * A year, both calendars: "2025م · 1447هـ" / "2025 CE · 1447 AH".
 * The Hijri year is derived from the Gregorian one, never hardcoded.
 */
export function formatDualYear(year: number, lang: DateLang): string {
  const h = hijriYear(new Date(Date.UTC(year, 6, 1)));
  const g = lang === "ar" ? `${year}م` : `${year} CE`;
  if (!h) return g;
  return lang === "ar" ? `${g} · ${h}هـ` : `${g} · ${h} AH`;
}

/**
 * A span of years in both calendars, e.g.
 * "2023م – 2025م · 1444هـ – 1447هـ".
 */
export function formatDualYearRange(from: number, to: number, lang: DateLang): string {
  const hFrom = hijriYear(new Date(Date.UTC(from, 0, 1)));
  const hTo = hijriYear(new Date(Date.UTC(to, 11, 31)));
  if (lang === "ar") {
    const g = `${from}م – ${to}م`;
    return hFrom && hTo ? `${g} · ${hFrom}هـ – ${hTo}هـ` : g;
  }
  const g = `${from} – ${to} CE`;
  return hFrom && hTo ? `${g} · ${hFrom} – ${hTo} AH` : g;
}

/**
 * A record whose stored year is Hijri (statutory documents are dated 1447 and
 * the like) still has to show both calendars. The Gregorian side is derived
 * from the Hijri year through the same Umm al-Qura calendar — a Hijri year
 * straddles two Gregorian ones, so both are shown: "1447هـ · 2025–2026م".
 */
export function formatDualHijriYear(hijri: string | number, lang: DateLang): string {
  const h = String(hijri).replace(/[^\d]/g, "");
  const hLabel = lang === "ar" ? `${h}هـ` : `${h} AH`;
  const n = Number(h);
  if (!n || n < 1000 || n > 1600) return hLabel;

  // A Hijri year overlaps two Gregorian ones. Start from the standard
  // approximation and let the Umm al-Qura calendar itself confirm which
  // Gregorian years that Hijri year actually touches.
  const approx = Math.round(n * 0.970224 + 621.5);
  const touched: number[] = [];
  for (let gy = approx - 2; gy <= approx + 2; gy += 1) {
    const probes = [Date.UTC(gy, 0, 1), Date.UTC(gy, 5, 15), Date.UTC(gy, 11, 31)];
    if (probes.some((ms) => Number(hijriYear(new Date(ms))) === n)) touched.push(gy);
  }
  if (touched.length === 0) return hLabel;

  const gFrom = touched[0]!;
  const gTo = touched[touched.length - 1]!;
  const gLabel =
    lang === "ar"
      ? gFrom === gTo
        ? `${gFrom}م`
        : `${gFrom}–${gTo}م`
      : gFrom === gTo
        ? `${gFrom} CE`
        : `${gFrom}–${gTo} CE`;
  return `${hLabel} · ${gLabel}`;
}
