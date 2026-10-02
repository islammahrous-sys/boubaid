import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n/LanguageProvider";
import { inl } from "@/content/page-copy/qrscanner-inline";

/**
 * Camera QR scanner for event check-ins. Reads a member card's QR and returns
 * the member code (the `id` from a /verify?id=… URL, or a raw ABO- code).
 */
export function QrScanner({ onCode }: { onCode: (code: string) => void }) {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    (async () => {
      try {
        const jsQR = (await import("jsqr")).default;
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        const video = videoRef.current;
        if (!video || stopped) return;
        video.srcObject = stream;
        await video.play();
        const tick = () => {
          if (stopped) return;
          if (video.readyState >= 2 && ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const hit = jsQR(img.data, img.width, img.height);
            if (hit?.data) {
              const raw = hit.data.trim();
              let code = raw;
              try {
                code = new URL(raw).searchParams.get("id") ?? raw;
              } catch {
                /* raw code */
              }
              setActive(false);
              onCode(code);
              return;
            }
          }
          raf = requestAnimationFrame(tick);
        };
        tick();
      } catch (e) {
        console.error("[qr-scanner]", e);
        setError(
          isAr
            ? "تعذر فتح الكاميرا. يرجى السماح بالوصول إلى الكاميرا والمحاولة مجدداً."
            : "Could not open the camera. Allow camera access and try again.",
        );
        setActive(false);
      }
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [active, isAr, onCode]);

  return (
    <div className="space-y-3 text-center">
      {active ? (
        <div className="relative mx-auto max-w-sm overflow-hidden rounded-2xl border-2 border-gold/50 bg-ink">
          <video ref={videoRef} muted playsInline className="aspect-square w-full object-cover" />
          <div className="pointer-events-none absolute inset-10 rounded-xl border-2 border-gold/80" />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setActive(false)}
            className="absolute end-2 top-2 h-8 gap-1 text-xs"
          >
            <X className="h-3.5 w-3.5" />
            {isAr ? "إيقاف" : "Stop"}
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          onClick={() => {
            setError(null);
            setActive(true);
          }}
          className="gap-2 text-xs font-semibold"
        >
          <Camera className="h-4 w-4" />
          {t(inl.t_a313b90d)}
        </Button>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
