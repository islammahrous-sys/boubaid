import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useLang } from "@/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { CButton } from "./ConsoleUI";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = {
  to: string;
  ar: string;
  en: string;
  glyph: string;
  /** Roles that may see the entry; empty means every signed-in member. */
  roles?: ("admin" | "editor" | "treasurer")[];
  exact?: boolean;
};

type NavGroup = { ar: string; en: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    ar: "نظرة عامة",
    en: "Overview",
    items: [{ to: "/admin", ar: "اللوحة", en: "Dashboard", glyph: "◫", roles: ["admin"], exact: true }],
  },
  {
    ar: "المحتوى",
    en: "Content",
    items: [
      { to: "/content", ar: "منصة المحتوى", en: "Content", glyph: "✎", roles: ["admin", "editor"] },
    ],
  },
  {
    ar: "المالية",
    en: "Finance",
    items: [
      {
        to: "/treasury",
        ar: "سجل الخزينة",
        en: "Treasury",
        glyph: "◊",
        roles: ["admin", "treasurer"],
      },
    ],
  },
  {
    ar: "الأسرة",
    en: "Family",
    items: [
      { to: "/directory", ar: "دليل الأعضاء", en: "Directory", glyph: "❖" },
      { to: "/account", ar: "حسابي", en: "My account", glyph: "◎" },
    ],
  },
];

const RECENT_KEY = "alboabid.console.recent";
const COLLAPSE_KEY = "alboabid.console.collapsed";

function useRecent(pathname: string, titles: Record<string, string>) {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      const next = [pathname, ...list.filter((p) => p !== pathname)].slice(0, 5);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      setRecent(next.filter((p) => p !== pathname && titles[p]));
    } catch {
      setRecent([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return recent;
}

export function ConsoleShell({
  title,
  description,
  breadcrumb,
  actions,
  children,
}: {
  title: string;
  description?: string;
  /** Trailing crumb label; the console root crumb is added automatically. */
  breadcrumb?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { lang } = useLang();
  const label = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const { roles, user, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
      return !c;
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const groups = useMemo(
    () =>
      NAV.map((g) => ({
        ...g,
        items: g.items.filter(
          (i) => !i.roles || i.roles.some((r) => roles.includes(r)) || roles.includes("admin"),
        ),
      })).filter((g) => g.items.length > 0),
    [roles],
  );

  const titles = useMemo(() => {
    const map: Record<string, string> = {};
    for (const g of NAV) for (const i of g.items) map[i.to] = label(i.ar, i.en);
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const recent = useRecent(pathname, titles);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.to : pathname.startsWith(item.to);

  const NavList = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav aria-label={label("أقسام اللوحة", "Console sections")} className="space-y-5">
      {groups.map((group) => (
        <div key={group.en}>
          {!collapsed ? (
            <p className="mb-1.5 px-2.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
              {label(group.ar, group.en)}
            </p>
          ) : null}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(item);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    title={collapsed ? label(item.ar, item.en) : undefined}
                    className={cn(
                      "group flex min-h-10 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                      active
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "text-[14px]",
                        active ? "text-primary dark:text-gold" : "text-muted-foreground",
                      )}
                    >
                      {item.glyph}
                    </span>
                    {!collapsed ? <span className="truncate">{label(item.ar, item.en)}</span> : null}
                    {active && !collapsed ? (
                      <span aria-hidden="true" className="ms-auto h-4 w-0.5 rounded bg-primary dark:bg-gold" />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {recent.length > 0 && !collapsed ? (
        <div>
          <p className="mb-1.5 px-2.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
            {label("زيارات أخيرة", "Recent")}
          </p>
          <ul className="space-y-0.5">
            {recent.map((p) => (
              <li key={p}>
                <Link
                  to={p}
                  onClick={onNavigate}
                  className="flex min-h-9 items-center gap-2 rounded-md px-2.5 text-[12.5px] text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <span aria-hidden="true">↺</span>
                  <span className="truncate">{titles[p]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </nav>
  );

  const initials = (user?.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-dvh bg-muted/30">
      <div className="mx-auto flex w-full max-w-[1500px]">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "sticky top-0 hidden h-dvh shrink-0 flex-col border-e border-border bg-card px-3 py-4 lg:flex",
            collapsed ? "w-[68px]" : "w-[248px]",
          )}
        >
          <div className={cn("mb-5 flex items-center gap-2", collapsed && "justify-center")}>
            {!collapsed ? (
              <Link to="/" className="min-w-0">
                <p className="truncate text-[13px] font-bold text-foreground">
                  {label("مجلس أسرة آل بوعبيد", "Al Bu Obaid Council")}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {label("لوحة الإدارة", "Administration")}
                </p>
              </Link>
            ) : null}
            <CButton
              size="sm"
              variant="subtle"
              onClick={toggleCollapsed}
              aria-label={label(
                collapsed ? "توسيع القائمة" : "تصغير القائمة",
                collapsed ? "Expand sidebar" : "Collapse sidebar",
              )}
              aria-expanded={!collapsed}
              className={cn("min-h-8 min-w-8 px-0", !collapsed && "ms-auto")}
            >
              <span aria-hidden="true">{collapsed ? "»" : "«"}</span>
            </CButton>
          </div>

          <div className="flex-1 overflow-y-auto">
            <NavList />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Top bar */}
          <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
            <div className="flex items-center gap-2 px-4 py-2.5 sm:px-6">
              <Sheet>
                <SheetTrigger asChild>
                  <CButton
                    size="sm"
                    variant="ghost"
                    className="min-h-11 min-w-11 px-0 lg:hidden"
                    aria-label={label("فتح القائمة", "Open navigation")}
                  >
                    <span aria-hidden="true">☰</span>
                  </CButton>
                </SheetTrigger>
                <SheetContent
                  side={lang === "ar" ? "right" : "left"}
                  className="w-[280px] overflow-y-auto p-4"
                >
                  <SheetTitle className="mb-4 text-[13px]">
                    {label("لوحة الإدارة", "Administration")}
                  </SheetTitle>
                  <NavList />
                </SheetContent>
              </Sheet>

              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="flex min-h-9 flex-1 items-center gap-2 rounded-md border border-border bg-background px-3 text-[13px] text-muted-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-sm"
              >
                <span aria-hidden="true">⌕</span>
                <span className="truncate">{label("بحث سريع…", "Quick search…")}</span>
                <kbd className="ms-auto hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] sm:inline">
                  ⌘K
                </kbd>
              </button>

              <div className="ms-auto flex items-center gap-2">
                {actions}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <CButton
                      variant="ghost"
                      className="min-h-9 gap-2 px-2"
                      aria-label={label("حساب المستخدم", "User menu")}
                    >
                      <span
                        aria-hidden="true"
                        className="flex size-6 items-center justify-center rounded-full bg-primary/12 font-mono text-[10px] font-bold text-primary dark:text-gold"
                      >
                        {initials}
                      </span>
                      <span className="hidden max-w-[140px] truncate text-[12.5px] sm:inline">
                        {user?.email}
                      </span>
                    </CButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <span className="block truncate text-[12.5px] font-medium">{user?.email}</span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">
                        {roles.length
                          ? roles.join(" · ")
                          : label("بلا صلاحيات", "No roles yet")}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => void navigate({ to: "/account" })}>
                      {label("حسابي", "My account")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => void navigate({ to: "/" })}>
                      {label("الموقع العام", "Public site")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => void signOut()}>
                      {label("تسجيل الخروج", "Sign out")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="px-4 pb-16 pt-5 sm:px-6">
            <nav aria-label={label("مسار التنقل", "Breadcrumb")} className="mb-3">
              <ol className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted-foreground">
                <li>
                  <Link to="/" className="hover:text-foreground hover:underline">
                    {label("الرئيسية", "Home")}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>{breadcrumb ?? label("الإدارة", "Administration")}</li>
                <li aria-hidden="true">/</li>
                <li className="font-medium text-foreground">{title}</li>
              </ol>
            </nav>

            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-[22px] font-bold leading-tight tracking-tight text-foreground sm:text-[26px]">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                ) : null}
              </div>
            </div>

            {children}
          </main>
        </div>
      </div>

      <CommandDialog
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        title={label("البحث والتنقل", "Search and navigate")}
        description={label(
          "انتقل بين أقسام اللوحة أو نفّذ إجراءً سريعًا.",
          "Jump between console sections or run a quick action.",
        )}
      >
        <CommandInput placeholder={label("اكتب للبحث…", "Type to search…")} />
        <CommandList>
          <CommandEmpty>{label("لا نتائج.", "No results.")}</CommandEmpty>
          {groups.map((group) => (
            <CommandGroup key={group.en} heading={label(group.ar, group.en)}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.to}
                  value={`${item.ar} ${item.en}`}
                  onSelect={() => {
                    setPaletteOpen(false);
                    void navigate({ to: item.to });
                  }}
                >
                  <span aria-hidden="true" className="me-2">
                    {item.glyph}
                  </span>
                  {label(item.ar, item.en)}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
