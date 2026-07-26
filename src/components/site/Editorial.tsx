import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Editorial primitives.
 *
 * These deliberately do NOT share a single "card" look. A document, a
 * person, and a news story are different kinds of thing and should be
 * set differently on the page. Reach for the specific primitive rather
 * than wrapping everything in a bordered box.
 */

/* ── Rules & ornament ───────────────────────────────────────── */

export function Rule({
  variant = "hair",
  className,
}: {
  variant?: "hair" | "ink" | "double";
  className?: string;
}) {
  const variants = {
    hair: "rule-hair",
    ink: "rule-ink",
    double: "rule-double",
  };
  return <div role="presentation" className={cn(variants[variant], className)} />;
}

/** Section break. One per screen at most — it loses all meaning repeated. */
export function Ornament({ className }: { className?: string }) {
  return (
    <div
      role="presentation"
      className={cn("flex items-center justify-center gap-3 text-bronze", className)}
    >
      <span className="h-px w-16 bg-rule" />
      <span className="ornament-star opacity-70" />
      <span className="h-px w-16 bg-rule" />
    </div>
  );
}

/* ── Labels ─────────────────────────────────────────────────── */

/**
 * Small caps label. A single leading rule rather than symmetric flanking
 * rules — the asymmetry is intentional and reads as typeset rather than
 * auto-generated.
 */
export function Eyebrow({
  children,
  className,
  rule = true,
}: {
  children: ReactNode;
  className?: string;
  rule?: boolean;
}) {
  return (
    <span className={cn("label-caps inline-flex items-center gap-2.5 text-bronze", className)}>
      {rule ? <span className="h-px w-7 bg-bronze/50" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

/* ── Section heading ────────────────────────────────────────── */

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "start",
  index,
  as: Tag = "h2",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "start" | "center";
  /** Optional margin numeral, e.g. "II" — for pages that read as chapters. */
  index?: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      {eyebrow ? (
        <div className={cn("mb-3", align === "center" && "flex justify-center")}>
          <Eyebrow rule={align !== "center"}>{eyebrow}</Eyebrow>
        </div>
      ) : null}

      <div className={cn("flex items-baseline gap-4", align === "center" && "justify-center")}>
        {index ? (
          <span
            aria-hidden="true"
            className="nums shrink-0 font-display text-2xl font-normal text-bronze/45 md:text-3xl"
          >
            {index}
          </span>
        ) : null}
        <Tag className="text-balance text-2xl leading-tight text-foreground md:text-3xl">
          {title}
        </Tag>
      </div>

      {subtitle ? (
        <p
          className={cn(
            "measure mt-3 text-sm leading-relaxed text-muted-foreground md:text-base",
            align === "center" && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

/* ── Long-form prose ────────────────────────────────────────── */

export function Prose({
  children,
  dropCap = false,
  className,
}: {
  children: ReactNode;
  dropCap?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        // Running text sits at 15/16px, not 14. Arabic in particular reads
        // small and thin below this, and the whole site is Arabic-first.
        "measure space-y-4 text-[0.9375rem] leading-[1.9] text-ink-soft md:text-base dark:text-foreground/85",
        dropCap && "[&>p:first-of-type]:drop-cap",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ── Definition list ────────────────────────────────────────── */

/**
 * Label/value pairs set as an actual table of facts rather than a grid
 * of bordered tiles. Used for specifications, metadata, and figures.
 */
export function DefinitionList({
  items,
  className,
  dense = false,
}: {
  items: { term: ReactNode; value: ReactNode; mono?: boolean }[];
  className?: string;
  dense?: boolean;
}) {
  return (
    <dl className={cn("divide-y divide-border", className)}>
      {items.map((item, i) => (
        <div
          key={i}
          className={cn(
            "grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-6",
            dense ? "py-2.5" : "py-3.5",
          )}
        >
          <dt className="label-caps pt-0.5 text-muted-foreground">{item.term}</dt>
          <dd
            className={cn("text-sm text-foreground", item.mono && "nums font-mono text-[0.8rem]")}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ── Mobile record ──────────────────────────────────────────── */

/**
 * A table's small-screen counterpart. Data tables need real columns to be
 * legible and shouldn't be force-fit onto a phone by shrinking text or
 * scrolling sideways — instead each row becomes a titled card of label/value
 * pairs. Pair with `<Table className="hidden md:block">` /
 * `<div className="md:hidden">` around the two renderings of the same rows.
 */
export function Record({
  title,
  children,
  className,
}: {
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-b border-border py-4 first:pt-0 last:border-b-0", className)}>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {children ? <div className="mt-2 space-y-1.5">{children}</div> : null}
    </div>
  );
}

/** A single label/value line inside a `Record`. */
export function RecordField({
  label,
  children,
  mono,
  className,
}: {
  label: ReactNode;
  children: ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4", className)}>
      <span className="label-caps shrink-0 text-muted-foreground">{label}</span>
      <span className={cn("text-end text-sm text-foreground", mono && "nums font-mono")}>
        {children}
      </span>
    </div>
  );
}

/* ── Status pill ────────────────────────────────────────────── */

/**
 * The only pill in the system. No pulsing dot: this labels a state, it
 * does not announce a live feed.
 */
export function Status({
  tone = "neutral",
  children,
}: {
  tone?: "active" | "pending" | "neutral";
  children: ReactNode;
}) {
  const tones = {
    active: "border-emerald/35 text-emerald",
    pending: "border-bronze/40 text-bronze",
    neutral: "border-border text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "label-caps inline-flex items-center border px-2.5 py-1 leading-none",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
