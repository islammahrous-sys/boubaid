import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useLang } from "@/i18n/LanguageProvider";
import { inl } from "@/content/page-copy/heroimage-inline";

export interface HeroSlide {
  src: string;
  altAr: string;
  altEn: string;
  titleAr?: string;
  titleEn?: string;
  /** Custom object position classes per breakpoint, e.g. "object-[55%_center] lg:object-[50%_35%]" */
  objectPosition?: string;
}

/**
 * Permanent Supabase-hosted hero photographs. Al-Ahsa leads: the family's
 * identity is the oasis (Al-Mubarraz), so the first frame visitors see is home.
 * Bucket: public 'site-media' under 'hero/' folder.
 */
export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    src: "https://ywsvittlswbbyqhahorh.supabase.co/storage/v1/object/public/site-media/hero/al-ahsa-oasis.jpg",
    altAr: "واحة الأحساء وبساتين النخيل وقنوات الري التراثية",
    altEn: "Al-Ahsa Oasis palm groves and heritage irrigation channels",
    titleAr: "واحة الأحساء النخيلية",
    titleEn: "Al-Ahsa Date Palm Oasis",
    objectPosition: "object-center",
  },
  {
    src: "https://ywsvittlswbbyqhahorh.supabase.co/storage/v1/object/public/site-media/hero/al-qarah-mountain.jpg",
    altAr: "جبل القارة وتكويناته الصخرية البديعة في الأحساء",
    altEn: "Al-Qarah Mountain and distinctive rock formations in Al-Ahsa",
    titleAr: "جبل القارة بالأحساء",
    titleEn: "Al-Qarah Mountain in Al-Ahsa",
    objectPosition: "object-[50%_30%] sm:object-[50%_35%] lg:object-[center_35%]",
  },
  {
    src: "https://ywsvittlswbbyqhahorh.supabase.co/storage/v1/object/public/site-media/hero/al-masmak-fort.jpg",
    altAr: "قصر المصمك التاريخي وعلم المملكة العربية السعودية",
    altEn: "Historic Al-Masmak Fortress and Saudi Arabia flag",
    titleAr: "قصر المصمك التاريخي",
    titleEn: "Historic Al-Masmak Fortress",
    objectPosition: "object-[60%_center] sm:object-[55%_center] lg:object-[50%_35%]",
  },
];

export interface HeroImageProps {
  slides?: HeroSlide[];
  autoplayInterval?: number;
  children: ReactNode;
  /** Strip rendered under the hero content (e.g. quick links). Kept outside the
   *  content box so the slide dots never sit on top of it, whatever its height. */
  colophon?: ReactNode;
  className?: string;
}

/**
 * Full-bleed cinematic image sequence hero background.
 * Seamless cross-fade between Supabase-hosted heritage photographs,
 * with gradient scrims, touch swipe navigation, keyboard controls,
 * pause-on-interaction, and full prefers-reduced-motion accessibility.
 */
export function HeroImage({
  slides = DEFAULT_HERO_SLIDES,
  autoplayInterval = 6000,
  children,
  colophon,
  className,
}: HeroImageProps) {
  const { lang, t } = useLang();
  const rtl = lang === "ar";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  // Touch gesture coordinates
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLElement>(null);

  const validSlides = slides.filter((_, idx) => !failedImages[idx]);
  const activeSlides = validSlides.length > 0 ? slides : DEFAULT_HERO_SLIDES;
  const totalSlides = activeSlides.length;

  // ── Reduced motion detection ──────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ── Navigation helpers ─────────────────────────────────────────
  const goToSlide = useCallback(
    (index: number) => {
      setCurrentIndex((index + totalSlides) % totalSlides);
    },
    [totalSlides],
  );

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  // ── Autoplay interval (auto cycles every 6s, restarts on slide change) ──────
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, autoplayInterval);

    return () => clearInterval(timer);
  }, [autoplayInterval, isPaused, currentIndex, totalSlides]);

  // ── Touch swipe gestures ───────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      setIsPaused(true);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) {
      setIsPaused(false);
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX.current;
    const diffY = touchEndY - touchStartY.current;

    // Trigger only if horizontal swipe dominates vertical scroll
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
      if (rtl) {
        // In RTL, swipe to right goes to next; swipe to left goes to prev
        if (diffX > 0) nextSlide();
        else prevSlide();
      } else {
        // In LTR, swipe to left goes to next; swipe to right goes to prev
        if (diffX < 0) nextSlide();
        else prevSlide();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    setIsPaused(false);
  };

  // ── Keyboard accessibility ─────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (rtl) nextSlide();
      else prevSlide();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (rtl) prevSlide();
      else nextSlide();
    }
  };

  const handleImageError = (index: number) => {
    setFailedImages((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <section
      ref={containerRef}
      className={cn(
        "relative isolate overflow-hidden bg-ink text-ivory outline-none select-none",
        className,
      )}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label={rtl ? "معرض الصور التاريخية بالواجهة" : "Homepage Heritage Hero Showcase"}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Visual Image Carousel Background Layers */}
      <div
        className="absolute inset-0 z-0 overflow-hidden"
        style={{ transform: "translate3d(0, 0, 0)", backfaceVisibility: "hidden" }}
        aria-hidden="true"
      >
        {activeSlides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.src}
              className={cn(
                "absolute inset-0 h-full w-full transition-opacity duration-1000 ease-in-out",
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none",
              )}
            >
              <img
                src={slide.src}
                alt={rtl ? slide.altAr : slide.altEn}
                fetchPriority={idx === 0 ? "high" : "auto"}
                loading={idx === 0 ? "eager" : "lazy"}
                decoding="async"
                onError={() => handleImageError(idx)}
                className={cn(
                  "h-full w-full object-cover transition-transform duration-[8000ms] ease-out",
                  slide.objectPosition ?? "object-center",
                  !prefersReducedMotion && isActive ? "scale-[1.04]" : "scale-100",
                )}
              />
            </div>
          );
        })}
      </div>

      {/* Cinematic Scrims: Multi-layer gradient wash preserving text contrast & gold highlights */}
      <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden="true">
        {/* Base dark contrast gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/45 to-ink" />
        {/* Radial vignette for cinematic depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(0,0,0,0.65)_100%)]" />
        {/* Subtle warm gold ambient light at center */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(237,167,70,0.14)_0%,transparent_65%)]" />
        {/* Deep bottom fade blending seamlessly into the colophon strip */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent via-ink/80 to-ink" />
      </div>

      {/* Foreground content, then the colophon strip */}
      <div className="relative z-10">
        <div className="relative">
          {children}
          {/* Slide dots: anchored to the bottom of the content box, above the colophon */}
          {totalSlides > 1 && (
            <div
              className="absolute inset-x-0 bottom-14 lg:bottom-6 z-20 mx-auto flex items-center justify-center gap-2 pointer-events-auto"
              role="tablist"
              aria-label={t(inl.t_7c264f79)}
            >
              <div
                className="inline-flex items-center rounded-full border border-gold/30 bg-ink/70 px-1 py-0.5 backdrop-blur-md shadow-lg shadow-black/40"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {activeSlides.map((slide, idx) => {
                  const isActive = idx === currentIndex;
                  const title = rtl
                    ? slide.titleAr || `الصورة ${idx + 1}`
                    : slide.titleEn || `Slide ${idx + 1}`;

                  return (
                    <button
                      key={idx}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={rtl ? `عرض ${title}` : `View ${title}`}
                      onClick={() => goToSlide(idx)}
                      // The visible dot is the inner span; the button around it is the
                      // touch target (at least 40×40px).
                      className="group flex h-10 min-w-10 items-center justify-center px-1 focus-visible:outline-none"
                    >
                      <span
                        className={cn(
                          "block h-2 rounded-full transition-[width,background-color,box-shadow,transform] duration-300 ease-out group-focus-visible:ring-2 group-focus-visible:ring-gold",
                          isActive
                            ? "w-7 bg-gold shadow-[0_0_10px_rgba(237,167,70,0.8)]"
                            : "w-2 bg-ivory/30 group-hover:bg-ivory/60 group-active:scale-95",
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {colophon}
      </div>
    </section>
  );
}
