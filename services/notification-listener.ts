/**
 * Notification Polling Service
 * 
 * Provides real-time notification updates via polling (fallback when WebSocket unavailable).
 * Integrates with Expo Notifications for badge count and local push notifications.
 * 
 * @module services/notification-listener
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { presentLocalNotification } from './notifications';
import { Notification as BackendNotification, getNotifications, getUnreadCount } from './notifications-api';

/**
 * Safely set badge count with error handling for web platform
 * Prevents crashes from badgin library on web
 */
async function safeSetBadgeCount(count: number): Promise<void> {
  try {
    // Skip on web - badgin has issues with DOM title manipulation
    if (Platform.OS === 'web') {
      console.log('[Badge] Skipping badge on web platform');
      return;
    }
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.warn('[Badge] Failed to set badge count:', error);
  }
}

// Polling state
let pollingInterval: ReturnType<typeof setInterval> | null = null;
let lastUnreadCount = 0;
let isPollingActive = false;

// Callback for new notifications
type NotificationCallback = (notification: BackendNotification) => void;
let notificationCallbacks: NotificationCallback[] = [];

/**
 * Register a callback to be called when new notifications arrive
 * 
 * @param callback - Function to call with new notification
 * @returns Cleanup function to unregister the callback
 * 
 * @example
 * const cleanup = onNewNotification((notification) => {
 *   console.log('New notification:', notification.title);
 * });
 * // Later: cleanup();
 */
export function onNewNotification(callback: NotificationCallback): () => void {
  notificationCallbacks.push(callback);
  
  return () => {
    notificationCallbacks = notificationCallbacks.filter(cb => cb !== callback);
  };
}

/**
 * Start polling for new notifications
 * 
 * - Polls backend every 30 seconds
 * - Updates app badge count
 * - Shows local push notification for new items
 * - Calls registered callbacks with new notifications
 * 
 * @example
 * await startNotificationPolling();
 * // Polling now active - will check every 30s
 */
export async function startNotificationPolling(): Promise<void> {
  if (isPollingActive) {
    console.log('[Polling] Already active, skipping duplicate start');
    return;
  }

  console.log('[Polling] Starting notification polling...');
  isPollingActive = true;

  // Initial fetch to establish baseline
  try {
    const { count } = await getUnreadCount();
    lastUnreadCount = count;
    await safeSetBadgeCount(count);
    console.log('[Polling] Initial unread count:', count);
  } catch (error) {
    console.error('[Polling] Initial fetch failed:', error);
    lastUnreadCount = 0;
  }

  // Poll every 30 seconds
  pollingInterval = setInterval(async () => {
    try {
      const { count } = await getUnreadCount();
      
      // New notification(s) detected
      if (count > lastUnreadCount) {
        const delta = count - lastUnreadCount;
        console.log('[Polling] New notifications detected:', delta);
        
        // Fetch latest unread notifications
        try {
          const response = await getNotifications({ 
            page: 1, 
            limit: delta, // Fetch exactly the new ones
            isRead: false 
          });
          
          // Show local push for each new notification
          for (const notification of response.data) {
            // Determine if app is in foreground
            const appState = await Notifications.getLastNotificationResponseAsync();
            const isAppActive = appState === null; // null = app in foreground, no interaction
            
            // Present local notification
            await presentLocalNotification(
              {
                title: notification.title,
                body: notification.message,
                data: { 
                  notificationId: notification.id,
                  type: notification.type,
                  priority: notification.priority,
                },
              },
              isAppActive
            );
            
            // Notify callbacks
            notificationCallbacks.forEach(callback => {
              try {
                callback(notification);
              } catch (err) {
                console.error('[Polling] Callback error:', err);
              }
            });
          }
        } catch (fetchError) {
          console.error('[Polling] Failed to fetch new notifications:', fetchError);
        }
      }
      
      // Update badge count
      lastUnreadCount = count;
      await safeSetBadgeCount(count);
      
    } catch (error) {
      console.error('[Polling] Error during poll cycle:', error);
    }
  }, 30000); // 30 seconds

  console.log('[Polling] Started successfully (30s interval)');
}

/**
 * Stop notification polling
 * 
 * Clears the polling interval and resets state.
 * Safe to call multiple times.
 * 
 * @example
 * stopNotificationPolling();
 */
export function stopNotificationPolling(): void {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    isPollingActive = false;
    console.log('[Polling] Stopped');
  }
}

/**
 * Check if polling is currently active
 * 
 * @returns true if polling is running
 */
export function isPolling(): boolean {
  return isPollingActive;
}

/**
 * Force an immediate poll check (outside regular interval)
 * 
 * Useful after user actions like marking all as read.
 * 
 * @example
 * await forcePollingCheck();
 */
export async function forcePollingCheck(): Promise<void> {
  if (!isPollingActive) {
    console.warn('[Polling] Not active, cannot force check');
    return;
  }

  try {
    const { count } = await getUnreadCount();
    lastUnreadCount = count;
    await safeSetBadgeCount(count);
    console.log('[Polling] Forced check complete, count:', count);
  } catch (error) {
    console.error('[Polling] Force check failed:', error);
  }
}
