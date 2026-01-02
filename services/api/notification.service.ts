/**
 * Notification Service
 * Smart notifications for deadlines, inspections, low stock, safety alerts
 */

import { BaseApiService } from './base.service';
import type { ApiResponse, PaginatedResponse } from './types';

// ==================== TYPES ====================

export type NotificationType =
  | 'TASK_DEADLINE'
  | 'INSPECTION_DUE'
  | 'MATERIAL_LOW_STOCK'
  | 'MATERIAL_REQUEST'
  | 'SAFETY_ALERT'
  | 'SAFETY_INCIDENT'
  | 'DOCUMENT_APPROVAL'
  | 'BUDGET_ALERT'
  | 'PAYMENT_DUE'
  | 'MEETING_REMINDER'
  | 'MILESTONE_COMPLETE'
  | 'PROJECT_UPDATE'
  | 'TEAM_MENTION'
  | 'SYSTEM';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH';

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, any>;
  actionUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationPreferences {
  userId: number;
  enableInApp: boolean;
  enableEmail: boolean;
  enableSms: boolean;
  enablePush: boolean;
  dailyDigest: boolean;
  digestTime?: string; // "08:00" format
  channels: NotificationChannelPreferences[];
  updatedAt: string;
}

export interface NotificationChannelPreferences {
  type: NotificationType;
  inApp: boolean;
  email: boolean;
  sms: boolean;
  push: boolean;
  priority: NotificationPriority;
}

export interface NotificationRule {
  id: number;
  projectId?: number;
  type: NotificationType;
  condition: NotificationCondition;
  channels: NotificationChannel[];
  recipients: number[];
  isActive: boolean;
  createdBy: number;
  createdAt: string;
}

export interface NotificationCondition {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'LESS_THAN' | 'GREATER_THAN' | 'CONTAINS';
  value: any;
}

export interface NotificationTemplate {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  variables: string[];
  isDefault: boolean;
}

export interface DailyDigest {
  userId: number;
  date: string;
  summary: {
    totalNotifications: number;
    byType: Record<NotificationType, number>;
    urgent: Notification[];
    tasks: TaskDigest[];
    inspections: InspectionDigest[];
    materials: MaterialDigest[];
    safety: SafetyDigest[];
  };
}

export interface TaskDigest {
  taskId: number;
  taskName: string;
  dueDate: string;
  daysUntilDue: number;
  status: string;
}

export interface InspectionDigest {
  inspectionId: number;
  inspectionName: string;
  dueDate: string;
  location: string;
  status: string;
}

export interface MaterialDigest {
  materialId: number;
  materialName: string;
  currentStock: number;
  minStock: number;
  unit: string;
}

export interface SafetyDigest {
  incidentId: number;
  type: string;
  severity: string;
  location: string;
  reportedAt: string;
}

export interface SendNotificationData {
  userId: number;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, any>;
  actionUrl?: string;
  channels?: NotificationChannel[];
  expiresAt?: string;
}

export interface BulkSendNotificationData {
  userIds: number[];
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, any>;
  actionUrl?: string;
  channels?: NotificationChannel[];
}

export interface UpdatePreferencesData {
  enableInApp?: boolean;
  enableEmail?: boolean;
  enableSms?: boolean;
  enablePush?: boolean;
  dailyDigest?: boolean;
  digestTime?: string;
  channels?: NotificationChannelPreferences[];
}

export interface CreateRuleData {
  projectId?: number;
  type: NotificationType;
  condition: NotificationCondition;
  channels: NotificationChannel[];
  recipients: number[];
}

export interface NotificationFilters {
  userId?: number;
  type?: NotificationType;
  priority?: NotificationPriority;
  isRead?: boolean;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// ==================== SERVICE ====================

class NotificationService extends BaseApiService {
  constructor() {
    super('Notification', {
      retry: {
        maxRetries: 2,
        baseDelay: 500,
        maxDelay: 5000,
      },
      cache: {
        enabled: false, // Real-time notifications, no caching
      },
      offlineSupport: true,
    });
  }

  // ==================== NOTIFICATIONS ====================

  /**
   * Get user notifications
   */
  async getNotifications(filters?: NotificationFilters): Promise<PaginatedResponse<Notification>> {
    return this.get<PaginatedResponse<Notification>>('/notifications', filters as any);
  }

  /**
   * Get unread notifications
   */
  async getUnreadNotifications(userId: number): Promise<ApiResponse<Notification[]>> {
    return this.get<ApiResponse<Notification[]>>('/notifications/unread', { userId });
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: number): Promise<ApiResponse<{ count: number; byType: Record<NotificationType, number> }>> {
    return this.get<ApiResponse<any>>('/notifications/unread-count', { userId });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: number): Promise<ApiResponse<Notification>> {
    return this.put<ApiResponse<Notification>>(`/notifications/${id}/read`, undefined, {
      offlineQueue: true,
    });
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(userId: number): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>('/notifications/mark-all-read', { userId }, {
      offlineQueue: true,
    });
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: number): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/notifications/${id}`, {
      offlineQueue: true,
    });
  }

  /**
   * Delete all read notifications
   */
  async deleteAllRead(userId: number): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>('/notifications/read', {
      offlineQueue: true,
    });
  }

  // ==================== SENDING ====================

  /**
   * Send notification
   */
  async sendNotification(data: SendNotificationData): Promise<ApiResponse<Notification>> {
    return this.post<ApiResponse<Notification>>('/notifications', data, {
      offlineQueue: true,
    });
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(data: BulkSendNotificationData): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>('/notifications/bulk', data, {
      offlineQueue: true,
    });
  }

  /**
   * Send task deadline notification
   */
  async notifyTaskDeadline(taskId: number, daysUntil: number): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>('/notifications/task-deadline', {
      taskId,
      daysUntil,
    }, {
      offlineQueue: true,
    });
  }

  /**
   * Send inspection due notification
   */
  async notifyInspectionDue(inspectionId: number, daysUntil: number): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>('/notifications/inspection-due', {
      inspectionId,
      daysUntil,
    }, {
      offlineQueue: true,
    });
  }

  /**
   * Send low stock alert
   */
  async notifyLowStock(materialId: number, currentStock: number, minStock: number): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>('/notifications/low-stock', {
      materialId,
      currentStock,
      minStock,
    }, {
      offlineQueue: true,
    });
  }

  /**
   * Send safety alert
   */
  async notifySafetyAlert(
    projectId: number,
    alertType: string,
    message: string,
    priority: NotificationPriority = 'URGENT'
  ): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>('/notifications/safety-alert', {
      projectId,
      alertType,
      message,
      priority,
    }, {
      offlineQueue: true,
    });
  }

  /**
   * Send budget alert
   */
  async notifyBudgetAlert(
    budgetId: number,
    alertType: 'OVERSPEND' | 'THRESHOLD' | 'FORECAST',
    amount: number,
    threshold?: number
  ): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>('/notifications/budget-alert', {
      budgetId,
      alertType,
      amount,
      threshold,
    }, {
      offlineQueue: true,
    });
  }

  /**
   * Send payment due reminder
   */
  async notifyPaymentDue(
    invoiceId: number,
    amount: number,
    dueDate: string,
    daysUntil: number
  ): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>('/notifications/payment-due', {
      invoiceId,
      amount,
      dueDate,
      daysUntil,
    }, {
      offlineQueue: true,
    });
  }

  /**
   * Send meeting reminder
   */
  async notifyMeetingReminder(
    meetingId: number,
    title: string,
    startTime: string,
    minutesUntil: number
  ): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>('/notifications/meeting-reminder', {
      meetingId,
      title,
      startTime,
      minutesUntil,
    }, {
      offlineQueue: true,
    });
  }

  // ==================== PREFERENCES ====================

  /**
   * Get user notification preferences
   */
  async getPreferences(userId: number): Promise<ApiResponse<NotificationPreferences>> {
    return this.get<ApiResponse<NotificationPreferences>>(`/notifications/preferences/${userId}`, undefined, {
      cache: true,
    });
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(userId: number, data: UpdatePreferencesData): Promise<ApiResponse<NotificationPreferences>> {
    const result = await this.put<ApiResponse<NotificationPreferences>>(
      `/notifications/preferences/${userId}`,
      data,
      { offlineQueue: true }
    );

    await this.invalidateCache(`/notifications/preferences/${userId}`);

    return result;
  }

  /**
   * Update channel preferences for notification type
   */
  async updateChannelPreferences(
    userId: number,
    type: NotificationType,
    channels: Partial<NotificationChannelPreferences>
  ): Promise<ApiResponse<NotificationPreferences>> {
    const result = await this.put<ApiResponse<NotificationPreferences>>(
      `/notifications/preferences/${userId}/channels/${type}`,
      channels,
      { offlineQueue: true }
    );

    await this.invalidateCache(`/notifications/preferences/${userId}`);

    return result;
  }

  // ==================== RULES ====================

  /**
   * Get notification rules
   */
  async getRules(projectId?: number): Promise<ApiResponse<NotificationRule[]>> {
    return this.get<ApiResponse<NotificationRule[]>>('/notifications/rules', { projectId }, {
      cache: true,
    });
  }

  /**
   * Create notification rule
   */
  async createRule(data: CreateRuleData): Promise<ApiResponse<NotificationRule>> {
    const result = await this.post<ApiResponse<NotificationRule>>('/notifications/rules', data, {
      offlineQueue: true,
    });

    await this.invalidateCache('/notifications/rules');

    return result;
  }

  /**
   * Update notification rule
   */
  async updateRule(id: number, data: Partial<CreateRuleData>): Promise<ApiResponse<NotificationRule>> {
    const result = await this.put<ApiResponse<NotificationRule>>(`/notifications/rules/${id}`, data, {
      offlineQueue: true,
    });

    await this.invalidateCache('/notifications/rules');

    return result;
  }

  /**
   * Delete notification rule
   */
  async deleteRule(id: number): Promise<ApiResponse<void>> {
    const result = await this.delete<ApiResponse<void>>(`/notifications/rules/${id}`, {
      offlineQueue: true,
    });

    await this.invalidateCache('/notifications/rules');

    return result;
  }

  /**
   * Toggle rule active status
   */
  async toggleRule(id: number, isActive: boolean): Promise<ApiResponse<NotificationRule>> {
    return this.put<ApiResponse<NotificationRule>>(`/notifications/rules/${id}/toggle`, {
      isActive,
    }, {
      offlineQueue: true,
    });
  }

  // ==================== TEMPLATES ====================

  /**
   * Get notification templates
   */
  async getTemplates(type?: NotificationType): Promise<ApiResponse<NotificationTemplate[]>> {
    return this.get<ApiResponse<NotificationTemplate[]>>('/notifications/templates', { type }, {
      cache: true,
    });
  }

  /**
   * Get template by ID
   */
  async getTemplate(id: number): Promise<ApiResponse<NotificationTemplate>> {
    return this.get<ApiResponse<NotificationTemplate>>(`/notifications/templates/${id}`, undefined, {
      cache: true,
    });
  }

  /**
   * Create custom template
   */
  async createTemplate(data: Omit<NotificationTemplate, 'id'>): Promise<ApiResponse<NotificationTemplate>> {
    const result = await this.post<ApiResponse<NotificationTemplate>>('/notifications/templates', data, {
      offlineQueue: true,
    });

    await this.invalidateCache('/notifications/templates');

    return result;
  }

  /**
   * Update template
   */
  async updateTemplate(id: number, data: Partial<NotificationTemplate>): Promise<ApiResponse<NotificationTemplate>> {
    const result = await this.put<ApiResponse<NotificationTemplate>>(`/notifications/templates/${id}`, data, {
      offlineQueue: true,
    });

    await this.invalidateCache('/notifications/templates');

    return result;
  }

  // ==================== DAILY DIGEST ====================

  /**
   * Get daily digest
   */
  async getDailyDigest(userId: number, date?: string): Promise<ApiResponse<DailyDigest>> {
    return this.get<ApiResponse<DailyDigest>>('/notifications/daily-digest', {
      userId,
      date,
    }, {
      cache: true,
    });
  }

  /**
   * Send daily digest
   */
  async sendDailyDigest(userId: number): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>('/notifications/daily-digest/send', { userId }, {
      offlineQueue: false, // Don't queue digest sends
    });
  }

  /**
   * Schedule daily digest
   */
  async scheduleDailyDigest(userId: number, time: string): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>('/notifications/daily-digest/schedule', {
      userId,
      time,
    }, {
      offlineQueue: true,
    });
  }

  // ==================== PUSH NOTIFICATIONS ====================

  /**
   * Register device for push notifications
   */
  async registerDevice(userId: number, deviceToken: string, platform: 'ios' | 'android'): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>('/notifications/devices', {
      userId,
      deviceToken,
      platform,
    }, {
      offlineQueue: true,
    });
  }

  /**
   * Unregister device
   */
  async unregisterDevice(deviceToken: string): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/notifications/devices/${deviceToken}`, {
      offlineQueue: true,
    });
  }

  /**
   * Test push notification
   */
  async testPushNotification(userId: number): Promise<ApiResponse<void>> {
    return this.post<ApiResponse<void>>('/notifications/test-push', { userId }, {
      offlineQueue: false,
    });
  }

  // ==================== ANALYTICS ====================

  /**
   * Get notification statistics
   */
  async getStatistics(userId: number, dateFrom?: string, dateTo?: string): Promise<ApiResponse<{
    total: number;
    read: number;
    unread: number;
    byType: Record<NotificationType, number>;
    byPriority: Record<NotificationPriority, number>;
    responseTime: number; // average minutes to read
  }>> {
    return this.get<ApiResponse<any>>('/notifications/statistics', {
      userId,
      dateFrom,
      dateTo,
    }, {
      cache: true,
    });
  }

  /**
   * Get engagement metrics
   */
  async getEngagementMetrics(projectId?: number): Promise<ApiResponse<{
    totalSent: number;
    totalRead: number;
    readRate: number;
    avgResponseTime: number;
    byChannel: Record<NotificationChannel, { sent: number; delivered: number; read: number }>;
  }>> {
    return this.get<ApiResponse<any>>('/notifications/engagement', { projectId }, {
      cache: true,
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
