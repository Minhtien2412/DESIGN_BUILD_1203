/**
 * LiveKit Call Hook
 * Integrates LiveKit SDK with video/audio calls
 * 
 * Features:
 * - Connect to LiveKit room
 * - Handle local/remote tracks
 * - Mute/unmute, camera toggle
 * - Screen sharing (future)
 */

import { ENV } from '@/config/env';
import { livekitService } from '@/services/livekitService';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

// Types
export type CallState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'failed';

export interface Participant {
  identity: string;
  name?: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isCameraEnabled: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown';
}

export interface LiveKitCallState {
  callState: CallState;
  localParticipant: Participant | null;
  remoteParticipants: Participant[];
  isMuted: boolean;
  isCameraOn: boolean;
  isSpeakerOn: boolean;
  isFrontCamera: boolean;
  error: string | null;
}

export interface LiveKitCallActions {
  connect: (roomName: string, identity?: string) => Promise<boolean>;
  disconnect: () => Promise<void>;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleSpeaker: () => void;
  switchCamera: () => void;
}

export interface UseLiveKitCallReturn extends LiveKitCallState, LiveKitCallActions {}

// Check if LiveKit native module is available
const isLiveKitAvailable = (): boolean => {
  // LiveKit only works in dev builds, not Expo Go
  if (Platform.OS === 'web') {
    return true; // Web version uses browser WebRTC
  }
  
  try {
    // Try to import the native module
    // This will fail in Expo Go
    require('@livekit/react-native');
    return true;
  } catch {
    return false;
  }
};

/**
 * Hook for managing LiveKit video/audio calls
 */
export function useLiveKitCall(initialCameraOn = true): UseLiveKitCallReturn {
  // State
  const [callState, setCallState] = useState<CallState>('idle');
  const [localParticipant, setLocalParticipant] = useState<Participant | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<Participant[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(initialCameraOn);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const roomRef = useRef<any>(null);
  const tokenRef = useRef<string | null>(null);

  // Check availability
  const livekitAvailable = isLiveKitAvailable();

  /**
   * Connect to a LiveKit room
   */
  const connect = useCallback(async (roomName: string, identity?: string): Promise<boolean> => {
    if (!livekitAvailable) {
      console.warn('[LiveKitCall] LiveKit not available in Expo Go. Use dev build.');
      setError('LiveKit requires dev build. Use Expo Go mock mode.');
      // Simulate connection for UI testing
      setCallState('connected');
      setLocalParticipant({
        identity: identity || 'local',
        name: 'You',
        isSpeaking: false,
        isMuted: false,
        isCameraEnabled: isCameraOn,
        connectionQuality: 'excellent',
      });
      return true;
    }

    try {
      setCallState('connecting');
      setError(null);

      // Get token from backend
      const tokenResponse = await livekitService.getRoomToken(roomName, identity);
      tokenRef.current = tokenResponse.token;

      // Get LiveKit module dynamically
      const livekit = await import('@livekit/react-native');
      const { Room, RoomEvent } = livekit as any;

      // Create room
      const room = new Room();
      roomRef.current = room;

      // Set up event handlers
      room.on(RoomEvent.Connected, () => {
        console.log('[LiveKitCall] Connected to room');
        setCallState('connected');
      });

      room.on(RoomEvent.Disconnected, () => {
        console.log('[LiveKitCall] Disconnected from room');
        setCallState('disconnected');
      });

      room.on(RoomEvent.Reconnecting, () => {
        console.log('[LiveKitCall] Reconnecting...');
        setCallState('reconnecting');
      });

      room.on(RoomEvent.ParticipantConnected, (participant: any) => {
        console.log('[LiveKitCall] Participant connected:', participant.identity);
        updateRemoteParticipants(room);
      });

      room.on(RoomEvent.ParticipantDisconnected, (participant: any) => {
        console.log('[LiveKitCall] Participant disconnected:', participant.identity);
        updateRemoteParticipants(room);
      });

      room.on(RoomEvent.TrackSubscribed, () => {
        updateRemoteParticipants(room);
      });

      room.on(RoomEvent.TrackUnsubscribed, () => {
        updateRemoteParticipants(room);
      });

      // Connect to room
      const wsUrl = ENV.LIVEKIT_URL || 'wss://api.thietkeresort.com.vn/livekit/rtc';
      await room.connect(wsUrl, tokenResponse.token, {
        autoSubscribe: true,
      });

      // Enable local tracks
      await room.localParticipant.enableCameraAndMicrophone();

      // Update local participant
      setLocalParticipant({
        identity: room.localParticipant.identity,
        name: room.localParticipant.name || room.localParticipant.identity,
        isSpeaking: false,
        isMuted: !room.localParticipant.isMicrophoneEnabled,
        isCameraEnabled: room.localParticipant.isCameraEnabled,
        connectionQuality: 'excellent',
      });

      return true;
    } catch (err) {
      console.error('[LiveKitCall] Connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setCallState('failed');
      return false;
    }
  }, [livekitAvailable, isCameraOn]);

  /**
   * Update remote participants list
   */
  const updateRemoteParticipants = (room: any) => {
    const participants: Participant[] = [];
    room.remoteParticipants.forEach((participant: any) => {
      participants.push({
        identity: participant.identity,
        name: participant.name || participant.identity,
        isSpeaking: participant.isSpeaking,
        isMuted: !participant.isMicrophoneEnabled,
        isCameraEnabled: participant.isCameraEnabled,
        connectionQuality: participant.connectionQuality || 'unknown',
      });
    });
    setRemoteParticipants(participants);
  };

  /**
   * Disconnect from room
   */
  const disconnect = useCallback(async () => {
    try {
      if (roomRef.current) {
        await roomRef.current.disconnect();
        roomRef.current = null;
      }
      setCallState('disconnected');
      setLocalParticipant(null);
      setRemoteParticipants([]);
    } catch (err) {
      console.error('[LiveKitCall] Disconnect error:', err);
    }
  }, []);

  /**
   * Toggle microphone
   */
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newValue = !prev;
      if (roomRef.current?.localParticipant) {
        roomRef.current.localParticipant.setMicrophoneEnabled(!newValue);
      }
      return newValue;
    });
  }, []);

  /**
   * Toggle camera
   */
  const toggleCamera = useCallback(() => {
    setIsCameraOn((prev) => {
      const newValue = !prev;
      if (roomRef.current?.localParticipant) {
        roomRef.current.localParticipant.setCameraEnabled(newValue);
      }
      return newValue;
    });
  }, []);

  /**
   * Toggle speaker
   */
  const toggleSpeaker = useCallback(() => {
    setIsSpeakerOn((prev) => !prev);
    // Note: Speaker toggle requires native audio routing
  }, []);

  /**
   * Switch between front/back camera
   */
  const switchCamera = useCallback(() => {
    setIsFrontCamera((prev) => {
      const newValue = !prev;
      if (roomRef.current?.localParticipant) {
        // Switch camera on local participant
        const videoTrack = roomRef.current.localParticipant.getTrackPublication('video');
        if (videoTrack?.track) {
          videoTrack.track.switchCamera();
        }
      }
      return newValue;
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, []);

  return {
    // State
    callState,
    localParticipant,
    remoteParticipants,
    isMuted,
    isCameraOn,
    isSpeakerOn,
    isFrontCamera,
    error,
    // Actions
    connect,
    disconnect,
    toggleMute,
    toggleCamera,
    toggleSpeaker,
    switchCamera,
  };
}

export default useLiveKitCall;
