import { Link } from "@tanstack/react-router";
import { ShieldCheck, Upload } from "lucide-react";
import type { ReactNode } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { LEGAL_VERSION, OPTIONAL_CONSENTS, type OptionalConsentKey } from "@/content/legal";
import { cn } from "@/lib/utils";

const linkClass =
  "font-semibold text-bronze underline decoration-gold/60 underline-offset-4 hover:text-ink hover:decoration-gold focus-visible:outline-2 focus-visible:outline-gold dark:text-gold";

/** Opens in a new tab so a half-filled form is never lost. */
function DocLink({ to, children }: { to: "/terms" | "/privacy"; children: ReactNode }) {
  return (
    <Link to={to} target="_blank" rel="noopener" className={linkClass}>
      {children}
    </Link>
  );
}

/** Native checkbox — always rendered unchecked until the person ticks it. */
export function ConsentCheckbox({
  id,
  checked,
  onChange,
  required,
  children,
  tone = "light",
}: {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  required?: boolean;
  children: ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        required={required}
        aria-required={required}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[var(--gold)]"
      />
      <label
        htmlFor={id}
        className={cn(
          "cursor-pointer text-[12.5px] leading-relaxed",
          tone === "dark" ? "text-ivory/70" : "text-foreground/85",
        )}
      >
        {children}
      </label>
    </div>
  );
}

/** "I have read and agree to the Terms of Use and Disclaimer" — required at sign-up. */
export function TermsConsentLabel() {
  const { lang } = useLang();
  return lang === "ar" ? (
    <>
      قرأت <DocLink to="/terms">شروط الاستخدام وإخلاء المسؤولية</DocLink> و
      <DocLink to="/privacy">سياسة الخصوصية وحماية البيانات الشخصية</DocLink> وأوافق عليها.{" "}
      <span className="text-muted-foreground">(الإصدار {LEGAL_VERSION})</span>
    </>
  ) : (
    <>
      I have read and agree to the <DocLink to="/terms">Terms of Use and Disclaimer</DocLink> and
      the <DocLink to="/privacy">Privacy Policy and Personal Data Protection</DocLink>.{" "}
      <span className="text-muted-foreground">(version {LEGAL_VERSION})</span>
    </>
  );
}

export function OptionalConsentLabel({ kind }: { kind: OptionalConsentKey }) {
  const { t } = useLang();
  return <>{t(OPTIONAL_CONSENTS[kind])}</>;
}

/** One-line privacy notice placed beside the submit button of any data form. */
export function PrivacyNotice({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const { lang } = useLang();
  return (
    <p
      className={cn(
        "flex items-start gap-2 text-[11.5px] leading-relaxed",
        tone === "dark" ? "text-ivory/50" : "text-muted-foreground",
        className,
      )}
    >
      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/80" aria-hidden />
      <span>
        {lang === "ar" ? (
          <>
            تُعالج بياناتك لغرض هذا الطلب فقط وفق{" "}
            <DocLink to="/privacy">سياسة الخصوصية وحماية البيانات الشخصية</DocLink>.
          </>
        ) : (
          <>
            Your data is processed for this request only, under our{" "}
            <DocLink to="/privacy">Privacy Policy and Personal Data Protection</DocLink>.
          </>
        )}
      </span>
    </p>
  );
}

/** Shown next to every image/document upload control. */
export function UploadRightsNotice({ className }: { className?: string }) {
  const { lang } = useLang();
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-lg border border-gold/25 bg-gold/5 px-3 py-2 text-[11.5px] leading-relaxed text-muted-foreground",
        className,
      )}
    >
      <Upload className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bronze dark:text-gold" aria-hidden />
      <span>
        {lang === "ar" ? (
          <>
            برفعك للملف تقر بأنك تملك حقوقه أو حصلت على الأذونات اللازمة، بما فيها موافقة الأشخاص
            الظاهرين فيه أو أولياء القاصرين، وأنك المسؤول عن ذلك.{" "}
            <Link to="/contact" search={{ topic: "report" } as never} className={linkClass}>
              الإبلاغ عن محتوى
            </Link>
          </>
        ) : (
          <>
            By uploading, you confirm you own the rights or hold the necessary permissions —
            including consent from the people shown or minors’ guardians — and you are responsible
            for this.{" "}
            <Link to="/contact" search={{ topic: "report" } as never} className={linkClass}>
              Report content
            </Link>
          </>
        )}
      </span>
    </p>
  );
}
