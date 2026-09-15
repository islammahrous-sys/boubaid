import { formatDualDateTime } from "@/lib/dates";
import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLang } from "@/i18n/LanguageProvider";
import { useConfirm } from "@/hooks/useConfirm";
import {
  Plus,
  Edit2,
  Calendar,
  MapPin,
  Users,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { slugify } from "@/lib/slugify";
import type { EventInput } from "@/lib/admin-hub.schemas";

export type EventRow = {
  id: string;
  slug: string;
  title_ar: string;
  title_en?: string | null;
  description_ar?: string | null;
  description_en?: string | null;
  start_at: string;
  end_at?: string | null;
  place_id?: string | null;
  registration_enabled: boolean;
  max_attendees?: number | null;
  status: string;
};

// Events are always scheduled in Asia/Riyadh (fixed UTC+3, no DST) regardless
// of the admin's own browser timezone, so `<input type="datetime-local">` —
// which always reads/writes local wall-clock time — needs an explicit offset
// conversion rather than relying on the browser's own timezone.
const RIYADH_OFFSET_MINUTES = 3 * 60;

/** UTC ISO timestamp (from the DB) -> the Riyadh wall-clock value a datetime-local input expects. */
function toRiyadhLocalInput(iso: string): string {
  return new Date(new Date(iso).getTime() + RIYADH_OFFSET_MINUTES * 60000)
    .toISOString()
    .slice(0, 16);
}

/** A datetime-local value (entered as Riyadh wall-clock time) -> a UTC ISO timestamp for the DB. */
function fromRiyadhLocalInput(value: string): string {
  return new Date(new Date(`${value}:00Z`).getTime() - RIYADH_OFFSET_MINUTES * 60000).toISOString();
}

export type EventRegistrationRow = {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone?: string | null;
  attendees_count: number;
  status: string;
  created_at: string;
};

export function EventsManager({
  events,
  registrations,
  places,
  onSaveEvent,
  onUpdateRegistrationStatus,
  onDeleteRegistration,
}: {
  events: EventRow[];
  registrations: EventRegistrationRow[];
  places: { id: string; name_ar: string }[];
  onSaveEvent: (data: EventInput) => Promise<void>;
  onUpdateRegistrationStatus?: (
    id: string,
    status: "registered" | "attended" | "cancelled" | "waitlist",
  ) => Promise<void>;
  onDeleteRegistration?: (id: string) => Promise<void>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const confirm = useConfirm();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null);
  const [attendeesModalOpen, setAttendeesModalOpen] = useState(false);
  const [activeEventForAttendees, setActiveEventForAttendees] = useState<EventRow | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<EventInput>({
    id: undefined,
    slug: "",
    title_ar: "",
    title_en: "",
    description_ar: "",
    description_en: "",
    start_at: "",
    end_at: "",
    timezone: "Asia/Riyadh",
    place_id: null,
    registration_enabled: false,
    max_attendees: null,
    status: "published",
  });

  const handleOpenAdd = () => {
    setSelectedEvent(null);
    setForm({
      id: undefined,
      slug: "",
      title_ar: "",
      title_en: "",
      description_ar: "",
      description_en: "",
      start_at: toRiyadhLocalInput(new Date().toISOString()),
      end_at: "",
      timezone: "Asia/Riyadh",
      place_id: null,
      registration_enabled: false,
      max_attendees: null,
      status: "published",
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (evt: EventRow) => {
    setSelectedEvent(evt);
    setForm({
      id: evt.id,
      slug: evt.slug,
      title_ar: evt.title_ar,
      title_en: evt.title_en ?? "",
      description_ar: evt.description_ar ?? "",
      description_en: evt.description_en ?? "",
      start_at: evt.start_at ? toRiyadhLocalInput(evt.start_at) : "",
      end_at: evt.end_at ? toRiyadhLocalInput(evt.end_at) : "",
      timezone: "Asia/Riyadh",
      place_id: evt.place_id ?? null,
      registration_enabled: evt.registration_enabled,
      max_attendees: evt.max_attendees ?? null,
      status: (evt.status as any) || "published",
    });
    setFormOpen(true);
  };

  const handleOpenAttendees = (evt: EventRow) => {
    setActiveEventForAttendees(evt);
    setAttendeesModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title_ar.trim()) return;
    try {
      setLoading(true);
      await onSaveEvent({
        ...form,
        start_at: fromRiyadhLocalInput(form.start_at),
        end_at: form.end_at ? fromRiyadhLocalInput(form.end_at) : form.end_at,
      });
      setFormOpen(false);
      toast.success(isAr ? "تم حفظ الفعالية بنجاح" : "Event saved successfully");
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل حفظ الفعالية" : "Failed to save event"));
    } finally {
      setLoading(false);
    }
  };

  const eventAttendees = activeEventForAttendees
    ? registrations.filter((r) => r.event_id === activeEventForAttendees.id)
    : [];

  const exportAttendeesCsv = () => {
    if (!activeEventForAttendees || eventAttendees.length === 0) return;
    const headers = ["Name", "Email", "Phone", "Guests Count", "Status", "Registered At"];
    const rows = eventAttendees.map((a) => [
      `"${a.name}"`,
      `"${a.email}"`,
      `"${a.phone || ""}"`,
      a.attendees_count,
      a.status,
      `"${a.created_at}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendees_${activeEventForAttendees.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(isAr ? "تم تصدير قائمة المسجلين بنجاح" : "Attendees exported");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            {isAr ? "إدارة الفعاليات واللقاءات والتسجيل" : "Events & Attendance"}
          </h3>
        </div>
        <Button size="sm" onClick={handleOpenAdd} className="h-8 text-xs gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          {isAr ? "إضافة فعالية جديدة" : "Add Event"}
        </Button>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs">
              <TableHead>{isAr ? "عنوان الفعالية" : "Event Title"}</TableHead>
              <TableHead>{isAr ? "الموعد" : "Date & Time"}</TableHead>
              <TableHead>{isAr ? "المكان" : "Place"}</TableHead>
              <TableHead className="text-center">
                {isAr ? "التسجيل والمقاعد" : "Registrations"}
              </TableHead>
              <TableHead className="text-center">{isAr ? "الحالة" : "Status"}</TableHead>
              <TableHead className="text-end">{isAr ? "إجراءات" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-muted-foreground text-xs">
                  {isAr ? "لا توجد فعاليات مسجلة" : "No events found"}
                </TableCell>
              </TableRow>
            ) : (
              events.map((evt) => {
                const regCount = registrations.filter((r) => r.event_id === evt.id).length;
                return (
                  <TableRow key={evt.id} className="text-xs hover:bg-muted/30">
                    <TableCell className="font-semibold text-foreground">{evt.title_ar}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {formatDualDateTime(evt.start_at, isAr ? "ar" : "en")}
                    </TableCell>
                    <TableCell>
                      {places.find((p) => p.id === evt.place_id)?.name_ar || "—"}
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {evt.registration_enabled ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] gap-1 text-primary hover:underline"
                          onClick={() => handleOpenAttendees(evt)}
                        >
                          <Users className="w-3 h-3" />
                          {regCount} / {evt.max_attendees || "∞"} {isAr ? "مسجل" : "registered"}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">
                          {isAr ? "مغلق" : "Off"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-[10px]">
                        {evt.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex items-center justify-end gap-1">
                        {evt.registration_enabled && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-7 h-7 text-primary hover:bg-primary/10"
                            title={isAr ? "عرض المسجلين" : "View Attendees"}
                            onClick={() => handleOpenAttendees(evt)}
                          >
                            <Users className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-muted-foreground hover:text-foreground"
                          onClick={() => handleOpenEdit(evt)}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit / Add Event Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {selectedEvent
                ? isAr
                  ? "تعديل فعالية"
                  : "Edit Event"
                : isAr
                  ? "إضافة فعالية جديدة"
                  : "Add Event"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">
                {isAr ? "عنوان الفعالية بالعربية *" : "Event Title (AR) *"}
              </Label>
              <Input
                required
                value={form.title_ar}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    title_ar: val,
                    slug: prev.slug || slugify(val),
                  }));
                }}
                placeholder="مثال: اللقاء السنوي لأسرة آل بوعبيد"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "المعرف الفريد (Slug) — يُنشأ تلقائياً" : "Slug (auto-generated)"}</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder={slugify(form.title_ar) || "يُنشأ تلقائياً من العنوان العربي"}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "المكان" : "Place"}</Label>
                <Select
                  value={form.place_id ?? "none"}
                  onValueChange={(val) =>
                    setForm({ ...form, place_id: val === "none" ? null : val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isAr ? "اختر المكان" : "Select place"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{isAr ? "غير محدد / افتراضي" : "None"}</SelectItem>
                    {places.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name_ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "وقت البدء *" : "Start Time *"}</Label>
                <Input
                  type="datetime-local"
                  required
                  value={form.start_at}
                  onChange={(e) => setForm({ ...form, start_at: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "وقت الانتهاء" : "End Time"}</Label>
                <Input
                  type="datetime-local"
                  value={form.end_at ?? ""}
                  onChange={(e) => setForm({ ...form, end_at: e.target.value })}
                />
              </div>
            </div>

            <div className="p-3 bg-muted/20 border border-border rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-semibold">
                    {isAr ? "تفعيل تسجيل الحضور" : "Enable Registration"}
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    {isAr ? "السماح لأبناء الأسرة بالتسجيل المسبق" : "Allow members to RSVP"}
                  </p>
                </div>
                <Switch
                  checked={form.registration_enabled}
                  onCheckedChange={(c) => setForm({ ...form, registration_enabled: c })}
                />
              </div>

              {form.registration_enabled && (
                <div className="space-y-1">
                  <Label className="text-xs">
                    {isAr ? "الحد الأقصى للحضور (اختياري)" : "Max Attendees"}
                  </Label>
                  <Input
                    type="number"
                    value={form.max_attendees ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, max_attendees: parseInt(e.target.value) || null })
                    }
                    placeholder="100"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "الحالة" : "Status"}</Label>
              <Select
                value={form.status}
                onValueChange={(val: any) => setForm({ ...form, status: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{isAr ? "مسودة" : "Draft"}</SelectItem>
                  <SelectItem value="published">{isAr ? "منشورة" : "Published"}</SelectItem>
                  <SelectItem value="cancelled">{isAr ? "ملغاة" : "Cancelled"}</SelectItem>
                  <SelectItem value="completed">{isAr ? "منتهية" : "Completed"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "تفاصيل وبرنامج الفعالية" : "Description"}</Label>
              <Textarea
                rows={4}
                value={form.description_ar ?? ""}
                onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
              />
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
                    ? "حفظ الفعالية"
                    : "Save Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Attendees Dialog */}
      {activeEventForAttendees && (
        <Dialog open={attendeesModalOpen} onOpenChange={setAttendeesModalOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  {isAr
                    ? `قائمة المسجلين: ${activeEventForAttendees.title_ar}`
                    : `Attendees: ${activeEventForAttendees.title_ar}`}
                </DialogTitle>
                {eventAttendees.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={exportAttendeesCsv}
                  >
                    <Download className="w-3 h-3" />
                    {isAr ? "تصدير CSV" : "Export"}
                  </Button>
                )}
              </div>
            </DialogHeader>

            <div className="space-y-3">
              <div className="border border-border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 text-xs">
                      <TableHead>{isAr ? "الاسم" : "Name"}</TableHead>
                      <TableHead>{isAr ? "البريد والهاتف" : "Contact"}</TableHead>
                      <TableHead className="text-center">{isAr ? "المرافقين" : "Guests"}</TableHead>
                      <TableHead className="text-center">{isAr ? "الحالة" : "Status"}</TableHead>
                      <TableHead className="text-end">{isAr ? "إجراء" : "Action"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventAttendees.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-24 text-center text-muted-foreground text-xs"
                        >
                          {isAr ? "لم يسجل أحد في هذه الفعالية بعد" : "No attendees registered yet"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      eventAttendees.map((a) => (
                        <TableRow key={a.id} className="text-xs hover:bg-muted/30">
                          <TableCell className="font-semibold">{a.name}</TableCell>
                          <TableCell className="font-mono text-muted-foreground">
                            <span>{a.email}</span>
                            {a.phone && <span className="block text-[10px]">{a.phone}</span>}
                          </TableCell>
                          <TableCell className="text-center font-mono">
                            {a.attendees_count}
                          </TableCell>
                          <TableCell className="text-center">
                            <Select
                              value={a.status}
                              onValueChange={async (val: any) => {
                                if (val === "cancelled") {
                                  if (
                                    !(await confirm({
                                      title: isAr
                                        ? `إلغاء تسجيل "${a.name}"؟`
                                        : `Cancel ${a.name}'s registration?`,
                                      description: isAr
                                        ? "سيتم وضع علامة (اعتذر) على هذا التسجيل وقد يفسح مكانه لأحد المسجلين في قائمة الانتظار."
                                        : "This registration will be marked as cancelled, which may free up a spot for someone on the waitlist.",
                                      tone: "destructive",
                                    }))
                                  )
                                    return;
                                }
                                if (onUpdateRegistrationStatus) {
                                  await onUpdateRegistrationStatus(a.id, val);
                                  toast.success(isAr ? "تم تحديث حالة الحضور" : "Status updated");
                                }
                              }}
                            >
                              <SelectTrigger className="h-6 text-[10px] w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="registered">
                                  {isAr ? "مسجل" : "Registered"}
                                </SelectItem>
                                <SelectItem value="attended">
                                  {isAr ? "حضر" : "Attended"}
                                </SelectItem>
                                <SelectItem value="cancelled">
                                  {isAr ? "اعتذر" : "Cancelled"}
                                </SelectItem>
                                <SelectItem value="waitlist">
                                  {isAr ? "انتظار" : "Waitlist"}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-6 h-6 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                              onClick={async () => {
                                if (
                                  !(await confirm({
                                    title: isAr
                                      ? `حذف تسجيل "${a.name}"؟`
                                      : `Delete ${a.name}'s registration?`,
                                    description: isAr
                                      ? "سيتم حذف هذا التسجيل نهائيًا من قائمة المسجلين لهذه الفعالية ولا يمكن التراجع عن هذا الإجراء."
                                      : "This registration will be permanently removed from this event's attendee list. This can't be undone.",
                                    tone: "destructive",
                                  }))
                                )
                                  return;
                                if (onDeleteRegistration) {
                                  await onDeleteRegistration(a.id);
                                  toast.success(isAr ? "تم حذف التسجيل" : "Registration deleted");
                                }
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAttendeesModalOpen(false)}
              >
                {isAr ? "إغلاق" : "Close"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
