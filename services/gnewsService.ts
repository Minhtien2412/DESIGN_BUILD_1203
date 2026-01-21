/**
 * GNews API Service
 * Lấy tin tức xây dựng, bất động sản từ GNews API
 * API Documentation: https://gnews.io/docs/v4
 * Created: 13/01/2026
 * 
 * Plan: Free (100 requests/day)
 * Features: Search, Top Headlines
 */

import { ENV } from '@/config/env';

const GNEWS_API_KEY = ENV.GNEWS_API_KEY || process.env.EXPO_PUBLIC_GNEWS_API_KEY || '';
const BASE_URL = 'https://gnews.io/api/v4';

// ==================== TYPES ====================

export interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

export interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
}

export interface GNewsSearchOptions {
  q: string;           // Search query (required)
  lang?: string;       // Language code (default: vi)
  country?: string;    // Country code (default: vn)
  max?: number;        // Max results (1-100, default: 10)
  in?: string;         // Search in: title, description, content
  nullable?: string;   // Allow nullable fields
  from?: string;       // From date (YYYY-MM-DD)
  to?: string;         // To date (YYYY-MM-DD)
  sortby?: 'publishedAt' | 'relevance'; // Sort order
}

export interface GNewsTopHeadlinesOptions {
  category?: GNewsCategory;
  lang?: string;
  country?: string;
  max?: number;
  q?: string;         // Optional filter query
  nullable?: string;
}

export type GNewsCategory = 
  | 'general'
  | 'world'
  | 'nation'
  | 'business'
  | 'technology'
  | 'entertainment'
  | 'sports'
  | 'science'
  | 'health';

// ==================== CONSTANTS ====================

// Từ khóa liên quan đến xây dựng và bất động sản
export const CONSTRUCTION_KEYWORDS = {
  general: 'xây dựng OR kiến trúc OR construction',
  realEstate: 'bất động sản OR nhà đất OR chung cư',
  architecture: 'kiến trúc OR thiết kế nhà OR villa',
  interior: 'nội thất OR interior design OR decor',
  material: 'vật liệu xây dựng OR xi măng OR sắt thép',
  news: 'tin tức xây dựng OR dự án mới',
};

// Categories map to Vietnamese
export const CATEGORY_LABELS: Record<GNewsCategory, string> = {
  general: 'Chung',
  world: 'Thế giới',
  nation: 'Trong nước',
  business: 'Kinh doanh',
  technology: 'Công nghệ',
  entertainment: 'Giải trí',
  sports: 'Thể thao',
  science: 'Khoa học',
  health: 'Sức khỏe',
};

// ==================== API FUNCTIONS ====================

/**
 * Fetch với error handling
 */
async function gNewsFetch<T>(endpoint: string, params: Record<string, string | number | undefined>): Promise<T> {
  if (!GNEWS_API_KEY) {
    throw new Error('GNews API key chưa được cấu hình');
  }

  // Build query string
  const queryParams = new URLSearchParams();
  queryParams.append('apikey', GNEWS_API_KEY);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  const url = `${BASE_URL}${endpoint}?${queryParams.toString()}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.errors?.[0] || `GNews API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

/**
 * Tìm kiếm tin tức
 * @param options - Search options
 */
export async function searchNews(options: GNewsSearchOptions): Promise<GNewsResponse> {
  return gNewsFetch<GNewsResponse>('/search', {
    q: options.q,
    lang: options.lang || 'vi',
    country: options.country || 'vn',
    max: options.max || 10,
    in: options.in,
    nullable: options.nullable,
    from: options.from,
    to: options.to,
    sortby: options.sortby,
  });
}

/**
 * Lấy tin tức nổi bật theo category
 * @param options - Top headlines options
 */
export async function getTopHeadlines(options: GNewsTopHeadlinesOptions = {}): Promise<GNewsResponse> {
  return gNewsFetch<GNewsResponse>('/top-headlines', {
    category: options.category || 'general',
    lang: options.lang || 'vi',
    country: options.country || 'vn',
    max: options.max || 10,
    q: options.q,
    nullable: options.nullable,
  });
}

/**
 * Lấy tin tức xây dựng
 * @param category - Category keyword
 * @param max - Max results
 */
export async function getConstructionNews(
  category: keyof typeof CONSTRUCTION_KEYWORDS = 'general',
  max: number = 10
): Promise<GNewsResponse> {
  return searchNews({
    q: CONSTRUCTION_KEYWORDS[category],
    lang: 'vi',
    max,
    sortby: 'publishedAt',
  });
}

/**
 * Lấy tin tức bất động sản
 */
export async function getRealEstateNews(max: number = 10): Promise<GNewsResponse> {
  return searchNews({
    q: CONSTRUCTION_KEYWORDS.realEstate,
    lang: 'vi',
    max,
    sortby: 'publishedAt',
  });
}

/**
 * Tìm kiếm tin tức tiếng Việt
 */
export async function searchVietnameseNews(query: string, max: number = 10): Promise<GNewsResponse> {
  return searchNews({
    q: query,
    lang: 'vi',
    country: 'vn',
    max,
    sortby: 'relevance',
  });
}

/**
 * Tìm kiếm tin tức quốc tế (English)
 */
export async function searchInternationalNews(query: string, max: number = 10): Promise<GNewsResponse> {
  return searchNews({
    q: query,
    lang: 'en',
    max,
    sortby: 'relevance',
  });
}

// ==================== HELPERS ====================

/**
 * Chuyển đổi GNews article sang format app
 */
export function gnewsArticleToAppArticle(article: GNewsArticle) {
  return {
    id: `gnews-${hashCode(article.url)}`,
    title: article.title,
    description: article.description,
    content: article.content,
    url: article.url,
    imageUrl: article.image || 'https://via.placeholder.com/400x200?text=No+Image',
    publishedAt: article.publishedAt,
    source: article.source.name,
    sourceUrl: article.source.url,
  };
}

/**
 * Simple hash code for generating IDs
 */
function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Format date to Vietnamese
 */
export function formatNewsDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return `${minutes} phút trước`;
  } else if (hours < 24) {
    return `${hours} giờ trước`;
  } else if (days < 7) {
    return `${days} ngày trước`;
  } else {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}

/**
 * Kiểm tra trạng thái API
 */
export async function checkGNewsStatus(): Promise<{
  status: 'working' | 'error' | 'not_configured';
  message: string;
  latency?: number;
}> {
  if (!GNEWS_API_KEY) {
    return {
      status: 'not_configured',
      message: 'GNews API key chưa được cấu hình',
    };
  }

  try {
    const start = Date.now();
    await getTopHeadlines({ max: 1 });
    const latency = Date.now() - start;

    return {
      status: 'working',
      message: 'GNews API hoạt động bình thường',
      latency,
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Lỗi không xác định',
    };
  }
}

// ==================== EXPORT ====================

export default {
  // Search
  searchNews,
  searchVietnameseNews,
  searchInternationalNews,
  
  // Headlines
  getTopHeadlines,
  
  // Construction specific
  getConstructionNews,
  getRealEstateNews,
  
  // Helpers
  gnewsArticleToAppArticle,
  formatNewsDate,
  checkGNewsStatus,
  
  // Constants
  CONSTRUCTION_KEYWORDS,
  CATEGORY_LABELS,
};
