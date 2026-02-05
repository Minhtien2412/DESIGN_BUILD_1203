/**
 * Audio Wrapper Utility
 * =====================
 *
 * Provides a unified API for audio playback and recording.
 * Uses expo-audio for SDK 54+.
 */

import {
    AudioModule,
    createAudioPlayer,
    AudioPlayer as ExpoAudioPlayer,
    RecordingPresets,
    requestRecordingPermissionsAsync,
    setAudioModeAsync,
    type AudioStatus,
    type AudioRecorder as ExpoAudioRecorder,
} from "expo-audio";

// ============================================================================
// Types
// ============================================================================

export interface AudioPlaybackOptions {
  uri: string;
  shouldPlay?: boolean;
  isLooping?: boolean;
  volume?: number;
  rate?: number;
  isMuted?: boolean;
  progressUpdateIntervalMillis?: number;
  onPlaybackStatusUpdate?: (status: AudioPlaybackStatus) => void;
}

export interface AudioPlaybackStatus {
  isLoaded: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  isMuted: boolean;
  volume: number;
  rate: number;
  positionMillis: number;
  durationMillis: number | undefined;
  didJustFinish: boolean;
  error?: string;
}

export interface AudioRecordingOptions {
  onRecordingStatusUpdate?: (status: AudioRecordingStatus) => void;
  maxDuration?: number;
}

export interface AudioRecordingStatus {
  isRecording: boolean;
  durationMillis: number;
  metering?: number;
  error?: string;
}

// ============================================================================
// Audio Player Class
// ============================================================================

export class AudioPlayer {
  private player: ExpoAudioPlayer | null = null;
  private options: AudioPlaybackOptions;
  private subscription: { remove: () => void } | null = null;

  constructor(options: AudioPlaybackOptions) {
    this.options = options;
  }

  /**
   * Load the audio file
   */
  async load(): Promise<boolean> {
    try {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: "duckOthers",
        shouldRouteThroughEarpiece: false,
      });

      const player = createAudioPlayer(
        { uri: this.options.uri },
        {
          updateInterval: this.options.progressUpdateIntervalMillis ?? 500,
          keepAudioSessionActive: false,
        },
      );

      player.loop = this.options.isLooping ?? false;
      player.muted = this.options.isMuted ?? false;
      player.volume = this.options.volume ?? 1;
      player.setPlaybackRate(this.options.rate ?? 1);

      this.player = player;
      this.subscription = player.addListener(
        "playbackStatusUpdate",
        this.handleStatusUpdate,
      );

      if (this.options.shouldPlay) {
        player.play();
      }

      return true;
    } catch (error) {
      console.error("[AudioPlayer] Load error:", error);
      return false;
    }
  }

  private handleStatusUpdate = (status: AudioStatus) => {
    if (this.options.onPlaybackStatusUpdate) {
      const normalizedStatus = this.normalizeStatus(status);
      this.options.onPlaybackStatusUpdate(normalizedStatus);
    }
  };

  private normalizeStatus(status: AudioStatus): AudioPlaybackStatus {
    return {
      isLoaded: status.isLoaded,
      isPlaying: status.playing,
      isBuffering: status.isBuffering,
      isMuted: status.mute,
      volume: this.player?.volume ?? 1,
      rate: status.playbackRate ?? 1,
      positionMillis: status.currentTime * 1000,
      durationMillis: status.duration ? status.duration * 1000 : undefined,
      didJustFinish: status.didJustFinish ?? false,
    };
  }

  /**
   * Play audio
   */
  async play(): Promise<void> {
    if (!this.player) {
      await this.load();
    }
    this.player?.play();
  }

  /**
   * Pause audio
   */
  async pause(): Promise<void> {
    this.player?.pause();
  }

  /**
   * Stop audio and reset position
   */
  async stop(): Promise<void> {
    if (!this.player) return;
    this.player.pause();
    this.player.currentTime = 0;
  }

  /**
   * Seek to position in milliseconds
   */
  async seekTo(positionMillis: number): Promise<void> {
    if (!this.player) return;
    await this.player.seekTo(positionMillis / 1000);
  }

  /**
   * Set volume (0-1)
   */
  async setVolume(volume: number): Promise<void> {
    if (!this.player) return;
    this.player.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Set playback rate
   */
  async setRate(rate: number, shouldCorrectPitch = true): Promise<void> {
    if (!this.player) return;
    this.player.shouldCorrectPitch = shouldCorrectPitch;
    this.player.setPlaybackRate(rate);
  }

  /**
   * Set muted state
   */
  async setMuted(muted: boolean): Promise<void> {
    if (!this.player) return;
    this.player.muted = muted;
  }

  /**
   * Get current status
   */
  async getStatus(): Promise<AudioPlaybackStatus | null> {
    if (!this.player) return null;
    return this.normalizeStatus(this.player.currentStatus);
  }

  /**
   * Unload and cleanup
   */
  async unload(): Promise<void> {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    if (this.player) {
      this.player.remove();
      this.player = null;
    }
  }
}

// ============================================================================
// Audio Recorder Class
// ============================================================================

export class AudioRecorder {
  private recorder: ExpoAudioRecorder | null = null;
  private options: AudioRecordingOptions;
  private durationInterval: ReturnType<typeof setInterval> | null = null;
  private currentDuration = 0;

  constructor(options: AudioRecordingOptions = {}) {
    this.options = options;
  }

  /**
   * Request microphone permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await requestRecordingPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("[AudioRecorder] Permission error:", error);
      return false;
    }
  }

  /**
   * Start recording
   */
  async start(): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn("[AudioRecorder] No permission");
        return false;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: "doNotMix",
        shouldRouteThroughEarpiece: false,
      });

      if (this.recorder) {
        await this.recorder.stop();
      }

      // eslint-disable-next-line import/namespace -- AudioRecorder is a valid class in expo-audio SDK 54
      const recorder = new AudioModule.AudioRecorder(
        RecordingPresets.HIGH_QUALITY,
      );
      await recorder.prepareToRecordAsync();
      recorder.record();

      this.recorder = recorder;
      this.currentDuration = 0;

      this.durationInterval = setInterval(() => {
        if (!this.recorder) return;
        const status = this.recorder.getStatus();
        this.currentDuration = status.durationMillis;

        if (this.options.onRecordingStatusUpdate) {
          this.options.onRecordingStatusUpdate({
            isRecording: true,
            durationMillis: this.currentDuration,
          });
        }

        if (
          this.options.maxDuration &&
          this.currentDuration >= this.options.maxDuration * 1000
        ) {
          this.stop();
        }
      }, 100);

      return true;
    } catch (error) {
      console.error("[AudioRecorder] Start error:", error);
      return false;
    }
  }

  /**
   * Stop recording and get the URI
   */
  async stop(): Promise<string | null> {
    try {
      if (this.durationInterval) {
        clearInterval(this.durationInterval);
        this.durationInterval = null;
      }

      if (!this.recorder) return null;

      await this.recorder.stop();

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      const uri = this.recorder.uri;

      if (this.options.onRecordingStatusUpdate) {
        this.options.onRecordingStatusUpdate({
          isRecording: false,
          durationMillis: this.currentDuration,
        });
      }

      return uri || null;
    } catch (error) {
      console.error("[AudioRecorder] Stop error:", error);
      return null;
    }
  }

  /**
   * Cancel and discard recording
   */
  async cancel(): Promise<void> {
    try {
      if (this.durationInterval) {
        clearInterval(this.durationInterval);
        this.durationInterval = null;
      }

      if (this.recorder) {
        await this.recorder.stop();
        this.recorder = null;
      }

      this.currentDuration = 0;
    } catch (error) {
      console.error("[AudioRecorder] Cancel error:", error);
    }
  }

  /**
   * Get recording URI (after stopping)
   */
  getUri(): string | null {
    return this.recorder?.uri ?? null;
  }

  /**
   * Get current duration in milliseconds
   */
  getDuration(): number {
    return this.currentDuration;
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Play a sound once (fire and forget)
 */
export async function playSound(uri: string, volume = 1): Promise<void> {
  try {
    const player = createAudioPlayer({ uri }, { updateInterval: 500 });
    player.volume = volume;
    player.play();

    const subscription = player.addListener(
      "playbackStatusUpdate",
      (status) => {
        if (status.didJustFinish) {
          subscription.remove();
          player.remove();
        }
      },
    );
  } catch (error) {
    console.error("[playSound] Error:", error);
  }
}

/**
 * Play a local asset sound
 */
export async function playLocalSound(
  source: number, // require('./sound.mp3')
  volume = 1,
): Promise<void> {
  try {
    const player = createAudioPlayer(source, { updateInterval: 500 });
    player.volume = volume;
    player.play();

    const subscription = player.addListener(
      "playbackStatusUpdate",
      (status) => {
        if (status.didJustFinish) {
          subscription.remove();
          player.remove();
        }
      },
    );
  } catch (error) {
    console.error("[playLocalSound] Error:", error);
  }
}

export default {
  AudioPlayer,
  AudioRecorder,
  playSound,
  playLocalSound,
};
