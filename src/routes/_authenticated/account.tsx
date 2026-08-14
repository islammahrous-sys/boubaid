import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  getMyAccount,
  submitMembershipRequest,
  updateMyProfile,
} from "@/lib/account.functions";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "حسابي | آل بوعبيد" },
      {
        name: "description",
        content: "صفحة العضو: بيانات السجل العائلي، حالة طلب العضوية، وتفضيلات الظهور في الدليل.",
      },
      { property: "og:title", content: "حسابي | آل بوعبيد" },
      { property: "og:description", content: "بيانات العضو وحالة طلب العضوية." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

const statusText = {
  pending: { ar: "قيد المراجعة", en: "Under review" },
  approved: { ar: "معتمد", en: "Approved" },
  rejected: { ar: "غير مقبول", en: "Not approved" },
} as const;

function AccountPage() {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const label = (ar: string, en: string) => (lang === "ar" ? ar : en);

  const fetchAccount = useServerFn(getMyAccount);
  const saveProfile = useServerFn(updateMyProfile);
  const requestMembership = useServerFn(submitMembershipRequest);

  const { data, isLoading } = useQuery({
    queryKey: ["account"],
    queryFn: () => fetchAccount(),
  });

  const [form, setForm] = useState({
    full_name_ar: "",
    full_name_en: "",
    branch_slug: "",
    phone: "",
    lineage_notes: "",
    show_in_directory: false,
  });

  useEffect(() => {
    if (!data?.profile) return;
    setForm({
      full_name_ar: data.profile.full_name_ar ?? "",
      full_name_en: data.profile.full_name_en ?? "",
      branch_slug: data.profile.branch_slug ?? "",
      phone: data.profile.phone ?? "",
      lineage_notes: data.profile.lineage_notes ?? "",
      show_in_directory: data.profile.show_in_directory,
    });
  }, [data?.profile]);

  const save = useMutation({
    mutationFn: () => saveProfile({ data: form }),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success(label("تم حفظ البيانات.", "Your record has been saved."));
        void queryClient.invalidateQueries({ queryKey: ["account"] });
      } else {
        toast.error(label("تعذر الحفظ.", "We couldn't save that."));
      }
    },
    onError: () => toast.error(label("تعذر الحفظ.", "We couldn't save that.")),
  });

  const apply = useMutation({
    mutationFn: () =>
      requestMembership({
        data: {
          full_name_ar: form.full_name_ar,
          full_name_en: form.full_name_en,
          phone: form.phone,
          branch_slug: form.branch_slug,
          father_lineage: "",
          notes: form.lineage_notes,
        },
      }),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success(
          label("تم إرسال طلب العضوية للمراجعة.", "Your membership request has been submitted."),
        );
        void queryClient.invalidateQueries({ queryKey: ["account"] });
      } else if (result.error === "already_pending") {
        toast.info(label("لديك طلب قيد المراجعة.", "You already have a pending request."));
      } else {
        toast.error(label("تعذر إرسال الطلب.", "We couldn't submit that request."));
      }
    },
    onError: () => toast.error(label("تعذر إرسال الطلب.", "We couldn't submit that request.")),
  });

  const request = data?.request ?? null;

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow={label("بوابة الأعضاء", "Member portal")}
        title={label("حسابي", "My account")}
        subtitle={label(
          "حدِّث بيانات سجلك العائلي، وتابع حالة طلب العضوية.",
          "Keep your family record current and follow your membership request.",
        )}
        actions={
          <div className="flex flex-wrap gap-2">
            {isAdmin ? (
              <Link
                to="/admin"
                className="border border-border px-4 py-2 text-[13px] font-medium hover:bg-secondary"
              >
                {label("لوحة الأمانة", "Council console")}
              </Link>
            ) : null}
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                await navigate({ to: "/" });
              }}
              className="border border-border px-4 py-2 text-[13px] font-medium hover:bg-secondary"
            >
              {label("خروج", "Sign out")}
            </button>
          </div>
        }
      />

      <section className="container-page mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="border border-border bg-card p-6 reveal-fade">
          <h2 className="mb-5 text-lg font-bold text-foreground">
            {label("بيانات السجل", "Register record")}
          </h2>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">{label("جارٍ التحميل…", "Loading…")}</p>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate();
              }}
            >
              <Field
                id="name-ar"
                label={label("الاسم الكامل (بالعربية)", "Full name (Arabic)")}
                value={form.full_name_ar}
                onChange={(v) => setForm((f) => ({ ...f, full_name_ar: v }))}
                required
              />
              <Field
                id="name-en"
                label={label("الاسم بالإنجليزية", "Name in English")}
                value={form.full_name_en}
                onChange={(v) => setForm((f) => ({ ...f, full_name_en: v }))}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="branch"
                  label={label("الفرع", "Branch")}
                  value={form.branch_slug}
                  onChange={(v) => setForm((f) => ({ ...f, branch_slug: v }))}
                />
                <Field
                  id="phone"
                  label={label("رقم الجوال", "Phone")}
                  value={form.phone}
                  onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                />
              </div>
              <div>
                <label htmlFor="lineage" className="label-caps mb-1.5 block text-muted-foreground">
                  {label("ملاحظات النسب", "Lineage notes")}
                </label>
                <textarea
                  id="lineage"
                  rows={4}
                  value={form.lineage_notes}
                  onChange={(e) => setForm((f) => ({ ...f, lineage_notes: e.target.value }))}
                  className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-gold"
                />
              </div>
              <label className="flex items-start gap-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={form.show_in_directory}
                  onChange={(e) => setForm((f) => ({ ...f, show_in_directory: e.target.checked }))}
                  className="mt-1"
                />
                <span>
                  {label(
                    "أوافق على ظهور اسمي وفرعي في دليل الأعضاء للمسجلين فقط.",
                    "Show my name and branch in the members-only directory.",
                  )}
                </span>
              </label>
              <button
                type="submit"
                disabled={save.isPending}
                className="border border-gold bg-gold px-5 py-2.5 text-[13px] font-bold text-ink transition-colors hover:bg-transparent hover:text-gold disabled:opacity-60"
              >
                {save.isPending ? label("جارٍ الحفظ…", "Saving…") : label("حفظ", "Save")}
              </button>
            </form>
          )}
        </div>

        <aside className="space-y-6">
          <div className="border border-border bg-card p-6 reveal-fade">
            <h2 className="mb-3 text-lg font-bold text-foreground">
              {label("العضوية", "Membership")}
            </h2>
            {request ? (
              <>
                <p className="text-sm text-foreground">
                  {label("حالة الطلب:", "Request status:")}{" "}
                  <strong className="text-bronze dark:text-gold">
                    {t(statusText[request.status])}
                  </strong>
                </p>
                {request.review_note ? (
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {request.review_note}
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {label(
                    "لم تُقدِّم طلب عضوية بعد. أكمل بياناتك ثم أرسل الطلب لمراجعة الأمانة.",
                    "You haven't applied yet. Complete your record, then send the request to the secretariat.",
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => apply.mutate()}
                  disabled={apply.isPending || form.full_name_ar.trim().length < 2}
                  className="mt-4 w-full border border-ink bg-ink px-4 py-2.5 text-[13px] font-bold text-ivory transition-colors hover:bg-transparent hover:text-foreground disabled:opacity-60 dark:border-gold dark:bg-gold dark:text-ink"
                >
                  {apply.isPending
                    ? label("جارٍ الإرسال…", "Submitting…")
                    : label("إرسال طلب العضوية", "Submit membership request")}
                </button>
              </>
            )}
          </div>

          <div className="border border-border bg-secondary/40 p-6 text-[13px] leading-relaxed text-muted-foreground">
            {label(
              "بيانات السجل العائلي مرئية لك ولأمانة المجلس فقط.",
              "Your family record is visible only to you and the council secretariat.",
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="label-caps mb-1.5 block text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-gold"
      />
    </div>
  );
}
