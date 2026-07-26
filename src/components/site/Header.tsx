import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { siteMeta } from "@/content/site";
import { primaryNav, secondaryNav, navGroups, isRouteActive } from "@/content/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

export function Header() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMoreOpen(false);
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  const isSecondaryActive = secondaryNav.some((n) => isRouteActive(pathname, n.to));

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md text-foreground shadow-xs transition-all duration-300">
      {/* Registration line. Stated plainly as public record. */}
      <div className="border-b border-border/50 bg-secondary/60 py-1.5 text-foreground">
        <div className="container-page flex items-center justify-center gap-2.5 text-center text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-0.5 text-[11px] font-medium text-amber-900 dark:text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" aria-hidden="true" />
            {lang === "ar" ? "كيان أهلي مرخص" : "Licensed Nonprofit"}
          </span>
          <span className="h-3.5 w-px bg-border" aria-hidden="true" />
          <span className="truncate text-[11px] text-muted-foreground">
            {t(siteMeta.ncnpAuthority)}
          </span>
          <span className="nums font-mono text-[11px] font-bold text-bronze dark:text-gold">
            {siteMeta.ncnpLicense}
          </span>
        </div>
      </div>

      <div className="container-page flex h-[4.5rem] items-center justify-between gap-4">
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-3 transition-transform duration-200 ease-out active:scale-[0.98]"
          onClick={() => setOpen(false)}
        >
          <img
            src="/logo-brown.png"
            alt=""
            className="h-10 w-10 shrink-0 object-contain transition-transform duration-200 ease-out group-hover:scale-105 dark:hidden"
            aria-hidden="true"
          />
          <img
            src="/logo-gold.png"
            alt=""
            className="hidden h-10 w-10 shrink-0 object-contain transition-transform duration-200 ease-out group-hover:scale-105 dark:block"
            aria-hidden="true"
          />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-naskh text-lg font-bold text-foreground transition-colors group-hover:text-bronze dark:group-hover:text-gold rtl:text-xl">
              {lang === "ar" ? "آل بوعبيد" : "Al Bu Obaid"}
            </span>
            <span className="label-caps truncate text-bronze transition-colors dark:text-gold-soft">
              {lang === "ar" ? "منظمة التنمية العائلية" : "Family Development Org."}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {primaryNav.map((n) => {
            const active = isRouteActive(pathname, n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition-[color,background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.97]",
                  active
                    ? "bg-bronze/10 text-bronze font-bold shadow-xs dark:bg-gold/15 dark:text-gold"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {t(n.label)}
              </Link>
            );
          })}

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setMoreOpen(!moreOpen)}
              aria-expanded={moreOpen}
              aria-haspopup="true"
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition-[color,background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.97]",
                isSecondaryActive
                  ? "bg-bronze/10 text-bronze font-bold shadow-xs dark:bg-gold/15 dark:text-gold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {lang === "ar" ? "المزيد" : "More"}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  moreOpen && "rotate-180",
                )}
                aria-hidden="true"
              />
            </button>

            {moreOpen ? (
              <div className="absolute top-full mt-2 w-[30rem] rounded-lg border border-border bg-popover p-6 shadow-xl end-0 transition-[opacity,transform] animate-in fade-in-0 zoom-in-95 duration-150 ease-out origin-top-right rtl:origin-top-left">
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  {navGroups.map((group) => (
                    <div key={group.title.en}>
                      <p className="label-caps mb-2.5 border-b border-border pb-2 text-bronze">
                        {t(group.title)}
                      </p>
                      <ul className="space-y-1.5">
                        {group.items.map((n) => {
                          const active = isRouteActive(pathname, n.to);
                          return (
                            <li key={n.to}>
                              <Link
                                to={n.to}
                                onClick={() => setMoreOpen(false)}
                                className={cn(
                                  "block py-1 text-[13px] transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.98] rounded-xs px-1",
                                  active
                                    ? "font-bold text-bronze dark:text-gold"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                                )}
                              >
                                {t(n.label)}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <ThemeToggle tone="default" />
          <LanguageSwitcher tone="default" />
          <Link
            to="/contribute"
            className="hidden items-center rounded-md border border-gold/80 bg-gradient-to-r from-gold via-gold/95 to-gold-soft px-4 py-2 text-[13px] font-bold text-ink shadow-sm transition-all duration-200 hover:scale-102 hover:shadow-md sm:inline-flex"
          >
            {lang === "ar" ? "الاشتراك" : "Subscribe"}
          </Link>
          <button
            type="button"
            aria-label={
              open
                ? lang === "ar"
                  ? "إغلاق القائمة"
                  : "Close menu"
                : lang === "ar"
                  ? "فتح القائمة"
                  : "Open menu"
            }
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-md border border-border text-foreground transition-colors hover:bg-secondary lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="max-h-[80vh] overflow-y-auto border-t border-border bg-background text-foreground lg:hidden animate-in slide-in-from-top-2 duration-200">
          <nav className="container-page py-6" aria-label="Mobile">
            {navGroups.map((group) => (
              <div key={group.title.en} className="mb-6 last:mb-0">
                <p className="label-caps mb-2 border-b border-border pb-2 text-bronze">
                  {t(group.title)}
                </p>
                <ul>
                  {group.items.map((n) => {
                    const active = isRouteActive(pathname, n.to);
                    return (
                      <li key={n.to}>
                        <Link
                          to={n.to}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "block border-b border-border/60 py-3 text-sm transition-colors",
                            active
                              ? "font-bold text-bronze dark:text-gold"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {t(n.label)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            <Link
              to="/contribute"
              onClick={() => setOpen(false)}
              className="mt-2 block rounded-md border border-gold bg-gradient-to-r from-gold via-gold/95 to-gold-soft px-4 py-3.5 text-center text-sm font-bold text-ink shadow-sm"
            >
              {lang === "ar" ? "الاشتراك والمساهمة" : "Subscribe & Contribute"}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
