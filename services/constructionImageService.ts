/**
 * Construction Image Service
 * ==========================
 * 
 * Service để cung cấp hình ảnh cho các dự án xây dựng
 * - Fallback từ Pexels API khi không có hình
 * - Cache hình ảnh để tối ưu performance
 * - Các hình ảnh mặc định theo loại dự án
 * 
 * @author AI Assistant
 * @date 14/01/2026
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchPhotos } from './pexelsService';

// ==================== CONSTANTS ====================

const CACHE_KEY = '@construction_images_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Hình ảnh mặc định theo loại dự án (từ Unsplash - luôn hoạt động)
export const DEFAULT_PROJECT_IMAGES = {
  villa: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
  ],
  townhouse: [
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&h=600&fit=crop',
  ],
  apartment: [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
  ],
  resort: [
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
  ],
  office: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&h=600&fit=crop',
  ],
  interior: [
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=600&fit=crop',
  ],
  construction: [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
  ],
  landscape: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1598902108854-10e335adac99?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
  ],
};

// Từ khóa tìm kiếm theo loại dự án
const PROJECT_SEARCH_KEYWORDS: Record<string, string[]> = {
  villa: ['luxury villa', 'modern villa', 'villa architecture', 'villa exterior'],
  townhouse: ['townhouse', 'row house', 'modern townhouse', 'city house'],
  apartment: ['apartment interior', 'modern apartment', 'condo', 'apartment building'],
  resort: ['resort', 'beach resort', 'luxury resort', 'hotel resort'],
  office: ['office building', 'modern office', 'office interior', 'commercial building'],
  interior: ['interior design', 'modern interior', 'home interior', 'living room design'],
  construction: ['construction site', 'building construction', 'construction worker', 'construction project'],
  landscape: ['landscape design', 'garden design', 'backyard', 'outdoor living'],
};

export type ProjectType = keyof typeof DEFAULT_PROJECT_IMAGES;

// ==================== CACHE MANAGEMENT ====================

interface ImageCache {
  images: Record<string, string[]>;
  timestamp: number;
}

let memoryCache: ImageCache | null = null;

/**
 * Lấy cache từ storage
 */
async function getCache(): Promise<ImageCache | null> {
  if (memoryCache) return memoryCache;
  
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed: ImageCache = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        memoryCache = parsed;
        return parsed;
      }
    }
  } catch (error) {
    console.warn('[ConstructionImages] Cache read error:', error);
  }
  return null;
}

/**
 * Lưu cache
 */
async function setCache(images: Record<string, string[]>): Promise<void> {
  const cache: ImageCache = {
    images,
    timestamp: Date.now(),
  };
  memoryCache = cache;
  
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('[ConstructionImages] Cache write error:', error);
  }
}

// ==================== IMAGE FETCHING ====================

/**
 * Lấy hình ảnh từ Pexels API theo loại dự án
 */
export async function fetchProjectImages(
  projectType: ProjectType,
  count: number = 10
): Promise<string[]> {
  try {
    const keywords = PROJECT_SEARCH_KEYWORDS[projectType] || PROJECT_SEARCH_KEYWORDS.construction;
    const keyword = keywords[Math.floor(Math.random() * keywords.length)];
    
    const response = await searchPhotos(keyword, {
      orientation: 'landscape',
      per_page: count,
    });
    
    return response.photos.map(photo => photo.src.large);
  } catch (error) {
    console.warn('[ConstructionImages] Pexels fetch error:', error);
    return [];
  }
}

/**
 * Lấy một hình ảnh ngẫu nhiên cho loại dự án
 * Ưu tiên từ Pexels, fallback về Unsplash
 */
export async function getProjectImage(
  projectType: ProjectType = 'construction',
  index?: number
): Promise<string> {
  // Thử lấy từ cache trước
  const cache = await getCache();
  const cachedImages = cache?.images[projectType];
  
  if (cachedImages && cachedImages.length > 0) {
    const idx = index !== undefined ? index % cachedImages.length : Math.floor(Math.random() * cachedImages.length);
    return cachedImages[idx];
  }
  
  // Nếu không có cache, trả về default và fetch async
  const defaults = DEFAULT_PROJECT_IMAGES[projectType] || DEFAULT_PROJECT_IMAGES.construction;
  const idx = index !== undefined ? index % defaults.length : Math.floor(Math.random() * defaults.length);
  
  // Fetch và cache async (không chờ)
  fetchAndCacheImages(projectType);
  
  return defaults[idx];
}

/**
 * Fetch và cache hình ảnh async
 */
async function fetchAndCacheImages(projectType: ProjectType): Promise<void> {
  try {
    const images = await fetchProjectImages(projectType, 20);
    if (images.length > 0) {
      const cache = await getCache();
      const updatedImages = {
        ...(cache?.images || {}),
        [projectType]: images,
      };
      await setCache(updatedImages);
    }
  } catch (error) {
    console.warn('[ConstructionImages] Background fetch error:', error);
  }
}

/**
 * Lấy nhiều hình ảnh cho loại dự án
 */
export async function getProjectImages(
  projectType: ProjectType = 'construction',
  count: number = 4
): Promise<string[]> {
  const cache = await getCache();
  const cachedImages = cache?.images[projectType];
  
  if (cachedImages && cachedImages.length >= count) {
    return cachedImages.slice(0, count);
  }
  
  // Fallback về default
  const defaults = DEFAULT_PROJECT_IMAGES[projectType] || DEFAULT_PROJECT_IMAGES.construction;
  
  // Fetch async
  fetchAndCacheImages(projectType);
  
  return defaults.slice(0, count);
}

// ==================== FALLBACK HELPER ====================

/**
 * Kiểm tra URL hình ảnh có hợp lệ không
 */
export function isValidImageUrl(url?: string | null): boolean {
  if (!url) return false;
  if (typeof url !== 'string') return false;
  if (url.trim() === '') return false;
  if (url === 'null' || url === 'undefined') return false;
  if (url.includes('placeholder') || url.includes('via.placeholder')) return false;
  
  // Kiểm tra URL hợp lệ
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Lấy hình ảnh với fallback
 * Nếu URL không hợp lệ, trả về hình mặc định
 */
export function getImageWithFallback(
  imageUrl?: string | null,
  projectType: ProjectType = 'construction',
  index: number = 0
): string {
  if (isValidImageUrl(imageUrl)) {
    return imageUrl!;
  }
  
  const defaults = DEFAULT_PROJECT_IMAGES[projectType] || DEFAULT_PROJECT_IMAGES.construction;
  return defaults[index % defaults.length];
}

/**
 * Lấy hình ảnh async với fallback từ Pexels
 */
export async function getImageWithFallbackAsync(
  imageUrl?: string | null,
  projectType: ProjectType = 'construction',
  index: number = 0
): Promise<string> {
  if (isValidImageUrl(imageUrl)) {
    return imageUrl!;
  }
  
  return getProjectImage(projectType, index);
}

// ==================== PRELOAD ====================

/**
 * Preload hình ảnh cho tất cả loại dự án
 * Gọi khi app khởi động để có sẵn hình
 */
export async function preloadProjectImages(): Promise<void> {
  const types: ProjectType[] = ['villa', 'townhouse', 'apartment', 'resort', 'construction', 'interior'];
  
  await Promise.all(
    types.map(type => fetchAndCacheImages(type))
  );
}

// ==================== EXPORT ====================

export const ConstructionImageService = {
  getProjectImage,
  getProjectImages,
  fetchProjectImages,
  getImageWithFallback,
  getImageWithFallbackAsync,
  isValidImageUrl,
  preloadProjectImages,
  DEFAULT_IMAGES: DEFAULT_PROJECT_IMAGES,
};

export default ConstructionImageService;
