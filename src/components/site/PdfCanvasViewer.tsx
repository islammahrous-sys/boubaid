import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n/LanguageProvider";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

type PdfDocument = import("pdfjs-dist").PDFDocumentProxy;

export function PdfCanvasViewer({ src, title }: { src: string; title: string }) {
  const { lang } = useLang();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const [document, setDocument] = useState<PdfDocument | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let disposed = false;
    let task: ReturnType<typeof import("pdfjs-dist")["getDocument"]> | null = null;

    setLoading(true);
    setError(false);
    setDocument(null);
    setPageNumber(1);

    void import("pdfjs-dist").then((pdfjs) => {
      if (disposed) return;
      pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
      task = pdfjs.getDocument({ url: src });
      return task.promise;
    }).then((pdf) => {
      if (!pdf || disposed) return;
      setDocument(pdf);
    }).catch((reason: unknown) => {
      console.error("[pdf-viewer] failed to load document", reason);
      if (!disposed) setError(true);
    }).finally(() => {
      if (!disposed) setLoading(false);
    });

    return () => {
      disposed = true;
      renderTaskRef.current?.cancel();
      void task?.destroy();
    };
  }, [src]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!document || !canvas) return;
    let disposed = false;

    void document.getPage(pageNumber).then((page) => {
      if (disposed) return;
      const baseViewport = page.getViewport({ scale: 1 });
      const availableWidth = Math.max(280, canvas.parentElement?.clientWidth ?? 900);
      const scale = Math.min(2, availableWidth / baseViewport.width);
      const viewport = page.getViewport({ scale });
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * ratio);
      canvas.height = Math.floor(viewport.height * ratio);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      renderTaskRef.current?.cancel();
      const renderTask = page.render({ canvas, canvasContext: context, viewport });
      renderTaskRef.current = renderTask;
      return renderTask.promise;
    }).catch((reason: unknown) => {
      if (!disposed && !(reason instanceof Error && reason.name === "RenderingCancelledException")) {
        console.error("[pdf-viewer] failed to render page", reason);
        setError(true);
      }
    });

    return () => {
      disposed = true;
      renderTaskRef.current?.cancel();
    };
  }, [document, loading, pageNumber]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
        {lang === "ar" ? "جارٍ تحميل الوثيقة…" : "Loading document…"}
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
        {lang === "ar"
          ? "تعذر عرض الوثيقة الآن. يرجى المحاولة مرة أخرى."
          : "The document could not be displayed. Please try again."}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col" aria-label={title}>
      <div className="flex shrink-0 items-center justify-center gap-3 border-b border-border bg-card px-3 py-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={lang === "ar" ? "الصفحة السابقة" : "Previous page"}
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
        >
          <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        </Button>
        <span className="nums min-w-24 text-center text-xs text-foreground">
          {lang === "ar" ? "صفحة" : "Page"} {pageNumber} / {document.numPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={lang === "ar" ? "الصفحة التالية" : "Next page"}
          disabled={pageNumber >= document.numPages}
          onClick={() => setPageNumber((page) => Math.min(document.numPages, page + 1))}
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto bg-muted/40 p-2 sm:p-4">
        <canvas ref={canvasRef} className="mx-auto bg-card shadow-sm" />
      </div>
    </div>
  );
}