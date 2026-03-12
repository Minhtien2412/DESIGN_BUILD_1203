/**
 * Call Socket Service
 * Real-time voice/video calls via WebSocket (Socket.IO)
 *
 * Features:
 * - Call signaling (offer, answer, ICE candidates)
 * - Call state management
 * - Incoming call notifications
 * - Call history sync
 *
 * @created 19/01/2026
 */

import { ENV } from "@/config/env";
import { getAccessToken } from "@/services/apiClient";
import { Platform } from "react-native";
import io, { Socket } from "socket.io-client";

// ============================================================================
// Types
// ============================================================================

export type CallType = "audio" | "video";
export type CallStatus =
  | "ringing"
  | "connecting"
  | "connected"
  | "ended"
  | "missed"
  | "declined"
  | "failed";

export interface CallUser {
  id: number;
  name: string;
  avatar?: string;
}

export interface CallSession {
  id: string;
  callerId: number;
  calleeId: number;
  type: CallType;
  status: CallStatus;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  caller: CallUser;
  callee: CallUser;
}

export interface IncomingCallEvent {
  callId: string;
  caller: CallUser;
  type: CallType;
  timestamp: string;
}

export interface CallAnsweredEvent {
  callId: string;
  answeredBy: number;
  livekitToken?: string; // LiveKit room token
  roomName?: string; // LiveKit room name
}

export interface CallEndedEvent {
  callId: string;
  reason: "ended" | "declined" | "missed" | "failed" | "busy";
  duration?: number;
  endedBy?: number;
}

// WebRTC Signaling
export interface SignalOffer {
  callId: string;
  sdp: string;
}

export interface SignalAnswer {
  callId: string;
  sdp: string;
}

export interface SignalICECandidate {
  callId: string;
  candidate: string;
  sdpMid?: string;
  sdpMLineIndex?: number;
}

// ============================================================================
// Events (Client → Server)
// ============================================================================

export interface ClientToServerEvents {
  // Call initiation
  "call:initiate": (data: { calleeId: number; type: CallType }) => void;
  "call:answer": (data: { callId: string }) => void;
  "call:decline": (data: { callId: string }) => void;
  "call:end": (data: { callId: string }) => void;
  "call:cancel": (data: { callId: string }) => void;

  // WebRTC Signaling
  "signal:offer": (data: SignalOffer) => void;
  "signal:answer": (data: SignalAnswer) => void;
  "signal:ice-candidate": (data: SignalICECandidate) => void;

  // Media controls
  "call:mute": (data: { callId: string; isMuted: boolean }) => void;
  "call:video-toggle": (data: {
    callId: string;
    isVideoEnabled: boolean;
  }) => void;

  // LiveKit token request
  "livekit:token": (data: { callId: string }) => void;
}

// ============================================================================
// Events (Server → Client)
// ============================================================================

export interface ServerToClientEvents {
  // Call events
  "call:incoming": (data: IncomingCallEvent) => void;
  "call:answered": (data: CallAnsweredEvent) => void;
  "call:ended": (data: CallEndedEvent) => void;
  "call:ringing": (data: { callId: string }) => void;
  "call:busy": (data: { callId: string; calleeId: number }) => void;

  // WebRTC Signaling
  "signal:offer": (data: SignalOffer) => void;
  "signal:answer": (data: SignalAnswer) => void;
  "signal:ice-candidate": (data: SignalICECandidate) => void;

  // Media events
  "call:muted": (data: {
    callId: string;
    userId: number;
    isMuted: boolean;
  }) => void;
  "call:video-toggled": (data: {
    callId: string;
    userId: number;
    isVideoEnabled: boolean;
  }) => void;

  // LiveKit
  "livekit:token": (data: {
    callId: string;
    token: string;
    roomName: string;
    serverUrl: string;
  }) => void;

  // Errors
  error: (data: { code: string; message: string }) => void;
}

// ============================================================================
// Call Socket Service
// ============================================================================

class CallSocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
    null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;
  private eventListeners: Map<string, Set<Function>> = new Map();

  /**
   * Connect to call WebSocket server
   */
  async connect(): Promise<Socket<ServerToClientEvents, ClientToServerEvents>> {
    if (this.socket?.connected) {
      console.log("[CallSocket] Already connected");
      return this.socket;
    }

    if (this.isConnecting) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error("Connection timeout")),
          10000
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

      const wsUrl = this.getWebSocketUrl("/call");
      console.log("[CallSocket] Connecting to:", wsUrl);

      this.socket = io(wsUrl, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        forceNew: true,
      });

      this.setupEventListeners();

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error("Connection timeout")),
          10000
        );

        this.socket!.on("connect", () => {
          clearTimeout(timeout);
          console.log("[CallSocket] ✅ Connected:", this.socket?.id);
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket!.on("connect_error", (error) => {
          clearTimeout(timeout);
          console.warn("[CallSocket] Connection error:", error.message);
          reject(error);
        });
      });

      return this.socket;
    } catch (error) {
      console.error("[CallSocket] Failed to connect:", error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Disconnect from call server
   */
  disconnect(): void {
    if (this.socket) {
      console.log("[CallSocket] Disconnecting...");
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventListeners.clear();
    this.reconnectAttempts = 0;
  }

  /**
   * Check connection status
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // =========================================================================
  // Call Actions
  // =========================================================================

  /**
   * Initiate a call
   */
  initiateCall(calleeId: number, type: CallType): void {
    if (!this.socket?.connected) {
      throw new Error("Socket not connected");
    }
    console.log("[CallSocket] Initiating call:", { calleeId, type });
    this.socket.emit("call:initiate", { calleeId, type });
  }

  /**
   * Answer an incoming call
   */
  answerCall(callId: string): void {
    if (!this.socket?.connected) {
      throw new Error("Socket not connected");
    }
    console.log("[CallSocket] Answering call:", callId);
    this.socket.emit("call:answer", { callId });
  }

  /**
   * Decline an incoming call
   */
  declineCall(callId: string): void {
    if (!this.socket?.connected) return;
    console.log("[CallSocket] Declining call:", callId);
    this.socket.emit("call:decline", { callId });
  }

  /**
   * End current call
   */
  endCall(callId: string): void {
    if (!this.socket?.connected) return;
    console.log("[CallSocket] Ending call:", callId);
    this.socket.emit("call:end", { callId });
  }

  /**
   * Cancel outgoing call
   */
  cancelCall(callId: string): void {
    if (!this.socket?.connected) return;
    console.log("[CallSocket] Canceling call:", callId);
    this.socket.emit("call:cancel", { callId });
  }

  // =========================================================================
  // WebRTC Signaling
  // =========================================================================

  /**
   * Send WebRTC offer
   */
  sendOffer(callId: string, sdp: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit("signal:offer", { callId, sdp });
  }

  /**
   * Send WebRTC answer
   */
  sendAnswer(callId: string, sdp: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit("signal:answer", { callId, sdp });
  }

  /**
   * Send ICE candidate
   */
  sendICECandidate(
    callId: string,
    candidate: string,
    sdpMid?: string,
    sdpMLineIndex?: number
  ): void {
    if (!this.socket?.connected) return;
    this.socket.emit("signal:ice-candidate", {
      callId,
      candidate,
      sdpMid,
      sdpMLineIndex,
    });
  }

  // =========================================================================
  // Media Controls
  // =========================================================================

  /**
   * Toggle mute
   */
  setMuted(callId: string, isMuted: boolean): void {
    if (!this.socket?.connected) return;
    this.socket.emit("call:mute", { callId, isMuted });
  }

  /**
   * Toggle video
   */
  setVideoEnabled(callId: string, isVideoEnabled: boolean): void {
    if (!this.socket?.connected) return;
    this.socket.emit("call:video-toggle", { callId, isVideoEnabled });
  }

  // =========================================================================
  // LiveKit Integration
  // =========================================================================

  /**
   * Request LiveKit token for call
   */
  requestLiveKitToken(callId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit("livekit:token", { callId });
  }

  // =========================================================================
  // Event Listeners
  // =========================================================================

  /**
   * Listen for incoming calls
   */
  onIncomingCall(callback: (data: IncomingCallEvent) => void): () => void {
    return this.addEventListener("call:incoming", callback);
  }

  /**
   * Listen for call answered
   */
  onCallAnswered(callback: (data: CallAnsweredEvent) => void): () => void {
    return this.addEventListener("call:answered", callback);
  }

  /**
   * Listen for call ended
   */
  onCallEnded(callback: (data: CallEndedEvent) => void): () => void {
    return this.addEventListener("call:ended", callback);
  }

  /**
   * Listen for call ringing
   */
  onCallRinging(callback: (data: { callId: string }) => void): () => void {
    return this.addEventListener("call:ringing", callback);
  }

  /**
   * Listen for busy signal
   */
  onCallBusy(
    callback: (data: { callId: string; calleeId: number }) => void
  ): () => void {
    return this.addEventListener("call:busy", callback);
  }

  /**
   * Listen for WebRTC offer
   */
  onOffer(callback: (data: SignalOffer) => void): () => void {
    return this.addEventListener("signal:offer", callback);
  }

  /**
   * Listen for WebRTC answer
   */
  onAnswer(callback: (data: SignalAnswer) => void): () => void {
    return this.addEventListener("signal:answer", callback);
  }

  /**
   * Listen for ICE candidate
   */
  onICECandidate(callback: (data: SignalICECandidate) => void): () => void {
    return this.addEventListener("signal:ice-candidate", callback);
  }

  /**
   * Listen for LiveKit token
   */
  onLiveKitToken(
    callback: (data: {
      callId: string;
      token: string;
      roomName: string;
      serverUrl: string;
    }) => void
  ): () => void {
    return this.addEventListener("livekit:token", callback);
  }

  /**
   * Listen for mute changes
   */
  onMuteChanged(
    callback: (data: {
      callId: string;
      userId: number;
      isMuted: boolean;
    }) => void
  ): () => void {
    return this.addEventListener("call:muted", callback);
  }

  /**
   * Listen for video toggle
   */
  onVideoToggled(
    callback: (data: {
      callId: string;
      userId: number;
      isVideoEnabled: boolean;
    }) => void
  ): () => void {
    return this.addEventListener("call:video-toggled", callback);
  }

  // =========================================================================
  // Private Methods
  // =========================================================================

  private getWebSocketUrl(namespace: string): string {
    let baseUrl = ENV.WS_BASE_URL || ENV.WS_URL || ENV.API_BASE_URL;

    if (Platform.OS === "android") {
      baseUrl = baseUrl
        .replace("localhost", "10.0.2.2")
        .replace("127.0.0.1", "10.0.2.2");
    }

    baseUrl = baseUrl.replace(/\/$/, "");
    return `${baseUrl}${namespace}`;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("[CallSocket] ✅ Connected");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[CallSocket] ❌ Disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.warn("[CallSocket] Connection error:", error.message);
      this.reconnectAttempts++;
    });

    this.socket.on("error", (data) => {
      console.warn("[CallSocket] Error:", data.message);
    });
  }

  private addEventListener<T>(
    event: string,
    callback: (data: T) => void
  ): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);

    this.socket?.on(event as any, callback as any);

    return () => {
      this.eventListeners.get(event)?.delete(callback);
      this.socket?.off(event as any, callback as any);
    };
  }
}

// Export singleton instance
export const callSocketService = new CallSocketService();
export default callSocketService;
