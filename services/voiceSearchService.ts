/**
 * Voice Search Service
 * Handles voice recording, transcription via API, and voice search functionality
 * Uses OpenAI Whisper via backend for accurate speech-to-text
 * @author AI Assistant
 * @date 2025-01-13
 */

import {
    AudioModule,
    type AudioRecorder,
    getRecordingPermissionsAsync,
    RecordingPresets,
    requestRecordingPermissionsAsync,
    setAudioModeAsync,
} from "expo-audio";
import * as FileSystem from "expo-file-system";
import { apiFetch } from "./api";

// =====================================================
// TYPES & INTERFACES
// =====================================================

export interface VoiceSearchConfig {
  language?: string;
  category?: string;
  maxRecordingDuration?: number; // in milliseconds
}

export interface TranscribeResult {
  success: boolean;
  text?: string;
  confidence?: number;
  error?: string;
  processingTimeMs?: number;
}

export interface VoiceSearchResult {
  success: boolean;
  query?: string;
  confidence?: number;
  suggestions?: string[];
  intent?: string;
  category?: string;
  error?: string;
  processingTimeMs?: number;
}

export type VoiceRecordingState = "idle" | "recording" | "processing" | "error";

export interface RecordingStatus {
  state: VoiceRecordingState;
  duration: number; // in milliseconds
  error?: string;
}

// =====================================================
// VOICE SEARCH SERVICE CLASS
// =====================================================

class VoiceSearchService {
  private recording: AudioRecorder | null = null;
  private recordingStartTime: number = 0;
  private stateListeners: Set<(status: RecordingStatus) => void> = new Set();
  private currentState: VoiceRecordingState = "idle";
  private durationInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Setup audio mode on initialization
    this.setupAudioMode();
  }

  // =====================================================
  // AUDIO SETUP
  // =====================================================

  private async setupAudioMode(): Promise<void> {
    try {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: "duckOthers",
        shouldRouteThroughEarpiece: false,
      });
    } catch (error) {
      console.warn("[VoiceSearch] Failed to setup audio mode:", error);
    }
  }

  // =====================================================
  // PERMISSION HANDLING
  // =====================================================

  async requestPermission(): Promise<boolean> {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      return granted;
    } catch (error) {
      console.error("[VoiceSearch] Permission request failed:", error);
      return false;
    }
  }

  async checkPermission(): Promise<boolean> {
    try {
      const { granted } = await getRecordingPermissionsAsync();
      return granted;
    } catch (error) {
      return false;
    }
  }

  // =====================================================
  // STATE MANAGEMENT
  // =====================================================

  private updateState(state: VoiceRecordingState, error?: string): void {
    this.currentState = state;
    const duration = this.recording ? Date.now() - this.recordingStartTime : 0;
    const status: RecordingStatus = { state, duration, error };
    this.stateListeners.forEach((listener) => listener(status));
  }

  addStateListener(listener: (status: RecordingStatus) => void): () => void {
    this.stateListeners.add(listener);
    // Immediately notify with current state
    listener({ state: this.currentState, duration: 0 });
    return () => this.stateListeners.delete(listener);
  }

  getState(): VoiceRecordingState {
    return this.currentState;
  }

  // =====================================================
  // RECORDING
  // =====================================================

  async startRecording(maxDuration: number = 30000): Promise<boolean> {
    try {
      // Check permission
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        this.updateState("error", "Quyền truy cập microphone bị từ chối");
        return false;
      }

      // Stop any existing recording
      if (this.recording) {
        await this.stopRecording();
      }

      await this.setupAudioMode();

      // Create and start recording with high quality for speech
      // eslint-disable-next-line import/namespace -- AudioRecorder is a valid class in expo-audio SDK 54
      const recorder = new AudioModule.AudioRecorder(
        RecordingPresets.HIGH_QUALITY,
      );
      await recorder.prepareToRecordAsync();
      recorder.record();

      this.recording = recorder;
      this.recordingStartTime = Date.now();
      this.updateState("recording");

      // Start duration timer
      this.durationInterval = setInterval(() => {
        if (this.currentState === "recording") {
          const duration = Date.now() - this.recordingStartTime;
          this.stateListeners.forEach((listener) =>
            listener({ state: "recording", duration }),
          );
        }
      }, 100);

      // Auto-stop after maxDuration
      if (maxDuration > 0) {
        setTimeout(() => {
          if (this.currentState === "recording") {
            console.log("[VoiceSearch] Max duration reached, stopping...");
            this.stopRecording();
          }
        }, maxDuration);
      }

      return true;
    } catch (error) {
      console.error("[VoiceSearch] Failed to start recording:", error);
      this.updateState("error", "Không thể bắt đầu ghi âm");
      return false;
    }
  }

  async stopRecording(): Promise<{
    uri: string | null;
    duration: number;
  }> {
    // Clear interval
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }

    if (!this.recording) {
      return { uri: null, duration: 0 };
    }

    try {
      const duration = Date.now() - this.recordingStartTime;
      await this.recording.stop();
      const uri = this.recording.uri;
      this.recording = null;

      return { uri, duration };
    } catch (error) {
      console.error("[VoiceSearch] Failed to stop recording:", error);
      this.recording = null;
      return { uri: null, duration: 0 };
    }
  }

  async cancelRecording(): Promise<void> {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }

    if (this.recording) {
      try {
        await this.recording.stop();
      } catch (error) {
        console.warn("[VoiceSearch] Error canceling recording:", error);
      }
      this.recording = null;
    }
    this.updateState("idle");
  }

  // =====================================================
  // TRANSCRIPTION (via API)
  // =====================================================

  async transcribeAudio(
    audioUri: string,
    language: string = "vi",
  ): Promise<TranscribeResult> {
    this.updateState("processing");

    try {
      // Read audio file as base64
      const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
        encoding: "base64",
      });

      // Determine mime type from URI
      const mimeType = this.getMimeTypeFromUri(audioUri);

      // Call API
      const response = await apiFetch("/v1/speech/transcribe", {
        method: "POST",
        body: JSON.stringify({
          audioBase64: base64Audio,
          mimeType,
          language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Transcription failed");
      }

      const data = await response.json();
      this.updateState("idle");

      return {
        success: true,
        text: data.text,
        confidence: data.confidence,
        processingTimeMs: data.processingTimeMs,
      };
    } catch (error) {
      console.error("[VoiceSearch] Transcription failed:", error);
      this.updateState("error", "Không thể chuyển đổi giọng nói");
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // =====================================================
  // VOICE SEARCH (Record + Transcribe + AI Enhancement)
  // =====================================================

  async performVoiceSearch(
    audioUri: string,
    config: VoiceSearchConfig = {},
  ): Promise<VoiceSearchResult> {
    this.updateState("processing");

    try {
      // Read audio file as base64
      const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
        encoding: "base64",
      });

      const mimeType = this.getMimeTypeFromUri(audioUri);

      // Call voice search API
      const response = await apiFetch("/v1/speech/voice-search", {
        method: "POST",
        body: JSON.stringify({
          audioBase64: base64Audio,
          mimeType,
          language: config.language || "vi",
          category: config.category,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Voice search failed");
      }

      const data = await response.json();
      this.updateState("idle");

      return {
        success: true,
        query: data.query,
        confidence: data.confidence,
        suggestions: data.suggestions,
        intent: data.intent,
        category: data.category,
        processingTimeMs: data.processingTimeMs,
      };
    } catch (error) {
      console.error("[VoiceSearch] Voice search failed:", error);
      this.updateState("error", "Tìm kiếm giọng nói thất bại");
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Convenience method: Record, stop, and perform voice search
   */
  async recordAndSearch(
    config: VoiceSearchConfig = {},
  ): Promise<VoiceSearchResult> {
    return new Promise((resolve) => {
      // This is meant to be used with manual stop
      // For auto-stop, call startRecording with maxDuration,
      // then call processRecordingForSearch when done
    });
  }

  async processRecordingForSearch(
    config: VoiceSearchConfig = {},
  ): Promise<VoiceSearchResult> {
    const { uri, duration } = await this.stopRecording();

    if (!uri || duration < 500) {
      this.updateState("idle");
      return {
        success: false,
        error: "Thời gian ghi âm quá ngắn",
      };
    }

    return this.performVoiceSearch(uri, config);
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  private getMimeTypeFromUri(uri: string): string {
    const extension = uri.split(".").pop()?.toLowerCase();
    const mimeMap: Record<string, string> = {
      wav: "audio/wav",
      mp3: "audio/mp3",
      m4a: "audio/m4a",
      webm: "audio/webm",
      ogg: "audio/ogg",
      caf: "audio/x-caf",
    };
    return mimeMap[extension || ""] || "audio/wav";
  }

  isRecording(): boolean {
    return this.currentState === "recording";
  }

  isProcessing(): boolean {
    return this.currentState === "processing";
  }

  // =====================================================
  // CLEANUP
  // =====================================================

  async cleanup(): Promise<void> {
    await this.cancelRecording();
    this.stateListeners.clear();
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

export const voiceSearchService = new VoiceSearchService();

// Export class for testing
export { VoiceSearchService };
