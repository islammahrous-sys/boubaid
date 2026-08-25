import { Link, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { navGroups, isRouteActive } from "@/content/navigation";
import { getPublicNavigation } from "@/lib/cms.functions";
import { PalmGlyph, CompassGlyph, BookGlyph, SealGlyph } from "@/components/site/Glyphs";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

/** Four most-used destinations. Heritage glyphs earn their place here —
 *  a thumb-reachable tab bar with identity, not just generic UI. */
const tabs: { to: string; label: BiText; Icon: React.ComponentType<{ className?: string }> }[] = [
  { to: "/", label: { ar: "الرئيسية", en: "Home" }, Icon: PalmGlyph },
  { to: "/family-tree", label: { ar: "المشجرة", en: "Tree" }, Icon: CompassGlyph },
  { to: "/library", label: { ar: "الأرشيف", en: "Archive" }, Icon: BookGlyph },
  { to: "/foundation", label: { ar: "الحوكمة", en: "Governance" }, Icon: SealGlyph },
];

export function MobileNav() {
  const { t, lang } = useLang();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  /** Live, CMS-managed navigation — falls back to the static navGroups
   *  index when the "header" menu has no public items configured. */
  const { data: liveNav } = useQuery({
    queryKey: ["public_navigation"],
    queryFn: () => getPublicNavigation(),
    staleTime: 5 * 60 * 1000,
  });
  const liveHeaderItems = liveNav?.header ?? [];
  const usingLiveNav = liveHeaderItems.length > 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden">
      <nav className="flex h-16 items-stretch justify-around px-1" aria-label="Quick navigation">
        {tabs.map((item) => {
          const Icon = item.Icon;
          const active = isRouteActive(pathname, item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 border-t-2 transition-[color,border-color,transform] duration-150 ease-out active:scale-[0.96]",
                active
                  ? "border-bronze text-foreground dark:border-gold"
                  : "border-transparent text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className={cn("text-[11px]", active && "font-semibold")}>{t(item.label)}</span>
            </Link>
          );
        })}

        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <button
              type="button"
              className="flex flex-1 flex-col items-center justify-center gap-1 border-t-2 border-transparent text-muted-foreground transition-[color,border-color,transform] duration-150 ease-out active:scale-[0.96]"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
              <span className="text-[11px]">{lang === "ar" ? "المزيد" : "More"}</span>
            </button>
          </DrawerTrigger>

          <DrawerContent className="max-h-[85vh] border-t border-border bg-background">
            <DrawerHeader className="border-b border-border pb-3 text-start">
              <DrawerTitle className="font-naskh text-base font-bold text-foreground">
                {lang === "ar" ? "فهرس الموقع" : "Site Index"}
              </DrawerTitle>
            </DrawerHeader>

            <div className="overflow-y-auto px-4 pt-4 pb-8">
              {usingLiveNav ? (
                <div className="mb-5 last:mb-0">
                  <ul>
                    {liveHeaderItems.map((n) => {
                      const hasChildren = Boolean(n.children && n.children.length > 0);
                      const active = isRouteActive(pathname, n.to);
                      return (
                        <li key={n.to} className="border-b border-border/60 py-2.5">
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
                              <ul className="mt-1 ms-3 space-y-1 border-s-2 border-border/70 ps-3">
                                {n.children!.map((child) => {
                                  const childActive = isRouteActive(pathname, child.to);
                                  return (
                                    <li key={child.to}>
                                      <DrawerClose asChild>
                                        <Link
                                          to={child.to}
                                          onClick={() => setOpen(false)}
                                          className={cn(
                                            "block py-1.5 text-[13px] transition-colors",
                                            childActive
                                              ? "font-semibold text-bronze dark:text-gold"
                                              : "text-muted-foreground",
                                          )}
                                        >
                                          {typeof child.label === "string"
                                            ? child.label
                                            : t(child.label)}
                                        </Link>
                                      </DrawerClose>
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
                                  "block text-sm transition-colors",
                                  active
                                    ? "font-semibold text-foreground"
                                    : "text-muted-foreground",
                                )}
                              >
                                {typeof n.label === "string" ? n.label : t(n.label)}
                              </Link>
                            </DrawerClose>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                navGroups.map((group) => (
                  <div key={group.title.en} className="mb-5 last:mb-0">
                    <p className="label-caps mb-1.5 border-b border-border pb-1.5 text-bronze">
                      {t(group.title)}
                    </p>
                    <ul>
                      {group.items.map((n) => {
                        const active = isRouteActive(pathname, n.to);
                        return (
                          <li key={n.to}>
                            <DrawerClose asChild>
                              <Link
                                to={n.to}
                                onClick={() => setOpen(false)}
                                className={cn(
                                  "block border-b border-border/60 py-2.5 text-sm transition-colors",
                                  active
                                    ? "font-semibold text-foreground"
                                    : "text-muted-foreground",
                                )}
                              >
                                {t(n.label)}
                              </Link>
                            </DrawerClose>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </nav>
    </div>
  );
}
