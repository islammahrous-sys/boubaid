import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "تعيين كلمة مرور جديدة | آل بوعبيد" },
      {
        name: "description",
        content: "تعيين كلمة مرور جديدة لحساب بوابة أعضاء أسرة آل بوعبيد.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const label = (ar: string, en: string) => (lang === "ar" ? ar : en);

  // A visitor lands here only via the link in a password-reset email. Supabase's
  // client library exchanges the recovery tokens embedded in the URL for a
  // session automatically and fires PASSWORD_RECOVERY — that (or an
  // already-established session, in case the event fired before this
  // listener attached) is what unlocks the "set new password" form below.
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
        setChecking(false);
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) setReady(true);
      setChecking(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error(label("كلمة المرور يجب ألا تقل عن ٨ أحرف.", "Password must be at least 8 characters."));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(label("كلمتا المرور غير متطابقتين.", "Passwords do not match."));
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      toast.success(label("تم تحديث كلمة المرور بنجاح.", "Password updated successfully."));
      window.setTimeout(() => {
        void navigate({ to: "/account" });
      }, 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      toast.error(
        message || label("تعذر تحديث كلمة المرور. حاول مرة أخرى.", "Could not update the password. Please try again."),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow={label("بوابة الأعضاء", "Member portal")}
        title={label("تعيين كلمة مرور جديدة", "Set a new password")}
        subtitle={label(
          "أدخل كلمة مرور جديدة وقوية لحسابك في بوابة الأعضاء.",
          "Choose a new, strong password for your member account.",
        )}
      />

      <section className="container-page mt-12 reveal-fade">
        <div className="mx-auto max-w-md border border-border bg-card p-6 sm:p-10">
          {checking ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {label("جارٍ التحقق من الرابط…", "Checking your link…")}
            </div>
          ) : !ready ? (
            <div className="space-y-5 text-center">
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {label(
                  "رابط إعادة التعيين غير صالح أو منتهي الصلاحية. يمكنك طلب رابط جديد من صفحة الدخول.",
                  "This reset link is invalid or has expired. You can request a new one from the sign-in page.",
                )}
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center border border-gold bg-gold px-4 py-2.5 text-[13px] font-bold text-ink transition-colors hover:bg-transparent hover:text-gold"
              >
                {label("العودة لتسجيل الدخول", "Back to sign in")}
              </Link>
            </div>
          ) : done ? (
            <div className="space-y-3 text-center">
              <KeyRound className="mx-auto h-8 w-8 text-gold" aria-hidden />
              <p className="text-[13px] leading-relaxed text-foreground">
                {label(
                  "تم تحديث كلمة المرور. سيتم تحويلك إلى حسابك الآن…",
                  "Password updated. Redirecting you to your account…",
                )}
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <Field
                id="new-password"
                type={showPassword ? "text" : "password"}
                label={label("كلمة المرور الجديدة", "New password")}
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
                dir="ltr"
                required
                hint={label("٨ أحرف على الأقل.", "At least 8 characters.")}
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
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
              <Field
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                label={label("تأكيد كلمة المرور", "Confirm password")}
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
                dir="ltr"
                required
              />
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 border border-gold bg-gold px-4 py-3 text-[13px] font-bold text-ink transition-colors hover:bg-transparent hover:text-gold disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                {busy ? label("جارٍ الحفظ…", "Saving…") : label("حفظ كلمة المرور", "Save password")}
              </button>
            </form>
          )}
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
