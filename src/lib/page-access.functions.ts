import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdminAuth, requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  LEADERSHIP_ROLES,
  MEMBER_ROLES,
  PAGE_ACCESS_SETTING_KEY,
  normaliseEmails,
  type PageAccessSetting,
} from "./page-access";

async function readSetting(): Promise<PageAccessSetting> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("site_settings")
    .select("value")
    .eq("key", PAGE_ACCESS_SETTING_KEY)
    .maybeSingle();
  const value = (data?.value ?? {}) as Record<string, unknown>;
  return { leadership_emails: normaliseEmails(value.leadership_emails) };
}

export type MyAccess = {
  signedIn: true;
  member: boolean;
  leadership: boolean;
  /** Latest membership request status, so the gate can say "pending". */
  requestStatus: "pending" | "approved" | "rejected" | null;
};

/** The signed-in visitor's access levels, decided on the server. */
export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyAccess> => {
    const { supabase, userId, claims } = context;
    const [rolesRes, requestRes, setting] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase
        .from("membership_requests")
        .select("status")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      readSetting(),
    ]);
    const roles = (rolesRes.data ?? []).map((r) => r.role as string);
    const email = String(claims.email ?? "").toLowerCase();
    const member = roles.some((r) => (MEMBER_ROLES as readonly string[]).includes(r));
    const leadership =
      roles.some((r) => (LEADERSHIP_ROLES as readonly string[]).includes(r)) ||
      (!!email && member && setting.leadership_emails.includes(email));
    return {
      signedIn: true,
      member,
      leadership,
      requestStatus: (requestRes.data?.status as MyAccess["requestStatus"]) ?? null,
    };
  });

export const getPageAccessSetting = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async () => readSetting());

export const savePageAccessSetting = createServerFn({ method: "POST" })
  .middleware([requireAdminAuth])
  .validator((input: unknown) =>
    z.object({ leadership_emails: z.array(z.string().max(255)).max(100) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const value: PageAccessSetting = { leadership_emails: normaliseEmails(data.leadership_emails) };
    const { supabase, userId } = context;
    const { error } = await supabase.from("site_settings").upsert(
      {
        key: PAGE_ACCESS_SETTING_KEY,
        category: "access",
        is_public: false,
        value: value as never,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );
    if (error) throw new Error(error.message);
    await supabase.from("audit_logs").insert({
      actor_user_id: userId,
      action: "settings_change",
      entity_type: "site_settings",
      entity_id: PAGE_ACCESS_SETTING_KEY,
      after_data: value as never,
    });
    return value;
  });
