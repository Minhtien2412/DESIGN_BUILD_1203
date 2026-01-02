/**
 * Notifications API Client
 * Backend: https://baotienweb.cloud/api/v1/notifications
 */

import { getItem } from '@/utils/storage';
import ENV from '../../config/env';
import { apiFetch } from '../api';

const BASE_URL = `${ENV.API_BASE_URL}/notifications`;

// ==================== TYPES ====================

export interface Notification {
  id: number;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'TASK' | 'MESSAGE' | 'PAYMENT';
  title: string;
  message: string;
  isRead: boolean;
  userId: number;
  relatedId?: number | null;
  relatedType?: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  data: Notification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MarkAsReadDto {
  notificationIds: number[];
}

// ==================== AUTH HELPER ====================

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// ==================== API METHODS ====================

/**
 * Get all notifications for current user
 * Endpoint: GET /notifications
 */
export async function getNotifications(page = 1, limit = 20): Promise<NotificationListResponse> {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  return await apiFetch<NotificationListResponse>(`/notifications?${params}`);
}

/**
 * Get unread count
 * Endpoint: GET /notifications/unread-count
 */
export async function getUnreadCount(): Promise<{ count: number }> {
  return await apiFetch<{ count: number }>('/notifications/unread-count');
}

/**
 * Mark notification as read
 * Endpoint: PATCH /notifications/:id/read
 */
export async function markAsRead(id: number): Promise<void> {
  await apiFetch<void>(`/notifications/${id}/read`, {
    method: 'PATCH'
  });
}

/**
 * Mark multiple notifications as read
 * Endpoint: POST /notifications/mark-read
 */
export async function markMultipleAsRead(dto: MarkAsReadDto): Promise<void> {
  await apiFetch<void>('/notifications/mark-read', {
    method: 'POST',
    body: JSON.stringify(dto)
  });
}

/**
 * Mark all notifications as read
 * Endpoint: POST /notifications/mark-all-read
 */
export async function markAllAsRead(): Promise<void> {
  await apiFetch<void>('/notifications/mark-all-read', {
    method: 'POST'
  });
}

/**
 * Delete a notification
 * Endpoint: DELETE /notifications/:id
 */
export async function deleteNotification(id: number): Promise<void> {
  await apiFetch<void>(`/notifications/${id}`, {
    method: 'DELETE'
  });
}

// ==================== EXPORTS ====================

export const notificationsApi = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markMultipleAsRead,
  markAllAsRead,
  deleteNotification
};

export default notificationsApi;
