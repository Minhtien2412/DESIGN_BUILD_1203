/**
 * useCommunityFeed Hook
 * =====================
 *
 * Custom hook for managing community feed data with:
 * - Loading and error states
 * - Pagination
 * - Pull-to-refresh
 * - Filter by content type and source
 * - Search functionality
 * - Auto-refresh interval
 *
 * @author ThietKeResort Team
 * @created 2025-01-15
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    clearFeedCache,
    CommunityFeedItem,
    FeedFilter,
    FeedResponse,
    getCommunityFeed,
    searchCommunityFeed
} from "../services/communityFeedService";

// ============================================
// Types
// ============================================
export interface UseCommunityFeedOptions {
  initialFilter?: FeedFilter;
  pageSize?: number;
  autoRefresh?: boolean;
  autoRefreshInterval?: number; // ms
  projectId?: number;
}

export interface UseCommunityFeedReturn {
  // Data
  items: CommunityFeedItem[];
  totalCount: number;
  hasMore: boolean;
  sources: FeedResponse["sources"];

  // States
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;

  // Pagination
  page: number;
  loadMore: () => Promise<void>;

  // Actions
  refresh: () => Promise<void>;
  setFilter: (filter: FeedFilter) => void;
  clearFilter: () => void;
  search: (query: string) => Promise<void>;

  // Filter state
  activeFilter: FeedFilter;

  // Categorized data
  announcements: CommunityFeedItem[];
  developmentPlans: CommunityFeedItem[];
  news: CommunityFeedItem[];
  videos: CommunityFeedItem[];
  photos: CommunityFeedItem[];
}

// ============================================
// Hook Implementation
// ============================================
export function useCommunityFeed(
  options: UseCommunityFeedOptions = {}
): UseCommunityFeedReturn {
  const {
    initialFilter = {},
    pageSize = 20,
    autoRefresh = false,
    autoRefreshInterval = 5 * 60 * 1000, // 5 minutes
    projectId,
  } = options;

  // State
  const [items, setItems] = useState<CommunityFeedItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sources, setSources] = useState<FeedResponse["sources"]>({
    backend: 0,
    gnews: 0,
    pexels: 0,
    other: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<FeedFilter>(initialFilter);

  // Refs
  const isMounted = useRef(true);
  const autoRefreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // ============================================
  // Fetch Data
  // ============================================
  const fetchFeed = useCallback(
    async (pageNum: number, filter: FeedFilter, append = false) => {
      try {
        if (!append) {
          setIsLoading(true);
        }
        setError(null);

        const response = await getCommunityFeed({
          filter,
          page: pageNum,
          pageSize,
          projectId,
        });

        if (!isMounted.current) return;

        if (append) {
          setItems((prev) => [...prev, ...response.items]);
        } else {
          setItems(response.items);
        }

        setTotalCount(response.totalCount);
        setHasMore(response.hasMore);
        setSources(response.sources);
      } catch (err) {
        if (!isMounted.current) return;

        const errorMessage =
          err instanceof Error ? err.message : "Failed to load feed";
        setError(errorMessage);
        console.error("[useCommunityFeed] Error:", err);
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
          setIsRefreshing(false);
          setIsLoadingMore(false);
        }
      }
    },
    [pageSize, projectId]
  );

  // ============================================
  // Initial Load
  // ============================================
  useEffect(() => {
    isMounted.current = true;
    fetchFeed(1, activeFilter);

    return () => {
      isMounted.current = false;
    };
  }, []);

  // ============================================
  // Auto Refresh
  // ============================================
  useEffect(() => {
    if (autoRefresh) {
      autoRefreshTimer.current = setInterval(() => {
        if (!isLoading && !isRefreshing && !isLoadingMore) {
          refresh();
        }
      }, autoRefreshInterval);
    }

    return () => {
      if (autoRefreshTimer.current) {
        clearInterval(autoRefreshTimer.current);
      }
    };
  }, [
    autoRefresh,
    autoRefreshInterval,
    isLoading,
    isRefreshing,
    isLoadingMore,
  ]);

  // ============================================
  // Actions
  // ============================================
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setPage(1);
    clearFeedCache();
    await fetchFeed(1, activeFilter);
  }, [activeFilter, fetchFeed]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoading) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchFeed(nextPage, activeFilter, true);
  }, [page, hasMore, isLoadingMore, isLoading, activeFilter, fetchFeed]);

  const setFilter = useCallback(
    (filter: FeedFilter) => {
      setActiveFilter(filter);
      setPage(1);
      setItems([]);
      fetchFeed(1, filter);
    },
    [fetchFeed]
  );

  const clearFilter = useCallback(() => {
    setActiveFilter({});
    setPage(1);
    setItems([]);
    fetchFeed(1, {});
  }, [fetchFeed]);

  const search = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        clearFilter();
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const results = await searchCommunityFeed(query, {
          types: activeFilter.types,
          limit: pageSize,
        });

        if (isMounted.current) {
          setItems(results);
          setTotalCount(results.length);
          setHasMore(false);
          setPage(1);
        }
      } catch (err) {
        if (isMounted.current) {
          setError(err instanceof Error ? err.message : "Search failed");
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    },
    [activeFilter.types, pageSize, clearFilter]
  );

  // ============================================
  // Categorized Data (Memoized)
  // ============================================
  const categorizedData = useMemo(
    () => ({
      announcements: items.filter((i) => i.type === "announcement"),
      developmentPlans: items.filter((i) => i.type === "development_plan"),
      news: items.filter((i) => i.type === "news"),
      videos: items.filter((i) => i.type === "video"),
      photos: items.filter((i) => i.type === "photo"),
    }),
    [items]
  );

  // ============================================
  // Return
  // ============================================
  return {
    items,
    totalCount,
    hasMore,
    sources,

    isLoading,
    isRefreshing,
    isLoadingMore,
    error,

    page,
    loadMore,

    refresh,
    setFilter,
    clearFilter,
    search,

    activeFilter,

    ...categorizedData,
  };
}

// ============================================
// Specialized Hooks
// ============================================

/**
 * Hook for fetching only announcements
 */
export function useAnnouncements(projectId?: number) {
  const feed = useCommunityFeed({
    initialFilter: { types: ["announcement"] },
    projectId,
  });

  return {
    announcements: feed.announcements,
    isLoading: feed.isLoading,
    error: feed.error,
    refresh: feed.refresh,
  };
}

/**
 * Hook for fetching only development plans
 */
export function useDevelopmentPlans() {
  const feed = useCommunityFeed({
    initialFilter: { types: ["development_plan"] },
  });

  return {
    plans: feed.developmentPlans,
    isLoading: feed.isLoading,
    error: feed.error,
    refresh: feed.refresh,
  };
}

/**
 * Hook for fetching only news
 */
export function useNewsFeed(pageSize = 20) {
  const feed = useCommunityFeed({
    initialFilter: { types: ["news"] },
    pageSize,
  });

  return {
    news: feed.news,
    isLoading: feed.isLoading,
    error: feed.error,
    hasMore: feed.hasMore,
    loadMore: feed.loadMore,
    refresh: feed.refresh,
  };
}

/**
 * Hook for fetching only videos
 */
export function useVideosFeed(pageSize = 10) {
  const feed = useCommunityFeed({
    initialFilter: { types: ["video"] },
    pageSize,
  });

  return {
    videos: feed.videos,
    isLoading: feed.isLoading,
    error: feed.error,
    hasMore: feed.hasMore,
    loadMore: feed.loadMore,
    refresh: feed.refresh,
  };
}

/**
 * Hook for fetching only photos
 */
export function usePhotosFeed(pageSize = 20) {
  const feed = useCommunityFeed({
    initialFilter: { types: ["photo"] },
    pageSize,
  });

  return {
    photos: feed.photos,
    isLoading: feed.isLoading,
    error: feed.error,
    hasMore: feed.hasMore,
    loadMore: feed.loadMore,
    refresh: feed.refresh,
  };
}

export default useCommunityFeed;
