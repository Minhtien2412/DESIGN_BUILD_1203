/**
 * useConversations Hook
 * =====================
 *
 * Hook quản lý danh sách conversations
 *
 * Features:
 * - Load conversations with pagination
 * - Realtime updates (new messages, read receipts)
 * - Unread count tracking
 * - Create new conversations
 *
 * Usage:
 * ```tsx
 * const { conversations, isLoading, createDirect, createGroup } = useConversations();
 * ```
 */

import { useAuth } from "@/context/AuthContext";
import { del, get, patch, post } from "@/services/api";
import {
    NewMessage,
    ReadReceipt,
    realtimeMessaging,
} from "@/services/realtime-messaging.service";
import { useCallback, useEffect, useState } from "react";

// ============================================
// TYPES
// ============================================

export interface Participant {
  id: number;
  userId: number;
  name: string;
  avatar?: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  lastReadSeq: number;
  unreadCount: number;
}

export interface Conversation {
  id: string;
  type: "DIRECT" | "GROUP";
  name?: string;
  avatar?: string;
  participants: Participant[];
  lastMessage?: {
    id: string;
    content?: string;
    preview: string;
    senderId: number;
    senderName: string;
    createdAt: Date;
  };
  unreadCount: number;
  myRole: "OWNER" | "ADMIN" | "MEMBER";
  muted: boolean;
  pinnedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // For DIRECT conversations
  otherUser?: {
    id: number;
    name: string;
    avatar?: string;
    isOnline?: boolean;
  };
}

export interface UseConversationsOptions {
  autoLoad?: boolean;
  pageSize?: number;
  unreadOnly?: boolean;
}

export interface UseConversationsReturn {
  conversations: Conversation[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  totalUnread: number;

  // Actions
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  createDirectConversation: (userId: number) => Promise<Conversation>;
  createGroupConversation: (
    name: string,
    participantIds: number[],
  ) => Promise<Conversation>;
  getConversation: (id: string) => Promise<Conversation>;
  markAsRead: (conversationId: string) => Promise<void>;
  muteConversation: (conversationId: string, muted: boolean) => Promise<void>;
  pinConversation: (conversationId: string, pinned: boolean) => Promise<void>;
  leaveConversation: (conversationId: string) => Promise<void>;
  addParticipants: (conversationId: string, userIds: number[]) => Promise<void>;
  removeParticipant: (conversationId: string, userId: number) => Promise<void>;
}

// ============================================
// HOOK
// ============================================

export function useConversations(
  options: UseConversationsOptions = {},
): UseConversationsReturn {
  const { autoLoad = true, pageSize = 20, unreadOnly = false } = options;

  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | undefined>();

  // ============================================
  // LOAD CONVERSATIONS
  // ============================================

  const loadConversations = useCallback(
    async (loadMore = false) => {
      if (isLoading) return;

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: String(pageSize),
        });

        if (loadMore && cursor) {
          params.set("cursor", cursor);
        }

        if (unreadOnly) {
          params.set("unreadOnly", "true");
        }

        const response = await get<{
          conversations: any[];
          hasMore: boolean;
          nextCursor?: string;
          totalUnread: number;
        }>(`/conversations?${params}`);

        const mapped: Conversation[] = response.conversations.map((c) => ({
          id: c.id,
          type: c.type,
          name: c.name,
          avatar: c.avatar,
          participants: c.participants,
          lastMessage: c.lastMessage
            ? {
                id: c.lastMessage.id,
                content: c.lastMessage.content,
                preview: c.lastMessage.preview || c.lastMessage.content,
                senderId: c.lastMessage.senderId,
                senderName: c.lastMessage.senderName,
                createdAt: new Date(c.lastMessage.createdAt),
              }
            : undefined,
          unreadCount: c.unreadCount,
          myRole: c.myRole,
          muted: c.muted || false,
          pinnedAt: c.pinnedAt ? new Date(c.pinnedAt) : undefined,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          otherUser: c.otherUser,
        }));

        if (loadMore) {
          setConversations((prev) => [...prev, ...mapped]);
        } else {
          setConversations(mapped);
        }

        setHasMore(response.hasMore);
        setCursor(response.nextCursor);
      } catch (err: any) {
        setError(err.message || "Failed to load conversations");
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize, unreadOnly, cursor, isLoading],
  );

  const loadMore = useCallback(
    () => loadConversations(true),
    [loadConversations],
  );
  const refresh = useCallback(() => {
    setCursor(undefined);
    return loadConversations(false);
  }, [loadConversations]);

  // ============================================
  // REALTIME UPDATES
  // ============================================

  useEffect(() => {
    const handleNewMessage = (payload: NewMessage) => {
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === payload.conversationId);

        if (index === -1) {
          // New conversation - refresh list
          refresh();
          return prev;
        }

        const updated = [...prev];
        const conversation = { ...updated[index] };

        // Update last message
        conversation.lastMessage = {
          id: payload.messageId,
          content: payload.content,
          preview: payload.content || "",
          senderId: payload.senderId,
          senderName: payload.senderName,
          createdAt: new Date(payload.createdAt),
        };

        // Increment unread if not from me
        const userId = user?.id ? Number(user.id) : undefined;
        if (payload.senderId !== userId) {
          conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        }

        conversation.updatedAt = new Date();

        // Remove from current position and add to top
        updated.splice(index, 1);
        updated.unshift(conversation);

        return updated;
      });
    };

    const handleReadReceipt = (_payload: ReadReceipt) => {
      // Update unread count when someone reads (for typing indicators etc)
    };

    const handleConversationUpdated = (payload: any) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === payload.conversationId) {
            return {
              ...c,
              name: payload.changes.name ?? c.name,
              avatar: payload.changes.avatar ?? c.avatar,
            };
          }
          return c;
        }),
      );
    };

    realtimeMessaging.on("message", handleNewMessage);
    realtimeMessaging.on("readReceipt", handleReadReceipt);
    realtimeMessaging.on("conversationUpdated", handleConversationUpdated);

    return () => {
      realtimeMessaging.off("message", handleNewMessage);
      realtimeMessaging.off("readReceipt", handleReadReceipt);
      realtimeMessaging.off("conversationUpdated", handleConversationUpdated);
    };
  }, [user?.id, refresh]);

  // ============================================
  // INITIAL LOAD
  // ============================================

  useEffect(() => {
    if (autoLoad) {
      loadConversations();
    }
  }, [autoLoad]);

  // ============================================
  // ACTIONS
  // ============================================

  const createDirectConversation = useCallback(
    async (userId: number): Promise<Conversation> => {
      const response = await post<any>("/conversations/direct", {
        participantId: userId,
      });

      const conversation: Conversation = {
        id: response.id,
        type: "DIRECT",
        participants: response.participants,
        unreadCount: 0,
        myRole: "MEMBER",
        muted: false,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
        otherUser: response.otherUser,
      };

      // Add to list if not exists
      setConversations((prev) => {
        if (prev.find((c) => c.id === conversation.id)) {
          return prev;
        }
        return [conversation, ...prev];
      });

      return conversation;
    },
    [],
  );

  const createGroupConversation = useCallback(
    async (name: string, participantIds: number[]): Promise<Conversation> => {
      const response = await post<any>("/conversations/group", {
        name,
        participantIds,
      });

      const conversation: Conversation = {
        id: response.id,
        type: "GROUP",
        name: response.name,
        avatar: response.avatar,
        participants: response.participants,
        unreadCount: 0,
        myRole: "OWNER",
        muted: false,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      };

      setConversations((prev) => [conversation, ...prev]);

      return conversation;
    },
    [],
  );

  const getConversation = useCallback(
    async (id: string): Promise<Conversation> => {
      const response = await get<any>(`/conversations/${id}`);

      return {
        id: response.id,
        type: response.type,
        name: response.name,
        avatar: response.avatar,
        participants: response.participants,
        lastMessage: response.lastMessage,
        unreadCount: response.unreadCount,
        myRole: response.myRole,
        muted: response.muted || false,
        pinnedAt: response.pinnedAt ? new Date(response.pinnedAt) : undefined,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
        otherUser: response.otherUser,
      };
    },
    [],
  );

  const markAsRead = useCallback(async (conversationId: string) => {
    await post(`/conversations/${conversationId}/read`, {});

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return { ...c, unreadCount: 0 };
        }
        return c;
      }),
    );
  }, []);

  const muteConversation = useCallback(
    async (conversationId: string, muted: boolean) => {
      await patch(`/conversations/${conversationId}`, { muted });

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            return { ...c, muted };
          }
          return c;
        }),
      );
    },
    [],
  );

  const pinConversation = useCallback(
    async (conversationId: string, pinned: boolean) => {
      await patch(`/conversations/${conversationId}`, {
        pinnedAt: pinned ? new Date().toISOString() : null,
      });

      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id === conversationId) {
            return { ...c, pinnedAt: pinned ? new Date() : undefined };
          }
          return c;
        });

        // Sort: pinned first, then by updatedAt
        return updated.sort((a, b) => {
          if (a.pinnedAt && !b.pinnedAt) return -1;
          if (!a.pinnedAt && b.pinnedAt) return 1;
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        });
      });
    },
    [],
  );

  const leaveConversation = useCallback(async (conversationId: string) => {
    await post(`/conversations/${conversationId}/leave`, {});

    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
  }, []);

  const addParticipants = useCallback(
    async (conversationId: string, userIds: number[]) => {
      const response = await post<any>(
        `/conversations/${conversationId}/participants`,
        {
          userIds,
        },
      );

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            return { ...c, participants: response.participants };
          }
          return c;
        }),
      );
    },
    [],
  );

  const removeParticipant = useCallback(
    async (conversationId: string, userId: number) => {
      await del(`/conversations/${conversationId}/participants/${userId}`);

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              participants: c.participants.filter((p) => p.userId !== userId),
            };
          }
          return c;
        }),
      );
    },
    [],
  );

  // ============================================
  // COMPUTED
  // ============================================

  const totalUnread = conversations.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0,
  );

  return {
    conversations,
    isLoading,
    hasMore,
    error,
    totalUnread,
    loadMore,
    refresh,
    createDirectConversation,
    createGroupConversation,
    getConversation,
    markAsRead,
    muteConversation,
    pinConversation,
    leaveConversation,
    addParticipants,
    removeParticipant,
  };
}

export default useConversations;
