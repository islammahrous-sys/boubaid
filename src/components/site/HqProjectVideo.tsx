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
 * Plays continuously; ambient bird audio is enabled as early as the browser
 * allows (immediately, otherwise on the visitor's first interaction) and can
 * be muted at any time via the on-video control.
 */
export function HqProjectVideo({ label, className }: HqProjectVideoProps) {
  const { lang } = useLang();
  const rtl = lang === "ar";
  const videoRef = useRef<HTMLVideoElement>(null);
  const mutedByVisitor = useRef(false);
  const [muted, setMuted] = useState(true);

  const tryUnmute = useCallback(async () => {
    const el = videoRef.current;
    if (!el || mutedByVisitor.current) return;
    el.muted = false;
    el.volume = 1;
    try {
      await el.play();
      setMuted(false);
    } catch {
      el.muted = true;
      setMuted(true);
    }
  }, []);

  // Start playback muted (always allowed), then attempt sound right away and
  // again on the first visitor interaction if the browser blocked it.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    el.muted = true;
    void el.play().catch(() => {});
    void tryUnmute();

    const onInteract = () => {
      void tryUnmute();
    };
    const events: (keyof DocumentEventMap)[] = [
      "pointerdown",
      "keydown",
      "touchstart",
      "scroll",
      "wheel",
    ];
    events.forEach((e) => document.addEventListener(e, onInteract, { once: true, passive: true }));
    return () =>
      events.forEach((e) => document.removeEventListener(e, onInteract));
  }, [tryUnmute]);

  const toggleSound = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.muted) {
      mutedByVisitor.current = false;
      void tryUnmute();
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
