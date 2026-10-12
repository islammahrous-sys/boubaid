import { useEffect, useState } from "react";
import { MediaViewerDialog, type MediaViewerKind } from "@/components/site/MediaViewerDialog";

export interface MediaViewerRequest {
  src: string;
  kind?: MediaViewerKind;
  title?: string;
}

const EVENT = "lovable:open-media-viewer";

function guessKind(src: string): MediaViewerKind {
  const clean = src.split("?")[0]!.toLowerCase();
  if (/\.(mp4|webm|mov|m4v)$/.test(clean)) return "video";
  if (/\.(jpg|jpeg|png|webp|gif|avif|svg)$/.test(clean)) return "image";
  return "pdf";
}

/**
 * Site-wide entry point for viewing an attachment. Anything that used to be a
 * download link calls this instead, so the file opens in the in-app viewer and
 * the UI never renders a saveable link.
 */
export function openMediaViewer(req: MediaViewerRequest) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<MediaViewerRequest>(EVENT, { detail: req }));
}

/** Mounted once in the root route. */
export function GlobalMediaViewer() {
  const [request, setRequest] = useState<MediaViewerRequest | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<MediaViewerRequest>).detail;
      if (detail?.src) setRequest(detail);
    };
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  return (
    <MediaViewerDialog
      open={!!request}
      onClose={() => setRequest(null)}
      src={request?.src ?? null}
      kind={request?.kind ?? (request ? guessKind(request.src) : "pdf")}
      title={request?.title}
    />
  );
}
