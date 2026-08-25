import { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/i18n/LanguageProvider";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  User,
  Heart,
  Filter,
  ChevronDown,
  ChevronRight,
  Layers,
} from "lucide-react";
import type { MemberRow } from "./FamilyMembersTable";
import type { BranchOption } from "./FamilyMemberFormDialog";

type RelationshipRow = {
  id: string;
  person_id: string;
  related_person_id: string;
  relationship_type: "parent" | "child" | "spouse";
};

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

  const [branchFilter, setBranchFilter] = useState("all");
  const [zoom, setZoom] = useState(1);
  const [collapsedGens, setCollapsedGens] = useState<Record<number, boolean>>({});

  const branchMap = useMemo(() => {
    const map = new Map<string, string>();
    branches.forEach((b) => map.set(b.id, isAr ? b.name_ar : b.name_en || b.name_ar));
    return map;
  }, [branches, isAr]);

  const memberMap = useMemo(() => {
    const map = new Map<string, MemberRow>();
    members.forEach((m) => map.set(m.id, m));
    return map;
  }, [members]);

  // Group members by generation
  const generationGroups = useMemo(() => {
    const filtered =
      branchFilter === "all" ? members : members.filter((m) => m.branch_id === branchFilter);
    const groups: Record<number, MemberRow[]> = {};

    filtered.forEach((m) => {
      const gen = m.generation || 1;
      if (!groups[gen]) groups[gen] = [];
      groups[gen].push(m);
    });

    return Object.entries(groups)
      .map(([gen, list]) => ({
        generation: parseInt(gen),
        members: list.sort((a, b) => a.sort_order - b.sort_order),
      }))
      .sort((a, b) => a.generation - b.generation);
  }, [members, branchFilter]);

  // Find spouse pairs
  const spouseMap = useMemo(() => {
    const map = new Map<string, string>();
    relationships.forEach((rel) => {
      if (rel.relationship_type === "spouse") {
        map.set(rel.person_id, rel.related_person_id);
        map.set(rel.related_person_id, rel.person_id);
      }
    });
    return map;
  }, [relationships]);

  const toggleGenCollapse = (gen: number) => {
    setCollapsedGens((prev) => ({ ...prev, [gen]: !prev[gen] }));
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-3">
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="h-9 w-[180px] text-xs">
              <Filter className="w-3.5 h-3.5 me-1.5 text-muted-foreground" />
              <SelectValue placeholder={isAr ? "تصفية حسب الفرع" : "Filter by branch"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isAr ? "جميع فروع الأسرة" : "All Branches"}</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {isAr ? b.name_ar : b.name_en || b.name_ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Badge variant="outline" className="text-xs font-normal">
            {isAr ? `إجمالي الأفراد: ${members.length}` : `Total Members: ${members.length}`}
          </Badge>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-lg border border-border">
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-xs"
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
            title={isAr ? "تصغير" : "Zoom Out"}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="text-[11px] font-mono w-10 text-center font-medium">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-xs"
            onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
            title={isAr ? "تكبير" : "Zoom In"}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-xs"
            onClick={() => setZoom(1)}
            title={isAr ? "إعادة ضبط" : "Reset"}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Tree Canvas Area */}
      <div className="border border-border rounded-xl bg-card/60 overflow-x-auto min-h-[500px] p-8 shadow-inner relative">
        <div
          className="transition-transform duration-150 origin-top flex flex-col gap-10 items-center min-w-max"
          style={{ transform: `scale(${zoom})` }}
        >
          {generationGroups.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground text-sm">
              {isAr ? "لا توجد بيانات شجرة متطابقة" : "No family tree data found"}
            </div>
          ) : (
            generationGroups.map(({ generation, members: genMembers }, genIdx) => {
              const isCollapsed = !!collapsedGens[generation];

              return (
                <div key={generation} className="flex flex-col items-center w-full relative">
                  {/* Generation Label */}
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => toggleGenCollapse(generation)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-muted/80 hover:bg-muted text-xs font-semibold rounded-full border border-border shadow-sm transition-colors text-foreground"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                      <Layers className="w-3.5 h-3.5 text-primary" />
                      {isAr ? `الجيل رقم ${generation}` : `Generation ${generation}`}
                      <span className="text-[10px] text-muted-foreground ms-1">
                        ({genMembers.length})
                      </span>
                    </button>
                  </div>

                  {/* Generation Cards */}
                  {!isCollapsed && (
                    <div className="flex flex-wrap items-center justify-center gap-5 relative">
                      {genMembers.map((member) => {
                        const spouseId = spouseMap.get(member.id);
                        const spouse = spouseId ? memberMap.get(spouseId) : null;

                        return (
                          <div
                            key={member.id}
                            onClick={() => onSelectMember && onSelectMember(member)}
                            className={`group relative flex flex-col items-center p-3 rounded-xl border bg-card/95 hover:bg-accent/40 shadow-sm transition-all duration-200 cursor-pointer w-[180px] ${
                              member.is_living
                                ? "border-border hover:border-primary/50"
                                : "border-zinc-300 dark:border-zinc-800 bg-muted/20"
                            }`}
                          >
                            {/* Avatar */}
                            <div className="relative w-14 h-14 rounded-full border-2 border-border overflow-hidden bg-background mb-2 group-hover:scale-105 transition-transform">
                              {member.avatar_path ? (
                                <img
                                  src={member.avatar_path}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted/50">
                                  <User className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>

                            {/* Name */}
                            <p className="text-xs font-bold text-foreground text-center truncate w-full group-hover:text-primary transition-colors">
                              {member.first_name_ar} {member.last_name_ar}
                            </p>
                            {member.first_name_en && (
                              <p className="text-[10px] text-muted-foreground text-center truncate w-full font-mono">
                                {member.first_name_en} {member.last_name_en}
                              </p>
                            )}

                            {/* Branch & Dates */}
                            <div className="flex flex-wrap items-center justify-center gap-1 mt-2">
                              {member.branch_id && branchMap.has(member.branch_id) && (
                                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                                  {branchMap.get(member.branch_id)}
                                </Badge>
                              )}
                              {member.date_of_birth && (
                                <span className="text-[9px] text-muted-foreground font-mono">
                                  {member.date_of_birth.slice(0, 4)}
                                  {!member.is_living && member.date_of_death
                                    ? ` - ${member.date_of_death.slice(0, 4)}`
                                    : ""}
                                </span>
                              )}
                            </div>

                            {/* Spouse indicator if exists */}
                            {spouse && (
                              <div className="mt-2 pt-1.5 border-t border-border/40 w-full flex items-center justify-center gap-1 text-[10px] text-pink-600 dark:text-pink-400">
                                <Heart className="w-2.5 h-2.5 fill-pink-500/20" />
                                <span className="truncate max-w-[120px]">
                                  {spouse.first_name_ar}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Connecting line to next generation */}
                  {genIdx < generationGroups.length - 1 && !isCollapsed && (
                    <div className="w-0.5 h-8 bg-border my-2 relative">
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary/60" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
