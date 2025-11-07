/**
 * Video Interactions API Service
 * Handles video likes, comments, views, and shares
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

const API_BASE = '/api/videos';

/**
 * Like or unlike a video
 */
export async function toggleVideoLike(
  request: LikeVideoRequest
): Promise<LikeVideoResponse> {
  try {
    const response = await apiFetch(`${API_BASE}/${request.videoId}/like`, {
      method: 'POST',
      body: JSON.stringify({ userId: request.userId }),
    });

    return response as LikeVideoResponse;
  } catch (error: any) {
    console.warn('[VideoAPI] Like endpoint not available (backend not deployed yet):', error.message);
    // Fallback response - graceful degradation
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
        userId: request.userId,
        userName: request.userName,
        userAvatar: request.userAvatar,
        content: request.content,
        parentId: request.parentId,
      }),
    });

    return response as CommentVideoResponse;
  } catch (error: any) {
    console.warn('[VideoAPI] Comment endpoint not available (backend not deployed yet):', error.message);
    // Don't throw - return error response instead
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
    const params = new URLSearchParams({
      limit: (request.limit || 20).toString(),
      offset: (request.offset || 0).toString(),
      sortBy: request.sortBy || 'latest',
    });

    const response = await apiFetch(
      `${API_BASE}/${request.videoId}/comments?${params}`
    );

    return response as GetCommentsResponse;
  } catch (error: any) {
    console.warn('[VideoAPI] Comments endpoint not available (backend not deployed yet):', error.message);
    // Return empty list on error - don't throw, just gracefully degrade
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
    const response = await apiFetch(`${API_BASE}/${request.videoId}/views`, {
      method: 'POST',
      body: JSON.stringify({
        userId: request.userId,
        deviceId: request.deviceId,
        duration: request.duration,
        completed: request.completed,
      }),
    });

    return response as TrackViewResponse;
  } catch (error: any) {
    console.warn('[VideoAPI] View tracking not available (backend not deployed yet):', error.message);
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
    const response = await apiFetch(`${API_BASE}/${request.videoId}/shares`, {
      method: 'POST',
      body: JSON.stringify({
        userId: request.userId,
        platform: request.platform,
      }),
    });

    return response as ShareVideoResponse;
  } catch (error: any) {
    console.warn('[VideoAPI] Share tracking not available (backend not deployed yet):', error.message);
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
    return response as VideoStats;
  } catch (error: any) {
    console.warn('[VideoAPI] Stats endpoint not available (backend not deployed yet):', error.message);
    return null;
  }
}

/**
 * Delete a comment (only by author or admin)
 */
export async function deleteVideoComment(
  videoId: string,
  commentId: string,
  userId: string
): Promise<{ success: boolean }> {
  try {
    const response = await apiFetch(
      `${API_BASE}/${videoId}/comments/${commentId}`,
      {
        method: 'DELETE',
        body: JSON.stringify({ userId }),
      }
    );

    return response as { success: boolean };
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
): Promise<{ success: boolean; likes: number }> {
  try {
    const response = await apiFetch(
      `${API_BASE}/${videoId}/comments/${commentId}/like`,
      {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }
    );

    return response as { success: boolean; likes: number };
  } catch (error) {
    console.error('[VideoAPI] Error liking comment:', error);
    return { success: false, likes: 0 };
  }
}
