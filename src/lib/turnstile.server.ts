// Server-only: Cloudflare Turnstile verification.
// Never import this from route files or *.functions.ts at module scope —
// load it inside handlers via dynamic import, same convention as
// src/integrations/supabase/client.server.ts uses for the service-role client.

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileVerifyResult = { ok: true } | { ok: false; error: string };

/**
 * Verifies a Cloudflare Turnstile token against Cloudflare's siteverify API.
 *
 * Only enforced when TURNSTILE_SECRET_KEY is configured server-side (get one
 * from the Cloudflare dashboard's Turnstile section). If the secret is unset,
 * verification is skipped entirely and this resolves to `{ ok: true }` so
 * existing form submissions keep working unchanged until the key is added.
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true };

  if (!token) return { ok: false, error: "missing_token" };

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set("remoteip", remoteIp);

    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      console.error("[turnstile] siteverify HTTP error", res.status);
      return { ok: false, error: "verification_error" };
    }

    const json = (await res.json()) as { success?: boolean; ["error-codes"]?: string[] };
    if (!json.success) {
      console.error("[turnstile] verification failed", json["error-codes"]);
      return { ok: false, error: "verification_failed" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[turnstile] siteverify request threw", err);
    return { ok: false, error: "verification_error" };
  }
}
