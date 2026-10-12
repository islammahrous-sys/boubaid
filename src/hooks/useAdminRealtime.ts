import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Real-time synchronization hook for the Admin Console.
 *
 * Subscribes to Supabase Realtime `postgres_changes` across core operational
 * tables and invalidates corresponding React Query caches when another administrator
 * or user performs an operation.
 */
export function useAdminRealtime(enabled = true) {
  const queryClient = useQueryClient();
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const invalidateWithDebounce = (queryKeyPrefix: string[], delay = 400) => {
      const keyStr = queryKeyPrefix.join(":");
      if (debounceTimers.current[keyStr]) {
        clearTimeout(debounceTimers.current[keyStr]);
      }
      debounceTimers.current[keyStr] = setTimeout(() => {
        void queryClient.invalidateQueries({
          predicate: (query) => {
            const firstKey = query.queryKey[0];
            return typeof firstKey === "string" && queryKeyPrefix.includes(firstKey);
          },
        });
        delete debounceTimers.current[keyStr];
      }, delay);
    };

    const channel = supabase
      .channel("admin-console-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "membership_requests" },
        () => {
          invalidateWithDebounce(["admin", "membership", "family-members"]);
        },
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "inquiries" }, () => {
        invalidateWithDebounce(["admin", "inquiries"]);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "inquiry_notes" }, () => {
        invalidateWithDebounce(["admin", "inquiries"]);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, () => {
        invalidateWithDebounce(["admin", "site-settings", "settings"]);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "audit_logs" }, () => {
        invalidateWithDebounce(["admin", "audit-logs"]);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // Connected to realtime stream
        }
      });

    return () => {
      // Clear any pending debounce timers
      Object.values(debounceTimers.current).forEach((timer) => clearTimeout(timer));
      debounceTimers.current = {};
      void supabase.removeChannel(channel);
    };
  }, [enabled, queryClient]);
}
