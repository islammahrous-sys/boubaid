import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useLang } from "@/i18n/LanguageProvider";

export interface ArchiveLightboxItem {
  id: string;
  url: string;
  alt: string;
  caption?: string | null;
  /** Archive folders hold film alongside photographs. */
  kind?: "image" | "video";
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

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const goNext = useCallback(() => {
    if (index === null || items.length === 0) return;
    onNavigate((index + 1) % items.length);
  }, [index, items.length, onNavigate]);

  const goPrev = useCallback(() => {
    if (index === null || items.length === 0) return;
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

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Trigger swipe if horizontal displacement is significant and greater than vertical displacement
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        // Swiped left
        if (rtl) {
          goPrev();
        } else {
          goNext();
        }
      } else {
        // Swiped right
        if (rtl) {
          goNext();
        } else {
          goPrev();
        }
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  if (!current) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="w-[calc(100vw-1rem)] sm:w-full max-w-5xl border-0 bg-black/95 p-2 sm:p-4 shadow-none [&>button]:hidden rounded-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">
          {current.alt || (rtl ? "معاينة الصورة" : "Image preview")}
        </DialogTitle>
        <div
          className="relative flex max-h-[85dvh] sm:max-h-[85vh] w-full flex-col items-center justify-center p-1 sm:p-2 select-none touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute end-2 top-2 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-xs transition-colors cursor-pointer active:scale-95"
            aria-label={rtl ? "إغلاق" : "Close"}
          >
            <X className="h-5 w-5" />
          </button>

          {/* Prev/Next arrows */}
          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute start-2 top-1/2 z-20 grid h-10 w-10 sm:h-11 sm:w-11 -translate-y-1/2 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-xs transition-colors cursor-pointer active:scale-95"
                aria-label={rtl ? "السابق" : "Previous"}
              >
                {rtl ? (
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute end-2 top-1/2 z-20 grid h-10 w-10 sm:h-11 sm:w-11 -translate-y-1/2 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-xs transition-colors cursor-pointer active:scale-95"
                aria-label={rtl ? "التالي" : "Next"}
              >
                {rtl ? (
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </button>
            </>
          )}

          <div className="relative flex items-center justify-center w-full min-h-[40vh] max-h-[70dvh] sm:max-h-[72vh] overflow-hidden">
            {current.kind === "video" ? (
              <video
                key={current.id}
                src={current.url}
                controls
                playsInline
                preload="metadata"
                className="max-h-[70dvh] sm:max-h-[72vh] w-auto max-w-full rounded-lg object-contain"
              />
            ) : (
              <img
                src={current.url}
                alt={current.alt}
                className="max-h-[70dvh] sm:max-h-[72vh] w-auto max-w-full rounded-lg object-contain transition-opacity duration-200"
                draggable={false}
              />
            )}
          </div>

          {current.caption && (
            <p className="mt-3 max-w-2xl px-3 text-center text-xs sm:text-sm text-white/90 leading-relaxed">
              {current.caption}
            </p>
          )}
          <p className="mt-1 font-mono text-xs text-white/50" dir="ltr">
            {(index ?? 0) + 1} / {items.length}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
