// services/video.ts
import { api } from '@/services/api';

export async function fetchVideos(limit = 100) {
  try {
    // api.get accepts params as plain object, not nested under { params }
    const res = await api.get('/videos', { limit });
    // Normalize common response shapes
    if (Array.isArray(res)) return res;
    if (Array.isArray((res as any)?.videos)) return (res as any).videos;
    if (Array.isArray((res as any)?.data)) return (res as any).data;
    if (Array.isArray((res as any)?.data?.items)) return (res as any).data.items;
    return [];
  } catch (error) {
    console.warn('[VideoService] Failed to fetch videos:', error);
    // Fallback to empty array instead of throwing
    return [];
  }
}