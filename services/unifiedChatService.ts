/**
 * Unified Chat Service
 * =====================
 * Service adapter chuyển đổi dữ liệu từ conversations.service (canonical)
 * sang format của useUnifiedMessaging (UI)
 *
 * Backend API: https://baotienweb.cloud/api/v1/conversations
 *
 * @author AI Assistant
 * @date 12/01/2026
 */

import type {
    UnifiedConversation,
    UnifiedMessage,
} from "@/hooks/crm/useUnifiedMessaging";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Conversation, Message } from "./api/conversations.service";
import * as conversationsApi from "./api/conversations.service";

const CACHE_KEY_CONVERSATIONS = "@chat_conversations";
const CACHE_KEY_MESSAGES = "@chat_messages_";

// ==================== CONVERTERS ====================

/**
 * Convert Conversation from canonical API -> UnifiedConversation for UI
 */
export function convertRoomToConversation(
  conv: Conversation,
): UnifiedConversation {
  return {
    id: conv.id,
    type: conv.type === "DIRECT" ? "direct" : "group",
    name:
      conv.title ||
      conv.participants
        ?.map((p) => p.user?.name)
        .filter(Boolean)
        .join(", ") ||
      "Chat",
    avatar: conv.avatarUrl,
    participants:
      conv.participants?.map((p) => ({
        id: p.userId,
        name: p.user?.name || p.nickname || "",
        email: "",
        avatar: p.user?.avatar,
        role: p.role === "ADMIN" || p.role === "OWNER" ? "admin" : "member",
        onlineStatus: "offline" as const,
        lastSeen: undefined,
      })) || [],
    lastMessage: conv.lastMessagePreview
      ? ({
          id: conv.lastMessageId || "",
          conversationId: conv.id,
          senderId: 0,
          content: conv.lastMessagePreview,
          type: "text",
          deliveryStatus: "delivered" as const,
          isRead: false,
          createdAt: conv.lastMessageAt || conv.updatedAt,
          updatedAt: conv.lastMessageAt || conv.updatedAt,
        } as UnifiedMessage)
      : undefined,
    unreadCount: conv.unreadCount || 0,
    isPinned: conv.participants?.[0]?.isPinned || false,
    isMuted: conv.participants?.[0]?.isMuted || false,
    isBlocked: false,
    isOnline: false,
    typingUsers: [],
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt,
  };
}

/**
 * Convert Message from canonical API -> UnifiedMessage for UI
 */
export function convertChatMessage(msg: Message): UnifiedMessage {
  return {
    id: msg.id,
    conversationId: msg.conversationId,
    senderId: msg.senderId,
    sender: msg.sender
      ? {
          id: msg.sender.id,
          name: msg.sender.name,
          avatar: msg.sender.avatar,
          onlineStatus: "offline" as const,
        }
      : ({ id: 0, name: "Unknown", onlineStatus: "offline" as const } as any),
    type:
      msg.type === "SYSTEM"
        ? "text"
        : (msg.type?.toLowerCase() as any) || "text",
    content: msg.content,
    mediaUrl: msg.attachments?.[0]?.url,
    fileName: msg.attachments?.[0]?.name,
    fileSize: msg.attachments?.[0]?.size,
    thumbnail: msg.thumbnailUrl,
    deliveryStatus: msg.isDeleted ? "failed" : "delivered",
    isRead: false,
    readBy: [],
    reactions:
      msg.reactions?.map((r) => ({
        emoji: r.emoji,
        userId: r.userId,
        userName: r.user?.name || "",
      })) || [],
    createdAt: msg.createdAt,
    updatedAt: msg.updatedAt,
    replyTo: msg.replyToMessage
      ? {
          id: msg.replyToMessage.id,
          content: msg.replyToMessage.content,
          senderName: msg.replyToMessage.sender?.name || "Unknown",
        }
      : undefined,
  };
}

// ==================== SERVICE METHODS ====================

/**
 * Fetch all conversations from API
 * Caches result in AsyncStorage for offline use
 */
export async function getConversations(): Promise<UnifiedConversation[]> {
  try {
    const response = await conversationsApi.getConversations({ limit: 50 });
    const conversations = response.items.map(convertRoomToConversation);

    // Cache for offline
    await AsyncStorage.setItem(
      CACHE_KEY_CONVERSATIONS,
      JSON.stringify(conversations),
    );

    return conversations;
  } catch (error) {
    console.error("[UnifiedChatService] Error fetching conversations:", error);

    // Try to load from cache if API fails
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY_CONVERSATIONS);
      if (cached) {
        console.log("[UnifiedChatService] Using cached conversations");
        return JSON.parse(cached);
      }
    } catch (cacheError) {
      console.error("[UnifiedChatService] Cache error:", cacheError);
    }

    throw error;
  }
}

/**
 * Fetch messages for a conversation
 * @param conversationId - Conversation UUID
 * @param params - Query params (limit, cursor)
 */
export async function getMessages(
  conversationId: string,
  params?: { limit?: number; cursor?: string },
): Promise<UnifiedMessage[]> {
  try {
    const response = await conversationsApi.getMessages(conversationId, {
      limit: params?.limit,
      cursor: params?.cursor,
    });
    const unified = response.items.map(convertChatMessage);

    // Cache messages
    const cacheKey = `${CACHE_KEY_MESSAGES}${conversationId}`;
    await AsyncStorage.setItem(cacheKey, JSON.stringify(unified));

    return unified;
  } catch (error) {
    console.error(
      "[UnifiedChatService] Error fetching messages:",
      conversationId,
      error,
    );

    // Try cache
    try {
      const cacheKey = `${CACHE_KEY_MESSAGES}${conversationId}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        console.log("[UnifiedChatService] Using cached messages");
        return JSON.parse(cached);
      }
    } catch (cacheError) {
      console.error("[UnifiedChatService] Cache error:", cacheError);
    }

    throw error;
  }
}

/**
 * Send a message to a conversation
 * @param conversationId - Conversation UUID
 * @param content - Message text content
 * @param attachments - Optional attachment URLs
 */
export async function sendMessage(
  conversationId: string,
  content: string,
  attachments?: string[],
): Promise<UnifiedMessage> {
  try {
    const attachmentDtos = attachments?.map((url) => ({
      type: "file" as const,
      url,
    }));

    const message = await conversationsApi.sendMessage(conversationId, {
      clientMessageId: conversationsApi.generateClientMessageId(),
      content,
      type: "TEXT",
      attachments: attachmentDtos,
    });

    return convertChatMessage(message);
  } catch (error) {
    console.error("[UnifiedChatService] Error sending message:", error);
    throw error;
  }
}

/**
 * Mark conversation as read
 */
export async function markAsRead(conversationId: string): Promise<void> {
  try {
    await conversationsApi.markAsRead(conversationId);
  } catch (error) {
    console.error("[UnifiedChatService] Error marking as read:", error);
    throw error;
  }
}

/**
 * Create a new conversation/room
 * @param name - Room name
 * @param memberIds - Array of user IDs to add
 * @param projectId - Optional project ID (unused by canonical API)
 * @param isGroup - Whether it's a group chat
 */
export async function createConversation(
  name: string,
  memberIds: number[],
  projectId?: number,
  isGroup?: boolean,
): Promise<UnifiedConversation> {
  try {
    let conv: Conversation;
    if (!isGroup && memberIds.length === 1) {
      conv = await conversationsApi.createOrGetDirectConversation(memberIds[0]);
    } else {
      conv = await conversationsApi.createGroupConversation({
        title: name,
        participantIds: memberIds,
      });
    }
    return convertRoomToConversation(conv);
  } catch (error) {
    console.error("[UnifiedChatService] Error creating conversation:", error);
    throw error;
  }
}

/**
 * Add members to an existing conversation
 */
export async function addMembersToConversation(
  conversationId: string,
  memberIds: number[],
): Promise<void> {
  try {
    await conversationsApi.addParticipants(conversationId, memberIds);
  } catch (error) {
    console.error("[UnifiedChatService] Error adding members:", error);
    throw error;
  }
}

/**
 * Remove member from conversation
 */
export async function removeMemberFromConversation(
  conversationId: string,
  memberId: number,
): Promise<void> {
  try {
    await conversationsApi.removeParticipant(conversationId, memberId);
  } catch (error) {
    console.error("[UnifiedChatService] Error removing member:", error);
    throw error;
  }
}

/**
 * Clear cached data (for logout or sync issues)
 */
export async function clearCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY_CONVERSATIONS);
    // Clear all message caches (they start with CACHE_KEY_MESSAGES)
    const allKeys = await AsyncStorage.getAllKeys();
    const messageKeys = allKeys.filter((key) =>
      key.startsWith(CACHE_KEY_MESSAGES),
    );
    if (messageKeys.length > 0) {
      await AsyncStorage.multiRemove(messageKeys);
    }
    console.log("[UnifiedChatService] Cache cleared");
  } catch (error) {
    console.error("[UnifiedChatService] Error clearing cache:", error);
  }
}

// ==================== AI CHAT INTEGRATION ====================

import {
    CSKH_INFO,
    getAIBotUserInfo,
    getOrCreateConversation as getOrCreateAIConversation,
    isAIBotUser,
    sendCSKHMessage,
} from "./aiCustomerSupport";

/**
 * Kiểm tra conversation với AI bot
 */
export function isAIConversation(
  conversationIdOrUserId: string | number,
): boolean {
  return isAIBotUser(conversationIdOrUserId);
}

/**
 * Gửi tin nhắn (tự động route đến AI hoặc WebSocket)
 */
export async function sendMessageSmart(
  conversationId: string,
  content: string,
  userId: string,
  recipientId?: string,
): Promise<UnifiedMessage | null> {
  // Nếu recipient là AI bot, gửi qua AI service
  if (recipientId && isAIBotUser(recipientId)) {
    return sendMessageToAI(conversationId, content, userId);
  }

  // Ngược lại gửi qua WebSocket/REST API
  return sendMessage(conversationId, content);
}

/**
 * Gửi tin nhắn đến AI CSKH
 */
export async function sendMessageToAI(
  conversationId: string,
  content: string,
  userId: string,
): Promise<UnifiedMessage | null> {
  try {
    console.log("[UnifiedChatService] Routing message to AI CSKH");

    // Get/create AI conversation
    const aiConversation = await getOrCreateAIConversation(userId);

    // Send to AI
    const response = await sendCSKHMessage(
      userId,
      aiConversation.id,
      content,
      aiConversation.messages,
    );

    if (response.success && response.data) {
      const now = new Date().toISOString();
      // Return AI response as UnifiedMessage
      return {
        id: response.data.messageId,
        conversationId: conversationId,
        senderId: parseInt(CSKH_INFO.AI_USER_ID) || 0,
        sender: {
          id: parseInt(CSKH_INFO.AI_USER_ID) || 0,
          name: CSKH_INFO.name,
          avatar: CSKH_INFO.avatar,
          onlineStatus: "online" as const,
        },
        content: response.data.reply,
        type: "text",
        deliveryStatus: "delivered" as const,
        isRead: false,
        createdAt: now,
        updatedAt: now,
      } as UnifiedMessage;
    }

    console.error("[UnifiedChatService] AI response failed:", response.error);
    return null;
  } catch (error) {
    console.error("[UnifiedChatService] Error sending to AI:", error);
    throw error;
  }
}

/**
 * Lấy AI Bot conversation (để hiển thị trong danh sách)
 */
export function getAIConversation(): UnifiedConversation {
  const botInfo = getAIBotUserInfo();
  const now = new Date().toISOString();
  return {
    id: `ai-${CSKH_INFO.AI_USER_ID}`,
    type: "direct",
    name: botInfo.name,
    avatar: botInfo.avatar,
    participants: [
      {
        id: parseInt(botInfo.id) || 0,
        name: botInfo.name,
        email: "cskh@thietkeresort.vn",
        avatar: botInfo.avatar,
        role: "support",
        onlineStatus: "online",
        lastSeen: undefined,
      },
    ],
    lastMessage: undefined,
    unreadCount: 0,
    isPinned: true, // Pin AI support at top
    isMuted: false,
    isBlocked: false,
    isOnline: true,
    typingUsers: [],
    createdAt: now,
    updatedAt: now,
    metadata: {
      isAIBot: true,
    },
  } as UnifiedConversation;
}

// Re-export AI utilities
export { CSKH_INFO, getAIBotUserInfo, isAIBotUser };

// ==================== EXPORTS ====================

export const UnifiedChatService = {
  getConversations,
  getMessages,
  sendMessage,
  sendMessageSmart,
  sendMessageToAI,
  markAsRead,
  createConversation,
  addMembersToConversation,
  removeMemberFromConversation,
  clearCache,
  // AI Chat
  isAIConversation,
  getAIConversation,
  isAIBotUser,
  // Expose converters for testing/debugging
  convertRoomToConversation,
  convertChatMessage,
};

export default UnifiedChatService;
