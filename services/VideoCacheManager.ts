/**
 * VideoCacheManager - LRU Video Cache với Quota Management
 * VIDEO-003: Prefetch & Cache Policy
 *
 * Features:
 * - LRU cache eviction
 * - Storage quota enforcement (default 2GB)
 * - Background prefetch với cancellation
 * - Cache hit rate telemetry
 * - Periodic cleanup
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

// ============================================================================
// TYPES
// ============================================================================

export interface CacheEntry {
  videoId: string;
  url: string;
  localPath: string;
  size: number; // bytes
  lastAccess: number; // timestamp
  createdAt: number;
  checksum?: string;
  quality: "high" | "medium" | "low";
}

export interface CacheIndex {
  version: number;
  entries: Record<string, CacheEntry>;
  totalSize: number;
  lastCleanup: number;
}

export interface CacheConfig {
  maxSizeBytes: number; // default 2GB
  prefetchAhead: number; // number of videos to prefetch
  cleanupIntervalMs: number; // periodic cleanup interval
  minFreeSpaceRatio: number; // keep at least this ratio free
}

export interface CacheStats {
  totalSize: number;
  entryCount: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  lastCleanup: number;
  oldestEntry: number | null;
  newestEntry: number | null;
}

export interface PrefetchTask {
  videoId: string;
  url: string;
  quality: "high" | "medium" | "low";
  priority: number; // lower = higher priority
  abortController?: AbortController;
  status: "pending" | "downloading" | "completed" | "cancelled" | "failed";
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CACHE_INDEX_KEY = "@video_cache_index";
const CACHE_STATS_KEY = "@video_cache_stats";
const CACHE_CONFIG_KEY = "@video_cache_config";
const CACHE_VERSION = 1;

const DEFAULT_CONFIG: CacheConfig = {
  maxSizeBytes: 2 * 1024 * 1024 * 1024, // 2GB
  prefetchAhead: 2,
  cleanupIntervalMs: 30 * 60 * 1000, // 30 minutes
  minFreeSpaceRatio: 0.1, // keep 10% free
};

const CACHE_DIR = `${FileSystem.cacheDirectory}video_cache/`;

// ============================================================================
// CACHE MANAGER CLASS
// ============================================================================

class VideoCacheManagerClass {
  private index: CacheIndex | null = null;
  private config: CacheConfig = DEFAULT_CONFIG;
  private stats = {
    hitCount: 0,
    missCount: 0,
  };
  private prefetchQueue: Map<string, PrefetchTask> = new Map();
  private isInitialized = false;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;
  private telemetryCallback?: (stats: CacheStats) => void;

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Ensure cache directory exists
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
      }

      // Load config
      const savedConfig = await AsyncStorage.getItem(CACHE_CONFIG_KEY);
      if (savedConfig) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) };
      }

      // Load cache index
      const savedIndex = await AsyncStorage.getItem(CACHE_INDEX_KEY);
      if (savedIndex) {
        this.index = JSON.parse(savedIndex);
        // Validate cache entries
        await this.validateCacheEntries();
      } else {
        this.index = this.createEmptyIndex();
      }

      // Load stats
      const savedStats = await AsyncStorage.getItem(CACHE_STATS_KEY);
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        this.stats.hitCount = parsed.hitCount || 0;
        this.stats.missCount = parsed.missCount || 0;
      }

      // Start periodic cleanup
      this.startCleanupTimer();

      this.isInitialized = true;
      this.log("Initialized", {
        entries: Object.keys(this.index?.entries || {}).length,
        totalSize: this.formatBytes(this.index?.totalSize || 0),
      });
    } catch (error) {
      console.error("[VideoCacheManager] Initialize error:", error);
      this.index = this.createEmptyIndex();
      this.isInitialized = true;
    }
  }

  private createEmptyIndex(): CacheIndex {
    return {
      version: CACHE_VERSION,
      entries: {},
      totalSize: 0,
      lastCleanup: Date.now(),
    };
  }

  // ============================================================================
  // CACHE OPERATIONS
  // ============================================================================

  /**
   * Get cached video path if available
   */
  async getCachedVideo(videoId: string): Promise<string | null> {
    await this.ensureInitialized();

    const entry = this.index?.entries[videoId];
    if (!entry) {
      this.stats.missCount++;
      this.saveTelemetry();
      return null;
    }

    // Verify file exists
    const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
    if (!fileInfo.exists) {
      // Remove stale entry
      await this.removeEntry(videoId);
      this.stats.missCount++;
      this.saveTelemetry();
      return null;
    }

    // Update last access
    entry.lastAccess = Date.now();
    await this.saveIndex();

    this.stats.hitCount++;
    this.saveTelemetry();
    this.log("Cache hit", { videoId });

    return entry.localPath;
  }

  /**
   * Check if video is cached
   */
  isCached(videoId: string): boolean {
    return !!this.index?.entries[videoId];
  }

  /**
   * Cache a video from URL
   */
  async cacheVideo(
    videoId: string,
    url: string,
    quality: "high" | "medium" | "low" = "medium"
  ): Promise<string | null> {
    await this.ensureInitialized();

    // Check if already cached
    const existing = await this.getCachedVideo(videoId);
    if (existing) return existing;

    // Check if we have space
    await this.ensureSpace();

    try {
      const localPath = this.getLocalPath(videoId, quality);

      // Download video
      const downloadResult = await FileSystem.downloadAsync(url, localPath);

      if (downloadResult.status !== 200) {
        this.log("Download failed", { videoId, status: downloadResult.status });
        return null;
      }

      // Get file size
      const fileInfo = await FileSystem.getInfoAsync(localPath, { size: true });
      const size = (fileInfo as { size?: number }).size || 0;

      // Check if size exceeds quota
      if (size > this.config.maxSizeBytes * 0.5) {
        // Single file > 50% of quota, don't cache
        await FileSystem.deleteAsync(localPath, { idempotent: true });
        this.log("File too large to cache", {
          videoId,
          size: this.formatBytes(size),
        });
        return null;
      }

      // Create entry
      const entry: CacheEntry = {
        videoId,
        url,
        localPath,
        size,
        lastAccess: Date.now(),
        createdAt: Date.now(),
        quality,
      };

      // Add to index
      this.index!.entries[videoId] = entry;
      this.index!.totalSize += size;

      await this.saveIndex();
      this.log("Cached video", { videoId, size: this.formatBytes(size) });

      return localPath;
    } catch (error) {
      console.error("[VideoCacheManager] Cache error:", error);
      return null;
    }
  }

  /**
   * Remove a video from cache
   */
  async removeEntry(videoId: string): Promise<void> {
    const entry = this.index?.entries[videoId];
    if (!entry) return;

    try {
      await FileSystem.deleteAsync(entry.localPath, { idempotent: true });
    } catch {
      // Ignore delete errors
    }

    if (this.index) {
      this.index.totalSize -= entry.size;
      delete this.index.entries[videoId];
      await this.saveIndex();
    }
  }

  /**
   * Clear entire cache
   */
  async clearCache(): Promise<void> {
    await this.ensureInitialized();

    try {
      // Delete cache directory
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
      // Recreate empty directory
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });

      // Reset index
      this.index = this.createEmptyIndex();
      await this.saveIndex();

      // Reset stats
      this.stats.hitCount = 0;
      this.stats.missCount = 0;
      await this.saveTelemetry();

      this.log("Cache cleared");
    } catch (error) {
      console.error("[VideoCacheManager] Clear error:", error);
    }
  }

  // ============================================================================
  // PREFETCH OPERATIONS
  // ============================================================================

  /**
   * Prefetch videos in advance
   */
  async prefetchVideos(
    videos: Array<{
      videoId: string;
      url: string;
      quality?: "high" | "medium" | "low";
    }>
  ): Promise<void> {
    await this.ensureInitialized();

    const toPrefetch = videos.slice(0, this.config.prefetchAhead);

    for (let i = 0; i < toPrefetch.length; i++) {
      const video = toPrefetch[i];

      // Skip if already cached or queued
      if (
        this.isCached(video.videoId) ||
        this.prefetchQueue.has(video.videoId)
      ) {
        continue;
      }

      const task: PrefetchTask = {
        videoId: video.videoId,
        url: video.url,
        quality: video.quality || "medium",
        priority: i,
        status: "pending",
      };

      this.prefetchQueue.set(video.videoId, task);
    }

    // Process queue
    this.processPrefetchQueue();
  }

  /**
   * Cancel all pending prefetch tasks
   */
  cancelAllPrefetch(): void {
    for (const [videoId, task] of this.prefetchQueue) {
      if (task.status === "pending" || task.status === "downloading") {
        task.status = "cancelled";
        task.abortController?.abort();
        this.log("Prefetch cancelled", { videoId });
      }
    }
    this.prefetchQueue.clear();
  }

  /**
   * Cancel prefetch for specific video
   */
  cancelPrefetch(videoId: string): void {
    const task = this.prefetchQueue.get(videoId);
    if (task && (task.status === "pending" || task.status === "downloading")) {
      task.status = "cancelled";
      task.abortController?.abort();
      this.prefetchQueue.delete(videoId);
      this.log("Prefetch cancelled", { videoId });
    }
  }

  private async processPrefetchQueue(): Promise<void> {
    // Get pending tasks sorted by priority
    const pendingTasks = Array.from(this.prefetchQueue.values())
      .filter((t) => t.status === "pending")
      .sort((a, b) => a.priority - b.priority);

    // Process one at a time to avoid overwhelming network
    for (const task of pendingTasks) {
      if (task.status !== "pending") continue;

      task.status = "downloading";

      try {
        await this.cacheVideo(task.videoId, task.url, task.quality);
        task.status = "completed";
      } catch {
        task.status = "failed";
      }

      this.prefetchQueue.delete(task.videoId);
    }
  }

  // ============================================================================
  // SPACE MANAGEMENT (LRU)
  // ============================================================================

  /**
   * Ensure we have space for new entries (LRU eviction)
   */
  private async ensureSpace(requiredBytes: number = 0): Promise<void> {
    if (!this.index) return;

    const targetSize =
      this.config.maxSizeBytes * (1 - this.config.minFreeSpaceRatio);
    const currentSize = this.index.totalSize;

    if (currentSize + requiredBytes <= targetSize) {
      return; // Enough space
    }

    // Sort entries by last access (oldest first)
    const entries = Object.values(this.index.entries).sort(
      (a, b) => a.lastAccess - b.lastAccess
    );

    let freedBytes = 0;
    const toRemove: string[] = [];

    for (const entry of entries) {
      if (currentSize - freedBytes + requiredBytes <= targetSize) {
        break;
      }
      toRemove.push(entry.videoId);
      freedBytes += entry.size;
    }

    // Remove entries
    for (const videoId of toRemove) {
      await this.removeEntry(videoId);
      this.log("Evicted (LRU)", { videoId });
    }
  }

  /**
   * Periodic cleanup job
   */
  async performCleanup(): Promise<number> {
    await this.ensureInitialized();
    if (!this.index) return 0;

    const startSize = this.index.totalSize;
    let removedCount = 0;

    // Validate all entries
    for (const [videoId, entry] of Object.entries(this.index.entries)) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
        if (!fileInfo.exists) {
          delete this.index.entries[videoId];
          this.index.totalSize -= entry.size;
          removedCount++;
        }
      } catch {
        delete this.index.entries[videoId];
        this.index.totalSize -= entry.size;
        removedCount++;
      }
    }

    // Enforce quota
    await this.ensureSpace();

    this.index.lastCleanup = Date.now();
    await this.saveIndex();

    const freedBytes = startSize - this.index.totalSize;
    if (freedBytes > 0) {
      this.log("Cleanup completed", {
        removed: removedCount,
        freed: this.formatBytes(freedBytes),
      });
    }

    return removedCount;
  }

  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, this.config.cleanupIntervalMs);
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  /**
   * Update cache configuration
   */
  async updateConfig(newConfig: Partial<CacheConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    await AsyncStorage.setItem(CACHE_CONFIG_KEY, JSON.stringify(this.config));

    // Restart cleanup timer if interval changed
    if (newConfig.cleanupIntervalMs) {
      this.startCleanupTimer();
    }

    // Enforce new quota if reduced
    if (newConfig.maxSizeBytes) {
      await this.ensureSpace();
    }

    this.log("Config updated", newConfig);
  }

  getConfig(): CacheConfig {
    return { ...this.config };
  }

  // ============================================================================
  // TELEMETRY & STATS
  // ============================================================================

  /**
   * Get current cache statistics
   */
  getStats(): CacheStats {
    const entries = Object.values(this.index?.entries || {});
    const total = this.stats.hitCount + this.stats.missCount;

    let oldest: number | null = null;
    let newest: number | null = null;

    for (const entry of entries) {
      if (oldest === null || entry.createdAt < oldest) {
        oldest = entry.createdAt;
      }
      if (newest === null || entry.createdAt > newest) {
        newest = entry.createdAt;
      }
    }

    return {
      totalSize: this.index?.totalSize || 0,
      entryCount: entries.length,
      hitCount: this.stats.hitCount,
      missCount: this.stats.missCount,
      hitRate: total > 0 ? this.stats.hitCount / total : 0,
      lastCleanup: this.index?.lastCleanup || 0,
      oldestEntry: oldest,
      newestEntry: newest,
    };
  }

  /**
   * Set telemetry callback
   */
  setTelemetryCallback(callback: (stats: CacheStats) => void): void {
    this.telemetryCallback = callback;
  }

  private async saveTelemetry(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        CACHE_STATS_KEY,
        JSON.stringify({
          hitCount: this.stats.hitCount,
          missCount: this.stats.missCount,
        })
      );

      if (this.telemetryCallback) {
        this.telemetryCallback(this.getStats());
      }
    } catch {
      // Ignore save errors
    }
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private async validateCacheEntries(): Promise<void> {
    if (!this.index) return;

    const toRemove: string[] = [];

    for (const [videoId, entry] of Object.entries(this.index.entries)) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(entry.localPath);
        if (!fileInfo.exists) {
          toRemove.push(videoId);
        }
      } catch {
        toRemove.push(videoId);
      }
    }

    for (const videoId of toRemove) {
      const entry = this.index.entries[videoId];
      if (entry) {
        this.index.totalSize -= entry.size;
        delete this.index.entries[videoId];
      }
    }

    if (toRemove.length > 0) {
      await this.saveIndex();
      this.log("Validated cache, removed stale entries", {
        count: toRemove.length,
      });
    }
  }

  private async saveIndex(): Promise<void> {
    if (!this.index) return;
    try {
      await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(this.index));
    } catch (error) {
      console.error("[VideoCacheManager] Save index error:", error);
    }
  }

  private getLocalPath(videoId: string, quality: string): string {
    // Sanitize videoId for filename
    const safeId = videoId.replace(/[^a-zA-Z0-9-_]/g, "_");
    return `${CACHE_DIR}${safeId}_${quality}.mp4`;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  private log(message: string, data?: Record<string, unknown>): void {
    if (__DEV__) {
      console.log(`[VideoCacheManager] ${message}`, data || "");
    }
  }

  /**
   * Cleanup on app termination
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.cancelAllPrefetch();
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const VideoCacheManager = new VideoCacheManagerClass();

// ============================================================================
// HOOKS
// ============================================================================

import { useCallback, useEffect, useState } from "react";

/**
 * Hook to get cached video URL
 */
export function useCachedVideo(
  videoId: string | undefined,
  originalUrl: string
) {
  const [url, setUrl] = useState<string>(originalUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    if (!videoId) {
      setUrl(originalUrl);
      setIsCached(false);
      return;
    }

    let mounted = true;

    const loadCached = async () => {
      setIsLoading(true);
      try {
        const cachedPath = await VideoCacheManager.getCachedVideo(videoId);
        if (mounted) {
          if (cachedPath) {
            setUrl(cachedPath);
            setIsCached(true);
          } else {
            setUrl(originalUrl);
            setIsCached(false);
          }
        }
      } catch {
        if (mounted) {
          setUrl(originalUrl);
          setIsCached(false);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadCached();

    return () => {
      mounted = false;
    };
  }, [videoId, originalUrl]);

  const cache = useCallback(async () => {
    if (!videoId) return null;
    return VideoCacheManager.cacheVideo(videoId, originalUrl);
  }, [videoId, originalUrl]);

  return { url, isLoading, isCached, cache };
}

/**
 * Hook to manage cache stats
 */
export function useCacheStats() {
  const [stats, setStats] = useState<CacheStats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      await VideoCacheManager.initialize();
      setStats(VideoCacheManager.getStats());
    };

    loadStats();

    // Subscribe to updates
    VideoCacheManager.setTelemetryCallback(setStats);

    return () => {
      VideoCacheManager.setTelemetryCallback(() => {});
    };
  }, []);

  const refresh = useCallback(async () => {
    setStats(VideoCacheManager.getStats());
  }, []);

  const clear = useCallback(async () => {
    await VideoCacheManager.clearCache();
    setStats(VideoCacheManager.getStats());
  }, []);

  return { stats, refresh, clear };
}

/**
 * Hook to manage cache config
 */
export function useCacheConfig() {
  const [config, setConfig] = useState<CacheConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const loadConfig = async () => {
      await VideoCacheManager.initialize();
      setConfig(VideoCacheManager.getConfig());
    };
    loadConfig();
  }, []);

  const updateConfig = useCallback(async (newConfig: Partial<CacheConfig>) => {
    await VideoCacheManager.updateConfig(newConfig);
    setConfig(VideoCacheManager.getConfig());
  }, []);

  return { config, updateConfig };
}
