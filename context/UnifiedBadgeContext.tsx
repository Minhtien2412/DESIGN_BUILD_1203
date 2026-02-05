/**
 * Unified Badge Context
 * Quản lý thông báo badges thống nhất cho toàn app (Zalo-style)
 * - Tin nhắn chưa đọc
 * - Cuộc gọi nhỡ
 * - Thông báo hệ thống
 * - CRM notifications (tasks, tickets, projects)
 * - Tích hợp với Tab Bar & Home Screen
 *
 * @author AI Assistant
 * @date 03/01/2026
 * @updated 08/01/2026 - Thêm sync từ nhiều nguồn
 * @updated 27/01/2026 - Tích hợp BadgeSyncService cho real-time updates
 */

import { callService } from "@/services/api/call.service";
import notificationsApi from "@/services/api/notificationsApi";
import badgeSyncService from "@/services/badgeSyncService";
import { chatAPIService } from "@/services/chatAPIService";
import NotificationSyncService, {
    SyncResult,
    UnifiedNotification,
} from "@/services/notificationSyncService";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { useAuth } from "./AuthContext";

// ==================== TYPES ====================

export interface BadgeCounts {
  messages: number; // Tin nhắn chưa đọc
  missedCalls: number; // Cuộc gọi nhỡ
  notifications: number; // Thông báo hệ thống
  projects: number; // Cập nhật dự án
  orders: number; // Đơn hàng mới
  crm: number; // CRM updates
  social: number; // Social notifications
  live: number; // Live streams
  tasks: number; // CRM Tasks
  tickets: number; // Support tickets
}

export interface BadgeSource {
  id: keyof BadgeCounts;
  name: string;
  icon: string;
  color: string;
  count: number;
  lastUpdated: string;
}

export interface MessageNotification {
  id: string;
  conversationId: string;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: "text" | "image" | "voice" | "file" | "call";
  timestamp: string;
  isRead: boolean;
}

export interface CallNotification {
  id: string;
  callerId: number;
  callerName: string;
  callerAvatar?: string;
  type: "audio" | "video";
  status: "missed" | "answered" | "rejected";
  timestamp: string;
  duration?: number;
  isRead: boolean;
}

interface UnifiedBadgeContextType {
  // Badge counts
  badges: BadgeCounts;
  totalBadge: number;

  // Badge sources with details
  badgeSources: BadgeSource[];

  // Message notifications
  messageNotifications: MessageNotification[];
  addMessageNotification: (notification: MessageNotification) => void;
  markMessageAsRead: (conversationId: string) => void;
  clearMessageNotifications: (conversationId?: string) => void;

  // Call notifications
  callNotifications: CallNotification[];
  addCallNotification: (notification: CallNotification) => void;
  markCallAsRead: (callId: string) => void;
  clearCallNotifications: () => void;

  // Badge management
  setBadgeCount: (key: keyof BadgeCounts, count: number) => void;
  incrementBadge: (key: keyof BadgeCounts, amount?: number) => void;
  decrementBadge: (key: keyof BadgeCounts, amount?: number) => void;
  clearBadge: (key: keyof BadgeCounts) => void;
  clearAllBadges: () => void;

  // Sync with external data
  syncWithMessaging: (unreadCount: number, missedCalls: number) => void;
  syncWithNotifications: (unreadCount: number) => void;

  // Auto sync from all sources
  refreshAllBadges: () => Promise<void>;
  isLoading: boolean;
  lastSyncAt: Date | null;
}

const UnifiedBadgeContext = createContext<UnifiedBadgeContextType | undefined>(
  undefined,
);

const STORAGE_KEY_BADGES = "@unified_badges";
const STORAGE_KEY_MESSAGES = "@message_notifications";
const STORAGE_KEY_CALLS = "@call_notifications";

const DEFAULT_BADGES: BadgeCounts = {
  messages: 0,
  missedCalls: 0,
  notifications: 0,
  projects: 0,
  orders: 0,
  crm: 0,
  social: 0,
  live: 0,
  tasks: 0,
  tickets: 0,
};

const BADGE_SOURCE_CONFIG: Omit<BadgeSource, "count" | "lastUpdated">[] = [
  { id: "messages", name: "Tin nhắn", icon: "chatbubbles", color: "#dc2626" },
  { id: "missedCalls", name: "Cuộc gọi nhỡ", icon: "call", color: "#ea580c" },
  {
    id: "notifications",
    name: "Thông báo",
    icon: "notifications",
    color: "#16a34a",
  },
  { id: "tasks", name: "Công việc", icon: "checkbox", color: "#2563eb" },
  { id: "tickets", name: "Hỗ trợ", icon: "ticket", color: "#7c3aed" },
  { id: "projects", name: "Dự án", icon: "briefcase", color: "#0891b2" },
  { id: "crm", name: "CRM", icon: "business", color: "#be185d" },
  { id: "orders", name: "Đơn hàng", icon: "cart", color: "#ca8a04" },
  { id: "social", name: "Cộng đồng", icon: "people", color: "#4f46e5" },
  { id: "live", name: "Live", icon: "videocam", color: "#dc2626" },
];

// ==================== PROVIDER ====================

export function UnifiedBadgeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [badges, setBadges] = useState<BadgeCounts>(DEFAULT_BADGES);
  const [messageNotifications, setMessageNotifications] = useState<
    MessageNotification[]
  >([]);
  const [callNotifications, setCallNotifications] = useState<
    CallNotification[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const isMountedRef = useRef(true);
  const badgeSyncUnsubscribeRef = useRef<(() => void) | null>(null);
  const newMessageUnsubscribeRef = useRef<(() => void) | null>(null);
  const newNotificationUnsubscribeRef = useRef<(() => void) | null>(null);

  // Total badge count
  const totalBadge = useMemo(
    () => Object.values(badges).reduce((sum, count) => sum + count, 0),
    [badges],
  );

  // Badge sources with current counts
  const badgeSources = useMemo((): BadgeSource[] => {
    const now = lastSyncAt?.toISOString() || "";
    return BADGE_SOURCE_CONFIG.map((config) => ({
      ...config,
      count: badges[config.id],
      lastUpdated: now,
    })).filter((source) => source.count > 0);
  }, [badges, lastSyncAt]);

  // Load from storage on mount - DEFERRED to avoid blocking startup
  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const [badgesData, messagesData, callsData] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_BADGES),
          AsyncStorage.getItem(STORAGE_KEY_MESSAGES),
          AsyncStorage.getItem(STORAGE_KEY_CALLS),
        ]);

        if (badgesData) {
          setBadges(JSON.parse(badgesData));
        }
        if (messagesData) {
          setMessageNotifications(JSON.parse(messagesData));
        }
        if (callsData) {
          setCallNotifications(JSON.parse(callsData));
        }
      } catch (error) {
        console.error("[UnifiedBadge] Error loading from storage:", error);
      }
    };

    // Defer to next frame to not block startup
    const frameId = requestAnimationFrame(() => {
      loadFromStorage();
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Save badges to storage
  const saveBadges = useCallback(async (newBadges: BadgeCounts) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_BADGES, JSON.stringify(newBadges));
    } catch (error) {
      console.error("[UnifiedBadge] Error saving badges:", error);
    }
  }, []);

  // Save message notifications to storage
  const saveMessageNotifications = useCallback(
    async (notifications: MessageNotification[]) => {
      try {
        // Keep only last 100 notifications
        const toSave = notifications.slice(0, 100);
        await AsyncStorage.setItem(
          STORAGE_KEY_MESSAGES,
          JSON.stringify(toSave),
        );
      } catch (error) {
        console.error(
          "[UnifiedBadge] Error saving message notifications:",
          error,
        );
      }
    },
    [],
  );

  // Save call notifications to storage
  const saveCallNotifications = useCallback(
    async (notifications: CallNotification[]) => {
      try {
        // Keep only last 50 call notifications
        const toSave = notifications.slice(0, 50);
        await AsyncStorage.setItem(STORAGE_KEY_CALLS, JSON.stringify(toSave));
      } catch (error) {
        console.error("[UnifiedBadge] Error saving call notifications:", error);
      }
    },
    [],
  );

  // ==================== MESSAGE NOTIFICATIONS ====================

  const addMessageNotification = useCallback(
    (notification: MessageNotification) => {
      setMessageNotifications((prev) => {
        // Avoid duplicates
        if (prev.find((n) => n.id === notification.id)) return prev;

        const updated = [notification, ...prev];
        saveMessageNotifications(updated);
        return updated;
      });

      // Increment message badge
      setBadges((prev) => {
        const updated = { ...prev, messages: prev.messages + 1 };
        saveBadges(updated);
        return updated;
      });
    },
    [saveBadges, saveMessageNotifications],
  );

  const markMessageAsRead = useCallback(
    (conversationId: string) => {
      setMessageNotifications((prev) => {
        const unreadInConversation = prev.filter(
          (n) => n.conversationId === conversationId && !n.isRead,
        ).length;

        const updated = prev.map((n) =>
          n.conversationId === conversationId ? { ...n, isRead: true } : n,
        );

        saveMessageNotifications(updated);

        // Decrement badge
        if (unreadInConversation > 0) {
          setBadges((b) => {
            const newBadges = {
              ...b,
              messages: Math.max(0, b.messages - unreadInConversation),
            };
            saveBadges(newBadges);
            return newBadges;
          });
        }

        return updated;
      });
    },
    [saveBadges, saveMessageNotifications],
  );

  const clearMessageNotifications = useCallback(
    (conversationId?: string) => {
      if (conversationId) {
        setMessageNotifications((prev) => {
          const updated = prev.filter(
            (n) => n.conversationId !== conversationId,
          );
          saveMessageNotifications(updated);
          return updated;
        });
      } else {
        setMessageNotifications([]);
        saveMessageNotifications([]);
        setBadges((prev) => {
          const updated = { ...prev, messages: 0 };
          saveBadges(updated);
          return updated;
        });
      }
    },
    [saveBadges, saveMessageNotifications],
  );

  // ==================== CALL NOTIFICATIONS ====================

  const addCallNotification = useCallback(
    (notification: CallNotification) => {
      setCallNotifications((prev) => {
        if (prev.find((n) => n.id === notification.id)) return prev;

        const updated = [notification, ...prev];
        saveCallNotifications(updated);
        return updated;
      });

      // Only increment for missed calls
      if (notification.status === "missed") {
        setBadges((prev) => {
          const updated = { ...prev, missedCalls: prev.missedCalls + 1 };
          saveBadges(updated);
          return updated;
        });
      }
    },
    [saveBadges, saveCallNotifications],
  );

  const markCallAsRead = useCallback(
    (callId: string) => {
      setCallNotifications((prev) => {
        const call = prev.find((n) => n.id === callId);
        if (call && !call.isRead && call.status === "missed") {
          setBadges((b) => {
            const newBadges = {
              ...b,
              missedCalls: Math.max(0, b.missedCalls - 1),
            };
            saveBadges(newBadges);
            return newBadges;
          });
        }

        const updated = prev.map((n) =>
          n.id === callId ? { ...n, isRead: true } : n,
        );
        saveCallNotifications(updated);
        return updated;
      });
    },
    [saveBadges, saveCallNotifications],
  );

  const clearCallNotifications = useCallback(() => {
    setCallNotifications([]);
    saveCallNotifications([]);
    setBadges((prev) => {
      const updated = { ...prev, missedCalls: 0 };
      saveBadges(updated);
      return updated;
    });
  }, [saveBadges, saveCallNotifications]);

  // ==================== BADGE MANAGEMENT ====================

  const setBadgeCount = useCallback(
    (key: keyof BadgeCounts, count: number) => {
      setBadges((prev) => {
        const updated = { ...prev, [key]: Math.max(0, count) };
        saveBadges(updated);
        return updated;
      });
    },
    [saveBadges],
  );

  const incrementBadge = useCallback(
    (key: keyof BadgeCounts, amount = 1) => {
      setBadges((prev) => {
        const updated = { ...prev, [key]: prev[key] + amount };
        saveBadges(updated);
        return updated;
      });
    },
    [saveBadges],
  );

  const decrementBadge = useCallback(
    (key: keyof BadgeCounts, amount = 1) => {
      setBadges((prev) => {
        const updated = { ...prev, [key]: Math.max(0, prev[key] - amount) };
        saveBadges(updated);
        return updated;
      });
    },
    [saveBadges],
  );

  const clearBadge = useCallback(
    (key: keyof BadgeCounts) => {
      setBadges((prev) => {
        const updated = { ...prev, [key]: 0 };
        saveBadges(updated);
        return updated;
      });
    },
    [saveBadges],
  );

  const clearAllBadges = useCallback(() => {
    setBadges(DEFAULT_BADGES);
    saveBadges(DEFAULT_BADGES);
    setMessageNotifications([]);
    setCallNotifications([]);
    saveMessageNotifications([]);
    saveCallNotifications([]);
  }, [saveBadges, saveMessageNotifications, saveCallNotifications]);

  // ==================== SYNC ====================

  const syncWithMessaging = useCallback(
    (unreadCount: number, missedCalls: number) => {
      setBadges((prev) => {
        const updated = { ...prev, messages: unreadCount, missedCalls };
        saveBadges(updated);
        return updated;
      });
    },
    [saveBadges],
  );

  const syncWithNotifications = useCallback(
    (unreadCount: number) => {
      setBadges((prev) => {
        const updated = { ...prev, notifications: unreadCount };
        saveBadges(updated);
        return updated;
      });
    },
    [saveBadges],
  );

  // ==================== REFRESH ALL BADGES ====================

  const refreshAllBadges = useCallback(async () => {
    if (!user?.id || isLoading) return;

    setIsLoading(true);
    console.log("[UnifiedBadge] Refreshing all badges...");

    try {
      // Fetch từ tất cả nguồn song song
      const [chatCount, missedCallsCount, appNotifications, crmNotifications] =
        await Promise.allSettled([
          // 1. Chat messages - unread count
          chatAPIService
            .getChatRooms()
            .then((rooms) =>
              rooms.reduce((total, room) => total + (room.unreadCount || 0), 0),
            ),
          // 2. Missed calls count from API
          callService.getMissedCallsCount().catch(() => 0),
          // 3. App notifications
          notificationsApi
            .getNotifications()
            .then((res) => res.data?.filter((n) => !n.isRead).length || 0),
          // 4. CRM notifications (tasks, tickets, projects)
          NotificationSyncService.syncAll().then(
            async (syncResult: SyncResult) => {
              if (syncResult.success) {
                const allNotifications = await NotificationSyncService.getAll();
                const unread = allNotifications.filter(
                  (n: UnifiedNotification) => n.source === "CRM" && !n.isRead,
                );
                return {
                  tasks: unread.filter(
                    (n: UnifiedNotification) => n.type === "TASK",
                  ).length,
                  tickets: unread.filter(
                    (n: UnifiedNotification) => n.type === "TICKET",
                  ).length,
                  projects: unread.filter(
                    (n: UnifiedNotification) => n.type === "PROJECT",
                  ).length,
                  crm: unread.filter(
                    (n: UnifiedNotification) =>
                      !["TASK", "TICKET", "PROJECT"].includes(n.type),
                  ).length,
                };
              }
              return { tasks: 0, tickets: 0, projects: 0, crm: 0 };
            },
          ),
        ]);

      // Extract values
      const messagesCount =
        chatCount.status === "fulfilled" ? chatCount.value : 0;
      const missedCalls =
        missedCallsCount.status === "fulfilled" ? missedCallsCount.value : 0;
      const notificationsCount =
        appNotifications.status === "fulfilled" ? appNotifications.value : 0;
      const crmCounts =
        crmNotifications.status === "fulfilled"
          ? crmNotifications.value
          : { tasks: 0, tickets: 0, projects: 0, crm: 0 };

      if (isMountedRef.current) {
        setBadges((prev) => {
          const updated = {
            ...prev,
            messages: messagesCount,
            missedCalls: missedCalls,
            notifications: notificationsCount,
            tasks: crmCounts.tasks,
            tickets: crmCounts.tickets,
            projects: crmCounts.projects,
            crm: crmCounts.crm,
          };
          saveBadges(updated);
          return updated;
        });
        setLastSyncAt(new Date());
        console.log("[UnifiedBadge] Badges refreshed:", {
          messages: messagesCount,
          missedCalls: missedCalls,
          notifications: notificationsCount,
          ...crmCounts,
        });
      }
    } catch (error) {
      console.error("[UnifiedBadge] Refresh error:", error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [user?.id, isLoading, saveBadges]);

  // ==================== REAL-TIME BADGE SYNC (WebSocket) ====================

  // Global tracking for initialization (prevent double init from re-mounts)
  const badgeSyncInitializedRef = useRef(false);

  // Initialize BadgeSyncService for real-time updates
  useEffect(() => {
    if (!user?.id) {
      // Cleanup when user logs out
      badgeSyncUnsubscribeRef.current?.();
      newMessageUnsubscribeRef.current?.();
      newNotificationUnsubscribeRef.current?.();
      badgeSyncService.disconnect();
      badgeSyncInitializedRef.current = false;
      return;
    }

    // Skip if already initialized by this context for this user
    const userId =
      typeof user.id === "number" ? user.id : parseInt(String(user.id), 10);

    if (badgeSyncInitializedRef.current && badgeSyncService.isConnected) {
      // Already initialized, just re-subscribe to listeners
      return;
    }

    console.log(
      "[UnifiedBadge] Initializing BadgeSyncService for user:",
      userId,
    );
    badgeSyncInitializedRef.current = true;

    // Initialize the sync service
    badgeSyncService.initialize(userId).then(() => {
      // Subscribe to real-time badge updates
      badgeSyncUnsubscribeRef.current = badgeSyncService.onBadgeUpdate(
        (syncCounts) => {
          if (isMountedRef.current) {
            console.log("[UnifiedBadge] Real-time badge update:", syncCounts);
            setBadges((prev) => {
              const updated = {
                ...prev,
                messages: syncCounts.messages,
                missedCalls: syncCounts.missedCalls,
                notifications: syncCounts.notifications,
              };
              saveBadges(updated);
              return updated;
            });
            setLastSyncAt(new Date());
          }
        },
      );

      // Subscribe to new messages for notification display
      newMessageUnsubscribeRef.current = badgeSyncService.onNewMessage(
        (message) => {
          if (isMountedRef.current) {
            // Add as message notification for UI display
            const notification: MessageNotification = {
              id: message.id || `msg_${Date.now()}`,
              conversationId: message.roomId || message.conversationId,
              senderId: message.senderId,
              senderName:
                message.sender?.name || message.senderName || "Unknown",
              senderAvatar: message.sender?.avatar || message.senderAvatar,
              content: message.content,
              type: message.type || "text",
              timestamp: message.createdAt || new Date().toISOString(),
              isRead: false,
            };
            setMessageNotifications((prev) => {
              if (prev.find((n) => n.id === notification.id)) return prev;
              const updated = [notification, ...prev].slice(0, 100);
              saveMessageNotifications(updated);
              return updated;
            });
          }
        },
      );

      // Subscribe to new notifications
      newNotificationUnsubscribeRef.current =
        badgeSyncService.onNewNotification((notif) => {
          if (isMountedRef.current) {
            console.log("[UnifiedBadge] New notification received:", notif.id);
            // The count is already updated by BadgeSyncService
            // Here we can trigger toast or other UI updates if needed
          }
        });
    });

    // Cleanup on unmount or user change
    return () => {
      badgeSyncUnsubscribeRef.current?.();
      newMessageUnsubscribeRef.current?.();
      newNotificationUnsubscribeRef.current?.();
    };
  }, [user?.id, saveBadges, saveMessageNotifications]);

  // Auto refresh on user login (one-time API sync)
  useEffect(() => {
    if (user?.id) {
      refreshAllBadges();
    }
  }, [user?.id]);

  // Auto refresh interval (tăng lên 5 phút vì đã có real-time WebSocket)
  useEffect(() => {
    if (user?.id) {
      refreshIntervalRef.current = setInterval(
        () => {
          // Only do API sync as fallback, WebSocket handles real-time
          refreshAllBadges();
        },
        5 * 60 * 1000, // 5 phút thay vì 2 phút
      );
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [user?.id]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      badgeSyncService.disconnect();
    };
  }, []);

  // ==================== RETURN ====================

  const value: UnifiedBadgeContextType = {
    badges,
    totalBadge,
    badgeSources,
    messageNotifications,
    addMessageNotification,
    markMessageAsRead,
    clearMessageNotifications,
    callNotifications,
    addCallNotification,
    markCallAsRead,
    clearCallNotifications,
    setBadgeCount,
    incrementBadge,
    decrementBadge,
    clearBadge,
    clearAllBadges,
    syncWithMessaging,
    syncWithNotifications,
    refreshAllBadges,
    isLoading,
    lastSyncAt,
  };

  return (
    <UnifiedBadgeContext.Provider value={value}>
      {children}
    </UnifiedBadgeContext.Provider>
  );
}

// ==================== HOOK ====================

export function useUnifiedBadge() {
  const context = useContext(UnifiedBadgeContext);
  if (context === undefined) {
    throw new Error(
      "useUnifiedBadge must be used within a UnifiedBadgeProvider",
    );
  }
  return context;
}

export default UnifiedBadgeContext;
