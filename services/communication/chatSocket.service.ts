/**
 * Chat Socket Service
 * Real-time messaging via WebSocket (Socket.IO)
 *
 * Features:
 * - Real-time messages (newMessage, messageRead)
 * - Typing indicators
 * - Online status
 * - Message reactions
 * - Read receipts
 *
 * @created 19/01/2026
 */

import {
    buildNamespaceUrl,
    buildSocketOptions,
    getAccessToken,
    logConnectError,
} from "@/services/socket/socketConfig";
import type { Socket } from "@/utils/socketIo";
import { getSocketIo } from "@/utils/socketIo";

// ============================================================================
// Types
// ============================================================================

export interface ChatUser {
  id: number;
  name: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface ChatMessage {
  id: string | number;
  conversationId: number;
  senderId: number;
  content: string;
  type: "text" | "image" | "file" | "audio" | "video";
  attachments?: MessageAttachment[];
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  sender: ChatUser;
  replyTo?: ChatMessage;
  reactions?: MessageReaction[];
  status?: "sending" | "sent" | "delivered" | "read" | "failed";
}

export interface MessageAttachment {
  id: string;
  type: "image" | "file" | "audio" | "video";
  url: string;
  name?: string;
  size?: number;
  mimeType?: string;
  thumbnail?: string;
}

export interface MessageReaction {
  emoji: string;
  userId: number;
  userName: string;
}

export interface TypingEvent {
  conversationId: number;
  userId: number;
  userName: string;
  isTyping: boolean;
}

export interface ReadReceiptEvent {
  conversationId: number;
  messageIds: (string | number)[];
  readBy: number;
  readAt: string;
}

export interface OnlineStatusEvent {
  userId: number;
  isOnline: boolean;
  lastSeen?: string;
}

// ============================================================================
// Events (Client → Server)
// ============================================================================

export interface ClientToServerEvents {
  // Connection
  "join:conversation": (data: { conversationId: number }) => void;
  "leave:conversation": (data: { conversationId: number }) => void;

  // Messages
  "message:send": (data: {
    conversationId?: number;
    recipientId: number;
    content: string;
    type: "text" | "image" | "file";
    attachments?: MessageAttachment[];
    replyToId?: string | number;
  }) => void;

  // Typing
  "typing:start": (data: { conversationId: number }) => void;
  "typing:stop": (data: { conversationId: number }) => void;

  // Read receipts
  "message:read": (data: {
    conversationId: number;
    messageIds: (string | number)[];
  }) => void;

  // Reactions
  "message:react": (data: {
    messageId: string | number;
    emoji: string;
  }) => void;
  "message:unreact": (data: {
    messageId: string | number;
    emoji: string;
  }) => void;
}

// ============================================================================
// Events (Server → Client)
// ============================================================================

export interface ServerToClientEvents {
  // Messages
  "message:new": (message: ChatMessage) => void;
  "message:updated": (message: ChatMessage) => void;
  "message:deleted": (data: {
    messageId: string | number;
    conversationId: number;
  }) => void;

  // Typing
  "user:typing": (data: TypingEvent) => void;

  // Read receipts
  "message:read": (data: ReadReceiptEvent) => void;

  // Online status
  "user:online": (data: OnlineStatusEvent) => void;
  "user:offline": (data: OnlineStatusEvent) => void;

  // Reactions
  "message:reaction": (data: {
    messageId: string | number;
    reaction: MessageReaction;
  }) => void;

  // Errors
  error: (data: { code: string; message: string }) => void;
}

// ============================================================================
// Chat Socket Service
// ============================================================================

class ChatSocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
    null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;

  // Event listeners storage for cleanup
  private eventListeners: Map<string, Set<Function>> = new Map();

  /**
   * Connect to chat WebSocket server
   */
  async connect(): Promise<Socket<ServerToClientEvents, ClientToServerEvents>> {
    if (this.socket?.connected) {
      console.log("[ChatSocket] Already connected");
      return this.socket;
    }

    if (this.isConnecting) {
      console.log("[ChatSocket] Connection in progress...");
      // Wait for connection
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error("Connection timeout")),
          10000,
        );
        const checkConnection = setInterval(() => {
          if (this.socket?.connected) {
            clearInterval(checkConnection);
            clearTimeout(timeout);
            resolve(this.socket);
          }
        }, 100);
      });
    }

    this.isConnecting = true;

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error("No access token available");
      }

      const wsUrl = buildNamespaceUrl("chat");
      console.log("[ChatSocket] Connecting to:", wsUrl);

      const io = await getSocketIo();
      this.socket = io(
        wsUrl,
        buildSocketOptions(token, {
          reconnectionAttempts: this.maxReconnectAttempts,
          timeout: 10000,
        }),
      );

      this.setupEventListeners();

      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Connection timeout"));
        }, 10000);

        this.socket!.on("connect", () => {
          clearTimeout(timeout);
          console.log("[ChatSocket] ✅ Connected:", this.socket?.id);
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket!.on("connect_error", (error) => {
          clearTimeout(timeout);
          console.warn("[ChatSocket] Connection error:", error.message);
          reject(error);
        });
      });

      return this.socket;
    } catch (error) {
      console.error("[ChatSocket] Failed to connect:", error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Disconnect from chat server
   */
  disconnect(): void {
    if (this.socket) {
      console.log("[ChatSocket] Disconnecting...");
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventListeners.clear();
    this.reconnectAttempts = 0;
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
    return this.socket;
  }

  // =========================================================================
  // Room Management
  // =========================================================================

  /**
   * Join a conversation room
   */
  joinConversation(conversationId: number): void {
    if (!this.socket?.connected) {
      console.warn("[ChatSocket] Cannot join - not connected");
      return;
    }
    console.log("[ChatSocket] Joining conversation:", conversationId);
    this.socket.emit("join:conversation", { conversationId });
  }

  /**
   * Leave a conversation room
   */
  leaveConversation(conversationId: number): void {
    if (!this.socket) return;
    console.log("[ChatSocket] Leaving conversation:", conversationId);
    this.socket.emit("leave:conversation", { conversationId });
  }

  // =========================================================================
  // Messaging
  // =========================================================================

  /**
   * Send a message
   */
  sendMessage(data: {
    conversationId?: number;
    recipientId: number;
    content: string;
    type?: "text" | "image" | "file";
    attachments?: MessageAttachment[];
    replyToId?: string | number;
  }): void {
    if (!this.socket?.connected) {
      throw new Error("Socket not connected");
    }

    console.log("[ChatSocket] Sending message to:", data.recipientId);
    this.socket.emit("message:send", {
      ...data,
      type: data.type || "text",
    });
  }

  /**
   * Mark messages as read
   */
  markAsRead(conversationId: number, messageIds: (string | number)[]): void {
    if (!this.socket?.connected) return;

    console.log("[ChatSocket] Marking as read:", {
      conversationId,
      messageIds,
    });
    this.socket.emit("message:read", { conversationId, messageIds });
  }

  /**
   * Add reaction to message
   */
  addReaction(messageId: string | number, emoji: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit("message:react", { messageId, emoji });
  }

  /**
   * Remove reaction from message
   */
  removeReaction(messageId: string | number, emoji: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit("message:unreact", { messageId, emoji });
  }

  // =========================================================================
  // Typing Indicators
  // =========================================================================

  /**
   * Start typing indicator
   */
  startTyping(conversationId: number): void {
    if (!this.socket?.connected) return;
    this.socket.emit("typing:start", { conversationId });
  }

  /**
   * Stop typing indicator
   */
  stopTyping(conversationId: number): void {
    if (!this.socket?.connected) return;
    this.socket.emit("typing:stop", { conversationId });
  }

  // =========================================================================
  // Event Listeners
  // =========================================================================

  /**
   * Listen for new messages
   */
  onNewMessage(callback: (message: ChatMessage) => void): () => void {
    return this.addEventListener("message:new", callback);
  }

  /**
   * Listen for message updates
   */
  onMessageUpdated(callback: (message: ChatMessage) => void): () => void {
    return this.addEventListener("message:updated", callback);
  }

  /**
   * Listen for message deletions
   */
  onMessageDeleted(
    callback: (data: {
      messageId: string | number;
      conversationId: number;
    }) => void,
  ): () => void {
    return this.addEventListener("message:deleted", callback);
  }

  /**
   * Listen for typing events
   */
  onTyping(callback: (data: TypingEvent) => void): () => void {
    return this.addEventListener("user:typing", callback);
  }

  /**
   * Listen for read receipts
   */
  onReadReceipt(callback: (data: ReadReceiptEvent) => void): () => void {
    return this.addEventListener("message:read", callback);
  }

  /**
   * Listen for online status changes
   */
  onOnlineStatus(callback: (data: OnlineStatusEvent) => void): () => void {
    const onOnline = (data: OnlineStatusEvent) =>
      callback({ ...data, isOnline: true });
    const onOffline = (data: OnlineStatusEvent) =>
      callback({ ...data, isOnline: false });

    const removeOnline = this.addEventListener("user:online", onOnline);
    const removeOffline = this.addEventListener("user:offline", onOffline);

    return () => {
      removeOnline();
      removeOffline();
    };
  }

  /**
   * Listen for reactions
   */
  onReaction(
    callback: (data: {
      messageId: string | number;
      reaction: MessageReaction;
    }) => void,
  ): () => void {
    return this.addEventListener("message:reaction", callback);
  }

  // =========================================================================
  // Private Methods
  // =========================================================================

  // getWebSocketUrl removed — using centralized buildNamespaceUrl from socketConfig

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("[ChatSocket] ✅ Connected");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[ChatSocket] ❌ Disconnected:", reason);
    });

    // Refresh token before reconnect
    (this.socket as any).on("reconnect_attempt", async () => {
      try {
        const freshToken = await getAccessToken();
        if (freshToken && this.socket) {
          (this.socket as any).auth = { token: freshToken };
        }
      } catch (err) {
        console.warn("[ChatSocket] Token refresh failed:", err);
      }
    });

    this.socket.on("connect_error", (error: Error) => {
      logConnectError(
        "ChatSocket",
        "chat",
        buildNamespaceUrl("chat"),
        error as any,
        null,
      );
      this.reconnectAttempts++;
    });

    this.socket.on("error", (data: any) => {
      console.warn("[ChatSocket] Error:", data.message);
    });
  }

  private addEventListener<T>(
    event: string,
    callback: (data: T) => void,
  ): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);

    this.socket?.on(event as any, callback as any);

    // Return cleanup function
    return () => {
      this.eventListeners.get(event)?.delete(callback);
      this.socket?.off(event as any, callback as any);
    };
  }
}

// Export singleton instance
export const chatSocketService = new ChatSocketService();
export default chatSocketService;
