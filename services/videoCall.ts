/**
 * Stub VideoCallManager used in Expo Go builds where native WebRTC modules
 * are unavailable. The full implementation lives in videoCall.ts.disabled.
 *
 * When you generate a native development build (via expo prebuild), rename
 * videoCall.ts.disabled back to videoCall.ts and delete this stub.
 */

export interface VideoCallUser {
  id: string;
  displayName: string;
  role: 'host' | 'participant';
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  stream?: MediaStream | null;
}

export interface VideoCallRoom {
  roomId: string;
  participants: VideoCallUser[];
  startTime: number;
  endTime?: number;
  duration?: number;
  callType: 'video' | 'audio';
  status: 'active' | 'ended';
}

export class VideoCallManager {
  constructor(_serverUrl?: string) {
     console.warn('[VideoCallManager] Stub active - WebRTC disabled in Expo Go');
  }

  async joinRoom(_roomId: string, _userId: string, _displayName: string): Promise<void> {
    throw new Error('Video calls require a native build. Use /call-simple in Expo Go.');
  }

  async leaveRoom(): Promise<void> {
    console.warn('[VideoCallManager] leaveRoom noop in stub');
  }

  async toggleVideo(): Promise<void> {
    console.warn('[VideoCallManager] toggleVideo noop in stub');
  }

  async toggleAudio(): Promise<void> {
    console.warn('[VideoCallManager] toggleAudio noop in stub');
  }

  async switchCamera(): Promise<void> {
    console.warn('[VideoCallManager] switchCamera noop in stub');
  }

  getLocalStream(): MediaStream | null {
    return null;
  }

  getRemoteStreams(): VideoCallUser[] {
    return [];
  }

  isConnected(): boolean {
    return false;
  }

  getCurrentRoom(): VideoCallRoom | null {
    return null;
  }

  destroy(): void {
    console.warn('[VideoCallManager] destroy noop in stub');
  }

  public onUserJoined?: (user: VideoCallUser) => void;
  public onUserLeft?: (userId: string) => void;
  public onRoomEnded?: () => void;
  public onError?: (error: Error) => void;
  public onConnectionStateChange?: (state: string) => void;
}

export default VideoCallManager;
