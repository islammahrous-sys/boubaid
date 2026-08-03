import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

/**
 * Global scroll-reveal engine.
 *
 * Adds `.revealed` to any element carrying one of the reveal variants
 * (`reveal-on-scroll`, `reveal-rise`, `reveal-fade`, `reveal-plate`,
 * `reveal-rule`) or a `.reveal-stagger` container once it enters the
 * viewport, and stamps an index onto staggered children so the cascade
 * works for grids of any length. Rescans on route changes.
 */
const VARIANTS = [
  "reveal-on-scroll",
  "reveal-rise",
  "reveal-fade",
  "reveal-plate",
  "reveal-rule",
  "reveal-stagger",
] as const;

const SELECTOR = VARIANTS.map((v) => `.${v}:not(.revealed)`).join(", ");
const ALL = VARIANTS.map((v) => `.${v}`).join(", ");

export function ScrollReveal() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const revealAll = () =>
        document.querySelectorAll(ALL).forEach((el) => el.classList.add("revealed"));
      // Same hydration caveat as below: let the route content hydrate first.
      const t = window.setTimeout(revealAll, 220);
      const unsub = router.subscribe("onResolved", () =>
        requestAnimationFrame(() => requestAnimationFrame(revealAll)),
      );
      return () => {
        window.clearTimeout(t);
        unsub();
      };
    }


    /**
     * Sequence siblings that share a reveal variant so a heading, its rule,
     * its body copy and its plate arrive as one choreographed phrase rather
     * than four simultaneous fades. Index is per parent, capped so a long
     * column never accumulates a visible wait.
     */
    const stampSequence = (el: HTMLElement) => {
      if (el.dataset["revealIndexed"]) return;
      const parent = el.parentElement;
      if (!parent) return;
      const siblings = Array.from(parent.children).filter(
        (c) => c instanceof HTMLElement && c.matches(ALL),
      );
      siblings.forEach((c, i) => {
        const child = c as HTMLElement;
        child.dataset["revealIndexed"] = "1";
        child.style.setProperty("--reveal-i", String(Math.min(i, 5)));
      });
    };

    const stampChildren = (container: HTMLElement) => {
      if (container.dataset["staggerIndexed"]) return;
      container.dataset["staggerIndexed"] = "1";
      Array.from(container.children).forEach((c, i) => {
        (c as HTMLElement).style.setProperty("--reveal-i", String(Math.min(i, 11)));
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          if (el.classList.contains("reveal-stagger")) stampChildren(el);
          else stampSequence(el);
          el.classList.add("revealed");
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const scan = () => {
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => io.observe(el));
    };

    /**
     * Route content sits behind a Suspense boundary, so on a fresh page load
     * it hydrates a beat after this effect runs. Touching classes or inline
     * styles on markup React hasn't claimed yet makes it report a hydration
     * mismatch and refuse to patch the tree.
     *
     * React stamps a `__reactFiber$…` key on every DOM node it hydrates, so
     * that key is an exact signal — no timing guesswork. Poll for it, then
     * start observing; bail out after a couple of seconds so a page that
     * somehow never hydrates still shows its content.
     */
    const isHydrated = (el: Element) =>
      Object.keys(el).some((k) => k.startsWith("__reactFiber$"));

    let tries = 0;
    let poll = 0;
    const waitForHydration = () => {
      // Check the LAST candidate: earlier ones can live in the already
      // hydrated header/footer, which would let the scan start too soon.
      const all = document.querySelectorAll(ALL);
      const last = all[all.length - 1];
      if (!last || isHydrated(last) || tries > 60) {

        scan();
        return;
      }
      tries += 1;
      poll = window.setTimeout(waitForHydration, 32);
    };
    waitForHydration();

    const unsub = router.subscribe("onResolved", () => {
      // Client navigations are already hydrated — just rescan after commit.
      requestAnimationFrame(() => requestAnimationFrame(scan));
    });

    return () => {
      window.clearTimeout(poll);
      unsub();
      io.disconnect();
    };
  }, [router]);




  return null;
}
