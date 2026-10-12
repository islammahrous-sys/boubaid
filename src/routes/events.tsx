import { formatDualDateTime } from "@/lib/dates";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, MapPin, Users, Clock } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { getPublishedEvents, submitEventRegistration } from "@/lib/events-public.functions";
import type { PublicEventRow } from "@/lib/events-public.functions";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow, Status } from "@/components/site/Editorial";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TurnstileWidget, type TurnstileWidgetHandle } from "@/components/site/TurnstileWidget";
import { getCanonicalUrl } from "@/lib/seo";
import { copy } from "@/content/page-copy/events";

export const Route = createFileRoute("/events")({
  loader: async () => {
    const events = await getPublishedEvents();
    return { events };
  },
  head: () => ({
    meta: [
      { title: "الفعاليات واللقاءات | آل بوعبيد" },
      {
        name: "description",
        content: "الفعاليات واللقاءات القادمة لصندوق التنمية العائلية (آل بوعبيد) وتسجيل الحضور.",
      },
      { property: "og:title", content: "فعاليات آل بوعبيد" },
      {
        property: "og:description",
        content: "الفعاليات واللقاءات القادمة لصندوق التنمية العائلية (آل بوعبيد) وتسجيل الحضور.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: getCanonicalUrl("/events") },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/events") }],
  }),
  component: EventsPage,
});

/** Both calendars plus the clock time, from the one shared date utility. */
function formatEventDate(iso: string, lang: "ar" | "en", _timezone: string) {
  return formatDualDateTime(iso, lang);
}

function placeLabel(place: PublicEventRow["place"], lang: "ar" | "en") {
  if (!place) return null;
  const name = lang === "ar" ? place.name_ar : place.name_en || place.name_ar;
  return [name, place.city].filter(Boolean).join(" — ");
}

function EventsPage() {
  const { t, lang } = useLang();
  const { events } = Route.useLoaderData();
  const [activeEvent, setActiveEvent] = useState<PublicEventRow | null>(null);

  return (
    <>
      <PageHeader
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
        meta={[{ label: t(copy.metaCount), value: events.length.toString(), mono: true }]}
      />

      <section className="reveal-on-scroll container-page py-14 md:py-16">
        {events.length === 0 ? (
          <p className="measure py-10 text-sm leading-relaxed text-muted-foreground">
            {t(copy.empty)}
          </p>
        ) : (
          <ol className="reveal-stagger grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((evt) => (
              <EventCard key={evt.id} event={evt} onRegister={() => setActiveEvent(evt)} />
            ))}
          </ol>
        )}
      </section>

      <RegistrationDialog
        event={activeEvent}
        onOpenChange={(open) => {
          if (!open) setActiveEvent(null);
        }}
      />
    </>
  );
}

function EventCard({ event, onRegister }: { event: PublicEventRow; onRegister: () => void }) {
  const { t, lang } = useLang();
  const location = placeLabel(event.place, lang);

  const deadlinePassed =
    !!event.registration_deadline && new Date(event.registration_deadline).getTime() < Date.now();

  return (
    <li className="flex flex-col border border-border bg-card">
      {event.cover_url ? (
        <img
          src={event.cover_url}
          alt=""
          className="aspect-[16/10] w-full object-cover"
          loading="lazy"
        />
      ) : null}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 text-xs text-bronze dark:text-gold">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="nums">{formatEventDate(event.start_at, lang, event.timezone)}</span>
        </div>

        <h3 className="mt-3 text-lg leading-snug text-foreground">
          {t({ ar: event.title_ar, en: event.title_en || event.title_ar })}
        </h3>

        {event.description_ar || event.description_en ? (
          <p className="mt-2.5 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
            {t({
              ar: event.description_ar || "",
              en: event.description_en || event.description_ar || "",
            })}
          </p>
        ) : null}

        {location ? (
          <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{location}</span>
          </div>
        ) : null}

        {event.max_attendees ? (
          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="nums">
              {t(copy.seats)}: {event.max_attendees}
            </span>
          </div>
        ) : null}

        <div className="mt-auto pt-5">
          {!event.registration_enabled ? (
            <Status tone="neutral">{t(copy.closedBadge)}</Status>
          ) : deadlinePassed ? (
            <Status tone="pending">{t(copy.deadlinePassedBadge)}</Status>
          ) : (
            <Button size="sm" className="w-full" onClick={onRegister}>
              {t(copy.registerCta)}
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

function RegistrationDialog({
  event,
  onOpenChange,
}: {
  event: PublicEventRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t, lang } = useLang();
  const registerFn = useServerFn(submitEventRegistration);
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);

  const location = useMemo(() => placeLabel(event?.place ?? null, lang), [event, lang]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!event) return;
    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload = {
      event_id: event.id,
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      attendees_count: Number(fd.get("attendees_count") || 1),
      notes: String(fd.get("notes") || ""),
      website_url_check: String(fd.get("website_url_check") || ""),
      locale: lang,
      turnstile_token: turnstileToken || undefined,
    };

    setSubmitting(true);
    try {
      const res = await registerFn({ data: payload });
      if (res.ok) {
        toast.success(t(copy.success));
        form.reset();
        setTurnstileToken("");
        turnstileRef.current?.reset();
        onOpenChange(false);
      } else {
        const messages: Record<string, BiText> = {
          registration_closed: copy.errorClosed,
          deadline_passed: copy.errorDeadline,
          event_full: copy.errorFull,
          event_not_found: copy.errorGeneric,
          verification_failed: copy.errorGeneric,
          insert_failed: copy.errorGeneric,
        };
        toast.error(t(messages[res.error] ?? copy.errorGeneric));
      }
    } catch {
      toast.error(t(copy.invalid));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={!!event} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {event ? (
          <>
            <DialogHeader>
              <DialogTitle>{t(copy.dialogTitle)}</DialogTitle>
            </DialogHeader>

            <div className="mb-1 border-b border-border pb-3">
              <p className="text-sm font-medium text-foreground">
                {t({ ar: event.title_ar, en: event.title_en || event.title_ar })}
              </p>
              <p className="nums mt-1 text-xs text-muted-foreground">
                {formatEventDate(event.start_at, lang, event.timezone)}
              </p>
              {location ? <p className="mt-0.5 text-xs text-muted-foreground">{location}</p> : null}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Anti-bot honeypot field */}
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="website_url_check">Leave empty</label>
                <input
                  type="text"
                  id="website_url_check"
                  name="website_url_check"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg_name">{t(copy.fieldName)}</Label>
                <Input id="reg_name" name="name" required minLength={2} maxLength={100} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg_email">{t(copy.fieldEmail)}</Label>
                <Input
                  id="reg_email"
                  name="email"
                  type="email"
                  required
                  maxLength={255}
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="reg_phone">{t(copy.fieldPhone)}</Label>
                  <Input id="reg_phone" name="phone" dir="ltr" maxLength={30} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg_attendees">{t(copy.fieldAttendees)}</Label>
                  <Input
                    id="reg_attendees"
                    name="attendees_count"
                    type="number"
                    min={1}
                    max={20}
                    defaultValue={1}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg_notes">{t(copy.fieldNotes)}</Label>
                <Input id="reg_notes" name="notes" maxLength={500} />
              </div>

              <TurnstileWidget ref={turnstileRef} onToken={setTurnstileToken} />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {t(copy.cancel)}
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "…" : t(copy.submit)}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
