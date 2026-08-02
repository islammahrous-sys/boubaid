import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import heroVideo from "@/assets/hero-video.mp4.asset.json";

/**
 * Resolve the video URL.
 *
 * `heroVideo.url` is a `/__l5e/assets-v1/…` path that only resolves
 * behind the Lovable preview proxy (the editor, or `localhost` with
 * `LOVABLE_PREVIEW_HOST` set). In production the proxy doesn't exist,
 * so we construct the direct Cloudflare R2 / Lovable CDN URL instead.
 *
 * Hierarchy:
 *  1. If running inside the Lovable preview (origin contains "lovable"),
 *     use the relative proxy path — it's the fastest route.
 *  2. Otherwise build the public CDN URL from the r2_key stored in the
 *     asset manifest.
 */
function resolveVideoUrl(): string {
  // During SSR there is no `window`; return the relative path (unused
  // because the video element is client-only anyway).
  if (typeof window === "undefined") return heroVideo.url;

  const origin = window.location.origin;
  if (origin.includes("lovable")) {
    // Running inside Lovable preview — the proxy handles `/__l5e/…`.
    return heroVideo.url;
  }

  // Production / self-hosted: build a direct URL from the R2 key.
  // Lovable serves user assets from `https://lovable.dev/uploads/<r2_key>`.
  return `https://lovable.dev/uploads/${heroVideo.r2_key}`;
}

interface HeroVideoProps {
  poster?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Full-bleed cinematic hero background. Autoplay-muted-loop-inline video
 * with a gradient scrim; falls back to the poster image for users who
 * prefer reduced motion or on slow connections where autoplay is blocked.
 */
export function HeroVideo({ poster, children, className }: HeroVideoProps) {
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

    setVideoSrc(resolveVideoUrl());
    setShowVideo(true);
  }, []);

  // ── Callback ref: kick playback as soon as the element mounts ──
  const attachVideo = useCallback(
    (el: HTMLVideoElement | null) => {
      (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
      if (!el) return;

      el.playbackRate = 0.6;

      const tryPlay = () => {
        el.playbackRate = 0.6;
        el.play().catch(() => {
          /* autoplay blocked — poster stays visible */
        });
      };

      if (el.readyState >= 2) {
        tryPlay();
      } else {
        el.addEventListener("loadeddata", tryPlay, { once: true });
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
      <div className="absolute inset-0 z-0 origin-top scale-100 lg:origin-[30%_top] lg:scale-[1.28]">
        <div className="h-full w-full motion-safe:animate-hero-zoom">
          {poster ? (
            <img
              src={poster}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-[center_center] lg:object-[30%_top]"
              fetchPriority="high"
            />
          ) : null}

          {showVideo && videoSrc && !errored ? (
            <video
              ref={attachVideo}
              className={
                "absolute inset-0 h-full w-full object-cover object-[center_center] lg:object-[30%_top] transition-opacity duration-[1400ms] ease-out " +
                (loaded ? "opacity-100" : "opacity-0")
              }
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
