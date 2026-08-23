import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import heroVideo from "@/assets/hero-video.mp4.asset.json";

const SUPABASE_HERO_VIDEO_URL =
  "https://ywsvittlswbbyqhahorh.supabase.co/storage/v1/object/public/site-media/general/hero-video.mp4";

/**
 * Resolve the video URL.
 * Defaults to the permanent Supabase Storage CDN URL where the original video is hosted.
 */
function resolveVideoUrl(): string {
  if (typeof window === "undefined") return SUPABASE_HERO_VIDEO_URL;

  const origin = window.location.origin;
  if (origin.includes("lovable") && heroVideo?.url) {
    return heroVideo.url;
  }

  return SUPABASE_HERO_VIDEO_URL;
}

interface HeroVideoProps {
  poster?: string;
  videoUrl?: string | null;
  children: ReactNode;
  className?: string;
}

/**
 * Full-bleed cinematic hero background. Autoplay-muted-loop-inline video
 * with a gradient scrim; falls back to the poster image for users who
 * prefer reduced motion or on slow connections where autoplay is blocked.
 */
export function HeroVideo({ poster, videoUrl, children, className }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [errored, setErrored] = useState(false);

  // ── Gate: decide whether to show the video at all ──────────────
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const conn = (
      navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
    ).connection;
    if (conn?.saveData || conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g") return;

    setVideoSrc(videoUrl && videoUrl.trim() !== "" ? videoUrl : resolveVideoUrl());
    setShowVideo(true);
  }, [videoUrl]);

  // ── Callback ref: kick playback as soon as the element mounts ──
  const attachVideo = useCallback(
    (el: HTMLVideoElement | null) => {
      (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
      if (!el) return;

      el.playbackRate = 1.0;

      const tryPlay = () => {
        el.playbackRate = 1.0;
        el.play().catch(() => {
          /* autoplay blocked — poster stays visible */
        });
      };

      if (el.readyState >= 2) {
        tryPlay();
      } else {
        el.addEventListener("loadeddata", tryPlay, { once: true });
        el.addEventListener("canplay", () => setLoaded(true), { once: true });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showVideo],
  );

  // If the video source errors (404 / network), hide and keep poster.
  const handleError = useCallback(() => {
    setErrored(true);
    setLoaded(false);
  }, []);

  return (
    <section className={"relative isolate overflow-hidden bg-ink text-ivory " + (className ?? "")}>
      {/* Two nested wrappers, not one — a static Tailwind `scale-*` utility
          and a `transform`-driven keyframe animation on the same element
          fight over the same CSS property and the animation always wins,
          silently dropping the static scale. Splitting the desktop crop
          (outer, static) from the slow zoom (inner, animated) lets both
          apply at once. */}
      <div
        className="absolute inset-0 z-0 origin-top scale-100 lg:origin-[30%_top]"
        style={{ transform: "translate3d(0, 0, 0)", backfaceVisibility: "hidden" }}
      >
        <div className="h-full w-full">
          {poster ? (
            <img
              src={poster}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-center"
              fetchPriority="high"
            />
          ) : null}

          {showVideo && videoSrc && !errored ? (
            <video
              ref={attachVideo}
              className={
                "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ease-out " +
                (loaded ? "opacity-100" : "opacity-0")
              }
              style={{ transform: "translate3d(0, 0, 0)", backfaceVisibility: "hidden" }}
              src={videoSrc}
              poster={poster}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              {...({ "webkit-playsinline": "" } as Record<string, string>)}
              disablePictureInPicture
              disableRemotePlayback
              aria-hidden="true"
              onCanPlay={() => setLoaded(true)}
              onError={handleError}
            />
          ) : null}
        </div>
      </div>

      {/* Cinematic scrims — outside the transformed wrapper so gradients cover full frame */}
      <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/40 to-ink" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_28%,rgba(0,0,0,0.6)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(237,167,70,0.12)_0%,transparent_65%)]" />
        {/* Extra bottom fade to solid ink — masks the video watermark before the colophon strip */}
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent via-ink/80 to-ink" />
      </div>

      <div className="relative z-10">{children}</div>
    </section>
  );
}
