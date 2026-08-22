import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, MapPin, Phone, Mail, ArrowUp, Globe } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/i18n/LanguageProvider";
import { siteMeta } from "@/content/site";
import { navGroups } from "@/content/navigation";
import { subscribeToNewsletter } from "@/lib/forms.functions";
import { getPublicSiteSettings, getPublicNavigation } from "@/lib/cms.functions";
import { newsletterSchema } from "@/lib/forms.schemas";
import { cn } from "@/lib/utils";

export function Footer() {
  const { t, lang } = useLang();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const subscribe = useServerFn(subscribeToNewsletter);
  const rtl = lang === "ar";

  const { data: dynamicSettings = {} } = useQuery({
    queryKey: ["public_site_settings"],
    queryFn: () => getPublicSiteSettings(),
    staleTime: 5 * 60 * 1000,
  });

  /** Live, CMS-managed footer links — falls back to the static navGroups
   *  index when the "footer" menu has no public items configured. */
  const { data: liveNav } = useQuery({
    queryKey: ["public_navigation"],
    queryFn: () => getPublicNavigation(),
    staleTime: 5 * 60 * 1000,
  });
  const liveFooterItems = liveNav?.footer ?? [];
  const usingLiveFooterNav = liveFooterItems.length > 0;

  // Live values are saved by the admin console under category-keyed rows
  // (e.g. { site_contact: { phone, email, whatsapp }, site_general: { license, national_address } }) —
  // see SiteSettingsManager.tsx / upsertSiteSetting. Fall back to the static
  // content when a category hasn't been configured yet.
  const siteContact = dynamicSettings.site_contact || {};
  const siteGeneral = dynamicSettings.site_general || {};

  const contactPhone = siteContact.phone || siteMeta.contact.phone;
  const contactEmail = siteContact.email || siteMeta.contact.email;
  const contactWhatsapp = siteContact.whatsapp || siteMeta.contact.whatsapp;
  const ncnpLicense = siteGeneral.license || siteMeta.ncnpLicense;
  const hqText = siteGeneral.national_address || t(siteMeta.headquarters);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = newsletterSchema.safeParse({ email, locale: lang });
    if (!parsed.success) {
      toast.error(
        lang === "ar" ? "يرجى إدخال بريد إلكتروني صحيح." : "Please enter a valid email address.",
      );
      return;
    }

    setSubscribing(true);
    try {
      const res = await subscribe({ data: parsed.data });
      if (res.ok) {
        toast.success(
          res.already
            ? lang === "ar"
              ? "بريدك مسجَّل مسبقاً في نشرة الأسرة."
              : "This address is already on the family newsletter."
            : lang === "ar"
              ? "تم تسجيل اشتراكك في نشرة الأسرة."
              : "You have been added to the family newsletter.",
        );
        setEmail("");
      } else {
        toast.error(
          lang === "ar" ? "تعذّر تسجيل الاشتراك. حاول مرة أخرى." : "Subscription failed. Please try again.",
        );
      }
    } catch {
      toast.error(
        lang === "ar" ? "تعذّر تسجيل الاشتراك. حاول مرة أخرى." : "Subscription failed. Please try again.",
      );
    } finally {
      setSubscribing(false);
    }
  };

  const channels = [
    {
      label: { ar: "قناة واتساب", en: "WhatsApp" },
      href: contactWhatsapp,
      icon: MessageCircle,
    },
    {
      label: { ar: "الموقع الرسمي", en: "Website" },
      href: `https://${siteMeta.domain}`,
      icon: Globe,
    },
    { label: { ar: "البريد", en: "Email" }, href: `mailto:${contactEmail}`, icon: Mail },
  ];

  return (
    <footer className="bg-ink text-ivory">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr] lg:gap-16">
          {/* Colophon */}
          <div>
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
              <img
                src="/logo-mark-gold.svg"
                alt=""
                className="h-28 w-28 shrink-0 object-contain drop-shadow-[0_4px_20px_rgba(237,167,70,0.25)] md:h-36 md:w-36"
                aria-hidden="true"
              />
              <div>
                <p className="font-brand text-xl leading-snug font-bold text-gold rtl:text-2xl md:text-3xl">
                  {t(siteMeta.officialName)}
                </p>
                <p className="label-caps mt-1.5 text-sm text-ivory/60">{t(siteMeta.shortName)}</p>
              </div>
            </div>

            <p className="measure-tight mt-6 text-sm leading-relaxed text-ivory/65">
              {lang === "ar"
                ? "كيان أهلي مرخص يعنى بتوثيق نسب الأسرة وأرشيفها، وتنظيم أوقافها ومبادراتها التنموية، ومقره مدينة المبرز بمحافظة الأحساء."
                : "A licensed nonprofit documenting the family's lineage and archive, and administering its endowments and development programmes from Al-Mubarraz, Al-Ahsa."}
            </p>

            {/* Registration statement, set as a formal colophon rather than a badge. */}
            <dl className="mt-7 border-t border-ivory/15 pt-5 text-sm">
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <dt className="label-caps pt-1 text-ivory/45">
                  {lang === "ar" ? "رقم الترخيص" : "Licence no."}
                </dt>
                <dd className="nums font-mono text-gold">{ncnpLicense}</dd>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                <dt className="label-caps pt-1 text-ivory/45">
                  {lang === "ar" ? "جهة الإصدار" : "Issued by"}
                </dt>
                <dd className="text-ivory/75">{t(siteMeta.ncnpAuthority)}</dd>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                <dt className="label-caps pt-1 text-ivory/45">
                  {lang === "ar" ? "تاريخ الإشهار" : "Registered"}
                </dt>
                <dd className="nums text-ivory/75">
                  {siteMeta.foundedHijri} هـ · {siteMeta.foundedGregorian}
                </dd>
              </div>
            </dl>
          </div>

          {/* Index */}
          <div className="grid gap-8 sm:grid-cols-3">
            {usingLiveFooterNav ? (
              <nav aria-label="Footer">
                <p className="label-caps mb-3 border-b border-ivory/15 pb-2 text-gold/80">
                  {lang === "ar" ? "فهرس الموقع" : "Site Index"}
                </p>
                <ul className="space-y-2.5">
                  {liveFooterItems.map((n) => (
                    <li key={n.to}>
                      <Link
                        to={n.to}
                        className="text-[13px] text-ivory/65 transition-colors hover:text-gold"
                      >
                        {t(n.label)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : (
              navGroups.map((group) => (
                <nav key={group.title.en} aria-label={group.title.en}>
                  <p className="label-caps mb-3 border-b border-ivory/15 pb-2 text-gold/80">
                    {t(group.title)}
                  </p>
                  <ul className="space-y-2.5">
                    {group.items.map((n) => (
                      <li key={n.to}>
                        <Link
                          to={n.to}
                          className="text-[13px] text-ivory/65 transition-colors hover:text-gold"
                        >
                          {t(n.label)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))
            )}
          </div>
        </div>

        {/* Contact & newsletter */}
        <div className="mt-12 grid gap-10 border-t border-ivory/15 pt-10 lg:grid-cols-[1.4fr_2fr] lg:gap-16">
          <address className="space-y-3 text-sm text-ivory/65 not-italic">
            <p className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold/70" aria-hidden="true" />
              <span>{hqText}</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-gold/70" aria-hidden="true" />
              <span dir="ltr" className="nums font-mono text-[13px]">
                {contactPhone}
              </span>
            </p>
            <p className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-gold/70" aria-hidden="true" />
              <a href={`mailto:${contactEmail}`} className="hover:text-gold">
                {contactEmail}
              </a>
            </p>
          </address>

          <div>
            <form onSubmit={handleSubscribe} className="max-w-md">
              <label htmlFor="footer-email" className="label-caps mb-2.5 block text-gold/80">
                {lang === "ar" ? "نشرة الأسرة" : "Family Newsletter"}
              </label>
              <p className="mb-3 text-[13px] leading-relaxed text-ivory/55">
                {lang === "ar"
                  ? "إشعار دوري بمواعيد اللقاءات والبيانات الرسمية."
                  : "Periodic notice of assemblies and official announcements."}
              </p>
              <div className="flex">
                <input
                  id="footer-email"
                  type="email"
                  suppressHydrationWarning
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={lang === "ar" ? "البريد الإلكتروني" : "Email address"}
                  required
                  className="w-full border border-ivory/20 bg-transparent px-3.5 py-2.5 text-sm text-ivory outline-none transition-colors placeholder:text-ivory/35 focus:border-gold"
                />
                <button
                  type="submit"
                  suppressHydrationWarning
                  disabled={subscribing}
                  className="shrink-0 border border-gold bg-gold px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-transparent hover:text-gold disabled:opacity-60"
                >
                  {lang === "ar" ? "اشتراك" : "Subscribe"}
                </button>

              </div>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
              {channels.map((c) => {
                const Icon = c.icon;
                return (
                  <a
                    key={c.label.en}
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[13px] text-ivory/60 transition-colors hover:text-gold"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {t(c.label)}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-ivory/15">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-4 sm:flex-row">
          <p className="nums text-xs text-ivory/40">
            © {new Date().getFullYear()} {t(siteMeta.officialName)} ·{" "}
            {lang === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved"}
          </p>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 text-xs text-ivory/50 transition-colors hover:text-gold"
          >
            {lang === "ar" ? "إلى الأعلى" : "Back to top"}
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
