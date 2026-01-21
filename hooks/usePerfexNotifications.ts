/**
 * usePerfexNotifications Hook
 * ===========================
 * 
 * React hook để quản lý thông báo từ Perfex CRM
 * 
 * Features:
 * - Tự động polling khi component mount
 * - Quản lý state thông báo
 * - Mark as read
 * - Badge count cho unread
 * 
 * @author AI Assistant
 * @date 14/01/2026
 */

import {
    PerfexNotification,
    PerfexNotificationService,
    PerfexNotificationType
} from '@/services/perfexNotificationService';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

// ==================== TYPES ====================

export interface UsePerfexNotificationsOptions {
  /** Tự động polling khi mount */
  autoPolling?: boolean;
  /** Khoảng thời gian polling (ms), default 60000 */
  pollingInterval?: number;
  /** Chỉ lấy thông báo chưa đọc */
  unreadOnly?: boolean;
  /** Số lượng tối đa */
  limit?: number;
  /** Dừng polling khi app ở background */
  stopOnBackground?: boolean;
}

export interface UsePerfexNotificationsReturn {
  /** Danh sách thông báo */
  notifications: PerfexNotification[];
  /** Số thông báo chưa đọc */
  unreadCount: number;
  /** Đang loading */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Polling có đang chạy không */
  isPolling: boolean;
  
  // Actions
  /** Refresh danh sách */
  refresh: () => Promise<void>;
  /** Đánh dấu đã đọc */
  markAsRead: (id: string) => Promise<void>;
  /** Đánh dấu tất cả đã đọc */
  markAllAsRead: () => Promise<void>;
  /** Bắt đầu polling */
  startPolling: () => void;
  /** Dừng polling */
  stopPolling: () => void;
  /** Lọc theo type */
  filterByType: (type: PerfexNotificationType | null) => void;
}

// ==================== HOOK ====================

export function usePerfexNotifications(
  options: UsePerfexNotificationsOptions = {}
): UsePerfexNotificationsReturn {
  const {
    autoPolling = true,
    pollingInterval = 60000,
    unreadOnly = false,
    limit = 50,
    stopOnBackground = true,
  } = options;

  // State
  const [notifications, setNotifications] = useState<PerfexNotification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<PerfexNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [typeFilter, setTypeFilter] = useState<PerfexNotificationType | null>(null);

  // Refs
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // ==================== COMPUTED ====================

  const unreadCount = notifications.filter(n => n.isread === '0').length;

  // ==================== FETCH ====================

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await PerfexNotificationService.fetchNotifications({
        unreadOnly,
        limit,
      });

      setNotifications(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải thông báo';
      setError(message);
      console.error('[usePerfexNotifications] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [unreadOnly, limit]);

  // ==================== ACTIONS ====================

  const refresh = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const success = await PerfexNotificationService.markAsRead(id);
      if (success) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, isread: '1' } : n)
        );
      }
    } catch (err) {
      console.error('[usePerfexNotifications] Mark as read error:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const success = await PerfexNotificationService.markAllAsRead();
      if (success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, isread: '1' }))
        );
      }
    } catch (err) {
      console.error('[usePerfexNotifications] Mark all as read error:', err);
    }
  }, []);

  const filterByType = useCallback((type: PerfexNotificationType | null) => {
    setTypeFilter(type);
  }, []);

  // ==================== POLLING ====================

  const handleNewNotifications = useCallback((newNotifications: PerfexNotification[]) => {
    setNotifications(prev => {
      // Merge new notifications at the beginning
      const existingIds = new Set(prev.map(n => n.id));
      const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id));
      return [...uniqueNew, ...prev];
    });
  }, []);

  const startPolling = useCallback(() => {
    if (isPolling) return;
    
    setIsPolling(true);
    PerfexNotificationService.startPolling(handleNewNotifications, pollingInterval);
  }, [isPolling, handleNewNotifications, pollingInterval]);

  const stopPolling = useCallback(() => {
    PerfexNotificationService.stopPolling();
    setIsPolling(false);
  }, []);

  // ==================== EFFECTS ====================

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Auto polling
  useEffect(() => {
    if (autoPolling) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [autoPolling]);

  // Handle app state changes
  useEffect(() => {
    if (!stopOnBackground) return;

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        // App going to background
        if (isPolling) {
          stopPolling();
        }
      } else if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App coming to foreground
        if (autoPolling && !isPolling) {
          startPolling();
          refresh(); // Also refresh on foreground
        }
      }

      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [stopOnBackground, autoPolling, isPolling, startPolling, stopPolling, refresh]);

  // Apply type filter
  useEffect(() => {
    if (typeFilter) {
      setFilteredNotifications(notifications.filter(n => n.type === typeFilter));
    } else {
      setFilteredNotifications(notifications);
    }
  }, [notifications, typeFilter]);

  // ==================== RETURN ====================

  return {
    notifications: filteredNotifications,
    unreadCount,
    loading,
    error,
    isPolling,
    refresh,
    markAsRead,
    markAllAsRead,
    startPolling,
    stopPolling,
    filterByType,
  };
}

export default usePerfexNotifications;
