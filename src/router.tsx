import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,       // Data fresh for 5 minutes
        gcTime: 1000 * 60 * 10,         // Keep in cache for 10 minutes
        retry: 1,                        // Only retry once on error
        refetchOnWindowFocus: false,     // No refetch on tab focus
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 1000 * 30, // 30 seconds preload stale time
  });

  return router;
};
