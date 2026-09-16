/**
 * Host-independent resolution of official document sources.
 *
 * Statutory and committee PDFs are referenced in `src/content/*-documents.ts`
 * by their externalised asset URL (`/__l5e/assets-v1/<asset-id>/<file>`). That
 * path is only served by the Lovable preview/publish host, so a deployment on
 * another host (Vercel) resolved it against its own origin and got a 404, which
 * the view-only proxy reported as 502 "Unavailable" — the documents never
 * opened in production.
 *
 * Every one of those assets is mirrored into the public Supabase Storage
 * bucket `documents-public` under `official-docs/<asset-id>.pdf`, which is
 * reachable from any host. This module returns the candidate URLs to try, in
 * order, so the proxy works identically on every deployment and any future
 * asset added the same way keeps working without per-document code changes.
 */

const DEFAULT_SUPABASE_URL = "https://ywsvittlswbbyqhahorh.supabase.co";
const MIRROR_BUCKET = "documents-public";
const MIRROR_PREFIX = "official-docs";
const DEFAULT_ASSET_ORIGIN = "https://alboabid-heritage-hub.lovable.app";

function supabaseBaseUrl(): string {
  return process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"] || DEFAULT_SUPABASE_URL;
}

/** Extract the externalised asset id from a `/__l5e/assets-v1/<id>/<file>` href. */
export function assetIdFromHref(href: string): string | null {
  const match = href.match(/\/assets-v1\/([0-9a-f-]{36})\//i);
  return match?.[1] ?? null;
}

/** Ordered list of absolute URLs to try for a stored document reference. */
export function documentSourceCandidates(href: string, origin: string): string[] {
  if (/^https?:\/\//i.test(href)) return [href];

  const candidates: string[] = [];
  const assetId = assetIdFromHref(href);
  if (assetId) {
    candidates.push(
      `${supabaseBaseUrl()}/storage/v1/object/public/${MIRROR_BUCKET}/${MIRROR_PREFIX}/${assetId}.pdf`,
    );
  }

  // Same-origin path: still correct on the Lovable host and for anything served
  // from /public, and acts as the fallback when no mirror exists yet.
  try {
    candidates.push(new URL(href, origin).toString());
  } catch {
    /* ignore malformed hrefs */
  }

  // Last resort for a newly added externalised asset that has not been mirrored
  // into Storage yet: the Lovable publish host always serves `/__l5e/...`, so a
  // future document keeps opening in production without a manual mirror step.
  if (assetId) {
    try {
      const lovableOrigin = process.env["LOVABLE_ASSET_ORIGIN"] || DEFAULT_ASSET_ORIGIN;
      const fallback = new URL(href, lovableOrigin).toString();
      if (!candidates.includes(fallback)) candidates.push(fallback);
    } catch {
      /* ignore */
    }
  }

  return candidates;
}

/**
 * Stream a stored document back to the browser inline (view-only), trying each
 * candidate source. Returns a 404/502 Response when nothing is reachable.
 */
export async function streamDocumentInline(href: string, origin: string): Promise<Response> {
  const candidates = documentSourceCandidates(href, origin);

  for (const url of candidates) {
    try {
      const upstream = await fetch(url);
      if (!upstream.ok || !upstream.body) continue;
      return new Response(upstream.body, {
        status: 200,
        headers: {
          "Content-Type": upstream.headers.get("content-type") ?? "application/pdf",
          "Content-Disposition": "inline",
          "Cache-Control": "private, max-age=300",
          "X-Robots-Tag": "noindex, noimageindex",
        },
      });
    } catch (err) {
      console.error("[document-source] fetch failed", url, err);
    }
  }

  console.error("[document-source] no reachable source", { href, candidates });
  return new Response("Unavailable", { status: 502 });
}
