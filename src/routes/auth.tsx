import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ShieldCheck, UsersRound, Landmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/i18n/LanguageProvider";
import { PageHeader } from "@/components/site/PageHeader";
import heroManuscript from "@/assets/hero-manuscript.jpg";


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
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/account" });
    });
  }, [navigate]);

  const label = (ar: string, en: string) => (lang === "ar" ? ar : en);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { full_name_ar: fullName.trim() },
          },
        });
        if (error) throw error;
        toast.success(
          label(
            "تم إنشاء الحساب. تحقق من بريدك لتأكيد العنوان.",
            "Account created. Check your inbox to confirm your address.",
          ),
        );
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) throw error;
        await navigate({ to: "/account" });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      toast.error(
        message ||
          label("تعذر إكمال الطلب. حاول مرة أخرى.", "We couldn't complete that. Please try again."),
      );
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

      <section className="container-page mt-12 max-w-md reveal-fade">
        <div className="border border-border bg-card p-6">
          <div className="mb-6 grid grid-cols-2 border border-border">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`py-2 text-[13px] font-medium transition-colors ${
                  mode === m
                    ? "bg-ink text-ivory dark:bg-gold dark:text-ink"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {m === "signin"
                  ? label("تسجيل الدخول", "Sign in")
                  : label("حساب جديد", "Create account")}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" ? (
              <Field
                id="full-name"
                label={label("الاسم الكامل (بالعربية)", "Full name (Arabic)")}
                value={fullName}
                onChange={setFullName}
                required
              />
            ) : null}
            <Field
              id="email"
              type="email"
              label={label("البريد الإلكتروني", "Email")}
              value={email}
              onChange={setEmail}
              required
            />
            <Field
              id="password"
              type="password"
              label={label("كلمة المرور", "Password")}
              value={password}
              onChange={setPassword}
              required
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full border border-gold bg-gold px-4 py-2.5 text-[13px] font-bold text-ink transition-colors hover:bg-transparent hover:text-gold disabled:opacity-60"
            >
              {busy
                ? label("جارٍ المعالجة…", "Working…")
                : mode === "signin"
                  ? label("دخول", "Sign in")
                  : label("إنشاء الحساب", "Create account")}
            </button>
          </form>

          <p className="mt-5 text-center text-[12px] text-muted-foreground">
            <Link to="/contact" className="underline hover:text-foreground">
              {label("تحتاج مساعدة؟ اتصل بالأمانة", "Need help? Contact the secretariat")}
            </Link>
          </p>
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
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="label-caps mb-1.5 block text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-gold"
      />
    </div>
  );
}
