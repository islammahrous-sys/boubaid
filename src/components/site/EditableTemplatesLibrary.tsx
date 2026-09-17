import { useState } from "react";
import { Download, Eye, FileText, Presentation } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { Eyebrow } from "@/components/site/Editorial";
import { MediaViewerDialog, type MediaViewerKind } from "@/components/site/MediaViewerDialog";
import { downloadFile } from "@/lib/download";

/**
 * «قوالب المناسبات القابلة للتحرير يدويًا» — Occasions Manual Editable Templates.
 *
 * A dedicated library inside the existing Forms & Templates page. Every record
 * lives in the same `library_items` CMS table under the `templates_editable`
 * collection, so an administrator can add or replace an editable master from
 * Admin → الأرشيف والمكتبة with no code change. Nothing here alters the
 * supplied PowerPoint masters: the site links the original uploaded file for
 * download and uses the already-published announcement artwork (matched by the
 * official template code) purely as a website preview.
 */

export interface EditableTemplateRecord {
  id: string;
  reference: string | null;
  title_ar: string;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  kind: string | null;
  href: string;
}

const copy = {
  title: {
    ar: "قوالب المناسبات القابلة للتحرير يدويًا",
    en: "Occasions Manual Editable Templates",
  } as BiText,
  intro: {
    ar: "المكتبة المخصصة للأصول القابلة للتحرير: ملف PowerPoint مستقل لكل قالب من القوالب الأربعة عشر المعتمدة، مع الملف المرجعي الرسمي.",
    en: "The dedicated library of editable master assets: an individual PowerPoint file for each of the fourteen approved templates, together with the official reference file.",
  } as BiText,
  editable: { ar: "قالب قابل للتحرير", en: "Editable Template" } as BiText,
  view: { ar: "عرض الملف", en: "View Document" } as BiText,
  download: { ar: "تحميل", en: "Download" } as BiText,
  previewNote: {
    ar: "المعاينة صورة للقالب فقط؛ الملف القابل للتحرير يُنزَّل بصيغة PowerPoint.",
    en: "The preview is an image of the template only; the editable file is downloaded as PowerPoint.",
  } as BiText,
  previewTitle: { ar: "معاينة القالب", en: "Template preview" } as BiText,
  referenceTitle: { ar: "الملف المرجعي", en: "Reference File" } as BiText,
  readOnSite: {
    ar: "نص الملف المرجعي كما ورد",
    en: "The reference file's text, as supplied",
  } as BiText,
};

/** File-type icon per editable format; always paired with a text label. */
function KindIcon({ kind }: { kind: string | null }) {
  if ((kind ?? "").toUpperCase() === "PDF") {
    return <FileText className="h-5 w-5 text-bronze dark:text-gold" aria-hidden="true" />;
  }
  return <Presentation className="h-5 w-5 text-bronze dark:text-gold" aria-hidden="true" />;
}

export function EditableTemplatesLibrary({
  items,
  previews,
}: {
  items: EditableTemplateRecord[];
  /** Official template code → published announcement artwork URL. */
  previews: Record<string, string>;
}) {
  const { t, lang } = useLang();
  const rtl = lang === "ar";
  const [viewer, setViewer] = useState<{
    src: string;
    kind: MediaViewerKind;
    title: string;
  } | null>(null);

  if (items.length === 0) return null;

  const templates = items.filter((r) => (r.kind ?? "").toUpperCase() !== "PDF");
  const references = items.filter((r) => (r.kind ?? "").toUpperCase() === "PDF");

  const label = (r: EditableTemplateRecord) => (rtl ? r.title_ar : r.title_en || r.title_ar);
  const note = (r: EditableTemplateRecord) =>
    (rtl ? r.description_ar : r.description_en || r.description_ar) || null;

  return (
    <section className="reveal-on-scroll mt-16">
      <Eyebrow rule>{t(copy.title)}</Eyebrow>
      <p className="measure mt-4 text-[13px] leading-relaxed text-muted-foreground">
        {t(copy.intro)}
      </p>

      <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((r) => {
          const preview = r.reference ? previews[r.reference] : undefined;
          const name = label(r);
          return (
            <li
              key={r.id}
              className="flex flex-col overflow-hidden rounded-md border border-border bg-card"
            >
              {preview ? (
                <img
                  src={preview}
                  alt={`${t(copy.previewTitle)} — ${name}`}
                  loading="lazy"
                  className="block h-auto w-full border-b border-border object-contain"
                />
              ) : null}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2">
                  <KindIcon kind={r.kind} />
                  <span className="nums font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                    {(r.kind || "PPTX").toUpperCase()}
                  </span>
                  <span className="rounded-sm border border-bronze/50 px-2 py-0.5 text-[11px] font-medium text-bronze dark:border-gold/50 dark:text-gold">
                    {t(copy.editable)}
                  </span>
                </div>

                <h3 className="mt-3 break-words text-[15px] font-semibold leading-snug text-foreground">
                  {name}
                </h3>
                {r.reference ? (
                  <p className="nums mt-1 font-mono text-[12px] tracking-wide text-muted-foreground">
                    {r.reference}
                  </p>
                ) : null}
                {note(r) ? (
                  <p className="mt-2 break-words text-[13px] leading-relaxed text-muted-foreground">
                    {note(r)}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                  {preview ? (
                    <button
                      type="button"
                      onClick={() =>
                        setViewer({
                          src: preview,
                          kind: "image",
                          title: `${t(copy.previewTitle)} — ${name}${r.reference ? ` (${r.reference})` : ""}`,
                        })
                      }
                      aria-label={`${t(copy.view)} — ${name}`}
                      className="inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-[13px] font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      {t(copy.view)}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void downloadFile(r.href, `${r.reference ?? name} — ${name}`)}
                    aria-label={`${t(copy.download)} — ${name} (${(r.kind || "PPTX").toUpperCase()})`}
                    className="inline-flex items-center gap-2 border-b border-transparent pb-0.5 text-[13px] font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    {t(copy.download)}
                  </button>
                </div>
                {preview ? (
                  <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                    {t(copy.previewNote)}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      {references.length > 0 ? (
        <div className="mt-12">
          <h3 className="text-[15px] font-semibold text-foreground">{t(copy.referenceTitle)}</h3>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {references.map((r) => {
              const name = label(r);
              return (
                <li key={r.id} className="flex flex-col rounded-md border border-border bg-card p-5">
                  <div className="flex items-center gap-2">
                    <KindIcon kind={r.kind} />
                    <span className="nums font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                      PDF
                    </span>
                  </div>
                  <h4 className="mt-3 break-words text-[15px] font-semibold leading-snug text-foreground">
                    {name}
                  </h4>
                  {note(r) ? (
                    <p className="mt-2 break-words text-[13px] leading-relaxed text-muted-foreground">
                      {note(r)}
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <button
                      type="button"
                      onClick={() => setViewer({ src: r.href, kind: "pdf", title: name })}
                      aria-label={`${t(copy.view)} — ${name}`}
                      className="inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-[13px] font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      {t(copy.view)}
                    </button>
                    <button
                      type="button"
                      onClick={() => void downloadFile(r.href, name)}
                      aria-label={`${t(copy.download)} — ${name} (PDF)`}
                      className="inline-flex items-center gap-2 border-b border-transparent pb-0.5 text-[13px] font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      {t(copy.download)}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="mt-12">
        <h3 className="text-[15px] font-semibold text-foreground">{t(copy.readOnSite)}</h3>
        <EditableTemplatesReferenceContent />
      </div>

      <MediaViewerDialog
        open={viewer !== null}
        onClose={() => setViewer(null)}
        src={viewer?.src ?? null}
        kind={viewer?.kind ?? "pdf"}
        title={viewer?.title}
      />
    </section>
  );
}

/**
 * Native reproduction of «ملف-مرجعي-القوالب-القابلة-للتحرير» — the complete
 * written content of the supplied reference PDF, in its original Arabic and in
 * the original order, headings, table and closing note included. The Arabic
 * source is authoritative; no translation is supplied, so none is invented.
 */
const REFERENCE_ROWS: {
  code: string;
  name: string;
  occasion: string;
  colour: string;
  fields: string;
  optional: string;
  image: string;
  notes: string;
}[] = [
  {
    code: "ABF-BIRTH-MALE-01",
    name: "بشارة مولود",
    occasion: "المواليد — ذكر",
    colour: "الأخضر التراثي",
    fields: "اسم الأب، اسم المولود، التاريخ الهجري، التاريخ الميلادي، رقم الجوال، الصورة",
    optional: "التاريخ الميلادي، الصورة",
    image: "نعم",
    notes: "—",
  },
  {
    code: "ABF-BIRTH-FEMALE-01",
    name: "بشارة مولودة",
    occasion: "المواليد — أنثى",
    colour: "الأخضر التراثي",
    fields: "اسم الأب، اسم المولودة، التاريخ الهجري، التاريخ الميلادي، رقم الجوال، الصورة",
    optional: "التاريخ الميلادي، الصورة",
    image: "نعم",
    notes: "يستعمل صيغة التأنيث في كل النصوص الثابتة",
  },
  {
    code: "ABF-CONDOLENCE-MALE-01",
    name: "خبر نعي",
    occasion: "العزاء — ذكر",
    colour: "الأسود الداكن",
    fields:
      "اسم المتوفى، صلة القرابة، التاريخ الهجري، الصلاة والدفن، عزاء الرجال، عزاء النساء، رقم الجوال، الصورة",
    optional: "الصورة (نادرة الاستعمال)",
    image: "نعم",
    notes: "بلا أي لون ذهبي إطلاقاً؛ الصورة نادراً ما تُستعمل",
  },
  {
    code: "ABF-CONDOLENCE-FEMALE-01",
    name: "خبر نعي",
    occasion: "العزاء — أنثى",
    colour: "الأسود الداكن",
    fields: "اسم المتوفاة، صلة القرابة، التاريخ الهجري، عزاء النساء، رقم الجوال، الصورة",
    optional: "الصورة (نادرة الاستعمال)",
    image: "نعم",
    notes: "بلا أي لون ذهبي إطلاقاً؛ صياغة تأنيث مستقلة عن نسخة الذكر",
  },
  {
    code: "ABF-GRADUATION-MALE-01",
    name: "تهنئة تخرج",
    occasion: "التخرج — ذكر",
    colour: "الكحلي (مجلس)",
    fields:
      "اسم الخريج، التاريخ الهجري، الجامعة / الكلية، الدرجة العلمية، التخصص، مرتبة الشرف، رقم الجوال، الصورة",
    optional: "مرتبة الشرف، الصورة",
    image: "نعم",
    notes: "—",
  },
  {
    code: "ABF-GRADUATION-FEMALE-01",
    name: "تهنئة تخرج",
    occasion: "التخرج — أنثى",
    colour: "الكحلي (مجلس)",
    fields:
      "اسم الخريجة، التاريخ الهجري، الجامعة / الكلية، الدرجة العلمية، التخصص، مرتبة الشرف، رقم الجوال، الصورة",
    optional: "مرتبة الشرف، الصورة",
    image: "نعم",
    notes: "يستعمل صيغة التأنيث في كل النصوص الثابتة",
  },
  {
    code: "ABF-WEDDING-CONGRATS-01",
    name: "تهنئة زواج",
    occasion: "الزواج",
    colour: "أخضر النخيل",
    fields:
      "اسم العريس، اسم الأب، التاريخ الهجري، اسم العروس، مكان الحفل، رقم الجوال، الصورة",
    optional: "اسم العروس، مكان الحفل، الصورة",
    image: "نعم",
    notes: "—",
  },
  {
    code: "ABF-ACHIEVEMENT-01",
    name: "مبارك الإنجاز",
    occasion: "الإنجاز",
    colour: "الأخضر التراثي الداكن",
    fields:
      "الاسم، التاريخ الهجري، نوع الإنجاز، اسم الإنجاز أو الجائزة، الجهة المانحة، رقم الجوال، الصورة",
    optional: "الصورة",
    image: "نعم",
    notes: "اللون الذهبي مستعمل هنا كتمييز فقط (غير العزاء)",
  },
  {
    code: "ABF-PROMOTION-01",
    name: "مبارك التعيين",
    occasion: "الترقية / التعيين",
    colour: "الرمادي الحجري",
    fields:
      "الاسم، التاريخ الهجري، المنصب الجديد، الجهة، تاريخ المباشرة، رقم الجوال، الصورة",
    optional: "تاريخ المباشرة، الصورة",
    image: "نعم",
    notes: "—",
  },
  {
    code: "ABF-NEWJOB-01",
    name: "وظيفة جديدة",
    occasion: "الوظيفة الجديدة",
    colour: "أخضر النخيل الفاتح",
    fields:
      "الاسم، التاريخ الهجري، الجهة، المسمى الوظيفي، تاريخ المباشرة، رقم الجوال، الصورة",
    optional: "تاريخ المباشرة، الصورة",
    image: "نعم",
    notes: "—",
  },
  {
    code: "ABF-RECOVERY-01",
    name: "طهور ونور",
    occasion: "الشفاء والعافية",
    colour: "بيج الرمال",
    fields: "الاسم، التاريخ الهجري، الحالة / نوع العملية، رقم الجوال، الصورة",
    optional: "الحالة / نوع العملية، الصورة",
    image: "نعم",
    notes: "طابع غير احتفالي؛ بلا أي لون زاهٍ",
  },
  {
    code: "ABF-OFFICIAL-01",
    name: "إعلان رسمي",
    occasion: "الإعلانات الرسمية",
    colour: "الأبيض السحابي",
    fields: "التاريخ الهجري، التاريخ الميلادي، موضوع الإعلان، رقم الجوال",
    optional: "التاريخ الميلادي",
    image: "لا",
    notes: "لا تُضف مساحة صورة؛ غير موجودة في المصدر",
  },
  {
    code: "ABF-MEETING-01",
    name: "دعوة حضور",
    occasion: "الاجتماعات",
    colour: "الرمادي الحجري الفاتح",
    fields: "التاريخ الهجري، التاريخ الميلادي، الوقت، المكان، رقم الجوال",
    optional: "التاريخ الميلادي",
    image: "لا",
    notes: "لا تُضف مساحة صورة؛ غير موجودة في المصدر",
  },
  {
    code: "ABF-GENERAL-01",
    name: "تهنئة عامة",
    occasion: "المناسبات العامة",
    colour: "الذهبي العائلي الداكن",
    fields: "الاسم، التاريخ الهجري، وصف المناسبة، رقم الجوال، الصورة",
    optional: "الصورة",
    image: "نعم",
    notes: "—",
  },
];

const REFERENCE_HEADERS = [
  "رمز القالب",
  "اسم القالب",
  "نوع المناسبة",
  "اللون الأساسي",
  "الحقول القابلة للتحرير",
  "الحقول الاختيارية",
  "مساحة صورة",
  "ملاحظات الاستعمال",
];

export function EditableTemplatesReferenceContent() {
  return (
    <article dir="rtl" lang="ar" className="mt-4 text-right">
      <h4 className="text-[17px] font-semibold leading-snug text-foreground">
        الملف المرجعي لمكتبة القوالب القابلة للتحرير
      </h4>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        مجلس أسرة آل بوعبيد — نسخة PowerPoint القابلة للتحرير اليدوي
      </p>
      <p className="mt-4 text-[13.5px] leading-relaxed text-foreground">
        يوثّق هذا الملف القوالب الأربعة عشر المستخرجة إلى ملفات PowerPoint مستقلة قابلة للتحرير، مع
        رمز كل قالب، ولونه الأساسي المعتمد، وحقوله القابلة للتحرير، وحقوله الاختيارية، ومدى توفر
        مساحة صورة فيه، وملاحظات استعمال خاصة به.
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        الملف المرجعي — القوالب القابلة للتحرير — مجلس أسرة آل بوعبيد
      </p>

      <h5 className="mt-8 text-[15px] font-semibold text-foreground">جدول القوالب الأربعة عشر</h5>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        كل قالب يقابله ملف PowerPoint مستقل بنفس رمزه، بصيغة: «رمز_القالب_اسم_القالب_قابل_للتحرير.pptx».
      </p>

      <div className="mt-4 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[860px] border-collapse text-right text-[12.5px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {REFERENCE_HEADERS.map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-3 py-2 text-right font-semibold text-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {REFERENCE_ROWS.map((row) => (
              <tr key={`${row.code}-${row.occasion}`} className="border-b border-border/70">
                <th
                  scope="row"
                  className="nums px-3 py-2 text-right font-mono text-[11.5px] font-medium text-foreground"
                >
                  {row.code}
                </th>
                <td className="px-3 py-2 text-muted-foreground">{row.name}</td>
                <td className="px-3 py-2 text-muted-foreground">{row.occasion}</td>
                <td className="px-3 py-2 text-muted-foreground">{row.colour}</td>
                <td className="px-3 py-2 leading-relaxed text-muted-foreground">{row.fields}</td>
                <td className="px-3 py-2 leading-relaxed text-muted-foreground">{row.optional}</td>
                <td className="px-3 py-2 text-muted-foreground">{row.image}</td>
                <td className="px-3 py-2 leading-relaxed text-muted-foreground">{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 border-s-2 border-bronze/60 bg-muted/30 p-4 text-[13px] leading-relaxed text-foreground dark:border-gold/60">
        ملاحظة: التاريخ الهجري حقل ثابت في جميع القوالب الأربعة عشر ولذلك لم يُفرد له عمود مستقل؛ وهو
        مُدرج ضمن «الحقول القابلة للتحرير» لكل قالب.
      </p>

      <p className="mt-6 text-[12.5px] text-muted-foreground">اللجنة الإعلامية بالمجلس · 2 / 2</p>
    </article>
  );
}
