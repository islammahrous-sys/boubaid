import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/i18n/LanguageProvider";
import hqVideo from "@/assets/hq-project.mp4.asset.json";

export interface HqProjectVideoProps {
  /** Accessible description of the footage. */
  label: string;
  className?: string;
}

/**
 * Looping architectural walkthrough for the Family Council Headquarters.
 * Playback always starts muted (the only mode browsers allow without a
 * gesture) and keeps retrying, then sound is switched on at the visitor's
 * first real interaction unless they chose to keep it off.
 */
export function HqProjectVideo({ label, className }: HqProjectVideoProps) {
  const { lang } = useLang();
  const rtl = lang === "ar";
  const videoRef = useRef<HTMLVideoElement>(null);
  const mutedByVisitor = useRef(false);
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

  const tryUnmute = useCallback(() => {
    const el = videoRef.current;
    if (!el || mutedByVisitor.current) return;
    const wasMuted = el.muted;
    el.muted = false;
    el.volume = 1;
    el.play()
      .then(() => setMuted(false))
      .catch(() => {
        el.muted = wasMuted || true;
        setMuted(true);
        el.play().catch(() => {});
      });
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    el.muted = true;
    el.playsInline = true;
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

    // Real user gestures unlock audio; scroll/wheel do not on mobile.
    const gestures: (keyof DocumentEventMap)[] = ["pointerup", "touchend", "click", "keydown"];
    const onGesture = () => {
      ensurePlaying();
      tryUnmute();
      if (!videoRef.current?.muted) detach();
    };
    const detach = () => gestures.forEach((e) => document.removeEventListener(e, onGesture));
    gestures.forEach((e) => document.addEventListener(e, onGesture, { passive: true }));

    // Try immediately too, in case this browser already allows sound.
    tryUnmute();

    return () => {
      readyEvents.forEach((e) => el.removeEventListener(e, ensurePlaying));
      document.removeEventListener("visibilitychange", onVisible);
      detach();
    };
  }, [ensurePlaying, tryUnmute]);

  const toggleSound = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.muted) {
      mutedByVisitor.current = false;
      tryUnmute();
    } else {
      mutedByVisitor.current = true;
      el.muted = true;
      setMuted(true);
    }
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <video
        ref={videoRef}
        src={hqVideo.url}
        className="photo-plate h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        // @ts-expect-error legacy iOS attribute
        webkit-playsinline="true"
        preload="auto"
        aria-label={label}
      />
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
        <span>{muted ? (rtl ? "تشغيل الصوت" : "Sound on") : rtl ? "كتم الصوت" : "Sound off"}</span>
      </button>
    </div>
  );
}
