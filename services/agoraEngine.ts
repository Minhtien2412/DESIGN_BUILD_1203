/**
 * Agora RTC Engine Manager
 * Wrapper around react-native-agora for easier usage
 * 
 * ⚠️ NOTE: This requires react-native-agora package
 * Install: npm install react-native-agora
 * 
 * Requires native build - does NOT work with Expo Go
 */

// Type definitions for when package is installed
type RtcEngine = any;
type ChannelProfile = number;
type ClientRole = number;

/**
 * Agora engine configuration
 */
export interface AgoraConfig {
  appId: string;
  channelName: string;
  token: string;
  uid: number;
}

/**
 * Agora event callbacks
 */
export interface AgoraEventHandlers {
  onJoinChannelSuccess?: (channel: string, uid: number, elapsed: number) => void;
  onUserJoined?: (uid: number, elapsed: number) => void;
  onUserOffline?: (uid: number, reason: number) => void;
  onError?: (error: number) => void;
  onWarning?: (warning: number) => void;
  onLeaveChannel?: (stats: any) => void;
  onRemoteVideoStateChanged?: (uid: number, state: number, reason: number, elapsed: number) => void;
  onRemoteAudioStateChanged?: (uid: number, state: number, reason: number, elapsed: number) => void;
  onConnectionStateChanged?: (state: number, reason: number) => void;
}

/**
 * Agora RTC Engine Manager
 * Singleton class to manage Agora engine lifecycle
 */
class AgoraEngineManager {
  private static instance: AgoraEngineManager;
  private engine: RtcEngine | null = null;
  private isInitialized: boolean = false;
  private currentChannel: string | null = null;
  private currentUid: number | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): AgoraEngineManager {
    if (!AgoraEngineManager.instance) {
      AgoraEngineManager.instance = new AgoraEngineManager();
    }
    return AgoraEngineManager.instance;
  }

  /**
   * Initialize Agora engine
   * 
   * @param appId - Agora App ID
   * @returns Promise that resolves when initialized
   */
  public async initialize(appId: string): Promise<void> {
    if (this.isInitialized && this.engine) {
      console.log('⚠️ Agora engine already initialized');
      return;
    }

    try {
      // Dynamic import to avoid errors when package not installed
      const AgoraRTC = require('react-native-agora');
      
      // Create engine instance
      this.engine = await AgoraRTC.createAgoraRtcEngine();
      
      // Initialize with App ID
      await this.engine.initialize({
        appId,
        channelProfile: 0, // CHANNEL_PROFILE_COMMUNICATION
      });

      this.isInitialized = true;
      console.log('✅ Agora engine initialized with App ID:', appId);
    } catch (error) {
      console.error('❌ Failed to initialize Agora engine:', error);
      throw new Error('Không thể khởi tạo engine video call. Vui lòng kiểm tra cài đặt.');
    }
  }

  /**
   * Set event handlers
   */
  public setEventHandlers(handlers: AgoraEventHandlers): void {
    if (!this.engine) {
      console.error('❌ Engine not initialized');
      return;
    }

    try {
      // Register event handlers
      if (handlers.onJoinChannelSuccess) {
        this.engine.addListener('onJoinChannelSuccess', handlers.onJoinChannelSuccess);
      }
      if (handlers.onUserJoined) {
        this.engine.addListener('onUserJoined', handlers.onUserJoined);
      }
      if (handlers.onUserOffline) {
        this.engine.addListener('onUserOffline', handlers.onUserOffline);
      }
      if (handlers.onError) {
        this.engine.addListener('onError', handlers.onError);
      }
      if (handlers.onWarning) {
        this.engine.addListener('onWarning', handlers.onWarning);
      }
      if (handlers.onLeaveChannel) {
        this.engine.addListener('onLeaveChannel', handlers.onLeaveChannel);
      }
      if (handlers.onRemoteVideoStateChanged) {
        this.engine.addListener('onRemoteVideoStateChanged', handlers.onRemoteVideoStateChanged);
      }
      if (handlers.onRemoteAudioStateChanged) {
        this.engine.addListener('onRemoteAudioStateChanged', handlers.onRemoteAudioStateChanged);
      }
      if (handlers.onConnectionStateChanged) {
        this.engine.addListener('onConnectionStateChanged', handlers.onConnectionStateChanged);
      }

      console.log('✅ Event handlers registered');
    } catch (error) {
      console.error('❌ Failed to set event handlers:', error);
    }
  }

  /**
   * Remove all event handlers
   */
  public removeAllListeners(): void {
    if (!this.engine) return;

    try {
      this.engine.removeAllListeners();
      console.log('✅ All event handlers removed');
    } catch (error) {
      console.error('❌ Failed to remove listeners:', error);
    }
  }

  /**
   * Join a channel
   * 
   * @param config - Channel configuration
   * @returns Promise that resolves when joined
   */
  public async joinChannel(config: AgoraConfig): Promise<void> {
    if (!this.engine || !this.isInitialized) {
      throw new Error('Engine not initialized. Call initialize() first.');
    }

    try {
      const { channelName, token, uid } = config;

      // Enable video module
      await this.engine.enableVideo();

      // Set client role as broadcaster (can send and receive)
      await this.engine.setClientRole(1); // CLIENT_ROLE_BROADCASTER

      // Join channel with token
      await this.engine.joinChannel(token, channelName, uid, {
        clientRoleType: 1, // CLIENT_ROLE_BROADCASTER
      });

      this.currentChannel = channelName;
      this.currentUid = uid;

      console.log('✅ Joined channel:', {
        channelName,
        uid,
      });
    } catch (error) {
      console.error('❌ Failed to join channel:', error);
      throw new Error('Không thể tham gia cuộc gọi. Vui lòng thử lại.');
    }
  }

  /**
   * Leave current channel
   */
  public async leaveChannel(): Promise<void> {
    if (!this.engine) {
      console.error('❌ Engine not initialized');
      return;
    }

    try {
      await this.engine.leaveChannel();
      
      console.log('✅ Left channel:', this.currentChannel);
      
      this.currentChannel = null;
      this.currentUid = null;
    } catch (error) {
      console.error('❌ Failed to leave channel:', error);
    }
  }

  /**
   * Enable local video
   */
  public async enableVideo(): Promise<void> {
    if (!this.engine) throw new Error('Engine not initialized');
    
    try {
      await this.engine.enableVideo();
      await this.engine.startPreview();
      console.log('✅ Video enabled');
    } catch (error) {
      console.error('❌ Failed to enable video:', error);
      throw error;
    }
  }

  /**
   * Disable local video
   */
  public async disableVideo(): Promise<void> {
    if (!this.engine) throw new Error('Engine not initialized');
    
    try {
      await this.engine.stopPreview();
      await this.engine.disableVideo();
      console.log('✅ Video disabled');
    } catch (error) {
      console.error('❌ Failed to disable video:', error);
      throw error;
    }
  }

  /**
   * Enable local audio
   */
  public async enableAudio(): Promise<void> {
    if (!this.engine) throw new Error('Engine not initialized');
    
    try {
      await this.engine.enableAudio();
      console.log('✅ Audio enabled');
    } catch (error) {
      console.error('❌ Failed to enable audio:', error);
      throw error;
    }
  }

  /**
   * Disable local audio
   */
  public async disableAudio(): Promise<void> {
    if (!this.engine) throw new Error('Engine not initialized');
    
    try {
      await this.engine.disableAudio();
      console.log('✅ Audio disabled');
    } catch (error) {
      console.error('❌ Failed to disable audio:', error);
      throw error;
    }
  }

  /**
   * Mute local audio
   */
  public async muteLocalAudio(muted: boolean): Promise<void> {
    if (!this.engine) throw new Error('Engine not initialized');
    
    try {
      await this.engine.muteLocalAudioStream(muted);
      console.log(`✅ Local audio ${muted ? 'muted' : 'unmuted'}`);
    } catch (error) {
      console.error('❌ Failed to mute local audio:', error);
      throw error;
    }
  }

  /**
   * Mute local video
   */
  public async muteLocalVideo(muted: boolean): Promise<void> {
    if (!this.engine) throw new Error('Engine not initialized');
    
    try {
      await this.engine.muteLocalVideoStream(muted);
      console.log(`✅ Local video ${muted ? 'muted' : 'unmuted'}`);
    } catch (error) {
      console.error('❌ Failed to mute local video:', error);
      throw error;
    }
  }

  /**
   * Switch camera (front/back)
   */
  public async switchCamera(): Promise<void> {
    if (!this.engine) throw new Error('Engine not initialized');
    
    try {
      await this.engine.switchCamera();
      console.log('✅ Camera switched');
    } catch (error) {
      console.error('❌ Failed to switch camera:', error);
      throw error;
    }
  }

  /**
   * Set speaker volume
   */
  public async setSpeakerVolume(volume: number): Promise<void> {
    if (!this.engine) throw new Error('Engine not initialized');
    
    try {
      await this.engine.adjustPlaybackSignalVolume(volume);
      console.log('✅ Speaker volume set:', volume);
    } catch (error) {
      console.error('❌ Failed to set speaker volume:', error);
      throw error;
    }
  }

  /**
   * Enable speaker (audio output)
   */
  public async enableSpeaker(enabled: boolean): Promise<void> {
    if (!this.engine) throw new Error('Engine not initialized');
    
    try {
      await this.engine.setEnableSpeakerphone(enabled);
      console.log(`✅ Speaker ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('❌ Failed to toggle speaker:', error);
      throw error;
    }
  }

  /**
   * Get current channel name
   */
  public getCurrentChannel(): string | null {
    return this.currentChannel;
  }

  /**
   * Get current UID
   */
  public getCurrentUid(): number | null {
    return this.currentUid;
  }

  /**
   * Check if engine is initialized
   */
  public isEngineInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Destroy engine and cleanup
   */
  public async destroy(): Promise<void> {
    if (!this.engine) {
      console.log('⚠️ Engine already destroyed');
      return;
    }

    try {
      // Leave channel if in one
      if (this.currentChannel) {
        await this.leaveChannel();
      }

      // Remove listeners
      this.removeAllListeners();

      // Destroy engine
      await this.engine.release();

      this.engine = null;
      this.isInitialized = false;
      this.currentChannel = null;
      this.currentUid = null;

      console.log('✅ Agora engine destroyed');
    } catch (error) {
      console.error('❌ Failed to destroy engine:', error);
    }
  }
}

// Export singleton instance
export const agoraEngine = AgoraEngineManager.getInstance();
