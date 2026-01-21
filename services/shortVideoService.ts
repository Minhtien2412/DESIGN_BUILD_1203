/**
 * Short Video Service
 * Service để quản lý video ngắn (TikTok-style)
 */

import { API_CONFIG, createApiConfig } from '@/config/api';

const config = createApiConfig(API_CONFIG.BACKEND.BASE_URL);

// ============== TYPES ==============
export interface ShortVideo {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  videoUrl: string;
  thumbnail: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  liked: boolean;
  following: boolean;
  duration: number;
  soundName?: string;
}

export interface VideoComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  likes: number;
  liked: boolean;
  timestamp: string;
  replies?: VideoComment[];
}

// ============== SAMPLE VIDEO URLs (Reference only) ==============
export const SAMPLE_VIDEOS = {
  // URLs for reference - videos from API
};

// ============== EMPTY ARRAYS - DATA FROM API ONLY ==============
export const MOCK_VIDEOS: ShortVideo[] = [];
export const MOCK_COMMENTS: Record<string, VideoComment[]> = {};

// ============== API FUNCTIONS ==============

interface GetVideosResponse {
  videos: ShortVideo[];
  dataSource: 'api' | 'mock';
}

/**
 * Get list of videos (feed)
 */
async function getVideos(page = 1, limit = 10): Promise<GetVideosResponse> {
  try {
    const response = await fetch(`${config.baseUrl}/short-videos?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: config.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      videos: data.videos || MOCK_VIDEOS,
      dataSource: 'api',
    };
  } catch (error) {
    console.warn('[ShortVideoService] Failed to fetch videos, using mock data:', error);
    return {
      videos: MOCK_VIDEOS,
      dataSource: 'mock',
    };
  }
}

/**
 * Get video by ID
 */
async function getVideoById(videoId: string): Promise<ShortVideo | null> {
  try {
    const response = await fetch(`${config.baseUrl}/short-videos/${videoId}`, {
      method: 'GET',
      headers: config.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('[ShortVideoService] Failed to fetch video, using mock data:', error);
    return MOCK_VIDEOS.find(v => v.id === videoId) || null;
  }
}

/**
 * Get comments for a video
 */
async function getVideoComments(videoId: string): Promise<{ comments: VideoComment[]; dataSource: 'api' | 'mock' }> {
  try {
    const response = await fetch(`${config.baseUrl}/short-videos/${videoId}/comments`, {
      method: 'GET',
      headers: config.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      comments: data.comments || MOCK_COMMENTS[videoId] || [],
      dataSource: 'api',
    };
  } catch (error) {
    console.warn('[ShortVideoService] Failed to fetch comments, using mock data:', error);
    return {
      comments: MOCK_COMMENTS[videoId] || [],
      dataSource: 'mock',
    };
  }
}

/**
 * Like/Unlike a video
 */
async function toggleVideoLike(videoId: string): Promise<{ liked: boolean; likesCount: number }> {
  try {
    const response = await fetch(`${config.baseUrl}/short-videos/${videoId}/like`, {
      method: 'POST',
      headers: config.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('[ShortVideoService] Failed to toggle like:', error);
    throw error;
  }
}

/**
 * Add comment to a video
 */
async function addComment(videoId: string, text: string): Promise<VideoComment> {
  try {
    const response = await fetch(`${config.baseUrl}/short-videos/${videoId}/comments`, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('[ShortVideoService] Failed to add comment:', error);
    throw error;
  }
}

/**
 * Follow/Unfollow video creator
 */
async function toggleFollow(userId: string): Promise<{ following: boolean }> {
  try {
    const response = await fetch(`${config.baseUrl}/users/${userId}/follow`, {
      method: 'POST',
      headers: config.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('[ShortVideoService] Failed to toggle follow:', error);
    throw error;
  }
}

/**
 * Increment video view count
 */
async function recordView(videoId: string): Promise<void> {
  try {
    await fetch(`${config.baseUrl}/short-videos/${videoId}/view`, {
      method: 'POST',
      headers: config.headers,
    });
  } catch (error) {
    console.warn('[ShortVideoService] Failed to record view:', error);
    // Silent fail - view tracking is not critical
  }
}

export const ShortVideoService = {
  getVideos,
  getVideoById,
  getVideoComments,
  toggleVideoLike,
  addComment,
  toggleFollow,
  recordView,
};

export default ShortVideoService;
