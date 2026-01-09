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

// ============== SAMPLE VIDEO URLs ==============
export const SAMPLE_VIDEOS = {
  bunny: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  elephantsDream: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  forBiggerBlazes: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  forBiggerEscapes: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  forBiggerFun: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  forBiggerJoyrides: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  forBiggerMeltdowns: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  sintel: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  subaru: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  tearsOfSteel: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  volkswagen: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
  weAreGoingOnBullrun: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  whatCarCanYouGetForAGrand: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
};

// ============== MOCK DATA ==============
export const MOCK_VIDEOS: ShortVideo[] = [
  {
    id: 'v1',
    userId: 'u1',
    userName: 'John Builder',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    videoUrl: SAMPLE_VIDEOS.forBiggerBlazes,
    thumbnail: 'https://picsum.photos/1080/1920?random=1',
    caption: 'Amazing construction progress! 🏗️ #construction #timelapse',
    likes: 1234,
    comments: 89,
    shares: 45,
    views: 12340,
    liked: false,
    following: false,
    duration: 15,
    soundName: 'Original Sound - John Builder',
  },
  {
    id: 'v2',
    userId: 'u2',
    userName: 'Sarah Designer',
    userAvatar: 'https://i.pravatar.cc/150?img=2',
    videoUrl: SAMPLE_VIDEOS.forBiggerEscapes,
    thumbnail: 'https://picsum.photos/1080/1920?random=2',
    caption: 'Modern kitchen design reveal ✨ #interiordesign #kitchen',
    likes: 2345,
    comments: 156,
    shares: 78,
    views: 23456,
    liked: true,
    following: true,
    duration: 22,
    soundName: 'Trending Audio - Interior Vibes',
  },
  {
    id: 'v3',
    userId: 'u3',
    userName: 'Mike Contractor',
    userAvatar: 'https://i.pravatar.cc/150?img=3',
    videoUrl: SAMPLE_VIDEOS.forBiggerFun,
    thumbnail: 'https://picsum.photos/1080/1920?random=3',
    caption: 'Foundation work in progress 💪 #concrete #foundation',
    likes: 987,
    comments: 67,
    shares: 23,
    views: 9876,
    liked: false,
    following: false,
    duration: 18,
    soundName: 'Original Sound - Mike Contractor',
  },
  {
    id: 'v4',
    userId: 'u4',
    userName: 'Anna Architect',
    userAvatar: 'https://i.pravatar.cc/150?img=4',
    videoUrl: SAMPLE_VIDEOS.forBiggerJoyrides,
    thumbnail: 'https://picsum.photos/1080/1920?random=4',
    caption: 'Dream villa design walkthrough 🏡 #architecture #villa #luxury',
    likes: 5678,
    comments: 234,
    shares: 189,
    views: 56780,
    liked: false,
    following: true,
    duration: 30,
    soundName: 'Chill Vibes - Architecture',
  },
  {
    id: 'v5',
    userId: 'u5',
    userName: 'Tom Engineer',
    userAvatar: 'https://i.pravatar.cc/150?img=5',
    videoUrl: SAMPLE_VIDEOS.forBiggerMeltdowns,
    thumbnail: 'https://picsum.photos/1080/1920?random=5',
    caption: 'How we build earthquake-resistant structures 🔨 #engineering #safety',
    likes: 3456,
    comments: 189,
    shares: 234,
    views: 34560,
    liked: true,
    following: false,
    duration: 25,
    soundName: 'Educational Series - Building Safe',
  },
];

export const MOCK_COMMENTS: Record<string, VideoComment[]> = {
  v1: [
    {
      id: 'c1',
      userId: 'u10',
      userName: 'Construction Fan',
      userAvatar: 'https://i.pravatar.cc/150?img=10',
      text: 'This is amazing work! How long did this take?',
      likes: 45,
      liked: false,
      timestamp: '2h ago',
    },
    {
      id: 'c2',
      userId: 'u11',
      userName: 'Builder Pro',
      userAvatar: 'https://i.pravatar.cc/150?img=11',
      text: 'Great progress! Keep up the good work 💪',
      likes: 23,
      liked: true,
      timestamp: '3h ago',
    },
  ],
  v2: [
    {
      id: 'c3',
      userId: 'u12',
      userName: 'Design Lover',
      userAvatar: 'https://i.pravatar.cc/150?img=12',
      text: 'Love the modern aesthetic! 😍',
      likes: 89,
      liked: true,
      timestamp: '1h ago',
    },
  ],
};

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
