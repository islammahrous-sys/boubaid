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
