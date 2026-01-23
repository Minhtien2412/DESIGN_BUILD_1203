/**
 * FileManagerService - File listing, search, and management
 * UPLOAD-005: File Browser UI
 *
 * Features:
 * - File listing with pagination
 * - Search by name/type
 * - Filter by type/date/owner
 * - Sort options
 * - Offline caching
 */

import * as FileSystem from "@/utils/FileSystemCompat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sharing from "expo-sharing";
import { del, get, post } from "./api";

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useCallback, useEffect, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface FileItem {
  id: string;
  filename: string;
  originalName: string;
  contentType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  ownerId: string;
  ownerName?: string;
  projectId?: string;
  conversationId?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  versions?: FileVersion[];
  currentVersion: number;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileVersion {
  version: number;
  fileUrl: string;
  fileSize: number;
  checksum: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface FileListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: FileTypeFilter;
  ownerId?: string;
  projectId?: string;
  conversationId?: string;
  sortBy?: FileSortField;
  sortOrder?: "asc" | "desc";
  fromDate?: string;
  toDate?: string;
  tags?: string[];
  includeDeleted?: boolean;
}

export type FileTypeFilter =
  | "all"
  | "image"
  | "video"
  | "document"
  | "pdf"
  | "spreadsheet"
  | "archive"
  | "other";

export type FileSortField =
  | "name"
  | "size"
  | "type"
  | "createdAt"
  | "updatedAt";

export interface FileListResponse {
  files: FileItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface FileAttachment {
  fileId: string;
  targetType: "message" | "project" | "task" | "comment";
  targetId: string;
}

export interface DownloadProgress {
  fileId: string;
  filename: string;
  bytesDownloaded: number;
  totalBytes: number;
  progress: number;
  status: "pending" | "downloading" | "completed" | "failed";
  localPath?: string;
  error?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const FILE_CACHE_KEY = "@file_manager_cache";
const DOWNLOAD_DIR = FileSystem.documentDirectory + "downloads/";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Content type mappings
const TYPE_FILTERS: Record<FileTypeFilter, string[]> = {
  all: [],
  image: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic"],
  video: ["video/mp4", "video/quicktime", "video/webm", "video/x-m4v"],
  document: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ],
  pdf: ["application/pdf"],
  spreadsheet: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  archive: [
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
  ],
  other: [],
};

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Get file type from content type
 */
export function getFileType(contentType: string): FileTypeFilter {
  for (const [type, mimeTypes] of Object.entries(TYPE_FILTERS)) {
    if (type === "all" || type === "other") continue;
    if (
      mimeTypes.some(
        (m) => contentType.startsWith(m.split("/")[0]) || contentType === m,
      )
    ) {
      return type as FileTypeFilter;
    }
  }
  return "other";
}

/**
 * Get file icon name based on type
 */
export function getFileIcon(contentType: string): string {
  const type = getFileType(contentType);
  const icons: Record<FileTypeFilter, string> = {
    all: "document-outline",
    image: "image-outline",
    video: "videocam-outline",
    document: "document-text-outline",
    pdf: "document-outline",
    spreadsheet: "grid-outline",
    archive: "archive-outline",
    other: "document-outline",
  };
  return icons[type];
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()?.toUpperCase() || "" : "";
}

/**
 * Check if file is previewable
 */
export function isPreviewable(contentType: string): boolean {
  return (
    contentType.startsWith("image/") ||
    contentType.startsWith("video/") ||
    contentType === "application/pdf"
  );
}

// ============================================================================
// CACHE MANAGER
// ============================================================================

interface CacheEntry {
  data: FileListResponse;
  timestamp: number;
  params: string;
}

class FileCacheManager {
  private cache: Map<string, CacheEntry> = new Map();

  private getKey(params: FileListParams): string {
    return JSON.stringify(params);
  }

  async get(params: FileListParams): Promise<FileListResponse | null> {
    const key = this.getKey(params);

    // Check memory cache
    const memEntry = this.cache.get(key);
    if (memEntry && Date.now() - memEntry.timestamp < CACHE_TTL) {
      return memEntry.data;
    }

    // Check persistent cache
    try {
      const saved = await AsyncStorage.getItem(FILE_CACHE_KEY);
      if (saved) {
        const entries: Record<string, CacheEntry> = JSON.parse(saved);
        const entry = entries[key];
        if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
          this.cache.set(key, entry);
          return entry.data;
        }
      }
    } catch {
      // Ignore cache errors
    }

    return null;
  }

  async set(params: FileListParams, data: FileListResponse): Promise<void> {
    const key = this.getKey(params);
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      params: key,
    };

    // Update memory cache
    this.cache.set(key, entry);

    // Update persistent cache
    try {
      const saved = await AsyncStorage.getItem(FILE_CACHE_KEY);
      const entries: Record<string, CacheEntry> = saved
        ? JSON.parse(saved)
        : {};

      // Limit cache size
      const keys = Object.keys(entries);
      if (keys.length > 20) {
        // Remove oldest entries
        const sorted = keys.sort(
          (a, b) => entries[a].timestamp - entries[b].timestamp,
        );
        for (let i = 0; i < 10; i++) {
          delete entries[sorted[i]];
        }
      }

      entries[key] = entry;
      await AsyncStorage.setItem(FILE_CACHE_KEY, JSON.stringify(entries));
    } catch {
      // Ignore
    }
  }

  async invalidate(): Promise<void> {
    this.cache.clear();
    await AsyncStorage.removeItem(FILE_CACHE_KEY);
  }
}

// ============================================================================
// MAIN SERVICE
// ============================================================================

class FileManagerServiceClass {
  private cache = new FileCacheManager();
  private downloadTasks: Map<
    string,
    { task: FileSystem.DownloadResumable; progress: DownloadProgress }
  > = new Map();
  private listeners: Map<string, Set<(progress: DownloadProgress) => void>> =
    new Map();

  /**
   * List files with filters
   */
  async listFiles(params: FileListParams = {}): Promise<FileListResponse> {
    // Check cache first
    const cached = await this.cache.get(params);
    if (cached) {
      return cached;
    }

    // Build query params
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page.toString());
    if (params.limit) query.set("limit", params.limit.toString());
    if (params.search) query.set("search", params.search);
    if (params.type && params.type !== "all") {
      const mimeTypes = TYPE_FILTERS[params.type];
      if (mimeTypes.length > 0) {
        query.set("contentTypes", mimeTypes.join(","));
      }
    }
    if (params.ownerId) query.set("ownerId", params.ownerId);
    if (params.projectId) query.set("projectId", params.projectId);
    if (params.conversationId)
      query.set("conversationId", params.conversationId);
    if (params.sortBy) query.set("sortBy", params.sortBy);
    if (params.sortOrder) query.set("sortOrder", params.sortOrder);
    if (params.fromDate) query.set("fromDate", params.fromDate);
    if (params.toDate) query.set("toDate", params.toDate);
    if (params.tags?.length) query.set("tags", params.tags.join(","));
    if (params.includeDeleted) query.set("includeDeleted", "true");

    const response = await get<FileListResponse>(
      `/api/v1/files?${query.toString()}`,
    );

    // Cache the response
    await this.cache.set(params, response);

    return response;
  }

  /**
   * Search files by name
   */
  async searchFiles(query: string, limit: number = 20): Promise<FileItem[]> {
    const response = await this.listFiles({
      search: query,
      limit,
      sortBy: "updatedAt",
      sortOrder: "desc",
    });
    return response.files;
  }

  /**
   * Get single file by ID
   */
  async getFile(fileId: string): Promise<FileItem | null> {
    try {
      return await get<FileItem>(`/api/v1/files/${fileId}`);
    } catch {
      return null;
    }
  }

  /**
   * Delete file (soft delete)
   */
  async deleteFile(fileId: string): Promise<void> {
    await del(`/api/v1/files/${fileId}`);
    await this.cache.invalidate();
  }

  /**
   * Restore deleted file
   */
  async restoreFile(fileId: string): Promise<FileItem> {
    const file = await post<FileItem>(`/api/v1/files/${fileId}/restore`, {});
    await this.cache.invalidate();
    return file;
  }

  /**
   * Permanently delete file
   */
  async permanentDelete(fileId: string): Promise<void> {
    await del(`/api/v1/files/${fileId}/permanent`);
    await this.cache.invalidate();
  }

  /**
   * Attach file to target (message/project/task)
   */
  async attachFile(attachment: FileAttachment): Promise<void> {
    await post("/api/v1/files/attach", attachment);
  }

  /**
   * Detach file from target
   */
  async detachFile(
    fileId: string,
    targetType: string,
    targetId: string,
  ): Promise<void> {
    await post("/api/v1/files/detach", { fileId, targetType, targetId });
  }

  /**
   * Download file to local storage
   */
  async downloadFile(
    file: FileItem,
    onProgress?: (progress: DownloadProgress) => void,
  ): Promise<string> {
    // Ensure download directory exists
    const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, {
        intermediates: true,
      });
    }

    const localPath = DOWNLOAD_DIR + file.filename;

    // Check if already downloaded
    const existingFile = await FileSystem.getInfoAsync(localPath);
    if (existingFile.exists) {
      return localPath;
    }

    // Initialize progress
    const progress: DownloadProgress = {
      fileId: file.id,
      filename: file.filename,
      bytesDownloaded: 0,
      totalBytes: file.fileSize,
      progress: 0,
      status: "downloading",
    };

    onProgress?.(progress);
    this.notifyListeners(file.id, progress);

    return new Promise((resolve, reject) => {
      const downloadResumable = FileSystem.createDownloadResumable(
        file.fileUrl,
        localPath,
        {},
        (downloadProgress) => {
          progress.bytesDownloaded = downloadProgress.totalBytesWritten;
          progress.progress = Math.round(
            (downloadProgress.totalBytesWritten /
              downloadProgress.totalBytesExpectedToWrite) *
              100,
          );
          onProgress?.(progress);
          this.notifyListeners(file.id, progress);
        },
      );

      this.downloadTasks.set(file.id, { task: downloadResumable, progress });

      downloadResumable
        .downloadAsync()
        .then((result) => {
          if (result) {
            progress.status = "completed";
            progress.localPath = result.uri;
            onProgress?.(progress);
            this.notifyListeners(file.id, progress);
            resolve(result.uri);
          } else {
            throw new Error("Download failed");
          }
        })
        .catch((error) => {
          progress.status = "failed";
          progress.error = error.message;
          onProgress?.(progress);
          this.notifyListeners(file.id, progress);
          reject(error);
        })
        .finally(() => {
          this.downloadTasks.delete(file.id);
        });
    });
  }

  /**
   * Cancel active download
   */
  async cancelDownload(fileId: string): Promise<void> {
    const download = this.downloadTasks.get(fileId);
    if (download) {
      await download.task.pauseAsync();
      download.progress.status = "failed";
      download.progress.error = "Download cancelled";
      this.notifyListeners(fileId, download.progress);
      this.downloadTasks.delete(fileId);
    }
  }

  /**
   * Share file externally
   */
  async shareFile(file: FileItem): Promise<void> {
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error("Chia sẻ không khả dụng trên thiết bị này");
    }

    // Download file first if needed
    let localPath = await this.getLocalPath(file.id);
    if (!localPath) {
      localPath = await this.downloadFile(file);
    }

    // Share the file
    await Sharing.shareAsync(localPath, {
      mimeType: file.contentType,
      dialogTitle: `Chia sẻ ${file.originalName}`,
    });
  }

  /**
   * Get local path if file is downloaded
   */
  async getLocalPath(fileId: string): Promise<string | null> {
    try {
      const saved = await AsyncStorage.getItem(`@downloaded_file_${fileId}`);
      if (saved) {
        const info = await FileSystem.getInfoAsync(saved);
        if (info.exists) {
          return saved;
        }
      }
    } catch {
      // Ignore
    }
    return null;
  }

  /**
   * Check if file is downloaded
   */
  async isDownloaded(fileId: string): Promise<boolean> {
    const localPath = await this.getLocalPath(fileId);
    return localPath !== null;
  }

  /**
   * Get downloaded files
   */
  async getDownloadedFiles(): Promise<
    { fileId: string; path: string; size: number }[]
  > {
    const results: { fileId: string; path: string; size: number }[] = [];

    try {
      const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
      if (!dirInfo.exists) return results;

      const files = await FileSystem.readDirectoryAsync(DOWNLOAD_DIR);
      for (const filename of files) {
        const path = DOWNLOAD_DIR + filename;
        const info = await FileSystem.getInfoAsync(path, { size: true });
        if (info.exists) {
          results.push({
            fileId: filename.split("_")[0] || filename,
            path,
            size: (info as { size?: number }).size || 0,
          });
        }
      }
    } catch {
      // Ignore
    }

    return results;
  }

  /**
   * Clear downloaded files
   */
  async clearDownloads(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(DOWNLOAD_DIR, { idempotent: true });
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Subscribe to download progress
   */
  subscribeToDownload(
    fileId: string,
    callback: (progress: DownloadProgress) => void,
  ): () => void {
    const listeners = this.listeners.get(fileId) || new Set();
    listeners.add(callback);
    this.listeners.set(fileId, listeners);

    return () => {
      const current = this.listeners.get(fileId);
      if (current) {
        current.delete(callback);
        if (current.size === 0) {
          this.listeners.delete(fileId);
        }
      }
    };
  }

  /**
   * Invalidate cache
   */
  async invalidateCache(): Promise<void> {
    await this.cache.invalidate();
  }

  private notifyListeners(fileId: string, progress: DownloadProgress): void {
    const listeners = this.listeners.get(fileId);
    if (listeners) {
      listeners.forEach((cb) => cb(progress));
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const FileManagerService = new FileManagerServiceClass();

/**
 * Hook for file listing with filters
 */
export function useFileList(initialParams: FileListParams = {}) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<FileListParams>(initialParams);

  const load = useCallback(
    async (reset = false) => {
      const currentParams = reset ? { ...params, page: 1 } : params;

      if (reset) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      try {
        const response = await FileManagerService.listFiles(currentParams);

        if (reset || currentParams.page === 1) {
          setFiles(response.files);
        } else {
          setFiles((prev) => [...prev, ...response.files]);
        }

        setTotal(response.total);
        setHasMore(response.hasMore);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load files");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [params],
  );

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setParams((prev) => ({ ...prev, page: (prev.page || 1) + 1 }));
    }
  }, [isLoadingMore, hasMore]);

  const refresh = useCallback(() => {
    setParams((prev) => ({ ...prev, page: 1 }));
    load(true);
  }, [load]);

  const updateFilters = useCallback((newParams: Partial<FileListParams>) => {
    setParams((prev) => ({ ...prev, ...newParams, page: 1 }));
  }, []);

  useEffect(() => {
    load(params.page === 1);
  }, [params]);

  return {
    files,
    total,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    params,
    loadMore,
    refresh,
    updateFilters,
  };
}

/**
 * Hook for file search
 */
export function useFileSearch(debounceMs = 300) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FileItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const files = await FileManagerService.searchFiles(query);
        setResults(files);
      } finally {
        setIsSearching(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, debounceMs]);

  const clear = useCallback(() => {
    setQuery("");
    setResults([]);
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    clear,
  };
}

/**
 * Hook for file download
 */
export function useFileDownload() {
  const [downloads, setDownloads] = useState<Map<string, DownloadProgress>>(
    new Map(),
  );

  const download = useCallback(async (file: FileItem) => {
    setDownloads((prev) => {
      const next = new Map(prev);
      next.set(file.id, {
        fileId: file.id,
        filename: file.filename,
        bytesDownloaded: 0,
        totalBytes: file.fileSize,
        progress: 0,
        status: "pending",
      });
      return next;
    });

    try {
      const localPath = await FileManagerService.downloadFile(
        file,
        (progress) => {
          setDownloads((prev) => {
            const next = new Map(prev);
            next.set(file.id, progress);
            return next;
          });
        },
      );
      return localPath;
    } catch (e) {
      throw e;
    }
  }, []);

  const cancel = useCallback(async (fileId: string) => {
    await FileManagerService.cancelDownload(fileId);
    setDownloads((prev) => {
      const next = new Map(prev);
      next.delete(fileId);
      return next;
    });
  }, []);

  const getProgress = useCallback(
    (fileId: string) => {
      return downloads.get(fileId) || null;
    },
    [downloads],
  );

  return {
    download,
    cancel,
    getProgress,
    activeDownloads: Array.from(downloads.values()),
  };
}

/**
 * Hook for file attachment
 */
export function useFileAttachment() {
  const [isAttaching, setIsAttaching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const attach = useCallback(
    async (
      fileId: string,
      targetType: "message" | "project" | "task" | "comment",
      targetId: string,
    ) => {
      setIsAttaching(true);
      setError(null);

      try {
        await FileManagerService.attachFile({ fileId, targetType, targetId });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Attach failed";
        setError(msg);
        throw e;
      } finally {
        setIsAttaching(false);
      }
    },
    [],
  );

  const detach = useCallback(
    async (fileId: string, targetType: string, targetId: string) => {
      setIsAttaching(true);
      setError(null);

      try {
        await FileManagerService.detachFile(fileId, targetType, targetId);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Detach failed";
        setError(msg);
        throw e;
      } finally {
        setIsAttaching(false);
      }
    },
    [],
  );

  return {
    attach,
    detach,
    isAttaching,
    error,
  };
}
