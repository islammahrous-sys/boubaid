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
    const { data, error } = await supabase.auth.getUser();
    if (data?.user) return { user: data.user };

    // `getUser()` hits the Auth server, so it also fails when the network
    // does. Bouncing a member to the sign-in form because their train went
    // through a tunnel is wrong, and it is not what protects this area
    // anyway: every server function re-verifies the bearer token and RLS
    // re-checks it in the database. Only a genuine rejection (or having no
    // stored session at all) means they are actually signed out.
    const { data: sessionData } = await supabase.auth.getSession();
    const rejected = !error || error.status === 401 || error.status === 403;
    if (!sessionData.session || rejected) toSignIn(location.href);

    return { user: sessionData.session.user };
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
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || (!session && event !== "PASSWORD_RECOVERY")) {
        void navigate({ href: `/auth?redirect=${encodeURIComponent(hrefRef.current)}` });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  return <Outlet />;
}
