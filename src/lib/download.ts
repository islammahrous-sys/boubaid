/**
 * Saves a file the site already publishes (announcement templates, reference
 * documents) to the visitor's device without altering the original file.
 *
 * The blob route is used first so the browser keeps the file name we pass; if
 * the fetch is blocked (cross-origin storage without CORS), it falls back to a
 * plain link so the visitor still gets the untouched original.
 */
function triggerAnchor(href: string, filename: string, newTab = false) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.rel = "noopener";
  if (newTab) a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Turns a title into a safe file name and keeps the original extension. */
export function suggestFileName(title: string, url: string): string {
  const path = url.split("?")[0]!.split("#")[0]!;
  const ext = /\.([a-z0-9]{2,5})$/i.exec(path)?.[1] ?? "";
  const base =
    title
      .replace(/[\\/:*?"<>|]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80) || "document";
  return ext ? `${base}.${ext.toLowerCase()}` : base;
}

export async function downloadFile(url: string, title: string): Promise<void> {
  const filename = suggestFileName(title, url);
  try {
    const response = await fetch(url, { credentials: "omit" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    triggerAnchor(objectUrl, filename);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
  } catch {
    triggerAnchor(url, filename, true);
  }
}
