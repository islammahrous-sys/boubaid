import { createFileRoute } from "@tanstack/react-router";
import { fundDocuments } from "@/content/fund-documents";

/**
 * View-only delivery for the fund's statutory documents.
 *
 * The UI references documents by id only — the underlying asset URL is never
 * rendered into the page — and this handler streams the bytes back inline with
 * `Content-Disposition: inline`, so the browser opens the file in the embedded
 * viewer instead of saving it. Source resolution is host-independent (see
 * `document-source.server`). This is a delivery-level measure, not DRM: a
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

        const { streamDocumentInline } = await import("@/lib/document-source.server");
        return streamDocumentInline(doc.href, url.origin);
      },
    },
  },
});
