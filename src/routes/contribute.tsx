import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Paperclip,
  Copy,
  Check,
  Building2,
  Receipt,
  CreditCard,
  FileCheck2,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow, Prose, Ornament, Record, RecordField, Stamp } from "@/components/site/Editorial";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { siteMeta } from "@/content/site";
import { pageImages } from "@/content/images";
import { supabase } from "@/integrations/supabase/client";
import { TurnstileWidget, type TurnstileWidgetHandle } from "@/components/site/TurnstileWidget";
import { useAuth } from "@/hooks/useAuth";
import { submitContribution, getMyContributions, type ContributionRow } from "@/lib/contributions.functions";
import { getCanonicalUrl } from "@/lib/seo";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  initiative: z.string().optional(),
  purpose: z.string().optional(),
});

export const Route = createFileRoute("/contribute")({
  validateSearch: (search: z.input<typeof searchSchema>) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "الاشتراك والمساهمة | آل بوعبيد" },
      { name: "description", content: "الاشتراكات الشهرية والمساهمات في أوقاف ومشاريع صندوق التنمية العائلية (آل بوعبيد) عبر القنوات المعتمدة." },
      { property: "og:title", content: "الاشتراك والمساهمة — آل بوعبيد" },
      { property: "og:description", content: "طرق الاشتراك الشهري والمساهمة في أوقاف ومشاريع صندوق التنمية العائلية (آل بوعبيد) عبر القنوات المعتمدة." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: getCanonicalUrl("/contribute") },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/contribute") }],
  }),
  component: ContributePage,
});

const copy = {
  eyebrow: { ar: "الاشتراكات والأوقاف", en: "Subscriptions & endowments" } as BiText,
  title: { ar: "الاشتراك والمساهمة", en: "Subscribe & Contribute" } as BiText,
  subtitle: {
    ar: "تعتمد الصندوق في تمويلها على اشتراكات أبناء الأسرة والقروض الحسنة المساهمة. وتُدار المبالغ عبر حسابات مستقلة وتخضع للمراجعة السنوية.",
    en: "The organisation is funded by members' subscriptions and interest-free contributory loans. Funds are held in separate accounts and subject to annual audit.",
  } as BiText,

  metaChannel: { ar: "قناة السداد", en: "Payment channel" } as BiText,
  metaChannelValue: { ar: "متجر سلة المعتمد", en: "Approved Salla store" } as BiText,
  metaAudit: { ar: "المراجعة", en: "Audit" } as BiText,
  metaAuditValue: { ar: "سنوية مستقلة", en: "Independent, annual" } as BiText,
  metaLicence: { ar: "رقم الترخيص", en: "Licence no." } as BiText,

  scheduleEyebrow: { ar: "جدول الاشتراكات", en: "Schedule of contributions" } as BiText,
  scheduleTitle: { ar: "فئات الاشتراك والمساهمة", en: "Categories of subscription" } as BiText,
  colCategory: { ar: "الفئة", en: "Category" } as BiText,
  colAmount: { ar: "المبلغ", en: "Amount" } as BiText,
  colPurpose: { ar: "وجه الصرف", en: "Applied to" } as BiText,
  monthly: { ar: "شهرياً", en: "monthly" } as BiText,
  oneOff: { ar: "دفعة واحدة", en: "one-off" } as BiText,

  channelsEyebrow: { ar: "قنوات السداد", en: "How to pay" } as BiText,
  channelsTitle: { ar: "القنوات المعتمدة", en: "Approved channels" } as BiText,
  sallaTitle: { ar: "المتجر الإلكتروني (سلة)", en: "Online store (Salla)" } as BiText,
  sallaBody: {
    ar: "الاشتراك الشهري المتكرر يُدار عبر متجر الصندوق على منصة سلة، وتصدر الإيصالات آلياً باسم الصندوق.",
    en: "Recurring monthly subscriptions are handled through the organisation's Salla storefront, which issues receipts automatically in the organisation's name.",
  } as BiText,
  sallaCta: { ar: "الانتقال إلى المتجر", en: "Go to the store" } as BiText,

  transferTitle: { ar: "التحويل البنكي", en: "Bank transfer" } as BiText,
  transferBody: {
    ar: "للمساهمات الكبيرة والقروض الحسنة، تُطلب بيانات الحساب من الأمانة العامة مباشرة. ولا تُنشر أرقام الحسابات على الموقع.",
    en: "For larger contributions and interest-free loans, account details are obtained from the secretariat directly. Account numbers are not published on this site.",
  } as BiText,
  transferCta: { ar: "طلب بيانات الحساب", en: "Request account details" } as BiText,

  useEyebrow: { ar: "أوجه الصرف", en: "Application of funds" } as BiText,
  useTitle: { ar: "أين تذهب المساهمات", en: "Where contributions go" } as BiText,
  useP1: {
    ar: "تُوزَّع الموارد على ثلاثة حسابات مستقلة: حساب الزكاة، وحساب التشغيل والبرامج، وحساب مشروع المقر الدائم. ولا يجوز النقل بين الحسابات إلا بقرار من مجلس الأمناء.",
    en: "Resources are allocated across three separate accounts: the zakat account, the operations and programmes account, and the permanent headquarters account. Transfers between them require a resolution of the board of trustees.",
  } as BiText,
  useP2: {
    ar: "ويُعرض تقرير مالي مراجَع على الجمعية العمومية سنوياً، ويُتاح ملخصه في الأرشيف الرقمي لأبناء الأسرة.",
    en: "An audited financial report is laid before the general assembly each year, and a summary is made available to family members in the digital archive.",
  } as BiText,
  governanceCta: { ar: "الاطلاع على إطار الحوكمة", en: "Read the governance framework" } as BiText,

  safetyTitle: { ar: "تنبيه", en: "Important" } as BiText,
  safetyBody: {
    ar: "لا تطلب الصندوق أرقام بطاقات أو بيانات بنكية عبر الرسائل أو مجموعات الواتساب. وأي طلب من هذا النوع يُبلَّغ عنه للأمانة العامة فوراً.",
    en: "The organisation never requests card numbers or banking details through messages or WhatsApp groups. Any such request should be reported to the secretariat immediately.",
  } as BiText,
};

const tiers: { category: BiText; amount: BiText; purpose: BiText }[] = [
  {
    category: { ar: "اشتراك العضو البالغ", en: "Adult member" },
    amount: { ar: "١٠٠ ريال", en: "SAR 100" },
    purpose: { ar: "التشغيل وبرامج التكافل", en: "Operations and solidarity programmes" },
  },
  {
    category: { ar: "اشتراك الأسرة الواحدة", en: "Household" },
    amount: { ar: "٢٥٠ ريال", en: "SAR 250" },
    purpose: {
      ar: "التشغيل والبرامج والملتقى السنوي",
      en: "Operations, programmes, annual assembly",
    },
  },
  {
    category: { ar: "مساهمة مشروع المقر", en: "Headquarters contribution" },
    amount: { ar: "حسب الاستطاعة", en: "As able" },
    purpose: { ar: "شراء الأرض والإنشاءات", en: "Land acquisition and construction" },
  },
  {
    category: { ar: "قرض حسن مساهم", en: "Interest-free loan" },
    amount: { ar: "بالاتفاق", en: "By arrangement" },
    purpose: {
      ar: "تمويل مرحلة الإنشاء، يُردّ وفق جدول",
      en: "Construction phase, repaid on schedule",
    },
  },
];

const contribCopy = {
  formEyebrow: { ar: "سجل مساهمتك", en: "Record a contribution" } as BiText,
  formTitle: { ar: "تسجيل اشتراك أو مساهمة", en: "Record a subscription or contribution" } as BiText,
  formSubtitle: {
    ar: "سجّل تحويلك البنكي أو مساهمتك هنا ليتولى أمين الخزينة اعتمادها.",
    en: "Log your bank transfer or contribution here for the treasurer to verify.",
  } as BiText,
  contributorName: { ar: "اسم المساهم", en: "Contributor name" } as BiText,
  amount: { ar: "المبلغ (ريال سعودي)", en: "Amount (SAR)" } as BiText,
  method: { ar: "طريقة السداد", en: "Payment method" } as BiText,
  methodBank: { ar: "تحويل بنكي", en: "Bank transfer" } as BiText,
  methodInPerson: { ar: "حضورياً", en: "In person" } as BiText,
  methodOther: { ar: "أخرى", en: "Other" } as BiText,
  purpose: { ar: "وجه الصرف", en: "Purpose" } as BiText,
  reference: { ar: "المرجع البنكي", en: "Bank reference" } as BiText,
  receipt: { ar: "إيصال (اختياري، صورة أو PDF)", en: "Receipt (optional, image or PDF)" } as BiText,
  submit: { ar: "تسجيل المساهمة", en: "Record contribution" } as BiText,
  submitting: { ar: "جارٍ الإرسال…", en: "Submitting…" } as BiText,
  signedOutTitle: { ar: "لتسجيل مساهمتك", en: "To record your contribution" } as BiText,
  signedOutBody: {
    ar: "سجّل الدخول إلى حسابك لتسجيل اشتراكك أو مساهمتك ومتابعة حالتها.",
    en: "Sign in to your account to record your subscription or contribution and follow its status.",
  } as BiText,
  signInCta: { ar: "دخول الأعضاء", en: "Member sign-in" } as BiText,
  mineEyebrow: { ar: "سجلي", en: "My record" } as BiText,
  mineTitle: { ar: "مساهماتي", en: "My contributions" } as BiText,
  mineEmpty: { ar: "لم تُسجَّل أي مساهمات بعد.", en: "No contributions recorded yet." } as BiText,
  statusPending: { ar: "قيد المراجعة", en: "Pending" } as BiText,
  statusVerified: { ar: "معتمد", en: "Verified" } as BiText,
  statusRejected: { ar: "مرفوض", en: "Rejected" } as BiText,
  successToast: { ar: "تم تسجيل المساهمة، بانتظار الاعتماد.", en: "Contribution recorded, awaiting verification." } as BiText,
  errorToast: { ar: "تعذر تسجيل المساهمة.", en: "We couldn't record that contribution." } as BiText,
  uploadError: { ar: "تعذر رفع الإيصال.", en: "We couldn't upload the receipt." } as BiText,
  fileTooBig: { ar: "حجم الملف يتجاوز ٥ ميجابايت.", en: "The file exceeds 5MB." } as BiText,
  fileType: { ar: "يُقبل الصور وملفات PDF فقط.", en: "Only images and PDF files are accepted." } as BiText,
};

const statusLabels: Record<ContributionRow["status"], BiText> = {
  pending: contribCopy.statusPending,
  verified: contribCopy.statusVerified,
  rejected: contribCopy.statusRejected,
};

function formatSar(amount: number, lang: "ar" | "en") {
  return new Intl.NumberFormat(lang === "ar" ? "ar-SA" : "en-US", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string, lang: "ar" | "en") {
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-SA" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

function ContributePage() {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;
  const label = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const submit = useServerFn(submitContribution);
  const fetchMine = useServerFn(getMyContributions);

  const { data: mine, isLoading: mineLoading } = useQuery({
    queryKey: ["my-contributions"],
    queryFn: () => fetchMine(),
    enabled: !!user,
  });

  const search = Route.useSearch();

  const [form, setForm] = useState({
    contributor_name: "",
    amount: "",
    method: "bank_transfer" as "bank_transfer" | "in_person" | "other",
    purpose: search.purpose || (search.initiative ? `مبادرة: ${search.initiative}` : ""),
    reference: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [copiedIban, setCopiedIban] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);

  const handleCopyIban = async () => {
    try {
      await navigator.clipboard.writeText(siteMeta.bankAccount.iban);
      setCopiedIban(true);
      toast.success(lang === "ar" ? "تم نسخ الآيبان (IBAN) بنجاح" : "IBAN copied to clipboard");
      setTimeout(() => setCopiedIban(false), 2500);
    } catch {
      toast.error(lang === "ar" ? "فشل نسخ الآيبان" : "Failed to copy IBAN");
    }
  };

  const record = useMutation({
    mutationFn: async () => {
      let receipt_path = "";
      if (file) {
        setUploading(true);
        const ext = file.name.split(".").pop() || "bin";
        const path = `${user?.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("receipts").upload(path, file, {
          contentType: file.type,
        });
        setUploading(false);
        if (uploadErr) throw new Error("upload_failed");
        receipt_path = path;
      }
      return submit({
        data: {
          contributor_name: form.contributor_name,
          amount: Number(form.amount),
          currency: "SAR",
          method: form.method,
          purpose: form.purpose,
          reference: form.reference,
          receipt_path,
          turnstile_token: turnstileToken || undefined,
        },
      });
    },
    onSuccess: (result) => {
      if (result?.ok) {
        toast.success(t(contribCopy.successToast));
        setForm({ contributor_name: "", amount: "", method: "bank_transfer", purpose: "", reference: "" });
        setFile(null);
        setTurnstileToken("");
        turnstileRef.current?.reset();
        void queryClient.invalidateQueries({ queryKey: ["my-contributions"] });
      } else {
        toast.error(t(contribCopy.errorToast));
      }
    },
    onError: (err: Error) => {
      if (err.message === "upload_failed") {
        toast.error(t(contribCopy.uploadError));
      } else {
        toast.error(t(contribCopy.errorToast));
      }
    },
  });

  const onFileChange = (f: File | null) => {
    if (!f) {
      setFile(null);
      return;
    }
    const okType = f.type.startsWith("image/") || f.type === "application/pdf";
    if (!okType) {
      toast.error(t(contribCopy.fileType));
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error(t(contribCopy.fileTooBig));
      return;
    }
    setFile(f);
  };

  return (
    <>
      <PageHeader
        variant="document"
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
        meta={[
          { label: t(copy.metaChannel), value: t(copy.metaChannelValue) },
          { label: t(copy.metaAudit), value: t(copy.metaAuditValue) },
          { label: t(copy.metaLicence), value: siteMeta.ncnpLicense, mono: true },
        ]}
      />

      <div className="container-page pb-20">
        {/* ── Schedule of contributions ──────────────────────── */}
        <section className="reveal-on-scroll">
          <Eyebrow>{t(copy.scheduleEyebrow)}</Eyebrow>
          <h2 className="mt-3 text-2xl leading-tight text-foreground md:text-3xl">
            {t(copy.scheduleTitle)}
          </h2>

          {/* Table at md+; a stacked record card below, so nothing scrolls
              sideways on a phone. */}
          <div className="mt-7 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[36rem] border-collapse">
              <thead>
                <tr className="border-y border-ink/25 dark:border-ivory/20">
                  <th scope="col" className="label-caps py-2.5 text-start text-muted-foreground">
                    {t(copy.colCategory)}
                  </th>
                  <th scope="col" className="label-caps py-2.5 text-start text-muted-foreground">
                    {t(copy.colAmount)}
                  </th>
                  <th scope="col" className="label-caps py-2.5 text-start text-muted-foreground">
                    {t(copy.colPurpose)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier, i) => (
                  <tr key={i} className="border-b border-border align-baseline">
                    <td className="py-4 pe-6 text-sm font-medium text-foreground">
                      {t(tier.category)}
                    </td>
                    <td className="nums py-4 pe-6 text-sm whitespace-nowrap text-bronze dark:text-gold">
                      {t(tier.amount)}
                      {i < 2 ? (
                        <span className="ms-1.5 text-xs text-muted-foreground">
                          {t(copy.monthly)}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-4 text-[13px] leading-snug text-muted-foreground">
                      {t(tier.purpose)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-7 border-t border-ink/25 md:hidden dark:border-ivory/20">
            {tiers.map((tier, i) => (
              <Record key={i} title={t(tier.category)}>
                <RecordField label={t(copy.colAmount)} mono>
                  {t(tier.amount)}
                  {i < 2 ? (
                    <span className="ms-1.5 text-xs text-muted-foreground">{t(copy.monthly)}</span>
                  ) : null}
                </RecordField>
                <p className="pt-1 text-[13px] leading-snug text-muted-foreground">
                  {t(tier.purpose)}
                </p>
              </Record>
            ))}
          </div>
        </section>


        {/* ── Channels ───────────────────────────────────────── */}
        <section className="reveal-on-scroll mt-16 border-t border-border pt-12">
          <Eyebrow>{t(copy.channelsEyebrow)}</Eyebrow>
          <h2 className="mt-3 text-2xl leading-tight text-foreground md:text-3xl">
            {t(copy.channelsTitle)}
          </h2>

          <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-14">
            <div className="border-t-2 border-ink pt-5 dark:border-gold">
              <h3 className="text-lg text-foreground">{t(copy.sallaTitle)}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t(copy.sallaBody)}
              </p>
              <a
                href={siteMeta.sallaStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 border border-ink bg-ink px-5 py-3 text-sm font-medium text-ivory transition-colors hover:bg-transparent hover:text-foreground dark:border-gold dark:bg-gold dark:text-ink dark:hover:bg-transparent dark:hover:text-gold"
              >
                {t(copy.sallaCta)}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>

            <div className="border-t border-border pt-5">
              <h3 className="text-lg text-foreground">{t(copy.transferTitle)}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t(copy.transferBody)}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setBankModalOpen(true)}
                  className="inline-flex items-center gap-2 border border-bronze bg-bronze/10 px-5 py-3 text-sm font-medium text-bronze transition-colors hover:bg-bronze hover:text-white dark:border-gold dark:bg-gold/10 dark:text-gold dark:hover:bg-gold dark:hover:text-ink"
                >
                  <Building2 className="h-4 w-4" aria-hidden="true" />
                  {lang === "ar" ? "عرض بيانات الحساب البنكي والآيبان" : "View Official Bank Details & IBAN"}
                </button>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  {t(copy.transferCta)}
                  <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          <Dialog open={bankModalOpen} onOpenChange={setBankModalOpen}>
            <DialogContent className="max-w-lg p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-serif text-foreground">
                  {lang === "ar" ? "بيانات الحساب البنكي الرسمي" : "Official Bank Account Particulars"}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {lang === "ar"
                    ? "الحساب البنكي الرسمي المعتمد لصندوق التنمية العائلية (آل بوعبيد) الخاضع للترخيص والإشراف المالي."
                    : "The official bank account of Al-Boabid Family Fund subject to NCNP licensing and audit."}
                </DialogDescription>
              </DialogHeader>

              {user ? (
                <div className="mt-4 space-y-4 rounded-lg border border-border bg-muted/40 p-4">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">
                      {lang === "ar" ? "اسم المستفيد / الجهة" : "Beneficiary Name"}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {t(siteMeta.bankAccount.beneficiaryName)}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">
                      {lang === "ar" ? "البنك" : "Bank"}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {t(siteMeta.bankAccount.bankName)}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">
                      {lang === "ar" ? "رقم الحساب" : "Account Number"}
                    </span>
                    <code className="text-sm font-mono text-foreground font-semibold">
                      {siteMeta.bankAccount.accountNumber}
                    </code>
                  </div>

                  <div className="border-t border-border pt-3">
                    <span className="text-xs text-muted-foreground block mb-1">
                      {lang === "ar" ? "رقم الآيبان الدولي (IBAN)" : "International Bank Account Number (IBAN)"}
                    </span>
                    <div className="mt-1 flex items-center justify-between gap-2 rounded border border-border bg-background p-2.5">
                      <code className="text-xs sm:text-sm font-mono font-bold tracking-wider text-foreground select-all" dir="ltr">
                        {siteMeta.bankAccount.iban}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyIban}
                        className="inline-flex items-center gap-1.5 rounded bg-bronze/10 px-2.5 py-1.5 text-xs font-medium text-bronze transition-colors hover:bg-bronze hover:text-white dark:bg-gold/10 dark:text-gold dark:hover:bg-gold dark:hover:text-ink"
                      >
                        {copiedIban ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{lang === "ar" ? "تم النسخ" : "Copied"}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>{lang === "ar" ? "نسخ" : "Copy"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-3 rounded-lg border border-border bg-muted/40 p-4">
                  <p className="text-sm leading-relaxed text-foreground">
                    {lang === "ar"
                      ? "بيانات الحساب البنكي متاحة لأعضاء الأسرة المسجَّلين فقط. يرجى تسجيل الدخول لعرضها."
                      : "Bank account details are available to registered family members only. Please sign in to view them."}
                  </p>
                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-2 border border-ink bg-ink px-4 py-2 text-xs font-medium text-ivory transition-colors hover:bg-transparent hover:text-foreground dark:border-gold dark:bg-gold dark:text-ink dark:hover:bg-transparent dark:hover:text-gold"
                  >
                    {t(contribCopy.signInCta)}
                    <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </section>

        {/* ── Record a contribution ─────────────────────────── */}
        {/* ── Record a contribution ─────────────────────────── */}
        <section className="reveal-on-scroll mt-16 border-t border-border pt-12">
          <Eyebrow>{t(contribCopy.formEyebrow)}</Eyebrow>
          <h2 className="mt-3 text-2xl leading-tight text-foreground md:text-3xl">
            {t(contribCopy.formTitle)}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {t(contribCopy.formSubtitle)}
          </p>

          {/* 3-Step Visual Process Guide */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 border border-border bg-secondary/30 p-4 rounded-md">
            <div className="flex items-start gap-3 p-3 bg-card border border-border rounded">
              <div className="w-8 h-8 rounded-full bg-bronze/10 text-bronze dark:bg-gold/10 dark:text-gold font-bold flex items-center justify-center shrink-0 text-sm">
                1
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground">
                  {lang === "ar" ? "التحويل البنكي المعتمد" : "1. Bank Transfer"}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {lang === "ar"
                    ? "التحويل لحساب الصندوق الرسمي بمصرف الإنماء عبر الآيبان."
                    : "Transfer to the official Alinma Bank account via IBAN."}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-card border border-border rounded">
              <div className="w-8 h-8 rounded-full bg-bronze/10 text-bronze dark:bg-gold/10 dark:text-gold font-bold flex items-center justify-center shrink-0 text-sm">
                2
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground">
                  {lang === "ar" ? "إرفاق إشعار السداد" : "2. Attach Receipt"}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {lang === "ar"
                    ? "تعبئة بيانات المساهمة وإرفاق صورة الإشعار البنكي."
                    : "Fill in contribution details and attach transfer receipt."}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-card border border-border rounded">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-sm">
                3
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground">
                  {lang === "ar" ? "التوثيق الرقمي المعتمد" : "3. Official Verification"}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {lang === "ar"
                    ? "مراجعة أمين الصندوق وتوثيق المساهمة في سجلاتك المالية."
                    : "Treasury review and official confirmation in your account."}
                </p>
              </div>
            </div>
          </div>

          {user ? (
            <form
              className="mt-8 grid gap-4 border border-border bg-card p-6 sm:grid-cols-2 rounded-md"
              onSubmit={(e) => {
                e.preventDefault();
                record.mutate();
              }}
            >
              <div className="sm:col-span-2">
                <label htmlFor="contributor-name" className="label-caps mb-1.5 block text-muted-foreground">
                  {t(contribCopy.contributorName)}
                </label>
                <input
                  id="contributor-name"
                  required
                  value={form.contributor_name}
                  onChange={(e) => setForm((f) => ({ ...f, contributor_name: e.target.value }))}
                  className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-gold rounded-sm"
                />
              </div>

              <div>
                <label htmlFor="amount" className="label-caps mb-1.5 block text-muted-foreground">
                  {t(contribCopy.amount)}
                </label>
                <input
                  id="amount"
                  type="number"
                  min={1}
                  step="0.01"
                  required
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className="nums w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-gold rounded-sm"
                />
                {/* Quick amount chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[100, 250, 500, 1000, 2500].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, amount: val.toString() }))}
                      className={cn(
                        "px-2 py-0.5 text-xs font-semibold rounded border transition-colors cursor-pointer",
                        form.amount === val.toString()
                          ? "bg-bronze text-white border-bronze dark:bg-gold dark:text-ink dark:border-gold"
                          : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                      )}
                    >
                      {val} {lang === "ar" ? "ريال" : "SAR"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="method" className="label-caps mb-1.5 block text-muted-foreground">
                  {t(contribCopy.method)}
                </label>
                <select
                  id="method"
                  value={form.method}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, method: e.target.value as typeof f.method }))
                  }
                  className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-gold rounded-sm"
                >
                  <option value="bank_transfer">{t(contribCopy.methodBank)}</option>
                  <option value="in_person">{t(contribCopy.methodInPerson)}</option>
                  <option value="other">{t(contribCopy.methodOther)}</option>
                </select>
              </div>

              <div>
                <label htmlFor="purpose" className="label-caps mb-1.5 block text-muted-foreground">
                  {t(contribCopy.purpose)}
                </label>
                <input
                  id="purpose"
                  value={form.purpose}
                  onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
                  placeholder={lang === "ar" ? "مثال: مشروع المقر الدائم / كفالة تعليمية" : "e.g. Headquarters / Educational Fund"}
                  className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-gold rounded-sm"
                />
              </div>

              <div>
                <label htmlFor="reference" className="label-caps mb-1.5 block text-muted-foreground">
                  {t(contribCopy.reference)}
                </label>
                <input
                  id="reference"
                  value={form.reference}
                  onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                  placeholder={lang === "ar" ? "رقم الحوالة البنكية (اختياري)" : "Transfer Ref. No."}
                  className="nums w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-gold rounded-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="receipt" className="label-caps mb-1.5 block text-muted-foreground">
                  {t(contribCopy.receipt)}
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <label
                    htmlFor="receipt"
                    className="inline-flex cursor-pointer items-center gap-2 border border-border px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary rounded-sm transition-colors"
                  >
                    <Paperclip className="h-4 w-4" aria-hidden="true" />
                    {file ? file.name : label("اختيار ملف الإشعار", "Choose receipt file")}
                  </label>
                  <input
                    id="receipt"
                    type="file"
                    accept="image/*,application/pdf"
                    className="sr-only"
                    onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                  />
                  {file && file.type.startsWith("image/") ? (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      {lang === "ar" ? "تم إرفاق صورة الإشعار" : "Receipt attached"}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="sm:col-span-2">
                <TurnstileWidget ref={turnstileRef} onToken={setTurnstileToken} />
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={record.isPending || uploading}
                  className="border border-gold bg-gold px-6 py-2.5 text-xs font-bold text-ink transition-colors hover:bg-transparent hover:text-gold disabled:opacity-60 rounded-sm cursor-pointer"
                >
                  {record.isPending || uploading ? t(contribCopy.submitting) : t(contribCopy.submit)}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border border-border bg-secondary/40 p-6">
              <div>
                <p className="font-bold text-foreground">{t(contribCopy.signedOutTitle)}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  {t(contribCopy.signedOutBody)}
                </p>
              </div>
              <Link
                to="/auth"
                className="inline-flex shrink-0 items-center gap-2 border border-ink bg-ink px-5 py-3 text-sm font-medium text-ivory transition-colors hover:bg-transparent hover:text-foreground dark:border-gold dark:bg-gold dark:text-ink dark:hover:bg-transparent dark:hover:text-gold"
              >
                {t(contribCopy.signInCta)}
                <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          )}

          {user ? (
            <div className="mt-10">
              <Eyebrow>{t(contribCopy.mineEyebrow)}</Eyebrow>
              <h3 className="mt-2 text-xl leading-tight text-foreground">{t(contribCopy.mineTitle)}</h3>

              {mineLoading ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  {label("جارٍ التحميل…", "Loading…")}
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-border border border-border bg-card">
                  {(mine ?? []).map((c) => (
                    <li
                      key={c.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm"
                    >
                      <div>
                        <p className="nums font-medium text-foreground">{formatSar(c.amount, lang)}</p>
                        <p className="text-[12px] text-muted-foreground">
                          {formatDate(c.created_at, lang)}
                          {c.purpose ? ` · ${c.purpose}` : ""}
                        </p>
                      </div>
                      <span
                        className={`label-caps rounded-full px-3 py-1 text-[11px] ${
                          c.status === "verified"
                            ? "bg-gold/15 text-bronze dark:text-gold"
                            : c.status === "rejected"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {t(statusLabels[c.status])}
                      </span>
                    </li>
                  ))}
                  {(mine ?? []).length === 0 ? (
                    <li className="px-5 py-6 text-sm text-muted-foreground">{t(contribCopy.mineEmpty)}</li>
                  ) : null}
                </ul>
              )}
            </div>
          ) : null}
        </section>

        {/* ── Application of funds ───────────────────────────── */}
        <section className="reveal-on-scroll mt-16 border-t border-border pt-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,14rem)_1fr] lg:gap-16">
            <div>
              <Eyebrow>{t(copy.useEyebrow)}</Eyebrow>
              <h2 className="mt-3 text-xl leading-tight text-foreground md:text-2xl">
                {t(copy.useTitle)}
              </h2>
            </div>

            <div>
              <figure className="mb-7">
                <img
                  src={pageImages.contribute.endowment.src}
                  alt=""
                  className="photo-plate aspect-[16/9] w-full object-cover"
                  loading="lazy"
                />
                <figcaption className="mt-3 flex items-start gap-2.5 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
                  <span className="mt-1.5 h-px w-5 shrink-0 bg-bronze" aria-hidden="true" />
                  <span>{t(pageImages.contribute.endowment.caption)}</span>
                </figcaption>
              </figure>

              <Prose>
                <p>{t(copy.useP1)}</p>
                <p>{t(copy.useP2)}</p>
              </Prose>

              <Link
                to="/foundation"
                className="mt-6 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
              >
                {t(copy.governanceCta)}
                <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <Ornament className="mt-16" />

        {/* ── Fraud warning ──────────────────────────────────── */}
        <aside className="relative mt-12 border border-ink/30 p-6 dark:border-ivory/20">
          <Stamp>{rtl ? "تنبيه رسمي" : "Official Notice"}</Stamp>
          <p className="label-caps mb-2.5 text-bronze dark:text-gold">{t(copy.safetyTitle)}</p>
          <p className="measure text-sm leading-relaxed text-foreground">{t(copy.safetyBody)}</p>
        </aside>
      </div>
    </>
  );
}
