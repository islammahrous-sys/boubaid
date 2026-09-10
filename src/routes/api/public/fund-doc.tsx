import { createFileRoute } from "@tanstack/react-router";
import { fundDocuments } from "@/content/fund-documents";

/**
 * View-only delivery for the fund's statutory documents.
 *
 * The UI references documents by id only — the underlying asset URL is never
 * rendered into the page — and this handler streams the bytes back inline with
 * `Content-Disposition: inline`, so the browser opens the file in the embedded
 * viewer instead of saving it. This is a delivery-level measure, not DRM: a
 * determined user can still capture what their browser renders.
 */
export const Route = createFileRoute("/api/public/fund-doc")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const id = url.searchParams.get("id") ?? "";
        const doc = fundDocuments.find((d) => d.id === id);
        if (!doc) return new Response("Not found", { status: 404 });

        const target = new URL(doc.href, url.origin);
        const upstream = await fetch(target.toString());
        if (!upstream.ok || !upstream.body) {
          return new Response("Unavailable", { status: 502 });
        }

        return new Response(upstream.body, {
          status: 200,
          headers: {
            "Content-Type": upstream.headers.get("content-type") ?? "application/pdf",
            "Content-Disposition": "inline",
            "Cache-Control": "private, max-age=300",
            "X-Robots-Tag": "noindex, noimageindex",
          },
        });
      },
    },
  },
});
