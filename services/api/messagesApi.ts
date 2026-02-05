/**
 * Messages API Client
 * Handles real-time messaging and conversations
 * Backend: https://baotienweb.cloud/api/v1/messages
 */

import { getAccessToken } from "@/services/token.service";
import { getItem } from "@/utils/storage";
import ENV from "../../config/env";

// Backend uses /chat for chat rooms, /conversation-messages for DM conversations
const CHAT_URL = `${ENV.API_BASE_URL}/chat`;
const MESSAGES_URL = `${ENV.API_BASE_URL}/conversation-messages`;

// Flag to enable mock data when API fails
const USE_MOCK_FALLBACK = false;

// ==================== TYPES ====================

export interface Message {
  id: number;
  content: string;
  senderId: number;
  conversationId: number;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  type?: "text" | "image" | "voice" | "file" | "video" | "system"; // Message type
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
  before?: string; // ISO date for pagination
}

export interface SendMessageDto {
  recipientId: number;
  conversationId?: number;
  content: string;
  // Attachment support
  attachmentUrl?: string;
  attachmentType?: "image" | "video" | "voice" | "file";
  attachmentName?: string;
  attachmentSize?: number;
}

// ==================== MOCK DATA (Demo) ====================

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

// ==================== AUTH HELPER ====================

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = (await getAccessToken()) ?? (await getItem("accessToken"));
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (ENV.API_KEY) {
    headers["X-API-Key"] = ENV.API_KEY;
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

// ==================== DEDUPLICATION ====================

// Global state for deduplication
let conversationsFetchInProgress = false;
let cachedConversations: Conversation[] | null = null;
let lastConversationsFetchTime = 0;
const CONVERSATIONS_CACHE_MS = 5000; // Cache for 5 seconds

// ==================== API METHODS ====================

/**
 * Get all conversations for current user
 * Backend: GET /chat/rooms (for project chat rooms)
 * Also supports: GET /conversation-messages/conversations (for DM)
 */
export async function getConversations(): Promise<Conversation[]> {
  const now = Date.now();

  // Return cached response if within cache window
  if (
    cachedConversations &&
    now - lastConversationsFetchTime < CONVERSATIONS_CACHE_MS
  ) {
    return cachedConversations;
  }

  // Prevent concurrent fetches
  if (conversationsFetchInProgress) {
    if (cachedConversations) return cachedConversations;
    if (USE_MOCK_FALLBACK) return MOCK_CONVERSATIONS;
  }

  conversationsFetchInProgress = true;

  try {
    const headers = await getAuthHeaders();

    // Try chat rooms first (group chats for projects)
    const response = await fetch(`${CHAT_URL}/rooms`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      // If unauthorized or error, try conversation-messages endpoint
      if (response.status === 401 || response.status === 404) {
        const dmResponse = await fetch(`${MESSAGES_URL}/conversations`, {
          method: "GET",
          headers,
        });

        if (dmResponse.ok) {
          const result = await dmResponse.json();
          cachedConversations = result;
          lastConversationsFetchTime = Date.now();
          return result;
        }
      }
      throw new Error(`Failed to fetch conversations: ${response.statusText}`);
    }

    // Transform chat rooms to conversation format
    const rooms = await response.json();
    const result = rooms.map((room: any) => ({
      id: room.id,
      participants: room.members || [],
      lastMessage: room.lastMessage,
      unreadCount: room.unreadCount || 0,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    }));

    cachedConversations = result;
    lastConversationsFetchTime = Date.now();
    return result;
  } catch (error) {
    console.error("[messagesApi] getConversations error:", error);
    if (USE_MOCK_FALLBACK) {
      console.log("[messagesApi] Using mock conversations data");
      cachedConversations = MOCK_CONVERSATIONS;
      lastConversationsFetchTime = Date.now();
      return MOCK_CONVERSATIONS;
    }
    throw error;
  } finally {
    conversationsFetchInProgress = false;
  }
}

/**
 * Get messages in a specific conversation
 * Backend: GET /chat/rooms/:roomId/messages
 */
export async function getMessages(
  conversationId: number,
  params?: MessageQueryParams,
): Promise<Message[]> {
  try {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();

    if (params?.page)
      queryParams.append(
        "offset",
        ((params.page - 1) * (params.limit || 50)).toString(),
      );
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const url = `${CHAT_URL}/rooms/${conversationId}/messages${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[messagesApi] getMessages error:", error);
    if (USE_MOCK_FALLBACK) {
      console.log("[messagesApi] Using empty messages array as fallback");
      return [];
    }
    throw error;
  }
}

/**
 * Send a message (creates conversation if doesn't exist)
 * Backend: POST /chat/messages
 * Supports text, image, video, voice, file attachments
 */
export async function sendMessage(dto: SendMessageDto): Promise<Message> {
  try {
    const headers = await getAuthHeaders();

    // Build message body with attachment support
    const body: any = {
      roomId: dto.conversationId ?? dto.recipientId,
      content: dto.content,
    };

    // Add attachment info if provided
    if (dto.attachmentUrl) {
      body.attachmentUrl = dto.attachmentUrl;
      body.attachmentType = dto.attachmentType || "file";
      body.attachmentName = dto.attachmentName;
    }

    const response = await fetch(`${CHAT_URL}/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(
        `[messagesApi] sendMessage API failed: ${response.statusText} - ${errorText}`,
      );
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("[messagesApi] Message sent successfully via API");
    return result;
  } catch (error) {
    console.error("[messagesApi] sendMessage error:", error);
    if (USE_MOCK_FALLBACK) {
      // Return a mock message for demo purposes
      console.log("[messagesApi] Returning mock sent message");
      return {
        id: Date.now(),
        content: dto.content,
        senderId: 1,
        conversationId: dto.recipientId,
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: {
          id: 1,
          name: "You",
          email: "you@example.com",
          role: "CLIENT",
        },
        // Include attachment info in mock
        ...(dto.attachmentUrl && {
          type: dto.attachmentType || "file",
          attachmentUrl: dto.attachmentUrl,
          attachmentName: dto.attachmentName,
        }),
      };
    }
    throw error;
  }
}

/**
 * Mark a message as read
 * Backend: POST /chat/messages/:messageId/read
 */
export async function markAsRead(messageId: number): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${CHAT_URL}/messages/${messageId}/read`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to mark as read: ${response.statusText}`);
    }
  } catch (error) {
    console.error("[messagesApi] markAsRead error:", error);
    // Silent fail for marking as read - not critical
  }
}

/**
 * Mark all messages in a conversation as read
 * This functionality may need to be implemented on backend
 */
export async function markAllAsRead(conversationId: number): Promise<void> {
  // Validate conversationId to avoid unnecessary API calls
  if (!conversationId || conversationId <= 0) {
    console.log("[messagesApi] markAllAsRead skipped: invalid conversationId");
    return;
  }

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${CHAT_URL}/rooms/${conversationId}/read-all`,
      {
        method: "POST",
        headers,
      },
    );

    // Silent fail if endpoint doesn't exist
    if (!response.ok && response.status !== 404) {
      console.warn(
        `[messagesApi] markAllAsRead failed: ${response.statusText}`,
      );
    }
  } catch (error) {
    // Silent fail - not critical, don't log repeatedly
    // console.error("[messagesApi] markAllAsRead error:", error);
  }
}

/**
 * Get unread message count
 * This may need to be calculated from rooms data
 */
export async function getUnreadCount(): Promise<{ count: number }> {
  try {
    const headers = await getAuthHeaders();
    // Try to get rooms and calculate unread count
    const response = await fetch(`${CHAT_URL}/rooms`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      if (USE_MOCK_FALLBACK) {
        console.log("[messagesApi] Using mock unread count data");
        return {
          count: MOCK_CONVERSATIONS.reduce((sum, c) => sum + c.unreadCount, 0),
        };
      }
      return { count: 0 };
    }

    const rooms = await response.json();
    const totalUnread = rooms.reduce(
      (sum: number, room: any) => sum + (room.unreadCount || 0),
      0,
    );
    return { count: totalUnread };
  } catch (error) {
    // Silent fail - return mock data
    if (USE_MOCK_FALLBACK) {
      console.log("[messagesApi] Using mock unread count data");
      return {
        count: MOCK_CONVERSATIONS.reduce((sum, c) => sum + c.unreadCount, 0),
      };
    }
    return { count: 0 };
  }
}

/**
 * Get or create conversation with a specific user
 * For project-based chat, this would create/get a room
 */
export async function getConversationByRecipient(
  recipientId: number,
): Promise<Conversation | null> {
  try {
    // First, try to find existing conversation in rooms
    const allConversations = await getConversations();
    const existing = allConversations.find((conv) =>
      conv.participants.some((p) => p.id === recipientId),
    );

    if (existing) {
      return existing;
    }

    // If not found and need to create, the createRoom endpoint would be used
    // For now, return null and let the UI handle room creation
    return null;
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
 * May need backend implementation
 */
export async function searchMessages(
  params: SearchMessagesParams,
): Promise<SearchMessagesResponse> {
  try {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();

    queryParams.append("query", params.query);
    if (params.conversationId)
      queryParams.append("conversationId", params.conversationId);
    if (params.senderId)
      queryParams.append("senderId", params.senderId.toString());
    if (params.dateFrom) queryParams.append("dateFrom", params.dateFrom);
    if (params.dateTo) queryParams.append("dateTo", params.dateTo);
    if (params.hasAttachment !== undefined)
      queryParams.append("hasAttachment", params.hasAttachment.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    // Try conversation-messages search endpoint
    const response = await fetch(
      `${MESSAGES_URL}/search?${queryParams.toString()}`,
      {
        method: "GET",
        headers,
      },
    );

    if (!response.ok) {
      // Search may not be implemented
      console.warn("[messagesApi] Search endpoint not available");
      return { messages: [], total: 0 };
    }

    return await response.json();
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
 * Backend: POST /chat/rooms
 */
export async function createRoom(dto: CreateRoomDto): Promise<Conversation> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${CHAT_URL}/rooms`, {
      method: "POST",
      headers,
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      throw new Error(`Failed to create room: ${response.statusText}`);
    }

    const room = await response.json();
    return {
      id: room.id,
      participants: room.members || [],
      lastMessage: room.lastMessage,
      unreadCount: 0,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };
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
