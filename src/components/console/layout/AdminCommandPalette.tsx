import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { globalAdminSearch } from "@/lib/admin-hub.functions";
import { useDebounce } from "@/hooks/useDebounce";
import { Loader2 } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useLang } from "@/i18n/LanguageProvider";
import {
  Users,
  Layers,
  Newspaper,
  Calendar,
  Building2,
  Plus,
  ArrowRight,
  Globe,
  Rocket,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { ADMIN_DOMAINS } from "./AdminNavigation";

/** `globalAdminSearch` labels its rows with a loose "category" that is not
 *  always an actual console domain id (profiles come back as "directory"). Navigating with those raw values
 *  landed on a domain/tab pair that no branch in the admin route renders --
 *  i.e. a blank page. Resolve every hit against the real navigation tree
 *  instead, so a search result always opens a tab that exists. */
const SEARCH_TAB_ALIASES: Record<string, string> = {
  verification: "users",
};

function resolveSearchTarget(category: string, tab: string): { domainId: string; tabId: string } {
  const tabId = SEARCH_TAB_ALIASES[tab] ?? tab;

  const owningDomain = ADMIN_DOMAINS.find((d) => d.tabs.some((t) => t.id === tabId));
  if (owningDomain) return { domainId: owningDomain.id, tabId };

  const domainByCategory = ADMIN_DOMAINS.find((d) => d.id === category);
  if (domainByCategory && domainByCategory.tabs[0]) {
    return { domainId: domainByCategory.id, tabId: domainByCategory.tabs[0].id };
  }

  return { domainId: "dashboard", tabId: "overview" };
}

export type SearchableItem = {
  id: string;
  title: string;
  subtitle?: string;
  category:
    "family" | "content" | "articles" | "events" | "directory" | "initiatives" | "media" | "users";
  onSelect: () => void;
};

export function AdminCommandPalette({
  open,
  onOpenChange,
  items = [],
  onSelectTab,
  onQuickAction,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items?: SearchableItem[];
  onSelectTab: (domainId: string, tabId: string) => void;
  onQuickAction?: (actionId: string) => void;
}) {
  const { lang, setLang } = useLang();
  const isAr = lang === "ar";

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 250);
  const fetchGlobalSearch = useServerFn(globalAdminSearch);

  const {
    data: searchResults,
    isLoading: searchLoading,
    isFetching: searchFetching,
  } = useQuery({
    queryKey: ["admin-global-search", debouncedSearch],
    queryFn: () => fetchGlobalSearch({ data: { query: debouncedSearch } }),
    enabled: debouncedSearch.length >= 2,
    staleTime: 1000 * 60 * 3,
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "family":
        return <Users className="w-4 h-4 text-emerald-500" />;
      case "content":
        return <Layers className="w-4 h-4 text-blue-500" />;
      case "articles":
        return <Newspaper className="w-4 h-4 text-amber-500" />;
      case "events":
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case "directory":
        return <Building2 className="w-4 h-4 text-indigo-500" />;
      case "initiatives":
        return <Rocket className="w-4 h-4 text-rose-500" />;
      case "users":
        return <UserCheck className="w-4 h-4 text-cyan-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder={
          isAr
            ? "ابحث في السجلات، الأعضاء، المقالات، أو اكتب أمراً..."
            : "Search records, members, articles, or type a command..."
        }
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList className="max-h-[380px]">
        <CommandEmpty>{isAr ? "لا توجد نتائج مطابقة." : "No results found."}</CommandEmpty>

        {/* Dynamic Database Search Results */}
        {searchQuery.length >= 2 && (
          <CommandGroup heading={isAr ? "نتائج البحث" : "Search Results"}>
            {searchLoading ? (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              searchResults.map((item) => (
                <CommandItem
                  key={`${item.category}-${item.id}`}
                  onSelect={() => {
                    const target = resolveSearchTarget(item.category, item.tab);
                    onSelectTab(target.domainId, target.tabId);
                    // Managers that support deep-linking to a single record listen
                    // for this; the tab itself already opened via onSelectTab above.
                    window.dispatchEvent(
                      new CustomEvent("open-admin-drawer", {
                        detail: { type: target.tabId, id: item.id },
                      }),
                    );
                    onOpenChange(false);
                  }}
                >
                  {getCategoryIcon(item.category)}
                  <div className="flex flex-col ms-2">
                    <span className="font-semibold">{item.title}</span>
                    {item.subtitle && (
                      <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                    )}
                  </div>
                </CommandItem>
              ))
            ) : (
              <CommandItem disabled className="text-muted-foreground">
                {isAr ? "لا يوجد نتائج في قاعدة البيانات" : "No database records found"}
              </CommandItem>
            )}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* Quick Actions Group */}
        <CommandGroup heading={isAr ? "إجراءات سريعة" : "Quick Actions"}>
          <CommandItem
            onSelect={() => {
              onSelectTab("family", "members");
              onQuickAction?.("add_member");
              onOpenChange(false);
            }}
          >
            <Plus className="w-4 h-4 me-2 text-primary" />
            <span>{isAr ? "إضافة فرد جديد في شجرة الأسرة" : "Add Family Member"}</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onSelectTab("content", "articles");
              onQuickAction?.("add_article");
              onOpenChange(false);
            }}
          >
            <Plus className="w-4 h-4 me-2 text-amber-500" />
            <span>{isAr ? "نشر مقال أو خبر جديد" : "Create New Article"}</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onSelectTab("content", "events");
              onQuickAction?.("add_event");
              onOpenChange(false);
            }}
          >
            <Plus className="w-4 h-4 me-2 text-purple-500" />
            <span>{isAr ? "جدولة فعالية أو لقاء عائلي" : "Schedule New Event"}</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setLang(isAr ? "en" : "ar");
              onOpenChange(false);
            }}
          >
            <Globe className="w-4 h-4 me-2 text-blue-500" />
            <span>
              {isAr
                ? "التبديل إلى اللغة الإنجليزية (Switch to English)"
                : "التبديل إلى العربية (Switch to Arabic)"}
            </span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* System Navigation Sections — every domain AND every one of its sub-modules
            is individually searchable/navigable here, not just the domain root. */}
        {ADMIN_DOMAINS.map((domain) => {
          const DomainIcon = domain.icon;
          return (
            <CommandGroup key={domain.id} heading={isAr ? domain.label_ar : domain.label_en}>
              {domain.tabs.map((tab) => {
                const TabIcon = tab.icon;
                const isOnlyTab = domain.tabs.length === 1;
                return (
                  <CommandItem
                    key={`${domain.id}-${tab.id}`}
                    onSelect={() => {
                      onSelectTab(domain.id, tab.id);
                      onOpenChange(false);
                    }}
                  >
                    {isOnlyTab ? (
                      <DomainIcon className="w-4 h-4 me-2 text-muted-foreground" />
                    ) : (
                      <TabIcon className="w-4 h-4 me-2 text-muted-foreground" />
                    )}
                    <span>{isAr ? tab.label_ar : tab.label_en}</span>
                    {!isOnlyTab && (
                      <span className="ms-auto text-[10px] text-muted-foreground font-mono">
                        {isAr ? domain.label_ar : domain.label_en}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          );
        })}

        {/* Dynamic Database Items */}
        {items.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={isAr ? "السجلات والبيانات" : "Database Records"}>
              {items.slice(0, 30).map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => {
                    item.onSelect();
                    onOpenChange(false);
                  }}
                >
                  <span className="me-2">{getCategoryIcon(item.category)}</span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{item.title}</span>
                    {item.subtitle && (
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 ms-auto text-muted-foreground rtl:rotate-180" />
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
