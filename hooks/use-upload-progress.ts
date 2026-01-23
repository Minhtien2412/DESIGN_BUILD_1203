/**
 * useUploadProgress Hook
 * ======================
 *
 * Hook quản lý upload progress state
 *
 * Features:
 * - Upload queue management
 * - Progress tracking per file
 * - Auto retry failed uploads
 * - Background upload support
 * - Persistence (resume after app restart)
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import { ENV } from "@/config/env";
import { FileSystemUploadType, uploadAsync } from "@/utils/FileSystemCompat";
import { getAuthToken } from "@/utils/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { UploadItem } from "../components/media/UploadQueue";

// ============================================================================
// Types
// ============================================================================

export interface UploadConfig {
  /** API endpoint */
  endpoint?: string;
  /** Max concurrent uploads */
  maxConcurrent?: number;
  /** Auto retry count */
  maxRetries?: number;
  /** Chunk size for large files (bytes) */
  chunkSize?: number;
  /** Persistence key */
  storageKey?: string;
  /** Headers to include */
  headers?: Record<string, string>;
  /** Form field name */
  fieldName?: string;
}

export interface AddUploadOptions {
  /** File URI */
  uri: string;
  /** File name */
  fileName: string;
  /** File size */
  fileSize: number;
  /** MIME type */
  mimeType: string;
  /** Extra form data */
  extraData?: Record<string, string>;
  /** Custom endpoint */
  endpoint?: string;
  /** Callback on success */
  onSuccess?: (response: any) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

export interface UseUploadProgressReturn {
  /** Upload items in queue */
  items: UploadItem[];
  /** Add file to upload queue */
  addUpload: (options: AddUploadOptions) => string;
  /** Add multiple files */
  addUploads: (files: AddUploadOptions[]) => string[];
  /** Cancel upload by id */
  cancelUpload: (id: string) => void;
  /** Cancel all uploads */
  cancelAll: () => void;
  /** Retry failed upload */
  retryUpload: (id: string) => void;
  /** Retry all failed */
  retryAllFailed: () => void;
  /** Clear completed uploads */
  clearCompleted: () => void;
  /** Clear all uploads */
  clearAll: () => void;
  /** Pause upload */
  pauseUpload: (id: string) => void;
  /** Resume upload */
  resumeUpload: (id: string) => void;
  /** Overall progress (0-100) */
  overallProgress: number;
  /** Is uploading */
  isUploading: boolean;
  /** Number of active uploads */
  activeCount: number;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CONFIG: Required<UploadConfig> = {
  endpoint: `${ENV.API_BASE_URL}/upload/single`,
  maxConcurrent: 3,
  maxRetries: 3,
  chunkSize: 5 * 1024 * 1024, // 5MB
  storageKey: "@upload_queue",
  headers: {},
  fieldName: "file",
};

const STORAGE_KEY = "@upload_queue_v1";

// ============================================================================
// Hook
// ============================================================================

export function useUploadProgress(
  config?: UploadConfig,
): UseUploadProgressReturn {
  // Merge config
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  // State
  const [items, setItems] = useState<UploadItem[]>([]);
  const activeUploadsRef = useRef<Set<string>>(new Set());
  const cancelTokensRef = useRef<Map<string, AbortController>>(new Map());
  const retriesRef = useRef<Map<string, number>>(new Map());
  const callbacksRef = useRef<
    Map<string, { onSuccess?: Function; onError?: Function }>
  >(new Map());

  // ============================================
  // Persistence
  // ============================================

  useEffect(() => {
    loadPersistedQueue();
  }, []);

  useEffect(() => {
    persistQueue();
  }, [items]);

  const loadPersistedQueue = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: UploadItem[] = JSON.parse(stored);
        // Reset uploading items to pending
        const restored = parsed.map((item) => ({
          ...item,
          status: item.status === "uploading" ? "pending" : item.status,
          progress: item.status === "uploading" ? 0 : item.progress,
        })) as UploadItem[];
        setItems(restored);
      }
    } catch (error) {
      console.error("[useUploadProgress] Load persisted queue error:", error);
    }
  };

  const persistQueue = async () => {
    try {
      // Only persist non-completed items
      const toPersist = items.filter(
        (i) => i.status !== "success" && i.status !== "error",
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
    } catch (error) {
      console.error("[useUploadProgress] Persist queue error:", error);
    }
  };

  // ============================================
  // Upload Processing
  // ============================================

  useEffect(() => {
    processQueue();
  }, [items]);

  const processQueue = useCallback(async () => {
    const pendingItems = items.filter((i) => i.status === "pending");
    const availableSlots =
      mergedConfig.maxConcurrent - activeUploadsRef.current.size;

    if (availableSlots <= 0 || pendingItems.length === 0) return;

    const toStart = pendingItems.slice(0, availableSlots);

    for (const item of toStart) {
      if (!activeUploadsRef.current.has(item.id)) {
        startUpload(item);
      }
    }
  }, [items, mergedConfig.maxConcurrent]);

  const startUpload = async (item: UploadItem) => {
    activeUploadsRef.current.add(item.id);

    // Create abort controller
    const abortController = new AbortController();
    cancelTokensRef.current.set(item.id, abortController);

    // Update status
    updateItem(item.id, { status: "uploading", progress: 0 });

    try {
      const token = await getAuthToken();

      // Create upload task
      const uploadResult = await uploadAsync(mergedConfig.endpoint, item.uri, {
        uploadType: FileSystemUploadType.MULTIPART,
        fieldName: mergedConfig.fieldName,
        mimeType: item.fileType,
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "X-API-Key": ENV.API_KEY || "",
          ...mergedConfig.headers,
        },
        httpMethod: "POST",
      });

      // Check if cancelled
      if (abortController.signal.aborted) {
        return;
      }

      if (uploadResult.status >= 200 && uploadResult.status < 300) {
        // Success
        const response = JSON.parse(uploadResult.body);
        updateItem(item.id, { status: "success", progress: 100 });

        // Call success callback
        const callbacks = callbacksRef.current.get(item.id);
        callbacks?.onSuccess?.(response);
      } else {
        throw new Error(`Upload failed with status ${uploadResult.status}`);
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        // Cancelled
        updateItem(item.id, { status: "pending", progress: 0 });
      } else {
        // Error - check retry
        const retries = retriesRef.current.get(item.id) || 0;
        if (retries < mergedConfig.maxRetries) {
          retriesRef.current.set(item.id, retries + 1);
          updateItem(item.id, { status: "pending", progress: 0 });
        } else {
          updateItem(item.id, {
            status: "error",
            errorMessage: error.message || "Upload failed",
          });

          // Call error callback
          const callbacks = callbacksRef.current.get(item.id);
          callbacks?.onError?.(error);
        }
      }
    } finally {
      activeUploadsRef.current.delete(item.id);
      cancelTokensRef.current.delete(item.id);
    }
  };

  // ============================================
  // State Helpers
  // ============================================

  const updateItem = useCallback((id: string, updates: Partial<UploadItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  }, []);

  // ============================================
  // Public API
  // ============================================

  const addUpload = useCallback((options: AddUploadOptions): string => {
    const id = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newItem: UploadItem = {
      id,
      fileName: options.fileName,
      fileSize: options.fileSize,
      fileType: options.mimeType,
      uri: options.uri,
      progress: 0,
      status: "pending",
      createdAt: Date.now(),
    };

    // Store callbacks
    if (options.onSuccess || options.onError) {
      callbacksRef.current.set(id, {
        onSuccess: options.onSuccess,
        onError: options.onError,
      });
    }

    setItems((prev) => [...prev, newItem]);
    return id;
  }, []);

  const addUploads = useCallback(
    (files: AddUploadOptions[]): string[] => {
      return files.map((file) => addUpload(file));
    },
    [addUpload],
  );

  const cancelUpload = useCallback((id: string) => {
    const controller = cancelTokensRef.current.get(id);
    if (controller) {
      controller.abort();
    }
    activeUploadsRef.current.delete(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    callbacksRef.current.delete(id);
    retriesRef.current.delete(id);
  }, []);

  const cancelAll = useCallback(() => {
    items.forEach((item) => {
      const controller = cancelTokensRef.current.get(item.id);
      if (controller) {
        controller.abort();
      }
    });
    activeUploadsRef.current.clear();
    cancelTokensRef.current.clear();
    callbacksRef.current.clear();
    retriesRef.current.clear();
    setItems([]);
  }, [items]);

  const retryUpload = useCallback(
    (id: string) => {
      retriesRef.current.set(id, 0);
      updateItem(id, {
        status: "pending",
        progress: 0,
        errorMessage: undefined,
      });
    },
    [updateItem],
  );

  const retryAllFailed = useCallback(() => {
    const failedIds = items
      .filter((i) => i.status === "error")
      .map((i) => i.id);
    failedIds.forEach((id) => {
      retriesRef.current.set(id, 0);
    });
    setItems((prev) =>
      prev.map((item) =>
        item.status === "error"
          ? { ...item, status: "pending", progress: 0, errorMessage: undefined }
          : item,
      ),
    );
  }, [items]);

  const clearCompleted = useCallback(() => {
    const completedIds = items
      .filter((i) => i.status === "success")
      .map((i) => i.id);
    completedIds.forEach((id) => {
      callbacksRef.current.delete(id);
      retriesRef.current.delete(id);
    });
    setItems((prev) => prev.filter((item) => item.status !== "success"));
  }, [items]);

  const clearAll = useCallback(() => {
    cancelAll();
  }, [cancelAll]);

  const pauseUpload = useCallback(
    (id: string) => {
      const controller = cancelTokensRef.current.get(id);
      if (controller) {
        controller.abort();
      }
      activeUploadsRef.current.delete(id);
      updateItem(id, { status: "paused" });
    },
    [updateItem],
  );

  const resumeUpload = useCallback(
    (id: string) => {
      updateItem(id, { status: "pending" });
    },
    [updateItem],
  );

  // ============================================
  // Computed values
  // ============================================

  const overallProgress =
    items.length > 0
      ? items.reduce((sum, item) => sum + item.progress, 0) / items.length
      : 0;

  const isUploading = items.some((i) => i.status === "uploading");
  const activeCount = items.filter((i) => i.status === "uploading").length;

  return {
    items,
    addUpload,
    addUploads,
    cancelUpload,
    cancelAll,
    retryUpload,
    retryAllFailed,
    clearCompleted,
    clearAll,
    pauseUpload,
    resumeUpload,
    overallProgress,
    isUploading,
    activeCount,
  };
}

export default useUploadProgress;
