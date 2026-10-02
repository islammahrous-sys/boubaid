import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/i18n/LanguageProvider";
import { inl } from "@/content/page-copy/hqprojectvideo-inline";

/** Web-optimised (fast-start) copy served from /public so playback begins immediately. */
const HQ_VIDEO_SRC = "/media/hq-project.mp4";
const HQ_VIDEO_SRC_WEBM = "/media/hq-project.webm";
const HQ_VIDEO_POSTER = "/media/hq-project-poster.jpg";

export interface HqProjectVideoProps {
  /** Accessible description of the footage. */
  label: string;
  className?: string;
}

/**
 * Looping architectural walkthrough for the Family Council Headquarters.
 * Playback always starts muted on every page load; sound is only enabled
 * after a deliberate visitor action (clicking the footage or the sound
 * control), and the visitor keeps full mute/unmute control afterwards.
 */
export function HqProjectVideo({ label, className }: HqProjectVideoProps) {
  const { lang, t } = useLang();
  const rtl = lang === "ar";
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  // Keep muted playback alive: retry on every event that can signal readiness.
  const ensurePlaying = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (!el.paused && !el.ended) return;
    el.play().catch(() => {
      // Blocked: force muted playback, which browsers always allow.
      el.muted = true;
      setMuted(true);
      el.play().catch(() => {});
    });
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    el.muted = true;
    el.playsInline = true;
    setMuted(true);
    ensurePlaying();

    const readyEvents: (keyof HTMLMediaElementEventMap)[] = [
      "loadeddata",
      "canplay",
      "pause",
      "stalled",
      "suspend",
    ];
    readyEvents.forEach((e) => el.addEventListener(e, ensurePlaying));

    const onVisible = () => {
      if (!document.hidden) ensurePlaying();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      readyEvents.forEach((e) => el.removeEventListener(e, ensurePlaying));
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [ensurePlaying]);

  const unmute = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    el.volume = 1;
    setMuted(false);
    el.play().catch(() => {
      el.muted = true;
      setMuted(true);
      el.play().catch(() => {});
    });
  }, []);

  const toggleSound = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.muted) {
      unmute();
    } else {
      el.muted = true;
      setMuted(true);
    }
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <video
        ref={videoRef}
        poster={HQ_VIDEO_POSTER}
        className="photo-plate h-full w-full cursor-pointer object-cover"
        autoPlay
        loop
        muted
        playsInline
        webkit-playsinline="true"
        preload="auto"
        aria-label={label}
        onClick={toggleSound}
      >
        <source src={HQ_VIDEO_SRC} type="video/mp4" />
        <source src={HQ_VIDEO_SRC_WEBM} type="video/webm" />
      </video>
      <button
        type="button"
        onClick={toggleSound}
        aria-pressed={!muted}
        aria-label={
          muted
            ? rtl
              ? "تشغيل صوت المقطع"
              : "Turn video sound on"
            : rtl
              ? "إيقاف صوت المقطع"
              : "Turn video sound off"
        }
        className={cn(
          "absolute bottom-3 z-10 inline-flex items-center gap-2 rounded-full border border-ivory/30 bg-ink/70 px-3 py-2 text-xs text-ivory backdrop-blur-md transition-colors hover:bg-ink/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
          rtl ? "left-3" : "right-3",
        )}
      >
        {muted ? (
          <VolumeX className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Volume2 className="h-4 w-4" aria-hidden="true" />
        )}
        <span>{muted ? t(inl.t_15e4f98a) : t(inl.t_ac3b32d5)}</span>
      </button>
    </div>
  );
}
