/**
 * Makes one CSV cell safe: quotes it, escapes quotes, and neutralises values
 * that a spreadsheet would run as a formula (leading = + - @ tab CR).
 * Accepts raw values or cells already wrapped in quotes.
 */
export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? "" : String(value);
  if (s.length >= 2 && s.startsWith('"') && s.endsWith('"')) {
    s = s.slice(1, -1).replace(/""/g, '"');
  }
  if (typeof value !== "number" && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function csvLine(cells: unknown[]): string {
  return cells.map(csvCell).join(",");
}
