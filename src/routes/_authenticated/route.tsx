import { createFileRoute, Outlet, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
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

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || (!session && event !== "PASSWORD_RECOVERY")) {
        void navigate({ to: "/auth" });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  return <Outlet />;
}
