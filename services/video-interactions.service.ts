/**
 * Video Interactions Service
 * 
 * API client cho các tương tác video kiểu TikTok:
 * - Like/Unlike
 * - Comment (+ replies)
 * - Share tracking
 * - View tracking
 * - Save/Bookmark
 * - Download tracking
 * 
 * @author AI Assistant
 * @date 16/01/2026
 */

import ENV from '../config/env';
import { apiFetch } from './api';

const BASE_URL = `${ENV.API_BASE_URL}${ENV.API_PREFIX}/interactions`;

// ==================== TYPES ====================

export interface VideoStats {
  likes: number;
  comments: number;
  shares: number;
  views: number;
  saves: number;
  downloads: number;
}

export interface UserInteractionStatus {
  liked: boolean;
  saved: boolean;
  shared: boolean;
  viewed: boolean;
}

export interface CommentUser {
  id: number;
  name: string;
  avatar: string;
  verified?: boolean;
}

export interface VideoComment {
  id: number;
  videoId: number;
  userId: number;
  content: string;
  parentId: number | null;
  createdAt: string;
  user: CommentUser;
  likes: number;
  liked: boolean;
  replies?: VideoComment[];
  repliesCount: number;
}

export interface CommentsResponse {
  success: boolean;
  comments: VideoComment[];
  total: number;
  hasMore: boolean;
}

export interface LikeResponse {
  success: boolean;
  liked: boolean;
  likesCount: number;
}

export interface SaveResponse {
  success: boolean;
  saved: boolean;
  savesCount: number;
}

export interface ShareResponse {
  success: boolean;
  sharesCount: number;
}

export interface ViewResponse {
  success: boolean;
  viewsCount: number;
}

export interface DownloadResponse {
  success: boolean;
  downloadsCount: number;
}

// ==================== API FUNCTIONS ====================

/**
 * Like/Unlike video
 */
export async function toggleVideoLike(videoId: number): Promise<LikeResponse> {
  const response = await apiFetch(`${BASE_URL}/${videoId}/like`, {
    method: 'POST',
  });
  return response;
}

/**
 * Get full stats for a video
 */
export async function getVideoStats(videoId: number): Promise<{ success: boolean; stats: VideoStats }> {
  const response = await apiFetch(`${BASE_URL}/${videoId}/stats`);
  return response;
}

/**
 * Get user's interaction status
 */
export async function getUserInteractionStatus(
  videoId: number,
): Promise<{ success: boolean; status: UserInteractionStatus }> {
  const response = await apiFetch(`${BASE_URL}/${videoId}/status`);
  return response;
}

/**
 * Get batch stats for multiple videos
 */
export async function getBatchVideoStats(
  videoIds: number[],
): Promise<{ success: boolean; stats: Record<number, VideoStats> }> {
  const response = await apiFetch(`${BASE_URL}/batch-stats`, {
    method: 'POST',
    body: JSON.stringify({ videoIds }),
  });
  return response;
}

// ==================== COMMENTS ====================

/**
 * Get comments for video
 */
export async function getVideoComments(
  videoId: number,
  page = 1,
  limit = 20,
  sortBy: 'newest' | 'popular' = 'newest',
): Promise<CommentsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
  });
  const response = await apiFetch(`${BASE_URL}/${videoId}/comments?${params}`);
  return response;
}

/**
 * Add a comment
 */
export async function addVideoComment(
  videoId: number,
  content: string,
  parentId?: number,
): Promise<{ success: boolean; comment: VideoComment }> {
  const body: { content: string; parentId?: number } = { content };
  if (parentId) body.parentId = parentId;
  
  const response = await apiFetch(`${BASE_URL}/${videoId}/comments`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return response;
}

/**
 * Get replies for a comment
 */
export async function getCommentReplies(
  commentId: number,
  page = 1,
  limit = 10,
): Promise<{ success: boolean; replies: VideoComment[]; hasMore: boolean }> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  const response = await apiFetch(`${BASE_URL}/comments/${commentId}/replies?${params}`);
  return response;
}

/**
 * Delete a comment
 */
export async function deleteVideoComment(commentId: number): Promise<void> {
  await apiFetch(`${BASE_URL}/comments/${commentId}`, {
    method: 'DELETE',
  });
}

/**
 * Like/Unlike a comment
 */
export async function toggleCommentLike(
  commentId: number,
): Promise<{ success: boolean; liked: boolean; likesCount: number }> {
  const response = await apiFetch(`${BASE_URL}/comments/${commentId}/like`, {
    method: 'POST',
  });
  return response;
}

// ==================== VIEWS ====================

/**
 * Record a view
 */
export async function recordVideoView(
  videoId: number,
  watchDuration: number,
  completed = false,
): Promise<ViewResponse> {
  const response = await apiFetch(`${BASE_URL}/${videoId}/view`, {
    method: 'POST',
    body: JSON.stringify({ watchDuration, completed }),
  });
  return response;
}

// ==================== SHARES ====================

/**
 * Record a share
 * @param platform - facebook, twitter, whatsapp, telegram, copy_link, etc.
 */
export async function recordVideoShare(
  videoId: number,
  platform: string,
): Promise<ShareResponse> {
  const response = await apiFetch(`${BASE_URL}/${videoId}/share`, {
    method: 'POST',
    body: JSON.stringify({ platform }),
  });
  return response;
}

// ==================== SAVES ====================

/**
 * Toggle save/bookmark
 */
export async function toggleVideoSave(videoId: number): Promise<SaveResponse> {
  const response = await apiFetch(`${BASE_URL}/${videoId}/save`, {
    method: 'POST',
  });
  return response;
}

// ==================== DOWNLOADS ====================

/**
 * Record a download
 */
export async function recordVideoDownload(videoId: number): Promise<DownloadResponse> {
  const response = await apiFetch(`${BASE_URL}/${videoId}/download`, {
    method: 'POST',
  });
  return response;
}

// ==================== UTILITY ====================

/**
 * Format number for display (1.2K, 1.5M, etc.)
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

/**
 * Get relative time string
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffWeeks < 4) return `${diffWeeks} tuần trước`;
  if (diffMonths < 12) return `${diffMonths} tháng trước`;
  return `${diffYears} năm trước`;
}
