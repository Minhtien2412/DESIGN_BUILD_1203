/**
 * WebRTC Module - Modern Video/Audio Calls
 * Uses native WebRTC APIs with fallback support
 * 
 * Features:
 * - 1-1 and group video/audio calls
 * - Screen sharing
 * - Adaptive bitrate
 * - Noise suppression
 * - Echo cancellation
 */

import { Platform } from 'react-native';
import {
    CallType
} from './types';

// ==================== CONSTANTS ====================

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
];

const DEFAULT_CONSTRAINTS: MediaStreamConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  video: {
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 },
    frameRate: { ideal: 30, max: 60 },
    facingMode: 'user',
  },
};

// ==================== TYPES ====================

export interface WebRTCConfig {
  iceServers?: RTCIceServer[];
  constraints?: MediaStreamConstraints;
  onLocalStream?: (stream: MediaStream) => void;
  onRemoteStream?: (participantId: string, stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onError?: (error: Error) => void;
}

export interface PeerConnection {
  participantId: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

type EventCallback = (...args: unknown[]) => void;

// ==================== WEBRTC MANAGER CLASS ====================

export class WebRTCManager {
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, PeerConnection> = new Map();
  private config: WebRTCConfig;
  private eventListeners: Map<string, Set<EventCallback>> = new Map();

  constructor(config: WebRTCConfig = {}) {
    this.config = {
      iceServers: config.iceServers || ICE_SERVERS,
      constraints: config.constraints || DEFAULT_CONSTRAINTS,
      ...config,
    };
  }

  // ==================== MEDIA METHODS ====================

  /**
   * Initialize local media stream
   */
  async initializeMedia(type: CallType = 'video'): Promise<MediaStream | null> {
    try {
      const constraints = {
        audio: this.config.constraints?.audio || true,
        video: type === 'video' ? (this.config.constraints?.video || true) : false,
      };

      // Check if we're on web or native
      if (Platform.OS === 'web') {
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      } else {
        // For React Native, use react-native-webrtc
        // This is a placeholder - actual implementation needs react-native-webrtc
        console.log('[WebRTC] Native platform detected, using native WebRTC');
        try {
          // react-native-webrtc will be provided
          const RNWebRTC = await import('react-native-webrtc');
          const { mediaDevices } = RNWebRTC;
          this.localStream = await mediaDevices.getUserMedia({
            audio: true,
            video: type === 'video',
          }) as unknown as MediaStream;
        } catch {
          console.warn('[WebRTC] react-native-webrtc not available');
          return null;
        }
      }

      if (this.localStream) {
        this.config.onLocalStream?.(this.localStream);
        this.emit('localStream', this.localStream);
      }
      
      return this.localStream;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to get media');
      this.config.onError?.(err);
      throw err;
    }
  }

  /**
   * Stop local media stream
   */
  stopMedia(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  /**
   * Toggle audio mute
   */
  toggleAudio(): boolean {
    if (!this.localStream) return false;
    
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      this.emit('audioToggled', audioTrack.enabled);
      return audioTrack.enabled;
    }
    return false;
  }

  /**
   * Toggle video
   */
  toggleVideo(): boolean {
    if (!this.localStream) return false;
    
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      this.emit('videoToggled', videoTrack.enabled);
      return videoTrack.enabled;
    }
    return false;
  }

  /**
   * Switch camera (front/back)
   */
  async switchCamera(): Promise<void> {
    if (!this.localStream || Platform.OS === 'web') return;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      // @ts-ignore - _switchCamera is provided by react-native-webrtc
      await videoTrack._switchCamera?.();
      this.emit('cameraSwitched');
    }
  }

  // ==================== PEER CONNECTION METHODS ====================

  /**
   * Create peer connection for a participant
   */
  createPeerConnection(participantId: string): RTCPeerConnection {
    const connection = new RTCPeerConnection({
      iceServers: this.config.iceServers,
    });

    // Add local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        connection.addTrack(track, this.localStream!);
      });
    }

    // Handle ICE candidates
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        this.emit('iceCandidate', { participantId, candidate: event.candidate });
      }
    };

    // Handle connection state changes
    connection.onconnectionstatechange = () => {
      this.config.onConnectionStateChange?.(connection.connectionState);
      this.emit('connectionStateChange', { participantId, state: connection.connectionState });
    };

    // Handle remote tracks
    connection.ontrack = (event) => {
      const remoteStream = event.streams[0];
      const peerConn = this.peerConnections.get(participantId);
      if (peerConn) {
        peerConn.stream = remoteStream;
      }
      this.config.onRemoteStream?.(participantId, remoteStream);
      this.emit('remoteStream', { participantId, stream: remoteStream });
    };

    this.peerConnections.set(participantId, { participantId, connection });
    return connection;
  }

  /**
   * Create offer for outgoing call
   */
  async createOffer(participantId: string): Promise<RTCSessionDescriptionInit> {
    const peerConn = this.peerConnections.get(participantId);
    if (!peerConn) {
      throw new Error('Peer connection not found');
    }

    const offer = await peerConn.connection.createOffer();
    await peerConn.connection.setLocalDescription(offer);
    return offer;
  }

  /**
   * Create answer for incoming call
   */
  async createAnswer(participantId: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    let peerConn = this.peerConnections.get(participantId);
    if (!peerConn) {
      this.createPeerConnection(participantId);
      peerConn = this.peerConnections.get(participantId);
    }

    if (!peerConn) {
      throw new Error('Failed to create peer connection');
    }

    await peerConn.connection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConn.connection.createAnswer();
    await peerConn.connection.setLocalDescription(answer);
    return answer;
  }

  /**
   * Set remote answer
   */
  async setRemoteAnswer(participantId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peerConn = this.peerConnections.get(participantId);
    if (!peerConn) {
      throw new Error('Peer connection not found');
    }

    await peerConn.connection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  /**
   * Add ICE candidate
   */
  async addIceCandidate(participantId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peerConn = this.peerConnections.get(participantId);
    if (!peerConn) {
      throw new Error('Peer connection not found');
    }

    await peerConn.connection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  /**
   * Close peer connection
   */
  closePeerConnection(participantId: string): void {
    const peerConn = this.peerConnections.get(participantId);
    if (peerConn) {
      peerConn.connection.close();
      this.peerConnections.delete(participantId);
    }
  }

  /**
   * Close all connections
   */
  closeAllConnections(): void {
    this.peerConnections.forEach((peerConn) => {
      peerConn.connection.close();
    });
    this.peerConnections.clear();
    this.stopMedia();
  }

  // ==================== SCREEN SHARING ====================

  /**
   * Start screen sharing (web only)
   */
  async startScreenShare(): Promise<MediaStream | null> {
    if (Platform.OS !== 'web') {
      console.warn('[WebRTC] Screen sharing not supported on native');
      return null;
    }

    try {
      const screenStream = await (navigator.mediaDevices as MediaDevices & {
        getDisplayMedia: (constraints: MediaStreamConstraints) => Promise<MediaStream>;
      }).getDisplayMedia({
        video: true,
        audio: true,
      });

      // Replace video track in all peer connections
      const screenTrack = screenStream.getVideoTracks()[0];
      this.peerConnections.forEach((peerConn) => {
        const sender = peerConn.connection.getSenders().find(s => s.track?.kind === 'video');
        if (sender && screenTrack) {
          sender.replaceTrack(screenTrack);
        }
      });

      this.emit('screenShareStarted', screenStream);
      return screenStream;
    } catch (error) {
      console.error('[WebRTC] Screen share error:', error);
      return null;
    }
  }

  /**
   * Stop screen sharing
   */
  async stopScreenShare(): Promise<void> {
    if (!this.localStream) return;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      this.peerConnections.forEach((peerConn) => {
        const sender = peerConn.connection.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });
    }

    this.emit('screenShareStopped');
  }

  // ==================== EVENT EMITTER ====================

  on(event: string, callback: EventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: EventCallback): void {
    this.eventListeners.get(event)?.delete(callback);
  }

  private emit(event: string, ...args: unknown[]): void {
    this.eventListeners.get(event)?.forEach(callback => callback(...args));
  }

  // ==================== GETTERS ====================

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(participantId: string): MediaStream | null {
    return this.peerConnections.get(participantId)?.stream || null;
  }

  getConnectionState(participantId: string): RTCPeerConnectionState | null {
    return this.peerConnections.get(participantId)?.connection.connectionState || null;
  }

  isAudioEnabled(): boolean {
    return this.localStream?.getAudioTracks()[0]?.enabled ?? false;
  }

  isVideoEnabled(): boolean {
    return this.localStream?.getVideoTracks()[0]?.enabled ?? false;
  }
}

// ==================== SINGLETON INSTANCE ====================

let webRTCInstance: WebRTCManager | null = null;

export function getWebRTCManager(config?: WebRTCConfig): WebRTCManager {
  if (!webRTCInstance) {
    webRTCInstance = new WebRTCManager(config);
  }
  return webRTCInstance;
}

export function resetWebRTCManager(): void {
  if (webRTCInstance) {
    webRTCInstance.closeAllConnections();
    webRTCInstance = null;
  }
}

// ==================== EXPORTS ====================

export {
    DEFAULT_CONSTRAINTS, ICE_SERVERS
};

