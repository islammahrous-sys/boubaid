import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Briefcase,
  Frame,
  Mail,
  Award,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";
import type { ComponentType } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionRail, type RailSection } from "@/components/site/SectionRail";
import { Eyebrow, Ornament } from "@/components/site/Editorial";
import { getCanonicalUrl } from "@/lib/seo";

export const Route = createFileRoute("/requests")({
  head: () => ({
    meta: [
      { title: "مركز الطلبات | آل بوعبيد" },
      {
        name: "description",
        content:
          "مركز الطلبات في موقع أسرة آل بوعبيد: بوابة واحدة لتقديم طلبات توثيق العضوية والاشتراك والمساهمة وإدراج الأعمال والترشيح لسجل المتميزين ومتابعة حالتها.",
      },
      { property: "og:title", content: "مركز الطلبات — آل بوعبيد" },
      {
        property: "og:description",
        content: "بوابة واحدة لجميع الطلبات: التقديم، المتابعة، والاعتماد.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: getCanonicalUrl("/requests") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/requests") }],
  }),
  component: RequestsHubPage,
});

const copy = {
  eyebrow: { ar: "بوابة واحدة", en: "One front door" } as BiText,
  title: { ar: "مركز الطلبات", en: "Requests Hub" } as BiText,
  subtitle: {
    ar: "كل ما يمكن طلبه من الأسرة في مكان واحد: اختر نوع الطلب، قدّمه، ثم تابع حالته من حسابك.",
    en: "Everything you can request from the family council in one place: pick a request, submit it, then follow its status from your account.",
  } as BiText,

  submitTitle: { ar: "تقديم طلب", en: "Submit a Request" } as BiText,
  submitNote: {
    ar: "يفتح كل بند الصفحة الرسمية الخاصة به على الموقع، ولا يوجد نموذج بديل أو مواز.",
    en: "Each item opens its own official page on this site; there is no parallel or duplicate form.",
  } as BiText,

  mineTitle: { ar: "طلباتي ومتابعتها", en: "My Requests & Tracking" } as BiText,
  mineNote: {
    ar: "حالة الطلبات والإشعارات والسجل المالي تظهر في حسابك بعد تسجيل الدخول.",
    en: "Request status, notifications, and your contribution record appear in your account after signing in.",
  } as BiText,
  mineCta: { ar: "الانتقال إلى حسابي", en: "Go to my account" } as BiText,
  signInCta: { ar: "تسجيل الدخول لمتابعة طلباتي", en: "Sign in to track my requests" } as BiText,

  approvalsTitle: { ar: "طلبات تنتظر اعتمادي", en: "Awaiting My Approval" } as BiText,
  approvalsNote: {
    ar: "تظهر هذه الروابط لأصحاب الصلاحية فقط، وتفتح شاشات المراجعة النظامية في لوحة الإدارة كما هي.",
    en: "These links appear only to authorised reviewers and open the existing review screens in the console unchanged.",
  } as BiText,

  lifecycleTitle: { ar: "مسار الطلب", en: "How a request travels" } as BiText,
  steps: [
    { ar: "تقديم الطلب", en: "Submit" },
    { ar: "المراجعة", en: "Review" },
    { ar: "الاعتماد أو الاعتذار", en: "Approval or rejection" },
    { ar: "المتابعة والحالة", en: "Status & follow-up" },
    { ar: "الإنجاز", en: "Completion" },
  ] as BiText[],

  action: { ar: "تقديم الطلب", en: "Submit request" } as BiText,
  signInNote: { ar: "يتطلب تسجيل الدخول", en: "Requires sign-in" } as BiText,
};

type RequestEntry = {
  id: string;
  to: string;
  Icon: ComponentType<{ className?: string }>;
  name: BiText;
  desc: BiText;
  requiresAuth?: boolean;
};

/** Only request types that actually exist on this website. */
const requests: RequestEntry[] = [
  {
    id: "membership",
    to: "/account",
    Icon: BadgeCheck,
    name: { ar: "طلب توثيق العضوية", en: "Membership verification request" },
    desc: {
      ar: "تقديم طلب اعتماد العضوية للأمانة العامة وإصدار بطاقة العضوية الرسمية.",
      en: "Ask the secretariat to verify your membership and issue your official family card.",
    },
    requiresAuth: true,
  },
  {
    id: "contribution",
    to: "/contribute",
    Icon: Banknote,
    name: { ar: "الاشتراك والمساهمة", en: "Subscription & contribution" },
    desc: {
      ar: "تسجيل اشتراك أو مساهمة في صندوق التنمية العائلية وإرفاق إشعار السداد للمراجعة.",
      en: "Register a subscription or contribution to the family development fund and attach your payment notice for review.",
    },
  },
  {
    id: "directory",
    to: "/directory",
    Icon: Briefcase,
    name: { ar: "إدراج نشاط تجاري في الدليل", en: "Business directory listing" },
    desc: {
      ar: "طلب إضافة منشأة أو نشاط تجاري لأحد أبناء الأسرة إلى دليل الأعمال.",
      en: "Request that a family member's business be added to the family business directory.",
    },
  },
  {
    id: "achiever",
    to: "/achievers",
    Icon: Award,
    name: { ar: "الترشيح لسجل المتميزين", en: "Roll of Honour nomination" },
    desc: {
      ar: "ترشيح أحد أفراد الأسرة لتوثيق إنجاز علمي أو مهني في سجل المتميزين.",
      en: "Nominate a family member so an academic or professional achievement is recorded in the Roll of Honour.",
    },
  },
  {
    id: "frame",
    to: "/official-family-tree",
    Icon: Frame,
    name: { ar: "طلب لوحة شجرة العائلة", en: "Family tree frame order" },
    desc: {
      ar: "الاطلاع على مقاسات اللوحة الرسمية المصورة لشجرة العائلة وطلب النسخة المناسبة.",
      en: "See the sizes of the Official Illustrated Family Tree and order the one you want.",
    },
  },
  {
    id: "inquiry",
    to: "/contact",
    Icon: Mail,
    name: { ar: "استفسار أو طلب عام", en: "General inquiry or request" },
    desc: {
      ar: "إرسال استفسار أو طلب لا يشمله ما سبق إلى الأمانة العامة عبر صندوق الوارد.",
      en: "Send the secretariat any inquiry or request not covered above; it lands in the official inbox.",
    },
  },
];

type ApprovalEntry = {
  id: string;
  name: BiText;
  desc: BiText;
  /** Either an in-console tab or a standalone review route. */
  admin?: { domain: string; tab: string };
  route?: "/treasury";
  allow: (roles: string[]) => boolean;
};

const isAdmin = (roles: string[]) => roles.includes("admin") || roles.includes("super_admin");

const approvals: ApprovalEntry[] = [
  {
    id: "ap-membership",
    name: { ar: "طلبات توثيق العضوية", en: "Membership verification requests" },
    desc: {
      ar: "مراجعة طلبات العضوية وإسناد الأدوار في شاشة المستخدمين والتوثيق.",
      en: "Review membership requests and role assignments in User Accounts & Verification.",
    },
    admin: { domain: "system", tab: "users" },
    allow: isAdmin,
  },
  {
    id: "ap-contributions",
    name: { ar: "المساهمات والاشتراكات", en: "Contributions & subscriptions" },
    desc: {
      ar: "اعتماد أو رفض إشعارات السداد في شاشة الخزينة.",
      en: "Approve or decline payment notices in the treasury screen.",
    },
    route: "/treasury",
    allow: (roles) => isAdmin(roles) || roles.includes("treasurer"),
  },
  {
    id: "ap-directory",
    name: { ar: "طلبات إدراج الأعمال", en: "Business listing requests" },
    desc: {
      ar: "مراجعة المنشآت المقدَّمة قبل نشرها في دليل الأعمال.",
      en: "Review submitted businesses before they appear in the directory.",
    },
    admin: { domain: "community", tab: "directory" },
    allow: isAdmin,
  },
  {
    id: "ap-achievers",
    name: { ar: "ترشيحات سجل المتميزين", en: "Roll of Honour nominations" },
    desc: {
      ar: "اعتماد الترشيحات قبل إضافتها إلى لوحة الشرف.",
      en: "Approve nominations before they join the Roll of Honour.",
    },
    admin: { domain: "community", tab: "achievers" },
    allow: isAdmin,
  },
  {
    id: "ap-inquiries",
    name: { ar: "الرسائل والاستفسارات", en: "Messages & inquiries" },
    desc: {
      ar: "معالجة رسائل التواصل وطلبات اللوحات في صندوق الوارد.",
      en: "Handle contact messages and frame orders in the inbox.",
    },
    admin: { domain: "community", tab: "inquiries" },
    allow: isAdmin,
  },
];

const railSections: RailSection[] = [
  { id: "submit", label: { ar: "تقديم طلب", en: "Submit" } },
  { id: "mine", label: { ar: "طلباتي", en: "My requests" } },
  { id: "approvals", label: { ar: "الاعتماد", en: "Approvals" } },
];

function RequestsHubPage() {
  const { t, lang } = useLang();
  const { user, roles } = useAuth();
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;

  const myApprovals = approvals.filter((a) => a.allow(roles));

  return (
    <>
      <PageHeader
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
      />

      <SectionRail sections={railSections} className="print-hide" />

      <div className="container-page py-14 md:py-16">
        {/* ── مسار الطلب ─────────────────────────────────────── */}
        <section className="reveal-on-scroll">
          <Eyebrow rule>{t(copy.lifecycleTitle)}</Eyebrow>
          <ol className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12.5px] text-muted-foreground">
            {copy.steps.map((s, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2">
                  <span className="nums font-mono text-bronze/70 dark:text-gold/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{t(s)}</span>
                </span>
                {i < copy.steps.length - 1 ? (
                  <Arrow className="h-3.5 w-3.5 opacity-40" aria-hidden="true" />
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        {/* ── تقديم طلب ──────────────────────────────────────── */}
        <section id="submit" className="scroll-mt-28 reveal-on-scroll mt-14 border-t border-border pt-12">
          <Eyebrow rule>{t(copy.submitTitle)}</Eyebrow>
          <p className="measure mt-3 text-[13px] leading-relaxed text-muted-foreground">
            {t(copy.submitNote)}
          </p>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {requests.map((r) => {
              const Icon = r.Icon;
              return (
                <li
                  key={r.id}
                  className="flex flex-col border border-border bg-card p-5 transition-colors hover:border-bronze dark:hover:border-gold rounded-md"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded border border-border bg-secondary/50 text-bronze dark:text-gold">
                    <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold text-foreground">{t(r.name)}</h3>
                  <p className="mt-2 flex-1 text-[13px] leading-relaxed text-muted-foreground">
                    {t(r.desc)}
                  </p>
                  {r.requiresAuth && !user ? (
                    <p className="mt-3 text-[11.5px] text-muted-foreground">{t(copy.signInNote)}</p>
                  ) : null}
                  <Link
                    to={r.requiresAuth && !user ? "/auth" : r.to}
                    className="mt-4 inline-flex items-center gap-2 self-start border-b border-bronze pb-0.5 text-[13px] font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                  >
                    {t(copy.action)}
                    <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <Ornament className="mt-16" />

        {/* ── طلباتي ─────────────────────────────────────────── */}
        <section id="mine" className="scroll-mt-28 reveal-on-scroll mt-16 border-t border-border pt-12">
          <Eyebrow rule>{t(copy.mineTitle)}</Eyebrow>
          <p className="measure mt-3 text-[13px] leading-relaxed text-muted-foreground">
            {t(copy.mineNote)}
          </p>
          <Link
            to={user ? "/account" : "/auth"}
            className="mt-6 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
          >
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            {user ? t(copy.mineCta) : t(copy.signInCta)}
          </Link>
        </section>

        {/* ── الاعتماد ───────────────────────────────────────── */}
        {myApprovals.length > 0 ? (
          <section
            id="approvals"
            className="scroll-mt-28 reveal-on-scroll mt-16 border-t border-border pt-12"
          >
            <Eyebrow rule>{t(copy.approvalsTitle)}</Eyebrow>
            <p className="measure mt-3 text-[13px] leading-relaxed text-muted-foreground">
              {t(copy.approvalsNote)}
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {myApprovals.map((a) => (
                <li key={a.id} className="border border-border bg-card p-5 rounded-md">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded border border-border bg-secondary/50 text-bronze dark:text-gold">
                    <ShieldCheck className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold text-foreground">{t(a.name)}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {t(a.desc)}
                  </p>
                  {a.route ? (
                    <Link
                      to={a.route}
                      className="mt-4 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-[13px] font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                    >
                      {lang === "ar" ? "فتح شاشة المراجعة" : "Open review screen"}
                      <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  ) : (
                    <Link
                      to="/admin"
                      search={{ domain: a.admin!.domain, tab: a.admin!.tab }}
                      className="mt-4 inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-[13px] font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                    >
                      {lang === "ar" ? "فتح شاشة المراجعة" : "Open review screen"}
                      <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </>
  );
}
