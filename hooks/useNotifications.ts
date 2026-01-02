import { useCallback, useEffect, useState } from 'react';
import notificationsApi, { Notification } from '../services/api/notificationsApi';
import { cache, CacheTTL } from '../utils/cache';
import { getOfflineData, saveOfflineData } from '../utils/offlineStorage';
import { useNetworkStatus } from './useNetworkStatus';

/**
 * Hook to fetch and manage notifications from backend API
 * Uses real API endpoints: GET /notifications (protected)
 * 
 * Features:
 * - Fetch all notifications
 * - Track unread count
 * - Mark as read functionality
 * - Mark all as read
 * - Real-time updates via WebSocket (subscribe to 'notification:new' event)
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isOffline } = useNetworkStatus();

  const fetchNotifications = useCallback(async (isRetry = false) => {
    const CACHE_KEY = 'notifications:all';
    const OFFLINE_KEY = 'notifications_offline';
    
    try {
      // If offline, use offline storage
      if (isOffline) {
        console.log('[useNotifications] Device offline, using offline storage');
        const offlineData = await getOfflineData<Notification[]>(OFFLINE_KEY);
        if (offlineData) {
          setNotifications(offlineData);
          const unread = offlineData.filter(n => !n.isRead).length;
          setUnreadCount(unread);
          setLoading(false);
          setError(null);
          return;
        }
        // No offline data available - show empty state instead of error
        console.log('[useNotifications] No offline data, showing empty state');
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        setError(null);
        return;
      }
      
      // Try cache first (unless retrying)
      if (!isRetry) {
        const cachedData = cache.get<Notification[]>(CACHE_KEY);
        if (cachedData) {
          console.log('[useNotifications] Using cached data');
          setNotifications(cachedData);
          const unread = cachedData.filter(n => !n.isRead).length;
          setUnreadCount(unread);
          setLoading(false);
          setError(null);
          
          // Background refresh
          notificationsApi.getNotifications()
            .then(response => {
              cache.set(CACHE_KEY, response.data, CacheTTL.SHORT); // Shorter TTL for notifications
              saveOfflineData(OFFLINE_KEY, response.data); // Persist for offline
              setNotifications(response.data);
              const unread = response.data.filter(n => !n.isRead).length;
              setUnreadCount(unread);
            })
            .catch(err => {
              console.error('[useNotifications] Background refresh failed:', err);
            });
          
          return;
        }
      }
      
      if (isRetry) {
        setRetrying(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await notificationsApi.getNotifications();
      
      // Cache with shorter TTL (notifications should be fresher)
      cache.set(CACHE_KEY, response.data, CacheTTL.SHORT);
      
      // Save to offline storage
      await saveOfflineData(OFFLINE_KEY, response.data);
      
      // Backend returns { data: Notification[], meta: {...} }
      setNotifications(response.data);
      
      // Calculate unread count
      const unread = response.data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load notifications');
      setError(error);
      console.error('[useNotifications] Error:', err);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  }, [isOffline]);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      
      // Decrement unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Invalidate cache to force refresh next time
      cache.invalidate('notifications:all');
    } catch (err) {
      console.error('[useNotifications] Mark as read error:', err);
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      
      // Update all notifications to read
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      // Invalidate cache
      cache.invalidate('notifications:all');
    } catch (err) {
      console.error('[useNotifications] Mark all as read error:', err);
      throw err;
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      await notificationsApi.deleteNotification(notificationId);
      
      // Update local state
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Decrement unread count if notification was unread
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Invalidate cache
      cache.invalidate('notifications:all');
    } catch (err) {
      console.error('[useNotifications] Delete error:', err);
      throw err;
    }
  }, [notifications]);

  // Add new notification from WebSocket (prepend to list)
  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    
    // Increment unread count if notification is unread
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRetry = useCallback(async () => {
    await fetchNotifications(true);
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    retrying,
    unreadCount,
    refresh: handleRetry,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification, // For WebSocket real-time updates
  };
}

// Note: Backend doesn't have GET /notifications/:id endpoint yet
// For now, we can find notification from the list
