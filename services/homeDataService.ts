/**
 * Home Data Service
 * Fetches dynamic data for home screen from API
 * Falls back to local data if API is unavailable
 * @updated 2026-01-30 - Added API response transformers
 * @updated 2026-01-30 - Added mock data fallback for missing endpoints
 */

import { apiFetch } from "./api";
import {
    mockBanners,
    mockFeaturedServices,
    mockVideos
} from "./mockDataService";

// ============================================================================
// Type Definitions
// ============================================================================

export interface ServiceItem {
  id: number;
  label: string;
  icon?: string | any;
  route: string;
  price?: string;
  location?: string;
  description?: string;
}

// API response types (different from frontend types)
interface ApiServiceItem {
  id: string | number;
  name: string;
  description?: string;
  icon?: string;
  price?: string;
  rating?: number;
  orderCount?: number;
}

interface ApiWorkerItem {
  id: string | number;
  name: string;
  avatar?: string;
  rating?: number;
  reviewCount?: number;
  experience?: string;
  location?: string;
  hourlyRate?: number;
  skills?: string[];
  verified?: boolean;
  category?: string;
}

interface ApiVideoItem {
  id: string | number;
  title: string;
  thumbnail?: string;
  duration?: string;
  views?: number;
  author?: {
    id: string;
    name: string;
    avatar: string;
  };
}

interface ApiCategoryItem {
  id: string | number;
  name: string;
  icon?: string;
  color?: string;
  productCount?: number;
  thumbnail?: string;
  itemCount?: number;
}

interface ApiBannerItem {
  id: string | number;
  title: string;
  subtitle?: string;
  image?: string;
  link?: string;
  backgroundColor?: string;
}

interface ApiLiveStreamItem {
  id: string | number;
  title: string;
  thumbnail?: string;
  viewerCount?: number;
  host?: {
    id: string;
    name: string;
    avatar: string;
    verified?: boolean;
  };
  status?: string;
}

export interface LiveStreamItem {
  id: number;
  image: string;
  badge: boolean;
  route: string;
  title?: string;
  viewerCount?: number;
  isLive?: boolean;
}

export interface WorkerItem {
  id: number;
  label: string;
  icon?: string | any;
  route: string;
  price?: string;
  location?: string;
  rating?: number;
  available?: boolean;
  category?: string;
}

export interface VideoItem {
  id: number;
  image: string;
  title: string;
  views: string;
  duration: string;
  route: string;
  videoUrl?: string;
}

export interface CategoryItem {
  id: number;
  label: string;
  icon?: string | any;
  route: string;
  count?: number;
}

export interface BannerItem {
  id: number;
  image: string;
  title: string;
  subtitle?: string;
  route?: string;
}

export interface HomeDataResponse {
  services?: ServiceItem[];
  designServices?: ServiceItem[];
  equipmentItems?: ServiceItem[];
  libraryItems?: CategoryItem[];
  constructionWorkers?: WorkerItem[];
  finishingWorkers?: WorkerItem[];
  videoItems?: VideoItem[];
  liveStreams?: LiveStreamItem[];
  categories?: CategoryItem[];
  banners?: BannerItem[];
}

// ============================================================================
// Transform Functions - Convert API response to frontend format
// ============================================================================

/**
 * Transform API service item to frontend ServiceItem
 */
function transformApiService(item: ApiServiceItem): ServiceItem {
  return {
    id: Number(item.id),
    label: item.name,
    icon: item.icon, // Ionicon name string or image URL
    route: `/services/${item.id}`,
    price: item.price,
    description: item.description,
  };
}

/**
 * Transform API worker item to frontend WorkerItem
 */
function transformApiWorker(item: ApiWorkerItem): WorkerItem {
  return {
    id: Number(item.id),
    label: item.name,
    icon: item.avatar, // Avatar URL
    route: `/workers/${item.id}`,
    price: item.hourlyRate
      ? `${item.hourlyRate.toLocaleString("vi-VN")}đ/giờ`
      : undefined,
    location: item.location,
    rating: item.rating,
    available: true,
    category: item.category,
  };
}

/**
 * Transform API video item to frontend VideoItem
 */
function transformApiVideo(item: ApiVideoItem): VideoItem {
  return {
    id: Number(item.id),
    image: item.thumbnail || "",
    title: item.title,
    views: item.views ? formatViews(item.views) : "0",
    duration: item.duration || "0:00",
    route: `/videos/${item.id}`,
  };
}

/**
 * Transform API category item to frontend CategoryItem
 */
function transformApiCategory(item: ApiCategoryItem): CategoryItem {
  return {
    id: Number(item.id),
    label: item.name,
    icon: item.icon || item.thumbnail, // Ionicon name or thumbnail URL
    route: `/categories/${item.id}`,
    count: item.productCount || item.itemCount,
  };
}

/**
 * Transform API banner item to frontend BannerItem
 */
function transformApiBanner(item: ApiBannerItem): BannerItem {
  return {
    id: Number(item.id),
    image: item.image || "",
    title: item.title,
    subtitle: item.subtitle,
    route: item.link,
  };
}

/**
 * Transform API livestream item to frontend LiveStreamItem
 */
function transformApiLiveStream(item: ApiLiveStreamItem): LiveStreamItem {
  return {
    id: Number(item.id),
    image: item.thumbnail || "",
    badge: item.status === "live",
    route: `/livestreams/${item.id}`,
    title: item.title,
    viewerCount: item.viewerCount,
    isLive: item.status === "live",
  };
}

/**
 * Format views count to human readable string
 */
function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(0)}K`;
  }
  return views.toString();
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch all home screen data in one request
 */
export async function fetchHomeData(): Promise<HomeDataResponse> {
  try {
    const response = await apiFetch<any>("/home/data");
    const data = response.data || response;

    // Transform API response to frontend format
    const result: HomeDataResponse = {};

    if (data.services && Array.isArray(data.services)) {
      result.services = data.services.map(transformApiService);
    }
    if (data.categories?.featured) {
      result.categories = data.categories.featured.map(transformApiCategory);
    }
    if (data.categories?.library) {
      result.libraryItems = data.categories.library.map(transformApiCategory);
    }
    if (data.workers?.construction) {
      result.constructionWorkers =
        data.workers.construction.map(transformApiWorker);
    }
    if (data.workers?.finishing) {
      result.finishingWorkers = data.workers.finishing.map(transformApiWorker);
    }
    if (data.videos) {
      result.videoItems = data.videos.map(transformApiVideo);
    }
    if (data.livestreams) {
      result.liveStreams = data.livestreams.map(transformApiLiveStream);
    }
    if (data.banners) {
      result.banners = data.banners.map(transformApiBanner);
    }
    if (data.products?.equipment) {
      result.equipmentItems = data.products.equipment.map((item: any) => ({
        id: Number(item.id),
        label: item.name,
        icon: item.image,
        route: `/products/${item.id}`,
        price: item.price
          ? `${item.price.toLocaleString("vi-VN")}đ`
          : undefined,
      }));
    }

    return result;
  } catch (error) {
    console.warn("[HomeDataService] API failed, using mock data");
    // Return mock data as fallback
    return {
      services: mockFeaturedServices.map((s) => ({
        id: Number(s.id),
        label: s.label,
        icon: s.icon,
        route: s.route,
        price: s.price,
        description: s.description,
      })),
      banners: mockBanners.map((b) => ({
        id: Number(b.id),
        image: b.image,
        title: b.title,
        subtitle: b.subtitle,
        route: b.route,
      })),
      videoItems: mockVideos.map((v) => ({
        id: Number(v.id),
        image: v.thumbnail,
        title: v.title,
        views: formatViews(v.views),
        duration: v.duration,
        route: `/videos/${v.id}`,
      })),
    };
  }
}

/**
 * Fetch main services list
 */
export async function fetchServices(): Promise<ServiceItem[]> {
  try {
    const response = await apiFetch<{ data: ApiServiceItem[] }>(
      "/home/services/featured",
    );
    return (response.data || []).map(transformApiService);
  } catch (error) {
    console.warn("[HomeDataService] Failed to fetch services:", error);
    return [];
  }
}

/**
 * Fetch design services/utilities
 */
export async function fetchDesignServices(): Promise<ServiceItem[]> {
  try {
    const response = await apiFetch<{ data: ApiServiceItem[] }>(
      "/home/services/design",
    );
    return (response.data || []).map(transformApiService);
  } catch (error) {
    console.warn("[HomeDataService] Failed to fetch design services:", error);
    return [];
  }
}

/**
 * Fetch equipment and furniture items
 */
export async function fetchEquipment(): Promise<ServiceItem[]> {
  try {
    const response = await apiFetch<{ data: any[] }>(
      "/home/products/equipment",
    );
    return (response.data || []).map((item: any) => ({
      id: Number(item.id),
      label: item.name,
      icon: item.image,
      route: `/products/${item.id}`,
      price: item.price ? `${item.price.toLocaleString("vi-VN")}đ` : undefined,
    }));
  } catch (error) {
    console.warn("[HomeDataService] Failed to fetch equipment:", error);
    return [];
  }
}

/**
 * Fetch design library categories
 */
export async function fetchLibraryCategories(): Promise<CategoryItem[]> {
  try {
    const response = await apiFetch<{ data: ApiCategoryItem[] }>(
      "/categories/library",
    );
    return (response.data || []).map(transformApiCategory);
  } catch (error) {
    console.warn(
      "[HomeDataService] Failed to fetch library categories:",
      error,
    );
    return [];
  }
}

/**
 * Fetch construction workers
 */
export async function fetchConstructionWorkers(): Promise<WorkerItem[]> {
  try {
    const response = await apiFetch<{ data: ApiWorkerItem[] }>(
      "/workers?category=construction",
    );
    return (response.data || []).map(transformApiWorker);
  } catch (error) {
    console.warn(
      "[HomeDataService] Failed to fetch construction workers:",
      error,
    );
    return [];
  }
}

/**
 * Fetch finishing workers
 */
export async function fetchFinishingWorkers(): Promise<WorkerItem[]> {
  try {
    const response = await apiFetch<{ data: ApiWorkerItem[] }>(
      "/workers?category=finishing",
    );
    return (response.data || []).map(transformApiWorker);
  } catch (error) {
    console.warn("[HomeDataService] Failed to fetch finishing workers:", error);
    return [];
  }
}

/**
 * Fetch featured videos
 */
export async function fetchFeaturedVideos(): Promise<VideoItem[]> {
  try {
    const response = await apiFetch<{ data: ApiVideoItem[] }>(
      "/videos/featured",
    );
    return (response.data || []).map(transformApiVideo);
  } catch (error) {
    console.warn("[HomeDataService] Failed to fetch featured videos:", error);
    return [];
  }
}

/**
 * Fetch active live streams
 */
export async function fetchLiveStreams(): Promise<LiveStreamItem[]> {
  try {
    const response = await apiFetch<{ data: ApiLiveStreamItem[] }>(
      "/livestreams/active",
    );
    return (response.data || []).map(transformApiLiveStream);
  } catch (error) {
    console.warn("[HomeDataService] Failed to fetch live streams:", error);
    return [];
  }
}

/**
 * Fetch featured categories
 */
export async function fetchFeaturedCategories(): Promise<CategoryItem[]> {
  try {
    const response = await apiFetch<{ data: ApiCategoryItem[] }>(
      "/categories/featured",
    );
    return (response.data || []).map(transformApiCategory);
  } catch (error) {
    console.warn(
      "[HomeDataService] Failed to fetch featured categories:",
      error,
    );
    return [];
  }
}

/**
 * Fetch home banners
 */
export async function fetchBanners(): Promise<BannerItem[]> {
  try {
    const response = await apiFetch<{ data: ApiBannerItem[] }>("/banners/home");
    return (response.data || []).map(transformApiBanner);
  } catch (error) {
    console.warn("[HomeDataService] Failed to fetch banners:", error);
    return [];
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Merge API data with local fallback data
 */
export function mergeWithFallback<T extends { id: number }>(
  apiData: T[],
  fallbackData: T[],
): T[] {
  if (apiData.length > 0) {
    return apiData;
  }
  return fallbackData;
}

/**
 * Transform API service item to local format with icon
 */
export function transformServiceItem(
  item: ServiceItem,
  iconMap: Record<string, any>,
  defaultIcon: any,
): ServiceItem {
  return {
    ...item,
    icon: iconMap[item.id.toString()] || item.icon || defaultIcon,
  };
}
