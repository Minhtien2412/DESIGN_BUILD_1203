/**
 * Video Interactions Context
 * Manages video likes, comments, views globally
 */

import {
    addVideoComment,
    getVideoComments,
    getVideoStats,
    shareVideo,
    toggleVideoLike,
    trackVideoView,
} from '@/services/video-interactions';
import type {
    VideoComment,
    VideoStats
} from '@/types/video-interactions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

interface VideoInteractionsContextType {
  // Like
  likeVideo: (videoId: string) => Promise<void>;
  isVideoLiked: (videoId: string) => boolean;
  getVideoLikes: (videoId: string) => number;

  // Comment
  commentVideo: (videoId: string, content: string) => Promise<void>;
  getComments: (videoId: string) => Promise<VideoComment[]>;
  commentsCache: Record<string, VideoComment[]>;
  getCommentsCount: (videoId: string) => number;

  // View
  trackView: (videoId: string, duration: number, completed: boolean) => Promise<void>;
  getVideoViews: (videoId: string) => number;
  // Derived/local view aggregates for live metrics
  getDerivedStats: (videoId: string) => VideoStats | null;

  // Share
  trackShare: (
    videoId: string,
    platform: 'facebook' | 'messenger' | 'zalo' | 'copy-link' | 'other'
  ) => Promise<void>;
  getVideoShares: (videoId: string) => number;

  // Stats
  getStats: (videoId: string) => VideoStats | null;
  refreshStats: (videoId: string) => Promise<void>;

  // Cache management
  clearCache: () => void;
}

const VideoInteractionsContext = createContext<VideoInteractionsContextType | undefined>(
  undefined
);

const STORAGE_KEY = '@video_interactions';
const DEVICE_ID_KEY = '@device_id';
const QUEUE_KEY = '@video_interactions_queue';

type PendingEvent =
  | {
      type: 'view';
      videoId: string;
      payload: { userId?: string; deviceId: string; duration: number; completed: boolean };
    }
  | {
      type: 'share';
      videoId: string;
      payload: { userId?: string; platform: 'facebook' | 'messenger' | 'zalo' | 'copy-link' | 'other' };
    };

type LocalViewAgg = {
  pendingViews: number;
  pendingWatchTime: number;
  pendingCompleted: number;
};

export const VideoInteractionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [deviceId, setDeviceId] = useState<string>('');
  
  // Local state for fast UI updates
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [commentsCache, setCommentsCache] = useState<Record<string, VideoComment[]>>({});
  const [statsCache, setStatsCache] = useState<Record<string, VideoStats>>({});
  const [localViewAgg, setLocalViewAgg] = useState<Record<string, LocalViewAgg>>({});
  const [queue, setQueue] = useState<PendingEvent[]>([]);
  const isFlushingRef = useRef(false);
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize device ID
  useEffect(() => {
    loadDeviceId();
  }, []);

  // Load interactions from storage
  useEffect(() => {
    loadInteractions();
  }, []);

  const loadDeviceId = async () => {
    try {
      let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
      if (!id) {
        id = Crypto.randomUUID();
        await AsyncStorage.setItem(DEVICE_ID_KEY, id);
      }
      setDeviceId(id);
    } catch (error) {
      console.error('[VideoInteractions] Error loading device ID:', error);
      setDeviceId(Crypto.randomUUID());
    }
  };

  const loadInteractions = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setLikedVideos(new Set(parsed.likedVideos || []));
        setCommentsCache(parsed.commentsCache || {});
        setStatsCache(parsed.statsCache || {});
        setLocalViewAgg(parsed.localViewAgg || {});
      }
      const q = await AsyncStorage.getItem(QUEUE_KEY);
      if (q) {
        setQueue(JSON.parse(q) as PendingEvent[]);
      }
    } catch (error) {
      console.error('[VideoInteractions] Error loading interactions:', error);
    }
  };

  const saveInteractions = async () => {
    try {
      const data = {
        likedVideos: Array.from(likedVideos),
        commentsCache,
        statsCache,
        localViewAgg,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('[VideoInteractions] Error saving interactions:', error);
    }
  };

  // Auto-save on changes
  useEffect(() => {
    saveInteractions();
  }, [likedVideos, commentsCache, statsCache, localViewAgg, queue]);

  // Periodically flush pending events for offline resilience
  useEffect(() => {
    const flush = async () => {
      if (isFlushingRef.current || queue.length === 0) return;
      isFlushingRef.current = true;
      try {
        const remaining: PendingEvent[] = [];
        for (const evt of queue) {
          try {
            if (evt.type === 'view') {
              const res = await trackVideoView({
                videoId: evt.videoId,
                userId: evt.payload.userId,
                deviceId: evt.payload.deviceId,
                duration: evt.payload.duration,
                completed: evt.payload.completed,
              });
              if (res.success) {
                setStatsCache((prev) => ({
                  ...prev,
                  [evt.videoId]: {
                    ...(prev[evt.videoId] || {
                      videoId: evt.videoId,
                      likes: 0,
                      comments: 0,
                      shares: 0,
                      completionRate: 0,
                      averageWatchTime: 0,
                      updatedAt: new Date().toISOString(),
                    }),
                    views: res.viewsCount,
                  },
                }));
                setLocalViewAgg((prev) => {
                  const cur = prev[evt.videoId] || { pendingViews: 0, pendingWatchTime: 0, pendingCompleted: 0 };
                  return {
                    ...prev,
                    [evt.videoId]: {
                      pendingViews: Math.max(0, cur.pendingViews - 1),
                      pendingWatchTime: Math.max(0, cur.pendingWatchTime - evt.payload.duration),
                      pendingCompleted: Math.max(0, cur.pendingCompleted - (evt.payload.completed ? 1 : 0)),
                    },
                  };
                });
              } else {
                remaining.push(evt);
              }
            } else if (evt.type === 'share') {
              const res = await shareVideo({
                videoId: evt.videoId,
                userId: evt.payload.userId,
                platform: evt.payload.platform,
              });
              if (res.success) {
                setStatsCache((prev) => ({
                  ...prev,
                  [evt.videoId]: {
                    ...(prev[evt.videoId] || {
                      videoId: evt.videoId,
                      views: 0,
                      likes: 0,
                      comments: 0,
                      completionRate: 0,
                      averageWatchTime: 0,
                      updatedAt: new Date().toISOString(),
                    }),
                    shares: res.sharesCount,
                  },
                }));
              } else {
                remaining.push(evt);
              }
            }
          } catch (e) {
            remaining.push(evt);
          }
        }
        if (remaining.length !== queue.length) setQueue(remaining);
      } finally {
        isFlushingRef.current = false;
      }
    };

    flushTimerRef.current = setInterval(flush, 10000);
    return () => {
      if (flushTimerRef.current) clearInterval(flushTimerRef.current);
    };
  }, [queue]);

  /**
   * Like/Unlike video
   */
  const likeVideo = useCallback(
    async (videoId: string) => {
      if (!user) {
        console.warn('[VideoInteractions] User not logged in');
        return;
      }

      const isLiked = likedVideos.has(videoId);
      
      // Optimistic update
      setLikedVideos((prev) => {
        const next = new Set(prev);
        if (isLiked) {
          next.delete(videoId);
        } else {
          next.add(videoId);
        }
        return next;
      });

      // Update stats cache optimistically
      setStatsCache((prev) => {
        const stats = prev[videoId];
        if (stats) {
          return {
            ...prev,
            [videoId]: {
              ...stats,
              likes: stats.likes + (isLiked ? -1 : 1),
            },
          };
        }
        return prev;
      });

      try {
        const response = await toggleVideoLike({
          videoId,
          userId: user.id,
        });

        // Update with server response
        if (response.success) {
          setStatsCache((prev) => ({
            ...prev,
            [videoId]: {
              ...(prev[videoId] || {
                videoId,
                views: 0,
                comments: 0,
                shares: 0,
                completionRate: 0,
                averageWatchTime: 0,
                updatedAt: new Date().toISOString(),
              }),
              likes: response.likesCount,
            },
          }));
        }
      } catch (error) {
        console.error('[VideoInteractions] Error liking video:', error);
        // Revert optimistic update
        setLikedVideos((prev) => {
          const next = new Set(prev);
          if (isLiked) {
            next.add(videoId);
          } else {
            next.delete(videoId);
          }
          return next;
        });
      }
    },
    [user, likedVideos]
  );

  const isVideoLiked = useCallback(
    (videoId: string) => {
      return likedVideos.has(videoId);
    },
    [likedVideos]
  );

  const getVideoLikes = useCallback(
    (videoId: string) => {
      return statsCache[videoId]?.likes || 0;
    },
    [statsCache]
  );

  /**
   * Comment on video
   */
  const commentVideo = useCallback(
    async (videoId: string, content: string) => {
      if (!user) {
        throw new Error('User not logged in');
      }

      const response = await addVideoComment({
        videoId,
        userId: user.id,
        userName: user.email || 'User',
        userAvatar: undefined,
        content,
      });

      if (response.success) {
        // Add to cache
        setCommentsCache((prev) => ({
          ...prev,
          [videoId]: [response.comment, ...(prev[videoId] || [])],
        }));

        // Update stats
        setStatsCache((prev) => ({
          ...prev,
          [videoId]: {
            ...(prev[videoId] || {
              videoId,
              views: 0,
              likes: 0,
              shares: 0,
              completionRate: 0,
              averageWatchTime: 0,
              updatedAt: new Date().toISOString(),
            }),
            comments: response.commentsCount,
          },
        }));
      }
    },
    [user]
  );

  const getComments = useCallback(
    async (videoId: string): Promise<VideoComment[]> => {
      // Return cached if available
      if (commentsCache[videoId]) {
        return commentsCache[videoId];
      }

      // Fetch from API
      const response = await getVideoComments({ videoId, limit: 50 });
      if (response.success) {
        setCommentsCache((prev) => ({
          ...prev,
          [videoId]: response.comments,
        }));
        return response.comments;
      }

      return [];
    },
    [commentsCache]
  );

  const getCommentsCount = useCallback(
    (videoId: string) => {
      return statsCache[videoId]?.comments || commentsCache[videoId]?.length || 0;
    },
    [statsCache, commentsCache]
  );

  /**
   * Track view
   */
  const trackView = useCallback(
    async (videoId: string, duration: number, completed: boolean) => {
      if (!deviceId) return;

      try {
        // Optimistic local aggregation
        setLocalViewAgg((prev) => {
          const cur = prev[videoId] || { pendingViews: 0, pendingWatchTime: 0, pendingCompleted: 0 };
          return {
            ...prev,
            [videoId]: {
              pendingViews: cur.pendingViews + 1,
              pendingWatchTime: cur.pendingWatchTime + duration,
              pendingCompleted: cur.pendingCompleted + (completed ? 1 : 0),
            },
          };
        });

        const response = await trackVideoView({
          videoId,
          userId: user?.id,
          deviceId,
          duration,
          completed,
        });

        if (response.success) {
          setStatsCache((prev) => ({
            ...prev,
            [videoId]: {
              ...(prev[videoId] || {
                videoId,
                likes: 0,
                comments: 0,
                shares: 0,
                completionRate: 0,
                averageWatchTime: 0,
                updatedAt: new Date().toISOString(),
              }),
              views: response.viewsCount,
            },
          }));
          // Decrement one pending view now that server confirmed it
          setLocalViewAgg((prev) => {
            const cur = prev[videoId] || { pendingViews: 0, pendingWatchTime: 0, pendingCompleted: 0 };
            return {
              ...prev,
              [videoId]: {
                pendingViews: Math.max(0, cur.pendingViews - 1),
                pendingWatchTime: Math.max(0, cur.pendingWatchTime - duration),
                pendingCompleted: Math.max(0, cur.pendingCompleted - (completed ? 1 : 0)),
              },
            };
          });
        }
      } catch (error) {
        console.error('[VideoInteractions] Error tracking view:', error);
        // Enqueue for retry later
        setQueue((prev) => [
          ...prev,
          { type: 'view', videoId, payload: { userId: user?.id, deviceId, duration, completed } },
        ]);
      }
    },
    [user, deviceId]
  );

  const getVideoViews = useCallback(
    (videoId: string) => {
      const base = statsCache[videoId]?.views || 0;
      const pending = localViewAgg[videoId]?.pendingViews || 0;
      return base + pending;
    },
    [statsCache, localViewAgg]
  );

  /**
   * Track share
   */
  const trackShare = useCallback(
    async (
      videoId: string,
      platform: 'facebook' | 'messenger' | 'zalo' | 'copy-link' | 'other'
    ) => {
      try {
        const response = await shareVideo({
          videoId,
          userId: user?.id,
          platform,
        });

        if (response.success) {
          setStatsCache((prev) => ({
            ...prev,
            [videoId]: {
              ...(prev[videoId] || {
                videoId,
                views: 0,
                likes: 0,
                comments: 0,
                completionRate: 0,
                averageWatchTime: 0,
                updatedAt: new Date().toISOString(),
              }),
              shares: response.sharesCount,
            },
          }));
        }
      } catch (error) {
        console.error('[VideoInteractions] Error tracking share:', error);
        // Enqueue share event for retry later
        setQueue((prev) => [
          ...prev,
          { type: 'share', videoId, payload: { userId: user?.id, platform } },
        ]);
      }
    },
    [user]
  );

  const getVideoShares = useCallback(
    (videoId: string) => {
      return statsCache[videoId]?.shares || 0;
    },
    [statsCache]
  );

  /**
   * Get stats
   */
  const getStats = useCallback(
    (videoId: string) => {
      return statsCache[videoId] || null;
    },
    [statsCache]
  );

  const getDerivedStats = useCallback(
    (videoId: string) => {
      const base = statsCache[videoId];
      const agg = localViewAgg[videoId];
      if (!base && !agg) return null;

      const serverViews = base?.views || 0;
      const serverAvgWT = base?.averageWatchTime || 0;
      const serverCompletionRate = base?.completionRate || 0; // percent
      const serverCompletionsApprox = Math.round((serverViews * serverCompletionRate) / 100);

      const pendingViews = agg?.pendingViews || 0;
      const pendingWT = agg?.pendingWatchTime || 0;
      const pendingCompletions = agg?.pendingCompleted || 0;

      const totalViews = serverViews + pendingViews;
      const totalCompletions = serverCompletionsApprox + pendingCompletions;
      const totalWT = serverViews * serverAvgWT + pendingWT;

      const avgWT = totalViews > 0 ? totalWT / totalViews : 0;
      const completionRate = totalViews > 0 ? (totalCompletions / totalViews) * 100 : 0;

      return {
        videoId,
        views: totalViews,
        likes: base?.likes || 0,
        comments: base?.comments || 0,
        shares: base?.shares || 0,
        completionRate,
        averageWatchTime: avgWT,
        updatedAt: new Date().toISOString(),
      } as VideoStats;
    },
    [statsCache, localViewAgg]
  );

  const refreshStats = useCallback(async (videoId: string) => {
    const stats = await getVideoStats(videoId);
    if (stats) {
      setStatsCache((prev) => ({
        ...prev,
        [videoId]: stats,
      }));
    }
  }, []);

  /**
   * Clear cache
   */
  const clearCache = useCallback(() => {
    setLikedVideos(new Set());
    setCommentsCache({});
    setStatsCache({});
    AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const value: VideoInteractionsContextType = {
    likeVideo,
    isVideoLiked,
    getVideoLikes,
    commentVideo,
    getComments,
    commentsCache,
    getCommentsCount,
    trackView,
    getVideoViews,
  getDerivedStats,
    trackShare,
    getVideoShares,
    getStats,
    refreshStats,
    clearCache,
  };

  return (
    <VideoInteractionsContext.Provider value={value}>
      {children}
    </VideoInteractionsContext.Provider>
  );
};

export const useVideoInteractions = () => {
  const context = useContext(VideoInteractionsContext);
  if (!context) {
    throw new Error('useVideoInteractions must be used within VideoInteractionsProvider');
  }
  return context;
};

// Convenience hook to consume merged, live-updating stats in UI components
export const useVideoStats = (videoId: string): VideoStats | null => {
  const { getDerivedStats } = useVideoInteractions();
  const [stats, setStats] = useState<VideoStats | null>(() => getDerivedStats(videoId));

  useEffect(() => {
    setStats(getDerivedStats(videoId));
  }, [getDerivedStats, videoId]);

  return stats;
};
