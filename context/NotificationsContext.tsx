/**
 * Notifications Context
 * Manages push notifications state and real-time WebSocket notifications
 */
// import {
//     addNotificationReceivedListener,
//     addNotificationResponseListener,
//     getLastNotificationResponse,
//     initializePushNotifications,
//     markNotificationAsRead,
//     setBadgeCount,
// } from '@/services/pushNotifications';
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/services/api";
import { handleNotificationTap as navigateFromNotification } from "@/services/notificationNavigator";
import { socketManager } from "@/services/websocket/socketManager";
import Constants from "expo-constants";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

// Lazy import expo-notifications to avoid crash in Expo Go SDK 53+
let Notifications: typeof import("expo-notifications") | null = null;
const isExpoGo = Constants.appOwnership === "expo";

if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
  } catch (e) {
    console.warn("[NotificationsContext] expo-notifications not available");
  }
}

// ============================================================================
// Types
// ============================================================================

export interface AppNotification {
  id: string;
  type: "task" | "message" | "project" | "meeting" | "alert" | "system";
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  isConnected: boolean;
  addNotification: (notification: Omit<AppNotification, "id">) => void;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

// ============================================================================
// Context
// ============================================================================

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

// Helper to safely call Notifications methods
async function safeSetBadgeCount(count: number): Promise<void> {
  if (Notifications) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.warn("[NotificationsContext] Failed to set badge:", error);
    }
  }
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationsProvider",
    );
  }
  return context;
}

// ============================================================================
// Provider
// ============================================================================

interface NotificationsProviderProps {
  children: React.ReactNode;
}

export function NotificationsProvider({
  children,
}: NotificationsProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const initializedRef = useRef(false);

  // Computed unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // ========================================================================
  // Initialization - Only when authenticated
  // ========================================================================

  useEffect(() => {
    if (isAuthenticated && user?.id && !initializedRef.current) {
      initializedRef.current = true;
      initializeNotifications();
    }
    return cleanup;
  }, [isAuthenticated, user?.id]);

  const initializeNotifications = async () => {
    try {
      // Initialize push notifications (skip if not available)
      // Note: Push notifications require development build, not available in Expo Go
      // await initializePushNotifications();

      // Connect to WebSocket for real-time notifications
      await connectWebSocket();

      // Load initial notifications
      await refreshNotifications();

      // Setup listeners
      setupNotificationListeners();

      // Check for notification that opened the app
      await handleInitialNotification();
    } catch (error) {
      console.error("[NotificationsContext] Initialization failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const cleanup = () => {
    socketManager.disconnect("notifications");
    initializedRef.current = false;
  };

  // ========================================================================
  // WebSocket Connection
  // ========================================================================

  const connectWebSocket = async () => {
    try {
      const socket = await socketManager.connect("notifications");
      setIsConnected(true);

      // Register user with backend for targeted notifications
      if (user?.id) {
        socket.emit("register", { userId: user.id });
        console.log(`[NotificationsContext] 📝 Registered userId: ${user.id}`);
      }

      // Listen for new notifications
      socketManager.on(
        "notifications",
        "new_notification",
        handleNewNotification,
      );

      // Also listen for "notification" event (backend uses this name)
      socketManager.on("notifications", "notification", handleNewNotification);

      // Listen for notification updates
      socketManager.on(
        "notifications",
        "notification_read",
        handleNotificationRead,
      );

      console.log("[NotificationsContext] ✅ WebSocket connected");
    } catch (error) {
      console.error(
        "[NotificationsContext] WebSocket connection failed:",
        error,
      );
      setIsConnected(false);
    }
  };

  // ========================================================================
  // Notification Handlers
  // ========================================================================

  const handleNewNotification = useCallback(
    async (notification: AppNotification) => {
      console.log(
        "[NotificationsContext] 🔔 New notification:",
        notification.title,
      );

      setNotifications((prev) => [notification, ...prev]);

      // Update badge count
      const newUnreadCount = unreadCount + 1;
      await safeSetBadgeCount(newUnreadCount);
    },
    [unreadCount],
  );

  const handleNotificationRead = useCallback(
    async (data: { notificationId: string }) => {
      console.log(
        "[NotificationsContext] ✓ Notification marked as read:",
        data.notificationId,
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === data.notificationId ? { ...n, read: true } : n,
        ),
      );

      // Update badge count
      const newUnreadCount = Math.max(0, unreadCount - 1);
      await safeSetBadgeCount(newUnreadCount);
    },
    [unreadCount],
  );

  // ========================================================================
  // Push Notification Listeners
  // ========================================================================

  const setupNotificationListeners = () => {
    // Skip if Notifications not available (Expo Go SDK 53+)
    if (!Notifications) {
      console.log(
        "[NotificationsContext] Notifications not available in Expo Go",
      );
      return () => {};
    }

    // Listen for notifications received while app is in foreground
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification: any) => {
        console.log(
          "[NotificationsContext] 📬 Notification received:",
          notification,
        );
        // Notification already handled by WebSocket or will be loaded on refresh
      },
    );

    // Listen for user tapping on notification
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response: any) => {
        console.log("[NotificationsContext] 👆 Notification tapped:", response);
        handleNotificationTap(response);
      });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  };

  const handleInitialNotification = async () => {
    if (!Notifications) return;

    try {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response) {
        console.log("[NotificationsContext] 🚀 App opened from notification");
        handleNotificationTap(response);
      }
    } catch (error) {
      console.warn(
        "[NotificationsContext] Failed to get initial notification:",
        error,
      );
    }
  };

  const handleNotificationTap = (
    response: any, // NotificationResponse type
  ) => {
    const data = response.notification.request.content.data as any;

    // Mark as read
    if (data.id && typeof data.id === "string") {
      markAsRead(data.id);
    }

    // Use notification navigator service for deep linking
    const result = navigateFromNotification(response);
    console.log("[NotificationsContext] Navigation result:", result);
  };

  // ========================================================================
  // API Methods
  // ========================================================================

  const addNotification = useCallback(
    (notification: Omit<AppNotification, "id">) => {
      const newNotification: AppNotification = {
        ...notification,
        id: Date.now().toString() + Math.random().toString(36).substring(7),
      };
      setNotifications((prev) => [newNotification, ...prev]);
    },
    [],
  );

  const refreshNotifications = async () => {
    try {
      setLoading(true);

      // Fetch notifications from backend API
      const response = await apiFetch<{
        data: Array<{
          id: number;
          type: string;
          title: string;
          message: string;
          data?: Record<string, any>;
          read: boolean;
          createdAt: string;
        }>;
        meta?: { total: number; unread: number };
      }>("/notifications", {
        method: "GET",
      });

      if (response?.data) {
        const mapped: AppNotification[] = response.data.map((n) => ({
          id: String(n.id),
          type: (n.type?.toLowerCase() || "system") as AppNotification["type"],
          title: n.title || "Thông báo",
          body: n.message || "",
          data: n.data,
          read: n.read ?? false,
          createdAt: n.createdAt || new Date().toISOString(),
        }));
        setNotifications(mapped);

        // Update badge count
        const unread = mapped.filter((n) => !n.read).length;
        await safeSetBadgeCount(unread);
        console.log(
          `[NotificationsContext] ✅ Loaded ${mapped.length} notifications (${unread} unread)`,
        );
      } else {
        setNotifications([]);
        await safeSetBadgeCount(0);
      }
    } catch (error: any) {
      // 401 = not logged in - use empty array
      if (error?.status === 401) {
        console.log(
          "[NotificationsContext] User not authenticated, using empty notifications",
        );
        setNotifications([]);
      } else {
        console.error("[NotificationsContext] Failed to refresh:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Backend uses PATCH /notifications/:id/read
      await apiFetch(`/notifications/${id}/read`, {
        method: "PATCH",
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );

      // Emit to WebSocket for other devices
      socketManager.emit("notifications", "mark_read", { notificationId: id });

      // Update badge
      const newUnreadCount = Math.max(0, unreadCount - 1);
      await safeSetBadgeCount(newUnreadCount);
    } catch (error) {
      console.error("[NotificationsContext] Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Backend uses PATCH /notifications/read-all
      await apiFetch("/notifications/read-all", {
        method: "PATCH",
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      await safeSetBadgeCount(0);
    } catch (error) {
      console.error(
        "[NotificationsContext] Failed to mark all as read:",
        error,
      );
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      // Backend uses PATCH /notifications/:id/archive
      await apiFetch(`/notifications/${id}/archive`, {
        method: "PATCH",
      });

      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("[NotificationsContext] Failed to delete:", error);
    }
  };

  const clearAll = async () => {
    try {
      // Use apiFetch for proper auth headers and API key
      await apiFetch("/notifications", {
        method: "DELETE",
      });

      setNotifications([]);
      await safeSetBadgeCount(0);
    } catch (error) {
      console.error("[NotificationsContext] Failed to clear all:", error);
    }
  };

  // ========================================================================
  // Context Value
  // ========================================================================

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    loading,
    isConnected,
    addNotification,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}
