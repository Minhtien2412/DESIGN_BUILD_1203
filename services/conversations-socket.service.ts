/**
 * Conversations Socket Service
 * =============================
 *
 * WebSocket client cho conversations messaging realtime
 *
 * Events:
 * - message.new      : Tin nhắn mới
 * - message.updated  : Tin nhắn đã sửa
 * - message.deleted  : Tin nhắn đã xóa
 * - read.receipt     : Đã đọc notification
 * - typing           : Typing indicator
 * - presence         : User online/offline
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import {
    buildNamespaceUrl,
    buildSocketOptions,
    getAccessToken
} from "@/services/socket/socketConfig";
import type { Socket } from "@/utils/socketIo";
import { getSocketIo } from "@/utils/socketIo";

// ============================================================================
// Types
// ============================================================================

export interface NewMessageEvent {
  conversationId: string;
  message: {
    id: string;
    conversationId: string;
    senderId: number;
    seq: number;
    type: string;
    content: string;
    sentAt: string;
    sender?: {
      id: number;
      name: string;
      avatar?: string;
    };
  };
}

export interface MessageUpdatedEvent {
  conversationId: string;
  message: {
    id: string;
    content: string;
    editedAt: string;
    isEdited: boolean;
  };
}

export interface MessageDeletedEvent {
  conversationId: string;
  messageId: string;
}

export interface ReadReceiptEvent {
  conversationId: string;
  userId: number;
  lastReadSeq: number;
  readAt: string;
}

export interface TypingEvent {
  conversationId: string;
  userId: number;
  isTyping: boolean;
}

export interface PresenceEvent {
  userId: number;
  isOnline: boolean;
  timestamp: string;
}

export type ConversationsSocketEvent =
  | "message.new"
  | "message.updated"
  | "message.deleted"
  | "read.receipt"
  | "typing"
  | "presence"
  | "connect"
  | "disconnect"
  | "error";

type EventCallback<T> = (data: T) => void;

// ============================================================================
// Socket Service Class
// ============================================================================

class ConversationsSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Event listeners
  private listeners: Map<string, Set<EventCallback<any>>> = new Map();

  // Active conversations (for auto-rejoin on reconnect)
  private activeConversations: Set<string> = new Set();

  /**
   * Connect to conversations WebSocket namespace
   */
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log("[ConversationsSocket] Already connected");
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      console.warn("[ConversationsSocket] No auth token available");
      return;
    }

    const wsUrl = buildNamespaceUrl("conversations");
    console.log("[ConversationsSocket] Connecting to:", wsUrl);

    const io = await getSocketIo();
    this.socket = io(
      wsUrl,
      buildSocketOptions(token, {
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        timeout: 10000,
      }),
    ) as unknown as Socket;

    this.setupEventHandlers();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Connection timeout"));
      }, 10000);

      this.socket!.once("connect", () => {
        clearTimeout(timeout);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log("[ConversationsSocket] Connected");
        resolve();
      });

      this.socket!.once("connect_error", (error) => {
        clearTimeout(timeout);
        console.error("[ConversationsSocket] Connection error:", error.message);
        reject(error);
      });
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.activeConversations.clear();
      console.log("[ConversationsSocket] Disconnected");
    }
  }

  /**
   * Join a conversation room
   */
  joinConversation(conversationId: string): void {
    if (!this.socket?.connected) {
      console.warn("[ConversationsSocket] Not connected");
      this.activeConversations.add(conversationId); // Will join on reconnect
      return;
    }

    this.socket.emit(
      "conversation.join",
      { conversationId },
      (response: any) => {
        if (response?.success) {
          this.activeConversations.add(conversationId);
          console.log(
            "[ConversationsSocket] Joined conversation:",
            conversationId,
          );
        } else {
          console.error(
            "[ConversationsSocket] Failed to join:",
            response?.error,
          );
        }
      },
    );
  }

  /**
   * Leave a conversation room
   */
  leaveConversation(conversationId: string): void {
    this.activeConversations.delete(conversationId);

    if (!this.socket?.connected) return;

    this.socket.emit("conversation.leave", { conversationId });
    console.log("[ConversationsSocket] Left conversation:", conversationId);
  }

  /**
   * Send typing indicator
   */
  sendTyping(conversationId: string, isTyping: boolean): void {
    if (!this.socket?.connected) return;

    this.socket.emit("typing", { conversationId, isTyping });
  }

  /**
   * Mark messages as read
   */
  markAsRead(conversationId: string, messageId?: string): void {
    if (!this.socket?.connected) return;

    this.socket.emit(
      "message.read",
      { conversationId, messageId },
      (response: any) => {
        if (!response?.success) {
          console.warn(
            "[ConversationsSocket] Mark read failed:",
            response?.error,
          );
        }
      },
    );
  }

  /**
   * Subscribe to events
   */
  on<T = any>(
    event: ConversationsSocketEvent,
    callback: EventCallback<T>,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Unsubscribe from events
   */
  off(event: ConversationsSocketEvent, callback?: EventCallback<any>): void {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
    } else {
      this.listeners.delete(event);
    }
  }

  /**
   * Check connection status
   */
  get connected(): boolean {
    return this.isConnected && !!this.socket?.connected;
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit("connect", {});

      // Rejoin active conversations
      this.activeConversations.forEach((convId) => {
        this.socket?.emit("conversation.join", { conversationId: convId });
      });
    });

    this.socket.on("disconnect", (reason) => {
      this.isConnected = false;
      console.log("[ConversationsSocket] Disconnected:", reason);
      this.emit("disconnect", { reason });
    });

    this.socket.on("connect_error", (error) => {
      this.reconnectAttempts++;
      console.error("[ConversationsSocket] Error:", error.message);
      this.emit("error", { message: error.message });
    });

    // Messaging events
    this.socket.on("message.new", (data: NewMessageEvent) => {
      console.log("[ConversationsSocket] New message:", data.message.id);
      this.emit("message.new", data);
    });

    this.socket.on("message.updated", (data: MessageUpdatedEvent) => {
      console.log("[ConversationsSocket] Message updated:", data.message.id);
      this.emit("message.updated", data);
    });

    this.socket.on("message.deleted", (data: MessageDeletedEvent) => {
      console.log("[ConversationsSocket] Message deleted:", data.messageId);
      this.emit("message.deleted", data);
    });

    // Read receipts
    this.socket.on("read.receipt", (data: ReadReceiptEvent) => {
      this.emit("read.receipt", data);
    });

    // Typing indicator
    this.socket.on("typing", (data: TypingEvent) => {
      this.emit("typing", data);
    });

    // Presence
    this.socket.on("presence", (data: PresenceEvent) => {
      this.emit("presence", data);
    });
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `[ConversationsSocket] Callback error for ${event}:`,
            error,
          );
        }
      });
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const conversationsSocket = new ConversationsSocketService();

export default conversationsSocket;
