/**
 * Notification Realtime Service
 * ==============================
 *
 * Kết nối WebSocket để nhận thông báo real-time từ Backend
 * và tự động sync với NotificationSyncService.
 *
 * Backend Events (namespace: /notifications):
 * - notification - Thông báo mới từ backend (NOT notification:new!)
 * - registered - Xác nhận đăng ký thành công
 * - broadcast - Thông báo hệ thống
 *
 * @author ThietKeResort Team
 * @created 2025-01-08
 * @updated 2026-02-03 - Fixed event names to match backend gateway
 */

import socketManager, {
    Notification as SocketNotification,
} from "@/services/socket";
import NotificationSyncService, {
    UnifiedNotification,
} from "./notificationSyncService";
import { getAccessToken } from "./token.service";

// Types - notification with optional isRead
interface NotificationWithRead {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "payment" | "project" | "message" | "system" | "task";
  read: boolean;
  isRead?: boolean; // Optional: API uses 'isRead' while socket uses 'read'
  createdAt: string;
  data?: any;
}

type NotificationCallback = (notification: UnifiedNotification) => void;

// ==================== STATE ====================

let isConnected = false;
let listeners: NotificationCallback[] = [];
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 3000;

// ==================== HELPERS ====================

/**
 * Chuyển đổi Notification từ WebSocket thành UnifiedNotification
 */
function convertToUnified(
  notification: NotificationWithRead,
): UnifiedNotification {
  // Map socket notification type to unified type
  const typeMap: Record<string, UnifiedNotification["type"]> = {
    payment: "PAYMENT",
    project: "PROJECT",
    message: "MESSAGE",
    system: "INFO",
    task: "TASK",
  };

  return {
    id: `app_${notification.id}`,
    source: "APP",
    sourceId: String(notification.id),
    type: typeMap[notification.type] || "INFO",
    title: notification.title,
    message: notification.message,
    isRead: notification.isRead ?? notification.read ?? false,
    priority: "MEDIUM",
    relatedId: notification.data?.relatedId
      ? String(notification.data.relatedId)
      : undefined,
    relatedType: notification.data?.relatedType || undefined,
    createdAt: notification.createdAt,
    syncedAt: new Date().toISOString(),
  };
}

/**
 * Thêm notification mới vào cache
 */
async function addToCache(notification: UnifiedNotification): Promise<void> {
  try {
    const cached = await NotificationSyncService.getAll();

    // Check if already exists
    if (cached.some((n) => n.id === notification.id)) {
      console.log(
        "[NotificationRealtime] Notification already exists:",
        notification.id,
      );
      return;
    }

    // Add to beginning of list
    const updated = [notification, ...cached];
    await NotificationSyncService.saveAll(updated);

    console.log(
      "[NotificationRealtime] ✅ Added new notification:",
      notification.id,
    );
  } catch (err) {
    console.error("[NotificationRealtime] ❌ Failed to add to cache:", err);
  }
}

/**
 * Cập nhật notification trong cache
 */
async function updateInCache(
  notificationId: string,
  updates: Partial<UnifiedNotification>,
): Promise<void> {
  try {
    const cached = await NotificationSyncService.getAll();
    const updated = cached.map((n) =>
      n.id === notificationId ? { ...n, ...updates } : n,
    );
    await NotificationSyncService.saveAll(updated);

    console.log("[NotificationRealtime] Updated notification:", notificationId);
  } catch (err) {
    console.error("[NotificationRealtime] Failed to update cache:", err);
  }
}

/**
 * Xóa notification khỏi cache
 */
async function removeFromCache(notificationId: string): Promise<void> {
  try {
    const cached = await NotificationSyncService.getAll();
    const updated = cached.filter((n) => n.id !== notificationId);
    await NotificationSyncService.saveAll(updated);

    console.log("[NotificationRealtime] Removed notification:", notificationId);
  } catch (err) {
    console.error("[NotificationRealtime] Failed to remove from cache:", err);
  }
}

// ==================== EVENT HANDLERS ====================

/**
 * Xử lý khi có notification mới từ WebSocket
 */
function handleNewNotification(data: SocketNotification): void {
  console.log("[NotificationRealtime] New notification received:", data.id);

  // Cast to our extended type
  const notificationData: NotificationWithRead = {
    ...data,
    type: data.type as NotificationWithRead["type"],
  };

  const unified = convertToUnified(notificationData);

  // Add to cache
  addToCache(unified);

  // Notify all listeners
  listeners.forEach((callback) => {
    try {
      callback(unified);
    } catch (err) {
      console.error("[NotificationRealtime] Listener error:", err);
    }
  });
}

/**
 * Xử lý khi notification được đánh dấu đã đọc
 */
function handleReadNotification(notificationId: number): void {
  console.log(
    "[NotificationRealtime] Notification marked as read:",
    notificationId,
  );

  const unifiedId = `app_${notificationId}`;
  updateInCache(unifiedId, { isRead: true });
}

/**
 * Xử lý khi notification bị xóa
 */
function handleDeleteNotification(notificationId: number): void {
  console.log("[NotificationRealtime] Notification deleted:", notificationId);

  const unifiedId = `app_${notificationId}`;
  removeFromCache(unifiedId);
}

/**
 * Xử lý yêu cầu sync lại toàn bộ
 */
async function handleSyncRequest(): Promise<void> {
  console.log("[NotificationRealtime] 🔄 Sync requested");

  try {
    await NotificationSyncService.syncAll();
    console.log("[NotificationRealtime] ✅ Sync completed");
  } catch (err) {
    console.error("[NotificationRealtime] ❌ Sync failed:", err);
  }
}

// ==================== MAIN SERVICE ====================

export const NotificationRealtimeService = {
  /**
   * Kết nối WebSocket và bắt đầu lắng nghe notifications
   *
   * NOTE: This service uses socketManager which connects to /chat namespace.
   * For /notifications namespace, use UnifiedNotificationContext instead.
   * This is kept for backward compatibility with chat-based notifications.
   */
  connect: async (): Promise<boolean> => {
    if (isConnected) {
      console.log("[NotificationRealtime] Already connected");
      return true;
    }

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        console.log(
          "[NotificationRealtime] ⚠️ No access token, skipping realtime connection",
        );
        return false;
      }

      console.log("[NotificationRealtime] 🔌 Connecting to chat namespace...");

      // Connect to socket (default /chat namespace)
      await socketManager.connect();

      // Get socket instance
      const socket = socketManager.getSocket();
      if (!socket) {
        console.error(
          "[NotificationRealtime] ❌ No socket instance after connect",
        );
        return false;
      }

      // Listen for notification events
      // NOTE: Backend /chat namespace may use 'notification:new' while /notifications uses 'notification'
      // We listen to both for compatibility
      socket.on("notification:new", (notification) => {
        console.log(
          "[NotificationRealtime] 🔔 notification:new event:",
          notification?.id,
        );
        handleNewNotification(notification);
      });

      socket.on("notification", (notification) => {
        console.log(
          "[NotificationRealtime] 🔔 notification event:",
          notification?.id,
        );
        handleNewNotification(notification);
      });

      // Listen for other events if backend supports them
      socket.on("notification:read", (data: { notificationId: number }) => {
        console.log("[NotificationRealtime] 📖 notification:read event:", data);
        handleReadNotification(data.notificationId);
      });

      socket.on("notification:delete", (data: { notificationId: number }) => {
        console.log(
          "[NotificationRealtime] 🗑️ notification:delete event:",
          data,
        );
        handleDeleteNotification(data.notificationId);
      });

      socket.on("notification:sync", () => {
        console.log("[NotificationRealtime] 🔄 notification:sync event");
        handleSyncRequest();
      });

      isConnected = true;
      reconnectAttempts = 0;

      console.log("[NotificationRealtime] ✅ Connected successfully");
      return true;
    } catch (err) {
      console.error("[NotificationRealtime] ❌ Connection failed:", err);

      // Auto-reconnect
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(
          `[NotificationRealtime] 🔄 Reconnecting in ${RECONNECT_DELAY}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`,
        );

        setTimeout(() => {
          NotificationRealtimeService.connect();
        }, RECONNECT_DELAY);
      } else {
        console.error(
          "[NotificationRealtime] 🚨 Max reconnect attempts reached",
        );
      }

      return false;
    }
  },

  /**
   * Ngắt kết nối WebSocket
   */
  disconnect: (): void => {
    if (!isConnected) return;

    console.log("[NotificationRealtime] 🔌 Disconnecting...");

    socketManager.disconnect();
    isConnected = false;

    console.log("[NotificationRealtime] ❌ Disconnected");
  },

  /**
   * Đăng ký lắng nghe notification mới
   */
  subscribe: (callback: NotificationCallback): (() => void) => {
    listeners.push(callback);
    console.log(
      `[NotificationRealtime] Subscribed. Total listeners: ${listeners.length}`,
    );

    // Return unsubscribe function
    return () => {
      listeners = listeners.filter((cb) => cb !== callback);
      console.log(
        `[NotificationRealtime] Unsubscribed. Total listeners: ${listeners.length}`,
      );
    };
  },

  /**
   * Kiểm tra trạng thái kết nối
   */
  isConnected: (): boolean => isConnected,

  /**
   * Force sync lại toàn bộ
   */
  forceSync: async (): Promise<void> => {
    await handleSyncRequest();
  },

  /**
   * Emit notification event to server (nếu cần)
   */
  emit: (event: string, data: any): void => {
    const socket = socketManager.getSocket();
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn("[NotificationRealtime] Cannot emit - not connected");
    }
  },
};

export default NotificationRealtimeService;
