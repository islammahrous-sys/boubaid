// Server-only: lightweight per-IP throttle for the public write endpoints
// (contact, newsletter, nominations, business listings, event/initiative
// registrations). Never import this from route files or *.functions.ts at
// module scope — load it inside handlers via dynamic import, same convention
// as src/lib/turnstile.server.ts.
//
// Per-process, in-memory fixed-window counters: no external dependency, resets
// on deploy/restart, and is NOT shared between instances. It is a first line of
// defence in front of Supabase's own limits — an edge/WAF rule is still the
// right answer for a determined flood — but it turns "unlimited anonymous
// inserts" into "a few per IP per window", which is the difference that matters
// for a family-foundation site.

import { getRequest } from "@tanstack/react-start/server";

type Window = { count: number; windowStart: number };

const windows = new Map<string, Window>();
const MAX_TRACKED_KEYS = 20_000;

let warnedAboutMissingIp = false;

/**
 * Caller IP as reported by the hosting proxy. Returns "unknown" when no proxy
 * header is present (e.g. a bare `node server.js` with nothing in front of it).
 */
export function getRequestIp(): string {
  try {
    const request = getRequest();
    const headers = request?.headers;
    if (!headers) return "unknown";

    // x-forwarded-for is the general case; the rest cover the platforms this
    // site is likely to sit behind.
    const forwardedFor = headers.get("x-forwarded-for");
    if (forwardedFor) {
      const first = forwardedFor.split(",")[0]?.trim();
      if (first) return first;
    }

    return (
      headers.get("cf-connecting-ip")?.trim() ||
      headers.get("x-nf-client-connection-ip")?.trim() ||
      headers.get("x-real-ip")?.trim() ||
      "unknown"
    );
  } catch {
    return "unknown";
  }
}

/** Fixed-window counter. Returns true once `max` is exceeded inside `windowMs`. */
export function isRateLimited(scope: string, key: string, max: number, windowMs: number): boolean {
  const now = Date.now();

  // Opportunistically prune so the map can't grow unbounded under a flood.
  if (windows.size > MAX_TRACKED_KEYS) {
    for (const [mapKey, entry] of windows) {
      if (now - entry.windowStart > windowMs) windows.delete(mapKey);
    }
    // Still saturated (a distributed flood) — drop everything rather than leak.
    if (windows.size > MAX_TRACKED_KEYS) windows.clear();
  }

  const mapKey = `${scope}:${key}`;
  const entry = windows.get(mapKey);
  if (!entry || now - entry.windowStart > windowMs) {
    windows.set(mapKey, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  return entry.count > max;
}

/**
 * Throttle a public submission by caller IP.
 *
 * When no proxy header identifies the caller we deliberately do NOT throttle:
 * every request would otherwise collapse into a single "unknown" bucket and a
 * misconfigured proxy would lock the whole site's forms for everyone. The
 * honeypot and Turnstile remain in place in that case.
 */
export function isPublicSubmissionRateLimited(
  scope: string,
  options?: { max?: number; windowMs?: number },
): boolean {
  const ip = getRequestIp();
  if (ip === "unknown") {
    if (!warnedAboutMissingIp) {
      warnedAboutMissingIp = true;
      console.warn(
        "[rate-limit] no client IP header on the request — public form throttling is inactive. " +
          "Ensure the host forwards x-forwarded-for (or cf-connecting-ip).",
      );
    }
    return false;
  }

  return isRateLimited(scope, ip, options?.max ?? 5, options?.windowMs ?? 10 * 60 * 1000);
}

/** Throttle an authenticated submission by user id (IP-independent). */
export function isUserSubmissionRateLimited(
  scope: string,
  userId: string,
  options?: { max?: number; windowMs?: number },
): boolean {
  return isRateLimited(scope, userId, options?.max ?? 15, options?.windowMs ?? 60 * 60 * 1000);
}
