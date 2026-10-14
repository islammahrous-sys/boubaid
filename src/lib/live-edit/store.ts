import { useSyncExternalStore } from "react";

/**
 * Client-side state of the live editor: whether edit mode is on, the unpublished
 * drafts, and what is selected. Kept outside React context so `t()` (in
 * LanguageProvider), the page overlay and the side panel can all read it without
 * re-nesting providers. Drafts survive reloads and page changes so an admin can
 * work across several pages and publish once.
 *
 * Draft values: a string replaces the text/image, `null` means "back to the
 * built-in default" (the published override is removed on publish).
 */

export type TextDraft = { ar?: string | null; en?: string | null };
/** What the admin clicked: the texts and figures shown by one element. */
export type Selection = { textIds: string[]; imageIds: string[] };

export type LiveEditState = {
  enabled: boolean;
  /** Bumped every time edit mode turns on/off — keys a remount of the page tree. */
  session: number;
  texts: Record<string, TextDraft>;
  images: Record<string, string | null>;
  selected: Selection | null;
  hydrated: boolean;
};

const DRAFTS_KEY = "alboabid.liveEdit.drafts.v1";
const ENABLED_KEY = "alboabid.liveEdit.enabled";

let state: LiveEditState = {
  enabled: false,
  session: 0,
  texts: {},
  images: {},
  selected: null,
  hydrated: false,
};
const SERVER_STATE = state;
const listeners = new Set<() => void>();

function emit(next: LiveEditState) {
  state = next;
  for (const l of listeners) l();
}

function persist() {
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify({ texts: state.texts, images: state.images }));
    sessionStorage.setItem(ENABLED_KEY, state.enabled ? "1" : "0");
  } catch {
    // storage unavailable (private mode) — drafts just stay in memory
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useLiveEdit(): LiveEditState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_STATE,
  );
}

export function getLiveEdit(): LiveEditState {
  return state;
}

/** Restores drafts (and edit mode for this tab) — call once, client-side, for admins only. */
export function hydrateLiveEdit() {
  if (state.hydrated || typeof window === "undefined") return;
  let texts: LiveEditState["texts"] = {};
  let images: LiveEditState["images"] = {};
  let enabled = false;
  try {
    const raw = JSON.parse(localStorage.getItem(DRAFTS_KEY) || "null");
    if (raw && typeof raw === "object") {
      texts = raw.texts && typeof raw.texts === "object" ? raw.texts : {};
      images = raw.images && typeof raw.images === "object" ? raw.images : {};
    }
    enabled = sessionStorage.getItem(ENABLED_KEY) === "1";
  } catch {
    // corrupt or unavailable storage — start clean
  }
  emit({
    ...state,
    texts,
    images,
    enabled,
    session: state.session + (enabled ? 1 : 0),
    hydrated: true,
  });
}

export function setEditMode(enabled: boolean) {
  if (enabled === state.enabled) return;
  emit({
    ...state,
    enabled,
    session: state.session + 1,
    selected: enabled ? state.selected : null,
  });
  persist();
}

export function select(selection: Selection | null) {
  emit({ ...state, selected: selection });
}

/** `value`: string = new text, null = reset to default, undefined = drop the draft. */
export function setTextDraft(id: string, lang: "ar" | "en", value: string | null | undefined) {
  const current = { ...state.texts[id] };
  if (value === undefined) delete current[lang];
  else current[lang] = value;
  const texts = { ...state.texts };
  if (current.ar === undefined && current.en === undefined) delete texts[id];
  else texts[id] = current;
  emit({ ...state, texts });
  persist();
}

/** `url`: string = new image, null = reset to default, undefined = drop the draft. */
export function setImageDraft(id: string, url: string | null | undefined) {
  const images = { ...state.images };
  if (url === undefined) delete images[id];
  else images[id] = url;
  emit({ ...state, images });
  persist();
}

export function discardDrafts() {
  emit({ ...state, texts: {}, images: {} });
  persist();
}

export function draftCount(s: LiveEditState = state): number {
  let n = Object.keys(s.images).length;
  for (const d of Object.values(s.texts))
    n += (d.ar !== undefined ? 1 : 0) + (d.en !== undefined ? 1 : 0);
  return n;
}
