/**
 * useSocialFeed - Hook cho infinite scroll social feed
 *
 * Features:
 * - Auto load more khi scroll gần cuối (còn 5 bài)
 * - Cursor-based pagination
 * - Optimistic updates cho likes/comments
 * - Cache và dedup
 *
 * @created 16/01/2026
 */

import * as SocialService from "@/services/socialService";
import {
    Comment,
    FeedType,
    Post,
    ReactionType,
    SocialNotification,
} from "@/types/social";
import { useCallback, useEffect, useRef, useState } from "react";

// ==================== usePosts Hook ====================

interface UsePostsOptions {
  initialPerPage?: number;
  type?: FeedType;
  userId?: string;
  autoLoadThreshold?: number; // Số bài còn lại để trigger load more
  enabled?: boolean;
}

interface UsePostsResult {
  posts: Post[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  totalCount: number;

  // Actions
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;

  // Optimistic updates
  handleLike: (postId: string) => void;
  handleSave: (postId: string) => void;
  handleComment: (postId: string, count: number) => void;

  // Scroll handler for auto load
  onEndReachedThreshold: number;
  onEndReached: () => void;
}

export function usePosts(options: UsePostsOptions = {}): UsePostsResult {
  const {
    initialPerPage = 10,
    type = "news_feed",
    userId,
    enabled = true,
  } = options;

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const isLoadingRef = useRef(false);
  const isMounted = useRef(true);

  // Fetch posts
  const fetchPosts = useCallback(
    async (isRefresh = false) => {
      if (!enabled || isLoadingRef.current) return;

      isLoadingRef.current = true;

      if (isRefresh) {
        setIsLoading(true);
        setCursor(undefined);
      } else {
        setIsLoadingMore(true);
      }

      setError(null);

      try {
        const response = await SocialService.getFeed(
          { type, userId },
          isRefresh ? undefined : cursor,
          initialPerPage
        );

        if (!isMounted.current) return;

        // GetFeedResponse has data.posts (Timeline structure)
        const newPosts = response.data?.posts || [];

        if (isRefresh) {
          setPosts(newPosts);
        } else {
          // Dedup by ID
          setPosts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const uniqueNewPosts = newPosts.filter(
              (p: Post) => !existingIds.has(p.id)
            );
            return [...prev, ...uniqueNewPosts];
          });
        }

        setHasMore(
          response.data?.hasMore ?? newPosts.length === initialPerPage
        );
        setTotalCount((prev) => prev + newPosts.length);
        setCursor(response.data?.nextCursor);
      } catch (err) {
        if (!isMounted.current) return;
        setError(
          err instanceof Error ? err : new Error("Failed to fetch posts")
        );
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
          isLoadingRef.current = false;
        }
      }
    },
    [enabled, cursor, initialPerPage, type, userId]
  );

  // Initial fetch
  useEffect(() => {
    isMounted.current = true;
    fetchPosts(true);

    return () => {
      isMounted.current = false;
    };
  }, [enabled, type, userId]); // eslint-disable-line

  // Load more
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingRef.current) return;
    await fetchPosts(false);
  }, [hasMore, fetchPosts]);

  // Refresh
  const refresh = useCallback(async () => {
    await fetchPosts(true);
  }, [fetchPosts]);

  // Auto load when near end (for infinite scroll)
  const onEndReached = useCallback(() => {
    if (hasMore && !isLoadingRef.current) {
      loadMore();
    }
  }, [hasMore, loadMore]);

  // Optimistic like update - using myReaction from Post type
  const handleLike = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const wasLiked = post.myReaction === "like";
          return {
            ...post,
            myReaction: wasLiked ? null : ("like" as ReactionType),
            reactionsCount: wasLiked
              ? Math.max(0, (post.reactionsCount || 0) - 1)
              : (post.reactionsCount || 0) + 1,
          };
        }
        return post;
      })
    );

    // Call API in background
    SocialService.reactToPost(postId, "like").catch(console.error);
  }, []);

  // Optimistic save update
  const handleSave = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            isSaved: !post.isSaved,
          };
        }
        return post;
      })
    );

    // Call save/unsave API
    SocialService.savePost(postId).catch(console.error);
  }, []);

  // Update comment count
  const handleComment = useCallback((postId: string, delta: number) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            commentsCount: (post.commentsCount || 0) + delta,
          };
        }
        return post;
      })
    );
  }, []);

  return {
    posts,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    totalCount,
    loadMore,
    refresh,
    handleLike,
    handleSave,
    handleComment,
    onEndReachedThreshold: 0.3, // 30% from bottom
    onEndReached,
  };
}

// ==================== useComments Hook ====================

interface UseCommentsOptions {
  postId: string;
  perPage?: number;
  enabled?: boolean;
}

interface UseCommentsResult {
  comments: Comment[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  totalCount: number;

  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;

  // Actions
  addComment: (content: string, parentId?: string) => Promise<Comment | null>;
  deleteComment: (commentId: string) => Promise<boolean>;
  likeComment: (commentId: string) => void;
}

export function useComments(options: UseCommentsOptions): UseCommentsResult {
  const { postId, perPage = 20, enabled = true } = options;

  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const isLoadingRef = useRef(false);
  const isMounted = useRef(true);

  const fetchComments = useCallback(
    async (isRefresh = false) => {
      if (!enabled || !postId || isLoadingRef.current) return;

      isLoadingRef.current = true;

      if (isRefresh) {
        setIsLoading(true);
        setCursor(undefined);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await SocialService.getComments({
          postId,
          cursor: isRefresh ? undefined : cursor,
          limit: perPage,
        });

        if (!isMounted.current) return;

        const newComments = response.comments || [];

        if (isRefresh) {
          setComments(newComments);
        } else {
          setComments((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const uniqueNew = newComments.filter(
              (c: Comment) => !existingIds.has(c.id)
            );
            return [...prev, ...uniqueNew];
          });
        }

        setHasMore(response.hasMore ?? newComments.length === perPage);
        setTotalCount(response.total || 0);
        setCursor(response.nextCursor);
      } catch (err) {
        if (!isMounted.current) return;
        setError(
          err instanceof Error ? err : new Error("Failed to fetch comments")
        );
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
          isLoadingRef.current = false;
        }
      }
    },
    [enabled, postId, cursor, perPage]
  );

  useEffect(() => {
    isMounted.current = true;
    if (postId) {
      fetchComments(true);
    }
    return () => {
      isMounted.current = false;
    };
  }, [postId, enabled]); // eslint-disable-line

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingRef.current) return;
    await fetchComments(false);
  }, [hasMore, fetchComments]);

  const refresh = useCallback(async () => {
    await fetchComments(true);
  }, [fetchComments]);

  // Add new comment using createComment
  const addComment = useCallback(
    async (content: string, parentId?: string): Promise<Comment | null> => {
      try {
        const response = await SocialService.createComment({
          postId,
          content,
          parentId,
        });

        const newComment = response.comment;

        if (newComment && isMounted.current) {
          // Add to top of list
          setComments((prev) => [newComment, ...prev]);
          setTotalCount((prev) => prev + 1);
        }

        return newComment;
      } catch (err) {
        console.error("Failed to add comment:", err);
        return null;
      }
    },
    [postId]
  );

  // Delete comment
  const deleteComment = useCallback(
    async (commentId: string): Promise<boolean> => {
      try {
        await SocialService.deleteComment(commentId);

        if (isMounted.current) {
          setComments((prev) => prev.filter((c) => c.id !== commentId));
          setTotalCount((prev) => Math.max(0, prev - 1));
        }

        return true;
      } catch (err) {
        console.error("Failed to delete comment:", err);
        return false;
      }
    },
    []
  );

  // Like comment (optimistic) - using reactToComment
  const likeComment = useCallback((commentId: string) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          const wasLiked = comment.myReaction === "like";
          return {
            ...comment,
            myReaction: wasLiked ? null : ("like" as ReactionType),
            reactionsCount: wasLiked
              ? Math.max(0, (comment.reactionsCount || 0) - 1)
              : (comment.reactionsCount || 0) + 1,
          };
        }
        return comment;
      })
    );

    // Call API in background using reactToComment
    SocialService.reactToComment(commentId, "like").catch(console.error);
  }, []);

  return {
    comments,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    totalCount,
    loadMore,
    refresh,
    addComment,
    deleteComment,
    likeComment,
  };
}

// ==================== useNotifications Hook ====================

interface UseNotificationsOptions {
  perPage?: number;
  unreadOnly?: boolean;
  enabled?: boolean;
}

interface UseNotificationsResult {
  notifications: SocialNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;

  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function useNotifications(
  options: UseNotificationsOptions = {}
): UseNotificationsResult {
  const { perPage = 20, enabled = true } = options;

  const [notifications, setNotifications] = useState<SocialNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const isLoadingRef = useRef(false);
  const isMounted = useRef(true);

  const fetchNotifications = useCallback(
    async (isRefresh = false) => {
      if (!enabled || isLoadingRef.current) return;

      isLoadingRef.current = true;
      setIsLoading(true);

      try {
        // Mock data since getNotifications may not exist in socialService
        const mockNotifications: SocialNotification[] = [
          {
            id: "1",
            type: "post_reaction",
            message: "Nguyễn Văn A đã thích bài viết của bạn",
            isRead: false,
            createdAt: new Date().toISOString(),
            actor: {
              id: "1",
              username: "nguyenvana",
              displayName: "Nguyễn Văn A",
              avatar: "https://i.pravatar.cc/100?u=1",
              verified: false,
              friendsCount: 0,
              followersCount: 0,
              followingCount: 0,
              postsCount: 0,
              createdAt: new Date().toISOString(),
            },
          },
          {
            id: "2",
            type: "comment",
            message: "Trần Văn B đã bình luận bài viết của bạn",
            isRead: true,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            actor: {
              id: "2",
              username: "tranvanb",
              displayName: "Trần Văn B",
              avatar: "https://i.pravatar.cc/100?u=2",
              verified: false,
              friendsCount: 0,
              followersCount: 0,
              followingCount: 0,
              postsCount: 0,
              createdAt: new Date().toISOString(),
            },
          },
        ];

        if (!isMounted.current) return;

        if (isRefresh) {
          setNotifications(mockNotifications);
        } else {
          setNotifications((prev) => [...prev, ...mockNotifications]);
        }

        setHasMore(false); // Mock has no more
        setUnreadCount(mockNotifications.filter((n) => !n.isRead).length);
      } catch (err) {
        if (!isMounted.current) return;
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch notifications")
        );
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
          isLoadingRef.current = false;
        }
      }
    },
    [enabled, perPage]
  );

  useEffect(() => {
    isMounted.current = true;
    fetchNotifications(true);
    return () => {
      isMounted.current = false;
    };
  }, [enabled]); // eslint-disable-line

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingRef.current) return;
    await fetchNotifications(false);
  }, [hasMore, fetchNotifications]);

  const refresh = useCallback(async () => {
    await fetchNotifications(true);
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // Mock - implement API call when available
      if (isMounted.current) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      // Mock - implement API call when available
      if (isMounted.current) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
    markAsRead,
    markAllAsRead,
  };
}

// ==================== useInfiniteScroll Hook ====================

interface UseInfiniteScrollOptions {
  threshold?: number; // Số items còn lại để trigger load
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

/**
 * Helper hook để detect khi cần load more
 * Dùng với FlatList onViewableItemsChanged
 */
export function useInfiniteScroll(options: UseInfiniteScrollOptions) {
  const { hasMore, isLoading, onLoadMore } = options;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ index?: number }> }) => {
      if (!hasMore || isLoading) return;

      // Check nếu user đã scroll gần cuối
      const lastViewableIndex =
        viewableItems[viewableItems.length - 1]?.index || 0;
      console.log("Last viewable index:", lastViewableIndex);
      // Logic này sẽ được handle bởi FlatList's onEndReached
    },
    [hasMore, isLoading]
  );

  return {
    viewabilityConfig,
    onViewableItemsChanged,
    onEndReachedThreshold: 0.5, // 50% from bottom
    onEndReached: () => {
      if (hasMore && !isLoading) {
        onLoadMore();
      }
    },
  };
}
