import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export type MediaViewerKind = "pdf" | "image" | "video";

/**
 * Single in-app viewer used site-wide for documents, images and video.
 *
 * Policy: content is viewable but the site never offers a download control and
 * never renders the underlying storage URL as a link the user can copy from the
 * UI. PDFs are embedded with the native viewer's toolbar suppressed, images and
 * video block the context menu, and video omits the download control.
 */
export function MediaViewerDialog({
  open,
  onClose,
  src,
  kind,
  title,
}: {
  open: boolean;
  onClose: () => void;
  src: string | null;
  kind: MediaViewerKind;
  title?: string;
}) {
  const { t } = useLang();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !src || typeof document === "undefined") return null;

  const closeLabel = t({ ar: "إغلاق العارض", en: "Close viewer" });

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title ?? closeLabel}
      className="fixed inset-0 z-[100] flex flex-col bg-ink/90 backdrop-blur-sm"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="flex items-center justify-between gap-4 border-b border-ivory/15 px-4 py-3">
        <p className="truncate text-sm font-medium text-ivory">{title}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="inline-flex items-center gap-1.5 border border-ivory/30 px-3 py-1.5 text-xs font-medium text-ivory transition-colors hover:bg-ivory/10"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          {t({ ar: "إغلاق", en: "Close" })}
        </button>
      </div>

      <div className={cn("flex min-h-0 flex-1 items-center justify-center p-2 sm:p-4")}>
        {kind === "pdf" ? (
          <iframe
            // #toolbar=0 removes the built-in download/print controls in the
            // browsers that honour it; the file is streamed inline.
            src={`${src}#toolbar=0&navpanes=0&statusbar=0&view=FitH`}
            title={title ?? "document"}
            className="h-full w-full border-0 bg-white"
          />
        ) : kind === "image" ? (
          <img
            src={src}
            alt={title ?? ""}
            draggable={false}
            className="max-h-full max-w-full object-contain select-none"
          />
        ) : (
          <video
            src={src}
            controls
            controlsList="nodownload noplaybackrate"
            disablePictureInPicture
            playsInline
            className="max-h-full max-w-full"
          />
        )}
      </div>
    </div>
  );
}
