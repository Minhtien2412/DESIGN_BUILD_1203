import { ENV } from "@/config/env";
import { NOTIFICATION_ENDPOINTS } from "@/constants/api-endpoints";
import { apiFetch } from "@/services/api";
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
import { getSocketIo } from "@/utils/socketIo";
import type { Socket } from "@/utils/socketIo";
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

  const socketRef = useRef<Socket | null>(null);

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

  // WebSocket connection setup - DISABLED to prevent infinite loop
  useEffect(() => {
    // ENABLED: Using BadgeSyncService for unified WebSocket handling
    // Real-time notifications now handled by BadgeSyncService in UnifiedBadgeContext
    const ENABLE_NOTIFICATION_WEBSOCKET = true;

    if (!user) {
      // Cleanup socket if user logs out
      if (socketRef.current) {
        console.log(
          "[Notifications] User logged out - disconnecting WebSocket",
        );
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    if (!ENABLE_NOTIFICATION_WEBSOCKET) {
      console.log(
        "[Notifications] WebSocket disabled - using REST API polling",
      );
      return;
    }

    console.log(
      "[Notifications] Setting up WebSocket connection for user:",
      user.id,
    );

    // Build WebSocket URL with proper notifications namespace
    const wsBaseUrl = ENV.WS_BASE_URL || ENV.WS_URL || "wss://baotienweb.cloud";
    const notificationNs = ENV.WS_NOTIFICATION_NS || "/notifications";
    const wsUrl = `${wsBaseUrl}${notificationNs}`;

    if (!wsBaseUrl) {
      console.warn(
        "[Notifications] WS_BASE_URL not configured, skipping WebSocket connection",
      );
      return;
    }
    console.log("[Notifications] Connecting to:", wsUrl);

    // Ensure userId is a valid number
    const userId =
      typeof user.id === "number" ? user.id : parseInt(String(user.id), 10);
    if (isNaN(userId) || userId <= 0) {
      console.warn(
        "[Notifications] Invalid userId, skipping WebSocket connection",
      );
      return;
    }

    let pingInterval: ReturnType<typeof setInterval> | null = null;

    // Create Socket.IO connection
    getSocketIo()
      .then((io) => {
        const socket = io(wsUrl, {
      transports: ["websocket", "polling"], // Try WebSocket first, fallback to polling
      reconnection: false, // Disable auto-reconnection to prevent loop
      timeout: 10000,
        });

    // Connection event
    socket.on("connect", () => {
      console.log(
        "[Notifications] WebSocket connected - Socket ID:",
        socket.id,
      );
      setIsConnected(true);

      // Register user for notifications with valid number userId
      console.log("[Notifications] Registering user:", userId);
      socket.emit("register", { userId: userId });
    });

    // Connection confirmation
    socket.on("connected", (data: { message?: string; socketId?: string }) => {
      console.log("[Notifications] Connected to server:", data);
    });

    // Registration confirmation
    socket.on("registered", (data: { userId?: string; success?: boolean }) => {
      console.log("[Notifications] ✅ Registered successfully:", data);
    });

    // Receive real-time notification
    socket.on("notification", (notification: Notification) => {
      console.log(
        "[Notifications] 🔔 Received real-time notification:",
        notification,
      );

      // Add to state at the beginning
      setNotifications((prev) => {
        // Avoid duplicates (check by ID)
        const exists = prev.find((n) => n.id === notification.id);
        if (exists) return prev;
        return [notification, ...prev];
      });

      // Increment unread count if not read
      if (!notification.read) {
        setUnreadCount((prev) => prev + 1);
      }

      // Show toast
      showNotificationToast(notification);
    });

    // Broadcast notifications (system-wide)
    socket.on("broadcast", (notification: any) => {
      console.log("[Notifications] 📢 Broadcast received:", notification);
      showNotificationToast(notification);
    });

    // Disconnect event
    socket.on("disconnect", (reason: string) => {
      console.log("[Notifications] WebSocket disconnected:", reason);
      setIsConnected(false);
    });

    // Connection error
    socket.on("connect_error", (error: Error) => {
      console.error(
        "[Notifications] WebSocket connection error:",
        error.message,
      );
      setIsConnected(false);
    });

    // General error
    socket.on("error", (error: Error) => {
      console.error("[Notifications] WebSocket error:", error);
    });

    // Ping-pong for connection health check
    pingInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit("ping");
      }
    }, 30000); // Every 30 seconds

    socket.on("pong", (data: unknown) => {
      console.log("[Notifications] Pong received:", data);
    });

    socketRef.current = socket;
      })
      .catch((error) => {
        console.warn(
          "[Notifications] WebSocket init failed (skipping):",
          error,
        );
        setIsConnected(false);
      });

    // Cleanup on unmount
    return () => {
      console.log("[Notifications] Cleaning up WebSocket connection");
      if (pingInterval) {
        clearInterval(pingInterval);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
    };
  }, [user, showNotificationToast]);

  // Initial fetch and polling setup (fallback if WebSocket fails)
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Delay initial fetch to ensure token is set in API service
    const initialFetchTimer = setTimeout(() => {
      fetchNotifications();
    }, 100);

    // Poll every 60 seconds (increased since WebSocket handles real-time)
    const pollInterval = setInterval(() => {
      // Only poll if WebSocket is not connected (fallback)
      if (!isConnected) {
        console.log("[Notifications] WebSocket offline - polling via REST API");
        fetchNotifications();
      }
    }, 60000); // 60 seconds

    // Cleanup
    return () => {
      clearTimeout(initialFetchTimer);
      clearInterval(pollInterval);
    };
  }, [user, isConnected]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    isConnected, // Expose connection status
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
