import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft, Send } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { useCart } from "@/hooks/useCart";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow } from "@/components/site/Editorial";
import { TurnstileWidget, type TurnstileWidgetHandle } from "@/components/site/TurnstileWidget";
import { submitFrameOrderInquiry } from "@/lib/forms.functions";
import { frameOrderSchema } from "@/lib/forms.schemas";
import { getCanonicalUrl } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "سلة المشتريات — شجرة العائلة | آل بوعبيد" },
      {
        name: "description",
        content:
          "سلة مشتريات لوحة شجرة العائلة الرسمية لأسرة آل بوعبيد. راجع اختياراتك وأرسل طلبك للأمانة العامة.",
      },
      { property: "og:title", content: "سلة المشتريات — شجرة العائلة | آل بوعبيد" },
      {
        property: "og:description",
        content: "راجع اختياراتك من فريمات شجرة العائلة وأرسل طلبك للأمانة العامة.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: getCanonicalUrl("/cart") },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/cart") }],
  }),
  component: CartPage,
});

const copy = {
  eyebrow: { ar: "الطلبات", en: "Orders" } as BiText,
  title: { ar: "سلة مشتريات شجرة العائلة", en: "Family Tree Basket" } as BiText,
  subtitle: {
    ar: "راجع الفريمات والمقاسات المختارة، ثم أرسل الطلب للأمانة العامة للتواصل معك بخصوص التأكيد والدفع.",
    en: "Review your chosen frames and sizes, then send the request to the secretariat to confirm and arrange payment.",
  } as BiText,
  emptyTitle: { ar: "السلة فارغة", en: "Your basket is empty" } as BiText,
  emptyBody: {
    ar: "لم تضف أي فريمات بعد. تصفح المقاسات المتوفرة واختر ما يناسبك.",
    en: "You haven't added any frames yet. Browse the available sizes and choose what suits you.",
  } as BiText,
  browse: { ar: "تصفح الفريمات", en: "Browse frames" } as BiText,
  itemLabel: { ar: "المنتج", en: "Product" } as BiText,
  quantityLabel: { ar: "الكمية", en: "Quantity" } as BiText,
  priceLabel: { ar: "السعر", en: "Price" } as BiText,
  totalLabel: { ar: "الإجمالي", en: "Total" } as BiText,
  remove: { ar: "إزالة", en: "Remove" } as BiText,
  summaryTitle: { ar: "ملخص الطلب", en: "Order summary" } as BiText,
  submitTitle: { ar: "إرسال الطلب", en: "Submit order" } as BiText,
  nameLabel: { ar: "الاسم الكامل", en: "Full name" } as BiText,
  emailLabel: { ar: "البريد الإلكتروني", en: "Email address" } as BiText,
  phoneLabel: { ar: "رقم الجوال", en: "Phone number" } as BiText,
  notesLabel: { ar: "ملاحظات (اختياري)", en: "Notes (optional)" } as BiText,
  submit: { ar: "إرسال الطلب", en: "Submit order" } as BiText,
  submitting: { ar: "جاري الإرسال...", en: "Submitting..." } as BiText,
  sent: {
    ar: "تم استلام طلبك. ستتواصل الأمانة العامة معك قريباً لإكمال التأكيد.",
    en: "Your order has been received. The secretariat will contact you shortly to complete confirmation.",
  } as BiText,
  invalid: { ar: "يرجى مراجعة الحقول المطلوبة.", en: "Please check the required fields." } as BiText,
  failed: {
    ar: "تعذّر إرسال الطلب. يرجى المحاولة مرة أخرى.",
    en: "The order could not be sent. Please try again.",
  } as BiText,
  tbd: { ar: "يُحدَّد لاحقاً", en: "To be confirmed" } as BiText,
  customPriceNote: {
    ar: "* يتم تحديد سعر الفريم الخاص بعد مراجعة الطلب.",
    en: "* The custom frame price will be set after the order is reviewed.",
  } as BiText,
};

const fieldClass =
  "w-full border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-bronze focus:ring-2 focus:ring-bronze/20 dark:focus:border-gold dark:focus:ring-gold/20";

function CartPage() {
  const { t, lang } = useLang();
  const isAr = lang === "ar";
  const { items, itemCount, total, removeItem, updateQuantity, clearCart, isHydrated } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const sendOrder = useServerFn(submitFrameOrderInquiry);
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const priceText = (price: number | null) =>
    price === null ? t(copy.tbd) : isAr ? `${price} ريال` : `${price} SAR`;

  const formatOrderLines = () => {
    return items
      .map((item) => {
        const name = t(item.name);
        const frame = t(item.frameNo);
        const size = t(item.sizeName);
        const width = t(item.width);
        const length = t(item.length);
        const price = priceText(item.price);
        return `- ${name} (${frame} / ${size}) — ${width} × ${length} — ${price} × ${item.quantity}`;
      })
      .join("\n");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const result = frameOrderSchema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      notes: fd.get("notes"),
      locale: lang,
      turnstile_token: turnstileToken || undefined,
      website_url_check: fd.get("website_url_check") || undefined,
      order_lines: formatOrderLines(),
      total: total,
    });

    if (!result.success) {
      toast.error(t(copy.invalid));
      return;
    }

    setSubmitting(true);
    try {
      const res = await sendOrder({ data: result.data });
      if (res.ok) {
        toast.success(t(copy.sent));
        clearCart();
        form.reset();
        turnstileRef.current?.reset();
        setTurnstileToken("");
      } else {
        toast.error(t(copy.failed));
      }
    } catch (err) {
      console.error(err);
      toast.error(t(copy.failed));
    } finally {
      setSubmitting(false);
    }
  };

  // Avoid layout shift before cart rehydrates
  if (!isHydrated) {
    return (
      <div className="container-page min-h-[40vh] py-12">
        <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
        meta={[
          { label: isAr ? "العدد" : "Items", value: `${itemCount}`, mono: true },
          {
            label: isAr ? "الإجمالي" : "Total",
            value: total > 0 ? (isAr ? `${total} ريال` : `${total} SAR`) : t(copy.tbd),
            mono: true,
          },
        ]}
      />

      <section className="container-page py-10 md:py-14">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-border bg-secondary/20 py-16 text-center rounded-md">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <h2 className="mt-4 font-serif text-xl text-foreground">{t(copy.emptyTitle)}</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">{t(copy.emptyBody)}</p>
            <Link
              to="/official-family-tree"
              className="mt-5 inline-flex items-center gap-2 border border-gold bg-gold px-5 py-2.5 text-[13px] font-bold text-ink transition-colors hover:bg-transparent hover:text-gold rounded-md"
            >
              {t(copy.browse)}
              <ArrowIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,22rem)]">
            {/* Items list */}
            <div>
              <Eyebrow rule>{t(copy.itemLabel)}</Eyebrow>
              <ul className="mt-5 space-y-4">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-col gap-4 border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between rounded-md"
                  >
                    <div className="min-w-0">
                      <h3 className="font-serif text-base font-bold text-foreground">
                        {t(item.name)}
                      </h3>
                      <p className="mt-1 text-[13px] text-muted-foreground">
                        {t(item.frameNo)} — {t(item.sizeName)}
                      </p>
                      <p className="text-[13px] text-muted-foreground">
                        {t(item.width)} × {t(item.length)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-border rounded-md">
                        <button
                          type="button"
                          aria-label={isAr ? "تقليل" : "Decrease"}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="grid h-9 w-9 place-items-center text-muted-foreground transition-colors hover:bg-secondary"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={isAr ? "زيادة" : "Increase"}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="grid h-9 w-9 place-items-center text-muted-foreground transition-colors hover:bg-secondary"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="min-w-[5rem] text-end">
                        <p className="font-serif text-base font-bold text-bronze dark:text-gold">
                          {priceText(item.price)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {isAr ? "×" : "×"} {item.quantity}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="grid h-9 w-9 place-items-center text-muted-foreground transition-colors hover:text-destructive"
                        aria-label={t(copy.remove)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {items.some((i) => i.price === null) && (
                <p className="mt-4 text-[12.5px] font-semibold text-bronze dark:text-gold">
                  {t(copy.customPriceNote)}
                </p>
              )}
            </div>

            {/* Summary + checkout */}
            <div className="h-fit border border-border bg-card p-5 rounded-md">
              <Eyebrow>{t(copy.summaryTitle)}</Eyebrow>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t(copy.totalLabel)}</span>
                  <span className="font-serif font-bold text-foreground">
                    {total > 0 ? (isAr ? `${total} ريال` : `${total} SAR`) : t(copy.tbd)}
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed text-muted-foreground">
                  {isAr
                    ? "لا يتم الدفع مباشرة هنا. يُرسل الطلب للأمانة العامة للتواصل معك."
                    : "Payment is not taken here. The order is sent to the secretariat, who will contact you."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <Eyebrow>{t(copy.submitTitle)}</Eyebrow>
                <input
                  type="text"
                  name="website_url_check"
                  className="hidden"
                  autoComplete="off"
                  tabIndex={-1}
                />
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-foreground">
                    {t(copy.nameLabel)} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className={fieldClass}
                    placeholder={isAr ? "محمد آل بوعبيد" : "Mohammed Al Bu Obaid"}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-foreground">
                    {t(copy.emailLabel)} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className={fieldClass}
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-foreground">
                    {t(copy.phoneLabel)} *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className={cn(fieldClass, "nums")}
                    placeholder="+966 5X XXX XXXX"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-foreground">
                    {t(copy.notesLabel)}
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    className={fieldClass}
                    placeholder={
                      isAr ? "أي تفاصيل إضافية حول الطلب..." : "Any additional order details..."
                    }
                  />
                </div>

                <TurnstileWidget ref={turnstileRef} onToken={setTurnstileToken} />

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 border border-ink bg-ink px-5 py-2.5 text-[13px] font-bold text-ivory transition-colors hover:bg-transparent hover:text-foreground disabled:opacity-60 dark:border-gold dark:bg-gold dark:text-ink dark:hover:bg-transparent dark:hover:text-gold rounded-md"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {submitting ? t(copy.submitting) : t(copy.submit)}
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
