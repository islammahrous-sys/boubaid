import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const payload = await req.json();
    const eventType = payload.type as string; // e.g. "email.delivered", "email.bounced", "email.complained"
    const emailData = payload.data as {
      email_id?: string;
      id?: string;
      to?: string[];
      created_at?: string;
      bounce?: { message?: string; type?: string };
    };

    const providerMessageId = emailData?.email_id || emailData?.id;

    if (!providerMessageId) {
      return new Response(JSON.stringify({ received: true, note: "No message id in webhook" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const nowIso = new Date().toISOString();

    if (eventType === "email.delivered") {
      await supabase
        .from("email_logs")
        .update({
          status: "delivered",
          delivered_at: emailData.created_at || nowIso,
          updated_at: nowIso,
        })
        .eq("provider_message_id", providerMessageId);
    } else if (eventType === "email.bounced") {
      const bounceMessage = emailData.bounce?.message || "Email bounced by destination server";
      await supabase
        .from("email_logs")
        .update({
          status: "bounced",
          failed_at: emailData.created_at || nowIso,
          error_message: bounceMessage,
          updated_at: nowIso,
        })
        .eq("provider_message_id", providerMessageId);
    } else if (eventType === "email.complained") {
      await supabase
        .from("email_logs")
        .update({
          status: "complained",
          updated_at: nowIso,
        })
        .eq("provider_message_id", providerMessageId);
    } else if (eventType === "email.opened") {
      await supabase
        .from("email_logs")
        .update({
          opened_at: emailData.created_at || nowIso,
          updated_at: nowIso,
        })
        .eq("provider_message_id", providerMessageId);
    } else if (eventType === "email.clicked") {
      await supabase
        .from("email_logs")
        .update({
          clicked_at: emailData.created_at || nowIso,
          updated_at: nowIso,
        })
        .eq("provider_message_id", providerMessageId);
    }

    return new Response(JSON.stringify({ success: true, event: eventType }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[resend-webhook] Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
