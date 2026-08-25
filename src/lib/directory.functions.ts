import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type DirectoryMember = {
  id: string;
  full_name_ar: string | null;
  full_name_en: string | null;
  branch_slug: string | null;
  phone: string | null;
  email: string | null;
  lineage_notes: string | null;
};

/**
 * Members-only directory. Reads live profiles that opted into the directory.
 * Requires an authenticated member; profile RLS keeps non-consenting rows out
 * for everyone except admins.
 */
export const getMemberDirectory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ members: DirectoryMember[]; isMember: boolean }> => {
    const { supabase, userId } = context;

    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const roleList = (roles ?? []).map((r) => r.role as string);
    const isMember = roleList.length > 0;
    if (!isMember) return { members: [], isMember: false };

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name_ar, full_name_en, branch_slug, phone, email, lineage_notes")
      .eq("show_in_directory", true)
      .order("full_name_ar", { ascending: true })
      .limit(500);

    if (error) {
      console.error("[directory] read failed", error.code, error.message);
      return { members: [], isMember: true };
    }
    return { members: (data ?? []) as DirectoryMember[], isMember: true };
  });

/**
 * Public business directory.
 */
export const getPublishedBusinesses = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { createPublicServerClient } = await import("./supabase-public.server");
    const { data, error } = await createPublicServerClient()
      .from("businesses")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[businesses] read failed", error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.error("[businesses] getPublishedBusinesses error", err);
    return [];
  }
});
