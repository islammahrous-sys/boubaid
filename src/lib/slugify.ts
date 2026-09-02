/**
 * Arabic-first slug generation for the whole CMS.
 *
 * Editors work entirely in Arabic. Every content type that needs a URL-safe
 * English identifier gets one derived automatically from its Arabic title/name
 * through transliteration — nobody has to type Latin characters, and the
 * schemas below never reject a record just because the slug field was left
 * empty (see `autoSlugField` usage in `cms.schemas.ts` / `admin-hub.schemas.ts`).
 */

/** Arabic letter -> Latin transliteration (simplified, URL-friendly). */
const AR_LETTERS: Record<string, string> = {
  ا: "a",
  أ: "a",
  إ: "i",
  آ: "aa",
  ٱ: "a",
  ب: "b",
  ت: "t",
  ث: "th",
  ج: "j",
  ح: "h",
  خ: "kh",
  د: "d",
  ذ: "dh",
  ر: "r",
  ز: "z",
  س: "s",
  ش: "sh",
  ص: "s",
  ض: "d",
  ط: "t",
  ظ: "z",
  ع: "a",
  غ: "gh",
  ف: "f",
  ق: "q",
  ك: "k",
  ل: "l",
  م: "m",
  ن: "n",
  ه: "h",
  و: "w",
  ي: "y",
  ى: "a",
  ئ: "y",
  ؤ: "w",
  ة: "h",
  ء: "",
  ٹ: "t",
  پ: "p",
  چ: "ch",
  ژ: "zh",
  ک: "k",
  گ: "g",
  ۀ: "h",
  ﻻ: "la",
  لا: "la",
};

/** Arabic-Indic and extended Arabic-Indic digits. */
const AR_DIGITS: Record<string, string> = {
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
};

/** Very common words that add nothing to a URL. */
const AR_STOPWORDS = new Set([
  "من",
  "في",
  "عن",
  "على",
  "الى",
  "إلى",
  "مع",
  "او",
  "أو",
  "و",
  "ثم",
  "ال",
  "هذا",
  "هذه",
  "التي",
  "الذي",
  "بين",
  "كل",
]);

const EN_STOPWORDS = new Set(["the", "a", "an", "of", "and", "or", "in", "on", "for", "to", "with"]);

/** Strip Arabic diacritics (harakat), tatweel and zero-width marks. */
function stripArabicMarks(input: string): string {
  return input
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/\u0640/g, "")
    .replace(/[\u200B-\u200F\u202A-\u202E]/g, "");
}

/** Transliterate Arabic text (and pass Latin text through) to ASCII letters. */
export function transliterateArabic(input: string): string {
  const cleaned = stripArabicMarks(input ?? "");
  let out = "";
  for (const char of cleaned) {
    if (AR_DIGITS[char]) {
      out += AR_DIGITS[char];
      continue;
    }
    const mapped = AR_LETTERS[char];
    if (mapped !== undefined) {
      out += mapped;
      continue;
    }
    out += char;
  }
  return out;
}

/** Drop the definite article from an Arabic word so slugs stay concise. */
function stripDefiniteArticle(word: string): string {
  if (word.length > 4 && /^ال[\u0621-\u064A]/.test(word)) return word.slice(2);
  return word;
}

export type SlugifyOptions = {
  /** Maximum number of words kept in the slug (default 8). */
  maxWords?: number;
  /** Maximum character length (default 80). */
  maxLength?: number;
  /** Allow "/" as a path separator (content pages). */
  allowSlashes?: boolean;
};

/**
 * Turn any Arabic or Latin text into a lowercase, URL-safe, concise slug.
 * Returns an empty string when nothing usable remains — callers decide the
 * fallback (see `autoSlug`).
 */
export function slugify(input: string | null | undefined, options: SlugifyOptions = {}): string {
  const { maxWords = 8, maxLength = 80, allowSlashes = false } = options;
  if (!input) return "";

  const words = stripArabicMarks(String(input))
    .replace(/[_]+/g, " ")
    .split(/[\s\u060C\u061B،؛,.:؟?!()[\]{}"'«»\-—–|/\\]+/)
    .map((w) => w.trim())
    .filter(Boolean)
    .map((w) => (/[\u0600-\u06FF]/.test(w) ? stripDefiniteArticle(w) : w))
    .filter((w) => !AR_STOPWORDS.has(w) && !EN_STOPWORDS.has(w.toLowerCase()));

  const kept: string[] = [];
  for (const word of words) {
    const piece = transliterateArabic(word)
      .normalize("NFKD")
      .replace(/[\u0300-\u036F]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");
    if (!piece) continue;
    kept.push(piece);
    if (kept.length >= maxWords) break;
  }

  let slug = kept.join("-");

  if (allowSlashes) {
    // Preserve intentional path separators typed by an admin (e.g. "about/board").
    const raw = String(input);
    if (raw.includes("/")) {
      slug = raw
        .split("/")
        .map((part) => slugify(part, { ...options, allowSlashes: false }))
        .filter(Boolean)
        .join("/");
    }
  }

  slug = slug.replace(/-{2,}/g, "-").replace(/^[-/]+|[-/]+$/g, "");
  if (slug.length > maxLength) {
    slug = slug.slice(0, maxLength).replace(/-[^-]*$/, "").replace(/-+$/, "");
  }
  return slug;
}

/** Short, collision-resistant suffix used when nothing transliterable exists. */
function randomToken(): string {
  return Math.random().toString(36).slice(2, 7);
}

/**
 * Build a slug from the first usable candidate (e.g. Arabic title, then the
 * English title), always returning a valid value: `<prefix>-<token>` when the
 * text yields nothing (emoji-only titles, punctuation, etc.).
 */
export function autoSlug(
  candidates: Array<string | null | undefined>,
  fallbackPrefix = "item",
  options: SlugifyOptions = {},
): string {
  for (const candidate of candidates) {
    const slug = slugify(candidate, options);
    if (slug.length >= 2) return slug;
  }
  return `${slugify(fallbackPrefix) || "item"}-${randomToken()}`;
}

/** Ensure `base` is not in `taken`, appending -2, -3, ... (then a token). */
export function uniquifySlug(base: string, taken: Iterable<string>): string {
  const used = new Set<string>();
  for (const t of taken) if (t) used.add(String(t).toLowerCase());
  const clean = base.toLowerCase();
  if (!used.has(clean)) return clean;
  for (let n = 2; n <= 50; n += 1) {
    const candidate = `${clean}-${n}`;
    if (!used.has(candidate)) return candidate;
  }
  return `${clean}-${randomToken()}`;
}

type SlugQueryClient = {
  from: (table: string) => any;
};

/**
 * Server-side uniqueness pass: reads sibling slugs sharing the same base and
 * returns the first free variation, so duplicate Arabic titles never surface a
 * "duplicate slug" error to the editor.
 */
export async function resolveUniqueSlug(opts: {
  client: SlugQueryClient;
  table: string;
  base: string;
  excludeId?: string | null;
  column?: string;
}): Promise<string> {
  const { client, table, base, excludeId, column = "slug" } = opts;
  const clean = base.toLowerCase();
  try {
    let query = client.from(table).select(`id, ${column}`).ilike(column, `${clean}%`).limit(60);
    if (excludeId) query = query.neq("id", excludeId);
    const { data, error } = await query;
    if (error || !data) return clean;
    return uniquifySlug(
      clean,
      (data as Array<Record<string, unknown>>).map((row) => String(row[column] ?? "")),
    );
  } catch {
    return clean;
  }
}
