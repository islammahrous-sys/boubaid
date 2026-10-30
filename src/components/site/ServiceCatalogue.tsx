import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { FileText, ChevronRight, ChevronLeft, Layers } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { PublicService, ServiceCategory } from "@/lib/services-public.functions";
import { openMediaViewer } from "@/components/site/GlobalMediaViewer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { inl } from "@/content/page-copy/servicecatalogue-inline";

/**
 * Service catalogue for one of the two categories of
 * «خدمات أفراد الأسرة وخدمات المنشآت». Rows come from the `services` table and
 * their attachments from `documents.service_id`, so newly published services
 * and newly uploaded documents appear without any code change.
 */
export function ServiceCatalogue({
  services,
  category,
}: {
  services: PublicService[];
  category: ServiceCategory;
}) {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const Chevron = isAr ? ChevronLeft : ChevronRight;
  const [active, setActive] = useState<PublicService | null>(null);

  const items = services
    .filter((s) => s.category === category)
    .sort((a, b) => a.sort_order - b.sort_order);

  if (items.length === 0) return null;

  const heading = category === "family" ? inl.t_3e83ce6f : inl.t_19fc1d8d;

  return (
    <section aria-labelledby={`services-${category}`} className="space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <h2 id={`services-${category}`} className="text-base font-bold text-foreground sm:text-lg">
          {t(heading)}
        </h2>
        <span className="nums text-xs text-muted-foreground">({items.length})</span>
        {/* "سجل خدمتك" — the single Requests Hub owns the form itself. */}
        <Link
          to="/requests"
          search={{ request: category === "family" ? "service_family" : "service_establishment" }}
          className="ms-auto border-b border-bronze pb-0.5 text-[12.5px] font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
        >
          {t(inl.t_ec475806)}
        </Link>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((service) => {
          const title = isAr ? service.title_ar : service.title_en || service.title_ar;
          const description = isAr
            ? service.description_ar
            : service.description_en || service.description_ar;
          return (
            <li key={service.id}>
              <button
                type="button"
                onClick={() => setActive(service)}
                className="group flex h-full w-full flex-col items-start gap-2 rounded-xl border border-border bg-card p-4 text-start transition-colors hover:border-primary/50 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="flex w-full items-start justify-between gap-2">
                  <span className="text-sm font-bold leading-6 text-foreground">{title}</span>
                  <Chevron
                    className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                    aria-hidden="true"
                  />
                </span>
                {description ? (
                  <span className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                    {description}
                  </span>
                ) : null}
                {service.documents.length > 0 ? (
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-[11px] font-medium text-primary">
                    <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="nums">{service.documents.length}</span>
                    <span>
                      {t(service.documents.length === 1 ? inl.t_1260a420_one : inl.t_1260a420)}
                    </span>
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          {active ? (
            <>
              <DialogHeader className="text-start">
                <DialogTitle className="text-base leading-7">
                  {isAr ? active.title_ar : active.title_en || active.title_ar}
                </DialogTitle>
                <DialogDescription className="text-xs leading-relaxed">
                  {(isAr
                    ? active.description_ar
                    : active.description_en || active.description_ar) || t(inl.t_d6efcc71)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <p className="text-xs font-bold text-foreground">{t(inl.t_5801bca6)}</p>
                {active.documents.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t(inl.t_f240ee05)}</p>
                ) : (
                  <ul className="space-y-2">
                    {active.documents.map((doc) => (
                      <li
                        key={doc.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-3"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-medium text-foreground">
                            {isAr ? doc.title_ar : doc.title_en || doc.title_ar}
                          </span>
                          {(isAr ? doc.description_ar : doc.description_en) ? (
                            <span className="block truncate text-[11px] text-muted-foreground">
                              {isAr ? doc.description_ar : doc.description_en}
                            </span>
                          ) : null}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="shrink-0 gap-1.5 text-[11px]"
                          disabled={!doc.url}
                          onClick={() =>
                            doc.url &&
                            openMediaViewer({
                              src: doc.url,
                              title: isAr ? doc.title_ar : doc.title_en || doc.title_ar,
                            })
                          }
                        >
                          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                          {t(inl.t_c47895fb)}
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
