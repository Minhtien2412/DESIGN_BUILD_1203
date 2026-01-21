/**
 * VideoFeedService - Feed API với Cursor Pagination
 * VIDEO-004: Feed APIs
 *
 * Features:
 * - Cursor-based pagination (stable across refreshes)
 * - Dedupe logic (by video ID)
 * - Multi-source feed support
 * - Trending algorithm hooks
 * - Following feed support
 */

import { get } from "./api";

// ============================================================================
// TYPES
// ============================================================================

export interface VideoItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  duration: number; // seconds
  views: number;
  likes: number;
  shares: number;
  saves: number;
  comments: number;
  createdAt: string;
  author: VideoAuthor;
  tags?: string[];
  musicInfo?: MusicInfo;
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
  quality?: VideoQuality[];
}

export interface VideoAuthor {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isVerified?: boolean;
  followerCount?: number;
}

export interface MusicInfo {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
}

export interface VideoQuality {
  quality: "low" | "medium" | "high" | "4k";
  url: string;
  width: number;
  height: number;
  bitrate: number;
}

export interface FeedCursor {
  position: string; // encoded cursor
  timestamp: number;
  feedType: FeedType;
  filters?: FeedFilters;
}

export interface FeedFilters {
  tags?: string[];
  authorId?: string;
  minDuration?: number;
  maxDuration?: number;
  hasMusic?: boolean;
}

export type FeedType =
  | "for_you"
  | "following"
  | "trending"
  | "discover"
  | "search";

export interface FeedResponse {
  videos: VideoItem[];
  nextCursor: string | null;
  prevCursor: string | null;
  hasMore: boolean;
  totalCount?: number;
  feedType: FeedType;
  timestamp: number;
}

export interface FeedRequest {
  feedType: FeedType;
  cursor?: string;
  limit?: number;
  filters?: FeedFilters;
  refresh?: boolean; // force refresh, ignore cache
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 30;
const FEED_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// DEDUPE MANAGER
// ============================================================================

class VideoDedupeManager {
  private seenIds: Set<string> = new Set();
  private sessionTimestamp: number = Date.now();

  /**
   * Filter out duplicate videos
   */
  dedupe(videos: VideoItem[]): VideoItem[] {
    const unique: VideoItem[] = [];

    for (const video of videos) {
      if (!this.seenIds.has(video.id)) {
        this.seenIds.add(video.id);
        unique.push(video);
      }
    }

    return unique;
  }

  /**
   * Check if video has been seen
   */
  hasSeen(videoId: string): boolean {
    return this.seenIds.has(videoId);
  }

  /**
   * Mark video as seen
   */
  markSeen(videoId: string): void {
    this.seenIds.add(videoId);
  }

  /**
   * Reset dedupe state (on refresh)
   */
  reset(): void {
    this.seenIds.clear();
    this.sessionTimestamp = Date.now();
  }

  /**
   * Get session info
   */
  getSessionInfo(): { seenCount: number; sessionStart: number } {
    return {
      seenCount: this.seenIds.size,
      sessionStart: this.sessionTimestamp,
    };
  }
}

// ============================================================================
// CURSOR ENCODER/DECODER
// ============================================================================

export function encodeCursor(data: {
  lastId: string;
  lastTimestamp: number;
  feedType: FeedType;
  offset?: number;
}): string {
  const json = JSON.stringify(data);
  return Buffer.from(json).toString("base64");
}

export function decodeCursor(cursor: string): {
  lastId: string;
  lastTimestamp: number;
  feedType: FeedType;
  offset?: number;
} | null {
  try {
    const json = Buffer.from(cursor, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ============================================================================
// FEED SERVICE
// ============================================================================

class VideoFeedServiceClass {
  private dedupeManager = new VideoDedupeManager();
  private feedCache: Map<string, { data: FeedResponse; timestamp: number }> =
    new Map();
  private loadingFeeds: Set<string> = new Set();

  // ============================================================================
  // MAIN FEED METHODS
  // ============================================================================

  /**
   * Fetch feed with cursor pagination
   */
  async getFeed(request: FeedRequest): Promise<FeedResponse> {
    const {
      feedType,
      cursor,
      limit = DEFAULT_PAGE_SIZE,
      filters,
      refresh,
    } = request;
    const pageSize = Math.min(limit, MAX_PAGE_SIZE);

    // Check cache (skip if refresh)
    if (!refresh && !cursor) {
      const cached = this.getCachedFeed(feedType, filters);
      if (cached) {
        return cached;
      }
    }

    // Prevent duplicate requests
    const loadingKey = `${feedType}-${cursor || "initial"}`;
    if (this.loadingFeeds.has(loadingKey)) {
      // Wait for existing request
      await new Promise((resolve) => setTimeout(resolve, 100));
      const cached = this.getCachedFeed(feedType, filters);
      if (cached) return cached;
    }

    this.loadingFeeds.add(loadingKey);

    try {
      // Reset dedupe on refresh
      if (refresh && !cursor) {
        this.dedupeManager.reset();
      }

      // Build API request
      const endpoint = this.getEndpoint(feedType);
      const params: Record<string, string | number | boolean> = {
        limit: pageSize,
      };

      if (cursor) {
        params.cursor = cursor;
      }

      if (filters) {
        if (filters.tags?.length) params.tags = filters.tags.join(",");
        if (filters.authorId) params.authorId = filters.authorId;
        if (filters.minDuration) params.minDuration = filters.minDuration;
        if (filters.maxDuration) params.maxDuration = filters.maxDuration;
        if (filters.hasMusic !== undefined) params.hasMusic = filters.hasMusic;
      }

      // Make API call
      const response = await get<{
        data: VideoItem[];
        pagination: {
          nextCursor: string | null;
          prevCursor: string | null;
          hasMore: boolean;
          total?: number;
        };
      }>(endpoint, { params });

      // Dedupe videos
      const deduped = this.dedupeManager.dedupe(response.data);

      const feedResponse: FeedResponse = {
        videos: deduped,
        nextCursor: response.pagination.nextCursor,
        prevCursor: response.pagination.prevCursor,
        hasMore: response.pagination.hasMore,
        totalCount: response.pagination.total,
        feedType,
        timestamp: Date.now(),
      };

      // Cache initial page
      if (!cursor) {
        this.cacheFeed(feedType, filters, feedResponse);
      }

      return feedResponse;
    } finally {
      this.loadingFeeds.delete(loadingKey);
    }
  }

  /**
   * Get For You feed (personalized)
   */
  async getForYouFeed(cursor?: string, refresh = false): Promise<FeedResponse> {
    return this.getFeed({
      feedType: "for_you",
      cursor,
      refresh,
    });
  }

  /**
   * Get Following feed
   */
  async getFollowingFeed(
    cursor?: string,
    refresh = false
  ): Promise<FeedResponse> {
    return this.getFeed({
      feedType: "following",
      cursor,
      refresh,
    });
  }

  /**
   * Get Trending feed
   */
  async getTrendingFeed(
    cursor?: string,
    refresh = false
  ): Promise<FeedResponse> {
    return this.getFeed({
      feedType: "trending",
      cursor,
      refresh,
    });
  }

  /**
   * Get Discover feed (explore new content)
   */
  async getDiscoverFeed(
    cursor?: string,
    filters?: FeedFilters,
    refresh = false
  ): Promise<FeedResponse> {
    return this.getFeed({
      feedType: "discover",
      cursor,
      filters,
      refresh,
    });
  }

  /**
   * Search videos
   */
  async searchVideos(
    query: string,
    cursor?: string,
    filters?: FeedFilters
  ): Promise<FeedResponse> {
    const response = await get<{
      data: VideoItem[];
      pagination: {
        nextCursor: string | null;
        prevCursor: string | null;
        hasMore: boolean;
        total?: number;
      };
    }>("/api/v1/videos/search", {
      params: {
        q: query,
        cursor: cursor || "",
        limit: DEFAULT_PAGE_SIZE,
        ...filters,
      },
    });

    const deduped = this.dedupeManager.dedupe(response.data);

    return {
      videos: deduped,
      nextCursor: response.pagination.nextCursor,
      prevCursor: response.pagination.prevCursor,
      hasMore: response.pagination.hasMore,
      totalCount: response.pagination.total,
      feedType: "search",
      timestamp: Date.now(),
    };
  }

  /**
   * Get videos by author
   */
  async getAuthorVideos(
    authorId: string,
    cursor?: string
  ): Promise<FeedResponse> {
    return this.getFeed({
      feedType: "discover",
      cursor,
      filters: { authorId },
    });
  }

  /**
   * Get videos by tag
   */
  async getTagVideos(tag: string, cursor?: string): Promise<FeedResponse> {
    return this.getFeed({
      feedType: "discover",
      cursor,
      filters: { tags: [tag] },
    });
  }

  // ============================================================================
  // SINGLE VIDEO
  // ============================================================================

  /**
   * Get single video by ID
   */
  async getVideo(videoId: string): Promise<VideoItem | null> {
    try {
      const response = await get<VideoItem>(`/api/v1/videos/${videoId}`);
      return response;
    } catch {
      return null;
    }
  }

  /**
   * Get related videos
   */
  async getRelatedVideos(videoId: string, limit = 10): Promise<VideoItem[]> {
    try {
      const response = await get<{ data: VideoItem[] }>(
        `/api/v1/videos/${videoId}/related`,
        { params: { limit } }
      );
      return this.dedupeManager.dedupe(response.data);
    } catch {
      return [];
    }
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  private getCacheKey(feedType: FeedType, filters?: FeedFilters): string {
    return `${feedType}-${JSON.stringify(filters || {})}`;
  }

  private getCachedFeed(
    feedType: FeedType,
    filters?: FeedFilters
  ): FeedResponse | null {
    const key = this.getCacheKey(feedType, filters);
    const cached = this.feedCache.get(key);

    if (cached && Date.now() - cached.timestamp < FEED_CACHE_TTL) {
      return cached.data;
    }

    return null;
  }

  private cacheFeed(
    feedType: FeedType,
    filters: FeedFilters | undefined,
    data: FeedResponse
  ): void {
    const key = this.getCacheKey(feedType, filters);
    this.feedCache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Clear all feed cache
   */
  clearCache(): void {
    this.feedCache.clear();
    this.dedupeManager.reset();
  }

  /**
   * Clear specific feed cache
   */
  clearFeedCache(feedType: FeedType, filters?: FeedFilters): void {
    const key = this.getCacheKey(feedType, filters);
    this.feedCache.delete(key);
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private getEndpoint(feedType: FeedType): string {
    switch (feedType) {
      case "for_you":
        return "/api/v1/videos/feed/for-you";
      case "following":
        return "/api/v1/videos/feed/following";
      case "trending":
        return "/api/v1/videos/feed/trending";
      case "discover":
        return "/api/v1/videos/feed/discover";
      default:
        return "/api/v1/videos/feed";
    }
  }

  /**
   * Get dedupe stats
   */
  getDedupeStats(): { seenCount: number; sessionStart: number } {
    return this.dedupeManager.getSessionInfo();
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const VideoFeedService = new VideoFeedServiceClass();

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseVideoFeedOptions {
  feedType: FeedType;
  filters?: FeedFilters;
  autoLoad?: boolean;
  pageSize?: number;
}

export interface UseVideoFeedResult {
  videos: VideoItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  cursor: string | null;
}

/**
 * Hook for infinite scroll video feed
 */
export function useVideoFeed(options: UseVideoFeedOptions): UseVideoFeedResult {
  const {
    feedType,
    filters,
    autoLoad = true,
    pageSize = DEFAULT_PAGE_SIZE,
  } = options;

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isMounted = useRef(true);

  // Initial load
  useEffect(() => {
    isMounted.current = true;
    if (autoLoad) {
      loadInitial();
    }
    return () => {
      isMounted.current = false;
    };
  }, [feedType, JSON.stringify(filters)]);

  const loadInitial = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await VideoFeedService.getFeed({
        feedType,
        filters,
        limit: pageSize,
      });

      if (isMounted.current) {
        setVideos(response.videos);
        setCursor(response.nextCursor);
        setHasMore(response.hasMore);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error("Load failed"));
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const refresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    setError(null);

    try {
      const response = await VideoFeedService.getFeed({
        feedType,
        filters,
        limit: pageSize,
        refresh: true,
      });

      if (isMounted.current) {
        setVideos(response.videos);
        setCursor(response.nextCursor);
        setHasMore(response.hasMore);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error("Refresh failed"));
      }
    } finally {
      if (isMounted.current) {
        setIsRefreshing(false);
      }
    }
  }, [feedType, filters, pageSize, isRefreshing]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !cursor) return;

    setIsLoadingMore(true);

    try {
      const response = await VideoFeedService.getFeed({
        feedType,
        filters,
        cursor,
        limit: pageSize,
      });

      if (isMounted.current) {
        setVideos((prev) => [...prev, ...response.videos]);
        setCursor(response.nextCursor);
        setHasMore(response.hasMore);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error("Load more failed"));
      }
    } finally {
      if (isMounted.current) {
        setIsLoadingMore(false);
      }
    }
  }, [feedType, filters, cursor, pageSize, hasMore, isLoadingMore]);

  return {
    videos,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
    cursor,
  };
}

/**
 * Hook for search with debounce
 */
export function useVideoSearch(debounceMs = 300) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<VideoItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setCursor(null);
      setHasMore(false);
      return;
    }

    let cancelled = false;

    const search = async () => {
      setIsSearching(true);
      try {
        const response = await VideoFeedService.searchVideos(debouncedQuery);
        if (!cancelled) {
          setResults(response.videos);
          setCursor(response.nextCursor);
          setHasMore(response.hasMore);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    };

    search();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const loadMore = useCallback(async () => {
    if (!cursor || !hasMore) return;

    setIsSearching(true);
    try {
      const response = await VideoFeedService.searchVideos(
        debouncedQuery,
        cursor
      );
      setResults((prev) => [...prev, ...response.videos]);
      setCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } finally {
      setIsSearching(false);
    }
  }, [debouncedQuery, cursor, hasMore]);

  const clear = useCallback(() => {
    setQuery("");
    setResults([]);
    setCursor(null);
    setHasMore(false);
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    hasMore,
    loadMore,
    clear,
  };
}
