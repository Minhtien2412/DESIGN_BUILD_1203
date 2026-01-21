/**
 * Meeting Socket Service
 * WebSocket service for video conference/meeting room management
 * Integrates with LiveKit for video/audio streaming
 *
 * @created 19/01/2026
 */

import ENV from "@/config/env";
import { getItem } from "@/utils/storage";
import { io, Socket } from "socket.io-client";

// ============================================================================
// Types
// ============================================================================

export interface MeetingRoom {
  id: string;
  name: string;
  hostId: number;
  hostName: string;
  participants: MeetingParticipant[];
  isRecording: boolean;
  startedAt: string;
  maxParticipants: number;
  settings: MeetingSettings;
}

export interface MeetingParticipant {
  id: number;
  name: string;
  avatar?: string;
  role: "host" | "co-host" | "participant";
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  joinedAt: string;
  connectionQuality?: "excellent" | "good" | "fair" | "poor";
}

export interface MeetingSettings {
  allowChat: boolean;
  allowScreenShare: boolean;
  allowRecording: boolean;
  muteOnJoin: boolean;
  videoOnJoin: boolean;
  waitingRoom: boolean;
  requirePassword: boolean;
  password?: string;
}

export interface LiveKitCredentials {
  serverUrl: string;
  token: string;
  roomName: string;
}

// Server -> Client Events
interface ServerToClientEvents {
  // Connection
  connected: (data: { socketId: string }) => void;
  error: (data: { message: string; code?: string }) => void;

  // Meeting events
  "meeting:created": (data: { room: MeetingRoom }) => void;
  "meeting:joined": (data: {
    room: MeetingRoom;
    livekit: LiveKitCredentials;
  }) => void;
  "meeting:left": (data: { roomId: string; userId: number }) => void;
  "meeting:ended": (data: { roomId: string; reason: string }) => void;

  // Participant events
  "participant:joined": (data: {
    roomId: string;
    participant: MeetingParticipant;
  }) => void;
  "participant:left": (data: { roomId: string; userId: number }) => void;
  "participant:updated": (data: {
    roomId: string;
    participant: Partial<MeetingParticipant>;
  }) => void;

  // Media events
  "media:muted": (data: {
    roomId: string;
    userId: number;
    type: "audio" | "video";
  }) => void;
  "media:unmuted": (data: {
    roomId: string;
    userId: number;
    type: "audio" | "video";
  }) => void;
  "screenshare:started": (data: { roomId: string; userId: number }) => void;
  "screenshare:stopped": (data: { roomId: string; userId: number }) => void;

  // Recording events
  "recording:started": (data: { roomId: string; recordingId: string }) => void;
  "recording:stopped": (data: {
    roomId: string;
    recordingUrl?: string;
  }) => void;

  // Chat events
  "chat:message": (data: MeetingChatMessage) => void;

  // Hand raise events
  "hand:raised": (data: { roomId: string; userId: number }) => void;
  "hand:lowered": (data: { roomId: string; userId: number }) => void;

  // Reaction events
  reaction: (data: {
    roomId: string;
    userId: number;
    reaction: string;
  }) => void;
}

// Client -> Server Events
interface ClientToServerEvents {
  // Meeting management
  "meeting:create": (data: {
    name: string;
    settings?: Partial<MeetingSettings>;
  }) => void;
  "meeting:join": (data: { roomId: string; password?: string }) => void;
  "meeting:leave": (data: { roomId: string }) => void;
  "meeting:end": (data: { roomId: string }) => void;

  // Media controls
  "media:mute": (data: { roomId: string; type: "audio" | "video" }) => void;
  "media:unmute": (data: { roomId: string; type: "audio" | "video" }) => void;
  "screenshare:start": (data: { roomId: string }) => void;
  "screenshare:stop": (data: { roomId: string }) => void;

  // Recording
  "recording:start": (data: { roomId: string }) => void;
  "recording:stop": (data: { roomId: string }) => void;

  // Chat
  "chat:send": (data: { roomId: string; content: string }) => void;

  // Interactions
  "hand:raise": (data: { roomId: string }) => void;
  "hand:lower": (data: { roomId: string }) => void;
  "reaction:send": (data: { roomId: string; reaction: string }) => void;

  // Host actions
  "participant:kick": (data: { roomId: string; userId: number }) => void;
  "participant:mute": (data: { roomId: string; userId: number }) => void;
  "participant:promote": (data: {
    roomId: string;
    userId: number;
    role: "co-host" | "participant";
  }) => void;
}

export interface MeetingChatMessage {
  id: string;
  roomId: string;
  userId: number;
  userName: string;
  content: string;
  timestamp: string;
}

// ============================================================================
// MeetingSocket Class
// ============================================================================

export class MeetingSocket {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
    null;
  private wsUrl: string;

  constructor() {
    this.wsUrl = `${ENV.WS_BASE_URL}/meeting`;
  }

  // Connect to meeting namespace
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log("[MeetingSocket] Already connected");
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
          console.log("[MeetingSocket] Connected");
          resolve();
        });

        this.socket!.on("connect_error", (err) => {
          clearTimeout(timeout);
          console.error("[MeetingSocket] Connection error:", err.message);
          reject(err);
        });
      });
    } catch (error) {
      console.error("[MeetingSocket] Connect failed:", error);
      throw error;
    }
  }

  // Disconnect
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log("[MeetingSocket] Disconnected");
    }
  }

  // Check connection
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // =========================================================================
  // Meeting Management
  // =========================================================================

  createMeeting(name: string, settings?: Partial<MeetingSettings>): void {
    this.socket?.emit("meeting:create", { name, settings });
  }

  joinMeeting(roomId: string, password?: string): void {
    this.socket?.emit("meeting:join", { roomId, password });
  }

  leaveMeeting(roomId: string): void {
    this.socket?.emit("meeting:leave", { roomId });
  }

  endMeeting(roomId: string): void {
    this.socket?.emit("meeting:end", { roomId });
  }

  // =========================================================================
  // Media Controls
  // =========================================================================

  muteAudio(roomId: string): void {
    this.socket?.emit("media:mute", { roomId, type: "audio" });
  }

  unmuteAudio(roomId: string): void {
    this.socket?.emit("media:unmute", { roomId, type: "audio" });
  }

  muteVideo(roomId: string): void {
    this.socket?.emit("media:mute", { roomId, type: "video" });
  }

  unmuteVideo(roomId: string): void {
    this.socket?.emit("media:unmute", { roomId, type: "video" });
  }

  startScreenShare(roomId: string): void {
    this.socket?.emit("screenshare:start", { roomId });
  }

  stopScreenShare(roomId: string): void {
    this.socket?.emit("screenshare:stop", { roomId });
  }

  // =========================================================================
  // Recording
  // =========================================================================

  startRecording(roomId: string): void {
    this.socket?.emit("recording:start", { roomId });
  }

  stopRecording(roomId: string): void {
    this.socket?.emit("recording:stop", { roomId });
  }

  // =========================================================================
  // Chat & Interactions
  // =========================================================================

  sendChatMessage(roomId: string, content: string): void {
    this.socket?.emit("chat:send", { roomId, content });
  }

  raiseHand(roomId: string): void {
    this.socket?.emit("hand:raise", { roomId });
  }

  lowerHand(roomId: string): void {
    this.socket?.emit("hand:lower", { roomId });
  }

  sendReaction(roomId: string, reaction: string): void {
    this.socket?.emit("reaction:send", { roomId, reaction });
  }

  // =========================================================================
  // Host Actions
  // =========================================================================

  kickParticipant(roomId: string, userId: number): void {
    this.socket?.emit("participant:kick", { roomId, userId });
  }

  muteParticipant(roomId: string, userId: number): void {
    this.socket?.emit("participant:mute", { roomId, userId });
  }

  promoteParticipant(
    roomId: string,
    userId: number,
    role: "co-host" | "participant"
  ): void {
    this.socket?.emit("participant:promote", { roomId, userId, role });
  }

  // =========================================================================
  // Event Listeners
  // =========================================================================

  onMeetingCreated(
    callback: (data: { room: MeetingRoom }) => void
  ): () => void {
    this.socket?.on("meeting:created", callback);
    return () => this.socket?.off("meeting:created", callback);
  }

  onMeetingJoined(
    callback: (data: { room: MeetingRoom; livekit: LiveKitCredentials }) => void
  ): () => void {
    this.socket?.on("meeting:joined", callback);
    return () => this.socket?.off("meeting:joined", callback);
  }

  onMeetingEnded(
    callback: (data: { roomId: string; reason: string }) => void
  ): () => void {
    this.socket?.on("meeting:ended", callback);
    return () => this.socket?.off("meeting:ended", callback);
  }

  onParticipantJoined(
    callback: (data: {
      roomId: string;
      participant: MeetingParticipant;
    }) => void
  ): () => void {
    this.socket?.on("participant:joined", callback);
    return () => this.socket?.off("participant:joined", callback);
  }

  onParticipantLeft(
    callback: (data: { roomId: string; userId: number }) => void
  ): () => void {
    this.socket?.on("participant:left", callback);
    return () => this.socket?.off("participant:left", callback);
  }

  onParticipantUpdated(
    callback: (data: {
      roomId: string;
      participant: Partial<MeetingParticipant>;
    }) => void
  ): () => void {
    this.socket?.on("participant:updated", callback);
    return () => this.socket?.off("participant:updated", callback);
  }

  onChatMessage(callback: (message: MeetingChatMessage) => void): () => void {
    this.socket?.on("chat:message", callback);
    return () => this.socket?.off("chat:message", callback);
  }

  onHandRaised(
    callback: (data: { roomId: string; userId: number }) => void
  ): () => void {
    this.socket?.on("hand:raised", callback);
    return () => this.socket?.off("hand:raised", callback);
  }

  onReaction(
    callback: (data: {
      roomId: string;
      userId: number;
      reaction: string;
    }) => void
  ): () => void {
    this.socket?.on("reaction", callback);
    return () => this.socket?.off("reaction", callback);
  }

  onRecordingStarted(
    callback: (data: { roomId: string; recordingId: string }) => void
  ): () => void {
    this.socket?.on("recording:started", callback);
    return () => this.socket?.off("recording:started", callback);
  }

  onRecordingStopped(
    callback: (data: { roomId: string; recordingUrl?: string }) => void
  ): () => void {
    this.socket?.on("recording:stopped", callback);
    return () => this.socket?.off("recording:stopped", callback);
  }

  onError(
    callback: (data: { message: string; code?: string }) => void
  ): () => void {
    this.socket?.on("error", callback);
    return () => this.socket?.off("error", callback);
  }
}

// Export singleton instance
export const meetingSocketService = new MeetingSocket();
export default meetingSocketService;
