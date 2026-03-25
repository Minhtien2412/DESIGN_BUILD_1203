/**
 * Livestream Socket Service
 * WebSocket service for live streaming functionality
 * Supports RTMP streaming + LiveKit for interactive features
 *
 * @created 19/01/2026
 */

import { getWsBaseUrl } from "@/services/socket/socketConfig";
import { getItem } from "@/utils/storage";
import { io, Socket } from "socket.io-client";

// ============================================================================
// Types
// ============================================================================

export interface LivestreamInfo {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  hostId: number;
  hostName: string;
  hostAvatar?: string;
  status: "scheduled" | "live" | "ended";
  viewerCount: number;
  likeCount: number;
  startedAt?: string;
  endedAt?: string;
  scheduledAt?: string;
  isPrivate: boolean;
  tags?: string[];
}

export interface StreamCredentials {
  rtmpUrl: string;
  streamKey: string;
  playbackUrl: string;
  livekitToken?: string;
  livekitServerUrl?: string;
}

export interface LivestreamViewer {
  id: number;
  name: string;
  avatar?: string;
  joinedAt: string;
  isSubscriber: boolean;
}

export interface LivestreamComment {
  id: string;
  userId: number;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  isPinned: boolean;
  isHighlighted: boolean;
}

export interface LivestreamGift {
  id: string;
  giftType: string;
  giftName: string;
  giftIcon: string;
  amount: number;
  senderId: number;
  senderName: string;
  value: number;
  timestamp: string;
}

export interface LivestreamPoll {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    voteCount: number;
  }[];
  endTime: string;
  isActive: boolean;
}

// Server -> Client Events
interface ServerToClientEvents {
  // Connection
  connected: (data: { socketId: string }) => void;
  error: (data: { message: string; code?: string }) => void;

  // Stream events
  "stream:created": (data: {
    stream: LivestreamInfo;
    credentials: StreamCredentials;
  }) => void;
  "stream:started": (data: { streamId: string }) => void;
  "stream:ended": (data: { streamId: string; reason: string }) => void;
  "stream:updated": (data: { stream: Partial<LivestreamInfo> }) => void;

  // Viewer events
  "viewer:joined": (data: {
    streamId: string;
    viewer: LivestreamViewer;
  }) => void;
  "viewer:left": (data: { streamId: string; userId: number }) => void;
  "viewer:count": (data: { streamId: string; count: number }) => void;

  // Interaction events
  "comment:new": (data: LivestreamComment) => void;
  "comment:pinned": (data: { streamId: string; commentId: string }) => void;
  "comment:deleted": (data: { streamId: string; commentId: string }) => void;

  "gift:received": (data: LivestreamGift) => void;
  "like:received": (data: {
    streamId: string;
    userId: number;
    totalLikes: number;
  }) => void;

  // Poll events
  "poll:created": (data: LivestreamPoll) => void;
  "poll:updated": (data: LivestreamPoll) => void;
  "poll:ended": (data: { pollId: string; results: LivestreamPoll }) => void;

  // Moderation events
  "user:muted": (data: {
    streamId: string;
    userId: number;
    duration: number;
  }) => void;
  "user:banned": (data: { streamId: string; userId: number }) => void;
}

// Client -> Server Events
interface ClientToServerEvents {
  // Stream management
  "stream:create": (data: {
    title: string;
    description?: string;
    thumbnailUrl?: string;
    isPrivate?: boolean;
    scheduledAt?: string;
    tags?: string[];
  }) => void;
  "stream:start": (data: { streamId: string }) => void;
  "stream:end": (data: { streamId: string }) => void;
  "stream:update": (data: {
    streamId: string;
    title?: string;
    description?: string;
  }) => void;

  // Viewer actions
  "stream:join": (data: { streamId: string }) => void;
  "stream:leave": (data: { streamId: string }) => void;

  // Interactions
  "comment:send": (data: { streamId: string; content: string }) => void;
  "comment:pin": (data: { streamId: string; commentId: string }) => void;
  "comment:delete": (data: { streamId: string; commentId: string }) => void;

  "gift:send": (data: {
    streamId: string;
    giftType: string;
    amount: number;
  }) => void;
  "like:send": (data: { streamId: string }) => void;

  // Polls
  "poll:create": (data: {
    streamId: string;
    question: string;
    options: string[];
    duration: number;
  }) => void;
  "poll:vote": (data: { pollId: string; optionId: string }) => void;
  "poll:end": (data: { pollId: string }) => void;

  // Moderation
  "user:mute": (data: {
    streamId: string;
    userId: number;
    duration: number;
  }) => void;
  "user:unmute": (data: { streamId: string; userId: number }) => void;
  "user:ban": (data: { streamId: string; userId: number }) => void;
}

// ============================================================================
// LivestreamSocket Class
// ============================================================================

export class LivestreamSocket {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
    null;
  private wsUrl: string;

  constructor() {
    this.wsUrl = `${getWsBaseUrl()}/livestream`;
  }

  // Connect to livestream namespace
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log("[LivestreamSocket] Already connected");
      return;
    }

    try {
      const token = await getItem("accessToken");

      this.socket = io(this.wsUrl, {
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        auth: {
          token,
        },
      });

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Connection timeout"));
        }, 10000);

        this.socket!.on("connect", () => {
          clearTimeout(timeout);
          console.log("[LivestreamSocket] Connected");
          resolve();
        });

        this.socket!.on("connect_error", (err) => {
          clearTimeout(timeout);
          console.error("[LivestreamSocket] Connection error:", err.message);
          reject(err);
        });
      });
    } catch (error) {
      console.error("[LivestreamSocket] Connect failed:", error);
      throw error;
    }
  }

  // Disconnect
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log("[LivestreamSocket] Disconnected");
    }
  }

  // Check connection
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // =========================================================================
  // Stream Management (Broadcaster)
  // =========================================================================

  createStream(data: {
    title: string;
    description?: string;
    thumbnailUrl?: string;
    isPrivate?: boolean;
    scheduledAt?: string;
    tags?: string[];
  }): void {
    this.socket?.emit("stream:create", data);
  }

  startStream(streamId: string): void {
    this.socket?.emit("stream:start", { streamId });
  }

  endStream(streamId: string): void {
    this.socket?.emit("stream:end", { streamId });
  }

  updateStream(
    streamId: string,
    data: { title?: string; description?: string },
  ): void {
    this.socket?.emit("stream:update", { streamId, ...data });
  }

  // =========================================================================
  // Viewer Actions
  // =========================================================================

  joinStream(streamId: string): void {
    this.socket?.emit("stream:join", { streamId });
  }

  leaveStream(streamId: string): void {
    this.socket?.emit("stream:leave", { streamId });
  }

  // =========================================================================
  // Interactions
  // =========================================================================

  sendComment(streamId: string, content: string): void {
    this.socket?.emit("comment:send", { streamId, content });
  }

  pinComment(streamId: string, commentId: string): void {
    this.socket?.emit("comment:pin", { streamId, commentId });
  }

  deleteComment(streamId: string, commentId: string): void {
    this.socket?.emit("comment:delete", { streamId, commentId });
  }

  sendGift(streamId: string, giftType: string, amount: number = 1): void {
    this.socket?.emit("gift:send", { streamId, giftType, amount });
  }

  sendLike(streamId: string): void {
    this.socket?.emit("like:send", { streamId });
  }

  // =========================================================================
  // Polls
  // =========================================================================

  createPoll(
    streamId: string,
    question: string,
    options: string[],
    duration: number,
  ): void {
    this.socket?.emit("poll:create", { streamId, question, options, duration });
  }

  votePoll(pollId: string, optionId: string): void {
    this.socket?.emit("poll:vote", { pollId, optionId });
  }

  endPoll(pollId: string): void {
    this.socket?.emit("poll:end", { pollId });
  }

  // =========================================================================
  // Moderation
  // =========================================================================

  muteUser(streamId: string, userId: number, duration: number): void {
    this.socket?.emit("user:mute", { streamId, userId, duration });
  }

  unmuteUser(streamId: string, userId: number): void {
    this.socket?.emit("user:unmute", { streamId, userId });
  }

  banUser(streamId: string, userId: number): void {
    this.socket?.emit("user:ban", { streamId, userId });
  }

  // =========================================================================
  // Event Listeners
  // =========================================================================

  onStreamCreated(
    callback: (data: {
      stream: LivestreamInfo;
      credentials: StreamCredentials;
    }) => void,
  ): () => void {
    this.socket?.on("stream:created", callback);
    return () => this.socket?.off("stream:created", callback);
  }

  onStreamStarted(callback: (data: { streamId: string }) => void): () => void {
    this.socket?.on("stream:started", callback);
    return () => this.socket?.off("stream:started", callback);
  }

  onStreamEnded(
    callback: (data: { streamId: string; reason: string }) => void,
  ): () => void {
    this.socket?.on("stream:ended", callback);
    return () => this.socket?.off("stream:ended", callback);
  }

  onViewerJoined(
    callback: (data: { streamId: string; viewer: LivestreamViewer }) => void,
  ): () => void {
    this.socket?.on("viewer:joined", callback);
    return () => this.socket?.off("viewer:joined", callback);
  }

  onViewerLeft(
    callback: (data: { streamId: string; userId: number }) => void,
  ): () => void {
    this.socket?.on("viewer:left", callback);
    return () => this.socket?.off("viewer:left", callback);
  }

  onViewerCount(
    callback: (data: { streamId: string; count: number }) => void,
  ): () => void {
    this.socket?.on("viewer:count", callback);
    return () => this.socket?.off("viewer:count", callback);
  }

  onNewComment(callback: (comment: LivestreamComment) => void): () => void {
    this.socket?.on("comment:new", callback);
    return () => this.socket?.off("comment:new", callback);
  }

  onGiftReceived(callback: (gift: LivestreamGift) => void): () => void {
    this.socket?.on("gift:received", callback);
    return () => this.socket?.off("gift:received", callback);
  }

  onLikeReceived(
    callback: (data: {
      streamId: string;
      userId: number;
      totalLikes: number;
    }) => void,
  ): () => void {
    this.socket?.on("like:received", callback);
    return () => this.socket?.off("like:received", callback);
  }

  onPollCreated(callback: (poll: LivestreamPoll) => void): () => void {
    this.socket?.on("poll:created", callback);
    return () => this.socket?.off("poll:created", callback);
  }

  onPollUpdated(callback: (poll: LivestreamPoll) => void): () => void {
    this.socket?.on("poll:updated", callback);
    return () => this.socket?.off("poll:updated", callback);
  }

  onError(
    callback: (data: { message: string; code?: string }) => void,
  ): () => void {
    this.socket?.on("error", callback);
    return () => this.socket?.off("error", callback);
  }
}

// Export singleton instance
export const livestreamSocketService = new LivestreamSocket();
export default livestreamSocketService;
