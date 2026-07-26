import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Mail, Phone, MapPin, MessageCircle, ExternalLink } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow } from "@/components/site/Editorial";
import { siteMeta } from "@/content/site";
import { pageImages } from "@/content/images";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا | صندوق التنمية العائلية (آل بوعبيد)" },
      {
        name: "description",
        content:
          "تواصل مع الأمانة العامة واللجان التنفيذية لصندوق التنمية العائلية (آل بوعبيد) بمدينة المبرز بالأحساء.",
      },
      { property: "og:title", content: "تواصل معنا — آل بوعبيد" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ContactPage,
});

const copy = {
  eyebrow: { ar: "المراسلة", en: "Correspondence" } as BiText,
  title: { ar: "التواصل مع الأمانة العامة", en: "Contact the Secretariat" } as BiText,
  subtitle: {
    ar: "تُوجَّه الاستفسارات والمقترحات وطلبات القيد إلى الأمانة العامة، فتحال إلى اللجنة المختصة. مدة الرد المعتادة ثلاثة أيام عمل.",
    en: "Enquiries, proposals, and registration requests go to the secretariat and are referred to the relevant committee. The usual response time is three working days.",
  } as BiText,

  formTitle: { ar: "نموذج المراسلة", en: "Correspondence form" } as BiText,
  fieldName: { ar: "الاسم الكامل", en: "Full name" } as BiText,
  fieldEmail: { ar: "البريد الإلكتروني", en: "Email address" } as BiText,
  fieldSubject: { ar: "الموضوع", en: "Subject" } as BiText,
  fieldMessage: { ar: "نص الرسالة", en: "Message" } as BiText,
  submit: { ar: "إرسال", en: "Send" } as BiText,
  sent: {
    ar: "تم استلام رسالتك. ستصلك إفادة الأمانة العامة قريباً.",
    en: "Your message has been received. The secretariat will respond shortly.",
  } as BiText,
  invalid: {
    ar: "يرجى مراجعة الحقول المطلوبة.",
    en: "Please check the required fields.",
  } as BiText,
  required: { ar: "مطلوب", en: "required" } as BiText,

  subjects: [
    { ar: "استفسار عام", en: "General enquiry" },
    { ar: "قيد في المشجرة أو تصحيح بيانات", en: "Family tree entry or correction" },
    { ar: "ترشيح لسجل المتميزين", en: "Nomination for the roll of honour" },
    { ar: "إدراج منشأة في دليل الأعمال", en: "Business directory listing" },
    { ar: "الاشتراكات والمساهمات", en: "Subscriptions and contributions" },
    { ar: "الأرشيف والوثائق", en: "Archive and documents" },
  ] as BiText[],

  detailsTitle: { ar: "بيانات التواصل", en: "Contact particulars" } as BiText,
  labelAddress: { ar: "العنوان", en: "Address" } as BiText,
  labelPhone: { ar: "الهاتف", en: "Telephone" } as BiText,
  labelEmail: { ar: "البريد", en: "Email" } as BiText,
  labelChannel: { ar: "قناة الأسرة", en: "Family channel" } as BiText,
  joinChannel: { ar: "الانضمام لقناة واتساب", en: "Join the WhatsApp channel" } as BiText,

  hoursTitle: { ar: "أوقات العمل", en: "Office hours" } as BiText,
  hoursValue: {
    ar: "الأحد إلى الخميس، ٤:٠٠ — ٨:٠٠ مساءً بتوقيت المملكة.",
    en: "Sunday to Thursday, 4:00 — 8:00 pm Saudi time.",
  } as BiText,

  noteTitle: { ar: "ملاحظة", en: "Note" } as BiText,
  noteBody: {
    ar: "لا تُقبل عبر هذا النموذج أي بيانات مالية أو أرقام حسابات. أما المساهمات فتتم حصراً عبر القنوات المعتمدة في صفحة الاشتراك.",
    en: "Please do not submit financial details or account numbers through this form. Contributions are made only through the approved channels on the subscription page.",
  } as BiText,
};

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(1),
  message: z.string().trim().min(5).max(1000),
});

export function ContactPage() {
  const { t } = useLang();
  const [submitting, setSubmitting] = useState(false);

  const fieldClass =
    "w-full border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-bronze dark:focus:border-gold";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const result = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      subject: fd.get("subject"),
      message: fd.get("message"),
    });

    if (!result.success) {
      toast.error(t(copy.invalid));
      return;
    }

    setSubmitting(true);
    toast.success(t(copy.sent));
    form.reset();
    setSubmitting(false);
  };

  return (
    <>
      <PageHeader eyebrow={t(copy.eyebrow)} title={t(copy.title)} subtitle={t(copy.subtitle)} />

      <div className="container-page py-12 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,20rem)] lg:gap-20">
          {/* ── Form ───────────────────────────────────────── */}
          <section>
            <Eyebrow>{t(copy.formTitle)}</Eyebrow>

            <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="label-caps mb-2 block text-muted-foreground">
                    {t(copy.fieldName)}
                  </label>
                  <input id="name" name="name" required maxLength={100} className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="email" className="label-caps mb-2 block text-muted-foreground">
                    {t(copy.fieldEmail)}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    maxLength={255}
                    dir="ltr"
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="label-caps mb-2 block text-muted-foreground">
                  {t(copy.fieldSubject)}
                </label>
                <select id="subject" name="subject" required className={fieldClass} defaultValue="">
                  <option value="" disabled>
                    —
                  </option>
                  {copy.subjects.map((s) => (
                    <option key={s.en} value={s.en}>
                      {t(s)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" className="label-caps mb-2 block text-muted-foreground">
                  {t(copy.fieldMessage)}
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={7}
                  maxLength={1000}
                  className={`${fieldClass} resize-y`}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="border border-ink bg-ink px-6 py-3 text-sm font-medium text-ivory transition-colors hover:bg-transparent hover:text-foreground disabled:opacity-60 dark:border-gold dark:bg-gold dark:text-ink dark:hover:bg-transparent dark:hover:text-gold"
              >
                {t(copy.submit)}
              </button>
            </form>

            <aside className="mt-10 max-w-xl border-s-2 border-bronze/40 ps-5 dark:border-gold/40">
              <p className="label-caps mb-2 text-bronze dark:text-gold">{t(copy.noteTitle)}</p>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {t(copy.noteBody)}
              </p>
            </aside>
          </section>

          {/* ── Particulars ────────────────────────────────── */}
          <aside className="lg:border-s lg:border-border lg:ps-12">
            <figure className="mb-8">
              <img
                src={pageImages.contact.seat.src}
                alt=""
                className="aspect-[16/9] w-full object-cover"
                loading="lazy"
              />
              <figcaption className="mt-3 flex items-start gap-2.5 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-1.5 h-px w-5 shrink-0 bg-bronze" aria-hidden="true" />
                <span>{t(pageImages.contact.seat.caption)}</span>
              </figcaption>
            </figure>

            <Eyebrow>{t(copy.detailsTitle)}</Eyebrow>

            <dl className="mt-6 space-y-6 text-sm">
              <div>
                <dt className="label-caps mb-2 flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {t(copy.labelAddress)}
                </dt>
                <dd className="leading-relaxed text-foreground">
                  {t(siteMeta.nationalAddress.full)}
                </dd>
              </div>

              <div>
                <dt className="label-caps mb-2 flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  {t(copy.labelPhone)}
                </dt>
                <dd>
                  <a
                    href={`tel:${siteMeta.contact.phone.replace(/\s/g, "")}`}
                    dir="ltr"
                    className="nums font-mono text-foreground transition-colors hover:text-bronze dark:hover:text-gold"
                  >
                    {siteMeta.contact.phone}
                  </a>
                </dd>
              </div>

              <div>
                <dt className="label-caps mb-2 flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  {t(copy.labelEmail)}
                </dt>
                <dd>
                  <a
                    href={`mailto:${siteMeta.contact.email}`}
                    className="text-foreground transition-colors hover:text-bronze dark:hover:text-gold"
                  >
                    {siteMeta.contact.email}
                  </a>
                </dd>
              </div>

              <div>
                <dt className="label-caps mb-2 flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  {t(copy.labelChannel)}
                </dt>
                <dd>
                  <a
                    href={siteMeta.contact.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 border-b border-bronze pb-0.5 font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                  >
                    {t(copy.joinChannel)}
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </dd>
              </div>
            </dl>

            <div className="mt-8 border-t border-border pt-6">
              <p className="label-caps mb-2 text-muted-foreground">{t(copy.hoursTitle)}</p>
              <p className="nums text-sm leading-relaxed text-foreground">{t(copy.hoursValue)}</p>
            </div>

            <div className="mt-8 border-t border-border pt-6">
              <p className="label-caps mb-2 text-muted-foreground">
                {t({ ar: "الكيان الرسمي", en: "Registered entity" })}
              </p>
              <p className="text-sm leading-relaxed text-foreground">{t(siteMeta.officialName)}</p>
              <p className="nums mt-1 font-mono text-[13px] text-bronze dark:text-gold">
                {t({ ar: "ترخيص NCNP", en: "NCNP Lic." })} {siteMeta.ncnpLicense}
              </p>
              <p className="nums mt-0.5 font-mono text-[13px] text-muted-foreground">
                {t({ ar: "الرقم الوطني الموحد", en: "Unified National No." })}{" "}
                {siteMeta.unifiedNationalNumber}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
