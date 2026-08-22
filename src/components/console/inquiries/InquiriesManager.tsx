import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLang } from "@/i18n/LanguageProvider";
import { MessageSquare, Mail, Phone, Clock, Plus, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type InquiryRow = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: string;
  assigned_to?: string | null;
  source: string;
  created_at: string;
  /** Which underlying table this row came from -- the admin notes workflow
   * and status options only apply to `inquiries` rows; `contact_messages`
   * rows (real website contact-form submissions) use their own status set
   * and have no notes table to write to. */
  source_table: "inquiries" | "contact_messages";
};

export type InquiryNoteRow = {
  id: string;
  inquiry_id: string;
  author_id?: string | null;
  note: string;
  created_at: string;
};

export function InquiriesManager({
  inquiries,
  notes,
  onUpdateStatus,
  onAddNote,
}: {
  inquiries: InquiryRow[];
  notes: InquiryNoteRow[];
  onUpdateStatus: (
    id: string,
    status: "new" | "open" | "in_progress" | "resolved" | "spam" | "read" | "archived",
    sourceTable: "inquiries" | "contact_messages"
  ) => Promise<void>;
  onAddNote: (inquiryId: string, note: string) => Promise<void>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryRow | null>(null);
  const [newNote, setNewNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "new":
        return <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px] font-bold">{isAr ? "جديدة" : "New"}</Badge>;
      case "open":
        return <Badge variant="secondary" className="text-[10px]">{isAr ? "مفتوحة" : "Open"}</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="text-amber-600 border-amber-500/30 text-[10px]">{isAr ? "قيد المتابعة" : "In Progress"}</Badge>;
      case "resolved":
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold">{isAr ? "تم الرد" : "Resolved"}</Badge>;
      case "spam":
        return <Badge variant="outline" className="text-destructive text-[10px]">{isAr ? "مزعجة" : "Spam"}</Badge>;
      case "read":
        return <Badge variant="secondary" className="text-[10px]">{isAr ? "مقروءة" : "Read"}</Badge>;
      case "archived":
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold">{isAr ? "مؤرشفة" : "Archived"}</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{st}</Badge>;
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      inq.name.toLowerCase().includes(q) ||
      inq.email.toLowerCase().includes(q) ||
      (inq.subject || "").toLowerCase().includes(q) ||
      inq.message.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    return statusFilter === "all" || inq.status === statusFilter;
  });

  const currentNotes = selectedInquiry
    ? notes.filter((n) => n.inquiry_id === selectedInquiry.id)
    : [];

  const handleAddNoteSubmit = async () => {
    if (!selectedInquiry || !newNote.trim()) return;
    try {
      setSubmittingNote(true);
      await onAddNote(selectedInquiry.id, newNote.trim());
      setNewNote("");
      toast.success(isAr ? "تمت إضافة الملاحظة" : "Note added");
    } finally {
      setSubmittingNote(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {isAr ? "صندوق رسائل واستفسارات التواصل" : "Inquiries & Contact Messages"}
            </h3>
            <span className="text-[11px] text-muted-foreground font-mono">
              {filteredInquiries.length} {isAr ? "رسالة" : "messages"}
            </span>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label_ar: "الكل", label_en: "All", count: inquiries.length },
            { id: "new", label_ar: "الرسائل الجديدة", label_en: "New", count: inquiries.filter((i) => i.status === "new").length, isAlert: true },
            { id: "in_progress", label_ar: "قيد المتابعة", label_en: "In Progress", count: inquiries.filter((i) => i.status === "in_progress" || i.status === "open").length },
            { id: "resolved", label_ar: "تم الرد والإنهاء", label_en: "Resolved", count: inquiries.filter((i) => i.status === "resolved" || i.status === "read").length },
            { id: "archived", label_ar: "المؤرشفة", label_en: "Archived", count: inquiries.filter((i) => i.status === "archived").length },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={statusFilter === tab.id ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-8 text-xs gap-1.5 rounded-lg font-medium",
                statusFilter !== tab.id && tab.isAlert && tab.count > 0 && "border-blue-500/40 text-blue-600 bg-blue-500/5 hover:bg-blue-500/10"
              )}
              onClick={() => setStatusFilter(tab.id)}
            >
              <span>{isAr ? tab.label_ar : tab.label_en}</span>
              <Badge
                variant={statusFilter === tab.id ? "secondary" : "outline"}
                className={cn("h-4 px-1.5 text-[9px] font-mono", tab.isAlert && tab.count > 0 && "bg-blue-500 text-white font-bold")}
              >
                {tab.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[200px]">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? "بحث بالمرسل أو الموضوع..." : "Search inquiries..."}
            className="h-8 px-3 rounded-lg border border-border bg-background text-xs text-foreground outline-none focus:border-primary w-full"
          />
        </div>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs">
              <TableHead>{isAr ? "المرسل" : "Sender"}</TableHead>
              <TableHead>{isAr ? "الموضوع" : "Subject"}</TableHead>
              <TableHead>{isAr ? "التاريخ" : "Date"}</TableHead>
              <TableHead className="text-center">{isAr ? "الحالة" : "Status"}</TableHead>
              <TableHead className="text-end">{isAr ? "معاينة" : "View"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center text-muted-foreground text-xs">
                  {isAr ? "لا توجد رسائل مسجلة في هذا القسم" : "No inquiries found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredInquiries.map((inq) => (
                <TableRow key={inq.id} className="text-xs hover:bg-muted/30">
                  <TableCell>
                    <span className="font-semibold text-foreground block">{inq.name}</span>
                    <span className="text-[11px] text-muted-foreground font-mono">{inq.email}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground block">{inq.subject || (isAr ? "استفسار عام" : "General Inquiry")}</span>
                    <span className="text-[11px] text-muted-foreground line-clamp-1">{inq.message}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono">
                    {new Date(inq.created_at).toLocaleDateString(isAr ? "ar-SA" : "en-US")}
                  </TableCell>
                  <TableCell className="text-center">{getStatusBadge(inq.status)}</TableCell>
                  <TableCell className="text-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setSelectedInquiry(inq)}
                    >
                      {isAr ? "فتح الرسالة" : "Open"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Inquiry Detail Dialog with Notes */}
      {selectedInquiry && (
        <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center justify-between">
                <span>{selectedInquiry.subject || (isAr ? "استفسار تواصل" : "Contact Inquiry")}</span>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedInquiry.status}
                    onValueChange={async (val: any) => {
                      await onUpdateStatus(selectedInquiry.id, val, selectedInquiry.source_table);
                      setSelectedInquiry((prev) => prev ? { ...prev, status: val } : null);
                    }}
                  >
                    <SelectTrigger className="h-7 text-xs w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedInquiry.source_table === "contact_messages" ? (
                        <>
                          <SelectItem value="new">{isAr ? "جديدة" : "New"}</SelectItem>
                          <SelectItem value="read">{isAr ? "مقروءة" : "Read"}</SelectItem>
                          <SelectItem value="archived">{isAr ? "مؤرشفة" : "Archived"}</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="new">{isAr ? "جديدة" : "New"}</SelectItem>
                          <SelectItem value="open">{isAr ? "مفتوحة" : "Open"}</SelectItem>
                          <SelectItem value="in_progress">{isAr ? "قيد المتابعة" : "In Progress"}</SelectItem>
                          <SelectItem value="resolved">{isAr ? "تم الرد" : "Resolved"}</SelectItem>
                          <SelectItem value="spam">{isAr ? "مزعجة" : "Spam"}</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-muted/20 border border-border rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{selectedInquiry.name}</span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {new Date(selectedInquiry.created_at).toLocaleString(isAr ? "ar-SA" : "en-US")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-muted-foreground text-[11px]">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {selectedInquiry.email}</span>
                  {selectedInquiry.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {selectedInquiry.phone}</span>}
                </div>
              </div>

              <div className="p-4 bg-card border border-border rounded-xl">
                <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                  {selectedInquiry.message}
                </p>
              </div>

              {/* Internal Notes Section -- only available for `inquiries` rows;
                  `contact_messages` (website contact form) has no notes table. */}
              {selectedInquiry.source_table === "inquiries" ? (
                <div className="space-y-2 pt-2 border-t border-border">
                  <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    {isAr ? "الملاحظات الإدارية الداخلية" : "Internal Admin Notes"}
                  </h4>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {currentNotes.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground">{isAr ? "لا توجد ملاحظات داخلية مضافة" : "No internal notes yet"}</p>
                    ) : (
                      currentNotes.map((n) => (
                        <div key={n.id} className="p-2.5 rounded-lg bg-muted/40 border border-border text-[11px]">
                          <p className="text-foreground">{n.note}</p>
                          <span className="text-[9px] text-muted-foreground mt-1 block font-mono">
                            {new Date(n.created_at).toLocaleString(isAr ? "ar-SA" : "en-US")}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Textarea
                      rows={2}
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder={isAr ? "اكتب ملاحظة داخلية للأمانة..." : "Add internal note..."}
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      disabled={submittingNote || !newNote.trim()}
                      onClick={handleAddNoteSubmit}
                      className="shrink-0 text-xs gap-1"
                    >
                      <Send className="w-3 h-3" />
                      {isAr ? "إضافة" : "Add"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-border">
                  <p className="text-[11px] text-muted-foreground">
                    {isAr
                      ? "الملاحظات الداخلية غير متاحة لرسائل نموذج التواصل في الموقع"
                      : "Internal notes aren't available for website contact-form messages"}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedInquiry(null)}>
                {isAr ? "إغلاق" : "Close"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
