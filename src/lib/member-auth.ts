import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Server-function guards for members-only data (Archive, Family Development
 * Fund) and leadership-only data (Visual Identity). Application-level defence
 * in depth: the database RLS policies are the authoritative control, and the
 * guarded functions read through the caller's own client so RLS applies too.
 */
export const requireApprovedMember = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const { computeAccess } = await import("./page-access.server");
    const access = await computeAccess(context.supabase, context.userId, context.claims.email);
    if (!access.member) {
      throw new Response("Forbidden: approved membership required", { status: 403 });
    }
    return next({ context: { access } });
  });

export const requireCouncilLeader = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const { computeAccess } = await import("./page-access.server");
    const access = await computeAccess(context.supabase, context.userId, context.claims.email);
    if (!access.leadership) {
      throw new Response("Forbidden: council chair or committee chair only", { status: 403 });
    }
    return next({ context: { access } });
  });
