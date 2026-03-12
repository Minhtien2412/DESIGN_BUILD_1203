/**
 * Perfex CRM Notification Service
 * ================================
 * 
 * Service để nhận và xử lý thông báo từ Perfex CRM
 * - Polling định kỳ để lấy thông báo mới
 * - Xử lý webhook từ CRM
 * - Gửi push notification đến thiết bị
 * 
 * @author AI Assistant
 * @date 14/01/2026
 */

import ENV from '@/config/env';
import { PushNotificationService } from './pushNotificationService';

// ==================== CONFIG ====================

const PERFEX_CONFIG = {
  baseUrl: ENV.PERFEX_CRM_URL || 'https://thietkeresort.com.vn/perfex_crm',
  authToken: ENV.PERFEX_API_TOKEN || '',
  pollingInterval: 60000, // 1 phút
};

// ==================== TYPES ====================

export interface PerfexNotification {
  id: string;
  type: PerfexNotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isread: string; // '0' or '1'
  date: string;
  fromcompany?: string;
  fromuserid?: string;
  link?: string;
  touserid?: string;
  fromclientid?: string;
}

export type PerfexNotificationType = 
  | 'project_created'
  | 'project_updated'
  | 'project_completed'
  | 'task_assigned'
  | 'task_completed'
  | 'task_comment'
  | 'invoice_created'
  | 'invoice_paid'
  | 'estimate_created'
  | 'estimate_accepted'
  | 'estimate_declined'
  | 'contract_signed'
  | 'ticket_created'
  | 'ticket_reply'
  | 'lead_created'
  | 'proposal_created'
  | 'announcement'
  | 'reminder'
  | 'custom';

export interface PerfexActivity {
  id: string;
  description: string;
  date: string;
  staffid: string;
  rel_id: string;
  rel_type: string;
}

// ==================== NOTIFICATION STORAGE ====================

const STORAGE_KEYS = {
  LAST_NOTIFICATION_ID: '@perfex_last_notification_id',
  LAST_ACTIVITY_ID: '@perfex_last_activity_id',
  NOTIFICATIONS_CACHE: '@perfex_notifications_cache',
  POLLING_ENABLED: '@perfex_polling_enabled',
};

let lastNotificationId: string | null = null;
let pollingTimer: NodeJS.Timeout | null = null;

// ==================== API HELPER ====================

async function perfexApiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${PERFEX_CONFIG.baseUrl}/api/${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'authtoken': PERFEX_CONFIG.authToken,
    ...(options.headers as Record<string, string> || {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// ==================== NOTIFICATION FETCHING ====================

/**
 * Lấy danh sách thông báo từ CRM
 */
export async function fetchNotifications(
  options?: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<PerfexNotification[]> {
  try {
    // Perfex CRM API endpoint cho notifications
    // Có thể là /api/notifications hoặc custom endpoint
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.unreadOnly) params.append('isread', '0');

    const queryString = params.toString();
    const endpoint = `notifications${queryString ? `?${queryString}` : ''}`;
    
    const response = await perfexApiFetch<{ notifications?: PerfexNotification[] }>(endpoint);
    return response.notifications || [];
  } catch (error) {
    console.warn('[PerfexNotifications] Failed to fetch:', error);
    return [];
  }
}

/**
 * Lấy thông báo mới (chưa đọc)
 */
export async function fetchNewNotifications(): Promise<PerfexNotification[]> {
  try {
    const notifications = await fetchNotifications({ unreadOnly: true, limit: 20 });
    
    // Lọc thông báo mới hơn lastNotificationId
    if (lastNotificationId) {
      const newNotifications = notifications.filter(n => 
        parseInt(n.id) > parseInt(lastNotificationId!)
      );
      return newNotifications;
    }
    
    return notifications;
  } catch (error) {
    console.warn('[PerfexNotifications] Failed to fetch new:', error);
    return [];
  }
}

/**
 * Đánh dấu thông báo đã đọc
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    await perfexApiFetch(`notifications/${notificationId}/read`, {
      method: 'POST',
    });
    return true;
  } catch (error) {
    console.warn('[PerfexNotifications] Failed to mark as read:', error);
    return false;
  }
}

/**
 * Đánh dấu tất cả đã đọc
 */
export async function markAllNotificationsAsRead(): Promise<boolean> {
  try {
    await perfexApiFetch('notifications/read_all', {
      method: 'POST',
    });
    return true;
  } catch (error) {
    console.warn('[PerfexNotifications] Failed to mark all as read:', error);
    return false;
  }
}

// ==================== ACTIVITY FEED ====================

/**
 * Lấy activity feed từ CRM
 * Dùng để theo dõi các hoạt động mới
 */
export async function fetchActivities(
  options?: {
    relType?: string; // 'project', 'task', 'customer', etc.
    relId?: string;
    limit?: number;
  }
): Promise<PerfexActivity[]> {
  try {
    const params = new URLSearchParams();
    if (options?.relType) params.append('rel_type', options.relType);
    if (options?.relId) params.append('rel_id', options.relId);
    if (options?.limit) params.append('limit', options.limit.toString());

    const queryString = params.toString();
    const endpoint = `activities${queryString ? `?${queryString}` : ''}`;
    
    const response = await perfexApiFetch<{ activities?: PerfexActivity[] }>(endpoint);
    return response.activities || [];
  } catch (error) {
    console.warn('[PerfexNotifications] Failed to fetch activities:', error);
    return [];
  }
}

// ==================== PROJECT NOTIFICATIONS ====================

/**
 * Lấy cập nhật dự án mới
 */
export async function fetchProjectUpdates(projectId?: string): Promise<PerfexActivity[]> {
  return fetchActivities({ 
    relType: 'project', 
    relId: projectId,
    limit: 20 
  });
}

/**
 * Lấy task updates
 */
export async function fetchTaskUpdates(): Promise<PerfexActivity[]> {
  return fetchActivities({ relType: 'task', limit: 20 });
}

// ==================== POLLING SERVICE ====================

/**
 * Bắt đầu polling thông báo từ CRM
 * Gọi trong app startup
 */
export function startNotificationPolling(
  onNewNotification?: (notifications: PerfexNotification[]) => void,
  interval?: number
): void {
  if (pollingTimer) {
    console.log('[PerfexNotifications] Polling already running');
    return;
  }

  const pollInterval = interval || PERFEX_CONFIG.pollingInterval;
  console.log(`[PerfexNotifications] Starting polling every ${pollInterval / 1000}s`);

  const poll = async () => {
    try {
      const newNotifications = await fetchNewNotifications();
      
      if (newNotifications.length > 0) {
        console.log(`[PerfexNotifications] Found ${newNotifications.length} new notifications`);
        
        // Update lastNotificationId
        const maxId = Math.max(...newNotifications.map(n => parseInt(n.id)));
        lastNotificationId = maxId.toString();
        
        // Callback
        if (onNewNotification) {
          onNewNotification(newNotifications);
        }
        
        // Có thể trigger local notification ở đây
        for (const notification of newNotifications) {
          await showLocalNotification(notification);
        }
      }
    } catch (error) {
      console.warn('[PerfexNotifications] Polling error:', error);
    }
  };

  // Poll immediately, then at interval
  poll();
  pollingTimer = setInterval(poll, pollInterval);
}

/**
 * Dừng polling
 */
export function stopNotificationPolling(): void {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
    console.log('[PerfexNotifications] Polling stopped');
  }
}

/**
 * Kiểm tra polling có đang chạy không
 */
export function isPollingActive(): boolean {
  return pollingTimer !== null;
}

// ==================== LOCAL NOTIFICATION ====================

/**
 * Hiển thị local notification từ Perfex notification
 */
async function showLocalNotification(notification: PerfexNotification): Promise<void> {
  try {
    const Notifications = require('expo-notifications');
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: getNotificationTitle(notification),
        body: notification.message || notification.title,
        data: {
          type: 'perfex_crm',
          notificationType: notification.type,
          notificationId: notification.id,
          link: notification.link,
          ...notification.data,
        },
        sound: 'default',
      },
      trigger: null, // Immediately
    });
  } catch (error) {
    console.warn('[PerfexNotifications] Failed to show local notification:', error);
  }
}

/**
 * Lấy title phù hợp theo loại thông báo
 */
function getNotificationTitle(notification: PerfexNotification): string {
  const titles: Record<PerfexNotificationType, string> = {
    project_created: '🏗️ Dự án mới',
    project_updated: '📝 Cập nhật dự án',
    project_completed: '✅ Dự án hoàn thành',
    task_assigned: '📋 Task mới được giao',
    task_completed: '✔️ Task hoàn thành',
    task_comment: '💬 Bình luận mới',
    invoice_created: '📄 Hóa đơn mới',
    invoice_paid: '💰 Thanh toán thành công',
    estimate_created: '📊 Báo giá mới',
    estimate_accepted: '✅ Báo giá được chấp nhận',
    estimate_declined: '❌ Báo giá bị từ chối',
    contract_signed: '📝 Hợp đồng đã ký',
    ticket_created: '🎫 Ticket hỗ trợ mới',
    ticket_reply: '💬 Phản hồi ticket',
    lead_created: '👤 Lead mới',
    proposal_created: '📋 Đề xuất mới',
    announcement: '📢 Thông báo',
    reminder: '⏰ Nhắc nhở',
    custom: '🔔 Thông báo',
  };
  
  return titles[notification.type] || notification.title || '🔔 Thông báo từ CRM';
}

// ==================== WEBHOOK HANDLER ====================

/**
 * Xử lý webhook từ Perfex CRM
 * Gọi khi server nhận webhook và forward đến app qua WebSocket/Push
 */
export async function handleCrmWebhook(
  payload: {
    event: string;
    data: Record<string, any>;
    timestamp: string;
  },
  deviceTokens?: string[]
): Promise<void> {
  console.log('[PerfexNotifications] Webhook received:', payload.event);
  
  const notification = webhookToNotification(payload);
  
  if (notification && deviceTokens && deviceTokens.length > 0) {
    // Gửi push notification đến các thiết bị
    await PushNotificationService.broadcastSystem(
      deviceTokens,
      getNotificationTitle(notification),
      notification.message,
      {
        type: 'perfex_crm',
        notificationType: notification.type,
        link: notification.link,
        ...notification.data,
      }
    );
  }
}

/**
 * Convert webhook payload thành PerfexNotification
 */
function webhookToNotification(
  payload: { event: string; data: Record<string, any> }
): PerfexNotification | null {
  const { event, data } = payload;
  
  const eventMap: Record<string, PerfexNotificationType> = {
    'project.created': 'project_created',
    'project.updated': 'project_updated',
    'project.status_changed': 'project_updated',
    'task.created': 'task_assigned',
    'task.assigned': 'task_assigned',
    'task.completed': 'task_completed',
    'task.comment': 'task_comment',
    'invoice.created': 'invoice_created',
    'invoice.paid': 'invoice_paid',
    'estimate.created': 'estimate_created',
    'estimate.accepted': 'estimate_accepted',
    'estimate.declined': 'estimate_declined',
    'contract.signed': 'contract_signed',
    'ticket.created': 'ticket_created',
    'ticket.reply': 'ticket_reply',
    'lead.created': 'lead_created',
    'proposal.created': 'proposal_created',
  };

  const type = eventMap[event];
  if (!type) {
    console.warn('[PerfexNotifications] Unknown webhook event:', event);
    return null;
  }

  return {
    id: data.id?.toString() || Date.now().toString(),
    type,
    title: data.title || data.name || event,
    message: data.description || data.message || '',
    data,
    isread: '0',
    date: new Date().toISOString(),
    link: data.link,
  };
}

// ==================== EXPORT SERVICE ====================

export const PerfexNotificationService = {
  // Fetch
  fetchNotifications,
  fetchNewNotifications,
  fetchActivities,
  fetchProjectUpdates,
  fetchTaskUpdates,
  
  // Actions
  markAsRead: markNotificationAsRead,
  markAllAsRead: markAllNotificationsAsRead,
  
  // Polling
  startPolling: startNotificationPolling,
  stopPolling: stopNotificationPolling,
  isPollingActive,
  
  // Webhook
  handleWebhook: handleCrmWebhook,
  
  // Utils
  getNotificationTitle,
};

export default PerfexNotificationService;
