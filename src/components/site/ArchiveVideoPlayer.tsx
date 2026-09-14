import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

/**
 * Native first-party player for the Archive's film clips.
 *
 * The clip is served from the website's own storage, so playback never leaves
 * the site: it autoplays muted (the only autoplay browsers permit), loops
 * continuously, and exposes the browser's real controls plus a sound toggle
 * whose state is announced to screen readers. Unmuting one clip mutes the
 * others so two soundtracks never overlap.
 */

const SOUND_EVENT = "alboabid:archive-video-unmuted";

const copy = {
  soundOn: { ar: "تشغيل الصوت", en: "Turn Sound On" } as BiText,
  soundOff: { ar: "كتم الصوت", en: "Mute" } as BiText,
  unsupported: {
    ar: "لا يدعم متصفحك تشغيل هذا المقطع.",
    en: "Your browser cannot play this clip.",
  } as BiText,
};

export function ArchiveVideoPlayer({
  src,
  mimeType,
  title,
  subtitle,
  portrait,
  className,
}: {
  src: string;
  mimeType?: string | null;
  title: string;
  subtitle?: string | null;
  /** Portrait clips get a 9:16 frame so nothing is cropped. */
  portrait?: boolean;
  className?: string;
}) {
  const { t } = useLang();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  // Only one clip may carry sound at a time.
  useEffect(() => {
    const handler = (e: Event) => {
      const video = videoRef.current;
      if (!video) return;
      if ((e as CustomEvent<string>).detail === src) return;
      video.muted = true;
      setMuted(true);
    };
    window.addEventListener(SOUND_EVENT, handler);
    return () => window.removeEventListener(SOUND_EVENT, handler);
  }, [src]);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    setMuted(next);
    if (!next) {
      window.dispatchEvent(new CustomEvent<string>(SOUND_EVENT, { detail: src }));
      void video.play().catch(() => undefined);
    }
  };

  return (
    <figure
      className={cn(
        "flex flex-col overflow-hidden rounded border border-border bg-card shadow-sm",
        className,
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-black",
          portrait ? "aspect-[9/16]" : "aspect-video",
        )}
      >
        <video
          ref={videoRef}
          src={src}
          title={title}
          className="h-full w-full object-contain"
          controls
          loop
          muted
          autoPlay
          playsInline
          preload="metadata"
          aria-label={title}
        >
          {mimeType ? <source src={src} type={mimeType} /> : null}
          {t(copy.unsupported)}
        </video>

        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={!muted}
          aria-label={muted ? t(copy.soundOn) : t(copy.soundOff)}
          title={muted ? t(copy.soundOn) : t(copy.soundOff)}
          className="absolute top-2 end-2 inline-flex cursor-pointer items-center gap-1.5 rounded bg-black/65 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
        >
          {muted ? (
            <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>{muted ? t(copy.soundOn) : t(copy.soundOff)}</span>
        </button>
      </div>

      <figcaption className="flex flex-col gap-1 p-4">
        <span className="break-words text-sm font-bold leading-snug text-foreground">{title}</span>
        {subtitle ? (
          <span className="text-[12.5px] leading-relaxed text-muted-foreground">{subtitle}</span>
        ) : null}
      </figcaption>
    </figure>
  );
}
