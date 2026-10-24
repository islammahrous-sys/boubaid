import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  ArrowUp,
  Globe,
  Youtube,
  Instagram,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { formatDualYear } from "@/lib/dates";
import { copy } from "@/content/page-copy/footer";
import { useLang } from "@/i18n/LanguageProvider";
import { siteMeta } from "@/content/site";
import {
  primaryNav,
  secondaryNav,
  buildFooterColumns,
  tagNavigation,
  withoutRetiredNavigation,
} from "@/content/navigation";
import { subscribeToNewsletter } from "@/lib/forms.functions";
import { getPublicSiteSettings, getPublicNavigation } from "@/lib/cms.functions";
import { newsletterSchema } from "@/lib/forms.schemas";
import { cn } from "@/lib/utils";
import { LEGAL_DOCUMENTS } from "@/content/legal";
import { ConsentCheckbox, PrivacyNotice } from "@/components/legal/LegalNotices";

/** Brand glyphs lucide-react doesn't ship — kept tiny and monochrome (currentColor). */
type IconProps = { className?: string };

function XIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

function SnapchatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12.206 1c2.77.01 4.62 2.033 4.877 4.72.07.723.032 1.45.05 2.175.005.156.007.31.24.29.36-.03.71-.16 1.083-.15.5.014.86.32.87.77.01.44-.29.7-.66.87-.29.13-.6.22-.9.34-.62.24-.71.6-.4 1.19.7 1.35 1.78 2.31 3.2 2.83.26.1.53.16.79.28.27.12.32.32.2.58-.24.53-.7.78-1.24.92-.4.1-.81.14-1.21.24-.27.07-.4.27-.45.53-.04.2-.06.4-.12.6-.1.35-.33.5-.7.44-.4-.06-.8-.16-1.2-.2-.72-.09-1.4.02-2.01.44-.35.24-.68.5-1.04.72-1.36.85-2.75.79-4.08-.08-.32-.21-.63-.44-.96-.64-.62-.38-1.28-.46-1.98-.36-.4.06-.8.16-1.2.21-.36.05-.58-.1-.68-.44-.06-.2-.09-.41-.13-.62-.05-.25-.18-.44-.44-.5-.4-.11-.82-.15-1.22-.25-.53-.14-1-.39-1.24-.92-.12-.26-.06-.46.2-.58.26-.12.54-.18.8-.29 1.41-.52 2.5-1.48 3.19-2.83.31-.6.22-.95-.4-1.19-.3-.12-.62-.2-.91-.34-.36-.17-.66-.42-.65-.86.01-.44.36-.75.85-.77.37-.02.73.12 1.1.15.22.02.24-.13.24-.29.02-.72-.02-1.45.05-2.17C7.36 3.06 9.16 1.05 11.87 1h.34Z" />
    </svg>
  );
}

export function Footer() {
  const { t, lang } = useLang();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const subscribe = useServerFn(subscribeToNewsletter);
  const rtl = lang === "ar";

  const { data: dynamicSettings = {} } = useQuery({
    queryKey: ["public_site_settings"],
    queryFn: () => getPublicSiteSettings(),
    staleTime: 5 * 60 * 1000,
  });

  /** Live, CMS-managed navigation — the same query the header uses, so the
   *  footer index can never drift from the header again. Priority:
   *  1. an explicit CMS "footer" menu, when one is configured;
   *  2. otherwise the live "header" menu, folded into footer columns;
   *  3. otherwise the static navigation lists (build-time fallback). */
  const { data: liveNav } = useQuery({
    queryKey: ["public_navigation"],
    queryFn: () => getPublicNavigation().then(tagNavigation),
    staleTime: 5 * 60 * 1000,
  });
  const liveFooterItems = withoutRetiredNavigation(liveNav?.footer ?? []);
  const liveHeaderItems = withoutRetiredNavigation(liveNav?.header ?? []);
  const footerColumns = liveFooterItems.length
    ? buildFooterColumns(liveFooterItems)
    : liveHeaderItems.length
      ? buildFooterColumns(liveHeaderItems)
      : buildFooterColumns([...primaryNav, ...secondaryNav]);

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
    if (!newsletterConsent) {
      toast.error(
        rtl
          ? "يرجى الموافقة على تلقي النشرة أولاً."
          : "Please tick the consent box to subscribe.",
      );
      return;
    }
    const parsed = newsletterSchema.safeParse({ email, locale: lang, consent: true });
    if (!parsed.success) {
      toast.error(t(copy.text1));
      return;
    }

    setSubscribing(true);
    try {
      const res = await subscribe({ data: parsed.data });
      if (res.ok) {
        toast.success(res.already ? t(copy.text2) : t(copy.text3));
        setEmail("");
        setNewsletterConsent(false);
      } else {
        toast.error(t(copy.text4));
      }
    } catch {
      toast.error(t(copy.text5));
    } finally {
      setSubscribing(false);
    }
  };

  const channels = [
    {
      label: copy.whatsappLabel,
      href: contactWhatsapp,
      icon: MessageCircle,
    },
    {
      label: copy.websiteLabel,
      href: `https://${siteMeta.domain}`,
      icon: Globe,
    },
    { label: copy.emailLabel, href: `mailto:${contactEmail}`, icon: Mail },
  ];

  // Official social channels. Live overrides from `site_contact` win; only
  // entries that resolve to a real URL are rendered.
  const socialLinks = [
    { label: "X", href: siteContact.x || siteMeta.contact.x, icon: XIcon },
    {
      label: "Snapchat",
      href: siteContact.snapchat || siteMeta.contact.snapchat,
      icon: SnapchatIcon,
    },
    { label: "YouTube", href: siteContact.youtube || siteMeta.contact.youtube, icon: Youtube },
    {
      label: "Instagram",
      href: siteContact.instagram || siteMeta.contact.instagram,
      icon: Instagram,
    },
  ].filter((s) => typeof s.href === "string" && s.href.length > 0);

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
              {t(copy.text6)}
            </p>

            {/* Registration statement, set as a formal colophon rather than a badge. */}
            <dl className="mt-7 border-t border-ivory/15 pt-5 text-sm">
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <dt className="label-caps pt-1 text-ivory/45">{t(copy.text7)}</dt>
                <dd className="nums font-mono text-gold">{ncnpLicense}</dd>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                <dt className="label-caps pt-1 text-ivory/45">{t(copy.text8)}</dt>
                <dd className="text-ivory/75">{t(siteMeta.ncnpAuthority)}</dd>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                <dt className="label-caps pt-1 text-ivory/45">{t(copy.text9)}</dt>
                <dd className="nums text-ivory/75">
                  {t(siteMeta.foundedHijriLabel)} · {t(siteMeta.foundedGregorianLabel)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Index — derived from the live navigation, so it always matches the header */}
          <div className="grid gap-8 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <nav key={column.key} aria-label={column.title.en || column.title.ar}>
                <p className="label-caps mb-3 border-b border-ivory/15 pb-2 text-gold/80">
                  {t(column.title)}
                </p>
                <ul className="space-y-0 sm:space-y-2.5">
                  {column.items.map((n) => (
                    <li key={`${column.key}-${n.to}-${n.label.ar}`}>
                      <Link
                        to={n.to}
                        className="inline-block py-2.5 text-[13px] text-ivory/65 transition-colors hover:text-gold sm:py-0"
                      >
                        {t(n.label)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
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
              <a href={`mailto:${contactEmail}`} className="tap-target-y hover:text-gold">
                {contactEmail}
              </a>
            </p>
          </address>

          <div>
            <form onSubmit={handleSubscribe} className="max-w-md">
              <label htmlFor="footer-email" className="label-caps mb-2.5 block text-gold/80">
                {t(copy.text10)}
              </label>
              <p className="mb-3 text-[13px] leading-relaxed text-ivory/55">{t(copy.text11)}</p>
              <div className="flex">
                <input
                  id="footer-email"
                  type="email"
                  suppressHydrationWarning
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t(copy.text12)}
                  required
                  className="w-full border border-ivory/20 bg-transparent px-3.5 py-2.5 text-sm text-ivory outline-none transition-colors placeholder:text-ivory/35 focus:border-gold"
                />
                <button
                  type="submit"
                  suppressHydrationWarning
                  disabled={subscribing}
                  className="shrink-0 border border-gold bg-gold px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-transparent hover:text-gold disabled:opacity-60"
                >
                  {t(copy.text13)}
                </button>
              </div>
              <div className="mt-3 space-y-2">
                <ConsentCheckbox
                  id="footer-newsletter-consent"
                  checked={newsletterConsent}
                  onChange={setNewsletterConsent}
                  required
                  tone="dark"
                >
                  {rtl
                    ? "أوافق على تلقي النشرة الأسرية عبر البريد الإلكتروني، ويمكنني إلغاء الاشتراك في أي وقت."
                    : "I agree to receive the family newsletter by email and can unsubscribe at any time."}
                </ConsentCheckbox>
                <PrivacyNotice tone="dark" />
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
                    className="tap-target-y inline-flex items-center gap-2 text-[13px] text-ivory/60 transition-colors hover:text-gold"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {t(c.label)}
                  </a>
                );
              })}
            </div>

            {socialLinks.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {socialLinks.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      title={s.label}
                      className="tap-target inline-flex h-9 w-9 items-center justify-center rounded-full border border-ivory/15 text-ivory/60 transition-colors hover:border-gold/50 hover:text-gold"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-ivory/15">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-4 sm:flex-row">
          <p className="nums text-xs text-ivory/40">
            © {formatDualYear(new Date().getFullYear(), lang)} {t(siteMeta.officialName)} ·{" "}
            {t(copy.text14)}
          </p>
          <nav
            aria-label={rtl ? "الوثائق النظامية" : "Legal"}
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1"
          >
            {(["terms", "privacy"] as const).map((key) => (
              <Link
                key={key}
                to={LEGAL_DOCUMENTS[key].path}
                className="tap-target-y text-xs text-ivory/60 underline-offset-4 transition-colors hover:text-gold hover:underline focus-visible:text-gold"
              >
                {t(LEGAL_DOCUMENTS[key].title)}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="tap-target-y inline-flex items-center gap-1.5 text-xs text-ivory/50 transition-colors hover:text-gold"
          >
            {t(copy.text15)}
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
