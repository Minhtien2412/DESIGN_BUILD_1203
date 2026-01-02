/**
 * TikTok Service API
 * API service for TikTok-style video platform
 * 
 * Features:
 * - Video feed fetching
 * - Like/Unlike videos
 * - Comments CRUD
 * - Follow/Unfollow users
 * - Share tracking
 * - User profiles
 * - Search
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

import {
    FeedFilter,
    FeedType,
    FollowUserResponse,
    GetCommentsResponse,
    GetFeedResponse,
    GetUserProfileResponse,
    GetUserVideosResponse,
    LikeCommentResponse,
    LikeVideoResponse,
    PostCommentResponse,
    SearchResponse,
    SharePlatform,
    ShareVideoResponse,
    TikTokComment,
    TikTokUser,
    TikTokVideo,
    VideoAnalytics
} from '@/types/tiktok';
import { apiFetch } from './api';

const API_BASE = '/tiktok';

// ============================================
// Video Feed APIs
// ============================================

/**
 * Get video feed (For You, Following, etc.)
 */
export async function getVideoFeed(
  type: FeedType = 'for_you',
  cursor?: string,
  limit: number = 10,
  filter?: FeedFilter
): Promise<GetFeedResponse> {
  try {
    const params = new URLSearchParams({
      type,
      limit: limit.toString(),
      ...(cursor && { cursor }),
      ...(filter?.category && { category: filter.category }),
      ...(filter?.hashtag && { hashtag: filter.hashtag }),
      ...(filter?.musicId && { musicId: filter.musicId }),
      ...(filter?.userId && { userId: filter.userId }),
    });

    const response = await apiFetch(`${API_BASE}/feed?${params}`);
    return response as GetFeedResponse;
  } catch (error) {
    console.error('Error fetching video feed:', error);
    // Return mock data for development
    return getMockFeed(type, limit);
  }
}

/**
 * Get single video by ID
 */
export async function getVideoById(videoId: string): Promise<TikTokVideo | null> {
  try {
    const response = await apiFetch(`${API_BASE}/videos/${videoId}`);
    return response as TikTokVideo;
  } catch (error) {
    console.error('Error fetching video:', error);
    return null;
  }
}

/**
 * Get trending videos
 */
export async function getTrendingVideos(limit: number = 20): Promise<TikTokVideo[]> {
  try {
    const response = await apiFetch(`${API_BASE}/trending?limit=${limit}`);
    return (response as any).videos || [];
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    return [];
  }
}

// ============================================
// Video Interaction APIs
// ============================================

/**
 * Like/Unlike a video
 */
export async function toggleLikeVideo(videoId: string): Promise<LikeVideoResponse> {
  try {
    const response = await apiFetch(`${API_BASE}/videos/${videoId}/like`, {
      method: 'POST',
    });
    return response as LikeVideoResponse;
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
}

/**
 * Save/Unsave a video to favorites
 */
export async function toggleSaveVideo(videoId: string): Promise<{ success: boolean; isSaved: boolean }> {
  try {
    const response = await apiFetch(`${API_BASE}/videos/${videoId}/save`, {
      method: 'POST',
    });
    return response as { success: boolean; isSaved: boolean };
  } catch (error) {
    console.error('Error toggling save:', error);
    throw error;
  }
}

/**
 * Report video view (analytics)
 */
export async function reportVideoView(
  videoId: string,
  watchTime: number,
  completed: boolean
): Promise<void> {
  try {
    await apiFetch(`${API_BASE}/videos/${videoId}/view`, {
      method: 'POST',
      body: JSON.stringify({ watchTime, completed }),
    });
  } catch (error) {
    // Silently fail for analytics
    console.log('View tracking error (non-critical):', error);
  }
}

/**
 * Share video to platform
 */
export async function shareVideo(
  videoId: string,
  platform: SharePlatform
): Promise<ShareVideoResponse> {
  try {
    const response = await apiFetch(`${API_BASE}/videos/${videoId}/share`, {
      method: 'POST',
      body: JSON.stringify({ platform }),
    });
    return response as ShareVideoResponse;
  } catch (error) {
    console.error('Error sharing video:', error);
    // Return mock response
    return { success: true, sharesCount: 0 };
  }
}

// ============================================
// Comment APIs
// ============================================

/**
 * Get comments for a video
 */
export async function getVideoComments(
  videoId: string,
  cursor?: string,
  limit: number = 20,
  sort: 'newest' | 'popular' = 'popular'
): Promise<GetCommentsResponse> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      sort,
      ...(cursor && { cursor }),
    });

    const response = await apiFetch(`${API_BASE}/videos/${videoId}/comments?${params}`);
    return response as GetCommentsResponse;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return getMockComments(videoId);
  }
}

/**
 * Post a new comment
 */
export async function postComment(
  videoId: string,
  content: string,
  parentId?: string,
  replyToUserId?: string
): Promise<PostCommentResponse> {
  try {
    const response = await apiFetch(`${API_BASE}/videos/${videoId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentId, replyToUserId }),
    });
    return response as PostCommentResponse;
  } catch (error) {
    console.error('Error posting comment:', error);
    throw error;
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<{ success: boolean }> {
  try {
    const response = await apiFetch(`${API_BASE}/comments/${commentId}`, {
      method: 'DELETE',
    });
    return response as { success: boolean };
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

/**
 * Like/Unlike a comment
 */
export async function toggleLikeComment(commentId: string): Promise<LikeCommentResponse> {
  try {
    const response = await apiFetch(`${API_BASE}/comments/${commentId}/like`, {
      method: 'POST',
    });
    return response as LikeCommentResponse;
  } catch (error) {
    console.error('Error toggling comment like:', error);
    throw error;
  }
}

/**
 * Get comment replies
 */
export async function getCommentReplies(
  commentId: string,
  cursor?: string,
  limit: number = 10
): Promise<GetCommentsResponse> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(cursor && { cursor }),
    });

    const response = await apiFetch(`${API_BASE}/comments/${commentId}/replies?${params}`);
    return response as GetCommentsResponse;
  } catch (error) {
    console.error('Error fetching replies:', error);
    return { success: false, comments: [], total: 0, hasMore: false };
  }
}

// ============================================
// User/Profile APIs
// ============================================

/**
 * Get user profile
 */
export async function getUserProfile(
  userId?: string,
  username?: string
): Promise<GetUserProfileResponse> {
  try {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    if (username) params.set('username', username);

    const response = await apiFetch(`${API_BASE}/users/profile?${params}`);
    return response as GetUserProfileResponse;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return getMockUserProfile(userId || username || 'unknown');
  }
}

/**
 * Get user's videos
 */
export async function getUserVideos(
  userId: string,
  type: 'uploaded' | 'liked' | 'saved' = 'uploaded',
  cursor?: string,
  limit: number = 18
): Promise<GetUserVideosResponse> {
  try {
    const params = new URLSearchParams({
      type,
      limit: limit.toString(),
      ...(cursor && { cursor }),
    });

    const response = await apiFetch(`${API_BASE}/users/${userId}/videos?${params}`);
    return response as GetUserVideosResponse;
  } catch (error) {
    console.error('Error fetching user videos:', error);
    return { success: false, videos: [], hasMore: false };
  }
}

/**
 * Follow/Unfollow a user
 */
export async function toggleFollowUser(userId: string): Promise<FollowUserResponse> {
  try {
    const response = await apiFetch(`${API_BASE}/users/${userId}/follow`, {
      method: 'POST',
    });
    return response as FollowUserResponse;
  } catch (error) {
    console.error('Error toggling follow:', error);
    throw error;
  }
}

/**
 * Get user's followers
 */
export async function getUserFollowers(
  userId: string,
  cursor?: string,
  limit: number = 20
): Promise<{ users: TikTokUser[]; nextCursor?: string; hasMore: boolean }> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(cursor && { cursor }),
    });

    const response = await apiFetch(`${API_BASE}/users/${userId}/followers?${params}`);
    return response as any;
  } catch (error) {
    console.error('Error fetching followers:', error);
    return { users: [], hasMore: false };
  }
}

/**
 * Get user's following list
 */
export async function getUserFollowing(
  userId: string,
  cursor?: string,
  limit: number = 20
): Promise<{ users: TikTokUser[]; nextCursor?: string; hasMore: boolean }> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(cursor && { cursor }),
    });

    const response = await apiFetch(`${API_BASE}/users/${userId}/following?${params}`);
    return response as any;
  } catch (error) {
    console.error('Error fetching following:', error);
    return { users: [], hasMore: false };
  }
}

// ============================================
// Search APIs
// ============================================

/**
 * Search for videos, users, hashtags, etc.
 */
export async function search(
  query: string,
  type: 'all' | 'video' | 'user' | 'hashtag' | 'music' = 'all',
  cursor?: string,
  limit: number = 20
): Promise<SearchResponse> {
  try {
    const params = new URLSearchParams({
      q: query,
      type,
      limit: limit.toString(),
      ...(cursor && { cursor }),
    });

    const response = await apiFetch(`${API_BASE}/search?${params}`);
    return response as SearchResponse;
  } catch (error) {
    console.error('Error searching:', error);
    return { success: false, results: {}, hasMore: false };
  }
}

/**
 * Get search suggestions
 */
export async function getSearchSuggestions(query: string): Promise<string[]> {
  try {
    const response = await apiFetch(`${API_BASE}/search/suggestions?q=${encodeURIComponent(query)}`);
    return (response as any).suggestions || [];
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
}

// ============================================
// Analytics APIs
// ============================================

/**
 * Get video analytics (for creators)
 */
export async function getVideoAnalytics(videoId: string): Promise<VideoAnalytics | null> {
  try {
    const response = await apiFetch(`${API_BASE}/videos/${videoId}/analytics`);
    return response as VideoAnalytics;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
}

// ============================================
// Upload APIs
// ============================================

/**
 * Upload a new video
 */
export async function uploadVideo(
  videoUri: string,
  caption: string,
  options?: {
    hashtags?: string[];
    mentions?: string[];
    musicId?: string;
    allowComments?: boolean;
    allowDuet?: boolean;
    allowStitch?: boolean;
  }
): Promise<{ success: boolean; video?: TikTokVideo; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('video', {
      uri: videoUri,
      type: 'video/mp4',
      name: 'video.mp4',
    } as any);
    formData.append('caption', caption);
    if (options?.hashtags) formData.append('hashtags', JSON.stringify(options.hashtags));
    if (options?.mentions) formData.append('mentions', JSON.stringify(options.mentions));
    if (options?.musicId) formData.append('musicId', options.musicId);
    formData.append('allowComments', String(options?.allowComments ?? true));
    formData.append('allowDuet', String(options?.allowDuet ?? true));
    formData.append('allowStitch', String(options?.allowStitch ?? true));

    const response = await apiFetch(`${API_BASE}/videos/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response as any;
  } catch (error) {
    console.error('Error uploading video:', error);
    return { success: false, error: 'Upload failed' };
  }
}

// ============================================
// Mock Data for Development
// ============================================

function getMockFeed(type: FeedType, limit: number): GetFeedResponse {
  const mockVideos: TikTokVideo[] = Array.from({ length: limit }, (_, i) => ({
    id: `video_${Date.now()}_${i}`,
    videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4`,
    thumbnailUrl: `https://picsum.photos/seed/${i}/400/700`,
    author: {
      id: `user_${i}`,
      username: `user${i}`,
      displayName: `User ${i}`,
      avatar: `https://i.pravatar.cc/150?img=${i + 1}`,
      bio: 'Content creator 🎬',
      verified: i % 3 === 0,
      followersCount: Math.floor(Math.random() * 1000000),
      followingCount: Math.floor(Math.random() * 1000),
      likesCount: Math.floor(Math.random() * 5000000),
      videosCount: Math.floor(Math.random() * 500),
      isFollowing: false,
      createdAt: new Date().toISOString(),
    },
    caption: `This is video ${i + 1} 🔥 #viral #trending #foryou`,
    hashtags: ['viral', 'trending', 'foryou'],
    mentions: [],
    music: {
      id: `music_${i}`,
      name: 'Original Sound',
      artist: `User ${i}`,
      duration: 30,
      usageCount: Math.floor(Math.random() * 10000),
    },
    viewsCount: Math.floor(Math.random() * 10000000),
    likesCount: Math.floor(Math.random() * 1000000),
    commentsCount: Math.floor(Math.random() * 50000),
    sharesCount: Math.floor(Math.random() * 10000),
    savesCount: Math.floor(Math.random() * 5000),
    isLiked: false,
    isSaved: false,
    isFollowingAuthor: false,
    duration: 15 + Math.floor(Math.random() * 45),
    aspectRatio: 9 / 16,
    allowComments: true,
    allowDuet: true,
    allowStitch: true,
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
  }));

  return {
    success: true,
    feed: {
      type,
      videos: mockVideos,
      hasMore: true,
      nextCursor: `cursor_${limit}`,
    },
  };
}

function getMockComments(videoId: string): GetCommentsResponse {
  const mockComments: TikTokComment[] = Array.from({ length: 10 }, (_, i) => ({
    id: `comment_${videoId}_${i}`,
    videoId,
    author: {
      id: `user_comment_${i}`,
      username: `commenter${i}`,
      displayName: `Commenter ${i}`,
      avatar: `https://i.pravatar.cc/150?img=${i + 10}`,
      verified: i === 0,
      followersCount: Math.floor(Math.random() * 10000),
      followingCount: Math.floor(Math.random() * 500),
      likesCount: Math.floor(Math.random() * 50000),
      videosCount: Math.floor(Math.random() * 50),
      createdAt: new Date().toISOString(),
    },
    content: `This is amazing! 🔥 Comment #${i + 1}`,
    likesCount: Math.floor(Math.random() * 10000),
    repliesCount: Math.floor(Math.random() * 100),
    isLiked: false,
    isPinned: i === 0,
    isAuthorReply: false,
    createdAt: new Date(Date.now() - i * 600000).toISOString(),
  }));

  return {
    success: true,
    comments: mockComments,
    total: 100,
    hasMore: true,
    nextCursor: 'cursor_10',
  };
}

function getMockUserProfile(identifier: string): GetUserProfileResponse {
  return {
    success: true,
    user: {
      id: identifier,
      username: identifier,
      displayName: `User ${identifier}`,
      avatar: `https://i.pravatar.cc/300?u=${identifier}`,
      bio: '✨ Content Creator | 🎬 Video Maker | 🌟 Follow for more!',
      verified: true,
      followersCount: 1500000,
      followingCount: 500,
      likesCount: 25000000,
      videosCount: 150,
      isFollowing: false,
      isFollowedBy: false,
      createdAt: '2023-01-01T00:00:00Z',
      socialLinks: {
        instagram: '@user',
        youtube: 'UserChannel',
      },
      videos: [],
    },
  };
}

export default {
  // Feed
  getVideoFeed,
  getVideoById,
  getTrendingVideos,
  
  // Interactions
  toggleLikeVideo,
  toggleSaveVideo,
  reportVideoView,
  shareVideo,
  
  // Comments
  getVideoComments,
  postComment,
  deleteComment,
  toggleLikeComment,
  getCommentReplies,
  
  // Users
  getUserProfile,
  getUserVideos,
  toggleFollowUser,
  getUserFollowers,
  getUserFollowing,
  
  // Search
  search,
  getSearchSuggestions,
  
  // Analytics
  getVideoAnalytics,
  
  // Upload
  uploadVideo,
};
