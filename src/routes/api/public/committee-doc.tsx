import { createFileRoute } from "@tanstack/react-router";
import { committeeDocuments } from "@/content/committee-documents";

/**
 * View-only inline delivery for committee plans and letters — same delivery
 * model as /api/public/fund-doc: documents are referenced by id only and
 * streamed back with `Content-Disposition: inline`.
 */
export const Route = createFileRoute("/api/public/committee-doc")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const id = url.searchParams.get("id") ?? "";
        const doc = committeeDocuments.find((d) => d.id === id);
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
