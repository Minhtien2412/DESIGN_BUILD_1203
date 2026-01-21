/**
 * Hook để lấy external content (videos, articles, photos)
 * Sử dụng cho các màn hình cần hiển thị nội dung bổ sung
 * 
 * @created 16/01/2026
 * 
 * @example
 * // Trong component
 * const { videos, isLoading } = useExternalVideos({ category: 'construction' });
 * 
 * // Hiển thị dưới dạng "Video tham khảo"
 * {dbVideos.length === 0 && videos.length > 0 && (
 *   <Section title="Video tham khảo">
 *     {videos.map(v => <VideoCard key={v.id} video={v} />)}
 *   </Section>
 * )}
 */

import * as ExternalContent from '@/services/externalContentService';
import { useCallback, useEffect, useState } from 'react';

// ==================== useExternalVideos ====================

interface UseExternalVideosOptions {
  category?: 'general' | 'villa' | 'interior' | 'timelapse';
  page?: number;
  perPage?: number;
  enabled?: boolean;
}

interface UseExternalVideosResult {
  videos: ExternalContent.ExternalVideo[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useExternalVideos(options: UseExternalVideosOptions = {}): UseExternalVideosResult {
  const { category = 'general', page = 1, perPage = 10, enabled = true } = options;
  
  const [videos, setVideos] = useState<ExternalContent.ExternalVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(page);
  const [hasMore, setHasMore] = useState(true);

  const fetchVideos = useCallback(async (pageNum: number, append = false) => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await ExternalContent.getConstructionVideos(pageNum, perPage, category);
      
      if (append) {
        setVideos(prev => [...prev, ...data]);
      } else {
        setVideos(data);
      }
      
      setHasMore(data.length === perPage);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Không thể tải video'));
    } finally {
      setIsLoading(false);
    }
  }, [category, perPage, enabled]);

  const refetch = useCallback(async () => {
    setCurrentPage(1);
    await fetchVideos(1, false);
  }, [fetchVideos]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await fetchVideos(nextPage, true);
  }, [currentPage, fetchVideos, hasMore, isLoading]);

  useEffect(() => {
    fetchVideos(page, false);
  }, [category, enabled]); // eslint-disable-line

  return { videos, isLoading, error, refetch, loadMore, hasMore };
}

// ==================== useExternalNews ====================

interface UseExternalNewsOptions {
  category?: 'general' | 'realEstate' | 'architecture' | 'interior';
  topic?: string;
  max?: number;
  enabled?: boolean;
}

interface UseExternalNewsResult {
  articles: ExternalContent.ExternalArticle[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useExternalNews(options: UseExternalNewsOptions = {}): UseExternalNewsResult {
  const { category = 'general', topic, max = 10, enabled = true } = options;
  
  const [articles, setArticles] = useState<ExternalContent.ExternalArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchNews = useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let data: ExternalContent.ExternalArticle[];
      
      if (topic) {
        data = await ExternalContent.getNewsByTopic(topic, max);
      } else {
        data = await ExternalContent.getConstructionNews(max, category);
      }
      
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Không thể tải tin tức'));
    } finally {
      setIsLoading(false);
    }
  }, [category, topic, max, enabled]);

  const refetch = useCallback(async () => {
    await fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    fetchNews();
  }, [category, topic, enabled]); // eslint-disable-line

  return { articles, isLoading, error, refetch };
}

// ==================== useExternalPhotos ====================

interface UseExternalPhotosOptions {
  category?: 'general' | 'villa' | 'interior' | 'material';
  page?: number;
  perPage?: number;
  enabled?: boolean;
}

interface UseExternalPhotosResult {
  photos: ExternalContent.ExternalPhoto[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useExternalPhotos(options: UseExternalPhotosOptions = {}): UseExternalPhotosResult {
  const { category = 'general', page = 1, perPage = 15, enabled = true } = options;
  
  const [photos, setPhotos] = useState<ExternalContent.ExternalPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(page);
  const [hasMore, setHasMore] = useState(true);

  const fetchPhotos = useCallback(async (pageNum: number, append = false) => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await ExternalContent.getConstructionPhotos(pageNum, perPage, category);
      
      if (append) {
        setPhotos(prev => [...prev, ...data]);
      } else {
        setPhotos(data);
      }
      
      setHasMore(data.length === perPage);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Không thể tải ảnh'));
    } finally {
      setIsLoading(false);
    }
  }, [category, perPage, enabled]);

  const refetch = useCallback(async () => {
    setCurrentPage(1);
    await fetchPhotos(1, false);
  }, [fetchPhotos]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await fetchPhotos(nextPage, true);
  }, [currentPage, fetchPhotos, hasMore, isLoading]);

  useEffect(() => {
    fetchPhotos(page, false);
  }, [category, enabled]); // eslint-disable-line

  return { photos, isLoading, error, refetch, loadMore, hasMore };
}

// ==================== useCombinedFeed ====================

interface UseCombinedFeedOptions {
  videosCount?: number;
  articlesCount?: number;
  photosCount?: number;
  enabled?: boolean;
}

interface UseCombinedFeedResult {
  feed: ExternalContent.FeedItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCombinedFeed(options: UseCombinedFeedOptions = {}): UseCombinedFeedResult {
  const { videosCount = 5, articlesCount = 5, photosCount = 5, enabled = true } = options;
  
  const [feed, setFeed] = useState<ExternalContent.FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchFeed = useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await ExternalContent.getCombinedFeed({
        videosCount,
        articlesCount,
        photosCount,
      });
      
      setFeed(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Không thể tải feed'));
    } finally {
      setIsLoading(false);
    }
  }, [videosCount, articlesCount, photosCount, enabled]);

  const refetch = useCallback(async () => {
    await fetchFeed();
  }, [fetchFeed]);

  useEffect(() => {
    fetchFeed();
  }, [enabled]); // eslint-disable-line

  return { feed, isLoading, error, refetch };
}

// ==================== useExternalContentStatus ====================

export function useExternalContentStatus() {
  const [status, setStatus] = useState({ pexels: false, gnews: false });

  useEffect(() => {
    setStatus(ExternalContent.getStatus());
  }, []);

  return {
    isConfigured: status.pexels || status.gnews,
    hasPexels: status.pexels,
    hasGNews: status.gnews,
  };
}
