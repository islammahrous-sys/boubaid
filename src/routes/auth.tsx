import { createFileRoute, useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ShieldCheck, UsersRound, Landmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/i18n/LanguageProvider";
import { getMyAccount } from "@/lib/account.functions";
import {
  TurnstileWidget,
  isTurnstileConfigured,
  type TurnstileWidgetHandle,
} from "@/components/site/TurnstileWidget";
import { verifyTurnstile } from "@/lib/turnstile.functions";
import { translateAuthError } from "@/lib/text";
import {
  requestPasswordReset,
  signUpWithBrandedVerification,
} from "@/lib/email/auth-email.functions";
import authManuscript from "@/assets/auth-manuscript.jpg";

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
function safeDestination(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_DESTINATION;
  const path = value.trim();
  if (!path.startsWith("/")) return DEFAULT_DESTINATION;
  if (path.startsWith("//") || path.startsWith("/\\")) return DEFAULT_DESTINATION;
  if (/^\/(auth|reset-password)(\/|\?|#|$)/.test(path)) return DEFAULT_DESTINATION;
  return path;
}

export const Route = createFileRoute("/auth")({
  ssr: false,
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
  const queryClient = useQueryClient();
  const fetchAccount = useServerFn(getMyAccount);
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const navigatingRef = useRef(false);
  const checkedSessionRef = useRef(false);

  // `/auth` has no `validateSearch`, so the router still exposes the parsed
  // query here — `?redirect=/admin` etc. — which `safeDestination` narrows to
  // a same-origin path before it is ever navigated to.
  const rawRedirect = useRouterState({
    select: (s) => (s.location.search as Record<string, unknown>).redirect,
  });
  const destination = safeDestination(rawRedirect);

  // Check on initial mount if the visitor already has an active session.
  // Guarded by checkedSessionRef and navigatingRef so it NEVER re-fires or
  // collides with an active form submission.
  useEffect(() => {
    if (checkedSessionRef.current) return;
    checkedSessionRef.current = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session && !navigatingRef.current) {
        navigatingRef.current = true;
        void navigate({ to: destination as any, replace: true });
      }
    });
  }, [destination, navigate]);

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
        const result = await requestPasswordReset({
          data: {
            email: email.trim().toLowerCase(),
            redirectTo: `${window.location.origin}/reset-password`,
            locale: lang === "en" ? "en" : "ar",
            turnstileToken: turnstileToken || undefined,
          },
        });
        if (!result.ok) {
          toast.error(
            label("تعذر إرسال رابط إعادة التعيين. يرجى المحاولة لاحقاً.", "Failed to send reset link. Please try again later.")
          );
          setBusy(false);
          return;
        }
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
        const result = await signUpWithBrandedVerification({
          data: {
            email: email.trim().toLowerCase(),
            password,
            fullName: fullName.trim(),
            redirectTo: `${window.location.origin}/auth`,
            locale: lang === "en" ? "en" : "ar",
            turnstileToken: turnstileToken || undefined,
          },
        });
        if (!result.ok) {
          if (result.error === "user_already_registered") {
            toast.error(
              label(
                "هذا البريد الإلكتروني مسجل مسبقاً. يرجى تسجيل الدخول.",
                "This email address is already registered. Please sign in.",
              ),
            );
          } else {
            toast.error(result.error || label("تعذر إنشاء الحساب.", "Failed to create account."));
          }
          setBusy(false);
          return;
        }
        toast.success(
          label(
            "تم إنشاء الحساب بنجاح. أرسلنا رسالة تأكيد رسمية إلى بريدك الإلكتروني.",
            "Account created successfully. A verification link has been sent to your email.",
          ),
        );
        setPassword("");
        switchMode("signin");
        setBusy(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) throw error;
        navigatingRef.current = true;
        try {
          await navigate({ to: destination as any, replace: true });
        } catch {
          window.location.replace(destination);
        }
        return;
      }
    } catch (error) {
      navigatingRef.current = false;
      // Pass the provider error itself: its `code` distinguishes an exhausted
      // confirmation-email quota from a genuine per-visitor attempt limit,
      // which the message text alone does not.
      toast.error(translateAuthError(error, lang));
      setBusy(false);
    }

  };

  const rise = (delay: number): React.CSSProperties => ({
    animationDelay: `${delay}ms`,
  });

  return (
    <div
      suppressHydrationWarning
      className="flex min-h-[calc(100vh-8rem)] items-center py-10 sm:py-14"
    >
      <section className="container-page w-full">
        <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-2xl border border-ink/10 bg-card shadow-[0_24px_80px_-24px_color-mix(in_oklab,var(--ink)_25%,transparent)] lg:min-h-[680px] lg:grid-cols-[5fr_7fr]">
          {/* ── Heritage panel ─────────────────────────────────────── */}
          <aside className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between">
            <img
              src={authManuscript}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover opacity-40"
              loading="lazy"
              width={1024}
              height={1280}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/40" />
            {/* Decorative gold ring */}
            <div
              aria-hidden
              className="absolute -bottom-24 -end-24 h-80 w-80 rounded-full border-[36px] border-gold/10"
            />

            <div className="relative z-10 p-10 xl:p-14">
              <div className="animate-fade-up opacity-0" style={rise(0)}>
                <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-ivory/20 bg-ivory/10 backdrop-blur-md transition-transform duration-500 hover:scale-105">
                  <img
                    src="/logo-mark-cream.svg"
                    alt={label("شعار مجلس أسرة آل بوعبيد", "Al Bu Obaid Family Council emblem")}
                    className="h-12 w-auto"
                  />
                </div>
                <h1 className="font-brand text-3xl font-bold leading-relaxed text-ivory">
                  {label("مجلس أسرة", "The Council of")}
                  <br />
                  <span className="text-gold">{label("آل بوعبيد", "Al Bu Obaid")}</span>
                </h1>
                <div aria-hidden className="mt-5 h-px w-14 bg-gold/70" />
              </div>

              <ul className="mt-14 space-y-8">
                {[
                  {
                    icon: ShieldCheck,
                    title: label("حساب موثّق ومعتمد", "A verified account"),
                    desc: label(
                      "تُعتمد العضوية من أمانة المجلس قبل تفعيل الوصول.",
                      "Membership is approved by the council secretariat before access.",
                    ),
                  },
                  {
                    icon: UsersRound,
                    title: label("حفظ الموروث العائلي", "Preserving the heritage"),
                    desc: label(
                      "دليل الأعضاء والفروع والمشجرة الموثّقة في مكان واحد.",
                      "The member directory, branches, and documented tree in one place.",
                    ),
                  },
                  {
                    icon: Landmark,
                    title: label("أمانة الصندوق", "Stewardship of the fund"),
                    desc: label(
                      "متابعة الاشتراكات ومساهمات صندوق التنمية بشفافية.",
                      "Track subscriptions and development-fund contributions transparently.",
                    ),
                  },
                ].map(({ icon: Icon, title, desc }, i) => (
                  <li
                    key={title}
                    className="flex items-start gap-4 animate-fade-up opacity-0"
                    style={rise(120 + i * 90)}
                  >
                    <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/15">
                      <Icon className="h-3.5 w-3.5 text-gold" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-[15px] font-semibold text-ivory">{title}</span>
                      <span className="mt-1 block text-[13px] leading-relaxed text-ivory/60">
                        {desc}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="relative z-10 p-10 pt-0 text-[11px] tracking-wide text-ivory/40 xl:px-14">
              {label(
                "سجلٌ عائلي واحد، وأمانةٌ واحدة، تُحفظ بها الصلة بين الفروع.",
                "One family register, one trust — keeping every branch connected.",
              )}
            </p>
          </aside>

          {/* ── Form panel ─────────────────────────────────────────── */}
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
            <div className="mx-auto w-full max-w-md">
              {mode !== "forgot" ? (
                <div
                  role="tablist"
                  aria-label={label("نوع الدخول", "Access mode")}
                  className="mb-10 grid grid-cols-2 gap-1 rounded-full border border-border bg-secondary/60 p-1.5 animate-fade-up opacity-0"
                  style={rise(0)}
                >
                  {(["signin", "signup"] as const).map((m) => (
                    <button
                      key={m}
                      role="tab"
                      aria-selected={mode === m}
                      type="button"
                      onClick={() => switchMode(m)}
                      className={`rounded-full py-2.5 text-[13px] font-semibold transition-all duration-300 ${
                        mode === m
                          ? "bg-card text-ink shadow-sm dark:text-gold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {m === "signin"
                        ? label("تسجيل الدخول", "Sign in")
                        : label("عضوية جديدة", "New membership")}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="mb-9 animate-fade-up opacity-0" style={rise(70)}>
                <p className="label-caps text-muted-foreground">
                  {label("الأمانة العامة — بوابة الأعضاء", "Secretariat — member portal")}
                </p>
                <h2 className="mt-3 font-naskh text-3xl font-bold text-ink dark:text-foreground">
                  {mode === "signin"
                    ? label("أهلاً بكم في داركم", "Welcome back")
                    : mode === "signup"
                      ? label("إنشاء حساب عضو", "Create a member account")
                      : label("استعادة كلمة المرور", "Reset your password")}
                </h2>
                <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
                  {mode === "signin"
                    ? label(
                        "أدخل بيانات الدخول للوصول إلى بوابة العائلة.",
                        "Enter your credentials to reach the family portal.",
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

              {mode === "forgot" && resetSent ? (
                <div className="space-y-5 animate-fade-up opacity-0" style={rise(140)}>
                  <p className="rounded-xl border border-border bg-secondary/40 p-4 text-[13px] leading-relaxed text-foreground">
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
                <form
                  method="post"
                  action="#"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void onSubmit(e);
                  }}
                  className="space-y-5"
                >
                  <div className="space-y-5 animate-fade-up opacity-0" style={rise(140)}>
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
                      placeholder="name@example.com"
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
                        labelTrailing={
                          mode === "signin" ? (
                            <button
                              type="button"
                              onClick={() => switchMode("forgot")}
                              className="text-[12px] font-medium text-bronze underline decoration-gold/50 underline-offset-4 transition-colors hover:text-ink hover:decoration-gold dark:hover:text-gold"
                            >
                              {label("نسيت كلمة المرور؟", "Forgot password?")}
                            </button>
                          ) : undefined
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
                  </div>

                  {mode === "signup" ? (
                    <div className="animate-fade-up opacity-0" style={rise(210)}>
                      <TurnstileWidget ref={turnstileRef} onToken={setTurnstileToken} />
                    </div>
                  ) : null}

                  <div className="animate-fade-up opacity-0" style={rise(280)}>
                    <button
                      type="submit"
                      disabled={busy}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3.5 text-[14px] font-bold text-ink shadow-[0_12px_24px_-10px_color-mix(in_oklab,var(--gold)_60%,transparent)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 active:scale-[0.99] disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                      {busy
                        ? label("جارٍ المعالجة…", "Working…")
                        : mode === "signin"
                          ? label("دخول البوابة", "Enter the portal")
                          : mode === "signup"
                            ? label("إنشاء الحساب", "Create account")
                            : label("إرسال رابط الاستعادة", "Send reset link")}
                    </button>
                  </div>
                </form>
              )}

              <div
                className="mt-10 border-t border-border pt-6 text-center text-[12px] leading-relaxed text-muted-foreground animate-fade-up opacity-0"
                style={rise(350)}
              >
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
                      className="font-semibold text-ink underline decoration-gold/60 underline-offset-4 hover:decoration-gold dark:text-gold"
                    >
                      {mode === "signin"
                        ? label("أنشئ حساباً جديداً", "Create one")
                        : label("سجّل الدخول", "Sign in")}
                    </button>
                  </p>
                )}
                <p className="mt-3">
                  {label("تواجه مشكلة في الدخول؟ ", "Trouble signing in? ")}
                  <Link
                    to="/contact"
                    className="font-medium text-foreground underline decoration-gold/60 underline-offset-4 hover:decoration-gold"
                  >
                    {label("تواصل مع الأمانة", "Contact the secretariat")}
                  </Link>
                </p>
              </div>
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
  placeholder,
  trailing,
  labelTrailing,
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
  placeholder?: string;
  trailing?: React.ReactNode;
  labelTrailing?: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-semibold text-foreground">
          {label}
        </label>
        {labelTrailing}
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 transition-all duration-200 focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/25">
        <input
          id={id}
          type={type}
          dir={dir}
          required={required}
          autoComplete={autoComplete}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
        />
        {trailing}
      </div>
      {hint ? <p className="mt-1.5 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
