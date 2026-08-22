import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLang } from "@/i18n/LanguageProvider";
import { Plus, Edit2, Bell } from "lucide-react";
import { toast } from "sonner";
import type { AnnouncementInput } from "@/lib/admin-hub.schemas";

export type AnnouncementRow = {
  id: string;
  title_ar: string;
  title_en?: string | null;
  message_ar: string;
  message_en?: string | null;
  type: "info" | "success" | "warning" | "important";
  priority: "low" | "normal" | "high" | "urgent";
  start_at?: string | null;
  end_at?: string | null;
  status: string;
  created_at: string;
};

export function AnnouncementsManager({
  announcements,
  onSaveAnnouncement,
}: {
  announcements: AnnouncementRow[];
  onSaveAnnouncement: (data: AnnouncementInput) => Promise<void>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const [formOpen, setFormOpen] = useState(false);
  const [selectedAnn, setSelectedAnn] = useState<AnnouncementRow | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<AnnouncementInput>({
    id: undefined,
    title_ar: "",
    title_en: "",
    message_ar: "",
    message_en: "",
    type: "info",
    priority: "normal",
    status: "published",
    start_at: "",
    end_at: "",
  });

  const handleOpenAdd = () => {
    setSelectedAnn(null);
    setForm({
      id: undefined,
      title_ar: "",
      title_en: "",
      message_ar: "",
      message_en: "",
      type: "info",
      priority: "normal",
      status: "published",
      start_at: "",
      end_at: "",
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (ann: AnnouncementRow) => {
    setSelectedAnn(ann);
    setForm({
      id: ann.id,
      title_ar: ann.title_ar,
      title_en: ann.title_en ?? "",
      message_ar: ann.message_ar,
      message_en: ann.message_en ?? "",
      type: ann.type,
      priority: ann.priority,
      status: ann.status as any,
      start_at: ann.start_at ? ann.start_at.slice(0, 16) : "",
      end_at: ann.end_at ? ann.end_at.slice(0, 16) : "",
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title_ar.trim() || !form.message_ar.trim()) return;
    try {
      setLoading(true);
      await onSaveAnnouncement({
        ...form,
        start_at: form.start_at ? new Date(form.start_at).toISOString() : null,
        end_at: form.end_at ? new Date(form.end_at).toISOString() : null,
      });
      setFormOpen(false);
    } catch (err: any) {
      toast.error(err?.message || (isAr ? "فشل حفظ الإعلان" : "Failed to save the announcement"));
    } finally {
      setLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredAnnouncements = announcements.filter((ann) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      ann.title_ar.toLowerCase().includes(q) ||
      (ann.title_en || "").toLowerCase().includes(q) ||
      ann.message_ar.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    return priorityFilter === "all" || ann.priority === priorityFilter;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2.5">
          <Bell className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {isAr ? "شريط التنبيهات والإعلانات العامة" : "Announcements & Alerts"}
            </h3>
            <span className="text-[11px] text-muted-foreground font-mono">
              {filteredAnnouncements.length} {isAr ? "إعلان" : "announcements"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? "بحث في الإعلانات..." : "Search announcements..."}
            className="h-8 px-3 rounded-lg border border-border bg-background text-xs text-foreground outline-none focus:border-primary w-40 sm:w-48"
          />
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isAr ? "كل الأولويات" : "All Priorities"}</SelectItem>
              <SelectItem value="urgent">{isAr ? "عاجل" : "Urgent"}</SelectItem>
              <SelectItem value="high">{isAr ? "مرتفع" : "High"}</SelectItem>
              <SelectItem value="normal">{isAr ? "عادي" : "Normal"}</SelectItem>
              <SelectItem value="low">{isAr ? "منخفض" : "Low"}</SelectItem>
            </SelectContent>
          </Select>

          <Button size="sm" onClick={handleOpenAdd} className="h-8 text-xs gap-1.5 font-bold">
            <Plus className="w-3.5 h-3.5" />
            {isAr ? "إضافة إعلان" : "New"}
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs">
              <TableHead>{isAr ? "عنوان الإعلان" : "Title"}</TableHead>
              <TableHead>{isAr ? "النوع" : "Type"}</TableHead>
              <TableHead className="text-center">{isAr ? "الأولوية" : "Priority"}</TableHead>
              <TableHead className="text-center">{isAr ? "الحالة" : "Status"}</TableHead>
              <TableHead className="text-end">{isAr ? "إجراء" : "Action"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAnnouncements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center text-muted-foreground text-xs">
                  {isAr ? "لا توجد إعلانات مطابقة" : "No announcements matched"}
                </TableCell>
              </TableRow>
            ) : (
              filteredAnnouncements.map((ann) => (
                <TableRow key={ann.id} className="text-xs hover:bg-muted/30">
                  <TableCell>
                    <span className="font-semibold text-foreground block">{ann.title_ar}</span>
                    <span className="text-[11px] text-muted-foreground line-clamp-1">{ann.message_ar}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {ann.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={ann.priority === "urgent" || ann.priority === "high" ? "destructive" : "secondary"} className="text-[10px]">
                      {ann.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="text-[10px]">{ann.status}</Badge>
                  </TableCell>
                  <TableCell className="text-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenEdit(ann)}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {selectedAnn ? (isAr ? "تعديل إعلان" : "Edit Announcement") : isAr ? "إضافة إعلان جديد" : "New Announcement"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "عنوان الإعلان بالعربية *" : "Title (AR) *"}</Label>
              <Input
                required
                value={form.title_ar}
                onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
                placeholder="مثال: تعميم بخصوص موعد انعقاد الجمعية العمومية"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "نوع الإعلان" : "Type"}</Label>
                <Select value={form.type} onValueChange={(val: any) => setForm({ ...form, type: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">{isAr ? "معلوماتي (Info)" : "Info"}</SelectItem>
                    <SelectItem value="important">{isAr ? "هام (Important)" : "Important"}</SelectItem>
                    <SelectItem value="warning">{isAr ? "تنبيه (Warning)" : "Warning"}</SelectItem>
                    <SelectItem value="success">{isAr ? "تهنئة (Success)" : "Success"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "الأولوية" : "Priority"}</Label>
                <Select value={form.priority} onValueChange={(val: any) => setForm({ ...form, priority: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">{isAr ? "عادية (Normal)" : "Normal"}</SelectItem>
                    <SelectItem value="high">{isAr ? "مرتفعة (High)" : "High"}</SelectItem>
                    <SelectItem value="urgent">{isAr ? "عاجلة (Urgent)" : "Urgent"}</SelectItem>
                    <SelectItem value="low">{isAr ? "منخفضة (Low)" : "Low"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "نص الإعلان والرسالة *" : "Message *"}</Label>
              <Textarea
                rows={4}
                required
                value={form.message_ar}
                onChange={(e) => setForm({ ...form, message_ar: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "الحالة" : "Status"}</Label>
              <Select value={form.status} onValueChange={(val: any) => setForm({ ...form, status: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{isAr ? "مسودة" : "Draft"}</SelectItem>
                  <SelectItem value="published">{isAr ? "منشور" : "Published"}</SelectItem>
                  <SelectItem value="archived">{isAr ? "مؤرشف" : "Archived"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "يبدأ في (اختياري)" : "Starts at (optional)"}</Label>
                <Input
                  type="datetime-local"
                  value={form.start_at ?? ""}
                  onChange={(e) => setForm({ ...form, start_at: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "ينتهي في (اختياري)" : "Ends at (optional)"}</Label>
                <Input
                  type="datetime-local"
                  value={form.end_at ?? ""}
                  onChange={(e) => setForm({ ...form, end_at: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setFormOpen(false)}>
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? (isAr ? "جاري الحفظ..." : "Saving...") : isAr ? "نشر الإعلان" : "Publish"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
