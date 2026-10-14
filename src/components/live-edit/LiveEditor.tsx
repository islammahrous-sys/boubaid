import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouterState } from "@tanstack/react-router";
import { ImageIcon, PencilLine, Type } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ConfirmProvider } from "@/hooks/useConfirm";
import { useLang } from "@/i18n/LanguageProvider";
import {
  draftCount,
  getLiveEdit,
  hydrateLiveEdit,
  select,
  setEditMode,
  useLiveEdit,
} from "@/lib/live-edit/store";
import { EDITOR_ATTR, scanPage, targetFor, type EditTarget } from "@/lib/live-edit/scan";
import { cn } from "@/lib/utils";
import { LiveEditPanel } from "./LiveEditPanel";

/**
 * On-page live editor for admins: a pencil button on every public page that
 * turns the page itself into the editor. Hover shows what is editable, a click
 * opens it in the side panel, edits preview instantly, and "Publish" pushes
 * them to the site. Loaded lazily and only for admins (see LiveEditorMount).
 */

type Box = { top: number; left: number; width: number; height: number };

const boxOf = (el: Element): Box | null => {
  const r = el.getBoundingClientRect();
  if (!r.width && !r.height) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
};

const isVisible = (b: Box) =>
  b.top + b.height > 0 &&
  b.top < window.innerHeight &&
  b.left + b.width > 0 &&
  b.left < window.innerWidth;

/** Keeps the map of editable elements in sync with the page as React re-renders it. */
function useEditTargets(enabled: boolean, pathname: string) {
  const [targets, setTargets] = useState<Map<Element, EditTarget>>(new Map());
  const ref = useRef(targets);

  useEffect(() => {
    if (!enabled) {
      ref.current = new Map();
      setTargets(ref.current);
      return;
    }
    let timer: number | undefined;
    const run = () => {
      timer = undefined;
      ref.current = scanPage();
      setTargets(ref.current);
    };
    const schedule = () => {
      if (timer === undefined) timer = window.setTimeout(run, 120);
    };
    run();
    const observer = new MutationObserver((records) => {
      // Ignore the editor's own UI churn (highlight boxes, panel typing).
      if (records.every((r) => (r.target as Element).closest?.(`[${EDITOR_ATTR}]`))) return;
      schedule();
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["src", "style", "alt", "title", "placeholder", "aria-label"],
    });
    window.addEventListener("load", schedule);
    return () => {
      observer.disconnect();
      window.removeEventListener("load", schedule);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [enabled, pathname]);

  return { targets, ref };
}

/** Re-measures on scroll/resize so outline boxes stick to their elements. */
function useFrame(active: boolean) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const bump = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setTick((n) => n + 1));
    };
    window.addEventListener("scroll", bump, { passive: true, capture: true });
    window.addEventListener("resize", bump);
    const interval = window.setInterval(bump, 500); // carousels, lazy images, animations
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", bump, { capture: true });
      window.removeEventListener("resize", bump);
      window.clearInterval(interval);
    };
  }, [active]);
}

function Outline({
  box,
  tone,
  label,
  image,
}: {
  box: Box;
  tone: "hover" | "selected" | "ghost" | "flash";
  label?: string;
  image?: boolean;
}) {
  const pad = 3;
  return (
    <div
      className={cn(
        "pointer-events-none fixed rounded-[4px] transition-[top,left,width,height] duration-75",
        tone === "hover" && "outline outline-2 outline-[#c9a24a] bg-[#c9a24a]/[0.06]",
        tone === "selected" &&
          "outline outline-2 outline-[#c9a24a] shadow-[0_0_0_4px_rgba(201,162,74,0.25)]",
        tone === "ghost" && "outline outline-1 outline-dashed outline-[#c9a24a]/70",
        tone === "flash" && "live-edit-flash outline outline-4 outline-[#c9a24a]",
      )}
      style={{
        top: box.top - pad,
        left: box.left - pad,
        width: box.width + pad * 2,
        height: box.height + pad * 2,
      }}
    >
      {label && (
        <span
          className="absolute -top-6 start-0 inline-flex max-w-[16rem] items-center gap-1 truncate rounded-md bg-[#1b1f1c] px-1.5 py-0.5 text-[10px] font-semibold text-[#e8c879] shadow"
          dir="auto"
        >
          {image ? (
            <ImageIcon className="h-3 w-3 shrink-0" />
          ) : (
            <Type className="h-3 w-3 shrink-0" />
          )}
          <PencilLine className="h-3 w-3 shrink-0" />
          {label}
        </span>
      )}
    </div>
  );
}

function LiveEditorUi() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const s = useLiveEdit();
  const pathname = useRouterState({ select: (st) => st.location.pathname });
  const { targets, ref } = useEditTargets(s.enabled, pathname);
  const [hovered, setHovered] = useState<EditTarget | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [flash, setFlash] = useState<Element | null>(null);
  const count = draftCount(s);
  useFrame(s.enabled);

  // Hover + click interception (capture phase, so it wins over page handlers and links).
  useEffect(() => {
    if (!s.enabled) {
      setHovered(null);
      return;
    }
    const inEditorUi = (n: EventTarget | null) =>
      n instanceof Element &&
      !!n.closest(`[${EDITOR_ATTR}], [role="dialog"], [role="alertdialog"]`);
    const onMove = (e: PointerEvent) => {
      const t = inEditorUi(e.target) ? undefined : targetFor(e.target, ref.current);
      setHovered((prev) => (prev?.el === t?.el ? prev : (t ?? null)));
    };
    const onClick = (e: MouseEvent) => {
      if (e.altKey || inEditorUi(e.target)) return; // Alt-click follows links as usual
      const t = targetFor(e.target, ref.current);
      if (!t) return;
      e.preventDefault();
      e.stopPropagation();
      select({ textIds: [...t.textIds], imageIds: [...t.imageIds] });
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("click", onClick, true);
    };
  }, [s.enabled, ref]);

  // Ctrl/Cmd+E toggles edit mode; Esc clears the selection.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setEditMode(!getLiveEdit().enabled);
      } else if (e.key === "Escape" && getLiveEdit().selected) {
        select(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const focusTarget = useCallback((t: EditTarget) => {
    t.el.scrollIntoView({ behavior: "smooth", block: "center" });
    setFlash(t.el);
    window.setTimeout(() => setFlash((f) => (f === t.el ? null : f)), 1400);
  }, []);

  const selectedEls: Element[] = [];
  if (s.selected) {
    for (const t of targets.values()) {
      if (
        t.textIds.some((id) => s.selected!.textIds.includes(id)) ||
        t.imageIds.some((id) => s.selected!.imageIds.includes(id))
      ) {
        selectedEls.push(t.el);
      }
    }
  }

  const labelFor = (t: EditTarget) =>
    t.imageIds.length
      ? isAr
        ? "تغيير الصورة"
        : "Change image"
      : isAr
        ? "تحرير النص"
        : "Edit text";

  return (
    <div {...{ [EDITOR_ATTR]: "" }}>
      <style>{`
        @media (min-width: 1024px) {
          html.live-edit-panel-open body { padding-inline-end: 400px; }
        }
        @keyframes live-edit-flash { 0%,100% { opacity: 0 } 20%,60% { opacity: 1 } }
        .live-edit-flash { animation: live-edit-flash 1.4s ease-in-out; }
      `}</style>

      {s.enabled && (
        <>
          <div className="pointer-events-none fixed inset-0 z-50">
            {showAll &&
              [...targets.values()].map((t, i) => {
                const b = boxOf(t.el);
                return b && isVisible(b) ? <Outline key={i} box={b} tone="ghost" /> : null;
              })}
            {selectedEls.map((el, i) => {
              const b = boxOf(el);
              return b ? <Outline key={`s${i}`} box={b} tone="selected" /> : null;
            })}
            {hovered &&
              (() => {
                const b = boxOf(hovered.el);
                return b ? (
                  <Outline
                    box={b}
                    tone="hover"
                    label={labelFor(hovered)}
                    image={!!hovered.imageIds.length}
                  />
                ) : null;
              })()}
            {flash &&
              (() => {
                const b = boxOf(flash);
                return b ? <Outline box={b} tone="flash" /> : null;
              })()}
          </div>

          <LiveEditPanel
            targets={[...targets.values()]}
            showAll={showAll}
            onToggleShowAll={() => setShowAll((v) => !v)}
            onFocusTarget={focusTarget}
          />
        </>
      )}

      {!s.enabled && (
        <button
          type="button"
          onClick={() => setEditMode(true)}
          className="group fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] start-4 z-50 flex items-center gap-2 rounded-full border border-[#c9a24a]/50 bg-[#1b1f1c] py-2.5 ps-3 pe-4 text-sm font-semibold text-[#e8c879] shadow-[0_10px_30px_-8px_rgba(0,0,0,0.6)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a24a] md:bottom-6"
          title={isAr ? "تحرير هذه الصفحة (Ctrl+E)" : "Edit this page (Ctrl+E)"}
        >
          <span className="relative grid h-7 w-7 place-items-center rounded-full bg-[#c9a24a] text-[#1b1f1c]">
            <PencilLine className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -end-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white ring-2 ring-[#1b1f1c]">
                {count}
              </span>
            )}
          </span>
          {isAr ? "تحرير الصفحة" : "Edit page"}
        </button>
      )}
    </div>
  );
}

/** Admin gate + lazy mount point; renders nothing for visitors and inside the console. */
export default function LiveEditor() {
  const { isAdmin, loading } = useAuth();
  const s = useLiveEdit();
  const pathname = useRouterState({ select: (st) => st.location.pathname });
  const isConsole = pathname.startsWith("/admin") || pathname.startsWith("/content");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (isAdmin) hydrateLiveEdit();
  }, [isAdmin]);
  // Signed out (or lost the role) mid-session, or went into the console: leave edit mode.
  useEffect(() => {
    if ((!loading && !isAdmin) || isConsole) {
      if (s.enabled) setEditMode(false);
    }
  }, [loading, isAdmin, isConsole, s.enabled]);

  if (!mounted || !isAdmin || isConsole) return null;
  return createPortal(
    <ConfirmProvider>
      <LiveEditorUi />
    </ConfirmProvider>,
    document.body,
  );
}
