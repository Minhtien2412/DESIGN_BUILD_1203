/**
 * Unified Socket Manager - Real-time Communication
 * Consolidated from multiple socket implementations
 *
 * Features:
 * - Auto-reconnection with exponential backoff
 * - Room management (chat, call, notifications)
 * - Presence detection
 * - Typing indicators
 * - Message acknowledgments
 * - Cross-platform support (web, mobile)
 *
 * @updated 2026-01-26
 */

import ENV from "@/config/env";
import { Platform } from "react-native";
import io, { Socket } from "socket.io-client";

// ==================== TYPES ====================

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  type: "text" | "image" | "file" | "audio" | "video" | "system";
  body: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    duration?: number;
    thumbnail?: string;
    width?: number;
    height?: number;
  };
  createdAt: string;
  updatedAt?: string;
  readBy?: string[];
  deliveredTo?: string[];
  replyTo?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
}

export interface SocketConfig {
  token: string;
  userId?: string;
  onMessage?: (message: Message) => void;
  onMessageRead?: (data: {
    chatId: string;
    messageId: string;
    userId: string;
  }) => void;
  onMessageDelivered?: (data: {
    chatId: string;
    messageId: string;
    userId: string;
  }) => void;
  onNotification?: (notification: Notification) => void;
  onTyping?: (data: {
    chatId: string;
    userId: string;
    userName: string;
    isTyping: boolean;
  }) => void;
  onPresence?: (data: {
    userId: string;
    status: "online" | "offline" | "away";
    lastSeen?: string;
  }) => void;
  onCallIncoming?: (data: CallEvent) => void;
  onCallAccepted?: (data: CallEvent) => void;
  onCallRejected?: (data: CallEvent) => void;
  onCallEnded?: (data: CallEvent) => void;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
  onReconnect?: (attemptNumber: number) => void;
}

export interface Notification {
  id: string;
  type: "message" | "call" | "system" | "project" | "payment";
  title: string;
  body: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface CallEvent {
  callId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  receiverId: string;
  type: "audio" | "video";
  roomName?: string;
  status: "ringing" | "accepted" | "rejected" | "ended" | "missed";
}

type SocketStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

// ==================== SOCKET MANAGER CLASS ====================

class UnifiedSocketManager {
  private socket: Socket | null = null;
  private config: SocketConfig | null = null;
  private status: SocketStatus = "disconnected";
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private eventListeners: Map<string, Set<Function>> = new Map();
  private messageQueue: { event: string; data: any }[] = [];
  private joinedRooms: Set<string> = new Set();

  // ==================== CONNECTION METHODS ====================

  /**
   * Connect to WebSocket server
   */
  connect(config: SocketConfig): void {
    if (this.socket?.connected) {
      console.log("[SocketManager] Already connected");
      return;
    }

    this.config = config;
    this.status = "connecting";
    this.emitStatusChange();

    const wsUrl = this.getWebSocketUrl();
    console.log("[SocketManager] Connecting to:", wsUrl);

    try {
      this.socket = io(wsUrl, {
        auth: { token: config.token, userId: config.userId },
        transports:
          Platform.OS === "web"
            ? ["polling", "websocket"]
            : ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: this.maxReconnectDelay,
        timeout: 20000,
        forceNew: true,
      });

      this.setupSocketHandlers();
    } catch (error) {
      console.error("[SocketManager] Connection error:", error);
      this.handleConnectionError(error as Error);
    }
  }

  /**
   * Get WebSocket URL based on environment and platform
   */
  private getWebSocketUrl(): string {
    let url =
      ENV.WS_BASE_URL ||
      ENV.WS_URL ||
      ENV.API_BASE_URL ||
      "wss://baotienweb.cloud";

    // Remove trailing slash
    url = url.replace(/\/$/, "");

    // Convert http to ws for API URLs
    if (url.startsWith("http://")) {
      url = url.replace("http://", "ws://");
    } else if (url.startsWith("https://")) {
      url = url.replace("https://", "wss://");
    }

    // Android emulator cannot reach localhost
    if (
      Platform.OS === "android" &&
      (url.includes("localhost") || url.includes("127.0.0.1"))
    ) {
      url = url
        .replace("localhost", "10.0.2.2")
        .replace("127.0.0.1", "10.0.2.2");
    }

    return url;
  }

  /**
   * Setup socket event handlers
   */
  private setupSocketHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      console.log("[SocketManager] ✅ Connected:", this.socket?.id);
      this.status = "connected";
      this.reconnectAttempts = 0;
      this.emitStatusChange();
      this.config?.onConnect?.();
      this.startHeartbeat();
      this.flushMessageQueue();
      this.rejoinRooms();
    });

    this.socket.on("disconnect", (reason: string) => {
      console.log("[SocketManager] ❌ Disconnected:", reason);
      this.status = "disconnected";
      this.emitStatusChange();
      this.config?.onDisconnect?.(reason);
      this.stopHeartbeat();
    });

    this.socket.on("connect_error", (error: Error) => {
      console.warn(
        "[SocketManager] Connection error:",
        error?.message || "Unknown",
      );
      this.status = "error";
      this.handleConnectionError(error);
    });

    this.socket.on("reconnect", (attemptNumber: number) => {
      console.log(
        "[SocketManager] Reconnected after",
        attemptNumber,
        "attempts",
      );
      this.status = "connected";
      this.config?.onReconnect?.(attemptNumber);
    });

    this.socket.on("reconnect_attempt", () => {
      this.status = "reconnecting";
      this.emitStatusChange();
    });

    // Message events
    this.socket.on("message:new", (message: Message) => {
      console.log("[SocketManager] New message:", message.id);
      this.config?.onMessage?.(message);
      this.emit("message", message);
    });

    this.socket.on("message:read", (data: any) => {
      this.config?.onMessageRead?.(data);
      this.emit("messageRead", data);
    });

    this.socket.on("message:delivered", (data: any) => {
      this.config?.onMessageDelivered?.(data);
      this.emit("messageDelivered", data);
    });

    // Typing events
    this.socket.on("typing:start", (data: any) => {
      this.config?.onTyping?.({ ...data, isTyping: true });
      this.emit("typing", { ...data, isTyping: true });
    });

    this.socket.on("typing:stop", (data: any) => {
      this.config?.onTyping?.({ ...data, isTyping: false });
      this.emit("typing", { ...data, isTyping: false });
    });

    // Presence events
    this.socket.on("presence:update", (data: any) => {
      this.config?.onPresence?.(data);
      this.emit("presence", data);
    });

    // Notification events
    this.socket.on("notification:new", (notification: Notification) => {
      console.log("[SocketManager] New notification:", notification.id);
      this.config?.onNotification?.(notification);
      this.emit("notification", notification);
    });

    // Call events
    this.socket.on("call:incoming", (data: CallEvent) => {
      console.log("[SocketManager] Incoming call:", data.callId);
      this.config?.onCallIncoming?.(data);
      this.emit("callIncoming", data);
    });

    this.socket.on("call:accepted", (data: CallEvent) => {
      this.config?.onCallAccepted?.(data);
      this.emit("callAccepted", data);
    });

    this.socket.on("call:rejected", (data: CallEvent) => {
      this.config?.onCallRejected?.(data);
      this.emit("callRejected", data);
    });

    this.socket.on("call:ended", (data: CallEvent) => {
      this.config?.onCallEnded?.(data);
      this.emit("callEnded", data);
    });

    // Error event
    this.socket.on("error", (error: Error) => {
      console.error("[SocketManager] Socket error:", error);
      this.config?.onError?.(error);
    });
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    console.log("[SocketManager] Disconnecting...");
    this.stopHeartbeat();
    this.clearReconnectTimeout();

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.status = "disconnected";
    this.joinedRooms.clear();
    this.config = null;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get current status
   */
  getStatus(): SocketStatus {
    return this.status;
  }

  // ==================== ROOM METHODS ====================

  /**
   * Join a chat room
   */
  joinRoom(roomId: string): void {
    if (!this.socket?.connected) {
      console.warn(
        "[SocketManager] Not connected, queueing join room:",
        roomId,
      );
      this.joinedRooms.add(roomId);
      return;
    }

    console.log("[SocketManager] Joining room:", roomId);
    this.socket.emit("room:join", { roomId });
    this.joinedRooms.add(roomId);
  }

  /**
   * Leave a chat room
   */
  leaveRoom(roomId: string): void {
    if (!this.socket) return;

    console.log("[SocketManager] Leaving room:", roomId);
    this.socket.emit("room:leave", { roomId });
    this.joinedRooms.delete(roomId);
  }

  /**
   * Rejoin all rooms after reconnection
   */
  private rejoinRooms(): void {
    this.joinedRooms.forEach((roomId) => {
      this.socket?.emit("room:join", { roomId });
    });
  }

  // ==================== MESSAGE METHODS ====================

  /**
   * Send a message
   */
  sendMessage(
    chatId: string,
    payload: {
      type: Message["type"];
      body: string;
      metadata?: Message["metadata"];
      replyTo?: string;
    },
  ): Promise<{ ok: boolean; messageId?: string; error?: string }> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        this.messageQueue.push({
          event: "message:send",
          data: { chatId, ...payload },
        });
        resolve({ ok: false, error: "Not connected" });
        return;
      }

      this.socket.emit(
        "message:send",
        { chatId, ...payload },
        (response: any) => {
          resolve(response || { ok: true });
        },
      );
    });
  }

  /**
   * Mark message as read
   */
  markAsRead(chatId: string, messageId: string): Promise<{ ok: boolean }> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve({ ok: false });
        return;
      }

      this.socket.emit(
        "message:read",
        { chatId, messageId },
        (response: any) => {
          resolve(response || { ok: true });
        },
      );
    });
  }

  /**
   * Send typing indicator
   */
  sendTyping(chatId: string, isTyping: boolean): void {
    if (!this.socket?.connected) return;

    this.socket.emit(isTyping ? "typing:start" : "typing:stop", { chatId });
  }

  // ==================== CALL METHODS ====================

  /**
   * Initiate a call
   */
  initiateCall(
    receiverId: string,
    type: "audio" | "video",
  ): Promise<{ ok: boolean; callId?: string; roomName?: string }> {
    return new Promise((resolve) => {
      if (!this.socket?.connected) {
        resolve({ ok: false });
        return;
      }

      this.socket.emit(
        "call:initiate",
        { receiverId, type },
        (response: any) => {
          resolve(response || { ok: false });
        },
      );
    });
  }

  /**
   * Accept incoming call
   */
  acceptCall(callId: string): void {
    this.socket?.emit("call:accept", { callId });
  }

  /**
   * Reject incoming call
   */
  rejectCall(callId: string): void {
    this.socket?.emit("call:reject", { callId });
  }

  /**
   * End ongoing call
   */
  endCall(callId: string): void {
    this.socket?.emit("call:end", { callId });
  }

  // ==================== EVENT EMITTER METHODS ====================

  /**
   * Subscribe to an event
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback: Function): void {
    this.eventListeners.get(event)?.delete(callback);
  }

  /**
   * Emit event to local listeners
   */
  private emit(event: string, data: any): void {
    this.eventListeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("[SocketManager] Event callback error:", error);
      }
    });
  }

  /**
   * Emit status change
   */
  private emitStatusChange(): void {
    this.emit("statusChange", this.status);
  }

  // ==================== INTERNAL METHODS ====================

  /**
   * Handle connection error
   */
  private handleConnectionError(error: Error): void {
    this.config?.onError?.(error);
    this.reconnectAttempts++;

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn("[SocketManager] Max reconnection attempts reached");
      this.status = "error";
      this.emitStatusChange();
      return;
    }

    // Exponential backoff
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay,
    );

    console.log(
      `[SocketManager] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`,
    );

    this.clearReconnectTimeout();
    this.reconnectTimeout = setTimeout(() => {
      if (this.config) {
        this.connect(this.config);
      }
    }, delay);
  }

  /**
   * Clear reconnect timeout
   */
  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Start heartbeat
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit("heartbeat");
      }
    }, 30000);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.socket?.connected) {
      const { event, data } = this.messageQueue.shift()!;
      this.socket.emit(event, data);
    }
  }
}

// ==================== SINGLETON EXPORT ====================

export const socketManager = new UnifiedSocketManager();
export default socketManager;
