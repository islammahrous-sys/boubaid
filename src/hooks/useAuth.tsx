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
  refreshProfile: () => Promise<void>;
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
    // Which user id the `roles`/`profile` state currently describes. Supabase
    // fires INITIAL_SESSION on mount and TOKEN_REFRESHED roughly hourly for
    // the *same* user; without this both would re-run the two queries below
    // for no new information. Cleared on failure so a later event retries.
    let loadedFor: string | null = null;

    const loadRoles = async (userId: string | undefined) => {
      if (!userId) {
        loadedFor = null;
        if (active) {
          setRoles([]);
          setProfile(null);
        }
        return;
      }
      if (loadedFor === userId) return;
      try {
        const [rolesRes, profileRes] = await Promise.all([
          supabase.from("user_roles").select("role").eq("user_id", userId),
          supabase
            .from("profiles")
            .select("full_name_ar, full_name_en, avatar_path")
            .eq("id", userId)
            .maybeSingle(),
        ]);
        if (!active) return;
        loadedFor = userId;
        if (!rolesRes.error && rolesRes.data) {
          setRoles(((rolesRes.data ?? []) as { role: AppRole }[]).map((r) => r.role));
        }
        if (!profileRes.error && profileRes.data) {
          setProfile(profileRes.data as AuthProfile);
        }
      } catch (err) {
        console.error("Failed to load user roles and profile:", err);
      }
    };

    /**
     * `loading` stays true on initial startup until roles for the current user
     * are loaded. During background token refreshes (TOKEN_REFRESHED), existing
     * roles and session are preserved without flickering the loading state.
     */
    const syncSession = async (next: Session | null) => {
      if (!active) return;
      setSession(next);
      const userId = next?.user?.id;
      if (!userId) {
        setRoles([]);
        setProfile(null);
        if (active) setLoading(false);
        return;
      }
      // Eagerly seed initial profile from session user_metadata without erasing existing avatar
      if (next?.user?.user_metadata) {
        const meta = next.user.user_metadata as Record<string, unknown>;
        const nameAr = (meta.full_name_ar as string) || (meta.full_name as string) || null;
        const nameEn = (meta.full_name_en as string) || null;
        const avatar = (meta.avatar_path as string) || (meta.avatar_url as string) || null;
        setProfile((prev) => ({
          full_name_ar: prev?.full_name_ar || nameAr,
          full_name_en: prev?.full_name_en || nameEn,
          avatar_path: prev?.avatar_path || avatar,
        }));
      }
      if (loadedFor !== userId) {
        await loadRoles(userId);
      }
      if (active) setLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      // Defer state update to ensure component is fully mounted
      queueMicrotask(() => {
        void syncSession(next);
      });
    });

    void supabase.auth.getSession().then(({ data }) => {
      void syncSession(data.session);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    const uid = session?.user?.id;
    if (!uid) return;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("full_name_ar, full_name_en, avatar_path")
        .eq("id", uid)
        .maybeSingle();
      if (data) {
        setProfile(data as AuthProfile);
      }
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  };

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
        (
          [
            "admin",
            "super_admin",
            "editor",
            "treasurer",
            "content_manager",
            "family_manager",
          ] as AppRole[]
        ).includes(r),
      ),
      refreshProfile,
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) return;
        // A global sign-out that fails (offline, or a refresh token the
        // server has already revoked) must still clear *this* device —
        // otherwise the console keeps rendering as signed-in against a
        // session every subsequent request will reject.
        console.error("Global sign-out failed, clearing local session:", error);
        await supabase.auth.signOut({ scope: "local" });
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
