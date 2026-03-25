/**
 * Unified Notification Context
 * =============================
 *
 * Hợp nhất 3 notification contexts thành 1:
 * - NotificationContext.tsx (WebSocket + REST API)
 * - NotificationsContext.tsx (expo-notifications + socketManager)
 * - PushNotificationContext.tsx (Push notifications)
 *
 * Features:
 * - WebSocket real-time notifications
 * - REST API fallback
 * - Push notifications (expo-notifications)
 * - Badge management
 * - Multi-device support
 *
 * @author ThietKeResort Team
 * @created 2026-01-27
 */

import { NOTIFICATION_ENDPOINTS } from "@/constants/api-endpoints";
import { apiFetch } from "@/services/api";
import { handleNotificationTap } from "@/services/notificationNavigator";
import { notificationSocket } from "@/services/socket/notificationSocket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "./AuthContext";

// Lazy import expo-notifications to avoid crash in Expo Go SDK 53+
let Notifications: typeof import("expo-notifications") | null = null;
const isExpoGo = Constants.appOwnership === "expo";

if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
  } catch (e) {
    console.warn("[UnifiedNotification] expo-notifications not available");
  }
}

// ============================================================================
// TYPES
// ============================================================================

export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "message"
  | "call"
  | "system"
  | "event"
  | "live"
  | "task"
  | "project"
  | "meeting"
  | "alert"
  // Friend activity types
  | "friend_post"
  | "friend_livestream"
  | "friend_story"
  | "friend_reel"
  | "follow"
  | "like"
  | "comment"
  | "mention"
  | "share";

export type NotificationCategory =
  | "system"
  | "event"
  | "live"
  | "message"
  | "call"
  | "project"
  | "payment"
  | "security"
  // Friend activity categories
  | "social"
  | "friend_activity"
  | "content";

export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export interface UnifiedNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  body?: string; // Alias for message (expo-notifications compatibility)
  read: boolean;
  isRead?: boolean; // Alias for read
  createdAt: string;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  data?: Record<string, any>;
  source?: "app" | "crm" | "system" | "push";

  // Navigation
  relatedType?: string;
  relatedId?: string;

  // Friend Activity Fields
  actorId?: string;
  actorName?: string;
  actorAvatar?: string;
  contentType?: "post" | "livestream" | "story" | "reel" | "comment";
  contentId?: string;
  contentPreview?: string;
  thumbnailUrl?: string;
}

// Friend Activity Notification Data
export interface FriendActivityData {
  actorId: string;
  actorName: string;
  actorAvatar?: string;
  contentType: "post" | "livestream" | "story" | "reel" | "comment";
  contentId: string;
  contentPreview?: string;
  thumbnailUrl?: string;
}

interface UnifiedNotificationContextType {
  // State
  notifications: UnifiedNotification[];
  unreadCount: number;
  loading: boolean;
  isConnected: boolean;
  pushToken: string | null;
  isPushEnabled: boolean;

  // Actions - Notification Management
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  addNotification: (notification: Omit<UnifiedNotification, "id">) => void;

  // Actions - Push Notifications
  registerForPushNotifications: () => Promise<string | null>;
  requestPushPermissions: () => Promise<boolean>;
  schedulePushNotification: (
    title: string,
    body: string,
    data?: any,
    triggerSeconds?: number,
  ) => Promise<string>;

  // Friend Activity
  subscribeFriendActivities: (friendIds: string[]) => void;
  unsubscribeFriendActivities: () => void;
  setFriendActivityNotificationsEnabled: (enabled: boolean) => Promise<void>;
  isFriendActivityEnabled: boolean;

  // Event handlers
  onNotificationReceived?: (notification: UnifiedNotification) => void;
  onNotificationTapped?: (notification: UnifiedNotification) => void;
}

const UnifiedNotificationContext = createContext<
  UnifiedNotificationContextType | undefined
>(undefined);

// ============================================================================
// PUSH NOTIFICATION SETUP
// ============================================================================

// Configure notification behavior (only if Notifications available)
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// Storage keys
const PUSH_TOKEN_KEY = "@unified_push_token";
const PUSH_ENABLED_KEY = "@unified_push_enabled";
const NOTIFICATIONS_CACHE_KEY = "@unified_notifications_cache";
const FRIEND_ACTIVITY_ENABLED_KEY = "@friend_activity_enabled";

// ============================================================================
// PROVIDER
// ============================================================================

export function UnifiedNotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();

  // Notification state
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // WebSocket state — provided by shared notificationSocket singleton
  const [isConnected, setIsConnected] = useState(false);

  // Push notification state
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isPushEnabled, setIsPushEnabled] = useState(false);

  // Friend activity state
  const [isFriendActivityEnabled, setIsFriendActivityEnabled] = useState(true);
  const subscribedFriendsRef = useRef<string[]>([]);

  // Refs for listeners (use any type for compatibility)
  const notificationListenerRef = useRef<any>(null);
  const responseListenerRef = useRef<any>(null);
  const initStartedRef = useRef(false);

  // ========================================================================
  // INITIALIZATION - DEFERRED TO NOT BLOCK UI
  // ========================================================================

  useEffect(() => {
    // Prevent double init
    if (initStartedRef.current) return;
    initStartedRef.current = true;

    // Defer initialization to not block main thread
    const timeoutId = setTimeout(() => {
      initializeNotifications();
    }, 1000); // Wait 1s after mount before initializing

    return () => {
      clearTimeout(timeoutId);
      cleanup();
    };
  }, [user]);

  const initializeNotifications = async () => {
    try {
      // Load cached notifications first (fast, local)
      await loadCachedNotifications();

      // Setup push notifications (can be slow)
      // Defer this further
      setTimeout(async () => {
        await setupPushNotifications();
      }, 500);

      // Load friend activity settings (fast, local)
      await loadFriendActivitySettings();

      // Connect WebSocket - ONLY if user is logged in
      // Defer this to avoid blocking
      if (user) {
        setTimeout(() => {
          connectWebSocket();
        }, 1500); // Wait 1.5s more before WebSocket

        setTimeout(() => {
          fetchNotifications();
        }, 2000); // Wait 2s before fetching
      }
    } catch (error) {
      console.error("[UnifiedNotification] Init error:", error);
    }
  };

  const cleanup = () => {
    // Unsubscribe from shared notification socket (do NOT disconnect it —
    // other consumers rely on the same singleton)
    unsubsRef.current.forEach((unsub) => unsub());
    unsubsRef.current = [];

    // Remove push notification listeners
    if (notificationListenerRef.current) {
      notificationListenerRef.current.remove();
    }
    if (responseListenerRef.current) {
      responseListenerRef.current.remove();
    }
  };

  // Ref to hold unsubscribe functions for the shared socket events
  const unsubsRef = useRef<Array<() => void>>([]);

  // ========================================================================
  // CACHED NOTIFICATIONS
  // ========================================================================

  const loadCachedNotifications = async () => {
    try {
      const cached = await AsyncStorage.getItem(NOTIFICATIONS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setNotifications(parsed);
        setUnreadCount(
          parsed.filter((n: UnifiedNotification) => !n.read).length,
        );
      }
    } catch (error) {
      console.error("[UnifiedNotification] Failed to load cache:", error);
    }
  };

  const cacheNotifications = async (notifs: UnifiedNotification[]) => {
    try {
      await AsyncStorage.setItem(
        NOTIFICATIONS_CACHE_KEY,
        JSON.stringify(notifs.slice(0, 100)), // Cache last 100
      );
    } catch (error) {
      console.error("[UnifiedNotification] Failed to cache:", error);
    }
  };

  // ========================================================================
  // WEBSOCKET CONNECTION
  // ========================================================================

  const connectWebSocket = useCallback(async () => {
    if (!user) {
      console.log(
        "[UnifiedNotification] No user, skipping WebSocket connection",
      );
      return;
    }

    // Validate user.id
    const userId =
      typeof user.id === "number" ? user.id : parseInt(String(user.id), 10);
    if (isNaN(userId) || userId <= 0) {
      console.error("[UnifiedNotification] Invalid userId:", user.id);
      return;
    }

    console.log(
      "[UnifiedNotification] Subscribing to shared notificationSocket for userId:",
      userId,
    );

    // Connect the shared singleton (no-ops if already connected for this user)
    await notificationSocket.connect(userId);

    // Clean up previous subscriptions
    unsubsRef.current.forEach((unsub) => unsub());
    unsubsRef.current = [];

    // Subscribe to events from the shared socket
    unsubsRef.current.push(
      notificationSocket.on("connect", () => {
        console.log("[UnifiedNotification] ✅ Shared socket connected");
        setIsConnected(true);
      }),
    );

    unsubsRef.current.push(
      notificationSocket.on("disconnect", () => {
        setIsConnected(false);
      }),
    );

    unsubsRef.current.push(
      notificationSocket.on(
        "notification",
        (notification: UnifiedNotification) => {
          console.log(
            "[UnifiedNotification] 🔔 Received notification:",
            JSON.stringify(notification),
          );
          handleIncomingNotification(notification);
        },
      ),
    );

    unsubsRef.current.push(
      notificationSocket.on(
        "broadcast",
        (notification: UnifiedNotification) => {
          console.log("[UnifiedNotification] 📢 Broadcast:", notification);
          handleIncomingNotification({ ...notification, source: "system" });
        },
      ),
    );

    // Friend Activity Events
    unsubsRef.current.push(
      notificationSocket.on("friend_new_post", (data: FriendActivityData) => {
        if (!isFriendActivityEnabled) return;
        console.log("[UnifiedNotification] 📝 Friend new post:", data);
        handleFriendActivity(
          "friend_post",
          data,
          `${data.actorName} đã đăng bài viết mới`,
        );
      }),
    );

    unsubsRef.current.push(
      notificationSocket.on(
        "friend_start_livestream",
        (data: FriendActivityData) => {
          if (!isFriendActivityEnabled) return;
          console.log("[UnifiedNotification] 🔴 Friend livestream:", data);
          handleFriendActivity(
            "friend_livestream",
            data,
            `${data.actorName} đang phát trực tiếp`,
          );
        },
      ),
    );

    unsubsRef.current.push(
      notificationSocket.on("friend_new_story", (data: FriendActivityData) => {
        if (!isFriendActivityEnabled) return;
        console.log("[UnifiedNotification] 📸 Friend new story:", data);
        handleFriendActivity(
          "friend_story",
          data,
          `${data.actorName} đã đăng tin mới`,
        );
      }),
    );

    unsubsRef.current.push(
      notificationSocket.on("friend_new_reel", (data: FriendActivityData) => {
        if (!isFriendActivityEnabled) return;
        console.log("[UnifiedNotification] 🎬 Friend new reel:", data);
        handleFriendActivity(
          "friend_reel",
          data,
          `${data.actorName} đã đăng video ngắn`,
        );
      }),
    );

    // Set connected state based on current singleton status
    setIsConnected(notificationSocket.connected);
  }, [user, isFriendActivityEnabled]);

  // ========================================================================
  // FRIEND ACTIVITY HANDLERS
  // ========================================================================

  const loadFriendActivitySettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(FRIEND_ACTIVITY_ENABLED_KEY);
      if (saved !== null) {
        setIsFriendActivityEnabled(saved === "true");
      }
    } catch (error) {
      console.error(
        "[UnifiedNotification] Failed to load friend activity settings:",
        error,
      );
    }
  };

  const handleFriendActivity = (
    type: NotificationType,
    data: FriendActivityData,
    message: string,
  ) => {
    const notification: UnifiedNotification = {
      id: `friend_${type}_${Date.now()}_${data.contentId}`,
      type,
      title: getFriendActivityTitle(type),
      message,
      read: false,
      createdAt: new Date().toISOString(),
      category: "friend_activity",
      priority: type === "friend_livestream" ? "high" : "normal",
      source: "app",
      actorId: data.actorId,
      actorName: data.actorName,
      actorAvatar: data.actorAvatar,
      contentType: data.contentType,
      contentId: data.contentId,
      contentPreview: data.contentPreview,
      thumbnailUrl: data.thumbnailUrl,
      relatedType: data.contentType,
      relatedId: data.contentId,
      data,
    };

    handleIncomingNotification(notification);
  };

  const getFriendActivityTitle = (type: NotificationType): string => {
    switch (type) {
      case "friend_post":
        return "Bài viết mới";
      case "friend_livestream":
        return "🔴 Đang phát trực tiếp";
      case "friend_story":
        return "Tin mới";
      case "friend_reel":
        return "Video ngắn mới";
      default:
        return "Hoạt động bạn bè";
    }
  };

  const subscribeFriendActivities = useCallback((friendIds: string[]) => {
    if (!notificationSocket.connected) {
      console.warn(
        "[UnifiedNotification] Cannot subscribe - socket not connected",
      );
      return;
    }

    subscribedFriendsRef.current = friendIds;
    notificationSocket.emitToServer("subscribe_friend_activities", {
      friendIds,
    });
    console.log(
      "[UnifiedNotification] Subscribed to friend activities:",
      friendIds.length,
      "friends",
    );
  }, []);

  const unsubscribeFriendActivities = useCallback(() => {
    if (!notificationSocket.connected) return;

    notificationSocket.emitToServer("unsubscribe_friend_activities", {
      friendIds: subscribedFriendsRef.current,
    });
    subscribedFriendsRef.current = [];
    console.log("[UnifiedNotification] Unsubscribed from friend activities");
  }, []);

  const setFriendActivityNotificationsEnabled = async (enabled: boolean) => {
    setIsFriendActivityEnabled(enabled);
    await AsyncStorage.setItem(
      FRIEND_ACTIVITY_ENABLED_KEY,
      enabled ? "true" : "false",
    );
    console.log(
      "[UnifiedNotification] Friend activity notifications:",
      enabled ? "enabled" : "disabled",
    );

    // Notify backend of preference change
    if (user) {
      try {
        await apiFetch("/users/preferences", {
          method: "PATCH",
          data: { friendActivityNotifications: enabled },
        });
      } catch (error) {
        // Non-critical, just log
        console.log("[UnifiedNotification] Failed to sync preference:", error);
      }
    }
  };

  const handleIncomingNotification = (notification: UnifiedNotification) => {
    // Normalize notification from any source (WebSocket, Push, REST)
    const normalized: UnifiedNotification = {
      ...notification,
      id: String(notification.id),
      type: normalizeNotificationType(notification.type),
      category: normalizeNotificationCategory(notification.category),
      priority: normalizeNotificationPriority(notification.priority),
      read: notification.read || false,
      message: notification.message || notification.body || "",
    };

    // Add to state
    setNotifications((prev) => {
      const exists = prev.find((n) => n.id === normalized.id);
      if (exists) return prev;
      const updated = [normalized, ...prev];
      cacheNotifications(updated);
      return updated;
    });

    // Update unread count
    if (!normalized.read) {
      setUnreadCount((prev) => prev + 1);
    }

    // Show toast
    Toast.show({
      type:
        normalized.type === "error"
          ? "error"
          : normalized.type === "success"
            ? "success"
            : "info",
      text1: normalized.title,
      text2: normalized.message || normalized.body,
      position: "top",
      visibilityTime: 4000,
    });
  };

  // ========================================================================
  // PUSH NOTIFICATIONS
  // ========================================================================

  const setupPushNotifications = async () => {
    // Skip if Notifications not available (Expo Go SDK 53+)
    if (!Notifications) {
      console.log("[UnifiedNotification] Push not available in Expo Go");
      return;
    }

    try {
      // Load saved push settings
      const savedToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      const savedEnabled = await AsyncStorage.getItem(PUSH_ENABLED_KEY);

      if (savedToken) setPushToken(savedToken);
      if (savedEnabled === "true") setIsPushEnabled(true);

      // Setup listeners
      notificationListenerRef.current =
        Notifications.addNotificationReceivedListener((notification) => {
          console.log("[UnifiedNotification] Push received:", notification);

          const unified: UnifiedNotification = {
            id: notification.request.identifier,
            type:
              (notification.request.content.data?.type as NotificationType) ||
              "info",
            title: notification.request.content.title || "Thông báo",
            message: notification.request.content.body || "",
            read: false,
            createdAt: new Date().toISOString(),
            source: "push",
            data: notification.request.content.data,
          };

          handleIncomingNotification(unified);
        });

      responseListenerRef.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log("[UnifiedNotification] Push tapped:", response);

          const data = response.notification.request.content.data;
          if (data) {
            handleNotificationTap({
              id: response.notification.request.identifier,
              type: data.type,
              relatedType: data.relatedType,
              relatedId: data.relatedId,
            });
          }
        });

      // Request permissions
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        console.log("[UnifiedNotification] Push permissions not granted");
      }
    } catch (error) {
      console.error("[UnifiedNotification] Push setup error:", error);
    }
  };

  const registerForPushNotifications = async (): Promise<string | null> => {
    // Skip if Notifications not available (Expo Go SDK 53+)
    if (!Notifications) {
      console.log("[UnifiedNotification] Push not available in Expo Go");
      return null;
    }

    if (!Device.isDevice) {
      console.log("[UnifiedNotification] Push only works on physical devices");
      return null;
    }

    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("[UnifiedNotification] Push permission denied");
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("[UnifiedNotification] Push token:", token);

      setPushToken(token);
      setIsPushEnabled(true);

      // Save to storage
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
      await AsyncStorage.setItem(PUSH_ENABLED_KEY, "true");

      // Register token with backend
      if (user) {
        await apiFetch("/push-tokens", {
          method: "POST",
          data: { token, platform: Platform.OS },
        }).catch(() => console.log("Failed to register push token"));
      }

      return token;
    } catch (error) {
      console.error("[UnifiedNotification] Push registration error:", error);
      return null;
    }
  };

  const requestPushPermissions = async (): Promise<boolean> => {
    // Skip if Notifications not available (Expo Go SDK 53+)
    if (!Notifications) {
      console.log(
        "[UnifiedNotification] requestPushPermissions not available in Expo Go",
      );
      return false;
    }
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  };

  const schedulePushNotification = async (
    title: string,
    body: string,
    data?: any,
    triggerSeconds = 1,
  ): Promise<string> => {
    // Skip if Notifications not available (Expo Go SDK 53+)
    if (!Notifications) {
      console.log(
        "[UnifiedNotification] schedulePushNotification not available in Expo Go",
      );
      return "";
    }

    // Use any to bypass strict type checking for expo-notifications trigger
    const trigger: any =
      triggerSeconds > 0 ? { seconds: triggerSeconds, repeats: false } : null;

    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger,
    });
  };

  // ========================================================================
  // REST API OPERATIONS
  // ========================================================================

  // Normalize notification type from backend (UPPERCASE) to frontend (lowercase)
  const normalizeNotificationType = (
    type: string | undefined,
  ): NotificationType => {
    if (!type) return "info";
    const lowered = type.toLowerCase() as NotificationType;
    const validTypes: NotificationType[] = [
      "info",
      "success",
      "warning",
      "error",
      "message",
      "call",
      "system",
      "event",
      "live",
      "task",
      "project",
      "meeting",
      "alert",
      "friend_post",
      "friend_livestream",
      "friend_story",
      "friend_reel",
      "follow",
      "like",
      "comment",
      "mention",
      "share",
    ];
    return validTypes.includes(lowered) ? lowered : "info";
  };

  // Normalize notification category from backend (UPPERCASE) to frontend (lowercase)
  const normalizeNotificationCategory = (
    category: string | undefined,
  ): NotificationCategory | undefined => {
    if (!category) return undefined;
    const lowered = category.toLowerCase() as NotificationCategory;
    const validCategories: NotificationCategory[] = [
      "system",
      "event",
      "live",
      "message",
      "call",
      "project",
      "payment",
      "security",
      "social",
      "friend_activity",
      "content",
    ];
    return validCategories.includes(lowered) ? lowered : undefined;
  };

  // Normalize priority from backend (UPPERCASE) to frontend (lowercase)
  const normalizeNotificationPriority = (
    priority: string | undefined,
  ): NotificationPriority => {
    if (!priority) return "normal";
    const lowered = priority.toLowerCase() as NotificationPriority;
    const validPriorities: NotificationPriority[] = [
      "low",
      "normal",
      "high",
      "urgent",
    ];
    return validPriorities.includes(lowered) ? lowered : "normal";
  };

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await apiFetch(NOTIFICATION_ENDPOINTS.LIST);

      if (response.success && Array.isArray(response.notifications)) {
        const unified = response.notifications.map(
          (n: any): UnifiedNotification => ({
            ...n,
            id: String(n.id),
            type: normalizeNotificationType(n.type),
            category: normalizeNotificationCategory(n.category),
            priority: normalizeNotificationPriority(n.priority),
            read: n.read || n.isRead || false,
            message: n.message || n.body || "",
          }),
        );
        setNotifications(unified);
        setUnreadCount(
          unified.filter((n: UnifiedNotification) => !n.read).length,
        );
        cacheNotifications(unified);
      }
    } catch (error: any) {
      if (error?.status !== 404) {
        console.error("[UnifiedNotification] Fetch error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, isRead: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await apiFetch(NOTIFICATION_ENDPOINTS.MARK_READ(id), {
        method: "PATCH",
      });
    } catch (error) {
      // Revert on error
      await fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, isRead: true })),
    );
    setUnreadCount(0);

    try {
      await apiFetch(NOTIFICATION_ENDPOINTS.MARK_ALL_READ, {
        method: "PATCH",
      });
    } catch (error) {
      await fetchNotifications();
    }
  };

  const deleteNotification = async (id: string) => {
    const notification = notifications.find((n) => n.id === id);

    // Optimistic update
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (notification && !notification.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await apiFetch(NOTIFICATION_ENDPOINTS.DELETE(id), {
        method: "DELETE",
      });
    } catch (error) {
      await fetchNotifications();
    }
  };

  const clearAll = async () => {
    setNotifications([]);
    setUnreadCount(0);
    await AsyncStorage.removeItem(NOTIFICATIONS_CACHE_KEY);
  };

  const addNotification = (notification: Omit<UnifiedNotification, "id">) => {
    const newNotification: UnifiedNotification = {
      ...notification,
      id: `local_${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    };

    handleIncomingNotification(newNotification);
  };

  // ========================================================================
  // CONTEXT VALUE
  // ========================================================================

  const value: UnifiedNotificationContextType = {
    // State
    notifications,
    unreadCount,
    loading,
    isConnected,
    pushToken,
    isPushEnabled,

    // Actions - Notification Management
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,

    // Actions - Push Notifications
    registerForPushNotifications,
    requestPushPermissions,
    schedulePushNotification,

    // Friend Activity
    subscribeFriendActivities,
    unsubscribeFriendActivities,
    setFriendActivityNotificationsEnabled,
    isFriendActivityEnabled,
  };

  return (
    <UnifiedNotificationContext.Provider value={value}>
      {children}
    </UnifiedNotificationContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useUnifiedNotificationContext() {
  const context = useContext(UnifiedNotificationContext);
  if (!context) {
    throw new Error(
      "useUnifiedNotificationContext must be used within UnifiedNotificationProvider",
    );
  }
  return context;
}

// Alias for backward compatibility
export { useUnifiedNotificationContext as useUnifiedNotification };
