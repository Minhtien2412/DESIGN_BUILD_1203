/**
 * Video Interactions API Service
 * Handles video likes, comments, views, and shares
 * 
 * Updated: 16/01/2026 - Now uses /api/v1/interactions endpoints
 */

import type {
    CommentVideoRequest,
    CommentVideoResponse,
    GetCommentsRequest,
    GetCommentsResponse,
    LikeVideoRequest,
    LikeVideoResponse,
    ShareVideoRequest,
    ShareVideoResponse,
    TrackViewRequest,
    TrackViewResponse,
    VideoStats
} from '@/types/video-interactions';
import { apiFetch } from './api';

// Updated API base path
const API_BASE = '/api/v1/interactions';

/**
 * Like or unlike a video
 */
export async function toggleVideoLike(
  request: LikeVideoRequest
): Promise<LikeVideoResponse> {
  try {
    const response = await apiFetch(`${API_BASE}/${request.videoId}/like`, {
      method: 'POST',
    });

    return {
      success: response.success,
      isLiked: response.liked,
      likesCount: response.likesCount,
    };
  } catch (error: any) {
    console.warn('[VideoAPI] Like endpoint error:', error.message);
    return {
      success: false,
      isLiked: false,
      likesCount: 0,
    };
  }
}

/**
 * Add a comment to a video
 */
export async function addVideoComment(
  request: CommentVideoRequest
): Promise<CommentVideoResponse> {
  try {
    const response = await apiFetch(`${API_BASE}/${request.videoId}/comments`, {
      method: 'POST',
      body: JSON.stringify({
        content: request.content,
        parentId: request.parentId,
      }),
    });

    return {
      success: response.success,
      comment: response.comment,
      commentsCount: response.comment ? 1 : 0,
    };
  } catch (error: any) {
    console.warn('[VideoAPI] Comment endpoint error:', error.message);
    return {
      success: false,
      comment: null as any,
      commentsCount: 0,
    };
  }
}

/**
 * Get comments for a video
 */
export async function getVideoComments(
  request: GetCommentsRequest
): Promise<GetCommentsResponse> {
  try {
    const page = Math.floor((request.offset || 0) / (request.limit || 20)) + 1;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: (request.limit || 20).toString(),
      sortBy: request.sortBy === 'popular' ? 'popular' : 'newest',
    });

    const response = await apiFetch(
      `${API_BASE}/${request.videoId}/comments?${params}`
    );

    return {
      success: response.success,
      comments: response.comments || [],
      total: response.total || 0,
      hasMore: response.hasMore || false,
    };
  } catch (error: any) {
    console.warn('[VideoAPI] Comments endpoint error:', error.message);
    return {
      success: true,
      comments: [],
      total: 0,
      hasMore: false,
    };
  }
}

/**
 * Track video view
 */
export async function trackVideoView(
  request: TrackViewRequest
): Promise<TrackViewResponse> {
  try {
    const response = await apiFetch(`${API_BASE}/${request.videoId}/view`, {
      method: 'POST',
      body: JSON.stringify({
        watchDuration: request.duration,
        completed: request.completed,
      }),
    });

    return {
      success: response.success,
      viewsCount: response.viewsCount || 0,
    };
  } catch (error: any) {
    console.warn('[VideoAPI] View tracking error:', error.message);
    return {
      success: false,
      viewsCount: 0,
    };
  }
}

/**
 * Track video share
 */
export async function shareVideo(
  request: ShareVideoRequest
): Promise<ShareVideoResponse> {
  try {
    const response = await apiFetch(`${API_BASE}/${request.videoId}/share`, {
      method: 'POST',
      body: JSON.stringify({
        platform: request.platform,
      }),
    });

    return {
      success: response.success,
      sharesCount: response.sharesCount || 0,
    };
  } catch (error: any) {
    console.warn('[VideoAPI] Share tracking error:', error.message);
    return {
      success: false,
      sharesCount: 0,
    };
  }
}

/**
 * Get video statistics
 */
export async function getVideoStats(videoId: string): Promise<VideoStats | null> {
  try {
    const response = await apiFetch(`${API_BASE}/${videoId}/stats`);
    if (response.success && response.stats) {
      return {
        videoId,
        views: response.stats.views || 0,
        likes: response.stats.likes || 0,
        comments: response.stats.comments || 0,
        shares: response.stats.shares || 0,
        saves: response.stats.saves || 0,
        downloads: response.stats.downloads || 0,
        completionRate: 0,
        averageWatchTime: 0,
        updatedAt: new Date().toISOString(),
      };
    }
    return null;
  } catch (error: any) {
    console.warn('[VideoAPI] Stats endpoint error:', error.message);
    return null;
  }
}

/**
 * Delete a comment (only by author)
 */
export async function deleteVideoComment(
  videoId: string,
  commentId: string,
  userId: string
): Promise<{ success: boolean }> {
  try {
    await apiFetch(
      `${API_BASE}/comments/${commentId}`,
      {
        method: 'DELETE',
      }
    );

    return { success: true };
  } catch (error) {
    console.error('[VideoAPI] Error deleting comment:', error);
    return { success: false };
  }
}

/**
 * Like a comment
 */
export async function likeComment(
  videoId: string,
  commentId: string,
  userId: string
): Promise<{ success: boolean; likes: number; liked: boolean }> {
  try {
    const response = await apiFetch(
      `${API_BASE}/comments/${commentId}/like`,
      {
        method: 'POST',
      }
    );

    return {
      success: response.success,
      likes: response.likesCount || 0,
      liked: response.liked || false,
    };
  } catch (error) {
    console.error('[VideoAPI] Error liking comment:', error);
    return { success: false, likes: 0, liked: false };
  }
}

/**
 * Toggle save/bookmark video
 */
export async function toggleVideoSave(
  videoId: string
): Promise<{ success: boolean; saved: boolean; savesCount: number }> {
  try {
    const response = await apiFetch(`${API_BASE}/${videoId}/save`, {
      method: 'POST',
    });

    return {
      success: response.success,
      saved: response.saved || false,
      savesCount: response.savesCount || 0,
    };
  } catch (error: any) {
    console.warn('[VideoAPI] Save endpoint error:', error.message);
    return {
      success: false,
      saved: false,
      savesCount: 0,
    };
  }
}

/**
 * Record video download
 */
export async function recordVideoDownload(
  videoId: string
): Promise<{ success: boolean; downloadsCount: number }> {
  try {
    const response = await apiFetch(`${API_BASE}/${videoId}/download`, {
      method: 'POST',
    });

    return {
      success: response.success,
      downloadsCount: response.downloadsCount || 0,
    };
  } catch (error: any) {
    console.warn('[VideoAPI] Download tracking error:', error.message);
    return {
      success: false,
      downloadsCount: 0,
    };
  }
}

/**
 * Get user interaction status for video
 */
export async function getUserVideoStatus(
  videoId: string
): Promise<{ liked: boolean; saved: boolean; shared: boolean; viewed: boolean } | null> {
  try {
    const response = await apiFetch(`${API_BASE}/${videoId}/status`);
    if (response.success) {
      return response.status;
    }
    return null;
  } catch (error: any) {
    console.warn('[VideoAPI] Status endpoint error:', error.message);
    return null;
  }
}

/**
 * Get batch stats for multiple videos
 */
export async function getBatchVideoStats(
  videoIds: string[]
): Promise<Record<string, VideoStats>> {
  try {
    const numericIds = videoIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    const response = await apiFetch(`${API_BASE}/batch-stats`, {
      method: 'POST',
      body: JSON.stringify({ videoIds: numericIds }),
    });

    if (response.success && response.stats) {
      return response.stats;
    }
    return {};
  } catch (error: any) {
    console.warn('[VideoAPI] Batch stats error:', error.message);
    return {};
  }
}

/**
 * Format count for display (1.2K, 1.5M, etc.)
 */
export function formatCount(count: number): string {
  if (count >= 1_000_000_000) {
    return (count / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (count >= 1_000_000) {
    return (count / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (count >= 1_000) {
    return (count / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return count.toString();
}
