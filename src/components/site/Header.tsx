import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { T } from "@/i18n/translations";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", key: "home" as const },
  { to: "/about", key: "about" as const },
  { to: "/foundation", key: "foundation" as const },
  { to: "/family-tree", key: "tree" as const },
  { to: "/achievers", key: "achievers" as const },
  { to: "/initiatives", key: "initiatives" as const },
  { to: "/news", key: "news" as const },
  { to: "/library", key: "library" as const },
  { to: "/contact", key: "contact" as const },
];

export function Header() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4 md:h-20">
        <Link to="/" className="flex items-center gap-3 text-navy" onClick={() => setOpen(false)}>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-gold">
            <span className={cn("font-bold", lang === "ar" ? "text-lg" : "text-sm tracking-widest")}>
              {lang === "ar" ? "آل" : "AB"}
            </span>
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-lg font-semibold text-navy md:text-xl">{t(T.brand)}</span>
            <span className="truncate text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:text-xs">
              {t(T.brandSub)}
            </span>
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {nav.map((n) => {
            const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "rounded-md px-3 py-2 text-sm text-navy/80 transition-colors hover:bg-secondary hover:text-navy",
                  active && "bg-secondary font-semibold text-navy",
                )}
              >
                {t(T.nav[n.key])}
              </Link>
            );
          })}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            to="/contribute"
            className="hidden rounded-md border border-gold bg-transparent px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-gold hover:text-navy sm:inline-flex"
          >
            {t(T.nav.contribute)}
          </Link>
          <button
            type="button"
            aria-label="menu"
            className="grid h-10 w-10 place-items-center rounded-md border border-border text-navy lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="container-page flex flex-col py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-navy hover:bg-secondary"
              >
                {t(T.nav[n.key])}
              </Link>
            ))}
            <Link
              to="/contribute"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-md border border-gold px-3 py-2 text-center font-semibold text-navy hover:bg-gold"
            >
              {t(T.nav.contribute)}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
