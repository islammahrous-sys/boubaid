import { useEffect, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Route-level transition. Each new page enters with a short fade and rise
 * on the editorial curve, from its top rather than mid-scroll, so
 * navigation reads as a page being turned instead of a hard cut.
 *
 * Header, footer, and mobile nav sit outside this wrapper and never
 * participate — chrome should feel fixed while content moves.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0 });
  }, [pathname]);


  return (
    <div key={pathname} className="page-transition" data-state="entering">
      {children}
    </div>
  );
}
