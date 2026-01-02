/**
 * Notifications Context
 * Manages push notifications state and real-time WebSocket notifications
 */
// import {
//     addNotificationReceivedListener,
//     addNotificationResponseListener,
//     getLastNotificationResponse,
//     initializePushNotifications,
//     markNotificationAsRead,
//     setBadgeCount,
// } from '@/services/pushNotifications';
import { socketManager } from '@/services/websocket/socketManager';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface AppNotification {
  id: string;
  type: 'task' | 'message' | 'project' | 'meeting' | 'alert' | 'system';
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  isConnected: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

// ============================================================================
// Context
// ============================================================================

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
}

// ============================================================================
// Provider
// ============================================================================

interface NotificationsProviderProps {
  children: React.ReactNode;
}

export function NotificationsProvider({ children }: NotificationsProviderProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Computed unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // ========================================================================
  // Initialization
  // ========================================================================

  useEffect(() => {
    initializeNotifications();
    return cleanup;
  }, []);

  const initializeNotifications = async () => {
    try {
      // Initialize push notifications (skip if not available)
      // Note: Push notifications require development build, not available in Expo Go
      // await initializePushNotifications();

      // Connect to WebSocket for real-time notifications
      await connectWebSocket();

      // Load initial notifications
      await refreshNotifications();

      // Setup listeners
      setupNotificationListeners();

      // Check for notification that opened the app
      await handleInitialNotification();
    } catch (error) {
      console.error('[NotificationsContext] Initialization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const cleanup = () => {
    socketManager.disconnect('notifications');
  };

  // ========================================================================
  // WebSocket Connection
  // ========================================================================

  const connectWebSocket = async () => {
    try {
      await socketManager.connect('notifications');
      setIsConnected(true);

      // Listen for new notifications
      socketManager.on('notifications', 'new_notification', handleNewNotification);

      // Listen for notification updates
      socketManager.on('notifications', 'notification_read', handleNotificationRead);

      console.log('[NotificationsContext] ✅ WebSocket connected');
    } catch (error) {
      console.error('[NotificationsContext] WebSocket connection failed:', error);
      setIsConnected(false);
    }
  };

  // ========================================================================
  // Notification Handlers
  // ========================================================================

  const handleNewNotification = useCallback((notification: AppNotification) => {
    console.log('[NotificationsContext] 🔔 New notification:', notification.title);
    
    setNotifications((prev) => [notification, ...prev]);
    
    // Update badge count
    const newUnreadCount = unreadCount + 1;
    setBadgeCount(newUnreadCount);
  }, [unreadCount]);

  const handleNotificationRead = useCallback((data: { notificationId: string }) => {
    console.log('[NotificationsContext] ✓ Notification marked as read:', data.notificationId);
    
    setNotifications((prev) =>
      prev.map((n) => (n.id === data.notificationId ? { ...n, read: true } : n))
    );

    // Update badge count
    const newUnreadCount = Math.max(0, unreadCount - 1);
    setBadgeCount(newUnreadCount);
  }, [unreadCount]);

  // ========================================================================
  // Push Notification Listeners
  // ========================================================================

  const setupNotificationListeners = () => {
    // Listen for notifications received while app is in foreground
    const receivedSubscription = Notifications.addNotificationReceivedListener((notification: any) => {
      console.log('[NotificationsContext] 📬 Notification received:', notification);
      // Notification already handled by WebSocket or will be loaded on refresh
    });

    // Listen for user tapping on notification
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
      console.log('[NotificationsContext] 👆 Notification tapped:', response);
      handleNotificationTap(response);
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  };

  const handleInitialNotification = async () => {
    try {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response) {
        console.log('[NotificationsContext] 🚀 App opened from notification');
        handleNotificationTap(response);
      }
    } catch (error) {
      console.warn('[NotificationsContext] Failed to get initial notification:', error);
    }
  };

  const handleNotificationTap = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data as any;
    
    // Mark as read
    if (data.id && typeof data.id === 'string') {
      markAsRead(data.id);
    }

    // Navigate based on notification type
    if (data.type === 'task' && data.taskId) {
      router.push(`/(tabs)` as any); // TODO: Add proper route
    } else if (data.type === 'message' && data.roomId) {
      router.push(`/messages/${data.roomId}` as any);
    } else if (data.type === 'project' && data.projectId) {
      router.push(`/(tabs)` as any); // TODO: Add proper route
    } else if (data.type === 'meeting' && data.meetingId) {
      router.push(`/meet/${data.meetingId}/room`);
    } else {
      router.push('/notifications');
    }
  };

  // ========================================================================
  // API Methods
  // ========================================================================

  const refreshNotifications = async () => {
    try {
      setLoading(true);
      
      // TODO: Implement notifications API endpoint on backend
      // For now, use empty array to prevent errors
      console.log('[NotificationsContext] Using mock data (API endpoint not ready)');
      setNotifications([]);

      // Update badge count
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('[NotificationsContext] Failed to refresh:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Call API to mark as read
      const response = await fetch(`https://baotienweb.cloud/api/v1/notifications/${id}/read`, {
        method: 'PUT',
      });
      const success = response.ok;
      if (success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );

        // Emit to WebSocket for other devices
        socketManager.emit('notifications', 'mark_read', { notificationId: id });

        // Update badge
        const newUnreadCount = Math.max(0, unreadCount - 1);
        await Notifications.setBadgeCountAsync(newUnreadCount);
      }
    } catch (error) {
      console.error('[NotificationsContext] Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mark all on backend
      const response = await fetch('https://baotienweb.cloud/api/v1/notifications/mark-all-read', {
        method: 'POST',
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setBadgeCount(0);
      }
    } catch (error) {
      console.error('[NotificationsContext] Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`https://baotienweb.cloud/api/v1/notifications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (error) {
      console.error('[NotificationsContext] Failed to delete:', error);
    }
  };

  const clearAll = async () => {
    try {
      const response = await fetch('https://baotienweb.cloud/api/v1/notifications', {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications([]);
        setBadgeCount(0);
      }
    } catch (error) {
      console.error('[NotificationsContext] Failed to clear all:', error);
    }
  };

  // ========================================================================
  // Context Value
  // ========================================================================

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    loading,
    isConnected,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}
