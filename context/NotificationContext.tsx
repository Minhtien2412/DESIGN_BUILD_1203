import { NOTIFICATION_ENDPOINTS } from "@/constants/api-endpoints";
import { apiFetch } from "@/services/api";
import { notificationSocket } from "@/services/socket/notificationSocket";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import Toast from "react-native-toast-message";
import { useAuth } from "./AuthContext";

// Types
export interface Notification {
  id: string;
  type:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "message"
    | "call"
    | "system"
    | "event"
    | "live";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  category?:
    | "system"
    | "event"
    | "live"
    | "message"
    | "call"
    | "project"
    | "payment"
    | "security";
  priority?: "low" | "normal" | "high" | "urgent";
  data?: any; // Additional data like user info, project info, etc.
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  isConnected: boolean; // WebSocket connection status
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  /** Cleanup functions for shared socket subscriptions */
  const unsubsRef = useRef<Array<() => void>>([]);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);

      console.log("[Notifications] Fetching for user:", user.id);

      // Use correct endpoint from backend API
      const response = await apiFetch(NOTIFICATION_ENDPOINTS.LIST);

      console.log("[Notifications] Fetch success:", response);

      if (response.success && Array.isArray(response.notifications)) {
        setNotifications(response.notifications);
        setUnreadCount(
          response.unread ||
            response.notifications.filter((n: Notification) => !n.read).length,
        );
      }
    } catch (error: any) {
      // Gracefully handle APIs where notifications are not implemented yet
      const status = error?.status ?? error?.data?.statusCode;
      if (status === 404) {
        console.warn(
          "[Notifications] Endpoint not found (404). Using empty list.",
        );
        setNotifications((prev) => (prev.length ? prev : []));
        setUnreadCount(0);
      } else {
        console.error("[Notifications] Fetch error:", error);
      }
      // On error, keep existing notifications (don't clear) unless 404 explicit empty
    } finally {
      setLoading(false);
    }
  };

  // Refresh notifications (for pull-to-refresh)
  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  // Mark single notification as read
  const markAsRead = async (id: string) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Call backend with correct endpoint (PATCH not POST)
      await apiFetch(NOTIFICATION_ENDPOINTS.MARK_READ(id), {
        method: "PATCH",
      });
    } catch (error) {
      // Silently fail if backend not ready
      // console.error('[Notifications] Mark as read error:', error);
      // Revert on error
      await fetchNotifications();
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);

      // Call backend with correct endpoint (PATCH not POST)
      await apiFetch(NOTIFICATION_ENDPOINTS.MARK_ALL_READ, {
        method: "PATCH",
      });
    } catch (error) {
      // Silently fail if backend not ready
      // console.error('[Notifications] Mark all as read error:', error);
      // Revert on error
      await fetchNotifications();
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      const notification = notifications.find((n) => n.id === id);

      // Optimistic update
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (notification && !notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      // Call backend with correct endpoint
      await apiFetch(NOTIFICATION_ENDPOINTS.DELETE(id), {
        method: "DELETE",
      });
    } catch (error) {
      console.error("[Notifications] Delete error:", error);
      // Revert on error
      await fetchNotifications();
    }
  };

  // Show toast notification
  const showNotificationToast = useCallback((notification: Notification) => {
    Toast.show({
      type:
        notification.type === "error"
          ? "error"
          : notification.type === "success"
            ? "success"
            : "info",
      text1: notification.title,
      text2: notification.message,
      position: "top",
      visibilityTime: 4000,
      topOffset: 50,
      onPress: () => {
        // Optional: Navigate to notification detail
        Toast.hide();
      },
    });
  }, []);

  // ── WebSocket via shared singleton (NO duplicate io() call) ──
  useEffect(() => {
    if (!user) {
      unsubsRef.current.forEach((fn) => fn());
      unsubsRef.current = [];
      setIsConnected(false);
      return;
    }

    const userId =
      typeof user.id === "number" ? user.id : parseInt(String(user.id), 10);
    if (isNaN(userId) || userId <= 0) {
      console.warn("[Notifications] Invalid userId, skipping WS");
      return;
    }

    console.log(
      "[Notifications] Subscribing to shared socket for user:",
      userId,
    );

    notificationSocket.connect(userId).then(() => {
      // Clean previous subscriptions
      unsubsRef.current.forEach((fn) => fn());
      unsubsRef.current = [];

      const unsubs: Array<() => void> = [];

      unsubs.push(
        notificationSocket.on("connect", () => {
          console.log("[Notifications] Shared socket connected");
          setIsConnected(true);
        }),
      );
      unsubs.push(
        notificationSocket.on("disconnect", () => {
          setIsConnected(false);
        }),
      );
      unsubs.push(
        notificationSocket.on("notification", (notification: Notification) => {
          setNotifications((prev) => {
            const exists = prev.find((n) => n.id === notification.id);
            if (exists) return prev;
            return [notification, ...prev];
          });
          if (!notification.read) {
            setUnreadCount((prev) => prev + 1);
          }
          showNotificationToast(notification);
        }),
      );
      unsubs.push(
        notificationSocket.on("broadcast", (notification: any) => {
          showNotificationToast(notification);
        }),
      );

      unsubsRef.current = unsubs;
      setIsConnected(notificationSocket.connected);
    });

    return () => {
      unsubsRef.current.forEach((fn) => fn());
      unsubsRef.current = [];
      setIsConnected(false);
    };
  }, [user, showNotificationToast]);

  // Initial fetch + fallback polling (only when WS is down)
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const initialFetchTimer = setTimeout(() => {
      fetchNotifications();
    }, 100);

    const pollInterval = setInterval(() => {
      if (!isConnected) {
        fetchNotifications();
      }
    }, 60000);

    return () => {
      clearTimeout(initialFetchTimer);
      clearInterval(pollInterval);
    };
  }, [user, isConnected]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    isConnected,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}
