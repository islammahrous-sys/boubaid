import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

import { getRequest } from "@tanstack/react-start/server";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error("[start.ts errorMiddleware]", error);

    // Check if request is a serverFn / RPC call or expects JSON
    try {
      const req = getRequest();
      const accept = req?.headers?.get("accept") || "";
      const isServerFn =
        req?.headers?.get("x-tanstack-start-server-fn") || !accept.includes("text/html");
      if (isServerFn) {
        throw error;
      }
    } catch {
      throw error;
    }

    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

const securityHeadersMiddleware = createMiddleware().server(async ({ next }) => {
  const res = await next();
  if (res instanceof Response) {
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("X-Frame-Options", "SAMEORIGIN");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    res.headers.set("Permissions-Policy", "camera=(self), microphone=(), geolocation=()");
    res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    // Report-Only first: the theme/lang/GA bootstrap scripts are inline, so an
    // enforcing CSP needs nonces. Watch the console/reports, then tighten.
    res.headers.set(
      "Content-Security-Policy-Report-Only",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.googletagmanager.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "img-src 'self' data: blob: https:",
        "media-src 'self' blob: https:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com https://www.google-analytics.com https://*.google-analytics.com",
        "frame-src https://challenges.cloudflare.com https://www.google.com https://www.youtube.com",
        "object-src 'none'",
        "base-uri 'self'",
        "frame-ancestors 'self'",
      ].join("; "),
    );
  }
  return res;
});

// Protected server fns throw a raw Response (401/403). Across the RPC boundary
// that surfaces as "Error: [object Response]" and can blank the screen, so
// convert it into a normal Error carrying the HTTP status.
const responseErrorMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error instanceof Response) {
      const text = await error.text().catch(() => "");
      const err = new Error(text || `Request failed (${error.status})`) as Error & {
        status: number;
      };
      err.status = error.status;
      throw err;
    }
    throw error;
  }
});

export const startInstance = createStart(() => ({
  functionMiddleware: [responseErrorMiddleware, attachSupabaseAuth],
  requestMiddleware: [errorMiddleware, csrfMiddleware, securityHeadersMiddleware],
}));
