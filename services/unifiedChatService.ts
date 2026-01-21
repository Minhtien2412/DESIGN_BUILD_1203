/**
 * Unified Chat Service
 * =====================
 * Service adapter chuyển đổi dữ liệu từ chatApi (backend)
 * sang format của useUnifiedMessaging (UI)
 *
 * Backend API: https://baotienweb.cloud/api/v1/chat
 *
 * @author AI Assistant
 * @date 12/01/2026
 */

import type {
    UnifiedConversation,
    UnifiedMessage,
} from "@/hooks/crm/useUnifiedMessaging";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as chatApi from "./api/chatApi";

const CACHE_KEY_CONVERSATIONS = "@chat_conversations";
const CACHE_KEY_MESSAGES = "@chat_messages_";

// ==================== CONVERTERS ====================

/**
 * Convert ChatRoom from API -> UnifiedConversation for UI
 */
export function convertRoomToConversation(
  room: chatApi.ChatRoom
): UnifiedConversation {
  return {
    id: room.id.toString(),
    type: room.isGroup ? "group" : "direct",
    name: room.name,
    avatar: undefined, // TODO: Add avatar from room or first member
    participants: room.members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      avatar: undefined,
      role: m.user.role,
      onlineStatus: "offline" as const, // TODO: Get from WebSocket presence
      lastSeen: undefined,
    })),
    lastMessage: room.lastMessage
      ? convertChatMessage(room.lastMessage)
      : undefined,
    unreadCount: room.unreadCount,
    isPinned: false, // TODO: Get from user settings API
    isMuted: false, // TODO: Get from user settings API
    isBlocked: false,
    isOnline: false, // TODO: Get from WebSocket presence
    typingUsers: [],
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
  };
}

/**
 * Convert ChatMessage from API -> UnifiedMessage for UI
 */
export function convertChatMessage(msg: chatApi.ChatMessage): UnifiedMessage {
  return {
    id: msg.id.toString(),
    conversationId: msg.roomId.toString(),
    senderId: msg.senderId,
    sender: {
      id: msg.sender.id,
      name: msg.sender.name,
      email: msg.sender.email,
      avatar: undefined,
      onlineStatus: "offline" as const,
    },
    type: msg.type === "system" ? "text" : msg.type,
    content: msg.content,
    // Media
    mediaUrl: msg.attachments?.[0]?.url,
    fileName: msg.attachments?.[0]?.name,
    fileSize: msg.attachments?.[0]?.size,
    thumbnail: undefined,
    // Status
    deliveryStatus: msg.isRead ? "read" : "delivered",
    isRead: msg.isRead,
    readBy: [],
    reactions: [],
    // Timestamps
    createdAt: msg.createdAt,
    updatedAt: msg.updatedAt,
    replyTo: undefined,
  };
}

// ==================== SERVICE METHODS ====================

/**
 * Fetch all conversations from API
 * Caches result in AsyncStorage for offline use
 */
export async function getConversations(): Promise<UnifiedConversation[]> {
  try {
    const rooms = await chatApi.getRooms();
    const conversations = rooms.map(convertRoomToConversation);

    // Cache for offline
    await AsyncStorage.setItem(
      CACHE_KEY_CONVERSATIONS,
      JSON.stringify(conversations)
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
 * @param conversationId - Conversation ID (room ID)
 * @param params - Query params (limit, offset, before)
 */
export async function getMessages(
  conversationId: string,
  params?: chatApi.MessageQueryParams
): Promise<UnifiedMessage[]> {
  try {
    const roomId = parseInt(conversationId, 10);
    const messages = await chatApi.getRoomMessages(roomId, params);
    const unified = messages.map(convertChatMessage);

    // Cache messages
    const cacheKey = `${CACHE_KEY_MESSAGES}${conversationId}`;
    await AsyncStorage.setItem(cacheKey, JSON.stringify(unified));

    return unified;
  } catch (error) {
    console.error(
      "[UnifiedChatService] Error fetching messages:",
      conversationId,
      error
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
 * @param conversationId - Conversation ID (room ID)
 * @param content - Message text content
 * @param attachments - Optional attachment URLs
 */
export async function sendMessage(
  conversationId: string,
  content: string,
  attachments?: string[]
): Promise<UnifiedMessage> {
  try {
    const roomId = parseInt(conversationId, 10);
    const message = await chatApi.sendMessage({
      roomId,
      content,
      attachments,
    });

    return convertChatMessage(message);
  } catch (error) {
    console.error("[UnifiedChatService] Error sending message:", error);
    throw error;
  }
}

/**
 * Mark conversation as read
 * Clears unread count for the room
 */
export async function markAsRead(conversationId: string): Promise<void> {
  try {
    const roomId = parseInt(conversationId, 10);
    await chatApi.markAsRead(roomId);
  } catch (error) {
    console.error("[UnifiedChatService] Error marking as read:", error);
    throw error;
  }
}

/**
 * Create a new conversation/room
 * @param name - Room name
 * @param memberIds - Array of user IDs to add
 * @param projectId - Optional project ID
 * @param isGroup - Whether it's a group chat
 */
export async function createConversation(
  name: string,
  memberIds: number[],
  projectId?: number,
  isGroup?: boolean
): Promise<UnifiedConversation> {
  try {
    const room = await chatApi.createRoom({
      name,
      memberIds,
      projectId,
      isGroup,
    });

    return convertRoomToConversation(room);
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
  memberIds: number[]
): Promise<void> {
  try {
    // TODO: Implement addMembers API endpoint
    console.warn(
      "[UnifiedChatService] addMembersToConversation not implemented yet"
    );
    // const roomId = parseInt(conversationId, 10);
    // await chatApi.addMembers(roomId, memberIds);
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
  memberId: number
): Promise<void> {
  try {
    // TODO: Implement removeMember API endpoint
    console.warn(
      "[UnifiedChatService] removeMemberFromConversation not implemented yet"
    );
    // const roomId = parseInt(conversationId, 10);
    // await chatApi.removeMember(roomId, memberId);
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
      key.startsWith(CACHE_KEY_MESSAGES)
    );
    if (messageKeys.length > 0) {
      await AsyncStorage.multiRemove(messageKeys);
    }
    console.log("[UnifiedChatService] Cache cleared");
  } catch (error) {
    console.error("[UnifiedChatService] Error clearing cache:", error);
  }
}

// ==================== EXPORTS ====================

export const UnifiedChatService = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  createConversation,
  addMembersToConversation,
  removeMemberFromConversation,
  clearCache,
  // Expose converters for testing/debugging
  convertRoomToConversation,
  convertChatMessage,
};

export default UnifiedChatService;
