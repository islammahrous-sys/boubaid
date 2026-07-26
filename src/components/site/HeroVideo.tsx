import { useEffect, useRef, useState, type ReactNode } from "react";
import heroVideo from "@/assets/hero-video.mp4.asset.json";

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

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    // Slow-connection guard.
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (conn?.saveData || conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g") return;
    setShowVideo(true);
  }, []);

  useEffect(() => {
    if (!showVideo || !videoRef.current) return;
    const v = videoRef.current;
    v.playbackRate = 0.6;
    const play = () => {
      v.playbackRate = 0.6;
      v.play().catch(() => undefined);
    };
    if (v.readyState >= 2) play();
    else v.addEventListener("loadeddata", play, { once: true });
  }, [showVideo]);


  return (
    <section
      className={
        "relative isolate overflow-hidden bg-ink text-ivory " + (className ?? "")
      }
    >
      {/* Poster / video wrapper — cropped to hide bottom-right watermark on desktop */}
      <div
        className="absolute inset-0 z-0 origin-top scale-100 lg:scale-[1.28] lg:origin-[30%_top] motion-safe:animate-hero-zoom"
      >
        {poster ? (
          <img
            src={poster}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-[center_center] lg:object-[30%_top]"
            fetchPriority="high"
          />
        ) : null}


        {showVideo ? (
          <video
            ref={videoRef}
            className={
              "absolute inset-0 h-full w-full object-cover object-[center_center] lg:object-[30%_top] transition-opacity duration-[1400ms] ease-out " +

              (loaded ? "opacity-100" : "opacity-0")
            }
            src={heroVideo.url}
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
          />
        ) : null}
      </div>

      {/* Cinematic scrims — outside the transformed wrapper so gradients cover full frame */}
      <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/40 to-ink" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_28%,rgba(0,0,0,0.6)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.12)_0%,transparent_65%)]" />
        {/* Extra bottom fade to solid ink — masks the video watermark before the colophon strip */}
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent via-ink/80 to-ink" />
      </div>

      <div className="relative z-10">{children}</div>
    </section>
  );
}
