/**
 * OfflineFileService - Offline file download and management
 * OFFLINE-004: Offline File Downloads
 *
 * Features:
 * - Save files for offline access
 * - Download manager with progress tracking
 * - Quota management (default 1GB)
 * - Automatic cleanup of old files
 * - Offline file index with metadata
 * - Resume interrupted downloads
 * - Sync status indicators
 */

import * as FileSystem from "@/utils/FileSystemCompat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { EventEmitter } from "events";
import {
    FileItem,
    formatFileSize,
    getFileType
} from "./FileManagerService";

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useCallback, useEffect, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface OfflineFile {
  id: string;
  fileId: string;
  filename: string;
  originalName: string;
  contentType: string;
  fileSize: number;
  localPath: string;
  sourceUrl: string;
  thumbnailPath?: string;
  downloadedAt: number;
  lastAccessedAt: number;
  expiresAt?: number;
  metadata?: Record<string, unknown>;
  isPinned: boolean; // Pinned files won't be auto-cleaned
  downloadProgress: number; // 0-100
  status: OfflineFileStatus;
  error?: string;
}

export type OfflineFileStatus =
  | "pending"
  | "downloading"
  | "paused"
  | "completed"
  | "failed"
  | "expired";

export interface DownloadTask {
  fileId: string;
  resumable: FileSystem.DownloadResumable | null;
  progress: number;
  status: OfflineFileStatus;
  startTime: number;
  bytesDownloaded: number;
  totalBytes: number;
}

export interface OfflineQuota {
  maxBytes: number;
  usedBytes: number;
  availableBytes: number;
  fileCount: number;
  percentage: number;
}

export interface OfflineSettings {
  maxStorageBytes: number; // Default 1GB
  autoCleanupEnabled: boolean;
  cleanupThresholdPercent: number; // Cleanup when usage exceeds this (default 90%)
  maxFileAgeDays: number; // Auto-delete files older than this (default 30)
  downloadOnWifiOnly: boolean;
  maxConcurrentDownloads: number;
}

export interface OfflineFileFilter {
  type?: "all" | "image" | "video" | "document" | "pdf" | "other";
  status?: OfflineFileStatus;
  search?: string;
  pinned?: boolean;
  sortBy?: "name" | "size" | "downloadedAt" | "lastAccessedAt";
  sortOrder?: "asc" | "desc";
}

export interface OfflineSyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingDownloads: number;
  failedDownloads: number;
  lastSyncAt?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const OFFLINE_INDEX_KEY = "@offline_file_index";
const OFFLINE_SETTINGS_KEY = "@offline_settings";
const OFFLINE_QUEUE_KEY = "@offline_download_queue";
const OFFLINE_DIR = FileSystem.documentDirectory + "offline_files/";
const THUMBNAIL_DIR = OFFLINE_DIR + "thumbnails/";

const DEFAULT_SETTINGS: OfflineSettings = {
  maxStorageBytes: 1024 * 1024 * 1024, // 1GB
  autoCleanupEnabled: true,
  cleanupThresholdPercent: 90,
  maxFileAgeDays: 30,
  downloadOnWifiOnly: false,
  maxConcurrentDownloads: 3,
};

// ============================================================================
// EVENT EMITTER
// ============================================================================

type OfflineEvents = {
  "download:start": (file: OfflineFile) => void;
  "download:progress": (fileId: string, progress: number) => void;
  "download:complete": (file: OfflineFile) => void;
  "download:error": (fileId: string, error: string) => void;
  "download:paused": (fileId: string) => void;
  "quota:warning": (quota: OfflineQuota) => void;
  "quota:exceeded": (quota: OfflineQuota) => void;
  "cleanup:start": () => void;
  "cleanup:complete": (freedBytes: number) => void;
  "sync:change": (status: OfflineSyncStatus) => void;
};

// ============================================================================
// MAIN SERVICE
// ============================================================================

class OfflineFileServiceClass extends EventEmitter {
  private index: Map<string, OfflineFile> = new Map();
  private downloadQueue: string[] = [];
  private activeDownloads: Map<string, DownloadTask> = new Map();
  private settings: OfflineSettings = DEFAULT_SETTINGS;
  private isInitialized = false;
  private networkState: NetInfoState | null = null;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Ensure directories exist
    await this.ensureDirectories();

    // Load settings
    await this.loadSettings();

    // Load index
    await this.loadIndex();

    // Load download queue
    await this.loadQueue();

    // Setup network listener
    this.setupNetworkListener();

    // Start cleanup timer (every hour)
    this.cleanupTimer = setInterval(
      () => {
        this.performAutoCleanup();
      },
      60 * 60 * 1000,
    );

    // Check for incomplete downloads
    await this.resumeIncompleteDownloads();

    this.isInitialized = true;
    console.log("[OfflineFileService] Initialized");
  }

  private async ensureDirectories(): Promise<void> {
    const dirs = [OFFLINE_DIR, THUMBNAIL_DIR];
    for (const dir of dirs) {
      const info = await FileSystem.getInfoAsync(dir);
      if (!info.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }
    }
  }

  private setupNetworkListener(): void {
    NetInfo.addEventListener((state) => {
      const wasOnline = this.networkState?.isConnected;
      this.networkState = state;

      // Emit sync status change
      this.emitSyncStatus();

      // Resume downloads when coming back online
      if (!wasOnline && state.isConnected) {
        this.processQueue();
      }
    });
  }

  // ============================================================================
  // SETTINGS
  // ============================================================================

  async loadSettings(): Promise<OfflineSettings> {
    try {
      const saved = await AsyncStorage.getItem(OFFLINE_SETTINGS_KEY);
      if (saved) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn("[OfflineFileService] Failed to load settings:", error);
    }
    return this.settings;
  }

  async saveSettings(settings: Partial<OfflineSettings>): Promise<void> {
    this.settings = { ...this.settings, ...settings };
    await AsyncStorage.setItem(
      OFFLINE_SETTINGS_KEY,
      JSON.stringify(this.settings),
    );
  }

  getSettings(): OfflineSettings {
    return { ...this.settings };
  }

  // ============================================================================
  // INDEX MANAGEMENT
  // ============================================================================

  private async loadIndex(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(OFFLINE_INDEX_KEY);
      if (saved) {
        const files: OfflineFile[] = JSON.parse(saved);
        this.index.clear();
        for (const file of files) {
          // Verify file still exists
          const info = await FileSystem.getInfoAsync(file.localPath);
          if (info.exists) {
            this.index.set(file.fileId, file);
          }
        }
      }
    } catch (error) {
      console.warn("[OfflineFileService] Failed to load index:", error);
    }
  }

  private async saveIndex(): Promise<void> {
    try {
      const files = Array.from(this.index.values());
      await AsyncStorage.setItem(OFFLINE_INDEX_KEY, JSON.stringify(files));
    } catch (error) {
      console.warn("[OfflineFileService] Failed to save index:", error);
    }
  }

  private async loadQueue(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (saved) {
        this.downloadQueue = JSON.parse(saved);
      }
    } catch (error) {
      console.warn("[OfflineFileService] Failed to load queue:", error);
    }
  }

  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        OFFLINE_QUEUE_KEY,
        JSON.stringify(this.downloadQueue),
      );
    } catch (error) {
      console.warn("[OfflineFileService] Failed to save queue:", error);
    }
  }

  // ============================================================================
  // QUOTA MANAGEMENT
  // ============================================================================

  async getQuota(): Promise<OfflineQuota> {
    let usedBytes = 0;
    let fileCount = 0;

    for (const file of this.index.values()) {
      if (file.status === "completed") {
        usedBytes += file.fileSize;
        fileCount++;
      }
    }

    const quota: OfflineQuota = {
      maxBytes: this.settings.maxStorageBytes,
      usedBytes,
      availableBytes: Math.max(0, this.settings.maxStorageBytes - usedBytes),
      fileCount,
      percentage: Math.round((usedBytes / this.settings.maxStorageBytes) * 100),
    };

    // Emit warning if near limit
    if (quota.percentage >= this.settings.cleanupThresholdPercent) {
      this.emit("quota:warning", quota);
    }

    return quota;
  }

  async checkQuota(additionalBytes: number): Promise<boolean> {
    const quota = await this.getQuota();
    return quota.availableBytes >= additionalBytes;
  }

  async ensureSpace(requiredBytes: number): Promise<boolean> {
    const hasSpace = await this.checkQuota(requiredBytes);
    if (hasSpace) return true;

    // Try cleanup
    if (this.settings.autoCleanupEnabled) {
      await this.performAutoCleanup();
      return this.checkQuota(requiredBytes);
    }

    this.emit("quota:exceeded", await this.getQuota());
    return false;
  }

  // ============================================================================
  // DOWNLOAD MANAGEMENT
  // ============================================================================

  /**
   * Queue a file for offline download
   */
  async saveForOffline(
    file: FileItem,
    options?: { pin?: boolean },
  ): Promise<OfflineFile> {
    // Check if already saved
    const existing = this.index.get(file.id);
    if (existing && existing.status === "completed") {
      // Update access time and pin status
      existing.lastAccessedAt = Date.now();
      if (options?.pin !== undefined) {
        existing.isPinned = options.pin;
      }
      await this.saveIndex();
      return existing;
    }

    // Check quota
    const hasSpace = await this.ensureSpace(file.fileSize);
    if (!hasSpace) {
      throw new Error("Không đủ dung lượng lưu trữ offline");
    }

    // Check wifi-only setting
    if (this.settings.downloadOnWifiOnly) {
      const netInfo = await NetInfo.fetch();
      if (netInfo.type !== "wifi") {
        throw new Error("Cài đặt chỉ cho phép tải qua WiFi");
      }
    }

    // Create offline file entry
    const localPath = OFFLINE_DIR + `${file.id}_${file.filename}`;
    const offlineFile: OfflineFile = {
      id: `offline_${file.id}_${Date.now()}`,
      fileId: file.id,
      filename: file.filename,
      originalName: file.originalName,
      contentType: file.contentType,
      fileSize: file.fileSize,
      localPath,
      sourceUrl: file.fileUrl,
      thumbnailPath: file.thumbnailUrl
        ? THUMBNAIL_DIR + `${file.id}_thumb.jpg`
        : undefined,
      downloadedAt: Date.now(),
      lastAccessedAt: Date.now(),
      expiresAt:
        Date.now() + this.settings.maxFileAgeDays * 24 * 60 * 60 * 1000,
      metadata: file.metadata,
      isPinned: options?.pin ?? false,
      downloadProgress: 0,
      status: "pending",
    };

    // Add to index
    this.index.set(file.id, offlineFile);
    await this.saveIndex();

    // Add to queue
    if (!this.downloadQueue.includes(file.id)) {
      this.downloadQueue.push(file.id);
      await this.saveQueue();
    }

    // Start processing queue
    this.processQueue();

    this.emit("download:start", offlineFile);
    return offlineFile;
  }

  /**
   * Process download queue
   */
  private async processQueue(): Promise<void> {
    // Check network
    if (!this.networkState?.isConnected) {
      return;
    }

    // Check concurrent limit
    while (
      this.activeDownloads.size < this.settings.maxConcurrentDownloads &&
      this.downloadQueue.length > 0
    ) {
      const fileId = this.downloadQueue.shift();
      if (fileId) {
        await this.saveQueue();
        this.startDownload(fileId);
      }
    }

    this.emitSyncStatus();
  }

  /**
   * Start downloading a file
   */
  private async startDownload(fileId: string): Promise<void> {
    const offlineFile = this.index.get(fileId);
    if (!offlineFile) return;

    // Check if already downloading
    if (this.activeDownloads.has(fileId)) return;

    // Update status
    offlineFile.status = "downloading";
    await this.saveIndex();

    const task: DownloadTask = {
      fileId,
      resumable: null,
      progress: 0,
      status: "downloading",
      startTime: Date.now(),
      bytesDownloaded: 0,
      totalBytes: offlineFile.fileSize,
    };

    this.activeDownloads.set(fileId, task);

    try {
      // Create download resumable
      const downloadResumable = FileSystem.createDownloadResumable(
        offlineFile.sourceUrl,
        offlineFile.localPath,
        {},
        (progress) => {
          task.bytesDownloaded = progress.totalBytesWritten;
          task.progress = Math.round(
            (progress.totalBytesWritten / progress.totalBytesExpectedToWrite) *
              100,
          );
          offlineFile.downloadProgress = task.progress;

          this.emit("download:progress", fileId, task.progress);
        },
      );

      task.resumable = downloadResumable;

      // Execute download
      const result = await downloadResumable.downloadAsync();

      if (result) {
        // Success
        offlineFile.status = "completed";
        offlineFile.downloadProgress = 100;
        offlineFile.localPath = result.uri;
        offlineFile.downloadedAt = Date.now();
        await this.saveIndex();

        // Download thumbnail if exists
        if (offlineFile.thumbnailPath) {
          try {
            const thumbResult = await FileSystem.downloadAsync(
              offlineFile.sourceUrl.replace(/(\.[^.]+)$/, "_thumb$1"),
              offlineFile.thumbnailPath,
            );
            if (!thumbResult?.uri) {
              offlineFile.thumbnailPath = undefined;
            }
          } catch {
            offlineFile.thumbnailPath = undefined;
          }
        }

        this.emit("download:complete", offlineFile);
      } else {
        throw new Error("Download returned no result");
      }
    } catch (error) {
      offlineFile.status = "failed";
      offlineFile.error =
        error instanceof Error ? error.message : "Download failed";
      await this.saveIndex();
      this.emit("download:error", fileId, offlineFile.error);
    } finally {
      this.activeDownloads.delete(fileId);
      // Process next in queue
      this.processQueue();
    }
  }

  /**
   * Pause a download
   */
  async pauseDownload(fileId: string): Promise<void> {
    const task = this.activeDownloads.get(fileId);
    if (task?.resumable) {
      await task.resumable.pauseAsync();
      task.status = "paused";

      const offlineFile = this.index.get(fileId);
      if (offlineFile) {
        offlineFile.status = "paused";
        await this.saveIndex();
      }

      this.emit("download:paused", fileId);
    }
  }

  /**
   * Resume a paused download
   */
  async resumeDownload(fileId: string): Promise<void> {
    const offlineFile = this.index.get(fileId);
    if (offlineFile && offlineFile.status === "paused") {
      offlineFile.status = "pending";
      await this.saveIndex();

      if (!this.downloadQueue.includes(fileId)) {
        this.downloadQueue.unshift(fileId); // Add to front
        await this.saveQueue();
      }

      this.processQueue();
    }
  }

  /**
   * Cancel a download
   */
  async cancelDownload(fileId: string): Promise<void> {
    // Remove from queue
    const queueIndex = this.downloadQueue.indexOf(fileId);
    if (queueIndex > -1) {
      this.downloadQueue.splice(queueIndex, 1);
      await this.saveQueue();
    }

    // Cancel active download
    const task = this.activeDownloads.get(fileId);
    if (task?.resumable) {
      await task.resumable.pauseAsync();
    }
    this.activeDownloads.delete(fileId);

    // Remove from index and delete partial file
    const offlineFile = this.index.get(fileId);
    if (offlineFile) {
      try {
        const info = await FileSystem.getInfoAsync(offlineFile.localPath);
        if (info.exists) {
          await FileSystem.deleteAsync(offlineFile.localPath, {
            idempotent: true,
          });
        }
      } catch {
        // Ignore delete errors
      }
      this.index.delete(fileId);
      await this.saveIndex();
    }

    this.emitSyncStatus();
  }

  /**
   * Retry a failed download
   */
  async retryDownload(fileId: string): Promise<void> {
    const offlineFile = this.index.get(fileId);
    if (offlineFile && offlineFile.status === "failed") {
      offlineFile.status = "pending";
      offlineFile.error = undefined;
      offlineFile.downloadProgress = 0;
      await this.saveIndex();

      if (!this.downloadQueue.includes(fileId)) {
        this.downloadQueue.push(fileId);
        await this.saveQueue();
      }

      this.processQueue();
    }
  }

  /**
   * Resume incomplete downloads on init
   */
  private async resumeIncompleteDownloads(): Promise<void> {
    for (const file of this.index.values()) {
      if (file.status === "downloading" || file.status === "pending") {
        // Reset to pending and re-queue
        file.status = "pending";
        file.downloadProgress = 0;
        if (!this.downloadQueue.includes(file.fileId)) {
          this.downloadQueue.push(file.fileId);
        }
      }
    }
    await this.saveIndex();
    await this.saveQueue();
    this.processQueue();
  }

  // ============================================================================
  // FILE ACCESS
  // ============================================================================

  /**
   * Get offline file by ID
   */
  getOfflineFile(fileId: string): OfflineFile | undefined {
    const file = this.index.get(fileId);
    if (file) {
      // Update last accessed time
      file.lastAccessedAt = Date.now();
      this.saveIndex(); // Don't await
    }
    return file;
  }

  /**
   * Check if file is available offline
   */
  isFileOffline(fileId: string): boolean {
    const file = this.index.get(fileId);
    return file?.status === "completed";
  }

  /**
   * Get local path for offline file
   */
  async getLocalPath(fileId: string): Promise<string | null> {
    const file = this.index.get(fileId);
    if (file && file.status === "completed") {
      const info = await FileSystem.getInfoAsync(file.localPath);
      if (info.exists) {
        file.lastAccessedAt = Date.now();
        this.saveIndex();
        return file.localPath;
      }
    }
    return null;
  }

  /**
   * List all offline files
   */
  getOfflineFiles(filter?: OfflineFileFilter): OfflineFile[] {
    let files = Array.from(this.index.values());

    // Apply filters
    if (filter) {
      if (filter.type && filter.type !== "all") {
        files = files.filter((f) => getFileType(f.contentType) === filter.type);
      }
      if (filter.status) {
        files = files.filter((f) => f.status === filter.status);
      }
      if (filter.search) {
        const search = filter.search.toLowerCase();
        files = files.filter(
          (f) =>
            f.filename.toLowerCase().includes(search) ||
            f.originalName.toLowerCase().includes(search),
        );
      }
      if (filter.pinned !== undefined) {
        files = files.filter((f) => f.isPinned === filter.pinned);
      }

      // Sort
      const sortBy = filter.sortBy || "downloadedAt";
      const sortOrder = filter.sortOrder || "desc";
      files.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case "name":
            comparison = a.originalName.localeCompare(b.originalName);
            break;
          case "size":
            comparison = a.fileSize - b.fileSize;
            break;
          case "downloadedAt":
            comparison = a.downloadedAt - b.downloadedAt;
            break;
          case "lastAccessedAt":
            comparison = a.lastAccessedAt - b.lastAccessedAt;
            break;
        }
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    return files;
  }

  /**
   * Pin/unpin a file (prevents auto-cleanup)
   */
  async togglePin(fileId: string): Promise<boolean> {
    const file = this.index.get(fileId);
    if (file) {
      file.isPinned = !file.isPinned;
      await this.saveIndex();
      return file.isPinned;
    }
    return false;
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  /**
   * Delete an offline file
   */
  async deleteOfflineFile(fileId: string): Promise<void> {
    const file = this.index.get(fileId);
    if (!file) return;

    // Cancel if downloading
    if (file.status === "downloading" || file.status === "pending") {
      await this.cancelDownload(fileId);
      return;
    }

    // Delete files
    try {
      const info = await FileSystem.getInfoAsync(file.localPath);
      if (info.exists) {
        await FileSystem.deleteAsync(file.localPath, { idempotent: true });
      }
      if (file.thumbnailPath) {
        await FileSystem.deleteAsync(file.thumbnailPath, { idempotent: true });
      }
    } catch {
      // Ignore delete errors
    }

    // Remove from index
    this.index.delete(fileId);
    await this.saveIndex();

    this.emitSyncStatus();
  }

  /**
   * Clear all offline files
   */
  async clearAllOfflineFiles(): Promise<void> {
    // Cancel all downloads
    for (const fileId of this.downloadQueue) {
      await this.cancelDownload(fileId);
    }

    // Delete all files
    try {
      await FileSystem.deleteAsync(OFFLINE_DIR, { idempotent: true });
      await this.ensureDirectories();
    } catch {
      // Ignore
    }

    // Clear index
    this.index.clear();
    this.downloadQueue = [];
    await this.saveIndex();
    await this.saveQueue();

    this.emitSyncStatus();
  }

  /**
   * Perform auto cleanup based on settings
   */
  async performAutoCleanup(): Promise<number> {
    if (!this.settings.autoCleanupEnabled) return 0;

    this.emit("cleanup:start");

    const now = Date.now();
    let freedBytes = 0;
    const filesToDelete: string[] = [];

    // Get current usage
    const quota = await this.getQuota();

    // Sort files by priority (unpinned, oldest first)
    const files = Array.from(this.index.values())
      .filter((f) => f.status === "completed" && !f.isPinned)
      .sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);

    for (const file of files) {
      // Delete expired files
      if (file.expiresAt && file.expiresAt < now) {
        filesToDelete.push(file.fileId);
        freedBytes += file.fileSize;
        continue;
      }

      // Delete old files if over quota threshold
      const currentUsage = quota.usedBytes - freedBytes;
      const usagePercent = (currentUsage / quota.maxBytes) * 100;

      if (usagePercent > this.settings.cleanupThresholdPercent) {
        const fileAgeDays = (now - file.lastAccessedAt) / (24 * 60 * 60 * 1000);
        if (fileAgeDays > 7) {
          // Only delete files older than 7 days
          filesToDelete.push(file.fileId);
          freedBytes += file.fileSize;
        }
      }
    }

    // Delete marked files
    for (const fileId of filesToDelete) {
      await this.deleteOfflineFile(fileId);
    }

    this.emit("cleanup:complete", freedBytes);
    console.log(
      `[OfflineFileService] Cleanup complete: freed ${formatFileSize(freedBytes)}`,
    );

    return freedBytes;
  }

  // ============================================================================
  // SYNC STATUS
  // ============================================================================

  getSyncStatus(): OfflineSyncStatus {
    return {
      isOnline: this.networkState?.isConnected ?? false,
      isSyncing: this.activeDownloads.size > 0,
      pendingDownloads: this.downloadQueue.length + this.activeDownloads.size,
      failedDownloads: Array.from(this.index.values()).filter(
        (f) => f.status === "failed",
      ).length,
      lastSyncAt: Date.now(),
    };
  }

  private emitSyncStatus(): void {
    this.emit("sync:change", this.getSyncStatus());
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const OfflineFileService = new OfflineFileServiceClass();

/**
 * Hook to use offline files
 */
export function useOfflineFiles(filter?: OfflineFileFilter) {
  const [files, setFiles] = useState<OfflineFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setFiles(OfflineFileService.getOfflineFiles(filter));
  }, [filter]);

  useEffect(() => {
    OfflineFileService.initialize().then(() => {
      refresh();
      setIsLoading(false);
    });

    const handleChange = () => refresh();
    OfflineFileService.on("download:complete", handleChange);
    OfflineFileService.on("download:error", handleChange);
    OfflineFileService.on("cleanup:complete", handleChange);

    return () => {
      OfflineFileService.off("download:complete", handleChange);
      OfflineFileService.off("download:error", handleChange);
      OfflineFileService.off("cleanup:complete", handleChange);
    };
  }, [refresh]);

  return { files, isLoading, refresh };
}

/**
 * Hook to manage offline quota
 */
export function useOfflineQuota() {
  const [quota, setQuota] = useState<OfflineQuota | null>(null);

  const refresh = useCallback(async () => {
    const q = await OfflineFileService.getQuota();
    setQuota(q);
  }, []);

  useEffect(() => {
    OfflineFileService.initialize().then(refresh);

    const handleChange = () => refresh();
    OfflineFileService.on("download:complete", handleChange);
    OfflineFileService.on("cleanup:complete", handleChange);
    OfflineFileService.on("quota:warning", handleChange);

    return () => {
      OfflineFileService.off("download:complete", handleChange);
      OfflineFileService.off("cleanup:complete", handleChange);
      OfflineFileService.off("quota:warning", handleChange);
    };
  }, [refresh]);

  return { quota, refresh };
}

/**
 * Hook to track download progress
 */
export function useDownloadProgress(fileId: string) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<OfflineFileStatus>("pending");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const file = OfflineFileService.getOfflineFile(fileId);
    if (file) {
      setProgress(file.downloadProgress);
      setStatus(file.status);
      setError(file.error || null);
    }

    const handleProgress = (id: string, p: number) => {
      if (id === fileId) setProgress(p);
    };

    const handleComplete = (file: OfflineFile) => {
      if (file.fileId === fileId) {
        setStatus("completed");
        setProgress(100);
      }
    };

    const handleError = (id: string, err: string) => {
      if (id === fileId) {
        setStatus("failed");
        setError(err);
      }
    };

    const handlePaused = (id: string) => {
      if (id === fileId) setStatus("paused");
    };

    OfflineFileService.on("download:progress", handleProgress);
    OfflineFileService.on("download:complete", handleComplete);
    OfflineFileService.on("download:error", handleError);
    OfflineFileService.on("download:paused", handlePaused);

    return () => {
      OfflineFileService.off("download:progress", handleProgress);
      OfflineFileService.off("download:complete", handleComplete);
      OfflineFileService.off("download:error", handleError);
      OfflineFileService.off("download:paused", handlePaused);
    };
  }, [fileId]);

  return { progress, status, error };
}

/**
 * Hook for offline sync status
 */
export function useOfflineSyncStatus() {
  const [status, setStatus] = useState<OfflineSyncStatus>(
    OfflineFileService.getSyncStatus(),
  );

  useEffect(() => {
    const handleChange = (newStatus: OfflineSyncStatus) => {
      setStatus(newStatus);
    };

    OfflineFileService.on("sync:change", handleChange);

    return () => {
      OfflineFileService.off("sync:change", handleChange);
    };
  }, []);

  return status;
}

/**
 * Hook for offline settings
 */
export function useOfflineSettings() {
  const [settings, setSettings] = useState<OfflineSettings>(
    OfflineFileService.getSettings(),
  );

  const updateSettings = useCallback(
    async (newSettings: Partial<OfflineSettings>) => {
      await OfflineFileService.saveSettings(newSettings);
      setSettings(OfflineFileService.getSettings());
    },
    [],
  );

  return { settings, updateSettings };
}

export default OfflineFileService;
