/**
 * VideoCallManager - Quản lý WebRTC video/audio calls
 * Tích hợp với CallContext cho signaling thông qua WebSocket
 */

import {
    RTCIceCandidate,
    RTCPeerConnection,
    RTCSessionDescription,
    isWebRTCAvailable,
    mediaDevices
} from './webrtc';

// STUN servers configuration
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ],
};

export interface VideoCallConfig {
  onLocalStream?: (stream: MediaStream) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
  onConnectionStateChange?: (state: string) => void;
  onError?: (error: Error) => void;
}

export class VideoCallManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private config: VideoCallConfig;
  
  // Call state
  private isMuted: boolean = false;
  private isVideoEnabled: boolean = true;
  private isSpeakerOn: boolean = true;

  constructor(config: VideoCallConfig) {
    this.config = config;
    
    // Check if WebRTC is available
    if (!isWebRTCAvailable) {
      console.warn('[VideoCallManager] WebRTC native module not available');
      console.warn('[VideoCallManager] Video/audio calls will not work in Expo Go');
      console.warn('[VideoCallManager] Create a development build: npx expo run:android');
    }
  }

  /**
   * Initialize WebRTC peer connection
   */
  private initializePeerConnection() {
    if (!isWebRTCAvailable) {
      throw new Error('WebRTC not available. Use development build instead of Expo Go.');
    }
    if (this.peerConnection) {
      console.log('⚠️ Peer connection already exists');
      return;
    }

    console.log('🔗 Initializing peer connection...');
    this.peerConnection = new RTCPeerConnection(ICE_SERVERS);

    // Store reference after assignment - guaranteed non-null at this point
    const pc = this.peerConnection!;

    // Listen for ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 ICE candidate found:', event.candidate);
        this.config.onIceCandidate?.(event.candidate);
      }
    };

    // Listen for remote stream
    pc.ontrack = (event) => {
      console.log('📹 Remote track received:', event.track.kind);
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.config.onRemoteStream?.(event.streams[0]);
      }
    };

    // Listen for connection state changes
    pc.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState || 'unknown';
      console.log('🔌 Connection state changed:', state);
      this.config.onConnectionStateChange?.(state);
    };

    // Listen for ICE connection state
    pc.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState || 'unknown';
      console.log('🧊 ICE connection state:', state);
    };
  }

  /**
   * Get user media (camera + microphone)
   */
  async getUserMedia(videoEnabled: boolean = true, audioEnabled: boolean = true): Promise<MediaStream> {
    try {
      console.log('🎥 Requesting user media...', { videoEnabled, audioEnabled });
      
      const constraints = {
        audio: audioEnabled,
        video: videoEnabled ? {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        } : false,
      };

      const stream = await mediaDevices.getUserMedia(constraints);
      this.localStream = stream;
      this.isVideoEnabled = videoEnabled;
      this.isMuted = !audioEnabled;

      console.log('✅ Got user media:', stream.getTracks().map((t: MediaStreamTrack) => t.kind));
      this.config.onLocalStream?.(stream);

      return stream;
    } catch (error) {
      console.error('❌ Error getting user media:', error);
      this.config.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Start call as caller - create offer
   */
  async createOffer(videoEnabled: boolean = true, audioEnabled: boolean = true): Promise<RTCSessionDescriptionInit> {
    try {
      console.log('📞 Creating offer...');
      
      this.initializePeerConnection();
      
      // Get local media first
      const stream = await this.getUserMedia(videoEnabled, audioEnabled);

      // Add local tracks to peer connection
      stream.getTracks().forEach((track) => {
        console.log('➕ Adding local track:', track.kind);
        this.peerConnection?.addTrack(track, stream);
      });

      // Create offer
      const offer = await this.peerConnection!.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: videoEnabled,
      });

      await this.peerConnection!.setLocalDescription(offer);
      console.log('✅ Offer created and set as local description');

      return offer;
    } catch (error) {
      console.error('❌ Error creating offer:', error);
      this.config.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Answer call as callee - create answer
   */
  async createAnswer(
    offer: RTCSessionDescriptionInit,
    videoEnabled: boolean = true,
    audioEnabled: boolean = true
  ): Promise<RTCSessionDescriptionInit> {
    try {
      console.log('📞 Creating answer...');
      
      this.initializePeerConnection();

      // Set remote description (the offer)
      await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer));
      console.log('✅ Remote offer set');

      // Get local media
      const stream = await this.getUserMedia(videoEnabled, audioEnabled);

      // Add local tracks to peer connection
      stream.getTracks().forEach((track) => {
        console.log('➕ Adding local track:', track.kind);
        this.peerConnection?.addTrack(track, stream);
      });

      // Create answer
      const answer = await this.peerConnection!.createAnswer();
      await this.peerConnection!.setLocalDescription(answer);
      console.log('✅ Answer created and set as local description');

      return answer;
    } catch (error) {
      console.error('❌ Error creating answer:', error);
      this.config.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Handle remote answer (for caller)
   */
  async handleAnswer(answer: RTCSessionDescriptionInit) {
    try {
      if (!this.peerConnection) {
        throw new Error('Peer connection not initialized');
      }

      console.log('📨 Handling remote answer...');
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('✅ Remote answer set');
    } catch (error) {
      console.error('❌ Error handling answer:', error);
      this.config.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Add ICE candidate from remote peer
   */
  async addIceCandidate(candidate: RTCIceCandidate) {
    try {
      if (!this.peerConnection) {
        console.warn('⚠️ Peer connection not ready, buffering ICE candidate');
        return;
      }

      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('✅ ICE candidate added');
    } catch (error) {
      console.error('❌ Error adding ICE candidate:', error);
      // Don't throw - ICE candidate errors are not critical
    }
  }

  /**
   * Toggle microphone (mute/unmute)
   */
  toggleMicrophone(): boolean {
    if (!this.localStream) {
      console.warn('⚠️ No local stream');
      return false;
    }

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      this.isMuted = !audioTrack.enabled;
      console.log('🎤 Microphone:', this.isMuted ? 'MUTED' : 'UNMUTED');
      return audioTrack.enabled;
    }

    return false;
  }

  /**
   * Toggle camera (on/off)
   */
  toggleCamera(): boolean {
    if (!this.localStream) {
      console.warn('⚠️ No local stream');
      return false;
    }

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      this.isVideoEnabled = videoTrack.enabled;
      console.log('📹 Camera:', this.isVideoEnabled ? 'ON' : 'OFF');
      return videoTrack.enabled;
    }

    return false;
  }

  /**
   * Switch camera (front/back) - React Native only
   */
  async switchCamera() {
    if (!this.localStream) {
      console.warn('⚠️ No local stream');
      return;
    }

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      try {
        // @ts-ignore - _switchCamera exists in react-native-webrtc
        await videoTrack._switchCamera();
        console.log('📹 Camera switched');
      } catch (error) {
        console.error('❌ Error switching camera:', error);
      }
    }
  }

  /**
   * Toggle speaker (earpiece/speakerphone) - Platform specific
   */
  toggleSpeaker(): boolean {
    // Note: Speaker toggle requires platform-specific implementation
    // On React Native, use InCallManager or similar library
    this.isSpeakerOn = !this.isSpeakerOn;
    console.log('🔊 Speaker:', this.isSpeakerOn ? 'ON' : 'OFF');
    return this.isSpeakerOn;
  }

  /**
   * Get local media stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get remote media stream
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  /**
   * Get current call state
   */
  getCallState() {
    return {
      isMuted: this.isMuted,
      isVideoEnabled: this.isVideoEnabled,
      isSpeakerOn: this.isSpeakerOn,
      connectionState: this.peerConnection?.connectionState || 'disconnected',
      iceConnectionState: this.peerConnection?.iceConnectionState || 'new',
    };
  }

  /**
   * Check if peer connection is active
   */
  isConnected(): boolean {
    return this.peerConnection?.connectionState === 'connected';
  }

  /**
   * End call and cleanup all resources
   */
  cleanup() {
    console.log('🧹 Cleaning up call resources...');

    // Stop local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
        console.log('⏹️ Stopped local track:', track.kind);
      });
      this.localStream = null;
    }

    // Stop remote stream tracks
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => {
        track.stop();
        console.log('⏹️ Stopped remote track:', track.kind);
      });
      this.remoteStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
      console.log('🔌 Peer connection closed');
    }

    // Reset state
    this.isMuted = false;
    this.isVideoEnabled = true;
    this.isSpeakerOn = true;

    console.log('✅ Cleanup complete');
  }
}

/**
 * Helper: Check media permissions
 */
export async function checkMediaPermissions(): Promise<{ camera: boolean; microphone: boolean }> {
  try {
    const stream = await mediaDevices.getUserMedia({ video: true, audio: true });
    stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    return { camera: true, microphone: true };
  } catch (error) {
    console.error('Media permissions check failed:', error);
    return { camera: false, microphone: false };
  }
}

/**
 * Helper: Request media permissions
 */
export async function requestMediaPermissions(): Promise<boolean> {
  try {
    const stream = await mediaDevices.getUserMedia({ video: true, audio: true });
    stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    return true;
  } catch (error) {
    console.error('Failed to request media permissions:', error);
    return false;
  }
}
