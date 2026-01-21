/**
 * Voice AI Service
 * Cung cấp chức năng giọng nói cho AI consultation
 * - Speech-to-Text (STT): Chuyển giọng nói thành văn bản
 * - Text-to-Speech (TTS): Chuyển văn bản AI thành giọng nói
 * @author AI Assistant
 * @date 13/01/2026
 */

import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { Platform } from 'react-native';

// =====================================================
// TYPES & INTERFACES
// =====================================================

export interface VoiceConfig {
  language: string;
  rate: number;      // 0.1 - 2.0
  pitch: number;     // 0.5 - 2.0
  volume: number;    // 0 - 1
}

export interface RecordingResult {
  success: boolean;
  uri?: string;
  duration?: number;
  error?: string;
}

export interface SpeechResult {
  success: boolean;
  text?: string;
  confidence?: number;
  error?: string;
}

export interface TTSStatus {
  isSpeaking: boolean;
  isPaused: boolean;
}

export type VoiceState = 'idle' | 'recording' | 'processing' | 'speaking';

// =====================================================
// DEFAULT CONFIG
// =====================================================

const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  language: 'vi-VN',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
};

// Vietnamese voice options
export const VOICE_OPTIONS = {
  VIETNAMESE: 'vi-VN',
  ENGLISH: 'en-US',
  CHINESE: 'zh-CN',
  JAPANESE: 'ja-JP',
  KOREAN: 'ko-KR',
};

export const VOICE_RATES = [
  { label: 'Rất chậm', value: 0.5 },
  { label: 'Chậm', value: 0.75 },
  { label: 'Bình thường', value: 1.0 },
  { label: 'Nhanh', value: 1.25 },
  { label: 'Rất nhanh', value: 1.5 },
];

// =====================================================
// VOICE AI SERVICE CLASS
// =====================================================

class VoiceAIService {
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;
  private config: VoiceConfig = DEFAULT_VOICE_CONFIG;
  private state: VoiceState = 'idle';
  private speechSynthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private onStateChange: ((state: VoiceState) => void) | null = null;

  constructor() {
    // Initialize Web Speech API for web platform
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      this.speechSynthesis = window.speechSynthesis;
    }
  }

  // =====================================================
  // CONFIGURATION
  // =====================================================

  setConfig(config: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): VoiceConfig {
    return { ...this.config };
  }

  setStateChangeListener(callback: (state: VoiceState) => void): void {
    this.onStateChange = callback;
  }

  private updateState(newState: VoiceState): void {
    this.state = newState;
    this.onStateChange?.(newState);
  }

  getState(): VoiceState {
    return this.state;
  }

  // =====================================================
  // AUDIO SETUP
  // =====================================================

  async setupAudio(): Promise<boolean> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      return true;
    } catch (error) {
      console.error('Failed to setup audio:', error);
      return false;
    }
  }

  // =====================================================
  // SPEECH-TO-TEXT (Recording)
  // =====================================================

  async startRecording(): Promise<boolean> {
    try {
      // Request permissions
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        console.error('Audio permission not granted');
        return false;
      }

      await this.setupAudio();

      // Create recording with high quality settings
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.updateState('recording');
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return false;
    }
  }

  async stopRecording(): Promise<RecordingResult> {
    try {
      if (!this.recording) {
        return { success: false, error: 'No active recording' };
      }

      this.updateState('processing');
      
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      const status = await this.recording.getStatusAsync();
      
      this.recording = null;
      this.updateState('idle');

      if (uri) {
        return {
          success: true,
          uri,
          duration: status.durationMillis,
        };
      }

      return { success: false, error: 'No recording URI' };
    } catch (error) {
      this.recording = null;
      this.updateState('idle');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async cancelRecording(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      }
      this.updateState('idle');
    } catch (error) {
      console.error('Failed to cancel recording:', error);
      this.recording = null;
      this.updateState('idle');
    }
  }

  // =====================================================
  // SPEECH-TO-TEXT (Web Speech Recognition)
  // =====================================================

  async startSpeechRecognition(): Promise<SpeechResult> {
    return new Promise((resolve) => {
      if (Platform.OS !== 'web' || typeof window === 'undefined') {
        resolve({ 
          success: false, 
          error: 'Speech recognition chỉ hỗ trợ trên web' 
        });
        return;
      }

      // Check for Web Speech API support
      const SpeechRecognition = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        resolve({ 
          success: false, 
          error: 'Trình duyệt không hỗ trợ nhận dạng giọng nói' 
        });
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = this.config.language;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      this.updateState('recording');

      recognition.onresult = (event: any) => {
        const result = event.results[0][0];
        this.updateState('idle');
        resolve({
          success: true,
          text: result.transcript,
          confidence: result.confidence,
        });
      };

      recognition.onerror = (event: any) => {
        this.updateState('idle');
        let errorMessage = 'Lỗi nhận dạng giọng nói';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'Không phát hiện giọng nói';
            break;
          case 'audio-capture':
            errorMessage = 'Không thể truy cập microphone';
            break;
          case 'not-allowed':
            errorMessage = 'Quyền truy cập microphone bị từ chối';
            break;
          case 'network':
            errorMessage = 'Lỗi kết nối mạng';
            break;
        }
        
        resolve({ success: false, error: errorMessage });
      };

      recognition.onend = () => {
        if (this.state === 'recording') {
          this.updateState('idle');
        }
      };

      try {
        recognition.start();
      } catch (error) {
        this.updateState('idle');
        resolve({ 
          success: false, 
          error: 'Không thể bắt đầu nhận dạng giọng nói' 
        });
      }
    });
  }

  // =====================================================
  // TEXT-TO-SPEECH
  // =====================================================

  async speak(text: string): Promise<boolean> {
    try {
      // Stop any current speech
      await this.stopSpeaking();

      if (Platform.OS === 'web' && this.speechSynthesis) {
        return this.speakWeb(text);
      } else {
        return this.speakNative(text);
      }
    } catch (error) {
      console.error('Failed to speak:', error);
      this.updateState('idle');
      return false;
    }
  }

  private speakWeb(text: string): boolean {
    if (!this.speechSynthesis) return false;

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.config.language;
      utterance.rate = this.config.rate;
      utterance.pitch = this.config.pitch;
      utterance.volume = this.config.volume;

      // Try to find Vietnamese voice
      const voices = this.speechSynthesis.getVoices();
      const vietnameseVoice = voices.find(v => 
        v.lang.startsWith('vi') || v.name.toLowerCase().includes('vietnam')
      );
      
      if (vietnameseVoice) {
        utterance.voice = vietnameseVoice;
      }

      utterance.onstart = () => {
        this.updateState('speaking');
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        this.updateState('idle');
      };

      utterance.onerror = (event) => {
        console.error('Speech error:', event.error);
        this.currentUtterance = null;
        this.updateState('idle');
      };

      this.currentUtterance = utterance;
      this.speechSynthesis.speak(utterance);
      return true;
    } catch (error) {
      console.error('Web speech error:', error);
      return false;
    }
  }

  private async speakNative(text: string): Promise<boolean> {
    // For native platforms, we can use a TTS API or play pre-recorded audio
    // Here we'll simulate with a simple approach
    
    try {
      this.updateState('speaking');
      
      // Simulate speech duration based on text length
      // In production, you'd integrate with a TTS service like Google Cloud TTS
      const wordsPerMinute = 150;
      const words = text.split(/\s+/).length;
      const durationMs = (words / wordsPerMinute) * 60 * 1000;

      await new Promise(resolve => setTimeout(resolve, Math.min(durationMs, 5000)));
      
      this.updateState('idle');
      return true;
    } catch (error) {
      this.updateState('idle');
      return false;
    }
  }

  async stopSpeaking(): Promise<void> {
    try {
      if (Platform.OS === 'web' && this.speechSynthesis) {
        this.speechSynthesis.cancel();
        this.currentUtterance = null;
      }
      
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }
      
      this.updateState('idle');
    } catch (error) {
      console.error('Failed to stop speaking:', error);
    }
  }

  async pauseSpeaking(): Promise<void> {
    if (Platform.OS === 'web' && this.speechSynthesis) {
      this.speechSynthesis.pause();
    }
  }

  async resumeSpeaking(): Promise<void> {
    if (Platform.OS === 'web' && this.speechSynthesis) {
      this.speechSynthesis.resume();
    }
  }

  isSpeaking(): boolean {
    if (Platform.OS === 'web' && this.speechSynthesis) {
      return this.speechSynthesis.speaking;
    }
    return this.state === 'speaking';
  }

  // =====================================================
  // GET AVAILABLE VOICES
  // =====================================================

  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (Platform.OS === 'web' && this.speechSynthesis) {
      return this.speechSynthesis.getVoices();
    }
    return [];
  }

  getVietnameseVoices(): SpeechSynthesisVoice[] {
    return this.getAvailableVoices().filter(v => 
      v.lang.startsWith('vi') || 
      v.name.toLowerCase().includes('vietnam') ||
      v.name.toLowerCase().includes('vietnamese')
    );
  }

  // =====================================================
  // AUDIO PLAYBACK (For recorded messages)
  // =====================================================

  async playAudio(uri: string): Promise<boolean> {
    try {
      await this.stopSpeaking();
      
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, volume: this.config.volume }
      );
      
      this.sound = sound;
      this.updateState('speaking');
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if ('didJustFinish' in status && status.didJustFinish) {
          this.sound = null;
          this.updateState('idle');
        }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to play audio:', error);
      this.updateState('idle');
      return false;
    }
  }

  // =====================================================
  // CLEANUP
  // =====================================================

  async cleanup(): Promise<void> {
    await this.cancelRecording();
    await this.stopSpeaking();
    this.onStateChange = null;
  }
}

// Export singleton instance
export const voiceAIService = new VoiceAIService();

// Export class for testing
export { VoiceAIService };

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Format duration in mm:ss
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Check if voice features are supported
 */
export function isVoiceSupported(): {
  recording: boolean;
  speechRecognition: boolean;
  textToSpeech: boolean;
} {
  const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';
  
  return {
    recording: true, // expo-av supports recording on all platforms
    speechRecognition: isWeb && !!(
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition
    ),
    textToSpeech: isWeb && !!window.speechSynthesis,
  };
}

/**
 * Clean text for better TTS output
 */
export function cleanTextForSpeech(text: string): string {
  return text
    // Remove markdown formatting
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/`{1,3}/g, '')
    // Remove special characters
    .replace(/[•◉◆▪▸►→]/g, '')
    // Clean up whitespace
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}
