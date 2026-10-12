import { createFileRoute } from "@tanstack/react-router";
import { committeeDocuments } from "@/content/committee-documents";

/**
 * View-only inline delivery for committee plans and letters — same delivery
 * model as /api/public/fund-doc: documents are referenced by id only and
 * streamed back with `Content-Disposition: inline`, from a host-independent
 * source (see `document-source.server`).
 */
export const Route = createFileRoute("/api/public/committee-doc")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const id = url.searchParams.get("id") ?? "";
        const doc = committeeDocuments.find((d) => d.id === id);
        if (!doc) return new Response("Not found", { status: 404 });

        const { streamDocumentInline } = await import("@/lib/document-source.server");
        return streamDocumentInline(doc.href, url.origin);
      },
    },
  },
});
