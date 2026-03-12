/**
 * External Content Service
 * Tổng hợp dữ liệu từ các API external (Pexels, GNews, etc.)
 * Dùng để hiển thị nội dung bổ sung khi không có dữ liệu từ database
 * 
 * @created 16/01/2026
 */

import { ENV } from '@/config/env';
import * as gnewsService from './gnewsService';
import * as pexelsService from './pexelsService';

// ==================== TYPES ====================

export interface ExternalVideo {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  videoUrl: string;
  duration: number;
  author: {
    name: string;
    avatar?: string;
  };
  source: 'pexels' | 'youtube' | 'internal';
  views?: number;
  likes?: number;
  createdAt: string;
  tags?: string[];
  isExternal: true;
}

export interface ExternalArticle {
  id: string;
  title: string;
  description: string;
  content?: string;
  image: string;
  url: string;
  source: {
    name: string;
    url?: string;
  };
  publishedAt: string;
  category?: string;
  isExternal: true;
}

export interface ExternalPhoto {
  id: string;
  url: string;
  thumbnail: string;
  photographer: string;
  photographerUrl?: string;
  avgColor?: string;
  width: number;
  height: number;
  alt?: string;
  source: 'pexels' | 'unsplash' | 'internal';
  isExternal: true;
}

// ==================== CACHE ====================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache: Map<string, CacheEntry<unknown>> = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// ==================== VIDEO FUNCTIONS ====================

/**
 * Chuyển đổi Pexels Video sang ExternalVideo format
 */
function transformPexelsVideo(video: pexelsService.PexelsVideo): ExternalVideo {
  // Tìm video file chất lượng HD hoặc SD
  const videoFile = video.video_files.find(f => f.quality === 'hd') 
    || video.video_files.find(f => f.quality === 'sd')
    || video.video_files[0];
  
  return {
    id: `pexels_${video.id}`,
    title: `Video ${video.id}`, // Pexels không có title
    description: `Video từ ${video.user.name}`,
    thumbnail: video.image,
    videoUrl: videoFile?.link || '',
    duration: video.duration,
    author: {
      name: video.user.name,
      avatar: undefined,
    },
    source: 'pexels',
    views: Math.floor(Math.random() * 10000) + 1000, // Mock views
    likes: Math.floor(Math.random() * 500) + 50,
    createdAt: new Date().toISOString(),
    tags: ['xây dựng', 'kiến trúc', 'thiết kế'],
    isExternal: true,
  };
}

/**
 * Lấy video xây dựng từ Pexels
 */
export async function getConstructionVideos(
  page = 1,
  perPage = 10,
  category: 'general' | 'villa' | 'interior' | 'timelapse' = 'general'
): Promise<ExternalVideo[]> {
  const cacheKey = `videos_${category}_${page}_${perPage}`;
  const cached = getCached<ExternalVideo[]>(cacheKey);
  if (cached) return cached;

  try {
    const keywords: Record<string, string[]> = {
      general: ['construction', 'building', 'architecture'],
      villa: ['villa', 'luxury house', 'modern home'],
      interior: ['interior design', 'home decor', 'living room'],
      timelapse: ['construction timelapse', 'building timelapse'],
    };

    const queryList = keywords[category] || keywords.general;
    const query = queryList[Math.floor(Math.random() * queryList.length)];
    
    const response = await pexelsService.searchVideos(query, {
      page,
      per_page: perPage,
      orientation: 'portrait', // Phù hợp với Reels
    });

    const videos = response.videos.map(transformPexelsVideo);
    setCache(cacheKey, videos);
    return videos;
  } catch (error) {
    console.error('[ExternalContent] Error fetching videos:', error);
    return [];
  }
}

/**
 * Lấy video phổ biến từ Pexels
 */
export async function getPopularVideos(
  page = 1,
  perPage = 10
): Promise<ExternalVideo[]> {
  const cacheKey = `popular_videos_${page}_${perPage}`;
  const cached = getCached<ExternalVideo[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await pexelsService.getPopularVideos(page, perPage);
    const videos = response.videos.map(transformPexelsVideo);
    setCache(cacheKey, videos);
    return videos;
  } catch (error) {
    console.error('[ExternalContent] Error fetching popular videos:', error);
    return [];
  }
}

// ==================== ARTICLE/NEWS FUNCTIONS ====================

/**
 * Chuyển đổi GNews Article sang ExternalArticle format
 */
function transformGNewsArticle(article: gnewsService.GNewsArticle, index: number): ExternalArticle {
  return {
    id: `gnews_${index}_${Date.now()}`,
    title: article.title,
    description: article.description || '',
    content: article.content,
    image: article.image || 'https://picsum.photos/400/200?random=' + index,
    url: article.url,
    source: {
      name: article.source.name,
      url: article.source.url,
    },
    publishedAt: article.publishedAt,
    category: 'Tin tức',
    isExternal: true,
  };
}

/**
 * Lấy tin tức xây dựng từ GNews
 */
export async function getConstructionNews(
  max = 10,
  category: 'general' | 'realEstate' | 'architecture' | 'interior' = 'general'
): Promise<ExternalArticle[]> {
  const cacheKey = `news_${category}_${max}`;
  const cached = getCached<ExternalArticle[]>(cacheKey);
  if (cached) return cached;

  try {
    const keywords = gnewsService.CONSTRUCTION_KEYWORDS;
    const query = keywords[category as keyof typeof keywords] || keywords.general;
    
    const response = await gnewsService.searchNews({
      q: query,
      lang: 'vi',
      country: 'vn',
      max,
    });

    const articles = response.articles.map(transformGNewsArticle);
    setCache(cacheKey, articles);
    return articles;
  } catch (error) {
    console.error('[ExternalContent] Error fetching news:', error);
    return [];
  }
}

/**
 * Lấy tin tức theo topic bất kỳ
 */
export async function getNewsByTopic(
  topic: string,
  max = 10
): Promise<ExternalArticle[]> {
  const cacheKey = `news_topic_${topic}_${max}`;
  const cached = getCached<ExternalArticle[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await gnewsService.searchNews({
      q: topic,
      lang: 'vi',
      max,
    });

    const articles = response.articles.map(transformGNewsArticle);
    setCache(cacheKey, articles);
    return articles;
  } catch (error) {
    console.error('[ExternalContent] Error fetching topic news:', error);
    return [];
  }
}

/**
 * Lấy top headlines
 */
export async function getTopHeadlines(
  category: gnewsService.GNewsCategory = 'general',
  max = 10
): Promise<ExternalArticle[]> {
  const cacheKey = `headlines_${category}_${max}`;
  const cached = getCached<ExternalArticle[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await gnewsService.getTopHeadlines({
      category,
      lang: 'vi',
      country: 'vn',
      max,
    });

    const articles = response.articles.map(transformGNewsArticle);
    setCache(cacheKey, articles);
    return articles;
  } catch (error) {
    console.error('[ExternalContent] Error fetching headlines:', error);
    return [];
  }
}

// ==================== PHOTO FUNCTIONS ====================

/**
 * Chuyển đổi Pexels Photo sang ExternalPhoto format
 */
function transformPexelsPhoto(photo: pexelsService.PexelsPhoto): ExternalPhoto {
  return {
    id: `pexels_${photo.id}`,
    url: photo.src.large,
    thumbnail: photo.src.medium,
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    avgColor: photo.avg_color,
    width: photo.width,
    height: photo.height,
    alt: photo.alt,
    source: 'pexels',
    isExternal: true,
  };
}

/**
 * Lấy ảnh xây dựng từ Pexels
 */
export async function getConstructionPhotos(
  page = 1,
  perPage = 15,
  category: 'general' | 'villa' | 'interior' | 'material' = 'general'
): Promise<ExternalPhoto[]> {
  const cacheKey = `photos_${category}_${page}_${perPage}`;
  const cached = getCached<ExternalPhoto[]>(cacheKey);
  if (cached) return cached;

  try {
    const keywords: Record<string, string[]> = {
      general: ['construction', 'building', 'architecture'],
      villa: ['villa', 'luxury house', 'modern house'],
      interior: ['interior design', 'modern interior', 'home decor'],
      material: ['concrete texture', 'brick wall', 'wood texture'],
    };

    const queryList = keywords[category] || keywords.general;
    const query = queryList[Math.floor(Math.random() * queryList.length)];
    
    const response = await pexelsService.searchPhotos(query, {
      page,
      per_page: perPage,
      orientation: 'landscape',
    });

    const photos = response.photos.map(transformPexelsPhoto);
    setCache(cacheKey, photos);
    return photos;
  } catch (error) {
    console.error('[ExternalContent] Error fetching photos:', error);
    return [];
  }
}

// ==================== COMBINED FEED ====================

export interface FeedItem {
  type: 'video' | 'article' | 'photo';
  data: ExternalVideo | ExternalArticle | ExternalPhoto;
}

/**
 * Lấy feed tổng hợp (videos + articles + photos)
 */
export async function getCombinedFeed(options?: {
  videosCount?: number;
  articlesCount?: number;
  photosCount?: number;
}): Promise<FeedItem[]> {
  const { videosCount = 5, articlesCount = 5, photosCount = 5 } = options || {};

  const [videos, articles, photos] = await Promise.all([
    getConstructionVideos(1, videosCount),
    getConstructionNews(articlesCount),
    getConstructionPhotos(1, photosCount),
  ]);

  const feed: FeedItem[] = [];

  // Xen kẽ các loại content
  const maxLength = Math.max(videos.length, articles.length, photos.length);
  
  for (let i = 0; i < maxLength; i++) {
    if (videos[i]) {
      feed.push({ type: 'video', data: videos[i] });
    }
    if (articles[i]) {
      feed.push({ type: 'article', data: articles[i] });
    }
    if (photos[i]) {
      feed.push({ type: 'photo', data: photos[i] });
    }
  }

  return feed;
}

// ==================== UTILS ====================

/**
 * Clear cache (dùng khi cần refresh data)
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Check if API keys are configured
 */
export function isConfigured(): boolean {
  return !!(ENV.PEXELS_API_KEY && ENV.GNEWS_API_KEY);
}

/**
 * Get configuration status
 */
export function getStatus(): { pexels: boolean; gnews: boolean } {
  return {
    pexels: !!ENV.PEXELS_API_KEY,
    gnews: !!ENV.GNEWS_API_KEY,
  };
}
