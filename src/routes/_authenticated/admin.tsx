import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { ConsoleShell } from "@/components/console/ConsoleShell";
import {
  CButton,
  DataTable,
  EmptyState,
  ErrorState,
  FilterSelect,
  Panel,
  PanelHeader,
  RowsSkeleton,
  StatCard,
  StatusBadge,
  Td,
  Toolbar,
} from "@/components/console/ConsoleUI";
import {
  getAdminOverview,
  reviewMembershipRequest,
  setMessageStatus,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "لوحة الأمانة | آل بوعبيد" },
      {
        name: "description",
        content: "لوحة أمانة مجلس أسرة آل بوعبيد: طلبات العضوية، رسائل التواصل، والمشتركون.",
      },
      { property: "og:title", content: "لوحة الأمانة | آل بوعبيد" },
      { property: "og:description", content: "إدارة طلبات العضوية ورسائل التواصل." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Tab = "requests" | "messages" | "subscribers" | "members";

function AdminPage() {
  const { lang } = useLang();
  const label = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const { isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("requests");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOverview = useServerFn(getAdminOverview);
  const review = useServerFn(reviewMembershipRequest);
  const markMessage = useServerFn(setMessageStatus);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => fetchOverview(),
    enabled: isAdmin,
    retry: 2,
    retryDelay: (attempt) => Math.min(1500 * 2 ** attempt, 6000),
  });

  const decide = useMutation({
    mutationFn: (input: { id: string; decision: "approved" | "rejected" }) =>
      review({
        data: {
          id: input.id,
          decision: input.decision,
          review_note: notes[input.id] ?? "",
        },
      }),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success(label("تم تحديث الطلب.", "Request updated."));
        void queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      } else {
        toast.error(label("تعذر تحديث الطلب.", "We couldn't update that request."));
      }
    },
    onError: () => toast.error(label("تعذر تحديث الطلب.", "We couldn't update that request.")),
  });

  const status = useMutation({
    mutationFn: (input: { id: string; status: "new" | "read" | "archived" }) =>
      markMessage({ data: input }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
  });

  const term = search.trim().toLowerCase();
  const matches = (...parts: (string | null | undefined)[]) =>
    !term || parts.some((p) => (p ?? "").toLowerCase().includes(term));

  const requests = useMemo(
    () =>
      (data?.requests ?? []).filter(
        (r) =>
          matches(r.full_name_ar, r.full_name_en, r.email, r.phone, r.branch_slug) &&
          (statusFilter === "all" || r.status === statusFilter),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, term, statusFilter],
  );

  const messages = useMemo(
    () =>
      (data?.messages ?? []).filter(
        (m) =>
          matches(m.name, m.email, m.subject, m.message) &&
          (statusFilter === "all" || m.status === statusFilter),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, term, statusFilter],
  );

  const subscribers = useMemo(
    () => (data?.subscribers ?? []).filter((s) => matches(s.email, s.name)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, term],
  );

  const members = useMemo(
    () =>
      (data?.members ?? []).filter((m) =>
        matches(m.full_name_ar, m.full_name_en, m.email, m.branch_slug),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, term],
  );

  if (loading) {
    return (
      <div className="container-page py-24 text-sm text-muted-foreground">
        {label("جارٍ التحقق…", "Checking access…")}
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container-page py-24">
        <h1 className="text-2xl font-bold text-foreground">
          {label("هذه الصفحة لأمانة المجلس", "This area is for the council secretariat")}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {label(
            "حسابك لا يملك صلاحية الوصول إلى لوحة الأمانة.",
            "Your account doesn't have access to the council console.",
          )}
        </p>
        <Link
          to="/account"
          className="mt-6 inline-flex border border-border px-4 py-2 text-[13px] font-medium hover:bg-secondary"
        >
          {label("العودة إلى حسابي", "Back to my account")}
        </Link>
      </div>
    );
  }

  const pendingRequests = (data?.requests ?? []).filter((r) => r.status === "pending").length;
  const newMessages = (data?.messages ?? []).filter((m) => m.status === "new").length;

  const tabs: { key: Tab; ar: string; en: string; count: number }[] = [
    { key: "requests", ar: "طلبات العضوية", en: "Requests", count: data?.requests.length ?? 0 },
    { key: "messages", ar: "الرسائل", en: "Messages", count: data?.messages.length ?? 0 },
    {
      key: "subscribers",
      ar: "المشتركون",
      en: "Subscribers",
      count: data?.subscribers.length ?? 0,
    },
    { key: "members", ar: "السجل", en: "Register", count: data?.members.length ?? 0 },
  ];

  const requestTone = (s: string) =>
    s === "approved" ? "positive" : s === "rejected" ? "negative" : "pending";
  const requestWord = (s: string) =>
    s === "approved"
      ? label("معتمد", "Approved")
      : s === "rejected"
        ? label("مرفوض", "Rejected")
        : label("قيد المراجعة", "Pending");
  const messageWord = (s: string) =>
    s === "read"
      ? label("مقروءة", "Read")
      : s === "archived"
        ? label("مؤرشفة", "Archived")
        : label("جديدة", "New");

  const showStatusFilter = tab === "requests" || tab === "messages";

  return (
    <ConsoleShell
      title={label("لوحة الأمانة", "Council console")}
      description={label(
        "مراجعة طلبات العضوية، ومتابعة رسائل التواصل والمشتركين وسجل الأعضاء.",
        "Review membership requests and follow contact messages, subscribers, and the member register.",
      )}
      actions={
        <CButton size="sm" onClick={() => void refetch()} disabled={isFetching}>
          {isFetching ? label("تحديث…", "Refreshing…") : label("تحديث", "Refresh")}
        </CButton>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={label("طلبات معلّقة", "Pending requests")}
          value={pendingRequests}
          tone={pendingRequests > 0 ? "attention" : "neutral"}
          hint={label("بحاجة إلى قرار الأمانة", "Awaiting a secretariat decision")}
          icon="❖"
        />
        <StatCard
          label={label("رسائل جديدة", "New messages")}
          value={newMessages}
          tone={newMessages > 0 ? "attention" : "neutral"}
          hint={label("لم تُقرأ بعد", "Not read yet")}
          icon="✉"
        />
        <StatCard
          label={label("المشتركون", "Subscribers")}
          value={data?.subscribers.length ?? 0}
          hint={label("قائمة النشرة", "Newsletter list")}
          icon="◈"
        />
        <StatCard
          label={label("سجل الأعضاء", "Member register")}
          value={data?.members.length ?? 0}
          hint={label("ملفات مسجّلة", "Registered profiles")}
          icon="◎"
        />
      </div>

      <Panel className="mt-5 overflow-hidden">
        <div
          role="tablist"
          aria-label={label("أقسام اللوحة", "Console sections")}
          className="flex flex-wrap gap-1 border-b border-border px-2 py-2 sm:px-3"
        >
          {tabs.map((tb) => {
            const active = tab === tb.key;
            return (
              <button
                key={tb.key}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => {
                  setTab(tb.key);
                  setStatusFilter("all");
                }}
                className={
                  "inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                  (active
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground")
                }
              >
                {label(tb.ar, tb.en)}
                <span className="nums font-mono text-[11px] opacity-70">{tb.count}</span>
              </button>
            );
          })}
        </div>

        <Toolbar
          search={search}
          onSearch={setSearch}
          placeholder={label("ابحث بالاسم أو البريد…", "Search by name or email…")}
        >
          {showStatusFilter ? (
            <FilterSelect
              label={label("الحالة", "Status")}
              value={statusFilter}
              onChange={setStatusFilter}
              options={
                tab === "requests"
                  ? [
                      { value: "all", label: label("الكل", "All") },
                      { value: "pending", label: label("قيد المراجعة", "Pending") },
                      { value: "approved", label: label("معتمد", "Approved") },
                      { value: "rejected", label: label("مرفوض", "Rejected") },
                    ]
                  : [
                      { value: "all", label: label("الكل", "All") },
                      { value: "new", label: label("جديدة", "New") },
                      { value: "read", label: label("مقروءة", "Read") },
                      { value: "archived", label: label("مؤرشفة", "Archived") },
                    ]
              }
            />
          ) : null}
        </Toolbar>

        {isLoading ? <RowsSkeleton /> : null}
        {isError ? <ErrorState onRetry={() => void refetch()} retrying={isFetching} /> : null}

        {!isLoading && !isError && tab === "requests" ? (
          requests.length === 0 ? (
            <EmptyState
              title={label("لا توجد طلبات", "No requests")}
              body={label(
                "ستظهر طلبات العضوية هنا بمجرد تقديمها من الأعضاء.",
                "Membership requests appear here as soon as members submit them.",
              )}
            />
          ) : (
            <DataTable
              head={[
                label("مقدّم الطلب", "Applicant"),
                label("التواصل", "Contact"),
                label("الحالة", "Status"),
                label("القرار", "Decision"),
              ]}
            >
              {requests.map((r) => (
                <tr key={r.id} className="align-top">
                  <Td>
                    <p className="font-semibold text-foreground">{r.full_name_ar}</p>
                    {r.branch_slug ? (
                      <p className="mt-0.5 text-[12px] text-muted-foreground">{r.branch_slug}</p>
                    ) : null}
                    {r.notes ? (
                      <p className="mt-1.5 max-w-md text-[12.5px] leading-relaxed text-muted-foreground">
                        {r.notes}
                      </p>
                    ) : null}
                  </Td>
                  <Td className="text-muted-foreground">
                    <p>{r.email}</p>
                    {r.phone ? <p className="nums mt-0.5">{r.phone}</p> : null}
                  </Td>
                  <Td>
                    <StatusBadge tone={requestTone(r.status)}>{requestWord(r.status)}</StatusBadge>
                    {r.review_note ? (
                      <p className="mt-1.5 max-w-xs text-[12px] text-muted-foreground">
                        {r.review_note}
                      </p>
                    ) : null}
                  </Td>
                  <Td>
                    {r.status === "pending" ? (
                      <div className="space-y-2">
                        <input
                          value={notes[r.id] ?? ""}
                          onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                          placeholder={label("ملاحظة (اختياري)", "Note (optional)")}
                          aria-label={label("ملاحظة المراجعة", "Review note")}
                          className="min-h-8 w-full min-w-[10rem] rounded-md border border-border bg-background px-2.5 text-[12.5px] text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                        />
                        <div className="flex gap-1.5">
                          <CButton
                            size="sm"
                            variant="primary"
                            disabled={decide.isPending}
                            onClick={() => decide.mutate({ id: r.id, decision: "approved" })}
                          >
                            {label("اعتماد", "Approve")}
                          </CButton>
                          <CButton
                            size="sm"
                            variant="danger"
                            disabled={decide.isPending}
                            onClick={() => decide.mutate({ id: r.id, decision: "rejected" })}
                          >
                            {label("رفض", "Reject")}
                          </CButton>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[12px] text-muted-foreground">—</span>
                    )}
                  </Td>
                </tr>
              ))}
            </DataTable>
          )
        ) : null}

        {!isLoading && !isError && tab === "messages" ? (
          messages.length === 0 ? (
            <EmptyState
              title={label("لا توجد رسائل", "No messages")}
              body={label(
                "رسائل نموذج التواصل تُدرج هنا مباشرة.",
                "Contact-form messages are listed here as they arrive.",
              )}
              icon="✉"
            />
          ) : (
            <DataTable
              head={[
                label("المرسل", "Sender"),
                label("الرسالة", "Message"),
                label("الحالة", "Status"),
                label("إجراء", "Action"),
              ]}
            >
              {messages.map((m) => (
                <tr key={m.id}>
                  <Td>
                    <p className="font-semibold text-foreground">{m.name}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">{m.email}</p>
                  </Td>
                  <Td>
                    {m.subject ? (
                      <p className="font-medium text-foreground">{m.subject}</p>
                    ) : null}
                    <p className="mt-1 max-w-lg text-[12.5px] leading-relaxed text-muted-foreground">
                      {m.message}
                    </p>
                  </Td>
                  <Td>
                    <StatusBadge tone={m.status === "new" ? "pending" : "neutral"}>
                      {messageWord(m.status)}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <div className="flex gap-1.5">
                      <CButton
                        size="sm"
                        onClick={() => status.mutate({ id: m.id, status: "read" })}
                        disabled={status.isPending}
                      >
                        {label("مقروءة", "Mark read")}
                      </CButton>
                      <CButton
                        size="sm"
                        variant="subtle"
                        onClick={() => status.mutate({ id: m.id, status: "archived" })}
                        disabled={status.isPending}
                      >
                        {label("أرشفة", "Archive")}
                      </CButton>
                    </div>
                  </Td>
                </tr>
              ))}
            </DataTable>
          )
        ) : null}

        {!isLoading && !isError && tab === "subscribers" ? (
          subscribers.length === 0 ? (
            <EmptyState title={label("لا يوجد مشتركون", "No subscribers")} />
          ) : (
            <DataTable head={[label("البريد", "Email"), label("الاسم", "Name")]}>
              {subscribers.map((s) => (
                <tr key={s.id}>
                  <Td className="text-foreground">{s.email}</Td>
                  <Td className="text-muted-foreground">{s.name ?? "—"}</Td>
                </tr>
              ))}
            </DataTable>
          )
        ) : null}

        {!isLoading && !isError && tab === "members" ? (
          members.length === 0 ? (
            <EmptyState title={label("لا توجد ملفات أعضاء", "No member profiles")} />
          ) : (
            <DataTable
              head={[label("العضو", "Member"), label("الفرع", "Branch"), label("الدليل", "Directory")]}
            >
              {members.map((m) => (
                <tr key={m.id}>
                  <Td className="text-foreground">{m.full_name_ar ?? m.email ?? m.id}</Td>
                  <Td className="text-muted-foreground">{m.branch_slug ?? "—"}</Td>
                  <Td>
                    <StatusBadge tone={m.show_in_directory ? "positive" : "neutral"}>
                      {m.show_in_directory ? label("ظاهر", "Listed") : label("مخفي", "Hidden")}
                    </StatusBadge>
                  </Td>
                </tr>
              ))}
            </DataTable>
          )
        ) : null}
      </Panel>

      <Panel className="mt-5">
        <PanelHeader
          title={label("اختصارات", "Shortcuts")}
          description={label(
            "انتقل إلى المنصات الأخرى في اللوحة.",
            "Jump to the other console workspaces.",
          )}
          actions={
            <>
              <Link to="/content">
                <CButton size="sm">{label("منصة المحتوى", "Content console")}</CButton>
              </Link>
              <Link to="/treasury">
                <CButton size="sm">{label("سجل الخزينة", "Treasury ledger")}</CButton>
              </Link>
            </>
          }
        />
      </Panel>
    </ConsoleShell>
  );
}
