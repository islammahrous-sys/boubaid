import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLang } from "@/i18n/LanguageProvider";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  User,
  Filter,
  Heart,
  HeartOff,
  Link as LinkIcon,
  Download,
  Upload,
  CheckSquare,
  X,
  GitBranch,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Shield,
  Briefcase,
  GraduationCap,
  Calendar,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getFamilyMembersPaginated } from "@/lib/admin-hub.functions";
import { useDebounce } from "@/hooks/useDebounce";
import {
  FamilyMemberFormDialog,
  type BranchOption,
  type PlaceOption,
} from "./FamilyMemberFormDialog";
import { SaudiCulturalAvatar } from "@/components/common/SaudiCulturalAvatar";
import type { FamilyMemberInput, BulkMembersActionInput } from "@/lib/admin-hub.schemas";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/useConfirm";
import { cn } from "@/lib/utils";

export type MemberRow = {
  id: string;
  first_name_ar: string;
  middle_name_ar?: string | null;
  last_name_ar: string;
  display_name_ar?: string | null;
  first_name_en?: string | null;
  middle_name_en?: string | null;
  last_name_en?: string | null;
  slug: string;
  gender: "male" | "female";
  date_of_birth?: string | null;
  date_of_death?: string | null;
  is_living: boolean;
  biography_ar?: string | null;
  occupation_ar?: string | null;
  education_ar?: string | null;
  branch_id?: string | null;
  avatar_path?: string | null;
  generation: number;
  sort_order: number;
  visibility: "public" | "family_only" | "admin_only" | "private";
  status: "draft" | "in_review" | "scheduled" | "published" | "archived";
  updated_at: string;
};

type SortField = "name" | "branch" | "generation" | "living" | "visibility" | "updated_at";
type SortDirection = "asc" | "desc";

export function FamilyMembersTable({
  initialStats,
  branches,
  places,
  onSaveMember,
  onDeleteMember,
  onOpenRelationships,
  onOpenImportExport,
  onBulkAction,
}: {
  initialStats?: {
    total: number;
    living: number;
    deceased: number;
    males?: number;
    females?: number;
  };
  branches: BranchOption[];
  places: PlaceOption[];
  onSaveMember: (data: FamilyMemberInput) => Promise<void>;
  onDeleteMember: (id: string) => Promise<void>;
  onOpenRelationships?: (memberId: string) => void;
  onOpenImportExport?: () => void;
  onBulkAction?: (data: BulkMembersActionInput) => Promise<void>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const confirm = useConfirm();

  // Filter States
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [livingFilter, setLivingFilter] = useState("all");
  const [generationFilter, setGenerationFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");

  // Sorting & Pagination States
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Selection & Bulk Action States
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [targetBulkBranch, setTargetBulkBranch] = useState<string>("");
  const [targetBulkVisibility, setTargetBulkVisibility] = useState<string>("");
  const [bulkLoading, setBulkLoading] = useState(false);

  // Dialog States
  const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [quickViewMember, setQuickViewMember] = useState<MemberRow | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const fetchMembersPage = useServerFn(getFamilyMembersPaginated);

  const {
    data: queryData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      "family-members-paginated",
      currentPage,
      pageSize,
      debouncedSearch,
      branchFilter,
      livingFilter,
    ],
    queryFn: () =>
      fetchMembersPage({
        data: {
          page: currentPage,
          pageSize,
          search: debouncedSearch.trim() || undefined,
          branchId: branchFilter === "all" ? undefined : branchFilter,
          status: livingFilter === "all" ? undefined : livingFilter,
        },
      }),
    staleTime: 1000 * 60 * 3,
    placeholderData: (previousData) => previousData,
  });

  const paginatedMembers = queryData?.data ?? [];
  const totalItems = queryData?.count ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const branchMap = useMemo(() => {
    const map = new Map<string, string>();
    branches.forEach((b) => map.set(b.id, isAr ? b.name_ar : b.name_en || b.name_ar));
    return map;
  }, [branches, isAr]);

  const generations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Simplified for server pagination

  // Demographic Statistics
  const stats = {
    total: initialStats?.total ?? totalItems,
    living: initialStats?.living ?? 0,
    deceased: initialStats?.deceased ?? 0,
    males: initialStats?.males ?? 0,
    females: initialStats?.females ?? 0,
  };

  // Filtering
  const filteredMembers = paginatedMembers; // Now handled by server

  // Sorting
  const sortedMembers = paginatedMembers; // Now handled by server

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // CSV Export with UTF-8 BOM for Microsoft Excel Arabic Support
  const handleExportCsv = (exportOnlySelected = false) => {
    const targetList: MemberRow[] = exportOnlySelected
      ? sortedMembers.filter((m: MemberRow) => selectedMemberIds.includes(m.id))
      : sortedMembers;

    if (targetList.length === 0) {
      toast.error(isAr ? "لا توجد سجلات للتصدير" : "No records to export");
      return;
    }

    const headers = [
      "ID",
      "First Name (AR)",
      "Middle Name (AR)",
      "Last Name (AR)",
      "First Name (EN)",
      "Last Name (EN)",
      "Slug",
      "Branch",
      "Generation",
      "Gender",
      "Living Status",
      "Birth Date",
      "Death Date",
      "Occupation",
      "Education",
      "Visibility",
    ];

    const rows = targetList.map((m: MemberRow) => [
      `"${m.id}"`,
      `"${m.first_name_ar}"`,
      `"${m.middle_name_ar || ""}"`,
      `"${m.last_name_ar}"`,
      `"${m.first_name_en || ""}"`,
      `"${m.last_name_en || ""}"`,
      `"${m.slug}"`,
      `"${m.branch_id ? branchMap.get(m.branch_id) || "" : ""}"`,
      m.generation,
      m.gender,
      m.is_living ? "Living" : "Deceased",
      `"${m.date_of_birth || ""}"`,
      `"${m.date_of_death || ""}"`,
      `"${m.occupation_ar || ""}"`,
      `"${m.education_ar || ""}"`,
      m.visibility,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `family_members_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(
      isAr ? `تم تصدير ${targetList.length} فرد بنجاح` : `Exported ${targetList.length} members`,
    );
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP SUMMARY STATS BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl border border-border bg-card">
          <span className="text-[11px] text-muted-foreground block font-medium">
            {isAr ? "إجمالي السجلات" : "Total Members"}
          </span>
          <span className="text-xl font-bold font-mono text-foreground mt-0.5 block">
            {stats.total}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-medium">
            {isAr ? "الأحياء" : "Living"}
          </span>
          <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
            {stats.living}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl border border-zinc-500/20 bg-zinc-500/5">
          <span className="text-[11px] text-muted-foreground block font-medium">
            {isAr ? "المتوفون (رحمهم الله)" : "Deceased"}
          </span>
          <span className="text-xl font-bold font-mono text-foreground mt-0.5 block">
            {stats.deceased}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl border border-blue-500/20 bg-blue-500/5">
          <span className="text-[11px] text-blue-600 dark:text-blue-400 block font-medium">
            {isAr ? "الذكور" : "Males"}
          </span>
          <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5 block">
            {stats.males}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl border border-rose-500/20 bg-rose-500/5">
          <span className="text-[11px] text-rose-600 dark:text-rose-400 block font-medium">
            {isAr ? "الإناث" : "Females"}
          </span>
          <span className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5 block">
            {stats.females}
          </span>
        </div>
      </div>

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <div className="flex flex-col gap-3 bg-card p-4 rounded-2xl border border-border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={
                isAr
                  ? "بحث بالاسم، اللقب، المهنة، أو المعرف..."
                  : "Search by name, occupation, or slug..."
              }
              className="ps-9 h-9 text-xs rounded-xl"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs gap-1.5 rounded-xl"
              onClick={() => handleExportCsv(false)}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? "تصدير CSV" : "Export CSV"}</span>
            </Button>

            {onOpenImportExport && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs gap-1.5 rounded-xl"
                onClick={onOpenImportExport}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isAr ? "استيراد / تصدير" : "Import / Export"}</span>
              </Button>
            )}

            <Button
              size="sm"
              className="h-9 text-xs gap-1.5 font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                setSelectedMember(null);
                setFormOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? "إضافة فرد جديد" : "Add Member"}</span>
            </Button>
          </div>
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
          {/* Branch filter */}
          <Select
            value={branchFilter}
            onValueChange={(v) => {
              setBranchFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[130px] text-xs rounded-lg">
              <Filter className="w-3 h-3 me-1 text-muted-foreground" />
              <SelectValue placeholder={isAr ? "الفرع" : "Branch"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isAr ? "كل الفروع" : "All Branches"}</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {isAr ? b.name_ar : b.name_en || b.name_ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Living status filter */}
          <Select
            value={livingFilter}
            onValueChange={(v) => {
              setLivingFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[110px] text-xs rounded-lg">
              <SelectValue placeholder={isAr ? "الحياة" : "Status"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isAr ? "الكل" : "All"}</SelectItem>
              <SelectItem value="living">{isAr ? "الأحياء" : "Living"}</SelectItem>
              <SelectItem value="deceased">{isAr ? "المتوفون" : "Deceased"}</SelectItem>
            </SelectContent>
          </Select>

          {/* Generation filter */}
          <Select
            value={generationFilter}
            onValueChange={(v) => {
              setGenerationFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[105px] text-xs rounded-lg">
              <SelectValue placeholder={isAr ? "الجيل" : "Gen"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isAr ? "كل الأجيال" : "All Gens"}</SelectItem>
              {generations.map((g) => (
                <SelectItem key={g} value={g.toString()}>
                  {isAr ? `الجيل ${g}` : `Gen ${g}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Gender filter */}
          <Select
            value={genderFilter}
            onValueChange={(v) => {
              setGenderFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[105px] text-xs rounded-lg">
              <SelectValue placeholder={isAr ? "الجنس" : "Gender"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isAr ? "الجنس (الكل)" : "All Genders"}</SelectItem>
              <SelectItem value="male">{isAr ? "ذكور" : "Male"}</SelectItem>
              <SelectItem value="female">{isAr ? "إناث" : "Female"}</SelectItem>
            </SelectContent>
          </Select>

          {/* Visibility filter */}
          <Select
            value={visibilityFilter}
            onValueChange={(v) => {
              setVisibilityFilter(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[125px] text-xs rounded-lg">
              <SelectValue placeholder={isAr ? "الظهور" : "Visibility"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isAr ? "كل مستويات الظهور" : "All Visibility"}</SelectItem>
              <SelectItem value="public">{isAr ? "عام (Public)" : "Public"}</SelectItem>
              <SelectItem value="family_only">{isAr ? "للأسرة فقط" : "Family Only"}</SelectItem>
              <SelectItem value="admin_only">{isAr ? "للإدارة فقط" : "Admin Only"}</SelectItem>
              <SelectItem value="private">{isAr ? "خاص (Private)" : "Private"}</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filters */}
          {(search ||
            branchFilter !== "all" ||
            livingFilter !== "all" ||
            generationFilter !== "all" ||
            genderFilter !== "all" ||
            visibilityFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSearch("");
                setBranchFilter("all");
                setLivingFilter("all");
                setGenerationFilter("all");
                setGenderFilter("all");
                setVisibilityFilter("all");
                setCurrentPage(1);
              }}
            >
              <X className="w-3 h-3 me-1" />
              {isAr ? "إعادة ضبط التصفية" : "Reset"}
            </Button>
          )}

          <div className="ms-auto text-xs text-muted-foreground font-mono">
            {isAr
              ? `النتائج: ${filteredMembers.length} من أصل ${totalItems}`
              : `${filteredMembers.length} of ${totalItems} members`}
          </div>
        </div>
      </div>

      {/* 3. BULK ACTIONS FLOATING TOOLBAR */}
      {selectedMemberIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-primary/10 border border-primary/30 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground">
              {isAr
                ? `تم تحديد ${selectedMemberIds.length} فرد`
                : `${selectedMemberIds.length} members selected`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Move to Branch */}
            {branches.length > 0 && (
              <Select value={targetBulkBranch} onValueChange={setTargetBulkBranch}>
                <SelectTrigger className="h-8 text-xs w-[140px] bg-background rounded-lg">
                  <SelectValue placeholder={isAr ? "نقل لفرع..." : "Move to branch..."} />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {isAr ? b.name_ar : b.name_en || b.name_ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {targetBulkBranch && onBulkAction && (
              <Button
                size="sm"
                className="h-8 text-xs rounded-lg"
                disabled={bulkLoading}
                onClick={async () => {
                  setBulkLoading(true);
                  try {
                    await onBulkAction({
                      ids: selectedMemberIds,
                      action: "change_branch",
                      branch_id: targetBulkBranch,
                    });
                    setSelectedMemberIds([]);
                    setTargetBulkBranch("");
                    toast.success(
                      isAr ? "تم نقل الأفراد للفرع المحدد بنجاح" : "Members moved to branch",
                    );
                  } finally {
                    setBulkLoading(false);
                  }
                }}
              >
                {isAr ? "تطبيق النقل" : "Apply Branch"}
              </Button>
            )}

            {/* Change Visibility in Bulk */}
            <Select value={targetBulkVisibility} onValueChange={setTargetBulkVisibility}>
              <SelectTrigger className="h-8 text-xs w-[130px] bg-background rounded-lg">
                <SelectValue placeholder={isAr ? "تغيير الظهور..." : "Visibility..."} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="family_only">Family Only</SelectItem>
                <SelectItem value="admin_only">Admin Only</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>

            {targetBulkVisibility && onBulkAction && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs rounded-lg"
                disabled={bulkLoading}
                onClick={async () => {
                  setBulkLoading(true);
                  try {
                    await onBulkAction({
                      ids: selectedMemberIds,
                      action: "change_visibility",
                      visibility: targetBulkVisibility as any,
                    });
                    setSelectedMemberIds([]);
                    setTargetBulkVisibility("");
                    toast.success(isAr ? "تم تحديث مستوى الظهور للمحددين" : "Visibility updated");
                  } finally {
                    setBulkLoading(false);
                  }
                }}
              >
                {isAr ? "تطبيق الظهور" : "Apply Visibility"}
              </Button>
            )}

            {/* Export Selected to CSV */}
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs rounded-lg"
              onClick={() => handleExportCsv(true)}
            >
              <Download className="w-3.5 h-3.5 me-1" />
              {isAr ? "تصدير المحدد" : "Export Selected"}
            </Button>

            {/* Bulk Delete */}
            {onBulkAction && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs rounded-lg text-destructive hover:bg-destructive/10"
                disabled={bulkLoading}
                onClick={async () => {
                  if (
                    !(await confirm({
                      title: isAr
                        ? `أرشفة ${selectedMemberIds.length} فرد؟`
                        : `Archive ${selectedMemberIds.length} member(s)?`,
                      description: isAr
                        ? "سيتم إخفاء هذه السجلات من العرض العام. يمكن استعادتها لاحقاً، ولكن هذا الإجراء يؤثر على جميع الأفراد المحددين دفعة واحدة."
                        : "These records will be hidden from public view. They can be restored later, but this affects every selected member at once.",
                      tone: "destructive",
                      confirmLabel: isAr ? "أرشفة" : "Archive",
                    }))
                  ) {
                    return;
                  }
                  setBulkLoading(true);
                  try {
                    await onBulkAction({
                      ids: selectedMemberIds,
                      action: "delete",
                    });
                    setSelectedMemberIds([]);
                    toast.success(isAr ? "تم حذف السجلات المحددة" : "Members deleted");
                  } finally {
                    setBulkLoading(false);
                  }
                }}
              >
                <Trash2 className="w-3.5 h-3.5 me-1" />
                {isAr ? "حذف المحدد" : "Delete Selected"}
              </Button>
            )}

            {/* Deselect */}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs rounded-lg"
              onClick={() => setSelectedMemberIds([])}
            >
              <X className="w-3.5 h-3.5 me-1" />
              {isAr ? "إلغاء التحديد" : "Deselect"}
            </Button>
          </div>
        </div>
      )}

      {/* 4. MAIN MEMBERS TABLE */}
      <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs hover:bg-muted/40">
              <TableHead className="w-[44px] text-center">
                <Checkbox
                  checked={
                    paginatedMembers.length > 0 &&
                    paginatedMembers.every((m) => selectedMemberIds.includes(m.id))
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      const newIds = Array.from(
                        new Set([...selectedMemberIds, ...paginatedMembers.map((m) => m.id)]),
                      );
                      setSelectedMemberIds(newIds);
                    } else {
                      const pageIds = paginatedMembers.map((m) => m.id);
                      setSelectedMemberIds((prev) => prev.filter((id) => !pageIds.includes(id)));
                    }
                  }}
                />
              </TableHead>
              <TableHead className="w-[50px] text-center">{isAr ? "الصورة" : "Photo"}</TableHead>

              {/* Sortable: Name */}
              <TableHead
                className="cursor-pointer select-none hover:text-primary transition-colors"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1.5">
                  <span>{isAr ? "الاسم الكامل" : "Full Name"}</span>
                  {sortField === "name" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="w-3 h-3 text-primary" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-primary" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-muted-foreground/40" />
                  )}
                </div>
              </TableHead>

              {/* Sortable: Branch */}
              <TableHead
                className="cursor-pointer select-none hover:text-primary transition-colors"
                onClick={() => handleSort("branch")}
              >
                <div className="flex items-center gap-1.5">
                  <span>{isAr ? "الفرع" : "Branch"}</span>
                  {sortField === "branch" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="w-3 h-3 text-primary" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-primary" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-muted-foreground/40" />
                  )}
                </div>
              </TableHead>

              {/* Sortable: Generation */}
              <TableHead
                className="text-center cursor-pointer select-none hover:text-primary transition-colors"
                onClick={() => handleSort("generation")}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>{isAr ? "الجيل" : "Gen"}</span>
                  {sortField === "generation" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="w-3 h-3 text-primary" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-primary" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-muted-foreground/40" />
                  )}
                </div>
              </TableHead>

              {/* Sortable: Living */}
              <TableHead
                className="text-center cursor-pointer select-none hover:text-primary transition-colors"
                onClick={() => handleSort("living")}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>{isAr ? "الحياة" : "Living"}</span>
                  {sortField === "living" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="w-3 h-3 text-primary" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-primary" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-muted-foreground/40" />
                  )}
                </div>
              </TableHead>

              {/* Sortable: Visibility */}
              <TableHead
                className="text-center cursor-pointer select-none hover:text-primary transition-colors"
                onClick={() => handleSort("visibility")}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>{isAr ? "الظهور" : "Visibility"}</span>
                  {sortField === "visibility" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="w-3 h-3 text-primary" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-primary" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-muted-foreground/40" />
                  )}
                </div>
              </TableHead>

              <TableHead className="text-end">{isAr ? "إجراءات" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className={cn("transition-opacity duration-150", isFetching && "opacity-70")}>
            {isLoading && !queryData ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={`skeleton-${idx}`}>
                  <TableCell className="text-center"><div className="w-4 h-4 bg-muted animate-pulse rounded mx-auto" /></TableCell>
                  <TableCell className="text-center"><div className="w-8 h-8 rounded-full bg-muted animate-pulse mx-auto" /></TableCell>
                  <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded mb-1" /><div className="h-3 w-20 bg-muted/60 animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell className="text-center"><div className="h-4 w-8 bg-muted animate-pulse rounded mx-auto" /></TableCell>
                  <TableCell className="text-center"><div className="h-4 w-12 bg-muted animate-pulse rounded mx-auto" /></TableCell>
                  <TableCell className="text-center"><div className="h-4 w-14 bg-muted animate-pulse rounded mx-auto" /></TableCell>
                  <TableCell className="text-end"><div className="h-7 w-20 bg-muted animate-pulse rounded ms-auto" /></TableCell>
                </TableRow>
              ))
            ) : paginatedMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-36 text-center text-muted-foreground text-xs">
                  {isAr
                    ? "لا يوجد أفراد مسجلون بهذه المعايير"
                    : "No family members found matching criteria"}
                </TableCell>
              </TableRow>
            ) : (
              paginatedMembers.map((member) => (
                <TableRow key={member.id} className="hover:bg-muted/30 transition-colors text-xs">
                  {/* Select Checkbox */}
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedMemberIds.includes(member.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMemberIds((prev) => [...prev, member.id]);
                        } else {
                          setSelectedMemberIds((prev) => prev.filter((id) => id !== member.id));
                        }
                      }}
                    />
                  </TableCell>

                  {/* Photo Avatar */}
                  <TableCell className="text-center">
                    <div
                      onClick={() => setQuickViewMember(member)}
                      className="cursor-pointer inline-block"
                      title={member.first_name_ar}
                    >
                      <SaudiCulturalAvatar
                        src={member.avatar_path}
                        alt={member.first_name_ar}
                        size="sm"
                      />
                    </div>
                  </TableCell>

                  {/* Name & Slug */}
                  <TableCell>
                    <div className="cursor-pointer" onClick={() => setQuickViewMember(member)}>
                      <span className="font-bold text-foreground hover:text-primary transition-colors">
                        {member.first_name_ar}{" "}
                        {member.middle_name_ar ? member.middle_name_ar + " " : ""}
                        {member.last_name_ar}
                      </span>
                      {member.first_name_en && (
                        <span className="block text-[11px] text-muted-foreground font-mono">
                          {member.first_name_en} {member.last_name_en}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Branch */}
                  <TableCell>
                    {member.branch_id && branchMap.has(member.branch_id) ? (
                      <Badge
                        variant="outline"
                        className="text-[11px] font-normal border-primary/30 text-primary"
                      >
                        {branchMap.get(member.branch_id)}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">—</span>
                    )}
                  </TableCell>

                  {/* Generation */}
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      G{member.generation}
                    </Badge>
                  </TableCell>

                  {/* Living Status */}
                  <TableCell className="text-center">
                    {member.is_living ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <Heart className="w-3 h-3 fill-emerald-500/20 text-emerald-500" />
                        {isAr ? "حي" : "Living"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 font-medium">
                        <HeartOff className="w-3 h-3 text-zinc-400" />
                        {isAr ? "متوفى" : "Deceased"}
                      </span>
                    )}
                  </TableCell>

                  {/* Visibility */}
                  <TableCell className="text-center">
                    <Badge
                      variant={member.visibility === "public" ? "default" : "outline"}
                      className="text-[10px] font-mono uppercase tracking-wider"
                    >
                      {member.visibility}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-end">
                    <div className="flex items-center justify-end gap-1">
                      {/* Quick Inspect */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-muted-foreground hover:text-foreground"
                        title={isAr ? "معاينة سريعة" : "Quick View"}
                        onClick={() => setQuickViewMember(member)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>

                      {/* Relationships */}
                      {onOpenRelationships && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-muted-foreground hover:text-foreground"
                          title={isAr ? "إدارة شجرة العلاقات" : "Manage Relationships"}
                          onClick={() => onOpenRelationships(member.id)}
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                        </Button>
                      )}

                      {/* Edit */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-muted-foreground hover:text-foreground"
                        title={isAr ? "تعديل البيانات" : "Edit"}
                        onClick={() => {
                          setSelectedMember(member);
                          setFormOpen(true);
                        }}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                        title={isAr ? "أرشفة / حذف" : "Archive / Delete"}
                        disabled={deletingMemberId === member.id}
                        onClick={async () => {
                          const memberName = `${member.first_name_ar} ${member.last_name_ar}`;
                          if (
                            !(await confirm({
                              title: isAr ? `أرشفة ${memberName}؟` : `Archive ${memberName}?`,
                              description: isAr
                                ? "سيتم إخفاء هذا الفرد من العرض العام. يمكن استعادته لاحقاً من الإدارة."
                                : "This member will be hidden from public view. They can be restored later from admin.",
                              tone: "destructive",
                              confirmLabel: isAr ? "أرشفة" : "Archive",
                            }))
                          ) {
                            return;
                          }
                          setDeletingMemberId(member.id);
                          try {
                            await onDeleteMember(member.id);
                          } finally {
                            setDeletingMemberId(null);
                          }
                        }}
                      >
                        {deletingMemberId === member.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* 5. TABLE PAGINATION CONTROLS */}
        <div className="p-3.5 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{isAr ? "صفوف بالصفحة:" : "Rows per page:"}</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-7 w-[70px] text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>

            <span className="ms-2">
              {isAr
                ? `عرض ${(currentPage - 1) * pageSize + 1} إلى ${Math.min(currentPage * pageSize, sortedMembers.length)} من أصل ${sortedMembers.length}`
                : `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, sortedMembers.length)} of ${sortedMembers.length}`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="w-7 h-7"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              title={isAr ? "الصفحة الأولى" : "First Page"}
            >
              <ChevronsLeft className="w-3.5 h-3.5 rtl:rotate-180" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="w-7 h-7"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              title={isAr ? "السابق" : "Previous"}
            >
              <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
            </Button>

            <span className="px-3 py-1 text-xs font-mono font-semibold text-foreground">
              {currentPage} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="icon"
              className="w-7 h-7"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              title={isAr ? "التالي" : "Next"}
            >
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="w-7 h-7"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              title={isAr ? "الصفحة الأخيرة" : "Last Page"}
            >
              <ChevronsRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </div>

      {/* 6. MEMBER QUICK-VIEW INSPECTOR MODAL */}
      {quickViewMember && (
        <Dialog open={!!quickViewMember} onOpenChange={() => setQuickViewMember(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center justify-between">
                <span>{isAr ? "بطاقة فرد الأسرة" : "Member Profile Card"}</span>
                <Badge variant={quickViewMember.is_living ? "default" : "secondary"}>
                  {quickViewMember.is_living
                    ? isAr
                      ? "على قيد الحياة"
                      : "Living"
                    : isAr
                      ? "متوفى"
                      : "Deceased"}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-xs pt-2">
              {/* Header Profile Photo & Name */}
              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-muted/40 border border-border">
                <SaudiCulturalAvatar
                  src={quickViewMember.avatar_path}
                  alt={quickViewMember.first_name_ar}
                  size="lg"
                  className="shrink-0"
                />
                <div>
                  <h4 className="text-sm font-black text-foreground">
                    {quickViewMember.first_name_ar}{" "}
                    {quickViewMember.middle_name_ar ? quickViewMember.middle_name_ar + " " : ""}
                    {quickViewMember.last_name_ar}
                  </h4>
                  {quickViewMember.first_name_en && (
                    <span className="text-xs text-muted-foreground font-mono block">
                      {quickViewMember.first_name_en} {quickViewMember.last_name_en}
                    </span>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                      {quickViewMember.branch_id ? branchMap.get(quickViewMember.branch_id) : "—"}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      الجيل {quickViewMember.generation}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Key Attributes */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl border border-border bg-card">
                  <span className="text-muted-foreground text-[10px] block flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {isAr ? "المهنة والعمل" : "Occupation"}
                  </span>
                  <span className="font-semibold text-foreground mt-0.5 block">
                    {quickViewMember.occupation_ar || (isAr ? "غير محدد" : "Not specified")}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl border border-border bg-card">
                  <span className="text-muted-foreground text-[10px] block flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    {isAr ? "المؤهل التعليمي" : "Education"}
                  </span>
                  <span className="font-semibold text-foreground mt-0.5 block">
                    {quickViewMember.education_ar || (isAr ? "غير محدد" : "Not specified")}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl border border-border bg-card">
                  <span className="text-muted-foreground text-[10px] block flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {isAr ? "تاريخ الميلاد" : "Birth Date"}
                  </span>
                  <span className="font-mono font-semibold text-foreground mt-0.5 block">
                    {quickViewMember.date_of_birth || "—"}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl border border-border bg-card">
                  <span className="text-muted-foreground text-[10px] block flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {isAr ? "مستوى الخصوصية" : "Visibility"}
                  </span>
                  <span className="font-mono font-semibold text-foreground mt-0.5 block uppercase">
                    {quickViewMember.visibility}
                  </span>
                </div>
              </div>

              {/* Biography */}
              {quickViewMember.biography_ar && (
                <div className="p-3 rounded-xl border border-border bg-card space-y-1">
                  <span className="text-muted-foreground text-[10px] font-bold block">
                    {isAr ? "نبذة وسيرة موجزة" : "Biography"}
                  </span>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {quickViewMember.biography_ar}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const m = quickViewMember;
                  setQuickViewMember(null);
                  setSelectedMember(m);
                  setFormOpen(true);
                }}
              >
                <Edit2 className="w-3.5 h-3.5 me-1.5" />
                {isAr ? "تعديل الملف" : "Edit Profile"}
              </Button>
              <Button size="sm" onClick={() => setQuickViewMember(null)}>
                {isAr ? "إغلاق" : "Close"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 7. ADD / EDIT FULL FORM MODAL */}
      <FamilyMemberFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={selectedMember as any}
        branches={branches}
        places={places}
        existingMembers={paginatedMembers}
        onSave={onSaveMember}
      />
    </div>
  );
}
