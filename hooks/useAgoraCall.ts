/**
 * useAgoraCall Hook
 * React Hook for managing Agora video/voice calls
 * 
 * Usage:
 * const { 
 *   startCall, 
 *   endCall, 
 *   toggleMute, 
 *   toggleVideo,
 *   isInCall,
 *   isMuted,
 *   isVideoEnabled
 * } = useAgoraCall();
 */

import {
    answerCall as answerCallAPI,
    CallState,
    endCall as endCallAPI,
    startCall as startCallAPI
} from '@/services/agoraCall';
import { agoraEngine, AgoraEventHandlers } from '@/services/agoraEngine';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseAgoraCallReturn {
  // State
  isInCall: boolean;
  callState: CallState;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isSpeakerOn: boolean;
  isInitialized: boolean;
  remoteUsers: number[];
  currentChannel: string | null;
  error: string | null;

  // Actions
  initialize: (appId: string) => Promise<void>;
  startCall: (participantId: string, callType?: 'video' | 'voice') => Promise<void>;
  answerCall: (channelName: string, token: string, uid: number, appId: string) => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => Promise<void>;
  toggleVideo: () => Promise<void>;
  toggleSpeaker: () => Promise<void>;
  switchCamera: () => Promise<void>;
}

export function useAgoraCall(): UseAgoraCallReturn {
  // State
  const [isInCall, setIsInCall] = useState(false);
  const [callState, setCallState] = useState<CallState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<number[]>([]);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Ref to track if engine is cleaning up
  const isCleaningUp = useRef(false);

  /**
   * Initialize Agora engine
   */
  const initialize = useCallback(async (appId: string) => {
    try {
      setError(null);
      await agoraEngine.initialize(appId);
      setIsInitialized(true);
      console.log('✅ useAgoraCall: Engine initialized');
    } catch (err: any) {
      console.error('❌ useAgoraCall: Initialization failed:', err);
      setError(err.message || 'Không thể khởi tạo engine');
      throw err;
    }
  }, []);

  /**
   * Setup event handlers
   */
  useEffect(() => {
    if (!isInitialized) return;

    const handlers: AgoraEventHandlers = {
      onJoinChannelSuccess: (channel, uid, elapsed) => {
        console.log('✅ Joined channel:', { channel, uid, elapsed });
        setIsInCall(true);
        setCallState('connected');
        setCurrentChannel(channel);
      },

      onUserJoined: (uid, elapsed) => {
        console.log('✅ User joined:', { uid, elapsed });
        setRemoteUsers(prev => [...prev, uid]);
      },

      onUserOffline: (uid, reason) => {
        console.log('⚠️ User offline:', { uid, reason });
        setRemoteUsers(prev => prev.filter(u => u !== uid));
      },

      onError: (errorCode) => {
        console.error('❌ Agora error:', errorCode);
        setError(`Lỗi kết nối: ${errorCode}`);
        setCallState('failed');
      },

      onLeaveChannel: (stats) => {
        console.log('✅ Left channel:', stats);
        setIsInCall(false);
        setCallState('ended');
        setCurrentChannel(null);
        setRemoteUsers([]);
      },

      onConnectionStateChanged: (state, reason) => {
        console.log('🔄 Connection state changed:', { state, reason });
        
        // State: 1=DISCONNECTED, 2=CONNECTING, 3=CONNECTED, 4=RECONNECTING, 5=FAILED
        if (state === 3) {
          setCallState('connected');
        } else if (state === 4) {
          setCallState('calling'); // Reconnecting
        } else if (state === 5) {
          setCallState('failed');
          setError('Mất kết nối');
        }
      },
    };

    agoraEngine.setEventHandlers(handlers);

    return () => {
      if (!isCleaningUp.current) {
        agoraEngine.removeAllListeners();
      }
    };
  }, [isInitialized]);

  /**
   * Start a new call
   */
  const startCall = useCallback(async (
    participantId: string, 
    callType: 'video' | 'voice' = 'video'
  ) => {
    try {
      setError(null);
      setCallState('calling');

      // Get token from backend
      const { channelName, token, appId, uid } = await startCallAPI(participantId, callType);

      // Initialize if needed
      if (!isInitialized) {
        await initialize(appId);
      }

      // Enable video/audio
      if (callType === 'video') {
        await agoraEngine.enableVideo();
        setIsVideoEnabled(true);
      } else {
        await agoraEngine.disableVideo();
        setIsVideoEnabled(false);
      }
      
      await agoraEngine.enableAudio();

      // Join channel
      await agoraEngine.joinChannel({ appId, channelName, token, uid });

      console.log('✅ Call started successfully');
    } catch (err: any) {
      console.error('❌ Failed to start call:', err);
      setError(err.message || 'Không thể bắt đầu cuộc gọi');
      setCallState('failed');
      throw err;
    }
  }, [isInitialized, initialize]);

  /**
   * Answer an incoming call
   */
  const answerCall = useCallback(async (
    channelName: string,
    token: string,
    uid: number,
    appId: string
  ) => {
    try {
      setError(null);
      setCallState('calling');

      // Initialize if needed
      if (!isInitialized) {
        await initialize(appId);
      }

      // Notify backend
      await answerCallAPI(channelName);

      // Enable video/audio
      await agoraEngine.enableVideo();
      await agoraEngine.enableAudio();
      setIsVideoEnabled(true);

      // Join channel
      await agoraEngine.joinChannel({ appId, channelName, token, uid });

      console.log('✅ Call answered successfully');
    } catch (err: any) {
      console.error('❌ Failed to answer call:', err);
      setError(err.message || 'Không thể trả lời cuộc gọi');
      setCallState('failed');
      throw err;
    }
  }, [isInitialized, initialize]);

  /**
   * End current call
   */
  const endCall = useCallback(async () => {
    try {
      setError(null);
      const channel = agoraEngine.getCurrentChannel();

      // Leave channel
      await agoraEngine.leaveChannel();

      // Notify backend
      if (channel) {
        await endCallAPI(channel);
      }

      // Reset state
      setIsInCall(false);
      setCallState('ended');
      setCurrentChannel(null);
      setRemoteUsers([]);
      setIsMuted(false);
      setIsVideoEnabled(true);

      console.log('✅ Call ended successfully');
    } catch (err: any) {
      console.error('❌ Failed to end call:', err);
      setError(err.message || 'Không thể kết thúc cuộc gọi');
    }
  }, []);

  /**
   * Toggle microphone mute
   */
  const toggleMute = useCallback(async () => {
    try {
      const newMuted = !isMuted;
      await agoraEngine.muteLocalAudio(newMuted);
      setIsMuted(newMuted);
      console.log(`✅ Mic ${newMuted ? 'muted' : 'unmuted'}`);
    } catch (err: any) {
      console.error('❌ Failed to toggle mute:', err);
      setError('Không thể tắt/bật microphone');
    }
  }, [isMuted]);

  /**
   * Toggle video
   */
  const toggleVideo = useCallback(async () => {
    try {
      const newEnabled = !isVideoEnabled;
      await agoraEngine.muteLocalVideo(!newEnabled);
      setIsVideoEnabled(newEnabled);
      console.log(`✅ Video ${newEnabled ? 'enabled' : 'disabled'}`);
    } catch (err: any) {
      console.error('❌ Failed to toggle video:', err);
      setError('Không thể tắt/bật camera');
    }
  }, [isVideoEnabled]);

  /**
   * Toggle speaker
   */
  const toggleSpeaker = useCallback(async () => {
    try {
      const newEnabled = !isSpeakerOn;
      await agoraEngine.enableSpeaker(newEnabled);
      setIsSpeakerOn(newEnabled);
      console.log(`✅ Speaker ${newEnabled ? 'enabled' : 'disabled'}`);
    } catch (err: any) {
      console.error('❌ Failed to toggle speaker:', err);
      setError('Không thể tắt/bật loa');
    }
  }, [isSpeakerOn]);

  /**
   * Switch camera (front/back)
   */
  const switchCamera = useCallback(async () => {
    try {
      await agoraEngine.switchCamera();
      console.log('✅ Camera switched');
    } catch (err: any) {
      console.error('❌ Failed to switch camera:', err);
      setError('Không thể đổi camera');
    }
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Mark as cleaning up to prevent listener removal errors
      isCleaningUp.current = true;

      // End call if in progress
      if (isInCall) {
        const channel = agoraEngine.getCurrentChannel();
        agoraEngine.leaveChannel().catch(console.error);
        
        if (channel) {
          endCallAPI(channel).catch(console.error);
        }
      }
    };
  }, [isInCall]);

  return {
    // State
    isInCall,
    callState,
    isMuted,
    isVideoEnabled,
    isSpeakerOn,
    isInitialized,
    remoteUsers,
    currentChannel,
    error,

    // Actions
    initialize,
    startCall,
    answerCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    switchCamera,
  };
}
