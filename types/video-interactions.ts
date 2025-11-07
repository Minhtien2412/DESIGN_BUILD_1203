/**
 * Video Interactions Types
 * Types for video likes, comments, shares, and views
 */

export interface VideoLike {
  id: string;
  videoId: string;
  userId: string;
  createdAt: string;
}

export interface VideoComment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  likes: number;
  replies?: VideoComment[];
}

export interface VideoView {
  id: string;
  videoId: string;
  userId?: string; // Optional for anonymous views
  deviceId: string;
  duration: number; // Seconds watched
  completed: boolean;
  createdAt: string;
}

export interface VideoShare {
  id: string;
  videoId: string;
  userId?: string;
  platform: 'facebook' | 'messenger' | 'zalo' | 'copy-link' | 'other';
  createdAt: string;
}

export interface VideoStats {
  videoId: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  completionRate: number; // Percentage of viewers who watched to end
  averageWatchTime: number; // Average seconds watched
  updatedAt: string;
}

export interface VideoInteraction {
  videoId: string;
  isLiked: boolean;
  isSaved: boolean;
  userComment?: VideoComment;
  watchProgress: number; // 0-1
}

// API Request/Response types
export interface LikeVideoRequest {
  videoId: string;
  userId: string;
}

export interface LikeVideoResponse {
  success: boolean;
  isLiked: boolean;
  likesCount: number;
}

export interface CommentVideoRequest {
  videoId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  parentId?: string; // For replies
}

export interface CommentVideoResponse {
  success: boolean;
  comment: VideoComment;
  commentsCount: number;
}

export interface GetCommentsRequest {
  videoId: string;
  limit?: number;
  offset?: number;
  sortBy?: 'latest' | 'popular';
}

export interface GetCommentsResponse {
  success: boolean;
  comments: VideoComment[];
  total: number;
  hasMore: boolean;
}

export interface TrackViewRequest {
  videoId: string;
  userId?: string;
  deviceId: string;
  duration: number;
  completed: boolean;
}

export interface TrackViewResponse {
  success: boolean;
  viewsCount: number;
}

export interface ShareVideoRequest {
  videoId: string;
  userId?: string;
  platform: VideoShare['platform'];
}

export interface ShareVideoResponse {
  success: boolean;
  sharesCount: number;
}
