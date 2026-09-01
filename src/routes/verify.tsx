import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useLang } from "@/i18n/LanguageProvider";
import { getMemberVerification } from "@/lib/account.functions";
import { branches } from "@/content/site";
import { SaudiCulturalAvatar } from "@/components/common/SaudiCulturalAvatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  ShieldAlert,
  Building,
  CheckCircle2,
  Calendar,
  GitBranch,
  ArrowRight,
  ExternalLink,
  QrCode,
  Sparkles,
  Printer,
} from "lucide-react";

const searchSchema = z.object({
  id: z.string().optional().default(""),
});

export const Route = createFileRoute("/verify")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "التحقق الرقمي من بطاقة العضوية | مجلس أسرة آل بوعبيد" },
      {
        name: "description",
        content: "خدمة التحقق الإلكتروني الرسمي من بطاقات العضوية المعتمدة لأسرة آل بوعبيد.",
      },
    ],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const { id } = Route.useSearch();

  const fetchVerification = useServerFn(getMemberVerification);

  const { data, isLoading } = useQuery({
    queryKey: ["verify-member", id],
    queryFn: () => fetchVerification({ data: { id } }),
    enabled: !!id,
  });

  const member = data?.member;
  const isVerified = data?.verified && !!member;
  const branchName = member?.branch_slug
    ? (branches.find((b) => b.id === member.branch_slug)?.name ?? null)
    : null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            {isAr ? "منظومة التوثيق الرقمي المعتمدة" : "Official Verification System"}
          </div>
          <h1 className="text-2xl font-bold font-naskh text-foreground">
            {isAr ? "مجلس أسرة آل بوعبيد" : "Al Bu Obaid Family Council"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {isAr
              ? "صندوق التنمية العائلية · ترخيص المركز الوطني لتنمية القطاع غير الربحي رقم 1200758400"
              : "Family Development Fund · NCNP License #1200758400"}
          </p>
        </div>

        {/* Verification Certificate Card */}
        {isLoading ? (
          <Card className="border-border bg-card p-12 text-center rounded-3xl animate-pulse">
            <QrCode className="w-12 h-12 text-gold mx-auto mb-3 animate-spin" />
            <p className="text-sm font-semibold text-foreground">
              {isAr ? "جاري التحقق من السجل العائلي الرسمي..." : "Verifying official record..."}
            </p>
          </Card>
        ) : isVerified ? (
          <div className="print-certificate relative overflow-hidden rounded-3xl border-2 border-gold/50 bg-gradient-to-b from-card via-card/95 to-background shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Top Seal & Status */}
            <div className="flex items-center justify-between border-b border-border/60 pb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    {isAr ? "شهادة عضوية رقمية موثقة" : "Official Digital Member Certificate"}
                  </h2>
                  <p className="text-[11px] text-emerald-500 font-semibold">
                    {isAr ? "سجل نظامي معتمد ونشط" : "Verified & Active Member Record"}
                  </p>
                </div>
              </div>

              <Badge className="bg-emerald-600 text-white font-bold text-xs">{member.role}</Badge>
            </div>

            {/* Member Profile Showcase */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 py-2">
              <SaudiCulturalAvatar
                src={member.avatar_path}
                alt={member.full_name_ar}
                size="2xl"
                className="w-24 h-24 border-2 border-gold/60 shadow-lg"
              />

              <div className="space-y-2 text-center sm:text-start flex-1">
                <div>
                  <h3 className="text-xl font-bold font-naskh text-foreground">
                    {member.full_name_ar}
                  </h3>
                  {member.full_name_en && (
                    <p className="text-xs text-muted-foreground font-mono">{member.full_name_en}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-secondary/40 border border-border">
                    <span className="text-[10px] text-muted-foreground block mb-0.5">
                      {isAr ? "الفرع العائلي" : "Family Branch"}
                    </span>
                    <span className="font-bold text-gold flex items-center gap-1 justify-center sm:justify-start">
                      <GitBranch className="w-3.5 h-3.5" />
                      {branchName ? t(branchName) : member.branch_slug}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-secondary/40 border border-border">
                    <span className="text-[10px] text-muted-foreground block mb-0.5">
                      {isAr ? "رقم العضوية" : "Member Code"}
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {member.member_code}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Certification Meta */}
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-2 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{isAr ? "الجهة المصدرة:" : "Issuing Authority:"}</span>
                <span className="font-bold text-foreground">
                  {isAr ? "أمانة مجلس أسرة آل بوعبيد" : "General Secretariat"}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{isAr ? "الترخيص الحكومي:" : "Gov. License:"}</span>
                <span className="font-mono text-foreground">NCNP-1200758400</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{isAr ? "الموقع الجغرافي:" : "Location:"}</span>
                <span>{isAr ? "المملكة العربية السعودية · الأحساء" : "Saudi Arabia, Al-Ahsa"}</span>
              </div>
            </div>

            {/* Print Card Button */}
            <div className="flex justify-center pt-2 no-print">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrint}
                className="gap-2 text-xs font-semibold border-gold/40 hover:bg-gold/10"
              >
                <Printer className="w-3.5 h-3.5 text-gold" />
                {isAr ? "طباعة / حفظ شهادة العضوية" : "Print / Save Certificate"}
              </Button>
            </div>

            {/* Success Trust Footer */}
            <div className="text-center pt-1">
              <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {isAr
                  ? "تمت مطابقة هذا الباركود المشفر مع قاعدة البيانات السحابية الرسمية."
                  : "Cryptographically verified against the official cloud database."}
              </p>
            </div>
          </div>
        ) : (
          /* Invalid / Not Found State */
          <Card className="border-destructive/40 bg-destructive/5 p-8 text-center rounded-3xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-foreground">
                {isAr ? "تعذر التحقق من رمز العضوية" : "Verification Failed"}
              </h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {isAr
                  ? "الرمز المدخل غير مسجل أو غير مكتمل التوثيق في سجلات أمانة الأسرة الرسمية."
                  : "The scanned code is invalid or not registered in official records."}
              </p>
            </div>
          </Card>
        )}

        {/* Action Button */}
        <div className="text-center no-print">
          <Button asChild variant="outline" className="text-xs gap-1.5 rounded-xl border-border">
            <Link to="/">
              <ArrowRight className="w-3.5 h-3.5" />
              {isAr ? "العودة إلى البوابة الرئيسية" : "Back to Home"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
