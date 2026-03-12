/**
 * useStorage Hook
 * React hook for unified storage management
 *
 * Features:
 * - Upload/download with progress
 * - Per-user document management
 * - Real-time file sync
 * - Offline support
 *
 * @example
 * const { upload, files, loading, refresh } = useStorage({ userId });
 * await upload(file, { folder: 'documents' });
 */

import type {
    FileInfo,
    FolderInfo,
    StorageEvent,
    StorageProvider,
    StorageStats,
    UploadOptions,
    UploadResult
} from "@/services/storage/types";
import storageService from "@/services/storage/unifiedStorage";
import { useCallback, useEffect, useMemo, useState } from "react";

// Hook options
interface UseStorageOptions {
  /** User ID for per-user storage */
  userId?: string;
  /** Initial folder to load */
  folder?: string;
  /** Auto-load files on mount */
  autoLoad?: boolean;
  /** Preferred storage provider */
  provider?: StorageProvider;
  /** Refresh interval (ms) */
  refreshInterval?: number;
}

// Hook return type
interface UseStorageReturn {
  // State
  files: FileInfo[];
  folders: FolderInfo[];
  stats: StorageStats | null;
  loading: boolean;
  uploading: boolean;
  uploadProgress: number;
  error: string | null;

  // Actions
  upload: (
    file: File | Blob | string,
    options?: Partial<UploadOptions>,
  ) => Promise<UploadResult>;
  uploadMultiple: (
    files: Array<{
      file: File | Blob | string;
      options?: Partial<UploadOptions>;
    }>,
  ) => Promise<UploadResult[]>;
  download: (path: string) => Promise<Blob | string>;
  deleteFile: (path: string) => Promise<void>;
  moveFile: (fromPath: string, toPath: string) => Promise<FileInfo>;
  createFolder: (name: string) => Promise<FolderInfo>;
  deleteFolder: (path: string, recursive?: boolean) => Promise<void>;
  share: (
    path: string,
    options?: { expiresIn?: number; public?: boolean },
  ) => Promise<string>;
  refresh: () => Promise<void>;
  setCurrentFolder: (folder: string) => void;

  // Utils
  getPublicUrl: (path: string) => string;
  getThumbnailUrl: (path: string) => string;
  formatSize: (bytes: number) => string;
}

/**
 * Custom hook for storage operations
 */
export function useStorage(options: UseStorageOptions = {}): UseStorageReturn {
  const {
    userId,
    folder: initialFolder = "",
    autoLoad = true,
    provider,
    refreshInterval,
  } = options;

  // State
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState(initialFolder);

  // Build folder path with userId
  const fullFolder = useMemo(() => {
    if (userId) {
      return currentFolder ? `${userId}/${currentFolder}` : `${userId}/`;
    }
    return currentFolder;
  }, [userId, currentFolder]);

  // Load files
  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await storageService.listFiles({
        folder: fullFolder,
        provider,
      });

      setFiles(result.files);
      setFolders(result.folders);

      // Load stats
      const storageStats = await storageService.getStats(userId);
      setStats(storageStats);
    } catch (err: any) {
      setError(err.message || "Failed to load files");
      console.error("[useStorage] Load error:", err);
    } finally {
      setLoading(false);
    }
  }, [fullFolder, provider, userId]);

  // Upload file
  const upload = useCallback(
    async (
      file: File | Blob | string,
      uploadOptions: Partial<UploadOptions> = {},
    ): Promise<UploadResult> => {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        const result = await storageService.upload(file, {
          folder: currentFolder,
          userId,
          provider,
          onProgress: setUploadProgress,
          ...uploadOptions,
        });

        // Refresh file list
        await loadFiles();
        return result;
      } catch (err: any) {
        setError(err.message || "Upload failed");
        throw err;
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [currentFolder, userId, provider, loadFiles],
  );

  // Upload multiple files
  const uploadMultiple = useCallback(
    async (
      filesList: Array<{
        file: File | Blob | string;
        options?: Partial<UploadOptions>;
      }>,
    ): Promise<UploadResult[]> => {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        const results = await storageService.uploadMultiple(
          filesList.map(({ file, options }) => ({
            file,
            options: {
              folder: currentFolder,
              userId,
              provider,
              ...options,
            },
          })),
          {
            parallel: true,
            onProgress: (completed, total) => {
              setUploadProgress(Math.round((completed / total) * 100));
            },
          },
        );

        await loadFiles();
        return results;
      } catch (err: any) {
        setError(err.message || "Upload failed");
        throw err;
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [currentFolder, userId, provider, loadFiles],
  );

  // Download file
  const download = useCallback(
    async (path: string): Promise<Blob | string> => {
      try {
        return await storageService.download(path, { provider });
      } catch (err: any) {
        setError(err.message || "Download failed");
        throw err;
      }
    },
    [provider],
  );

  // Delete file
  const deleteFile = useCallback(
    async (path: string): Promise<void> => {
      try {
        await storageService.delete(path, provider);
        await loadFiles();
      } catch (err: any) {
        setError(err.message || "Delete failed");
        throw err;
      }
    },
    [provider, loadFiles],
  );

  // Move file
  const moveFile = useCallback(
    async (fromPath: string, toPath: string): Promise<FileInfo> => {
      try {
        const result = await storageService.move(fromPath, toPath, provider);
        await loadFiles();
        return result;
      } catch (err: any) {
        setError(err.message || "Move failed");
        throw err;
      }
    },
    [provider, loadFiles],
  );

  // Create folder
  const createFolder = useCallback(
    async (name: string): Promise<FolderInfo> => {
      try {
        const folderPath = fullFolder ? `${fullFolder}/${name}` : name;
        const result = await storageService.createFolder(folderPath, provider);
        await loadFiles();
        return result;
      } catch (err: any) {
        setError(err.message || "Create folder failed");
        throw err;
      }
    },
    [fullFolder, provider, loadFiles],
  );

  // Delete folder
  const deleteFolder = useCallback(
    async (path: string, recursive: boolean = false): Promise<void> => {
      try {
        await storageService.deleteFolder(path, recursive, provider);
        await loadFiles();
      } catch (err: any) {
        setError(err.message || "Delete folder failed");
        throw err;
      }
    },
    [provider, loadFiles],
  );

  // Share file
  const share = useCallback(
    async (
      path: string,
      shareOptions: { expiresIn?: number; public?: boolean } = {},
    ): Promise<string> => {
      try {
        const result = await storageService.share(
          path,
          {
            public: shareOptions.public,
            expiresAt: shareOptions.expiresIn
              ? new Date(Date.now() + shareOptions.expiresIn * 1000)
              : undefined,
          },
          provider,
        );
        return result.shareUrl;
      } catch (err: any) {
        setError(err.message || "Share failed");
        throw err;
      }
    },
    [provider],
  );

  // Get public URL
  const getPublicUrl = useCallback(
    (path: string): string => {
      return storageService.getPublicUrl(path, provider);
    },
    [provider],
  );

  // Get thumbnail URL
  const getThumbnailUrl = useCallback((path: string): string => {
    return storageService.getThumbnailUrl(path);
  }, []);

  // Format file size
  const formatSize = useCallback((bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }, []);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      loadFiles();
    }
  }, [autoLoad, fullFolder]);

  // Refresh interval
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const timer = setInterval(loadFiles, refreshInterval);
      return () => clearInterval(timer);
    }
  }, [refreshInterval, loadFiles]);

  // Subscribe to storage events
  useEffect(() => {
    const unsubscribe = storageService.subscribe((event: StorageEvent) => {
      // Refresh on relevant events
      if (
        event.type === "file:created" ||
        event.type === "file:deleted" ||
        event.type === "file:moved" ||
        event.type === "folder:created" ||
        event.type === "folder:deleted"
      ) {
        loadFiles();
      }
    });

    return unsubscribe;
  }, [loadFiles]);

  return {
    // State
    files,
    folders,
    stats,
    loading,
    uploading,
    uploadProgress,
    error,

    // Actions
    upload,
    uploadMultiple,
    download,
    deleteFile,
    moveFile,
    createFolder,
    deleteFolder,
    share,
    refresh: loadFiles,
    setCurrentFolder,

    // Utils
    getPublicUrl,
    getThumbnailUrl,
    formatSize,
  };
}

// Export default
export default useStorage;
