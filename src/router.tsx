import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { RoutePending } from "@/components/site/RoutePending";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Preload a route's code + loader data as soon as the user hovers or
    // touches its link, so the click itself usually has nothing left to
    // wait on. `defaultPreloadStaleTime` used to be 0, which discarded that
    // preloaded data immediately and made every navigation refetch anyway —
    // the preload was firing but never actually being used.
    defaultPreload: "intent",
    defaultPreloadStaleTime: 10_000,
    // Only for the rare case a navigation doesn't resolve almost instantly
    // (cold cache, slow connection) — most clicks never show this.
    defaultPendingMs: 300,
    defaultPendingMinMs: 300,
    defaultPendingComponent: RoutePending,
  });

  return router;
};
