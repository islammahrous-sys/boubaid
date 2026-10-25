import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdminAuth, requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PAGE_ACCESS_SETTING_KEY, normaliseEmails, type PageAccessSetting } from "./page-access";

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
    const { computeAccess } = await import("./page-access.server");
    const [access, requestRes] = await Promise.all([
      computeAccess(supabase, userId, claims.email),
      supabase
        .from("membership_requests")
        .select("status")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    return {
      signedIn: true,
      member: access.member,
      leadership: access.leadership,
      requestStatus: (requestRes.data?.status as MyAccess["requestStatus"]) ?? null,
    };
  });

export const getPageAccessSetting = createServerFn({ method: "GET" })
  .middleware([requireAdminAuth])
  .handler(async ({ context }) => {
    const { readPageAccessSetting } = await import("./page-access.server");
    return readPageAccessSetting(context.supabase);
  });

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
