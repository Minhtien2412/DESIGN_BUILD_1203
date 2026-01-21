/**
 * Pexels API Service
 * Lấy ảnh và video miễn phí từ Pexels
 * API Documentation: https://www.pexels.com/api/documentation/
 * Created: 13/01/2026
 */

import { ENV } from '@/config/env';

const PEXELS_API_KEY = ENV.PEXELS_API_KEY || process.env.EXPO_PUBLIC_PEXELS_API_KEY || '';
const BASE_URL = 'https://api.pexels.com';

// ==================== TYPES ====================

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  duration: number;
  user: {
    id: number;
    name: string;
    url: string;
  };
  video_files: PexelsVideoFile[];
  video_pictures: PexelsVideoPicture[];
}

export interface PexelsVideoFile {
  id: number;
  quality: 'hd' | 'sd' | 'hls';
  file_type: string;
  width: number;
  height: number;
  fps: number;
  link: string;
}

export interface PexelsVideoPicture {
  id: number;
  picture: string;
  nr: number;
}

export interface PexelsPhotosResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
  prev_page?: string;
}

export interface PexelsVideosResponse {
  total_results: number;
  page: number;
  per_page: number;
  videos: PexelsVideo[];
  next_page?: string;
  prev_page?: string;
}

// ==================== API HELPERS ====================

async function pexelsFetch<T>(endpoint: string): Promise<T> {
  if (!PEXELS_API_KEY) {
    throw new Error('Pexels API key is not configured');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: PEXELS_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ==================== PHOTOS API ====================

/**
 * Tìm kiếm ảnh theo từ khóa
 * @param query Từ khóa tìm kiếm (vd: "construction", "villa", "interior design")
 * @param options Tùy chọn tìm kiếm
 */
export async function searchPhotos(
  query: string,
  options?: {
    orientation?: 'landscape' | 'portrait' | 'square';
    size?: 'large' | 'medium' | 'small';
    color?: string;
    locale?: string;
    page?: number;
    per_page?: number;
  }
): Promise<PexelsPhotosResponse> {
  const params = new URLSearchParams({
    query,
    page: String(options?.page || 1),
    per_page: String(options?.per_page || 15),
  });

  if (options?.orientation) params.append('orientation', options.orientation);
  if (options?.size) params.append('size', options.size);
  if (options?.color) params.append('color', options.color);
  if (options?.locale) params.append('locale', options.locale);

  return pexelsFetch<PexelsPhotosResponse>(`/v1/search?${params.toString()}`);
}

/**
 * Lấy ảnh được tuyển chọn (curated)
 */
export async function getCuratedPhotos(
  page = 1,
  per_page = 15
): Promise<PexelsPhotosResponse> {
  return pexelsFetch<PexelsPhotosResponse>(`/v1/curated?page=${page}&per_page=${per_page}`);
}

/**
 * Lấy chi tiết một ảnh theo ID
 */
export async function getPhoto(id: number): Promise<PexelsPhoto> {
  return pexelsFetch<PexelsPhoto>(`/v1/photos/${id}`);
}

// ==================== VIDEOS API ====================

/**
 * Tìm kiếm video theo từ khóa
 * @param query Từ khóa (vd: "construction timelapse", "building", "architecture")
 */
export async function searchVideos(
  query: string,
  options?: {
    orientation?: 'landscape' | 'portrait' | 'square';
    size?: 'large' | 'medium' | 'small';
    locale?: string;
    page?: number;
    per_page?: number;
  }
): Promise<PexelsVideosResponse> {
  const params = new URLSearchParams({
    query,
    page: String(options?.page || 1),
    per_page: String(options?.per_page || 15),
  });

  if (options?.orientation) params.append('orientation', options.orientation);
  if (options?.size) params.append('size', options.size);
  if (options?.locale) params.append('locale', options.locale);

  return pexelsFetch<PexelsVideosResponse>(`/videos/search?${params.toString()}`);
}

/**
 * Lấy video phổ biến
 */
export async function getPopularVideos(
  page = 1,
  per_page = 15,
  min_width?: number,
  min_duration?: number,
  max_duration?: number
): Promise<PexelsVideosResponse> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(per_page),
  });

  if (min_width) params.append('min_width', String(min_width));
  if (min_duration) params.append('min_duration', String(min_duration));
  if (max_duration) params.append('max_duration', String(max_duration));

  return pexelsFetch<PexelsVideosResponse>(`/videos/popular?${params.toString()}`);
}

/**
 * Lấy chi tiết một video theo ID
 */
export async function getVideo(id: number): Promise<PexelsVideo> {
  return pexelsFetch<PexelsVideo>(`/videos/videos/${id}`);
}

// ==================== CONSTRUCTION SPECIFIC ====================

// Các từ khóa liên quan đến xây dựng để tìm kiếm
export const CONSTRUCTION_KEYWORDS = {
  general: ['construction', 'building', 'architecture'],
  villa: ['villa', 'luxury house', 'modern home', 'mansion'],
  resort: ['resort', 'hotel', 'vacation home', 'beach house'],
  interior: ['interior design', 'living room', 'modern interior', 'home decor'],
  landscape: ['garden design', 'landscaping', 'outdoor', 'swimming pool'],
  material: ['concrete', 'brick wall', 'wood texture', 'marble'],
  technique: ['construction worker', 'building site', 'crane', 'scaffolding'],
  timelapse: ['timelapse construction', 'building timelapse'],
};

/**
 * Lấy ảnh xây dựng theo danh mục
 */
export async function getConstructionPhotos(
  category: keyof typeof CONSTRUCTION_KEYWORDS,
  page = 1,
  per_page = 15
): Promise<PexelsPhotosResponse> {
  const keywords = CONSTRUCTION_KEYWORDS[category];
  const query = keywords[Math.floor(Math.random() * keywords.length)];
  return searchPhotos(query, { page, per_page, orientation: 'landscape' });
}

/**
 * Lấy video xây dựng theo danh mục
 */
export async function getConstructionVideos(
  category: keyof typeof CONSTRUCTION_KEYWORDS,
  page = 1,
  per_page = 10
): Promise<PexelsVideosResponse> {
  const keywords = CONSTRUCTION_KEYWORDS[category];
  const query = keywords[Math.floor(Math.random() * keywords.length)];
  return searchVideos(query, { page, per_page, orientation: 'landscape' });
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Lấy URL video chất lượng tốt nhất
 */
export function getBestVideoUrl(video: PexelsVideo): string {
  const hdFile = video.video_files.find(f => f.quality === 'hd');
  const sdFile = video.video_files.find(f => f.quality === 'sd');
  return hdFile?.link || sdFile?.link || video.video_files[0]?.link || '';
}

/**
 * Lấy URL video chất lượng SD (nhẹ hơn)
 */
export function getSDVideoUrl(video: PexelsVideo): string {
  const sdFile = video.video_files.find(f => f.quality === 'sd' && f.width >= 640);
  return sdFile?.link || video.video_files[0]?.link || '';
}

/**
 * Format duration từ giây sang mm:ss
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Chuyển đổi Pexels Video sang VideoItem format của app
 */
export function pexelsVideoToAppVideo(video: PexelsVideo, category?: string) {
  return {
    id: `pexels-${video.id}`,
    title: `Video #${video.id}`,
    url: getBestVideoUrl(video),
    thumbnail: video.image,
    author: video.user.name,
    authorAvatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(video.user.name)}&background=6366f1&color=fff`,
    duration: formatDuration(video.duration),
    views: Math.floor(Math.random() * 50000) + 1000,
    likes: Math.floor(Math.random() * 5000) + 100,
    comments: Math.floor(Math.random() * 500) + 10,
    category: category || 'other',
    type: 'vod' as const,
    hashtags: ['pexels', 'free', category || 'video'].filter(Boolean),
  };
}

/**
 * Chuyển đổi Pexels Photo sang format của app
 */
export function pexelsPhotoToAppPhoto(photo: PexelsPhoto, category?: string) {
  return {
    id: `pexels-photo-${photo.id}`,
    title: photo.alt || `Photo by ${photo.photographer}`,
    url: photo.src.large,
    thumbnail: photo.src.medium,
    author: photo.photographer,
    authorUrl: photo.photographer_url,
    width: photo.width,
    height: photo.height,
    avgColor: photo.avg_color,
    category: category || 'other',
    sources: photo.src,
  };
}

// ==================== API STATUS CHECK ====================

/**
 * Kiểm tra trạng thái API Pexels
 */
export async function checkPexelsStatus(): Promise<{
  status: 'working' | 'error' | 'not_configured';
  message: string;
  latency?: number;
}> {
  if (!PEXELS_API_KEY) {
    return {
      status: 'not_configured',
      message: 'Pexels API key chưa được cấu hình',
    };
  }

  try {
    const start = Date.now();
    await getCuratedPhotos(1, 1);
    const latency = Date.now() - start;

    return {
      status: 'working',
      message: 'Pexels API hoạt động bình thường',
      latency,
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Lỗi không xác định',
    };
  }
}

export default {
  // Photos
  searchPhotos,
  getCuratedPhotos,
  getPhoto,
  getConstructionPhotos,
  
  // Videos
  searchVideos,
  getPopularVideos,
  getVideo,
  getConstructionVideos,
  
  // Helpers
  getBestVideoUrl,
  getSDVideoUrl,
  formatDuration,
  pexelsVideoToAppVideo,
  pexelsPhotoToAppPhoto,
  checkPexelsStatus,
  
  // Constants
  CONSTRUCTION_KEYWORDS,
};
