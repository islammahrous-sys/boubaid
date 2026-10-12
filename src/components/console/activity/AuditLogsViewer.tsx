import { formatDualDateTime } from "@/lib/dates";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, History, Search } from "lucide-react";
import {
  AUDIT_TONE_CLASS,
  auditEntityLabel,
  describeAuditAction,
  type AuditTone,
} from "@/components/console/common/consoleLabels";
import { ConsolePager } from "@/components/console/common/ConsolePager";
import { usePaged } from "@/components/console/common/usePaged";

export type AuditLogRow = {
  id: string;
  actor_user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  before_data?: any;
  after_data?: any;
  metadata?: any;
  created_at: string;
};

/** The most human name a logged record carries, if any. */
function recordName(log: AuditLogRow): string | null {
  const d = log.after_data ?? log.before_data;
  const m = log.metadata;
  const pick = (o: any) =>
    o &&
    (o.title_ar ||
      o.name_ar ||
      o.label_ar ||
      (o.first_name_ar ? `${o.first_name_ar} ${o.last_name_ar ?? ""}`.trim() : null) ||
      o.title ||
      o.name ||
      o.key);
  return (
    pick(d) || (typeof m?.title === "string" ? m.title : null) || (m?.role ? String(m.role) : null)
  );
}

const TONES: { id: "all" | AuditTone; ar: string; en: string }[] = [
  { id: "all", ar: "كل العمليات", en: "All actions" },
  { id: "add", ar: "إضافة ونشر", en: "Additions" },
  { id: "change", ar: "تعديلات", en: "Changes" },
  { id: "remove", ar: "حذف وأرشفة", en: "Removals" },
];

export function AuditLogsViewer({ auditLogs }: { auditLogs: AuditLogRow[] }) {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const [search, setSearch] = useState("");
  const [tone, setTone] = useState<"all" | AuditTone>("all");
  const [entity, setEntity] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AuditLogRow | null>(null);

  const entities = useMemo(
    () =>
      [...new Set(auditLogs.map((l) => l.entity_type))].sort((a, b) =>
        auditEntityLabel(a, isAr).localeCompare(auditEntityLabel(b, isAr)),
      ),
    [auditLogs, isAr],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return auditLogs.filter((log) => {
      const act = describeAuditAction(log.action);
      if (tone !== "all" && act.tone !== tone) return false;
      if (entity !== "all" && log.entity_type !== entity) return false;
      if (!q) return true;
      const hay = [
        log.action,
        log.entity_type,
        log.entity_id ?? "",
        act.ar,
        act.en,
        auditEntityLabel(log.entity_type, true),
        auditEntityLabel(log.entity_type, false),
        recordName(log) ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [auditLogs, search, tone, entity]);

  const { slice, page, pageCount, setPage, total, pageSize } = usePaged(filtered, 25);
  const Chevron = isAr ? ChevronLeft : ChevronRight;

  return (
    <div className="space-y-4">
      <div className="console-card flex flex-col gap-3 p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isAr
                ? "ابحث باسم السجل أو القسم أو نوع العملية..."
                : "Search by record, area or action..."
            }
            className="h-10 ps-9"
            aria-label={isAr ? "بحث في السجل" : "Search the log"}
          />
        </div>
        <Select value={entity} onValueChange={setEntity}>
          <SelectTrigger className="h-10 md:w-56" aria-label={isAr ? "القسم" : "Area"}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isAr ? "كل الأقسام" : "All areas"}</SelectItem>
            {entities.map((e) => (
              <SelectItem key={e} value={e}>
                {auditEntityLabel(e, isAr)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1 rounded-xl bg-[var(--console-canvas)] p-1" role="group">
          {TONES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTone(t.id)}
              aria-pressed={tone === t.id}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                tone === t.id
                  ? "bg-card text-foreground shadow-[var(--console-shadow-sm)]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isAr ? t.ar : t.en}
            </button>
          ))}
        </div>
      </div>

      <div className="console-card overflow-hidden">
        {slice.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center text-muted-foreground">
            <History className="h-8 w-8 opacity-40" />
            <p className="mt-3 text-sm">
              {isAr ? "لا توجد عمليات مطابقة." : "No matching activity."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--console-hairline)]">
            {slice.map((log) => {
              const act = describeAuditAction(log.action);
              const name = recordName(log);
              return (
                <li key={log.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedLog(log)}
                    className="group flex w-full items-center gap-4 px-4 py-3.5 text-start transition-colors hover:bg-[var(--console-canvas)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                  >
                    <span
                      className={cn(
                        "w-32 shrink-0 rounded-full px-2.5 py-1 text-center text-xs font-semibold",
                        AUDIT_TONE_CLASS[act.tone],
                      )}
                    >
                      {isAr ? act.ar : act.en}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {auditEntityLabel(log.entity_type, isAr)}
                        {name && (
                          <span className="font-normal text-muted-foreground"> — {name}</span>
                        )}
                      </span>
                      <span
                        className="block truncate font-mono text-xs text-muted-foreground"
                        dir="ltr"
                      >
                        {log.entity_type}
                        {log.entity_id ? ` · ${log.entity_id.slice(0, 8)}` : ""}
                      </span>
                    </span>
                    <span className="hidden shrink-0 text-end text-xs tabular-nums text-muted-foreground md:block">
                      {formatDualDateTime(log.created_at, isAr ? "ar" : "en")}
                    </span>
                    <Chevron className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <ConsolePager
          page={page}
          pageCount={pageCount}
          total={total}
          pageSize={pageSize}
          onPage={setPage}
          isAr={isAr}
          className="border-t border-[var(--console-hairline)]"
        />
      </div>

      {selectedLog && (
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-base font-bold">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold",
                    AUDIT_TONE_CLASS[describeAuditAction(selectedLog.action).tone],
                  )}
                >
                  {isAr
                    ? describeAuditAction(selectedLog.action).ar
                    : describeAuditAction(selectedLog.action).en}
                </span>
                {auditEntityLabel(selectedLog.entity_type, isAr)}
              </DialogTitle>
              <DialogDescription>
                {formatDualDateTime(selectedLog.created_at, isAr ? "ar" : "en")}
                {recordName(selectedLog) ? ` — ${recordName(selectedLog)}` : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-3">
                <div>
                  <span className="block text-muted-foreground">{isAr ? "الجدول" : "Table"}</span>
                  <span className="font-mono text-foreground" dir="ltr">
                    {selectedLog.entity_type}
                  </span>
                </div>
                <div>
                  <span className="block text-muted-foreground">
                    {isAr ? "معرّف السجل" : "Record ID"}
                  </span>
                  <span className="break-all font-mono text-foreground" dir="ltr">
                    {selectedLog.entity_id || "—"}
                  </span>
                </div>
              </div>

              {selectedLog.after_data && (
                <details className="rounded-lg border border-[var(--console-hairline)]">
                  <summary className="cursor-pointer px-3 py-2 font-semibold text-foreground">
                    {isAr ? "البيانات المحفوظة" : "Saved data"}
                  </summary>
                  <pre
                    className="max-h-56 overflow-auto bg-[#1b110b] p-3 font-mono text-[11px] text-[#f7ecdf]"
                    dir="ltr"
                  >
                    {JSON.stringify(selectedLog.after_data, null, 2)}
                  </pre>
                </details>
              )}

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <details className="rounded-lg border border-[var(--console-hairline)]" open>
                  <summary className="cursor-pointer px-3 py-2 font-semibold text-foreground">
                    {isAr ? "تفاصيل إضافية" : "Details"}
                  </summary>
                  <pre
                    className="overflow-auto bg-[#1b110b] p-3 font-mono text-[11px] text-[#f7ecdf]"
                    dir="ltr"
                  >
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </details>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedLog(null)}
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
