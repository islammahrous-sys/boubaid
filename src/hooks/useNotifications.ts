import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/i18n/LanguageProvider";
import {
  getMyNotifications,
  markMyNotificationRead,
  markAllMyNotificationsRead,
  deleteMyNotification,
  type MyNotification,
} from "@/lib/account.functions";
import { getCategoryForType, type NotificationCategory } from "@/lib/notifications.types";

export function useNotifications() {
  const { user } = useAuth();
  const { lang } = useLang();
  const queryClient = useQueryClient();

  const fetchNotifsFn = useServerFn(getMyNotifications);
  const markReadFn = useServerFn(markMyNotificationRead);
  const markAllReadFn = useServerFn(markAllMyNotificationsRead);
  const deleteNotifFn = useServerFn(deleteMyNotification);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["my-notifications", user?.id],
    queryFn: async () => {
      if (!user) return { notifications: [], unreadCount: 0 };
      return await fetchNotifsFn();
    },
    enabled: Boolean(user?.id),
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000, // Regular polling fallback
    refetchOnWindowFocus: true,
  });

  const notifications = useMemo(() => data?.notifications ?? [], [data?.notifications]);
  const unreadCount = data?.unreadCount ?? 0;

  // Real-time listener for incoming notifications
  useEffect(() => {
    if (!user?.id || typeof window === "undefined") return;

    const channelName = `user-notifs-${user.id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          void queryClient.invalidateQueries({ queryKey: ["my-notifications", user.id] });

          if (payload.eventType === "INSERT" && payload.new) {
            const row = payload.new as any;
            const title = lang === "ar" ? row.title_ar : row.title_en || row.title_ar;
            const msg = lang === "ar" ? row.message_ar : row.message_en || row.message_ar;

            toast(title, {
              description: msg,
              action: row.link
                ? {
                    label: lang === "ar" ? "عرض" : "View",
                    onClick: () => {
                      if (row.link) window.location.href = row.link;
                    },
                  }
                : undefined,
            });
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id, lang, queryClient]);

  // Mutations
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await markReadFn({ data: { id } });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["my-notifications", user?.id] });
      const previous = queryClient.getQueryData<{
        notifications: MyNotification[];
        unreadCount: number;
      }>(["my-notifications", user?.id]);

      if (previous) {
        queryClient.setQueryData(["my-notifications", user?.id], {
          notifications: previous.notifications.map((n) =>
            n.id === id ? { ...n, is_read: true } : n,
          ),
          unreadCount: Math.max(0, previous.unreadCount - 1),
        });
      }
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["my-notifications", user?.id], ctx.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-notifications", user?.id] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await markAllReadFn();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["my-notifications", user?.id] });
      const previous = queryClient.getQueryData<{
        notifications: MyNotification[];
        unreadCount: number;
      }>(["my-notifications", user?.id]);

      if (previous) {
        queryClient.setQueryData(["my-notifications", user?.id], {
          notifications: previous.notifications.map((n) => ({ ...n, is_read: true })),
          unreadCount: 0,
        });
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["my-notifications", user?.id], ctx.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-notifications", user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteNotifFn({ data: { id } });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["my-notifications", user?.id] });
      const previous = queryClient.getQueryData<{
        notifications: MyNotification[];
        unreadCount: number;
      }>(["my-notifications", user?.id]);

      if (previous) {
        const target = previous.notifications.find((n) => n.id === id);
        queryClient.setQueryData(["my-notifications", user?.id], {
          notifications: previous.notifications.filter((n) => n.id !== id),
          unreadCount:
            target && !target.is_read
              ? Math.max(0, previous.unreadCount - 1)
              : previous.unreadCount,
        });
      }
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["my-notifications", user?.id], ctx.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-notifications", user?.id] });
    },
  });

  // Categorized counts and filters
  const categorized = useMemo(() => {
    const unread = notifications.filter((n) => !n.is_read);
    const system = notifications.filter((n) => getCategoryForType(n.type) === "system");
    const events = notifications.filter((n) => getCategoryForType(n.type) === "events");
    const contributions = notifications.filter(
      (n) => getCategoryForType(n.type) === "contributions",
    );
    const heritage = notifications.filter((n) => getCategoryForType(n.type) === "heritage");

    return {
      all: notifications,
      unread,
      system,
      events,
      contributions,
      heritage,
      counts: {
        all: notifications.length,
        unread: unreadCount,
        system: system.length,
        events: events.length,
        contributions: contributions.length,
        heritage: heritage.length,
      },
    };
  }, [notifications, unreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isError,
    refetch,
    categorized,
    markAsRead: markReadMutation.mutate,
    markAsReadAsync: markReadMutation.mutateAsync,
    isMarkingRead: markReadMutation.isPending,
    markAllAsRead: markAllReadMutation.mutate,
    markAllAsReadAsync: markAllReadMutation.mutateAsync,
    isMarkingAllRead: markAllReadMutation.isPending,
    deleteNotification: deleteMutation.mutate,
    deleteNotificationAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
