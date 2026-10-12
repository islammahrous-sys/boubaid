import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * The governance content (الغرض والاختصاص، مجلس الأمناء) now lives on the
 * committees page (اللجان) under صندوق التنمية العائلية. This route is kept
 * only so the previously published /foundation URL never 404s.
 */
export const Route = createFileRoute("/foundation")({
  beforeLoad: () => {
    throw redirect({ to: "/committees", statusCode: 301 });
  },
});
