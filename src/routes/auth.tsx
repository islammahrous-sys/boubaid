import { createFileRoute, useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ShieldCheck, UsersRound, Landmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import {
  TurnstileWidget,
  isTurnstileConfigured,
  type TurnstileWidgetHandle,
} from "@/components/site/TurnstileWidget";
import { verifyTurnstile } from "@/lib/turnstile.functions";
import { translateAuthError } from "@/lib/text";
import heroManuscript from "@/assets/hero-manuscript.jpg";

/** Where a member lands after signing in when no destination was requested. */
const DEFAULT_DESTINATION = "/account";

/**
 * `/_authenticated` sends members here with `?redirect=<path>` so they resume
 * whatever page they originally asked for. That value arrives from the URL, so
 * it is attacker-controlled: only a same-origin absolute path is ever honoured.
 * Anything else — an absolute `https://evil.example`, a protocol-relative
 * `//evil.example`, or the `/\evil.example` variant browsers normalise to the
 * same thing — is discarded so this form can never become an open redirect.
 * `/auth` and `/reset-password` are rejected too, since sending a freshly
 * signed-in member back to the sign-in screen just loops.
 */
export function safeDestination(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_DESTINATION;
  const path = value.trim();
  if (!path.startsWith("/")) return DEFAULT_DESTINATION;
  if (path.startsWith("//") || path.startsWith("/\\")) return DEFAULT_DESTINATION;
  if (/^\/(auth|reset-password)(\/|\?|#|$)/.test(path)) return DEFAULT_DESTINATION;
  return path;
}

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "دخول الأعضاء | آل بوعبيد" },
      {
        name: "description",
        content:
          "بوابة دخول أعضاء أسرة آل بوعبيد — تسجيل الدخول أو إنشاء حساب لطلب العضوية في صندوق التنمية العائلية.",
      },
      { property: "og:title", content: "دخول الأعضاء | آل بوعبيد" },
      {
        property: "og:description",
        content: "تسجيل الدخول أو إنشاء حساب لطلب عضوية صندوق التنمية العائلية.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);

  // `/auth` has no `validateSearch`, so the router still exposes the parsed
  // query here — `?redirect=/admin` etc. — which `safeDestination` narrows to
  // a same-origin path before it is ever navigated to.
  const rawRedirect = useRouterState({
    select: (s) => (s.location.search as Record<string, unknown>).redirect,
  });
  const destination = safeDestination(rawRedirect);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: destination as any });
    });
  }, [navigate, destination]);

  const label = (ar: string, en: string) => (lang === "ar" ? ar : en);

  const switchMode = (next: "signin" | "signup" | "forgot") => {
    setMode(next);
    // Turnstile tokens are single-use and bound to the widget instance that
    // issued them; leaving a stale one behind makes the next sign-up fail
    // verification for no visible reason.
    setTurnstileToken("");
    turnstileRef.current?.reset();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Guards the Enter-key path: a disabled button stops repeat clicks, but
    // not a second implicit submit fired while the first is still in flight.
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setResetSent(true);
        toast.success(
          label(
            "إذا كان البريد مسجلاً لدينا، فستصلك رسالة تحتوي رابط إعادة تعيين كلمة المرور.",
            "If that email is registered, a password reset link is on its way.",
          ),
        );
      } else if (mode === "signup") {
        // The hint under the field promises eight characters and
        // /reset-password enforces exactly that, so check it here too rather
        // than letting Supabase's shorter project minimum quietly accept less.
        if (password.length < 8) {
          toast.error(
            label("كلمة المرور يجب ألا تقل عن ٨ أحرف.", "Password must be at least 8 characters."),
          );
          setBusy(false);
          return;
        }
        if (isTurnstileConfigured) {
          const verification = await verifyTurnstile({ data: { token: turnstileToken } });
          if (!verification.ok) {
            toast.error(
              label(
                "تعذر التحقق من أنك لست روبوتاً. حاول مرة أخرى.",
                "We couldn't verify you're not a robot. Please try again.",
              ),
            );
            // The token was just spent; without a fresh challenge every retry
            // would fail verification the same way.
            setTurnstileToken("");
            turnstileRef.current?.reset();
            setBusy(false);
            return;
          }
        }
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { full_name_ar: fullName.trim() },
          },
        });
        if (error) throw error;
        // With email confirmation required (the current project setting)
        // Supabase returns no session and the member has to click the link.
        // If confirmation is ever switched off, sign-up returns a live session
        // and telling them to check an inbox that will stay empty is wrong.
        if (data.session) {
          await navigate({ href: destination });
          return;
        }
        toast.success(
          label(
            "تم إنشاء الحساب. تحقق من بريدك لتأكيد العنوان.",
            "Account created. Check your inbox to confirm your address.",
          ),
        );
        setPassword("");
        switchMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) throw error;
        await navigate({ href: destination });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : undefined;
      toast.error(translateAuthError(message, lang));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow={label("بوابة الأعضاء", "Member portal")}
        title={label("دخول الأعضاء", "Member sign-in")}
        subtitle={label(
          "الدخول مخصص لأفراد الأسرة. بعد إنشاء الحساب يُقدَّم طلب العضوية ويُعتمد من أمانة المجلس.",
          "Access is for family members. After creating an account you submit a membership request for the council secretariat to approve.",
        )}
      />

      <section className="container-page mt-12 reveal-fade">
        <div className="mx-auto grid max-w-5xl overflow-hidden border border-border bg-card lg:grid-cols-[1.05fr_1fr]">
          {/* Brand panel */}
          <aside className="relative hidden min-h-[560px] lg:block">
            <img
              src={heroManuscript}
              alt={label(
                "مخطوطة تاريخية من أرشيف أسرة آل بوعبيد",
                "A historic manuscript from the Al Bu Obaid family archive",
              )}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/80 to-ink/50" />
            <div className="relative flex h-full flex-col justify-between p-10 text-ivory">
              <img
                src="/logo-mark-cream.svg"
                alt={label("شعار مجلس أسرة آل بوعبيد", "Al Bu Obaid Family Council emblem")}
                className="h-14 w-auto opacity-95"
              />
              <div className="space-y-6">
                <h2 className="font-naskh text-2xl leading-relaxed text-ivory/95">
                  {label(
                    "سجلٌ عائلي واحد، وأمانةٌ واحدة، تُحفظ بها الصلة بين الفروع.",
                    "One family register, one trust — keeping every branch connected.",
                  )}
                </h2>
                <ul className="space-y-4 text-[13px] text-ivory/80">
                  {[
                    {
                      icon: ShieldCheck,
                      text: label(
                        "حساب موثّق ومعتمد من أمانة المجلس",
                        "Account verified by the council secretariat",
                      ),
                    },
                    {
                      icon: UsersRound,
                      text: label(
                        "دليل الأعضاء والفروع والمشجرة الموثّقة",
                        "Member directory, branches and the documented tree",
                      ),
                    },
                    {
                      icon: Landmark,
                      text: label(
                        "متابعة الاشتراكات ومساهمات الصندوق",
                        "Track subscriptions and fund contributions",
                      ),
                    },
                  ].map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                      <span className="leading-relaxed">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Form panel */}
          <div className="p-4 sm:p-8 md:p-10">
            <div className="mb-8">
              <p className="label-caps text-muted-foreground">
                {label("الأمانة العامة — بوابة الأعضاء", "Secretariat — member portal")}
              </p>
              <h1 className="mt-2 font-naskh text-2xl text-foreground">
                {mode === "signin"
                  ? label("مرحباً بعودتك", "Welcome back")
                  : mode === "signup"
                    ? label("إنشاء حساب عضو", "Create a member account")
                    : label("استعادة كلمة المرور", "Reset your password")}
              </h1>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                {mode === "signin"
                  ? label(
                      "أدخل بيانات حسابك للوصول إلى خدمات الأسرة.",
                      "Enter your credentials to reach the family services.",
                    )
                  : mode === "signup"
                    ? label(
                        "سجّل بياناتك، ثم قدّم طلب العضوية لاعتماده من الأمانة.",
                        "Register your details, then submit a membership request for approval.",
                      )
                    : label(
                        "أدخل بريدك الإلكتروني وسنرسل لك رابطاً آمناً لتعيين كلمة مرور جديدة.",
                        "Enter your email and we'll send you a secure link to set a new password.",
                      )}
              </p>
            </div>

            {mode !== "forgot" ? (
              <div
                role="tablist"
                aria-label={label("نوع الدخول", "Access mode")}
                className="mb-7 grid grid-cols-2 border border-border p-1"
              >
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    role="tab"
                    aria-selected={mode === m}
                    type="button"
                    onClick={() => switchMode(m)}
                    className={`py-2 text-[13px] font-medium transition-all duration-300 ${
                      mode === m
                        ? "bg-ink text-ivory shadow-sm dark:bg-gold dark:text-ink"
                        : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {m === "signin"
                      ? label("تسجيل الدخول", "Sign in")
                      : label("حساب جديد", "Create account")}
                  </button>
                ))}
              </div>
            ) : null}

            {mode === "forgot" && resetSent ? (
              <div className="space-y-5">
                <p className="border border-border bg-secondary/40 p-4 text-[13px] leading-relaxed text-foreground">
                  {label(
                    "إذا كان البريد مسجلاً لدينا، فستصلك رسالة تحتوي رابط إعادة تعيين كلمة المرور خلال دقائق.",
                    "If that email is registered, a password reset link should arrive within a few minutes.",
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    switchMode("signin");
                    setResetSent(false);
                  }}
                  className="font-medium text-foreground underline decoration-gold/60 underline-offset-4 hover:decoration-gold"
                >
                  {label("العودة لتسجيل الدخول", "Back to sign in")}
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                {mode === "signup" ? (
                  <Field
                    id="full-name"
                    label={label("الاسم الكامل (بالعربية)", "Full name (Arabic)")}
                    value={fullName}
                    onChange={setFullName}
                    autoComplete="name"
                    required
                  />
                ) : null}
                <Field
                  id="email"
                  type="email"
                  label={label("البريد الإلكتروني", "Email")}
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                  dir="ltr"
                  required
                />
                {mode !== "forgot" ? (
                  <Field
                    id="password"
                    type={showPassword ? "text" : "password"}
                    label={label("كلمة المرور", "Password")}
                    value={password}
                    onChange={setPassword}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    dir="ltr"
                    required
                    hint={
                      mode === "signup"
                        ? label("٨ أحرف على الأقل.", "At least 8 characters.")
                        : undefined
                    }
                    trailing={
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={
                          showPassword
                            ? label("إخفاء كلمة المرور", "Hide password")
                            : label("إظهار كلمة المرور", "Show password")
                        }
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    }
                  />
                ) : null}

                {mode === "signin" ? (
                  <div className="flex justify-end -mt-2">
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="text-[12px] font-medium text-muted-foreground underline decoration-gold/60 underline-offset-4 hover:text-foreground hover:decoration-gold"
                    >
                      {label("نسيت كلمة المرور؟", "Forgot password?")}
                    </button>
                  </div>
                ) : null}

                {mode === "signup" ? (
                  <TurnstileWidget ref={turnstileRef} onToken={setTurnstileToken} />
                ) : null}

                <button
                  type="submit"
                  disabled={busy}
                  className="flex w-full items-center justify-center gap-2 border border-gold bg-gold px-4 py-3 text-[13px] font-bold text-ink transition-colors hover:bg-transparent hover:text-gold disabled:opacity-60"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                  {busy
                    ? label("جارٍ المعالجة…", "Working…")
                    : mode === "signin"
                      ? label("دخول", "Sign in")
                      : mode === "signup"
                        ? label("إنشاء الحساب", "Create account")
                        : label("إرسال رابط الاستعادة", "Send reset link")}
                </button>
              </form>
            )}

            <div className="mt-7 border-t border-border pt-5 text-center text-[12px] leading-relaxed text-muted-foreground">
              {mode === "forgot" ? (
                !resetSent ? (
                  <p>
                    <button
                      type="button"
                      onClick={() => switchMode("signin")}
                      className="font-medium text-foreground underline decoration-gold/60 underline-offset-4 hover:decoration-gold"
                    >
                      {label("العودة لتسجيل الدخول", "Back to sign in")}
                    </button>
                  </p>
                ) : null
              ) : (
                <p>
                  {mode === "signin"
                    ? label("ليس لديك حساب؟ ", "No account yet? ")
                    : label("لديك حساب بالفعل؟ ", "Already registered? ")}
                  <button
                    type="button"
                    onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
                    className="font-medium text-foreground underline decoration-gold/60 underline-offset-4 hover:decoration-gold"
                  >
                    {mode === "signin"
                      ? label("أنشئ حساباً جديداً", "Create one")
                      : label("سجّل الدخول", "Sign in")}
                  </button>
                </p>
              )}
              <p className="mt-3">
                <Link to="/contact" className="underline hover:text-foreground">
                  {label("تحتاج مساعدة؟ اتصل بالأمانة", "Need help? Contact the secretariat")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
  autoComplete,
  dir,
  hint,
  trailing,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  dir?: "ltr" | "rtl";
  hint?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="label-caps mb-1.5 block text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center gap-2 border border-border bg-background px-3 transition-colors focus-within:border-gold">
        <input
          id={id}
          type={type}
          dir={dir}
          required={required}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        {trailing}
      </div>
      {hint ? <p className="mt-1.5 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
