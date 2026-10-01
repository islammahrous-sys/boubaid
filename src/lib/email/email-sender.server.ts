import { supabaseAdmin } from "@/integrations/supabase/client.server";

let lastResendCallTimestamp = 0;
const RESEND_MIN_INTERVAL_MS = 550;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 800;

interface RuntimeEmailConfig {
  resendApiKey: string;
  fromName: string;
  fromEmail: string;
  appBaseUrl: string;
}

let cachedRuntimeConfig: RuntimeEmailConfig | null = null;
let configCachedAt = 0;
const CONFIG_CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

export async function getRuntimeEmailConfig(): Promise<RuntimeEmailConfig> {
  const now = Date.now();
  if (cachedRuntimeConfig && now - configCachedAt < CONFIG_CACHE_TTL_MS) {
    return cachedRuntimeConfig;
  }

  let resendApiKey = process.env.RESEND_API_KEY || "";
  let fromName = "Family Council | مجلس الأسرة";
  let fromEmail = "team@boubaid.com";
  let appBaseUrl = "https://www.boubaid.com";

  try {
    const { data: rawConfig } = await supabaseAdmin.rpc("get_email_runtime_config");
    const dbConfig = rawConfig as Record<string, any> | null;
    if (dbConfig) {
      if (dbConfig.resend_api_key) resendApiKey = dbConfig.resend_api_key;
      if (dbConfig.email_from_name) fromName = dbConfig.email_from_name;
      if (dbConfig.email_from_address) fromEmail = dbConfig.email_from_address;
      if (dbConfig.app_base_url) appBaseUrl = dbConfig.app_base_url;
    }
  } catch (err) {
    console.warn("[email-sender] Fallback to environment config:", err);
  }

  cachedRuntimeConfig = { resendApiKey, fromName, fromEmail, appBaseUrl };
  configCachedAt = now;
  return cachedRuntimeConfig;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  emailType?: string;
  category?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  ok: boolean;
  providerMessageId?: string | null;
  error?: string;
  status: "sent" | "failed";
}

/**
 * Sends a transactional email through Resend with rate limiting,
 * exponential backoff retries, and comprehensive error handling.
 */
export async function sendEmailViaResend(
  payload: SendEmailPayload,
): Promise<SendEmailResult> {
  const config = await getRuntimeEmailConfig();

  if (!config.resendApiKey) {
    console.error("[email-sender] RESEND_API_KEY is not configured.");
    return {
      ok: false,
      status: "failed",
      error: "Resend API key missing in runtime configuration",
    };
  }

  const senderString = `${config.fromName} <${config.fromEmail}>`;
  const replyTo = payload.replyTo || "team@boubaid.com";

  let lastError: string | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Enforce 2 requests per second throttle
      const now = Date.now();
      const waitMs = lastResendCallTimestamp + RESEND_MIN_INTERVAL_MS - now;
      if (waitMs > 0) {
        await sleep(waitMs);
      }

      const bodyData: Record<string, unknown> = {
        from: senderString,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text || undefined,
        reply_to: replyTo,
        tags: [
          { name: "platform", value: "boubaid-family-portal" },
          { name: "type", value: payload.emailType || "general" },
          { name: "category", value: payload.category || "notifications" },
        ],
      };

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      lastResendCallTimestamp = Date.now();

      if (response.ok) {
        const data = (await response.json()) as { id?: string };
        return {
          ok: true,
          status: "sent",
          providerMessageId: data.id || null,
        };
      }

      const errorJson = (await response.json().catch(() => ({}))) as {
        message?: string;
        name?: string;
      };
      lastError = errorJson.message || `HTTP error ${response.status} from Resend`;

      // Graceful fallback: If custom domain DNS verification is still propagating on Resend,
      // attempt dispatch via onboarding sender so critical/test emails still succeed.
      if (
        response.status === 403 &&
        lastError?.toLowerCase().includes("domain is not verified") &&
        !senderString.includes("onboarding@resend.dev")
      ) {
        console.warn("[email-sender] Custom domain pending DNS verification. Retrying with onboarding fallback...");
        const fallbackBody = {
          ...bodyData,
          from: `${config.fromName} <onboarding@resend.dev>`,
        };
        const fallbackRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fallbackBody),
        });

        if (fallbackRes.ok) {
          const fallbackData = (await fallbackRes.json()) as { id?: string };
          return {
            ok: true,
            status: "sent",
            providerMessageId: fallbackData.id || null,
          };
        }
      }

      // Only retry on rate limits (429) or transient server errors (500-599)
      const shouldRetry =
        response.status === 429 || (response.status >= 500 && response.status <= 599);

      if (!shouldRetry || attempt === MAX_RETRIES) {
        return {
          ok: false,
          status: "failed",
          error: lastError,
        };
      }

      await sleep(RETRY_BASE_DELAY_MS * attempt);
    } catch (err: any) {
      lastError = err?.message || "Network exception contacting Resend";
      if (attempt === MAX_RETRIES) {
        return {
          ok: false,
          status: "failed",
          error: lastError || "Network error",
        };
      }
      await sleep(RETRY_BASE_DELAY_MS * attempt);
    }
  }

  return {
    ok: false,
    status: "failed",
    error: lastError || "Failed after maximum retries",
  };
}
