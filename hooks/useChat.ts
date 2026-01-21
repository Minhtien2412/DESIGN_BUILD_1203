/**
 * useChat Hook
 * ============
 *
 * React Native hook cho realtime chat
 *
 * Features:
 * - Auto-connect/disconnect
 * - Message state management
 * - Typing indicators
 * - Read receipts
 * - Optimistic updates
 * - Offline queue
 *
 * Usage:
 * ```tsx
 * const { messages, sendMessage, isConnected, typingUsers } = useChat(conversationId);
 * ```
 */

import { useAuth } from "@/context/AuthContext";
import { del, get, post } from "@/services/api";
import {
    Attachment,
    generateClientMessageId,
    MessageAck,
    MessageType,
    NewMessage,
    ReadReceipt,
    realtimeMessaging,
    SendMessagePayload,
    TypingUpdate,
} from "@/services/realtime-messaging.service";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

// ============================================
// TYPES
// ============================================

export interface ChatMessage {
  id: string;
  clientMessageId: string;
  conversationId: string;
  seq: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  type: MessageType;
  content?: string;
  attachments?: Attachment[];
  replyTo?: {
    id: string;
    content?: string;
    senderName?: string;
  };
  status: "sending" | "sent" | "delivered" | "read" | "failed";
  createdAt: Date;
  editedAt?: Date;
  reactions?: Array<{
    emoji: string;
    userId: number;
    userName?: string;
  }>;
}

export interface UseChatOptions {
  autoConnect?: boolean;
  loadInitialMessages?: boolean;
  pageSize?: number;
}

export interface UseChatReturn {
  // State
  messages: ChatMessage[];
  isConnected: boolean;
  isLoading: boolean;
  hasMore: boolean;
  typingUsers: number[];
  error: string | null;

  // Actions
  sendMessage: (
    content: string,
    type?: MessageType,
    attachments?: Attachment[],
    replyToId?: string
  ) => Promise<MessageAck>;
  loadMoreMessages: () => Promise<void>;
  markAsRead: (seq?: number) => void;
  startTyping: () => void;
  stopTyping: () => void;
  retryMessage: (clientMessageId: string) => Promise<void>;
  deleteMessage: (messageId: string, forAll?: boolean) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  removeReaction: (messageId: string, emoji: string) => Promise<void>;
}

// ============================================
// HOOK
// ============================================

export function useChat(
  conversationId: string,
  options: UseChatOptions = {}
): UseChatReturn {
  const {
    autoConnect = true,
    loadInitialMessages = true,
    pageSize = 50,
  } = options;

  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(
    realtimeMessaging.isConnected()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const cursorRef = useRef<string | undefined>(undefined);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastReadSeqRef = useRef<number>(0);

  // ============================================
  // CONNECTION
  // ============================================

  useEffect(() => {
    if (!autoConnect) return;

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleError = (err: Error) => setError(err.message);

    realtimeMessaging.on("connected", handleConnect);
    realtimeMessaging.on("disconnected", handleDisconnect);
    realtimeMessaging.on("error", handleError);

    // Connect if not already
    if (!realtimeMessaging.isConnected()) {
      realtimeMessaging.connect();
    }

    return () => {
      realtimeMessaging.off("connected", handleConnect);
      realtimeMessaging.off("disconnected", handleDisconnect);
      realtimeMessaging.off("error", handleError);
    };
  }, [autoConnect]);

  // ============================================
  // MESSAGE LISTENERS
  // ============================================

  useEffect(() => {
    const handleNewMessage = (payload: NewMessage) => {
      if (payload.conversationId !== conversationId) return;

      setMessages((prev) => {
        // Check for optimistic update
        const existingIndex = prev.findIndex(
          (m) =>
            m.clientMessageId === payload.messageId ||
            m.id === payload.messageId
        );

        const newMessage: ChatMessage = {
          id: payload.messageId,
          clientMessageId: payload.messageId,
          conversationId: payload.conversationId,
          seq: payload.seq,
          senderId: payload.senderId,
          senderName: payload.senderName,
          senderAvatar: payload.senderAvatar,
          type: payload.type as MessageType,
          content: payload.content,
          attachments: payload.attachments,
          status: "sent",
          createdAt: new Date(payload.createdAt),
        };

        if (existingIndex >= 0) {
          // Update optimistic message
          const updated = [...prev];
          updated[existingIndex] = newMessage;
          return updated;
        }

        // Add new message
        return [...prev, newMessage];
      });
    };

    const handleTypingUpdate = (payload: TypingUpdate) => {
      if (payload.conversationId !== conversationId) return;
      const userId = user?.id ? Number(user.id) : undefined;
      setTypingUsers(payload.typingUsers.filter((id) => id !== userId));
    };

    const handleReadReceipt = (payload: ReadReceipt) => {
      if (payload.conversationId !== conversationId) return;

      // Update message status to 'read' for messages up to lastReadSeq
      const userId = user?.id ? Number(user.id) : undefined;
      setMessages((prev) =>
        prev.map((m) => {
          if (
            m.seq <= payload.lastReadSeq &&
            m.senderId === userId &&
            m.status !== "read"
          ) {
            return { ...m, status: "read" as const };
          }
          return m;
        })
      );
    };

    const handleMessageEdited = (payload: any) => {
      if (payload.conversationId !== conversationId) return;

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === payload.messageId) {
            return {
              ...m,
              content: payload.content,
              editedAt: new Date(payload.editedAt),
            };
          }
          return m;
        })
      );
    };

    const handleMessageDeleted = (payload: any) => {
      if (payload.conversationId !== conversationId) return;

      if (payload.deleteForAll) {
        setMessages((prev) => prev.filter((m) => m.id !== payload.messageId));
      }
    };

    const handleReaction = (payload: any) => {
      if (payload.conversationId !== conversationId) return;

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== payload.messageId) return m;

          let reactions = [...(m.reactions || [])];

          if (payload.action === "add") {
            reactions.push({
              emoji: payload.emoji,
              userId: payload.userId,
            });
          } else {
            reactions = reactions.filter(
              (r) => !(r.userId === payload.userId && r.emoji === payload.emoji)
            );
          }

          return { ...m, reactions };
        })
      );
    };

    realtimeMessaging.on("message", handleNewMessage);
    realtimeMessaging.on("typing", handleTypingUpdate);
    realtimeMessaging.on("readReceipt", handleReadReceipt);
    realtimeMessaging.on("messageEdited", handleMessageEdited);
    realtimeMessaging.on("messageDeleted", handleMessageDeleted);
    realtimeMessaging.on("reaction", handleReaction);

    // Join conversation room
    realtimeMessaging.joinConversation(conversationId);

    return () => {
      realtimeMessaging.off("message", handleNewMessage);
      realtimeMessaging.off("typing", handleTypingUpdate);
      realtimeMessaging.off("readReceipt", handleReadReceipt);
      realtimeMessaging.off("messageEdited", handleMessageEdited);
      realtimeMessaging.off("messageDeleted", handleMessageDeleted);
      realtimeMessaging.off("reaction", handleReaction);

      realtimeMessaging.leaveConversation(conversationId);
    };
  }, [conversationId, user?.id]);

  // ============================================
  // LOAD INITIAL MESSAGES
  // ============================================

  useEffect(() => {
    if (loadInitialMessages && conversationId) {
      loadMessages();
    }
  }, [conversationId, loadInitialMessages]);

  const loadMessages = async (cursor?: string) => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: String(pageSize),
        direction: "before",
      });

      if (cursor) {
        params.set("cursor", cursor);
      }

      const response = await get<{
        messages: any[];
        hasMore: boolean;
        cursor?: string;
      }>(`/conversations/${conversationId}/messages?${params}`);

      const loadedMessages: ChatMessage[] = response.messages.map((m) => ({
        id: m.id,
        clientMessageId: m.clientMessageId || m.id,
        conversationId: m.conversationId,
        seq: m.seq,
        senderId: m.sender.id,
        senderName: m.sender.name,
        senderAvatar: m.sender.avatar,
        type: m.type,
        content: m.content,
        attachments: m.attachments,
        replyTo: m.replyTo,
        reactions: m.reactions,
        status: "sent" as const,
        createdAt: new Date(m.createdAt),
        editedAt: m.editedAt ? new Date(m.editedAt) : undefined,
      }));

      if (cursor) {
        setMessages((prev) => [...loadedMessages, ...prev]);
      } else {
        setMessages(loadedMessages);
      }

      setHasMore(response.hasMore);
      cursorRef.current = response.cursor;

      // Update last read seq
      if (loadedMessages.length > 0) {
        const maxSeq = Math.max(...loadedMessages.map((m) => m.seq));
        lastReadSeqRef.current = Math.max(lastReadSeqRef.current, maxSeq);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!hasMore || isLoading) return;
    await loadMessages(cursorRef.current);
  };

  // ============================================
  // SEND MESSAGE
  // ============================================

  const sendMessage = useCallback(
    async (
      content: string,
      type: MessageType = "TEXT",
      attachments?: Attachment[],
      replyToId?: string
    ): Promise<MessageAck> => {
      if (!user) {
        return {
          success: false,
          clientMessageId: "",
          error: "Not authenticated",
        };
      }

      const clientMessageId = generateClientMessageId();

      // Optimistic update
      const optimisticMessage: ChatMessage = {
        id: clientMessageId,
        clientMessageId,
        conversationId,
        seq: (messages[messages.length - 1]?.seq || 0) + 1,
        senderId: Number(user.id),
        senderName: user.name || "Me",
        senderAvatar: user.avatar as string | undefined,
        type,
        content,
        attachments,
        status: "sending",
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      // Send via WebSocket
      const payload: SendMessagePayload = {
        conversationId,
        clientMessageId,
        type,
        content,
        attachments,
        replyToMessageId: replyToId,
      };

      const ack = await realtimeMessaging.sendMessage(payload);

      // Update status
      setMessages((prev) =>
        prev.map((m) => {
          if (m.clientMessageId === clientMessageId) {
            return {
              ...m,
              id: ack.messageId || m.id,
              seq: ack.seq || m.seq,
              status: ack.success ? "sent" : "failed",
            };
          }
          return m;
        })
      );

      return ack;
    },
    [conversationId, user, messages]
  );

  // ============================================
  // TYPING
  // ============================================

  const startTyping = useCallback(() => {
    realtimeMessaging.startTyping(conversationId);

    // Auto-stop after 5 seconds
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 5000);
  }, [conversationId]);

  const stopTyping = useCallback(() => {
    realtimeMessaging.stopTyping(conversationId);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [conversationId]);

  // ============================================
  // READ RECEIPTS
  // ============================================

  const markAsRead = useCallback(
    (seq?: number) => {
      const targetSeq = seq || messages[messages.length - 1]?.seq;
      if (targetSeq && targetSeq > lastReadSeqRef.current) {
        lastReadSeqRef.current = targetSeq;
        realtimeMessaging.markAsRead(conversationId, targetSeq);
      }
    },
    [conversationId, messages]
  );

  // ============================================
  // OTHER ACTIONS
  // ============================================

  const retryMessage = useCallback(
    async (clientMessageId: string) => {
      const message = messages.find(
        (m) => m.clientMessageId === clientMessageId
      );
      if (!message) return;

      setMessages((prev) =>
        prev.map((m) =>
          m.clientMessageId === clientMessageId
            ? { ...m, status: "sending" as const }
            : m
        )
      );

      const ack = await realtimeMessaging.sendMessage({
        conversationId,
        clientMessageId,
        type: message.type,
        content: message.content,
        attachments: message.attachments,
      });

      setMessages((prev) =>
        prev.map((m) => {
          if (m.clientMessageId === clientMessageId) {
            return { ...m, status: ack.success ? "sent" : "failed" };
          }
          return m;
        })
      );
    },
    [conversationId, messages]
  );

  const deleteMessage = useCallback(
    async (messageId: string, forAll = false) => {
      await del(
        `/conversations/${conversationId}/messages/${messageId}?deleteForAll=${forAll}`
      );

      if (forAll) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      }
    },
    [conversationId]
  );

  const addReaction = useCallback(
    async (messageId: string, emoji: string) => {
      await post(
        `/conversations/${conversationId}/messages/${messageId}/reactions`,
        {
          emoji,
        }
      );
    },
    [conversationId]
  );

  const removeReaction = useCallback(
    async (messageId: string, emoji: string) => {
      await del(
        `/conversations/${conversationId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`
      );
    },
    [conversationId]
  );

  // ============================================
  // APP STATE
  // ============================================

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        // Reconnect and sync
        if (!realtimeMessaging.isConnected()) {
          realtimeMessaging.connect();
        }
      } else if (nextState === "background") {
        // Mark as away
        realtimeMessaging.updatePresence("AWAY");
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => subscription.remove();
  }, []);

  return {
    messages,
    isConnected,
    isLoading,
    hasMore,
    typingUsers,
    error,
    sendMessage,
    loadMoreMessages,
    markAsRead,
    startTyping,
    stopTyping,
    retryMessage,
    deleteMessage,
    addReaction,
    removeReaction,
  };
}

export default useChat;
