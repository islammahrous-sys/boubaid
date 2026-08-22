import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, ChevronDown, UserRound, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { siteMeta } from "@/content/site";
import { primaryNav, secondaryNav, navGroups, isRouteActive } from "@/content/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { cn } from "@/lib/utils";

export function Header() {
  const { t, lang } = useLang();
  const { user, roles } = useAuth();
  const canReviewTreasury = roles.includes("admin") || roles.includes("treasurer");
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  /** Masthead condenses once the page has moved — the wordmark stays present
   *  but stops taking the whole first screen. */
  const [condensed, setCondensed] = useState(false);

  /** Travelling underline. Measured from the active nav item so the rule
   *  slides between destinations instead of jumping. */
  const navRef = useRef<HTMLElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const measure = () => {
      const nav = navRef.current;
      if (!nav) return;
      const el = nav.querySelector<HTMLElement>("[data-nav-active='true']");
      if (!el) {
        setIndicator(null);
        return;
      }
      const navBox = nav.getBoundingClientRect();
      const box = el.getBoundingClientRect();
      setIndicator({ left: box.left - navBox.left, width: box.width });
    };
    // Wait for fonts/layout to settle before measuring.
    const raf = requestAnimationFrame(() => requestAnimationFrame(measure));
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [pathname, lang, condensed]);

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
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setMoreOpen(false);
        setOpen(false);
        setSearchOpen(false);
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
    <header
      data-condensed={condensed ? "true" : "false"}
      className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md text-foreground shadow-xs transition-shadow duration-500 data-[condensed=true]:shadow-sm"
    >
      {/* Registration line. Stated plainly as public record — and folded away
          once the reader has committed to the page. */}
      <div
        className={cn(
          "overflow-hidden border-b border-border/50 bg-secondary/60 text-foreground transition-[max-height,opacity] duration-500 ease-out",
          condensed ? "max-h-0 opacity-0" : "max-h-12 opacity-100",
        )}
      >
        <div className="container-page flex items-center justify-center gap-2.5 py-1.5 text-center text-xs">
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

      <div
        className={cn(
          "container-page flex items-center justify-between gap-4 py-2 transition-[height] duration-500 ease-out",
          condensed ? "h-16 md:h-18" : "h-24 md:h-28",
        )}
      >
        <Link
          to="/"
          className="group active-scale flex shrink-0 items-center gap-4"
          onClick={() => setOpen(false)}
        >
          <img
            src="/logo-mark-brown.svg"
            alt=""
            className={cn(
              "shrink-0 object-contain transition-[height,width,transform] duration-500 ease-out group-hover:scale-105 dark:hidden",
              condensed ? "h-11 w-11 md:h-12 md:w-12" : "h-16 w-16 md:h-20 md:w-20",
            )}
            aria-hidden="true"
          />
          <img
            src="/logo-mark-gold.svg"
            alt=""
            className={cn(
              "hidden shrink-0 object-contain transition-[height,width,transform] duration-500 ease-out group-hover:scale-105 dark:block",
              condensed ? "h-11 w-11 md:h-12 md:w-12" : "h-16 w-16 md:h-20 md:w-20",
            )}
            aria-hidden="true"
          />
          <span className="flex min-w-0 flex-col leading-tight">
            <span
              className={cn(
                "truncate font-brand font-bold text-foreground transition-[color,font-size] duration-500 group-hover:text-bronze dark:group-hover:text-gold",
                condensed ? "text-lg rtl:text-xl md:text-xl" : "text-xl rtl:text-2xl md:text-2xl",
              )}
            >
              {lang === "ar" ? "مجلس أسرة آل بوعبيد" : "Al Bu Obaid Family Council"}
            </span>
            <span
              className={cn(
                "label-caps truncate text-bronze transition-[max-height,opacity] duration-500 dark:text-gold-soft",
                condensed
                  ? "max-h-0 opacity-0"
                  : "max-h-6 text-xs opacity-100 md:text-sm",
              )}
            >
              {lang === "ar" ? "صندوق التنمية العائلية" : "Family Development Org."}
            </span>
          </span>
        </Link>

        <nav ref={navRef} className="relative hidden items-center gap-1 lg:flex" aria-label="Primary">
          {/* One rule that travels, rather than a rule per item. */}
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-bronze transition-[transform,width,opacity] duration-500 dark:bg-gold",
              indicator ? "opacity-100" : "opacity-0",
            )}
            style={{
              width: indicator ? `${indicator.width - 14}px` : 0,
              transform: `translateX(${indicator ? indicator.left + 7 : 0}px)`,
              transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
          {primaryNav.map((n) => {
            const active = isRouteActive(pathname, n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                data-nav-active={active ? "true" : undefined}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "nav-link active-scale rounded-md px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition-[color,background-color] duration-200 ease-out",
                  active
                    ? "bg-bronze/10 font-bold text-bronze dark:bg-gold/15 dark:text-gold"
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
              suppressHydrationWarning
              onClick={() => setMoreOpen(!moreOpen)}
              aria-expanded={moreOpen}
              aria-haspopup="true"
              data-nav-active={isSecondaryActive ? "true" : undefined}
              className={cn(
                "active-scale flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition-[color,background-color] duration-200 ease-out",
                isSecondaryActive
                  ? "bg-bronze/10 font-bold text-bronze dark:bg-gold/15 dark:text-gold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {lang === "ar" ? "المزيد" : "More"}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-300",
                  moreOpen && "rotate-180",
                )}
                aria-hidden="true"
              />
            </button>


            {moreOpen ? (
              <div className="absolute top-full end-0 mt-2 w-[30rem] origin-top-right border border-border bg-popover p-6 transition-[opacity,transform] duration-150 ease-out animate-in fade-in-0 zoom-in-95 rtl:origin-top-left">
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
                                  "block py-1 text-[13px] transition-colors",
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
                </div>
              </div>
            ) : null}
          </div>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {/* Quick Search Button (Desktop) */}
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setSearchOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 border border-border/60 bg-secondary/40 px-2.5 py-1 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            aria-label={lang === "ar" ? "بحث في المنظومة (Ctrl+K)" : "Search portal (Ctrl+K)"}
            title="Ctrl + K"
          >
            <Search className="w-3.5 h-3.5 text-primary" />
            <span>{lang === "ar" ? "بحث..." : "Search..."}</span>
            <kbd className="ms-1 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
              ⌘K
            </kbd>
          </button>

          {/* Search Button (Mobile) */}
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setSearchOpen(true)}
            className="grid h-9 w-9 place-items-center border border-border text-foreground transition-colors hover:bg-secondary sm:hidden cursor-pointer"
            aria-label={lang === "ar" ? "بحث" : "Search"}
          >
            <Search className="h-4 w-4" />
          </button>

          <div className="hidden items-center gap-1 border border-border/60 bg-secondary/40 px-1 py-1 sm:inline-flex">
            <ThemeToggle tone="default" />
            <span className="h-4 w-px bg-border" aria-hidden="true" />
            <LanguageSwitcher tone="default" />
          </div>
          <div className="flex items-center gap-1 sm:hidden">
            <ThemeToggle tone="default" />
            <LanguageSwitcher tone="default" />
          </div>
          {canReviewTreasury ? (
            <Link
              to="/treasury"
              className="hidden items-center gap-1.5 border border-border px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary md:inline-flex"
            >
              {lang === "ar" ? "الخزينة" : "Treasury"}
            </Link>
          ) : null}
          <Link
            to={user ? "/account" : "/auth"}
            className="hidden items-center gap-1.5 border border-border px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary md:inline-flex"
          >
            <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
            {user
              ? lang === "ar"
                ? "حسابي"
                : "My account"
              : lang === "ar"
                ? "دخول الأعضاء"
                : "Member sign-in"}
          </Link>
          <Link
            to="/contribute"
            className="hidden items-center border border-gold bg-gold px-4 py-2 text-[13px] font-bold text-ink transition-colors hover:bg-transparent hover:text-gold sm:inline-flex"
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
            className="grid h-9 w-9 place-items-center border border-border text-foreground transition-colors hover:bg-secondary lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="max-h-[80vh] overflow-y-auto border-t border-border bg-background text-foreground lg:hidden animate-in slide-in-from-top-2 duration-200">
          <nav className="container-page py-6" aria-label="Mobile">
            {navGroups.map((group, gi) => (
              <div
                key={group.title.en}
                className="menu-in mb-6 last:mb-0"
                style={{ ["--menu-i" as string]: gi * 3 }}
              >
                <p className="label-caps mb-2 border-b border-border pb-2 text-bronze">
                  {t(group.title)}
                </p>
                <ul>
                  {group.items.map((n, ii) => {
                    const active = isRouteActive(pathname, n.to);
                    return (
                      <li
                        key={n.to}
                        className="menu-in"
                        style={{ ["--menu-i" as string]: gi * 3 + ii + 1 }}
                      >
                        <Link
                          to={n.to}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "active-scale block border-b border-border/60 py-3 text-sm transition-colors",
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
              className="menu-in active-scale mt-2 block border border-gold bg-gold px-4 py-3.5 text-center text-sm font-bold text-ink transition-colors hover:bg-transparent hover:text-bronze dark:hover:text-gold"
              style={{ ["--menu-i" as string]: navGroups.length * 3 + 1 }}
            >
              {lang === "ar" ? "الاشتراك والمساهمة" : "Subscribe & Contribute"}
            </Link>
          </nav>
        </div>
      ) : null}

      <GlobalSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
