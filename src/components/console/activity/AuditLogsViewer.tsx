import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n/LanguageProvider";
import { Shield, Search, Eye, Filter } from "lucide-react";

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

export function AuditLogsViewer({
  auditLogs,
}: {
  auditLogs: AuditLogRow[];
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AuditLogRow | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    const matchAction = actionFilter === "all" || log.action === actionFilter;
    const matchSearch =
      !search ||
      log.entity_type.toLowerCase().includes(search.toLowerCase()) ||
      (log.action && log.action.toLowerCase().includes(search.toLowerCase())) ||
      (log.entity_id && log.entity_id.toLowerCase().includes(search.toLowerCase()));
    return matchAction && matchSearch;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case "create":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">CREATE</Badge>;
      case "update":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">UPDATE</Badge>;
      case "delete":
      case "archive":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">DELETE</Badge>;
      case "role_change":
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px]">ROLE</Badge>;
      case "publish":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">PUBLISH</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{action.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            {isAr ? "سجل الرقابة وتتبع العمليات (Audit Logs)" : "System Audit Logs & Security History"}
          </h3>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? "بحث في السجلات..." : "Search logs..."}
              className="ps-9 h-8 text-xs"
            />
          </div>

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <Filter className="w-3.5 h-3.5 me-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isAr ? "كل العمليات" : "All Actions"}</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="archive">Archive</SelectItem>
              <SelectItem value="role_change">Role Change</SelectItem>
              <SelectItem value="upload">Upload</SelectItem>
              <SelectItem value="settings_change">Settings</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs">
              <TableHead>{isAr ? "نوع الإجراء" : "Action"}</TableHead>
              <TableHead>{isAr ? "الكيان المتأثر" : "Entity"}</TableHead>
              <TableHead>{isAr ? "معرف السجل" : "Entity ID"}</TableHead>
              <TableHead>{isAr ? "الوقت والتاريخ" : "Timestamp"}</TableHead>
              <TableHead className="text-end">{isAr ? "التفاصيل" : "Details"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center text-muted-foreground text-xs">
                  {isAr ? "لا توجد عمليات مسجلة" : "No audit records found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id} className="text-xs hover:bg-muted/30">
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell className="font-mono text-foreground font-medium">{log.entity_type}</TableCell>
                  <TableCell className="font-mono text-muted-foreground truncate max-w-[140px]">
                    {log.entity_id || "—"}
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    {new Date(log.created_at).toLocaleString(isAr ? "ar-SA" : "en-US")}
                  </TableCell>
                  <TableCell className="text-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-muted-foreground hover:text-foreground"
                      onClick={() => setSelectedLog(log)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* JSON Diff Dialog */}
      {selectedLog && (
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center justify-between">
                <span>{isAr ? "تفاصيل حدث التدقيق والرقابة" : "Audit Event Details"}</span>
                {getActionBadge(selectedLog.action)}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-muted/30 rounded-lg font-mono text-[11px]">
                <div>
                  <span className="text-muted-foreground block">{isAr ? "الكيان:" : "Entity:"}</span>
                  <span className="font-bold text-foreground">{selectedLog.entity_type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{isAr ? "التاريخ:" : "Date:"}</span>
                  <span className="text-foreground">{new Date(selectedLog.created_at).toLocaleString()}</span>
                </div>
              </div>

              {selectedLog.after_data && (
                <div className="space-y-1">
                  <span className="font-semibold text-foreground text-xs block">
                    {isAr ? "البيانات المسجلة (After State):" : "Recorded Payload (After):"}
                  </span>
                  <pre className="p-3 rounded-lg bg-zinc-950 text-zinc-200 font-mono text-[10px] overflow-x-auto max-h-56">
                    {JSON.stringify(selectedLog.after_data, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div className="space-y-1">
                  <span className="font-semibold text-foreground text-xs block">
                    {isAr ? "معلومات إضافية (Metadata):" : "Metadata:"}
                  </span>
                  <pre className="p-3 rounded-lg bg-zinc-950 text-zinc-200 font-mono text-[10px] overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                {isAr ? "إغلاق" : "Close"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
