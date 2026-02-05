/**
 * useReactions Hook
 *
 * React hook for managing reactions on content.
 * Features:
 * - Optimistic UI updates
 * - Real-time sync via WebSocket
 * - Error handling & retry
 *
 * Usage:
 * ```tsx
 * const { summary, toggleReaction, isLoading } = useReactions('video', videoId);
 *
 * <TouchableOpacity onPress={() => toggleReaction('love')}>
 *   <Text>{summary?.userReaction === 'love' ? '❤️' : '🤍'}</Text>
 *   <Text>{summary?.counts.love || 0}</Text>
 * </TouchableOpacity>
 * ```
 *
 * @author AI Assistant
 * @date 27/01/2026
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    toggleReaction as apiToggleReaction,
    getReactionSummary,
    REACTION_EMOJIS,
    REACTION_LABELS,
    ReactionEvent,
    reactionsSocket,
    ReactionSummary,
    ReactionType,
} from "../services/reactions.service";

interface UseReactionsOptions {
  /** Enable real-time updates via WebSocket */
  realtime?: boolean;
  /** Auto-fetch summary on mount */
  autoFetch?: boolean;
}

interface UseReactionsReturn {
  /** Current reaction summary */
  summary: ReactionSummary | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Toggle reaction (optimistic update) */
  toggleReaction: (type: ReactionType) => Promise<void>;
  /** Refresh summary from server */
  refresh: () => Promise<void>;
  /** Check if user has reacted with specific type */
  hasReacted: (type: ReactionType) => boolean;
  /** Get emoji for reaction type */
  getEmoji: (type: ReactionType) => string;
  /** Get label for reaction type */
  getLabel: (type: ReactionType) => string;
}

export function useReactions(
  contentType: string,
  contentId: number,
  options: UseReactionsOptions = {},
): UseReactionsReturn {
  const { realtime = true, autoFetch = true } = options;

  const { user } = useAuth();
  const [summary, setSummary] = useState<ReactionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track pending optimistic update
  const pendingRef = useRef<{
    previousSummary: ReactionSummary | null;
    type: ReactionType;
  } | null>(null);

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    if (!contentId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await getReactionSummary(contentType, contentId);
      if (result) {
        setSummary(result);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch reactions",
      );
    } finally {
      setIsLoading(false);
    }
  }, [contentType, contentId]);

  // Toggle reaction with optimistic update
  const toggleReaction = useCallback(
    async (type: ReactionType) => {
      if (!user) {
        setError("Please login to react");
        return;
      }

      // Store previous state for rollback
      pendingRef.current = {
        previousSummary: summary,
        type,
      };

      // Optimistic update
      setSummary((prev) => {
        if (!prev) {
          return {
            counts: {
              total: 1,
              like: type === "like" ? 1 : 0,
              love: type === "love" ? 1 : 0,
              haha: type === "haha" ? 1 : 0,
              wow: type === "wow" ? 1 : 0,
              sad: type === "sad" ? 1 : 0,
              angry: type === "angry" ? 1 : 0,
            },
            topReactions: [type],
            userReaction: type,
          };
        }

        const newCounts = { ...prev.counts };
        let newUserReaction: ReactionType | null = type;

        if (prev.userReaction === type) {
          // Remove reaction
          newCounts[type] = Math.max(0, newCounts[type] - 1);
          newCounts.total = Math.max(0, newCounts.total - 1);
          newUserReaction = null;
        } else {
          // Add/change reaction
          if (prev.userReaction) {
            newCounts[prev.userReaction] = Math.max(
              0,
              newCounts[prev.userReaction] - 1,
            );
          } else {
            newCounts.total++;
          }
          newCounts[type]++;
        }

        // Recalculate top reactions
        const types: ReactionType[] = [
          "like",
          "love",
          "haha",
          "wow",
          "sad",
          "angry",
        ];
        const topReactions = types
          .filter((t) => newCounts[t] > 0)
          .sort((a, b) => newCounts[b] - newCounts[a])
          .slice(0, 3);

        return {
          counts: newCounts,
          topReactions,
          userReaction: newUserReaction,
        };
      });

      // API call
      try {
        const result = await apiToggleReaction(contentType, contentId, type);

        if (!result.success) {
          // Rollback on error
          if (pendingRef.current) {
            setSummary(pendingRef.current.previousSummary);
          }
          setError(result.error || "Failed to update reaction");
        } else if (result.counts) {
          // Update with server response
          setSummary((prev) => ({
            counts: result.counts!,
            topReactions: prev?.topReactions || [],
            userReaction:
              result.action === "removed"
                ? null
                : result.currentType || prev?.userReaction || null,
          }));
        }
      } catch (err) {
        // Rollback on error
        if (pendingRef.current) {
          setSummary(pendingRef.current.previousSummary);
        }
        setError(
          err instanceof Error ? err.message : "Failed to update reaction",
        );
      } finally {
        pendingRef.current = null;
      }
    },
    [user, summary, contentType, contentId],
  );

  // Handle real-time events
  const handleReactionEvent = useCallback(
    (event: ReactionEvent) => {
      // Skip if this is our own action (already handled optimistically)
      if (event.userId === Number(user?.id)) return;

      setSummary((prev) => ({
        counts: event.counts,
        topReactions: prev?.topReactions || [],
        userReaction: prev?.userReaction || null,
      }));
    },
    [user?.id],
  );

  // Setup real-time subscription
  useEffect(() => {
    if (!realtime || !contentId) return;

    // Connect socket if needed
    if (!reactionsSocket.connected) {
      reactionsSocket.connect(
        Number(user?.id) || undefined,
        user?.name || undefined,
      );
    }

    // Subscribe to content
    reactionsSocket.subscribe(contentType, contentId);

    // Add event handler
    const unsubscribe = reactionsSocket.onReaction(
      contentType,
      contentId,
      handleReactionEvent,
    );

    return () => {
      unsubscribe();
      reactionsSocket.unsubscribe(contentType, contentId);
    };
  }, [
    realtime,
    contentType,
    contentId,
    user?.id,
    user?.name,
    handleReactionEvent,
  ]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && contentId) {
      fetchSummary();
    }
  }, [autoFetch, contentId, fetchSummary]);

  // Helper functions
  const hasReacted = useCallback(
    (type: ReactionType) => summary?.userReaction === type,
    [summary?.userReaction],
  );

  const getEmoji = useCallback(
    (type: ReactionType) => REACTION_EMOJIS[type] || "👍",
    [],
  );

  const getLabel = useCallback(
    (type: ReactionType) => REACTION_LABELS[type] || type,
    [],
  );

  return {
    summary,
    isLoading,
    error,
    toggleReaction,
    refresh: fetchSummary,
    hasReacted,
    getEmoji,
    getLabel,
  };
}

export default useReactions;
