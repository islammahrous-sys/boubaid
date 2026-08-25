// Server-only: Cloudflare Turnstile verification.
// Never import this from route files or *.functions.ts at module scope —
// load it inside handlers via dynamic import, same convention as
// src/integrations/supabase/client.server.ts uses for the service-role client.

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileVerifyResult = { ok: true } | { ok: false; error: string };

// Statically replaced by Vite in both the client and the SSR bundle, so the
// server can tell whether the widget is rendering for visitors at all.
const BUILD_TIME_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

/** True when a site key was configured for this build — i.e. visitors see a widget. */
function isWidgetConfigured(): boolean {
  return Boolean(process.env.VITE_TURNSTILE_SITE_KEY || BUILD_TIME_SITE_KEY);
}

let warnedAboutDisabled = false;

/**
 * Verifies a Cloudflare Turnstile token against Cloudflare's siteverify API.
 *
 * Three configuration states, and the behaviour is deliberately different in
 * each — a half-configured deployment must not silently accept everything:
 *
 * 1. Secret set → the token is always verified. Any failure (bad token, missing
 *    token, siteverify unreachable, non-2xx, thrown fetch) REJECTS. Fails closed.
 * 2. Secret missing but VITE_TURNSTILE_SITE_KEY set → misconfiguration. The
 *    widget is challenging visitors and issuing tokens that nothing checks, so
 *    this REJECTS rather than quietly downgrading to no bot protection at all.
 * 3. Neither set → Turnstile is simply not in use on this deployment. Skips
 *    verification (forms fall back to honeypot + rate limiting, as documented in
 *    .env.example) and logs once so the state is visible in the server logs.
 */
export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (isWidgetConfigured()) {
      console.error(
        "[turnstile] VITE_TURNSTILE_SITE_KEY is configured but TURNSTILE_SECRET_KEY is missing — " +
          "refusing the submission instead of accepting an unverifiable token. Set the secret key.",
      );
      return { ok: false, error: "not_configured" };
    }

    if (!warnedAboutDisabled) {
      warnedAboutDisabled = true;
      console.warn(
        "[turnstile] no keys configured — bot protection is honeypot + rate limiting only.",
      );
    }
    return { ok: true };
  }

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
