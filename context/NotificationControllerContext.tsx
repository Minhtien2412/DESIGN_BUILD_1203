/**
 * Notification Controller Context
 * =================================
 *
 * React context + provider kết nối:
 *   - NotificationSystem (logic)
 *   - NotificationRenderer (hiển thị)
 *   - JobProgressManager (pending jobs)
 *   - WebSocket (real-time events)
 *   - REST API (fetch/sync on reconnect)
 *
 * Luồng end-to-end:
 *   1. User login → connect WS → subscribe user:{id}
 *   2. Server push event → System.ingest() → Renderer shows toast
 *   3. Client ack → server update deliveredAt
 *   4. Client open center → GET /notifications sync lại
 *
 * @author ThietKeResort Team
 * @created 2026-03-05
 */

import { NOTIFICATION_ENDPOINTS } from "@/constants/api-endpoints";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/services/api";
import { notificationSocket } from "@/services/socket/notificationSocket";
import { router } from "expo-router";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState, type AppStateStatus } from "react-native";

import type {
  JobEvent,
  NotificationCategory,
  NotificationItem,
  NotificationUserSettings,
  PendingJob,
  PushNotificationEvent,
} from "@/services/notification-system";
import {
  jobProgressManager,
  notificationRenderer,
  notificationSystem,
  setDeeplinkHandler,
} from "@/services/notification-system";

// ============================================================================
// CONTEXT TYPE
// ============================================================================

export interface NotificationControllerContextType {
  // ---- Push notifications state ----
  notifications: NotificationItem[];
  unreadCount: number;
  unreadByCategory: (category: NotificationCategory) => number;
  loading: boolean;
  isWsConnected: boolean;

  // ---- Push notifications actions ----
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => void;

  // ---- Pending jobs state ----
  pendingJobs: PendingJob[];
  hasActiveJobs: boolean;

  // ---- Pending jobs actions ----
  createPendingJob: (params: {
    label: string;
    resultRoute?: string;
  }) => PendingJob;
  cancelJob: (jobId: string) => void;
  mapJobId: (localId: string, serverId: string) => void;

  // ---- Settings ----
  settings: NotificationUserSettings;
  updateSettings: (partial: Partial<NotificationUserSettings>) => Promise<void>;
  muteCategory: (category: NotificationCategory) => void;
  unmuteCategory: (category: NotificationCategory) => void;
}

export const NotificationControllerContext = createContext<
  NotificationControllerContextType | undefined
>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export function NotificationControllerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();

  // State exposed to consumers
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingJobs, setPendingJobs] = useState<PendingJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [settings, setSettings] = useState<NotificationUserSettings>(
    notificationSystem.getSettings(),
  );

  const initRef = useRef(false);
  const fetchRetryCount = useRef(0);
  /** Holds cleanup fns for shared notification socket subscriptions */
  const socketUnsubsRef = useRef<Array<() => void>>([]);

  // ==========================================================================
  // 1. INITIALIZE SYSTEM + RENDERER
  // ==========================================================================

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    // Init system (loads settings + dedupe cache from AsyncStorage)
    notificationSystem.initialize().catch(console.error);

    // Setup deeplink handler for toast taps
    setDeeplinkHandler((deeplink: string) => {
      try {
        router.push(deeplink as any);
      } catch (error) {
        console.warn(
          "[NotificationController] Deeplink navigation error:",
          error,
        );
      }
    });

    // Start renderer
    notificationRenderer.start();

    return () => {
      notificationRenderer.stop();
      notificationSystem.destroy();
      jobProgressManager.destroy();
      setDeeplinkHandler(null);
    };
  }, []);

  // ==========================================================================
  // 2. SUBSCRIBE TO SYSTEM + JOB MANAGER EVENTS
  // ==========================================================================

  useEffect(() => {
    const unsubSystem = notificationSystem.subscribe((event) => {
      switch (event.type) {
        case "update_center":
          setNotifications(event.notifications);
          break;
        case "badge_update":
          setUnreadCount(event.count);
          break;
        case "settings_changed":
          setSettings(event.settings);
          break;
      }
    });

    const unsubJobs = jobProgressManager.subscribe((event) => {
      setPendingJobs(jobProgressManager.getAllJobs());
    });

    return () => {
      unsubSystem();
      unsubJobs();
    };
  }, []);

  // ==========================================================================
  // 3. SHARED NOTIFICATION SOCKET (subscribe to singleton)
  // ==========================================================================

  useEffect(() => {
    if (!user) {
      // Unsubscribe on logout — do NOT disconnect the singleton
      // (UnifiedNotificationContext may still be mounted)
      socketUnsubsRef.current.forEach((fn) => fn());
      socketUnsubsRef.current = [];
      setIsWsConnected(false);
      return;
    }

    const userId =
      typeof user.id === "number" ? user.id : parseInt(String(user.id), 10);
    if (isNaN(userId) || userId <= 0) return;

    let pingInterval: ReturnType<typeof setInterval> | null = null;

    // Connect the shared singleton (no-ops if already connected)
    notificationSocket.connect(userId).then(() => {
      // Clean any previous subscriptions
      socketUnsubsRef.current.forEach((fn) => fn());
      socketUnsubsRef.current = [];

      const unsubs: Array<() => void> = [];

      unsubs.push(
        notificationSocket.on("connect", (data) => {
          console.log("[NotificationController] Shared socket connected");
          setIsWsConnected(true);

          // Sync stale data on reconnect
          if (data?.reconnected) {
            fetchNotifications();
          }
        }),
      );

      unsubs.push(
        notificationSocket.on("disconnect", () => {
          console.log("[NotificationController] Shared socket disconnected");
          setIsWsConnected(false);
        }),
      );

      // ---- Push notification events ----
      unsubs.push(
        notificationSocket.on("notification", (data: PushNotificationEvent) => {
          const event: PushNotificationEvent = {
            ...data,
            type: "notification.created",
          };
          notificationSystem.ingest(event);
        }),
      );

      unsubs.push(
        notificationSocket.on(
          "notification.created",
          (data: PushNotificationEvent) => {
            notificationSystem.ingest(data);
          },
        ),
      );

      unsubs.push(
        notificationSocket.on("broadcast", (data: PushNotificationEvent) => {
          const event: PushNotificationEvent = {
            ...data,
            type: "notification.created",
            category: data.category || ("system" as any),
            severity: data.severity || "info",
          };
          notificationSystem.ingest(event);
        }),
      );

      // ---- Job progress events ----
      unsubs.push(
        notificationSocket.on("job.progress", (data: JobEvent) => {
          jobProgressManager.handleEvent(data);
        }),
      );

      unsubs.push(
        notificationSocket.on("job.done", (data: JobEvent) => {
          jobProgressManager.handleEvent(data);
        }),
      );

      unsubs.push(
        notificationSocket.on("job.failed", (data: JobEvent) => {
          jobProgressManager.handleEvent(data);
        }),
      );

      // ---- Badge sync event ----
      unsubs.push(
        notificationSocket.on(
          "badge.sync",
          (data: { counts: Record<string, number>; total: number }) => {
            setUnreadCount(data.total);
          },
        ),
      );

      // Ping-pong health check via shared socket
      pingInterval = setInterval(() => {
        notificationSocket.emitToServer("ping");
      }, 30000);

      socketUnsubsRef.current = unsubs;

      // Set initial connected state
      setIsWsConnected(notificationSocket.connected);
    });

    return () => {
      if (pingInterval) clearInterval(pingInterval);
      socketUnsubsRef.current.forEach((fn) => fn());
      socketUnsubsRef.current = [];
      setIsWsConnected(false);
    };
  }, [user]);

  // ==========================================================================
  // 4. REST API SYNC (initial fetch + fallback polling)
  // ==========================================================================

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await apiFetch(NOTIFICATION_ENDPOINTS.LIST);

      if (response.success && Array.isArray(response.notifications)) {
        // Convert REST items to PushNotificationEvent format for dedup ingestion
        const events: PushNotificationEvent[] = response.notifications.map(
          (n: any) => ({
            type: "notification.created" as const,
            id: n.id,
            userId:
              typeof user.id === "number"
                ? user.id
                : parseInt(String(user.id), 10),
            category: (n.category || "system") as NotificationCategory,
            severity: n.severity || n.type || "info",
            title: n.title,
            body: n.message || n.body || "",
            deeplink: n.deeplink,
            createdAt: n.createdAt,
            dedupeKey: n.dedupeKey,
            data: n.data,
            silent: true, // Don't toast on REST sync
          }),
        );

        notificationSystem.ingestBatch(events);
      }
      fetchRetryCount.current = 0; // Reset on success
    } catch (error: any) {
      const status = error?.status ?? error?.data?.statusCode;
      if (status === 404) {
        console.warn(
          "[NotificationController] Notifications endpoint not found",
        );
      } else {
        console.error("[NotificationController] Fetch error:", error);
        // Auto-retry with back-off (max 3 attempts)
        if (fetchRetryCount.current < 3) {
          fetchRetryCount.current++;
          const delay = Math.min(
            2000 * Math.pow(2, fetchRetryCount.current),
            15000,
          );
          setTimeout(() => fetchNotifications(), delay);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch + polling
  useEffect(() => {
    if (!user) return;

    const timer = setTimeout(fetchNotifications, 500);

    // Fallback polling every 60s when WS offline
    const pollInterval = setInterval(() => {
      if (!isWsConnected) {
        console.log("[NotificationController] WS offline, polling REST");
        fetchNotifications();
      }
    }, 60000);

    return () => {
      clearTimeout(timer);
      clearInterval(pollInterval);
    };
  }, [user, isWsConnected, fetchNotifications]);

  // ==========================================================================
  // 4b. APP STATE (foreground sync)
  // ==========================================================================

  useEffect(() => {
    if (!user) return;

    let lastBackground = 0;

    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === "background" || nextState === "inactive") {
        lastBackground = Date.now();
      } else if (nextState === "active" && lastBackground > 0) {
        // Sync if backgrounded for > 30s
        const elapsed = Date.now() - lastBackground;
        if (elapsed > 30_000) {
          console.log(
            "[NotificationController] Returned from background, syncing",
          );
          fetchNotifications();
        }
      }
    };

    const sub = AppState.addEventListener("change", handleAppState);
    return () => sub.remove();
  }, [user, fetchNotifications]);

  // ==========================================================================
  // 5. ACTIONS
  // ==========================================================================

  const markAsRead = useCallback(async (id: string) => {
    notificationSystem.markAsRead(id);
    try {
      await apiFetch(NOTIFICATION_ENDPOINTS.MARK_READ(id), { method: "PATCH" });
    } catch {
      // Optimistic: already updated locally
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    notificationSystem.markAllAsRead();
    try {
      await apiFetch(NOTIFICATION_ENDPOINTS.MARK_ALL_READ, { method: "PATCH" });
    } catch {
      // Optimistic
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    notificationSystem.removeItem(id);
    try {
      await apiFetch(NOTIFICATION_ENDPOINTS.DELETE(id), { method: "DELETE" });
    } catch {
      // Optimistic
    }
  }, []);

  const clearAll = useCallback(() => {
    notificationSystem.clearAll();
  }, []);

  const createPendingJob = useCallback(
    (params: { label: string; resultRoute?: string }) => {
      return jobProgressManager.createPendingJob(params);
    },
    [],
  );

  const cancelJob = useCallback((jobId: string) => {
    jobProgressManager.cancelJob(jobId);
  }, []);

  const mapJobId = useCallback((localId: string, serverId: string) => {
    jobProgressManager.updateJobId(localId, serverId);
  }, []);

  const updateSettings = useCallback(
    async (partial: Partial<NotificationUserSettings>) => {
      await notificationSystem.updateSettings(partial);
    },
    [],
  );

  const muteCategory = useCallback((category: NotificationCategory) => {
    notificationSystem.muteCategory(category);
  }, []);

  const unmuteCategory = useCallback((category: NotificationCategory) => {
    notificationSystem.unmuteCategory(category);
  }, []);

  const unreadByCategory = useCallback(
    (category: NotificationCategory) => {
      return notificationSystem.getUnreadCountByCategory(category);
    },

    [notifications], // re-compute when notifications change
  );

  const hasActiveJobs = pendingJobs.some(
    (j) => j.status === "pending" || j.status === "in_progress",
  );

  // ==========================================================================
  // 6. CONTEXT VALUE
  // ==========================================================================

  const value = useMemo<NotificationControllerContextType>(
    () => ({
      notifications,
      unreadCount,
      unreadByCategory,
      loading,
      isWsConnected,
      refreshNotifications: fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
      pendingJobs,
      hasActiveJobs,
      createPendingJob,
      cancelJob,
      mapJobId,
      settings,
      updateSettings,
      muteCategory,
      unmuteCategory,
    }),
    [
      notifications,
      unreadCount,
      unreadByCategory,
      loading,
      isWsConnected,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
      pendingJobs,
      hasActiveJobs,
      createPendingJob,
      cancelJob,
      mapJobId,
      settings,
      updateSettings,
      muteCategory,
      unmuteCategory,
    ],
  );

  return (
    <NotificationControllerContext.Provider value={value}>
      {children}
    </NotificationControllerContext.Provider>
  );
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Main hook to access the unified notification system.
 */
export function useNotificationController(): NotificationControllerContextType {
  const context = useContext(NotificationControllerContext);
  if (!context) {
    throw new Error(
      "useNotificationController must be used within NotificationControllerProvider",
    );
  }
  return context;
}

/**
 * Convenience hook: only push notifications (no jobs).
 */
export function useNotificationCenter() {
  const {
    notifications,
    unreadCount,
    unreadByCategory,
    loading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotificationController();

  return {
    notifications,
    unreadCount,
    unreadByCategory,
    loading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
}

/**
 * Convenience hook: only pending jobs.
 */
export function usePendingJobs() {
  const { pendingJobs, hasActiveJobs, createPendingJob, cancelJob, mapJobId } =
    useNotificationController();

  return {
    pendingJobs,
    hasActiveJobs,
    createPendingJob,
    cancelJob,
    mapJobId,
  };
}

/**
 * Convenience hook: notification settings.
 */
export function useNotificationSettings() {
  const { settings, updateSettings, muteCategory, unmuteCategory } =
    useNotificationController();

  return {
    settings,
    updateSettings,
    muteCategory,
    unmuteCategory,
  };
}
