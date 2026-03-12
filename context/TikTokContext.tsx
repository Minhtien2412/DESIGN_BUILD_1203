/**
 * TikTok Context & Provider
 * Global state management for TikTok-style video platform
 * 
 * Features:
 * - Video feed state
 * - User interactions (likes, saves, follows)
 * - Comments state
 * - Share functionality
 * - UI state management
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

import * as tiktokService from '@/services/tiktokService';
import {
    FeedType,
    TikTokComment,
    TikTokVideo
} from '@/types/tiktok';
import { HapticFeedback } from '@/utils/haptics';
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useReducer,
} from 'react';
import { Alert, Share } from 'react-native';

// ============================================
// State Types
// ============================================

interface TikTokState {
  // Feed
  forYouFeed: TikTokVideo[];
  followingFeed: TikTokVideo[];
  currentFeedType: FeedType;
  currentVideoIndex: number;
  
  // Cursors for pagination
  forYouCursor?: string;
  followingCursor?: string;
  
  // Loading states
  isLoadingFeed: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  
  // UI State
  isMuted: boolean;
  isCommentsOpen: boolean;
  isShareSheetOpen: boolean;
  currentCommentsVideoId: string | null;
  
  // Comments cache
  comments: Record<string, TikTokComment[]>;
  commentsLoading: Record<string, boolean>;
  
  // User interactions (local cache)
  likedVideos: Set<string>;
  savedVideos: Set<string>;
  followedUsers: Set<string>;
  
  // Error state
  error: string | null;
}

// ============================================
// Actions
// ============================================

type TikTokAction =
  | { type: 'SET_FEED_TYPE'; payload: FeedType }
  | { type: 'SET_CURRENT_INDEX'; payload: number }
  | { type: 'SET_FEED'; payload: { type: FeedType; videos: TikTokVideo[]; cursor?: string; append?: boolean } }
  | { type: 'SET_LOADING_FEED'; payload: boolean }
  | { type: 'SET_LOADING_MORE'; payload: boolean }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'OPEN_COMMENTS'; payload: string }
  | { type: 'CLOSE_COMMENTS' }
  | { type: 'TOGGLE_SHARE_SHEET'; payload: boolean }
  | { type: 'SET_COMMENTS'; payload: { videoId: string; comments: TikTokComment[] } }
  | { type: 'ADD_COMMENT'; payload: { videoId: string; comment: TikTokComment } }
  | { type: 'SET_COMMENTS_LOADING'; payload: { videoId: string; loading: boolean } }
  | { type: 'TOGGLE_LIKE'; payload: string }
  | { type: 'TOGGLE_SAVE'; payload: string }
  | { type: 'TOGGLE_FOLLOW'; payload: string }
  | { type: 'UPDATE_VIDEO_STATS'; payload: { videoId: string; field: string; value: number } }
  | { type: 'SET_ERROR'; payload: string | null };

// ============================================
// Initial State
// ============================================

const initialState: TikTokState = {
  forYouFeed: [],
  followingFeed: [],
  currentFeedType: 'for_you',
  currentVideoIndex: 0,
  isLoadingFeed: false,
  isLoadingMore: false,
  isRefreshing: false,
  isMuted: false,
  isCommentsOpen: false,
  isShareSheetOpen: false,
  currentCommentsVideoId: null,
  comments: {},
  commentsLoading: {},
  likedVideos: new Set(),
  savedVideos: new Set(),
  followedUsers: new Set(),
  error: null,
};

// ============================================
// Reducer
// ============================================

function tiktokReducer(state: TikTokState, action: TikTokAction): TikTokState {
  switch (action.type) {
    case 'SET_FEED_TYPE':
      return { ...state, currentFeedType: action.payload, currentVideoIndex: 0 };

    case 'SET_CURRENT_INDEX':
      return { ...state, currentVideoIndex: action.payload };

    case 'SET_FEED': {
      const { type, videos, cursor, append } = action.payload;
      if (type === 'for_you') {
        return {
          ...state,
          forYouFeed: append ? [...state.forYouFeed, ...videos] : videos,
          forYouCursor: cursor,
        };
      } else {
        return {
          ...state,
          followingFeed: append ? [...state.followingFeed, ...videos] : videos,
          followingCursor: cursor,
        };
      }
    }

    case 'SET_LOADING_FEED':
      return { ...state, isLoadingFeed: action.payload };

    case 'SET_LOADING_MORE':
      return { ...state, isLoadingMore: action.payload };

    case 'SET_REFRESHING':
      return { ...state, isRefreshing: action.payload };

    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };

    case 'OPEN_COMMENTS':
      return { ...state, isCommentsOpen: true, currentCommentsVideoId: action.payload };

    case 'CLOSE_COMMENTS':
      return { ...state, isCommentsOpen: false, currentCommentsVideoId: null };

    case 'TOGGLE_SHARE_SHEET':
      return { ...state, isShareSheetOpen: action.payload };

    case 'SET_COMMENTS':
      return {
        ...state,
        comments: { ...state.comments, [action.payload.videoId]: action.payload.comments },
      };

    case 'ADD_COMMENT': {
      const { videoId, comment } = action.payload;
      const existing = state.comments[videoId] || [];
      return {
        ...state,
        comments: { ...state.comments, [videoId]: [comment, ...existing] },
      };
    }

    case 'SET_COMMENTS_LOADING':
      return {
        ...state,
        commentsLoading: { ...state.commentsLoading, [action.payload.videoId]: action.payload.loading },
      };

    case 'TOGGLE_LIKE': {
      const newLiked = new Set(state.likedVideos);
      if (newLiked.has(action.payload)) {
        newLiked.delete(action.payload);
      } else {
        newLiked.add(action.payload);
      }
      return { ...state, likedVideos: newLiked };
    }

    case 'TOGGLE_SAVE': {
      const newSaved = new Set(state.savedVideos);
      if (newSaved.has(action.payload)) {
        newSaved.delete(action.payload);
      } else {
        newSaved.add(action.payload);
      }
      return { ...state, savedVideos: newSaved };
    }

    case 'TOGGLE_FOLLOW': {
      const newFollowed = new Set(state.followedUsers);
      if (newFollowed.has(action.payload)) {
        newFollowed.delete(action.payload);
      } else {
        newFollowed.add(action.payload);
      }
      return { ...state, followedUsers: newFollowed };
    }

    case 'UPDATE_VIDEO_STATS': {
      const { videoId, field, value } = action.payload;
      const updateFeed = (feed: TikTokVideo[]) =>
        feed.map((v) =>
          v.id === videoId ? { ...v, [field]: value } : v
        );
      return {
        ...state,
        forYouFeed: updateFeed(state.forYouFeed),
        followingFeed: updateFeed(state.followingFeed),
      };
    }

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

// ============================================
// Context
// ============================================

interface TikTokContextValue {
  state: TikTokState;
  
  // Feed actions
  loadFeed: (type?: FeedType, refresh?: boolean) => Promise<void>;
  loadMoreFeed: () => Promise<void>;
  refreshFeed: () => Promise<void>;
  setFeedType: (type: FeedType) => void;
  setCurrentIndex: (index: number) => void;
  
  // Video interactions
  likeVideo: (videoId: string) => Promise<void>;
  saveVideo: (videoId: string) => Promise<void>;
  shareVideo: (videoId: string, video?: TikTokVideo) => Promise<void>;
  reportView: (videoId: string, watchTime: number, completed: boolean) => void;
  
  // User interactions
  followUser: (userId: string) => Promise<void>;
  
  // Comments
  openComments: (videoId: string) => void;
  closeComments: () => void;
  loadComments: (videoId: string) => Promise<void>;
  postComment: (videoId: string, content: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  
  // UI
  toggleMute: () => void;
  
  // Helpers
  isVideoLiked: (videoId: string) => boolean;
  isVideoSaved: (videoId: string) => boolean;
  isUserFollowed: (userId: string) => boolean;
  getCurrentVideo: () => TikTokVideo | null;
  getCurrentFeed: () => TikTokVideo[];
}

const TikTokContext = createContext<TikTokContextValue | null>(null);

// ============================================
// Provider
// ============================================

interface TikTokProviderProps {
  children: ReactNode;
}

export function TikTokProvider({ children }: TikTokProviderProps) {
  const [state, dispatch] = useReducer(tiktokReducer, initialState);

  // ============================================
  // Feed Actions
  // ============================================

  const loadFeed = useCallback(async (type: FeedType = state.currentFeedType, refresh = false) => {
    if (state.isLoadingFeed && !refresh) return;

    dispatch({ type: 'SET_LOADING_FEED', payload: true });
    if (refresh) dispatch({ type: 'SET_REFRESHING', payload: true });

    try {
      const response = await tiktokService.getVideoFeed(type, undefined, 10);
      if (response.success) {
        dispatch({
          type: 'SET_FEED',
          payload: {
            type,
            videos: response.feed.videos,
            cursor: response.feed.nextCursor,
            append: false,
          },
        });
      }
    } catch (error) {
      console.error('Error loading feed:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load feed' });
    } finally {
      dispatch({ type: 'SET_LOADING_FEED', payload: false });
      dispatch({ type: 'SET_REFRESHING', payload: false });
    }
  }, [state.currentFeedType, state.isLoadingFeed]);

  const loadMoreFeed = useCallback(async () => {
    if (state.isLoadingMore) return;

    const cursor = state.currentFeedType === 'for_you' 
      ? state.forYouCursor 
      : state.followingCursor;

    if (!cursor) return;

    dispatch({ type: 'SET_LOADING_MORE', payload: true });

    try {
      const response = await tiktokService.getVideoFeed(state.currentFeedType, cursor, 10);
      if (response.success) {
        dispatch({
          type: 'SET_FEED',
          payload: {
            type: state.currentFeedType,
            videos: response.feed.videos,
            cursor: response.feed.nextCursor,
            append: true,
          },
        });
      }
    } catch (error) {
      console.error('Error loading more feed:', error);
    } finally {
      dispatch({ type: 'SET_LOADING_MORE', payload: false });
    }
  }, [state.currentFeedType, state.forYouCursor, state.followingCursor, state.isLoadingMore]);

  const refreshFeed = useCallback(async () => {
    await loadFeed(state.currentFeedType, true);
  }, [loadFeed, state.currentFeedType]);

  const setFeedType = useCallback((type: FeedType) => {
    dispatch({ type: 'SET_FEED_TYPE', payload: type });
    // Load feed for new type if empty
    const feed = type === 'for_you' ? state.forYouFeed : state.followingFeed;
    if (feed.length === 0) {
      loadFeed(type);
    }
  }, [loadFeed, state.forYouFeed, state.followingFeed]);

  const setCurrentIndex = useCallback((index: number) => {
    dispatch({ type: 'SET_CURRENT_INDEX', payload: index });
    
    // Preload more videos when near end
    const feed = state.currentFeedType === 'for_you' ? state.forYouFeed : state.followingFeed;
    if (index >= feed.length - 3) {
      loadMoreFeed();
    }
  }, [state.currentFeedType, state.forYouFeed, state.followingFeed, loadMoreFeed]);

  // ============================================
  // Video Interactions
  // ============================================

  const likeVideo = useCallback(async (videoId: string) => {
    HapticFeedback.medium();
    dispatch({ type: 'TOGGLE_LIKE', payload: videoId });

    try {
      const response = await tiktokService.toggleLikeVideo(videoId);
      if (response.success) {
        dispatch({
          type: 'UPDATE_VIDEO_STATS',
          payload: { videoId, field: 'likesCount', value: response.likesCount },
        });
      }
    } catch (error) {
      // Revert on error
      dispatch({ type: 'TOGGLE_LIKE', payload: videoId });
      console.error('Error liking video:', error);
    }
  }, []);

  const saveVideo = useCallback(async (videoId: string) => {
    HapticFeedback.light();
    dispatch({ type: 'TOGGLE_SAVE', payload: videoId });

    try {
      await tiktokService.toggleSaveVideo(videoId);
    } catch (error) {
      // Revert on error
      dispatch({ type: 'TOGGLE_SAVE', payload: videoId });
      console.error('Error saving video:', error);
    }
  }, []);

  const shareVideo = useCallback(async (videoId: string, video?: TikTokVideo) => {
    HapticFeedback.light();
    
    try {
      const shareUrl = `https://app.example.com/video/${videoId}`;
      const shareMessage = video 
        ? `Check out this video by @${video.author.username}: ${video.caption.substring(0, 50)}...`
        : 'Check out this awesome video!';

      const result = await Share.share({
        message: shareMessage,
        url: shareUrl,
        title: 'Share Video',
      });

      if (result.action === Share.sharedAction) {
        // Track share
        await tiktokService.shareVideo(videoId, 'more');
      }
    } catch (error) {
      console.error('Error sharing video:', error);
    }
  }, []);

  const reportView = useCallback((videoId: string, watchTime: number, completed: boolean) => {
    // Fire and forget - don't wait for response
    tiktokService.reportVideoView(videoId, watchTime, completed);
  }, []);

  // ============================================
  // User Interactions
  // ============================================

  const followUser = useCallback(async (userId: string) => {
    HapticFeedback.medium();
    dispatch({ type: 'TOGGLE_FOLLOW', payload: userId });

    try {
      await tiktokService.toggleFollowUser(userId);
    } catch (error) {
      // Revert on error
      dispatch({ type: 'TOGGLE_FOLLOW', payload: userId });
      console.error('Error following user:', error);
    }
  }, []);

  // ============================================
  // Comments
  // ============================================

  const openComments = useCallback((videoId: string) => {
    dispatch({ type: 'OPEN_COMMENTS', payload: videoId });
    loadComments(videoId);
  }, []);

  const closeComments = useCallback(() => {
    dispatch({ type: 'CLOSE_COMMENTS' });
  }, []);

  const loadComments = useCallback(async (videoId: string) => {
    if (state.comments[videoId]?.length > 0) return;
    
    dispatch({ type: 'SET_COMMENTS_LOADING', payload: { videoId, loading: true } });

    try {
      const response = await tiktokService.getVideoComments(videoId);
      if (response.success) {
        dispatch({ type: 'SET_COMMENTS', payload: { videoId, comments: response.comments } });
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      dispatch({ type: 'SET_COMMENTS_LOADING', payload: { videoId, loading: false } });
    }
  }, [state.comments]);

  const postComment = useCallback(async (videoId: string, content: string) => {
    if (!content.trim()) return;

    try {
      const response = await tiktokService.postComment(videoId, content);
      if (response.success) {
        dispatch({ type: 'ADD_COMMENT', payload: { videoId, comment: response.comment } });
        HapticFeedback.success();
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      Alert.alert('Error', 'Failed to post comment');
    }
  }, []);

  const likeComment = useCallback(async (commentId: string) => {
    HapticFeedback.light();
    try {
      await tiktokService.toggleLikeComment(commentId);
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  }, []);

  // ============================================
  // UI Actions
  // ============================================

  const toggleMute = useCallback(() => {
    dispatch({ type: 'TOGGLE_MUTE' });
    HapticFeedback.light();
  }, []);

  // ============================================
  // Helpers
  // ============================================

  const isVideoLiked = useCallback((videoId: string) => {
    return state.likedVideos.has(videoId);
  }, [state.likedVideos]);

  const isVideoSaved = useCallback((videoId: string) => {
    return state.savedVideos.has(videoId);
  }, [state.savedVideos]);

  const isUserFollowed = useCallback((userId: string) => {
    return state.followedUsers.has(userId);
  }, [state.followedUsers]);

  const getCurrentVideo = useCallback(() => {
    const feed = state.currentFeedType === 'for_you' ? state.forYouFeed : state.followingFeed;
    return feed[state.currentVideoIndex] || null;
  }, [state.currentFeedType, state.forYouFeed, state.followingFeed, state.currentVideoIndex]);

  const getCurrentFeed = useCallback(() => {
    return state.currentFeedType === 'for_you' ? state.forYouFeed : state.followingFeed;
  }, [state.currentFeedType, state.forYouFeed, state.followingFeed]);

  // ============================================
  // Initial Load
  // ============================================

  useEffect(() => {
    loadFeed('for_you');
  }, []);

  // ============================================
  // Context Value
  // ============================================

  const value: TikTokContextValue = {
    state,
    loadFeed,
    loadMoreFeed,
    refreshFeed,
    setFeedType,
    setCurrentIndex,
    likeVideo,
    saveVideo,
    shareVideo,
    reportView,
    followUser,
    openComments,
    closeComments,
    loadComments,
    postComment,
    likeComment,
    toggleMute,
    isVideoLiked,
    isVideoSaved,
    isUserFollowed,
    getCurrentVideo,
    getCurrentFeed,
  };

  return (
    <TikTokContext.Provider value={value}>
      {children}
    </TikTokContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useTikTok(): TikTokContextValue {
  const context = useContext(TikTokContext);
  if (!context) {
    throw new Error('useTikTok must be used within a TikTokProvider');
  }
  return context;
}

// Export types
export type { TikTokContextValue, TikTokState };

