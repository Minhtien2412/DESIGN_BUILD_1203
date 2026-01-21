/**
 * useRealtimeChat Hook
 * Real-time chat functionality with WebSocket integration
 *
 * Features:
 * - Real-time message receiving
 * - Typing indicators
 * - Read receipts
 * - Online status
 * - Message reactions
 *
 * @created 19/01/2026
 */

import messagesApi from "@/services/api/messagesApi";
import chatSocketService, {
    ChatMessage,
    ReadReceiptEvent,
    TypingEvent
} from "@/services/communication/chatSocket.service";
import { useCallback, useEffect, useRef, useState } from "react";

// ============================================================================
// Types
// ============================================================================

interface UseRealtimeChatOptions {
  conversationId?: number | null;
  recipientId: number;
  autoConnect?: boolean;
  onNewMessage?: (message: ChatMessage) => void;
}

interface UseRealtimeChatReturn {
  // State
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  hasMore: boolean;

  // Connection
  connected: boolean;
  connecting: boolean;

  // Typing
  typingUsers: Map<
    number,
    { name: string; timeout: ReturnType<typeof setTimeout> }
  >;
  isTyping: boolean;

  // Actions
  sendMessage: (
    content: string,
    type?: "text" | "image" | "file"
  ) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  markAsRead: (messageIds: (string | number)[]) => void;
  setTyping: (isTyping: boolean) => void;
  addReaction: (messageId: string | number, emoji: string) => void;

  // Connection
  connect: () => Promise<void>;
  disconnect: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useRealtimeChat({
  conversationId: initialConversationId,
  recipientId,
  autoConnect = true,
  onNewMessage,
}: UseRealtimeChatOptions): UseRealtimeChatReturn {
  // =========================================================================
  // State
  // =========================================================================

  const [conversationId, setConversationId] = useState<number | null>(
    initialConversationId || null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Connection state
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Typing state
  const [typingUsers, setTypingUsers] = useState<
    Map<number, { name: string; timeout: ReturnType<typeof setTimeout> }>
  >(new Map());
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup refs
  const cleanupRef = useRef<(() => void)[]>([]);

  // =========================================================================
  // Connection Management
  // =========================================================================

  const connect = useCallback(async () => {
    if (connected || connecting) return;

    try {
      setConnecting(true);
      setError(null);

      await chatSocketService.connect();
      setConnected(true);

      // Join conversation room if we have an ID
      if (conversationId) {
        chatSocketService.joinConversation(conversationId);
      }

      console.log("[useRealtimeChat] Connected successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Connection failed";
      console.error("[useRealtimeChat] Connection failed:", errorMessage);
      setError(errorMessage);
    } finally {
      setConnecting(false);
    }
  }, [connected, connecting, conversationId]);

  const disconnect = useCallback(() => {
    if (conversationId) {
      chatSocketService.leaveConversation(conversationId);
    }
    chatSocketService.disconnect();
    setConnected(false);

    // Cleanup all listeners
    cleanupRef.current.forEach((cleanup) => cleanup());
    cleanupRef.current = [];
  }, [conversationId]);

  // =========================================================================
  // Message Loading
  // =========================================================================

  const fetchConversation = useCallback(async () => {
    if (initialConversationId) {
      setConversationId(initialConversationId);
      return initialConversationId;
    }

    if (!recipientId) {
      setLoading(false);
      return null;
    }

    try {
      const conversation =
        await messagesApi.getConversationByRecipient(recipientId);
      if (conversation) {
        setConversationId(conversation.id);
        return conversation.id;
      }
      return null;
    } catch (err) {
      console.error("[useRealtimeChat] Error fetching conversation:", err);
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

        const currentPage = resetPage ? 1 : page;
        const data = await messagesApi.getMessages(convId, {
          page: currentPage,
          limit: 50,
        });

        // Transform to ChatMessage format
        const chatMessages: ChatMessage[] = data.map((msg: any) => ({
          id: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          content: msg.content,
          type: "text",
          isRead: msg.isRead,
          createdAt: msg.createdAt,
          sender: {
            id: msg.sender.id,
            name: msg.sender.name,
            avatar: msg.sender.avatar,
          },
        }));

        if (resetPage) {
          setMessages(chatMessages);
          setPage(1);
        } else {
          setMessages((prev) => [...prev, ...chatMessages]);
        }

        setHasMore(data.length === 50);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load messages"
        );
        console.error("[useRealtimeChat] Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    },
    [page]
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !conversationId) return;
    setPage((prev) => prev + 1);
    await fetchMessages(conversationId, false);
  }, [hasMore, loading, conversationId, fetchMessages]);

  const refresh = useCallback(async () => {
    const convId = await fetchConversation();
    await fetchMessages(convId, true);
  }, [fetchConversation, fetchMessages]);

  // =========================================================================
  // Send Message
  // =========================================================================

  const sendMessage = useCallback(
    async (content: string, type: "text" | "image" | "file" = "text") => {
      if (!content.trim()) return;

      try {
        setSending(true);
        setError(null);

        // Try to send via WebSocket first (real-time)
        if (connected) {
          chatSocketService.sendMessage({
            conversationId: conversationId || undefined,
            recipientId,
            content: content.trim(),
            type,
          });
        }

        // Also send via REST API as fallback/persistence
        const newMessage = await messagesApi.sendMessage({
          recipientId,
          content: content.trim(),
        });

        // Update conversation ID if new conversation was created
        if (!conversationId && newMessage.conversationId) {
          setConversationId(newMessage.conversationId);

          // Join the new conversation room
          if (connected) {
            chatSocketService.joinConversation(newMessage.conversationId);
          }
        }

        // Add message to local state (optimistic update)
        const chatMessage: ChatMessage = {
          id: newMessage.id,
          conversationId: newMessage.conversationId,
          senderId: newMessage.senderId,
          content: newMessage.content,
          type: "text",
          isRead: false,
          createdAt: newMessage.createdAt,
          sender: newMessage.sender,
        };

        setMessages((prev) => [chatMessage, ...prev]);

        // Stop typing indicator
        setTyping(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
        throw err;
      } finally {
        setSending(false);
      }
    },
    [connected, conversationId, recipientId]
  );

  // =========================================================================
  // Typing Indicator
  // =========================================================================

  const setTyping = useCallback(
    (typing: boolean) => {
      if (!connected || !conversationId) return;

      if (typing) {
        chatSocketService.startTyping(conversationId);
        setIsTyping(true);

        // Auto-stop typing after 3 seconds
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setTyping(false);
        }, 3000);
      } else {
        chatSocketService.stopTyping(conversationId);
        setIsTyping(false);

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      }
    },
    [connected, conversationId]
  );

  // =========================================================================
  // Read Receipts
  // =========================================================================

  const markAsRead = useCallback(
    (messageIds: (string | number)[]) => {
      if (!connected || !conversationId || messageIds.length === 0) return;

      chatSocketService.markAsRead(conversationId, messageIds);

      // Update local state optimistically
      setMessages((prev) =>
        prev.map((msg) =>
          messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
        )
      );
    },
    [connected, conversationId]
  );

  // =========================================================================
  // Reactions
  // =========================================================================

  const addReaction = useCallback(
    (messageId: string | number, emoji: string) => {
      if (!connected) return;
      chatSocketService.addReaction(messageId, emoji);
    },
    [connected]
  );

  // =========================================================================
  // WebSocket Event Handlers
  // =========================================================================

  useEffect(() => {
    if (!connected) return;

    // Handle new messages
    const removeNewMessage = chatSocketService.onNewMessage((message) => {
      // Only add if it's for our conversation
      if (message.conversationId === conversationId) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === message.id)) return prev;
          return [message, ...prev];
        });

        // Notify parent
        onNewMessage?.(message);
      }
    });
    cleanupRef.current.push(removeNewMessage);

    // Handle typing indicators
    const removeTyping = chatSocketService.onTyping((data: TypingEvent) => {
      if (data.conversationId !== conversationId) return;

      setTypingUsers((prev) => {
        const newMap = new Map(prev);

        if (data.isTyping) {
          // Clear existing timeout
          const existing = newMap.get(data.userId);
          if (existing?.timeout) {
            clearTimeout(existing.timeout);
          }

          // Set new timeout (3 seconds)
          const timeout = setTimeout(() => {
            setTypingUsers((p) => {
              const m = new Map(p);
              m.delete(data.userId);
              return m;
            });
          }, 3000);

          newMap.set(data.userId, { name: data.userName, timeout });
        } else {
          const existing = newMap.get(data.userId);
          if (existing?.timeout) {
            clearTimeout(existing.timeout);
          }
          newMap.delete(data.userId);
        }

        return newMap;
      });
    });
    cleanupRef.current.push(removeTyping);

    // Handle read receipts
    const removeReadReceipt = chatSocketService.onReadReceipt(
      (data: ReadReceiptEvent) => {
        if (data.conversationId !== conversationId) return;

        setMessages((prev) =>
          prev.map((msg) =>
            data.messageIds.includes(msg.id)
              ? { ...msg, isRead: true, readAt: data.readAt }
              : msg
          )
        );
      }
    );
    cleanupRef.current.push(removeReadReceipt);

    return () => {
      cleanupRef.current.forEach((cleanup) => cleanup());
      cleanupRef.current = [];
    };
  }, [connected, conversationId, onNewMessage]);

  // =========================================================================
  // Initial Setup
  // =========================================================================

  useEffect(() => {
    // Auto-connect if enabled
    if (autoConnect) {
      connect();
    }

    // Fetch initial data
    refresh();

    return () => {
      disconnect();

      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Clear all typing timeouts
      typingUsers.forEach(({ timeout }) => clearTimeout(timeout));
    };
  }, []);

  // =========================================================================
  // Join conversation when ID changes
  // =========================================================================

  useEffect(() => {
    if (connected && conversationId) {
      chatSocketService.joinConversation(conversationId);
    }
  }, [connected, conversationId]);

  // =========================================================================
  // Return
  // =========================================================================

  return {
    // State
    messages,
    loading,
    sending,
    error,
    hasMore,

    // Connection
    connected,
    connecting,

    // Typing
    typingUsers,
    isTyping,

    // Actions
    sendMessage,
    loadMore,
    refresh,
    markAsRead,
    setTyping,
    addReaction,

    // Connection
    connect,
    disconnect,
  };
}

export default useRealtimeChat;
