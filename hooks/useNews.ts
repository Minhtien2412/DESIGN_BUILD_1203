/**
 * useNews Hook
 * Hook để quản lý tin tức trong app
 * 
 * @author AI Assistant
 * @date 14/01/2026
 */

import {
    fetchBreakingNews,
    fetchNews,
    fetchNewsByCategory,
    fetchNewsDetail,
    markNewsAsRead,
    NewsCategory,
    NewsFilter,
    NewsItem,
} from '@/services/newsService';
import { useCallback, useState } from 'react';

interface UseNewsState {
  news: NewsItem[];
  breakingNews: NewsItem[];
  selectedNews: NewsItem | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
}

interface UseNewsReturn extends UseNewsState {
  loadNews: (filter?: NewsFilter) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  loadBreaking: () => Promise<void>;
  loadByCategory: (category: NewsCategory) => Promise<void>;
  selectNews: (newsId: string) => Promise<void>;
  clearSelection: () => void;
  markAsRead: (newsId: string) => Promise<void>;
}

/**
 * Hook quản lý tin tức
 * 
 * @example
 * const { news, loading, loadNews, refresh } = useNews();
 * 
 * useEffect(() => {
 *   loadNews({ limit: 10 });
 * }, []);
 */
export function useNews(initialFilter?: NewsFilter): UseNewsReturn {
  const [state, setState] = useState<UseNewsState>({
    news: [],
    breakingNews: [],
    selectedNews: null,
    loading: false,
    refreshing: false,
    error: null,
    hasMore: false,
    total: 0,
  });

  const [currentFilter, setCurrentFilter] = useState<NewsFilter>(
    initialFilter || { limit: 20, offset: 0 }
  );

  // Load news with filter
  const loadNews = useCallback(async (filter?: NewsFilter) => {
    const newFilter = filter || currentFilter;
    setCurrentFilter(newFilter);

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await fetchNews(newFilter);
      setState(prev => ({
        ...prev,
        news: newFilter.offset ? [...prev.news, ...result.items] : result.items,
        hasMore: result.hasMore,
        total: result.total,
        loading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load news';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
    }
  }, [currentFilter]);

  // Load more (pagination)
  const loadMore = useCallback(async () => {
    if (state.loading || !state.hasMore) return;

    const newFilter = {
      ...currentFilter,
      offset: (currentFilter.offset || 0) + (currentFilter.limit || 20),
    };

    await loadNews(newFilter);
  }, [state.loading, state.hasMore, currentFilter, loadNews]);

  // Refresh (pull to refresh)
  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, refreshing: true }));

    const refreshFilter = { ...currentFilter, offset: 0 };
    
    try {
      const result = await fetchNews(refreshFilter);
      setState(prev => ({
        ...prev,
        news: result.items,
        hasMore: result.hasMore,
        total: result.total,
        refreshing: false,
        error: null,
      }));
      setCurrentFilter(refreshFilter);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh';
      setState(prev => ({ ...prev, refreshing: false, error: errorMessage }));
    }
  }, [currentFilter]);

  // Load breaking news
  const loadBreaking = useCallback(async () => {
    try {
      const breaking = await fetchBreakingNews();
      setState(prev => ({ ...prev, breakingNews: breaking }));
    } catch (error) {
      console.warn('[useNews] Failed to load breaking news:', error);
    }
  }, []);

  // Load news by category
  const loadByCategory = useCallback(async (category: NewsCategory) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const items = await fetchNewsByCategory(category, 20);
      setState(prev => ({
        ...prev,
        news: items,
        loading: false,
        hasMore: items.length >= 20,
      }));
      setCurrentFilter({ category, limit: 20, offset: 0 });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
    }
  }, []);

  // Select news for detail view
  const selectNews = useCallback(async (newsId: string) => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const detail = await fetchNewsDetail(newsId);
      setState(prev => ({
        ...prev,
        selectedNews: detail,
        loading: false,
        // Update read status in list
        news: prev.news.map(n => 
          n.id === newsId ? { ...n, isRead: true } : n
        ),
      }));
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedNews: null }));
  }, []);

  // Mark as read
  const markAsRead = useCallback(async (newsId: string) => {
    await markNewsAsRead(newsId);
    setState(prev => ({
      ...prev,
      news: prev.news.map(n => 
        n.id === newsId ? { ...n, isRead: true } : n
      ),
    }));
  }, []);

  return {
    ...state,
    loadNews,
    loadMore,
    refresh,
    loadBreaking,
    loadByCategory,
    selectNews,
    clearSelection,
    markAsRead,
  };
}

export default useNews;
