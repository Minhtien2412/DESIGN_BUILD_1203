import { useCallback, useEffect, useRef, useState } from "react";
import notificationsApi, {
    Notification,
} from "../services/api/notificationsApi";
import NotificationRealtimeService from "../services/notificationRealtimeService";
import NotificationSyncService, {
    SyncResult,
    UnifiedNotification,
} from "../services/notificationSyncService";
import { cache, CacheTTL } from "../utils/cache";
import { getOfflineData, saveOfflineData } from "../utils/offlineStorage";
import { useNetworkStatus } from "./useNetworkStatus";

/**
 * Hook to fetch and manage notifications from backend API
 * Uses real API endpoints: GET /notifications (protected)
 *
 * Features:
 * - Fetch all notifications
 * - Track unread count
 * - Mark as read functionality
 * - Mark all as read
 * - Real-time updates via WebSocket (subscribe to 'notification:new' event)
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isOffline } = useNetworkStatus();

  const fetchNotifications = useCallback(
    async (isRetry = false) => {
      const CACHE_KEY = "notifications:all";
      const OFFLINE_KEY = "notifications_offline";

      try {
        // If offline, use cached offline data only (no mock data)
        if (isOffline) {
          console.log(
            "[useNotifications] Device offline, using offline storage",
          );
          const offlineData = await getOfflineData<Notification[]>(OFFLINE_KEY);
          if (offlineData && offlineData.length > 0) {
            setNotifications(offlineData);
            const unread = offlineData.filter((n) => !n.isRead).length;
            setUnreadCount(unread);
          } else {
            // No offline data available - show empty state
            console.log("[useNotifications] No offline data available");
            setNotifications([]);
            setUnreadCount(0);
          }
          setLoading(false);
          setError(null);
          return;
        }

        // Try cache first (unless retrying)
        if (!isRetry) {
          const cachedData = cache.get<Notification[]>(CACHE_KEY);
          if (cachedData) {
            console.log("[useNotifications] Using cached data");
            setNotifications(cachedData);
            const unread = cachedData.filter((n) => !n.isRead).length;
            setUnreadCount(unread);
            setLoading(false);
            setError(null);

            // Background refresh
            notificationsApi
              .getNotifications()
              .then((response) => {
                cache.set(CACHE_KEY, response.data, CacheTTL.SHORT); // Shorter TTL for notifications
                saveOfflineData(OFFLINE_KEY, response.data); // Persist for offline
                setNotifications(response.data);
                const unread = response.data.filter((n) => !n.isRead).length;
                setUnreadCount(unread);
              })
              .catch((err) => {
                console.error(
                  "[useNotifications] Background refresh failed:",
                  err,
                );
              });

            return;
          }
        }

        if (isRetry) {
          setRetrying(true);
        } else {
          setLoading(true);
        }
        setError(null);
        const response = await notificationsApi.getNotifications();

        // Cache with shorter TTL (notifications should be fresher)
        cache.set(CACHE_KEY, response.data, CacheTTL.SHORT);

        // Save to offline storage
        await saveOfflineData(OFFLINE_KEY, response.data);

        // Backend returns { data: Notification[], meta: {...} }
        setNotifications(response.data);

        // Calculate unread count
        const unread = response.data.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      } catch (err) {
        const apiError =
          err instanceof Error
            ? err
            : new Error("Failed to load notifications");
        console.error("[useNotifications] Error:", err);

        // Try offline data as fallback when API fails
        const offlineData = await getOfflineData<Notification[]>(OFFLINE_KEY);
        if (offlineData && offlineData.length > 0) {
          console.log(
            "[useNotifications] API failed, using cached offline data",
          );
          setNotifications(offlineData);
          const unread = offlineData.filter((n) => !n.isRead).length;
          setUnreadCount(unread);
          setError(null);
        } else {
          // No fallback data - show error and empty state
          console.log(
            "[useNotifications] API failed, no cached data available",
          );
          setNotifications([]);
          setUnreadCount(0);
          setError(apiError);
        }
      } finally {
        setLoading(false);
        setRetrying(false);
      }
    },
    [isOffline],
  );

  const markAsRead = useCallback(async (notificationId: number) => {
    // Update local state immediately (optimistic update)
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
    );

    // Decrement unread count
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await notificationsApi.markAsRead(notificationId);
      // Invalidate cache to force refresh next time
      cache.invalidate("notifications:all");
    } catch (err) {
      console.error(
        "[useNotifications] Mark as read API error (local state already updated):",
        err,
      );
      // Don't throw - local state is already updated
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    // Update all notifications to read immediately (optimistic update)
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    // Reset unread count
    setUnreadCount(0);

    try {
      await notificationsApi.markAllAsRead();
      // Invalidate cache
      cache.invalidate("notifications:all");
    } catch (err) {
      console.error(
        "[useNotifications] Mark all as read API error (local state already updated):",
        err,
      );
      // Don't throw - local state is already updated
    }
  }, []);

  const deleteNotification = useCallback(
    async (notificationId: number) => {
      // Update local state immediately (optimistic update)
      const notification = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      // Decrement unread count if notification was unread
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      try {
        await notificationsApi.deleteNotification(notificationId);
        // Invalidate cache
        cache.invalidate("notifications:all");
      } catch (err) {
        console.error(
          "[useNotifications] Delete API error (local state already updated):",
          err,
        );
        // Don't throw - local state is already updated
      }
    },
    [notifications],
  );

  // Add new notification from WebSocket (prepend to list)
  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);

    // Increment unread count if notification is unread
    if (!notification.isRead) {
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRetry = useCallback(async () => {
    await fetchNotifications(true);
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    retrying,
    unreadCount,
    refresh: handleRetry,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification, // For WebSocket real-time updates
  };
}

// Note: Backend doesn't have GET /notifications/:id endpoint yet
// For now, we can find notification from the list

// ==================== UNIFIED NOTIFICATIONS HOOK ====================

/**
 * Hook đồng bộ thông báo từ CRM và App Backend
 *
 * Features:
 * - Fetch từ cả Perfex CRM và App Backend
 * - Merge và deduplicate
 * - Sync trạng thái đọc
 * - Background auto-refresh
 */
export function useUnifiedNotifications(options?: {
  customerId?: string;
  contactId?: string;
  projectIds?: string[];
  autoSync?: boolean;
  syncIntervalMs?: number;
}) {
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { isOffline } = useNetworkStatus();
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync interval (default 5 minutes)
  const SYNC_INTERVAL = options?.syncIntervalMs || 5 * 60 * 1000;

  // Load cached data first
  const loadCachedData = useCallback(async () => {
    try {
      const cached = await NotificationSyncService.getAll();
      if (cached.length > 0) {
        setNotifications(cached);
        console.log(
          `[useUnifiedNotifications] Loaded ${cached.length} cached notifications`,
        );
      }

      const lastSync = await NotificationSyncService.getLastSyncTime();
      setLastSyncTime(lastSync);
    } catch (err) {
      console.error(
        "[useUnifiedNotifications] Failed to load cached data:",
        err,
      );
    }
  }, []);

  // Main sync function
  const syncNotifications = useCallback(
    async (showLoading = true) => {
      if (isOffline) {
        console.log("[useUnifiedNotifications] Offline, skipping sync");
        return null;
      }

      try {
        if (showLoading) {
          setSyncing(true);
        }
        setError(null);

        console.log("[useUnifiedNotifications] Starting sync...");
        const result = await NotificationSyncService.syncAll({
          customerId: options?.customerId,
          contactId: options?.contactId,
          projectIds: options?.projectIds,
        });

        setSyncResult(result);

        if (result.success) {
          // Reload from cache
          const updated = await NotificationSyncService.getAll();
          setNotifications(updated);
          setLastSyncTime(result.syncedAt);
          console.log(
            `[useUnifiedNotifications] Sync complete: ${result.totalNotifications} notifications`,
          );
        } else {
          setError(new Error(result.error || "Sync failed"));
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Sync failed");
        console.error("[useUnifiedNotifications] Sync error:", err);
        setError(error);
        return null;
      } finally {
        setSyncing(false);
        setLoading(false);
      }
    },
    [isOffline, options?.customerId, options?.contactId, options?.projectIds],
  );

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
    );

    try {
      await NotificationSyncService.markAsRead(notificationId);
    } catch (err) {
      console.error("[useUnifiedNotifications] Mark as read error:", err);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      await NotificationSyncService.markAllAsRead();
    } catch (err) {
      console.error("[useUnifiedNotifications] Mark all as read error:", err);
    }
  }, []);

  // Get counts
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const crmUnreadCount = notifications.filter(
    (n) => n.source === "CRM" && !n.isRead,
  ).length;
  const appUnreadCount = notifications.filter(
    (n) => n.source === "APP" && !n.isRead,
  ).length;

  // Filter by source
  const crmNotifications = notifications.filter((n) => n.source === "CRM");
  const appNotifications = notifications.filter((n) => n.source === "APP");

  // Initial load
  useEffect(() => {
    loadCachedData().then(() => {
      syncNotifications();
    });

    // Connect to realtime service for live updates
    NotificationRealtimeService.connect();

    // Subscribe to new notifications
    const unsubscribe = NotificationRealtimeService.subscribe(
      (newNotification) => {
        console.log(
          "[useUnifiedNotifications] Realtime notification received:",
          newNotification.id,
        );
        setNotifications((prev) => {
          // Check if already exists
          if (prev.some((n) => n.id === newNotification.id)) {
            return prev;
          }
          // Add to beginning of list
          return [newNotification, ...prev];
        });
      },
    );

    return () => {
      unsubscribe();
      // Don't disconnect here - other components might be using it
    };
  }, [loadCachedData, syncNotifications]);

  // Auto-sync interval
  useEffect(() => {
    if (options?.autoSync !== false && !isOffline) {
      syncIntervalRef.current = setInterval(() => {
        console.log("[useUnifiedNotifications] Auto-sync triggered");
        syncNotifications(false);
      }, SYNC_INTERVAL);

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
        }
      };
    }
  }, [options?.autoSync, isOffline, syncNotifications, SYNC_INTERVAL]);

  return {
    // All notifications
    notifications,

    // Split by source
    crmNotifications,
    appNotifications,

    // Counts
    unreadCount,
    crmUnreadCount,
    appUnreadCount,
    totalCount: notifications.length,

    // State
    loading,
    syncing,
    error,
    isOffline,

    // Sync info
    syncResult,
    lastSyncTime,

    // Actions
    sync: syncNotifications,
    markAsRead,
    markAllAsRead,
    clearCache: NotificationSyncService.clearCache,
  };
}
