/**
 * Notifications API Service
 * Backend: https://baotienweb.cloud/api/v1/notifications
 * 
 * This service handles backend API integration for notifications.
 * For local push notifications, use services/notifications.ts
 */

import { apiFetch } from './api';

const NOTIFICATIONS_BASE = '/notifications';

// ============================================================================
// TypeScript Types
// ============================================================================

export type NotificationType = 'PUSH' | 'EMAIL' | 'SMS' | 'IN_APP';
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type Notification = {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string; // Mapped from DB 'body' field
  read: boolean;   // Mapped from DB 'isRead' field
  priority: NotificationPriority;
  createdAt: Date;
  updatedAt?: Date;
};

export type NotificationFilters = {
  page?: number;
  limit?: number;
  type?: NotificationType;
  priority?: NotificationPriority;
  isRead?: boolean;
};

export type NotificationsResponse = {
  data: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages?: number;
  };
};

export type UnreadCountResponse = {
  count: number;
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get user notifications (paginated)
 * GET /notifications
 * 
 * @param filters - Optional filters for pagination and filtering
 * @returns Paginated list of notifications
 * 
 * @example
 * const response = await getNotifications({ page: 1, limit: 20, isRead: false });
 */
export const getNotifications = async (
  filters?: NotificationFilters
): Promise<NotificationsResponse> => {
  const params = new URLSearchParams();
  
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.type) params.append('type', filters.type);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.isRead !== undefined) params.append('isRead', filters.isRead.toString());
  
  const query = params.toString();
  const url = `${NOTIFICATIONS_BASE}${query ? `?${query}` : ''}`;
  
  return apiFetch<NotificationsResponse>(url);
};

/**
 * Get unread notification count
 * GET /notifications/unread-count
 * 
 * @returns Count of unread notifications
 * 
 * @example
 * const { count } = await getUnreadCount();
 */
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  return apiFetch<UnreadCountResponse>(`${NOTIFICATIONS_BASE}/unread-count`);
};

/**
 * Mark single notification as read
 * PATCH /notifications/:id/read
 * 
 * @param id - Notification ID
 * @returns Updated notification
 * 
 * @example
 * const notification = await markNotificationRead(123);
 */
export const markNotificationRead = async (id: number): Promise<Notification> => {
  return apiFetch<Notification>(`${NOTIFICATIONS_BASE}/${id}/read`, {
    method: 'PATCH',
  });
};

/**
 * Mark all notifications as read
 * PATCH /notifications/read-all
 * 
 * @returns Count of notifications marked as read
 * 
 * @example
 * const { count } = await markAllNotificationsRead();
 */
export const markAllNotificationsRead = async (): Promise<{ count: number }> => {
  return apiFetch<{ count: number }>(`${NOTIFICATIONS_BASE}/read-all`, {
    method: 'PATCH',
  });
};

/**
 * Delete/archive a notification
 * PATCH /notifications/:id/archive
 * 
 * @param id - Notification ID
 * 
 * @example
 * await archiveNotification(123);
 */
export const archiveNotification = async (id: number): Promise<void> => {
  await apiFetch<void>(`${NOTIFICATIONS_BASE}/${id}/archive`, {
    method: 'PATCH',
  });
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get only unread notifications
 * Convenience wrapper around getNotifications
 */
export const getUnreadNotifications = async (
  page: number = 1,
  limit: number = 20
): Promise<NotificationsResponse> => {
  return getNotifications({
    page,
    limit,
    isRead: false,
  });
};

/**
 * Get notifications by type
 * Convenience wrapper around getNotifications
 */
export const getNotificationsByType = async (
  type: NotificationType,
  page: number = 1,
  limit: number = 20
): Promise<NotificationsResponse> => {
  return getNotifications({
    page,
    limit,
    type,
  });
};

/**
 * Get notifications by priority
 * Convenience wrapper around getNotifications
 */
export const getNotificationsByPriority = async (
  priority: NotificationPriority,
  page: number = 1,
  limit: number = 20
): Promise<NotificationsResponse> => {
  return getNotifications({
    page,
    limit,
    priority,
  });
};
