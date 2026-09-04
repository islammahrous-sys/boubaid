import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
  redirect,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Sends a signed-out visitor to the sign-in screen while remembering exactly
 * where they were headed, so `/auth` can drop them back there instead of
 * always dumping them on `/account`. The value is re-validated on the other
 * side (`safeDestination` in routes/auth.tsx) — it travels through the URL,
 * so it is never trusted on arrival.
 */
function toSignIn(href: string): never {
  throw redirect({ href: `/auth?redirect=${encodeURIComponent(href)}` });
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return { user: null };

    // 1. Instant check against locally stored session (0ms in-memory/localStorage).
    // When a member signs in, the session token is already valid and present locally;
    // querying getUser() over the wire on every route transition blocks navigation
    // for 400-800ms while waiting for the remote Supabase Auth server.
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (session?.user) {
      const now = Math.floor(Date.now() / 1000);
      const isExpired = session.expires_at ? session.expires_at <= now : false;
      if (!isExpired) {
        return { user: session.user };
      }
    }

    // 2. Only if no active session exists or token has expired, verify with auth server.
    const { data, error } = await supabase.auth.getUser();
    if (data?.user) return { user: data.user };

    const rejected = !error || error.status === 401 || error.status === 403;
    if (!session || rejected) toSignIn(location.href);

    return { user: session?.user ?? null };
  },
  component: AuthenticatedLayout,
});

/**
 * `beforeLoad` only re-checks the session when the route is (re)entered.
 * If the session expires or is signed out (elsewhere, or a refresh failure)
 * while the member is already sitting on an authenticated page, nothing
 * would otherwise notice — this listener catches that and sends them back
 * to sign in immediately instead of leaving a dead session on screen.
 */
function AuthenticatedLayout() {
  const navigate = useNavigate();
  const href = useRouterState({ select: (s) => s.location.href });

  // Read through a ref so the subscription is established once instead of
  // being torn down and re-created on every in-console navigation.
  const hrefRef = useRef(href);
  hrefRef.current = href;

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        void navigate({
          to: "/auth" as any,
          search: { redirect: hrefRef.current } as any,
          replace: true,
        });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  return <Outlet />;
}
