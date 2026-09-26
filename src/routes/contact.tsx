import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin, MessageCircle, ExternalLink } from "lucide-react";
import { submitContactMessage } from "@/lib/forms.functions";
import { contactMessageSchema } from "@/lib/forms.schemas";
import { TurnstileWidget, type TurnstileWidgetHandle } from "@/components/site/TurnstileWidget";

import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow } from "@/components/site/Editorial";
import { DocumentShowcase } from "@/components/site/DocumentShowcase";
import { siteMeta } from "@/content/site";
import { getPublicSiteSettings } from "@/lib/cms.functions";
import { getCanonicalUrl } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  loader: () => getPublicSiteSettings(),
  head: () => ({
    meta: [
      { title: "تواصل معنا | آل بوعبيد" },
      {
        name: "description",
        content:
          "تواصل مع الأمانة العامة ولجان مجلس الأسرة لصندوق التنمية العائلية (آل بوعبيد) بمدينة المبرز بالأحساء.",
      },
      { property: "og:title", content: "تواصل معنا — آل بوعبيد" },
      {
        property: "og:description",
        content:
          "بيانات التواصل مع الأمانة العامة ولجان مجلس الأسرة لصندوق التنمية العائلية (آل بوعبيد) في المبرز بالأحساء.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: getCanonicalUrl("/contact") },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/contact") }],
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
  failed: {
    ar: "تعذّر إرسال الرسالة. يرجى المحاولة مرة أخرى.",
    en: "The message could not be sent. Please try again.",
  } as BiText,
  rateLimited: {
    ar: "تم استلام عدة رسائل من هذا الجهاز. يرجى المحاولة بعد قليل.",
    en: "Several messages have arrived from this device. Please try again shortly.",
  } as BiText,
  verificationFailed: {
    ar: "تعذّر التحقق من أنك لست آلياً. يرجى إعادة المحاولة.",
    en: "We couldn't complete the anti-bot check. Please try again.",
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

const schema = contactMessageSchema;

function ContactPage() {
  const { t, lang } = useLang();
  const dynamicSettings = (Route.useLoaderData() || {}) as Record<string, any>;
  const [submitting, setSubmitting] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const sendContact = useServerFn(submitContactMessage);

  // Live values are saved by the admin console under category-keyed rows
  // (e.g. { site_contact: { phone, email, whatsapp }, site_general: { national_address } }) —
  // see SiteSettingsManager.tsx / upsertSiteSetting. Fall back to the static
  // content when a category hasn't been configured yet.
  const siteContact = dynamicSettings.site_contact || {};
  const siteGeneral = dynamicSettings.site_general || {};

  const contactPhone = siteContact.phone || siteMeta.contact.phone;
  const contactEmail = siteContact.email || siteMeta.contact.email;
  const contactWhatsapp = siteContact.whatsapp || siteMeta.contact.whatsapp;
  const addressText = siteGeneral.national_address || t(siteMeta.nationalAddress.full);
  const hoursText =
    (lang === "ar" ? siteContact.hours_ar : siteContact.hours_en) || t(copy.hoursValue);

  const fieldClass =
    "w-full border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-bronze focus:ring-2 focus:ring-bronze/20 dark:focus:border-gold dark:focus:ring-gold/20";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const result = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      subject: fd.get("subject"),
      message: fd.get("message"),
      website_url_check: fd.get("website_url_check") || undefined,
      locale: lang,
      turnstile_token: turnstileToken || undefined,
    });

    if (!result.success) {
      toast.error(t(copy.invalid));
      return;
    }

    setSubmitting(true);
    try {
      const res = await sendContact({ data: result.data });
      if (res.ok) {
        toast.success(t(copy.sent));
        form.reset();
        setSelectedSubject("");
        setTurnstileToken("");
        turnstileRef.current?.reset();
      } else {
        const messages: Record<string, BiText> = {
          rate_limited: copy.rateLimited,
          verification_failed: copy.verificationFailed,
        };
        toast.error(t(messages[res.error] ?? copy.failed));
      }
    } catch {
      toast.error(t(copy.failed));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow={t(copy.eyebrow)} title={t(copy.title)} subtitle={t(copy.subtitle)} />

      <div className="container-page py-12 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,20rem)] lg:gap-20">
          {/* ── Form ───────────────────────────────────────── */}
          <section className="reveal-on-scroll">
            <Eyebrow>{t(copy.formTitle)}</Eyebrow>

            <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-5">
              {/* Anti-bot honeypot field */}
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="website_url_check">Leave empty</label>
                <input
                  type="text"
                  id="website_url_check"
                  name="website_url_check"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

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
                {/* Quick topic chips */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {copy.subjects.map((s) => (
                    <button
                      key={s.en}
                      type="button"
                      onClick={() => setSelectedSubject(s.en)}
                      className={`text-xs px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                        selectedSubject === s.en
                          ? "bg-bronze text-white border-bronze dark:bg-gold dark:text-ink dark:border-gold font-semibold"
                          : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {t(s)}
                    </button>
                  ))}
                </div>

                <select
                  id="subject"
                  name="subject"
                  required
                  className={fieldClass}
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="" disabled>
                    {lang === "ar" ? "-- اختر موضوع المراسلة --" : "-- Select Subject --"}
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

              <TurnstileWidget ref={turnstileRef} onToken={setTurnstileToken} />

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
            <Eyebrow>{t(copy.detailsTitle)}</Eyebrow>

            <dl className="mt-6 space-y-6 text-sm">
              <div>
                <dt className="label-caps mb-2 flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {t(copy.labelAddress)}
                </dt>
                <dd className="leading-relaxed text-foreground">{addressText}</dd>
                <dd className="mt-1.5">
                  <a
                    href={siteMeta.contact.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-bronze dark:text-gold hover:underline"
                  >
                    {lang === "ar" ? "عرض الموقع على خرائط Google" : "View on Google Maps"}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </dd>
              </div>

              <div>
                <dt className="label-caps mb-2 flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  {t(copy.labelPhone)}
                </dt>
                <dd>
                  <a
                    href={`tel:${contactPhone.replace(/\s/g, "")}`}
                    dir="ltr"
                    className="nums font-mono text-foreground transition-colors hover:text-bronze dark:hover:text-gold"
                  >
                    {contactPhone}
                  </a>
                </dd>
              </div>

              <div>
                <dt className="label-caps mb-2 flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  {t(copy.labelEmail)}
                </dt>
                <dd className="space-y-1">
                  <a
                    href={`mailto:${contactEmail}`}
                    className="block text-foreground transition-colors hover:text-bronze dark:hover:text-gold"
                  >
                    {contactEmail}
                  </a>
                  <a
                    href={`mailto:${siteMeta.contact.secretariatEmail}`}
                    dir="ltr"
                    className="block text-[13px] text-muted-foreground transition-colors hover:text-bronze dark:hover:text-gold"
                  >
                    {siteMeta.contact.secretariatEmail}
                  </a>
                </dd>
              </div>

              <div>
                <dt className="label-caps mb-2 flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  {t(copy.labelChannel)}
                </dt>
                <dd className="space-y-2">
                  <div>
                    <a
                      href={contactWhatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 border-b border-bronze pb-0.5 font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                    >
                      {t(copy.joinChannel)}
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </div>
                  <div>
                    <a
                      href={`https://wa.me/${contactPhone.replace(/\D/g, "")}?text=${encodeURIComponent(lang === "ar" ? "السلام عليكم ورحمة الله، أود الاستفسار من أمانة المجلس." : "Peace be upon you, I have an enquiry for the council.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-600/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600/20 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      {lang === "ar" ? "محادثة فورية مع الأمانة العامة" : "Chat on WhatsApp"}
                    </a>
                  </div>
                </dd>
              </div>
            </dl>

            <div className="mt-8 border-t border-border pt-6">
              <p className="label-caps mb-2 text-muted-foreground">{t(copy.hoursTitle)}</p>
              <p className="nums text-sm leading-relaxed text-foreground">{hoursText}</p>
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

            <div className="mt-8 border-t border-border pt-6">
              <p className="label-caps mb-3 text-muted-foreground">
                {t({ ar: "الوثائق والتراخيص المكانية", en: "Location & Registration Documents" })}
              </p>
              <DocumentShowcase refs={["Saudi Post", "Lic. 1200758400"]} variant="list" />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
