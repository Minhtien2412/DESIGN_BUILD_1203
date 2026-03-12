/**
 * useRealTimeCommunication Hook - Modern Real-time Communication
 *
 * Integrates new communication modules (WebRTC, Socket, Media)
 * with React state management for calls, chat, and streaming
 *
 * @module hooks/useRealTimeCommunication
 */

import { useCallback, useEffect, useRef, useState } from "react";
// Import directly from specific files to avoid module resolution issues
import { AudioManager, getAudioManager } from "../lib/communication/media";
import {
    getSocketManager,
    SocketManager,
    SocketStatus,
} from "../lib/communication/socket";
import type {
    Call,
    CallStatus,
    CallType,
    CommunicationUser,
    Conversation,
    Message,
} from "../lib/communication/types";
import { getWebRTCManager, WebRTCManager } from "../lib/communication/webrtc";

// ==================== TYPES ====================

interface UseRealTimeCommunicationOptions {
  autoConnectSocket?: boolean;
  userId?: string;
  token?: string;
  onIncomingCall?: (call: Call) => void;
  onCallEnded?: (call: Call) => void;
  onNewMessage?: (message: Message) => void;
}

interface CallState {
  activeCall: Call | null;
  incomingCall: (Call & { remoteOffer?: RTCSessionDescriptionInit }) | null;
  callStatus: CallStatus;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  remoteParticipantId: string | null;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isSpeakerOn: boolean;
  callDuration: number;
}

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isTyping: boolean;
  typingUsers: string[];
  unreadCount: number;
}

interface ConnectionState {
  socketStatus: SocketStatus;
  isWebRTCReady: boolean;
  isConnected: boolean;
}

// ==================== INITIAL STATES ====================

const INITIAL_CALL_STATE: CallState = {
  activeCall: null,
  incomingCall: null,
  callStatus: "idle",
  localStream: null,
  remoteStream: null,
  remoteParticipantId: null,
  isMuted: false,
  isVideoEnabled: true,
  isSpeakerOn: true,
  callDuration: 0,
};

const INITIAL_CHAT_STATE: ChatState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  isTyping: false,
  typingUsers: [],
  unreadCount: 0,
};

const INITIAL_CONNECTION_STATE: ConnectionState = {
  socketStatus: "disconnected",
  isWebRTCReady: false,
  isConnected: false,
};

// ==================== MAIN HOOK ====================

export function useRealTimeCommunication(
  options: UseRealTimeCommunicationOptions = {},
) {
  const {
    autoConnectSocket = false,
    userId,
    token,
    onIncomingCall,
    onCallEnded,
    onNewMessage,
  } = options;

  // Manager refs
  const webrtcRef = useRef<WebRTCManager | null>(null);
  const socketRef = useRef<SocketManager | null>(null);
  const audioRef = useRef<AudioManager | null>(null);
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // State
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    INITIAL_CONNECTION_STATE,
  );
  const [callState, setCallState] = useState<CallState>(INITIAL_CALL_STATE);
  const [chatState, setChatState] = useState<ChatState>(INITIAL_CHAT_STATE);

  // ==================== INITIALIZATION ====================

  useEffect(() => {
    // Initialize managers
    webrtcRef.current = getWebRTCManager();
    socketRef.current = getSocketManager({ autoConnect: false });
    audioRef.current = getAudioManager();

    const socket = socketRef.current;
    const webrtc = webrtcRef.current;

    // Socket status listener
    const unsubscribeStatus = socket.on<SocketStatus>(
      "status",
      (status: SocketStatus) => {
        setConnectionState((prev) => ({
          ...prev,
          socketStatus: status,
          isConnected: status === "connected",
        }));
      },
    );

    // WebRTC event listeners
    const handleRemoteStream = (data: unknown) => {
      const { stream } = data as { participantId: string; stream: MediaStream };
      setCallState((prev) => ({ ...prev, remoteStream: stream }));
    };
    webrtc.on("remoteStream", handleRemoteStream);

    const handleConnectionState = (data: unknown) => {
      const { state } = data as {
        participantId: string;
        state: RTCPeerConnectionState;
      };
      if (state === "connected") {
        setCallState((prev) => ({ ...prev, callStatus: "connected" }));
      } else if (state === "disconnected" || state === "failed") {
        handleCallEnded();
      }
    };
    webrtc.on("connectionStateChange", handleConnectionState);

    // Socket call listeners
    const unsubscribeIncomingCall = socket.on<
      Call & { sdp?: RTCSessionDescriptionInit; callerId?: string }
    >(
      "call:incoming",
      (call: Call & { sdp?: RTCSessionDescriptionInit; callerId?: string }) => {
        // Store the remote offer and caller info for later use
        const callWithOffer = {
          ...call,
          remoteOffer: call.sdp,
        };
        const callerId =
          call.callerId || call.initiator?.id || call.participants?.[0]?.id;
        setCallState((prev) => ({
          ...prev,
          incomingCall: callWithOffer,
          remoteParticipantId: callerId || null,
        }));
        onIncomingCall?.(call);
      },
    );

    const unsubscribeCallAccepted = socket.on<{
      callId: string;
      sdp: RTCSessionDescriptionInit;
      userId?: string;
    }>(
      "call:accepted",
      async ({
        sdp,
        userId: remoteUserId,
      }: {
        callId: string;
        sdp: RTCSessionDescriptionInit;
        userId?: string;
      }) => {
        // Use the remoteParticipantId from state or from the event
        const participantId = remoteUserId || callState.remoteParticipantId;
        if (participantId) {
          await webrtc.setRemoteAnswer(participantId, sdp);
        }
        setCallState((prev) => ({
          ...prev,
          callStatus: "connected",
          activeCall: prev.activeCall
            ? { ...prev.activeCall, status: "connected" }
            : null,
        }));
        startCallTimer();
      },
    );

    const unsubscribeCallRejected = socket.on<{
      callId: string;
      reason?: string;
    }>("call:rejected", (_data: { callId: string; reason?: string }) => {
      handleCallEnded();
    });

    const unsubscribeCallEnded = socket.on<{ callId: string }>(
      "call:ended",
      () => {
        handleCallEnded();
      },
    );

    const unsubscribeIceCandidate = socket.on<{
      candidate: RTCIceCandidateInit;
      userId?: string;
    }>(
      "call:ice-candidate",
      async ({
        candidate,
        userId: remoteUserId,
      }: {
        candidate: RTCIceCandidateInit;
        userId?: string;
      }) => {
        // Use the remoteParticipantId from state or from the event
        const participantId = remoteUserId || callState.remoteParticipantId;
        if (participantId) {
          await webrtc.addIceCandidate(participantId, candidate);
        }
      },
    );

    // Chat listeners
    const unsubscribeNewMessage = socket.on<Message>(
      "message:new",
      (message: Message) => {
        setChatState((prev) => ({
          ...prev,
          messages: [...prev.messages, message],
        }));
        onNewMessage?.(message);
      },
    );

    const unsubscribeTyping = socket.on<{
      conversationId: string;
      userId: string;
      isTyping: boolean;
    }>(
      "typing:update",
      ({
        userId,
        isTyping,
      }: {
        conversationId: string;
        userId: string;
        isTyping: boolean;
      }) => {
        setChatState((prev) => ({
          ...prev,
          typingUsers: isTyping
            ? [...prev.typingUsers.filter((id) => id !== userId), userId]
            : prev.typingUsers.filter((id) => id !== userId),
        }));
      },
    );

    // Auto-connect if configured
    if (autoConnectSocket && userId && token) {
      socket.connect({ userId, token });
    }

    return () => {
      unsubscribeStatus();
      webrtc.off("remoteStream", handleRemoteStream);
      webrtc.off("connectionStateChange", handleConnectionState);
      unsubscribeIncomingCall();
      unsubscribeCallAccepted();
      unsubscribeCallRejected();
      unsubscribeCallEnded();
      unsubscribeIceCandidate();
      unsubscribeNewMessage();
      unsubscribeTyping();
      stopCallTimer();
    };
  }, [
    autoConnectSocket,
    userId,
    token,
    onIncomingCall,
    onCallEnded,
    onNewMessage,
  ]);

  // ==================== CALL TIMER ====================

  const startCallTimer = useCallback(() => {
    stopCallTimer();
    callTimerRef.current = setInterval(() => {
      setCallState((prev) => ({
        ...prev,
        callDuration: prev.callDuration + 1,
      }));
    }, 1000);
  }, []);

  const stopCallTimer = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  }, []);

  const handleCallEnded = useCallback(() => {
    const { activeCall } = callState;

    webrtcRef.current?.closeAllConnections();
    stopCallTimer();

    if (activeCall) {
      onCallEnded?.(activeCall);
    }

    setCallState(INITIAL_CALL_STATE);
  }, [callState.activeCall, onCallEnded, stopCallTimer]);

  // ==================== SOCKET METHODS ====================

  const connectSocket = useCallback(
    (auth?: { userId: string; token: string }) => {
      socketRef.current?.connect(auth);
    },
    [],
  );

  const disconnectSocket = useCallback(() => {
    socketRef.current?.disconnect();
  }, []);

  // ==================== CALL METHODS ====================

  const initiateCall = useCallback(
    async (targetUser: CommunicationUser, type: CallType): Promise<boolean> => {
      try {
        const webrtc = webrtcRef.current;
        const socket = socketRef.current;

        if (!webrtc || !socket?.isConnected()) {
          console.error("[Call] Not connected");
          return false;
        }

        // Start local stream
        const stream = await webrtc.initializeMedia(type);
        if (!stream) {
          console.error("[Call] Failed to get local stream");
          return false;
        }

        // Create peer connection and offer for target user
        webrtc.createPeerConnection(targetUser.id);
        const offer = await webrtc.createOffer(targetUser.id);

        // Create call object
        const call: Call = {
          id: `call_${Date.now()}`,
          type,
          status: "calling",
          startTime: new Date().toISOString(),
          participants: [
            { id: userId || "", name: "Me", role: "caller" },
            { ...targetUser, role: "callee" },
          ],
          initiator: { id: userId || "", name: "Me" },
          isGroup: false,
        };

        // Update state
        setCallState((prev) => ({
          ...prev,
          activeCall: call,
          callStatus: "calling",
          localStream: stream,
          remoteParticipantId: targetUser.id,
          isVideoEnabled: type === "video",
          callDuration: 0,
        }));

        // Send call signal with SDP offer
        socket.sendCallSignal("call", {
          callId: call.id,
          callerId: userId,
          calleeId: targetUser.id,
          type,
          sdp: offer,
        });

        return true;
      } catch (error) {
        console.error("[Call] Failed to initiate:", error);
        return false;
      }
    },
    [userId],
  );

  const acceptIncomingCall = useCallback(async (): Promise<boolean> => {
    try {
      const webrtc = webrtcRef.current;
      const socket = socketRef.current;
      const { incomingCall } = callState;

      if (!webrtc || !socket?.isConnected() || !incomingCall) {
        return false;
      }

      // Get the caller's ID from incoming call
      const callerId =
        incomingCall.initiator?.id ||
        incomingCall.participants?.[0]?.id ||
        "unknown";

      // Start local stream
      const stream = await webrtc.initializeMedia(incomingCall.type);
      if (!stream) {
        return false;
      }

      // Create peer connection for the caller
      webrtc.createPeerConnection(callerId);

      // Create answer with the remote offer (stored from incoming call signal)
      const remoteOffer = (
        incomingCall as Call & { remoteOffer?: RTCSessionDescriptionInit }
      ).remoteOffer;
      if (!remoteOffer) {
        console.error("[Call] No remote offer available");
        webrtc.closeAllConnections();
        return false;
      }

      const answer = await webrtc.createAnswer(callerId, remoteOffer);

      // Update state
      setCallState((prev) => ({
        ...prev,
        activeCall: { ...incomingCall, status: "connected" },
        incomingCall: null,
        callStatus: "connected",
        localStream: stream,
        isVideoEnabled: incomingCall.type === "video",
        callDuration: 0,
      }));

      // Send accept signal with SDP answer
      socket.sendCallSignal("accept", {
        callId: incomingCall.id,
        userId,
        sdp: answer,
      });

      startCallTimer();
      return true;
    } catch (error) {
      console.error("[Call] Failed to accept:", error);
      return false;
    }
  }, [callState.incomingCall, userId, startCallTimer]);

  const rejectIncomingCall = useCallback(
    (reason?: string) => {
      const socket = socketRef.current;
      const { incomingCall } = callState;

      if (socket?.isConnected() && incomingCall) {
        socket.rejectCall(incomingCall.id, reason);
      }

      setCallState((prev) => ({
        ...prev,
        incomingCall: null,
      }));
    },
    [callState.incomingCall],
  );

  const endCall = useCallback(() => {
    const webrtc = webrtcRef.current;
    const socket = socketRef.current;
    const { activeCall } = callState;

    // Stop WebRTC
    webrtc?.closeAllConnections();
    stopCallTimer();

    // Send end signal
    if (socket?.isConnected() && activeCall) {
      socket.endCall(activeCall.id);
    }

    if (activeCall) {
      onCallEnded?.(activeCall);
    }

    // Reset state
    setCallState(INITIAL_CALL_STATE);
  }, [callState.activeCall, onCallEnded, stopCallTimer]);

  const toggleMute = useCallback(() => {
    const webrtc = webrtcRef.current;
    if (webrtc) {
      const newMutedState = webrtc.toggleAudio();
      setCallState((prev) => ({ ...prev, isMuted: !newMutedState }));
    }
  }, []);

  const toggleVideo = useCallback(() => {
    const webrtc = webrtcRef.current;
    if (webrtc) {
      const newVideoState = webrtc.toggleVideo();
      setCallState((prev) => ({ ...prev, isVideoEnabled: newVideoState }));
    }
  }, []);

  const switchCamera = useCallback(async () => {
    await webrtcRef.current?.switchCamera();
  }, []);

  const toggleSpeaker = useCallback(() => {
    setCallState((prev) => ({ ...prev, isSpeakerOn: !prev.isSpeakerOn }));
    // Note: Actual speaker toggle requires native module (expo-audio or similar)
  }, []);

  // ==================== CHAT METHODS ====================

  const sendMessage = useCallback(
    (conversationId: string, content: string, type: string = "text") => {
      socketRef.current?.sendMessage(conversationId, content, type);
    },
    [],
  );

  const markAsRead = useCallback(
    (conversationId: string, messageId: string) => {
      socketRef.current?.markAsRead(conversationId, messageId);
    },
    [],
  );

  const startTyping = useCallback((conversationId: string) => {
    socketRef.current?.startTyping(conversationId);
    setChatState((prev) => ({ ...prev, isTyping: true }));
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    socketRef.current?.stopTyping(conversationId);
    setChatState((prev) => ({ ...prev, isTyping: false }));
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    socketRef.current?.joinRoom(roomId);
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    socketRef.current?.leaveRoom(roomId);
  }, []);

  const setActiveConversation = useCallback(
    (conversation: Conversation | null) => {
      setChatState((prev) => ({ ...prev, activeConversation: conversation }));
    },
    [],
  );

  // ==================== AUDIO RECORDING ====================

  const startRecording = useCallback(
    async (options?: {
      onProgress?: (duration: number) => void;
      maxDuration?: number;
    }) => {
      return audioRef.current?.startRecording(options);
    },
    [],
  );

  const stopRecording = useCallback(async () => {
    return audioRef.current?.stopRecording();
  }, []);

  const playAudio = useCallback(async (uri: string, onFinish?: () => void) => {
    return audioRef.current?.playAudio(uri, onFinish);
  }, []);

  const stopAudio = useCallback(async () => {
    return audioRef.current?.stopPlayback();
  }, []);

  // ==================== HELPERS ====================

  const formatCallDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // ==================== RETURN ====================

  return {
    // Connection
    ...connectionState,
    connectSocket,
    disconnectSocket,

    // Call
    ...callState,
    initiateCall,
    acceptIncomingCall,
    rejectIncomingCall,
    endCall,
    toggleMute,
    toggleVideo,
    switchCamera,
    toggleSpeaker,
    formatCallDuration: () => formatCallDuration(callState.callDuration),

    // Chat
    ...chatState,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    joinRoom,
    leaveRoom,
    setActiveConversation,

    // Audio
    startRecording,
    stopRecording,
    playAudio,
    stopAudio,

    // Managers (for advanced use)
    getWebRTC: () => webrtcRef.current,
    getSocket: () => socketRef.current,
    getAudio: () => audioRef.current,
  };
}

// ==================== ADDITIONAL HOOKS ====================

/**
 * Hook for call state only
 */
export function useCallState() {
  const [callState, setCallState] = useState<CallState>(INITIAL_CALL_STATE);
  return { callState, setCallState };
}

/**
 * Hook for chat state only
 */
export function useChatState() {
  const [chatState, setChatState] = useState<ChatState>(INITIAL_CHAT_STATE);
  return { chatState, setChatState };
}

export default useRealTimeCommunication;
