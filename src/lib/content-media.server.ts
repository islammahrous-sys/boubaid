import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Media for CMS rows lives in the private `content` bucket. Uploads go through
 * a role-checked server function and reads are served as signed URLs minted at
 * request time, so no storage-level policies are needed.
 */

const BUCKET = "content";
const SIGN_TTL_SECONDS = 60 * 60 * 24 * 7; // one week

/** True when the stored value is a bucket object key (not an absolute/site URL). */
export function isStoragePath(value: string | null | undefined): value is string {
  if (!value) return false;
  if (/^(https?:)?\/\//.test(value)) return false;
  if (value.startsWith("/") || value.startsWith("data:")) return false;
  return true;
}

/** Signed URLs keyed by object path; unknown or failed paths are simply absent. */
export async function signContentPaths(
  paths: (string | null | undefined)[],
): Promise<Record<string, string>> {
  const unique = [...new Set(paths.filter(isStoragePath))];
  if (unique.length === 0) return {};

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrls(unique, SIGN_TTL_SECONDS);

  if (error || !data) {
    console.error("[content-media] sign failed", error?.message);
    return {};
  }

  const map: Record<string, string> = {};
  data.forEach((entry, index) => {
    const key = entry.path ?? unique[index];
    if (key && entry.signedUrl) map[key] = entry.signedUrl;
  });
  return map;
}

/** Resolve a stored value to something a browser can load. */
export function resolveMedia(
  value: string | null | undefined,
  signed: Record<string, string>,
): string | null {
  if (!value) return null;
  if (isStoragePath(value)) return signed[value] ?? null;
  return value;
}

export async function uploadContentFile(
  path: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, bytes, {
    contentType,
    upsert: false,
  });
  if (error) {
    console.error("[content-media] upload failed", error.message);
    return { ok: false, error: "upload_failed" };
  }
  return { ok: true, path };
}
