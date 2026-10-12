import { createServerFn } from "@tanstack/react-start";

/**
 * Verifies a Cloudflare Turnstile token for flows that don't otherwise call a
 * server function — e.g. sign-up, which talks to Supabase auth directly from
 * the client. Skips verification (returns ok) when TURNSTILE_SECRET_KEY isn't
 * configured server-side.
 */
export const verifyTurnstile = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const data = (input ?? {}) as { token?: unknown };
    return { token: typeof data.token === "string" ? data.token : "" };
  })
  .handler(async ({ data }) => {
    const [{ verifyTurnstileToken }, { getRequestIp }] = await Promise.all([
      import("./turnstile.server"),
      import("./public-forms-rate-limit.server"),
    ]);
    return verifyTurnstileToken(data.token, getRequestIp());
  });
