import {
  LEADERSHIP_ROLES,
  MEMBER_ROLES,
  PAGE_ACCESS_SETTING_KEY,
  normaliseEmails,
  type PageAccessSetting,
} from "./page-access";

/**
 * Reads the chairs list. Never lets a missing/broken service-role key break
 * page access: it falls back to the caller's own client (which RLS may limit
 * to admins), and finally to an empty list — members still get member pages
 * and admins still get leadership pages from their roles alone.
 */
export async function readPageAccessSetting(callerClient?: unknown): Promise<PageAccessSetting> {
  const read = async (client: any) => {
    const { data, error } = await client
      .from("site_settings")
      .select("value")
      .eq("key", PAGE_ACCESS_SETTING_KEY)
      .maybeSingle();
    if (error) throw error;
    const value = (data?.value ?? {}) as Record<string, unknown>;
    return { leadership_emails: normaliseEmails(value.leadership_emails) };
  };
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    return await read(supabaseAdmin);
  } catch (err) {
    console.error("[page-access] admin read failed, falling back:", (err as Error)?.message);
  }
  if (callerClient) {
    try {
      return await read(callerClient);
    } catch {
      // RLS denied — fine for non-admins.
    }
  }
  return { leadership_emails: [] };
}

export type AccessFlags = { member: boolean; leadership: boolean; roles: string[] };

/** Member / leadership decision for one signed-in user, using their own client. */
export async function computeAccess(
  supabase: any,
  userId: string,
  email: string | null | undefined,
): Promise<AccessFlags> {
  const [rolesRes, setting] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", userId),
    readPageAccessSetting(supabase),
  ]);
  if (rolesRes.error) throw new Error(`roles_read_failed: ${rolesRes.error.message}`);
  const roles = ((rolesRes.data ?? []) as { role: string }[]).map((r) => r.role);
  const member = roles.some((r) => (MEMBER_ROLES as readonly string[]).includes(r));
  const lowered = String(email ?? "").toLowerCase();
  const leadership =
    roles.some((r) => (LEADERSHIP_ROLES as readonly string[]).includes(r)) ||
    (!!lowered && member && setting.leadership_emails.includes(lowered));
  return { member, leadership, roles };
}
