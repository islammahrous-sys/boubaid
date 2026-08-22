import { useEffect, useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export interface RailSection {
  /** The `id` of the section element on the page. */
  id: string;
  label: BiText;
}

/**
 * In-page wayfinding for the long documentary pages. Two presentations of the
 * same state: a hairline vertical rail alongside the text on wide screens, and
 * a scrollable chip row pinned under the masthead on narrow ones.
 *
 * Position is observed rather than computed from scroll offsets, so it stays
 * correct as plates load and reveal animations settle the layout.
 */
export function SectionRail({
  sections,
  className,
}: {
  sections: RailSection[];
  className?: string;
}) {
  const { t } = useLang();
  const [active, setActive] = useState<string | null>(sections[0]?.id ?? null);

  useEffect(() => {
    const nodes = sections
      .map((s) => document.getElementById(s.id))
      .filter((n): n is HTMLElement => n != null);
    if (nodes.length === 0) return;

    // Bias the observation band to the upper third: a heading is "current"
    // once it has settled near the top of the reading area, not when it is
    // merely visible at the bottom edge.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -62% 0px", threshold: 0 },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [sections]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    // Move focus so keyboard and screen-reader users land where sighted
    // users just scrolled to.
    el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  };

  return (
    <>
      {/* Mobile / tablet: pinned chip row */}
      <nav
        aria-label={t({ ar: "أقسام الصفحة", en: "Sections on this page" })}
        className={cn(
          "no-scrollbar sticky top-14 z-30 -mx-4 overflow-x-auto border-b border-border bg-background/92 px-4 py-2 backdrop-blur xl:hidden",
          className,
        )}
      >
        <ul className="flex w-max items-center gap-1.5">
          {sections.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => go(s.id)}
                aria-current={active === s.id ? "true" : undefined}
                className={cn(
                  "label-caps min-h-9 border px-3 py-1.5 whitespace-nowrap transition-colors duration-150",
                  active === s.id
                    ? "border-bronze bg-bronze/10 text-bronze dark:border-gold dark:bg-gold/10 dark:text-gold"
                    : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground",
                )}
              >
                {t(s.label)}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Wide screens: fixed hairline rail in the outer margin */}
      <nav
        aria-label={t({ ar: "أقسام الصفحة", en: "Sections on this page" })}
        className="fixed top-1/2 z-30 hidden -translate-y-1/2 xl:block ltr:left-6 rtl:right-6"
      >
        <ul className="space-y-1">
          {sections.map((s) => {
            const isActive = active === s.id;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => go(s.id)}
                  aria-current={isActive ? "true" : undefined}
                  className="group flex items-center gap-3 py-1.5 text-start"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "block h-px transition-all duration-[var(--dur-normal)] ease-[var(--ease-editorial)]",
                      isActive
                        ? "w-8 bg-bronze dark:bg-gold"
                        : "w-4 bg-border group-hover:w-6 group-hover:bg-foreground",
                    )}
                  />
                  <span
                    className={cn(
                      "label-caps max-w-[9rem] leading-tight transition-colors duration-150",
                      isActive
                        ? "text-bronze dark:text-gold"
                        : "text-muted-foreground/70 group-hover:text-foreground",
                    )}
                  >
                    {t(s.label)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
