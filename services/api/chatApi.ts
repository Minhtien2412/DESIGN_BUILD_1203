/**
 * Chat API Client
 * Handles chat rooms and real-time messaging
 * Backend: https://baotienweb.cloud/api/v1/chat
 */

import { getAccessToken } from "@/services/token.service";
import { getItem } from "@/utils/storage";
import ENV from "../../config/env";

const BASE_URL = `${ENV.API_BASE_URL}/chat`;
const API_KEY = ENV.API_KEY;

// ==================== TYPES ====================

export interface ChatRoom {
  id: number;
  name: string;
  projectId?: number;
  isGroup: boolean;
  members: ChatMember[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMember {
  id: number;
  userId: number;
  roomId: number;
  joinedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: "CLIENT" | "ENGINEER" | "ADMIN";
  };
}

export interface ChatMessage {
  id: number;
  roomId: number;
  senderId: number;
  content: string;
  type: "text" | "image" | "file" | "system";
  attachments?: ChatAttachment[];
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ChatAttachment {
  id: number;
  messageId: number;
  url: string;
  type: string;
  name: string;
  size: number;
}

export interface CreateRoomDto {
  name: string;
  projectId?: number;
  memberIds: number[];
  isGroup?: boolean;
}

export interface SendMessageDto {
  roomId: number;
  content: string;
  attachments?: string[];
}

export interface MessageQueryParams {
  limit?: number;
  offset?: number;
  before?: string;
}

// ==================== AUTH HELPER ====================

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = (await getAccessToken()) ?? (await getItem("accessToken"));
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Add API key (required by backend)
  if (API_KEY) {
    headers["X-API-Key"] = API_KEY;
  }

  // Add auth token if available
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

// ==================== API METHODS ====================

/**
 * Create a new chat room
 * Endpoint: POST /chat/rooms
 */
export async function createRoom(dto: CreateRoomDto): Promise<ChatRoom> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/rooms`, {
      method: "POST",
      headers,
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Failed to create room: ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("[chatApi] createRoom error:", error);
    throw error;
  }
}

/**
 * Get all chat rooms for current user
 * Endpoint: GET /chat/rooms
 * Falls back to empty array if API unavailable
 */
export async function getRooms(): Promise<ChatRoom[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/rooms`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      // Log but don't throw - return empty array as fallback
      console.log(
        `[chatApi] getRooms: API returned ${response.status}, returning empty array`,
      );
      return [];
    }

    return await response.json();
  } catch (error) {
    // This is expected if backend chat module isn't ready
    console.log("[chatApi] getRooms: API unavailable, returning empty array");
    return [];
  }
}

/**
 * Get messages in a room
 * Endpoint: GET /chat/rooms/:roomId/messages
 * Falls back to empty array if API unavailable
 */
export async function getRoomMessages(
  roomId: number,
  params?: MessageQueryParams,
): Promise<ChatMessage[]> {
  try {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();

    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    if (params?.before) queryParams.append("before", params.before);

    const url = `${BASE_URL}/rooms/${roomId}/messages${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      console.log(
        `[chatApi] getRoomMessages: API returned ${response.status}, returning empty array`,
      );
      return [];
    }

    return await response.json();
  } catch (error) {
    console.log(
      "[chatApi] getRoomMessages: API unavailable, returning empty array",
    );
    return [];
  }
}

/**
 * Send a message to a room
 * Endpoint: POST /chat/messages
 */
export async function sendMessage(dto: SendMessageDto): Promise<ChatMessage> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Failed to send message: ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("[chatApi] sendMessage error:", error);
    throw error;
  }
}

/**
 * Mark message as read
 * Endpoint: POST /chat/messages/:messageId/read
 */
export async function markAsRead(messageId: number): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/messages/${messageId}/read`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to mark message as read: ${response.statusText}`);
    }
  } catch (error) {
    console.error("[chatApi] markAsRead error:", error);
    throw error;
  }
}

/**
 * Add member to room
 * Endpoint: POST /chat/rooms/:roomId/members/:memberId
 */
export async function addMemberToRoom(
  roomId: number,
  memberId: number,
): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(
      `${BASE_URL}/rooms/${roomId}/members/${memberId}`,
      {
        method: "POST",
        headers,
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to add member: ${response.statusText}`);
    }
  } catch (error) {
    console.error("[chatApi] addMemberToRoom error:", error);
    throw error;
  }
}

/**
 * Get or create direct message room with another user
 * Endpoint: POST /chat/rooms/direct
 */
export async function getOrCreateDirectRoom(userId: number): Promise<ChatRoom> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/rooms/direct`, {
      method: "POST",
      headers,
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message ||
          `Failed to get/create direct room: ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("[chatApi] getOrCreateDirectRoom error:", error);
    throw error;
  }
}

// ==================== EXPORT ====================

export const chatApi = {
  createRoom,
  getRooms,
  getRoomMessages,
  sendMessage,
  markAsRead,
  addMemberToRoom,
  getOrCreateDirectRoom,
};

export default chatApi;
