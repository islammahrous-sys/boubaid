/**
 * Invisible source tags for the live editor.
 *
 * While an admin has edit mode on, `t()` appends a zero-width tag to every
 * registered string that encodes its copy id ("page:path"). The overlay then
 * reads the tags back out of the rendered DOM to know which element shows
 * which text — no call site has to change, and visitors never receive tags
 * (edit mode is client-only and off by default).
 *
 * The alphabet deliberately avoids ZWJ / ZWNJ (U+200C / U+200D): those change
 * Arabic letter joining and would visibly reshape the last letter.
 */

const MARK = "⁣"; // INVISIBLE SEPARATOR — opens and closes a tag
const DIGITS = ["​", "⁡", "⁢", "⁤"] as const; // base-4 digits
const DIGIT_VALUE: Record<string, number> = Object.fromEntries(DIGITS.map((d, i) => [d, i]));
const TAG_RE = new RegExp(`${MARK}([${DIGITS.join("")}]+)${MARK}`, "g");

const idToIndex = new Map<string, number>();
const indexToId: string[] = [];

function indexFor(id: string): number {
  let i = idToIndex.get(id);
  if (i === undefined) {
    i = indexToId.length;
    indexToId.push(id);
    idToIndex.set(id, i);
  }
  return i;
}

/** Appends an invisible tag carrying `id` to `text`. */
export function tagText(text: string, id: string): string {
  let n = indexFor(id);
  let digits = "";
  do {
    digits = DIGITS[n % 4] + digits;
    n = Math.floor(n / 4);
  } while (n > 0);
  return `${text}${MARK}${digits}${MARK}`;
}

/** True when `value` carries at least one tag (cheap pre-check before decoding). */
export function hasTag(value: string | null | undefined): boolean {
  return !!value && value.includes(MARK);
}

/** Copy ids encoded in `value`, in order of appearance, de-duplicated. */
export function readTags(value: string): string[] {
  const ids: string[] = [];
  for (const m of value.matchAll(TAG_RE)) {
    let n = 0;
    for (const ch of m[1]) n = n * 4 + DIGIT_VALUE[ch];
    const id = indexToId[n];
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

/** Removes every tag, leaving the visible text. */
export function stripTags(value: string): string {
  return value.replace(TAG_RE, "");
}
