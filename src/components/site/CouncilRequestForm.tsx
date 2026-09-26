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
import {
  COMMITTEE_REQUEST_DESTINATIONS,
  COUNCIL_REQUESTS,
  type CouncilRequestDef,
} from "@/lib/council-requests";
import { copy } from "@/content/page-copy/councilrequestform";

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
  const [sending, setSending] = useState(false);

  if (!type) return null;
  const field = FIELDS[type]!;
  const extraFields = field.fields ?? [];
  const selectedCommittee = field.committeeSlug
    ? COMMITTEE_REQUEST_DESTINATIONS.find((committee) => committee.slug === field.committeeSlug)
    : null;

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
          website_url_check: String(fd.get("website_url_check") ?? ""),
        },
      });
      if (result.ok) {
        toast.success(
          result.reference
            ? `${t(copy.success)} — ${t(copy.successRef)}: ${result.reference}`
            : t(copy.success),
        );
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

        {field.templateCode ? (
          <p className="-mt-2 text-start text-[11.5px] text-muted-foreground">
            {t(copy.templateLabel)}:{" "}
            <span className="font-mono text-bronze dark:text-gold">{field.templateCode}</span>
          </p>
        ) : null}

        {selectedCommittee ? (
          <p className="-mt-2 text-start text-[11.5px] text-muted-foreground">
            {t(copy.committeeLabel)}: {" "}
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

          <Button type="submit" disabled={sending} className="w-full">
            {sending ? t(copy.sending) : t(copy.submit)}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
