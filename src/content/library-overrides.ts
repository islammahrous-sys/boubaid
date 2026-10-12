import type { LibraryRow } from "@/lib/cms.functions";

/**
 * Some documents are built into the site (the fund's licence and bylaws, the
 * 1444/1445 committee plans). The library CMS can add new ones, and can also
 * replace or withdraw a built-in one without a deploy:
 *
 *   Reference = "replace:<built-in id>"  → this record replaces that document
 *   Kind      = "hidden"                 → combined with the above, withdraws it
 *
 * Both are visible, editable fields in Admin → Archive & library.
 */
export const HIDDEN_KIND = "hidden";

export function replacedId(row: Pick<LibraryRow, "reference">): string | null {
  const ref = (row.reference ?? "").trim();
  return ref.toLowerCase().startsWith("replace:") ? ref.slice("replace:".length).trim() : null;
}

export function isHidden(row: Pick<LibraryRow, "kind">): boolean {
  return (row.kind ?? "").trim().toLowerCase() === HIDDEN_KIND;
}

/** Best loadable address for a library record's file. */
export function rowHref(row: Pick<LibraryRow, "file_url" | "file_path" | "external_url">) {
  return row.file_url || row.file_path || row.external_url || null;
}
