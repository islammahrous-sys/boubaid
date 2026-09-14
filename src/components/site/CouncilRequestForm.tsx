import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { submitCouncilRequest } from "@/lib/forms.functions";
import type { CouncilRequestType } from "@/lib/forms.schemas";
import { COUNCIL_REQUESTS } from "@/lib/council-requests";

/**
 * Shared submission form for every Requests Hub request type. All of them
 * write to the official inbox with a distinct `source`, so the console shows
 * them separately with the usual status workflow. Labels come from the
 * catalogue in `council-requests.ts`.
 */

const FIELDS = COUNCIL_REQUESTS;

const copy = {
  name: { ar: "الاسم الكامل *", en: "Full name *" } as BiText,
  phone: { ar: "رقم التواصل *", en: "Contact number *" } as BiText,
  email: { ar: "البريد الإلكتروني", en: "Email" } as BiText,
  branch: { ar: "الفرع", en: "Branch" } as BiText,
  link: { ar: "رابط (اختياري)", en: "Link (optional)" } as BiText,
  submit: { ar: "إرسال الطلب", en: "Submit request" } as BiText,
  sending: { ar: "جارٍ الإرسال…", en: "Sending…" } as BiText,
  success: {
    ar: "تم استلام طلبك، وستتم مراجعته من الأمانة العامة.",
    en: "Your request has been received and will be reviewed by the secretariat.",
  } as BiText,
  failure: {
    ar: "تعذر إرسال الطلب، يرجى المحاولة مرة أخرى.",
    en: "The request could not be sent. Please try again.",
  } as BiText,
  rateLimited: {
    ar: "تم استلام عدد كبير من الطلبات، يرجى المحاولة بعد قليل.",
    en: "Too many requests received. Please try again shortly.",
  } as BiText,
};

export function CouncilRequestForm({
  type,
  open,
  onOpenChange,
}: {
  type: CouncilRequestType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t, lang, dir } = useLang();
  const [sending, setSending] = useState(false);

  if (!type) return null;
  const field = FIELDS[type];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setSending(true);
    try {
      const result = await submitCouncilRequest({
        data: {
          type,
          full_name: String(fd.get("full_name") ?? ""),
          phone: String(fd.get("phone") ?? ""),
          email: String(fd.get("email") ?? ""),
          branch: String(fd.get("branch") ?? ""),
          topic: String(fd.get("topic") ?? ""),
          details: String(fd.get("details") ?? ""),
          link: String(fd.get("link") ?? ""),
          locale: lang,
          website_url_check: String(fd.get("website_url_check") ?? ""),
        },
      });
      if (result.ok) {
        toast.success(t(copy.success));
        form.reset();
        onOpenChange(false);
      } else {
        toast.error(t(result.error === "rate_limited" ? copy.rateLimited : copy.failure));
      }
    } catch {
      toast.error(t(copy.failure));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir={dir} className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-start text-[16px]">{t(field.title)}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="website_url_check"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="cr-name" className="text-xs">
                {t(copy.name)}
              </Label>
              <Input id="cr-name" name="full_name" required minLength={2} maxLength={120} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cr-phone" className="text-xs">
                {t(copy.phone)}
              </Label>
              <Input id="cr-phone" name="phone" required minLength={7} maxLength={30} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cr-email" className="text-xs">
                {t(copy.email)}
              </Label>
              <Input id="cr-email" name="email" type="email" maxLength={255} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cr-branch" className="text-xs">
                {t(copy.branch)}
              </Label>
              <Input id="cr-branch" name="branch" maxLength={120} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cr-topic" className="text-xs">
              {t(field.topic)} *
            </Label>
            <Input id="cr-topic" name="topic" required minLength={2} maxLength={160} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cr-details" className="text-xs">
              {t(field.details)} *
            </Label>
            <Textarea id="cr-details" name="details" required minLength={10} maxLength={1500} rows={5} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cr-link" className="text-xs">
              {t(copy.link)}
            </Label>
            <Input id="cr-link" name="link" type="url" maxLength={500} />
          </div>

          <Button type="submit" disabled={sending} className="w-full">
            {sending ? t(copy.sending) : t(copy.submit)}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
