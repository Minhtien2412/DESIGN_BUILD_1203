/**
 * Stories Service
 * Handle Instagram/WhatsApp style stories (24h expiring)
 * 
 * Backend: https://baotienweb.cloud/api/v1
 * Created: Session 5 - API Migration Batch 5
 */

import { apiFetch } from './api';

// ============================================================================
// TYPES
// ============================================================================

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: string;
  expiresAt: string;
  viewed?: boolean;
  viewCount?: number;
  viewers?: string[];
  caption?: string;
  location?: string;
  mentions?: string[];
  hashtags?: string[];
}

export interface StoryGroup {
  userId: string;
  userName: string;
  userAvatar: string;
  stories: Story[];
  hasUnviewed: boolean;
}

export interface StoriesResponse {
  success: boolean;
  data: StoryGroup[];
}

export interface StoryResponse {
  success: boolean;
  data: Story;
}

// ============================================================================
// MOCK DATA (Fallback)
// ============================================================================

export const MOCK_STORY_GROUPS: StoryGroup[] = [
  {
    userId: 'u1',
    userName: 'Kiến Trúc KTS',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    hasUnviewed: true,
    stories: [
      {
        id: 's1-1',
        userId: 'u1',
        userName: 'Kiến Trúc KTS',
        userAvatar: 'https://i.pravatar.cc/150?img=1',
        mediaUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1080',
        mediaType: 'image',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
        viewed: false,
        viewCount: 156,
        caption: 'Villa mới hoàn thành! 🏠✨',
      },
      {
        id: 's1-2',
        userId: 'u1',
        userName: 'Kiến Trúc KTS',
        userAvatar: 'https://i.pravatar.cc/150?img=1',
        mediaUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1080',
        mediaType: 'image',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
        viewed: false,
        viewCount: 89,
        caption: 'Nội thất hiện đại',
      },
    ],
  },
  {
    userId: 'u2',
    userName: 'Thợ Xây Pro',
    userAvatar: 'https://i.pravatar.cc/150?img=2',
    hasUnviewed: true,
    stories: [
      {
        id: 's2-1',
        userId: 'u2',
        userName: 'Thợ Xây Pro',
        userAvatar: 'https://i.pravatar.cc/150?img=2',
        mediaUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1080',
        mediaType: 'image',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 19 * 60 * 60 * 1000).toISOString(),
        viewed: false,
        viewCount: 234,
        caption: 'Tiến độ công trình hôm nay 💪',
      },
    ],
  },
  {
    userId: 'u3',
    userName: 'Nội Thất Design',
    userAvatar: 'https://i.pravatar.cc/150?img=3',
    hasUnviewed: false,
    stories: [
      {
        id: 's3-1',
        userId: 'u3',
        userName: 'Nội Thất Design',
        userAvatar: 'https://i.pravatar.cc/150?img=3',
        mediaUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?w=1080',
        mediaType: 'image',
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
        viewed: true,
        viewCount: 567,
        caption: 'Phòng khách minimalist 🪴',
      },
    ],
  },
  {
    userId: 'u4',
    userName: 'VietBuild 2025',
    userAvatar: 'https://i.pravatar.cc/150?img=4',
    hasUnviewed: true,
    stories: [
      {
        id: 's4-1',
        userId: 'u4',
        userName: 'VietBuild 2025',
        userAvatar: 'https://i.pravatar.cc/150?img=4',
        mediaUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1080',
        mediaType: 'image',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 23.5 * 60 * 60 * 1000).toISOString(),
        viewed: false,
        viewCount: 1234,
        caption: 'Triển lãm xây dựng lớn nhất năm! 🏗️',
      },
    ],
  },
  {
    userId: 'u5',
    userName: 'Đá Hoa Cương',
    userAvatar: 'https://i.pravatar.cc/150?img=5',
    hasUnviewed: false,
    stories: [
      {
        id: 's5-1',
        userId: 'u5',
        userName: 'Đá Hoa Cương',
        userAvatar: 'https://i.pravatar.cc/150?img=5',
        mediaUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080',
        mediaType: 'image',
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        viewed: true,
        viewCount: 45,
        caption: 'Mẫu đá mới về kho',
      },
    ],
  },
];

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * Get all story groups
 */
export async function getStories(): Promise<StoryGroup[]> {
  try {
    const response = await apiFetch<StoriesResponse>('/stories');
    
    if (response.success && response.data) {
      return response.data;
    }
    return MOCK_STORY_GROUPS;
  } catch (error) {
    console.warn('[StoriesService] getStories error:', error);
    return MOCK_STORY_GROUPS;
  }
}

/**
 * Get stories by user ID
 */
export async function getUserStories(userId: string): Promise<StoryGroup | null> {
  try {
    const response = await apiFetch<{ success: boolean; data: StoryGroup }>(`/stories/user/${userId}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    return MOCK_STORY_GROUPS.find(g => g.userId === userId) || null;
  } catch (error) {
    console.warn('[StoriesService] getUserStories error:', error);
    return MOCK_STORY_GROUPS.find(g => g.userId === userId) || null;
  }
}

/**
 * Get a specific story by ID
 */
export async function getStoryById(storyId: string): Promise<Story | null> {
  try {
    const response = await apiFetch<StoryResponse>(`/stories/${storyId}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    // Search in mock data
    for (const group of MOCK_STORY_GROUPS) {
      const story = group.stories.find(s => s.id === storyId);
      if (story) return story;
    }
    return null;
  } catch (error) {
    console.warn('[StoriesService] getStoryById error:', error);
    for (const group of MOCK_STORY_GROUPS) {
      const story = group.stories.find(s => s.id === storyId);
      if (story) return story;
    }
    return null;
  }
}

/**
 * Mark a story as viewed
 */
export async function markStoryViewed(storyId: string): Promise<{ success: boolean }> {
  try {
    const response = await apiFetch<{ success: boolean }>(`/stories/${storyId}/view`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.warn('[StoriesService] markStoryViewed error:', error);
    return { success: true }; // Optimistic update
  }
}

/**
 * Create a new story
 */
export async function createStory(
  mediaUrl: string,
  mediaType: 'image' | 'video',
  options?: {
    caption?: string;
    location?: string;
    mentions?: string[];
    hashtags?: string[];
  }
): Promise<{ success: boolean; story?: Story; message?: string }> {
  try {
    const response = await apiFetch<{ success: boolean; story?: Story; message?: string }>(
      '/stories',
      {
        method: 'POST',
        body: JSON.stringify({ mediaUrl, mediaType, ...options }),
      }
    );
    return response;
  } catch (error) {
    console.warn('[StoriesService] createStory error:', error);
    return { success: false, message: 'Không thể tạo story' };
  }
}

/**
 * Delete a story
 */
export async function deleteStory(storyId: string): Promise<{ success: boolean }> {
  try {
    const response = await apiFetch<{ success: boolean }>(`/stories/${storyId}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.warn('[StoriesService] deleteStory error:', error);
    return { success: false };
  }
}

/**
 * React to a story
 */
export async function reactToStory(
  storyId: string,
  reaction: 'like' | 'love' | 'wow' | 'haha' | 'sad' | 'angry'
): Promise<{ success: boolean }> {
  try {
    const response = await apiFetch<{ success: boolean }>(`/stories/${storyId}/react`, {
      method: 'POST',
      body: JSON.stringify({ reaction }),
    });
    return response;
  } catch (error) {
    console.warn('[StoriesService] reactToStory error:', error);
    return { success: true }; // Optimistic
  }
}

/**
 * Reply to a story
 */
export async function replyToStory(
  storyId: string,
  message: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await apiFetch<{ success: boolean; message?: string }>(
      `/stories/${storyId}/reply`,
      {
        method: 'POST',
        body: JSON.stringify({ message }),
      }
    );
    return response;
  } catch (error) {
    console.warn('[StoriesService] replyToStory error:', error);
    return { success: true, message: 'Đã gửi phản hồi (offline)' };
  }
}

// Export service object
const StoriesService = {
  getStories,
  getUserStories,
  getStoryById,
  markStoryViewed,
  createStory,
  deleteStory,
  reactToStory,
  replyToStory,
  MOCK_STORY_GROUPS,
};

export default StoriesService;
