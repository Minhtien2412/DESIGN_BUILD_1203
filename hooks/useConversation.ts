/**
 * useConversation Hook
 * =====================
 *
 * React hook cho messaging với:
 * - Load messages với cursor pagination
 * - Send messages với optimistic UI
 * - Real-time updates via callback
 * - Typing indicator
 * - Read receipts
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import {
    Conversation,
    Message,
    MessageType,
    SendMessageDto,
    conversationsService,
    generateClientMessageId,
} from "@/services/api/conversations.service";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";

// ============================================================================
// Types
// ============================================================================

interface ConversationState {
  conversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isSending: boolean;
  error: string | null;
  hasMoreBefore: boolean;
  hasMoreAfter: boolean;
  oldestSeq: number | null;
  newestSeq: number | null;
  typingUsers: Set<number>;
  pendingMessages: Map<string, PendingMessage>;
}

interface PendingMessage {
  clientMessageId: string;
  content: string;
  type: MessageType;
  timestamp: number;
  status: "sending" | "failed";
  retryCount: number;
}

type ConversationAction =
  | { type: "LOAD_START" }
  | {
      type: "LOAD_SUCCESS";
      conversation: Conversation;
      messages: Message[];
      hasMoreBefore: boolean;
      hasMoreAfter: boolean;
      oldestSeq?: number;
      newestSeq?: number;
    }
  | { type: "LOAD_ERROR"; error: string }
  | { type: "LOAD_MORE_START" }
  | {
      type: "LOAD_MORE_SUCCESS";
      messages: Message[];
      direction: "before" | "after";
      hasMore: boolean;
      seq?: number;
    }
  | { type: "LOAD_MORE_ERROR"; error: string }
  | { type: "SEND_START"; pendingMessage: PendingMessage }
  | { type: "SEND_SUCCESS"; clientMessageId: string; message: Message }
  | { type: "SEND_ERROR"; clientMessageId: string }
  | { type: "NEW_MESSAGE"; message: Message }
  | { type: "UPDATE_MESSAGE"; message: Message }
  | { type: "DELETE_MESSAGE"; messageId: string }
  | { type: "MARK_READ"; lastReadSeq: number }
  | { type: "TYPING_START"; userId: number }
  | { type: "TYPING_STOP"; userId: number }
  | { type: "RESET" };

// ============================================================================
// Reducer
// ============================================================================

const initialState: ConversationState = {
  conversation: null,
  messages: [],
  isLoading: true,
  isLoadingMore: false,
  isSending: false,
  error: null,
  hasMoreBefore: false,
  hasMoreAfter: false,
  oldestSeq: null,
  newestSeq: null,
  typingUsers: new Set(),
  pendingMessages: new Map(),
};

function conversationReducer(
  state: ConversationState,
  action: ConversationAction,
): ConversationState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, isLoading: true, error: null };

    case "LOAD_SUCCESS":
      return {
        ...state,
        isLoading: false,
        conversation: action.conversation,
        messages: action.messages,
        hasMoreBefore: action.hasMoreBefore,
        hasMoreAfter: action.hasMoreAfter,
        oldestSeq: action.oldestSeq ?? null,
        newestSeq: action.newestSeq ?? null,
        error: null,
      };

    case "LOAD_ERROR":
      return { ...state, isLoading: false, error: action.error };

    case "LOAD_MORE_START":
      return { ...state, isLoadingMore: true };

    case "LOAD_MORE_SUCCESS": {
      const newMessages =
        action.direction === "before"
          ? [...action.messages, ...state.messages]
          : [...state.messages, ...action.messages];

      return {
        ...state,
        isLoadingMore: false,
        messages: newMessages,
        hasMoreBefore:
          action.direction === "before" ? action.hasMore : state.hasMoreBefore,
        hasMoreAfter:
          action.direction === "after" ? action.hasMore : state.hasMoreAfter,
        oldestSeq:
          action.direction === "before" && action.seq
            ? action.seq
            : state.oldestSeq,
        newestSeq:
          action.direction === "after" && action.seq
            ? action.seq
            : state.newestSeq,
      };
    }

    case "LOAD_MORE_ERROR":
      return { ...state, isLoadingMore: false, error: action.error };

    case "SEND_START": {
      const pendingMessages = new Map(state.pendingMessages);
      pendingMessages.set(
        action.pendingMessage.clientMessageId,
        action.pendingMessage,
      );
      return { ...state, isSending: true, pendingMessages };
    }

    case "SEND_SUCCESS": {
      const pendingMessages = new Map(state.pendingMessages);
      pendingMessages.delete(action.clientMessageId);

      // Add message if not already exists (avoid duplicates from realtime)
      const exists = state.messages.some((m) => m.id === action.message.id);
      const messages = exists
        ? state.messages
        : [...state.messages, action.message];

      return {
        ...state,
        isSending: pendingMessages.size > 0,
        pendingMessages,
        messages,
        newestSeq: Math.max(state.newestSeq ?? 0, action.message.seq),
      };
    }

    case "SEND_ERROR": {
      const pendingMessages = new Map(state.pendingMessages);
      const pending = pendingMessages.get(action.clientMessageId);
      if (pending) {
        pendingMessages.set(action.clientMessageId, {
          ...pending,
          status: "failed",
          retryCount: pending.retryCount + 1,
        });
      }
      return { ...state, isSending: false, pendingMessages };
    }

    case "NEW_MESSAGE": {
      // Avoid duplicates
      const exists = state.messages.some((m) => m.id === action.message.id);
      if (exists) return state;

      return {
        ...state,
        messages: [...state.messages, action.message],
        newestSeq: Math.max(state.newestSeq ?? 0, action.message.seq),
      };
    }

    case "UPDATE_MESSAGE": {
      const messages = state.messages.map((m) =>
        m.id === action.message.id ? action.message : m,
      );
      return { ...state, messages };
    }

    case "DELETE_MESSAGE": {
      const messages = state.messages.map((m) =>
        m.id === action.messageId
          ? { ...m, isDeleted: true, content: "Tin nhắn đã bị xóa" }
          : m,
      );
      return { ...state, messages };
    }

    case "MARK_READ":
      return { ...state };

    case "TYPING_START": {
      const typingUsers = new Set(state.typingUsers);
      typingUsers.add(action.userId);
      return { ...state, typingUsers };
    }

    case "TYPING_STOP": {
      const typingUsers = new Set(state.typingUsers);
      typingUsers.delete(action.userId);
      return { ...state, typingUsers };
    }

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

// ============================================================================
// Hook Options
// ============================================================================

interface UseConversationOptions {
  /** Initial message limit */
  limit?: number;
  /** Auto mark as read when new messages arrive */
  autoMarkRead?: boolean;
  /** Callback when new message received */
  onNewMessage?: (message: Message) => void;
  /** Callback when message updated */
  onMessageUpdated?: (message: Message) => void;
  /** Callback when error occurs */
  onError?: (error: string) => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useConversation(
  conversationId: string | undefined,
  options: UseConversationOptions = {},
) {
  const {
    limit = 50,
    autoMarkRead = true,
    onNewMessage,
    onMessageUpdated,
    onError,
  } = options;

  const [state, dispatch] = useReducer(conversationReducer, initialState);
  const lastLoadRef = useRef<number>(0);

  // ============================================
  // Load conversation and initial messages
  // ============================================

  const loadConversation = useCallback(async () => {
    if (!conversationId) return;

    // Debounce
    const now = Date.now();
    if (now - lastLoadRef.current < 500) return;
    lastLoadRef.current = now;

    dispatch({ type: "LOAD_START" });

    try {
      const [conversation, messagesResponse] = await Promise.all([
        conversationsService.getConversation(conversationId),
        conversationsService.getMessages(conversationId, { limit }),
      ]);

      dispatch({
        type: "LOAD_SUCCESS",
        conversation,
        messages: messagesResponse.items,
        hasMoreBefore: messagesResponse.hasMoreBefore,
        hasMoreAfter: messagesResponse.hasMoreAfter,
        oldestSeq: messagesResponse.oldestSeq,
        newestSeq: messagesResponse.newestSeq,
      });
    } catch (error: any) {
      const errorMsg = error?.message || "Không thể tải cuộc trò chuyện";
      dispatch({ type: "LOAD_ERROR", error: errorMsg });
      onError?.(errorMsg);
    }
  }, [conversationId, limit, onError]);

  // Auto load on mount
  useEffect(() => {
    loadConversation();
    return () => {
      dispatch({ type: "RESET" });
    };
  }, [loadConversation]);

  // ============================================
  // Load more messages (pagination)
  // ============================================

  const loadMore = useCallback(
    async (direction: "before" | "after" = "before") => {
      if (!conversationId || state.isLoadingMore) return;

      const hasMore =
        direction === "before" ? state.hasMoreBefore : state.hasMoreAfter;
      if (!hasMore) return;

      dispatch({ type: "LOAD_MORE_START" });

      try {
        const cursor =
          direction === "before"
            ? state.messages[0]?.id
            : state.messages[state.messages.length - 1]?.id;

        const response = await conversationsService.getMessages(
          conversationId,
          {
            cursor,
            direction,
            limit,
          },
        );

        dispatch({
          type: "LOAD_MORE_SUCCESS",
          messages: response.items,
          direction,
          hasMore:
            direction === "before"
              ? response.hasMoreBefore
              : response.hasMoreAfter,
          seq: direction === "before" ? response.oldestSeq : response.newestSeq,
        });
      } catch (error: any) {
        const errorMsg = error?.message || "Không thể tải thêm tin nhắn";
        dispatch({ type: "LOAD_MORE_ERROR", error: errorMsg });
        onError?.(errorMsg);
      }
    },
    [
      conversationId,
      state.isLoadingMore,
      state.hasMoreBefore,
      state.hasMoreAfter,
      state.messages,
      limit,
      onError,
    ],
  );

  // ============================================
  // Send message
  // ============================================

  const sendMessage = useCallback(
    async (
      content: string,
      type: MessageType = "TEXT",
      options?: {
        attachments?: SendMessageDto["attachments"];
        replyToMessageId?: string;
      },
    ) => {
      if (!conversationId) return null;

      const clientMessageId = generateClientMessageId();

      // Optimistic update
      dispatch({
        type: "SEND_START",
        pendingMessage: {
          clientMessageId,
          content,
          type,
          timestamp: Date.now(),
          status: "sending",
          retryCount: 0,
        },
      });

      try {
        const message = await conversationsService.sendMessage(conversationId, {
          clientMessageId,
          type,
          content,
          attachments: options?.attachments,
          replyToMessageId: options?.replyToMessageId,
        });

        dispatch({ type: "SEND_SUCCESS", clientMessageId, message });
        return message;
      } catch (error: any) {
        dispatch({ type: "SEND_ERROR", clientMessageId });
        onError?.(error?.message || "Không thể gửi tin nhắn");
        return null;
      }
    },
    [conversationId, onError],
  );

  // ============================================
  // Edit message
  // ============================================

  const editMessage = useCallback(
    async (messageId: string, content: string) => {
      if (!conversationId) return null;

      try {
        const message = await conversationsService.updateMessage(
          conversationId,
          messageId,
          content,
        );
        dispatch({ type: "UPDATE_MESSAGE", message });
        return message;
      } catch (error: any) {
        onError?.(error?.message || "Không thể sửa tin nhắn");
        return null;
      }
    },
    [conversationId, onError],
  );

  // ============================================
  // Delete message
  // ============================================

  const deleteMessage = useCallback(
    async (messageId: string, forEveryone?: boolean) => {
      if (!conversationId) return false;

      try {
        await conversationsService.deleteMessage(
          conversationId,
          messageId,
          forEveryone,
        );
        dispatch({ type: "DELETE_MESSAGE", messageId });
        return true;
      } catch (error: any) {
        onError?.(error?.message || "Không thể xóa tin nhắn");
        return false;
      }
    },
    [conversationId, onError],
  );

  // ============================================
  // React to message
  // ============================================

  const addReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!conversationId) return false;

      try {
        await conversationsService.addReaction(
          conversationId,
          messageId,
          emoji,
        );
        // Refresh message to get updated reactions
        const message = await conversationsService.getMessage(
          conversationId,
          messageId,
        );
        dispatch({ type: "UPDATE_MESSAGE", message });
        return true;
      } catch (error: any) {
        onError?.(error?.message || "Không thể thêm reaction");
        return false;
      }
    },
    [conversationId, onError],
  );

  const removeReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!conversationId) return false;

      try {
        await conversationsService.removeReaction(
          conversationId,
          messageId,
          emoji,
        );
        const message = await conversationsService.getMessage(
          conversationId,
          messageId,
        );
        dispatch({ type: "UPDATE_MESSAGE", message });
        return true;
      } catch (error: any) {
        onError?.(error?.message || "Không thể xóa reaction");
        return false;
      }
    },
    [conversationId, onError],
  );

  // ============================================
  // Mark as read
  // ============================================

  const markAsRead = useCallback(
    async (messageId?: string) => {
      if (!conversationId) return;

      try {
        const response = await conversationsService.markAsRead(
          conversationId,
          messageId,
        );
        dispatch({ type: "MARK_READ", lastReadSeq: response.lastReadSeq });
      } catch (error) {
        // Silent fail for read receipts
        console.warn("Failed to mark as read:", error);
      }
    },
    [conversationId],
  );

  // ============================================
  // Handle realtime events
  // ============================================

  const handleNewMessage = useCallback(
    (message: Message) => {
      dispatch({ type: "NEW_MESSAGE", message });
      onNewMessage?.(message);
      if (autoMarkRead) {
        markAsRead(message.id);
      }
    },
    [onNewMessage, autoMarkRead, markAsRead],
  );

  const handleMessageUpdated = useCallback(
    (message: Message) => {
      dispatch({ type: "UPDATE_MESSAGE", message });
      onMessageUpdated?.(message);
    },
    [onMessageUpdated],
  );

  const handleTypingStart = useCallback((userId: number) => {
    dispatch({ type: "TYPING_START", userId });
  }, []);

  const handleTypingStop = useCallback((userId: number) => {
    dispatch({ type: "TYPING_STOP", userId });
  }, []);

  // ============================================
  // Retry failed message
  // ============================================

  const retryMessage = useCallback(
    async (clientMessageId: string) => {
      const pending = state.pendingMessages.get(clientMessageId);
      if (!pending || pending.retryCount >= 3) return null;

      return sendMessage(pending.content, pending.type);
    },
    [state.pendingMessages, sendMessage],
  );

  // ============================================
  // Combined messages (including pending)
  // ============================================

  const allMessages = useMemo(() => {
    const pending = Array.from(state.pendingMessages.values()).map((p) => ({
      id: p.clientMessageId,
      conversationId: conversationId || "",
      senderId: 0, // Will be current user
      seq: Number.MAX_SAFE_INTEGER,
      content: p.content,
      type: p.type,
      isEdited: false,
      isDeleted: false,
      isPinned: false,
      mentionedUserIds: [],
      sentAt: new Date(p.timestamp).toISOString(),
      createdAt: new Date(p.timestamp).toISOString(),
      updatedAt: new Date(p.timestamp).toISOString(),
      _isPending: true,
      _status: p.status,
    })) as (Message & { _isPending?: boolean; _status?: string })[];

    return [...state.messages, ...pending].sort((a, b) => a.seq - b.seq);
  }, [state.messages, state.pendingMessages, conversationId]);

  // ============================================
  // Return
  // ============================================

  return {
    // State
    conversation: state.conversation,
    messages: allMessages,
    isLoading: state.isLoading,
    isLoadingMore: state.isLoadingMore,
    isSending: state.isSending,
    error: state.error,
    hasMoreBefore: state.hasMoreBefore,
    hasMoreAfter: state.hasMoreAfter,
    typingUsers: Array.from(state.typingUsers),
    pendingCount: state.pendingMessages.size,

    // Actions
    loadMore,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    markAsRead,
    retryMessage,
    refresh: loadConversation,

    // Realtime handlers (to connect with WebSocket)
    handlers: {
      onNewMessage: handleNewMessage,
      onMessageUpdated: handleMessageUpdated,
      onTypingStart: handleTypingStart,
      onTypingStop: handleTypingStop,
    },
  };
}

export default useConversation;
