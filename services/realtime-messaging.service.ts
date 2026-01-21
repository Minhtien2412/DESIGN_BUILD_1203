/**
 * Realtime Messaging Service
 * ==========================
 *
 * Client-side service cho WebSocket messaging
 *
 * Features:
 * - Auto-reconnect
 * - Idempotent message sending
 * - Message queue for offline
 * - Typing indicators
 * - Read receipts
 * - Presence tracking
 *
 * @author ThietKeResort Team
 */

import { ENV } from "@/config/env";
import EventEmitter from "eventemitter3";
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "./token.service";

// ============================================
// TYPES
// ============================================

export type MessageType =
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "FILE"
  | "AUDIO"
  | "VOICE"
  | "STICKER"
  | "LOCATION"
  | "CALL"
  | "SYSTEM";

export interface Attachment {
  type: string;
  url: string;
  filename?: string;
  size?: number;
  width?: number;
  height?: number;
  duration?: number;
  thumbnail?: string;
  mimeType?: string;
}

export interface SendMessagePayload {
  conversationId: string;
  clientMessageId: string;
  type?: MessageType;
  content?: string;
  attachments?: Attachment[];
  replyToMessageId?: string;
}

export interface MessageAck {
  success: boolean;
  clientMessageId: string;
  messageId?: string;
  seq?: number;
  createdAt?: Date;
  error?: string;
}

export interface NewMessage {
  messageId: string;
  conversationId: string;
  seq: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  type: string;
  content?: string;
  attachments?: Attachment[];
  replyToMessageId?: string;
  createdAt: Date;
}

export interface ReadReceipt {
  conversationId: string;
  userId: number;
  lastReadSeq: number;
  lastReadAt: Date;
}

export interface TypingUpdate {
  conversationId: string;
  userId: number;
  isTyping: boolean;
  typingUsers: number[];
}

export interface PresenceUpdate {
  userId: number;
  status: "ONLINE" | "AWAY" | "BUSY" | "OFFLINE";
  lastSeenAt?: Date;
}

export interface ConversationWatermark {
  conversationId: string;
  lastSeq: number;
}

// ============================================
// SERVICE CLASS
// ============================================

class RealtimeMessagingService extends EventEmitter {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private pendingMessages: Map<string, SendMessagePayload> = new Map();
  private connected = false;

  // ============================================
  // CONNECTION
  // ============================================

  async connect(): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      console.warn("[RealtimeMessaging] No auth token, cannot connect");
      return;
    }

    const wsUrl = ENV.API_BASE_URL.replace("/api", "").replace("http", "ws");

    this.socket = io(`${wsUrl}/messaging`, {
      transports: ["websocket", "polling"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 20000,
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      console.log("[RealtimeMessaging] Connected");
      this.connected = true;
      this.reconnectAttempts = 0;
      this.emit("connected");

      // Resend pending messages
      this.resendPendingMessages();
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[RealtimeMessaging] Disconnected:", reason);
      this.connected = false;
      this.emit("disconnected", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("[RealtimeMessaging] Connection error:", error.message);
      this.reconnectAttempts++;
      this.emit("error", error);
    });

    // Message events
    this.socket.on("message.new", (payload: NewMessage) => {
      this.emit("message", payload);
    });

    this.socket.on("message.edited", (payload: any) => {
      this.emit("messageEdited", payload);
    });

    this.socket.on("message.deleted", (payload: any) => {
      this.emit("messageDeleted", payload);
    });

    this.socket.on("message.reaction", (payload: any) => {
      this.emit("reaction", payload);
    });

    // Read receipts
    this.socket.on("read.receipt", (payload: ReadReceipt) => {
      this.emit("readReceipt", payload);
    });

    this.socket.on("read.sync", (payload: any) => {
      this.emit("readSync", payload);
    });

    // Typing
    this.socket.on("typing.update", (payload: TypingUpdate) => {
      this.emit("typing", payload);
    });

    // Presence
    this.socket.on("presence.update", (payload: PresenceUpdate) => {
      this.emit("presence", payload);
    });

    // Conversation events
    this.socket.on("conversation.updated", (payload: any) => {
      this.emit("conversationUpdated", payload);
    });

    this.socket.on("participant.added", (payload: any) => {
      this.emit("participantAdded", payload);
    });

    this.socket.on("participant.removed", (payload: any) => {
      this.emit("participantRemoved", payload);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected && this.socket?.connected === true;
  }

  // ============================================
  // MESSAGING
  // ============================================

  /**
   * Send message with idempotency
   */
  async sendMessage(payload: SendMessagePayload): Promise<MessageAck> {
    // Store in pending for retry
    this.pendingMessages.set(payload.clientMessageId, payload);

    if (!this.isConnected()) {
      // Queue for later
      return {
        success: false,
        clientMessageId: payload.clientMessageId,
        error: "Not connected",
      };
    }

    return new Promise((resolve) => {
      this.socket!.emit("message.send", payload, (ack: MessageAck) => {
        if (ack.success) {
          this.pendingMessages.delete(payload.clientMessageId);
        }
        resolve(ack);
      });

      // Timeout after 10s
      setTimeout(() => {
        resolve({
          success: false,
          clientMessageId: payload.clientMessageId,
          error: "Timeout",
        });
      }, 10000);
    });
  }

  private async resendPendingMessages() {
    for (const [clientMessageId, payload] of this.pendingMessages) {
      console.log(
        `[RealtimeMessaging] Resending pending message: ${clientMessageId}`
      );
      await this.sendMessage(payload);
    }
  }

  // ============================================
  // READ RECEIPTS
  // ============================================

  markAsRead(conversationId: string, lastReadSeq: number): void {
    if (!this.isConnected()) return;

    this.socket!.emit("message.read", {
      conversationId,
      lastReadSeq,
    });
  }

  // ============================================
  // TYPING INDICATORS
  // ============================================

  startTyping(conversationId: string): void {
    if (!this.isConnected()) return;
    this.socket!.emit("typing.start", { conversationId });
  }

  stopTyping(conversationId: string): void {
    if (!this.isConnected()) return;
    this.socket!.emit("typing.stop", { conversationId });
  }

  // ============================================
  // PRESENCE
  // ============================================

  updatePresence(status: "ONLINE" | "AWAY" | "BUSY" | "OFFLINE"): void {
    if (!this.isConnected()) return;
    this.socket!.emit("presence.update", { status });
  }

  async getPresences(userIds: number[]): Promise<Record<number, string>> {
    if (!this.isConnected()) return {};

    return new Promise((resolve) => {
      this.socket!.emit("presence.get", { userIds }, (response: any) => {
        resolve(response?.presences || {});
      });

      setTimeout(() => resolve({}), 5000);
    });
  }

  // ============================================
  // ROOM MANAGEMENT
  // ============================================

  joinConversation(conversationId: string): void {
    if (!this.isConnected()) return;
    this.socket!.emit("conversation.join", { conversationId });
  }

  leaveConversation(conversationId: string): void {
    if (!this.isConnected()) return;
    this.socket!.emit("conversation.leave", { conversationId });
  }

  // ============================================
  // SYNC
  // ============================================

  async syncConversations(watermarks: ConversationWatermark[]): Promise<any[]> {
    if (!this.isConnected()) return [];

    return new Promise((resolve) => {
      this.socket!.emit(
        "sync.request",
        { conversationWatermarks: watermarks },
        (response: any) => {
          resolve(response?.syncData || []);
        }
      );

      setTimeout(() => resolve([]), 10000);
    });
  }
}

// Singleton
export const realtimeMessaging = new RealtimeMessagingService();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate unique client message ID
 */
export function generateClientMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format message preview for notification
 */
export function formatMessagePreview(
  type: MessageType,
  content?: string
): string {
  if (type === "TEXT" && content) {
    return content.length > 100 ? content.substring(0, 100) + "..." : content;
  }

  const typeLabels: Record<MessageType, string> = {
    TEXT: content || "",
    IMAGE: "📷 Hình ảnh",
    VIDEO: "🎬 Video",
    FILE: "📎 Tệp đính kèm",
    AUDIO: "🎵 Audio",
    VOICE: "🎤 Tin nhắn thoại",
    STICKER: "😀 Sticker",
    LOCATION: "📍 Vị trí",
    CALL: "📞 Cuộc gọi",
    SYSTEM: "📢 Hệ thống",
  };

  return typeLabels[type] || content || "";
}
