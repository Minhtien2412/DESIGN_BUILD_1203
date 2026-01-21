/**
 * VideoInteractionsService - Like/View/Save/Share tracking
 * VIDEO-005: Video Interactions
 *
 * Features:
 * - Batch stats endpoint
 * - Idempotent view counting
 * - Like/save toggle
 * - Offline queue integration
 * - Optimistic UI updates
 * - Real-time counter animation
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { get, post } from "./api";

// ============================================================================
// TYPES
// ============================================================================

export interface VideoStats {
  videoId: string;
  views: number;
  likes: number;
  shares: number;
  saves: number;
  comments: number;
  isLiked: boolean;
  isSaved: boolean;
  lastUpdated: number;
}

export interface InteractionEvent {
  type: "view" | "like" | "unlike" | "save" | "unsave" | "share";
  videoId: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface BatchStatsRequest {
  videoIds: string[];
}

export interface BatchStatsResponse {
  stats: Record<string, VideoStats>;
  timestamp: number;
}

export interface ViewParams {
  videoId: string;
  watchDuration: number; // seconds watched
  totalDuration: number; // total video duration
  sessionId?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const OFFLINE_QUEUE_KEY = "@video_interactions_queue";
const LOCAL_STATS_KEY = "@video_local_stats";
const VIEW_THRESHOLD = 0.3; // 30% of video to count as view
const MIN_VIEW_DURATION = 3; // minimum 3 seconds

// ============================================================================
// OFFLINE QUEUE MANAGER
// ============================================================================

class OfflineQueueManager {
  private queue: InteractionEvent[] = [];
  private isSyncing = false;

  async initialize(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (saved) {
        this.queue = JSON.parse(saved);
      }
    } catch {
      this.queue = [];
    }
  }

  async add(event: InteractionEvent): Promise<void> {
    // Dedupe: remove opposite actions
    this.queue = this.queue.filter((e) => {
      if (e.videoId !== event.videoId) return true;
      // Remove like if adding unlike, and vice versa
      if (event.type === "like" && e.type === "unlike") return false;
      if (event.type === "unlike" && e.type === "like") return false;
      if (event.type === "save" && e.type === "unsave") return false;
      if (event.type === "unsave" && e.type === "save") return false;
      return true;
    });

    this.queue.push(event);
    await this.persist();
  }

  async sync(): Promise<{ success: number; failed: number }> {
    if (this.isSyncing || this.queue.length === 0) {
      return { success: 0, failed: 0 };
    }

    this.isSyncing = true;
    let success = 0;
    let failed = 0;

    try {
      const toSync = [...this.queue];

      for (const event of toSync) {
        try {
          await this.syncEvent(event);
          this.queue = this.queue.filter((e) => e !== event);
          success++;
        } catch {
          failed++;
        }
      }

      await this.persist();
    } finally {
      this.isSyncing = false;
    }

    return { success, failed };
  }

  private async syncEvent(event: InteractionEvent): Promise<void> {
    switch (event.type) {
      case "view":
        await post(`/api/v1/videos/${event.videoId}/view`, event.metadata);
        break;
      case "like":
        await post(`/api/v1/videos/${event.videoId}/like`);
        break;
      case "unlike":
        await post(`/api/v1/videos/${event.videoId}/unlike`);
        break;
      case "save":
        await post(`/api/v1/videos/${event.videoId}/save`);
        break;
      case "unsave":
        await post(`/api/v1/videos/${event.videoId}/unsave`);
        break;
      case "share":
        await post(`/api/v1/videos/${event.videoId}/share`, event.metadata);
        break;
    }
  }

  private async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.queue));
    } catch {
      // Ignore persist errors
    }
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getQueue(): InteractionEvent[] {
    return [...this.queue];
  }
}

// ============================================================================
// LOCAL STATS CACHE
// ============================================================================

class LocalStatsCache {
  private stats: Map<string, VideoStats> = new Map();
  private dirty = new Set<string>();

  async initialize(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(LOCAL_STATS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, VideoStats>;
        Object.entries(parsed).forEach(([id, stat]) => {
          this.stats.set(id, stat);
        });
      }
    } catch {
      // Ignore load errors
    }
  }

  get(videoId: string): VideoStats | null {
    return this.stats.get(videoId) || null;
  }

  set(videoId: string, stats: VideoStats): void {
    this.stats.set(videoId, stats);
    this.dirty.add(videoId);
  }

  setMany(statsMap: Record<string, VideoStats>): void {
    Object.entries(statsMap).forEach(([id, stat]) => {
      this.stats.set(id, stat);
    });
  }

  // Optimistic update
  optimisticUpdate(
    videoId: string,
    update: Partial<VideoStats>
  ): { previous: VideoStats | null; current: VideoStats } {
    const previous = this.stats.get(videoId) || null;
    const current: VideoStats = {
      videoId,
      views: previous?.views || 0,
      likes: previous?.likes || 0,
      shares: previous?.shares || 0,
      saves: previous?.saves || 0,
      comments: previous?.comments || 0,
      isLiked: previous?.isLiked || false,
      isSaved: previous?.isSaved || false,
      lastUpdated: Date.now(),
      ...update,
    };

    this.stats.set(videoId, current);
    this.dirty.add(videoId);

    return { previous, current };
  }

  // Rollback optimistic update
  rollback(videoId: string, previous: VideoStats | null): void {
    if (previous) {
      this.stats.set(videoId, previous);
    } else {
      this.stats.delete(videoId);
    }
    this.dirty.delete(videoId);
  }

  async persist(): Promise<void> {
    if (this.dirty.size === 0) return;

    try {
      const toSave: Record<string, VideoStats> = {};
      this.stats.forEach((stat, id) => {
        toSave[id] = stat;
      });
      await AsyncStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(toSave));
      this.dirty.clear();
    } catch {
      // Ignore persist errors
    }
  }
}

// ============================================================================
// VIEW TRACKER (Idempotent)
// ============================================================================

class ViewTracker {
  private viewedSessions: Map<string, Set<string>> = new Map(); // videoId -> sessionIds
  private currentSession: string;

  constructor() {
    this.currentSession = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if view should be counted (idempotent)
   */
  shouldCountView(params: ViewParams): boolean {
    const { videoId, watchDuration, totalDuration, sessionId } = params;
    const session = sessionId || this.currentSession;

    // Check minimum duration
    if (watchDuration < MIN_VIEW_DURATION) {
      return false;
    }

    // Check percentage threshold
    const watchPercentage = watchDuration / totalDuration;
    if (watchPercentage < VIEW_THRESHOLD) {
      return false;
    }

    // Check if already viewed in this session
    const sessions = this.viewedSessions.get(videoId) || new Set();
    if (sessions.has(session)) {
      return false; // Already counted in this session
    }

    return true;
  }

  /**
   * Mark video as viewed in session
   */
  markViewed(videoId: string, sessionId?: string): void {
    const session = sessionId || this.currentSession;
    const sessions = this.viewedSessions.get(videoId) || new Set();
    sessions.add(session);
    this.viewedSessions.set(videoId, sessions);
  }

  /**
   * Reset session (e.g., on app restart)
   */
  newSession(): void {
    this.currentSession = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getCurrentSession(): string {
    return this.currentSession;
  }
}

// ============================================================================
// MAIN SERVICE
// ============================================================================

class VideoInteractionsServiceClass {
  private offlineQueue = new OfflineQueueManager();
  private localStats = new LocalStatsCache();
  private viewTracker = new ViewTracker();
  private listeners: Map<string, Set<(stats: VideoStats) => void>> = new Map();
  private isInitialized = false;

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await Promise.all([
      this.offlineQueue.initialize(),
      this.localStats.initialize(),
    ]);

    this.isInitialized = true;

    // Try to sync any pending interactions
    this.syncPending();
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  // ============================================================================
  // BATCH STATS
  // ============================================================================

  /**
   * Fetch stats for multiple videos at once
   */
  async batchGetStats(videoIds: string[]): Promise<Record<string, VideoStats>> {
    await this.ensureInitialized();

    try {
      const response = await post<BatchStatsResponse>(
        "/api/v1/videos/batch-stats",
        {
          videoIds,
        }
      );

      // Update local cache
      this.localStats.setMany(response.stats);

      // Notify listeners
      Object.entries(response.stats).forEach(([id, stats]) => {
        this.notifyListeners(id, stats);
      });

      return response.stats;
    } catch {
      // Return cached stats on error
      const cached: Record<string, VideoStats> = {};
      videoIds.forEach((id) => {
        const stat = this.localStats.get(id);
        if (stat) {
          cached[id] = stat;
        }
      });
      return cached;
    }
  }

  /**
   * Get stats for single video
   */
  async getStats(videoId: string): Promise<VideoStats | null> {
    await this.ensureInitialized();

    // Try local cache first
    const cached = this.localStats.get(videoId);

    try {
      const response = await get<VideoStats>(`/api/v1/videos/${videoId}/stats`);
      this.localStats.set(videoId, response);
      this.notifyListeners(videoId, response);
      return response;
    } catch {
      return cached;
    }
  }

  // ============================================================================
  // VIEW TRACKING (Idempotent)
  // ============================================================================

  /**
   * Record video view with idempotency
   */
  async recordView(params: ViewParams): Promise<VideoStats | null> {
    await this.ensureInitialized();

    // Check if view should be counted
    if (!this.viewTracker.shouldCountView(params)) {
      return this.localStats.get(params.videoId);
    }

    // Mark as viewed
    this.viewTracker.markViewed(params.videoId);

    // Optimistic update
    const { previous, current } = this.localStats.optimisticUpdate(
      params.videoId,
      {
        views: (this.localStats.get(params.videoId)?.views || 0) + 1,
      }
    );

    this.notifyListeners(params.videoId, current);

    try {
      // Send to server
      await post(`/api/v1/videos/${params.videoId}/view`, {
        watchDuration: params.watchDuration,
        totalDuration: params.totalDuration,
        sessionId: this.viewTracker.getCurrentSession(),
      });

      await this.localStats.persist();
      return current;
    } catch {
      // Queue for offline sync
      await this.offlineQueue.add({
        type: "view",
        videoId: params.videoId,
        timestamp: Date.now(),
        metadata: {
          watchDuration: params.watchDuration,
          totalDuration: params.totalDuration,
          sessionId: this.viewTracker.getCurrentSession(),
        },
      });

      return current;
    }
  }

  // ============================================================================
  // LIKE/UNLIKE
  // ============================================================================

  /**
   * Toggle like with optimistic update
   */
  async toggleLike(
    videoId: string
  ): Promise<{ isLiked: boolean; likes: number }> {
    await this.ensureInitialized();

    const current = this.localStats.get(videoId);
    const wasLiked = current?.isLiked || false;
    const newLiked = !wasLiked;
    const newLikes = (current?.likes || 0) + (newLiked ? 1 : -1);

    // Optimistic update
    const { previous, current: updated } = this.localStats.optimisticUpdate(
      videoId,
      {
        isLiked: newLiked,
        likes: Math.max(0, newLikes),
      }
    );

    this.notifyListeners(videoId, updated);

    try {
      const endpoint = newLiked ? "like" : "unlike";
      await post(`/api/v1/videos/${videoId}/${endpoint}`);
      await this.localStats.persist();
    } catch {
      // Queue for offline sync
      await this.offlineQueue.add({
        type: newLiked ? "like" : "unlike",
        videoId,
        timestamp: Date.now(),
      });
    }

    return { isLiked: newLiked, likes: Math.max(0, newLikes) };
  }

  // ============================================================================
  // SAVE/UNSAVE
  // ============================================================================

  /**
   * Toggle save with optimistic update
   */
  async toggleSave(
    videoId: string
  ): Promise<{ isSaved: boolean; saves: number }> {
    await this.ensureInitialized();

    const current = this.localStats.get(videoId);
    const wasSaved = current?.isSaved || false;
    const newSaved = !wasSaved;
    const newSaves = (current?.saves || 0) + (newSaved ? 1 : -1);

    // Optimistic update
    const { previous, current: updated } = this.localStats.optimisticUpdate(
      videoId,
      {
        isSaved: newSaved,
        saves: Math.max(0, newSaves),
      }
    );

    this.notifyListeners(videoId, updated);

    try {
      const endpoint = newSaved ? "save" : "unsave";
      await post(`/api/v1/videos/${videoId}/${endpoint}`);
      await this.localStats.persist();
    } catch {
      // Queue for offline sync
      await this.offlineQueue.add({
        type: newSaved ? "save" : "unsave",
        videoId,
        timestamp: Date.now(),
      });
    }

    return { isSaved: newSaved, saves: Math.max(0, newSaves) };
  }

  // ============================================================================
  // SHARE
  // ============================================================================

  /**
   * Record share event
   */
  async recordShare(
    videoId: string,
    platform: "copy" | "facebook" | "twitter" | "whatsapp" | "other"
  ): Promise<number> {
    await this.ensureInitialized();

    const current = this.localStats.get(videoId);
    const newShares = (current?.shares || 0) + 1;

    // Optimistic update
    const { current: updated } = this.localStats.optimisticUpdate(videoId, {
      shares: newShares,
    });

    this.notifyListeners(videoId, updated);

    try {
      await post(`/api/v1/videos/${videoId}/share`, { platform });
      await this.localStats.persist();
    } catch {
      // Queue for offline sync
      await this.offlineQueue.add({
        type: "share",
        videoId,
        timestamp: Date.now(),
        metadata: { platform },
      });
    }

    return newShares;
  }

  // ============================================================================
  // OFFLINE SYNC
  // ============================================================================

  /**
   * Sync pending offline interactions
   */
  async syncPending(): Promise<{ success: number; failed: number }> {
    return this.offlineQueue.sync();
  }

  /**
   * Get pending queue size
   */
  getPendingCount(): number {
    return this.offlineQueue.getQueueSize();
  }

  // ============================================================================
  // LISTENERS (for real-time UI updates)
  // ============================================================================

  /**
   * Subscribe to stats updates for a video
   */
  subscribe(
    videoId: string,
    callback: (stats: VideoStats) => void
  ): () => void {
    const listeners = this.listeners.get(videoId) || new Set();
    listeners.add(callback);
    this.listeners.set(videoId, listeners);

    // Return unsubscribe function
    return () => {
      const current = this.listeners.get(videoId);
      if (current) {
        current.delete(callback);
        if (current.size === 0) {
          this.listeners.delete(videoId);
        }
      }
    };
  }

  private notifyListeners(videoId: string, stats: VideoStats): void {
    const listeners = this.listeners.get(videoId);
    if (listeners) {
      listeners.forEach((callback) => callback(stats));
    }
  }

  // ============================================================================
  // CACHE
  // ============================================================================

  /**
   * Get cached stats without network call
   */
  getCachedStats(videoId: string): VideoStats | null {
    return this.localStats.get(videoId);
  }

  /**
   * Clear all cached stats
   */
  async clearCache(): Promise<void> {
    await AsyncStorage.multiRemove([OFFLINE_QUEUE_KEY, LOCAL_STATS_KEY]);
    this.localStats = new LocalStatsCache();
    await this.localStats.initialize();
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const VideoInteractionsService = new VideoInteractionsServiceClass();

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useCallback, useEffect, useState } from "react";

/**
 * Hook for video interactions with optimistic updates
 */
export function useVideoInteractions(videoId: string) {
  const [stats, setStats] = useState<VideoStats | null>(
    VideoInteractionsService.getCachedStats(videoId)
  );
  const [isLoading, setIsLoading] = useState(false);

  // Subscribe to updates
  useEffect(() => {
    const unsubscribe = VideoInteractionsService.subscribe(videoId, setStats);

    // Fetch latest stats
    setIsLoading(true);
    VideoInteractionsService.getStats(videoId).finally(() =>
      setIsLoading(false)
    );

    return unsubscribe;
  }, [videoId]);

  const toggleLike = useCallback(async () => {
    return VideoInteractionsService.toggleLike(videoId);
  }, [videoId]);

  const toggleSave = useCallback(async () => {
    return VideoInteractionsService.toggleSave(videoId);
  }, [videoId]);

  const recordShare = useCallback(
    async (
      platform: "copy" | "facebook" | "twitter" | "whatsapp" | "other"
    ) => {
      return VideoInteractionsService.recordShare(videoId, platform);
    },
    [videoId]
  );

  const recordView = useCallback(
    async (watchDuration: number, totalDuration: number) => {
      return VideoInteractionsService.recordView({
        videoId,
        watchDuration,
        totalDuration,
      });
    },
    [videoId]
  );

  return {
    stats,
    isLoading,
    isLiked: stats?.isLiked || false,
    isSaved: stats?.isSaved || false,
    likes: stats?.likes || 0,
    saves: stats?.saves || 0,
    shares: stats?.shares || 0,
    views: stats?.views || 0,
    comments: stats?.comments || 0,
    toggleLike,
    toggleSave,
    recordShare,
    recordView,
  };
}

/**
 * Hook for batch loading stats
 */
export function useBatchVideoStats(videoIds: string[]) {
  const [stats, setStats] = useState<Record<string, VideoStats>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (videoIds.length === 0) return;

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const result = await VideoInteractionsService.batchGetStats(videoIds);
        if (!cancelled) {
          setStats(result);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [videoIds.join(",")]);

  return { stats, isLoading };
}
