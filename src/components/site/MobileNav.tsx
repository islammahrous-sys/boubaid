import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Network, BookOpen, Landmark, Menu } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { navGroups, isRouteActive } from "@/content/navigation";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

/** Four most-used destinations. Icons earn their place here — this is a
 *  thumb-reachable tab bar, not a decorated list. */
const tabs: { to: string; label: BiText; icon: typeof Home }[] = [
  { to: "/", label: { ar: "الرئيسية", en: "Home" }, icon: Home },
  { to: "/family-tree", label: { ar: "المشجرة", en: "Tree" }, icon: Network },
  { to: "/library", label: { ar: "الأرشيف", en: "Archive" }, icon: BookOpen },
  { to: "/foundation", label: { ar: "الحوكمة", en: "Governance" }, icon: Landmark },
];

export function MobileNav() {
  const { t, lang } = useLang();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden">
      <nav className="flex h-16 items-stretch justify-around px-1" aria-label="Quick navigation">
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = isRouteActive(pathname, item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 border-t-2 transition-colors",
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
              className="flex flex-1 flex-col items-center justify-center gap-1 border-t-2 border-transparent text-muted-foreground"
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
              {navGroups.map((group) => (
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
                              className={cn(
                                "block border-b border-border/60 py-2.5 text-sm transition-colors",
                                active ? "font-semibold text-foreground" : "text-muted-foreground",
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
              ))}
            </div>
          </DrawerContent>
        </Drawer>
      </nav>
    </div>
  );
}
