/**
 * Unified Storage Service
 * Single API for all storage providers
 *
 * Auto-selects the best provider based on:
 * - File type (images → Cloudinary, documents → S3/Supabase)
 * - File size (large files → S3)
 * - User preference
 *
 * @module services/storage/unifiedStorage
 */

import ENV from "@/config/env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { backendStorageProvider } from "./backendStorage";
import {
    cloudinaryStorage,
    cloudinaryStorageProvider,
    TRANSFORM_PRESETS,
} from "./cloudinaryStorage";
import { s3StorageProvider } from "./s3Storage";
import { supabaseStorageProvider } from "./supabaseStorage";
import type {
    DownloadOptions,
    FileInfo,
    FolderInfo,
    IStorageProvider,
    ListFilesOptions,
    ListFilesResult,
    ShareOptions,
    ShareResult,
    StorageEvent,
    StorageEventCallback,
    StorageProvider,
    StorageStats,
    UploadOptions,
    UploadResult,
} from "./types";

// Storage configuration keys
const STORAGE_KEYS = {
  DEFAULT_PROVIDER: "storage:defaultProvider",
  USER_FILES: "storage:userFiles",
  UPLOAD_QUEUE: "storage:uploadQueue",
  SYNC_STATUS: "storage:syncStatus",
};
const CAN_USE_STORAGE =
  Platform.OS !== "web" || typeof window !== "undefined";

// Provider selection rules
interface ProviderRule {
  condition: (file: File | Blob | string, options: UploadOptions) => boolean;
  provider: StorageProvider;
  priority: number;
}

// Default provider selection rules
const DEFAULT_RULES: ProviderRule[] = [
  // Images → Cloudinary (optimization) - only if configured
  {
    condition: (file, options) => {
      if (!ENV.CLOUDINARY_CLOUD_NAME) return false;
      const mimeType = getMimeType(file, options.filename);
      return mimeType.startsWith("image/") && !mimeType.includes("svg");
    },
    provider: "cloudinary",
    priority: 10,
  },
  // Videos → Cloudinary (transcoding) - only if configured
  {
    condition: (file, options) => {
      if (!ENV.CLOUDINARY_CLOUD_NAME) return false;
      const mimeType = getMimeType(file, options.filename);
      return mimeType.startsWith("video/");
    },
    provider: "cloudinary",
    priority: 10,
  },
  // Large files (> 50MB) → S3 - only if configured
  {
    condition: (file) => {
      if (!ENV.AWS_S3_BUCKET) return false;
      const size = file instanceof Blob ? file.size : 0;
      return size > 50 * 1024 * 1024;
    },
    provider: "s3",
    priority: 20,
  },
  // User documents → Supabase (per-user) - only if configured
  {
    condition: (file, options) => {
      if (!isSupabaseConfigured()) return false;
      return !!options.userId;
    },
    provider: "supabase",
    priority: 5,
  },
  // Default → Backend (always available)
  {
    condition: () => true,
    provider: "backend",
    priority: 0,
  },
];

// Helper to get MIME type
function getMimeType(file: File | Blob | string, filename?: string): string {
  if (file instanceof Blob) {
    return file.type || "application/octet-stream";
  }
  if (typeof file === "string") {
    if (file.startsWith("data:")) {
      const match = file.match(/data:([^;]+)/);
      return match?.[1] || "application/octet-stream";
    }
    // From filename/path
    const name = filename || file;
    const ext = name.split(".").pop()?.toLowerCase() || "";
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
      mp4: "video/mp4",
      mov: "video/quicktime",
      webm: "video/webm",
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      dwg: "application/acad",
      dxf: "application/dxf",
    };
    return mimeTypes[ext] || "application/octet-stream";
  }
  return "application/octet-stream";
}

// Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Check if Supabase is configured
const isSupabaseConfigured = (): boolean => {
  return !!(
    ENV.SUPABASE_URL &&
    ENV.SUPABASE_ANON_KEY &&
    !ENV.SUPABASE_URL.includes("your-project")
  );
};

// Unified Storage Manager
class UnifiedStorageService {
  private providers: Map<StorageProvider, IStorageProvider>;
  private defaultProvider: StorageProvider = "backend"; // Default to backend
  private rules: ProviderRule[] = [...DEFAULT_RULES];
  private eventListeners: Set<StorageEventCallback> = new Set();
  private uploadQueue: Map<
    string,
    { file: any; options: UploadOptions; retries: number }
  > = new Map();
  private isOnline: boolean = true;

  constructor() {
    // Always include backend provider as fallback
    this.providers = new Map([
      ["backend", backendStorageProvider],
      ["s3", s3StorageProvider],
      ["cloudinary", cloudinaryStorageProvider],
    ]);

    // Only add Supabase if configured
    if (isSupabaseConfigured()) {
      this.providers.set("supabase", supabaseStorageProvider);
      this.defaultProvider = "supabase";
      console.log("[UnifiedStorage] Supabase configured, using as default");
    } else {
      console.log(
        "[UnifiedStorage] Supabase not configured, using backend as default",
      );
    }

    if (CAN_USE_STORAGE) {
      this.loadConfig();
      this.setupNetworkListener();
    }
  }

  // Load configuration from storage
  private async loadConfig(): Promise<void> {
    if (!CAN_USE_STORAGE) {
      return;
    }
    try {
      const provider = await AsyncStorage.getItem(
        STORAGE_KEYS.DEFAULT_PROVIDER,
      );
      if (provider && this.providers.has(provider as StorageProvider)) {
        this.defaultProvider = provider as StorageProvider;
      }

      // Load pending uploads
      const queue = await AsyncStorage.getItem(STORAGE_KEYS.UPLOAD_QUEUE);
      if (queue) {
        const items = JSON.parse(queue);
        // Re-queue pending uploads
        for (const [id, item] of Object.entries(items as Record<string, any>)) {
          this.uploadQueue.set(id, item);
        }
      }
    } catch (error) {
      console.warn("[UnifiedStorage] Failed to load config:", error);
    }
  }

  // Setup network listener for offline support
  private setupNetworkListener(): void {
    // Would use NetInfo in production
    // For now, assume online
    this.isOnline = true;
  }

  // Get provider based on rules
  private selectProvider(
    file: File | Blob | string,
    options: UploadOptions,
  ): IStorageProvider {
    // If explicitly specified
    if (options.provider && this.providers.has(options.provider)) {
      return this.providers.get(options.provider)!;
    }

    // Apply rules
    const matchedRules = this.rules
      .filter((rule) => rule.condition(file, options))
      .sort((a, b) => b.priority - a.priority);

    if (matchedRules.length > 0) {
      const provider = this.providers.get(matchedRules[0].provider);
      if (provider) return provider;
    }

    // Fallback to default
    return this.providers.get(this.defaultProvider)!;
  }

  // Set default provider
  async setDefaultProvider(provider: StorageProvider): Promise<void> {
    if (!this.providers.has(provider)) {
      throw new Error(`Unknown provider: ${provider}`);
    }
    this.defaultProvider = provider;
    await AsyncStorage.setItem(STORAGE_KEYS.DEFAULT_PROVIDER, provider);
  }

  // Get current default provider
  getDefaultProvider(): StorageProvider {
    return this.defaultProvider;
  }

  // Add custom provider rule
  addRule(rule: ProviderRule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  // ====================
  // FILE OPERATIONS
  // ====================

  /**
   * Upload file with automatic provider selection
   */
  async upload(
    file: File | Blob | string,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    const provider = this.selectProvider(file, options);

    console.log(`[UnifiedStorage] Uploading via ${provider.name}`);

    // If offline, queue for later
    if (!this.isOnline) {
      return this.queueUpload(file, options);
    }

    try {
      const result = await provider.upload(file, options);

      // Track in local index
      await this.trackFile(result, options.userId);

      // Emit event
      this.emitEvent({
        type: "file:created",
        fileId: result.id,
        userId: options.userId || "anonymous",
        path: result.path,
        timestamp: new Date(),
        metadata: { provider: provider.name, size: result.size },
      });

      return result;
    } catch (error: any) {
      console.error(`[UnifiedStorage] Upload failed:`, error);

      // Retry with fallback provider
      if (provider.name !== "supabase" && options.provider !== "supabase") {
        console.log("[UnifiedStorage] Retrying with Supabase fallback...");
        return this.providers.get("supabase")!.upload(file, options);
      }

      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple(
    files: Array<{ file: File | Blob | string; options?: UploadOptions }>,
    options: {
      parallel?: boolean;
      onProgress?: (completed: number, total: number) => void;
    } = {},
  ): Promise<UploadResult[]> {
    const { parallel = true, onProgress } = options;
    const results: UploadResult[] = [];

    if (parallel) {
      // Upload in parallel (max 5 at a time)
      const chunks = [];
      for (let i = 0; i < files.length; i += 5) {
        chunks.push(files.slice(i, i + 5));
      }

      for (const chunk of chunks) {
        const chunkResults = await Promise.allSettled(
          chunk.map(({ file, options: opts }) => this.upload(file, opts)),
        );

        for (const result of chunkResults) {
          if (result.status === "fulfilled") {
            results.push(result.value);
          }
        }

        onProgress?.(results.length, files.length);
      }
    } else {
      // Upload sequentially
      for (const { file, options: opts } of files) {
        const result = await this.upload(file, opts);
        results.push(result);
        onProgress?.(results.length, files.length);
      }
    }

    return results;
  }

  /**
   * Download file
   */
  async download(
    path: string,
    options: DownloadOptions & { provider?: StorageProvider } = {},
  ): Promise<Blob | string> {
    const provider = options.provider
      ? this.providers.get(options.provider)!
      : await this.detectProvider(path);

    return provider.download(path, options);
  }

  /**
   * Delete file
   */
  async delete(path: string, provider?: StorageProvider): Promise<void> {
    const targetProvider = provider
      ? this.providers.get(provider)!
      : await this.detectProvider(path);

    await targetProvider.delete(path);

    // Remove from local index
    await this.untrackFile(path);

    this.emitEvent({
      type: "file:deleted",
      path,
      userId: "current",
      timestamp: new Date(),
    });
  }

  /**
   * Move file
   */
  async move(
    fromPath: string,
    toPath: string,
    provider?: StorageProvider,
  ): Promise<FileInfo> {
    const targetProvider = provider
      ? this.providers.get(provider)!
      : await this.detectProvider(fromPath);

    const result = await targetProvider.move(fromPath, toPath);

    this.emitEvent({
      type: "file:moved",
      fileId: result.id,
      path: toPath,
      userId: "current",
      timestamp: new Date(),
      metadata: { fromPath },
    });

    return result;
  }

  /**
   * Copy file
   */
  async copy(
    fromPath: string,
    toPath: string,
    provider?: StorageProvider,
  ): Promise<FileInfo> {
    const targetProvider = provider
      ? this.providers.get(provider)!
      : await this.detectProvider(fromPath);

    return targetProvider.copy(fromPath, toPath);
  }

  // ====================
  // FOLDER OPERATIONS
  // ====================

  /**
   * Create folder
   */
  async createFolder(
    path: string,
    provider: StorageProvider = this.defaultProvider,
  ): Promise<FolderInfo> {
    const targetProvider = this.providers.get(provider)!;
    const result = await targetProvider.createFolder(path);

    this.emitEvent({
      type: "folder:created",
      folderId: result.id,
      path,
      userId: "current",
      timestamp: new Date(),
    });

    return result;
  }

  /**
   * Delete folder
   */
  async deleteFolder(
    path: string,
    recursive: boolean = false,
    provider?: StorageProvider,
  ): Promise<void> {
    const targetProvider = provider
      ? this.providers.get(provider)!
      : await this.detectProvider(path);

    await targetProvider.deleteFolder(path, recursive);

    this.emitEvent({
      type: "folder:deleted",
      folderId: path,
      path,
      userId: "current",
      timestamp: new Date(),
    });
  }

  /**
   * List files in a folder
   */
  async listFiles(
    options: ListFilesOptions & { provider?: StorageProvider } = {},
  ): Promise<ListFilesResult> {
    const provider = options.provider
      ? this.providers.get(options.provider)!
      : this.providers.get(this.defaultProvider)!;

    return provider.listFiles(options);
  }

  /**
   * List all user files across providers
   */
  async listAllUserFiles(userId: string): Promise<ListFilesResult> {
    const results: ListFilesResult = {
      files: [],
      folders: [],
      total: 0,
      hasMore: false,
    };

    // Gather from all providers
    const providers: StorageProvider[] = ["supabase", "s3", "cloudinary"];

    await Promise.all(
      providers.map(async (providerName) => {
        try {
          const provider = this.providers.get(providerName)!;
          const { files, folders } = await provider.listFiles({
            folder: `${userId}/`,
            limit: 1000,
          });

          // Tag files with provider
          files.forEach((f) => {
            (f as any).provider = providerName;
          });

          results.files.push(...files);
          results.folders.push(...folders);
        } catch (error) {
          console.warn(
            `[UnifiedStorage] Failed to list files from ${providerName}:`,
            error,
          );
        }
      }),
    );

    results.total = results.files.length + results.folders.length;
    return results;
  }

  // ====================
  // URL & SHARING
  // ====================

  /**
   * Get public URL
   */
  getPublicUrl(path: string, provider?: StorageProvider): string {
    const targetProvider = provider
      ? this.providers.get(provider)!
      : this.providers.get(this.defaultProvider)!;

    return targetProvider.getPublicUrl(path);
  }

  /**
   * Get signed URL for private access
   */
  async getSignedUrl(
    path: string,
    expiresIn: number = 3600,
    provider?: StorageProvider,
  ): Promise<string> {
    const targetProvider = provider
      ? this.providers.get(provider)!
      : await this.detectProvider(path);

    return targetProvider.getSignedUrl(path, expiresIn);
  }

  /**
   * Share file
   */
  async share(
    path: string,
    options: ShareOptions,
    provider?: StorageProvider,
  ): Promise<ShareResult> {
    const targetProvider = provider
      ? this.providers.get(provider)!
      : await this.detectProvider(path);

    const result = await targetProvider.share(path, options);

    this.emitEvent({
      type: "share:created",
      fileId: path,
      path,
      userId: "current",
      timestamp: new Date(),
      metadata: { shareId: result.shareId },
    });

    return result;
  }

  /**
   * Revoke share
   */
  async revokeShare(
    shareId: string,
    provider?: StorageProvider,
  ): Promise<void> {
    const targetProvider = provider
      ? this.providers.get(provider)!
      : this.providers.get(this.defaultProvider)!;

    await targetProvider.revokeShare(shareId);

    this.emitEvent({
      type: "share:revoked",
      path: shareId,
      userId: "current",
      timestamp: new Date(),
    });
  }

  // ====================
  // METADATA & INFO
  // ====================

  /**
   * Get file info
   */
  async getFileInfo(
    path: string,
    provider?: StorageProvider,
  ): Promise<FileInfo> {
    const targetProvider = provider
      ? this.providers.get(provider)!
      : await this.detectProvider(path);

    return targetProvider.getFileInfo(path);
  }

  /**
   * Update file metadata
   */
  async updateMetadata(
    path: string,
    metadata: Record<string, string>,
    provider?: StorageProvider,
  ): Promise<FileInfo> {
    const targetProvider = provider
      ? this.providers.get(provider)!
      : await this.detectProvider(path);

    return targetProvider.updateMetadata(path, metadata);
  }

  // ====================
  // STATS
  // ====================

  /**
   * Get storage stats for a user
   */
  async getStats(
    userId?: string,
  ): Promise<StorageStats & { byProvider: Record<string, StorageStats> }> {
    const byProvider: Record<string, StorageStats> = {};
    const aggregated: StorageStats = {
      totalFiles: 0,
      totalSize: 0,
      usedQuota: 0,
      maxQuota: 0,
      byType: {},
      recentUploads: 0,
    };

    // Gather stats from all providers
    await Promise.all(
      Array.from(this.providers.entries()).map(async ([name, provider]) => {
        try {
          const stats = await provider.getStats(userId);
          byProvider[name] = stats;

          aggregated.totalFiles += stats.totalFiles;
          aggregated.totalSize += stats.totalSize;
          aggregated.usedQuota += stats.usedQuota;
          aggregated.maxQuota += stats.maxQuota;
          aggregated.recentUploads += stats.recentUploads;

          // Merge byType
          for (const [type, data] of Object.entries(stats.byType)) {
            if (!aggregated.byType[type]) {
              aggregated.byType[type] = { count: 0, size: 0 };
            }
            aggregated.byType[type].count += data.count;
            aggregated.byType[type].size += data.size;
          }
        } catch (error) {
          console.warn(
            `[UnifiedStorage] Failed to get stats from ${name}:`,
            error,
          );
        }
      }),
    );

    return { ...aggregated, byProvider };
  }

  // ====================
  // REAL-TIME EVENTS
  // ====================

  /**
   * Subscribe to storage events
   */
  subscribe(callback: StorageEventCallback): () => void {
    this.eventListeners.add(callback);

    // Also subscribe to individual providers
    const unsubscribers = Array.from(this.providers.values()).map((p) =>
      p.subscribe(callback),
    );

    return () => {
      this.eventListeners.delete(callback);
      unsubscribers.forEach((unsub) => unsub());
    };
  }

  private emitEvent(event: StorageEvent): void {
    this.eventListeners.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error("[UnifiedStorage] Event listener error:", error);
      }
    });
  }

  // ====================
  // OFFLINE SUPPORT
  // ====================

  /**
   * Queue upload for later (offline mode)
   */
  private async queueUpload(
    file: File | Blob | string,
    options: UploadOptions,
  ): Promise<UploadResult> {
    const queueId = `pending_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    this.uploadQueue.set(queueId, { file, options, retries: 0 });

    // Persist queue
    const queueData = Object.fromEntries(this.uploadQueue);
    await AsyncStorage.setItem(
      STORAGE_KEYS.UPLOAD_QUEUE,
      JSON.stringify(queueData),
    );

    // Return placeholder result
    return {
      id: queueId,
      url: "",
      filename: options.filename || "pending",
      path: `pending/${queueId}`,
      size: file instanceof Blob ? file.size : 0,
      mimeType: getMimeType(file, options.filename),
      provider: "local" as StorageProvider,
      createdAt: new Date(),
      metadata: { status: "pending" },
    };
  }

  /**
   * Process pending uploads
   */
  async processPendingUploads(): Promise<void> {
    if (!this.isOnline || this.uploadQueue.size === 0) return;

    console.log(
      `[UnifiedStorage] Processing ${this.uploadQueue.size} pending uploads`,
    );

    for (const [id, { file, options, retries }] of this.uploadQueue) {
      try {
        await this.upload(file, options);
        this.uploadQueue.delete(id);
      } catch (error) {
        console.error(
          `[UnifiedStorage] Failed to process pending upload ${id}:`,
          error,
        );
        if (retries < 3) {
          this.uploadQueue.set(id, { file, options, retries: retries + 1 });
        } else {
          this.uploadQueue.delete(id);
        }
      }
    }

    // Update persisted queue
    const queueData = Object.fromEntries(this.uploadQueue);
    await AsyncStorage.setItem(
      STORAGE_KEYS.UPLOAD_QUEUE,
      JSON.stringify(queueData),
    );
  }

  // ====================
  // HELPERS
  // ====================

  /**
   * Detect provider from path or URL
   */
  private async detectProvider(pathOrUrl: string): Promise<IStorageProvider> {
    if (pathOrUrl.includes("cloudinary.com"))
      return this.providers.get("cloudinary")!;
    if (pathOrUrl.includes("s3.") || pathOrUrl.includes("amazonaws.com"))
      return this.providers.get("s3")!;
    if (pathOrUrl.includes("supabase")) return this.providers.get("supabase")!;

    // Check local index
    try {
      const files = await AsyncStorage.getItem(STORAGE_KEYS.USER_FILES);
      if (files) {
        const index = JSON.parse(files);
        const fileInfo = index[pathOrUrl];
        if (fileInfo?.provider) {
          return this.providers.get(fileInfo.provider)!;
        }
      }
    } catch {
      // Ignore
    }

    return this.providers.get(this.defaultProvider)!;
  }

  /**
   * Track file in local index
   */
  private async trackFile(
    result: UploadResult,
    userId?: string,
  ): Promise<void> {
    try {
      const filesJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_FILES);
      const files = filesJson ? JSON.parse(filesJson) : {};

      files[result.path] = {
        id: result.id,
        url: result.url,
        provider: result.provider,
        size: result.size,
        mimeType: result.mimeType,
        userId,
        createdAt: result.createdAt.toISOString(),
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_FILES,
        JSON.stringify(files),
      );
    } catch (error) {
      console.warn("[UnifiedStorage] Failed to track file:", error);
    }
  }

  /**
   * Remove file from local index
   */
  private async untrackFile(path: string): Promise<void> {
    try {
      const filesJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_FILES);
      if (filesJson) {
        const files = JSON.parse(filesJson);
        delete files[path];
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_FILES,
          JSON.stringify(files),
        );
      }
    } catch (error) {
      console.warn("[UnifiedStorage] Failed to untrack file:", error);
    }
  }

  // ====================
  // IMAGE HELPERS
  // ====================

  /**
   * Get optimized image URL (via Cloudinary)
   */
  getOptimizedImageUrl(
    path: string,
    options: {
      width?: number;
      height?: number;
      quality?: string | number;
    } = {},
  ): string {
    if (path.includes("cloudinary.com") || !path.includes("http")) {
      return cloudinaryStorage.getOptimizedUrl(path, options);
    }
    // For non-Cloudinary images, return as-is
    return path;
  }

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(path: string): string {
    if (path.includes("cloudinary.com") || !path.includes("http")) {
      return cloudinaryStorage.buildTransformUrl(
        path,
        TRANSFORM_PRESETS.thumbnail,
      );
    }
    return path;
  }

  /**
   * Get video thumbnail
   */
  getVideoThumbnail(
    path: string,
    options?: { width?: number; height?: number },
  ): string {
    if (path.includes("cloudinary.com") || !path.includes("http")) {
      return cloudinaryStorage.getVideoThumbnail(path, options);
    }
    return path;
  }
}

// Export singleton instance
const storageService = new UnifiedStorageService();
export default storageService;

// Export class for custom instances
export { UnifiedStorageService };

// Convenience exports
export const {
  upload,
  uploadMultiple,
  download,
  delete: deleteFile,
  move,
  copy,
  createFolder,
  deleteFolder,
  listFiles,
  listAllUserFiles,
  getPublicUrl,
  getSignedUrl,
  share,
  revokeShare,
  getFileInfo,
  updateMetadata,
  getStats,
  subscribe,
  setDefaultProvider,
  getDefaultProvider,
  getOptimizedImageUrl,
  getThumbnailUrl,
  getVideoThumbnail,
} = storageService;
