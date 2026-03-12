/**
 * Community Feed Service
 * ======================
 *
 * Aggregated service combining multiple data sources for community feed:
 * 1. Backend Database (Priority) - Announcements, News, Development Plans
 * 2. Local Data - Construction videos/photos from data/videos.ts
 * 3. External APIs (Fallback) - GNews
 *
 * @author ThietKeResort Team
 * @created 2025-01-15
 */

import { Announcement } from "./api/communication.service";
import { getConstructionNews, getRealEstateNews, NewsArticle } from "./newsApi";

// ============================================
// Types
// ============================================
export type FeedItemType =
  | "announcement" // Backend announcements
  | "development_plan" // Development plans from backend
  | "news" // News from backend or external
  | "video" // Videos from Pexels
  | "photo" // Photos from Pexels
  | "post"; // User posts

export type FeedItemSource =
  | "backend" // From our database
  | "gnews" // From GNews API
  | "local" // From local data (videos/photos)
  | "newsapi" // From NewsAPI
  | "mock"; // Fallback mock data

export type FeedItemPriority = "high" | "normal" | "low";

export interface BaseFeedItem {
  id: string;
  type: FeedItemType;
  source: FeedItemSource;
  priority: FeedItemPriority;
  title: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  author?: {
    id?: string;
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
}

export interface AnnouncementFeedItem extends BaseFeedItem {
  type: "announcement";
  projectId?: number;
  importance: "low" | "medium" | "high" | "critical";
  isRead?: boolean;
  attachments?: {
    id: number;
    fileName: string;
    fileUrl: string;
    fileType: string;
  }[];
}

export interface DevelopmentPlanFeedItem extends BaseFeedItem {
  type: "development_plan";
  phase?: string;
  status?: "planned" | "in_progress" | "completed" | "delayed";
  progress?: number;
  targetDate?: string;
  milestones?: {
    name: string;
    status: string;
    date?: string;
  }[];
}

export interface NewsFeedItem extends BaseFeedItem {
  type: "news";
  url: string;
  category?: string;
  sourceName: string;
  publishedAt: string;
}

export interface VideoFeedItem extends BaseFeedItem {
  type: "video";
  videoUrl: string;
  thumbnailUrl: string;
  duration?: number;
  views?: number;
  likes?: number;
}

export interface PhotoFeedItem extends BaseFeedItem {
  type: "photo";
  imageUrl: string;
  fullImageUrl?: string;
  photographer?: string;
  photographerUrl?: string;
  tags?: string[];
}

export type CommunityFeedItem =
  | AnnouncementFeedItem
  | DevelopmentPlanFeedItem
  | NewsFeedItem
  | VideoFeedItem
  | PhotoFeedItem;

export interface FeedFilter {
  types?: FeedItemType[];
  sources?: FeedItemSource[];
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface FeedResponse {
  items: CommunityFeedItem[];
  totalCount: number;
  hasMore: boolean;
  sources: {
    backend: number;
    gnews: number;
    pexels: number;
    other: number;
  };
}

// ============================================
// Cache Management
// ============================================
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const feedCache = new Map<string, CacheEntry<any>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = feedCache.get(key);
  if (entry && Date.now() < entry.expiresAt) {
    return entry.data;
  }
  feedCache.delete(key);
  return null;
}

function setCache<T>(key: string, data: T, duration = CACHE_DURATION): void {
  feedCache.set(key, {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + duration,
  });
}

export function clearFeedCache(): void {
  feedCache.clear();
}

// ============================================
// Data Transformers
// ============================================

function transformAnnouncement(
  announcement: Announcement,
): AnnouncementFeedItem {
  // Map priority from Announcement type (LOW, NORMAL, HIGH, URGENT)
  const priorityMap: Record<string, FeedItemPriority> = {
    URGENT: "high",
    HIGH: "high",
    NORMAL: "normal",
    LOW: "low",
  };

  // Map importance from priority
  const importanceMap: Record<string, AnnouncementFeedItem["importance"]> = {
    URGENT: "critical",
    HIGH: "high",
    NORMAL: "medium",
    LOW: "low",
  };

  return {
    id: `announcement-${announcement.id}`,
    type: "announcement",
    source: "backend",
    priority: priorityMap[announcement.priority] || "normal",
    title: announcement.title,
    description: announcement.content,
    imageUrl: announcement.attachments?.[0]?.fileUrl,
    createdAt: announcement.createdAt,
    author: {
      id: String(announcement.publishedBy),
      name: announcement.publishedByName || "System",
    },
    projectId: announcement.projectId,
    importance: importanceMap[announcement.priority] || "medium",
    isRead: false, // Backend doesn't track read status per user
    attachments: announcement.attachments,
    metadata: {
      viewCount: announcement.viewCount,
      expiresAt: announcement.expiresAt,
      isPinned: announcement.isPinned,
    },
  };
}

function transformNewsArticle(
  article: NewsArticle,
  source: FeedItemSource = "gnews",
): NewsFeedItem {
  return {
    id: `news-${article.id}`,
    type: "news",
    source,
    priority: "normal",
    title: article.title,
    description: article.description || undefined,
    imageUrl: article.imageUrl || undefined,
    createdAt: article.publishedAt,
    author: article.author
      ? {
          name: article.author,
        }
      : undefined,
    url: article.url,
    category: article.category,
    sourceName: article.source.name,
    publishedAt: article.publishedAt,
  };
}

function transformVideo(video: {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  author?: string;
  authorId?: string;
  authorAvatarUrl?: string;
  duration?: string;
  views?: number;
  createdAt?: string;
}): VideoFeedItem {
  return {
    id: `video-${video.id}`,
    type: "video",
    source: "local",
    priority: "normal",
    title: video.title || "Construction Video",
    description: video.description,
    imageUrl: video.thumbnail,
    createdAt: video.createdAt || new Date().toISOString(),
    author: video.author
      ? {
          id: video.authorId || "design-build-team",
          name: video.author,
          avatar: video.authorAvatarUrl,
        }
      : undefined,
    videoUrl: "", // local videos use YouTube player
    thumbnailUrl: video.thumbnail,
    duration: video.duration ? parseFloat(video.duration) : undefined,
    views: video.views,
    metadata: {},
  };
}

function transformLocalPhoto(photo: {
  id: string;
  title: string;
  thumbnail: string;
  author?: string;
  authorId?: string;
  description?: string;
}): PhotoFeedItem {
  return {
    id: `photo-${photo.id}`,
    type: "photo",
    source: "local",
    priority: "low",
    title: photo.title || "Construction Photo",
    description: photo.description,
    imageUrl: photo.thumbnail,
    createdAt: new Date().toISOString(),
    author: photo.author
      ? {
          id: photo.authorId || "design-build-team",
          name: photo.author,
        }
      : undefined,
    fullImageUrl: photo.thumbnail,
    tags: [],
  };
}

// ============================================
// Development Plans (Backend Mock - Replace with real API)
// ============================================

// These should come from backend - currently mock data
const DEVELOPMENT_PLANS: DevelopmentPlanFeedItem[] = [
  {
    id: "dev-plan-1",
    type: "development_plan",
    source: "backend",
    priority: "high",
    title: "Kế hoạch phát triển Q1 2025",
    description:
      "Tập trung vào cải thiện hệ thống AI và tích hợp các tính năng mới cho quản lý dự án xây dựng",
    createdAt: new Date().toISOString(),
    phase: "Phase 1",
    status: "in_progress",
    progress: 65,
    targetDate: "2025-03-31",
    milestones: [
      { name: "AI Design Assistant", status: "completed", date: "2025-01-15" },
      {
        name: "Real-time Collaboration",
        status: "in_progress",
        date: "2025-02-15",
      },
      { name: "Advanced Analytics", status: "planned", date: "2025-03-15" },
    ],
  },
  {
    id: "dev-plan-2",
    type: "development_plan",
    source: "backend",
    priority: "high",
    title: "Tính năng mới: AR Viewer 2.0",
    description:
      "Nâng cấp trải nghiệm xem thực tế ảo với khả năng tương tác 3D và đo lường tự động",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    phase: "Beta",
    status: "in_progress",
    progress: 40,
    targetDate: "2025-04-30",
    milestones: [
      { name: "3D Model Loading", status: "completed", date: "2025-01-10" },
      {
        name: "Interactive Controls",
        status: "in_progress",
        date: "2025-02-28",
      },
      { name: "Measurement Tools", status: "planned", date: "2025-04-15" },
    ],
  },
  {
    id: "dev-plan-3",
    type: "development_plan",
    source: "backend",
    priority: "normal",
    title: "Cải thiện hiệu suất ứng dụng",
    description:
      "Tối ưu hóa tốc độ tải, giảm tiêu thụ bộ nhớ và cải thiện trải nghiệm người dùng",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    phase: "Ongoing",
    status: "in_progress",
    progress: 80,
    milestones: [
      { name: "Image Optimization", status: "completed" },
      { name: "API Response Caching", status: "completed" },
      { name: "Lazy Loading", status: "in_progress" },
    ],
  },
];

async function getDevelopmentPlans(): Promise<DevelopmentPlanFeedItem[]> {
  // TODO: Replace with real backend API call
  // return apiClient.get('/development-plans');
  return DEVELOPMENT_PLANS;
}

// ============================================
// Main Service Functions
// ============================================

/**
 * Fetch announcements from backend
 * NOTE: /announcements endpoint returns 404 - not yet implemented
 * Using mock data fallback
 */
async function fetchBackendAnnouncements(
  projectId?: number,
): Promise<AnnouncementFeedItem[]> {
  try {
    // TODO: Uncomment when backend implements /announcements endpoint
    // const response = await communicationService.getAnnouncements(
    //   projectId || 0,\n    //   true,
    // );
    //
    // if (response.success && response.data) {
    //   return response.data.map(transformAnnouncement);
    // }

    // For now, endpoint not available - using empty array
    console.warn(
      "[CommunityFeed] /announcements endpoint not available, skipping",
    );
    return [];
  } catch (error) {
    console.error("[CommunityFeed] Error fetching announcements:", error);
    return [];
  }
}

/**
 * Fetch news from multiple sources
 * Uses GNews/mock data on mobile (NewsAPI free plan doesn't support mobile apps)
 */
async function fetchNews(
  category?: string,
  limit = 10,
): Promise<NewsFeedItem[]> {
  try {
    const [constructionNews, realEstateNews] = await Promise.allSettled([
      getConstructionNews(limit),
      getRealEstateNews(limit),
    ]);

    const allNews: NewsFeedItem[] = [];

    if (constructionNews.status === "fulfilled") {
      allNews.push(
        ...constructionNews.value.map((a) => transformNewsArticle(a, "gnews")),
      );
    }

    if (realEstateNews.status === "fulfilled") {
      allNews.push(
        ...realEstateNews.value.map((a) => transformNewsArticle(a, "gnews")),
      );
    }

    if (allNews.length === 0) {
      console.log(
        "[CommunityFeed] No news available from APIs, will use mock data from newsApi service",
      );
      // The newsApi service already returns mock data as fallback
      const mockConstructionNews = await getConstructionNews(limit);
      const mockRealEstateNews = await getRealEstateNews(limit);
      return [
        ...mockConstructionNews.map((a) => transformNewsArticle(a, "mock")),
        ...mockRealEstateNews.map((a) => transformNewsArticle(a, "mock")),
      ];
    }

    // Sort by date and remove duplicates
    return allNews
      .filter(
        (item, index, self) =>
          index === self.findIndex((i) => i.title === item.title),
      )
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      )
      .slice(0, limit * 2);
  } catch (error) {
    console.log(
      "[CommunityFeed] News fetch error, returning empty array:",
      error,
    );
    return [];
  }
}

/**
 * Fetch videos from local data
 */
async function fetchVideos(
  _category?: string,
  limit = 10,
): Promise<VideoFeedItem[]> {
  try {
    // Use local video data instead of Pexels
    const { ALL_LOCAL_VIDEOS } = require("../data/videos");
    const shuffled = [...ALL_LOCAL_VIDEOS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit).map(transformVideo);
  } catch (error) {
    console.error("[CommunityFeed] Error fetching local videos:", error);
    return [];
  }
}

/**
 * Fetch photos from local data
 */
async function fetchPhotos(
  _category?: string,
  limit = 10,
): Promise<PhotoFeedItem[]> {
  try {
    // Use local video thumbnails as photo content
    const { ALL_LOCAL_VIDEOS } = require("../data/videos");
    const shuffled = [...ALL_LOCAL_VIDEOS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit).map((v: any) =>
      transformLocalPhoto({
        id: v.id,
        title: v.title,
        thumbnail: v.thumbnail,
        author: v.author,
        description: v.description,
      }),
    );
  } catch (error) {
    console.error("[CommunityFeed] Error fetching local photos:", error);
    return [];
  }
}

/**
 * Get combined community feed with priority ordering
 */
export async function getCommunityFeed(
  options: {
    filter?: FeedFilter;
    page?: number;
    pageSize?: number;
    projectId?: number;
  } = {},
): Promise<FeedResponse> {
  const { filter, page = 1, pageSize = 20, projectId } = options;
  const cacheKey = `feed-${JSON.stringify(options)}`;

  // Check cache
  const cached = getCached<FeedResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from all sources in parallel
  const [announcements, developmentPlans, news, videos, photos] =
    await Promise.all([
      fetchBackendAnnouncements(projectId),
      getDevelopmentPlans(),
      fetchNews(filter?.category, pageSize),
      fetchVideos(filter?.category, Math.ceil(pageSize / 2)),
      fetchPhotos(filter?.category, Math.ceil(pageSize / 2)),
    ]);

  // Combine all items
  let allItems: CommunityFeedItem[] = [
    ...announcements,
    ...developmentPlans,
    ...news,
    ...videos,
    ...photos,
  ];

  // Apply filters
  if (filter) {
    if (filter.types && filter.types.length > 0) {
      allItems = allItems.filter((item) => filter.types!.includes(item.type));
    }

    if (filter.sources && filter.sources.length > 0) {
      allItems = allItems.filter((item) =>
        filter.sources!.includes(item.source),
      );
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      allItems = allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower),
      );
    }

    if (filter.startDate) {
      const startTime = new Date(filter.startDate).getTime();
      allItems = allItems.filter(
        (item) => new Date(item.createdAt).getTime() >= startTime,
      );
    }

    if (filter.endDate) {
      const endTime = new Date(filter.endDate).getTime();
      allItems = allItems.filter(
        (item) => new Date(item.createdAt).getTime() <= endTime,
      );
    }
  }

  // Sort by priority and date
  allItems.sort((a, b) => {
    // Priority order: high > normal > low
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];

    if (priorityDiff !== 0) return priorityDiff;

    // Then by date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Pagination
  const startIndex = (page - 1) * pageSize;
  const paginatedItems = allItems.slice(startIndex, startIndex + pageSize);

  // Count sources
  const sources = {
    backend: allItems.filter((i) => i.source === "backend").length,
    gnews: allItems.filter(
      (i) => i.source === "gnews" || i.source === "newsapi",
    ).length,
    pexels: allItems.filter((i) => i.source === "local").length,
    other: allItems.filter((i) => i.source === "mock").length,
  };

  const response: FeedResponse = {
    items: paginatedItems,
    totalCount: allItems.length,
    hasMore: startIndex + pageSize < allItems.length,
    sources,
  };

  // Cache the response
  setCache(cacheKey, response);

  return response;
}

/**
 * Get feed items by type
 */
export async function getFeedByType(
  type: FeedItemType,
  limit = 10,
): Promise<CommunityFeedItem[]> {
  const response = await getCommunityFeed({
    filter: { types: [type] },
    pageSize: limit,
  });
  return response.items;
}

/**
 * Get announcements only
 */
export async function getAnnouncements(
  projectId?: number,
  limit = 10,
): Promise<AnnouncementFeedItem[]> {
  const items = await getFeedByType("announcement", limit);
  return items as AnnouncementFeedItem[];
}

/**
 * Get development plans only
 */
export async function getDevelopmentPlansFeed(
  limit = 10,
): Promise<DevelopmentPlanFeedItem[]> {
  const items = await getFeedByType("development_plan", limit);
  return items as DevelopmentPlanFeedItem[];
}

/**
 * Get news only
 */
export async function getNewsFeed(limit = 10): Promise<NewsFeedItem[]> {
  const items = await getFeedByType("news", limit);
  return items as NewsFeedItem[];
}

/**
 * Get videos only
 */
export async function getVideosFeed(limit = 10): Promise<VideoFeedItem[]> {
  const items = await getFeedByType("video", limit);
  return items as VideoFeedItem[];
}

/**
 * Get photos only
 */
export async function getPhotosFeed(limit = 10): Promise<PhotoFeedItem[]> {
  const items = await getFeedByType("photo", limit);
  return items as PhotoFeedItem[];
}

/**
 * Search community feed
 */
export async function searchCommunityFeed(
  query: string,
  options: {
    types?: FeedItemType[];
    limit?: number;
  } = {},
): Promise<CommunityFeedItem[]> {
  const { types, limit = 20 } = options;

  const response = await getCommunityFeed({
    filter: {
      search: query,
      types,
    },
    pageSize: limit,
  });

  return response.items;
}

/**
 * Get trending content (most viewed/liked)
 */
export async function getTrendingContent(
  limit = 10,
): Promise<CommunityFeedItem[]> {
  // Fetch videos with views for trending
  const videos = await fetchVideos(undefined, limit);

  // Sort by views
  return videos.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, limit);
}

/**
 * Refresh feed cache
 */
export async function refreshFeed(): Promise<void> {
  clearFeedCache();
}

// Export default
export default {
  getCommunityFeed,
  getFeedByType,
  getAnnouncements,
  getDevelopmentPlansFeed,
  getNewsFeed,
  getVideosFeed,
  getPhotosFeed,
  searchCommunityFeed,
  getTrendingContent,
  refreshFeed,
  clearFeedCache,
};
