/**
 * Hook để kiểm tra và sử dụng feature availability
 * Dùng trong components để hiển thị UI phù hợp
 */

import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import {
    canUseMockData,
    FeatureStatus,
    getFeatureFallbackMessage,
    getFeatureStatus,
} from "../services/featureAvailability";
import { FileCache, SyncService } from "../services/offlineStorage";

/**
 * Hook để kiểm tra một feature có sẵn sàng không
 */
export function useFeature(featureKey: string) {
  const [status, _setStatus] = useState<FeatureStatus>(
    getFeatureStatus(featureKey),
  );
  const [message, _setMessage] = useState<string>(
    getFeatureFallbackMessage(featureKey),
  );

  const isAvailable = status === "available";
  const isDegraded = status === "degraded";
  const isComingSoon = status === "coming_soon";
  const hasMockData = canUseMockData(featureKey);

  const showUnavailableAlert = useCallback(() => {
    if (!isAvailable) {
      Alert.alert("Tính năng chưa sẵn sàng", message, [
        { text: "Đã hiểu", style: "default" },
      ]);
    }
  }, [isAvailable, message]);

  return {
    status,
    isAvailable,
    isDegraded,
    isComingSoon,
    hasMockData,
    message,
    showUnavailableAlert,
  };
}

/**
 * Hook để theo dõi trạng thái network và sync
 */
export function useNetworkSync(
  apiBaseUrl: string,
  getAuthToken: () => string | null,
) {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncErrors, setSyncErrors] = useState<string[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);

  // Cập nhật pending count
  const updatePendingCount = useCallback(async () => {
    const uploads = await FileCache.getPendingUploads();
    setPendingCount(uploads.length);
  }, []);

  // Thực hiện sync
  const doSync = useCallback(async () => {
    const token = getAuthToken();
    if (!token || !isConnected) return;

    setIsSyncing(true);
    try {
      const results = await SyncService.syncPendingData(apiBaseUrl, token);
      setLastSyncTime(new Date());
      setSyncErrors(results.errors);
      await updatePendingCount();

      if (results.documents > 0 || results.uploads > 0) {
        console.log(
          `[SYNC] Synced ${results.documents} docs, ${results.uploads} uploads`,
        );
      }
    } catch (error) {
      console.error("[SYNC] Error:", error);
      setSyncErrors([String(error)]);
    } finally {
      setIsSyncing(false);
    }
  }, [apiBaseUrl, getAuthToken, isConnected, updatePendingCount]);

  // Theo dõi network state
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected ?? false;
      const wasDisconnected = !isConnected;
      setIsConnected(connected);

      // Nếu vừa có lại kết nối, thử sync
      if (connected && wasDisconnected) {
        doSync();
      }
    });

    // Initial check
    updatePendingCount();

    return () => unsubscribe();
  }, [doSync, isConnected, updatePendingCount]);

  // Manual sync trigger
  const triggerSync = useCallback(() => {
    if (isConnected && !isSyncing) {
      doSync();
    }
  }, [isConnected, isSyncing, doSync]);

  return {
    isConnected,
    isSyncing,
    lastSyncTime,
    syncErrors,
    pendingCount,
    triggerSync,
    updatePendingCount,
  };
}

/**
 * Hook để quản lý file cache
 */
export function useFileCache() {
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [cachedFilesCount, setCachedFilesCount] = useState<number>(0);

  const refreshStats = useCallback(async () => {
    const size = await FileCache.getCacheSize();
    const files = await FileCache.getCachedFiles();
    setCacheSize(size);
    setCachedFilesCount(files.length);
  }, []);

  const clearExpired = useCallback(async () => {
    const cleared = await FileCache.clearExpiredCache();
    await refreshStats();
    return cleared;
  }, [refreshStats]);

  const cacheFile = useCallback(
    async (remoteUrl: string, fileName: string, mimeType: string) => {
      const cached = await FileCache.cacheFile(remoteUrl, fileName, mimeType);
      await refreshStats();
      return cached;
    },
    [refreshStats],
  );

  const getCachedFile = useCallback(async (remoteUrl: string) => {
    return FileCache.getCachedFile(remoteUrl);
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return {
    cacheSize,
    cachedFilesCount,
    refreshStats,
    clearExpired,
    cacheFile,
    getCachedFile,
  };
}

/**
 * Hook để xử lý upload với retry và offline support
 */
export function useUpload() {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (
      file: { uri: string; name: string; type: string; size?: number },
      endpoint: string,
      onProgress?: (progress: number) => void,
    ) => {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        // Thêm vào pending uploads trước
        const pending = await FileCache.addPendingUpload({
          type: "document",
          localUri: file.uri,
          targetEndpoint: endpoint,
          fileName: file.name,
          mimeType: file.type,
        });

        // Simulate progress for demo
        for (let i = 0; i <= 100; i += 10) {
          setProgress(i);
          onProgress?.(i);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // TODO: Thực hiện upload thật khi BE sẵn sàng
        // const formData = new FormData();
        // formData.append('file', file);
        // const response = await apiFetch(endpoint, { method: 'POST', body: formData });

        // Xóa khỏi pending nếu thành công
        // await FileCache.removePendingUpload(pending.id);

        return { success: true, pendingUpload: pending };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    isUploading,
    progress,
    error,
    upload,
    reset,
  };
}

/**
 * Hook kết hợp tất cả chức năng offline
 */
export function useOfflineSupport(
  apiBaseUrl: string,
  getAuthToken: () => string | null,
) {
  const network = useNetworkSync(apiBaseUrl, getAuthToken);
  const fileCache = useFileCache();
  const uploader = useUpload();

  const hasOfflineData =
    network.pendingCount > 0 || fileCache.cachedFilesCount > 0;

  const showOfflineStatus = useCallback(() => {
    if (!network.isConnected) {
      Alert.alert(
        "Đang offline",
        `Bạn có ${network.pendingCount} file đang chờ upload.\nDữ liệu sẽ được đồng bộ khi có kết nối.`,
        [{ text: "Đã hiểu" }],
      );
    }
  }, [network.isConnected, network.pendingCount]);

  return {
    // Network status
    isConnected: network.isConnected,
    isSyncing: network.isSyncing,
    pendingCount: network.pendingCount,
    triggerSync: network.triggerSync,

    // File cache
    cacheSize: fileCache.cacheSize,
    cachedFilesCount: fileCache.cachedFilesCount,
    cacheFile: fileCache.cacheFile,
    getCachedFile: fileCache.getCachedFile,
    clearExpiredCache: fileCache.clearExpired,

    // Upload
    isUploading: uploader.isUploading,
    uploadProgress: uploader.progress,
    uploadError: uploader.error,
    upload: uploader.upload,

    // Helpers
    hasOfflineData,
    showOfflineStatus,
  };
}

export default {
  useFeature,
  useNetworkSync,
  useFileCache,
  useUpload,
  useOfflineSupport,
};
