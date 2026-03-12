/**
 * Social Feed Service
 * API service for Facebook-style social features
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

import {
    Comment,
    CreateCommentRequest,
    CreateCommentResponse,
    CreatePostRequest,
    CreatePostResponse,
    FeedFilter,
    GetCommentsRequest,
    GetCommentsResponse,
    GetFeedResponse,
    GetProfileResponse,
    Post,
    PostPrivacy,
    ReactToPostResponse,
    ReactionSummary,
    ReactionType,
    SharePostResponse,
    SocialSearchResponse,
    SocialUser,
    Story,
    UpdatePostRequest,
    UpdatePostResponse,
    UserProfile
} from '@/types/social';
import { apiFetch } from './api';

const API_BASE = '/social';

// ============================================
// Feed APIs
// ============================================

/**
 * Get news feed or user timeline
 */
export async function getFeed(
  filter?: FeedFilter,
  cursor?: string,
  limit: number = 20
): Promise<GetFeedResponse> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(cursor && { cursor }),
      ...(filter?.type && { type: filter.type }),
      ...(filter?.userId && { userId: filter.userId }),
      ...(filter?.mediaOnly && { mediaOnly: 'true' }),
    });

    const response = await apiFetch(`${API_BASE}/feed?${params}`);
    return response as GetFeedResponse;
  } catch (error) {
    console.error('Error fetching feed:', error);
    // Return mock data for development
    return getMockFeed(limit);
  }
}

/**
 * Get user timeline
 */
export async function getUserTimeline(
  userId: string,
  cursor?: string,
  limit: number = 20
): Promise<GetFeedResponse> {
  return getFeed({ type: 'profile', userId }, cursor, limit);
}

/**
 * Get single post by ID
 */
export async function getPostById(postId: string): Promise<Post | null> {
  try {
    const response = await apiFetch(`${API_BASE}/posts/${postId}`);
    return (response as any).post;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

// ============================================
// Post CRUD APIs
// ============================================

/**
 * Create a new post
 */
export async function createPost(data: CreatePostRequest): Promise<CreatePostResponse> {
  try {
    const response = await apiFetch(`${API_BASE}/posts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response as CreatePostResponse;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

/**
 * Update a post
 */
export async function updatePost(postId: string, data: UpdatePostRequest): Promise<UpdatePostResponse> {
  try {
    const response = await apiFetch(`${API_BASE}/posts/${postId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response as UpdatePostResponse;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
}

/**
 * Delete a post
 */
export async function deletePost(postId: string): Promise<{ success: boolean }> {
  try {
    const response = await apiFetch(`${API_BASE}/posts/${postId}`, {
      method: 'DELETE',
    });
    return response as { success: boolean };
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

// ============================================
// Reaction APIs
// ============================================

/**
 * React to a post
 */
export async function reactToPost(
  postId: string,
  type: ReactionType | null
): Promise<ReactToPostResponse> {
  try {
    const response = await apiFetch(`${API_BASE}/posts/${postId}/reactions`, {
      method: type ? 'POST' : 'DELETE',
      body: type ? JSON.stringify({ type }) : undefined,
    });
    return response as ReactToPostResponse;
  } catch (error) {
    console.error('Error reacting to post:', error);
    throw error;
  }
}

/**
 * Get reactions for a post
 */
export async function getPostReactions(
  postId: string,
  type?: ReactionType
): Promise<{ reactions: { user: SocialUser; type: ReactionType }[] }> {
  try {
    const params = type ? `?type=${type}` : '';
    const response = await apiFetch(`${API_BASE}/posts/${postId}/reactions${params}`);
    return response as any;
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return { reactions: [] };
  }
}

// ============================================
// Comment APIs
// ============================================

/**
 * Get comments for a post
 */
export async function getComments(request: GetCommentsRequest): Promise<GetCommentsResponse> {
  try {
    const params = new URLSearchParams({
      postId: request.postId,
      limit: (request.limit || 20).toString(),
      sort: request.sort || 'newest',
      ...(request.cursor && { cursor: request.cursor }),
      ...(request.parentId && { parentId: request.parentId }),
    });

    const response = await apiFetch(`${API_BASE}/comments?${params}`);
    return response as GetCommentsResponse;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return getMockComments(request.postId);
  }
}

/**
 * Create a comment
 */
export async function createComment(data: CreateCommentRequest): Promise<CreateCommentResponse> {
  try {
    const response = await apiFetch(`${API_BASE}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response as CreateCommentResponse;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
}

/**
 * Update a comment
 */
export async function updateComment(
  commentId: string,
  content: string
): Promise<{ success: boolean; comment: Comment }> {
  try {
    const response = await apiFetch(`${API_BASE}/comments/${commentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    });
    return response as any;
  } catch (error) {
    console.error('Error updating comment:', error);
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
 * React to a comment
 */
export async function reactToComment(
  commentId: string,
  type: ReactionType | null
): Promise<ReactToPostResponse> {
  try {
    const response = await apiFetch(`${API_BASE}/comments/${commentId}/reactions`, {
      method: type ? 'POST' : 'DELETE',
      body: type ? JSON.stringify({ type }) : undefined,
    });
    return response as ReactToPostResponse;
  } catch (error) {
    console.error('Error reacting to comment:', error);
    throw error;
  }
}

// ============================================
// Share APIs
// ============================================

/**
 * Share a post
 */
export async function sharePost(
  postId: string,
  content?: string,
  privacy: PostPrivacy = 'friends'
): Promise<SharePostResponse> {
  try {
    const response = await apiFetch(`${API_BASE}/posts/${postId}/share`, {
      method: 'POST',
      body: JSON.stringify({ content, privacy }),
    });
    return response as SharePostResponse;
  } catch (error) {
    console.error('Error sharing post:', error);
    throw error;
  }
}

// ============================================
// Profile APIs
// ============================================

/**
 * Get user profile
 */
export async function getUserProfile(userId?: string, username?: string): Promise<GetProfileResponse> {
  try {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    if (username) params.set('username', username);

    const response = await apiFetch(`${API_BASE}/profile?${params}`);
    return response as GetProfileResponse;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return getMockProfile(userId || 'me');
  }
}

/**
 * Update user profile
 */
export async function updateProfile(data: Partial<UserProfile>): Promise<GetProfileResponse> {
  try {
    const response = await apiFetch(`${API_BASE}/profile`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response as GetProfileResponse;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

// ============================================
// Story APIs
// ============================================

/**
 * Get stories from friends
 */
export async function getStories(): Promise<{ stories: Story[] }> {
  try {
    const response = await apiFetch(`${API_BASE}/stories`);
    return response as { stories: Story[] };
  } catch (error) {
    console.error('Error fetching stories:', error);
    return { stories: [] };
  }
}

/**
 * Create a story
 */
export async function createStory(media: FormData): Promise<{ success: boolean; story: Story }> {
  try {
    const response = await apiFetch(`${API_BASE}/stories`, {
      method: 'POST',
      body: media,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response as any;
  } catch (error) {
    console.error('Error creating story:', error);
    throw error;
  }
}

/**
 * Mark story as viewed
 */
export async function viewStory(storyId: string): Promise<{ success: boolean }> {
  try {
    const response = await apiFetch(`${API_BASE}/stories/${storyId}/view`, {
      method: 'POST',
    });
    return response as { success: boolean };
  } catch (error) {
    console.error('Error viewing story:', error);
    return { success: false };
  }
}

// ============================================
// Search APIs
// ============================================

/**
 * Search posts, users, etc.
 */
export async function search(
  query: string,
  type: 'all' | 'posts' | 'people' | 'photos' | 'videos' = 'all',
  cursor?: string,
  limit: number = 20
): Promise<SocialSearchResponse> {
  try {
    const params = new URLSearchParams({
      q: query,
      type,
      limit: limit.toString(),
      ...(cursor && { cursor }),
    });

    const response = await apiFetch(`${API_BASE}/search?${params}`);
    return response as SocialSearchResponse;
  } catch (error) {
    console.error('Error searching:', error);
    return { success: false, results: {}, hasMore: false };
  }
}

// ============================================
// Save Post APIs
// ============================================

/**
 * Save a post
 */
export async function savePost(postId: string): Promise<{ success: boolean; isSaved: boolean }> {
  try {
    const response = await apiFetch(`${API_BASE}/posts/${postId}/save`, {
      method: 'POST',
    });
    return response as any;
  } catch (error) {
    console.error('Error saving post:', error);
    throw error;
  }
}

/**
 * Unsave a post
 */
export async function unsavePost(postId: string): Promise<{ success: boolean }> {
  try {
    const response = await apiFetch(`${API_BASE}/posts/${postId}/save`, {
      method: 'DELETE',
    });
    return response as { success: boolean };
  } catch (error) {
    console.error('Error unsaving post:', error);
    throw error;
  }
}

/**
 * Get saved posts
 */
export async function getSavedPosts(cursor?: string, limit: number = 20): Promise<GetFeedResponse> {
  return getFeed({ type: 'saved' }, cursor, limit);
}

// ============================================
// Mock Data for Development
// ============================================

function getMockUser(id: string): SocialUser {
  return {
    id,
    username: `user${id}`,
    displayName: `User ${id}`,
    avatar: `https://i.pravatar.cc/150?u=${id}`,
    verified: id === '1',
    friendsCount: Math.floor(Math.random() * 1000),
    followersCount: Math.floor(Math.random() * 5000),
    followingCount: Math.floor(Math.random() * 500),
    postsCount: Math.floor(Math.random() * 200),
    createdAt: new Date().toISOString(),
  };
}

function getMockReactionSummary(): ReactionSummary {
  const like = Math.floor(Math.random() * 100);
  const love = Math.floor(Math.random() * 50);
  const haha = Math.floor(Math.random() * 30);
  const wow = Math.floor(Math.random() * 20);
  const sad = Math.floor(Math.random() * 10);
  const angry = Math.floor(Math.random() * 5);
  
  const reactions = [
    { type: 'like' as ReactionType, count: like },
    { type: 'love' as ReactionType, count: love },
    { type: 'haha' as ReactionType, count: haha },
  ].sort((a, b) => b.count - a.count);

  return {
    like,
    love,
    haha,
    wow,
    sad,
    angry,
    topReactions: reactions.filter(r => r.count > 0).slice(0, 3).map(r => r.type),
  };
}

function getMockPost(id: string): Post {
  const reactions = getMockReactionSummary();
  const hasMedia = Math.random() > 0.5;
  
  return {
    id,
    authorId: `${Math.floor(Math.random() * 10) + 1}`,
    author: getMockUser(`${Math.floor(Math.random() * 10) + 1}`),
    content: `Đây là nội dung bài viết số ${id}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. #hashtag @mention`,
    media: hasMedia ? [
      {
        id: `media-${id}`,
        type: 'image',
        url: `https://picsum.photos/800/600?random=${id}`,
        width: 800,
        height: 600,
      }
    ] : undefined,
    privacy: 'public',
    reactionsCount: reactions.like + reactions.love + reactions.haha + reactions.wow + reactions.sad + reactions.angry,
    reactions,
    commentsCount: Math.floor(Math.random() * 50),
    sharesCount: Math.floor(Math.random() * 20),
    myReaction: Math.random() > 0.5 ? 'like' : null,
    isSaved: Math.random() > 0.8,
    createdAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
    isEdited: Math.random() > 0.8,
  };
}

function getMockFeed(limit: number): GetFeedResponse {
  const posts: Post[] = [];
  for (let i = 1; i <= limit; i++) {
    posts.push(getMockPost(`${i}`));
  }

  return {
    success: true,
    data: {
      posts,
      nextCursor: `cursor-${limit}`,
      hasMore: true,
    },
  };
}

function getMockComment(id: string, postId: string): Comment {
  const reactions = getMockReactionSummary();
  
  return {
    id,
    postId,
    authorId: `${Math.floor(Math.random() * 10) + 1}`,
    author: getMockUser(`${Math.floor(Math.random() * 10) + 1}`),
    content: `Bình luận số ${id}. Great post! 👍`,
    reactionsCount: reactions.like + reactions.love,
    reactions,
    myReaction: null,
    repliesCount: Math.floor(Math.random() * 5),
    createdAt: new Date(Date.now() - Math.random() * 3600000 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
    isEdited: false,
  };
}

function getMockComments(postId: string): GetCommentsResponse {
  const comments: Comment[] = [];
  const count = Math.floor(Math.random() * 10) + 3;
  
  for (let i = 1; i <= count; i++) {
    comments.push(getMockComment(`${postId}-${i}`, postId));
  }

  return {
    success: true,
    comments,
    hasMore: false,
    total: count,
  };
}

function getMockProfile(userId: string): GetProfileResponse {
  const user = getMockUser(userId);
  
  return {
    success: true,
    user: {
      ...user,
      bio: 'Xin chào! Đây là trang cá nhân của tôi.',
      coverPhoto: `https://picsum.photos/1200/400?random=${userId}`,
      location: 'Hồ Chí Minh, Việt Nam',
      workplace: 'Tech Company',
      education: 'University of Science',
    },
  };
}

export default {
  getFeed,
  getUserTimeline,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  reactToPost,
  getPostReactions,
  getComments,
  createComment,
  updateComment,
  deleteComment,
  reactToComment,
  sharePost,
  getUserProfile,
  updateProfile,
  getStories,
  createStory,
  viewStory,
  search,
  savePost,
  unsavePost,
  getSavedPosts,
};
