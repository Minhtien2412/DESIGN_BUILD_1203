/**
 * useVoiceCall Hook
 * Voice/Video call functionality with WebSocket + LiveKit integration
 *
 * Features:
 * - Initiate audio/video calls
 * - Handle incoming calls
 * - Call state management
 * - WebRTC/LiveKit integration
 *
 * @created 19/01/2026
 */

import callSocketService, {
    CallAnsweredEvent,
    CallEndedEvent,
    CallType,
    CallUser,
    IncomingCallEvent
} from "@/services/communication/callSocket.service";
import { useCallback, useEffect, useRef, useState } from "react";

// ============================================================================
// Types
// ============================================================================

export type CallState =
  | "idle"
  | "initiating"
  | "ringing"
  | "connecting"
  | "connected"
  | "ended";

interface UseVoiceCallOptions {
  autoConnect?: boolean;
  onIncomingCall?: (call: IncomingCallEvent) => void;
  onCallEnded?: (reason: string) => void;
}

interface UseVoiceCallReturn {
  // State
  callState: CallState;
  currentCall: CurrentCall | null;
  error: string | null;

  // Connection
  connected: boolean;
  connecting: boolean;

  // Media state
  isMuted: boolean;
  isVideoEnabled: boolean;
  isSpeakerOn: boolean;

  // LiveKit
  livekitToken: string | null;
  livekitRoomName: string | null;
  livekitServerUrl: string | null;

  // Actions
  initiateCall: (userId: number, type: CallType) => Promise<void>;
  answerCall: () => void;
  declineCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleSpeaker: () => void;

  // Connection
  connect: () => Promise<void>;
  disconnect: () => void;
}

interface CurrentCall {
  id: string;
  type: CallType;
  isIncoming: boolean;
  remoteUser: CallUser;
  startedAt?: Date;
  duration: number;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useVoiceCall({
  autoConnect = true,
  onIncomingCall,
  onCallEnded,
}: UseVoiceCallOptions = {}): UseVoiceCallReturn {
  // =========================================================================
  // State
  // =========================================================================

  const [callState, setCallState] = useState<CallState>("idle");
  const [currentCall, setCurrentCall] = useState<CurrentCall | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Connection
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Media state
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  // LiveKit
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [livekitRoomName, setLivekitRoomName] = useState<string | null>(null);
  const [livekitServerUrl, setLivekitServerUrl] = useState<string | null>(null);

  // Refs
  const cleanupRef = useRef<(() => void)[]>([]);
  const callDurationInterval = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const pendingCallIdRef = useRef<string | null>(null);

  // =========================================================================
  // Connection Management
  // =========================================================================

  const connect = useCallback(async () => {
    if (connected || connecting) return;

    try {
      setConnecting(true);
      setError(null);

      await callSocketService.connect();
      setConnected(true);

      console.log("[useVoiceCall] Connected successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Connection failed";
      console.error("[useVoiceCall] Connection failed:", errorMessage);
      setError(errorMessage);
    } finally {
      setConnecting(false);
    }
  }, [connected, connecting]);

  const disconnect = useCallback(() => {
    // End any active call
    if (currentCall && callState !== "ended") {
      callSocketService.endCall(currentCall.id);
    }

    callSocketService.disconnect();
    setConnected(false);
    resetCallState();

    // Cleanup listeners
    cleanupRef.current.forEach((cleanup) => cleanup());
    cleanupRef.current = [];
  }, [currentCall, callState]);

  // =========================================================================
  // Call State Management
  // =========================================================================

  const resetCallState = useCallback(() => {
    setCallState("idle");
    setCurrentCall(null);
    setError(null);
    setIsMuted(false);
    setIsVideoEnabled(true);
    setLivekitToken(null);
    setLivekitRoomName(null);
    setLivekitServerUrl(null);
    pendingCallIdRef.current = null;

    // Stop duration timer
    if (callDurationInterval.current) {
      clearInterval(callDurationInterval.current);
      callDurationInterval.current = null;
    }
  }, []);

  const startDurationTimer = useCallback(() => {
    if (callDurationInterval.current) {
      clearInterval(callDurationInterval.current);
    }

    callDurationInterval.current = setInterval(() => {
      setCurrentCall((prev) =>
        prev ? { ...prev, duration: prev.duration + 1 } : null
      );
    }, 1000);
  }, []);

  // =========================================================================
  // Call Actions
  // =========================================================================

  const initiateCall = useCallback(
    async (userId: number, type: CallType) => {
      if (!connected) {
        throw new Error("Not connected to call server");
      }

      if (callState !== "idle") {
        throw new Error("Already in a call");
      }

      try {
        setCallState("initiating");
        setError(null);

        // Set initial video state based on call type
        setIsVideoEnabled(type === "video");

        callSocketService.initiateCall(userId, type);

        console.log("[useVoiceCall] Call initiated to user:", userId);
      } catch (err) {
        setCallState("idle");
        const errorMessage =
          err instanceof Error ? err.message : "Failed to initiate call";
        setError(errorMessage);
        throw err;
      }
    },
    [connected, callState]
  );

  const answerCall = useCallback(() => {
    if (!currentCall || callState !== "ringing") {
      console.warn("[useVoiceCall] No incoming call to answer");
      return;
    }

    setCallState("connecting");
    callSocketService.answerCall(currentCall.id);

    console.log("[useVoiceCall] Answering call:", currentCall.id);
  }, [currentCall, callState]);

  const declineCall = useCallback(() => {
    if (!currentCall) return;

    callSocketService.declineCall(currentCall.id);
    resetCallState();

    console.log("[useVoiceCall] Declined call:", currentCall.id);
  }, [currentCall, resetCallState]);

  const endCall = useCallback(() => {
    if (!currentCall) return;

    callSocketService.endCall(currentCall.id);

    console.log("[useVoiceCall] Ending call:", currentCall.id);

    setCallState("ended");
    onCallEnded?.("ended");

    // Reset after delay
    setTimeout(resetCallState, 2000);
  }, [currentCall, resetCallState, onCallEnded]);

  // =========================================================================
  // Media Controls
  // =========================================================================

  const toggleMute = useCallback(() => {
    if (!currentCall) return;

    const newMuted = !isMuted;
    setIsMuted(newMuted);
    callSocketService.setMuted(currentCall.id, newMuted);
  }, [currentCall, isMuted]);

  const toggleVideo = useCallback(() => {
    if (!currentCall) return;

    const newVideoEnabled = !isVideoEnabled;
    setIsVideoEnabled(newVideoEnabled);
    callSocketService.setVideoEnabled(currentCall.id, newVideoEnabled);
  }, [currentCall, isVideoEnabled]);

  const toggleSpeaker = useCallback(() => {
    // This would typically interact with native audio APIs
    setIsSpeakerOn((prev) => !prev);
  }, []);

  // =========================================================================
  // WebSocket Event Handlers
  // =========================================================================

  useEffect(() => {
    if (!connected) return;

    // Handle incoming calls
    const removeIncoming = callSocketService.onIncomingCall(
      (data: IncomingCallEvent) => {
        console.log("[useVoiceCall] Incoming call:", data);

        setCallState("ringing");
        setCurrentCall({
          id: data.callId,
          type: data.type,
          isIncoming: true,
          remoteUser: data.caller,
          duration: 0,
        });

        onIncomingCall?.(data);
      }
    );
    cleanupRef.current.push(removeIncoming);

    // Handle call ringing (outgoing)
    const removeRinging = callSocketService.onCallRinging(({ callId }) => {
      console.log("[useVoiceCall] Call ringing:", callId);
      setCallState("ringing");
      pendingCallIdRef.current = callId;
    });
    cleanupRef.current.push(removeRinging);

    // Handle call answered
    const removeAnswered = callSocketService.onCallAnswered(
      (data: CallAnsweredEvent) => {
        console.log("[useVoiceCall] Call answered:", data);

        setCallState("connected");
        setCurrentCall((prev) =>
          prev ? { ...prev, startedAt: new Date() } : null
        );

        // Save LiveKit credentials if provided
        if (data.livekitToken) {
          setLivekitToken(data.livekitToken);
          setLivekitRoomName(data.roomName || null);
        }

        // Request LiveKit token if not provided
        if (!data.livekitToken && data.callId) {
          callSocketService.requestLiveKitToken(data.callId);
        }

        startDurationTimer();
      }
    );
    cleanupRef.current.push(removeAnswered);

    // Handle call ended
    const removeEnded = callSocketService.onCallEnded(
      (data: CallEndedEvent) => {
        console.log("[useVoiceCall] Call ended:", data);

        setCallState("ended");
        onCallEnded?.(data.reason);

        // Reset after delay
        setTimeout(resetCallState, 2000);
      }
    );
    cleanupRef.current.push(removeEnded);

    // Handle busy signal
    const removeBusy = callSocketService.onCallBusy(({ callId }) => {
      console.log("[useVoiceCall] User busy");

      setCallState("ended");
      setError("User is busy");
      onCallEnded?.("busy");

      setTimeout(resetCallState, 2000);
    });
    cleanupRef.current.push(removeBusy);

    // Handle LiveKit token
    const removeLivekit = callSocketService.onLiveKitToken((data) => {
      console.log("[useVoiceCall] Received LiveKit token");

      setLivekitToken(data.token);
      setLivekitRoomName(data.roomName);
      setLivekitServerUrl(data.serverUrl);
    });
    cleanupRef.current.push(removeLivekit);

    // Handle mute changes from remote
    const removeMute = callSocketService.onMuteChanged((data) => {
      console.log("[useVoiceCall] Remote mute changed:", data);
      // Can update UI to show remote user muted
    });
    cleanupRef.current.push(removeMute);

    // Handle video toggle from remote
    const removeVideo = callSocketService.onVideoToggled((data) => {
      console.log("[useVoiceCall] Remote video toggled:", data);
      // Can update UI to show remote video state
    });
    cleanupRef.current.push(removeVideo);

    return () => {
      cleanupRef.current.forEach((cleanup) => cleanup());
      cleanupRef.current = [];
    };
  }, [
    connected,
    onIncomingCall,
    onCallEnded,
    resetCallState,
    startDurationTimer,
  ]);

  // =========================================================================
  // Auto-connect
  // =========================================================================

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();

      if (callDurationInterval.current) {
        clearInterval(callDurationInterval.current);
      }
    };
  }, []);

  // =========================================================================
  // Return
  // =========================================================================

  return {
    // State
    callState,
    currentCall,
    error,

    // Connection
    connected,
    connecting,

    // Media state
    isMuted,
    isVideoEnabled,
    isSpeakerOn,

    // LiveKit
    livekitToken,
    livekitRoomName,
    livekitServerUrl,

    // Actions
    initiateCall,
    answerCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,

    // Connection
    connect,
    disconnect,
  };
}

export default useVoiceCall;
