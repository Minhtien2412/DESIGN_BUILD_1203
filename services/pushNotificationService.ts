/**
 * Push Notification Service
 * Gửi thông báo đẩy đến thiết bị qua Expo Push API hoặc FCM
 * 
 * Hỗ trợ:
 * - Expo Push Notifications (cho Expo builds)
 * - Firebase Cloud Messaging (cho standalone APK/IPA)
 * 
 * @author AI Assistant
 * @date 14/01/2026
 */

import { Platform } from 'react-native';

// =====================================================
// TYPES & INTERFACES
// =====================================================

export interface PushMessage {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
  priority?: 'default' | 'normal' | 'high';
  ttl?: number; // Time to live in seconds
  categoryId?: string;
}

export interface ExpoPushTicket {
  id?: string;
  status: 'ok' | 'error';
  message?: string;
  details?: {
    error?: 'DeviceNotRegistered' | 'InvalidCredentials' | 'MessageTooBig' | 'MessageRateExceeded';
  };
}

export interface SendResult {
  success: boolean;
  ticketId?: string;
  error?: string;
}

export interface BulkSendResult {
  totalSent: number;
  totalFailed: number;
  results: SendResult[];
}

export type NotificationType = 
  | 'system'           // Thông báo hệ thống
  | 'news'             // Tin tức mới
  | 'project_update'   // Cập nhật dự án
  | 'task_assigned'    // Được giao task
  | 'task_completed'   // Task hoàn thành
  | 'message'          // Tin nhắn mới
  | 'payment'          // Thanh toán
  | 'promotion'        // Khuyến mãi
  | 'alert';           // Cảnh báo

// =====================================================
// EXPO PUSH NOTIFICATION SERVICE
// =====================================================

const EXPO_PUSH_API = 'https://exp.host/--/api/v2/push/send';

/**
 * Gửi thông báo qua Expo Push API
 * Dành cho thiết bị đã cài app từ Expo/EAS builds
 */
export async function sendExpoPushNotification(
  expoPushToken: string,
  message: PushMessage
): Promise<SendResult> {
  try {
    // Validate Expo push token format
    if (!expoPushToken.startsWith('ExponentPushToken[') && !expoPushToken.startsWith('ExpoPushToken[')) {
      return { success: false, error: 'Invalid Expo push token format' };
    }

    const payload = {
      to: expoPushToken,
      title: message.title,
      body: message.body,
      data: message.data || {},
      sound: message.sound ?? 'default',
      badge: message.badge,
      channelId: message.channelId || 'default',
      priority: message.priority || 'high',
      ttl: message.ttl,
      categoryId: message.categoryId,
    };

    const response = await fetch(EXPO_PUSH_API, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    const ticket: ExpoPushTicket = result.data?.[0] || result;

    if (ticket.status === 'ok') {
      return { success: true, ticketId: ticket.id };
    } else {
      return { 
        success: false, 
        error: ticket.message || ticket.details?.error || 'Push failed' 
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[PushService] Expo push error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Gửi thông báo hàng loạt qua Expo Push API
 * Tối ưu: gộp tối đa 100 tokens/request
 */
export async function sendBulkExpoPushNotifications(
  tokens: string[],
  message: PushMessage
): Promise<BulkSendResult> {
  const BATCH_SIZE = 100;
  const results: SendResult[] = [];
  let totalSent = 0;
  let totalFailed = 0;

  // Chia thành các batch
  for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
    const batch = tokens.slice(i, i + BATCH_SIZE);
    
    try {
      const messages = batch.map(token => ({
        to: token,
        title: message.title,
        body: message.body,
        data: message.data || {},
        sound: message.sound ?? 'default',
        channelId: message.channelId || 'default',
        priority: message.priority || 'high',
      }));

      const response = await fetch(EXPO_PUSH_API, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      const data = await response.json();
      const tickets: ExpoPushTicket[] = data.data || [];

      tickets.forEach((ticket, index) => {
        if (ticket.status === 'ok') {
          totalSent++;
          results.push({ success: true, ticketId: ticket.id });
        } else {
          totalFailed++;
          results.push({ 
            success: false, 
            error: ticket.message || ticket.details?.error 
          });
        }
      });
    } catch (error) {
      // Đánh dấu cả batch là failed
      batch.forEach(() => {
        totalFailed++;
        results.push({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Batch failed' 
        });
      });
    }
  }

  return { totalSent, totalFailed, results };
}

// =====================================================
// FCM (FIREBASE CLOUD MESSAGING) SERVICE
// =====================================================

const FCM_API = 'https://fcm.googleapis.com/fcm/send';

/**
 * Gửi thông báo qua Firebase Cloud Messaging
 * Dành cho standalone APK/IPA builds
 * 
 * @param fcmToken - Device FCM token
 * @param message - Push message content
 * @param serverKey - FCM Server Key (từ Firebase Console)
 */
export async function sendFCMNotification(
  fcmToken: string,
  message: PushMessage,
  serverKey: string
): Promise<SendResult> {
  try {
    const payload = {
      to: fcmToken,
      notification: {
        title: message.title,
        body: message.body,
        sound: message.sound ?? 'default',
        badge: message.badge,
        click_action: message.data?.route ? 'FLUTTER_NOTIFICATION_CLICK' : undefined,
      },
      data: message.data || {},
      priority: message.priority || 'high',
      time_to_live: message.ttl || 86400, // 24 hours default
    };

    const response = await fetch(FCM_API, {
      method: 'POST',
      headers: {
        'Authorization': `key=${serverKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.success === 1) {
      return { success: true, ticketId: result.results?.[0]?.message_id };
    } else {
      return { 
        success: false, 
        error: result.results?.[0]?.error || 'FCM push failed' 
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[PushService] FCM push error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Gửi thông báo đến FCM topic
 * Tất cả thiết bị đã subscribe topic sẽ nhận được
 */
export async function sendFCMToTopic(
  topic: string,
  message: PushMessage,
  serverKey: string
): Promise<SendResult> {
  try {
    const payload = {
      to: `/topics/${topic}`,
      notification: {
        title: message.title,
        body: message.body,
        sound: message.sound ?? 'default',
      },
      data: message.data || {},
      priority: message.priority || 'high',
    };

    const response = await fetch(FCM_API, {
      method: 'POST',
      headers: {
        'Authorization': `key=${serverKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.message_id) {
      return { success: true, ticketId: result.message_id.toString() };
    } else {
      return { success: false, error: result.error || 'Topic push failed' };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[PushService] FCM topic push error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// =====================================================
// HIGH-LEVEL API
// =====================================================

/**
 * Gửi thông báo hệ thống đến tất cả thiết bị
 */
export async function broadcastSystemNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<BulkSendResult> {
  return sendBulkExpoPushNotifications(tokens, {
    title,
    body,
    data: { ...data, type: 'system' as NotificationType },
    priority: 'high',
    channelId: 'system',
  });
}

/**
 * Gửi thông báo tin tức mới
 */
export async function sendNewsNotification(
  tokens: string[],
  newsItem: {
    id: string;
    title: string;
    summary: string;
    imageUrl?: string;
  }
): Promise<BulkSendResult> {
  return sendBulkExpoPushNotifications(tokens, {
    title: '📰 ' + newsItem.title,
    body: newsItem.summary,
    data: {
      type: 'news' as NotificationType,
      newsId: newsItem.id,
      route: `/news/${newsItem.id}`,
      imageUrl: newsItem.imageUrl,
    },
    channelId: 'news',
  });
}

/**
 * Gửi thông báo cập nhật dự án
 */
export async function sendProjectUpdateNotification(
  tokens: string[],
  project: {
    id: string;
    name: string;
    update: string;
  }
): Promise<BulkSendResult> {
  return sendBulkExpoPushNotifications(tokens, {
    title: `🏗️ Cập nhật: ${project.name}`,
    body: project.update,
    data: {
      type: 'project_update' as NotificationType,
      projectId: project.id,
      route: `/projects/${project.id}`,
    },
    channelId: 'projects',
  });
}

/**
 * Gửi thông báo task được giao
 */
export async function sendTaskAssignedNotification(
  token: string,
  task: {
    id: string;
    title: string;
    assignedBy: string;
    dueDate?: string;
  }
): Promise<SendResult> {
  return sendExpoPushNotification(token, {
    title: '📋 Task mới được giao',
    body: `${task.assignedBy} đã giao cho bạn: ${task.title}`,
    data: {
      type: 'task_assigned' as NotificationType,
      taskId: task.id,
      route: `/tasks/${task.id}`,
      dueDate: task.dueDate,
    },
    priority: 'high',
    channelId: 'tasks',
  });
}

/**
 * Gửi thông báo thanh toán
 */
export async function sendPaymentNotification(
  token: string,
  payment: {
    id: string;
    amount: number;
    status: 'success' | 'pending' | 'failed';
    description?: string;
  }
): Promise<SendResult> {
  const statusEmoji = payment.status === 'success' ? '✅' : payment.status === 'pending' ? '⏳' : '❌';
  const statusText = payment.status === 'success' ? 'thành công' : payment.status === 'pending' ? 'đang xử lý' : 'thất bại';
  
  return sendExpoPushNotification(token, {
    title: `${statusEmoji} Thanh toán ${statusText}`,
    body: `${payment.description || 'Giao dịch'}: ${payment.amount.toLocaleString('vi-VN')}đ`,
    data: {
      type: 'payment' as NotificationType,
      paymentId: payment.id,
      route: `/payments/${payment.id}`,
      status: payment.status,
    },
    priority: 'high',
    channelId: 'payments',
  });
}

// =====================================================
// NOTIFICATION CHANNELS (Android)
// =====================================================

/**
 * Tạo notification channels cho Android
 * Gọi khi app khởi động (trong _layout.tsx hoặc App.tsx)
 */
export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  try {
    const Notifications = require('expo-notifications');

    const channels = [
      {
        id: 'default',
        name: 'Thông báo chung',
        importance: 3, // DEFAULT
        sound: 'default',
      },
      {
        id: 'system',
        name: 'Thông báo hệ thống',
        importance: 4, // HIGH
        sound: 'default',
      },
      {
        id: 'news',
        name: 'Tin tức',
        importance: 3,
        sound: 'default',
      },
      {
        id: 'projects',
        name: 'Cập nhật dự án',
        importance: 4,
        sound: 'default',
      },
      {
        id: 'tasks',
        name: 'Công việc',
        importance: 4,
        sound: 'default',
      },
      {
        id: 'payments',
        name: 'Thanh toán',
        importance: 4,
        sound: 'default',
      },
      {
        id: 'messages',
        name: 'Tin nhắn',
        importance: 4,
        sound: 'default',
      },
    ];

    for (const channel of channels) {
      await Notifications.setNotificationChannelAsync(channel.id, {
        name: channel.name,
        importance: channel.importance,
        sound: channel.sound,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0D9488',
      });
    }

    console.log('[PushService] Notification channels created');
  } catch (error) {
    console.warn('[PushService] Failed to create notification channels:', error);
  }
}

// =====================================================
// UTILITIES
// =====================================================

/**
 * Kiểm tra token còn hợp lệ không
 */
export function isValidExpoPushToken(token: string): boolean {
  return token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken[');
}

/**
 * Kiểm tra FCM token
 */
export function isValidFCMToken(token: string): boolean {
  // FCM tokens thường dài ~163 ký tự
  return token.length > 100 && !token.includes('[');
}

/**
 * Lọc các token không hợp lệ
 */
export function filterValidTokens(tokens: string[]): {
  expoTokens: string[];
  fcmTokens: string[];
} {
  const expoTokens: string[] = [];
  const fcmTokens: string[] = [];

  for (const token of tokens) {
    if (isValidExpoPushToken(token)) {
      expoTokens.push(token);
    } else if (isValidFCMToken(token)) {
      fcmTokens.push(token);
    }
  }

  return { expoTokens, fcmTokens };
}

// Export singleton cho tiện dùng
export const PushNotificationService = {
  // Expo
  sendExpoPush: sendExpoPushNotification,
  sendBulkExpoPush: sendBulkExpoPushNotifications,
  
  // FCM
  sendFCM: sendFCMNotification,
  sendFCMTopic: sendFCMToTopic,
  
  // High-level
  broadcastSystem: broadcastSystemNotification,
  sendNews: sendNewsNotification,
  sendProjectUpdate: sendProjectUpdateNotification,
  sendTaskAssigned: sendTaskAssignedNotification,
  sendPayment: sendPaymentNotification,
  
  // Setup
  setupChannels: setupNotificationChannels,
  
  // Utils
  isValidExpoToken: isValidExpoPushToken,
  isValidFCMToken: isValidFCMToken,
  filterValidTokens,
};

export default PushNotificationService;
