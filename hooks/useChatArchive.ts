/**
 * useChatArchive Hook
 * ====================
 *
 * Hook để quản lý việc archive chat history:
 * - Tự động sync archives sau 5 ngày
 * - Download media kèm theo
 * - Search trong archives local
 *
 * @author ThietKeResort Team
 * @created 2025-01-27
 */

import { useAuth } from "@/context/AuthContext";
import chatHistoryArchiveService, {
    ArchiveMetadata,
    ArchiveSyncStatus,
    ChatArchive,
    FILE_SIZE_LIMITS,
    FileValidationResult,
    formatFileSize,
    SERVER_RETENTION_DAYS,
} from "@/services/chatHistoryArchiveService";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

// ============================================
// TYPES
// ============================================

export interface UseChatArchiveReturn {
  // State
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  archives: ArchiveMetadata[];
  syncStatus: ArchiveSyncStatus | null;

  // Actions
  syncArchives: () => Promise<number>;
  loadArchive: (archiveId: string) => Promise<ChatArchive | null>;
  searchArchives: (
    query: string,
    conversationId?: string,
  ) => Promise<{ archive: ArchiveMetadata; messages: any[] }[]>;
  deleteArchive: (archiveId: string) => Promise<boolean>;
  cleanupOldArchives: (retentionDays?: number) => Promise<number>;
  refreshArchives: () => Promise<void>;

  // File validation
  validateFile: (
    fileName: string,
    fileSize: number,
    mimeType: string,
  ) => FileValidationResult;
  getFileSizeLimit: (type: "IMAGE" | "DOCUMENT" | "VIDEO" | "AUDIO") => string;

  // Constants
  serverRetentionDays: number;
  fileSizeLimits: typeof FILE_SIZE_LIMITS;
}

// ============================================
// HOOK
// ============================================

// Minimum time between syncs (5 minutes)
const SYNC_COOLDOWN_MS = 5 * 60 * 1000;
// Disable sync after consecutive failures
const MAX_CONSECUTIVE_FAILURES = 3;

// Global state for deduplication across hook instances
let globalLastSyncTime = 0;
let globalSyncInProgress = false;
let cooldownLoggedOnce = false;

export function useChatArchive(): UseChatArchiveReturn {
  const { user } = useAuth();
  const userId = user?.id?.toString() || "";

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [archives, setArchives] = useState<ArchiveMetadata[]>([]);
  const [syncStatus, setSyncStatus] = useState<ArchiveSyncStatus | null>(null);

  // Refs for auto-sync
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appState = useRef(AppState.currentState);
  const lastSyncTime = useRef<number>(0);
  const consecutiveFailures = useRef<number>(0);
  const syncDisabled = useRef<boolean>(false);

  // ============================================
  // LOAD ARCHIVES
  // ============================================

  const loadArchives = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const localArchives =
        await chatHistoryArchiveService.getLocalArchives(userId);
      setArchives(localArchives);

      const status = await chatHistoryArchiveService.getArchiveStats(userId);
      setSyncStatus(status);
    } catch (err) {
      setError("Failed to load archives");
      console.error("[useChatArchive] Load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // ============================================
  // SYNC ARCHIVES
  // ============================================

  const syncArchives = useCallback(async (): Promise<number> => {
    // Prevent spam: check cooldown using global state
    const now = Date.now();
    const timeSinceLastSync = now - globalLastSyncTime;

    if (!userId || isSyncing || globalSyncInProgress) return 0;

    // Skip if sync is disabled due to consecutive failures
    if (syncDisabled.current) {
      return 0;
    }

    // Skip if within cooldown period
    if (timeSinceLastSync < SYNC_COOLDOWN_MS) {
      // Only log once per cooldown period
      if (!cooldownLoggedOnce) {
        console.log(
          `[useChatArchive] Sync cooldown, wait ${Math.ceil((SYNC_COOLDOWN_MS - timeSinceLastSync) / 1000)}s`,
        );
        cooldownLoggedOnce = true;
        // Reset the flag after cooldown expires
        setTimeout(() => {
          cooldownLoggedOnce = false;
        }, SYNC_COOLDOWN_MS - timeSinceLastSync);
      }
      return 0;
    }

    globalLastSyncTime = now;
    globalSyncInProgress = true;
    cooldownLoggedOnce = false;
    lastSyncTime.current = now;
    setIsSyncing(true);
    setError(null);

    try {
      const count = await chatHistoryArchiveService.syncAndArchive(userId);

      // Reset failure counter on success
      consecutiveFailures.current = 0;

      // Reload archives after sync
      await loadArchives();

      return count;
    } catch (err: any) {
      // Track consecutive failures
      consecutiveFailures.current++;

      // Disable sync if API consistently returns 404 (not implemented)
      if (
        err?.status === 404 ||
        err?.message?.includes("404") ||
        err?.message?.includes("Not Found")
      ) {
        if (consecutiveFailures.current >= MAX_CONSECUTIVE_FAILURES) {
          syncDisabled.current = true;
          console.warn(
            "[useChatArchive] Auto-sync disabled: API endpoint not available",
          );
          return 0;
        }
      }

      setError("Failed to sync archives");
      console.error("[useChatArchive] Sync error:", err);
      return 0;
    } finally {
      globalSyncInProgress = false;
      setIsSyncing(false);
    }
  }, [userId, isSyncing, loadArchives]);

  // ============================================
  // LOAD SINGLE ARCHIVE
  // ============================================

  const loadArchive = useCallback(
    async (archiveId: string): Promise<ChatArchive | null> => {
      try {
        return await chatHistoryArchiveService.loadLocalArchive(archiveId);
      } catch (err) {
        console.error("[useChatArchive] Load archive error:", err);
        return null;
      }
    },
    [],
  );

  // ============================================
  // SEARCH ARCHIVES
  // ============================================

  const searchArchives = useCallback(
    async (query: string, conversationId?: string) => {
      if (!userId || !query.trim()) return [];

      try {
        return await chatHistoryArchiveService.searchLocalArchives(
          userId,
          query,
          conversationId,
        );
      } catch (err) {
        console.error("[useChatArchive] Search error:", err);
        return [];
      }
    },
    [userId],
  );

  // ============================================
  // DELETE ARCHIVE
  // ============================================

  const deleteArchive = useCallback(
    async (archiveId: string): Promise<boolean> => {
      if (!userId) return false;

      try {
        const result = await chatHistoryArchiveService.deleteArchive(
          userId,
          archiveId,
        );

        if (result) {
          // Update local state
          setArchives((prev) => prev.filter((a) => a.id !== archiveId));
        }

        return result;
      } catch (err) {
        console.error("[useChatArchive] Delete error:", err);
        return false;
      }
    },
    [userId],
  );

  // ============================================
  // CLEANUP OLD ARCHIVES
  // ============================================

  const cleanupOldArchives = useCallback(
    async (retentionDays: number = 365): Promise<number> => {
      if (!userId) return 0;

      try {
        const count = await chatHistoryArchiveService.cleanupOldArchives(
          userId,
          retentionDays,
        );

        // Reload archives after cleanup
        await loadArchives();

        return count;
      } catch (err) {
        console.error("[useChatArchive] Cleanup error:", err);
        return 0;
      }
    },
    [userId, loadArchives],
  );

  // ============================================
  // REFRESH
  // ============================================

  const refreshArchives = useCallback(async () => {
    await loadArchives();
  }, [loadArchives]);

  // ============================================
  // FILE VALIDATION
  // ============================================

  const validateFile = useCallback(
    (
      fileName: string,
      fileSize: number,
      mimeType: string,
    ): FileValidationResult => {
      return chatHistoryArchiveService.validateFile(
        fileName,
        fileSize,
        mimeType,
      );
    },
    [],
  );

  const getFileSizeLimit = useCallback(
    (type: "IMAGE" | "DOCUMENT" | "VIDEO" | "AUDIO"): string => {
      return chatHistoryArchiveService.getFileSizeLimitText(type);
    },
    [],
  );

  // ============================================
  // AUTO-SYNC ON APP ACTIVE
  // ============================================

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          // App came to foreground - check for pending syncs
          // Note: syncArchives has built-in cooldown protection
          if (!syncDisabled.current) {
            syncArchives();
          }
        }
        appState.current = nextAppState;
      },
    );

    return () => {
      subscription.remove();
    };
  }, [syncArchives]);

  // ============================================
  // PERIODIC SYNC (every 6 hours)
  // ============================================

  useEffect(() => {
    if (!userId) return;

    // Initial load
    loadArchives();

    // Initial sync
    syncArchives();

    // Set up periodic sync
    syncIntervalRef.current = setInterval(
      () => {
        syncArchives();
      },
      6 * 60 * 60 * 1000,
    ); // Every 6 hours

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [userId, loadArchives, syncArchives]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // State
    isLoading,
    isSyncing,
    error,
    archives,
    syncStatus,

    // Actions
    syncArchives,
    loadArchive,
    searchArchives,
    deleteArchive,
    cleanupOldArchives,
    refreshArchives,

    // File validation
    validateFile,
    getFileSizeLimit,

    // Constants
    serverRetentionDays: SERVER_RETENTION_DAYS,
    fileSizeLimits: FILE_SIZE_LIMITS,
  };
}

// ============================================
// ADDITIONAL HOOKS
// ============================================

/**
 * Hook for file upload validation
 */
export function useFileValidation() {
  const validateFile = useCallback(
    (
      fileName: string,
      fileSize: number,
      mimeType: string,
    ): FileValidationResult => {
      return chatHistoryArchiveService.validateFile(
        fileName,
        fileSize,
        mimeType,
      );
    },
    [],
  );

  const formatSize = useCallback((bytes: number): string => {
    return formatFileSize(bytes);
  }, []);

  const getMaxSize = useCallback(
    (type: keyof typeof FILE_SIZE_LIMITS): number => {
      return FILE_SIZE_LIMITS[type];
    },
    [],
  );

  const getMaxSizeFormatted = useCallback(
    (type: keyof typeof FILE_SIZE_LIMITS): string => {
      return formatFileSize(FILE_SIZE_LIMITS[type]);
    },
    [],
  );

  return {
    validateFile,
    formatSize,
    getMaxSize,
    getMaxSizeFormatted,
    limits: FILE_SIZE_LIMITS,
  };
}

export default useChatArchive;
