import { useEffect } from "react";
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
  Landmark,
  Building2,
  Settings,
  Shield,
  Plus,
  ArrowRight,
  Globe,
  ImageIcon,
  Rocket,
  Award,
  Sparkles,
} from "lucide-react";
import { ADMIN_DOMAINS } from "./AdminNavigation";

export type SearchableItem = {
  id: string;
  title: string;
  subtitle?: string;
  category: "family" | "content" | "articles" | "events" | "directory" | "treasury" | "initiatives" | "media";
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
      case "treasury":
        return <Landmark className="w-4 h-4 text-yellow-500" />;
      case "initiatives":
        return <Rocket className="w-4 h-4 text-rose-500" />;
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
      />
      <CommandList className="max-h-[380px]">
        <CommandEmpty>{isAr ? "لا توجد نتائج مطابقة." : "No results found."}</CommandEmpty>

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
            <span>{isAr ? "التبديل إلى اللغة الإنجليزية (Switch to English)" : "التبديل إلى العربية (Switch to Arabic)"}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* System Navigation Sections — every domain AND every one of its sub-modules
            is individually searchable/navigable here, not just the domain root. */}
        {ADMIN_DOMAINS.map((domain) => {
          const DomainIcon = domain.icon;
          return (
            <CommandGroup
              key={domain.id}
              heading={isAr ? domain.label_ar : domain.label_en}
            >
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
                      <span className="text-[11px] text-muted-foreground font-mono">{item.subtitle}</span>
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
