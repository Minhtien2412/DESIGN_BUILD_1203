/**
 * Comments API Service
 * Backend: https://baotienweb.cloud/api/v1/comments
 * 
 * Endpoints theo API Docs:
 * - POST /comments        - Add a comment to a project or task
 * - GET /comments         - Get all comments with optional filters
 * - DELETE /comments/:id  - Delete a comment
 * 
 * Created: Jan 2, 2026
 * Status: ✅ Production Ready
 */

import { apiFetch } from './api';

// ============================================================================
// Type Definitions
// ============================================================================

export interface CommentAuthor {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface Comment {
  id: number;
  content: string;
  projectId?: number;
  taskId?: number;
  authorId: number;
  author?: CommentAuthor;
  parentId?: number;      // For nested/reply comments
  replies?: Comment[];    // Child comments
  attachments?: CommentAttachment[];
  createdAt: string;
  updatedAt?: string;
}

export interface CommentAttachment {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

// Request/Response Types
export interface CreateCommentData {
  content: string;
  projectId?: number;     // Either projectId or taskId required
  taskId?: number;
  parentId?: number;      // For reply to existing comment
}

export interface CommentFilters {
  projectId?: number;
  taskId?: number;
  authorId?: number;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CommentsResponse {
  data: Comment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get comments with optional filters
 * 
 * @param filters - Filter options (projectId, taskId, etc.)
 * @returns Promise<CommentsResponse>
 * 
 * @example
 * // Get all comments for a project
 * const comments = await getComments({ projectId: 1 });
 * 
 * // Get comments for a task
 * const taskComments = await getComments({ taskId: 5 });
 */
export async function getComments(filters: CommentFilters = {}): Promise<CommentsResponse> {
  console.log('[CommentsAPI] 📝 Fetching comments...', filters);
  
  try {
    const params = new URLSearchParams();
    
    if (filters.projectId) params.append('projectId', String(filters.projectId));
    if (filters.taskId) params.append('taskId', String(filters.taskId));
    if (filters.authorId) params.append('authorId', String(filters.authorId));
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/comments?${queryString}` : '/comments';
    
    const response = await apiFetch<CommentsResponse>(endpoint);
    
    console.log('[CommentsAPI] ✅ Fetched', response.data?.length || 0, 'comments');
    
    return response;
  } catch (error) {
    console.error('[CommentsAPI] ❌ Failed to fetch comments:', error);
    throw error;
  }
}

/**
 * Get comments for a specific project
 * 
 * @param projectId - Project ID
 * @param options - Additional filter options
 * @returns Promise<CommentsResponse>
 */
export async function getProjectComments(
  projectId: number,
  options: Omit<CommentFilters, 'projectId' | 'taskId'> = {}
): Promise<CommentsResponse> {
  return getComments({ ...options, projectId });
}

/**
 * Get comments for a specific task
 * 
 * @param taskId - Task ID
 * @param options - Additional filter options
 * @returns Promise<CommentsResponse>
 */
export async function getTaskComments(
  taskId: number,
  options: Omit<CommentFilters, 'projectId' | 'taskId'> = {}
): Promise<CommentsResponse> {
  return getComments({ ...options, taskId });
}

/**
 * Create a new comment
 * 
 * @param data - Comment data (content, projectId/taskId)
 * @returns Promise<Comment>
 * 
 * @example
 * // Add comment to project
 * const comment = await createComment({
 *   content: 'Great progress!',
 *   projectId: 1
 * });
 * 
 * // Reply to existing comment
 * const reply = await createComment({
 *   content: 'Thanks!',
 *   projectId: 1,
 *   parentId: 5
 * });
 */
export async function createComment(data: CreateCommentData): Promise<Comment> {
  console.log('[CommentsAPI] 📝 Creating comment...');
  
  // Validate: either projectId or taskId required
  if (!data.projectId && !data.taskId) {
    throw new Error('Either projectId or taskId is required');
  }
  
  if (!data.content?.trim()) {
    throw new Error('Comment content is required');
  }
  
  try {
    const response = await apiFetch<Comment>('/comments', {
      method: 'POST',
      data: JSON.stringify({
        content: data.content.trim(),
        ...(data.projectId && { projectId: data.projectId }),
        ...(data.taskId && { taskId: data.taskId }),
        ...(data.parentId && { parentId: data.parentId }),
      }),
    });
    
    console.log('[CommentsAPI] ✅ Comment created:', response.id);
    
    return response;
  } catch (error) {
    console.error('[CommentsAPI] ❌ Failed to create comment:', error);
    throw error;
  }
}

/**
 * Delete a comment
 * 
 * @param commentId - Comment ID to delete
 * @returns Promise<void>
 * 
 * @example
 * await deleteComment(5);
 */
export async function deleteComment(commentId: number): Promise<void> {
  console.log('[CommentsAPI] 🗑️ Deleting comment:', commentId);
  
  try {
    await apiFetch(`/comments/${commentId}`, {
      method: 'DELETE',
    });
    
    console.log('[CommentsAPI] ✅ Comment deleted:', commentId);
  } catch (error) {
    console.error('[CommentsAPI] ❌ Failed to delete comment:', error);
    throw error;
  }
}

/**
 * Add comment to a project (convenience method)
 */
export async function addProjectComment(
  projectId: number,
  content: string,
  parentId?: number
): Promise<Comment> {
  return createComment({ projectId, content, parentId });
}

/**
 * Add comment to a task (convenience method)
 */
export async function addTaskComment(
  taskId: number,
  content: string,
  parentId?: number
): Promise<Comment> {
  return createComment({ taskId, content, parentId });
}

// ============================================================================
// Export default service object
// ============================================================================

export const commentsService = {
  getComments,
  getProjectComments,
  getTaskComments,
  createComment,
  deleteComment,
  addProjectComment,
  addTaskComment,
};

export default commentsService;
