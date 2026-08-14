import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { messageStatusSchema, reviewRequestSchema } from "./account.schemas";

export type AdminOverview = {
  requests: {
    id: string;
    user_id: string | null;
    full_name_ar: string;
    full_name_en: string | null;
    email: string;
    phone: string | null;
    branch_slug: string | null;
    father_lineage: string | null;
    notes: string | null;
    status: "pending" | "approved" | "rejected";
    review_note: string | null;
    created_at: string;
  }[];
  messages: {
    id: string;
    name: string;
    email: string;
    subject: string | null;
    message: string;
    status: "new" | "read" | "archived";
    created_at: string;
  }[];
  subscribers: { id: string; email: string; name: string | null; created_at: string }[];
  members: {
    id: string;
    full_name_ar: string | null;
    full_name_en: string | null;
    branch_slug: string | null;
    email: string | null;
    show_in_directory: boolean;
  }[];
};

/** Every admin read/write goes through the caller's own client, so the
 *  admin-only RLS policies are the security boundary. */
export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminOverview> => {
    const { supabase } = context;

    const [requests, messages, subscribers, members] = await Promise.all([
      supabase
        .from("membership_requests")
        .select(
          "id, user_id, full_name_ar, full_name_en, email, phone, branch_slug, father_lineage, notes, status, review_note, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("contact_messages")
        .select("id, name, email, subject, message, status, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("newsletter_subscribers")
        .select("id, email, name, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("profiles")
        .select("id, full_name_ar, full_name_en, branch_slug, email, show_in_directory")
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    return {
      requests: requests.data ?? [],
      messages: messages.data ?? [],
      subscribers: subscribers.data ?? [],
      members: members.data ?? [],
    };
  });

export const reviewMembershipRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => reviewRequestSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Authorise from the caller's own client — never with elevated access.
    // (The update itself is also gated by an admin-only RLS policy.)
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!adminRole) return { ok: false as const, error: "forbidden" };

    const { data: updated, error } = await supabase
      .from("membership_requests")
      .update({
        status: data.decision,
        review_note: data.review_note || null,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select("user_id")
      .maybeSingle();

    if (error) {
      console.error("[admin] review failed", error.code, error.message);
      return { ok: false as const, error: "update_failed" };
    }

    if (data.decision === "approved" && updated?.user_id) {
      // Granting a role is a privileged write; user_roles has no INSERT policy.
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error: grantError } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: updated.user_id, role: "member", granted_by: userId });
      if (grantError && grantError.code !== "23505") {
        console.error("[admin] role grant failed", grantError.code, grantError.message);
        return { ok: false as const, error: "grant_failed" };
      }
      await supabaseAdmin.from("audit_log").insert({
        actor_id: userId,
        action: "membership.approved",
        entity: "membership_requests",
        entity_id: data.id,
      });
    }

    return { ok: true as const };
  });

export const setMessageStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => messageStatusSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("contact_messages")
      .update({ status: data.status })
      .eq("id", data.id);

    if (error) {
      console.error("[admin] message status failed", error.code, error.message);
      return { ok: false as const, error: "update_failed" };
    }
    return { ok: true as const };
  });
