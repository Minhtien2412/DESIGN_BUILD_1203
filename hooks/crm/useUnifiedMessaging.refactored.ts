/**
 * useUnifiedMessaging Hook - REFACTORED
 * Hệ thống tin nhắn thống nhất kiểu Zalo
 * Tích hợp với Real API + WebSocket realtime
 *
 * @author AI Assistant
 * @date 12/01/2026
 * @refactored Replace mock data with real API calls
 */

import { useAuth } from "@/context/AuthContext";
import {
    ChatMessage as ChatRealtimeMessage,
    chatService,
    MessageReadReceipt,
    TypingIndicator,
} from "@/services/chatRealtime";
import * as UnifiedChatService from "@/services/unifiedChatService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Re-export types from original file
export type MessageType =
  | "text"
  | "image"
  | "voice"
  | "file"
  | "call"
  | "video_call"
  | "system";
export type ConversationType = "direct" | "group";
export type CallStatus = "missed" | "answered" | "rejected" | "ongoing";
export type DeliveryStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";
export type OnlineStatus = "online" | "offline" | "away" | "busy";

export interface User {
  id: number;
  name: string;
  avatar?: string;
  email?: string;
  role?: string;
  onlineStatus: OnlineStatus;
  lastSeen?: string;
}

export interface UnifiedMessage {
  id: string;
  conversationId: string;
  senderId: number;
  sender: User;
  type: MessageType;
  content: string;
  audioDuration?: number;
  audioUrl?: string;
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  thumbnail?: string;
  callDuration?: number;
  callStatus?: CallStatus;
  callType?: "audio" | "video";
  deliveryStatus: DeliveryStatus;
  isRead: boolean;
  readBy?: number[];
  reactions?: { emoji: string; userId: number; userName: string }[];
  createdAt: string;
  updatedAt: string;
  replyTo?: { id: string; content: string; senderName: string };
}

export interface UnifiedConversation {
  id: string;
  type: ConversationType;
  name: string;
  avatar?: string;
  participants: User[];
  lastMessage?: UnifiedMessage;
  lastCallTime?: string;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isBlocked: boolean;
  isOnline: boolean;
  typingUsers: User[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageParams {
  conversationId: string;
  content: string;
  type?: MessageType;
  replyToId?: string;
  mediaUrl?: string;
  audioDuration?: number;
}

// Badge sync callback
type BadgeSyncCallback = (unreadCount: number, missedCalls: number) => void;
let badgeSyncCallback: BadgeSyncCallback | null = null;

export function registerBadgeSync(callback: BadgeSyncCallback) {
  badgeSyncCallback = callback;
}

// ==================== HOOK OPTIONS ====================

export interface UseUnifiedMessagingOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  pageSize?: number;
  enableRealtime?: boolean;
}

// ==================== HOOK IMPLEMENTATION ====================

export function useUnifiedMessaging(options: UseUnifiedMessagingOptions = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 30000,
    pageSize = 20,
    enableRealtime = true,
  } = options;

  const { user } = useAuth();
  const currentUserId: number = typeof user?.id === "number" ? user.id : 1;

  // State
  const [conversations, setConversations] = useState<UnifiedConversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<UnifiedConversation | null>(null);
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<User[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  // Refs
  const realtimeCleanupRef = useRef<(() => void) | null>(null);

  // ==================== LOAD CONVERSATIONS FROM API ====================

  const refreshConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      setError(null);

      console.log("[useUnifiedMessaging] Loading conversations from API...");

      const data = await UnifiedChatService.getConversations();

      // Sort: pinned first, then by updatedAt
      const sorted = data.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });

      setConversations(sorted);
      console.log(
        "[useUnifiedMessaging] Loaded",
        sorted.length,
        "conversations",
      );
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách hội thoại";
      setError(errorMsg);
      console.error("[useUnifiedMessaging] Error loading conversations:", err);

      // Try loading from cache if API fails
      try {
        const cached = await AsyncStorage.getItem("@chat_conversations");
        if (cached) {
          console.log("[useUnifiedMessaging] Using cached conversations");
          setConversations(JSON.parse(cached));
        }
      } catch (cacheErr) {
        console.error("[useUnifiedMessaging] Cache error:", cacheErr);
      }
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // ==================== LOAD MESSAGES FROM API ====================

  const loadMessages = useCallback(
    async (conversationId: string) => {
      try {
        setLoadingMessages(true);
        setError(null);

        console.log(
          "[useUnifiedMessaging] Loading messages for:",
          conversationId,
        );

        const data = await UnifiedChatService.getMessages(conversationId, {
          limit: pageSize,
        });

        setMessages(data);
        setHasMoreMessages(data.length >= pageSize);

        // Set current conversation
        const conv = conversations.find((c) => c.id === conversationId);
        if (conv) {
          setCurrentConversation(conv);
        }

        // Join WebSocket room if realtime enabled
        if (enableRealtime) {
          chatService.joinRoom(conversationId);
        }

        console.log("[useUnifiedMessaging] Loaded", data.length, "messages");
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Không thể tải tin nhắn";
        setError(errorMsg);
        console.error("[useUnifiedMessaging] Error loading messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    },
    [conversations, pageSize, enableRealtime],
  );

  const loadMoreMessages = useCallback(async () => {
    if (!currentConversation || !hasMoreMessages || loadingMessages) return;

    try {
      setLoadingMessages(true);

      const oldestMessage = messages[messages.length - 1];
      const data = await UnifiedChatService.getMessages(
        currentConversation.id,
        {
          limit: pageSize,
          before: oldestMessage?.createdAt,
        },
      );

      setMessages((prev) => [...prev, ...data]);
      setHasMoreMessages(data.length >= pageSize);
    } catch (err) {
      console.error("[useUnifiedMessaging] Error loading more messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, [
    currentConversation,
    hasMoreMessages,
    loadingMessages,
    messages,
    pageSize,
  ]);

  // ==================== SEND MESSAGE ====================

  const sendMessage = useCallback(
    async (params: SendMessageParams) => {
      try {
        setSending(true);

        // Create optimistic message
        const optimisticMessage: UnifiedMessage = {
          id: `temp_${Date.now()}`,
          conversationId: params.conversationId,
          senderId: currentUserId,
          sender: {
            id: currentUserId,
            name: user?.name || "You",
            onlineStatus: "online",
          },
          type: params.type || "text",
          content: params.content,
          mediaUrl: params.mediaUrl,
          audioDuration: params.audioDuration,
          deliveryStatus: "sending",
          isRead: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          replyTo: params.replyToId
            ? {
                id: params.replyToId,
                content:
                  messages.find((m) => m.id === params.replyToId)?.content ||
                  "",
                senderName:
                  messages.find((m) => m.id === params.replyToId)?.sender
                    .name || "",
              }
            : undefined,
        };

        // Add optimistic message to UI
        setMessages((prev) => [optimisticMessage, ...prev]);

        // Send via API
        const sentMessage = await UnifiedChatService.sendMessage(
          params.conversationId,
          params.content,
          params.mediaUrl ? [params.mediaUrl] : undefined,
        );

        // Replace optimistic message with real message
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMessage.id ? sentMessage : m)),
        );

        // Update conversation's lastMessage
        setConversations((prev) =>
          prev.map((c) =>
            c.id === params.conversationId
              ? {
                  ...c,
                  lastMessage: sentMessage,
                  updatedAt: sentMessage.createdAt,
                }
              : c,
          ),
        );

        // Also send via WebSocket for realtime delivery
        if (enableRealtime) {
          chatService.sendMessage(
            params.conversationId,
            params.content,
            params.replyToId,
          );
        }

        console.log("[useUnifiedMessaging] Message sent:", sentMessage.id);
      } catch (err) {
        // Mark as failed
        setMessages((prev) =>
          prev.map((m) =>
            m.deliveryStatus === "sending"
              ? { ...m, deliveryStatus: "failed" as DeliveryStatus }
              : m,
          ),
        );
        setError("Gửi tin nhắn thất bại");
        console.error("[useUnifiedMessaging] Send error:", err);
        throw err;
      } finally {
        setSending(false);
      }
    },
    [currentUserId, user, messages, enableRealtime],
  );

  // ==================== TYPING ====================

  const setTyping = useCallback(
    (conversationId: string, isTyping: boolean) => {
      if (!enableRealtime || !currentUserId) return;

      if (isTyping) {
        chatService.startTyping(conversationId, currentUserId);
      } else {
        chatService.stopTyping(conversationId, currentUserId);
      }
    },
    [enableRealtime, currentUserId],
  );

  // ==================== MARK AS READ ====================

  const markAsRead = useCallback(
    async (conversationId: string) => {
      try {
        const conversation = conversations.find((c) => c.id === conversationId);
        const unreadBefore = conversation?.unreadCount || 0;

        // Optimistic update
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c,
          ),
        );
        setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));

        // API call
        await UnifiedChatService.markAsRead(conversationId);

        // WebSocket notification
        if (enableRealtime) {
          chatService.markRoomAsRead(conversationId);
        }

        // Sync badge
        if (unreadBefore > 0 && badgeSyncCallback) {
          const newTotalUnread = conversations.reduce(
            (sum, c) => sum + (c.id === conversationId ? 0 : c.unreadCount),
            0,
          );
          const missedCalls = conversations.filter(
            (c) =>
              c.lastMessage?.type === "call" &&
              c.lastMessage?.callStatus === "missed" &&
              !c.lastMessage?.isRead,
          ).length;
          badgeSyncCallback(newTotalUnread, missedCalls);
        }

        console.log("[useUnifiedMessaging] Marked as read:", conversationId);
      } catch (err) {
        console.error("[useUnifiedMessaging] Error marking as read:", err);
      }
    },
    [conversations, enableRealtime],
  );

  // ==================== COUNTS ====================

  const totalUnreadCount = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations],
  );

  const missedCallsCount = useMemo(
    () =>
      conversations.filter(
        (c) =>
          c.lastMessage?.type === "call" &&
          c.lastMessage?.callStatus === "missed" &&
          !c.lastMessage?.isRead,
      ).length,
    [conversations],
  );

  // ==================== SEARCH ====================

  const searchConversations = useCallback(
    (query: string): UnifiedConversation[] => {
      const lower = query.toLowerCase();
      return conversations.filter(
        (c) =>
          c.name.toLowerCase().includes(lower) ||
          c.lastMessage?.content.toLowerCase().includes(lower),
      );
    },
    [conversations],
  );

  const searchMessages = useCallback(
    (conversationId: string, query: string): UnifiedMessage[] => {
      const lower = query.toLowerCase();
      return messages.filter(
        (m) =>
          m.conversationId === conversationId &&
          m.content.toLowerCase().includes(lower),
      );
    },
    [messages],
  );

  // ==================== CALL ACTIONS ====================

  const startCall = useCallback(
    async (userId: number, type: "audio" | "video") => {
      console.log("[useUnifiedMessaging] Starting call:", userId, type);
      // TODO: Integrate with CallService
    },
    [],
  );

  // ==================== CONVERSATION ACTIONS ====================

  const pinConversation = useCallback(
    async (conversationId: string, pinned: boolean) => {
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === conversationId ? { ...c, isPinned: pinned } : c,
        );
        return updated.sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        });
      });
      // TODO: API call to persist pin status
    },
    [],
  );

  const muteConversation = useCallback(
    async (conversationId: string, muted: boolean) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, isMuted: muted } : c,
        ),
      );
      // TODO: API call to persist mute status
    },
    [],
  );

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
      // TODO: API call to delete conversation
    },
    [currentConversation],
  );

  // ==================== MESSAGE ACTIONS ====================

  const deleteMessage = useCallback(
    async (messageId: string) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      if (enableRealtime && currentConversation) {
        chatService.deleteMessage(currentConversation.id, messageId);
      }
    },
    [enableRealtime, currentConversation],
  );

  const addReaction = useCallback(
    async (messageId: string, emoji: string) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          const reactions = m.reactions || [];
          const existing = reactions.find((r) => r.userId === currentUserId);
          if (existing) {
            return {
              ...m,
              reactions: reactions.map((r) =>
                r.userId === currentUserId ? { ...r, emoji } : r,
              ),
            };
          }
          return {
            ...m,
            reactions: [
              ...reactions,
              { emoji, userId: currentUserId, userName: user?.name || "You" },
            ],
          };
        }),
      );
    },
    [currentUserId, user],
  );

  const removeReaction = useCallback(
    async (messageId: string, emoji: string) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          return {
            ...m,
            reactions: (m.reactions || []).filter(
              (r) => !(r.userId === currentUserId && r.emoji === emoji),
            ),
          };
        }),
      );
    },
    [currentUserId],
  );

  // ==================== GET OR CREATE CONVERSATION ====================

  const getOrCreateConversation = useCallback(
    async (params: {
      userId: number;
      userName: string;
      userAvatar?: string;
      userRole?: string;
    }): Promise<string> => {
      // Check if conversation already exists
      const existingConv = conversations.find((c) =>
        c.participants.some((p) => p.id === params.userId),
      );

      if (existingConv) {
        return existingConv.id;
      }

      try {
        // Create via API
        const newConv = await UnifiedChatService.createConversation(
          params.userName,
          [params.userId],
          undefined,
          false,
        );

        setConversations((prev) => [newConv, ...prev]);
        return newConv.id;
      } catch (err) {
        console.error(
          "[useUnifiedMessaging] Error creating conversation:",
          err,
        );
        throw err;
      }
    },
    [conversations],
  );

  // ==================== WEBSOCKET REALTIME ====================

  useEffect(() => {
    if (!enableRealtime || !user) return;

    // Connect to WebSocket
    const setupRealtime = async () => {
      try {
        await chatService.connect();
        console.log("[useUnifiedMessaging] WebSocket connected");

        // Listen for new messages
        const unsubMessage = chatService.onMessage(
          (msg: ChatRealtimeMessage) => {
            console.log("[useUnifiedMessaging] New message received:", msg.id);

            // Convert to UnifiedMessage format
            const newMessage: UnifiedMessage = {
              id: msg.id,
              conversationId: msg.roomId,
              senderId: parseInt(msg.senderId),
              sender: {
                id: parseInt(msg.senderId),
                name: msg.senderName,
                avatar: msg.senderAvatar,
                onlineStatus: "online",
              },
              type: msg.type,
              content: msg.message,
              mediaUrl: msg.fileUrl,
              fileName: msg.fileName,
              fileSize: msg.fileSize,
              deliveryStatus: msg.status as DeliveryStatus,
              isRead: false,
              createdAt: msg.createdAt,
              updatedAt: msg.updatedAt || msg.createdAt,
            };

            // Add to messages if in current conversation
            if (currentConversation?.id === msg.roomId) {
              setMessages((prev) => [newMessage, ...prev]);
            }

            // Update conversation lastMessage and unread count
            setConversations((prev) =>
              prev.map((c) => {
                if (c.id === msg.roomId) {
                  const isCurrentRoom = currentConversation?.id === msg.roomId;
                  return {
                    ...c,
                    lastMessage: newMessage,
                    unreadCount: isCurrentRoom
                      ? c.unreadCount
                      : c.unreadCount + 1,
                    updatedAt: newMessage.createdAt,
                  };
                }
                return c;
              }),
            );

            // Sync badge
            if (badgeSyncCallback) {
              const newTotalUnread = conversations.reduce(
                (sum, c) =>
                  sum +
                  (c.id === msg.roomId ? c.unreadCount + 1 : c.unreadCount),
                0,
              );
              badgeSyncCallback(newTotalUnread, missedCallsCount);
            }
          },
        );

        // Listen for typing indicators
        const unsubTyping = chatService.onTyping((data: TypingIndicator) => {
          if (currentConversation?.id === data.roomId) {
            if (data.isTyping) {
              setTypingUsers((prev) => {
                if (prev.find((u) => u.id.toString() === data.userId))
                  return prev;
                return [
                  ...prev,
                  {
                    id: parseInt(data.userId),
                    name: data.userName,
                    onlineStatus: "online",
                  },
                ];
              });
            } else {
              setTypingUsers((prev) =>
                prev.filter((u) => u.id.toString() !== data.userId),
              );
            }
          }
        });

        // Listen for read receipts
        const unsubRead = chatService.onReadReceipt(
          (data: MessageReadReceipt) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === data.messageId
                  ? {
                      ...m,
                      isRead: true,
                      deliveryStatus: "read",
                    }
                  : m,
              ),
            );
          },
        );

        // Listen for online status
        const unsubOnline = chatService.onOnlineStatus(
          (data: { userId: string; isOnline: boolean }) => {
            setConversations((prev) =>
              prev.map((c) => ({
                ...c,
                participants: c.participants.map((p) =>
                  p.id.toString() === data.userId
                    ? {
                        ...p,
                        onlineStatus: data.isOnline ? "online" : "offline",
                      }
                    : p,
                ),
                isOnline: c.participants.some((p) =>
                  p.id.toString() === data.userId
                    ? data.isOnline
                    : p.onlineStatus === "online",
                ),
              })),
            );
          },
        );

        // Store cleanup function
        realtimeCleanupRef.current = () => {
          unsubMessage();
          unsubTyping();
          unsubRead();
          unsubOnline();
          chatService.disconnect();
        };
      } catch (err) {
        console.error("[useUnifiedMessaging] WebSocket error:", err);
        setIsOnline(false);
      }
    };

    setupRealtime();

    return () => {
      if (realtimeCleanupRef.current) {
        realtimeCleanupRef.current();
        realtimeCleanupRef.current = null;
      }
    };
  }, [
    enableRealtime,
    user,
    currentConversation,
    conversations,
    missedCallsCount,
  ]);

  // ==================== AUTO REFRESH ====================

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refreshConversations, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshConversations]);

  // Sync badges whenever counts change
  useEffect(() => {
    if (badgeSyncCallback) {
      badgeSyncCallback(totalUnreadCount, missedCallsCount);
    }
  }, [totalUnreadCount, missedCallsCount]);

  // ==================== RETURN ====================

  return {
    // Conversations
    conversations,
    loadingConversations,
    refreshConversations,

    // Current conversation
    currentConversation,
    setCurrentConversation,

    // Messages
    messages,
    loadingMessages,
    hasMoreMessages,
    loadMessages,
    loadMoreMessages,

    // Send
    sendMessage,
    sending,

    // Typing
    typingUsers,
    setTyping,

    // Read
    markAsRead,

    // Counts
    totalUnreadCount,
    missedCallsCount,

    // Search
    searchConversations,
    searchMessages,

    // Actions
    startCall,
    pinConversation,
    muteConversation,
    deleteConversation,
    deleteMessage,
    addReaction,
    removeReaction,

    // Create conversation
    getOrCreateConversation,

    // Status
    isOnline,
    error,
  };
}

export default useUnifiedMessaging;
