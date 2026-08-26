import { useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useLang } from "@/i18n/LanguageProvider";

export interface ArchiveLightboxItem {
  id: string;
  url: string;
  alt: string;
  caption?: string | null;
}

export function ArchiveLightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: ArchiveLightboxItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}) {
  const { lang } = useLang();
  const rtl = lang === "ar";
  const open = index !== null;
  const current = index !== null ? items[index] : null;

  const goNext = useCallback(() => {
    if (index === null) return;
    onNavigate((index + 1) % items.length);
  }, [index, items.length, onNavigate]);

  const goPrev = useCallback(() => {
    if (index === null) return;
    onNavigate((index - 1 + items.length) % items.length);
  }, [index, items.length, onNavigate]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === (rtl ? "ArrowLeft" : "ArrowRight")) goNext();
      else if (e.key === (rtl ? "ArrowRight" : "ArrowLeft")) goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, rtl, goNext, goPrev, onClose]);

  if (!current) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-5xl border-0 bg-black/95 p-0 shadow-none [&>button]:hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">
          {current.alt || (rtl ? "معاينة الصورة" : "Image preview")}
        </DialogTitle>
        <div className="relative flex max-h-[85vh] w-full flex-col items-center justify-center p-2">
          <button
            type="button"
            onClick={onClose}
            className="absolute end-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label={rtl ? "إغلاق" : "Close"}
          >
            <X className="h-5 w-5" />
          </button>

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute start-2 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label={rtl ? "السابق" : "Previous"}
              >
                {rtl ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute end-2 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label={rtl ? "التالي" : "Next"}
              >
                {rtl ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
            </>
          )}

          <img
            src={current.url}
            alt={current.alt}
            className="max-h-[75vh] w-auto max-w-full rounded object-contain"
          />

          {current.caption && (
            <p className="mt-3 max-w-2xl px-4 text-center text-sm text-white/80">
              {current.caption}
            </p>
          )}
          <p className="mt-1 font-mono text-xs text-white/40" dir="ltr">
            {(index ?? 0) + 1} / {items.length}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
