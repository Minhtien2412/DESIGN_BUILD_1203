/**
 * Reactions Service (Frontend)
 *
 * Service cho emoji reactions API:
 * - 👍 like, ❤️ love, 😂 haha, 😮 wow, 😢 sad, 😡 angry
 *
 * Hỗ trợ:
 * - Toggle reaction (add/change/remove)
 * - Get reaction summary
 * - Get users who reacted
 * - Batch get for feed optimization
 * - WebSocket real-time updates
 *
 * @author AI Assistant
 * @date 27/01/2026
 */

import { getWsBaseUrl } from "@/services/socket/socketConfig";
import { io, Socket } from "socket.io-client";
import { apiFetch } from "./api";

// ==================== TYPES ====================

export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export interface ReactionCounts {
  total: number;
  like: number;
  love: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
}

export interface ReactionSummary {
  counts: ReactionCounts;
  topReactions: ReactionType[];
  userReaction: ReactionType | null;
}

export interface ReactedUser {
  id: number;
  name: string;
  avatar: string;
  reactionType: ReactionType;
  reactedAt: string;
}

export interface ReactionEvent {
  action: "added" | "changed" | "removed";
  contentType: string;
  contentId: number;
  userId: number;
  userName: string;
  userAvatar: string;
  reactionType?: ReactionType;
  previousType?: ReactionType;
  counts: ReactionCounts;
  timestamp: string;
}

// ==================== EMOJI MAPPING ====================

export const REACTION_EMOJIS: Record<ReactionType, string> = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

export const REACTION_LABELS: Record<ReactionType, string> = {
  like: "Thích",
  love: "Yêu thích",
  haha: "Haha",
  wow: "Wow",
  sad: "Buồn",
  angry: "Phẫn nộ",
};

// ==================== API FUNCTIONS ====================

/**
 * Toggle reaction (add/change/remove)
 */
export async function toggleReaction(
  contentType: string,
  contentId: number,
  type: ReactionType,
): Promise<{
  success: boolean;
  action?: "added" | "changed" | "removed";
  previousType?: ReactionType;
  currentType?: ReactionType;
  counts?: ReactionCounts;
  error?: string;
}> {
  try {
    const response = await apiFetch<{
      success: boolean;
      action: "added" | "changed" | "removed";
      previousType?: ReactionType;
      currentType?: ReactionType;
      counts: ReactionCounts;
    }>("/reactions", {
      method: "POST",
      body: JSON.stringify({
        contentType,
        contentId,
        type,
      }),
    });

    return response;
  } catch (error) {
    console.error("[ReactionsService] Toggle reaction failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Remove reaction
 */
export async function removeReaction(
  contentType: string,
  contentId: number,
): Promise<{
  success: boolean;
  removed?: boolean;
  counts?: ReactionCounts;
  error?: string;
}> {
  try {
    const response = await apiFetch<{
      success: boolean;
      removed: boolean;
      counts: ReactionCounts;
    }>(`/reactions/${contentType}/${contentId}`, {
      method: "DELETE",
    });

    return response;
  } catch (error) {
    console.error("[ReactionsService] Remove reaction failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get reaction summary for content
 */
export async function getReactionSummary(
  contentType: string,
  contentId: number,
): Promise<ReactionSummary | null> {
  try {
    const response = await apiFetch<{
      success: boolean;
      counts: ReactionCounts;
      topReactions: ReactionType[];
      userReaction: ReactionType | null;
    }>(`/reactions/${contentType}/${contentId}`);

    if (response.success) {
      return {
        counts: response.counts,
        topReactions: response.topReactions,
        userReaction: response.userReaction,
      };
    }
    return null;
  } catch (error) {
    console.error("[ReactionsService] Get summary failed:", error);
    return null;
  }
}

/**
 * Get users who reacted to content
 */
export async function getReactedUsers(
  contentType: string,
  contentId: number,
  reactionType?: ReactionType,
  limit = 50,
  offset = 0,
): Promise<{ users: ReactedUser[]; total: number } | null> {
  try {
    let url = `/reactions/${contentType}/${contentId}/users?limit=${limit}&offset=${offset}`;
    if (reactionType) {
      url += `&type=${reactionType}`;
    }

    const response = await apiFetch<{
      success: boolean;
      users: ReactedUser[];
      total: number;
    }>(url);

    if (response.success) {
      return {
        users: response.users,
        total: response.total,
      };
    }
    return null;
  } catch (error) {
    console.error("[ReactionsService] Get reacted users failed:", error);
    return null;
  }
}

/**
 * Batch get reactions for multiple contents (feed optimization)
 */
export async function batchGetReactions(
  contentType: string,
  contentIds: number[],
): Promise<Record<number, ReactionSummary> | null> {
  try {
    const response = await apiFetch<{
      success: boolean;
      reactions: Record<number, ReactionSummary>;
    }>("/reactions/batch", {
      method: "POST",
      body: JSON.stringify({
        contentType,
        contentIds,
      }),
    });

    if (response.success) {
      return response.reactions;
    }
    return null;
  } catch (error) {
    console.error("[ReactionsService] Batch get failed:", error);
    return null;
  }
}

/**
 * Get current user's reaction history
 */
export async function getMyReactions(
  contentType?: string,
  limit = 50,
  offset = 0,
): Promise<
  | {
      id: number;
      contentType: string;
      contentId: number;
      type: ReactionType;
      createdAt: string;
    }[]
  | null
> {
  try {
    let url = `/reactions/me?limit=${limit}&offset=${offset}`;
    if (contentType) {
      url += `&contentType=${contentType}`;
    }

    const response = await apiFetch<{
      success: boolean;
      reactions: {
        id: number;
        contentType: string;
        contentId: number;
        type: ReactionType;
        createdAt: string;
      }[];
    }>(url);

    if (response.success) {
      return response.reactions;
    }
    return null;
  } catch (error) {
    console.error("[ReactionsService] Get my reactions failed:", error);
    return null;
  }
}

// ==================== WEBSOCKET CLASS ====================

type ReactionEventHandler = (event: ReactionEvent) => void;

class ReactionsSocketManager {
  private socket: Socket | null = null;
  private isConnected = false;
  private subscriptions: Set<string> = new Set();
  private eventHandlers: Map<string, Set<ReactionEventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private userId?: number;
  private userName?: string;

  /**
   * Connect to reactions WebSocket namespace
   */
  connect(userId?: number, userName?: string): void {
    if (this.socket?.connected) {
      console.log("[ReactionsSocket] Already connected");
      return;
    }

    this.userId = userId;
    this.userName = userName;

    const wsUrl = getWsBaseUrl();

    this.socket = io(`${wsUrl}/reactions`, {
      transports: ["websocket"],
      query: {
        userId: userId?.toString() || "",
        userName: userName || "",
      },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("[ReactionsSocket] Connected");
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Re-subscribe to all rooms after reconnect
      this.subscriptions.forEach((room) => {
        const [contentType, contentId] = room.split(":");
        this.socket?.emit("subscribe:content", {
          contentType,
          contentId: parseInt(contentId),
        });
      });
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[ReactionsSocket] Disconnected:", reason);
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("[ReactionsSocket] Connection error:", error.message);
      this.reconnectAttempts++;
    });

    // Listen for reaction events
    ["added", "changed", "removed"].forEach((action) => {
      this.socket?.on(`reaction:${action}`, (event: ReactionEvent) => {
        this.handleReactionEvent(event);
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
      this.subscriptions.clear();
    }
  }

  /**
   * Subscribe to content reactions
   */
  subscribe(contentType: string, contentId: number): void {
    const room = `${contentType}:${contentId}`;

    if (this.subscriptions.has(room)) {
      return;
    }

    this.subscriptions.add(room);

    if (this.socket?.connected) {
      this.socket.emit("subscribe:content", { contentType, contentId });
    }
  }

  /**
   * Unsubscribe from content reactions
   */
  unsubscribe(contentType: string, contentId: number): void {
    const room = `${contentType}:${contentId}`;

    this.subscriptions.delete(room);

    if (this.socket?.connected) {
      this.socket.emit("unsubscribe:content", { contentType, contentId });
    }
  }

  /**
   * Subscribe to multiple contents at once
   */
  batchSubscribe(contents: { contentType: string; contentId: number }[]): void {
    contents.forEach((c) => {
      this.subscriptions.add(`${c.contentType}:${c.contentId}`);
    });

    if (this.socket?.connected) {
      this.socket.emit("subscribe:batch", { contents });
    }
  }

  /**
   * Add event handler for specific content
   */
  onReaction(
    contentType: string,
    contentId: number,
    handler: ReactionEventHandler,
  ): () => void {
    const key = `${contentType}:${contentId}`;

    if (!this.eventHandlers.has(key)) {
      this.eventHandlers.set(key, new Set());
    }
    this.eventHandlers.get(key)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.eventHandlers.get(key)?.delete(handler);
    };
  }

  /**
   * Add global event handler for all reactions
   */
  onAnyReaction(handler: ReactionEventHandler): () => void {
    const key = "*";

    if (!this.eventHandlers.has(key)) {
      this.eventHandlers.set(key, new Set());
    }
    this.eventHandlers.get(key)!.add(handler);

    return () => {
      this.eventHandlers.get(key)?.delete(handler);
    };
  }

  private handleReactionEvent(event: ReactionEvent): void {
    const key = `${event.contentType}:${event.contentId}`;

    // Call specific handlers
    this.eventHandlers.get(key)?.forEach((handler) => handler(event));

    // Call global handlers
    this.eventHandlers.get("*")?.forEach((handler) => handler(event));
  }

  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const reactionsSocket = new ReactionsSocketManager();

// ==================== CONVENIENCE EXPORTS ====================

export default {
  toggleReaction,
  removeReaction,
  getReactionSummary,
  getReactedUsers,
  batchGetReactions,
  getMyReactions,
  socket: reactionsSocket,
  EMOJIS: REACTION_EMOJIS,
  LABELS: REACTION_LABELS,
};
