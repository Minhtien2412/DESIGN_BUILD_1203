/**
 * Voice Recording Service
 * Record and send voice messages in chat
 * 
 * Note: Using expo-av for audio recording (deprecated in SDK 54)
 * TODO: Migrate to expo-audio when available
 * For now, silence warning with conditional import
 */

import * as FileSystem from 'expo-file-system';

// Conditional import to suppress deprecation warning in dev
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Audio: any = null;
try {
  const expoAv = require('expo-av');
  Audio = expoAv.Audio;
} catch (e) {
  console.warn('[VoiceRecording] expo-av not available, voice recording disabled');
}

export interface VoiceRecordingOptions {
  maxDuration?: number; // milliseconds
  quality?: 'low' | 'medium' | 'high';
}

export interface VoiceRecording {
  uri: string;
  duration: number;
  size: number;
  mimeType: string;
}

class VoiceRecorder {
  // Using any type since Audio is dynamically imported
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recording: any = null;
  private isRecording = false;
  private startTime: number = 0;

  /**
   * Request microphone permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request microphone permission:', error);
      return false;
    }
  }

  /**
   * Start recording
   */
  async startRecording(options: VoiceRecordingOptions = {}): Promise<void> {
    if (this.isRecording) {
      throw new Error('Already recording');
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      throw new Error('Microphone permission not granted');
    }

    try {
      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Configure recording options
      const recordingOptions = this.getRecordingOptions(options.quality || 'medium');

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      
      this.recording = recording;
      this.isRecording = true;
      this.startTime = Date.now();

      // Set max duration timer if specified
      if (options.maxDuration) {
        setTimeout(() => {
          if (this.isRecording) {
            this.stopRecording();
          }
        }, options.maxDuration);
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording
   */
  async stopRecording(): Promise<VoiceRecording> {
    if (!this.recording || !this.isRecording) {
      throw new Error('Not currently recording');
    }

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      
      if (!uri) {
        throw new Error('Recording URI not available');
      }

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      const duration = Date.now() - this.startTime;

      const result: VoiceRecording = {
        uri,
        duration,
        size: fileInfo.exists ? fileInfo.size || 0 : 0,
        mimeType: 'audio/m4a',
      };

      // Reset state
      this.recording = null;
      this.isRecording = false;
      this.startTime = 0;

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      return result;
    } catch (error) {
      console.error('Failed to stop recording:', error);
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
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      
      // Delete the file
      if (uri) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }

      this.recording = null;
      this.isRecording = false;
      this.startTime = 0;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (error) {
      console.error('Failed to cancel recording:', error);
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
   * Returns type any since Audio module is dynamically imported
   */
  private getRecordingOptions(quality: 'low' | 'medium' | 'high'): any {
    const baseOptions: any = {
      isMeteringEnabled: true,
      android: {
        extension: '.m4a',
        outputFormat: Audio?.AndroidOutputFormat?.MPEG_4,
        audioEncoder: Audio?.AndroidAudioEncoder?.AAC,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
      },
      ios: {
        extension: '.m4a',
        outputFormat: Audio?.IOSOutputFormat?.MPEG4AAC,
        audioQuality: Audio?.IOSAudioQuality?.HIGH,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {
        mimeType: 'audio/webm',
        bitsPerSecond: 128000,
      },
    };

    switch (quality) {
      case 'low':
        if (baseOptions.android) baseOptions.android.bitRate = 64000;
        if (baseOptions.ios) baseOptions.ios.bitRate = 64000;
        if (baseOptions.web) baseOptions.web.bitsPerSecond = 64000;
        break;
      case 'high':
        if (baseOptions.android) baseOptions.android.bitRate = 192000;
        if (baseOptions.ios) baseOptions.ios.bitRate = 192000;
        if (baseOptions.web) baseOptions.web.bitsPerSecond = 192000;
        break;
      default: // medium
        break;
    }

    return baseOptions;
  }
}

// Export singleton instance
export const voiceRecorder = new VoiceRecorder();

/**
 * Play a voice recording
 * Returns type any since Audio.Sound is from dynamically imported module
 */
export async function playVoiceRecording(uri: string): Promise<any> {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true }
    );
    
    return sound;
  } catch (error) {
    console.error('Failed to play voice recording:', error);
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
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
