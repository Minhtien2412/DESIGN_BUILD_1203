/**
 * NotificationBadgeContext
 * =========================
 * 
 * Quản lý và đồng bộ số lượng thông báo từ nhiều nguồn:
 * - Perfex CRM (tasks, tickets, projects)
 * - Backend App (notifications, messages)
 * - Chat (unread messages)
 * 
 * Features:
 * - Tự động fetch và cập nhật badge count
 * - Real-time updates via WebSocket
 * - Offline support với cache
 * - Merge count từ tất cả nguồn
 * 
 * @author ThietKeResort Team
 * @created 2025-01-08
 */

import notificationsApi from '@/services/api/notificationsApi';
import { chatAPIService } from '@/services/chatAPIService';
import NotificationSyncService, { UnifiedNotification } from '@/services/notificationSyncService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

// ==================== TYPES ====================

export interface NotificationSource {
  id: string;
  name: string;
  count: number;
  icon: string;
  color: string;
  lastUpdated: string;
}

export interface BadgeCounts {
  total: number;
  bySource: {
    crm: number;      // Perfex CRM notifications
    app: number;      // Backend App notifications
    chat: number;     // Unread chat messages
    tasks: number;    // Task updates
    tickets: number;  // Support tickets
    projects: number; // Project updates
  };
  sources: NotificationSource[];
  lastSyncAt: string | null;
}

interface NotificationBadgeContextType {
  // Counts
  badgeCounts: BadgeCounts;
  totalUnread: number;
  
  // Actions
  refreshBadges: () => Promise<void>;
  clearSource: (sourceId: keyof BadgeCounts['bySource']) => void;
  clearAll: () => void;
  incrementSource: (sourceId: keyof BadgeCounts['bySource'], amount?: number) => void;
  decrementSource: (sourceId: keyof BadgeCounts['bySource'], amount?: number) => void;
  
  // Status
  isLoading: boolean;
  error: string | null;
  lastSync: Date | null;
}

// ==================== STORAGE KEYS ====================

const STORAGE_KEYS = {
  BADGE_COUNTS: 'notification_badge_counts',
  LAST_SYNC: 'notification_badge_last_sync',
};

// ==================== DEFAULT VALUES ====================

const DEFAULT_BADGE_COUNTS: BadgeCounts = {
  total: 0,
  bySource: {
    crm: 0,
    app: 0,
    chat: 0,
    tasks: 0,
    tickets: 0,
    projects: 0,
  },
  sources: [
    { id: 'crm', name: 'CRM', count: 0, icon: 'business', color: '#2563eb', lastUpdated: '' },
    { id: 'app', name: 'Ứng dụng', count: 0, icon: 'notifications', color: '#16a34a', lastUpdated: '' },
    { id: 'chat', name: 'Tin nhắn', count: 0, icon: 'chatbubbles', color: '#dc2626', lastUpdated: '' },
    { id: 'tasks', name: 'Công việc', count: 0, icon: 'checkbox', color: '#ea580c', lastUpdated: '' },
    { id: 'tickets', name: 'Hỗ trợ', count: 0, icon: 'ticket', color: '#7c3aed', lastUpdated: '' },
    { id: 'projects', name: 'Dự án', count: 0, icon: 'briefcase', color: '#0891b2', lastUpdated: '' },
  ],
  lastSyncAt: null,
};

// ==================== CONTEXT ====================

const NotificationBadgeContext = createContext<NotificationBadgeContextType | undefined>(undefined);

// ==================== PROVIDER ====================

export function NotificationBadgeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [badgeCounts, setBadgeCounts] = useState<BadgeCounts>(DEFAULT_BADGE_COUNTS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  // ==================== FETCH FROM SOURCES ====================

  /**
   * Lấy số thông báo từ CRM
   */
  const fetchCRMCount = useCallback(async (): Promise<{ crm: number; tasks: number; tickets: number; projects: number }> => {
    try {
      // Sử dụng NotificationSyncService để sync và lấy count
      const syncResult = await NotificationSyncService.syncAll();
      
      if (syncResult.success) {
        // Đếm theo loại
        const allNotifications = await NotificationSyncService.getAll();
        const crmNotifications = allNotifications.filter((n: UnifiedNotification) => n.source === 'CRM' && !n.isRead);
        
        const taskCount = crmNotifications.filter((n: UnifiedNotification) => n.type === 'TASK').length;
        const ticketCount = crmNotifications.filter((n: UnifiedNotification) => n.type === 'TICKET').length;
        const projectCount = crmNotifications.filter((n: UnifiedNotification) => n.type === 'PROJECT').length;
        const otherCrmCount = crmNotifications.filter((n: UnifiedNotification) => 
          !['TASK', 'TICKET', 'PROJECT'].includes(n.type)
        ).length;

        return {
          crm: otherCrmCount,
          tasks: taskCount,
          tickets: ticketCount,
          projects: projectCount,
        };
      }
      
      return { crm: 0, tasks: 0, tickets: 0, projects: 0 };
    } catch (err) {
      console.error('[BadgeContext] CRM fetch error:', err);
      return { crm: 0, tasks: 0, tickets: 0, projects: 0 };
    }
  }, []);

  /**
   * Lấy số thông báo từ Backend App
   */
  const fetchAppCount = useCallback(async (): Promise<number> => {
    try {
      const response = await notificationsApi.getNotifications();
      if (response.data) {
        return response.data.filter(n => !n.isRead).length;
      }
      return 0;
    } catch (err) {
      console.error('[BadgeContext] App notifications fetch error:', err);
      return 0;
    }
  }, []);

  /**
   * Lấy số tin nhắn chưa đọc từ Chat
   */
  const fetchChatCount = useCallback(async (): Promise<number> => {
    try {
      const chatRooms = await chatAPIService.getChatRooms();
      const unreadCount = chatRooms.reduce((total, room) => total + (room.unreadCount || 0), 0);
      return unreadCount;
    } catch (err) {
      console.error('[BadgeContext] Chat count fetch error:', err);
      return 0;
    }
  }, []);

  // ==================== MAIN REFRESH ====================

  /**
   * Refresh tất cả badge counts
   */
  const refreshBadges = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Fetch từ tất cả nguồn song song
      const [crmCounts, appCount, chatCount] = await Promise.all([
        fetchCRMCount(),
        fetchAppCount(),
        fetchChatCount(),
      ]);

      const now = new Date().toISOString();
      
      const newCounts: BadgeCounts = {
        total: crmCounts.crm + crmCounts.tasks + crmCounts.tickets + crmCounts.projects + appCount + chatCount,
        bySource: {
          crm: crmCounts.crm,
          app: appCount,
          chat: chatCount,
          tasks: crmCounts.tasks,
          tickets: crmCounts.tickets,
          projects: crmCounts.projects,
        },
        sources: [
          { id: 'crm', name: 'CRM', count: crmCounts.crm, icon: 'business', color: '#2563eb', lastUpdated: now },
          { id: 'app', name: 'Ứng dụng', count: appCount, icon: 'notifications', color: '#16a34a', lastUpdated: now },
          { id: 'chat', name: 'Tin nhắn', count: chatCount, icon: 'chatbubbles', color: '#dc2626', lastUpdated: now },
          { id: 'tasks', name: 'Công việc', count: crmCounts.tasks, icon: 'checkbox', color: '#ea580c', lastUpdated: now },
          { id: 'tickets', name: 'Hỗ trợ', count: crmCounts.tickets, icon: 'ticket', color: '#7c3aed', lastUpdated: now },
          { id: 'projects', name: 'Dự án', count: crmCounts.projects, icon: 'briefcase', color: '#0891b2', lastUpdated: now },
        ],
        lastSyncAt: now,
      };

      if (isMountedRef.current) {
        setBadgeCounts(newCounts);
        setLastSync(new Date());
        
        // Lưu vào storage
        await AsyncStorage.setItem(STORAGE_KEYS.BADGE_COUNTS, JSON.stringify(newCounts));
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, now);
      }

      console.log('[BadgeContext] Refreshed badges:', newCounts.total, 'total');
    } catch (err) {
      console.error('[BadgeContext] Refresh error:', err);
      if (isMountedRef.current) {
        setError('Không thể cập nhật thông báo');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [user?.id, fetchCRMCount, fetchAppCount, fetchChatCount]);

  // ==================== CLEAR ACTIONS ====================

  const clearSource = useCallback((sourceId: keyof BadgeCounts['bySource']) => {
    setBadgeCounts(prev => {
      const clearedCount = prev.bySource[sourceId];
      const newBySource = { ...prev.bySource, [sourceId]: 0 };
      const newSources = prev.sources.map(s => 
        s.id === sourceId ? { ...s, count: 0 } : s
      );
      
      return {
        ...prev,
        total: prev.total - clearedCount,
        bySource: newBySource,
        sources: newSources,
      };
    });
  }, []);

  const clearAll = useCallback(() => {
    setBadgeCounts({
      ...DEFAULT_BADGE_COUNTS,
      lastSyncAt: new Date().toISOString(),
    });
  }, []);

  // ==================== INCREMENT/DECREMENT ====================

  const incrementSource = useCallback((sourceId: keyof BadgeCounts['bySource'], amount = 1) => {
    setBadgeCounts(prev => {
      const newBySource = { ...prev.bySource, [sourceId]: prev.bySource[sourceId] + amount };
      const newSources = prev.sources.map(s => 
        s.id === sourceId ? { ...s, count: s.count + amount } : s
      );
      
      return {
        ...prev,
        total: prev.total + amount,
        bySource: newBySource,
        sources: newSources,
      };
    });
  }, []);

  const decrementSource = useCallback((sourceId: keyof BadgeCounts['bySource'], amount = 1) => {
    setBadgeCounts(prev => {
      const currentCount = prev.bySource[sourceId];
      const actualDecrement = Math.min(amount, currentCount);
      const newBySource = { ...prev.bySource, [sourceId]: currentCount - actualDecrement };
      const newSources = prev.sources.map(s => 
        s.id === sourceId ? { ...s, count: Math.max(0, s.count - actualDecrement) } : s
      );
      
      return {
        ...prev,
        total: Math.max(0, prev.total - actualDecrement),
        bySource: newBySource,
        sources: newSources,
      };
    });
  }, []);

  // ==================== LOAD FROM STORAGE ====================

  const loadFromStorage = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.BADGE_COUNTS);
      if (stored) {
        const parsed = JSON.parse(stored) as BadgeCounts;
        setBadgeCounts(parsed);
      }
      
      const lastSyncStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      if (lastSyncStr) {
        setLastSync(new Date(lastSyncStr));
      }
    } catch (err) {
      console.error('[BadgeContext] Load from storage error:', err);
    }
  }, []);

  // ==================== EFFECTS ====================

  // Load từ storage khi mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Auto refresh khi user login
  useEffect(() => {
    if (user?.id) {
      refreshBadges();
    }
  }, [user?.id, refreshBadges]);

  // Auto refresh interval (mỗi 2 phút)
  useEffect(() => {
    if (user?.id) {
      refreshIntervalRef.current = setInterval(() => {
        refreshBadges();
      }, 2 * 60 * 1000);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [user?.id, refreshBadges]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ==================== COMPUTED ====================

  const totalUnread = badgeCounts.total;

  // ==================== RENDER ====================

  return (
    <NotificationBadgeContext.Provider
      value={{
        badgeCounts,
        totalUnread,
        refreshBadges,
        clearSource,
        clearAll,
        incrementSource,
        decrementSource,
        isLoading,
        error,
        lastSync,
      }}
    >
      {children}
    </NotificationBadgeContext.Provider>
  );
}

// ==================== HOOK ====================

export function useNotificationBadge() {
  const context = useContext(NotificationBadgeContext);
  if (context === undefined) {
    throw new Error('useNotificationBadge must be used within a NotificationBadgeProvider');
  }
  return context;
}

// ==================== HELPER HOOK FOR SPECIFIC SOURCE ====================

export function useSourceBadge(sourceId: keyof BadgeCounts['bySource']) {
  const { badgeCounts, clearSource, incrementSource, decrementSource } = useNotificationBadge();
  
  return {
    count: badgeCounts.bySource[sourceId],
    source: badgeCounts.sources.find(s => s.id === sourceId),
    clear: () => clearSource(sourceId),
    increment: (amount?: number) => incrementSource(sourceId, amount),
    decrement: (amount?: number) => decrementSource(sourceId, amount),
  };
}

export default NotificationBadgeContext;
