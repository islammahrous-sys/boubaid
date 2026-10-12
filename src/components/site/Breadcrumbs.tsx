import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import { inl } from "@/content/page-copy/breadcrumbs-inline";

export interface Crumb {
  label: BiText;
  /** Omit on the final crumb — the current page is not a link. */
  to?: string;
}

/**
 * Wayfinding for detail routes. Typeset in the same small-caps label scale as
 * the rest of the apparatus so it reads as a running head, not a UI widget.
 */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const { t, lang } = useLang();
  const Chevron = lang === "ar" ? ChevronLeft : ChevronRight;

  return (
    <nav aria-label={t(inl.t_7c743343)} className={cn("min-w-0", className)}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex min-w-0 items-center gap-1.5">
              {i > 0 ? (
                <Chevron className="h-3 w-3 shrink-0 text-muted-foreground/50" aria-hidden="true" />
              ) : null}
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="label-caps text-muted-foreground transition-colors hover:text-bronze dark:hover:text-gold"
                >
                  {t(item.label)}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="label-caps max-w-[16rem] truncate text-bronze dark:text-gold"
                >
                  {t(item.label)}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
