import { Link } from "@tanstack/react-router";
import { Download, FileText, Printer, ShieldCheck } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import {
  LEGAL_DOCUMENTS,
  LEGAL_EFFECTIVE_DATE,
  LEGAL_EFFECTIVE_LABEL,
  LEGAL_VERSION,
  PRIVACY_SECTIONS,
  TERMS_SECTIONS,
  VISITOR_NOTICE,
  type LegalDocumentKey,
  type LegalSection,
} from "@/content/legal";
import { siteMeta } from "@/content/site";

const SECTIONS: Record<LegalDocumentKey, LegalSection[]> = {
  terms: TERMS_SECTIONS,
  privacy: PRIVACY_SECTIONS,
};

// Only ever called with LEGAL_EFFECTIVE_DATE; uses the fixed label because
// locale date formatting differs between the server and browsers (hydration).
function formatDate(_iso: string, lang: "ar" | "en") {
  return LEGAL_EFFECTIVE_LABEL[lang];
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * A self-contained copy of the document in the reader's language, so the
 * downloaded file is readable offline and records which version it is.
 */
export function buildLegalDocumentHtml(doc: LegalDocumentKey, lang: "ar" | "en", extra = "") {
  const meta = LEGAL_DOCUMENTS[doc];
  const sections = SECTIONS[doc]
    .map(
      (s) =>
        `<h2>${escapeHtml(s.title[lang])}</h2>${s.paragraphs.map((p) => `<p>${escapeHtml(p[lang])}</p>`).join("")}`,
    )
    .join("");
  const versionLine =
    lang === "ar"
      ? `الإصدار ${LEGAL_VERSION} — ساري من ${formatDate(LEGAL_EFFECTIVE_DATE, lang)}`
      : `Version ${LEGAL_VERSION} — effective ${formatDate(LEGAL_EFFECTIVE_DATE, lang)}`;
  return `<!doctype html><html lang="${lang}" dir="${lang === "ar" ? "rtl" : "ltr"}"><head><meta charset="utf-8"><title>${escapeHtml(meta.title[lang])}</title><style>body{font-family:system-ui,Tahoma,sans-serif;max-width:46rem;margin:2rem auto;padding:0 1rem;line-height:1.8;color:#1d1a16}h1{font-size:1.6rem}h2{font-size:1.1rem;margin-top:1.8rem}.meta{color:#6b6257;font-size:.9rem}.box{border:1px solid #c9a35b;padding:1rem;margin:1.5rem 0;border-radius:.5rem}</style></head><body><h1>${escapeHtml(meta.title[lang])}</h1><p class="meta">${escapeHtml(t(siteMeta.officialName, lang))} · www.${siteMeta.domain}<br>${versionLine}</p>${extra}${sections}</body></html>`;
}

function t(text: { ar: string; en: string }, lang: "ar" | "en") {
  return text[lang];
}

export function downloadHtml(filename: string, html: string) {
  const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const actionClass =
  "inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-foreground transition-transform duration-200 hover:-translate-y-0.5 hover:border-gold/60 focus-visible:outline-2 focus-visible:outline-gold active:translate-y-0";

export function LegalDocumentPage({ doc }: { doc: LegalDocumentKey }) {
  const { lang } = useLang();
  const meta = LEGAL_DOCUMENTS[doc];
  const other: LegalDocumentKey = doc === "terms" ? "privacy" : "terms";
  const sections = SECTIONS[doc];
  const isAr = lang === "ar";

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          variant="document"
          eyebrow={isAr ? "الوثائق النظامية" : "Legal documents"}
          title={meta.title[lang]}
          subtitle={meta.summary[lang]}
          meta={[
            { label: isAr ? "الإصدار" : "Version", value: LEGAL_VERSION, mono: true },
            {
              label: isAr ? "تاريخ السريان" : "Effective",
              value: formatDate(LEGAL_EFFECTIVE_DATE, lang),
            },
            { label: isAr ? "النظام الحاكم" : "Governing law", value: isAr ? "المملكة العربية السعودية" : "Kingdom of Saudi Arabia" },
          ]}
          actions={
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => window.print()} className={actionClass}>
                <Printer className="h-4 w-4 text-gold" aria-hidden />
                {isAr ? "طباعة" : "Print"}
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadHtml(
                    `boubaid-${doc}-v${LEGAL_VERSION}-${lang}.html`,
                    buildLegalDocumentHtml(doc, lang),
                  )
                }
                className={actionClass}
              >
                <Download className="h-4 w-4 text-gold" aria-hidden />
                {isAr ? "تنزيل نسخة" : "Download a copy"}
              </button>
            </div>
          }
        />
      </div>

      {/* Print-only masthead: the screen header is hidden on paper. */}
      <div className="hidden print:block px-8 pt-6">
        <h1 className="text-2xl font-bold">{meta.title[lang]}</h1>
        <p className="text-sm">
          {siteMeta.officialName[lang]} · www.{siteMeta.domain} ·{" "}
          {isAr ? `الإصدار ${LEGAL_VERSION}` : `Version ${LEGAL_VERSION}`} ·{" "}
          {formatDate(LEGAL_EFFECTIVE_DATE, lang)}
        </p>
      </div>

      <div className="container-page py-12 md:py-16 print:py-4">
        <div className="grid gap-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
          <nav
            aria-label={isAr ? "محتويات الوثيقة" : "Contents"}
            className="print:hidden lg:sticky lg:top-28 lg:self-start"
          >
            <p className="label-caps mb-3 text-muted-foreground">{isAr ? "المحتويات" : "Contents"}</p>
            <ol className="space-y-1.5 border-s border-border ps-4 text-[13px]">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block py-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground"
                  >
                    {s.title[lang]}
                  </a>
                </li>
              ))}
            </ol>

            <Link
              to={LEGAL_DOCUMENTS[other].path}
              className="mt-8 flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-transform duration-200 hover:-translate-y-0.5 hover:border-gold/60 focus-visible:outline-2 focus-visible:outline-gold"
            >
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
              <span className="text-[13px] font-semibold leading-snug text-foreground">
                {LEGAL_DOCUMENTS[other].title[lang]}
              </span>
            </Link>
          </nav>

          <article className="max-w-3xl">
            {doc === "terms" ? (
              <aside className="mb-10 flex items-start gap-3 rounded-xl border border-gold/30 bg-gold/5 p-5">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-bronze dark:text-gold" aria-hidden />
                <div>
                  <p className="label-caps mb-1.5 text-bronze dark:text-gold">
                    {isAr ? "إشعار موجز للزوار" : "Short notice for visitors"}
                  </p>
                  <p className="text-[14px] leading-[1.9] text-foreground/85">{VISITOR_NOTICE[lang]}</p>
                </div>
              </aside>
            ) : null}

            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-28 border-t border-border py-8 first:border-t-0 first:pt-0 print:break-inside-avoid">
                <h2 className="font-naskh text-xl font-bold tracking-[-0.01em] text-ink dark:text-foreground md:text-2xl">
                  {s.title[lang]}
                </h2>
                <div className="mt-4 space-y-4">
                  {s.paragraphs.map((p, i) => (
                    <p key={i} className="text-[15px] leading-[1.95] text-foreground/85">
                      {p[lang]}
                    </p>
                  ))}
                </div>
              </section>
            ))}

            <p className="mt-6 border-t border-border pt-6 text-[13px] leading-relaxed text-muted-foreground print:hidden">
              {isAr ? (
                <>
                  لأي استفسار أو طلب يتعلق بهذه الوثيقة أو ببياناتك الشخصية،{" "}
                  <Link to="/contact" search={{ topic: "data" }} className="font-semibold text-bronze underline underline-offset-4 dark:text-gold">
                    راسل الأمانة
                  </Link>
                  . وللإبلاغ عن محتوى منشور،{" "}
                  <Link to="/contact" search={{ topic: "report" }} className="font-semibold text-bronze underline underline-offset-4 dark:text-gold">
                    استخدم نموذج الإبلاغ
                  </Link>
                  .
                </>
              ) : (
                <>
                  For any question or request about this document or your personal data,{" "}
                  <Link to="/contact" search={{ topic: "data" }} className="font-semibold text-bronze underline underline-offset-4 dark:text-gold">
                    contact the secretariat
                  </Link>
                  . To report published content,{" "}
                  <Link to="/contact" search={{ topic: "report" }} className="font-semibold text-bronze underline underline-offset-4 dark:text-gold">
                    use the report form
                  </Link>
                  .
                </>
              )}
            </p>
          </article>
        </div>
      </div>
    </>
  );
}
