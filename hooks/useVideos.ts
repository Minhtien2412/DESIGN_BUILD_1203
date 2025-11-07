import { getLocalVideosByCategory, type LocalVideo } from '@/data/localVideos';
import { apiFetch } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';

export interface Video {
  id: string | number;
  title: string;
  description?: string;
  url?: string; // Optional - for API videos
  asset?: any; // Optional - for local videos from require()
  thumbnail?: string;
  thumbnailUrl?: string;
  duration?: number;
  category?: 'design' | 'construction' | 'tutorial' | 'showcase';
  views?: number;
  likes?: number;
  createdAt?: string;
  author?: {
    name: string;
    avatar?: string;
  };
}

interface UseVideosOptions {
  category?: string;
  limit?: number;
  autoFetch?: boolean;
}

export function useVideos(options: UseVideosOptions = {}) {
  const { category, limit = 10, autoFetch = true } = options;
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (limit) params.append('limit', limit.toString());

      // Fetch from API
      const response = await apiFetch(`/api/videos?${params.toString()}`);
      
      console.log('[useVideos] API Response:', JSON.stringify(response, null, 2));
      
      // Handle various response formats
      let videoData: Video[] = [];
      
      if (response && typeof response === 'object') {
        // Case 1: { success: true, data: { items: [...] } } - Current API format
        if (response.success && response.data && typeof response.data === 'object') {
          if (Array.isArray(response.data.items)) {
            videoData = response.data.items;
          } else if (Array.isArray(response.data)) {
            videoData = response.data;
          }
        }
        // Case 2: { data: { items: [...] } }
        else if (response.data && typeof response.data === 'object' && Array.isArray(response.data.items)) {
          videoData = response.data.items;
        }
        // Case 3: { data: [...] }
        else if (Array.isArray(response.data)) {
          videoData = response.data;
        }
        // Case 4: { videos: [...] }
        else if (Array.isArray(response.videos)) {
          videoData = response.videos;
        }
        // Case 5: { items: [...] }
        else if (Array.isArray(response.items)) {
          videoData = response.items;
        }
        // Case 6: { results: [...] }
        else if (Array.isArray(response.results)) {
          videoData = response.results;
        }
        // Case 7: Direct array response
        else if (Array.isArray(response)) {
          videoData = response;
        }
        // Case 8: Single video object
        else if (response.id || response.url) {
          videoData = [response];
        }
        // Case 9: Empty object or unexpected format
        else {
          console.warn('[useVideos] Unexpected response format:', Object.keys(response));
          // Fall back to local videos
          videoData = convertLocalVideosToVideos(getLocalVideosByCategory(category));
        }
      } else if (Array.isArray(response)) {
        // Case 10: Direct array at root
        videoData = response;
      } else {
        console.warn('[useVideos] Unexpected response type:', typeof response);
        // Fall back to local videos
        videoData = convertLocalVideosToVideos(getLocalVideosByCategory(category));
      }
      
      setVideos(videoData);
      setHasMore(videoData.length >= limit);
      
    } catch (err: any) {
      console.error('[useVideos] Error fetching videos:', err);
      setError(err.message || 'Failed to fetch videos');
      
      // Fall back to local videos from assets/videos/
      console.log('[useVideos] Using local videos from assets/videos/');
      const localVideos = getLocalVideosByCategory(category);
      setVideos(convertLocalVideosToVideos(localVideos.slice(0, limit)));
    } finally {
      setLoading(false);
    }
  }, [category, limit]);

  const refresh = useCallback(async () => {
    await fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    if (autoFetch) {
      fetchVideos();
    }
  }, [autoFetch, fetchVideos]);

  return {
    videos,
    loading,
    error,
    hasMore,
    refresh,
    fetchVideos
  };
}

/**
 * Convert local videos to Video format
 */
function convertLocalVideosToVideos(localVideos: LocalVideo[]): Video[] {
  return localVideos.map(lv => ({
    id: lv.id,
    title: lv.title,
    description: lv.description,
    // Prefer remote url if provided; otherwise pass through local asset
    url: lv.url,
    asset: lv.asset,
    thumbnail: lv.thumbnail,
    duration: lv.duration,
    category: lv.category,
    views: lv.views,
    likes: lv.likes,
    author: lv.author,
  }));
}

// Mock data for development/fallback (deprecated - use local videos instead)
function getMockVideos(category?: string): Video[] {
  const allVideos: Video[] = [
    {
      id: 1,
      title: 'Thiết kế phòng bếp hiện đại',
      description: 'Khám phá xu hướng thiết kế phòng bếp 2025',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: 'https://picsum.photos/400/300?random=1',
      duration: 120,
      category: 'design',
      views: 1234,
      likes: 89,
      author: {
        name: 'Kiến trúc sư Minh',
        avatar: 'https://i.pravatar.cc/150?img=1'
      }
    },
    {
      id: 2,
      title: 'Thi công biệt thự 3 tầng',
      description: 'Quy trình thi công chi tiết từ A-Z',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail: 'https://picsum.photos/400/300?random=2',
      duration: 180,
      category: 'construction',
      views: 2345,
      likes: 156,
      author: {
        name: 'KS Tuấn',
        avatar: 'https://i.pravatar.cc/150?img=2'
      }
    },
    {
      id: 3,
      title: 'Nội thất phòng khách sang trọng',
      description: 'Bí quyết trang trí phòng khách đẹp mắt',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail: 'https://picsum.photos/400/300?random=3',
      duration: 90,
      category: 'design',
      views: 3456,
      likes: 234,
      author: {
        name: 'Designer Lan',
        avatar: 'https://i.pravatar.cc/150?img=3'
      }
    },
    {
      id: 4,
      title: 'Xây dựng nhà phố 4 tầng',
      description: 'Tiến độ thi công và giám sát chất lượng',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnail: 'https://picsum.photos/400/300?random=4',
      duration: 150,
      category: 'construction',
      views: 4567,
      likes: 312,
      author: {
        name: 'KS Hùng',
        avatar: 'https://i.pravatar.cc/150?img=4'
      }
    },
    {
      id: 5,
      title: 'Thiết kế không gian mở',
      description: 'Xu hướng thiết kế không gian liền mạch',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      thumbnail: 'https://picsum.photos/400/300?random=5',
      duration: 100,
      category: 'design',
      views: 5678,
      likes: 401,
      author: {
        name: 'Kiến trúc sư Phương',
        avatar: 'https://i.pravatar.cc/150?img=5'
      }
    },
    {
      id: 6,
      title: 'Hướng dẫn hoàn thiện nhà',
      description: 'Các bước hoàn thiện từ thô đến hoàn thiện',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      thumbnail: 'https://picsum.photos/400/300?random=6',
      duration: 200,
      category: 'tutorial',
      views: 6789,
      likes: 523,
      author: {
        name: 'Chuyên gia Đức',
        avatar: 'https://i.pravatar.cc/150?img=6'
      }
    }
  ];

  if (category) {
    return allVideos.filter(v => v.category === category);
  }
  
  return allVideos;
}
