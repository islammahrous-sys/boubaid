import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, ChevronDown, UserRound, Search, ShoppingBag } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { siteMeta } from "@/content/site";
import {
  primaryNav,
  secondaryNav,
  navGroups,
  isRouteActive,
  isNavItemActive,
  type NavItem,
} from "@/content/navigation";
import { getPublicNavigation, getPublicSiteSettings } from "@/lib/cms.functions";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { SaudiCulturalAvatar } from "@/components/common/SaudiCulturalAvatar";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { cn } from "@/lib/utils";

/** Top-bar links shown inline before the rest fold into "More". Kept to four so
 *  the English labels ("Lineage & History", "Services"…) plus the right-hand
 *  action cluster still fit within the container at the `xl` breakpoint. */
const HEADER_PRIMARY_COUNT = 5;

export function Header() {
  const { t, lang } = useLang();
  const { user, roles, profile } = useAuth();
  const canReviewTreasury = roles.includes("admin") || roles.includes("treasurer");

  /** Dynamic site settings from Supabase (for Salla store URL override, etc.) */
  const { data: dynamicSettings = {} } = useQuery({
    queryKey: ["public_site_settings"],
    queryFn: () => getPublicSiteSettings(),
    staleTime: 5 * 60 * 1000,
  });
  const storeUrl = dynamicSettings.salla_url || siteMeta.sallaStoreUrl;

  /** Live, CMS-managed navigation (Navigation Manager in the admin console).
   *  Falls back to the static `@/content/navigation` lists whenever the
   *  "header" menu has no public items configured. */
  const { data: liveNav } = useQuery({
    queryKey: ["public_navigation"],
    queryFn: () => getPublicNavigation(),
    staleTime: 5 * 60 * 1000,
  });
  const liveHeaderItems = liveNav?.header ?? [];
  const usingLiveNav = liveHeaderItems.length > 0;
  const navPrimary = usingLiveNav
    ? liveHeaderItems.slice(0, HEADER_PRIMARY_COUNT)
    : primaryNav.slice(0, HEADER_PRIMARY_COUNT);
  const navSecondaryFlat = usingLiveNav ? liveHeaderItems.slice(HEADER_PRIMARY_COUNT) : null;
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const primaryDropdownRef = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moreTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDropdownEnter = (to: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setOpenDropdown(to);
  };

  const handleDropdownLeave = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 180);
  };

  const handleMoreEnter = () => {
    if (moreTimeoutRef.current) clearTimeout(moreTimeoutRef.current);
    setMoreOpen(true);
  };

  const handleMoreLeave = () => {
    if (moreTimeoutRef.current) clearTimeout(moreTimeoutRef.current);
    moreTimeoutRef.current = setTimeout(() => {
      setMoreOpen(false);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
      if (moreTimeoutRef.current) clearTimeout(moreTimeoutRef.current);
    };
  }, []);

  /** Masthead condenses once the page has moved */
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    let lastCondensed = window.scrollY > 40;
    const onScroll = () => {
      const nextCondensed = window.scrollY > 40;
      if (nextCondensed !== lastCondensed) {
        lastCondensed = nextCondensed;
        setCondensed(nextCondensed);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
      if (
        primaryDropdownRef.current &&
        !(event.target as HTMLElement)?.closest?.("[data-primary-dropdown]")
      ) {
        setOpenDropdown(null);
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
        setOpenDropdown(null);
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
    setOpenDropdown(null);
  }, [pathname]);

  const isSecondaryActive = navSecondaryFlat
    ? navSecondaryFlat.some((n) => isRouteActive(pathname, n.to))
    : secondaryNav.some((n) => isRouteActive(pathname, n.to));

  return (
    <header
      data-condensed={condensed ? "true" : "false"}
      className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md text-foreground shadow-xs transition-shadow duration-500 data-[condensed=true]:shadow-sm"
    >
      {/* Registration line. Stated plainly as public record — and folded away
          once the reader has committed to the page. */}
      <div
        className={cn(
          "overflow-hidden border-b border-border/50 bg-secondary/60 text-foreground transition-[max-height,opacity] duration-500 ease-out",
          condensed ? "max-h-0 opacity-0" : "max-h-12 opacity-100",
        )}
      >
        <div className="container-header flex items-center justify-center gap-2 sm:gap-2.5 py-1.5 text-center text-xs min-w-0">
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-2.5 sm:px-3 py-0.5 text-[10px] sm:text-[11px] font-medium text-amber-900 dark:text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" aria-hidden="true" />
            {lang === "ar" ? "كيان أهلي مرخص" : "Licensed Nonprofit"}
          </span>
          <span className="h-3.5 w-px bg-border shrink-0" aria-hidden="true" />
          <span className="truncate text-[10px] sm:text-[11px] text-muted-foreground min-w-0">
            {t(siteMeta.ncnpAuthority)}
          </span>
          <span className="nums font-mono text-[10px] sm:text-[11px] font-bold text-bronze dark:text-gold shrink-0">
            {siteMeta.ncnpLicense}
          </span>
        </div>
      </div>

      <div
        className={cn(
          "container-header flex items-center justify-between gap-2 sm:gap-3 md:gap-4 xl:gap-5 2xl:gap-8 py-1.5 sm:py-2 transition-[height] duration-500 ease-out",
          condensed ? "h-14 sm:h-16 md:h-18" : "h-16 sm:h-20 md:h-24 lg:h-28",
        )}
      >
        <Link
          to="/"
          className="group active-scale flex shrink-0 items-center gap-2 sm:gap-3.5 md:gap-4 max-w-[62%] sm:max-w-none"
          onClick={() => setOpen(false)}
        >
          <img
            src="/logo-mark-brown.svg"
            alt=""
            className={cn(
              "shrink-0 object-contain transition-[height,width,transform] duration-500 ease-out group-hover:scale-105 dark:hidden",
              condensed
                ? "h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12"
                : "h-9 w-9 sm:h-12 sm:w-12 md:h-16 md:w-16 lg:h-20 lg:w-20",
            )}
            aria-hidden="true"
          />
          <img
            src="/logo-mark-gold.svg"
            alt=""
            className={cn(
              "hidden shrink-0 object-contain transition-[height,width,transform] duration-500 ease-out group-hover:scale-105 dark:block",
              condensed
                ? "h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12"
                : "h-9 w-9 sm:h-12 sm:w-12 md:h-16 md:w-16 lg:h-20 lg:w-20",
            )}
            aria-hidden="true"
          />
          <span className="flex min-w-0 flex-col leading-tight">
            <span
              className={cn(
                "truncate font-brand font-bold text-foreground transition-[color,font-size] duration-500 group-hover:text-bronze dark:group-hover:text-gold",
                condensed
                  ? "text-sm sm:text-base rtl:text-[15px] sm:rtl:text-lg md:text-xl"
                  : "text-base sm:text-lg rtl:text-base sm:rtl:text-xl md:text-xl 2xl:text-2xl",
              )}
            >
              {lang === "ar" ? "مجلس أسرة آل بوعبيد" : "Al Bu Obaid Family Council"}
            </span>
          </span>
        </Link>

        <nav
          className="relative hidden items-center justify-center gap-1.5 2xl:flex flex-1 mx-4 min-w-0"
          aria-label="Primary"
        >
          {navPrimary.map((n) => {
            const hasChildren = Boolean(n.children && n.children.length > 0);
            const isItemActive = isNavItemActive(pathname, n);
            const isDropdownOpen = openDropdown === n.to;

            if (hasChildren) {
              return (
                <div
                  key={n.to}
                  className="relative"
                  ref={primaryDropdownRef}
                  data-primary-dropdown="true"
                  onMouseEnter={() => handleDropdownEnter(n.to)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setOpenDropdown(isDropdownOpen ? null : n.to)}
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                    data-nav-active={isItemActive ? "true" : undefined}
                    className={cn(
                      "active-scale flex items-center gap-1 rounded-md px-2 2xl:px-3 py-1.5 text-[12.5px] 2xl:text-[13.5px] font-medium whitespace-nowrap transition-[color,background-color] duration-200 ease-out cursor-pointer",
                      isItemActive
                        ? "bg-bronze/10 font-bold text-bronze dark:bg-gold/15 dark:text-gold"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {typeof n.label === "string" ? n.label : t(n.label)}
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-300",
                        isDropdownOpen && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  </button>

                  {isDropdownOpen && (
                    <div
                      className="absolute top-full start-0 pt-1.5 z-50 before:absolute before:-top-3 before:inset-x-0 before:h-3 before:content-['']"
                      onMouseEnter={() => handleDropdownEnter(n.to)}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <div className="min-w-[15rem] origin-top-start border border-border bg-popover p-2 shadow-lg transition-[opacity,transform] duration-150 ease-out animate-in fade-in-0 zoom-in-95 rounded-md">
                        <ul className="space-y-1">
                          {n.children!.map((child) => {
                            const childActive = isRouteActive(pathname, child.to);
                            return (
                              <li key={child.to}>
                                <Link
                                  to={child.to}
                                  onClick={() => setOpenDropdown(null)}
                                  className={cn(
                                    "block rounded-md px-3 py-2 text-[13px] transition-colors",
                                    childActive
                                      ? "bg-bronze/10 font-bold text-bronze dark:bg-gold/15 dark:text-gold"
                                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                                  )}
                                >
                                  {typeof child.label === "string" ? child.label : t(child.label)}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={n.to}
                to={n.to}
                data-nav-active={isItemActive ? "true" : undefined}
                aria-current={isItemActive ? "page" : undefined}
                className={cn(
                  "nav-link active-scale rounded-md px-2 2xl:px-3 py-1.5 text-[12.5px] 2xl:text-[13.5px] font-medium whitespace-nowrap transition-[color,background-color] duration-200 ease-out",
                  isItemActive
                    ? "bg-bronze/10 font-bold text-bronze dark:bg-gold/15 dark:text-gold"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {typeof n.label === "string" ? n.label : t(n.label)}
              </Link>
            );
          })}

          <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={handleMoreEnter}
            onMouseLeave={handleMoreLeave}
          >
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setMoreOpen(!moreOpen)}
              aria-expanded={moreOpen}
              aria-haspopup="true"
              data-nav-active={isSecondaryActive ? "true" : undefined}
              className={cn(
                "active-scale flex items-center gap-1 rounded-md px-2 2xl:px-3 py-1.5 text-[12.5px] 2xl:text-[13.5px] font-medium whitespace-nowrap transition-[color,background-color] duration-200 ease-out cursor-pointer",
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
              <div
                className="absolute top-full end-0 pt-2 z-50 before:absolute before:-top-3 before:inset-x-0 before:h-3 before:content-['']"
                onMouseEnter={handleMoreEnter}
                onMouseLeave={handleMoreLeave}
              >
                <div className="w-[30rem] origin-top-right border border-border bg-popover p-6 shadow-lg transition-[opacity,transform] duration-150 ease-out animate-in fade-in-0 zoom-in-95 rtl:origin-top-left rounded-md">
                  {navSecondaryFlat ? (
                    <ul className="grid grid-cols-2 gap-x-8 gap-y-1.5">
                      {navSecondaryFlat.map((n) => {
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
                              {typeof n.label === "string" ? n.label : t(n.label)}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
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
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5 2xl:gap-2">
          {/* Quick Search Button (Wide Desktop Only) */}
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setSearchOpen(true)}
            className="hidden 2xl:inline-flex items-center gap-1.5 border border-border/60 bg-secondary/40 h-8 sm:h-9 px-2.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer rounded-md shrink-0"
            aria-label={lang === "ar" ? "بحث في المنظومة (Ctrl+K)" : "Search portal (Ctrl+K)"}
            title="Ctrl + K"
          >
            <Search className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="hidden 2xl:inline">{lang === "ar" ? "بحث..." : "Search..."}</span>
            <kbd className="hidden 2xl:inline ms-1 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
              ⌘K
            </kbd>
          </button>

          {/* Search Icon Button (Mobile, Tablet & Compact Desktop) */}
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setSearchOpen(true)}
            className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center border border-border text-foreground transition-colors hover:bg-secondary 2xl:hidden cursor-pointer rounded-md shrink-0"
            aria-label={lang === "ar" ? "بحث" : "Search"}
          >
            <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>

          {/* E-Commerce Store Icon Button */}
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center border border-gold/40 bg-gold/10 text-amber-900 transition-all duration-200 hover:scale-105 hover:bg-gold hover:text-ink dark:border-gold/30 dark:bg-gold/15 dark:text-gold dark:hover:bg-gold dark:hover:text-ink cursor-pointer rounded-md shrink-0"
            aria-label={lang === "ar" ? "المتجر الإلكتروني" : "E-Commerce Store"}
            title={lang === "ar" ? "المتجر الإلكتروني (سلة)" : "Online Store (Salla)"}
          >
            <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="sr-only">
              {lang === "ar" ? "المتجر الإلكتروني" : "E-Commerce Store"}
            </span>
          </a>

          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <ThemeToggle tone="default" />
            <LanguageSwitcher tone="default" />
            {user && <NotificationBell />}
          </div>

          {canReviewTreasury ? (
            <Link
              to="/treasury"
              className="hidden items-center gap-1.5 border border-border h-8 sm:h-9 px-2.5 2xl:px-3 text-[12px] 2xl:text-[13px] font-medium text-foreground transition-colors hover:bg-secondary rounded-md 2xl:inline-flex whitespace-nowrap shrink-0"
            >
              {lang === "ar" ? "الخزينة" : "Treasury"}
            </Link>
          ) : null}

          <Link
            to={user ? "/account" : "/auth"}
            className="hidden items-center gap-2 border border-border h-9 px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary rounded-md 2xl:inline-flex whitespace-nowrap shrink-0"
          >
            {user ? (
              <SaudiCulturalAvatar
                src={profile?.avatar_path}
                alt={profile?.full_name_ar || (user?.user_metadata?.full_name_ar as string) || ""}
                size="sm"
                className="w-5 h-5 rounded-full border border-gold/40 shadow-xs"
              />
            ) : (
              <UserRound className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            )}
            <span>
              {user
                ? lang === "ar"
                  ? "حسابي"
                  : "My account"
                : lang === "ar"
                  ? "دخول الأعضاء"
                  : "Member sign-in"}
            </span>
          </Link>

          <Link
            to="/contribute"
            className="hidden items-center border border-gold bg-gold h-9 px-4 text-[13px] font-bold text-ink transition-colors hover:bg-transparent hover:text-gold rounded-md 2xl:inline-flex whitespace-nowrap shrink-0"
          >
            {lang === "ar" ? "الاشتراك" : "Subscribe"}
          </Link>

          {/* Tablet Hamburger Menu Button (Mobile phones use bottom bar) */}
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
            className="hidden md:grid 2xl:hidden h-8 w-8 sm:h-9 sm:w-9 place-items-center border border-border text-foreground transition-colors hover:bg-secondary cursor-pointer rounded-md shrink-0"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="max-h-[80vh] overflow-y-auto border-t border-border bg-background text-foreground 2xl:hidden animate-in slide-in-from-top-2 duration-200">
          <nav className="container-page py-6" aria-label="Mobile">
            {/* Mobile E-Commerce Store Banner Link */}
            <div className="mb-5">
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between border border-gold/40 bg-gold/10 px-4 py-3 text-xs font-bold text-amber-900 transition-colors hover:bg-gold hover:text-ink dark:border-gold/30 dark:bg-gold/15 dark:text-gold dark:hover:bg-gold dark:hover:text-ink"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-bronze dark:text-gold" />
                  {lang === "ar" ? "المتجر الإلكتروني (سلة)" : "E-Commerce Store (Salla)"}
                </span>
                <span className="text-[11px] font-semibold opacity-90">
                  {lang === "ar" ? "تسوق الآن ↗" : "Shop Now ↗"}
                </span>
              </a>
            </div>

            {usingLiveNav ? (
              <div className="menu-in mb-6 last:mb-0">
                <ul>
                  {liveHeaderItems.map((n, ii) => {
                    const hasChildren = Boolean(n.children && n.children.length > 0);
                    const active = isNavItemActive(pathname, n);
                    return (
                      <li
                        key={n.to}
                        className="menu-in border-b border-border/60 py-2.5"
                        style={{ ["--menu-i" as string]: ii + 1 }}
                      >
                        {hasChildren ? (
                          <div>
                            <span
                              className={cn(
                                "block py-1 text-sm font-bold",
                                active ? "text-bronze dark:text-gold" : "text-foreground",
                              )}
                            >
                              {typeof n.label === "string" ? n.label : t(n.label)}
                            </span>
                            <ul className="mt-1.5 ms-3 space-y-1.5 border-s-2 border-border/70 ps-3">
                              {n.children!.map((child) => {
                                const childActive = isRouteActive(pathname, child.to);
                                return (
                                  <li key={child.to}>
                                    <Link
                                      to={child.to}
                                      onClick={() => setOpen(false)}
                                      className={cn(
                                        "active-scale block py-1 text-[13px] transition-colors",
                                        childActive
                                          ? "font-bold text-bronze dark:text-gold"
                                          : "text-muted-foreground hover:text-foreground",
                                      )}
                                    >
                                      {typeof child.label === "string"
                                        ? child.label
                                        : t(child.label)}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ) : (
                          <Link
                            to={n.to}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "active-scale block text-sm transition-colors",
                              active
                                ? "font-bold text-bronze dark:text-gold"
                                : "text-muted-foreground hover:text-foreground",
                            )}
                          >
                            {typeof n.label === "string" ? n.label : t(n.label)}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <>
                {/* Primary Quick Links */}
                <div className="mb-6 border-b border-border/60 pb-4">
                  <p className="label-caps mb-2 text-bronze">
                    {lang === "ar" ? "الروابط الرئيسية" : "Main Navigation"}
                  </p>
                  <ul className="space-y-1">
                    {primaryNav.map((n, ii) => {
                      const hasChildren = Boolean(n.children && n.children.length > 0);
                      const active = isNavItemActive(pathname, n);
                      return (
                        <li
                          key={n.to}
                          className="menu-in"
                          style={{ ["--menu-i" as string]: ii + 1 }}
                        >
                          {hasChildren ? (
                            <div className="py-1.5">
                              <span
                                className={cn(
                                  "block text-sm font-bold",
                                  active ? "text-bronze dark:text-gold" : "text-foreground",
                                )}
                              >
                                {t(n.label)}
                              </span>
                              <ul className="mt-1.5 ms-3 space-y-1.5 border-s-2 border-border/70 ps-3">
                                {n.children!.map((child) => {
                                  const childActive = isRouteActive(pathname, child.to);
                                  return (
                                    <li key={child.to}>
                                      <Link
                                        to={child.to}
                                        onClick={() => setOpen(false)}
                                        className={cn(
                                          "active-scale block py-1 text-[13px] transition-colors",
                                          childActive
                                            ? "font-bold text-bronze dark:text-gold"
                                            : "text-muted-foreground hover:text-foreground",
                                        )}
                                      >
                                        {t(child.label)}
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ) : (
                            <Link
                              to={n.to}
                              onClick={() => setOpen(false)}
                              className={cn(
                                "active-scale block py-1.5 text-sm transition-colors",
                                active
                                  ? "font-bold text-bronze dark:text-gold"
                                  : "text-muted-foreground hover:text-foreground",
                              )}
                            >
                              {t(n.label)}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Secondary Groups */}
                {navGroups.map((group, gi) => (
                  <div
                    key={group.title.en}
                    className="menu-in mb-6 last:mb-0"
                    style={{ ["--menu-i" as string]: gi * 3 + primaryNav.length + 1 }}
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
                            style={{ ["--menu-i" as string]: gi * 3 + ii + primaryNav.length + 2 }}
                          >
                            <Link
                              to={n.to}
                              onClick={() => setOpen(false)}
                              className={cn(
                                "active-scale block border-b border-border/60 py-2.5 text-sm transition-colors",
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
              </>
            )}

            <Link
              to="/contribute"
              onClick={() => setOpen(false)}
              className="menu-in active-scale mt-4 block border border-gold bg-gold px-4 py-3.5 text-center text-sm font-bold text-ink transition-colors hover:bg-transparent hover:text-bronze dark:hover:text-gold"
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
