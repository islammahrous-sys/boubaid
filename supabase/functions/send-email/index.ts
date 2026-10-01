import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

interface SendEmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
  emailType?: string;
  category?: string;
  queueId?: string;
}

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Load runtime config
    let resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
    let defaultFromName = "Family Council | مجلس الأسرة";
    let defaultFromEmail = "team@boubaid.com";

    try {
      const { data: dbConfig } = await supabase.rpc("get_email_runtime_config");
      if (dbConfig) {
        if (dbConfig.resend_api_key) resendApiKey = dbConfig.resend_api_key;
        if (dbConfig.email_from_name) defaultFromName = dbConfig.email_from_name;
        if (dbConfig.email_from_address) defaultFromEmail = dbConfig.email_from_address;
      }
    } catch (err) {
      console.warn("[send-email] DB config load failed, using env:", err);
    }

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY is not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Parse request
    const body = (await req.json()) as SendEmailPayload;
    const recipients = Array.isArray(body.to) ? body.to : [body.to];
    const cleanedRecipients = recipients
      .map((r) => r?.trim().toLowerCase())
      .filter((r): r is string => Boolean(r && r.includes("@")));

    if (cleanedRecipients.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'to' recipient" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const fromName = body.fromName || defaultFromName;
    const fromEmail = body.fromEmail || defaultFromEmail;
    const fromHeader = `${fromName} <${fromEmail}>`;

    const resendPayload = {
      from: fromHeader,
      to: cleanedRecipients,
      subject: body.subject,
      html: body.html,
      text: body.text || undefined,
      reply_to: body.replyTo || "team@boubaid.com",
      tags: [
        { name: "platform", value: "boubaid-family-portal" },
        { name: "type", value: body.emailType || "general" },
        { name: "category", value: body.category || "notifications" },
      ],
    };

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendPayload),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("[send-email] Resend error:", resendData);
      return new Response(
        JSON.stringify({ error: "Failed to send email via Resend", details: resendData }),
        { status: resendResponse.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. If queueId was provided, update delivery record in email_logs
    if (body.queueId) {
      await supabase
        .from("email_logs")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          provider_message_id: resendData.id || null,
          attempts: 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", body.queueId);
    }

    return new Response(
      JSON.stringify({ success: true, data: resendData }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error: any) {
    console.error("[send-email] Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
