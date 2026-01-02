/**
 * useMessages Hook
 * React hook for managing messages and conversations
 * Handles fetching, sending, and real-time updates
 */

import { useCallback, useEffect, useState } from 'react';
import messagesApi, {
    Conversation,
    Message,
    MessageQueryParams,
    SendMessageDto
} from '../services/api/messagesApi';

// ==================== TYPES ====================

interface UseMessagesResult {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  refreshConversations: () => Promise<void>;
  getUnreadCount: () => Promise<void>;
}

interface UseConversationResult {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sending: boolean;
  hasMore: boolean;
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

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await messagesApi.getConversations();
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
      console.error('[useMessages] Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await messagesApi.getUnreadCount();
      setUnreadCount(data.count);
    } catch (err) {
      console.error('[useMessages] Error fetching unread count:', err);
    }
  }, []);

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
    getUnreadCount: fetchUnreadCount
  };
}

/**
 * Hook for managing a single conversation
 * Usage: const { messages, sendMessage, loading } = useConversation(conversationId, recipientId);
 */
export function useConversation(
  conversationId: number | null,
  recipientId: number
): UseConversationResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const fetchMessages = useCallback(async (resetPage = false) => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const params: MessageQueryParams = {
        page: resetPage ? 1 : page,
        limit: 50
      };

      const data = await messagesApi.getMessages(conversationId, params);
      
      if (resetPage) {
        setMessages(data);
        setPage(1);
      } else {
        setMessages(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      console.error('[useConversation] Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId, page]);

  const sendMessageHandler = useCallback(async (content: string) => {
    if (!content.trim()) return;

    try {
      setSending(true);
      setError(null);

      const dto: SendMessageDto = {
        recipientId,
        content: content.trim()
      };

      const newMessage = await messagesApi.sendMessage(dto);
      
      // Add new message to top of list
      setMessages(prev => [newMessage, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('[useConversation] Error sending message:', err);
      throw err; // Re-throw so UI can handle
    } finally {
      setSending(false);
    }
  }, [recipientId]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    setPage(prev => prev + 1);
  }, [hasMore, loading]);

  const markAllAsReadHandler = useCallback(async () => {
    if (!conversationId) return;

    try {
      await messagesApi.markAllAsRead(conversationId);
      // Update local state to mark all as read
      setMessages(prev => 
        prev.map(msg => ({ ...msg, isRead: true }))
      );
    } catch (err) {
      console.error('[useConversation] Error marking as read:', err);
    }
  }, [conversationId]);

  const refresh = useCallback(async () => {
    await fetchMessages(true);
  }, [fetchMessages]);

  useEffect(() => {
    fetchMessages(true);
  }, [conversationId]); // Only re-fetch when conversation changes

  useEffect(() => {
    if (page > 1) {
      fetchMessages(false);
    }
  }, [page]); // Load more when page changes

  return {
    messages,
    loading,
    error,
    sending,
    hasMore,
    sendMessage: sendMessageHandler,
    loadMore,
    markAllAsRead: markAllAsReadHandler,
    refresh
  };
}

// ==================== EXPORTS ====================

export default useMessages;
