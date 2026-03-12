/**
 * useDeltaSync Hook
 * =================
 *
 * React hook để sử dụng delta sync service:
 * - Auto sync khi app active
 * - Manual sync control
 * - Loading/error states
 * - Offline support
 *
 * @author ThietKeResort Team
 * @created 2025-01-27
 */

import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

import {
    chatDeltaSyncService,
    DeltaConversation,
    DeltaSyncResponse,
    SupportUser,
} from "@/services/chatDeltaSyncService";

// ============================================
// TYPES
// ============================================

export interface UseDeltaSyncOptions {
  /** Auto sync khi mount */
  autoSync?: boolean;
  /** Auto sync interval (ms), 0 để disable */
  syncInterval?: number;
  /** Sync khi app từ background -> foreground */
  syncOnForeground?: boolean;
  /** Conversation IDs để filter sync */
  conversationIds?: string[];
}

export interface UseDeltaSyncResult {
  /** Đang sync */
  isSyncing: boolean;
  /** Error message */
  error: string | null;
  /** Last sync response */
  lastSyncResponse: DeltaSyncResponse | null;
  /** Last sync time */
  lastSyncTime: Date | null;
  /** Is online */
  isOnline: boolean;
  /** Offline queue count */
  offlineQueueCount: number;
  /** Manual sync */
  sync: () => Promise<DeltaSyncResponse>;
  /** Full sync (reset) */
  fullSync: () => Promise<DeltaSyncResponse>;
  /** Sync single conversation */
  syncConversation: (id: string) => Promise<DeltaConversation | null>;
  /** Get support users */
  getSupportUsers: () => Promise<SupportUser[]>;
  /** Create support conversation */
  createSupportConversation: (
    supportUserId: number,
  ) => Promise<{ conversationId: string; isNew: boolean } | null>;
  /** Process offline queue */
  processOfflineQueue: () => Promise<void>;
  /** Clear all data */
  clearAll: () => Promise<void>;
}

// ============================================
// HOOK
// ============================================

export function useDeltaSync(
  options: UseDeltaSyncOptions = {},
): UseDeltaSyncResult {
  const {
    autoSync = true,
    syncInterval = 30000,
    syncOnForeground = true,
    conversationIds,
  } = options;

  // State
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncResponse, setLastSyncResponse] =
    useState<DeltaSyncResponse | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  // Refs
  const appState = useRef(AppState.currentState);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ============================================
  // SYNC FUNCTIONS
  // ============================================

  const sync = useCallback(async (): Promise<DeltaSyncResponse> => {
    setIsSyncing(true);
    setError(null);

    try {
      const response = await chatDeltaSyncService.deltaSync({
        conversationIds,
        includeNewConversations: true,
      });

      setLastSyncResponse(response);
      if (response.success) {
        setLastSyncTime(new Date());
      } else {
        setError("Sync failed");
      }

      return response;
    } catch (err: any) {
      const errorMsg = err.message || "Unknown error";
      setError(errorMsg);
      return {
        success: false,
        conversations: [],
        syncTimestamp: new Date().toISOString(),
        totalNewMessages: 0,
        hasMore: false,
      };
    } finally {
      setIsSyncing(false);
    }
  }, [conversationIds]);

  const fullSync = useCallback(async (): Promise<DeltaSyncResponse> => {
    setIsSyncing(true);
    setError(null);

    try {
      const response = await chatDeltaSyncService.fullSync();

      setLastSyncResponse(response);
      if (response.success) {
        setLastSyncTime(new Date());
      } else {
        setError("Full sync failed");
      }

      return response;
    } catch (err: any) {
      const errorMsg = err.message || "Unknown error";
      setError(errorMsg);
      return {
        success: false,
        conversations: [],
        syncTimestamp: new Date().toISOString(),
        totalNewMessages: 0,
        hasMore: false,
      };
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const syncConversation = useCallback(
    async (id: string): Promise<DeltaConversation | null> => {
      try {
        return await chatDeltaSyncService.syncConversation(id);
      } catch (err) {
        console.error("[useDeltaSync] syncConversation error:", err);
        return null;
      }
    },
    [],
  );

  // ============================================
  // SUPPORT USERS
  // ============================================

  const getSupportUsers = useCallback(async (): Promise<SupportUser[]> => {
    try {
      return await chatDeltaSyncService.getSupportUsers();
    } catch (err) {
      console.error("[useDeltaSync] getSupportUsers error:", err);
      return [];
    }
  }, []);

  const createSupportConversation = useCallback(
    async (
      supportUserId: number,
    ): Promise<{ conversationId: string; isNew: boolean } | null> => {
      try {
        return await chatDeltaSyncService.getOrCreateSupportConversation(
          supportUserId,
        );
      } catch (err) {
        console.error("[useDeltaSync] createSupportConversation error:", err);
        return null;
      }
    },
    [],
  );

  // ============================================
  // OFFLINE QUEUE
  // ============================================

  const processOfflineQueue = useCallback(async (): Promise<void> => {
    if (!isOnline) return;

    try {
      await chatDeltaSyncService.processOfflineQueue();
      // Update queue count after processing
      // Note: This would need access to the queue length from service
      setOfflineQueueCount(0);
    } catch (err) {
      console.error("[useDeltaSync] processOfflineQueue error:", err);
    }
  }, [isOnline]);

  const clearAll = useCallback(async (): Promise<void> => {
    try {
      await chatDeltaSyncService.clearAll();
      setLastSyncResponse(null);
      setLastSyncTime(null);
      setOfflineQueueCount(0);
      setError(null);
    } catch (err) {
      console.error("[useDeltaSync] clearAll error:", err);
    }
  }, []);

  // ============================================
  // EFFECTS
  // ============================================

  // Network state listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const online = state.isConnected ?? false;
      setIsOnline(online);

      // Process offline queue when back online
      if (online) {
        processOfflineQueue();
      }
    });

    return () => unsubscribe();
  }, [processOfflineQueue]);

  // App state listener
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (
          syncOnForeground &&
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          // App came to foreground
          sync();
        }
        appState.current = nextAppState;
      },
    );

    return () => subscription.remove();
  }, [syncOnForeground, sync]);

  // Auto sync on mount
  useEffect(() => {
    if (autoSync) {
      sync();
    }

    // Load last sync time
    chatDeltaSyncService.getLastSyncTime().then(setLastSyncTime);
  }, [autoSync, sync]);

  // Sync interval
  useEffect(() => {
    if (syncInterval > 0) {
      syncIntervalRef.current = setInterval(() => {
        if (isOnline && !isSyncing) {
          sync();
        }
      }, syncInterval);
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [syncInterval, isOnline, isSyncing, sync]);

  // ============================================
  // RETURN
  // ============================================

  return {
    isSyncing,
    error,
    lastSyncResponse,
    lastSyncTime,
    isOnline,
    offlineQueueCount,
    sync,
    fullSync,
    syncConversation,
    getSupportUsers,
    createSupportConversation,
    processOfflineQueue,
    clearAll,
  };
}

export default useDeltaSync;
