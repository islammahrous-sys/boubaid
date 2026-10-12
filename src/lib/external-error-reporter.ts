// Optional, env-gated scaffold for forwarding captured errors to an external
// crash monitor (e.g. Sentry). Intentionally dependency-free: adding a real
// @sentry/* SDK is an unreviewed dependency bump, so this ships a minimal,
// generic reporter interface instead. With no env var set, every call here
// is a no-op and behavior is unchanged.
//
// To wire up a real monitor once you have a DSN/key, set VITE_SENTRY_DSN
// (see .env.example) — this module then does a best-effort POST of a
// minimal event payload to Sentry's classic store endpoint. This is NOT a
// full Sentry SDK: no breadcrumbs, retries, batching, or session tracking.
// Swap in the official @sentry/* SDK later for production-grade coverage;
// this only guarantees errors aren't silently dropped when a DSN is present.

export interface ExternalErrorReporter {
  captureException(error: unknown, context?: Record<string, unknown>): void;
}

const noopReporter: ExternalErrorReporter = {
  captureException() {
    // no-op: no external monitor configured
  },
};

function readEnv(name: string): string | undefined {
  try {
    // import.meta.env is statically replaced by Vite at build time.
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    return env?.[name];
  } catch {
    return undefined;
  }
}

function parseSentryDsn(dsn: string): { storeUrl: string; publicKey: string } | undefined {
  try {
    const url = new URL(dsn);
    const projectId = url.pathname.replace(/^\//, "");
    if (!projectId || !url.username) return undefined;
    return {
      storeUrl: `${url.protocol}//${url.host}/api/${projectId}/store/`,
      publicKey: url.username,
    };
  } catch {
    return undefined;
  }
}

function createSentryReporter(dsn: string): ExternalErrorReporter {
  const parsed = parseSentryDsn(dsn);
  if (!parsed) return noopReporter;

  return {
    captureException(error, context) {
      try {
        const isError = error instanceof Error;
        const message = isError ? error.message : String(error);
        const body = JSON.stringify({
          message,
          platform: "javascript",
          timestamp: Date.now() / 1000,
          exception: isError
            ? { values: [{ type: error.name, value: message, stacktrace: undefined }] }
            : undefined,
          extra: context,
        });
        const auth =
          `Sentry sentry_version=7, sentry_key=${parsed.publicKey}, ` +
          `sentry_client=alboabid-heritage-hub-scaffold/0.1`;
        if (typeof fetch === "function") {
          void fetch(parsed.storeUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Sentry-Auth": auth },
            body,
            keepalive: true,
          }).catch(() => {
            // Best-effort only — never let reporting failures affect the app.
          });
        }
      } catch {
        // Never let error reporting itself throw.
      }
    },
  };
}

const sentryDsn = readEnv("VITE_SENTRY_DSN");

/**
 * Forwards captured errors to an external crash monitor when configured.
 * No-ops entirely when VITE_SENTRY_DSN is unset — zero behavior change
 * with no env vars set.
 */
export const externalErrorReporter: ExternalErrorReporter = sentryDsn
  ? createSentryReporter(sentryDsn)
  : noopReporter;
