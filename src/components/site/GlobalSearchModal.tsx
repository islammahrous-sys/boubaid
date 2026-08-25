import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageProvider";
import { getPublicGlobalSearch } from "@/lib/cms.functions";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  User,
  Newspaper,
  Sparkles,
  Award,
  BookOpen,
  GitBranch,
  Search,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { SaudiCulturalAvatar } from "@/components/common/SaudiCulturalAvatar";

export function GlobalSearchModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    members: any[];
    articles: any[];
    initiatives: any[];
    achievers: any[];
    library: any[];
    branches: any[];
  }>({
    members: [],
    articles: [],
    initiatives: [],
    achievers: [],
    library: [],
    branches: [],
  });

  useEffect(() => {
    if (!query.trim()) {
      setResults({
        members: [],
        articles: [],
        initiatives: [],
        achievers: [],
        library: [],
        branches: [],
      });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getPublicGlobalSearch({ data: query.trim() });
        setResults(data);
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (url: string) => {
    onOpenChange(false);
    navigate({ to: url });
  };

  const hasAnyResults =
    results.members.length > 0 ||
    results.articles.length > 0 ||
    results.initiatives.length > 0 ||
    results.achievers.length > 0 ||
    results.library.length > 0 ||
    results.branches.length > 0;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder={
          isAr
            ? "ابحث عن فرد من العائلة، مقال، مبادرة، وثيقة، أو فرع..."
            : "Search family members, news, initiatives, documents..."
        }
        value={query}
        onValueChange={setQuery}
      />

      <CommandList className="max-h-[380px] p-2">
        {loading && (
          <div className="flex items-center justify-center py-6 text-muted-foreground text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>{isAr ? "جاري البحث..." : "Searching..."}</span>
          </div>
        )}

        {!loading && query.trim() !== "" && !hasAnyResults && (
          <CommandEmpty className="py-8 text-center text-xs text-muted-foreground">
            {isAr ? "لم نجد نتائج مطابقة لبحثك." : "No results found."}
          </CommandEmpty>
        )}

        {/* 1. Family Members */}
        {results.members.length > 0 && (
          <CommandGroup heading={isAr ? "أفراد الأسرة" : "Family Members"}>
            {results.members.map((m) => (
              <CommandItem
                key={m.id}
                onSelect={() => handleSelect(`/family-tree?focus=${m.id}`)}
                className="flex items-center gap-3 p-2 cursor-pointer rounded-lg hover:bg-accent"
              >
                <SaudiCulturalAvatar src={m.avatar_path} alt={m.first_name_ar} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-xs">
                    {m.first_name_ar} {m.last_name_ar}
                  </p>
                  {m.occupation_ar && (
                    <p className="text-[10px] text-muted-foreground truncate">{m.occupation_ar}</p>
                  )}
                </div>
                <span className="text-[10px] text-primary/80 font-medium">
                  {isAr ? "في الشجرة" : "Tree"}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* 2. News & Articles */}
        {results.articles.length > 0 && (
          <CommandGroup heading={isAr ? "الأخبار والمقالات" : "News & Articles"}>
            {results.articles.map((a) => (
              <CommandItem
                key={a.id}
                onSelect={() => handleSelect(`/news/${a.slug}`)}
                className="flex items-center gap-3 p-2 cursor-pointer rounded-lg hover:bg-accent"
              >
                <div className="w-8 h-8 rounded-md bg-muted/30 border border-border flex items-center justify-center shrink-0">
                  <Newspaper className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-xs truncate">{a.title_ar}</p>
                  {a.excerpt_ar && (
                    <p className="text-[10px] text-muted-foreground truncate">{a.excerpt_ar}</p>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* 3. Initiatives */}
        {results.initiatives.length > 0 && (
          <CommandGroup heading={isAr ? "المبادرات والمشاريع" : "Initiatives & Projects"}>
            {results.initiatives.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => handleSelect(`/initiatives/${item.slug}`)}
                className="flex items-center gap-3 p-2 cursor-pointer rounded-lg hover:bg-accent"
              >
                <div className="w-8 h-8 rounded-md bg-muted/30 border border-border flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-xs truncate">{item.title_ar}</p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* 4. Achievers */}
        {results.achievers.length > 0 && (
          <CommandGroup heading={isAr ? "كفاءات ومتميزو الأسرة" : "Family Achievers"}>
            {results.achievers.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => handleSelect("/achievers")}
                className="flex items-center gap-3 p-2 cursor-pointer rounded-lg hover:bg-accent"
              >
                <div className="w-8 h-8 rounded-md bg-muted/30 border border-border flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-xs truncate">{item.name_ar}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{item.field_ar}</p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* 5. Library & Documents */}
        {results.library.length > 0 && (
          <CommandGroup heading={isAr ? "المكتبة والوثائق الرقمية" : "Digital Library"}>
            {results.library.map((doc) => (
              <CommandItem
                key={doc.id}
                onSelect={() => handleSelect("/library")}
                className="flex items-center gap-3 p-2 cursor-pointer rounded-lg hover:bg-accent"
              >
                <div className="w-8 h-8 rounded-md bg-muted/30 border border-border flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-xs truncate">{doc.title_ar}</p>
                  <span className="text-[9px] uppercase font-mono text-muted-foreground">
                    {doc.kind || "DOC"}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* 6. Branches */}
        {results.branches.length > 0 && (
          <CommandGroup heading={isAr ? "فروع الأسرة السبعة" : "Family Branches"}>
            {results.branches.map((b) => (
              <CommandItem
                key={b.id}
                onSelect={() => handleSelect("/branches")}
                className="flex items-center gap-3 p-2 cursor-pointer rounded-lg hover:bg-accent"
              >
                <div className="w-8 h-8 rounded-md bg-muted/30 border border-border flex items-center justify-center shrink-0">
                  <GitBranch className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-xs truncate">{b.name_ar}</p>
                  {b.elder_name_ar && (
                    <p className="text-[10px] text-muted-foreground truncate">{b.elder_name_ar}</p>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
