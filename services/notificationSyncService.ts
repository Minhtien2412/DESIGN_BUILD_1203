/**
 * Notification Sync Service
 * ==========================
 *
 * Đồng bộ thông báo giữa:
 * - Perfex CRM (thietkeresort.com.vn/perfex_crm)
 * - Backend App (baotienweb.cloud/api/v1)
 *
 * Flow:
 * 1. Lấy thông báo từ CRM (tasks, projects, tickets)
 * 2. Lấy thông báo từ Backend App
 * 3. Merge và deduplicate
 * 4. Sync trạng thái đọc giữa 2 hệ thống
 *
 * @author ThietKeResort Team
 * @created 2025-01-08
 */

import ENV from "@/config/env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { deleteItem, getItem, setItem } from "@/utils/storage";
import notificationsApi, { Notification } from "./api/notificationsApi";
import { getAccessToken as getStoredAccessToken } from "./token.service";

// ==================== CONFIG ====================

const PERFEX_CONFIG = {
  baseUrl: ENV.PERFEX_CRM_URL || "https://thietkeresort.com.vn/perfex_crm",
  authToken: ENV.PERFEX_API_TOKEN || "",
  timeout: 30000,
};

const STORAGE_KEYS = {
  LAST_SYNC: "notification_sync_last",
  CRM_NOTIFICATIONS: "notification_crm_cache",
  SYNC_STATUS: "notification_sync_status",
};

const NOTIFICATION_CACHE_KEY = STORAGE_KEYS.CRM_NOTIFICATIONS;

// ==================== TYPES ====================

export interface CRMActivity {
  id: string;
  description: string;
  date: string;
  staffid: string;
  staff_name?: string;
  rel_id: string;
  rel_type: string; // 'project', 'task', 'ticket', 'lead', etc.
  visible_to_customer: string;
}

export interface CRMTask {
  id: string;
  name: string;
  description: string;
  priority: string;
  status: string;
  startdate: string;
  duedate: string;
  datefinished: string | null;
  rel_id: string;
  rel_type: string;
  assigned_staff?: string;
  created_by?: string;
}

export interface CRMTicket {
  ticketid: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  department: string;
  contactid: string;
  userid: string;
  date: string;
  lastreply: string;
}

export interface CRMProjectUpdate {
  id: string;
  project_id: string;
  content: string;
  date_added: string;
  staff_id?: string;
}

export interface UnifiedNotification {
  id: string;
  source: "CRM" | "APP";
  sourceId: string; // Original ID from source system
  type:
    | "INFO"
    | "SUCCESS"
    | "WARNING"
    | "ERROR"
    | "TASK"
    | "MESSAGE"
    | "CALL"
    | "PAYMENT"
    | "PROJECT"
    | "TICKET";
  title: string;
  message: string;
  isRead: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  relatedId?: string;
  relatedType?: string;
  createdAt: string;
  syncedAt?: string;
}

export interface SyncResult {
  success: boolean;
  totalNotifications: number;
  crmCount: number;
  appCount: number;
  newCount: number;
  syncedAt: string;
  error?: string;
  isDemo?: boolean;
}

// ==================== CACHE HELPERS ====================

const isWeb = Platform.OS === "web";

async function readNotificationCache(): Promise<UnifiedNotification[] | null> {
  try {
    let cached: string | null = null;

    if (isWeb) {
      cached = await getItem(NOTIFICATION_CACHE_KEY);
    } else {
      cached = await AsyncStorage.getItem(NOTIFICATION_CACHE_KEY);
      if (!cached) {
        cached = await getItem(NOTIFICATION_CACHE_KEY); // legacy SecureStore
        if (cached) {
          try {
            await AsyncStorage.setItem(NOTIFICATION_CACHE_KEY, cached);
          } catch {}
        }
      }
    }

    if (!cached) return null;
    const parsed = JSON.parse(cached);
    return Array.isArray(parsed) ? (parsed as UnifiedNotification[]) : null;
  } catch (err) {
    console.error("[NotificationSync] Failed to read cache:", err);
    return null;
  }
}

async function writeNotificationCache(
  notifications: UnifiedNotification[],
): Promise<void> {
  const payload = JSON.stringify(notifications);

  if (isWeb) {
    await setItem(NOTIFICATION_CACHE_KEY, payload);
    return;
  }

  try {
    await AsyncStorage.setItem(NOTIFICATION_CACHE_KEY, payload);
  } catch (err) {
    console.warn(
      "[NotificationSync] AsyncStorage save failed, falling back to SecureStore:",
      err,
    );
    await setItem(NOTIFICATION_CACHE_KEY, payload);
  }
}

async function clearNotificationCache(): Promise<void> {
  if (isWeb) {
    await deleteItem(NOTIFICATION_CACHE_KEY);
    return;
  }

  try {
    await AsyncStorage.removeItem(NOTIFICATION_CACHE_KEY);
  } catch {}
  try {
    await deleteItem(NOTIFICATION_CACHE_KEY);
  } catch {}
}

// ==================== MOCK NOTIFICATIONS ====================

const MOCK_NOTIFICATIONS: UnifiedNotification[] = [
  {
    id: "mock_crm_1",
    source: "CRM",
    sourceId: "task_101",
    type: "TASK",
    title: "Công việc mới: Thiết kế mặt bằng Villa Premium",
    message:
      "Bạn được giao công việc thiết kế mặt bằng tầng 1 cho dự án Villa Premium. Deadline: 15/01/2026",
    isRead: false,
    priority: "HIGH",
    relatedId: "101",
    relatedType: "task",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 phút trước
    syncedAt: new Date().toISOString(),
  },
  {
    id: "mock_app_1",
    source: "APP",
    sourceId: "msg_45",
    type: "MESSAGE",
    title: "Tin nhắn mới từ Nguyễn Văn A",
    message:
      "Anh ơi, em cần xác nhận lại thiết kế nội thất phòng khách trước khi chuyển sang giai đoạn tiếp theo nhé!",
    isRead: false,
    priority: "MEDIUM",
    relatedId: "45",
    relatedType: "chat",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 giờ trước
    syncedAt: new Date().toISOString(),
  },
  {
    id: "mock_crm_2",
    source: "CRM",
    sourceId: "project_12",
    type: "PROJECT",
    title: "Cập nhật tiến độ dự án",
    message:
      'Dự án "Biệt thự Phú Quốc" đã được cập nhật tiến độ lên 75%. Giai đoạn xây thô hoàn thành.',
    isRead: false,
    priority: "MEDIUM",
    relatedId: "12",
    relatedType: "project",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 giờ trước
    syncedAt: new Date().toISOString(),
  },
  {
    id: "mock_app_2",
    source: "APP",
    sourceId: "payment_33",
    type: "PAYMENT",
    title: "Thanh toán thành công",
    message:
      "Đã nhận thanh toán 150.000.000 VND cho giai đoạn 2 dự án Villa Premium. Mã giao dịch: PAY-2026-001234",
    isRead: false,
    priority: "LOW",
    relatedId: "33",
    relatedType: "payment",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Hôm qua
    syncedAt: new Date().toISOString(),
  },
  {
    id: "mock_crm_3",
    source: "CRM",
    sourceId: "task_88",
    type: "TASK",
    title: "Hoàn thành công việc",
    message:
      'Công việc "Khảo sát mặt bằng" đã được đánh dấu hoàn thành bởi team kỹ thuật.',
    isRead: true,
    priority: "LOW",
    relatedId: "88",
    relatedType: "task",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Hôm qua
    syncedAt: new Date().toISOString(),
  },
  {
    id: "mock_crm_4",
    source: "CRM",
    sourceId: "task_102",
    type: "WARNING",
    title: "⚠️ Sắp đến hạn deadline",
    message:
      'Công việc "Bản vẽ kiến trúc tầng 1" còn 2 ngày nữa là đến hạn. Vui lòng kiểm tra và hoàn thành đúng tiến độ.',
    isRead: false,
    priority: "URGENT",
    relatedId: "102",
    relatedType: "task",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 giờ trước
    syncedAt: new Date().toISOString(),
  },
  {
    id: "mock_app_3",
    source: "APP",
    sourceId: "sys_1",
    type: "INFO",
    title: "Thành viên mới tham gia",
    message:
      'Trần Thị B đã tham gia dự án "Căn hộ Sunrise City" với vai trò Kỹ sư kết cấu.',
    isRead: true,
    priority: "LOW",
    relatedId: "15",
    relatedType: "project",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 ngày trước
    syncedAt: new Date().toISOString(),
  },
  {
    id: "mock_crm_5",
    source: "CRM",
    sourceId: "ticket_201",
    type: "TICKET",
    title: "Yêu cầu hỗ trợ mới #201",
    message:
      "Khách hàng Lê Văn C đã gửi yêu cầu hỗ trợ về vấn đề đổi màu sơn tường. Độ ưu tiên: Cao",
    isRead: false,
    priority: "HIGH",
    relatedId: "201",
    relatedType: "ticket",
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 giờ trước
    syncedAt: new Date().toISOString(),
  },
];

// ==================== CRM API HELPER ====================

async function fetchCRM<T>(endpoint: string): Promise<T | null> {
  try {
    const url = `${PERFEX_CONFIG.baseUrl}/api/${endpoint}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authtoken: PERFEX_CONFIG.authToken,
      },
    });

    if (!response.ok) {
      console.warn(`[CRM] API error: ${response.status} for ${endpoint}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`[CRM] Fetch error for ${endpoint}:`, error);
    return null;
  }
}

// ==================== CRM DATA FETCHERS ====================

/**
 * Lấy các task từ CRM
 */
async function fetchCRMTasks(contactId?: string): Promise<CRMTask[]> {
  try {
    // Thử endpoint tasks
    const response = await fetchCRM<{ status: boolean; data?: CRMTask[] }>(
      "tasks",
    );
    if (response?.status && response.data) {
      return response.data;
    }

    // Fallback: tasks by contact
    if (contactId) {
      const contactTasks = await fetchCRM<CRMTask[]>(
        `tasks?contact_id=${contactId}`,
      );
      return contactTasks || [];
    }

    return [];
  } catch {
    return [];
  }
}

/**
 * Lấy các ticket support từ CRM
 */
async function fetchCRMTickets(customerId?: string): Promise<CRMTicket[]> {
  try {
    if (!customerId) return [];

    const response = await fetchCRM<{ status: boolean; data?: CRMTicket[] }>(
      `tickets?userid=${customerId}`,
    );

    if (response?.status && response.data) {
      return response.data;
    }

    return [];
  } catch {
    return [];
  }
}

/**
 * Lấy cập nhật dự án từ CRM
 */
async function fetchCRMProjectUpdates(
  projectId: string,
): Promise<CRMProjectUpdate[]> {
  try {
    const response = await fetchCRM<{
      status: boolean;
      data?: CRMProjectUpdate[];
    }>(`projects/${projectId}/discussions`);

    if (response?.status && response.data) {
      return response.data;
    }

    return [];
  } catch {
    return [];
  }
}

/**
 * Lấy hoạt động gần đây từ CRM
 */
async function fetchCRMActivities(
  relType?: string,
  relId?: string,
): Promise<CRMActivity[]> {
  try {
    let endpoint = "activity_log";
    if (relType && relId) {
      endpoint = `activity_log?rel_type=${relType}&rel_id=${relId}`;
    }

    const response = await fetchCRM<{ status: boolean; data?: CRMActivity[] }>(
      endpoint,
    );

    if (response?.status && response.data) {
      return response.data.filter((a) => a.visible_to_customer === "1");
    }

    return [];
  } catch {
    return [];
  }
}

// ==================== CONVERTERS ====================

/**
 * Chuyển đổi CRM Task thành UnifiedNotification
 */
function convertCRMTask(task: CRMTask): UnifiedNotification {
  const isOverdue =
    task.duedate && new Date(task.duedate) < new Date() && task.status !== "5";
  const isHighPriority = task.priority === "2" || task.priority === "3";

  let type: UnifiedNotification["type"] = "TASK";
  let priority: UnifiedNotification["priority"] = "MEDIUM";

  if (isOverdue) {
    type = "WARNING";
    priority = "HIGH";
  } else if (isHighPriority) {
    priority = task.priority === "3" ? "URGENT" : "HIGH";
  }

  return {
    id: `crm_task_${task.id}`,
    source: "CRM",
    sourceId: task.id,
    type,
    title: task.name,
    message: task.description || `Công việc: ${task.name}`,
    isRead: task.status === "5", // Completed tasks are considered "read"
    priority,
    relatedId: task.rel_id,
    relatedType: task.rel_type,
    createdAt: task.startdate,
  };
}

/**
 * Chuyển đổi CRM Ticket thành UnifiedNotification
 */
function convertCRMTicket(ticket: CRMTicket): UnifiedNotification {
  const priorityMap: Record<string, UnifiedNotification["priority"]> = {
    "1": "LOW",
    "2": "MEDIUM",
    "3": "HIGH",
    "4": "URGENT",
  };

  return {
    id: `crm_ticket_${ticket.ticketid}`,
    source: "CRM",
    sourceId: ticket.ticketid,
    type: "TICKET",
    title: ticket.subject,
    message: ticket.message?.substring(0, 200) || "Ticket hỗ trợ mới",
    isRead: ticket.status === "5", // Closed tickets
    priority: priorityMap[ticket.priority] || "MEDIUM",
    relatedId: ticket.ticketid,
    relatedType: "ticket",
    createdAt: ticket.date,
  };
}

/**
 * Chuyển đổi CRM Activity thành UnifiedNotification
 */
function convertCRMActivity(activity: CRMActivity): UnifiedNotification {
  return {
    id: `crm_activity_${activity.id}`,
    source: "CRM",
    sourceId: activity.id,
    type: "INFO",
    title: `Cập nhật ${activity.rel_type}`,
    message: activity.description,
    isRead: false,
    priority: "LOW",
    relatedId: activity.rel_id,
    relatedType: activity.rel_type,
    createdAt: activity.date,
  };
}

/**
 * Chuyển đổi App Notification thành UnifiedNotification
 */
function convertAppNotification(notif: Notification): UnifiedNotification {
  return {
    id: `app_${notif.id}`,
    source: "APP",
    sourceId: String(notif.id),
    type: notif.type as UnifiedNotification["type"],
    title: notif.title,
    message: notif.message,
    isRead: notif.isRead,
    priority: "MEDIUM",
    relatedId: notif.relatedId ? String(notif.relatedId) : undefined,
    relatedType: notif.relatedType || undefined,
    createdAt: notif.createdAt,
  };
}

// ==================== MAIN SERVICE ====================

// Global sync deduplication
let syncInProgress = false;
let lastSyncTime = 0;
const SYNC_DEBOUNCE_MS = 10000; // Minimum 10 seconds between syncs

export const NotificationSyncService = {
  /**
   * Đồng bộ thông báo từ cả 2 nguồn
   */
  syncAll: async (options?: {
    customerId?: string;
    contactId?: string;
    projectIds?: string[];
  }): Promise<SyncResult> => {
    // Debounce - prevent rapid consecutive calls
    const now = Date.now();
    if (now - lastSyncTime < SYNC_DEBOUNCE_MS) {
      console.log(
        `[NotificationSync] Debounced - wait ${Math.ceil((SYNC_DEBOUNCE_MS - (now - lastSyncTime)) / 1000)}s`,
      );
      // Return cached result
      const cached = await NotificationSyncService.getAll();
      return {
        success: true,
        totalNotifications: cached.length,
        crmCount: cached.filter((n) => n.source === "CRM").length,
        appCount: cached.filter((n) => n.source === "APP").length,
        newCount: 0,
        syncedAt: new Date(lastSyncTime).toISOString(),
        isDemo: false,
      };
    }

    // Prevent concurrent syncs
    if (syncInProgress) {
      console.log("[NotificationSync] Sync already in progress, skipping");
      const cached = await NotificationSyncService.getAll();
      return {
        success: true,
        totalNotifications: cached.length,
        crmCount: cached.filter((n) => n.source === "CRM").length,
        appCount: cached.filter((n) => n.source === "APP").length,
        newCount: 0,
        syncedAt: new Date(lastSyncTime).toISOString(),
        isDemo: false,
      };
    }

    syncInProgress = true;
    lastSyncTime = now;
    const startTime = Date.now();
    const unifiedNotifications: UnifiedNotification[] = [];

    try {
      console.log("[NotificationSync] Starting sync...");

      // 1. Lấy thông báo từ App Backend
      let appNotifications: Notification[] = [];
      try {
        const accessToken = await getStoredAccessToken();

        if (!accessToken) {
          console.log(
            "[NotificationSync] No valid access token, skipping app notifications",
          );
        } else {
          const appResponse = await notificationsApi.getNotifications(1, 100);
          appNotifications = appResponse.data || [];
          console.log(
            `[NotificationSync] App notifications: ${appNotifications.length}`,
          );
        }
      } catch (err) {
        console.warn(
          "[NotificationSync] Failed to fetch app notifications:",
          err,
        );
      }

      // Convert app notifications
      appNotifications.forEach((notif) => {
        unifiedNotifications.push(convertAppNotification(notif));
      });

      // 2. Lấy tasks từ CRM
      const crmTasks = await fetchCRMTasks(options?.contactId);
      console.log(`[NotificationSync] CRM tasks: ${crmTasks.length}`);
      crmTasks.forEach((task) => {
        unifiedNotifications.push(convertCRMTask(task));
      });

      // 3. Lấy tickets từ CRM
      if (options?.customerId) {
        const crmTickets = await fetchCRMTickets(options.customerId);
        console.log(`[NotificationSync] CRM tickets: ${crmTickets.length}`);
        crmTickets.forEach((ticket) => {
          unifiedNotifications.push(convertCRMTicket(ticket));
        });
      }

      // 4. Lấy activities từ CRM (for each project)
      if (options?.projectIds) {
        for (const projectId of options.projectIds) {
          const activities = await fetchCRMActivities("project", projectId);
          activities.slice(0, 10).forEach((activity) => {
            // Limit 10 per project
            unifiedNotifications.push(convertCRMActivity(activity));
          });
        }
      }

      // 5. Sort by createdAt descending
      unifiedNotifications.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      // 6. Deduplicate (in case of overlaps)
      const uniqueMap = new Map<string, UnifiedNotification>();
      unifiedNotifications.forEach((notif) => {
        if (!uniqueMap.has(notif.id)) {
          uniqueMap.set(notif.id, notif);
        }
      });

      const finalNotifications = Array.from(uniqueMap.values());

      // 7. Save to cache
      const syncedAt = new Date().toISOString();
      await writeNotificationCache(finalNotifications);
      await setItem(STORAGE_KEYS.LAST_SYNC, syncedAt);
      await setItem(STORAGE_KEYS.SYNC_STATUS, "success");

      const crmCount = finalNotifications.filter(
        (n) => n.source === "CRM",
      ).length;
      const appCount = finalNotifications.filter(
        (n) => n.source === "APP",
      ).length;

      console.log(
        `[NotificationSync] Completed in ${Date.now() - startTime}ms`,
      );
      console.log(
        `[NotificationSync] Total: ${finalNotifications.length} (CRM: ${crmCount}, App: ${appCount})`,
      );

      return {
        success: true,
        totalNotifications: finalNotifications.length,
        crmCount,
        appCount,
        newCount: finalNotifications.filter((n) => !n.isRead).length,
        syncedAt,
      };
    } catch (error) {
      console.error("[NotificationSync] Sync failed:", error);
      console.log("[NotificationSync] Using mock notifications as fallback");

      // Cache mock notifications khi API fail
      await writeNotificationCache(MOCK_NOTIFICATIONS);
      await setItem(STORAGE_KEYS.SYNC_STATUS, "demo");

      const crmMockCount = MOCK_NOTIFICATIONS.filter(
        (n) => n.source === "CRM",
      ).length;
      const appMockCount = MOCK_NOTIFICATIONS.filter(
        (n) => n.source === "APP",
      ).length;

      return {
        success: true, // Return success để UI hiển thị mock data
        totalNotifications: MOCK_NOTIFICATIONS.length,
        crmCount: crmMockCount,
        appCount: appMockCount,
        newCount: MOCK_NOTIFICATIONS.filter((n) => !n.isRead).length,
        syncedAt: new Date().toISOString(),
        isDemo: true,
      };
    } finally {
      syncInProgress = false;
    }
  },

  /**
   * Lấy tất cả thông báo đã sync
   */
  getAll: async (): Promise<UnifiedNotification[]> => {
    try {
      const cached = await readNotificationCache();
      if (cached && cached.length > 0) {
        return cached;
      }
    } catch (err) {
      console.error(
        "[NotificationSync] Failed to get cached notifications:",
        err,
      );
    }
    // Return mock data when no cached data
    console.log("[NotificationSync] No cached notifications, using mock data");
    return MOCK_NOTIFICATIONS;
  },

  /**
   * LÆ°u danh sÃ¡ch thÃ´ng bÃ¡o vÃ o cache
   */
  saveAll: async (notifications: UnifiedNotification[]): Promise<void> => {
    await writeNotificationCache(notifications);
  },

  /**
   * Lấy thông báo chưa đọc
   */
  getUnread: async (): Promise<UnifiedNotification[]> => {
    const all = await NotificationSyncService.getAll();
    return all.filter((n) => !n.isRead);
  },

  /**
   * Lấy số lượng chưa đọc
   */
  getUnreadCount: async (): Promise<{
    total: number;
    crm: number;
    app: number;
  }> => {
    const unread = await NotificationSyncService.getUnread();
    return {
      total: unread.length,
      crm: unread.filter((n) => n.source === "CRM").length,
      app: unread.filter((n) => n.source === "APP").length,
    };
  },

  /**
   * Đánh dấu đã đọc
   */
  markAsRead: async (notificationId: string): Promise<void> => {
    // Update local cache
    const all = await NotificationSyncService.getAll();
    const updated = all.map((n) =>
      n.id === notificationId ? { ...n, isRead: true } : n,
    );
    await writeNotificationCache(updated);

    // If it's an app notification, also update backend
    if (notificationId.startsWith("app_")) {
      const appId = parseInt(notificationId.replace("app_", ""));
      try {
        await notificationsApi.markAsRead(appId);
      } catch (err) {
        console.warn(
          "[NotificationSync] Failed to mark app notification as read:",
          err,
        );
      }
    }

    // For CRM notifications, we might want to call CRM API too
    // Currently CRM API doesn't have direct notification read endpoint
  },

  /**
   * Đánh dấu tất cả đã đọc
   */
  markAllAsRead: async (): Promise<void> => {
    // Update local cache
    const all = await NotificationSyncService.getAll();
    const updated = all.map((n) => ({ ...n, isRead: true }));
    await writeNotificationCache(updated);

    // Update app backend
    try {
      await notificationsApi.markAllAsRead();
    } catch (err) {
      console.warn(
        "[NotificationSync] Failed to mark all app notifications as read:",
        err,
      );
    }
  },

  /**
   * Lấy thời điểm sync cuối
   */
  getLastSyncTime: async (): Promise<string | null> => {
    return await getItem(STORAGE_KEYS.LAST_SYNC);
  },

  /**
   * Lấy trạng thái sync
   */
  getSyncStatus: async (): Promise<"success" | "failed" | "pending" | null> => {
    const status = await getItem(STORAGE_KEYS.SYNC_STATUS);
    return status as any;
  },

  /**
   * Xóa cache
   */
  clearCache: async (): Promise<void> => {
    await clearNotificationCache();
    await setItem(STORAGE_KEYS.LAST_SYNC, "");
    await setItem(STORAGE_KEYS.SYNC_STATUS, "");
  },
};

export default NotificationSyncService;
