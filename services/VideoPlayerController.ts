/**
 * VideoPlayerController - Singleton để quản lý playback của videos
 * 
 * Đảm bảo:
 * - Chỉ 1 video phát tại 1 thời điểm
 * - Lưu trữ timestamp khi pause
 * - Global mute/unmute control
 * - Persist mute setting
 * 
 * @see PRODUCT_BACKLOG.md VIDEO-001
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { VideoPlayer } from 'expo-video';

const MUTE_SETTING_KEY = '@video_player_muted';
const PLAYBACK_POSITIONS_KEY = '@video_playback_positions';

export interface PlaybackPosition {
  videoId: string;
  position: number; // seconds
  lastUpdated: number; // timestamp
}

export interface VideoPlayerState {
  activeVideoId: string | null;
  isMuted: boolean;
  volume: number;
  playbackPositions: Map<string, PlaybackPosition>;
}

type PlayerInstance = {
  id: string;
  player: VideoPlayer;
  onPause?: () => void;
  onResume?: () => void;
};

type StateChangeCallback = (state: VideoPlayerState) => void;

class VideoPlayerControllerClass {
  private static instance: VideoPlayerControllerClass;
  
  private activeVideoId: string | null = null;
  private isMuted: boolean = false;
  private volume: number = 1.0;
  private players: Map<string, PlayerInstance> = new Map();
  private playbackPositions: Map<string, PlaybackPosition> = new Map();
  private stateListeners: Set<StateChangeCallback> = new Set();
  private isInitialized: boolean = false;

  private constructor() {
    // Private constructor for singleton
    this.initialize();
  }

  static getInstance(): VideoPlayerControllerClass {
    if (!VideoPlayerControllerClass.instance) {
      VideoPlayerControllerClass.instance = new VideoPlayerControllerClass();
    }
    return VideoPlayerControllerClass.instance;
  }

  /**
   * Initialize controller - load persisted settings
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load mute setting
      const muteSetting = await AsyncStorage.getItem(MUTE_SETTING_KEY);
      if (muteSetting !== null) {
        this.isMuted = muteSetting === 'true';
      }

      // Load playback positions
      const positions = await AsyncStorage.getItem(PLAYBACK_POSITIONS_KEY);
      if (positions) {
        const parsed = JSON.parse(positions) as PlaybackPosition[];
        // Only restore positions from last 24 hours
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        parsed.forEach(pos => {
          if (pos.lastUpdated > oneDayAgo) {
            this.playbackPositions.set(pos.videoId, pos);
          }
        });
      }

      this.isInitialized = true;
      console.log('[VideoPlayerController] Initialized', {
        isMuted: this.isMuted,
        savedPositions: this.playbackPositions.size
      });
    } catch (error) {
      console.error('[VideoPlayerController] Init error:', error);
      this.isInitialized = true;
    }
  }

  /**
   * Register a video player instance
   */
  registerPlayer(
    videoId: string, 
    player: VideoPlayer,
    callbacks?: { onPause?: () => void; onResume?: () => void }
  ): void {
    this.players.set(videoId, {
      id: videoId,
      player,
      onPause: callbacks?.onPause,
      onResume: callbacks?.onResume,
    });

    // Apply current mute setting
    player.muted = this.isMuted;
    player.volume = this.volume;

    console.log('[VideoPlayerController] Registered player:', videoId);
  }

  /**
   * Unregister a video player instance
   */
  unregisterPlayer(videoId: string): void {
    const instance = this.players.get(videoId);
    if (instance) {
      // Save position before unregistering
      this.savePlaybackPosition(videoId, instance.player.currentTime);
      this.players.delete(videoId);
      
      if (this.activeVideoId === videoId) {
        this.activeVideoId = null;
      }
      
      console.log('[VideoPlayerController] Unregistered player:', videoId);
    }
  }

  /**
   * Play a specific video - pauses all others
   */
  play(videoId: string): void {
    // Pause the currently active video first
    if (this.activeVideoId && this.activeVideoId !== videoId) {
      this.pauseVideo(this.activeVideoId);
    }

    const instance = this.players.get(videoId);
    if (instance) {
      // Restore position if available
      const savedPosition = this.playbackPositions.get(videoId);
      if (savedPosition && savedPosition.position > 0) {
        instance.player.currentTime = savedPosition.position;
      }

      instance.player.play();
      this.activeVideoId = videoId;
      instance.onResume?.();
      
      this.notifyStateChange();
      console.log('[VideoPlayerController] Playing:', videoId);
    }
  }

  /**
   * Pause a specific video
   */
  pause(videoId: string): void {
    this.pauseVideo(videoId);
    if (this.activeVideoId === videoId) {
      this.activeVideoId = null;
    }
    this.notifyStateChange();
  }

  /**
   * Pause all videos
   */
  pauseAll(): void {
    this.players.forEach((instance, id) => {
      this.pauseVideo(id);
    });
    this.activeVideoId = null;
    this.notifyStateChange();
  }

  private pauseVideo(videoId: string): void {
    const instance = this.players.get(videoId);
    if (instance) {
      // Save current position
      this.savePlaybackPosition(videoId, instance.player.currentTime);
      instance.player.pause();
      instance.onPause?.();
      console.log('[VideoPlayerController] Paused:', videoId);
    }
  }

  /**
   * Toggle mute for all videos
   */
  async toggleMute(): Promise<boolean> {
    this.isMuted = !this.isMuted;
    
    // Apply to all registered players
    this.players.forEach(instance => {
      instance.player.muted = this.isMuted;
    });

    // Persist setting
    try {
      await AsyncStorage.setItem(MUTE_SETTING_KEY, String(this.isMuted));
    } catch (error) {
      console.error('[VideoPlayerController] Failed to save mute setting:', error);
    }

    this.notifyStateChange();
    console.log('[VideoPlayerController] Mute toggled:', this.isMuted);
    return this.isMuted;
  }

  /**
   * Set mute state explicitly
   */
  async setMuted(muted: boolean): Promise<void> {
    this.isMuted = muted;
    
    this.players.forEach(instance => {
      instance.player.muted = muted;
    });

    try {
      await AsyncStorage.setItem(MUTE_SETTING_KEY, String(muted));
    } catch (error) {
      console.error('[VideoPlayerController] Failed to save mute setting:', error);
    }

    this.notifyStateChange();
  }

  /**
   * Set global volume (0.0 - 1.0)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    
    this.players.forEach(instance => {
      instance.player.volume = this.volume;
    });

    this.notifyStateChange();
  }

  /**
   * Get saved playback position for a video
   */
  getPlaybackPosition(videoId: string): number {
    const position = this.playbackPositions.get(videoId);
    return position?.position || 0;
  }

  /**
   * Save playback position
   */
  private async savePlaybackPosition(videoId: string, position: number): Promise<void> {
    if (!videoId || position <= 0) return;

    this.playbackPositions.set(videoId, {
      videoId,
      position,
      lastUpdated: Date.now()
    });

    // Persist to storage (debounced in real implementation)
    try {
      const positions = Array.from(this.playbackPositions.values());
      await AsyncStorage.setItem(PLAYBACK_POSITIONS_KEY, JSON.stringify(positions));
    } catch (error) {
      console.error('[VideoPlayerController] Failed to save positions:', error);
    }
  }

  /**
   * Clear saved position for a video (e.g., when video finishes)
   */
  async clearPlaybackPosition(videoId: string): Promise<void> {
    this.playbackPositions.delete(videoId);
    
    try {
      const positions = Array.from(this.playbackPositions.values());
      await AsyncStorage.setItem(PLAYBACK_POSITIONS_KEY, JSON.stringify(positions));
    } catch (error) {
      console.error('[VideoPlayerController] Failed to clear position:', error);
    }
  }

  /**
   * Get current state
   */
  getState(): VideoPlayerState {
    return {
      activeVideoId: this.activeVideoId,
      isMuted: this.isMuted,
      volume: this.volume,
      playbackPositions: new Map(this.playbackPositions),
    };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: StateChangeCallback): () => void {
    this.stateListeners.add(callback);
    // Immediately call with current state
    callback(this.getState());
    
    return () => {
      this.stateListeners.delete(callback);
    };
  }

  private notifyStateChange(): void {
    const state = this.getState();
    this.stateListeners.forEach(callback => callback(state));
  }

  /**
   * Check if a video is currently active/playing
   */
  isPlaying(videoId: string): boolean {
    return this.activeVideoId === videoId;
  }

  /**
   * Get mute state
   */
  getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Get volume
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Get active video ID
   */
  getActiveVideoId(): string | null {
    return this.activeVideoId;
  }
}

// Export singleton instance
export const VideoPlayerController = VideoPlayerControllerClass.getInstance();

// Export class for testing
export { VideoPlayerControllerClass };
