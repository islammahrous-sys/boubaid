import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { useAuth } from "@/hooks/useAuth";
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

  const fetchOverview = useServerFn(getAdminOverview);
  const review = useServerFn(reviewMembershipRequest);
  const markMessage = useServerFn(setMessageStatus);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => fetchOverview(),
    enabled: isAdmin,
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

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow={label("إدارة", "Administration")}
        title={label("لوحة الأمانة", "Council console")}
        subtitle={label(
          "مراجعة طلبات العضوية، ومتابعة رسائل التواصل والمشتركين وسجل الأعضاء.",
          "Review membership requests and follow contact messages, subscribers, and the member register.",
        )}
      />

      <section className="container-page mt-10">
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              type="button"
              onClick={() => setTab(tb.key)}
              className={`border px-4 py-2 text-[13px] font-medium transition-colors ${
                tab === tb.key
                  ? "border-gold bg-gold text-ink"
                  : "border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {label(tb.ar, tb.en)}
              <span className="nums ms-2 font-mono text-[11px] opacity-70">{tb.count}</span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="mt-8 text-sm text-muted-foreground">{label("جارٍ التحميل…", "Loading…")}</p>
        ) : null}

        {tab === "requests" ? (
          <ul className="mt-8 space-y-4">
            {(data?.requests ?? []).map((r) => (
              <li key={r.id} className="border border-border bg-card p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="font-bold text-foreground">{r.full_name_ar}</p>
                  <span className="label-caps text-bronze dark:text-gold">{r.status}</span>
                </div>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {r.email}
                  {r.phone ? ` · ${r.phone}` : ""}
                  {r.branch_slug ? ` · ${r.branch_slug}` : ""}
                </p>
                {r.notes ? (
                  <p className="mt-2 text-[13px] leading-relaxed text-foreground">{r.notes}</p>
                ) : null}
                {r.status === "pending" ? (
                  <div className="mt-4 space-y-3">
                    <input
                      value={notes[r.id] ?? ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                      placeholder={label("ملاحظة المراجعة (اختياري)", "Review note (optional)")}
                      className="w-full border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-gold"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={decide.isPending}
                        onClick={() => decide.mutate({ id: r.id, decision: "approved" })}
                        className="border border-gold bg-gold px-4 py-2 text-[13px] font-bold text-ink disabled:opacity-60"
                      >
                        {label("اعتماد", "Approve")}
                      </button>
                      <button
                        type="button"
                        disabled={decide.isPending}
                        onClick={() => decide.mutate({ id: r.id, decision: "rejected" })}
                        className="border border-border px-4 py-2 text-[13px] font-medium hover:bg-secondary disabled:opacity-60"
                      >
                        {label("رفض", "Reject")}
                      </button>
                    </div>
                  </div>
                ) : r.review_note ? (
                  <p className="mt-3 text-[12px] text-muted-foreground">{r.review_note}</p>
                ) : null}
              </li>
            ))}
            {!isLoading && (data?.requests.length ?? 0) === 0 ? (
              <Empty text={label("لا توجد طلبات.", "No requests yet.")} />
            ) : null}
          </ul>
        ) : null}

        {tab === "messages" ? (
          <ul className="mt-8 space-y-4">
            {(data?.messages ?? []).map((m) => (
              <li key={m.id} className="border border-border bg-card p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="font-bold text-foreground">
                    {m.name} <span className="font-normal text-muted-foreground">· {m.email}</span>
                  </p>
                  <span className="label-caps text-bronze dark:text-gold">{m.status}</span>
                </div>
                {m.subject ? (
                  <p className="mt-1 text-[13px] font-medium text-foreground">{m.subject}</p>
                ) : null}
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{m.message}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => status.mutate({ id: m.id, status: "read" })}
                    className="border border-border px-3 py-1.5 text-[12px] hover:bg-secondary"
                  >
                    {label("مقروءة", "Mark read")}
                  </button>
                  <button
                    type="button"
                    onClick={() => status.mutate({ id: m.id, status: "archived" })}
                    className="border border-border px-3 py-1.5 text-[12px] hover:bg-secondary"
                  >
                    {label("أرشفة", "Archive")}
                  </button>
                </div>
              </li>
            ))}
            {!isLoading && (data?.messages.length ?? 0) === 0 ? (
              <Empty text={label("لا توجد رسائل.", "No messages yet.")} />
            ) : null}
          </ul>
        ) : null}

        {tab === "subscribers" ? (
          <ul className="mt-8 divide-y divide-border border border-border bg-card">
            {(data?.subscribers ?? []).map((s) => (
              <li key={s.id} className="flex flex-wrap justify-between gap-3 px-5 py-3 text-sm">
                <span className="text-foreground">{s.email}</span>
                <span className="text-muted-foreground">{s.name ?? "—"}</span>
              </li>
            ))}
            {!isLoading && (data?.subscribers.length ?? 0) === 0 ? (
              <Empty text={label("لا يوجد مشتركون.", "No subscribers yet.")} />
            ) : null}
          </ul>
        ) : null}

        {tab === "members" ? (
          <ul className="mt-8 divide-y divide-border border border-border bg-card">
            {(data?.members ?? []).map((m) => (
              <li key={m.id} className="flex flex-wrap justify-between gap-3 px-5 py-3 text-sm">
                <span className="text-foreground">{m.full_name_ar ?? m.email ?? m.id}</span>
                <span className="text-muted-foreground">
                  {m.branch_slug ?? "—"}
                  {m.show_in_directory ? ` · ${label("في الدليل", "in directory")}` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <li className="border border-dashed border-border p-6 text-sm text-muted-foreground">{text}</li>;
}
