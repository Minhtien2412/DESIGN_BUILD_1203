/**
 * News Service
 * Quản lý tin tức và gửi push notification khi có tin mới
 * 
 * @author AI Assistant
 * @date 14/01/2026
 */

import { apiFetch } from './api';
import { PushNotificationService } from './pushNotificationService';

// =====================================================
// TYPES
// =====================================================

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
  category: NewsCategory;
  author?: string;
  publishedAt: string;
  isBreaking?: boolean;
  isRead?: boolean;
  viewCount?: number;
  tags?: string[];
}

export type NewsCategory = 
  | 'general'          // Tin tức chung
  | 'construction'     // Xây dựng
  | 'design'           // Thiết kế
  | 'real_estate'      // Bất động sản
  | 'material'         // Vật liệu
  | 'technology'       // Công nghệ
  | 'policy'           // Chính sách
  | 'company';         // Tin công ty

export interface NewsFilter {
  category?: NewsCategory;
  search?: string;
  isBreaking?: boolean;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface NewsFeed {
  items: NewsItem[];
  total: number;
  hasMore: boolean;
}

// =====================================================
// LOCAL STORAGE (Offline Support)
// =====================================================

const NEWS_STORAGE_KEY = '@news_cache';
const NEWS_READ_KEY = '@news_read_ids';

/**
 * Lưu tin tức vào local storage
 */
export async function cacheNews(news: NewsItem[]): Promise<void> {
  try {
    const { setSecureItem } = await import('@/utils/storage');
    await setSecureItem(NEWS_STORAGE_KEY, JSON.stringify(news));
  } catch (error) {
    console.warn('[NewsService] Failed to cache news:', error);
  }
}

/**
 * Lấy tin tức từ cache
 */
export async function getCachedNews(): Promise<NewsItem[]> {
  try {
    const { getSecureItem } = await import('@/utils/storage');
    const cached = await getSecureItem(NEWS_STORAGE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.warn('[NewsService] Failed to get cached news:', error);
    return [];
  }
}

/**
 * Đánh dấu tin đã đọc
 */
export async function markNewsAsRead(newsId: string): Promise<void> {
  try {
    const { getSecureItem, setSecureItem } = await import('@/utils/storage');
    const readIds = await getSecureItem(NEWS_READ_KEY);
    const ids: string[] = readIds ? JSON.parse(readIds) : [];
    
    if (!ids.includes(newsId)) {
      ids.push(newsId);
      await setSecureItem(NEWS_READ_KEY, JSON.stringify(ids));
    }
  } catch (error) {
    console.warn('[NewsService] Failed to mark news as read:', error);
  }
}

/**
 * Lấy danh sách ID tin đã đọc
 */
export async function getReadNewsIds(): Promise<string[]> {
  try {
    const { getSecureItem } = await import('@/utils/storage');
    const readIds = await getSecureItem(NEWS_READ_KEY);
    return readIds ? JSON.parse(readIds) : [];
  } catch (error) {
    return [];
  }
}

// =====================================================
// API CALLS
// =====================================================

/**
 * Lấy danh sách tin tức từ server
 */
export async function fetchNews(filter?: NewsFilter): Promise<NewsFeed> {
  try {
    const params = new URLSearchParams();
    
    if (filter?.category) params.append('category', filter.category);
    if (filter?.search) params.append('search', filter.search);
    if (filter?.isBreaking) params.append('isBreaking', 'true');
    if (filter?.startDate) params.append('startDate', filter.startDate);
    if (filter?.endDate) params.append('endDate', filter.endDate);
    if (filter?.limit) params.append('limit', filter.limit.toString());
    if (filter?.offset) params.append('offset', filter.offset.toString());

    const queryString = params.toString();
    const url = `/news${queryString ? `?${queryString}` : ''}`;

    const response = await apiFetch(url);
    
    // Cache the news for offline access
    if (response.items) {
      await cacheNews(response.items);
    }

    // Mark read status
    const readIds = await getReadNewsIds();
    const items = (response.items || []).map((item: NewsItem) => ({
      ...item,
      isRead: readIds.includes(item.id),
    }));

    return {
      items,
      total: response.total || items.length,
      hasMore: response.hasMore ?? false,
    };
  } catch (error) {
    console.warn('[NewsService] API failed, using cache:', error);
    
    // Fallback to cached news
    const cachedNews = await getCachedNews();
    return {
      items: cachedNews,
      total: cachedNews.length,
      hasMore: false,
    };
  }
}

/**
 * Lấy chi tiết một tin tức
 */
export async function fetchNewsDetail(newsId: string): Promise<NewsItem | null> {
  try {
    const response = await apiFetch(`/news/${newsId}`);
    
    // Mark as read
    await markNewsAsRead(newsId);
    
    return response;
  } catch (error) {
    // Try to find in cache
    const cachedNews = await getCachedNews();
    const cached = cachedNews.find(n => n.id === newsId);
    
    if (cached) {
      await markNewsAsRead(newsId);
      return cached;
    }
    
    console.error('[NewsService] Failed to fetch news detail:', error);
    return null;
  }
}

/**
 * Lấy tin tức nổi bật (breaking news)
 */
export async function fetchBreakingNews(): Promise<NewsItem[]> {
  const result = await fetchNews({ isBreaking: true, limit: 5 });
  return result.items;
}

/**
 * Lấy tin tức theo category
 */
export async function fetchNewsByCategory(
  category: NewsCategory,
  limit = 10
): Promise<NewsItem[]> {
  const result = await fetchNews({ category, limit });
  return result.items;
}

// =====================================================
// SERVER-SIDE: TẠO TIN MỚI & GỬI PUSH
// (Dùng trong backend/admin panel)
// =====================================================

/**
 * Tạo tin tức mới và gửi push notification
 * Gọi từ backend khi admin tạo tin mới
 */
export async function createNewsAndNotify(
  news: Omit<NewsItem, 'id' | 'publishedAt' | 'viewCount'>,
  pushTokens: string[],
  options?: {
    sendPush?: boolean;
    isBreaking?: boolean;
  }
): Promise<NewsItem> {
  try {
    // Tạo tin mới trên server
    const response = await apiFetch('/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...news,
        isBreaking: options?.isBreaking ?? news.isBreaking,
      }),
    });

    const createdNews: NewsItem = response;

    // Gửi push notification nếu được yêu cầu
    if (options?.sendPush !== false && pushTokens.length > 0) {
      const pushResult = await PushNotificationService.sendNews(pushTokens, {
        id: createdNews.id,
        title: createdNews.title,
        summary: createdNews.summary,
        imageUrl: createdNews.imageUrl,
      });

      console.log('[NewsService] Push sent:', pushResult);
    }

    return createdNews;
  } catch (error) {
    console.error('[NewsService] Failed to create news:', error);
    throw error;
  }
}

// =====================================================
// NOTIFICATION HANDLERS
// =====================================================

/**
 * Xử lý khi nhận được push notification về tin tức
 * Gọi từ notification listener trong app
 */
export async function handleNewsNotification(data: {
  newsId: string;
  type: string;
}): Promise<void> {
  if (data.type !== 'news') return;

  try {
    // Pre-fetch news detail for faster loading
    const newsDetail = await fetchNewsDetail(data.newsId);
    
    if (newsDetail) {
      // Cache for offline access
      const cachedNews = await getCachedNews();
      const exists = cachedNews.some(n => n.id === newsDetail.id);
      
      if (!exists) {
        await cacheNews([newsDetail, ...cachedNews].slice(0, 50)); // Keep max 50
      }
    }
  } catch (error) {
    console.warn('[NewsService] Failed to pre-fetch news:', error);
  }
}

// =====================================================
// UTILITIES
// =====================================================

/**
 * Format thời gian đăng tin
 */
export function formatPublishedDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Lấy icon theo category
 */
export function getCategoryIcon(category: NewsCategory): string {
  const icons: Record<NewsCategory, string> = {
    general: '📰',
    construction: '🏗️',
    design: '🎨',
    real_estate: '🏠',
    material: '🧱',
    technology: '💻',
    policy: '📋',
    company: '🏢',
  };
  return icons[category] || '📰';
}

/**
 * Lấy tên category tiếng Việt
 */
export function getCategoryName(category: NewsCategory): string {
  const names: Record<NewsCategory, string> = {
    general: 'Tin tức chung',
    construction: 'Xây dựng',
    design: 'Thiết kế',
    real_estate: 'Bất động sản',
    material: 'Vật liệu',
    technology: 'Công nghệ',
    policy: 'Chính sách',
    company: 'Tin công ty',
  };
  return names[category] || 'Tin tức';
}

// Export service object
export const NewsService = {
  // Fetch
  fetchNews,
  fetchNewsDetail,
  fetchBreakingNews,
  fetchNewsByCategory,
  
  // Cache
  cacheNews,
  getCachedNews,
  markNewsAsRead,
  getReadNewsIds,
  
  // Create & Notify
  createNewsAndNotify,
  handleNewsNotification,
  
  // Utils
  formatPublishedDate,
  getCategoryIcon,
  getCategoryName,
};

export default NewsService;
