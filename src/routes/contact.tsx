import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Mail, Phone, MapPin, MessageCircle, Send } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHero } from "@/components/site/PageHero";
import { siteMeta } from "@/content/site";
import heroOasis from "@/assets/hero-oasis.jpg";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا | Contact — Al Bu Obaid" },
      { name: "description", content: "قنوات التواصل مع أسرة آل بوعبيد وصندوق التنمية العائلية." },
      { property: "og:title", content: "تواصل مع آل بوعبيد" },
      { property: "og:description", content: "هاتف، بريد، ومقر الأسرة." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(5).max(1000),
  captcha: z.string(),
});

function ContactPage() {
  const { t, lang } = useLang();
  const captcha = useMemo(() => {
    const a = 3 + Math.floor(Math.random() * 5);
    const b = 2 + Math.floor(Math.random() * 5);
    return { a, b, answer: a + b };
  }, []);
  const [ans, setAns] = useState("");

  return (
    <>
      <PageHero
        image={heroOasis}
        eyebrow={lang === "ar" ? "تواصل" : "Contact"}
        title={lang === "ar" ? "نسعد بتواصلكم" : "We'd love to hear from you"}
      />
      <section className="container-page py-16">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-5">
            {[
              { icon: MapPin, h: { ar: "العنوان", en: "Address" }, v: t(siteMeta.headquarters) },
              { icon: Phone, h: { ar: "الهاتف", en: "Phone" }, v: siteMeta.contact.phone },
              { icon: Mail, h: { ar: "البريد", en: "Email" }, v: siteMeta.contact.email },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className="flex items-start gap-4 rounded-md border border-border bg-card p-5">
                  <Icon className="mt-1 h-5 w-5 text-gold" />
                  <div>
                    <div className="text-xs uppercase tracking-widest text-gold">{t(c.h)}</div>
                    <div className="mt-1 font-semibold text-navy" dir={typeof c.v === "string" && /^[+\d]/.test(c.v as string) ? "ltr" : undefined}>{c.v}</div>
                  </div>
                </div>
              );
            })}

            <div className="rounded-md border border-border bg-secondary/40 p-5">
              <div className="text-xs uppercase tracking-widest text-gold">{lang === "ar" ? "الموقع" : "Location"}</div>
              <div className="mt-2 h-40 rounded-md bg-navy/10 grid place-items-center text-sm text-muted-foreground">
                {lang === "ar" ? "خريطة الموقع — قيد التحديث" : "Map — coming soon"}
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteMeta.headquarters.en)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-navy underline decoration-gold underline-offset-8"
              >
                {lang === "ar" ? "فتح في خرائط Google" : "Open in Google Maps"}
              </a>
            </div>

            <div className="flex flex-wrap gap-3">
              <a href={siteMeta.contact.whatsapp} className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 font-semibold text-navy hover:bg-gold-soft">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <a href={siteMeta.contact.telegram} className="inline-flex items-center gap-2 rounded-md border border-navy px-4 py-2 font-semibold text-navy hover:bg-navy hover:text-ivory">
                <Send className="h-4 w-4" /> Telegram
              </a>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const r = schema.safeParse({
                name: fd.get("name"),
                email: fd.get("email"),
                message: fd.get("message"),
                captcha: fd.get("captcha"),
              });
              if (!r.success) {
                toast.error(lang === "ar" ? "يرجى التحقق من الحقول" : "Please check the fields");
                return;
              }
              if (Number(r.data.captcha) !== captcha.answer) {
                toast.error(lang === "ar" ? "إجابة التحقق غير صحيحة" : "Captcha answer is incorrect");
                return;
              }
              toast.success(lang === "ar" ? "شكراً — سنعاود التواصل قريباً" : "Thanks — we'll be in touch");
              (e.target as HTMLFormElement).reset();
              setAns("");
            }}
            className="grid gap-4 rounded-md border border-border bg-card p-6"
          >
            <input name="name" required placeholder={lang === "ar" ? "الاسم" : "Name"} className="rounded-md border border-input bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
            <input name="email" type="email" required placeholder={lang === "ar" ? "البريد الإلكتروني" : "Email"} className="rounded-md border border-input bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
            <textarea name="message" required rows={6} placeholder={lang === "ar" ? "رسالتك" : "Your message"} className="rounded-md border border-input bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
            <label className="text-sm text-muted-foreground">
              {lang === "ar" ? `تحقق: كم يساوي ${captcha.a} + ${captcha.b}؟` : `Verify: what is ${captcha.a} + ${captcha.b}?`}
              <input name="captcha" value={ans} onChange={(e) => setAns(e.target.value)} required className="mt-2 w-full rounded-md border border-input bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
            </label>
            <button type="submit" className="rounded-md bg-navy px-5 py-3 font-semibold text-ivory hover:bg-navy-soft">
              {lang === "ar" ? "إرسال" : "Send"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
