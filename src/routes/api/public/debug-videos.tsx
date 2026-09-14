import { createFileRoute } from "@tanstack/react-router";

/** Temporary diagnostic endpoint for the Archive video audit. */
export const Route = createFileRoute("/api/public/debug-videos")({
  server: {
    handlers: {
      GET: async () => {
        const out: Record<string, unknown> = {};
        try {
          const { createPublicServerClient } = await import("@/lib/supabase-public.server");
          const supabase = createPublicServerClient();
          const folders = await supabase
            .from("galleries")
            .select("id, slug, title_ar, title_en, sort_order")
            .eq("status", "published")
            .eq("visibility", "public")
            .eq("section", "archive")
            .order("sort_order", { ascending: true })
            .limit(500);
          out.folders = folders.data?.length ?? null;
          out.folderError = folders.error?.message ?? null;
          const ids = (folders.data ?? []).map((f) => f.id);
          const links = await supabase
            .from("gallery_media")
            .select("media_asset_id, gallery_id, caption_ar, caption_en, sort_order")
            .eq("is_published", true)
            .in("gallery_id", ids)
            .order("sort_order", { ascending: true })
            .limit(2000);
          out.links = links.data?.length ?? null;
          out.linkError = links.error?.message ?? null;
          const assetIds = [...new Set((links.data ?? []).map((l) => l.media_asset_id))];
          out.assetIds = assetIds.length;
          const assets = await supabase
            .from("media_assets")
            .select("id, bucket, storage_path, public_url, mime_type, width, height")
            .in("id", assetIds)
            .like("mime_type", "video%");
          out.assets = assets.data?.length ?? null;
          out.assetError = assets.error?.message ?? null;
          out.sample = assets.data?.slice(0, 2) ?? null;
        } catch (err) {
          out.thrown = String(err);
        }
        return new Response(JSON.stringify(out), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
