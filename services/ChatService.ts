/**
 * Chat Service - Real-time messaging with Socket.IO
 * Similar to Zalo messaging features
 */

import { API_CONFIG } from '@/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';

// ==================== TYPES ====================

export type MessageType = 'text' | 'image' | 'video' | 'file' | 'audio' | 'location' | 'sticker' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Attachment {
  type: 'image' | 'video' | 'file' | 'audio' | 'location';
  url?: string;
  localUri?: string;
  name?: string;
  size?: number;
  duration?: number; // for audio/video
  thumbnail?: string; // for video
  latitude?: number;
  longitude?: number;
  address?: string;
  mimeType?: string;
}

export interface Reaction {
  emoji: string;
  userId: string;
  userName: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type: MessageType;
  content: string;
  attachments?: Attachment[];
  reactions?: Reaction[];
  replyTo?: {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    type: MessageType;
  };
  forwardedFrom?: {
    chatId: string;
    chatName: string;
  };
  status: MessageStatus;
  timestamp: number;
  editedAt?: number;
  deletedAt?: number;
  readBy?: string[];
  deliveredTo?: string[];
}

export interface ChatRoom {
  id: string;
  name: string;
  avatar?: string;
  type: 'private' | 'group' | 'channel';
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isPinned?: boolean;
  isMuted?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  role?: 'admin' | 'member';
  isOnline?: boolean;
  lastSeen?: number;
}

export interface TypingStatus {
  chatId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

// ==================== EVENTS ====================

type ChatEventHandlers = {
  onMessage: (message: ChatMessage) => void;
  onMessageUpdated: (message: ChatMessage) => void;
  onMessageDeleted: (messageId: string, chatId: string) => void;
  onTyping: (status: TypingStatus) => void;
  onRead: (chatId: string, userId: string, messageIds: string[]) => void;
  onDelivered: (chatId: string, userId: string, messageIds: string[]) => void;
  onReaction: (messageId: string, reaction: Reaction) => void;
  onUserOnline: (userId: string) => void;
  onUserOffline: (userId: string, lastSeen: number) => void;
  onError: (error: Error) => void;
  onConnectionChange: (connected: boolean) => void;
};

// ==================== CHAT SERVICE ====================

class ChatServiceClass {
  private socket: Socket | null = null;
  private handlers: Partial<ChatEventHandlers> = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private currentUserId: string | null = null;
  private messageQueue: ChatMessage[] = [];
  private isConnected = false;

  // Initialize connection
  async connect(userId: string, token: string): Promise<boolean> {
    this.currentUserId = userId;

    return new Promise((resolve) => {
      try {
        const socketUrl = API_CONFIG.SOCKET_URL || 'wss://your-socket-server.com';
        
        this.socket = io(socketUrl, {
          path: '/chat',
          auth: { token },
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
        });

        this.socket.on('connect', () => {
          console.log('[ChatService] Connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.handlers.onConnectionChange?.(true);
          this.flushMessageQueue();
          resolve(true);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('[ChatService] Disconnected:', reason);
          this.isConnected = false;
          this.handlers.onConnectionChange?.(false);
        });

        this.socket.on('connect_error', (error) => {
          console.error('[ChatService] Connection error:', error);
          this.reconnectAttempts++;
          this.handlers.onError?.(error);
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            resolve(false);
          }
        });

        // Message events
        this.socket.on('message', (message: ChatMessage) => {
          this.handlers.onMessage?.(message);
        });

        this.socket.on('message:updated', (message: ChatMessage) => {
          this.handlers.onMessageUpdated?.(message);
        });

        this.socket.on('message:deleted', ({ messageId, chatId }) => {
          this.handlers.onMessageDeleted?.(messageId, chatId);
        });

        this.socket.on('message:delivered', ({ chatId, userId, messageIds }) => {
          this.handlers.onDelivered?.(chatId, userId, messageIds);
        });

        this.socket.on('message:read', ({ chatId, userId, messageIds }) => {
          this.handlers.onRead?.(chatId, userId, messageIds);
        });

        this.socket.on('message:reaction', ({ messageId, reaction }) => {
          this.handlers.onReaction?.(messageId, reaction);
        });

        // Typing events
        this.socket.on('typing', (status: TypingStatus) => {
          this.handlers.onTyping?.(status);
        });

        // User presence events
        this.socket.on('user:online', (userId: string) => {
          this.handlers.onUserOnline?.(userId);
        });

        this.socket.on('user:offline', ({ userId, lastSeen }) => {
          this.handlers.onUserOffline?.(userId, lastSeen);
        });

      } catch (error) {
        console.error('[ChatService] Failed to connect:', error);
        resolve(false);
      }
    });
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.currentUserId = null;
  }

  // Register event handlers
  on<K extends keyof ChatEventHandlers>(event: K, handler: ChatEventHandlers[K]) {
    this.handlers[event] = handler;
  }

  // Remove event handler
  off<K extends keyof ChatEventHandlers>(event: K) {
    delete this.handlers[event];
  }

  // Join a chat room
  joinRoom(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('room:join', { chatId });
    }
  }

  // Leave a chat room
  leaveRoom(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('room:leave', { chatId });
    }
  }

  // Send a message
  async sendMessage(
    chatId: string,
    content: string,
    options?: {
      type?: MessageType;
      attachments?: Attachment[];
      replyTo?: ChatMessage;
    }
  ): Promise<ChatMessage | null> {
    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      chatId,
      senderId: this.currentUserId || '',
      senderName: '', // Will be filled by server
      type: options?.type || 'text',
      content,
      attachments: options?.attachments,
      replyTo: options?.replyTo ? {
        id: options.replyTo.id,
        senderId: options.replyTo.senderId,
        senderName: options.replyTo.senderName,
        content: options.replyTo.content,
        type: options.replyTo.type,
      } : undefined,
      status: 'sending',
      timestamp: Date.now(),
    };

    // Optimistic update - notify handlers immediately
    this.handlers.onMessage?.(message);

    if (this.socket?.connected) {
      return new Promise((resolve) => {
        this.socket!.emit('message:send', message, (response: { success: boolean; message?: ChatMessage; error?: string }) => {
          if (response.success && response.message) {
            // Update with server response
            this.handlers.onMessageUpdated?.(response.message);
            resolve(response.message);
          } else {
            // Mark as failed
            const failedMessage = { ...message, status: 'failed' as MessageStatus };
            this.handlers.onMessageUpdated?.(failedMessage);
            resolve(null);
          }
        });
      });
    } else {
      // Queue message for later
      this.messageQueue.push(message);
      return null;
    }
  }

  // Edit a message
  async editMessage(messageId: string, chatId: string, newContent: string): Promise<boolean> {
    if (!this.socket?.connected) return false;

    return new Promise((resolve) => {
      this.socket!.emit('message:edit', { messageId, chatId, content: newContent }, (response: { success: boolean }) => {
        resolve(response.success);
      });
    });
  }

  // Delete a message
  async deleteMessage(messageId: string, chatId: string, forEveryone = false): Promise<boolean> {
    if (!this.socket?.connected) return false;

    return new Promise((resolve) => {
      this.socket!.emit('message:delete', { messageId, chatId, forEveryone }, (response: { success: boolean }) => {
        resolve(response.success);
      });
    });
  }

  // Add reaction
  async addReaction(messageId: string, chatId: string, emoji: string): Promise<boolean> {
    if (!this.socket?.connected) return false;

    return new Promise((resolve) => {
      this.socket!.emit('message:react', { messageId, chatId, emoji }, (response: { success: boolean }) => {
        resolve(response.success);
      });
    });
  }

  // Remove reaction
  async removeReaction(messageId: string, chatId: string, emoji: string): Promise<boolean> {
    if (!this.socket?.connected) return false;

    return new Promise((resolve) => {
      this.socket!.emit('message:unreact', { messageId, chatId, emoji }, (response: { success: boolean }) => {
        resolve(response.success);
      });
    });
  }

  // Mark messages as read
  markAsRead(chatId: string, messageIds: string[]) {
    if (this.socket?.connected) {
      this.socket.emit('message:markRead', { chatId, messageIds });
    }
  }

  // Send typing indicator
  sendTyping(chatId: string, isTyping: boolean) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { chatId, isTyping });
    }
  }

  // Forward a message
  async forwardMessage(messageId: string, fromChatId: string, toChatIds: string[]): Promise<boolean> {
    if (!this.socket?.connected) return false;

    return new Promise((resolve) => {
      this.socket!.emit('message:forward', { messageId, fromChatId, toChatIds }, (response: { success: boolean }) => {
        resolve(response.success);
      });
    });
  }

  // Flush queued messages
  private async flushMessageQueue() {
    while (this.messageQueue.length > 0 && this.socket?.connected) {
      const message = this.messageQueue.shift();
      if (message) {
        await this.sendMessage(message.chatId, message.content, {
          type: message.type,
          attachments: message.attachments,
        });
      }
    }
  }

  // Check connection status
  get connected() {
    return this.isConnected;
  }
}

// ==================== STORAGE HELPERS ====================

const STORAGE_KEYS = {
  CHAT_ROOMS: 'chat_rooms',
  MESSAGES_PREFIX: 'chat_messages_',
  DRAFTS_PREFIX: 'chat_draft_',
};

export const ChatStorage = {
  // Save chat rooms
  async saveChatRooms(rooms: ChatRoom[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.CHAT_ROOMS, JSON.stringify(rooms));
  },

  // Get chat rooms
  async getChatRooms(): Promise<ChatRoom[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CHAT_ROOMS);
    return data ? JSON.parse(data) : [];
  },

  // Save messages for a chat
  async saveMessages(chatId: string, messages: ChatMessage[]): Promise<void> {
    await AsyncStorage.setItem(
      STORAGE_KEYS.MESSAGES_PREFIX + chatId,
      JSON.stringify(messages.slice(-500)) // Keep last 500 messages
    );
  },

  // Get messages for a chat
  async getMessages(chatId: string): Promise<ChatMessage[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES_PREFIX + chatId);
    return data ? JSON.parse(data) : [];
  },

  // Save draft message
  async saveDraft(chatId: string, content: string): Promise<void> {
    if (content) {
      await AsyncStorage.setItem(STORAGE_KEYS.DRAFTS_PREFIX + chatId, content);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.DRAFTS_PREFIX + chatId);
    }
  },

  // Get draft message
  async getDraft(chatId: string): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.DRAFTS_PREFIX + chatId);
  },

  // Clear all chat data
  async clearAll(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const chatKeys = keys.filter(key => 
      key.startsWith('chat_') || key === STORAGE_KEYS.CHAT_ROOMS
    );
    await AsyncStorage.multiRemove(chatKeys);
  },
};

// ==================== SINGLETON EXPORT ====================

export const ChatService = new ChatServiceClass();

export default ChatService;
