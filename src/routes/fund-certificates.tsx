import { createFileRoute, Link } from "@tanstack/react-router";
import { FileCheck2, Clock } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow, Prose } from "@/components/site/Editorial";
import { siteMeta } from "@/content/site";
import { getCanonicalUrl } from "@/lib/seo";

export const Route = createFileRoute("/fund-certificates")({
  head: () => ({
    meta: [
      { title: "الشهادات والإثباتات | صندوق التنمية العائلية" },
      {
        name: "description",
        content:
          "الشهادات والإثباتات النظامية لصندوق التنمية العائلية (آل بوعبيد): الترخيص الرسمي وجهة الإصدار وتاريخ الإشهار.",
      },
      { property: "og:title", content: "الشهادات والإثباتات — صندوق التنمية العائلية" },
      {
        property: "og:description",
        content: "الترخيص الرسمي والإثباتات النظامية المعتمدة لصندوق التنمية العائلية (آل بوعبيد).",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: getCanonicalUrl("/fund-certificates") },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/fund-certificates") }],
  }),
  component: FundCertificatesPage,
});

function FundCertificatesPage() {
  const { lang, t } = useLang();
  const isAr = lang === "ar";

  return (
    <div>
      <PageHeader
        eyebrow={isAr ? "صندوق التنمية العائلية" : "Family Development Fund"}
        title={isAr ? "الشهادات و الاثباتات" : "Certificates & Attestations"}
        subtitle={
          isAr
            ? "التوثيق النظامي للصندوق. تُرفع نسخ الشهادات الرسمية هنا عند اعتمادها من مجلس الأسرة."
            : "Statutory documentation of the fund. Scanned certificates are published here once approved by the Family Council."
        }
        meta={[
          { label: isAr ? "رقم الترخيص" : "Licence no.", value: siteMeta.ncnpLicense, mono: true },
          { label: isAr ? "جهة الإصدار" : "Issued by", value: t(siteMeta.ncnpAuthority) },
          {
            label: isAr ? "تاريخ الإشهار" : "Registered",
            value: `${siteMeta.foundedHijri} هـ · ${siteMeta.foundedGregorian}`,
            mono: true,
          },
        ]}
      />

      <section className="container-page py-12">
        <Eyebrow rule>{isAr ? "المستندات" : "Documents"}</Eyebrow>
        <ul className="mt-6 divide-y divide-border border border-border bg-card">
          {[
            isAr ? "ترخيص الصندوق الرسمي" : "Official fund licence",
            isAr ? "شهادة التسجيل والإشهار" : "Registration & publication certificate",
            isAr ? "إثبات الحساب البنكي المعتمد" : "Approved bank account attestation",
          ].map((label) => (
            <li key={label} className="flex flex-wrap items-center gap-3 p-4">
              <FileCheck2 className="h-4 w-4 shrink-0 text-bronze dark:text-gold" aria-hidden />
              <span className="text-sm text-foreground">{label}</span>
              <span className="ms-auto inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {isAr ? "قيد الرفع" : "Pending upload"}
              </span>
            </li>
          ))}
        </ul>

        <Prose className="mt-6 text-sm text-muted-foreground">
          {isAr ? (
            <>
              لطلب صورة رسمية من أي شهادة، يمكنكم{" "}
              <Link to="/contact" className="underline hover:text-bronze dark:hover:text-gold">
                التواصل مع أمانة المجلس
              </Link>
              .
            </>
          ) : (
            <>
              To request an official copy of any certificate, please{" "}
              <Link to="/contact" className="underline hover:text-bronze dark:hover:text-gold">
                contact the Council secretariat
              </Link>
              .
            </>
          )}
        </Prose>
      </section>
    </div>
  );
}
