import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/i18n/LanguageProvider";
import { Plus, Edit2, Layers, Globe, Eye } from "lucide-react";
import { PageBuilderDialog } from "./PageBuilderDialog";
import type { ContentPageInput, ContentSectionInput } from "@/lib/admin-hub.schemas";

export type PageRow = {
  id: string;
  slug: string;
  slug_ar?: string | null;
  title_ar: string;
  title_en?: string | null;
  excerpt_ar?: string | null;
  excerpt_en?: string | null;
  featured_media_path?: string | null;
  seo_title_ar?: string | null;
  seo_title_en?: string | null;
  seo_description_ar?: string | null;
  seo_description_en?: string | null;
  canonical_url?: string | null;
  no_index?: boolean;
  status: "draft" | "in_review" | "scheduled" | "published" | "archived";
  visibility: "public" | "family_only" | "admin_only" | "private";
  template: string;
  updated_at: string;
};

export type RevisionRow = {
  id: string;
  content_page_id: string;
  version: number;
  change_summary?: string | null;
  created_at: string;
};

export function PagesManager({
  pages,
  sections,
  revisions,
  onSavePage,
}: {
  pages: PageRow[];
  sections: { id: string; page_id: string; type: string; sort_order: number; data: any; settings: any; visibility: any }[];
  revisions: RevisionRow[];
  onSavePage: (data: ContentPageInput) => Promise<void>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const [builderOpen, setBuilderOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<ContentPageInput | null>(null);

  const handleCreateNew = () => {
    setSelectedPage(null);
    setBuilderOpen(true);
  };

  const handleEdit = (p: PageRow) => {
    const pageSections = sections
      .filter((s) => s.page_id === p.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((s) => ({
        type: s.type,
        sort_order: s.sort_order,
        data: s.data,
        settings: s.settings,
        visibility: s.visibility,
      }));

    setSelectedPage({
      ...p,
      no_index: p.no_index ?? false,
      sections: pageSections,
    });
    setBuilderOpen(true);
  };

  const getStatusBadge = (st: PageRow["status"]) => {
    switch (st) {
      case "published":
        return <Badge className="bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">{isAr ? "منشور" : "Published"}</Badge>;
      case "draft":
        return <Badge variant="secondary" className="text-[10px]">{isAr ? "مسودة" : "Draft"}</Badge>;
      case "in_review":
        return <Badge variant="outline" className="text-amber-600 border-amber-500/30 text-[10px]">{isAr ? "قيد المراجعة" : "In Review"}</Badge>;
      case "archived":
        return <Badge variant="outline" className="text-zinc-400 text-[10px]">{isAr ? "مؤرشف" : "Archived"}</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{st}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            {isAr ? "إدارة وتصميم صفحات الموقع (CMS Pages)" : "CMS Pages"}
          </h3>
        </div>
        <Button size="sm" onClick={handleCreateNew} className="h-8 text-xs gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          {isAr ? "إنشاء صفحة جديدة" : "New Page"}
        </Button>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs">
              <TableHead>{isAr ? "عنوان الصفحة" : "Title"}</TableHead>
              <TableHead>{isAr ? "الرابط (Slug)" : "Slug"}</TableHead>
              <TableHead className="text-center">{isAr ? "الأقسام" : "Blocks"}</TableHead>
              <TableHead className="text-center">{isAr ? "الإصدارات" : "Revisions"}</TableHead>
              <TableHead className="text-center">{isAr ? "الحالة" : "Status"}</TableHead>
              <TableHead className="text-end">{isAr ? "إجراءات" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-muted-foreground text-xs">
                  {isAr ? "لا توجد صفحات منشأة بعد" : "No CMS pages created yet"}
                </TableCell>
              </TableRow>
            ) : (
              pages.map((page) => {
                const blockCount = sections.filter((s) => s.page_id === page.id).length;
                const revCount = revisions.filter((r) => r.content_page_id === page.id).length;

                return (
                  <TableRow key={page.id} className="text-xs hover:bg-muted/30">
                    <TableCell className="font-semibold text-foreground">{page.title_ar}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">/{page.slug}</TableCell>
                    <TableCell className="text-center font-mono">{blockCount}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        v{revCount || 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge(page.status)}</TableCell>
                    <TableCell className="text-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEdit(page)}
                        title={isAr ? "تعديل الصفحة وبناء الكتل" : "Edit Page & Blocks"}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <PageBuilderDialog
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        initialData={selectedPage}
        onSave={onSavePage}
      />
    </div>
  );
}
