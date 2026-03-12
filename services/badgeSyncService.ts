/**
 * Badge Sync Service - Real-time Badge Synchronization
 * =====================================================
 *
 * Đồng bộ badge count thời gian thực từ nhiều nguồn:
 * 1. WebSocket events (messages, calls, notifications)
 * 2. REST API polling (chat rooms, notifications, calls)
 *
 * Đảm bảo số lượng badge chính xác và cập nhật real-time.
 *
 * @author ThietKeResort Team
 * @created 2025-01-27
 */

import ENV from "@/config/env";
import type { Socket } from "@/utils/socketIo";
import { getSocketIo } from "@/utils/socketIo";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { getAccessToken } from "./apiClient";
import { chatAPIService } from "./chatAPIService";

// Lazy import expo-notifications to avoid crash in Expo Go SDK 53+
let Notifications: typeof import("expo-notifications") | null = null;

// Check if we're in Expo Go (where push notifications are not available)
const isExpoGo = Constants.appOwnership === "expo";

// Only import notifications in development builds, not Expo Go
if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
  } catch (e) {
    console.warn("[BadgeSync] expo-notifications not available:", e);
  }
}

// ============================================
// TYPES
// ============================================

export interface BadgeCounts {
  messages: number;
  missedCalls: number;
  notifications: number;
  total: number;
}

export interface BadgeUpdateEvent {
  type: "message" | "call" | "notification" | "sync";
  source: "websocket" | "local" | "api";
  counts: Partial<BadgeCounts>;
  timestamp: number;
}

type BadgeUpdateCallback = (counts: BadgeCounts) => void;
type NewMessageCallback = (message: any) => void;
type NewNotificationCallback = (notification: any) => void;

// ============================================
// BADGE SYNC SERVICE
// ============================================

class BadgeSyncService {
  private static instance: BadgeSyncService;

  // WebSocket connections
  private chatSocket: Socket | null = null;
  private notificationSocket: Socket | null = null;

  // Current badge counts
  private _counts: BadgeCounts = {
    messages: 0,
    missedCalls: 0,
    notifications: 0,
    total: 0,
  };

  // Callbacks
  private badgeUpdateCallbacks: Set<BadgeUpdateCallback> = new Set();
  private newMessageCallbacks: Set<NewMessageCallback> = new Set();
  private newNotificationCallbacks: Set<NewNotificationCallback> = new Set();

  // State
  private isInitialized = false;
  private userId: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  // Sync state
  private lastSyncTime = 0;
  private syncInProgress = false;

  private constructor() {}

  static getInstance(): BadgeSyncService {
    if (!BadgeSyncService.instance) {
      BadgeSyncService.instance = new BadgeSyncService();
    }
    return BadgeSyncService.instance;
  }

  // ============================================
  // PUBLIC API
  // ============================================

  get counts(): BadgeCounts {
    return { ...this._counts };
  }

  get isConnected(): boolean {
    return (
      this.chatSocket?.connected ||
      false ||
      this.notificationSocket?.connected ||
      false
    );
  }

  /**
   * Initialize badge sync service
   */
  async initialize(userId: number): Promise<void> {
    if (this.isInitialized && this.userId === userId) {
      console.log("[BadgeSync] Already initialized for user:", userId);
      return;
    }

    console.log("[BadgeSync] Initializing for user:", userId);
    this.userId = userId;

    try {
      // 1. Connect WebSocket for real-time updates
      await this.connectWebSockets();

      // 2. Full sync from API to ensure accuracy
      await this.fullSyncFromAPI();

      this.isInitialized = true;
      console.log("[BadgeSync] Initialized successfully:", this._counts);
    } catch (error) {
      console.error("[BadgeSync] Initialization error:", error);
      // Still mark as initialized to allow fallback polling
      this.isInitialized = true;
    }
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    // Skip if already disconnected
    if (!this.isInitialized && !this.chatSocket && !this.notificationSocket) {
      return;
    }

    console.log("[BadgeSync] Disconnecting...");

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.chatSocket) {
      this.chatSocket.removeAllListeners();
      this.chatSocket.disconnect();
      this.chatSocket = null;
    }

    if (this.notificationSocket) {
      this.notificationSocket.removeAllListeners();
      this.notificationSocket.disconnect();
      this.notificationSocket = null;
    }

    this.isInitialized = false;
    this.userId = null;
    this.reconnectAttempts = 0;
  }

  /**
   * Subscribe to badge updates
   */
  onBadgeUpdate(callback: BadgeUpdateCallback): () => void {
    this.badgeUpdateCallbacks.add(callback);
    // Immediately emit current counts
    callback(this._counts);
    return () => this.badgeUpdateCallbacks.delete(callback);
  }

  /**
   * Subscribe to new messages (for UI notifications)
   */
  onNewMessage(callback: NewMessageCallback): () => void {
    this.newMessageCallbacks.add(callback);
    return () => this.newMessageCallbacks.delete(callback);
  }

  /**
   * Subscribe to new notifications (for UI notifications)
   */
  onNewNotification(callback: NewNotificationCallback): () => void {
    this.newNotificationCallbacks.add(callback);
    return () => this.newNotificationCallbacks.delete(callback);
  }

  /**
   * Mark messages as read for a conversation
   */
  async markConversationRead(conversationId: string): Promise<void> {
    try {
      // Notify server via WebSocket
      if (this.chatSocket?.connected) {
        this.chatSocket.emit("markRead", { conversationId });
      }

      // Re-sync counts from API
      await this.fullSyncFromAPI();
    } catch (error) {
      console.error("[BadgeSync] Error marking conversation read:", error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead(): Promise<void> {
    this.updateCounts({ notifications: 0 }, "local");
  }

  /**
   * Decrement missed calls count
   */
  decrementMissedCalls(amount: number = 1): void {
    const newCount = Math.max(0, this._counts.missedCalls - amount);
    this.updateCounts({ missedCalls: newCount }, "local");
  }

  /**
   * Force full sync from all sources
   */
  async forceSync(): Promise<BadgeCounts> {
    if (this.syncInProgress) {
      console.log("[BadgeSync] Sync already in progress");
      return this._counts;
    }

    this.syncInProgress = true;

    try {
      await this.fullSyncFromAPI();

      this.lastSyncTime = Date.now();
    } finally {
      this.syncInProgress = false;
    }

    return this._counts;
  }

  // ============================================
  // WEBSOCKET CONNECTION
  // ============================================

  private async connectWebSockets(): Promise<void> {
    const token = await getAccessToken();
    if (!token) {
      console.warn("[BadgeSync] No access token for WebSocket");
      return;
    }

    const baseUrl = ENV.WS_BASE_URL || ENV.WS_URL || ENV.API_BASE_URL;
    if (!baseUrl) {
      console.warn("[BadgeSync] No WebSocket URL configured");
      return;
    }

    // Connect to chat namespace
    await this.connectChatSocket(baseUrl, token);

    // Connect to notifications namespace
    await this.connectNotificationSocket(baseUrl, token);
  }

  private async connectChatSocket(
    baseUrl: string,
    token: string,
  ): Promise<void> {
    const io = await getSocketIo();
    const chatUrl = `${baseUrl}${ENV.WS_CHAT_NS || "/chat"}`;
    console.log("[BadgeSync] Connecting to chat WebSocket:", chatUrl);

    this.chatSocket = io(chatUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.chatSocket.on("connect", () => {
      console.log("[BadgeSync] ✅ Chat WebSocket connected");
      this.reconnectAttempts = 0;

      // Register user
      if (this.userId) {
        this.chatSocket?.emit("register", { userId: this.userId });
      }
    });

    // Handle new messages
    this.chatSocket.on("newMessage", (message: any) => {
      console.log("[BadgeSync] 📩 New message received:", message.id);

      // Increment message count if not from current user
      if (message.senderId !== this.userId) {
        this.updateCounts({ messages: this._counts.messages + 1 }, "websocket");

        // Notify listeners
        this.newMessageCallbacks.forEach((cb) => cb(message));
      }
    });

    // Handle unread count update from server
    this.chatSocket.on(
      "unreadCountUpdate",
      (data: { conversationId: string; unreadCount: number }) => {
        console.log("[BadgeSync] Unread count update:", data);
        // Trigger local sync to recalculate
        this.syncFromLocal();
      },
    );

    // Handle read receipt (someone read our messages)
    this.chatSocket.on(
      "messagesRead",
      (data: { conversationId: string; readBy: number }) => {
        console.log("[BadgeSync] Messages read by:", data.readBy);
      },
    );

    this.chatSocket.on("disconnect", (reason) => {
      console.log("[BadgeSync] Chat WebSocket disconnected:", reason);
    });

    this.chatSocket.on("connect_error", (error) => {
      console.error("[BadgeSync] Chat WebSocket error:", error.message);
      this.scheduleReconnect();
    });
  }

  private async connectNotificationSocket(
    baseUrl: string,
    token: string,
  ): Promise<void> {
    const io = await getSocketIo();
    const notificationUrl = `${baseUrl}/notifications`;
    console.log(
      "[BadgeSync] Connecting to notification WebSocket:",
      notificationUrl,
    );

    this.notificationSocket = io(notificationUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 3, // Reduced to avoid excessive retries
      reconnectionDelay: 2000,
    });

    this.notificationSocket.on("connect", () => {
      console.log("[BadgeSync] ✅ Notification WebSocket connected");

      // Register user
      if (this.userId) {
        this.notificationSocket?.emit("register", { userId: this.userId });
      }
    });

    // Handle new notification
    this.notificationSocket.on("notification", (notification: any) => {
      console.log("[BadgeSync] 🔔 New notification received:", notification.id);

      // Increment notification count
      this.updateCounts(
        { notifications: this._counts.notifications + 1 },
        "websocket",
      );

      // Notify listeners
      this.newNotificationCallbacks.forEach((cb) => cb(notification));
    });

    // Also listen for notification:new (some backends use this format)
    this.notificationSocket.on("notification:new", (notification: any) => {
      console.log(
        "[BadgeSync] 🔔 New notification (alt event):",
        notification.id,
      );

      this.updateCounts(
        { notifications: this._counts.notifications + 1 },
        "websocket",
      );

      this.newNotificationCallbacks.forEach((cb) => cb(notification));
    });

    // Handle missed call notification
    this.notificationSocket.on("missedCall", (call: any) => {
      console.log("[BadgeSync] 📞 Missed call:", call);

      this.updateCounts(
        { missedCalls: this._counts.missedCalls + 1 },
        "websocket",
      );

      // Also notify as notification
      this.newNotificationCallbacks.forEach((cb) =>
        cb({
          id: call.id,
          type: "call",
          title: "Cuộc gọi nhỡ",
          message: `Bạn có cuộc gọi nhỡ từ ${call.callerName}`,
          ...call,
        }),
      );
    });

    this.notificationSocket.on("disconnect", (reason) => {
      console.log("[BadgeSync] Notification WebSocket disconnected:", reason);
    });

    this.notificationSocket.on("connect_error", (error) => {
      console.error("[BadgeSync] Notification WebSocket error:", error.message);
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("[BadgeSync] Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(
      `[BadgeSync] Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`,
    );

    this.reconnectTimer = setTimeout(() => {
      if (this.userId) {
        this.connectWebSockets();
      }
    }, delay);
  }

  // ============================================
  // DATA SYNC
  // ============================================

  /**
   * Full sync from REST API
   */
  private async fullSyncFromAPI(): Promise<void> {
    try {
      // Get message unread count from API
      const rooms = await chatAPIService.getChatRooms();
      const messageCount = rooms.reduce(
        (total, room) => total + (room.unreadCount || 0),
        0,
      );

      // Get missed calls count (if API available)
      let missedCallsCount = this._counts.missedCalls;
      try {
        const { callService } = await import("./api/call.service");
        missedCallsCount = await callService.getMissedCallsCount();
      } catch (e) {
        // Keep existing count
      }

      // Get notifications count (if API available)
      let notificationsCount = this._counts.notifications;
      try {
        const notificationsApi = (await import("./api/notificationsApi"))
          .default;
        const response = await notificationsApi.getNotifications();
        notificationsCount =
          response.data?.filter((n) => !n.isRead).length || 0;
      } catch (e) {
        // Keep existing count
      }

      console.log("[BadgeSync] API sync result:", {
        messages: messageCount,
        missedCalls: missedCallsCount,
        notifications: notificationsCount,
      });

      this.updateCounts(
        {
          messages: messageCount,
          missedCalls: missedCallsCount,
          notifications: notificationsCount,
        },
        "api",
      );
    } catch (error) {
      console.error("[BadgeSync] Error syncing from API:", error);
    }
  }

  // ============================================
  // COUNT MANAGEMENT
  // ============================================

  private updateCounts(
    partial: Partial<BadgeCounts>,
    source: "websocket" | "local" | "api",
  ): void {
    const oldTotal = this._counts.total;

    // Update counts
    if (partial.messages !== undefined) {
      this._counts.messages = Math.max(0, partial.messages);
    }
    if (partial.missedCalls !== undefined) {
      this._counts.missedCalls = Math.max(0, partial.missedCalls);
    }
    if (partial.notifications !== undefined) {
      this._counts.notifications = Math.max(0, partial.notifications);
    }

    // Recalculate total
    this._counts.total =
      this._counts.messages +
      this._counts.missedCalls +
      this._counts.notifications;

    // Update system badge
    this.updateSystemBadge();

    // Notify listeners if changed
    if (this._counts.total !== oldTotal || source === "api") {
      console.log(`[BadgeSync] Counts updated (${source}):`, this._counts);
      this.notifyBadgeUpdate();
    }
  }

  private notifyBadgeUpdate(): void {
    const counts = this.counts;
    this.badgeUpdateCallbacks.forEach((cb) => {
      try {
        cb(counts);
      } catch (error) {
        console.error("[BadgeSync] Error in badge update callback:", error);
      }
    });
  }

  /**
   * Update system app badge (iOS/Android)
   */
  private async updateSystemBadge(): Promise<void> {
    try {
      if (Platform.OS !== "web" && Notifications) {
        await Notifications.setBadgeCountAsync(this._counts.total);
      }
    } catch (error) {
      console.warn("[BadgeSync] Failed to update system badge:", error);
    }
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const badgeSyncService = BadgeSyncService.getInstance();
export default badgeSyncService;
