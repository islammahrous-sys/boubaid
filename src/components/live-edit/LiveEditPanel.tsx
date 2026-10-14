import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ChevronsLeft,
  ChevronsRight,
  Eye,
  History,
  ImageIcon,
  Languages,
  ListTree,
  Loader2,
  PencilLine,
  RotateCcw,
  ScanEye,
  Search,
  Send,
  Trash2,
  Type,
  Undo2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadInput } from "@/components/console/media/ImageUploadInput";
import { useConfirm } from "@/hooks/useConfirm";
import { useLang, type Lang } from "@/i18n/LanguageProvider";
import { cmsTexts, copyRegistry, isCmsTextId } from "@/i18n/editable-copy";
import { pageLabel } from "@/i18n/page-labels";
import { pageImageRegistry } from "@/content/images";
import { getPublicSiteSettings } from "@/lib/cms.functions";
import {
  getLiveEditHistory,
  publishLiveEdits,
  rollbackLiveRevision,
  type LiveRevision,
} from "@/lib/live-edit.functions";
import {
  discardDrafts,
  draftCount,
  select,
  setEditMode,
  setImageDraft,
  setTextDraft,
  useLiveEdit,
  type LiveEditState,
} from "@/lib/live-edit/store";
import { stripTags } from "@/lib/live-edit/stega";
import type { EditTarget } from "@/lib/live-edit/scan";
import { cn } from "@/lib/utils";

type Bi = { ar?: string; en?: string };
type Tab = "edit" | "page" | "changes" | "history";

/* ── Registry lookups ───────────────────────────────────────────────────── */

function splitId(id: string) {
  const i = id.indexOf(":");
  return { page: id.slice(0, i), path: id.slice(i + 1) };
}
/** Code default for page copy; the stored database value for console-managed (cms-*) texts. */
function builtInText(id: string): Bi | undefined {
  if (isCmsTextId(id)) return cmsTexts.get(id);
  const { page, path } = splitId(id);
  return copyRegistry[page]?.find((e) => e.path === path)?.value;
}
function figure(id: string) {
  return pageImageRegistry.find((e) => e.id === id);
}

/** The value a text field shows: draft → published edit → built-in. */
function textValue(id: string, lang: Lang, s: LiveEditState, published: Record<string, Bi>) {
  const d = s.texts[id]?.[lang];
  const builtIn = builtInText(id)?.[lang] ?? "";
  if (d === null) return isCmsTextId(id) ? "" : builtIn; // a cleared CMS field shows the site default
  if (typeof d === "string") return d;
  if (isCmsTextId(id)) return builtIn;
  const p = published[id]?.[lang];
  return p?.trim() ? p : builtIn;
}
function imageValue(id: string, s: LiveEditState, published: Record<string, string>) {
  const d = s.images[id];
  const builtIn = figure(id)?.defaultSrc ?? "";
  if (d === null) return builtIn;
  return d ?? published[id] ?? builtIn;
}

function usePublished() {
  const { data } = useQuery({
    queryKey: ["public_site_settings"],
    queryFn: () => getPublicSiteSettings(),
    staleTime: 5 * 60 * 1000,
  });
  const settings = (data ?? {}) as Record<string, any>;
  return {
    texts: (settings.page_texts ?? {}) as Record<string, Bi>,
    images: (settings.page_images ?? {}) as Record<string, string>,
  };
}

/* ── Small pieces ───────────────────────────────────────────────────────── */

type PillState = "draft" | "published" | "original" | "cms";

function StatusPill({ state, isAr }: { state: PillState; isAr: boolean }) {
  const label = {
    draft: isAr ? "مسودة غير منشورة" : "Unpublished draft",
    published: isAr ? "معدّل ومنشور" : "Edited & live",
    original: isAr ? "النص الأصلي" : "Original",
    cms: isAr ? "من لوحة التحكم" : "From the console",
  }[state];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
        state === "draft" && "bg-amber-500/15 text-amber-700 dark:text-amber-300",
        state === "published" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
        state === "original" && "bg-muted text-muted-foreground",
        state === "cms" && "bg-sky-500/15 text-sky-700 dark:text-sky-300",
      )}
    >
      {label}
    </span>
  );
}

function LinkButton({
  onClick,
  icon: Icon,
  children,
}: {
  onClick: () => void;
  icon: typeof Undo2;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
    >
      <Icon className="h-3 w-3" />
      {children}
    </button>
  );
}

/* ── Editors ────────────────────────────────────────────────────────────── */

function TextEditor({
  id,
  published,
  autoFocus,
}: {
  id: string;
  published: Record<string, Bi>;
  autoFocus: boolean;
}) {
  const { lang, isAr } = useLangFlags();
  const s = useLiveEdit();
  const builtIn = builtInText(id);
  const draft = s.texts[id];
  // cms-home: Homepage Manager field (clearing it shows the built-in copy);
  // cms-nav: Navigation Manager label (the Arabic label is required).
  const isCms = isCmsTextId(id);
  const isHome = id.startsWith("cms-home:");
  const isNav = id.startsWith("cms-nav:");
  const state: PillState = draft
    ? "draft"
    : isCms
      ? "cms"
      : published[id]
        ? "published"
        : "original";
  const { page, path } = splitId(id);
  const focusRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) focusRef.current?.focus({ preventScroll: true });
  }, [autoFocus, id]);

  if (!builtIn) {
    return (
      <p className="text-xs text-muted-foreground">
        {isAr ? "هذا النص غير متاح للتحرير هنا." : "This text is not editable here."}
      </p>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-foreground">{pageLabel(page)}</p>
          <code className="block truncate text-[10px] text-muted-foreground" dir="ltr">
            {path}
          </code>
        </div>
        <StatusPill state={state} isAr={isAr} />
      </div>

      {(["ar", "en"] as const).map((l) => {
        const value = textValue(id, l, s, published);
        return (
          <label key={l} className="block space-y-1">
            <span className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="font-semibold">{l === "ar" ? "العربية" : "English"}</span>
              <span dir="ltr">{value.length}</span>
            </span>
            <Textarea
              ref={l === lang ? focusRef : undefined}
              dir={l === "ar" ? "rtl" : "ltr"}
              value={value}
              placeholder={
                isHome
                  ? isAr
                    ? "فارغ — يظهر النص الافتراضي للموقع"
                    : "Empty — the site's default text is shown"
                  : undefined
              }
              rows={Math.min(10, Math.max(2, Math.ceil(value.length / 42)))}
              onChange={(e) => setTextDraft(id, l, e.target.value)}
              className="resize-y text-sm leading-relaxed"
            />
          </label>
        );
      })}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {draft && (
          <LinkButton
            icon={Undo2}
            onClick={() => {
              setTextDraft(id, "ar", undefined);
              setTextDraft(id, "en", undefined);
            }}
          >
            {isAr ? "تراجع عن تعديلي" : "Undo my change"}
          </LinkButton>
        )}
        {!isCms && (published[id] || draft) && (
          <LinkButton
            icon={RotateCcw}
            onClick={() => {
              setTextDraft(id, "ar", null);
              setTextDraft(id, "en", null);
            }}
          >
            {isAr ? "استعادة النص الأصلي" : "Back to original"}
          </LinkButton>
        )}
        {isHome && !(draft?.ar === null && draft?.en === null) && (
          <LinkButton
            icon={RotateCcw}
            onClick={() => {
              setTextDraft(id, "ar", null);
              setTextDraft(id, "en", null);
            }}
          >
            {isAr ? "استخدام النص الافتراضي للموقع" : "Use the site's default text"}
          </LinkButton>
        )}
      </div>

      {isCms && (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {isNav
            ? isAr
              ? "اسم في قائمة التنقل (مدير القوائم). يُحدَّث في كل مكان تظهر فيه القائمة. الاسم العربي مطلوب."
              : "A navigation menu label (Navigation Manager). Updates everywhere the menu appears. The Arabic label is required."
            : isAr
              ? "نص قسم في الصفحة الرئيسية (مدير الصفحة الرئيسية)."
              : "A homepage section text (Homepage Manager)."}
        </p>
      )}

      {!isCms && state !== "original" && (
        <details className="text-[11px] text-muted-foreground">
          <summary className="cursor-pointer select-none">
            {isAr ? "النص الأصلي" : "Original text"}
          </summary>
          <p className="mt-1.5 whitespace-pre-wrap" dir="rtl">
            {builtIn.ar}
          </p>
          <p className="mt-1.5 whitespace-pre-wrap" dir="ltr">
            {builtIn.en}
          </p>
        </details>
      )}
    </div>
  );
}

function ImageEditor({ id, published }: { id: string; published: Record<string, string> }) {
  const { isAr } = useLangFlags();
  const s = useLiveEdit();
  const fig = figure(id);
  if (!fig) return null;
  const draft = s.images[id];
  const state = draft !== undefined ? "draft" : published[id] ? "published" : "original";

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs leading-relaxed text-foreground">
          {isAr ? fig.caption.ar : fig.caption.en}
        </p>
        <StatusPill state={state} isAr={isAr} />
      </div>
      <ImageUploadInput
        value={imageValue(id, s, published)}
        onChange={(url) => setImageDraft(id, url?.trim() ? url.trim() : null)}
        allowPdf={false}
      />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <code className="text-[10px] text-muted-foreground" dir="ltr">
          {id}
        </code>
        {draft !== undefined && (
          <LinkButton icon={Undo2} onClick={() => setImageDraft(id, undefined)}>
            {isAr ? "تراجع عن تعديلي" : "Undo my change"}
          </LinkButton>
        )}
        {(published[id] || (draft !== undefined && draft !== null)) && (
          <LinkButton icon={RotateCcw} onClick={() => setImageDraft(id, null)}>
            {isAr ? "استعادة الصورة الأصلية" : "Back to original"}
          </LinkButton>
        )}
      </div>
    </div>
  );
}

function useLangFlags() {
  const { lang, setLang } = useLang();
  return { lang, setLang, isAr: lang === "ar" };
}

/* ── Tabs ───────────────────────────────────────────────────────────────── */

function EditTab({
  published,
  onShowPage,
}: {
  published: ReturnType<typeof usePublished>;
  onShowPage: () => void;
}) {
  const { isAr } = useLangFlags();
  const { selected } = useLiveEdit();

  if (!selected || (!selected.textIds.length && !selected.imageIds.length)) {
    return (
      <div className="space-y-4 py-6 text-center">
        <PencilLine className="mx-auto h-8 w-8 text-bronze dark:text-gold" />
        <p className="text-sm font-medium text-foreground">
          {isAr ? "اضغط على أي نص أو صورة في الصفحة" : "Click any text or image on the page"}
        </p>
        <p className="mx-auto max-w-[18rem] text-xs leading-relaxed text-muted-foreground">
          {isAr
            ? "تظهر العناصر القابلة للتحرير بإطار ذهبي عند المرور عليها. للانتقال عبر رابط أثناء التحرير اضغط Alt مع النقر."
            : "Editable items get a gold outline on hover. To follow a link while editing, Alt-click it."}
        </p>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={onShowPage}>
          <ListTree className="h-3.5 w-3.5" />
          {isAr ? "عرض كل عناصر الصفحة" : "List everything on this page"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {selected.imageIds.map((id) => (
        <ImageEditor key={`img:${id}`} id={id} published={published.images} />
      ))}
      {selected.textIds.map((id, i) => (
        <TextEditor
          key={`txt:${id}`}
          id={id}
          published={published.texts}
          autoFocus={i === 0 && !selected.imageIds.length}
        />
      ))}
    </div>
  );
}

function PageTab({ targets, onPick }: { targets: EditTarget[]; onPick: (t: EditTarget) => void }) {
  const { isAr } = useLangFlags();
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const seen = new Set<string>();
    const out: {
      key: string;
      kind: "text" | "image";
      label: string;
      sub: string;
      t: EditTarget;
    }[] = [];
    for (const t of targets) {
      for (const id of t.imageIds) {
        if (seen.has(`i:${id}`)) continue;
        seen.add(`i:${id}`);
        const fig = figure(id);
        out.push({
          key: `i:${id}`,
          kind: "image",
          label: fig ? (isAr ? fig.caption.ar : fig.caption.en) : id,
          sub: id,
          t,
        });
      }
      for (const id of t.textIds) {
        if (seen.has(`t:${id}`)) continue;
        seen.add(`t:${id}`);
        const shown = stripTags(t.el.textContent || t.el.getAttribute("alt") || "").trim();
        out.push({ key: `t:${id}`, kind: "text", label: shown || id, sub: id, t });
      }
    }
    const needle = q.trim().toLowerCase();
    return needle ? out.filter((r) => (r.label + " " + r.sub).toLowerCase().includes(needle)) : out;
  }, [targets, q, isAr]);

  const texts = rows.filter((r) => r.kind === "text").length;
  const images = rows.length - texts;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="h-9 ps-8 text-sm"
          placeholder={isAr ? "ابحث في عناصر الصفحة…" : "Search this page…"}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <p className="text-[11px] text-muted-foreground">
        {isAr
          ? `${texts} نصًا و${images} صورة قابلة للتحرير في هذه الصفحة`
          : `${texts} texts and ${images} images editable on this page`}
      </p>
      <ul className="space-y-1">
        {rows.map((r) => (
          <li key={r.key}>
            <button
              type="button"
              onClick={() => onPick(r.t)}
              className="flex w-full items-start gap-2.5 rounded-md px-2 py-2 text-start hover:bg-muted"
            >
              {r.kind === "image" ? (
                <ImageIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bronze dark:text-gold" />
              ) : (
                <Type className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              )}
              <span className="min-w-0">
                <span className="line-clamp-2 text-xs text-foreground">{r.label}</span>
                <code className="block truncate text-[10px] text-muted-foreground" dir="ltr">
                  {r.sub}
                </code>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChangesTab({ published }: { published: ReturnType<typeof usePublished> }) {
  const { isAr } = useLangFlags();
  const s = useLiveEdit();
  const textIds = Object.keys(s.texts);
  const imageIds = Object.keys(s.images);

  if (!textIds.length && !imageIds.length) {
    return (
      <p className="py-8 text-center text-xs text-muted-foreground">
        {isAr ? "لا توجد تعديلات غير منشورة." : "No unpublished changes."}
      </p>
    );
  }

  const describe = (v: string | null | undefined, fallback: string) =>
    v === null ? (isAr ? "↺ النص الأصلي" : "↺ original text") : v === "" ? fallback : v;

  return (
    <ul className="space-y-2">
      {imageIds.map((id) => {
        const fig = figure(id);
        return (
          <li key={id} className="flex gap-3 rounded-lg border border-border p-2.5">
            <img
              src={imageValue(id, s, published.images)}
              alt=""
              className="h-12 w-16 shrink-0 rounded object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-xs text-foreground">
                {fig ? (isAr ? fig.caption.ar : fig.caption.en) : id}
              </p>
              <LinkButton icon={Undo2} onClick={() => setImageDraft(id, undefined)}>
                {isAr ? "تراجع" : "Undo"}
              </LinkButton>
            </div>
          </li>
        );
      })}
      {textIds.map((id) => {
        const d = s.texts[id];
        const builtIn = builtInText(id);
        return (
          <li key={id} className="space-y-1.5 rounded-lg border border-border p-2.5">
            <p className="truncate text-[11px] font-medium text-muted-foreground">
              {pageLabel(splitId(id).page)}
            </p>
            {d.ar !== undefined && (
              <p className="line-clamp-3 text-xs text-foreground" dir="rtl">
                {describe(d.ar, builtIn?.ar ?? "")}
              </p>
            )}
            {d.en !== undefined && (
              <p className="line-clamp-3 text-xs text-foreground" dir="ltr">
                {describe(d.en, builtIn?.en ?? "")}
              </p>
            )}
            <LinkButton
              icon={Undo2}
              onClick={() => {
                setTextDraft(id, "ar", undefined);
                setTextDraft(id, "en", undefined);
              }}
            >
              {isAr ? "تراجع" : "Undo"}
            </LinkButton>
          </li>
        );
      })}
    </ul>
  );
}

function HistoryTab({ onApplied }: { onApplied: (r: PublishResult) => void }) {
  const { isAr, lang } = useLangFlags();
  const confirm = useConfirm();
  const loadHistory = useServerFn(getLiveEditHistory);
  const rollback = useServerFn(rollbackLiveRevision);
  const [busy, setBusy] = useState<string | null>(null);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["live_edit_history"],
    queryFn: () => loadHistory(),
  });

  const restore = async (r: LiveRevision) => {
    const ok = await confirm({
      title: isAr ? "استعادة ما قبل هذا النشر؟" : "Restore what was there before this publish?",
      description: isAr
        ? "ستعود كل النصوص والصور التي غيّرها هذا النشر إلى قيمها السابقة، ويُسجَّل ذلك كنشر جديد يمكن التراجع عنه."
        : "Every text and image this publish changed goes back to its previous value. This is recorded as a new publish you can undo too.",
      confirmLabel: isAr ? "استعادة" : "Restore",
    });
    if (!ok) return;
    try {
      setBusy(r.id);
      const res = await rollback({ data: { id: r.id } });
      onApplied(res);
      await refetch();
      toast.success(isAr ? "تمت الاستعادة ونُشرت على الموقع" : "Restored and live on the site");
    } catch (e: any) {
      toast.error(e?.message || (isAr ? "تعذرت الاستعادة" : "Could not restore"));
    } finally {
      setBusy(null);
    }
  };

  if (isLoading) {
    return <Loader2 className="mx-auto my-8 h-5 w-5 animate-spin text-muted-foreground" />;
  }
  if (error) {
    return (
      <p className="py-8 text-center text-xs text-destructive">
        {isAr ? "تعذر تحميل السجل." : "Could not load history."}
      </p>
    );
  }
  if (!data?.length) {
    return (
      <p className="py-8 text-center text-xs text-muted-foreground">
        {isAr
          ? "لم يُنشر شيء من المحرر المباشر بعد."
          : "Nothing published from the live editor yet."}
      </p>
    );
  }

  const fmt = new Intl.DateTimeFormat(lang === "ar" ? "ar-SA" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <ul className="space-y-2">
      {data.map((r) => {
        const nTexts = Object.keys(r.texts).length;
        const nImages = Object.keys(r.images).length;
        return (
          <li key={r.id} className="rounded-lg border border-border p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground">{fmt.format(new Date(r.at))}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {r.byName || (isAr ? "مشرف" : "Admin")}
                  {r.path ? ` · ${r.path}` : ""}
                </p>
              </div>
              {r.rollbackOf && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                  {isAr ? "استعادة" : "Restore"}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {isAr ? `${nTexts} نص · ${nImages} صورة` : `${nTexts} texts · ${nImages} images`}
            </p>
            <details className="mt-1.5 text-[11px]">
              <summary className="cursor-pointer select-none text-muted-foreground">
                {isAr ? "التفاصيل" : "Details"}
              </summary>
              <ul className="mt-2 space-y-2">
                {Object.entries(r.texts).map(([id, c]) => (
                  <li key={id} className="space-y-0.5">
                    <code className="block truncate text-[10px] text-muted-foreground" dir="ltr">
                      {id}
                    </code>
                    {(["ar", "en"] as const).map((l) =>
                      (c.before[l] ?? "") === (c.after[l] ?? "") ? null : (
                        <p key={l} dir={l === "ar" ? "rtl" : "ltr"} className="leading-relaxed">
                          <span className="text-destructive line-through">
                            {c.before[l] || (isAr ? "(الأصل)" : "(original)")}
                          </span>{" "}
                          <span className="text-emerald-700 dark:text-emerald-300">
                            {c.after[l] || (isAr ? "(الأصل)" : "(original)")}
                          </span>
                        </p>
                      ),
                    )}
                  </li>
                ))}
                {Object.entries(r.images).map(([id, c]) => (
                  <li key={id} className="flex items-center gap-2">
                    {[c.before ?? figure(id)?.defaultSrc, c.after ?? figure(id)?.defaultSrc].map(
                      (src, i) =>
                        src ? (
                          <img
                            key={i}
                            src={src}
                            alt=""
                            className={cn(
                              "h-10 w-14 rounded object-cover",
                              i === 0 && "opacity-50 grayscale",
                            )}
                          />
                        ) : null,
                    )}
                    <code className="truncate text-[10px] text-muted-foreground" dir="ltr">
                      {id}
                    </code>
                  </li>
                ))}
              </ul>
            </details>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 h-7 gap-1.5 text-[11px]"
              disabled={busy !== null}
              onClick={() => restore(r)}
            >
              {busy === r.id ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RotateCcw className="h-3 w-3" />
              )}
              {isAr ? "استعادة ما قبل هذا النشر" : "Restore previous version"}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

/* ── Panel ──────────────────────────────────────────────────────────────── */

type PublishResult = Awaited<ReturnType<typeof publishLiveEdits>>;

export function LiveEditPanel({
  targets,
  showAll,
  onToggleShowAll,
  onFocusTarget,
}: {
  targets: EditTarget[];
  showAll: boolean;
  onToggleShowAll: () => void;
  onFocusTarget: (t: EditTarget) => void;
}) {
  const { isAr, lang, setLang } = useLangFlags();
  const s = useLiveEdit();
  const published = usePublished();
  const queryClient = useQueryClient();
  const router = useRouter();
  const confirm = useConfirm();
  const publish = useServerFn(publishLiveEdits);
  const [tab, setTab] = useState<Tab>("edit");
  const [collapsed, setCollapsed] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const count = draftCount(s);

  // A new click on the page always brings the editor forward.
  useEffect(() => {
    if (s.selected) {
      setTab("edit");
      setCollapsed(false);
    }
  }, [s.selected]);

  // Desktop: make room for the panel instead of covering the page.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("live-edit-panel-open", !collapsed);
    return () => root.classList.remove("live-edit-panel-open");
  }, [collapsed]);

  const applyResult = (res: PublishResult) => {
    queryClient.setQueryData(["public_site_settings"], (old: Record<string, any> | undefined) => ({
      ...old,
      page_texts: res.pageTexts,
      page_images: res.pageImages,
    }));
    void queryClient.invalidateQueries({ queryKey: ["public_site_settings"] });
    void queryClient.invalidateQueries({ queryKey: ["public_navigation"] });
    void queryClient.invalidateQueries({ queryKey: ["live_edit_history"] });
    void router.invalidate();
  };

  const onPublish = async () => {
    if (!count) return;
    try {
      setPublishing(true);
      const res = await publish({
        data: { texts: s.texts, images: s.images, path: window.location.pathname },
      });
      applyResult(res);
      discardDrafts();
      toast.success(
        res.changed
          ? isAr
            ? `نُشر ${res.changed} تعديل على الموقع`
            : `${res.changed} change${res.changed === 1 ? "" : "s"} published`
          : isAr
            ? "لا جديد للنشر — كل شيء مطابق للمنشور"
            : "Nothing new to publish — everything already matches",
      );
    } catch (e: any) {
      toast.error(e?.message || (isAr ? "تعذر النشر" : "Could not publish"));
    } finally {
      setPublishing(false);
    }
  };

  const onDiscard = async () => {
    const ok = await confirm({
      title: isAr ? "تجاهل كل التعديلات غير المنشورة؟" : "Discard all unpublished changes?",
      description: isAr
        ? `سيُحذف ${count} تعديل من كل الصفحات ولن يتأثر الموقع المنشور.`
        : `${count} change(s) across all pages will be dropped. The live site is not affected.`,
      tone: "destructive",
      confirmLabel: isAr ? "تجاهل" : "Discard",
    });
    if (ok) discardDrafts();
  };

  const TABS: { id: Tab; icon: typeof Eye; label: string; badge?: number }[] = [
    { id: "edit", icon: PencilLine, label: isAr ? "تحرير" : "Edit" },
    { id: "page", icon: ListTree, label: isAr ? "الصفحة" : "Page", badge: targets.length },
    { id: "changes", icon: Send, label: isAr ? "التعديلات" : "Changes", badge: count },
    { id: "history", icon: History, label: isAr ? "السجل" : "History" },
  ];

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="fixed end-0 top-1/2 z-50 flex -translate-y-1/2 flex-col items-center gap-2 rounded-s-xl border border-e-0 border-border bg-background px-2 py-3 shadow-xl"
        aria-label={isAr ? "فتح المحرر" : "Open editor"}
      >
        {isAr ? (
          <ChevronsLeft className="h-4 w-4" />
        ) : (
          <ChevronsRight className="h-4 w-4 rotate-180" />
        )}
        <PencilLine className="h-4 w-4 text-bronze dark:text-gold" />
        {count > 0 && (
          <span className="rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </button>
    );
  }

  return (
    <aside
      className="fixed inset-x-0 bottom-0 z-50 flex h-[68vh] flex-col border-t border-border bg-background shadow-2xl lg:inset-x-auto lg:inset-y-0 lg:end-0 lg:h-auto lg:w-[400px] lg:border-s lg:border-t-0"
      aria-label={isAr ? "المحرر المباشر" : "Live editor"}
    >
      <header className="space-y-3 border-b border-border p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-gold">
              <PencilLine className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {isAr ? "المحرر المباشر" : "Live editor"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {count
                  ? isAr
                    ? `${count} تعديل بانتظار النشر`
                    : `${count} change(s) waiting to publish`
                  : isAr
                    ? "كل شيء منشور"
                    : "Everything is published"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label={isAr ? "تصغير" : "Collapse"}
              title={isAr ? "تصغير" : "Collapse"}
            >
              {isAr ? (
                <ChevronsLeft className="h-4 w-4 rotate-180" />
              ) : (
                <ChevronsRight className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label={isAr ? "إنهاء التحرير" : "Exit edit mode"}
              title={isAr ? "إنهاء التحرير (Ctrl+E)" : "Exit edit mode (Ctrl+E)"}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="flex-1 gap-1.5 text-xs"
            disabled={!count || publishing}
            onClick={onPublish}
          >
            {publishing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            {isAr ? "نشر على الموقع" : "Publish to site"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            disabled={!count || publishing}
            onClick={onDiscard}
            title={isAr ? "تجاهل كل التعديلات" : "Discard all changes"}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant={showAll ? "default" : "outline"}
            className="gap-1.5 text-xs"
            onClick={onToggleShowAll}
            title={isAr ? "إظهار كل العناصر القابلة للتحرير" : "Highlight everything editable"}
          >
            <ScanEye className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1 px-2 text-xs"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            title={isAr ? "معاينة الصفحة بالإنجليزية" : "Preview the page in Arabic"}
          >
            <Languages className="h-3.5 w-3.5" />
            {lang === "ar" ? "EN" : "ع"}
          </Button>
        </div>

        <nav className="grid grid-cols-4 gap-1 rounded-lg bg-muted p-1" role="tablist">
          {TABS.map(({ id, icon: Icon, label, badge }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "relative flex items-center justify-center gap-1 rounded-md py-1.5 text-[11px] font-medium transition-colors",
                tab === id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {!!badge && (
                <span
                  className={cn(
                    "rounded-full px-1 text-[9px] font-bold",
                    id === "changes" ? "bg-amber-500 text-white" : "bg-muted-foreground/20",
                  )}
                >
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === "edit" && <EditTab published={published} onShowPage={() => setTab("page")} />}
        {tab === "page" && (
          <PageTab
            targets={targets}
            onPick={(t) => {
              onFocusTarget(t);
              select({ textIds: t.textIds, imageIds: t.imageIds });
            }}
          />
        )}
        {tab === "changes" && <ChangesTab published={published} />}
        {tab === "history" && <HistoryTab onApplied={applyResult} />}
      </div>
    </aside>
  );
}
