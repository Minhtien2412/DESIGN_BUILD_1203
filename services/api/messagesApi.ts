/**
 * Messages API Client
 * Delegates to conversations.service.ts (canonical) for all messaging operations.
 * Keeps legacy type shapes for backward compatibility with existing callers.
 *
 * @deprecated Prefer conversations.service.ts directly for new code.
 */

import type {
    Conversation as CanonicalConversation,
    Message as CanonicalMessage,
} from "./conversations.service";
import * as conversationsApi from "./conversations.service";

// ==================== TYPES (kept for backward compatibility) ====================

export interface Message {
  id: number;
  content: string;
  senderId: number;
  conversationId: number;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  type?: "text" | "image" | "voice" | "file" | "video" | "system";
  sender: {
    id: number;
    name: string;
    email: string;
    role: "CLIENT" | "ENGINEER" | "ADMIN";
  };
}

export interface Conversation {
  id: number;
  participants: {
    id: number;
    name: string;
    email: string;
    role: "CLIENT" | "ENGINEER" | "ADMIN";
  }[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessageQueryParams {
  page?: number;
  limit?: number;
  before?: string;
}

export interface SendMessageDto {
  recipientId: number;
  conversationId?: number;
  content: string;
  attachmentUrl?: string;
  attachmentType?: "image" | "video" | "voice" | "file";
  attachmentName?: string;
  attachmentSize?: number;
}

// ==================== TYPE CONVERTERS ====================

function convertCanonicalMessage(msg: CanonicalMessage): Message {
  return {
    id: parseInt(msg.id, 10) || Date.now(),
    content: msg.content,
    senderId: msg.senderId,
    conversationId: parseInt(msg.conversationId, 10) || 0,
    isRead: !msg.isDeleted,
    createdAt: msg.createdAt,
    updatedAt: msg.updatedAt,
    type: (msg.type?.toLowerCase() as Message["type"]) || "text",
    sender: {
      id: msg.sender?.id || msg.senderId,
      name: msg.sender?.name || "Unknown",
      email: "",
      role: "CLIENT",
    },
  };
}

function convertCanonicalConversation(
  conv: CanonicalConversation,
): Conversation {
  return {
    id: parseInt(conv.id, 10) || Date.now(),
    participants:
      conv.participants?.map((p) => ({
        id: p.userId,
        name: p.user?.name || p.nickname || "",
        email: "",
        role: (p.role === "ADMIN" ? "ADMIN" : "CLIENT") as
          | "CLIENT"
          | "ENGINEER"
          | "ADMIN",
      })) || [],
    unreadCount: conv.unreadCount || 0,
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt,
  };
}

// ==================== MOCK DATA (Demo fallback) ====================

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    participants: [
      {
        id: 2,
        name: "Nguyễn Văn Kiến",
        email: "kien@thietkeresort.vn",
        role: "ENGINEER",
      },
    ],
    lastMessage: {
      id: 101,
      content: "Bản vẽ phối cảnh đã hoàn thành, anh kiểm tra nhé!",
      senderId: 2,
      conversationId: 1,
      isRead: false,
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
      sender: {
        id: 2,
        name: "Nguyễn Văn Kiến",
        email: "kien@thietkeresort.vn",
        role: "ENGINEER",
      },
    },
    unreadCount: 2,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 2,
    participants: [
      {
        id: 3,
        name: "Trần Minh Hoàng",
        email: "hoang@client.com",
        role: "CLIENT",
      },
    ],
    lastMessage: {
      id: 102,
      content: "Cảm ơn team, tôi rất hài lòng với thiết kế!",
      senderId: 3,
      conversationId: 2,
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      sender: {
        id: 3,
        name: "Trần Minh Hoàng",
        email: "hoang@client.com",
        role: "CLIENT",
      },
    },
    unreadCount: 0,
    createdAt: "2025-01-05T00:00:00Z",
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 3,
    participants: [
      {
        id: 4,
        name: "Lê Thị Admin",
        email: "admin@thietkeresort.vn",
        role: "ADMIN",
      },
    ],
    lastMessage: {
      id: 103,
      content: "Meeting dự án mới lúc 2pm nhé team.",
      senderId: 4,
      conversationId: 3,
      isRead: false,
      createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      sender: {
        id: 4,
        name: "Lê Thị Admin",
        email: "admin@thietkeresort.vn",
        role: "ADMIN",
      },
    },
    unreadCount: 1,
    createdAt: "2025-01-10T00:00:00Z",
    updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
];

// ==================== DEDUPLICATION ====================

let conversationsFetchInProgress = false;
let cachedConversations: Conversation[] | null = null;
let lastConversationsFetchTime = 0;
const CONVERSATIONS_CACHE_MS = 5000;

// ==================== API METHODS (delegates to conversations.service) ====================

/**
 * Get all conversations for current user
 * Delegates to: conversationsApi.getConversations()
 */
export async function getConversations(): Promise<Conversation[]> {
  const now = Date.now();

  if (
    cachedConversations &&
    now - lastConversationsFetchTime < CONVERSATIONS_CACHE_MS
  ) {
    return cachedConversations;
  }

  if (conversationsFetchInProgress) {
    if (cachedConversations) return cachedConversations;
    return MOCK_CONVERSATIONS;
  }

  conversationsFetchInProgress = true;

  try {
    const response = await conversationsApi.getConversations({ limit: 50 });
    const result = response.items.map(convertCanonicalConversation);
    cachedConversations = result;
    lastConversationsFetchTime = Date.now();
    return result;
  } catch (error) {
    console.error("[messagesApi] getConversations error:", error);
    console.log("[messagesApi] Using mock conversations data");
    cachedConversations = MOCK_CONVERSATIONS;
    lastConversationsFetchTime = Date.now();
    return MOCK_CONVERSATIONS;
  } finally {
    conversationsFetchInProgress = false;
  }
}

/**
 * Get messages in a specific conversation
 * Delegates to: conversationsApi.getMessages()
 */
export async function getMessages(
  conversationId: number,
  params?: MessageQueryParams,
): Promise<Message[]> {
  try {
    const response = await conversationsApi.getMessages(
      String(conversationId),
      {
        limit: params?.limit || 50,
        cursor: params?.before,
        direction: params?.before ? "before" : undefined,
      },
    );
    return response.items.map(convertCanonicalMessage);
  } catch (error) {
    console.error("[messagesApi] getMessages error:", error);
    return [];
  }
}

/**
 * Send a message
 * Delegates to: conversationsApi.sendMessage()
 */
export async function sendMessage(dto: SendMessageDto): Promise<Message> {
  try {
    const convId = dto.conversationId
      ? String(dto.conversationId)
      : String(dto.recipientId);

    // If no conversationId, create or get direct conversation first
    let targetConvId = convId;
    if (!dto.conversationId || dto.conversationId <= 0) {
      try {
        const conv = await conversationsApi.createOrGetDirectConversation(
          dto.recipientId,
        );
        targetConvId = conv.id;
      } catch {
        targetConvId = convId;
      }
    }

    const attachments = dto.attachmentUrl
      ? [
          {
            type: (dto.attachmentType || "file") as
              | "image"
              | "video"
              | "file"
              | "audio",
            url: dto.attachmentUrl,
            name: dto.attachmentName,
            size: dto.attachmentSize,
          },
        ]
      : undefined;

    const response = await conversationsApi.sendMessage(targetConvId, {
      clientMessageId: conversationsApi.generateClientMessageId(),
      content: dto.content,
      type: "TEXT",
      attachments,
    });

    return convertCanonicalMessage(response);
  } catch (error) {
    console.error("[messagesApi] sendMessage error:", error);
    // Return mock for demo
    return {
      id: Date.now(),
      content: dto.content,
      senderId: 1,
      conversationId: dto.recipientId,
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: { id: 1, name: "You", email: "you@example.com", role: "CLIENT" },
    };
  }
}

/**
 * Mark a message as read
 * Delegates to: conversationsApi.markAsRead()
 */
export async function markAsRead(messageId: number): Promise<void> {
  // The canonical API marks by conversation, not individual message.
  // For backward compat, this is a best-effort operation.
  try {
    // We don't have conversationId here, so try with the messageId as a fallback
    await conversationsApi.markAsRead(String(messageId));
  } catch {
    // Silent fail for marking as read - not critical
  }
}

/**
 * Mark all messages in a conversation as read
 * Delegates to: conversationsApi.markAsRead()
 */
export async function markAllAsRead(conversationId: number): Promise<void> {
  if (!conversationId || conversationId <= 0) {
    return;
  }

  try {
    await conversationsApi.markAsRead(String(conversationId));
  } catch {
    // Silent fail - not critical
  }
}

/**
 * Get unread message count
 * Delegates to: conversationsApi.getConversations() and sums unreadCount
 */
export async function getUnreadCount(): Promise<{ count: number }> {
  try {
    const response = await conversationsApi.getConversations({ limit: 100 });
    const totalUnread = response.items.reduce(
      (sum, conv) => sum + (conv.unreadCount || 0),
      0,
    );
    return { count: totalUnread };
  } catch {
    return {
      count: MOCK_CONVERSATIONS.reduce((sum, c) => sum + c.unreadCount, 0),
    };
  }
}

/**
 * Get or create conversation with a specific user
 * Delegates to: conversationsApi.createOrGetDirectConversation()
 */
export async function getConversationByRecipient(
  recipientId: number,
): Promise<Conversation | null> {
  try {
    const conv =
      await conversationsApi.createOrGetDirectConversation(recipientId);
    return convertCanonicalConversation(conv);
  } catch (error) {
    console.error("[messagesApi] getConversationByRecipient error:", error);
    return null;
  }
}

// ==================== SEARCH MESSAGES ====================

export interface SearchMessagesParams {
  query: string;
  conversationId?: string;
  senderId?: number;
  dateFrom?: string;
  dateTo?: string;
  hasAttachment?: boolean;
  limit?: number;
}

export interface SearchMessagesResponse {
  messages: {
    id: string;
    conversationId: string;
    content: string;
    senderId: number;
    sender?: { name: string };
    createdAt: string;
  }[];
  total: number;
}

/**
 * Search messages across conversations
 * Delegates to: conversationsApi.searchMessages()
 */
export async function searchMessages(
  params: SearchMessagesParams,
): Promise<SearchMessagesResponse> {
  try {
    if (!params.conversationId) {
      return { messages: [], total: 0 };
    }

    const results = await conversationsApi.searchMessages(
      params.conversationId,
      params.query,
      params.limit,
    );

    return {
      messages: results.map((msg) => ({
        id: msg.id,
        conversationId: msg.conversationId,
        content: msg.content,
        senderId: msg.senderId,
        sender: msg.sender ? { name: msg.sender.name } : undefined,
        createdAt: msg.createdAt,
      })),
      total: results.length,
    };
  } catch (error) {
    console.error("[messagesApi] searchMessages error:", error);
    return { messages: [], total: 0 };
  }
}

// ==================== CREATE ROOM ====================

export interface CreateRoomDto {
  name: string;
  projectId?: number;
  memberIds: number[];
}

/**
 * Create a new chat room
 * Delegates to: conversationsApi.createGroupConversation()
 */
export async function createRoom(dto: CreateRoomDto): Promise<Conversation> {
  try {
    const conv = await conversationsApi.createGroupConversation({
      title: dto.name,
      participantIds: dto.memberIds,
    });
    return convertCanonicalConversation(conv);
  } catch (error) {
    console.error("[messagesApi] createRoom error:", error);
    throw error;
  }
}

// ==================== EXPORTS ====================

export const messagesApi = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  getConversationByRecipient,
  searchMessages,
  createRoom,
};

export default messagesApi;
