import { createFileRoute, Link } from "@tanstack/react-router";
import { FileSpreadsheet, Clock, MessageCircle, HeartHandshake } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow, Prose } from "@/components/site/Editorial";
import { getCanonicalUrl } from "@/lib/seo";

export const Route = createFileRoute("/fund-financials")({
  head: () => ({
    meta: [
      { title: "القوائم المالية والموازنة والحسابات | صندوق التنمية العائلية" },
      {
        name: "description",
        content:
          "القوائم المالية لصندوق التنمية العائلية (آل بوعبيد) بداية من عام 2026، وكشوف الحسابات من 1998 إلى 2025، وطلب الاستعلام المالي.",
      },
      { property: "og:title", content: "القوائم المالية والموازنة والحسابات — آل بوعبيد" },
      {
        property: "og:description",
        content: "القوائم المالية والموازنة وكشوف حسابات صندوق التنمية العائلية، وطلب استعلام مالي.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: getCanonicalUrl("/fund-financials") },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/fund-financials") }],
  }),
  component: FundFinancialsPage,
});

/** Financial inquiries are reviewed and approved by the President of the Family
 *  Council, Dr. Khaled Bu Obaid, over the Council's official WhatsApp line. */
const COUNCIL_WHATSAPP = "966558888010";

function FundFinancialsPage() {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const inquiryMessage = isAr
    ? "السلام عليكم، أرغب في تقديم طلب استعلام مالي لصندوق التنمية العائلية (آل بوعبيد) — لعناية رئيس مجلس الأسرة د. خالد بوعبيد.\nالاسم:\nالفرع:\nموضوع الاستعلام:"
    : "Hello, I would like to submit a financial inquiry request for the Al Bu Obaid Family Development Fund, for the attention of the Family Council President, Dr. Khaled Bu Obaid.\nName:\nBranch:\nSubject:";
  const whatsappHref = `https://wa.me/${COUNCIL_WHATSAPP}?text=${encodeURIComponent(inquiryMessage)}`;

  const statements = [
    {
      ar: "القوائم المالية بداية من عام 2026",
      en: "Financial statements from 2026 onward",
    },
    {
      ar: "كشف الحساب من عام 2023 الي 2025",
      en: "Account statement 2023–2025",
    },
    {
      ar: "كشف الحساب من عام 1998 الي 2022",
      en: "Account statement 1998–2022",
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow={isAr ? "صندوق التنمية العائلية" : "Family Development Fund"}
        title={isAr ? "القوائم المالية والموازنة والحسابات" : "Financial Statements, Budget & Accounts"}
        subtitle={
          isAr
            ? "سجل الصندوق المالي المعتمد. تُنشر الملفات هنا عقب اعتمادها من مجلس الأسرة، ويمكن لأفراد الأسرة تقديم طلب استعلام مالي رسمي."
            : "The fund's approved financial record. Files are published after Family Council approval; members may submit an official financial inquiry."
        }
      />

      <section className="container-page py-12">
        <Eyebrow rule>{isAr ? "السجلات المالية" : "Financial records"}</Eyebrow>
        <ul className="mt-6 divide-y divide-border border border-border bg-card">
          {statements.map((s) => (
            <li key={s.en} className="flex flex-wrap items-center gap-3 p-4">
              <FileSpreadsheet
                className="h-4 w-4 shrink-0 text-bronze dark:text-gold"
                aria-hidden="true"
              />
              <span className="text-sm text-foreground">{isAr ? s.ar : s.en}</span>
              <span className="ms-auto inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {isAr ? "يُتاح عند الاعتماد" : "Available on approval"}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 border border-bronze bg-bronze px-5 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-transparent hover:text-bronze dark:border-gold dark:bg-gold dark:text-ink dark:hover:text-gold"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {isAr ? "طلب استعلام مالي" : "Financial Inquiry Request"}
          </a>
          <Link
            to="/contribute"
            className="inline-flex items-center justify-center gap-2 border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-bronze hover:text-bronze dark:hover:border-gold dark:hover:text-gold"
          >
            <HeartHandshake className="h-4 w-4" aria-hidden="true" />
            {isAr ? "الدعم والمساهمة — Support and Donate" : "Support and Donate"}
          </Link>
        </div>

        <Prose className="mt-6 text-xs text-muted-foreground">
          {isAr
            ? "تُحوَّل طلبات الاستعلام المالي إلى رئيس مجلس الأسرة د. خالد بوعبيد للاعتماد قبل تزويد مقدّم الطلب بالبيانات."
            : "Financial inquiries are routed to the Family Council President, Dr. Khaled Bu Obaid, for approval before any figures are released."}
        </Prose>
      </section>
    </div>
  );
}
