// services/video.ts
import { api } from '@/services/api';

export async function fetchVideos(limit = 100) {
  try {
    const { data } = await api.get('/videos', { params: { limit } });
    // { ok: true, videos: [...] }
    return data.videos ?? [];
  } catch (error) {
    console.warn('[VideoService] Failed to fetch videos:', error);
    // Fallback to empty array instead of throwing
    return [];
  }
}