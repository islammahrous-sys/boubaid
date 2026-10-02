// Server-only helpers shared by the unauthenticated auth-email server functions.
// Load via dynamic import inside handlers, like the other *.server.ts modules.

import { getRequest } from "@tanstack/react-start/server";

function originOf(value: string | undefined | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/** Origins an auth email link is allowed to point at: the configured site and the host serving this request. */
function allowedOrigins(): Set<string> {
  const origins = new Set<string>();
  const site = originOf(process.env.VITE_SITE_URL || "https://www.boubaid.com");
  if (site) {
    origins.add(site);
    const url = new URL(site);
    const alt = url.hostname.startsWith("www.")
      ? url.hostname.slice(4)
      : `www.${url.hostname}`;
    origins.add(`${url.protocol}//${alt}`);
  }
  try {
    const requestOrigin = originOf(getRequest()?.url);
    if (requestOrigin) origins.add(requestOrigin);
  } catch {
    // no request context
  }
  return origins;
}

/**
 * Never trust a caller-supplied redirect: the emailed link carries a live
 * recovery/confirmation token, so a foreign origin would hand that token to
 * the attacker. Anything off-allowlist falls back to `<site>/<fallbackPath>`.
 */
export function resolveSafeRedirect(raw: string | undefined, fallbackPath: string): string {
  const siteOrigin = originOf(process.env.VITE_SITE_URL || "https://www.boubaid.com")!;
  const fallback = `${siteOrigin}${fallbackPath}`;
  if (!raw) return fallback;
  try {
    const url = new URL(raw);
    if (!["https:", "http:"].includes(url.protocol)) return fallback;
    if (!allowedOrigins().has(url.origin)) return fallback;
    // Only keep the path — query/hash from the caller are never needed.
    return `${url.origin}${url.pathname}`;
  } catch {
    return fallback;
  }
}

/** Email of the bearer-token session on this request, if any (validated by Supabase). */
async function sessionEmail(): Promise<string | null> {
  try {
    const header = getRequest()?.headers.get("authorization") ?? "";
    if (!header.startsWith("Bearer ")) return null;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.auth.getUser(header.slice(7));
    return data.user?.email?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

export type AuthEmailGuardResult = { ok: true } | { ok: false; error: string };

/**
 * Anti-abuse gate for unauthenticated functions that send mail. Turnstile is
 * always verified (it is a no-op only when the deployment has no Turnstile keys),
 * except when the caller already holds a session for the very address involved
 * (account-page "reset my password"). Per-IP and per-address throttles apply
 * to everyone.
 */
export async function guardAuthEmail(options: {
  scope: string;
  email: string;
  turnstileToken?: string;
}): Promise<AuthEmailGuardResult> {
  const { getRequestIp, checkPublicSubmissionRateLimit, checkKeyRateLimit } =
    await import("@/lib/public-forms-rate-limit.server");

  if (await checkPublicSubmissionRateLimit(`${options.scope}:ip`, { max: 10, windowMs: 60 * 60 * 1000 })) {
    return { ok: false, error: "rate_limited" };
  }
  if (await checkKeyRateLimit(`${options.scope}:email`, options.email, { max: 3, windowMs: 60 * 60 * 1000 })) {
    return { ok: false, error: "rate_limited" };
  }

  const own = await sessionEmail();
  if (own && own === options.email) return { ok: true };

  const { verifyTurnstileToken } = await import("@/lib/turnstile.server");
  const verification = await verifyTurnstileToken(options.turnstileToken, getRequestIp());
  if (!verification.ok) return { ok: false, error: "turnstile_failed" };
  return { ok: true };
}
