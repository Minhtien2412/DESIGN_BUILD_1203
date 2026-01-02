/**
 * Comments Service
 * Comments and discussions for projects, tasks, and documents
 */

import { apiClient } from './client';

// ==================== TYPES ====================

export interface CreateCommentDto {
  content: string;
  entityType: 'PROJECT' | 'TASK' | 'DOCUMENT' | 'QC_INSPECTION';
  entityId: number;
  parentId?: number; // For nested replies
  mentions?: number[]; // User IDs to mention
  attachments?: string[];
}

export interface Comment {
  id: number;
  content: string;
  entityType: string;
  entityId: number;
  parentId?: number;
  authorId: number;
  author: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  mentions: {
    id: number;
    name: string;
  }[];
  attachments: string[];
  replies?: Comment[];
  replyCount: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCommentDto {
  content: string;
  attachments?: string[];
}

export interface CommentStatistics {
  entityType: string;
  entityId: number;
  totalComments: number;
  uniqueAuthors: number;
  latestComment?: Comment;
}

// ==================== SERVICE ====================

export const commentService = {
  /**
   * Create new comment
   */
  async createComment(data: CreateCommentDto): Promise<Comment> {
    return apiClient.post<Comment>('/comments', data);
  },

  /**
   * Get comments for entity
   */
  async getComments(params: {
    entityType: 'PROJECT' | 'TASK' | 'DOCUMENT' | 'QC_INSPECTION';
    entityId: number;
    page?: number;
    limit?: number;
    sortBy?: 'newest' | 'oldest';
  }): Promise<{ data: Comment[]; total: number }> {
    const queryParams: Record<string, string> = {
      entityType: params.entityType,
      entityId: String(params.entityId),
    };
    if (params.page) queryParams.page = String(params.page);
    if (params.limit) queryParams.limit = String(params.limit);
    if (params.sortBy) queryParams.sortBy = params.sortBy;

    return apiClient.get<{ data: Comment[]; total: number }>('/comments', queryParams);
  },

  /**
   * Get specific comment
   */
  async getComment(id: number): Promise<Comment> {
    return apiClient.get<Comment>(`/comments/${id}`);
  },

  /**
   * Update comment
   */
  async updateComment(id: number, data: UpdateCommentDto): Promise<Comment> {
    return apiClient.patch<Comment>(`/comments/${id}`, data);
  },

  /**
   * Delete comment
   */
  async deleteComment(id: number): Promise<void> {
    return apiClient.delete(`/comments/${id}`);
  },

  /**
   * Get replies for comment
   */
  async getReplies(
    commentId: number,
    params?: { page?: number; limit?: number }
  ): Promise<{ data: Comment[]; total: number }> {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);

    return apiClient.get<{ data: Comment[]; total: number }>(`/comments/${commentId}/replies`, queryParams);
  },

  /**
   * Reply to comment
   */
  async replyToComment(
    commentId: number,
    data: Omit<CreateCommentDto, 'parentId'>
  ): Promise<Comment> {
    return apiClient.post<Comment>(`/comments/${commentId}/reply`, data);
  },

  /**
   * Get comment statistics
   */
  async getStatistics(
    entityType: 'PROJECT' | 'TASK' | 'DOCUMENT' | 'QC_INSPECTION',
    entityId: number
  ): Promise<CommentStatistics> {
    return apiClient.get<CommentStatistics>('/comments/statistics', {
      entityType,
      entityId: String(entityId),
    });
  },

  /**
   * Get user's comments
   */
  async getUserComments(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ data: Comment[]; total: number }> {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);

    return apiClient.get<{ data: Comment[]; total: number }>('/comments/my', queryParams);
  },

  /**
   * Get mentions (comments where user is mentioned)
   */
  async getMentions(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<{ data: Comment[]; total: number }> {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);
    if (params?.unreadOnly) queryParams.unreadOnly = 'true';

    return apiClient.get<{ data: Comment[]; total: number }>('/comments/mentions', queryParams);
  },

  /**
   * Mark mention as read
   */
  async markMentionAsRead(commentId: number): Promise<void> {
    return apiClient.post(`/comments/${commentId}/read`);
  },
};

export default commentService;
