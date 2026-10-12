import { createFileRoute } from "@tanstack/react-router";

/**
 * Drains and retries queued notification emails. Intended for a scheduler
 * (Vercel Cron sends `Authorization: Bearer $CRON_SECRET`). Fails closed when
 * CRON_SECRET is not configured.
 */
export const Route = createFileRoute("/api/public/process-email-queue")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const secret = process.env.CRON_SECRET;
        if (!secret) return new Response("Not configured", { status: 503 });

        const { timingSafeEqual } = await import("node:crypto");
        const given = Buffer.from(request.headers.get("authorization") ?? "");
        const expected = Buffer.from(`Bearer ${secret}`);
        if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { processQueuedNotificationEmails } =
          await import("@/lib/email/notification-queue.server");
        const result = await processQueuedNotificationEmails(25);
        return Response.json(result);
      },
    },
  },
});
