/**
 * Video Call Service
 * 
 * Manages LiveKit video calls with:
 * - Room connection/disconnection
 * - Camera/microphone controls
 * - Screen sharing
 * - Participant management
 * - Call recording
 * - Backend integration
 */

// TODO: Fix LiveKit imports - these exports don't exist in @livekit/react-native@2.9.6
// import {
//     LocalParticipant,
//     Participant,
//     RemoteParticipant,
//     Room,
//     RoomEvent,
//     createLocalAudioTrack,
//     createLocalVideoTrack
// } from '@livekit/react-native';
import { apiFetch } from './api';

// Temporary type placeholders until LiveKit imports are fixed
interface RoomType {
  connect: (url: string, token: string) => Promise<void>;
  disconnect: () => void;
  on: (event: string, handler: (...args: any[]) => void) => void;
  localParticipant: LocalParticipantType;
  participants: Map<string, ParticipantType>;
  state: 'connected' | 'disconnected' | 'reconnecting';
}

interface ParticipantType {
  sid?: string;
  name?: string;
  identity: string;
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
  isScreenShareEnabled: boolean;
  isLocal?: boolean;
}

interface LocalParticipantType extends ParticipantType {
  isLocal: true;
  publishTrack: (track: any) => Promise<void>;
  unpublishTrack: (track: any) => Promise<void>;
}

type Room = RoomType;
type Participant = ParticipantType;
type LocalParticipant = LocalParticipantType;
type RemoteParticipant = ParticipantType;

// Mock implementations for web platform
const RoomEvent = {
  ParticipantConnected: 'participantConnected',
  ParticipantDisconnected: 'participantDisconnected',
  TrackSubscribed: 'trackSubscribed',
  TrackUnsubscribed: 'trackUnsubscribed',
  ConnectionQualityChanged: 'connectionQualityChanged',
  Disconnected: 'disconnected',
  Reconnecting: 'reconnecting',
  Reconnected: 'reconnected',
};

// Mock Room class for web platform
class MockRoom implements RoomType {
  state: 'connected' | 'disconnected' | 'reconnecting' = 'disconnected';
  localParticipant: LocalParticipantType = {
    identity: 'local',
    isCameraEnabled: false,
    isMicrophoneEnabled: false,
    isScreenShareEnabled: false,
    isLocal: true,
    publishTrack: async (_track: any) => { console.log('[VideoCall] Mock publish track'); },
    unpublishTrack: async (_track: any) => { console.log('[VideoCall] Mock unpublish track'); },
  };
  participants = new Map<string, ParticipantType>();
  private handlers = new Map<string, ((...args: any[]) => void)[]>();

  async connect(_url: string, _token: string): Promise<void> {
    console.log('[VideoCall] Mock room connected');
    this.state = 'connected';
  }

  disconnect(): void {
    console.log('[VideoCall] Mock room disconnected');
    this.state = 'disconnected';
  }

  on(event: string, handler: (...args: any[]) => void): void {
    const existing = this.handlers.get(event) || [];
    this.handlers.set(event, [...existing, handler]);
  }
}

const createLocalAudioTrack = () => Promise.resolve(null as any);
const createLocalVideoTrack = () => Promise.resolve(null as any);

// Types
export interface CallParticipant {
  id: string;
  name: string;
  identity: string;
  isCameraOn: boolean;
  isMicOn: boolean;
  isScreenSharing: boolean;
  isLocal: boolean;
  joinedAt: Date;
}

export interface CallConfig {
  meetingId: string;
  participantName: string;
  isCameraOn?: boolean;
  isMicOn?: boolean;
}

export interface LiveKitToken {
  token: string;
  url: string;
  roomName: string;
  participantIdentity: string;
}

export interface CallStats {
  duration: number;
  participantCount: number;
  networkQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  bitrate: number;
  fps: number;
}

// Event handlers
type CallEventHandler = (data: any) => void;

interface CallEventHandlers {
  onParticipantJoined?: CallEventHandler;
  onParticipantLeft?: CallEventHandler;
  onTrackSubscribed?: CallEventHandler;
  onTrackUnsubscribed?: CallEventHandler;
  onConnectionQualityChanged?: CallEventHandler;
  onDisconnected?: CallEventHandler;
  onReconnecting?: CallEventHandler;
  onReconnected?: CallEventHandler;
}

class VideoCallService {
  private room: Room | null = null;
  private localVideoTrack: any = null;
  private localAudioTrack: any = null;
  private eventHandlers: CallEventHandlers = {};
  private callStartTime: Date | null = null;

  /**
   * Initialize call and connect to room
   */
  async initializeCall(config: CallConfig, handlers?: CallEventHandlers): Promise<RoomType> {
    try {
      // Store event handlers
      if (handlers) {
        this.eventHandlers = handlers;
      }

      // Get LiveKit token from backend
      const tokenData = await this.getLiveKitToken(config.meetingId, config.participantName);

      // Create room instance
      this.room = new MockRoom();

      // Register event listeners
      this.registerRoomEvents();

      // Connect to room
      await this.room.connect(tokenData.url, tokenData.token);

      // Enable camera and microphone based on config
      if (config.isCameraOn !== false) {
        await this.enableCamera();
      }
      if (config.isMicOn !== false) {
        await this.enableMicrophone();
      }

      this.callStartTime = new Date();

      return this.room;
    } catch (error) {
      console.error('Failed to initialize call:', error);
      throw error;
    }
  }

  /**
   * Get LiveKit access token from backend
   */
  private async getLiveKitToken(meetingId: string, participantName: string): Promise<LiveKitToken> {
    try {
      const response = await apiFetch(`/video/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId,
          participantName,
        }),
      });

      return response as LiveKitToken;
    } catch (error) {
      console.error('Failed to get LiveKit token:', error);
      throw error;
    }
  }

  /**
   * Register room event listeners
   */
  private registerRoomEvents() {
    if (!this.room) return;

    // Participant joined
    this.room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
      console.log('Participant joined:', participant.identity);
      if (this.eventHandlers.onParticipantJoined) {
        this.eventHandlers.onParticipantJoined(this.participantToCallParticipant(participant));
      }
    });

    // Participant left
    this.room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      console.log('Participant left:', participant.identity);
      if (this.eventHandlers.onParticipantLeft) {
        this.eventHandlers.onParticipantLeft(this.participantToCallParticipant(participant));
      }
    });

    // Track subscribed
    this.room.on(RoomEvent.TrackSubscribed, (track: any, publication: any, participant: RemoteParticipant) => {
      console.log('Track subscribed:', track.kind, 'from', participant.identity);
      if (this.eventHandlers.onTrackSubscribed) {
        this.eventHandlers.onTrackSubscribed({ track, publication, participant });
      }
    });

    // Track unsubscribed
    this.room.on(RoomEvent.TrackUnsubscribed, (track: any, publication: any, participant: RemoteParticipant) => {
      console.log('Track unsubscribed:', track.kind, 'from', participant.identity);
      if (this.eventHandlers.onTrackUnsubscribed) {
        this.eventHandlers.onTrackUnsubscribed({ track, publication, participant });
      }
    });

    // Connection quality changed
    this.room.on(RoomEvent.ConnectionQualityChanged, (quality: string, participant: Participant) => {
      console.log('Connection quality changed:', quality, 'for', participant.identity);
      if (this.eventHandlers.onConnectionQualityChanged) {
        this.eventHandlers.onConnectionQualityChanged({ quality, participant });
      }
    });

    // Disconnected
    this.room.on(RoomEvent.Disconnected, () => {
      console.log('Disconnected from room');
      if (this.eventHandlers.onDisconnected) {
        this.eventHandlers.onDisconnected({});
      }
    });

    // Reconnecting
    this.room.on(RoomEvent.Reconnecting, () => {
      console.log('Reconnecting to room');
      if (this.eventHandlers.onReconnecting) {
        this.eventHandlers.onReconnecting({});
      }
    });

    // Reconnected
    this.room.on(RoomEvent.Reconnected, () => {
      console.log('Reconnected to room');
      if (this.eventHandlers.onReconnected) {
        this.eventHandlers.onReconnected({});
      }
    });
  }

  /**
   * Convert LiveKit participant to CallParticipant
   */
  private participantToCallParticipant(participant: Participant): CallParticipant {
    const isLocal = participant.isLocal === true;
    
    return {
      id: participant.sid || '',
      name: participant.name || participant.identity,
      identity: participant.identity,
      isCameraOn: participant.isCameraEnabled,
      isMicOn: participant.isMicrophoneEnabled,
      isScreenSharing: participant.isScreenShareEnabled,
      isLocal,
      joinedAt: new Date(),
    };
  }

  /**
   * Enable camera
   */
  async enableCamera(): Promise<void> {
    try {
      if (!this.room) throw new Error('Room not initialized');

      // Create local video track if not exists
      if (!this.localVideoTrack) {
        this.localVideoTrack = await createLocalVideoTrack();
      }

      // Publish video track
      await this.room.localParticipant.publishTrack(this.localVideoTrack);
      
      console.log('Camera enabled');
    } catch (error) {
      console.error('Failed to enable camera:', error);
      throw error;
    }
  }

  /**
   * Disable camera
   */
  async disableCamera(): Promise<void> {
    try {
      if (!this.room || !this.localVideoTrack) return;

      // Unpublish video track
      await this.room.localParticipant.unpublishTrack(this.localVideoTrack);
      
      // Stop video track
      this.localVideoTrack.stop();
      this.localVideoTrack = null;

      console.log('Camera disabled');
    } catch (error) {
      console.error('Failed to disable camera:', error);
      throw error;
    }
  }

  /**
   * Enable microphone
   */
  async enableMicrophone(): Promise<void> {
    try {
      if (!this.room) throw new Error('Room not initialized');

      // Create local audio track if not exists
      if (!this.localAudioTrack) {
        this.localAudioTrack = await createLocalAudioTrack();
      }

      // Publish audio track
      await this.room.localParticipant.publishTrack(this.localAudioTrack);
      
      console.log('Microphone enabled');
    } catch (error) {
      console.error('Failed to enable microphone:', error);
      throw error;
    }
  }

  /**
   * Disable microphone
   */
  async disableMicrophone(): Promise<void> {
    try {
      if (!this.room || !this.localAudioTrack) return;

      // Unpublish audio track
      await this.room.localParticipant.unpublishTrack(this.localAudioTrack);
      
      // Stop audio track
      this.localAudioTrack.stop();
      this.localAudioTrack = null;

      console.log('Microphone disabled');
    } catch (error) {
      console.error('Failed to disable microphone:', error);
      throw error;
    }
  }

  /**
   * Toggle camera
   */
  async toggleCamera(): Promise<boolean> {
    const isEnabled = this.localVideoTrack !== null;
    if (isEnabled) {
      await this.disableCamera();
    } else {
      await this.enableCamera();
    }
    return !isEnabled;
  }

  /**
   * Toggle microphone
   */
  async toggleMicrophone(): Promise<boolean> {
    const isEnabled = this.localAudioTrack !== null;
    if (isEnabled) {
      await this.disableMicrophone();
    } else {
      await this.enableMicrophone();
    }
    return !isEnabled;
  }

  /**
   * Switch camera (front/back)
   */
  async switchCamera(): Promise<void> {
    try {
      if (!this.localVideoTrack) {
        throw new Error('Camera is not enabled');
      }

      await this.localVideoTrack.switchCamera();
      console.log('Camera switched');
    } catch (error) {
      console.error('Failed to switch camera:', error);
      throw error;
    }
  }

  /**
   * Get all participants in room
   */
  getParticipants(): CallParticipant[] {
    if (!this.room) return [];

    const participants: CallParticipant[] = [];

    // Add local participant
    participants.push(this.participantToCallParticipant(this.room.localParticipant));

    // Add remote participants
    this.room.participants.forEach((participant: ParticipantType) => {
      participants.push(this.participantToCallParticipant(participant));
    });

    return participants;
  }

  /**
   * Get call statistics
   */
  getCallStats(): CallStats {
    if (!this.room || !this.callStartTime) {
      return {
        duration: 0,
        participantCount: 0,
        networkQuality: 'disconnected',
        bitrate: 0,
        fps: 0,
      };
    }

    const duration = Math.floor((new Date().getTime() - this.callStartTime.getTime()) / 1000);
    const participantCount = this.room.participants.size + 1; // +1 for local participant

    return {
      duration,
      participantCount,
      networkQuality: 'good', // TODO: Implement actual quality detection
      bitrate: 0, // TODO: Get from LiveKit stats
      fps: 0, // TODO: Get from LiveKit stats
    };
  }

  /**
   * Disconnect from call
   */
  async disconnect(): Promise<void> {
    try {
      // Disable camera and microphone
      if (this.localVideoTrack) {
        await this.disableCamera();
      }
      if (this.localAudioTrack) {
        await this.disableMicrophone();
      }

      // Disconnect from room
      if (this.room) {
        await this.room.disconnect();
        this.room = null;
      }

      // Notify backend
      if (this.callStartTime) {
        const callDuration = Math.floor((new Date().getTime() - this.callStartTime.getTime()) / 1000);
        await this.notifyCallEnded(callDuration);
      }

      this.callStartTime = null;

      console.log('Disconnected from call');
    } catch (error) {
      console.error('Failed to disconnect:', error);
      throw error;
    }
  }

  /**
   * Notify backend that call ended
   */
  private async notifyCallEnded(duration: number): Promise<void> {
    try {
      await apiFetch('/video/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration }),
      });
    } catch (error) {
      console.error('Failed to notify call ended:', error);
      // Don't throw - this is a non-critical operation
    }
  }

  /**
   * Get current room
   */
  getRoom(): Room | null {
    return this.room;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.room !== null && this.room.state === 'connected';
  }
}

// Export singleton instance
export const videoCallService = new VideoCallService();
