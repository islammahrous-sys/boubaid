import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useLang } from "@/i18n/LanguageProvider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

/* ------------------------------- primitives -------------------------------- */

/** A neutral surface used for every console block: one radius, one border,
 *  one shadow — so all admin screens read as a single product. */
export function Panel({
  children,
  className,
  ...rest
}: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border border-border bg-card shadow-sm", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5">
      <div className="min-w-0">
        <h2 className="text-[15px] font-bold leading-tight text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/** Buttons: three intents only, all keyboard-focusable with a visible ring. */
export function CButton({
  variant = "ghost",
  size = "md",
  className,
  ...rest
}: {
  variant?: "primary" | "ghost" | "danger" | "subtle";
  size?: "sm" | "md";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md border font-medium transition-[background-color,color,border-color,box-shadow] duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-55 active:translate-y-px",
        size === "sm" ? "min-h-8 px-2.5 text-[12px]" : "min-h-9 px-3.5 text-[13px]",
        variant === "primary" &&
          "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "ghost" && "border-border bg-background text-foreground hover:bg-secondary",
        variant === "subtle" &&
          "border-transparent bg-secondary text-foreground hover:bg-secondary/70",
        variant === "danger" &&
          "border-destructive/40 bg-background text-destructive hover:bg-destructive/10",
        className,
      )}
      {...rest}
    />
  );
}

/** Status is never colour-only: every badge carries a word plus a dot. */
export function StatusBadge({
  tone,
  children,
}: {
  tone: "positive" | "pending" | "negative" | "neutral";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11.5px] font-medium",
        tone === "positive" &&
          "border-emerald-600/30 bg-emerald-600/10 text-emerald-700 dark:text-emerald-300",
        tone === "pending" && "border-gold/40 bg-gold/12 text-bronze dark:text-gold",
        tone === "negative" && "border-destructive/30 bg-destructive/10 text-destructive",
        tone === "neutral" && "border-border bg-secondary text-muted-foreground",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          tone === "positive" && "bg-emerald-600",
          tone === "pending" && "bg-gold",
          tone === "negative" && "bg-destructive",
          tone === "neutral" && "bg-muted-foreground/60",
        )}
      />
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "neutral" | "attention";
  icon?: ReactNode;
}) {
  return (
    <Panel className="p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </p>
        {icon ? (
          <span aria-hidden="true" className="text-muted-foreground/70">
            {icon}
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          "nums mt-2 text-2xl font-bold leading-none tracking-tight",
          tone === "attention" ? "text-bronze dark:text-gold" : "text-foreground",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-[12px] text-muted-foreground">{hint}</p> : null}
    </Panel>
  );
}

export function EmptyState({
  title,
  body,
  action,
  icon,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span
        aria-hidden="true"
        className="mb-4 flex size-11 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground"
      >
        {icon ?? "◈"}
      </span>
      <p className="text-[15px] font-bold text-foreground">{title}</p>
      {body ? (
        <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground">{body}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function RowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4 sm:px-5">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-4 w-1/5" />
          <Skeleton className="ms-auto h-7 w-24" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({
  onRetry,
  retrying,
}: {
  onRetry: () => void;
  retrying?: boolean;
}) {
  const { lang } = useLang();
  const label = (ar: string, en: string) => (lang === "ar" ? ar : en);
  return (
    <div role="alert" className="px-5 py-10 text-center">
      <p className="text-[14px] font-bold text-foreground">
        {label("تعذر تحميل البيانات", "We couldn't load this data")}
      </p>
      <p className="mx-auto mt-1.5 max-w-sm text-[13px] text-muted-foreground">
        {label(
          "قد يكون الاتصال انقطع مؤقتًا. أعد المحاولة، وإن تكرر الأمر أبلغ الأمانة.",
          "The connection may have dropped. Try again — if it keeps failing, tell the secretariat.",
        )}
      </p>
      <CButton className="mt-5" onClick={onRetry} disabled={retrying}>
        {retrying ? label("جارٍ المحاولة…", "Retrying…") : label("إعادة المحاولة", "Try again")}
      </CButton>
    </div>
  );
}

/* --------------------------------- toolbar --------------------------------- */

/** Debounced search + optional filters, shared by every list screen. */
export function Toolbar({
  search,
  onSearch,
  placeholder,
  children,
  meta,
}: {
  search: string;
  onSearch: (v: string) => void;
  placeholder: string;
  children?: ReactNode;
  meta?: ReactNode;
}) {
  const [local, setLocal] = useState(search);
  const { lang } = useLang();

  useEffect(() => setLocal(search), [search]);
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (local !== search) onSearch(local);
    }, 220);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local]);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3 sm:px-5">
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-muted-foreground"
        >
          ⌕
        </span>
        <input
          type="search"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder={placeholder}
          aria-label={lang === "ar" ? "بحث" : "Search"}
          className="min-h-9 w-full rounded-md border border-border bg-background ps-8 pe-3 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        />
      </div>
      {children}
      {meta ? <div className="ms-auto text-[12px] text-muted-foreground">{meta}</div> : null}
    </div>
  );
}

export function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-[12px] text-muted-foreground">
      <span className="sr-only sm:not-sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="min-h-9 rounded-md border border-border bg-background px-2.5 text-[13px] text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ---------------------------- destructive actions --------------------------- */

/** Destructive work always passes through an explicit, keyboard-accessible
 *  confirmation that names the consequence. */
export function ConfirmAction({
  trigger,
  title,
  body,
  confirmLabel,
  onConfirm,
}: {
  trigger: ReactNode;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
}) {
  const { lang } = useLang();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent dir={lang === "ar" ? "rtl" : "ltr"}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{lang === "ar" ? "إلغاء" : "Cancel"}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ---------------------------------- table ---------------------------------- */

export function DataTable({ children, head }: { children: ReactNode; head: ReactNode[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-start text-[13px]">
        <thead>
          <tr className="border-b border-border bg-secondary/40">
            {head.map((h, i) => (
              <th
                key={i}
                scope="col"
                className="px-4 py-2.5 text-start text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground sm:px-5"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <td className={cn("px-4 py-3 align-top sm:px-5", className)}>{children}</td>;
}
