import { type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Route-level transition. Each new page enters with a short fade and rise
 * on the editorial curve, from its top rather than mid-scroll, so
 * navigation reads as a page being turned instead of a hard cut.
 *
 * Header, footer, and mobile nav sit outside this wrapper and never
 * participate — chrome should feel fixed while content moves.
 *
 * Scroll position is left entirely to the router's own `scrollRestoration`
 * (see router.tsx) — this component used to also force `scrollTo(0, 0)` on
 * every pathname change, which raced the router's own restore-on-back/
 * forward logic and made back-navigation jump to the top instead of
 * returning to where the user was.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div key={pathname} className="page-transition" data-state="entering">
      {children}
    </div>
  );
}
