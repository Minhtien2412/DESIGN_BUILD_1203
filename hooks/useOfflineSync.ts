/**
 * useOfflineSync Hook
 * React hook for offline sync functionality
 */

import { offlineSyncManager, SyncStats } from '@/services/offlineSyncManager';
import { useCallback, useEffect, useState } from 'react';

export interface UseOfflineSyncReturn {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  lastSyncTime: Date | null;
  sync: () => Promise<void>;
  addToQueue: (type: 'create' | 'update' | 'delete', entity: string, data: any) => Promise<string>;
  cacheData: (key: string, data: any) => Promise<void>;
  getCachedData: <T>(key: string, maxAge?: number) => Promise<T | null>;
}

export function useOfflineSync(): UseOfflineSyncReturn {
  const [stats, setStats] = useState<SyncStats>({
    pendingCount: 0,
    failedCount: 0,
    lastSyncTime: null,
    isOnline: true,
    isSyncing: false,
  });

  useEffect(() => {
    // Initialize manager
    offlineSyncManager.initialize();

    // Subscribe to sync changes
    const unsubscribe = offlineSyncManager.onSyncChange((newStats) => {
      setStats(newStats);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const sync = useCallback(async () => {
    await offlineSyncManager.sync();
  }, []);

  const addToQueue = useCallback(async (
    type: 'create' | 'update' | 'delete',
    entity: string,
    data: any
  ): Promise<string> => {
    return offlineSyncManager.addToQueue({ type, entity, data });
  }, []);

  const cacheData = useCallback(async (key: string, data: any) => {
    await offlineSyncManager.cacheData(key, data);
  }, []);

  const getCachedData = useCallback(async <T>(key: string, maxAge?: number): Promise<T | null> => {
    return offlineSyncManager.getCachedData<T>(key, maxAge);
  }, []);

  return {
    isOnline: stats.isOnline,
    isSyncing: stats.isSyncing,
    pendingCount: stats.pendingCount,
    failedCount: stats.failedCount,
    lastSyncTime: stats.lastSyncTime ? new Date(stats.lastSyncTime) : null,
    sync,
    addToQueue,
    cacheData,
    getCachedData,
  };
}

/**
 * useNetworkStatus Hook
 * Simple hook just for network status
 */
export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = offlineSyncManager.onNetworkChange((online) => {
      setIsOnline(online);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return isOnline;
}

export default useOfflineSync;
