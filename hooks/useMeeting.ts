/**
 * useMeeting Hook
 * Video conference/meeting room functionality
 * Integrates with MeetingSocket and LiveKit
 *
 * @created 19/01/2026
 */

import meetingSocketService, {
    LiveKitCredentials,
    MeetingChatMessage,
    MeetingParticipant,
    MeetingRoom,
    MeetingSettings,
} from "@/services/communication/meetingSocket.service";
import { useCallback, useEffect, useRef, useState } from "react";

// ============================================================================
// Types
// ============================================================================

type MeetingState =
  | "idle"
  | "creating"
  | "joining"
  | "connected"
  | "leaving"
  | "ended";

interface UseMeetingOptions {
  autoConnect?: boolean;
  onParticipantJoined?: (participant: MeetingParticipant) => void;
  onParticipantLeft?: (userId: number) => void;
  onMeetingEnded?: (reason: string) => void;
  onChatMessage?: (message: MeetingChatMessage) => void;
  onError?: (error: string) => void;
}

interface UseMeetingReturn {
  // State
  meetingState: MeetingState;
  currentRoom: MeetingRoom | null;
  participants: MeetingParticipant[];
  chatMessages: MeetingChatMessage[];
  raisedHands: number[];
  error: string | null;

  // Connection
  connected: boolean;
  connecting: boolean;

  // LiveKit
  livekitCredentials: LiveKitCredentials | null;

  // Media state
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;

  // Actions
  createMeeting: (
    name: string,
    settings?: Partial<MeetingSettings>
  ) => Promise<void>;
  joinMeeting: (roomId: string, password?: string) => Promise<void>;
  leaveMeeting: () => void;
  endMeeting: () => void;

  // Media controls
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;

  // Recording
  startRecording: () => void;
  stopRecording: () => void;

  // Chat & Interactions
  sendMessage: (content: string) => void;
  raiseHand: () => void;
  lowerHand: () => void;
  sendReaction: (reaction: string) => void;

  // Host actions
  kickParticipant: (userId: number) => void;
  muteParticipant: (userId: number) => void;
  promoteParticipant: (userId: number, role: "co-host" | "participant") => void;

  // Connection
  connect: () => Promise<void>;
  disconnect: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useMeeting({
  autoConnect = true,
  onParticipantJoined,
  onParticipantLeft,
  onMeetingEnded,
  onChatMessage,
  onError,
}: UseMeetingOptions = {}): UseMeetingReturn {
  // =========================================================================
  // State
  // =========================================================================

  const [meetingState, setMeetingState] = useState<MeetingState>("idle");
  const [currentRoom, setCurrentRoom] = useState<MeetingRoom | null>(null);
  const [participants, setParticipants] = useState<MeetingParticipant[]>([]);
  const [chatMessages, setChatMessages] = useState<MeetingChatMessage[]>([]);
  const [raisedHands, setRaisedHands] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Connection state
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // LiveKit credentials
  const [livekitCredentials, setLivekitCredentials] =
    useState<LiveKitCredentials | null>(null);

  // Media state
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Cleanup refs
  const cleanupRef = useRef<(() => void)[]>([]);

  // =========================================================================
  // Connection Management
  // =========================================================================

  const connect = useCallback(async () => {
    if (connected || connecting) return;

    try {
      setConnecting(true);
      setError(null);

      await meetingSocketService.connect();
      setConnected(true);

      console.log("[useMeeting] Connected successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Connection failed";
      console.error("[useMeeting] Connection failed:", errorMessage);
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setConnecting(false);
    }
  }, [connected, connecting, onError]);

  const disconnect = useCallback(() => {
    if (currentRoom) {
      meetingSocketService.leaveMeeting(currentRoom.id);
    }
    meetingSocketService.disconnect();
    setConnected(false);
    setCurrentRoom(null);
    setParticipants([]);
    setChatMessages([]);
    setMeetingState("idle");

    // Cleanup listeners
    cleanupRef.current.forEach((cleanup) => cleanup());
    cleanupRef.current = [];
  }, [currentRoom]);

  // =========================================================================
  // Event Listeners Setup
  // =========================================================================

  useEffect(() => {
    if (!connected) return;

    // Meeting created
    const unsubCreated = meetingSocketService.onMeetingCreated(({ room }) => {
      console.log("[useMeeting] Meeting created:", room.id);
      setCurrentRoom(room);
      setParticipants(room.participants);
      setMeetingState("connected");
    });
    cleanupRef.current.push(unsubCreated);

    // Meeting joined
    const unsubJoined = meetingSocketService.onMeetingJoined(
      ({ room, livekit }) => {
        console.log("[useMeeting] Joined meeting:", room.id);
        setCurrentRoom(room);
        setParticipants(room.participants);
        setLivekitCredentials(livekit);
        setMeetingState("connected");
      }
    );
    cleanupRef.current.push(unsubJoined);

    // Meeting ended
    const unsubEnded = meetingSocketService.onMeetingEnded(
      ({ roomId, reason }) => {
        console.log("[useMeeting] Meeting ended:", reason);
        setMeetingState("ended");
        setCurrentRoom(null);
        setParticipants([]);
        onMeetingEnded?.(reason);
      }
    );
    cleanupRef.current.push(unsubEnded);

    // Participant joined
    const unsubParticipantJoined = meetingSocketService.onParticipantJoined(
      ({ participant }) => {
        console.log("[useMeeting] Participant joined:", participant.name);
        setParticipants((prev) => [...prev, participant]);
        onParticipantJoined?.(participant);
      }
    );
    cleanupRef.current.push(unsubParticipantJoined);

    // Participant left
    const unsubParticipantLeft = meetingSocketService.onParticipantLeft(
      ({ userId }) => {
        console.log("[useMeeting] Participant left:", userId);
        setParticipants((prev) => prev.filter((p) => p.id !== userId));
        setRaisedHands((prev) => prev.filter((id) => id !== userId));
        onParticipantLeft?.(userId);
      }
    );
    cleanupRef.current.push(unsubParticipantLeft);

    // Participant updated
    const unsubParticipantUpdated = meetingSocketService.onParticipantUpdated(
      ({ participant }) => {
        if (participant.id) {
          setParticipants((prev) =>
            prev.map((p) =>
              p.id === participant.id ? { ...p, ...participant } : p
            )
          );
        }
      }
    );
    cleanupRef.current.push(unsubParticipantUpdated);

    // Chat message
    const unsubChat = meetingSocketService.onChatMessage((message) => {
      setChatMessages((prev) => [...prev, message]);
      onChatMessage?.(message);
    });
    cleanupRef.current.push(unsubChat);

    // Hand raised
    const unsubHandRaised = meetingSocketService.onHandRaised(({ userId }) => {
      setRaisedHands((prev) => [...prev, userId]);
    });
    cleanupRef.current.push(unsubHandRaised);

    // Recording started/stopped
    const unsubRecordingStarted = meetingSocketService.onRecordingStarted(
      () => {
        setIsRecording(true);
      }
    );
    cleanupRef.current.push(unsubRecordingStarted);

    const unsubRecordingStopped = meetingSocketService.onRecordingStopped(
      () => {
        setIsRecording(false);
      }
    );
    cleanupRef.current.push(unsubRecordingStopped);

    // Error
    const unsubError = meetingSocketService.onError(({ message }) => {
      setError(message);
      onError?.(message);
    });
    cleanupRef.current.push(unsubError);

    return () => {
      cleanupRef.current.forEach((cleanup) => cleanup());
      cleanupRef.current = [];
    };
  }, [
    connected,
    onParticipantJoined,
    onParticipantLeft,
    onMeetingEnded,
    onChatMessage,
    onError,
  ]);

  // Auto-connect
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect]);

  // =========================================================================
  // Meeting Actions
  // =========================================================================

  const createMeeting = useCallback(
    async (name: string, settings?: Partial<MeetingSettings>) => {
      if (!connected) {
        await connect();
      }

      setMeetingState("creating");
      setError(null);

      meetingSocketService.createMeeting(name, settings);
    },
    [connected, connect]
  );

  const joinMeeting = useCallback(
    async (roomId: string, password?: string) => {
      if (!connected) {
        await connect();
      }

      setMeetingState("joining");
      setError(null);

      meetingSocketService.joinMeeting(roomId, password);
    },
    [connected, connect]
  );

  const leaveMeeting = useCallback(() => {
    if (!currentRoom) return;

    setMeetingState("leaving");
    meetingSocketService.leaveMeeting(currentRoom.id);

    // Reset state
    setCurrentRoom(null);
    setParticipants([]);
    setChatMessages([]);
    setRaisedHands([]);
    setLivekitCredentials(null);
    setMeetingState("idle");
  }, [currentRoom]);

  const endMeeting = useCallback(() => {
    if (!currentRoom) return;

    meetingSocketService.endMeeting(currentRoom.id);

    // Reset state
    setMeetingState("ended");
    setCurrentRoom(null);
    setParticipants([]);
  }, [currentRoom]);

  // =========================================================================
  // Media Controls
  // =========================================================================

  const toggleMute = useCallback(() => {
    if (!currentRoom) return;

    if (isMuted) {
      meetingSocketService.unmuteAudio(currentRoom.id);
    } else {
      meetingSocketService.muteAudio(currentRoom.id);
    }
    setIsMuted(!isMuted);
  }, [currentRoom, isMuted]);

  const toggleVideo = useCallback(() => {
    if (!currentRoom) return;

    if (isVideoOn) {
      meetingSocketService.muteVideo(currentRoom.id);
    } else {
      meetingSocketService.unmuteVideo(currentRoom.id);
    }
    setIsVideoOn(!isVideoOn);
  }, [currentRoom, isVideoOn]);

  const toggleScreenShare = useCallback(() => {
    if (!currentRoom) return;

    if (isScreenSharing) {
      meetingSocketService.stopScreenShare(currentRoom.id);
    } else {
      meetingSocketService.startScreenShare(currentRoom.id);
    }
    setIsScreenSharing(!isScreenSharing);
  }, [currentRoom, isScreenSharing]);

  // =========================================================================
  // Recording
  // =========================================================================

  const startRecording = useCallback(() => {
    if (!currentRoom) return;
    meetingSocketService.startRecording(currentRoom.id);
  }, [currentRoom]);

  const stopRecording = useCallback(() => {
    if (!currentRoom) return;
    meetingSocketService.stopRecording(currentRoom.id);
  }, [currentRoom]);

  // =========================================================================
  // Chat & Interactions
  // =========================================================================

  const sendMessage = useCallback(
    (content: string) => {
      if (!currentRoom || !content.trim()) return;
      meetingSocketService.sendChatMessage(currentRoom.id, content.trim());
    },
    [currentRoom]
  );

  const raiseHand = useCallback(() => {
    if (!currentRoom) return;
    meetingSocketService.raiseHand(currentRoom.id);
  }, [currentRoom]);

  const lowerHand = useCallback(() => {
    if (!currentRoom) return;
    meetingSocketService.lowerHand(currentRoom.id);
  }, [currentRoom]);

  const sendReaction = useCallback(
    (reaction: string) => {
      if (!currentRoom) return;
      meetingSocketService.sendReaction(currentRoom.id, reaction);
    },
    [currentRoom]
  );

  // =========================================================================
  // Host Actions
  // =========================================================================

  const kickParticipant = useCallback(
    (userId: number) => {
      if (!currentRoom) return;
      meetingSocketService.kickParticipant(currentRoom.id, userId);
    },
    [currentRoom]
  );

  const muteParticipant = useCallback(
    (userId: number) => {
      if (!currentRoom) return;
      meetingSocketService.muteParticipant(currentRoom.id, userId);
    },
    [currentRoom]
  );

  const promoteParticipant = useCallback(
    (userId: number, role: "co-host" | "participant") => {
      if (!currentRoom) return;
      meetingSocketService.promoteParticipant(currentRoom.id, userId, role);
    },
    [currentRoom]
  );

  // =========================================================================
  // Return
  // =========================================================================

  return {
    // State
    meetingState,
    currentRoom,
    participants,
    chatMessages,
    raisedHands,
    error,

    // Connection
    connected,
    connecting,

    // LiveKit
    livekitCredentials,

    // Media state
    isMuted,
    isVideoOn,
    isScreenSharing,
    isRecording,

    // Actions
    createMeeting,
    joinMeeting,
    leaveMeeting,
    endMeeting,

    // Media controls
    toggleMute,
    toggleVideo,
    toggleScreenShare,

    // Recording
    startRecording,
    stopRecording,

    // Chat & Interactions
    sendMessage,
    raiseHand,
    lowerHand,
    sendReaction,

    // Host actions
    kickParticipant,
    muteParticipant,
    promoteParticipant,

    // Connection
    connect,
    disconnect,
  };
}

export default useMeeting;
