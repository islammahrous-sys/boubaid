import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  Bell,
  CalendarCheck,
  Crown,
  FileBarChart,
  Gem,
  Landmark,
  Mail,
  MessageCircleQuestion,
  Newspaper,
  ScrollText,
  Sparkles,
  Trophy,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang, type BiText } from "@/i18n/LanguageProvider";
import { getPublicSiteSettings } from "@/lib/cms.functions";

export type HonorTierId = "platinum" | "diamond" | "golden" | "silver";

/** One confirmed, consented contributor — managed in the console (site setting `hq_honor_roll`). */
export type HonorRollEntry = { name: string; tier: HonorTierId };

type Tier = {
  id: HonorTierId;
  name: BiText;
  threshold: BiText;
  Icon: LucideIcon;
  perks: { Icon: LucideIcon; text: BiText }[];
  /** Card surface, accent rule and badge — every tier also carries its name and threshold. */
  card: string;
  accent: string;
  badge: string;
};

/** Contribution tiers as approved by the council. Figures and privileges are policy text. */
export const HONOR_TIERS: Tier[] = [
  {
    id: "platinum",
    name: { ar: "الفئة البلاتينية", en: "Platinum" },
    threshold: { ar: "500,000 ريال سعودي فأكثر", en: "SAR 500,000+" },
    Icon: Crown,
    perks: [
      { Icon: Users, text: { ar: "مقعد استشاري", en: "Advisory seat" } },
      { Icon: Landmark, text: { ar: "حقوق تسمية المشروع", en: "Project naming rights" } },
      { Icon: Trophy, text: { ar: "درع تكريمي مادي", en: "Physical trophy" } },
      {
        Icon: Sparkles,
        text: { ar: "أعلى مستويات التكريم الرقمي", en: "Top digital honor" },
      },
    ],
    card: "bg-ink text-ivory border-gold/60 dark:bg-card dark:text-foreground",
    accent: "bg-gold",
    badge: "border-gold/60 text-gold",
  },
  {
    id: "diamond",
    name: { ar: "الفئة الماسية", en: "Diamond" },
    threshold: { ar: "من 250,000 إلى 499,999 ريال سعودي", en: "SAR 250,000–499,999" },
    Icon: Gem,
    perks: [
      {
        Icon: BadgeCheck,
        text: { ar: "ملف تعريفي مميز للمتبرع", en: "Featured donor profile" },
      },
      {
        Icon: CalendarCheck,
        text: { ar: "مقاعد لكبار الشخصيات في حفل التكريم", en: "VIP gala seating" },
      },
      {
        Icon: Wallet,
        text: { ar: "تخصيص المساهمة لصندوق محدد", en: "Specific fund designation" },
      },
    ],
    card: "bg-card text-foreground border-bronze/70",
    accent: "bg-bronze",
    badge: "border-bronze/60 text-bronze",
  },
  {
    id: "golden",
    name: { ar: "الفئة الذهبية", en: "Golden" },
    threshold: { ar: "من 100,000 إلى 249,999 ريال سعودي", en: "SAR 100,000–249,999" },
    Icon: Award,
    perks: [
      {
        Icon: Users,
        text: { ar: "إمكانية التأهل لعضوية اللجان", en: "Committee membership eligibility" },
      },
      {
        Icon: FileBarChart,
        text: { ar: "تقارير ربع سنوية عن أثر المساهمات", en: "Quarterly impact reports" },
      },
      { Icon: Bell, text: { ar: "أولوية الوصول والاستفادة", en: "Priority access" } },
    ],
    card: "bg-gold/10 text-foreground border-gold/70",
    accent: "bg-gold",
    badge: "border-gold/70 text-foreground",
  },
  {
    id: "silver",
    name: { ar: "الفئة الفضية", en: "Silver" },
    threshold: { ar: "أقل من 100,000 ريال سعودي", en: "Less than SAR 100,000" },
    Icon: ScrollText,
    perks: [
      {
        Icon: Newspaper,
        text: {
          ar: "إدراج اسم المتبرع في قائمة الداعمين على الموقع",
          en: "Website donor roll listing",
        },
      },
      {
        Icon: BadgeCheck,
        text: { ar: "شهادة شكر وتقدير رقمية", en: "Digital appreciation certificate" },
      },
      {
        Icon: Mail,
        text: { ar: "الإشادة بالمساهمة في النشرة الدورية", en: "Newsletter recognition" },
      },
    ],
    card: "bg-secondary/60 text-foreground border-border",
    accent: "bg-muted-foreground/60",
    badge: "border-muted-foreground/40 text-muted-foreground",
  },
];

const copy = {
  eyebrow: { ar: "مشروع مقر مجلس الأسرة", en: "Family Council Headquarters" },
  title: { ar: "لوحة الشرف", en: "Wall of Honor" },
  lead: {
    ar: "ساهم في تأسيس المقر الدائم للأسرة، وكن جزءًا من إرث يجمع الأجيال ويعزز روابط الأسرة ويخدم أبناءها مستقبلًا.",
    en: "Help establish the permanent Family Council Headquarters and become part of a lasting legacy that brings generations together, strengthens family bonds, and serves the family for years to come.",
  },
  tiersLabel: { ar: "فئات المساهمة", en: "Contribution tiers" },
  contribution: { ar: "المساهمة", en: "Contribution" },
  privileges: { ar: "المزايا", en: "Privileges" },
  note: {
    ar: "تُمنح المزايا بعد تأكيد المساهمة واعتمادها من اللجنة المالية والاستثمارية لمجلس الأسرة.",
    en: "Privileges are granted once a contribution has been confirmed and approved by the Family Council's Finance & Investment Committee.",
  },
  ctaPrimary: { ar: "ساهم في تأسيس المقر", en: "Contribute to the Headquarters" },
  ctaSecondary: { ar: "للاستفسار عن المساهمة", en: "Ask About Contributing" },
  ctaHint: {
    ar: "يصل طلبك إلى مركز الطلبات برقم مرجعي، وتتواصل معك اللجنة لتأكيد المساهمة وطريقتها.",
    en: "Your request reaches the Requests Hub with a reference number, and the committee will contact you to confirm the contribution and how to make it.",
  },
  rollTitle: { ar: "الداعمون المؤكَّدون", en: "Confirmed contributors" },
  rollEmpty: {
    ar: "ستُدرج هنا أسماء المساهمين بعد تأكيد مساهماتهم وموافقتهم على النشر. كن أول من يُكرَّم في لوحة الشرف.",
    en: "Contributors will be listed here once their contributions are confirmed and they have agreed to be named. Be among the first honoured on the Wall.",
  },
} satisfies Record<string, BiText>;

const TIER_IDS = new Set<string>(HONOR_TIERS.map((t) => t.id));

/** Keeps only well-formed entries, so a malformed setting can never break the homepage. */
export function parseHonorRoll(value: unknown): HonorRollEntry[] {
  const rows = (value as { entries?: unknown } | null | undefined)?.entries;
  if (!Array.isArray(rows)) return [];
  return rows.filter(
    (r): r is HonorRollEntry =>
      !!r &&
      typeof r === "object" &&
      typeof (r as HonorRollEntry).name === "string" &&
      (r as HonorRollEntry).name.trim() !== "" &&
      TIER_IDS.has((r as HonorRollEntry).tier),
  );
}

/**
 * Wall of Honor — the fundraising block inside the homepage's headquarters
 * section. The primary action files a `hq_contribution` request in the
 * Requests Hub (no payment is taken on the site); recognised names come only
 * from the console-managed `hq_honor_roll` setting.
 */
export function WallOfHonor({ className }: { className?: string }) {
  const { lang, t } = useLang();
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;

  const { data: settings } = useQuery({
    queryKey: ["public_site_settings"],
    queryFn: () => getPublicSiteSettings(),
    staleTime: 5 * 60 * 1000,
  });
  const roll = parseHonorRoll((settings as Record<string, unknown> | undefined)?.hq_honor_roll);

  return (
    <section
      id="wall-of-honor"
      aria-labelledby="wall-of-honor-title"
      className={cn("relative scroll-mt-24 border-t border-border pt-12 md:pt-16", className)}
    >
      <div className="mx-auto max-w-3xl text-center">
        <img
          src="/logo-mark-brown.svg"
          alt=""
          aria-hidden="true"
          width={56}
          height={56}
          loading="lazy"
          className="mx-auto h-14 w-14 object-contain dark:hidden"
        />
        <img
          src="/logo-mark-cream.svg"
          alt=""
          aria-hidden="true"
          width={56}
          height={56}
          loading="lazy"
          className="mx-auto hidden h-14 w-14 object-contain dark:block"
        />
        <p className="label-caps mt-4 text-bronze">{t(copy.eyebrow)}</p>
        <h2
          id="wall-of-honor-title"
          className="mt-2 text-balance text-3xl leading-tight text-foreground md:text-4xl"
        >
          {t(copy.title)}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {t(copy.lead)}
        </p>
      </div>

      <h3 className="sr-only">{t(copy.tiersLabel)}</h3>
      <ol className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {HONOR_TIERS.map((tier) => (
          <li
            key={tier.id}
            aria-labelledby={`tier-${tier.id}`}
            className={cn(
              "relative flex flex-col overflow-hidden rounded-md border p-6 shadow-[0_1px_2px_rgb(36_91_63/0.06),0_12px_32px_-16px_rgb(36_91_63/0.25)]",
              tier.card,
            )}
          >
            <span className={cn("absolute inset-x-0 top-0 h-1", tier.accent)} aria-hidden="true" />
            <div className="flex items-center justify-between gap-3">
              <h4 id={`tier-${tier.id}`} className="text-xl leading-tight">
                {t(tier.name)}
              </h4>
              <span
                className={cn(
                  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
                  tier.badge,
                )}
                aria-hidden="true"
              >
                <tier.Icon className="h-5 w-5" />
              </span>
            </div>

            <p className="mt-5 text-[11px] uppercase tracking-wider opacity-70">
              {t(copy.contribution)}
            </p>
            <p className="nums mt-1 text-lg font-semibold leading-snug">{t(tier.threshold)}</p>

            <p className="mt-5 border-t border-current/15 pt-4 text-[11px] uppercase tracking-wider opacity-70">
              {t(copy.privileges)}
            </p>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed">
              {tier.perks.map((perk) => (
                <li key={perk.text.en} className="flex items-start gap-2.5">
                  <perk.Icon className="mt-0.5 h-4 w-4 shrink-0 opacity-80" aria-hidden="true" />
                  <span>{t(perk.text)}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
        {t(copy.note)}
      </p>

      <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        <Link
          to="/requests"
          search={{ request: "hq_contribution" }}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-medium text-ivory transition-[transform,opacity] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] dark:bg-gold dark:text-ink"
        >
          <Landmark className="h-4 w-4" aria-hidden="true" />
          {t(copy.ctaPrimary)}
          <Arrow className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link
          to="/requests"
          search={{ request: "committee_finance_investment" }}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-bronze px-6 py-3 text-sm font-medium text-bronze transition-[transform,opacity] hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] dark:border-gold dark:text-gold"
        >
          <MessageCircleQuestion className="h-4 w-4" aria-hidden="true" />
          {t(copy.ctaSecondary)}
        </Link>
      </div>
      <p className="mx-auto mt-3 max-w-xl text-center text-xs leading-relaxed text-muted-foreground">
        {t(copy.ctaHint)}
      </p>

      <div className="mt-12 rounded-md border border-border bg-card p-6 md:p-8">
        <h3 className="flex items-center gap-2 text-lg text-foreground">
          <Trophy className="h-5 w-5 text-bronze" aria-hidden="true" />
          {t(copy.rollTitle)}
        </h3>
        {roll.length === 0 ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(copy.rollEmpty)}</p>
        ) : (
          <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {HONOR_TIERS.map((tier) => {
              const names = roll.filter((r) => r.tier === tier.id);
              if (names.length === 0) return null;
              return (
                <div key={tier.id}>
                  <p className="label-caps text-bronze">{t(tier.name)}</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-foreground">
                    {names.map((r, i) => (
                      <li key={`${r.name}-${i}`}>{r.name}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
