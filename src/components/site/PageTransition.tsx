import { useState, useEffect, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Route-level transition. Each new page enters with a short fade and subtle rise
 * on the fast deceleration curve (220ms, 4px travel), so navigation reads as
 * an elegant page turn instead of a jarring cut.
 *
 * Header, footer, and mobile nav sit outside this wrapper and remain stationary.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    setIsEntering(true);
  }, [pathname]);

  return (
    <div
      key={pathname}
      className="page-transition"
      data-state={isEntering ? "entering" : "idle"}
      onAnimationEnd={() => setIsEntering(false)}
    >
      {children}
    </div>
  );
}
