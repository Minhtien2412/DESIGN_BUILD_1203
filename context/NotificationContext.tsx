import { NOTIFICATION_ENDPOINTS } from '@/constants/api-endpoints';
import { apiFetch } from '@/services/api';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

// Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'message' | 'call' | 'system' | 'event' | 'live';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  category?: 'system' | 'event' | 'live' | 'message' | 'call' | 'project' | 'payment' | 'security';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  data?: any; // Additional data like user info, project info, etc.
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      console.log('[Notifications] Fetching for user:', user.id);
      
      // Use correct endpoint from backend API
      const response = await apiFetch(NOTIFICATION_ENDPOINTS.LIST);
      
      console.log('[Notifications] Fetch success:', response);
      
      if (response.success && Array.isArray(response.notifications)) {
        setNotifications(response.notifications);
        setUnreadCount(response.unread || response.notifications.filter((n: Notification) => !n.read).length);
      }
    } catch (error: any) {
      // Gracefully handle APIs where notifications are not implemented yet
      const status = error?.status ?? error?.data?.statusCode;
      if (status === 404) {
        console.warn('[Notifications] Endpoint not found (404). Using empty list.');
        setNotifications(prev => prev.length ? prev : []);
        setUnreadCount(0);
      } else {
        console.error('[Notifications] Fetch error:', error);
      }
      // On error, keep existing notifications (don't clear) unless 404 explicit empty
    } finally {
      setLoading(false);
    }
  };

  // Refresh notifications (for pull-to-refresh)
  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  // Mark single notification as read
  const markAsRead = async (id: string) => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Call backend with correct endpoint
      await apiFetch(NOTIFICATION_ENDPOINTS.MARK_READ(id), {
        method: 'POST',
      });
    } catch (error) {
      // Silently fail if backend not ready
      // console.error('[Notifications] Mark as read error:', error);
      // Revert on error
      await fetchNotifications();
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);

      // Call backend with correct endpoint
      await apiFetch(NOTIFICATION_ENDPOINTS.MARK_ALL_READ, {
        method: 'POST',
      });
    } catch (error) {
      // Silently fail if backend not ready
      // console.error('[Notifications] Mark all as read error:', error);
      // Revert on error
      await fetchNotifications();
    }
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      const notification = notifications.find(n => n.id === id);
      
      // Optimistic update
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Call backend with correct endpoint
      await apiFetch(NOTIFICATION_ENDPOINTS.DELETE(id), {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('[Notifications] Delete error:', error);
      // Revert on error
      await fetchNotifications();
    }
  };

  // Initial fetch and polling setup
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Delay initial fetch to ensure token is set in API service
    // AuthContext may still be setting the token when this effect runs
    const initialFetchTimer = setTimeout(() => {
      fetchNotifications();
    }, 100); // Small delay to let AuthContext finish setting token

    // Poll every 30 seconds
    const pollInterval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds

    // Cleanup
    return () => {
      clearTimeout(initialFetchTimer);
      clearInterval(pollInterval);
    };
  }, [user]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
