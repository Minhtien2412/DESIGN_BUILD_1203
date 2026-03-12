/**
 * News API Service
 * =================
 *
 * Service để lấy tin tức từ nhiều nguồn API.
 * Ưu tiên: GNews → TheNewsAPI → MediaStack (NewsAPI disabled on mobile - free plan limitation)
 *
 * NOTE: NewsAPI free plan only allows server-side requests, not from mobile apps.
 *
 * @author ThietKeResort Team
 * @created 2025-01-12
 */

import { Platform } from "react-native";
import { NEWS_CONFIG, isServiceConfigured } from "../config/externalApis";

// ============================================
// Types
// ============================================
export interface NewsArticle {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  category?: string;
}

export interface NewsResponse {
  articles: NewsArticle[];
  totalResults: number;
  source: "newsapi" | "gnews" | "thenewsapi" | "mediastack" | "mock";
}

export type NewsCategory =
  | "general"
  | "business"
  | "technology"
  | "entertainment"
  | "sports"
  | "science"
  | "health"
  | "construction" // Xây dựng
  | "realestate"; // Bất động sản

export interface NewsQuery {
  q?: string;
  category?: NewsCategory;
  country?: string;
  language?: string;
  pageSize?: number;
  page?: number;
}

// ============================================
// NewsAPI Implementation
// ============================================
async function fetchNewsAPI(query: NewsQuery): Promise<NewsResponse | null> {
  const config = NEWS_CONFIG.newsapi;

  if (!config.apiKey) return null;

  try {
    const params = new URLSearchParams({
      apiKey: config.apiKey,
      pageSize: String(query.pageSize || 20),
      page: String(query.page || 1),
    });

    let endpoint = "/top-headlines";

    if (query.q) {
      params.set("q", query.q);
      endpoint = "/everything";
      params.set("sortBy", "publishedAt");
    } else {
      params.set("country", query.country || config.country);
      if (
        query.category &&
        query.category !== "construction" &&
        query.category !== "realestate"
      ) {
        params.set("category", query.category);
      }
    }

    // Special handling for construction/realestate
    if (query.category === "construction") {
      params.set("q", "xây dựng OR construction OR công trình");
      endpoint = "/everything";
    } else if (query.category === "realestate") {
      params.set("q", "bất động sản OR real estate OR nhà đất");
      endpoint = "/everything";
    }

    const res = await fetch(`${config.baseUrl}${endpoint}?${params}`);

    if (!res.ok) throw new Error("NewsAPI error");

    const data = await res.json();

    return {
      articles: data.articles.map((article: any, index: number) => ({
        id: `newsapi-${Date.now()}-${index}`,
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        imageUrl: article.urlToImage,
        publishedAt: article.publishedAt,
        source: {
          id: article.source?.id,
          name: article.source?.name || "Unknown",
        },
        author: article.author,
        category: query.category,
      })),
      totalResults: data.totalResults,
      source: "newsapi",
    };
  } catch (error) {
    console.error("[NewsService] NewsAPI error:", error);
    return null;
  }
}

// ============================================
// GNews Implementation
// ============================================
async function fetchGNews(query: NewsQuery): Promise<NewsResponse | null> {
  const config = NEWS_CONFIG.gnews;

  if (!config.apiKey) return null;

  try {
    const params = new URLSearchParams({
      apikey: config.apiKey,
      max: String(query.pageSize || 20),
      lang: query.language || config.language,
      country: query.country || config.country,
    });

    let endpoint = "/top-headlines";

    if (query.q) {
      params.set("q", query.q);
      endpoint = "/search";
    }

    if (
      query.category &&
      query.category !== "construction" &&
      query.category !== "realestate"
    ) {
      params.set("topic", query.category);
    }

    // Special handling for construction/realestate
    if (query.category === "construction") {
      params.set("q", "xây dựng công trình");
      endpoint = "/search";
    } else if (query.category === "realestate") {
      params.set("q", "bất động sản nhà đất");
      endpoint = "/search";
    }

    const res = await fetch(`${config.baseUrl}${endpoint}?${params}`);

    if (!res.ok) throw new Error("GNews error");

    const data = await res.json();

    return {
      articles: data.articles.map((article: any, index: number) => ({
        id: `gnews-${Date.now()}-${index}`,
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        imageUrl: article.image,
        publishedAt: article.publishedAt,
        source: {
          id: null,
          name: article.source?.name || "Unknown",
        },
        author: null,
        category: query.category,
      })),
      totalResults: data.totalArticles,
      source: "gnews",
    };
  } catch (error) {
    console.error("[NewsService] GNews error:", error);
    return null;
  }
}

// ============================================
// TheNewsAPI Implementation
// ============================================
async function fetchTheNewsAPI(query: NewsQuery): Promise<NewsResponse | null> {
  const config = NEWS_CONFIG.thenewsapi;

  if (!config.apiKey) return null;

  try {
    const params = new URLSearchParams({
      api_token: config.apiKey,
      limit: String(query.pageSize || 20),
      language: query.language || "vi",
    });

    if (query.q) {
      params.set("search", query.q);
    }

    // Map categories
    const categoryMap: Record<string, string> = {
      general: "general",
      business: "business",
      technology: "tech",
      entertainment: "entertainment",
      sports: "sports",
      science: "science",
      health: "health",
      construction: "business",
      realestate: "business",
    };

    if (query.category) {
      params.set("categories", categoryMap[query.category] || "general");
    }

    const res = await fetch(`${config.baseUrl}/news/all?${params}`);

    if (!res.ok) throw new Error("TheNewsAPI error");

    const data = await res.json();

    return {
      articles: data.data.map((article: any, index: number) => ({
        id: article.uuid || `thenewsapi-${Date.now()}-${index}`,
        title: article.title,
        description: article.description,
        content: article.snippet,
        url: article.url,
        imageUrl: article.image_url,
        publishedAt: article.published_at,
        source: {
          id: article.source,
          name: article.source || "Unknown",
        },
        author: null,
        category: query.category,
      })),
      totalResults: data.meta?.found || data.data.length,
      source: "thenewsapi",
    };
  } catch (error) {
    console.error("[NewsService] TheNewsAPI error:", error);
    return null;
  }
}

// ============================================
// MediaStack Implementation
// ============================================
async function fetchMediaStack(query: NewsQuery): Promise<NewsResponse | null> {
  const config = NEWS_CONFIG.mediastack;

  if (!config.apiKey) return null;

  try {
    const params = new URLSearchParams({
      access_key: config.apiKey,
      limit: String(query.pageSize || 20),
      languages: query.language || config.languages,
      countries: query.country || config.countries,
      sort: "published_desc",
    });

    if (query.q) {
      params.set("keywords", query.q);
    }

    // Map categories
    const categoryMap: Record<string, string> = {
      general: "general",
      business: "business",
      technology: "technology",
      entertainment: "entertainment",
      sports: "sports",
      science: "science",
      health: "health",
    };

    if (query.category && categoryMap[query.category]) {
      params.set("categories", categoryMap[query.category]);
    }

    const res = await fetch(`${config.baseUrl}/news?${params}`);

    if (!res.ok) throw new Error("MediaStack error");

    const data = await res.json();

    return {
      articles: data.data.map((article: any, index: number) => ({
        id: `mediastack-${Date.now()}-${index}`,
        title: article.title,
        description: article.description,
        content: article.description,
        url: article.url,
        imageUrl: article.image,
        publishedAt: article.published_at,
        source: {
          id: article.source,
          name: article.source || "Unknown",
        },
        author: article.author,
        category: article.category,
      })),
      totalResults: data.pagination?.total || data.data.length,
      source: "mediastack",
    };
  } catch (error) {
    console.error("[NewsService] MediaStack error:", error);
    return null;
  }
}

// ============================================
// Main Service Functions
// ============================================

// Global fetch deduplication
let newsFetchInProgress = false;
let lastNewsFetchTime = 0;
let cachedNewsResponse: NewsResponse | null = null;
const NEWS_CACHE_MS = 30000; // Cache news for 30 seconds

/**
 * Get news with automatic fallback
 * NOTE: NewsAPI is skipped on mobile platforms due to free plan limitations
 * (NewsAPI free plan only allows server-side requests)
 */
export async function getNews(query: NewsQuery = {}): Promise<NewsResponse> {
  const now = Date.now();

  // Return cached response if within cache window
  if (cachedNewsResponse && now - lastNewsFetchTime < NEWS_CACHE_MS) {
    return cachedNewsResponse;
  }

  // Prevent concurrent fetches
  if (newsFetchInProgress) {
    // Wait for current fetch or return mock
    if (cachedNewsResponse) return cachedNewsResponse;
    return getMockNewsData(query);
  }

  newsFetchInProgress = true;
  let data: NewsResponse | null = null;

  // Skip NewsAPI on mobile platforms - free plan doesn't allow client-side requests
  // NewsAPI returns CORS errors and 426 "Upgrade Required" on mobile apps
  const isServer = Platform.OS === "web" && typeof window === "undefined";

  try {
    // Only try NewsAPI on server-side (not in React Native mobile apps)
    if (isServer && isServiceConfigured("newsapi")) {
      console.log("[NewsService] Trying NewsAPI (server-side)...");
      data = await fetchNewsAPI(query);
      if (data) {
        cachedNewsResponse = data;
        lastNewsFetchTime = Date.now();
        return data;
      }
    }

    // GNews is the primary news source for mobile apps
    if (isServiceConfigured("gnews")) {
      console.log("[NewsService] Trying GNews...");
      data = await fetchGNews(query);
      if (data) {
        cachedNewsResponse = data;
        lastNewsFetchTime = Date.now();
        return data;
      }
    }

    // Try TheNewsAPI and MediaStack as fallbacks
    console.log("[NewsService] Trying TheNewsAPI...");
    data = await fetchTheNewsAPI(query);
    if (data) {
      cachedNewsResponse = data;
      lastNewsFetchTime = Date.now();
      return data;
    }

    console.log("[NewsService] Trying MediaStack...");
    data = await fetchMediaStack(query);
    if (data) {
      cachedNewsResponse = data;
      lastNewsFetchTime = Date.now();
      return data;
    }

    // Return mock data if no service available
    console.log("[NewsService] All APIs failed, using mock data");
    const mockData = getMockNewsData(query);
    cachedNewsResponse = mockData;
    lastNewsFetchTime = Date.now();
    return mockData;
  } finally {
    newsFetchInProgress = false;
  }
}

/**
 * Get top headlines
 */
export async function getTopHeadlines(
  category?: NewsCategory,
  pageSize = 10,
): Promise<NewsArticle[]> {
  const data = await getNews({ category, pageSize });
  return data.articles;
}

/**
 * Search news by keyword
 */
export async function searchNews(
  keyword: string,
  pageSize = 20,
): Promise<NewsArticle[]> {
  const data = await getNews({ q: keyword, pageSize });
  return data.articles;
}

/**
 * Get construction industry news
 */
export async function getConstructionNews(
  pageSize = 10,
): Promise<NewsArticle[]> {
  const data = await getNews({ category: "construction", pageSize });
  return data.articles;
}

/**
 * Get real estate news
 */
export async function getRealEstateNews(pageSize = 10): Promise<NewsArticle[]> {
  const data = await getNews({ category: "realestate", pageSize });
  return data.articles;
}

/**
 * Get news by multiple categories
 */
export async function getNewsByCategories(
  categories: NewsCategory[],
  pageSize = 5,
): Promise<Record<NewsCategory, NewsArticle[]>> {
  const results: Record<string, NewsArticle[]> = {};

  await Promise.all(
    categories.map(async (category) => {
      const data = await getNews({ category, pageSize });
      results[category] = data.articles;
    }),
  );

  return results as Record<NewsCategory, NewsArticle[]>;
}

// ============================================
// Mock Data
// ============================================
function getMockNewsData(query: NewsQuery): NewsResponse {
  const mockArticles: NewsArticle[] = [
    {
      id: "mock-1",
      title: "Xu hướng thiết kế resort 2025: Bền vững và gần gũi thiên nhiên",
      description:
        "Các chuyên gia dự đoán xu hướng thiết kế resort năm 2025 sẽ tập trung vào yếu tố bền vững, sử dụng vật liệu tái chế và hòa hợp với thiên nhiên.",
      content:
        "Theo các chuyên gia trong ngành, xu hướng thiết kế resort 2025 sẽ đặc biệt chú trọng đến các yếu tố bền vững...",
      url: "https://example.com/news/1",
      imageUrl:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      publishedAt: new Date().toISOString(),
      source: { id: null, name: "Xây Dựng Online" },
      author: "Nguyễn Văn A",
      category: "construction",
    },
    {
      id: "mock-2",
      title: "Thị trường bất động sản nghỉ dưỡng tăng trưởng mạnh",
      description:
        "Bất động sản nghỉ dưỡng Việt Nam ghi nhận mức tăng trưởng 15% trong quý đầu năm, đặc biệt tại các thành phố biển.",
      content:
        "Theo báo cáo mới nhất từ các đơn vị nghiên cứu thị trường, bất động sản nghỉ dưỡng Việt Nam...",
      url: "https://example.com/news/2",
      imageUrl:
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      source: { id: null, name: "Đầu Tư BĐS" },
      author: "Trần Thị B",
      category: "realestate",
    },
    {
      id: "mock-3",
      title: "Công nghệ AI trong quản lý dự án xây dựng",
      description:
        "Nhiều doanh nghiệp xây dựng đã áp dụng trí tuệ nhân tạo để tối ưu hóa quản lý dự án và giảm chi phí.",
      content:
        "Trong bối cảnh chuyển đổi số, ngành xây dựng đang tích cực áp dụng công nghệ AI...",
      url: "https://example.com/news/3",
      imageUrl:
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      source: { id: null, name: "Công Nghệ & Xây Dựng" },
      author: "Lê Văn C",
      category: "technology",
    },
    {
      id: "mock-4",
      title: "Phú Quốc: Điểm đến hàng đầu cho resort cao cấp",
      description:
        "Phú Quốc tiếp tục khẳng định vị thế là điểm đến hàng đầu cho các dự án resort cao cấp tại Việt Nam.",
      content:
        "Với lợi thế về vị trí địa lý và cảnh quan thiên nhiên, Phú Quốc đang thu hút nhiều nhà đầu tư...",
      url: "https://example.com/news/4",
      imageUrl:
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
      publishedAt: new Date(Date.now() - 259200000).toISOString(),
      source: { id: null, name: "Du Lịch Việt" },
      author: "Phạm Thị D",
      category: "general",
    },
    {
      id: "mock-5",
      title: "Vật liệu xây dựng xanh: Tương lai của ngành công nghiệp",
      description:
        "Xu hướng sử dụng vật liệu xây dựng thân thiện với môi trường đang ngày càng phổ biến.",
      content:
        "Các vật liệu xây dựng xanh như tre, gỗ tái chế, bê tông tái sinh đang được ưa chuộng...",
      url: "https://example.com/news/5",
      imageUrl:
        "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800",
      publishedAt: new Date(Date.now() - 345600000).toISOString(),
      source: { id: null, name: "Xây Dựng Xanh" },
      author: "Hoàng Văn E",
      category: "construction",
    },
  ];

  let filtered = mockArticles;

  // Filter by query
  if (query.q) {
    const q = query.q.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q),
    );
  }

  // Filter by category
  if (query.category) {
    filtered = filtered.filter((a) => a.category === query.category);
  }

  // Limit results
  if (query.pageSize) {
    filtered = filtered.slice(0, query.pageSize);
  }

  return {
    articles: filtered,
    totalResults: filtered.length,
    source: "mock",
  };
}

// ============================================
// Category Labels
// ============================================
export const NEWS_CATEGORY_LABELS: Record<NewsCategory, string> = {
  general: "Tổng hợp",
  business: "Kinh doanh",
  technology: "Công nghệ",
  entertainment: "Giải trí",
  sports: "Thể thao",
  science: "Khoa học",
  health: "Sức khỏe",
  construction: "Xây dựng",
  realestate: "Bất động sản",
};

export const NEWS_CATEGORIES: NewsCategory[] = [
  "general",
  "construction",
  "realestate",
  "business",
  "technology",
  "health",
  "entertainment",
  "sports",
  "science",
];

export default {
  getNews,
  getTopHeadlines,
  searchNews,
  getConstructionNews,
  getRealEstateNews,
  getNewsByCategories,
  NEWS_CATEGORY_LABELS,
  NEWS_CATEGORIES,
};
