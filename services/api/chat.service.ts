/**
 * Chat Service
 * Handles real-time chat with REST API and WebSocket support
 */

import { apiClient } from './client';

// ==================== TYPES ====================

export interface CreateRoomDto {
  name: string;
  projectId?: number;
  type?: 'DIRECT' | 'GROUP' | 'PROJECT';
  members?: number[];
}

export interface ChatRoom {
  id: number;
  name: string;
  type: 'DIRECT' | 'GROUP' | 'PROJECT';
  projectId?: number;
  createdBy: number;
  members: RoomMember[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoomMember {
  id: number;
  userId: number;
  roomId: number;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface ChatMessage {
  id: number;
  roomId: number;
  senderId: number;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  attachments?: string[];
  readBy: number[];
  createdAt: string;
  sender: {
    id: number;
    name: string;
    avatar?: string;
  };
}

export interface SendMessageDto {
  roomId: number;
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'FILE';
  attachments?: string[];
}

export interface MessagesResponse {
  messages: ChatMessage[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ==================== SERVICE ====================

export const chatService = {
  /**
   * Create chat room for project
   */
  async createRoom(data: CreateRoomDto): Promise<ChatRoom> {
    return apiClient.post<ChatRoom>('/chat/rooms', data);
  },

  /**
   * Get user's chat rooms
   */
  async getRooms(params?: {
    projectId?: number;
    type?: string;
  }): Promise<ChatRoom[]> {
    const queryParams: Record<string, string> = {};
    if (params?.projectId) queryParams.projectId = String(params.projectId);
    if (params?.type) queryParams.type = params.type;

    return apiClient.get<ChatRoom[]>('/chat/rooms', queryParams);
  },

  /**
   * Get messages in room
   */
  async getMessages(
    roomId: number,
    params?: {
      page?: number;
      limit?: number;
      before?: string;
    }
  ): Promise<MessagesResponse> {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);
    if (params?.before) queryParams.before = params.before;

    return apiClient.get<MessagesResponse>(`/chat/rooms/${roomId}/messages`, queryParams);
  },

  /**
   * Send message (REST API - can use WebSocket alternative)
   */
  async sendMessage(data: SendMessageDto): Promise<ChatMessage> {
    return apiClient.post<ChatMessage>('/chat/messages', data);
  },

  /**
   * Mark message as read
   */
  async markAsRead(messageId: number): Promise<void> {
    return apiClient.post(`/chat/messages/${messageId}/read`);
  },

  /**
   * Add member to room
   */
  async addMember(roomId: number, memberId: number): Promise<RoomMember> {
    return apiClient.post<RoomMember>(`/chat/rooms/${roomId}/members/${memberId}`);
  },

  /**
   * Remove member from room
   */
  async removeMember(roomId: number, memberId: number): Promise<void> {
    return apiClient.delete(`/chat/rooms/${roomId}/members/${memberId}`);
  },

  /**
   * Get room details
   */
  async getRoom(roomId: number): Promise<ChatRoom> {
    return apiClient.get<ChatRoom>(`/chat/rooms/${roomId}`);
  },

  /**
   * Delete room
   */
  async deleteRoom(roomId: number): Promise<void> {
    return apiClient.delete(`/chat/rooms/${roomId}`);
  },

  /**
   * Update room settings
   */
  async updateRoom(
    roomId: number,
    data: { name?: string; type?: string }
  ): Promise<ChatRoom> {
    return apiClient.patch<ChatRoom>(`/chat/rooms/${roomId}`, data);
  },
};

export default chatService;
