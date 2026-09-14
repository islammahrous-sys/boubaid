import { createFileRoute } from "@tanstack/react-router";
import { getPublishedArchiveVideos } from "@/lib/cms.functions";

/** Temporary diagnostic endpoint for the Archive video audit. */
export const Route = createFileRoute("/api/public/debug-videos")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const videos = await getPublishedArchiveVideos();
          return new Response(JSON.stringify({ count: videos.length, sample: videos.slice(0, 2) }), {
            headers: { "content-type": "application/json" },
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: String(err) }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
