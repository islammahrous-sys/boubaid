import { Link } from "@tanstack/react-router";
import { Instagram, Youtube, MessageCircle, Send } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { T } from "@/i18n/translations";
import { siteMeta } from "@/content/site";

export function Footer() {
  const { t, lang } = useLang();

  return (
    <footer className="mt-24 border-t border-navy/10 bg-navy text-ivory">
      <div className="gold-divider" />
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="text-2xl font-semibold">{t(T.brand)}</div>
          <div className="mt-1 text-xs uppercase tracking-[0.25em] text-gold">{t(T.brandSub)}</div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ivory/80">
            {lang === "ar"
              ? "أسرة عريقة الجذور من فرع العبادل من بني تميم، تتخذ من الأحساء موطناً لها، وتعمل من خلال صندوق التنمية العائلية على خدمة أبنائها ومجتمعها."
              : "A family of deep Tamimi roots from the ʿAbadil branch, rooted in Al-Ahsa, working through its Family Development Fund to serve its members and community."}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-gold">
            {lang === "ar" ? "روابط سريعة" : "Quick links"}
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-gold">{t(T.nav.about)}</Link></li>
            <li><Link to="/foundation" className="hover:text-gold">{t(T.nav.foundation)}</Link></li>
            <li><Link to="/initiatives" className="hover:text-gold">{t(T.nav.initiatives)}</Link></li>
            <li><Link to="/news" className="hover:text-gold">{t(T.nav.news)}</Link></li>
            <li><Link to="/library" className="hover:text-gold">{t(T.nav.library)}</Link></li>
            <li><Link to="/contribute" className="hover:text-gold">{t(T.nav.contribute)}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-gold">
            {lang === "ar" ? "تواصل معنا" : "Contact"}
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-ivory/80">
            <li>{t(siteMeta.headquarters)}</li>
            <li dir="ltr" className="text-start">{siteMeta.contact.phone}</li>
            <li><a href={`mailto:${siteMeta.contact.email}`} className="hover:text-gold">{siteMeta.contact.email}</a></li>
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a aria-label="X" href={siteMeta.contact.x} className="grid h-9 w-9 place-items-center rounded-full border border-ivory/20 hover:border-gold hover:text-gold"><span className="text-sm font-bold">X</span></a>
            <a aria-label="Instagram" href={siteMeta.contact.instagram} className="grid h-9 w-9 place-items-center rounded-full border border-ivory/20 hover:border-gold hover:text-gold"><Instagram className="h-4 w-4" /></a>
            <a aria-label="YouTube" href={siteMeta.contact.youtube} className="grid h-9 w-9 place-items-center rounded-full border border-ivory/20 hover:border-gold hover:text-gold"><Youtube className="h-4 w-4" /></a>
            <a aria-label="WhatsApp" href={siteMeta.contact.whatsapp} className="grid h-9 w-9 place-items-center rounded-full border border-ivory/20 hover:border-gold hover:text-gold"><MessageCircle className="h-4 w-4" /></a>
            <a aria-label="Telegram" href={siteMeta.contact.telegram} className="grid h-9 w-9 place-items-center rounded-full border border-ivory/20 hover:border-gold hover:text-gold"><Send className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-ivory/60 sm:flex-row">
          <span>© {new Date().getFullYear()} {t(T.brand)}. {lang === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}</span>
          <span>{lang === "ar" ? "تصميم بروح الموروث" : "Designed with heritage in mind"}</span>
        </div>
      </div>
    </footer>
  );
}
