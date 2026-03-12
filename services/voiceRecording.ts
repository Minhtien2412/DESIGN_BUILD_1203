/**
 * Voice Recording Service
 * Record and send voice messages in chat
 */

import {
    AudioModule,
    AudioPlayer,
    RecordingPresets,
    createAudioPlayer,
    requestRecordingPermissionsAsync,
    setAudioModeAsync,
    type AudioRecorder,
    type RecordingOptions,
} from "expo-audio";
import * as FileSystem from "expo-file-system";

export interface VoiceRecordingOptions {
  maxDuration?: number; // milliseconds
  quality?: "low" | "medium" | "high";
}

export interface VoiceRecording {
  uri: string;
  duration: number;
  size: number;
  mimeType: string;
}

class VoiceRecorder {
  private recording: AudioRecorder | null = null;
  private isRecording = false;
  private startTime: number = 0;

  /**
   * Request microphone permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      const { status } = await requestRecordingPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Failed to request microphone permission:", error);
      return false;
    }
  }

  /**
   * Start recording
   */
  async startRecording(options: VoiceRecordingOptions = {}): Promise<void> {
    if (this.isRecording) {
      throw new Error("Already recording");
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      throw new Error("Microphone permission not granted");
    }

    try {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        interruptionMode: "doNotMix",
        shouldPlayInBackground: false,
        shouldRouteThroughEarpiece: false,
      });

      const recordingOptions = this.getRecordingOptions(
        options.quality || "medium",
      );

      // eslint-disable-next-line import/namespace -- AudioRecorder is a valid class in expo-audio SDK 54
      const recorder = new AudioModule.AudioRecorder(recordingOptions);
      await recorder.prepareToRecordAsync();
      recorder.record();

      this.recording = recorder;
      this.isRecording = true;
      this.startTime = Date.now();

      if (options.maxDuration) {
        setTimeout(() => {
          if (this.isRecording) {
            this.stopRecording();
          }
        }, options.maxDuration);
      }
    } catch (error) {
      console.error("Failed to start recording:", error);
      throw error;
    }
  }

  /**
   * Stop recording
   */
  async stopRecording(): Promise<VoiceRecording> {
    if (!this.recording || !this.isRecording) {
      throw new Error("Not currently recording");
    }

    try {
      await this.recording.stop();
      const uri = this.recording.uri;

      if (!uri) {
        throw new Error("Recording URI not available");
      }

      const status = this.recording.getStatus();
      const duration = status.durationMillis || Date.now() - this.startTime;

      const fileInfo = await FileSystem.getInfoAsync(uri);

      const result: VoiceRecording = {
        uri,
        duration,
        size: fileInfo.exists ? fileInfo.size || 0 : 0,
        mimeType: "audio/m4a",
      };

      this.recording = null;
      this.isRecording = false;
      this.startTime = 0;

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      return result;
    } catch (error) {
      console.error("Failed to stop recording:", error);
      throw error;
    }
  }

  /**
   * Cancel recording (discard audio)
   */
  async cancelRecording(): Promise<void> {
    if (!this.recording || !this.isRecording) {
      return;
    }

    try {
      await this.recording.stop();
      const uri = this.recording.uri;

      if (uri) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }

      this.recording = null;
      this.isRecording = false;
      this.startTime = 0;

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
    } catch (error) {
      console.error("Failed to cancel recording:", error);
    }
  }

  /**
   * Get current recording duration
   */
  getCurrentDuration(): number {
    if (!this.isRecording) return 0;
    return Date.now() - this.startTime;
  }

  /**
   * Check if currently recording
   */
  getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Get recording options based on quality
   */
  private getRecordingOptions(
    quality: "low" | "medium" | "high",
  ): RecordingOptions {
    const base =
      quality === "low"
        ? RecordingPresets.LOW_QUALITY
        : RecordingPresets.HIGH_QUALITY;

    if (quality !== "medium") {
      return {
        ...base,
        android: { ...base.android },
        ios: { ...base.ios },
        web: { ...base.web },
      };
    }

    // Medium quality: between LOW and HIGH
    return {
      ...base,
      bitRate: 96000,
      android: { ...base.android },
      ios: { ...base.ios },
      web: {
        ...base.web,
        bitsPerSecond: 96000,
      },
    };
  }
}

// Export singleton instance
export const voiceRecorder = new VoiceRecorder();

/**
 * Play a voice recording
 */
export async function playVoiceRecording(uri: string): Promise<AudioPlayer> {
  try {
    const player = createAudioPlayer({ uri }, { updateInterval: 500 });
    player.play();
    return player;
  } catch (error) {
    console.error("Failed to play voice recording:", error);
    throw error;
  }
}

/**
 * Format duration for display (mm:ss)
 */
export function formatVoiceDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
