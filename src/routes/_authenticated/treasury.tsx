import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import {
  getTreasuryOverview,
  reviewContribution,
  getReceiptUrl,
  type ContributionRow,
} from "@/lib/contributions.functions";

export const Route = createFileRoute("/_authenticated/treasury")({
  head: () => ({
    meta: [
      { title: "سجل الخزينة | آل بوعبيد" },
      {
        name: "description",
        content: "سجل الخزينة: مراجعة الاشتراكات والمساهمات، والإجماليات المعتمدة والمعلّقة.",
      },
      { property: "og:title", content: "سجل الخزينة | آل بوعبيد" },
      { property: "og:description", content: "مراجعة الاشتراكات والمساهمات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TreasuryPage,
});

const statusText: Record<ContributionRow["status"], { ar: string; en: string }> = {
  pending: { ar: "قيد المراجعة", en: "Pending" },
  verified: { ar: "معتمد", en: "Verified" },
  rejected: { ar: "مرفوض", en: "Rejected" },
};

function formatSar(amount: number, lang: "ar" | "en") {
  return new Intl.NumberFormat(lang === "ar" ? "ar-SA" : "en-US", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string, lang: "ar" | "en") {
  // calendar: "gregory" pinned to avoid a server/client hydration mismatch
  // -- "ar-SA" can otherwise resolve to the Hijri calendar in some ICU
  // builds, differently between Node's SSR render and the browser.
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-SA" : "en-GB", {
    calendar: "gregory",
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

function TreasuryPage() {
  const { lang } = useLang();
  const label = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const { loading } = useAuth();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const fetchOverview = useServerFn(getTreasuryOverview);
  const review = useServerFn(reviewContribution);
  const fetchReceiptUrl = useServerFn(getReceiptUrl);

  const { data, isLoading } = useQuery({
    queryKey: ["treasury-overview"],
    queryFn: () => fetchOverview(),
  });

  const decide = useMutation({
    mutationFn: (input: { id: string; status: "verified" | "rejected" }) =>
      review({ data: { id: input.id, status: input.status, review_note: notes[input.id] ?? "" } }),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success(label("تم تحديث حالة المساهمة.", "Contribution status updated."));
        void queryClient.invalidateQueries({ queryKey: ["treasury-overview"] });
      } else {
        toast.error(label("تعذر تحديث الحالة.", "We couldn't update that status."));
      }
    },
    onError: () => toast.error(label("تعذر تحديث الحالة.", "We couldn't update that status.")),
  });

  const viewReceipt = useMutation({
    mutationFn: (path: string) => fetchReceiptUrl({ data: { path } }),
    onSuccess: (result) => {
      if (result.ok) {
        window.open(result.url, "_blank", "noopener,noreferrer");
      } else {
        toast.error(label("تعذر فتح الإيصال.", "We couldn't open that receipt."));
      }
    },
    onError: () => toast.error(label("تعذر فتح الإيصال.", "We couldn't open that receipt.")),
  });

  if (loading || isLoading) {
    return (
      <div className="container-page py-24 text-sm text-muted-foreground">
        {label("جارٍ التحقق…", "Checking access…")}
      </div>
    );
  }

  if (data && !data.canReview) {
    return (
      <div className="container-page py-24">
        <h1 className="text-2xl font-bold text-foreground">
          {label("هذه الصفحة لأمانة الخزينة", "This area is for treasury officers")}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {label(
            "حسابك لا يملك صلاحية الوصول إلى سجل الخزينة.",
            "Your account doesn't have access to the treasury ledger.",
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

  const totals = data?.totals ?? { verified: 0, pending: 0, count: 0 };
  const rows = data?.contributions ?? [];

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow={label("الخزينة", "Treasury")}
        title={label("سجل الخزينة", "Treasury ledger")}
        subtitle={label(
          "مراجعة الاشتراكات والمساهمات واعتماد الإيصالات.",
          "Review subscriptions and contributions, and approve receipts.",
        )}
      />

      <div className="container-page mt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="font-bold text-sm text-foreground">
                {label(
                  "تم دمج سجل الخزينة والمساهمات في لوحة الأمانة الموحدة",
                  "Treasury & Ledger are now unified in Council Console",
                )}
              </p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {label(
                "يمكنك إدارة المساهمات والمبادرات مع المؤشرات المالية والتحقق الإداري الفوري من مكان واحد.",
                "Manage contributions, initiatives, and financial health indicators in one centralized hub.",
              )}
            </p>
          </div>
          <Link
            to="/admin"
            search={{ domain: "treasury", tab: "treasury_ledger" }}
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            {label("الانتقال إلى سجل الخزينة الموحد", "Open Unified Treasury Ledger")}
            <span className={lang === "ar" ? "rotate-180" : ""}>→</span>
          </Link>
        </div>
      </div>

      <section className="container-page mt-10 grid gap-4 sm:grid-cols-3">
        <div className="border border-border bg-card p-5">
          <p className="label-caps text-muted-foreground">
            {label("إجمالي المعتمد", "Verified total")}
          </p>
          <p className="nums mt-2 text-2xl font-bold text-bronze dark:text-gold">
            {formatSar(totals.verified, lang)}
          </p>
        </div>
        <div className="border border-border bg-card p-5">
          <p className="label-caps text-muted-foreground">
            {label("إجمالي المعلّق", "Pending total")}
          </p>
          <p className="nums mt-2 text-2xl font-bold text-foreground">
            {formatSar(totals.pending, lang)}
          </p>
        </div>
        <div className="border border-border bg-card p-5">
          <p className="label-caps text-muted-foreground">{label("عدد السجلات", "Records")}</p>
          <p className="nums mt-2 text-2xl font-bold text-foreground">{totals.count}</p>
        </div>
      </section>

      <section className="container-page mt-10">
        <ul className="space-y-4">
          {rows.map((c) => (
            <li key={c.id} className="border border-border bg-card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="font-bold text-foreground">{c.contributor_name}</p>
                <span className="label-caps text-bronze dark:text-gold">
                  {statusText[c.status][lang]}
                </span>
              </div>
              <p className="nums mt-1 text-sm text-foreground">{formatSar(c.amount, lang)}</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {c.method}
                {c.purpose ? ` · ${c.purpose}` : ""}
                {c.reference ? ` · ${c.reference}` : ""}
                {" · "}
                {formatDate(c.created_at, lang)}
              </p>
              {c.review_note ? (
                <p className="mt-2 text-[12px] text-muted-foreground">{c.review_note}</p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {c.receipt_path ? (
                  <button
                    type="button"
                    onClick={() => viewReceipt.mutate(c.receipt_path as string)}
                    disabled={viewReceipt.isPending}
                    className="border border-border px-3 py-1.5 text-[12px] hover:bg-secondary disabled:opacity-60"
                  >
                    {label("عرض الإيصال", "View receipt")}
                  </button>
                ) : null}
              </div>

              {c.status === "pending" ? (
                <div className="mt-4 space-y-3">
                  <input
                    value={notes[c.id] ?? ""}
                    onChange={(e) => setNotes((n) => ({ ...n, [c.id]: e.target.value }))}
                    placeholder={label("ملاحظة المراجعة (اختياري)", "Review note (optional)")}
                    className="w-full border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-gold"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={decide.isPending}
                      onClick={() => decide.mutate({ id: c.id, status: "verified" })}
                      className="border border-gold bg-gold px-4 py-2 text-[13px] font-bold text-ink disabled:opacity-60"
                    >
                      {label("اعتماد", "Verify")}
                    </button>
                    <button
                      type="button"
                      disabled={decide.isPending}
                      onClick={() => decide.mutate({ id: c.id, status: "rejected" })}
                      className="border border-border px-4 py-2 text-[13px] font-medium hover:bg-secondary disabled:opacity-60"
                    >
                      {label("رفض", "Reject")}
                    </button>
                  </div>
                </div>
              ) : null}
            </li>
          ))}
          {rows.length === 0 ? (
            <li className="border border-dashed border-border p-6 text-sm text-muted-foreground">
              {label("لا توجد مساهمات مسجّلة بعد.", "No contributions recorded yet.")}
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
