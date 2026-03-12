/**
 * Social Context
 * State management for Facebook-style social features
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

import * as socialService from '@/services/socialService';
import {
    Comment,
    FeedFilter,
    FeedType,
    Post,
    PostPrivacy,
    ReactionType,
    Story,
    Timeline,
    UserProfile
} from '@/types/social';
import {
    errorNotification,
    lightImpact,
    mediumImpact,
    successNotification,
} from '@/utils/haptics';
import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useReducer,
} from 'react';

// ============================================
// State Types
// ============================================

interface SocialState {
  // Feed
  feeds: Record<string, Timeline>;
  currentFeed: FeedType;
  
  // Stories
  stories: Story[];
  
  // User interactions
  myReactions: Record<string, ReactionType | null>; // postId -> reaction
  savedPosts: Set<string>;
  
  // Comments
  comments: Record<string, Comment[]>; // postId -> comments
  
  // Profiles
  profiles: Record<string, UserProfile>;
  
  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  isPosting: boolean;
  error: string | null;
}

// ============================================
// Actions
// ============================================

type SocialAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_POSTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FEED'; payload: { feedType: string; timeline: Timeline; append?: boolean } }
  | { type: 'SET_CURRENT_FEED'; payload: FeedType }
  | { type: 'ADD_POST'; payload: Post }
  | { type: 'UPDATE_POST'; payload: Post }
  | { type: 'DELETE_POST'; payload: string }
  | { type: 'SET_REACTION'; payload: { postId: string; reaction: ReactionType | null } }
  | { type: 'TOGGLE_SAVE'; payload: string }
  | { type: 'SET_COMMENTS'; payload: { postId: string; comments: Comment[]; append?: boolean } }
  | { type: 'ADD_COMMENT'; payload: { postId: string; comment: Comment } }
  | { type: 'SET_STORIES'; payload: Story[] }
  | { type: 'SET_PROFILE'; payload: UserProfile };

// ============================================
// Initial State
// ============================================

const initialState: SocialState = {
  feeds: {},
  currentFeed: 'news_feed',
  stories: [],
  myReactions: {},
  savedPosts: new Set(),
  comments: {},
  profiles: {},
  isLoading: false,
  isRefreshing: false,
  isPosting: false,
  error: null,
};

// ============================================
// Reducer
// ============================================

function socialReducer(state: SocialState, action: SocialAction): SocialState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_REFRESHING':
      return { ...state, isRefreshing: action.payload };
    
    case 'SET_POSTING':
      return { ...state, isPosting: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_FEED': {
      const { feedType, timeline, append } = action.payload;
      const existingFeed = state.feeds[feedType];
      
      return {
        ...state,
        feeds: {
          ...state.feeds,
          [feedType]: {
            posts: append && existingFeed
              ? [...existingFeed.posts, ...timeline.posts]
              : timeline.posts,
            nextCursor: timeline.nextCursor,
            hasMore: timeline.hasMore,
          },
        },
      };
    }
    
    case 'SET_CURRENT_FEED':
      return { ...state, currentFeed: action.payload };
    
    case 'ADD_POST': {
      const post = action.payload;
      const feedType = state.currentFeed;
      const existingFeed = state.feeds[feedType];
      
      return {
        ...state,
        feeds: {
          ...state.feeds,
          [feedType]: {
            ...existingFeed,
            posts: [post, ...(existingFeed?.posts || [])],
          },
        },
      };
    }
    
    case 'UPDATE_POST': {
      const updatedPost = action.payload;
      const newFeeds = { ...state.feeds };
      
      Object.keys(newFeeds).forEach(feedType => {
        const feed = newFeeds[feedType];
        if (feed) {
          newFeeds[feedType] = {
            ...feed,
            posts: feed.posts.map(p => p.id === updatedPost.id ? updatedPost : p),
          };
        }
      });
      
      return { ...state, feeds: newFeeds };
    }
    
    case 'DELETE_POST': {
      const postId = action.payload;
      const newFeeds = { ...state.feeds };
      
      Object.keys(newFeeds).forEach(feedType => {
        const feed = newFeeds[feedType];
        if (feed) {
          newFeeds[feedType] = {
            ...feed,
            posts: feed.posts.filter(p => p.id !== postId),
          };
        }
      });
      
      return { ...state, feeds: newFeeds };
    }
    
    case 'SET_REACTION': {
      const { postId, reaction } = action.payload;
      return {
        ...state,
        myReactions: {
          ...state.myReactions,
          [postId]: reaction,
        },
      };
    }
    
    case 'TOGGLE_SAVE': {
      const postId = action.payload;
      const newSaved = new Set(state.savedPosts);
      
      if (newSaved.has(postId)) {
        newSaved.delete(postId);
      } else {
        newSaved.add(postId);
      }
      
      return { ...state, savedPosts: newSaved };
    }
    
    case 'SET_COMMENTS': {
      const { postId, comments, append } = action.payload;
      const existingComments = state.comments[postId] || [];
      
      return {
        ...state,
        comments: {
          ...state.comments,
          [postId]: append ? [...existingComments, ...comments] : comments,
        },
      };
    }
    
    case 'ADD_COMMENT': {
      const { postId, comment } = action.payload;
      const existingComments = state.comments[postId] || [];
      
      return {
        ...state,
        comments: {
          ...state.comments,
          [postId]: [comment, ...existingComments],
        },
      };
    }
    
    case 'SET_STORIES':
      return { ...state, stories: action.payload };
    
    case 'SET_PROFILE':
      return {
        ...state,
        profiles: {
          ...state.profiles,
          [action.payload.id]: action.payload,
        },
      };
    
    default:
      return state;
  }
}

// ============================================
// Context
// ============================================

interface SocialContextValue {
  // State
  state: SocialState;
  
  // Feed Actions
  loadFeed: (feedType?: FeedType, filter?: FeedFilter) => Promise<void>;
  refreshFeed: () => Promise<void>;
  loadMorePosts: () => Promise<void>;
  
  // Post Actions
  createPost: (content: string, media?: string[], privacy?: PostPrivacy) => Promise<Post>;
  updatePost: (postId: string, content: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  
  // Reaction Actions
  reactToPost: (postId: string, type: ReactionType | null) => Promise<void>;
  
  // Save Actions
  toggleSavePost: (postId: string) => Promise<void>;
  
  // Comment Actions
  loadComments: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string, parentId?: string) => Promise<void>;
  
  // Story Actions
  loadStories: () => Promise<void>;
  
  // Profile Actions
  loadProfile: (userId: string) => Promise<UserProfile | null>;
  
  // Helpers
  getCurrentFeed: () => Timeline | undefined;
  getPostReaction: (postId: string) => ReactionType | null;
  isPostSaved: (postId: string) => boolean;
}

const SocialContext = createContext<SocialContextValue | undefined>(undefined);

// ============================================
// Provider
// ============================================

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(socialReducer, initialState);

  // Load feed
  const loadFeed = useCallback(async (feedType: FeedType = 'news_feed', filter?: FeedFilter) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await socialService.getFeed({ type: feedType, ...filter });
      
      if (response.success) {
        dispatch({ 
          type: 'SET_FEED', 
          payload: { feedType, timeline: response.data } 
        });
        dispatch({ type: 'SET_CURRENT_FEED', payload: feedType });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Không thể tải bảng tin' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Refresh feed
  const refreshFeed = useCallback(async () => {
    dispatch({ type: 'SET_REFRESHING', payload: true });

    try {
      const response = await socialService.getFeed({ type: state.currentFeed });
      
      if (response.success) {
        dispatch({ 
          type: 'SET_FEED', 
          payload: { feedType: state.currentFeed, timeline: response.data } 
        });
      }
    } catch (error) {
      console.error('Error refreshing feed:', error);
    } finally {
      dispatch({ type: 'SET_REFRESHING', payload: false });
    }
  }, [state.currentFeed]);

  // Load more posts
  const loadMorePosts = useCallback(async () => {
    const currentTimeline = state.feeds[state.currentFeed];
    if (!currentTimeline?.hasMore || state.isLoading) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await socialService.getFeed(
        { type: state.currentFeed },
        currentTimeline.nextCursor
      );
      
      if (response.success) {
        dispatch({ 
          type: 'SET_FEED', 
          payload: { 
            feedType: state.currentFeed, 
            timeline: response.data,
            append: true,
          } 
        });
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.feeds, state.currentFeed, state.isLoading]);

  // Create post
  const createPost = useCallback(async (
    content: string,
    media?: string[],
    privacy: PostPrivacy = 'friends'
  ): Promise<Post> => {
    dispatch({ type: 'SET_POSTING', payload: true });
    mediumImpact();

    try {
      const response = await socialService.createPost({ content, media, privacy });
      
      if (response.success) {
        dispatch({ type: 'ADD_POST', payload: response.post });
        successNotification();
        return response.post;
      }
      
      throw new Error('Failed to create post');
    } catch (error) {
      errorNotification();
      throw error;
    } finally {
      dispatch({ type: 'SET_POSTING', payload: false });
    }
  }, []);

  // Update post
  const updatePost = useCallback(async (postId: string, content: string) => {
    try {
      const response = await socialService.updatePost(postId, { content });
      
      if (response.success) {
        dispatch({ type: 'UPDATE_POST', payload: response.post });
        successNotification();
      }
    } catch (error) {
      errorNotification();
      throw error;
    }
  }, []);

  // Delete post
  const deletePost = useCallback(async (postId: string) => {
    mediumImpact();

    try {
      const response = await socialService.deletePost(postId);
      
      if (response.success) {
        dispatch({ type: 'DELETE_POST', payload: postId });
        successNotification();
      }
    } catch (error) {
      errorNotification();
      throw error;
    }
  }, []);

  // React to post
  const reactToPost = useCallback(async (postId: string, type: ReactionType | null) => {
    const previousReaction = state.myReactions[postId];
    
    // Optimistic update
    dispatch({ type: 'SET_REACTION', payload: { postId, reaction: type } });
    lightImpact();

    try {
      await socialService.reactToPost(postId, type);
    } catch (error) {
      // Revert on error
      dispatch({ type: 'SET_REACTION', payload: { postId, reaction: previousReaction || null } });
      errorNotification();
    }
  }, [state.myReactions]);

  // Toggle save post
  const toggleSavePost = useCallback(async (postId: string) => {
    const wasSaved = state.savedPosts.has(postId);
    
    // Optimistic update
    dispatch({ type: 'TOGGLE_SAVE', payload: postId });
    lightImpact();

    try {
      if (wasSaved) {
        await socialService.unsavePost(postId);
      } else {
        await socialService.savePost(postId);
      }
    } catch (error) {
      // Revert on error
      dispatch({ type: 'TOGGLE_SAVE', payload: postId });
      errorNotification();
    }
  }, [state.savedPosts]);

  // Load comments
  const loadComments = useCallback(async (postId: string) => {
    try {
      const response = await socialService.getComments({ postId });
      
      if (response.success) {
        dispatch({ 
          type: 'SET_COMMENTS', 
          payload: { postId, comments: response.comments } 
        });
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  }, []);

  // Add comment
  const addComment = useCallback(async (postId: string, content: string, parentId?: string) => {
    lightImpact();

    try {
      const response = await socialService.createComment({ postId, content, parentId });
      
      if (response.success) {
        dispatch({ 
          type: 'ADD_COMMENT', 
          payload: { postId, comment: response.comment } 
        });
        successNotification();
      }
    } catch (error) {
      errorNotification();
      throw error;
    }
  }, []);

  // Load stories
  const loadStories = useCallback(async () => {
    try {
      const response = await socialService.getStories();
      dispatch({ type: 'SET_STORIES', payload: response.stories });
    } catch (error) {
      console.error('Error loading stories:', error);
    }
  }, []);

  // Load profile
  const loadProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const response = await socialService.getUserProfile(userId);
      
      if (response.success) {
        dispatch({ type: 'SET_PROFILE', payload: response.user });
        return response.user;
      }
      
      return null;
    } catch (error) {
      console.error('Error loading profile:', error);
      return null;
    }
  }, []);

  // Helpers
  const getCurrentFeed = useCallback(() => {
    return state.feeds[state.currentFeed];
  }, [state.feeds, state.currentFeed]);

  const getPostReaction = useCallback((postId: string): ReactionType | null => {
    return state.myReactions[postId] || null;
  }, [state.myReactions]);

  const isPostSaved = useCallback((postId: string): boolean => {
    return state.savedPosts.has(postId);
  }, [state.savedPosts]);

  // Context value
  const value = useMemo<SocialContextValue>(() => ({
    state,
    loadFeed,
    refreshFeed,
    loadMorePosts,
    createPost,
    updatePost,
    deletePost,
    reactToPost,
    toggleSavePost,
    loadComments,
    addComment,
    loadStories,
    loadProfile,
    getCurrentFeed,
    getPostReaction,
    isPostSaved,
  }), [
    state,
    loadFeed,
    refreshFeed,
    loadMorePosts,
    createPost,
    updatePost,
    deletePost,
    reactToPost,
    toggleSavePost,
    loadComments,
    addComment,
    loadStories,
    loadProfile,
    getCurrentFeed,
    getPostReaction,
    isPostSaved,
  ]);

  return (
    <SocialContext.Provider value={value}>
      {children}
    </SocialContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useSocial() {
  const context = useContext(SocialContext);
  
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  
  return context;
}

export default SocialContext;
