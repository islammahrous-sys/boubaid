import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/**
 * Top navigation progress bar.
 *
 * Provides immediate tactile feedback the millisecond a visitor clicks
 * any link or changes routes, eliminating perceived frozen state during
 * data fetches or code splitting loads.
 */
export function TopProgressBar() {
  const isNavigating = useRouterState({ select: (s) => s.status === "pending" || s.isLoading });
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let timer1: number | undefined;
    let timer2: number | undefined;
    let exitTimer: number | undefined;

    if (isNavigating) {
      setVisible(true);
      setProgress(30);

      timer1 = window.setTimeout(() => {
        setProgress(65);
      }, 120);

      timer2 = window.setTimeout(() => {
        setProgress(85);
      }, 350);
    } else if (visible) {
      setProgress(100);
      exitTimer = window.setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 220);
    }

    return () => {
      window.clearTimeout(timer1);
      window.clearTimeout(timer2);
      window.clearTimeout(exitTimer);
    };
  }, [isNavigating, visible, mounted]);

  const show = mounted && (visible || isNavigating);

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-[100] h-[2.5px] pointer-events-none bg-transparent overflow-hidden transition-opacity duration-200",
        show ? "opacity-100" : "opacity-0",
      )}
      role="progressbar"
      aria-label="Navigation progress"
    >
      <div
        className={cn(
          "h-full bg-gradient-to-r from-bronze via-gold to-amber-500 transition-all duration-200 ease-out shadow-[0_0_8px_rgba(236,166,84,0.5)]",
          progress === 100 && "opacity-0 transition-opacity duration-200",
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
