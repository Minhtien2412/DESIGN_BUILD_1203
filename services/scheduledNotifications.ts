import { getItem, setItem } from '@/utils/storage';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Platform } from 'react-native';

// Conditionally import expo-notifications to avoid issues in Expo Go
const isExpoGo = Platform.OS !== 'web' && Constants.appOwnership === 'expo';

let Notifications: typeof import("expo-notifications") | null = null;

if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
  } catch (error) {
    console.log('[scheduledNotifications] expo-notifications not available:', error);
  }
}

export interface ScheduledNotification {
  id: string;
  title: string;
  body?: string;
  type: 'reminder' | 'appointment' | 'deadline' | 'follow-up' | 'custom';
  scheduledTime: number; // timestamp
  createdAt: number;
  status: 'pending' | 'sent' | 'cancelled';
  
  // Advanced scheduling options
  repeat?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  repeatUntil?: number; // timestamp
  
  // Action data
  route?: string;
  params?: Record<string, string>;
  actionLabel?: string; // e.g., "Open Project", "Call Client"
  
  // Metadata
  category?: string; // e.g., "work", "personal", "project"
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  createdBy?: string; // user ID
}

const SCHEDULED_KEY = 'scheduled_notifications';

// Load all scheduled notifications
export async function loadScheduledNotifications(): Promise<ScheduledNotification[]> {
  try {
    const stored = await getItem(SCHEDULED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to load scheduled notifications:', error);
    return [];
  }
}

// Persist scheduled notifications
export async function persistScheduledNotifications(notifications: ScheduledNotification[]): Promise<void> {
  try {
    await setItem(SCHEDULED_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Failed to persist scheduled notifications:', error);
  }
}

// Create a new scheduled notification
export async function createScheduledNotification(
  data: Omit<ScheduledNotification, 'id' | 'createdAt' | 'status'>
): Promise<string> {
  const notification: ScheduledNotification = {
    ...data,
    id: `sched_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    status: 'pending',
  };

  // Schedule with Expo Notifications (skip in Expo Go)
  if (!isExpoGo && Notifications) {
    try {
      const trigger = {
        seconds: Math.max(1, Math.floor((data.scheduledTime - Date.now()) / 1000)),
      };

      await Notifications.scheduleNotificationAsync({
        identifier: notification.id,
        content: {
          title: data.title,
          body: data.body || undefined,
          data: {
            scheduledId: notification.id,
            type: data.type,
            route: data.route,
            params: data.params,
            priority: data.priority,
          },
        },
        trigger: trigger as any,
      });
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      throw new Error('Không thể tạo thông báo theo lịch');
    }
  } else {
    console.log('[scheduledNotifications] Skipping notification scheduling in Expo Go:', notification.id);
  }

  // Add to storage (always persist, even in Expo Go)
  const existing = await loadScheduledNotifications();
  existing.push(notification);
  await persistScheduledNotifications(existing);

  console.log('Scheduled notification created:', notification.id);
  return notification.id;
}

// Cancel a scheduled notification
export async function cancelScheduledNotification(id: string): Promise<void> {
  try {
    // Cancel from Expo Notifications (skip in Expo Go)
    if (!isExpoGo && Notifications) {
      await Notifications.cancelScheduledNotificationAsync(id);
    } else {
      console.log('[scheduledNotifications] Skipping notification cancellation in Expo Go or when notifications unavailable:', id);
    }

    // Update storage
    const notifications = await loadScheduledNotifications();
    const updated = notifications.map(n => 
      n.id === id ? { ...n, status: 'cancelled' as const } : n
    );
    await persistScheduledNotifications(updated);

    console.log('Cancelled scheduled notification:', id);
  } catch (error) {
    console.error('Failed to cancel scheduled notification:', error);
    throw new Error('Không thể hủy thông báo');
  }
}

// Update scheduled notification
export async function updateScheduledNotification(
  id: string,
  updates: Partial<Omit<ScheduledNotification, 'id' | 'createdAt'>>
): Promise<void> {
  const notifications = await loadScheduledNotifications();
  const index = notifications.findIndex(n => n.id === id);
  
  if (index === -1) {
    throw new Error('Không tìm thấy thông báo');
  }

  const existing = notifications[index];
  const updated = { ...existing, ...updates };

  // If time changed, need to reschedule
  if (updates.scheduledTime && updates.scheduledTime !== existing.scheduledTime) {
    if (!isExpoGo && Notifications) {
      try {
        await Notifications.cancelScheduledNotificationAsync(id);
        
        const trigger = {
          seconds: Math.max(1, Math.floor((updates.scheduledTime - Date.now()) / 1000)),
        };

        await Notifications.scheduleNotificationAsync({
          identifier: id,
          content: {
            title: updated.title,
            body: updated.body || undefined,
            data: {
              scheduledId: id,
              type: updated.type,
              route: updated.route,
              params: updated.params,
              priority: updated.priority,
            },
          },
          trigger: trigger as any,
        });
      } catch (error) {
        console.error('Failed to reschedule notification:', error);
        throw new Error('Không thể cập nhật lịch thông báo');
      }
    } else {
      console.log('[scheduledNotifications] Skipping notification rescheduling in Expo Go:', id);
    }
  }

  notifications[index] = updated;
  await persistScheduledNotifications(notifications);
}

// Get upcoming notifications (next 7 days)
export async function getUpcomingNotifications(): Promise<ScheduledNotification[]> {
  const notifications = await loadScheduledNotifications();
  const now = Date.now();
  const sevenDaysFromNow = now + (7 * 24 * 60 * 60 * 1000);

  return notifications
    .filter(n => 
      n.status === 'pending' && 
      n.scheduledTime > now && 
      n.scheduledTime <= sevenDaysFromNow
    )
    .sort((a, b) => a.scheduledTime - b.scheduledTime);
}

// Get overdue notifications
export async function getOverdueNotifications(): Promise<ScheduledNotification[]> {
  const notifications = await loadScheduledNotifications();
  const now = Date.now();

  return notifications
    .filter(n => n.status === 'pending' && n.scheduledTime < now)
    .sort((a, b) => a.scheduledTime - b.scheduledTime);
}

// Cleanup old notifications (older than 30 days)
export async function cleanupOldScheduledNotifications(): Promise<void> {
  const notifications = await loadScheduledNotifications();
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

  const filtered = notifications.filter(n => 
    n.createdAt > thirtyDaysAgo || n.status === 'pending'
  );

  if (filtered.length !== notifications.length) {
    await persistScheduledNotifications(filtered);
    console.log('Cleaned up old scheduled notifications');
  }
}

// Quick scheduling helpers
export async function scheduleReminder(
  title: string,
  body: string,
  minutesFromNow: number,
  category?: string
): Promise<string> {
  return createScheduledNotification({
    title,
    body,
    type: 'reminder',
    scheduledTime: Date.now() + (minutesFromNow * 60 * 1000),
    category,
    priority: 'normal',
  });
}

export async function scheduleDeadline(
  title: string,
  body: string,
  deadline: number,
  route?: string
): Promise<string> {
  return createScheduledNotification({
    title,
    body,
    type: 'deadline',
    scheduledTime: deadline,
    route,
    priority: 'high',
    actionLabel: 'Xem chi tiết',
  });
}

export async function scheduleAppointment(
  title: string,
  body: string,
  appointmentTime: number,
  route?: string
): Promise<string> {
  return createScheduledNotification({
    title,
    body,
    type: 'appointment',
    scheduledTime: appointmentTime - (15 * 60 * 1000), // 15 minutes before
    route,
    priority: 'high',
    actionLabel: 'Tham gia',
  });
}

// Handle scheduled notification tap (call from push notification handler)
export async function handleScheduledNotificationTap(scheduledId: string, route?: string): Promise<void> {
  try {
    // Mark as sent
    const notifications = await loadScheduledNotifications();
    const updated = notifications.map(n => 
      n.id === scheduledId ? { ...n, status: 'sent' as const } : n
    );
    await persistScheduledNotifications(updated);

    // Navigate if route provided
    if (route) {
      router.push(route as any);
    }
  } catch (error) {
    console.error('Failed to handle scheduled notification tap:', error);
  }
}
