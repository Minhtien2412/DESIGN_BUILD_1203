/**
 * Stories API Service
 * Handles 24-hour expiring stories (Instagram/WhatsApp style)
 */

import type { StoryGroup } from '@/components/stories/stories-bar';
import { apiFetch } from './api';

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  thumbnail?: string;
  duration?: number; // seconds for video
  createdAt: string;
  expiresAt: string;
  viewCount: number;
  viewers: string[]; // user IDs who viewed
}

export interface CreateStoryData {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  duration?: number;
  thumbnail?: string;
}

export interface StoryView {
  storyId: string;
  userId: string;
  viewedAt: string;
}

/**
 * Get all active stories grouped by user
 */
export async function getStories(): Promise<StoryGroup[]> {
  const data = await apiFetch<Story[]>('/stories');
  return groupStoriesByUser(data);
}

/**
 * Get stories from specific user
 */
export async function getUserStories(userId: string): Promise<StoryGroup | null> {
  const data = await apiFetch<Story[]>(`/stories/user/${userId}`);
  const groups = groupStoriesByUser(data);
  return groups[0] || null;
}

/**
 * Get stories from users you follow
 */
export async function getFollowingStories(): Promise<StoryGroup[]> {
  const data = await apiFetch<Story[]>('/stories/following');
  return groupStoriesByUser(data);
}

/**
 * Create a new story
 */
export async function createStory(storyData: CreateStoryData): Promise<Story> {
  return apiFetch<Story>('/stories', {
    method: 'POST',
    data: storyData,
  });
}

/**
 * Delete your story
 */
export async function deleteStory(storyId: string): Promise<void> {
  await apiFetch(`/stories/${storyId}`, { method: 'DELETE' });
}

/**
 * Mark story as viewed
 */
export async function viewStory(storyId: string): Promise<void> {
  await apiFetch(`/stories/${storyId}/view`, { method: 'POST' });
}

/**
 * Get who viewed your story
 */
export async function getStoryViewers(storyId: string): Promise<StoryView[]> {
  return apiFetch<StoryView[]>(`/stories/${storyId}/viewers`);
}

/**
 * Get analytics for your stories
 */
export interface StoryAnalytics {
  totalViews: number;
  uniqueViewers: number;
  averageViewDuration: number;
  viewsByStory: {
    storyId: string;
    views: number;
    createdAt: string;
  }[];
}

export async function getStoryAnalytics(
  startDate?: string,
  endDate?: string
): Promise<StoryAnalytics> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  return apiFetch<StoryAnalytics>(`/stories/analytics?${params}`);
}

/**
 * Helper: Group stories by user and check for unviewed
 */
function groupStoriesByUser(stories: Story[]): StoryGroup[] {
  const grouped = new Map<string, StoryGroup>();

  for (const story of stories) {
    let group = grouped.get(story.userId);
    
    if (!group) {
      group = {
        userId: story.userId,
        userName: story.userName,
        userAvatar: story.userAvatar,
        stories: [],
        hasUnviewed: false,
      };
      grouped.set(story.userId, group);
    }

    group.stories.push(story);
    
    // Check if any story is unviewed (not in viewers array)
    // This assumes the API returns current user's ID somehow
    // You might need to pass currentUserId as parameter
    if (!story.viewers || story.viewers.length === 0) {
      group.hasUnviewed = true;
    }
  }

  // Sort stories within each group by creation date
  for (const group of grouped.values()) {
    group.stories.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  // Convert map to array and sort by most recent story
  return Array.from(grouped.values()).sort((a, b) => {
    const aLatest = a.stories[a.stories.length - 1].createdAt;
    const bLatest = b.stories[b.stories.length - 1].createdAt;
    return new Date(bLatest).getTime() - new Date(aLatest).getTime();
  });
}

/**
 * Helper: Check if story is expired
 */
export function isStoryExpired(story: Story): boolean {
  return new Date(story.expiresAt) < new Date();
}

/**
 * Helper: Get remaining time for story
 */
export function getStoryTimeRemaining(story: Story): number {
  const now = new Date();
  const expires = new Date(story.expiresAt);
  return Math.max(0, expires.getTime() - now.getTime());
}

/**
 * Helper: Format time remaining (e.g., "23h left", "5m left")
 */
export function formatTimeRemaining(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `${hours}h left`;
  if (minutes > 0) return `${minutes}m left`;
  return 'Expiring soon';
}
