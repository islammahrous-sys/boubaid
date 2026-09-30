import { Link, useRouterState } from "@tanstack/react-router";
import {
  Menu,
  UserRound,
  HeartHandshake,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  BriefcaseBusiness,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { siteMeta } from "@/content/site";
import {
  navGroups,
  isRouteActive,
  navLinkProps,
  withoutRetiredNavigation,
} from "@/content/navigation";
import { getPublicNavigation } from "@/lib/cms.functions";
import { PalmGlyph, CompassGlyph, BookGlyph, SealGlyph } from "@/components/site/Glyphs";
import { SaudiCulturalAvatar } from "@/components/common/SaudiCulturalAvatar";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Matches the desktop's primary information hierarchy. Secondary destinations
 *  such as Archive and Store live in the organised More panel. */
const tabs: { to: string; label: BiText; Icon: React.ComponentType<{ className?: string }> }[] = [
  { to: "/", label: { ar: "الرئيسية", en: "Home" }, Icon: PalmGlyph },
  { to: "/family-tree", label: { ar: "المشجرة", en: "Tree" }, Icon: CompassGlyph },
  { to: "/committees", label: { ar: "اللجان", en: "Committees" }, Icon: SealGlyph },
  { to: "/directory", label: { ar: "الخدمات", en: "Services" }, Icon: BriefcaseBusiness },
];

export function MobileNav() {
  const { t, lang } = useLang();
  const { user, profile } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  /** Live, CMS-managed navigation — falls back to the static navGroups
   *  index when the "header" menu has no public items configured. */
  const { data: liveNav } = useQuery({
    queryKey: ["public_navigation"],
    queryFn: () => getPublicNavigation(),
    staleTime: 5 * 60 * 1000,
  });
  const liveHeaderItems = withoutRetiredNavigation(liveNav?.header ?? []);
  const usingLiveNav = liveHeaderItems.length > 0;

  const ChevronIcon = lang === "ar" ? ChevronLeft : ChevronRight;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <nav className="grid h-16 grid-cols-5 items-stretch px-1" aria-label={t({ ar: "التنقل السريع", en: "Quick navigation" })}>
        {tabs.map((item) => {
          const Icon = item.Icon;
          const active = isRouteActive(pathname, item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-1 border-t-2 px-0.5 transition-[color,border-color,transform] duration-150 ease-out active:scale-[0.96]",
                active
                  ? "border-bronze text-foreground dark:border-gold font-semibold"
                  : "border-transparent text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className={cn("w-full truncate text-center text-[10px] sm:text-[11px]", active && "font-semibold")}>{t(item.label)}</span>
            </Link>
          );
        })}

        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="h-full min-w-0 flex-col gap-1 rounded-none border-t-2 border-transparent px-0.5 text-muted-foreground shadow-none active:scale-[0.96]"
              aria-label={lang === "ar" ? "فتح قائمة المزيد" : "Open more menu"}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
              <span className="w-full truncate text-center text-[10px] sm:text-[11px]">{lang === "ar" ? "المزيد" : "More"}</span>
            </Button>
          </DrawerTrigger>

          <DrawerContent className="max-h-[85vh] border-t border-border bg-background">
            <DrawerHeader className="border-b border-border pb-3 text-start">
              <DrawerTitle className="font-naskh text-lg font-bold text-foreground">
                {lang === "ar" ? "بوابة أسرة آل بوعبيد" : "Al Bu Obaid Portal"}
              </DrawerTitle>
            </DrawerHeader>

            <div className="overflow-y-auto px-4 pt-4 pb-10">
              {/* Quick Actions Strip */}
              <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <DrawerClose asChild>
                  <Link
                    to={user ? "/account" : "/auth"}
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded border border-border bg-card text-center transition-all duration-200 active:scale-95 hover:border-bronze dark:hover:border-gold"
                  >
                    {user ? (
                      <SaudiCulturalAvatar
                        src={profile?.avatar_path}
                        alt={
                          profile?.full_name_ar ||
                          (user?.user_metadata?.full_name_ar as string) ||
                          ""
                        }
                        size="sm"
                        className="w-6 h-6 rounded-full border border-gold/40 shadow-xs"
                      />
                    ) : (
                      <UserRound className="h-5 w-5 text-bronze dark:text-gold" />
                    )}
                    <span className="text-[11px] font-bold text-foreground line-clamp-1">
                      {user
                        ? lang === "ar"
                          ? "حسابي"
                          : "Account"
                        : lang === "ar"
                          ? "دخول"
                          : "Sign in"}
                    </span>
                  </Link>
                </DrawerClose>

                <DrawerClose asChild>
                  <Link
                    to="/contribute"
                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded border border-bronze/40 bg-bronze/10 text-center transition-all duration-200 active:scale-95 hover:bg-bronze/20"
                  >
                    <HeartHandshake className="h-5 w-5 text-bronze dark:text-gold" />
                    <span className="text-[11px] font-bold text-foreground line-clamp-1">
                      {lang === "ar" ? "المساهمة" : "Contribute"}
                    </span>
                  </Link>
                </DrawerClose>

                <DrawerClose asChild>
                  <Link
                    to="/library"
                    onClick={() => setOpen(false)}
                    className="flex flex-col items-center justify-center gap-1.5 rounded border border-border bg-card p-3 text-center transition-all duration-200 active:scale-95 hover:border-bronze dark:hover:border-gold"
                  >
                    <BookGlyph className="h-5 w-5 text-bronze dark:text-gold" />
                    <span className="line-clamp-1 text-[11px] font-bold text-foreground">
                      {lang === "ar" ? "الأرشيف" : "Archive"}
                    </span>
                  </Link>
                </DrawerClose>

                <a
                  href={siteMeta.frameStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1.5 rounded border border-border bg-card p-3 text-center transition-all duration-200 active:scale-95 hover:border-bronze dark:hover:border-gold"
                >
                  <ShoppingBag className="h-5 w-5 text-bronze dark:text-gold" />
                  <span className="line-clamp-1 text-[11px] font-bold text-foreground">
                    {lang === "ar" ? "المتجر" : "Store"}
                  </span>
                </a>
              </div>

              {usingLiveNav ? (
                <div className="mb-5 last:mb-0">
                  <ul className="space-y-1">
                    {liveHeaderItems.map((n) => {
                      const hasChildren = Boolean(n.children && n.children.length > 0);
                      const active = isRouteActive(pathname, n.to);
                      return (
                        <li key={n.to} className="border-b border-border/60 py-2">
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
                              <ul className="mt-1.5 ms-3 space-y-1 border-s-2 border-border/70 ps-3">
                                {n.children!.map((child) => {
                                  const childActive = isRouteActive(pathname, child.to);
                                  return (
                                    <li key={child.id ?? child.to}>
                                      <DrawerClose asChild>
                                        <Link
                                          {...navLinkProps(child.to)}
                                          onClick={() => setOpen(false)}
                                          className={cn(
                                            "flex items-center justify-between py-2 text-[13px] transition-colors rounded px-2 active:bg-secondary",
                                            childActive
                                              ? "font-bold text-bronze bg-bronze/10 dark:text-gold dark:bg-gold/10"
                                              : "text-muted-foreground hover:text-foreground",
                                          )}
                                        >
                                          <span>
                                            {typeof child.label === "string"
                                              ? child.label
                                              : t(child.label)}
                                          </span>
                                          <ChevronIcon className="h-3.5 w-3.5 opacity-50" />
                                        </Link>
                                      </DrawerClose>
                                      {child.children && child.children.length > 0 ? (
                                        <ul className="mt-1 space-y-1">
                                          {child.children.map((sub) => (
                                            <li key={sub.id ?? sub.to}>
                                              <DrawerClose asChild>
                                                <Link
                                                  {...navLinkProps(sub.to)}
                                                  onClick={() => setOpen(false)}
                                                  className="block py-1.5 px-2 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground"
                                                >
                                                  {typeof sub.label === "string"
                                                    ? sub.label
                                                    : t(sub.label)}
                                                </Link>
                                              </DrawerClose>
                                            </li>
                                          ))}
                                        </ul>
                                      ) : null}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ) : (
                            <DrawerClose asChild>
                              <Link
                                to={n.to}
                                onClick={() => setOpen(false)}
                                className={cn(
                                  "flex items-center justify-between py-2 px-2 rounded text-sm transition-colors active:bg-secondary",
                                  active
                                    ? "font-bold text-bronze bg-bronze/10 dark:text-gold dark:bg-gold/10"
                                    : "text-foreground hover:text-bronze dark:hover:text-gold",
                                )}
                              >
                                <span>{typeof n.label === "string" ? n.label : t(n.label)}</span>
                                <ChevronIcon className="h-4 w-4 opacity-50" />
                              </Link>
                            </DrawerClose>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <div className="space-y-6">
                  {navGroups.map((group) => (
                    <div
                      key={group.title.en}
                      className="border border-border/70 bg-card/50 rounded-lg p-3.5"
                    >
                      <p className="label-caps mb-2 border-b border-border/60 pb-1.5 text-bronze dark:text-gold text-xs font-bold">
                        {t(group.title)}
                      </p>
                      <ul className="space-y-0.5">
                        {group.items.map((n) => {
                          const active = isRouteActive(pathname, n.to);
                          return (
                            <li key={n.to}>
                              <DrawerClose asChild>
                                <Link
                                  to={n.to}
                                  onClick={() => setOpen(false)}
                                  className={cn(
                                    "flex items-center justify-between py-2 px-2.5 rounded text-[13px] transition-colors active:scale-[0.98]",
                                    active
                                      ? "font-bold text-bronze bg-bronze/10 dark:text-gold dark:bg-gold/10"
                                      : "text-foreground hover:bg-secondary/70",
                                  )}
                                >
                                  <span>{t(n.label)}</span>
                                  <ChevronIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                </Link>
                              </DrawerClose>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </nav>
    </div>
  );
}
