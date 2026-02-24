/**
 * useMessages Hook
 * React hook for managing messages and conversations
 * Handles fetching, sending, and real-time updates
 * Integrated with UnifiedBadgeContext for badge sync
 * Updated: 24/01/2026
 */

/* eslint-disable react-hooks/rules-of-hooks -- Context may not be available, using safe wrapper pattern */

import { useUnifiedBadge } from "@/context/UnifiedBadgeContext";
import { useCallback, useEffect, useState } from "react";
import messagesApi, {
    Conversation,
    Message,
    MessageQueryParams,
    SendMessageDto,
} from "../services/api/messagesApi";

// Safe wrapper for optional context access
function useSafeUnifiedBadge(): ReturnType<typeof useUnifiedBadge> | null {
  try {
    return useUnifiedBadge();
  } catch {
    return null;
  }
}

// ==================== TYPES ====================

interface UseMessagesResult {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  refreshConversations: () => Promise<void>;
  getUnreadCount: () => Promise<void>;
  markConversationAsRead: (conversationId: number) => Promise<void>;
}

interface UseConversationResult {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sending: boolean;
  hasMore: boolean;
  conversationId: number | null;
  sendMessage: (content: string) => Promise<void>;
  loadMore: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

// ==================== HOOKS ====================

/**
 * Hook for managing conversations list
 * Usage: const { conversations, loading, refreshConversations } = useMessages();
 */
export function useMessages(): UseMessagesResult {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Badge context for syncing with unified badges (may be null if context not available)
  const badgeContext = useSafeUnifiedBadge();

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await messagesApi.getConversations();
      setConversations(data);

      // Calculate and sync unread count
      const totalUnread = data.reduce(
        (sum, conv) => sum + (conv.unreadCount || 0),
        0,
      );
      setUnreadCount(totalUnread);

      // Sync with badge context
      if (badgeContext) {
        badgeContext.setBadgeCount("messages", totalUnread);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load conversations",
      );
      console.error("[useMessages] Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove badgeContext from deps to prevent infinite loop

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await messagesApi.getUnreadCount();
      setUnreadCount(data.count);

      // Sync with badge context
      if (badgeContext) {
        badgeContext.setBadgeCount("messages", data.count);
      }
    } catch (err) {
      console.error("[useMessages] Error fetching unread count:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove badgeContext from deps to prevent infinite loop

  // Mark conversation as read and update badges
  const markConversationAsRead = useCallback(
    async (conversationId: number) => {
      try {
        await messagesApi.markAllAsRead(conversationId);

        // Update local conversation state
        setConversations((prev) => {
          const updated = prev.map((conv) =>
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv,
          );

          // Recalculate total unread
          const totalUnread = updated.reduce(
            (sum, conv) => sum + (conv.unreadCount || 0),
            0,
          );
          setUnreadCount(totalUnread);

          // Sync with badge context
          if (badgeContext) {
            badgeContext.setBadgeCount("messages", totalUnread);
            badgeContext.markMessageAsRead(String(conversationId));
          }

          return updated;
        });

        console.log(
          "[useMessages] Marked conversation as read:",
          conversationId,
        );
      } catch (err) {
        console.error("[useMessages] Error marking as read:", err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // Remove badgeContext from deps
  );

  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
  }, [fetchConversations, fetchUnreadCount]);

  return {
    conversations,
    loading,
    error,
    unreadCount,
    refreshConversations: fetchConversations,
    getUnreadCount: fetchUnreadCount,
    markConversationAsRead,
  };
}

/**
 * Hook for managing a single conversation
 * Usage: const { messages, sendMessage, loading } = useConversation(conversationId, recipientId);
 *
 * If conversationId is null, will auto-fetch from recipientId
 */
export function useConversation(
  initialConversationId: number | null,
  recipientId: number,
): UseConversationResult {
  const [conversationId, setConversationId] = useState<number | null>(
    initialConversationId,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  // Badge context for syncing (may be null if context not available)
  const badgeContext = useSafeUnifiedBadge();

  // Auto-fetch conversation ID from recipientId if not provided
  const fetchConversationId = useCallback(async () => {
    if (initialConversationId) {
      setConversationId(initialConversationId);
      return initialConversationId;
    }

    if (!recipientId) {
      setLoading(false);
      return null;
    }

    try {
      console.log(
        "[useConversation] Fetching conversation for recipientId:",
        recipientId,
      );
      const conversation =
        await messagesApi.getConversationByRecipient(recipientId);

      if (conversation) {
        console.log("[useConversation] Found conversation:", conversation.id);
        setConversationId(conversation.id);
        return conversation.id;
      }

      console.log("[useConversation] No existing conversation found");
      return null;
    } catch (err) {
      console.error("[useConversation] Error fetching conversation ID:", err);
      return null;
    }
  }, [initialConversationId, recipientId]);

  const fetchMessages = useCallback(
    async (convId: number | null, resetPage = false) => {
      if (!convId) {
        setMessages([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const params: MessageQueryParams = {
          page: resetPage ? 1 : page,
          limit: 50,
        };

        const data = await messagesApi.getMessages(convId, params);

        if (resetPage) {
          setMessages(data);
          setPage(1);
        } else {
          setMessages((prev) => [...prev, ...data]);
        }

        setHasMore(data.length === 50);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load messages",
        );
        console.error("[useConversation] Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    },
    [page],
  );

  const sendMessageHandler = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      try {
        setSending(true);
        setError(null);

        const dto: SendMessageDto = {
          recipientId,
          conversationId: conversationId ?? undefined,
          content: content.trim(),
        };

        const newMessage = await messagesApi.sendMessage(dto);

        // Update conversationId if not set (new conversation created)
        if (!conversationId && newMessage.conversationId) {
          setConversationId(newMessage.conversationId);
        }

        // Add new message to end of list (messages display chronologically)
        setMessages((prev) => [...prev, newMessage]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
        console.error("[useConversation] Error sending message:", err);
        throw err; // Re-throw so UI can handle
      } finally {
        setSending(false);
      }
    },
    [recipientId, conversationId],
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    setPage((prev) => prev + 1);
  }, [hasMore, loading]);

  const markAllAsReadHandler = useCallback(async () => {
    if (!conversationId) return;

    try {
      await messagesApi.markAllAsRead(conversationId);
      // Update local state to mark all as read
      setMessages((prev) => prev.map((msg) => ({ ...msg, isRead: true })));

      // Sync with badge context - decrement messages badge
      if (badgeContext) {
        badgeContext.markMessageAsRead(String(conversationId));
        // Refresh all badges to get accurate count
        badgeContext.refreshAllBadges();
      }

      console.log(
        "[useConversation] Marked all messages as read, badge synced",
      );
    } catch (err) {
      console.error("[useConversation] Error marking as read:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]); // Remove badgeContext from deps

  const refresh = useCallback(async () => {
    const convId = await fetchConversationId();
    if (convId) {
      await fetchMessages(convId, true);
    }
  }, [fetchConversationId, fetchMessages]);

  // Initial load: first get conversationId, then fetch messages
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const convId = await fetchConversationId();
      if (isMounted && convId) {
        await fetchMessages(convId, true);
      } else if (isMounted) {
        setLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [recipientId, initialConversationId]); // Re-fetch when recipient changes

  useEffect(() => {
    if (page > 1 && conversationId) {
      fetchMessages(conversationId, false);
    }
  }, [page, conversationId]); // Load more when page changes

  return {
    messages,
    loading,
    error,
    sending,
    hasMore,
    conversationId,
    sendMessage: sendMessageHandler,
    loadMore,
    markAllAsRead: markAllAsReadHandler,
    refresh,
  };
}

// ==================== EXPORTS ====================

export default useMessages;
