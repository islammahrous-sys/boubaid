import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n/LanguageProvider";
import { TurnstileWidget, type TurnstileWidgetHandle } from "@/components/site/TurnstileWidget";
import { submitCouncilRequest } from "@/lib/forms.functions";
import type { CouncilRequestType } from "@/lib/forms.schemas";
import {
  COMMITTEE_REQUEST_DESTINATIONS,
  COUNCIL_REQUESTS,
  type CouncilRequestDef,
} from "@/lib/council-requests";
import { copy } from "@/content/page-copy/councilrequestform";
import { useAuth } from "@/hooks/useAuth";
import {
  CheckCircle2,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  Mail,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

/**
 * Shared submission form for every Requests Hub request type. All of them
 * write to the official inbox with a distinct `source`, so the console shows
 * them separately with the usual status workflow. Labels, the template-specific
 * fields and the linked official template code all come from the catalogue in
 * `council-requests.ts`.
 */

const FIELDS: Record<string, CouncilRequestDef> = COUNCIL_REQUESTS;

const ATTACHMENT_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;
const MAX_ATTACHMENTS = 3;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

async function readFiles(files: File[]) {
  return Promise.all(
    files.map(
      (file) =>
        new Promise<{ name: string; type: (typeof ATTACHMENT_TYPES)[number]; data: string }>(
          (resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("read_failed"));
            reader.onload = () =>
              resolve({
                name: file.name,
                type: file.type as (typeof ATTACHMENT_TYPES)[number],
                data: String(reader.result).split(",")[1] ?? "",
              });
            reader.readAsDataURL(file);
          },
        ),
    ),
  );
}

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
  const { user, profile } = useAuth();
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const isAr = lang === "ar";
  const [sending, setSending] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset confirmation state when dialog opens or type changes
  useEffect(() => {
    if (open) {
      setSubmittedRef(null);
      setCopied(false);
    }
  }, [open, type]);

  if (!type) return null;
  const field = FIELDS[type]!;
  const extraFields = field.fields ?? [];
  const selectedCommittee = field.committeeSlug
    ? COMMITTEE_REQUEST_DESTINATIONS.find((committee) => committee.slug === field.committeeSlug)
    : null;

  const defaultName =
    profile?.full_name_ar ||
    (user?.user_metadata?.full_name_ar as string) ||
    (user?.user_metadata?.full_name as string) ||
    "";
  const defaultEmail = user?.email || "";
  const defaultPhone = (user?.user_metadata?.phone as string) || "";
  const defaultBranch = (user?.user_metadata?.branch_slug as string) || "";

  const handleCopyRef = () => {
    if (!submittedRef || typeof window === "undefined") return;
    navigator.clipboard.writeText(submittedRef);
    setCopied(true);
    toast.success(t(copy.copiedRef));
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const extra: Record<string, string> = {};
    for (const f of extraFields) {
      extra[f.name] = String(fd.get(`extra_${f.name}`) ?? "");
    }

    const picked = (fd.getAll("attachments") as File[]).filter((f) => f && f.size > 0);
    if (picked.some((f) => f.size > MAX_ATTACHMENT_BYTES)) {
      toast.error(t(copy.attachmentTooLarge));
      return;
    }
    if (
      picked.some((f) => !ATTACHMENT_TYPES.includes(f.type as (typeof ATTACHMENT_TYPES)[number]))
    ) {
      toast.error(t(copy.attachmentType));
      return;
    }

    setSending(true);
    try {
      const attachments = await readFiles(picked.slice(0, MAX_ATTACHMENTS));
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
          extra,
          attachments,
          locale: lang,
          user_id: user?.id ?? null,
          website_url_check: String(fd.get("website_url_check") ?? ""),
          turnstile_token: turnstileToken || undefined,
        },
      });
      if (result.ok) {
        setTurnstileToken("");
        turnstileRef.current?.reset();
        if (result.reference) {
          setSubmittedRef(result.reference);
        } else {
          toast.success(t(copy.success));
          form.reset();
          onOpenChange(false);
        }
      } else {
        toast.error(t(result.error === "rate_limited" ? copy.rateLimited : copy.failure));
        // Tokens are single-use; get a fresh one for the retry.
        setTurnstileToken("");
        turnstileRef.current?.reset();
      }
    } catch {
      toast.error(t(copy.failure));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setSubmittedRef(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent dir={dir} className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {submittedRef ? (
          /* ── Approval Process Confirmation Screen ── */
          <div className="space-y-6 py-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-10 w-10 animate-in zoom-in-75 duration-300" />
            </div>

            <div className="space-y-2">
              <DialogTitle className="text-xl font-bold text-foreground">
                {t(copy.successTitle)}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed px-4">
                {t(copy.successSubtitle)}
              </DialogDescription>
            </div>

            {/* Reference Number Box */}
            <div className="rounded-xl border border-border bg-card p-4 text-start shadow-xs">
              <span className="text-[11px] font-semibold text-muted-foreground block mb-1">
                {t(copy.refLabel)}
              </span>
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-base font-black text-bronze dark:text-gold tracking-wide">
                  {submittedRef}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyRef}
                  className="h-8 gap-1.5 text-xs font-semibold rounded-lg"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? (isAr ? "تم النسخ" : "Copied") : t(copy.copyRef)}
                </Button>
              </div>
            </div>

            {/* Approval Workflow Stages */}
            <div className="rounded-xl border border-border bg-secondary/15 p-4 text-start space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                {t(copy.workflowTitle)}
              </span>
              <ol className="space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 text-[10px]">
                    ✓
                  </span>
                  <span>1. {t(copy.stage1)}</span>
                </li>
                <li className="flex items-center gap-2.5 text-foreground font-semibold">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] animate-pulse">
                    2
                  </span>
                  <span>2. {t(copy.stage2)}</span>
                </li>
                <li className="flex items-center gap-2.5 opacity-60">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-[10px]">
                    3
                  </span>
                  <span>3. {t(copy.stage3)}</span>
                </li>
                <li className="flex items-center gap-2.5 opacity-60">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-[10px]">
                    4
                  </span>
                  <span>4. {t(copy.stage4)}</span>
                </li>
              </ol>
            </div>

            <div className="rounded-lg bg-blue-500/10 p-3 text-start flex items-start gap-2 text-[11.5px] text-blue-700 dark:text-blue-300">
              <Mail className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{t(copy.emailNotice)}</span>
            </div>

            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full h-10 font-bold rounded-xl"
            >
              {t(copy.close)}
            </Button>
          </div>
        ) : (
          /* ── Main Submission Form ── */
          <>
            <DialogHeader>
              <DialogTitle className="text-start text-[16px]">{t(field.title)}</DialogTitle>
            </DialogHeader>

            {field.templateCode ? (
              <p className="-mt-2 text-start text-[11.5px] text-muted-foreground">
                {t(copy.templateLabel)}:{" "}
                <span className="font-mono text-bronze dark:text-gold">{field.templateCode}</span>
              </p>
            ) : null}

            {selectedCommittee ? (
              <p className="-mt-2 text-start text-[11.5px] text-muted-foreground">
                {t(copy.committeeLabel)}:{" "}
                <span className="font-semibold text-bronze dark:text-gold">
                  {t(selectedCommittee.name)}
                </span>
              </p>
            ) : null}

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
                  <Input
                    id="cr-name"
                    name="full_name"
                    required
                    minLength={2}
                    maxLength={120}
                    defaultValue={defaultName}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cr-phone" className="text-xs">
                    {t(copy.phone)}
                  </Label>
                  <Input
                    id="cr-phone"
                    name="phone"
                    required
                    minLength={7}
                    maxLength={30}
                    defaultValue={defaultPhone}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cr-email" className="text-xs">
                    {t(copy.email)}
                  </Label>
                  <Input
                    id="cr-email"
                    name="email"
                    type="email"
                    maxLength={255}
                    defaultValue={defaultEmail}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cr-branch" className="text-xs">
                    {t(copy.branch)}
                  </Label>
                  <Input
                    id="cr-branch"
                    name="branch"
                    maxLength={120}
                    defaultValue={defaultBranch}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cr-topic" className="text-xs">
                  {t(field.topic)} *
                </Label>
                <Input id="cr-topic" name="topic" required minLength={2} maxLength={160} />
              </div>

              {extraFields.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {extraFields.map((f) => (
                    <div key={f.name} className="space-y-1.5">
                      <Label htmlFor={`cr-extra-${f.name}`} className="text-xs">
                        {t(f.label)}
                        {f.required ? " *" : ""}
                      </Label>
                      {f.kind === "textarea" ? (
                        <Textarea
                          id={`cr-extra-${f.name}`}
                          name={`extra_${f.name}`}
                          required={f.required}
                          maxLength={f.maxLength ?? 400}
                          rows={3}
                        />
                      ) : (
                        <Input
                          id={`cr-extra-${f.name}`}
                          name={`extra_${f.name}`}
                          type={f.kind === "date" ? "date" : "text"}
                          required={f.required}
                          maxLength={f.maxLength ?? 400}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="space-y-1.5">
                <Label htmlFor="cr-details" className="text-xs">
                  {t(field.details)} *
                </Label>
                <Textarea
                  id="cr-details"
                  name="details"
                  required
                  minLength={10}
                  maxLength={1500}
                  rows={5}
                />
              </div>

              {field.allowAttachments ? (
                <div className="space-y-1.5">
                  <Label htmlFor="cr-attachments" className="text-xs">
                    {t(copy.attachments)}
                  </Label>
                  <Input
                    id="cr-attachments"
                    name="attachments"
                    type="file"
                    multiple
                    accept={ATTACHMENT_TYPES.join(",")}
                    className="cursor-pointer"
                  />
                </div>
              ) : null}

              <div className="space-y-1.5">
                <Label htmlFor="cr-link" className="text-xs">
                  {t(copy.link)}
                </Label>
                <Input id="cr-link" name="link" type="url" maxLength={500} />
              </div>

              <TurnstileWidget ref={turnstileRef} onToken={setTurnstileToken} />

              <Button
                type="submit"
                disabled={sending}
                className="w-full h-10 font-bold rounded-xl shadow"
              >
                {sending ? t(copy.sending) : t(copy.submit)}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
