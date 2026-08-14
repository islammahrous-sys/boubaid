import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  membershipRequestSchema,
  profileUpdateSchema,
} from "./account.schemas";

export type AccountSnapshot = {
  profile: {
    id: string;
    full_name_ar: string | null;
    full_name_en: string | null;
    branch_slug: string | null;
    phone: string | null;
    email: string | null;
    lineage_notes: string | null;
    show_in_directory: boolean;
  } | null;
  roles: string[];
  request: {
    id: string;
    status: "pending" | "approved" | "rejected";
    review_note: string | null;
    created_at: string;
  } | null;
};

export const getMyAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AccountSnapshot> => {
    const { supabase, userId } = context;

    const [profileRes, rolesRes, requestRes] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, full_name_ar, full_name_en, branch_slug, phone, email, lineage_notes, show_in_directory",
        )
        .eq("id", userId)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase
        .from("membership_requests")
        .select("id, status, review_note, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    return {
      profile: profileRes.data ?? null,
      roles: (rolesRes.data ?? []).map((r) => r.role as string),
      request: requestRes.data ?? null,
    };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => profileUpdateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name_ar: data.full_name_ar,
        full_name_en: data.full_name_en || null,
        branch_slug: data.branch_slug || null,
        phone: data.phone || null,
        lineage_notes: data.lineage_notes || null,
        show_in_directory: data.show_in_directory,
      })
      .eq("id", userId);

    if (error) {
      console.error("[account] profile update failed", error.code, error.message);
      return { ok: false as const, error: "update_failed" };
    }
    return { ok: true as const };
  });

export const submitMembershipRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => membershipRequestSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;

    const { data: existing } = await supabase
      .from("membership_requests")
      .select("id, status")
      .eq("user_id", userId)
      .eq("status", "pending")
      .maybeSingle();

    if (existing) return { ok: false as const, error: "already_pending" };

    const { error } = await supabase.from("membership_requests").insert({
      user_id: userId,
      full_name_ar: data.full_name_ar,
      full_name_en: data.full_name_en || null,
      email: String(claims.email ?? ""),
      phone: data.phone || null,
      branch_slug: data.branch_slug || null,
      father_lineage: data.father_lineage || null,
      notes: data.notes || null,
    });

    if (error) {
      console.error("[account] request insert failed", error.code, error.message);
      return { ok: false as const, error: "insert_failed" };
    }
    return { ok: true as const };
  });
