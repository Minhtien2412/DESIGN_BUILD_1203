/**
 * Real-time Chat Service - WebSocket Integration
 * Handles real-time messaging for construction team communication
 */
import { ENV } from '@/config/env';
import { getToken } from '@/utils/storage';
import { socketManager } from './websocket/socketManager';

// ============================================================================
// Types
// ============================================================================

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  type: 'text' | 'image' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyTo?: string; // Message ID being replied to
  createdAt: string;
  updatedAt?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'project';
  projectId?: number;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface TypingIndicator {
  roomId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface MessageReadReceipt {
  messageId: string;
  userId: string;
  readAt: string;
}

// ============================================================================
// Event Callbacks
// ============================================================================

type MessageCallback = (message: ChatMessage) => void;
type TypingCallback = (data: TypingIndicator) => void;
type ReadReceiptCallback = (data: MessageReadReceipt) => void;
type OnlineStatusCallback = (data: { userId: string; isOnline: boolean }) => void;
type RoomUpdateCallback = (room: ChatRoom) => void;

// ============================================================================
// Chat Service Class
// ============================================================================

class ChatService {
  private isConnected = false;
  private currentRoomId: string | null = null;

  /**
   * Connect to chat server
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('[Chat] Already connected');
      return;
    }

    try {
      await socketManager.connect('chat');
      this.isConnected = true;
      console.log('[Chat] Connected successfully');
    } catch (error) {
      console.error('[Chat] Connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect from chat server
   */
  disconnect(): void {
    socketManager.disconnect('chat');
    this.isConnected = false;
    this.currentRoomId = null;
    console.log('[Chat] Disconnected');
  }

  /**
   * Join a chat room
   */
  joinRoom(roomId: string): void {
    if (!this.isConnected) {
      console.warn('[Chat] Not connected. Call connect() first.');
      return;
    }

    // Leave current room if any
    if (this.currentRoomId && this.currentRoomId !== roomId) {
      this.leaveRoom(this.currentRoomId);
    }

    socketManager.emit('chat', 'join_room', { roomId });
    this.currentRoomId = roomId;
    console.log(`[Chat] Joined room: ${roomId}`);
  }

  /**
   * Leave a chat room
   */
  leaveRoom(roomId: string): void {
    if (!this.isConnected) return;

    socketManager.emit('chat', 'leave_room', { roomId });
    
    if (this.currentRoomId === roomId) {
      this.currentRoomId = null;
    }
    
    console.log(`[Chat] Left room: ${roomId}`);
  }

  /**
   * Send text message
   */
  sendMessage(roomId: string, message: string, replyTo?: string): void {
    if (!this.isConnected) {
      console.warn('[Chat] Not connected');
      return;
    }

    socketManager.emit('chat', 'send_message', {
      roomId,
      message,
      type: 'text',
      replyTo,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send image message (after uploading)
   */
  sendImageMessage(roomId: string, imageUrl: string, caption?: string): void {
    if (!this.isConnected) {
      console.warn('[Chat] Not connected');
      return;
    }

    socketManager.emit('chat', 'send_message', {
      roomId,
      message: caption || '',
      type: 'image',
      fileUrl: imageUrl,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send file message (after uploading)
   */
  sendFileMessage(
    roomId: string,
    fileUrl: string,
    fileName: string,
    fileSize: number,
    message?: string
  ): void {
    if (!this.isConnected) {
      console.warn('[Chat] Not connected');
      return;
    }

    socketManager.emit('chat', 'send_message', {
      roomId,
      message: message || '',
      type: 'file',
      fileUrl,
      fileName,
      fileSize,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Start typing indicator
   */
  startTyping(roomId: string): void {
    if (!this.isConnected) return;
    socketManager.emit('chat', 'typing_start', { roomId });
  }

  /**
   * Stop typing indicator
   */
  stopTyping(roomId: string): void {
    if (!this.isConnected) return;
    socketManager.emit('chat', 'typing_stop', { roomId });
  }

  /**
   * Mark message as read
   */
  markAsRead(roomId: string, messageId: string): void {
    if (!this.isConnected) return;
    socketManager.emit('chat', 'mark_read', { roomId, messageId });
  }

  /**
   * Mark all messages in room as read
   */
  markRoomAsRead(roomId: string): void {
    if (!this.isConnected) return;
    socketManager.emit('chat', 'mark_room_read', { roomId });
  }

  /**
   * Delete message
   */
  deleteMessage(roomId: string, messageId: string): void {
    if (!this.isConnected) return;
    socketManager.emit('chat', 'delete_message', { roomId, messageId });
  }

  /**
   * Edit message
   */
  editMessage(roomId: string, messageId: string, newMessage: string): void {
    if (!this.isConnected) return;
    socketManager.emit('chat', 'edit_message', {
      roomId,
      messageId,
      message: newMessage,
    });
  }

  // ========================================================================
  // Event Listeners
  // ========================================================================

  /**
   * Listen for new messages
   */
  onMessage(callback: MessageCallback): () => void {
    socketManager.on('chat', 'new_message', callback);
    return () => socketManager.off('chat', 'new_message', callback);
  }

  /**
   * Listen for message updates (edits, deletions)
   */
  onMessageUpdate(callback: MessageCallback): () => void {
    socketManager.on('chat', 'message_updated', callback);
    return () => socketManager.off('chat', 'message_updated', callback);
  }

  /**
   * Listen for typing indicators
   */
  onTyping(callback: TypingCallback): () => void {
    socketManager.on('chat', 'user_typing', callback);
    return () => socketManager.off('chat', 'user_typing', callback);
  }

  /**
   * Listen for read receipts
   */
  onReadReceipt(callback: ReadReceiptCallback): () => void {
    socketManager.on('chat', 'message_read', callback);
    return () => socketManager.off('chat', 'message_read', callback);
  }

  /**
   * Listen for online status changes
   */
  onOnlineStatus(callback: OnlineStatusCallback): () => void {
    socketManager.on('chat', 'user_status', callback);
    return () => socketManager.off('chat', 'user_status', callback);
  }

  /**
   * Listen for room updates
   */
  onRoomUpdate(callback: RoomUpdateCallback): () => void {
    socketManager.on('chat', 'room_updated', callback);
    return () => socketManager.off('chat', 'room_updated', callback);
  }

  /**
   * Listen for connection errors
   */
  onError(callback: (error: Error) => void): () => void {
    socketManager.on('chat', 'error', callback);
    return () => socketManager.off('chat', 'error', callback);
  }

  // ========================================================================
  // REST API Methods (Fallback/History)
  // ========================================================================

  /**
   * Get chat rooms
   */
  async getChatRooms(): Promise<ChatRoom[]> {
    try {
      const token = await getToken();
      const response = await fetch(`${ENV.API_BASE_URL}/chat/rooms`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-api-key': ENV.API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chat rooms');
      }

      return await response.json();
    } catch (error) {
      console.error('[Chat] Failed to fetch rooms:', error);
      return [];
    }
  }

  /**
   * Get message history for a room
   */
  async getMessageHistory(
    roomId: string,
    limit = 50,
    before?: string
  ): Promise<ChatMessage[]> {
    try {
      const token = await getToken();
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(before && { before }),
      });

      const response = await fetch(
        `${ENV.API_BASE_URL}/chat/rooms/${roomId}/messages?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-api-key': ENV.API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch message history');
      }

      return await response.json();
    } catch (error) {
      console.error('[Chat] Failed to fetch message history:', error);
      return [];
    }
  }

  /**
   * Create new chat room
   */
  async createRoom(
    name: string,
    type: 'direct' | 'group' | 'project',
    participantIds: string[],
    projectId?: number
  ): Promise<ChatRoom | null> {
    try {
      const token = await getToken();
      const response = await fetch(`${ENV.API_BASE_URL}/chat/rooms`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'x-api-key': ENV.API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          type,
          participantIds,
          projectId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      return await response.json();
    } catch (error) {
      console.error('[Chat] Failed to create room:', error);
      return null;
    }
  }

  /**
   * Search messages
   */
  async searchMessages(query: string, roomId?: string): Promise<ChatMessage[]> {
    try {
      const token = await getToken();
      const params = new URLSearchParams({
        q: query,
        ...(roomId && { roomId }),
      });

      const response = await fetch(
        `${ENV.API_BASE_URL}/chat/search?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-api-key': ENV.API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search messages');
      }

      return await response.json();
    } catch (error) {
      console.error('[Chat] Failed to search messages:', error);
      return [];
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const chatService = new ChatService();
