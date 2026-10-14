import { currentPageImageSrc, pageImageRegistry } from "@/content/images";
import { hasTag, readTags } from "./stega";

/**
 * Finds everything editable on the rendered page.
 *
 * - Texts: text nodes (and alt/title/placeholder/aria-label attributes) carrying
 *   the invisible tags `t()` adds in edit mode.
 * - Images: <img> elements and inline `background-image`s whose URL is the one a
 *   registered page figure currently renders with.
 *
 * One target per element; an <img> can carry both its figure and its alt text.
 */

export type EditTarget = {
  el: Element;
  textIds: string[];
  imageIds: string[];
};

/** Marks the editor's own UI so the scanner and the click handler skip it. */
export const EDITOR_ATTR = "data-live-editor";

const TAGGED_ATTRS = ["alt", "title", "placeholder", "aria-label"] as const;

export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url, window.location.href);
    u.hash = "";
    return u.origin === window.location.origin ? u.pathname + u.search : u.href;
  } catch {
    return url;
  }
}

/** URL → figure ids, from what each figure currently renders with (drafts included). */
function imageIndex(): Map<string, string[]> {
  const index = new Map<string, string[]>();
  for (const { id } of pageImageRegistry) {
    const src = currentPageImageSrc(id);
    if (!src) continue;
    const key = normalizeUrl(src);
    index.set(key, [...(index.get(key) ?? []), id]);
  }
  return index;
}

const BG_URL_RE = /url\((['"]?)(.*?)\1\)/g;

export function scanPage(root: HTMLElement = document.body): Map<Element, EditTarget> {
  const targets = new Map<Element, EditTarget>();
  const isEditorUi = (el: Element) => !!el.closest(`[${EDITOR_ATTR}]`);
  const add = (el: Element, kind: "textIds" | "imageIds", ids: string[]) => {
    if (!ids.length || isEditorUi(el)) return;
    const t = targets.get(el) ?? { el, textIds: [], imageIds: [] };
    for (const id of ids) if (!t[kind].includes(id)) t[kind].push(id);
    targets.set(el, t);
  };

  // Tagged text nodes → their parent element.
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (hasTag(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP),
  });
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const parent = n.parentElement;
    if (parent && !["SCRIPT", "STYLE", "TITLE"].includes(parent.tagName)) {
      add(parent, "textIds", readTags(n.nodeValue ?? ""));
    }
  }

  // Tagged attributes.
  const attrSelector = TAGGED_ATTRS.map((a) => `[${a}]`).join(",");
  for (const el of root.querySelectorAll(attrSelector)) {
    for (const a of TAGGED_ATTRS) {
      const v = el.getAttribute(a);
      if (hasTag(v)) add(el, "textIds", readTags(v!));
    }
  }

  // Registered page images.
  const index = imageIndex();
  for (const img of root.querySelectorAll("img")) {
    const src = img.getAttribute("src");
    const ids = src ? index.get(normalizeUrl(src)) : undefined;
    if (ids) add(img, "imageIds", ids);
  }
  for (const el of root.querySelectorAll<HTMLElement>("[style*='background-image']")) {
    for (const m of el.style.backgroundImage.matchAll(BG_URL_RE)) {
      const ids = index.get(normalizeUrl(m[2]));
      if (ids) add(el, "imageIds", ids);
    }
  }

  return targets;
}

/** The nearest editable ancestor (or self) of `node`. */
export function targetFor(
  node: EventTarget | null,
  targets: Map<Element, EditTarget>,
): EditTarget | undefined {
  let el = node instanceof Element ? node : node instanceof Node ? node.parentElement : null;
  while (el) {
    const t = targets.get(el);
    if (t) return t;
    el = el.parentElement;
  }
  return undefined;
}
