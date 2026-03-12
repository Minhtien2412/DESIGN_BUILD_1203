/**
 * Socket.IO Client Service
 * Based on FRONTEND-INTEGRATION-GUIDE.md
 *
 * Features:
 * - Real-time chat
 * - Notifications
 * - Project updates
 * - Typing indicators
 */

import ENV from "@/config/env";
import type { Socket } from "@/utils/socketIo";
import { getSocketIo } from "@/utils/socketIo";
import { Platform } from "react-native";
import { getAccessToken } from "./apiClient";

// ============================================================================
// Types
// ============================================================================

export interface ChatMessage {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  type: "text" | "image" | "file";
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    avatar?: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "payment" | "project" | "message" | "system";
  read: boolean;
  createdAt: string;
  data?: any;
}

export interface ProjectUpdate {
  projectId: string;
  type:
    | "status_changed"
    | "member_added"
    | "milestone_completed"
    | "task_updated";
  data: any;
}

export interface TypingIndicator {
  userId: string;
  fullName: string;
  projectId: string;
}

export interface LiveStreamEvent {
  streamId: string;
  type:
    | "started"
    | "ended"
    | "viewer_joined"
    | "viewer_left"
    | "comment"
    | "reaction";
  data?: any;
}

export interface ActivityFeedEvent {
  id: string;
  type:
    | "project_created"
    | "payment_received"
    | "milestone_completed"
    | "user_joined"
    | "comment_added";
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  timestamp: string;
  data?: any;
}

// ============================================================================
// Socket Manager Class
// ============================================================================

class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private namespace: string = "/chat"; // Default namespace

  /**
   * Initialize socket connection to a specific namespace
   * @param namespace - Socket.IO namespace ('/chat', '/call', '/progress')
   */
  async connect(namespace: string = "/chat"): Promise<Socket> {
    if (this.socket?.connected && this.namespace === namespace) {
      console.log("[Socket] Already connected to", namespace);
      return this.socket;
    }

    // Disconnect from previous namespace if different
    if (this.socket && this.namespace !== namespace) {
      this.disconnect();
    }

    const token = await getAccessToken();
    if (!token) {
      throw new Error("No access token available for socket connection");
    }

    // Use base URL + namespace (e.g., wss://baotienweb.cloud + /chat)
    const baseUrl = this.normalizeWsUrl(
      ENV.WS_BASE_URL || ENV.WS_URL || ENV.API_BASE_URL,
    );
    const wsUrl = `${baseUrl}${namespace}`;

    console.log("[Socket] Connecting to:", wsUrl);
    this.namespace = namespace;

    const io = await getSocketIo();
    this.socket = io(wsUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupEventListeners();

    return this.socket;
  }

  /**
   * Connect to Chat namespace
   */
  async connectChat(): Promise<Socket> {
    return this.connect(ENV.WS_CHAT_NS || "/chat");
  }

  /**
   * Connect to Call namespace
   */
  async connectCall(): Promise<Socket> {
    return this.connect(ENV.WS_CALL_NS || "/call");
  }

  /**
   * Connect to Progress namespace
   */
  async connectProgress(): Promise<Socket> {
    return this.connect(ENV.WS_PROGRESS_NS || "/progress");
  }

  /**
   * Normalize WebSocket URL for different platforms
   */
  private normalizeWsUrl(url: string): string {
    try {
      const wsUrl = new URL(url);

      // Android emulator cannot reach localhost on host machine
      if (
        Platform.OS === "android" &&
        (wsUrl.hostname === "localhost" || wsUrl.hostname === "127.0.0.1")
      ) {
        wsUrl.hostname = "10.0.2.2";
      }

      return wsUrl.toString().replace(/\/$/, "");
    } catch {
      // Fallback for non-URL strings
      if (
        Platform.OS === "android" &&
        (url.includes("localhost") || url.includes("127.0.0.1"))
      ) {
        return url
          .replace("localhost", "10.0.2.2")
          .replace("127.0.0.1", "10.0.2.2")
          .replace(/\/$/, "");
      }
      return url.replace(/\/$/, "");
    }
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("[Socket] ✅ Connected:", this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason: string) => {
      console.log("[Socket] ❌ Disconnected:", reason);
    });

    // Refresh token before each reconnect attempt to avoid jwt expired errors
    this.socket.on("reconnect_attempt", async () => {
      try {
        const freshToken = await getAccessToken();
        if (freshToken && this.socket) {
          (this.socket as any).auth = { token: freshToken };
          console.log("[Socket] Token refreshed for reconnection");
        }
      } catch (err) {
        console.warn("[Socket] Failed to refresh token for reconnection:", err);
      }
    });

    this.socket.on("connect_error", (error: Error) => {
      // Safely log error to prevent Babel construct.js crash
      try {
        console.warn(
          "[Socket] Connection error:",
          error?.message || "Unknown error",
        );
      } catch (e) {
        console.warn("[Socket] Connection error occurred");
      }
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn("[Socket] Max reconnection attempts reached");
        this.disconnect();
      }
    });

    this.socket.on("error", (error: Error) => {
      // Safely log error to prevent Babel crash
      try {
        console.warn(
          "[Socket] Error:",
          error?.message || "Unknown socket error",
        );
      } catch (e) {
        console.warn("[Socket] Error occurred");
      }
    });
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      console.log("[Socket] Disconnecting...");
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // =========================================================================
  // Chat Methods
  // =========================================================================

  /**
   * Join chat room
   */
  joinChat(projectId: string) {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }
    console.log("[Socket] Joining chat:", projectId);
    this.socket.emit("joinRoom", { projectId });
  }

  /**
   * Leave chat room
   */
  leaveChat(projectId: string) {
    if (!this.socket) return;
    console.log("[Socket] Leaving chat:", projectId);
    this.socket.emit("leaveRoom", { projectId });
  }

  /**
   * Send chat message
   */
  sendMessage(
    projectId: string,
    content: string,
    type: "text" | "image" | "file" = "text",
  ) {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }
    console.log("[Socket] Sending message to:", projectId);
    this.socket.emit("sendMessage", { projectId, content, type });
  }

  /**
   * Listen for new messages
   */
  onNewMessage(callback: (message: ChatMessage) => void) {
    if (!this.socket) return;
    this.socket.on("newMessage", callback);
  }

  /**
   * Remove message listener
   */
  offNewMessage(callback?: (message: ChatMessage) => void) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off("newMessage", callback);
    } else {
      this.socket.off("newMessage");
    }
  }

  /**
   * Start typing indicator
   */
  startTyping(projectId: string) {
    if (!this.socket) return;
    this.socket.emit("typing", { projectId, isTyping: true });
  }

  /**
   * Stop typing indicator
   */
  stopTyping(projectId: string) {
    if (!this.socket) return;
    this.socket.emit("typing", { projectId, isTyping: false });
  }

  /**
   * Listen for typing indicators
   */
  onTyping(callback: (data: TypingIndicator) => void) {
    if (!this.socket) return;
    this.socket.on("userTyping", callback);
  }

  /**
   * Remove typing listener
   */
  offTyping(callback?: (data: TypingIndicator) => void) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off("userTyping", callback);
    } else {
      this.socket.off("userTyping");
    }
  }

  /**
   * Mark messages as read in a room
   */
  markAsRead(projectId: string, messageIds?: string[]) {
    if (!this.socket) return;
    console.log("[Socket] Marking messages as read in:", projectId);
    this.socket.emit("markAsRead", { projectId, messageIds });
  }

  /**
   * Listen for message read receipts
   */
  onMessageRead(
    callback: (data: {
      projectId: string;
      userId: string;
      messageIds?: string[];
    }) => void,
  ) {
    if (!this.socket) return;
    this.socket.on("messageRead", callback);
  }

  /**
   * Remove message read listener
   */
  offMessageRead(
    callback?: (data: {
      projectId: string;
      userId: string;
      messageIds?: string[];
    }) => void,
  ) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off("messageRead", callback);
    } else {
      this.socket.off("messageRead");
    }
  }

  /**
   * Get online users in a room
   */
  getOnlineUsers(projectId: string) {
    if (!this.socket) return;
    this.socket.emit("getOnlineUsers", { projectId });
  }

  /**
   * Listen for user online status changes
   */
  onUserOnline(callback: (data: { userId: string; fullName: string }) => void) {
    if (!this.socket) return;
    this.socket.on("userOnline", callback);
  }

  /**
   * Remove user online listener
   */
  offUserOnline(
    callback?: (data: { userId: string; fullName: string }) => void,
  ) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off("userOnline", callback);
    } else {
      this.socket.off("userOnline");
    }
  }

  /**
   * Listen for user offline status changes
   */
  onUserOffline(
    callback: (data: { userId: string; fullName: string }) => void,
  ) {
    if (!this.socket) return;
    this.socket.on("userOffline", callback);
  }

  /**
   * Remove user offline listener
   */
  offUserOffline(
    callback?: (data: { userId: string; fullName: string }) => void,
  ) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off("userOffline", callback);
    } else {
      this.socket.off("userOffline");
    }
  }

  /**
   * Listen for user joined room events
   */
  onUserJoined(
    callback: (data: {
      userId: string;
      fullName: string;
      projectId: string;
    }) => void,
  ) {
    if (!this.socket) return;
    this.socket.on("userJoined", callback);
  }

  /**
   * Remove user joined listener
   */
  offUserJoined(
    callback?: (data: {
      userId: string;
      fullName: string;
      projectId: string;
    }) => void,
  ) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off("userJoined", callback);
    } else {
      this.socket.off("userJoined");
    }
  }

  /**
   * Listen for user left room events
   */
  onUserLeft(
    callback: (data: {
      userId: string;
      fullName: string;
      projectId: string;
    }) => void,
  ) {
    if (!this.socket) return;
    this.socket.on("userLeft", callback);
  }

  /**
   * Remove user left listener
   */
  offUserLeft(
    callback?: (data: {
      userId: string;
      fullName: string;
      projectId: string;
    }) => void,
  ) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off("userLeft", callback);
    } else {
      this.socket.off("userLeft");
    }
  }

  // =========================================================================
  // Notification Methods
  // =========================================================================

  /**
   * Listen for new notifications
   * NOTE: Backend /chat namespace uses 'notification:new',
   *       Backend /notifications namespace uses 'notification'
   */
  onNotification(callback: (notification: Notification) => void) {
    if (!this.socket) return;
    // Listen to both event names for compatibility
    this.socket.on("notification:new", callback);
    this.socket.on("notification", callback);
  }

  /**
   * Remove notification listener
   */
  offNotification(callback?: (notification: Notification) => void) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off("notification:new", callback);
      this.socket.off("notification", callback);
    } else {
      this.socket.off("notification:new");
      this.socket.off("notification");
    }
  }

  // =========================================================================
  // Project Update Methods
  // =========================================================================

  /**
   * Subscribe to project updates
   */
  subscribeToProject(projectId: string) {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }
    console.log("[Socket] Subscribing to project:", projectId);
    this.socket.emit("subscribe:project", { projectId });
  }

  /**
   * Unsubscribe from project updates
   */
  unsubscribeFromProject(projectId: string) {
    if (!this.socket) return;
    console.log("[Socket] Unsubscribing from project:", projectId);
    this.socket.emit("unsubscribe:project", { projectId });
  }

  /**
   * Listen for project updates
   */
  onProjectUpdate(callback: (update: ProjectUpdate) => void) {
    if (!this.socket) return;
    this.socket.on("project:update", callback);
  }

  /**
   * Remove project update listener
   */
  offProjectUpdate(callback?: (update: ProjectUpdate) => void) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off("project:update", callback);
    } else {
      this.socket.off("project:update");
    }
  }

  // =========================================================================
  // Live Stream Methods
  // =========================================================================

  /**
   * Join live stream room
   */
  joinLiveStream(streamId: string) {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }
    console.log("[Socket] Joining live stream:", streamId);
    this.socket.emit("stream:join", { streamId });
  }

  /**
   * Leave live stream room
   */
  leaveLiveStream(streamId: string) {
    if (!this.socket) return;
    console.log("[Socket] Leaving live stream:", streamId);
    this.socket.emit("stream:leave", { streamId });
  }

  /**
   * Listen for live stream events
   */
  onLiveStreamEvent(callback: (event: LiveStreamEvent) => void) {
    if (!this.socket) return;
    this.socket.on("stream:event", callback);
  }

  /**
   * Remove live stream event listener
   */
  offLiveStreamEvent(callback?: (event: LiveStreamEvent) => void) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off("stream:event", callback);
    } else {
      this.socket.off("stream:event");
    }
  }

  // =========================================================================
  // Activity Feed Methods
  // =========================================================================

  /**
   * Subscribe to activity feed
   */
  subscribeToActivityFeed() {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }
    console.log("[Socket] Subscribing to activity feed");
    this.socket.emit("subscribe:activity");
  }

  /**
   * Unsubscribe from activity feed
   */
  unsubscribeFromActivityFeed() {
    if (!this.socket) return;
    console.log("[Socket] Unsubscribing from activity feed");
    this.socket.emit("unsubscribe:activity");
  }

  /**
   * Listen for activity feed events
   */
  onActivityFeed(callback: (event: ActivityFeedEvent) => void) {
    if (!this.socket) return;
    this.socket.on("activity:new", callback);
  }

  /**
   * Remove activity feed listener
   */
  offActivityFeed(callback?: (event: ActivityFeedEvent) => void) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off("activity:new", callback);
    } else {
      this.socket.off("activity:new");
    }
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

const socketManager = new SocketManager();

export default socketManager;
export { socketManager };

/**
 * Get socket instance (for useRealtimeLocation)
 */
export function getSocket(): Socket | null {
  return socketManager.getSocket();
}
