import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Matches the live `app_role` Postgres enum, which is broader than the
// checked-in migrations show — several roles were added directly against the
// live project (verified via the database, not just the migration files).
export type AppRole =
  | "admin"
  | "editor"
  | "treasurer"
  | "member"
  | "super_admin"
  | "content_manager"
  | "family_manager"
  | "viewer";

export type AuthProfile = {
  full_name_ar: string | null;
  full_name_en: string | null;
  avatar_path: string | null;
};

type AuthCtx = {
  user: User | null;
  session: Session | null;
  profile: AuthProfile | null;
  roles: AppRole[];
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isMember: boolean;
  /** Any staff role that has at least one real capability somewhere in the
   *  admin console (per the DB's private.can_* functions and the server
   *  middleware) -- as opposed to a plain "member"/"viewer", who has none.
   *  Gates entry to the console; each tab's actual data access is still
   *  fully enforced server-side regardless of this flag. */
  canAccessConsole: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadRoles = async (userId: string | undefined) => {
      if (!userId) {
        if (active) {
          setRoles([]);
          setProfile(null);
        }
        return;
      }
      try {
        const [rolesRes, profileRes] = await Promise.all([
          supabase.from("user_roles").select("role").eq("user_id", userId),
          supabase.from("profiles").select("full_name_ar, full_name_en, avatar_path").eq("id", userId).maybeSingle(),
        ]);
        if (!active) return;
        setRoles(((rolesRes.data ?? []) as { role: AppRole }[]).map((r) => r.role));
        setProfile((profileRes.data as AuthProfile | null) ?? null);
      } catch (err) {
        console.error("Failed to load user roles:", err);
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      // Defer state update to ensure component is fully mounted
      queueMicrotask(() => {
        if (!active) return;
        setSession(next);
        void loadRoles(next?.user?.id);
      });
    });

    void supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await loadRoles(data.session?.user?.id);
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      roles,
      loading,
      isAdmin: roles.includes("admin") || roles.includes("super_admin"),
      isSuperAdmin: roles.includes("super_admin"),
      isMember: roles.length > 0,
      canAccessConsole: roles.some((r) =>
        (["admin", "super_admin", "editor", "treasurer", "content_manager", "family_manager"] as AppRole[]).includes(r),
      ),
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, profile, roles, loading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
