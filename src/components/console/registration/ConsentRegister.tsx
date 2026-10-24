import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/i18n/LanguageProvider";
import { getConsentRegister } from "@/lib/registration.functions";
import { csvLine } from "@/lib/csv";

const CSV_COLUMNS = ["date", "email", "account", "consent", "granted", "version", "source", "ip", "user_agent"];

const DOC_LABELS: Record<string, { ar: string; en: string }> = {
  terms: { ar: "الشروط وإخلاء المسؤولية", en: "Terms & disclaimer" },
  privacy: { ar: "سياسة الخصوصية", en: "Privacy policy" },
  marketing: { ar: "النشرة والرسائل", en: "Newsletter & emails" },
  media_publication: { ar: "نشر الصور والمقاطع", en: "Photo/video publication" },
};

/** Read-only evidence of every acceptance, grant and withdrawal. */
export function ConsentRegister() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const L = (ar: string, en: string) => (isAr ? ar : en);
  const fetchRegister = useServerFn(getConsentRegister);
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["consent-register", applied],
    queryFn: () => fetchRegister({ data: { search: applied || undefined } }),
  });

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(isAr ? "ar-SA-u-ca-gregory" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "medium",
      timeZone: "Asia/Riyadh",
    });

  const exportCsv = () => {
    const csv = [
      csvLine(CSV_COLUMNS),
      ...data.map((r) =>
        csvLine([
          r.created_at,
          r.email ?? "",
          r.entity_id ?? "",
          r.document,
          r.action === "consent_granted" ? "yes" : "no",
          r.version,
          r.source,
          r.ip_address ?? "",
          r.user_agent ?? "",
        ]),
      ),
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `consent-register-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setApplied(search.trim());
        }}
      >
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            dir="ltr"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={L("بحث بالبريد الإلكتروني", "Search by email")}
            className="ps-9"
          />
        </div>
        <Button type="submit" variant="outline">{L("بحث", "Search")}</Button>
        <Button type="button" variant="outline" onClick={exportCsv} disabled={!data.length}>
          <Download className="h-4 w-4" />
          CSV
        </Button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[720px] text-xs">
          <thead className="bg-secondary/50 text-muted-foreground">
            <tr>
              <th className="px-3 py-2.5 text-start font-semibold">{L("التاريخ والوقت", "Date & time")}</th>
              <th className="px-3 py-2.5 text-start font-semibold">{L("البريد", "Email")}</th>
              <th className="px-3 py-2.5 text-start font-semibold">{L("الموافقة", "Consent")}</th>
              <th className="px-3 py-2.5 text-start font-semibold">{L("الحالة", "State")}</th>
              <th className="px-3 py-2.5 text-start font-semibold">{L("الإصدار", "Version")}</th>
              <th className="px-3 py-2.5 text-start font-semibold">{L("المصدر", "Source")}</th>
              <th className="px-3 py-2.5 text-start font-semibold">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">…</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">{L("لا توجد سجلات.", "No records.")}</td></tr>
            ) : (
              data.map((r) => (
                <tr key={r.id}>
                  <td className="whitespace-nowrap px-3 py-2">{fmt(r.created_at)}</td>
                  <td className="px-3 py-2 font-mono" dir="ltr">{r.email ?? "—"}</td>
                  <td className="px-3 py-2">{DOC_LABELS[r.document]?.[lang] ?? r.document}</td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className={r.action === "consent_granted" ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400" : "border-rose-500/40 text-rose-700"}>
                      {r.action === "consent_granted" ? L("منحت", "Granted") : L("غير ممنوحة / مسحوبة", "Declined / withdrawn")}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 font-mono">{r.version}</td>
                  <td className="px-3 py-2">{r.source}</td>
                  <td className="px-3 py-2 font-mono" dir="ltr">{r.ip_address ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
