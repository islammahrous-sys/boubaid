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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ConsolePager } from "@/components/console/common/ConsolePager";
import { usePaged } from "@/components/console/common/usePaged";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLang } from "@/i18n/LanguageProvider";
import { Plus, Trash2, Link2, Users, Loader2, Search } from "lucide-react";
import type { FamilyRelationshipInput } from "@/lib/admin-hub.schemas";
import { useConfirm } from "@/hooks/useConfirm";

type MemberOption = {
  id: string;
  first_name_ar: string;
  middle_name_ar?: string | null;
  last_name_ar: string;
};

type RelationshipItem = {
  id: string;
  person_id: string;
  related_person_id: string;
  relationship_type: "parent" | "child" | "spouse";
};

export function FamilyRelationshipsManager({
  members,
  relationships,
  filterMemberId,
  onSaveRelationship,
  onDeleteRelationship,
}: {
  members: MemberOption[];
  relationships: RelationshipItem[];
  filterMemberId?: string | null;
  onSaveRelationship: (data: FamilyRelationshipInput) => Promise<void>;
  onDeleteRelationship: (id: string) => Promise<void>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const confirm = useConfirm();

  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | RelationshipItem["relationship_type"]>(
    "all",
  );

  const [form, setForm] = useState<FamilyRelationshipInput>({
    person_id: filterMemberId ?? "",
    related_person_id: "",
    relationship_type: "parent",
  });

  const memberMap = useMemo(() => {
    const map = new Map<string, string>();
    members.forEach((m) =>
      map.set(
        m.id,
        `${m.first_name_ar} ${m.middle_name_ar ? m.middle_name_ar + " " : ""}${m.last_name_ar}`,
      ),
    );
    return map;
  }, [members]);

  // 1,098 links in the official dataset: search + type filter + paging instead
  // of one 50,000px table.
  const filtered = useMemo(() => {
    const q = query.trim();
    return relationships.filter((r) => {
      if (
        filterMemberId &&
        r.person_id !== filterMemberId &&
        r.related_person_id !== filterMemberId
      )
        return false;
      if (typeFilter !== "all" && r.relationship_type !== typeFilter) return false;
      if (!q) return true;
      return (
        (memberMap.get(r.person_id) ?? "").includes(q) ||
        (memberMap.get(r.related_person_id) ?? "").includes(q)
      );
    });
  }, [relationships, filterMemberId, typeFilter, query, memberMap]);
  const paged = usePaged(filtered, 30);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.person_id || !form.related_person_id) return;
    try {
      setLoading(true);
      await onSaveRelationship(form);
      setFormOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const getRelBadge = (type: RelationshipItem["relationship_type"]) => {
    switch (type) {
      case "parent":
        return (
          <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-500/30">
            {isAr ? "والد / والدة" : "Parent"}
          </Badge>
        );
      case "child":
        return (
          <Badge
            variant="outline"
            className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
          >
            {isAr ? "ابن / ابنة" : "Child"}
          </Badge>
        );
      case "spouse":
        return (
          <Badge variant="outline" className="text-pink-600 dark:text-pink-400 border-pink-500/30">
            {isAr ? "زوج / زوجة" : "Spouse"}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2.5">
          <Link2 className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {isAr ? "إدارة شجرة الروابط والعلاقات العائلية" : "Family Relationships"}
            </h3>
            {filterMemberId && memberMap.has(filterMemberId) && (
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? `تصفية لـ: ${memberMap.get(filterMemberId)}`
                  : `Filtered for: ${memberMap.get(filterMemberId)}`}
              </p>
            )}
          </div>
        </div>
        <Button size="sm" onClick={() => setFormOpen(true)} className="h-8 text-xs gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          {isAr ? "إضافة علاقة جديدة" : "Add Link"}
        </Button>
      </div>

      <div className="console-card flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isAr ? "ابحث باسم أحد الطرفين..." : "Search by either person's name..."}
            className="h-10 ps-9"
            aria-label={isAr ? "بحث في صلات القرابة" : "Search kinship links"}
          />
        </div>
        <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
          <SelectTrigger className="h-10 sm:w-48" aria-label={isAr ? "نوع الصلة" : "Link type"}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isAr ? "كل الصلات" : "All links"}</SelectItem>
            <SelectItem value="parent">{isAr ? "والد / والدة" : "Parent"}</SelectItem>
            <SelectItem value="child">{isAr ? "ابن / ابنة" : "Child"}</SelectItem>
            <SelectItem value="spouse">{isAr ? "زوج / زوجة" : "Spouse"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs">
              <TableHead>{isAr ? "الفرد الأول" : "Person"}</TableHead>
              <TableHead className="text-center">{isAr ? "نوع العلاقة" : "Relationship"}</TableHead>
              <TableHead>{isAr ? "الفرد المرتبط" : "Related Person"}</TableHead>
              <TableHead className="text-end">{isAr ? "إجراء" : "Action"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-28 text-center text-muted-foreground text-xs">
                  {isAr ? "لا توجد روابط عائلية مضافة" : "No relationships registered"}
                </TableCell>
              </TableRow>
            ) : (
              paged.slice.map((r) => (
                <TableRow key={r.id} className="text-xs hover:bg-muted/30">
                  <TableCell className="font-semibold text-foreground">
                    {memberMap.get(r.person_id) || "—"}
                  </TableCell>
                  <TableCell className="text-center">{getRelBadge(r.relationship_type)}</TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {memberMap.get(r.related_person_id) || "—"}
                  </TableCell>
                  <TableCell className="text-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-destructive hover:bg-destructive/10"
                      disabled={deletingId === r.id}
                      onClick={async () => {
                        const personName = memberMap.get(r.person_id) || "—";
                        const relatedName = memberMap.get(r.related_person_id) || "—";
                        if (
                          !(await confirm({
                            title: isAr ? "حذف هذه العلاقة العائلية؟" : "Delete this relationship?",
                            description: isAr
                              ? `سيتم حذف الرابط بين "${personName}" و"${relatedName}". لا يمكن التراجع عن هذا الإجراء.`
                              : `This will remove the link between "${personName}" and "${relatedName}". This can't be undone.`,
                            tone: "destructive",
                          }))
                        ) {
                          return;
                        }
                        setDeletingId(r.id);
                        try {
                          await onDeleteRelationship(r.id);
                        } finally {
                          setDeletingId(null);
                        }
                      }}
                    >
                      {deletingId === r.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <ConsolePager
          page={paged.page}
          pageCount={paged.pageCount}
          total={paged.total}
          pageSize={paged.pageSize}
          onPage={paged.setPage}
          isAr={isAr}
          className="border-t border-[var(--console-hairline)]"
        />
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {isAr ? "ربط علاقة قرابة عائلية" : "Create Family Relationship"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">{isAr ? "الفرد الأول *" : "Person *"}</Label>
              <Select
                value={form.person_id}
                onValueChange={(val) => setForm({ ...form, person_id: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isAr ? "اختر الفرد" : "Select person"} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {memberMap.get(m.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">
                {isAr ? "هو / هي بالنسبة للطرف الثاني *" : "Is the following to *"}
              </Label>
              <Select
                value={form.relationship_type}
                onValueChange={(val: any) => setForm({ ...form, relationship_type: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">
                    {isAr ? "والد / والدة (Parent)" : "Parent"}
                  </SelectItem>
                  <SelectItem value="child">{isAr ? "ابن / ابنة (Child)" : "Child"}</SelectItem>
                  <SelectItem value="spouse">{isAr ? "زوج / زوجة (Spouse)" : "Spouse"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">{isAr ? "الفرد المرتبط به *" : "Related Person *"}</Label>
              <Select
                value={form.related_person_id}
                onValueChange={(val) => setForm({ ...form, related_person_id: val })}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={isAr ? "اختر الفرد المرتبط" : "Select related person"}
                  />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {members
                    .filter((m) => m.id !== form.person_id)
                    .map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {memberMap.get(m.id)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setFormOpen(false)}>
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
                {loading
                  ? isAr
                    ? "جاري الحفظ..."
                    : "Saving..."
                  : isAr
                    ? "حفظ العلاقة"
                    : "Save Link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
