import { Loader2 } from "lucide-react";

/**
 * Shown only when a navigation's loader is still running after
 * `defaultPendingMs` (see router.tsx) — most clicks resolve well under that
 * and never see this. Without it, a slow loader left the click looking
 * frozen: nothing rendered until the new page was fully ready.
 */
export function RoutePending() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-bronze dark:text-gold" aria-hidden="true" />
    </div>
  );
}
