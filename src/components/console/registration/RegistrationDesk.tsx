import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  FileCheck2,
  FileWarning,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  UserX,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLang } from "@/i18n/LanguageProvider";
import { branches } from "@/content/site";
import { LEGAL_VERSION } from "@/content/legal";
import { reviewMembershipRequest } from "@/lib/admin-hub.functions";
import { getRegistrationDesk, type RegistrationRequest } from "@/lib/registration.functions";
import { cn } from "@/lib/utils";

type Filter = "pending" | "approved" | "rejected" | "unapplied";
type Decision = { ids: string[]; status: "approved" | "rejected" };

export const REGISTRATION_DESK_QUERY_KEY = ["registration-desk"] as const;

/**
 * The secretariat's single place for membership registration: one queue,
 * three outcomes. Approving grants the `member` role, records the decision
 * and notifies the applicant in-app and by email — all through the same
 * atomic `review_membership_request_as_admin` path as before.
 */
export function RegistrationDesk() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const L = (ar: string, en: string) => (isAr ? ar : en);
  const queryClient = useQueryClient();
  const fetchDesk = useServerFn(getRegistrationDesk);
  const review = useServerFn(reviewMembershipRequest);

  const [filter, setFilter] = useState<Filter>("pending");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [decision, setDecision] = useState<Decision | null>(null);
  const [note, setNote] = useState("");

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: REGISTRATION_DESK_QUERY_KEY,
    queryFn: () => fetchDesk(),
    refetchInterval: 60_000,
  });

  const requests = data?.requests ?? [];
  const counts = useMemo(
    () => ({
      pending: requests.filter((r) => r.status === "pending").length,
      approved: requests.filter((r) => r.status === "approved").length,
      rejected: requests.filter((r) => r.status === "rejected").length,
      unapplied: data?.unapplied.length ?? 0,
    }),
    [requests, data],
  );

  const q = search.trim().toLowerCase();
  const visible = requests
    .filter((r) => filter !== "unapplied" && r.status === filter)
    .filter(
      (r) =>
        !q ||
        [r.full_name_ar, r.full_name_en, r.email, r.phone, r.father_lineage]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q)),
    );

  const branchName = (slug: string | null) => {
    if (!slug) return null;
    const b = branches.find((x) => x.id === slug || x.dbSlugs.includes(slug));
    return b ? b.name[lang] : slug;
  };

  const fmt = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleString(isAr ? "ar-SA-u-ca-gregory" : "en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Asia/Riyadh",
        })
      : "—";

  const decide = useMutation({
    mutationFn: async ({ ids, status, review_note }: Decision & { review_note: string }) => {
      const failures: string[] = [];
      // Sequential on purpose: each review is its own transaction and sends
      // its own notification; a failure must not abort the rest silently.
      for (const id of ids) {
        try {
          await review({ data: { id, status, review_note: review_note || null } });
        } catch (e) {
          failures.push(e instanceof Error ? e.message : String(e));
        }
      }
      return { done: ids.length - failures.length, failures };
    },
    onSuccess: ({ done, failures }, vars) => {
      if (done) {
        toast.success(
          vars.status === "approved"
            ? L(`تم اعتماد ${done} طلب وإشعار أصحابها.`, `${done} request(s) approved and applicants notified.`)
            : L(`تم رفض ${done} طلب وإشعار أصحابها.`, `${done} request(s) rejected and applicants notified.`),
        );
      }
      if (failures.length) {
        toast.error(L(`تعذر معالجة ${failures.length} طلب: `, `${failures.length} failed: `) + failures[0]);
      }
      setSelected(new Set());
      setDecision(null);
      setNote("");
      void queryClient.invalidateQueries({ queryKey: REGISTRATION_DESK_QUERY_KEY });
      // Users & Verification and the sidebar badges read the same records.
      void queryClient.invalidateQueries({ queryKey: ["users-data"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
  });

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const tabs: { id: Filter; label: string; icon: typeof Clock; tone: string }[] = [
    { id: "pending", label: L("بانتظار القرار", "Pending"), icon: Clock, tone: "text-amber-600" },
    { id: "approved", label: L("معتمدة", "Approved"), icon: CheckCircle2, tone: "text-emerald-600" },
    { id: "rejected", label: L("مرفوضة", "Rejected"), icon: XCircle, tone: "text-rose-600" },
    { id: "unapplied", label: L("حسابات بلا طلب", "No request yet"), icon: UserX, tone: "text-muted-foreground" },
  ];

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm">
        <p className="font-semibold">{L("تعذر تحميل طلبات التسجيل", "Could not load registration requests")}</p>
        <p className="mt-1 text-muted-foreground">{(error as Error).message}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => void refetch()}>
          {L("إعادة المحاولة", "Retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI strip doubles as the filter */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tabs.map(({ id, label, icon: Icon, tone }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setFilter(id);
              setSelected(new Set());
            }}
            aria-pressed={filter === id}
            className={cn(
              "rounded-2xl border bg-card p-4 text-start transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-primary active:translate-y-0",
              filter === id ? "border-primary shadow-[0_10px_30px_-18px_var(--primary)]" : "border-border",
            )}
          >
            <span className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">{label}</span>
              <Icon className={cn("h-4 w-4", tone)} aria-hidden />
            </span>
            <span className="mt-2 block font-mono text-2xl font-bold text-foreground">
              {isLoading ? "…" : counts[id]}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={L("بحث بالاسم أو البريد أو الجوال أو النسب…", "Search name, email, phone or lineage…")}
            className="ps-9"
          />
        </div>
        {filter === "pending" && selected.size > 0 ? (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setDecision({ ids: [...selected], status: "approved" })}>
              <CheckCircle2 className="h-4 w-4" />
              {L(`اعتماد المحدد (${selected.size})`, `Approve selected (${selected.size})`)}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDecision({ ids: [...selected], status: "rejected" })}
            >
              {L("رفض المحدد", "Reject selected")}
            </Button>
          </div>
        ) : null}
        <Button variant="ghost" size="sm" onClick={() => void refetch()} disabled={isFetching}>
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          {L("تحديث", "Refresh")}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : filter === "unapplied" ? (
        <UnappliedList
          rows={(data?.unapplied ?? []).filter(
            (u) => !q || [u.full_name_ar, u.email].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)),
          )}
          fmt={fmt}
        />
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          {filter === "pending"
            ? L("لا توجد طلبات بانتظار القرار. أحسنتم!", "No requests waiting for a decision.")
            : L("لا توجد طلبات في هذه القائمة.", "Nothing in this list.")}
        </div>
      ) : (
        <ul className="space-y-3">
          {filter === "pending" ? (
            <li className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
              <input
                type="checkbox"
                id="select-all-pending"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={selected.size === visible.length}
                onChange={(e) => setSelected(e.target.checked ? new Set(visible.map((r) => r.id)) : new Set())}
              />
              <label htmlFor="select-all-pending">{L("تحديد الكل", "Select all")}</label>
            </li>
          ) : null}
          {visible.map((r) => (
            <RequestRow
              key={r.id}
              r={r}
              branch={branchName(r.branch_slug)}
              fmt={fmt}
              selectable={filter === "pending"}
              selected={selected.has(r.id)}
              onToggle={() => toggle(r.id)}
              onApprove={() => setDecision({ ids: [r.id], status: "approved" })}
              onReject={() => setDecision({ ids: [r.id], status: "rejected" })}
            />
          ))}
        </ul>
      )}

      <Dialog
        open={!!decision}
        onOpenChange={(open) => {
          if (!open && !decide.isPending) {
            setDecision(null);
            setNote("");
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {decision?.status === "approved"
                ? L("اعتماد العضوية", "Approve membership")
                : L("رفض طلب العضوية", "Reject membership request")}
              {decision && decision.ids.length > 1 ? ` (${decision.ids.length})` : ""}
            </DialogTitle>
            <DialogDescription>
              {decision?.status === "approved"
                ? L(
                    "سيُمنح مقدم الطلب صفة «عضو» فوراً، وتُتاح له صفحات الأعضاء وبطاقة العضوية، ويصله إشعار وبريد إلكتروني.",
                    "The applicant gets the member role immediately, members-only pages and their member card open, and they receive a notification and an email.",
                  )
                : L(
                    "سيصل مقدم الطلب إشعار وبريد إلكتروني بالقرار وملاحظتك، ويمكنه تقديم طلب جديد بعد استكمال المطلوب.",
                    "The applicant receives a notification and an email with your decision and note, and can apply again once they've addressed it.",
                  )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="review-note" className="text-xs font-semibold">
              {decision?.status === "rejected"
                ? L("سبب الرفض (يظهر لمقدم الطلب) *", "Reason (shown to the applicant) *")
                : L("ملاحظة للعضو (اختيارية)", "Note to the member (optional)")}
            </label>
            <Textarea id="review-note" rows={4} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDecision(null)} disabled={decide.isPending}>
              {L("إلغاء", "Cancel")}
            </Button>
            <Button
              variant={decision?.status === "rejected" ? "destructive" : "default"}
              disabled={decide.isPending || (decision?.status === "rejected" && note.trim().length < 3)}
              onClick={() => decision && decide.mutate({ ...decision, review_note: note.trim() })}
            >
              {decide.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {decision?.status === "approved" ? L("تأكيد الاعتماد", "Confirm approval") : L("تأكيد الرفض", "Confirm rejection")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  function RequestRow({
    r,
    branch,
    fmt,
    selectable,
    selected,
    onToggle,
    onApprove,
    onReject,
  }: {
    r: RegistrationRequest;
    branch: string | null;
    fmt: (iso: string | null) => string;
    selectable: boolean;
    selected: boolean;
    onToggle: () => void;
    onApprove: () => void;
    onReject: () => void;
  }) {
    const termsOk = r.terms_version === LEGAL_VERSION;
    return (
      <li
        className={cn(
          "rounded-2xl border bg-card p-4 transition-colors sm:p-5",
          selected ? "border-primary bg-primary/5" : "border-border",
        )}
      >
        <div className="flex flex-wrap items-start gap-4">
          {selectable ? (
            <input
              type="checkbox"
              aria-label={L("تحديد الطلب", "Select request")}
              checked={selected}
              onChange={onToggle}
              className="mt-1 h-4 w-4 accent-[var(--primary)]"
            />
          ) : null}
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[15px] font-bold text-foreground">{r.full_name_ar}</p>
              {r.full_name_en ? <span className="text-xs text-muted-foreground">{r.full_name_en}</span> : null}
              {branch ? <Badge variant="secondary">{branch}</Badge> : null}
              {r.terms_version ? (
                <Badge
                  variant="outline"
                  className={cn("gap-1", termsOk ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400" : "border-amber-500/40 text-amber-700")}
                  title={fmt(r.terms_accepted_at)}
                >
                  <FileCheck2 className="h-3 w-3" />
                  {L(`الشروط ${r.terms_version}`, `Terms v${r.terms_version}`)}
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 border-amber-500/40 text-amber-700">
                  <FileWarning className="h-3 w-3" />
                  {L("لا موافقة مسجلة على الشروط", "No terms acceptance on record")}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
              <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1.5 hover:text-foreground" dir="ltr">
                <Mail className="h-3.5 w-3.5" />
                {r.email}
              </a>
              {r.phone ? (
                <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1.5 hover:text-foreground" dir="ltr">
                  <Phone className="h-3.5 w-3.5" />
                  {r.phone}
                </a>
              ) : null}
              <span>
                {L("قُدّم", "Submitted")}: {fmt(r.created_at)}
              </span>
              {r.reviewed_at ? (
                <span>
                  {L("رُوجع", "Reviewed")}: {fmt(r.reviewed_at)}
                </span>
              ) : null}
            </div>
            {r.father_lineage ? (
              <p className="text-[13px] leading-relaxed text-foreground/85">
                <span className="font-semibold">{L("النسب: ", "Lineage: ")}</span>
                {r.father_lineage}
              </p>
            ) : null}
            {r.notes ? (
              <p className="rounded-lg bg-secondary/50 p-2.5 text-[12.5px] leading-relaxed text-foreground/80">{r.notes}</p>
            ) : null}
            {r.review_note ? (
              <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                <span className="font-semibold">{L("ملاحظة الأمانة: ", "Secretariat note: ")}</span>
                {r.review_note}
              </p>
            ) : null}
          </div>
          {r.status === "pending" ? (
            <div className="flex w-full gap-2 sm:w-auto sm:flex-col">
              <Button size="sm" className="flex-1" onClick={onApprove}>
                <CheckCircle2 className="h-4 w-4" />
                {L("اعتماد", "Approve")}
              </Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={onReject}>
                <XCircle className="h-4 w-4" />
                {L("رفض", "Reject")}
              </Button>
            </div>
          ) : null}
        </div>
      </li>
    );
  }

  function UnappliedList({
    rows,
    fmt,
  }: {
    rows: { id: string; full_name_ar: string | null; email: string | null; created_at: string }[];
    fmt: (iso: string | null) => string;
  }) {
    if (!rows.length) {
      return (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          {L("كل الحسابات قدّمت طلب عضوية.", "Every account has applied.")}
        </div>
      );
    }
    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <p className="border-b border-border bg-secondary/40 px-4 py-3 text-xs text-muted-foreground">
          {L(
            "أنشأ هؤلاء حسابات دون تقديم طلب العضوية بعد. يمكن مراسلتهم لاستكمال الطلب من صفحة «حسابي».",
            "These people created an account but haven't submitted a membership request. You can email them to complete it from “My account”.",
          )}
        </p>
        <ul className="divide-y divide-border">
          {rows.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="font-semibold text-foreground">{u.full_name_ar || L("بدون اسم", "No name")}</span>
              <span className="text-xs text-muted-foreground">{fmt(u.created_at)}</span>
              {u.email ? (
                <a
                  href={`mailto:${u.email}?subject=${encodeURIComponent(L("استكمال طلب العضوية — مجلس أسرة آل بوعبيد", "Complete your membership request — Al Bu Obaid Family Council"))}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  dir="ltr"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {u.email}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
