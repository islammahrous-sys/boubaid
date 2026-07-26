import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

/**
 * Global scroll-reveal engine. Adds `.revealed` to any element carrying
 * a `.reveal-on-scroll` or `.reveal-stagger` class once it enters the
 * viewport. Rescans on route changes so navigated pages animate too.
 */
export function ScrollReveal() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document
        .querySelectorAll(".reveal-on-scroll, .reveal-stagger")
        .forEach((el) => el.classList.add("revealed"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const scan = () => {
      document
        .querySelectorAll<HTMLElement>(
          ".reveal-on-scroll:not(.revealed), .reveal-stagger:not(.revealed)",
        )
        .forEach((el) => io.observe(el));
    };

    scan();
    const unsub = router.subscribe("onResolved", () => {
      // Rescan after DOM commit.
      requestAnimationFrame(() => requestAnimationFrame(scan));
    });

    return () => {
      unsub();
      io.disconnect();
    };
  }, [router]);

  return null;
}
