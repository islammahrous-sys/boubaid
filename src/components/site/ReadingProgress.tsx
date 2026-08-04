import { useEffect, useState } from "react";

/**
 * A hairline progress rule for article routes. Reads how far through the
 * document body the reader is, not the whole window, so the bar completes at
 * the end of the text rather than at the end of the footer.
 *
 * Deliberately absent when there is nothing to scroll, and hidden from
 * assistive tech: it duplicates information the scrollbar already carries.
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const article = document.querySelector("article") ?? document.body;
      const rect = article.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 40) {
        setProgress(0);
        return;
      }
      const passed = Math.min(Math.max(-rect.top, 0), scrollable);
      setProgress(passed / scrollable);
    };

    const onScroll = () => {
      if (reduce) return measure();
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-40 h-px print:hidden"
    >
      <div
        className="h-px origin-left bg-bronze transition-transform duration-100 ease-linear dark:bg-gold rtl:origin-right"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
