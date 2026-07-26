import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Eyebrow } from "./Editorial";

export interface PageHeaderMeta {
  label: ReactNode;
  value: ReactNode;
  mono?: boolean;
}

export interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Metadata row — issue numbers, dates, counts. Set as a colophon. */
  meta?: PageHeaderMeta[];
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  /**
   * `rule`     paper masthead, rules above and below. The workhorse.
   * `plate`    dark ink band with a framed frontispiece image.
   * `document` bordered official-document masthead.
   */
  variant?: "rule" | "plate" | "document";
  /** Only used by `plate`. */
  image?: string;
  imageCaption?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  meta,
  actions,
  children,
  className,
  variant = "rule",
  image,
  imageCaption,
}: PageHeaderProps) {
  if (variant === "plate") {
    return (
      <PlateHeader
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        meta={meta}
        actions={actions}
        image={image}
        imageCaption={imageCaption}
        className={className}
      >
        {children}
      </PlateHeader>
    );
  }

  if (variant === "document") {
    return (
      <DocumentHeader
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        meta={meta}
        actions={actions}
        className={className}
      >
        {children}
      </DocumentHeader>
    );
  }

  return (
    <RuleHeader
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      meta={meta}
      actions={actions}
      className={className}
    >
      {children}
    </RuleHeader>
  );
}

/* ── rule ───────────────────────────────────────────────────── */

function RuleHeader({
  eyebrow,
  title,
  subtitle,
  meta,
  actions,
  children,
  className,
}: Omit<PageHeaderProps, "variant" | "image" | "imageCaption">) {
  return (
    <header className={cn("border-b border-border bg-background", className)}>
      <div className="container-page pt-12 pb-10 md:pt-16 md:pb-12">
        {eyebrow ? <Eyebrow className="mb-5">{eyebrow}</Eyebrow> : null}

        <h1 className="max-w-4xl text-balance text-3xl leading-[1.2] text-foreground md:text-[2.75rem]">
          {title}
        </h1>

        {subtitle ? (
          <p className="measure mt-5 text-base leading-relaxed text-muted-foreground">{subtitle}</p>
        ) : null}

        {actions ? <div className="mt-7 flex flex-wrap gap-3">{actions}</div> : null}

        {meta?.length ? <MetaRow items={meta} className="mt-9" /> : null}

        {children}
      </div>
    </header>
  );
}

/* ── plate ──────────────────────────────────────────────────── */

/**
 * A frontispiece: the image sits in a defined, captioned frame beside the
 * title rather than washed out behind the text at 20% opacity.
 */
function PlateHeader({
  eyebrow,
  title,
  subtitle,
  meta,
  actions,
  children,
  image,
  imageCaption,
  className,
}: Omit<PageHeaderProps, "variant">) {
  return (
    <header className={cn("bg-ink text-ivory", className)}>
      <div className="container-page py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16">
          <div>
            {eyebrow ? (
              <span className="label-caps mb-5 inline-flex items-center gap-2.5 text-gold">
                <span className="h-px w-7 bg-gold/60" aria-hidden="true" />
                {eyebrow}
              </span>
            ) : null}

            <h1 className="text-balance text-3xl leading-[1.2] text-ivory md:text-[2.75rem]">
              {title}
            </h1>

            {subtitle ? (
              <p className="measure mt-5 text-base leading-relaxed text-ivory/70">{subtitle}</p>
            ) : null}

            {actions ? <div className="mt-7 flex flex-wrap gap-3">{actions}</div> : null}

            {meta?.length ? <MetaRow items={meta} tone="dark" className="mt-9" /> : null}

            {children}
          </div>

          {image ? (
            <figure className="lg:justify-self-end">
              <div className="border border-ivory/15 p-1.5">
                <img
                  src={image}
                  alt=""
                  className="photo-plate aspect-[4/3] w-full object-cover lg:aspect-[5/4]"
                  loading="eager"
                />
              </div>
              {imageCaption ? (
                <figcaption className="mt-3 flex items-start gap-2.5 text-xs leading-relaxed text-ivory/50">
                  <span className="mt-1.5 h-px w-5 shrink-0 bg-gold/60" aria-hidden="true" />
                  <span>{imageCaption}</span>
                </figcaption>
              ) : null}
            </figure>
          ) : null}
        </div>
      </div>
    </header>
  );
}

/* ── document ───────────────────────────────────────────────── */

/** Formal masthead for governance and legal pages. */
function DocumentHeader({
  eyebrow,
  title,
  subtitle,
  meta,
  actions,
  children,
  className,
}: Omit<PageHeaderProps, "variant" | "image" | "imageCaption">) {
  return (
    <header className={cn("bg-secondary/50", className)}>
      <div className="container-page py-12 md:py-16">
        <div className="border border-ink/25 bg-card dark:border-ivory/15">
          <div className="border-b border-ink/25 px-6 py-3 dark:border-ivory/15">
            <Eyebrow rule={false}>{eyebrow}</Eyebrow>
          </div>

          <div className="px-6 py-8 md:px-10 md:py-10">
            <h1 className="max-w-3xl text-balance text-2xl leading-[1.25] text-foreground md:text-4xl">
              {title}
            </h1>

            {subtitle ? (
              <p className="measure mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                {subtitle}
              </p>
            ) : null}

            {actions ? <div className="mt-7 flex flex-wrap gap-3">{actions}</div> : null}

            {children}
          </div>

          {meta?.length ? (
            <div className="border-t border-ink/25 px-6 py-4 md:px-10 dark:border-ivory/15">
              <MetaRow items={meta} />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

/* ── shared ─────────────────────────────────────────────────── */

function MetaRow({
  items,
  tone = "light",
  className,
}: {
  items: PageHeaderMeta[];
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "flex flex-wrap gap-x-10 gap-y-5 border-t pt-5",
        tone === "dark" ? "border-ivory/15" : "border-border",
        className,
      )}
    >
      {items.map((item, i) => (
        <div key={i}>
          <dt
            className={cn(
              "label-caps mb-1.5",
              tone === "dark" ? "text-ivory/45" : "text-muted-foreground",
            )}
          >
            {item.label}
          </dt>
          <dd
            className={cn(
              "text-sm font-medium",
              item.mono && "nums font-mono",
              tone === "dark" ? "text-ivory" : "text-foreground",
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
