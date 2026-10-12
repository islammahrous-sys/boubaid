import { useMemo, useState, type ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronLeft, ChevronRight, Heart, Network, Search } from "lucide-react";
import type { MemberRow } from "./FamilyMembersTable";
import type { BranchOption } from "./FamilyMemberFormDialog";

type RelationshipRow = {
  id: string;
  person_id: string;
  related_person_id: string;
  relationship_type: "parent" | "child" | "spouse";
};

/** Arabic agreement: ابن واحد، ابنان، ٣–١٠ أبناء، ١١+ ابنًا. */
const arChildren = (n: number, nf: Intl.NumberFormat) =>
  n === 1 ? "ابن واحد" : n === 2 ? "ابنان" : ` `;

/**
 * Lineage tree built from the recorded parent/child links.
 *
 * The previous view laid every generation out as one row of cards; with
 * hundreds of people per generation that row was thousands of pixels wide and
 * the canvas showed mostly empty space. An expandable outline follows the real
 * descent (father → children), scales to the full 550-member register, and
 * search opens the path down to every match.
 */
export function FamilyTreeViewer({
  members,
  branches,
  relationships,
  onSelectMember,
}: {
  members: MemberRow[];
  branches: BranchOption[];
  relationships: RelationshipRow[];
  onSelectMember?: (member: MemberRow) => void;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const nf = useMemo(() => new Intl.NumberFormat(isAr ? "ar-SA-u-nu-latn" : "en-US"), [isAr]);

  const [branchFilter, setBranchFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string> | null>(null);

  const branchName = useMemo(() => {
    const map = new Map<string, string>();
    branches.forEach((b) => map.set(b.id, isAr ? b.name_ar : b.name_en || b.name_ar));
    return map;
  }, [branches, isAr]);

  const byId = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);

  // parent → children and child → parent, from both directions of the links.
  const { childrenOf, parentOf, spouseOf } = useMemo(() => {
    const kids = new Map<string, Set<string>>();
    const parent = new Map<string, string>();
    const spouse = new Map<string, string>();
    const link = (p: string, c: string) => {
      if (!byId.has(p) || !byId.has(c) || p === c) return;
      if (!kids.has(p)) kids.set(p, new Set());
      kids.get(p)!.add(c);
      if (!parent.has(c)) parent.set(c, p);
    };
    for (const r of relationships) {
      if (r.relationship_type === "parent") link(r.person_id, r.related_person_id);
      else if (r.relationship_type === "child") link(r.related_person_id, r.person_id);
      else if (r.relationship_type === "spouse") {
        spouse.set(r.person_id, r.related_person_id);
        spouse.set(r.related_person_id, r.person_id);
      }
    }
    const order = (a: string, b: string) => {
      const ma = byId.get(a)!;
      const mb = byId.get(b)!;
      return (
        (ma.sort_order ?? 0) - (mb.sort_order ?? 0) ||
        ma.first_name_ar.localeCompare(mb.first_name_ar)
      );
    };
    const sorted = new Map<string, string[]>();
    kids.forEach((set, p) => sorted.set(p, [...set].sort(order)));
    return { childrenOf: sorted, parentOf: parent, spouseOf: spouse };
  }, [relationships, byId]);

  const inScope = (m: MemberRow) => branchFilter === "all" || m.branch_id === branchFilter;

  // Roots: people in scope whose parent is unknown or outside the scope.
  const roots = useMemo(() => {
    return members
      .filter(inScope)
      .filter((m) => {
        const p = parentOf.get(m.id);
        return !p || !inScope(byId.get(p)!);
      })
      .sort(
        (a, b) =>
          (a.generation ?? 0) - (b.generation ?? 0) || (a.sort_order ?? 0) - (b.sort_order ?? 0),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members, parentOf, byId, branchFilter]);

  // Descendant counts, for "n descendants" hints.
  const descendants = useMemo(() => {
    const memo = new Map<string, number>();
    const count = (id: string, seen = new Set<string>()): number => {
      if (memo.has(id)) return memo.get(id)!;
      if (seen.has(id)) return 0;
      seen.add(id);
      const n = (childrenOf.get(id) ?? []).reduce((s, c) => s + 1 + count(c, seen), 0);
      memo.set(id, n);
      return n;
    };
    members.forEach((m) => count(m.id));
    return memo;
  }, [members, childrenOf]);

  // Search: matching people, and every ancestor that must open to reveal them.
  const q = query.trim();
  const { matches, openForSearch } = useMemo(() => {
    const found = new Set<string>();
    const open = new Set<string>();
    if (!q) return { matches: found, openForSearch: open };
    for (const m of members) {
      if (!inScope(m)) continue;
      const name = `${m.first_name_ar} ${m.last_name_ar} ${m.first_name_en ?? ""} ${m.last_name_en ?? ""}`;
      if (name.toLowerCase().includes(q.toLowerCase())) {
        found.add(m.id);
        let p = parentOf.get(m.id);
        const guard = new Set<string>();
        while (p && !guard.has(p)) {
          guard.add(p);
          open.add(p);
          p = parentOf.get(p);
        }
      }
    }
    return { matches: found, openForSearch: open };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, members, parentOf, branchFilter]);

  // Default: roots and their children open, so the first view shows the trunk.
  const defaultOpen = useMemo(() => new Set(roots.map((r) => r.id)), [roots]);
  const open = q ? openForSearch : (expanded ?? defaultOpen);

  const toggle = (id: string) => {
    if (q) setQuery("");
    setExpanded((prev) => {
      const next = new Set(prev ?? defaultOpen);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const expandAll = () => setExpanded(new Set(childrenOf.keys()));
  const collapseAll = () => setExpanded(new Set());

  const generations = useMemo(
    () => new Set(members.filter(inScope).map((m) => m.generation ?? 0)).size,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [members, branchFilter],
  );
  const Chevron = isAr ? ChevronLeft : ChevronRight;

  const renderNode = (id: string, depth: number, trail: Set<string>): ReactNode => {
    const m = byId.get(id);
    if (!m || trail.has(id) || depth > 40) return null;
    const kids = (childrenOf.get(id) ?? []).filter((c) => inScope(byId.get(c)!));
    const isOpen = open.has(id);
    const isMatch = matches.has(id);
    const spouse = spouseOf.get(id) ? byId.get(spouseOf.get(id)!) : null;
    const next = new Set(trail).add(id);
    const name = isAr
      ? `${m.first_name_ar} ${m.last_name_ar}`
      : `${m.first_name_en || m.first_name_ar} ${m.last_name_en || m.last_name_ar}`;

    if (q && !isMatch && !openForSearch.has(id)) return null;

    return (
      <li key={id} role="treeitem" aria-expanded={kids.length ? isOpen : undefined}>
        <div
          className={cn(
            "group flex items-center gap-2 rounded-xl py-1.5 pe-2 transition-colors hover:bg-[var(--console-canvas)]",
            isMatch && "bg-[#eca654]/15 ring-1 ring-[#eca654]/50",
          )}
        >
          {kids.length ? (
            <button
              type="button"
              onClick={() => toggle(id)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
              aria-label={isOpen ? (isAr ? "طي" : "Collapse") : isAr ? "توسيع" : "Expand"}
            >
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <Chevron className="h-4 w-4" />}
            </button>
          ) : (
            <span className="h-7 w-7 shrink-0" />
          )}
          <button
            type="button"
            onClick={() => onSelectMember?.(m)}
            disabled={!onSelectMember}
            className="flex min-w-0 flex-1 items-center gap-3 text-start disabled:cursor-default"
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold",
                m.is_living ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
              )}
            >
              {m.avatar_path ? (
                <img src={m.avatar_path} alt="" className="h-full w-full object-cover" />
              ) : (
                (isAr ? m.first_name_ar : m.first_name_en || m.first_name_ar)?.[0]
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[14.5px] font-semibold text-foreground">
                {name}
              </span>
              <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                {m.generation ? (isAr ? `الجيل ${m.generation}` : `Gen ${m.generation}`) : null}
                {m.branch_id && branchName.has(m.branch_id) && (
                  <span>· {branchName.get(m.branch_id)}</span>
                )}
                {!m.is_living && <span>· {isAr ? "رحمه الله" : "deceased"}</span>}
                {spouse && (
                  <span className="inline-flex items-center gap-1">
                    · <Heart className="h-3 w-3 text-[#a84a2b]" /> {spouse.first_name_ar}
                  </span>
                )}
              </span>
            </span>
          </button>
          {kids.length > 0 && (
            <span className="shrink-0 rounded-full bg-[var(--console-canvas)] px-2.5 py-0.5 text-xs tabular-nums text-muted-foreground">
              {isAr
                ? `${arChildren(kids.length, nf)} · ${nf.format(descendants.get(id) ?? 0)} من الذرية`
                : `${nf.format(kids.length)} children · ${nf.format(descendants.get(id) ?? 0)} descendants`}
            </span>
          )}
        </div>
        {kids.length > 0 && isOpen && (
          <ul
            role="group"
            className="relative ms-[13px] border-s border-[var(--console-hairline)] ps-4"
          >
            {kids.map((c) => renderNode(c, depth + 1, next))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="space-y-4">
      <div className="console-card flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isAr ? "ابحث عن فرد لإظهار موقعه في الشجرة..." : "Find a person in the tree..."
            }
            className="h-10 ps-9"
            aria-label={isAr ? "بحث في الشجرة" : "Search the tree"}
          />
        </div>
        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="h-10 lg:w-56" aria-label={isAr ? "الفرع" : "Branch"}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isAr ? "كل الفروع" : "All branches"}</SelectItem>
            {branches.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {isAr ? b.name_ar : b.name_en || b.name_ar}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="h-10 rounded-xl border border-[var(--console-hairline)] bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-[var(--console-canvas)] focus-visible:outline-2 focus-visible:outline-ring active:scale-[0.98]"
          >
            {isAr ? "توسيع الكل" : "Expand all"}
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="h-10 rounded-xl border border-[var(--console-hairline)] bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-[var(--console-canvas)] focus-visible:outline-2 focus-visible:outline-ring active:scale-[0.98]"
          >
            {isAr ? "طي الكل" : "Collapse all"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-[13px]">
        {[
          [isAr ? "أفراد" : "People", members.filter(inScope).length],
          [isAr ? "أجيال" : "Generations", generations],
          [isAr ? "جذور" : "Roots", roots.length],
          ...(q ? [[isAr ? "نتائج البحث" : "Matches", matches.size] as const] : []),
        ].map(([label, n]) => (
          <span
            key={String(label)}
            className="rounded-lg bg-card px-3 py-1.5 text-muted-foreground shadow-[var(--console-shadow-sm)]"
          >
            {label} <b className="tabular-nums text-foreground">{nf.format(Number(n))}</b>
          </span>
        ))}
      </div>

      <div className="console-card p-3 md:p-4">
        {roots.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center text-muted-foreground">
            <Network className="h-8 w-8 opacity-40" />
            <p className="mt-3 text-sm">{isAr ? "لا توجد بيانات للشجرة." : "No tree data."}</p>
          </div>
        ) : q && matches.size === 0 ? (
          <div className="flex flex-col items-center py-16 text-center text-muted-foreground">
            <Search className="h-8 w-8 opacity-40" />
            <p className="mt-3 text-sm">
              {isAr ? "لا يوجد فرد بهذا الاسم." : "No one matches that name."}
            </p>
          </div>
        ) : (
          <ul role="tree" aria-label={isAr ? "شجرة الأسرة" : "Family tree"} className="space-y-0.5">
            {roots.map((r) => renderNode(r.id, 0, new Set()))}
          </ul>
        )}
      </div>
    </div>
  );
}
