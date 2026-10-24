import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Download, FileCheck2, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLang } from "@/i18n/LanguageProvider";
import {
  LEGAL_DOCUMENTS,
  LEGAL_VERSION,
  OPTIONAL_CONSENTS,
  REGISTRATION_ACKNOWLEDGEMENT,
  type OptionalConsentKey,
} from "@/content/legal";
import { acceptCurrentTerms, getMyConsents, setMyOptionalConsent } from "@/lib/consent.functions";
import { buildLegalDocumentHtml, downloadHtml } from "@/components/legal/LegalDocumentPage";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * "My agreements": the accepted terms version with its date and time, the two
 * optional consents (each withdrawable on its own), and a printable /
 * downloadable acceptance certificate that embeds the accepted text.
 */
export function MyAgreementsCard() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const queryClient = useQueryClient();
  const fetchConsents = useServerFn(getMyConsents);
  const setConsent = useServerFn(setMyOptionalConsent);
  const acceptTerms = useServerFn(acceptCurrentTerms);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["my-consents"],
    queryFn: () => fetchConsents(),
  });

  const toggle = useMutation({
    mutationFn: (v: { document: OptionalConsentKey; granted: boolean }) => setConsent({ data: v }),
    onSuccess: () => {
      toast.success(isAr ? "تم تحديث موافقتك وتسجيلها." : "Your consent was updated and recorded.");
      void queryClient.invalidateQueries({ queryKey: ["my-consents"] });
    },
    onError: () => toast.error(isAr ? "تعذر تحديث الموافقة." : "Could not update consent."),
  });

  const accept = useMutation({
    mutationFn: () => acceptTerms(),
    onSuccess: () => {
      toast.success(isAr ? "تم تسجيل موافقتك على الإصدار الحالي." : "Acceptance of the current version recorded.");
      void queryClient.invalidateQueries({ queryKey: ["my-consents"] });
    },
    onError: () => toast.error(isAr ? "تعذر تسجيل الموافقة." : "Could not record acceptance."),
  });

  const terms = data?.current.terms;
  const acceptedCurrent = terms?.granted && terms.version === LEGAL_VERSION;
  const when = (iso: string) =>
    new Date(iso).toLocaleString(isAr ? "ar-SA-u-ca-gregory" : "en-GB", {
      dateStyle: "long",
      timeStyle: "medium",
      timeZone: "Asia/Riyadh",
    }) + (isAr ? " (بتوقيت الرياض)" : " (Riyadh time)");

  const certificateHtml = () => {
    if (!terms) return "";
    const rows = (["terms", "privacy", "marketing", "media_publication"] as const)
      .map((key) => {
        const c = data?.current[key];
        const name =
          key === "terms" || key === "privacy"
            ? LEGAL_DOCUMENTS[key].title[lang]
            : OPTIONAL_CONSENTS[key][lang];
        const state = !c
          ? isAr ? "لم تُسجَّل" : "Not recorded"
          : c.granted
            ? isAr ? "موافق" : "Granted"
            : isAr ? "غير موافق / مسحوبة" : "Not given / withdrawn";
        return `<tr><td>${escapeHtml(name)}</td><td>${state}</td><td>${c ? escapeHtml(c.version) : "—"}</td><td>${c ? escapeHtml(when(c.accepted_at)) : "—"}</td></tr>`;
      })
      .join("");
    const box = `<div class="box"><h2>${isAr ? "شهادة القبول الإلكتروني" : "Electronic acceptance certificate"}</h2><p>${isAr ? "الحساب" : "Account"}: <strong>${escapeHtml(data?.email ?? "")}</strong></p><p>${escapeHtml(REGISTRATION_ACKNOWLEDGEMENT[lang])}</p><table border="1" cellpadding="6" style="border-collapse:collapse;width:100%;font-size:.85rem"><tr><th>${isAr ? "الوثيقة / الموافقة" : "Document / consent"}</th><th>${isAr ? "الحالة" : "Status"}</th><th>${isAr ? "الإصدار" : "Version"}</th><th>${isAr ? "التاريخ والوقت" : "Date & time"}</th></tr>${rows}</table></div>`;
    return buildLegalDocumentHtml("terms", lang, box);
  };

  const printCertificate = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(certificateHtml());
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <Card className="border-border bg-card rounded-2xl shadow-sm">
      <CardHeader className="border-b border-border/50 pb-4">
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-primary" />
          {isAr ? "اتفاقياتي وموافقاتي" : "My agreements & consents"}
        </CardTitle>
        <CardDescription className="text-xs">
          {isAr
            ? "سجل موافقتك على الشروط وسياسة الخصوصية، والموافقات الاختيارية التي يمكنك سحبها في أي وقت."
            : "Your acceptance of the terms and privacy policy, and optional consents you can withdraw at any time."}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-5 text-xs">
        {isLoading ? (
          <div className="h-20 rounded-lg bg-muted animate-pulse" aria-busy="true" />
        ) : isError ? (
          <Button variant="outline" size="sm" onClick={() => void refetch()} className="text-xs">
            {isAr ? "تعذر التحميل — إعادة المحاولة" : "Failed to load — retry"}
          </Button>
        ) : (
          <>
            <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-2">
              <p className="font-semibold text-foreground">
                <Link to="/terms" className="underline decoration-gold/60 underline-offset-4 hover:decoration-gold">
                  {LEGAL_DOCUMENTS.terms.title[lang]}
                </Link>
              </p>
              {terms?.granted ? (
                <p className="text-muted-foreground leading-relaxed">
                  {isAr ? "وافقت على الإصدار" : "You accepted version"}{" "}
                  <strong className="text-foreground">{terms.version}</strong>{" "}
                  {isAr ? "في" : "on"} <strong className="text-foreground">{when(terms.accepted_at)}</strong>.
                </p>
              ) : null}
              {!acceptedCurrent ? (
                <div className="space-y-2 pt-1">
                  <p className="text-amber-700 dark:text-amber-400 leading-relaxed">
                    {terms?.granted
                      ? isAr
                        ? `صدر إصدار أحدث (${LEGAL_VERSION}). يرجى مراجعته والموافقة عليه.`
                        : `A newer version (${LEGAL_VERSION}) is in effect. Please review and accept it.`
                      : isAr
                        ? "لا توجد موافقة مسجلة على الشروط الحالية لحسابك. يرجى مراجعتها والموافقة عليها."
                        : "No acceptance of the current terms is on record for your account. Please review and accept them."}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => accept.mutate()}
                    disabled={accept.isPending}
                    className="h-8 text-xs font-bold"
                  >
                    {accept.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    {isAr
                      ? `قرأت الشروط وسياسة الخصوصية (الإصدار ${LEGAL_VERSION}) وأوافق عليها`
                      : `I have read and accept the terms and privacy policy (v${LEGAL_VERSION})`}
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="space-y-3">
              {(Object.keys(OPTIONAL_CONSENTS) as OptionalConsentKey[]).map((key) => {
                const c = data?.current[key];
                return (
                  <div key={key} className="flex items-start justify-between gap-4 rounded-xl border border-border p-3.5">
                    <div className="space-y-1">
                      <p className="leading-relaxed text-foreground">{OPTIONAL_CONSENTS[key][lang]}</p>
                      {c ? (
                        <p className="text-[11px] text-muted-foreground">
                          {c.granted ? (isAr ? "منحت في " : "Granted on ") : isAr ? "آخر تحديث " : "Last updated "}
                          {when(c.accepted_at)}
                        </p>
                      ) : null}
                    </div>
                    <Switch
                      checked={!!c?.granted}
                      disabled={toggle.isPending}
                      onCheckedChange={(granted) => toggle.mutate({ document: key, granted })}
                      aria-label={OPTIONAL_CONSENTS[key][lang]}
                    />
                  </div>
                );
              })}
            </div>

            {terms?.granted ? (
              <div className="flex flex-wrap gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={printCertificate} className="h-8 text-xs gap-1.5">
                  <Printer className="w-3.5 h-3.5" />
                  {isAr ? "طباعة شهادة القبول" : "Print acceptance certificate"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadHtml(`boubaid-acceptance-v${terms.version}.html`, certificateHtml())}
                  className="h-8 text-xs gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isAr ? "تنزيل نسخة" : "Download a copy"}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
