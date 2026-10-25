import { Link, useRouteContext, useRouterState } from "@tanstack/react-router";
import { Clock, Crown, Lock, LogIn, UserPlus } from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/i18n/LanguageProvider";
import { getMyAccess, type MyAccess } from "@/lib/page-access.functions";
import type { AccessLevel } from "@/lib/page-access";

export type PageAccessResult =
  | { allowed: true; level: AccessLevel }
  | {
      allowed: false;
      level: AccessLevel;
      reason: "signed_out" | "pending" | "not_member" | "not_leadership" | "error";
    };

/**
 * Decides, before a restricted page loads any data, whether this visitor may
 * see it. Used from a route's `beforeLoad` (those routes are `ssr: false`, so
 * this always runs in the browser where the session lives). The decision
 * itself comes from the server (`getMyAccess`); the browser only knows
 * whether a session exists.
 */
export async function resolvePageAccess(level: AccessLevel): Promise<PageAccessResult> {
  if (level === "public") return { allowed: true, level };
  const { data } = await supabase.auth.getSession();
  if (!data.session) return { allowed: false, level, reason: "signed_out" };
  let access: MyAccess;
  try {
    access = await getMyAccess();
  } catch {
    // Only call it "signed out" when the session really is invalid; a valid
    // session with a failing check is a temporary error, not a sign-in problem
    // (sending a signed-in member back to sign-in loops them away).
    const { data: user } = await supabase.auth.getUser();
    return { allowed: false, level, reason: user?.user ? "error" : "signed_out" };
  }
  if (level === "leadership") {
    return access.leadership
      ? { allowed: true, level }
      : { allowed: false, level, reason: access.member ? "not_leadership" : "not_member" };
  }
  if (access.member) return { allowed: true, level };
  return {
    allowed: false,
    level,
    reason: access.requestStatus === "pending" ? "pending" : "not_member",
  };
}

/**
 * Wraps a restricted route's page: shows the access screen when the route's
 * `beforeLoad` decided this visitor may not see it, otherwise the page.
 */
export function GatedPage({ title, children }: { title: { ar: string; en: string }; children: ReactNode }) {
  const { lang } = useLang();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const ctx = useRouteContext({ strict: false }) as { access?: PageAccessResult };
  if (ctx.access && !ctx.access.allowed) {
    return <AccessDenied result={ctx.access} title={title[lang]} redirectTo={pathname} />;
  }
  return <>{children}</>;
}

const btn =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-[14px] font-bold transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold active:translate-y-0";

/** Rendered in place of a restricted page the visitor may not open. */
export function AccessDenied({
  result,
  title,
  redirectTo,
}: {
  result: Extract<PageAccessResult, { allowed: false }>;
  title: string;
  redirectTo: string;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const L = (ar: string, en: string) => (isAr ? ar : en);

  const content: Record<typeof result.reason, { icon: ReactNode; heading: string; body: string }> = {
    signed_out: {
      icon: <Lock className="h-7 w-7 text-gold" aria-hidden />,
      heading: L("هذه الصفحة مخصصة لأفراد الأسرة المسجلين", "This page is for registered family members"),
      body: L(
        "سجّل الدخول بحسابك المعتمد للاطلاع عليها. وإن لم يكن لديك حساب، أنشئ حساباً وقدّم طلب العضوية ليعتمده مجلس الأسرة.",
        "Sign in with your approved account to view it. If you don't have one, create an account and submit a membership request for the council to approve.",
      ),
    },
    pending: {
      icon: <Clock className="h-7 w-7 text-gold" aria-hidden />,
      heading: L("طلب عضويتك قيد المراجعة", "Your membership request is under review"),
      body: L(
        "ستُتاح لك هذه الصفحة فور اعتماد أمانة المجلس لطلبك، وسيصلك إشعار وبريد إلكتروني بالقرار.",
        "This page opens to you as soon as the council secretariat approves your request; you'll get a notification and an email with the decision.",
      ),
    },
    not_member: {
      icon: <UserPlus className="h-7 w-7 text-gold" aria-hidden />,
      heading: L("يلزم اعتماد العضوية", "Approved membership required"),
      body: L(
        "هذه الصفحة متاحة للأعضاء المعتمدين فقط. قدّم طلب العضوية من صفحة حسابك ليراجعه مجلس الأسرة.",
        "This page is available to approved members only. Submit a membership request from your account page for the council to review.",
      ),
    },
    error: {
      icon: <Clock className="h-7 w-7 text-gold" aria-hidden />,
      heading: L("تعذر التحقق من صلاحيتك الآن", "We couldn't check your access just now"),
      body: L(
        "أنت مسجل الدخول، لكن تعذر التحقق من العضوية مؤقتاً. أعد المحاولة بعد لحظات، وإن تكرر ذلك فتواصل مع الأمانة.",
        "You're signed in, but your membership couldn't be checked right now. Try again in a moment; if it keeps happening, contact the secretariat.",
      ),
    },
    not_leadership: {
      icon: <Crown className="h-7 w-7 text-gold" aria-hidden />,
      heading: L("صفحة مخصصة لرئيس المجلس ورؤساء اللجان", "Reserved for the council chair and committee chairs"),
      body: L(
        "الاطلاع على الهوية البصرية مقصور على رئيس مجلس الأسرة ورؤساء اللجان. إن كنت منهم، اطلب من أمانة المجلس إضافة حسابك.",
        "The visual identity is restricted to the council chair and committee chairs. If you are one of them, ask the secretariat to add your account.",
      ),
    },
  };
  const c = content[result.reason];

  return (
    <section className="container-page flex min-h-[60vh] items-center py-16">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-border bg-card p-8 text-center shadow-[0_24px_60px_-30px_color-mix(in_oklab,var(--ink)_30%,transparent)] sm:p-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-ink">{c.icon}</div>
        <p className="label-caps text-muted-foreground">{title}</p>
        <h1 className="mt-3 font-naskh text-2xl font-bold tracking-[-0.02em] text-ink dark:text-foreground">
          {c.heading}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[14px] leading-[1.8] text-muted-foreground">{c.body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {result.reason === "signed_out" ? (
            <>
              <Link
                to="/auth"
                search={{ redirect: redirectTo } as never}
                className={`${btn} bg-gold text-ink`}
              >
                <LogIn className="h-4 w-4" aria-hidden />
                {L("تسجيل الدخول", "Sign in")}
              </Link>
              <Link to="/auth" className={`${btn} border border-border bg-background text-foreground`}>
                <UserPlus className="h-4 w-4" aria-hidden />
                {L("عضوية جديدة", "New membership")}
              </Link>
            </>
          ) : result.reason === "error" ? (
            <button type="button" onClick={() => window.location.reload()} className={`${btn} bg-gold text-ink`}>
              {L("إعادة المحاولة", "Try again")}
            </button>
          ) : result.reason === "not_member" ? (
            <Link to="/account" className={`${btn} bg-gold text-ink`}>
              {L("الانتقال إلى حسابي", "Go to my account")}
            </Link>
          ) : (
            <Link to="/" className={`${btn} border border-border bg-background text-foreground`}>
              {L("العودة إلى الرئيسية", "Back to home")}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
