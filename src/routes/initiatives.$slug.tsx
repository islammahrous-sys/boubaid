import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, HeartHandshake, Share2, Copy, Check, Users } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { initiatives as staticInitiatives } from "@/content/site";
import { getPublishedInitiatives } from "@/lib/cms.functions";
import { joinInitiative } from "@/lib/initiatives-public.functions";
import { mergeAllInitiatives } from "@/content/cms-adapt";
import { Eyebrow, Status, Ornament } from "@/components/site/Editorial";
import { initiativeImage } from "@/content/images";
import { getCanonicalUrl } from "@/lib/seo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TurnstileWidget, type TurnstileWidgetHandle } from "@/components/site/TurnstileWidget";

export const Route = createFileRoute("/initiatives/$slug")({
  loader: async ({ params }) => {
    const rows = await getPublishedInitiatives();
    const initiatives = mergeAllInitiatives(rows, staticInitiatives);
    const item = initiatives.find((i) => i.slug === params.slug);
    if (!item) throw notFound();
    return { item, initiatives };
  },
  head: ({ params, loaderData }) => {
    const title = loaderData
      ? `${loaderData.item.title.ar} — ${loaderData.item.title.en}`
      : "مبادرة";
    return {
      meta: [
        { title },
        { name: "description", content: loaderData?.item.summary.ar ?? "" },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData?.item.summary.en ?? "" },
        { property: "og:type", content: "article" },
        { property: "og:url", content: getCanonicalUrl(`/initiatives/${params.slug}`) },
        ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
      ],
      links: [{ rel: "canonical", href: getCanonicalUrl(`/initiatives/${params.slug}`) }],
    };
  },
  component: InitiativeDetail,
});

const copy = {
  parent: { ar: "المبادرات والمشاريع", en: "Initiatives & projects" } as BiText,
  eyebrow: { ar: "بيان برنامج", en: "Programme note" } as BiText,
  active: { ar: "جارية", en: "Active" } as BiText,
  planned: { ar: "مخططة", en: "Planned" } as BiText,
  completed: { ar: "منتهية", en: "Completed" } as BiText,
  aboutTitle: { ar: "عن البرنامج", en: "About the programme" } as BiText,
  otherTitle: { ar: "برامج أخرى", en: "Other programmes" } as BiText,
  contactTitle: { ar: "المشاركة والاستفسار", en: "Taking part" } as BiText,
  contactBody: {
    ar: "يسعدنا انضمامك لهذه المبادرة. سجّل رغبتك أدناه وسيتواصل معك فريق البرنامج، أو راسل الأمانة العامة مباشرة للاستفسار.",
    en: "We'd welcome you joining this programme. Register your interest below and the programme team will be in touch, or write to the secretariat directly with questions.",
  } as BiText,
  joinCta: { ar: "أرغب بالمشاركة", en: "I want to join" } as BiText,
  contactCta: { ar: "مراسلة الأمانة العامة", en: "Write to the secretariat" } as BiText,
  back: { ar: "كل المبادرات", en: "All initiatives" } as BiText,

  joinDialogTitle: { ar: "التسجيل للمشاركة", en: "Register Your Interest" } as BiText,
  fieldName: { ar: "الاسم الكامل", en: "Full name" } as BiText,
  fieldEmail: { ar: "البريد الإلكتروني", en: "Email address" } as BiText,
  fieldPhone: { ar: "رقم الهاتف (اختياري)", en: "Phone (optional)" } as BiText,
  fieldNotes: { ar: "ملاحظات (اختياري)", en: "Notes (optional)" } as BiText,
  joinSubmit: { ar: "إرسال الرغبة بالمشاركة", en: "Submit interest" } as BiText,
  cancel: { ar: "إلغاء", en: "Cancel" } as BiText,
  joinSuccess: {
    ar: "تم تسجيل رغبتك بالمشاركة. سيتواصل معك فريق البرنامج قريباً.",
    en: "Your interest has been registered. The programme team will be in touch soon.",
  } as BiText,
  joinErrorDuplicate: {
    ar: "لديك تسجيل سابق بنفس البريد الإلكتروني لهذه المبادرة.",
    en: "You've already registered interest in this initiative with this email.",
  } as BiText,
  joinErrorGeneric: {
    ar: "تعذّر إتمام التسجيل. يرجى المحاولة مرة أخرى.",
    en: "Could not complete registration. Please try again.",
  } as BiText,
  joinInvalid: {
    ar: "يرجى مراجعة الحقول المطلوبة.",
    en: "Please check the required fields.",
  } as BiText,
};

function JoinInitiativeDialog({
  slug,
  open,
  onOpenChange,
}: {
  slug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t, lang } = useLang();
  const joinFn = useServerFn(joinInitiative);
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload = {
      initiative_slug: slug,
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      notes: String(fd.get("notes") || ""),
      website_url_check: String(fd.get("website_url_check") || ""),
      locale: lang,
      turnstile_token: turnstileToken || undefined,
    };

    setSubmitting(true);
    try {
      const res = await joinFn({ data: payload });
      if (res.ok) {
        toast.success(t(copy.joinSuccess));
        form.reset();
        setTurnstileToken("");
        turnstileRef.current?.reset();
        onOpenChange(false);
      } else {
        const messages: Record<string, BiText> = {
          already_registered: copy.joinErrorDuplicate,
          initiative_not_found: copy.joinErrorGeneric,
          verification_failed: copy.joinErrorGeneric,
          insert_failed: copy.joinErrorGeneric,
        };
        toast.error(t(messages[res.error] ?? copy.joinErrorGeneric));
      }
    } catch {
      toast.error(t(copy.joinInvalid));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t(copy.joinDialogTitle)}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Anti-bot honeypot field */}
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="join_website_url_check">Leave empty</label>
            <input
              type="text"
              id="join_website_url_check"
              name="website_url_check"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="join_name">{t(copy.fieldName)}</Label>
            <Input id="join_name" name="name" required minLength={2} maxLength={100} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="join_email">{t(copy.fieldEmail)}</Label>
            <Input id="join_email" name="email" type="email" required maxLength={255} dir="ltr" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="join_phone">{t(copy.fieldPhone)}</Label>
            <Input id="join_phone" name="phone" dir="ltr" maxLength={30} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="join_notes">{t(copy.fieldNotes)}</Label>
            <Input id="join_notes" name="notes" maxLength={500} />
          </div>

          <TurnstileWidget ref={turnstileRef} onToken={setTurnstileToken} />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t(copy.cancel)}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "…" : t(copy.joinSubmit)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InitiativeDetail() {
  const { item, initiatives } = Route.useLoaderData();
  const { t, lang } = useLang();
  const [copied, setCopied] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;
  const BackArrow = rtl ? ArrowRight : ArrowLeft;

  const others = initiatives.filter((i) => i.slug !== item.slug).slice(0, 4);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success(rtl ? "تم نسخ الرابط بنجاح" : "Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(rtl ? "تعذر نسخ الرابط" : "Failed to copy link");
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `${t(item.title)}\n${t(item.summary)}\n\n${window.location.href}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <article className="container-page py-12 md:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/initiatives"
            className="inline-flex items-center gap-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <BackArrow className="h-3.5 w-3.5" aria-hidden="true" />
            {t(copy.parent)}
          </Link>

          {/* Social Share Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 rounded border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{rtl ? "مشاركة عبر واتساب" : "WhatsApp"}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copied ? (rtl ? "تم النسخ" : "Copied") : rtl ? "نسخ الرابط" : "Copy"}</span>
            </button>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3 border-b border-ink/25 pb-3 dark:border-ivory/20">
          <Eyebrow rule={false}>{t(copy.eyebrow)}</Eyebrow>
          <span className="h-3 w-px bg-border" aria-hidden="true" />
          <Status
            tone={
              item.status === "ongoing"
                ? "active"
                : item.status === "completed"
                  ? "neutral"
                  : "pending"
            }
          >
            {item.status === "ongoing"
              ? t(copy.active)
              : item.status === "completed"
                ? t(copy.completed)
                : t(copy.planned)}
          </Status>
        </div>

        <h1 className="mt-6 text-balance text-3xl leading-[1.25] text-foreground md:text-[2.5rem]">
          {t(item.title)}
        </h1>

        <p className="mt-5 border-s-2 border-bronze/50 ps-5 text-base leading-relaxed text-ink-soft dark:border-gold/50 dark:text-foreground/80">
          {t(item.summary)}
        </p>

        <figure className="mt-10">
          <img
            src={initiativeImage(item.slug)}
            alt=""
            className="photo-plate aspect-[16/9] w-full object-cover"
            loading="eager"
          />
        </figure>

        <section className="reveal-on-scroll mt-10">
          <p className="label-caps border-b border-border pb-2 text-bronze dark:text-gold">
            {t(copy.aboutTitle)}
          </p>
          <div className="measure mt-5 text-[0.95rem] leading-[1.95] text-ink-soft dark:text-foreground/85">
            <p>{t(item.body)}</p>
          </div>
        </section>

        {/* ── Support & Contribute Synergy Banner ─────────────── */}
        <div className="mt-10 p-5 bg-card border border-border rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-bronze dark:text-gold uppercase tracking-wider">
              {rtl ? "دعم وتمويل البرنامج" : "Program Funding & Support"}
            </span>
            <h3 className="text-base font-bold text-foreground">
              {rtl
                ? "ساهم في دعم وتحقيق أهداف هذه المبادرة"
                : "Support and contribute to this initiative"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {rtl
                ? "تُدار المساهمات عبر الحساب البنكي الرسمي لصندوق التنمية العائلية."
                : "Contributions are handled via the official Family Development Fund account."}
            </p>
          </div>
          <Link
            to="/contribute"
            search={{ initiative: item.slug, purpose: t(item.title) }}
            className="inline-flex shrink-0 items-center gap-2 border border-ink bg-ink px-5 py-2.5 text-xs font-bold text-ivory hover:bg-transparent hover:text-foreground dark:border-gold dark:bg-gold dark:text-ink dark:hover:bg-transparent dark:hover:text-gold transition-colors"
          >
            <HeartHandshake className="w-4 h-4" />
            {rtl ? "المساهمة في المبادرة" : "Contribute Now"}
          </Link>
        </div>

        <Ornament className="my-12" />

        {/* Enquiry & joining */}
        <section className="reveal-on-scroll flex flex-wrap items-center justify-between gap-6 border-y border-border py-8">
          <div className="measure">
            <h2 className="text-lg text-foreground font-bold">{t(copy.contactTitle)}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t(copy.contactBody)}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setJoinOpen(true)}
              className="inline-flex items-center gap-2 border border-ink bg-ink px-5 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-transparent hover:text-foreground dark:border-gold dark:bg-gold dark:text-ink dark:hover:bg-transparent dark:hover:text-gold"
            >
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              {t(copy.joinCta)}
            </button>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              {t(copy.contactCta)}
              <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <JoinInitiativeDialog slug={item.slug} open={joinOpen} onOpenChange={setJoinOpen} />

        {/* Other programmes */}
        <section className="reveal-on-scroll mt-12">
          <p className="label-caps border-b border-border pb-2 text-muted-foreground">
            {t(copy.otherTitle)}
          </p>
          <ol className="reveal-stagger grid gap-x-12 sm:grid-cols-2">
            {others.map((other) => (
              <li key={other.slug} className="border-b border-border">
                <Link
                  to="/initiatives/$slug"
                  params={{ slug: other.slug }}
                  className="group flex items-baseline justify-between gap-4 py-4"
                >
                  <span className="text-sm leading-snug font-medium text-foreground transition-colors group-hover:text-bronze dark:group-hover:text-gold">
                    {t(other.title)}
                  </span>
                  <Arrow
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-bronze dark:group-hover:text-gold"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <Link
          to="/initiatives"
          className="mt-10 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
        >
          <BackArrow className="h-3.5 w-3.5" aria-hidden="true" />
          {t(copy.back)}
        </Link>
      </div>
    </article>
  );
}
