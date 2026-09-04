import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { RoutePending } from "@/components/site/RoutePending";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 3, // 3 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
        refetchOnWindowFocus: false, // Prevent distracting reload flashes on window focus
        refetchOnReconnect: true,
        retry: (failureCount, error: any) => {
          // Do not retry 401/403/404 errors, retry transient network/500 errors up to 2 times
          if (error?.status === 401 || error?.status === 403 || error?.status === 404) return false;
          return failureCount < 2;
        },
      },
      mutations: {
        retry: 0,
      },
    },
  });

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
    defaultPendingMs: 2000,
    defaultPendingMinMs: 0,
    defaultPendingComponent: RoutePending,
  });

  return router;
};
