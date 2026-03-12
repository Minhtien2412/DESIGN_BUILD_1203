/**
 * Ringtone & Hold Music Service - AI-Powered Sound Management
 * Features: Custom ringtones, AI-generated hold music, Sound visualization
 * Updated: 24/01/2026
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from "expo-audio";
import * as LegacyFileSystem from "expo-file-system/legacy";

// ==================== TYPES ====================
export interface RingtoneOption {
  id: string;
  name: string;
  nameVi: string;
  file: string;
  category: "classic" | "modern" | "nature" | "ai";
  isAI: boolean;
  duration: number; // seconds
  icon: string;
  color: string;
  preview?: string; // URL for preview
}

export interface HoldMusicOption {
  id: string;
  name: string;
  nameVi: string;
  file: string;
  category: "jazz" | "classical" | "lofi" | "ambient" | "ai";
  isAI: boolean;
  mood: string;
  duration: number;
  icon: string;
  color: string;
  aiPrompt?: string; // AI generation prompt
}

export interface SoundSettings {
  selectedRingtone: string;
  selectedHoldMusic: string;
  ringtoneVolume: number;
  holdMusicVolume: number;
  vibrationEnabled: boolean;
  customRingtones: string[];
  aiGeneratedSounds: string[];
}

// ==================== DEFAULT OPTIONS ====================
export const DEFAULT_RINGTONES: RingtoneOption[] = [
  {
    id: "classic_bell",
    name: "Classic Bell",
    nameVi: "Chuông cổ điển",
    file: "ringtones/classic_bell.mp3",
    category: "classic",
    isAI: false,
    duration: 30,
    icon: "notifications",
    color: "#0D9488",
  },
  {
    id: "modern_pulse",
    name: "Modern Pulse",
    nameVi: "Hiện đại",
    file: "ringtones/modern_pulse.mp3",
    category: "modern",
    isAI: false,
    duration: 30,
    icon: "pulse",
    color: "#8B5CF6",
  },
  {
    id: "soft_chime",
    name: "Soft Chime",
    nameVi: "Nhẹ nhàng",
    file: "ringtones/soft_chime.mp3",
    category: "classic",
    isAI: false,
    duration: 30,
    icon: "leaf",
    color: "#10B981",
  },
  {
    id: "nature_birds",
    name: "Morning Birds",
    nameVi: "Chim hót sáng",
    file: "ringtones/nature_birds.mp3",
    category: "nature",
    isAI: false,
    duration: 30,
    icon: "sunny",
    color: "#F59E0B",
  },
  {
    id: "ai_peaceful",
    name: "AI Peaceful",
    nameVi: "AI Bình yên",
    file: "ringtones/ai_peaceful.mp3",
    category: "ai",
    isAI: true,
    duration: 30,
    icon: "sparkles",
    color: "#EC4899",
  },
  {
    id: "ai_energetic",
    name: "AI Energetic",
    nameVi: "AI Năng động",
    file: "ringtones/ai_energetic.mp3",
    category: "ai",
    isAI: true,
    duration: 30,
    icon: "flash",
    color: "#EF4444",
  },
  {
    id: "ai_nature_blend",
    name: "AI Nature Blend",
    nameVi: "AI Thiên nhiên",
    file: "ringtones/ai_nature_blend.mp3",
    category: "ai",
    isAI: true,
    duration: 30,
    icon: "earth",
    color: "#14B8A6",
  },
  {
    id: "ai_meditation",
    name: "AI Meditation",
    nameVi: "AI Thiền định",
    file: "ringtones/ai_meditation.mp3",
    category: "ai",
    isAI: true,
    duration: 30,
    icon: "flower",
    color: "#6366F1",
  },
];

export const DEFAULT_HOLD_MUSIC: HoldMusicOption[] = [
  {
    id: "jazz_smooth",
    name: "Smooth Jazz",
    nameVi: "Jazz êm dịu",
    file: "hold_music/jazz_smooth.mp3",
    category: "jazz",
    isAI: false,
    mood: "Thư giãn",
    duration: 180,
    icon: "musical-note",
    color: "#E67E22",
  },
  {
    id: "classical_piano",
    name: "Classical Piano",
    nameVi: "Piano cổ điển",
    file: "hold_music/classical_piano.mp3",
    category: "classical",
    isAI: false,
    mood: "Thanh lịch",
    duration: 180,
    icon: "library",
    color: "#9B59B6",
  },
  {
    id: "lofi_beats",
    name: "Lo-Fi Beats",
    nameVi: "Lo-Fi Beats",
    file: "hold_music/lofi_beats.mp3",
    category: "lofi",
    isAI: false,
    mood: "Tập trung",
    duration: 180,
    icon: "headset",
    color: "#3498DB",
  },
  {
    id: "ambient_space",
    name: "Ambient Space",
    nameVi: "Không gian",
    file: "hold_music/ambient_space.mp3",
    category: "ambient",
    isAI: false,
    mood: "Yên tĩnh",
    duration: 180,
    icon: "planet",
    color: "#1ABC9C",
  },
  {
    id: "ai_adaptive",
    name: "AI Adaptive",
    nameVi: "AI Thích ứng",
    file: "hold_music/ai_adaptive.mp3",
    category: "ai",
    isAI: true,
    mood: "Tự động theo ngữ cảnh",
    duration: 0, // Infinite/generated
    icon: "sparkles",
    color: "#8B5CF6",
    aiPrompt: "Generate calming hold music that adapts to call duration",
  },
  {
    id: "ai_mood_reader",
    name: "AI Mood Reader",
    nameVi: "AI Cảm xúc",
    file: "hold_music/ai_mood_reader.mp3",
    category: "ai",
    isAI: true,
    mood: "Theo tâm trạng người gọi",
    duration: 0,
    icon: "heart",
    color: "#EC4899",
    aiPrompt: "Generate music based on detected caller emotion",
  },
  {
    id: "ai_business",
    name: "AI Business",
    nameVi: "AI Doanh nghiệp",
    file: "hold_music/ai_business.mp3",
    category: "ai",
    isAI: true,
    mood: "Chuyên nghiệp",
    duration: 0,
    icon: "briefcase",
    color: "#6366F1",
    aiPrompt: "Generate professional corporate hold music",
  },
];

// ==================== STORAGE KEYS ====================
const STORAGE_KEYS = {
  SOUND_SETTINGS: "@app:sound_settings",
  CUSTOM_RINGTONES: "@app:custom_ringtones",
  AI_SOUNDS_CACHE: "@app:ai_sounds_cache",
};

// ==================== SERVICE CLASS ====================
class RingtoneService {
  private currentSound: AudioPlayer | null = null;
  private settings: SoundSettings = {
    selectedRingtone: "classic_bell",
    selectedHoldMusic: "jazz_smooth",
    ringtoneVolume: 1.0,
    holdMusicVolume: 0.7,
    vibrationEnabled: true,
    customRingtones: [],
    aiGeneratedSounds: [],
  };
  private isLoaded: boolean = false;

  // ==================== INITIALIZATION ====================
  async initialize(): Promise<void> {
    try {
      // Load saved settings
      const savedSettings = await AsyncStorage.getItem(
        STORAGE_KEYS.SOUND_SETTINGS,
      );
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }

      // Configure audio mode
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: "duckOthers",
        shouldRouteThroughEarpiece: false,
      });

      this.isLoaded = true;
      console.log("[RingtoneService] Initialized successfully");
    } catch (error) {
      console.error("[RingtoneService] Initialization error:", error);
    }
  }

  // ==================== SETTINGS ====================
  async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SOUND_SETTINGS,
        JSON.stringify(this.settings),
      );
    } catch (error) {
      console.error("[RingtoneService] Save settings error:", error);
    }
  }

  getSettings(): SoundSettings {
    return { ...this.settings };
  }

  async updateSettings(updates: Partial<SoundSettings>): Promise<void> {
    this.settings = { ...this.settings, ...updates };
    await this.saveSettings();
  }

  // ==================== RINGTONE MANAGEMENT ====================
  getRingtones(): RingtoneOption[] {
    return DEFAULT_RINGTONES;
  }

  getRingtonesByCategory(
    category: RingtoneOption["category"],
  ): RingtoneOption[] {
    return DEFAULT_RINGTONES.filter((r) => r.category === category);
  }

  getAIRingtones(): RingtoneOption[] {
    return DEFAULT_RINGTONES.filter((r) => r.isAI);
  }

  getSelectedRingtone(): RingtoneOption | undefined {
    return DEFAULT_RINGTONES.find(
      (r) => r.id === this.settings.selectedRingtone,
    );
  }

  async setSelectedRingtone(ringtoneId: string): Promise<void> {
    const ringtone = DEFAULT_RINGTONES.find((r) => r.id === ringtoneId);
    if (ringtone) {
      this.settings.selectedRingtone = ringtoneId;
      await this.saveSettings();
      console.log("[RingtoneService] Selected ringtone:", ringtone.name);
    }
  }

  // ==================== HOLD MUSIC MANAGEMENT ====================
  getHoldMusicOptions(): HoldMusicOption[] {
    return DEFAULT_HOLD_MUSIC;
  }

  getHoldMusicByCategory(
    category: HoldMusicOption["category"],
  ): HoldMusicOption[] {
    return DEFAULT_HOLD_MUSIC.filter((m) => m.category === category);
  }

  getAIHoldMusic(): HoldMusicOption[] {
    return DEFAULT_HOLD_MUSIC.filter((m) => m.isAI);
  }

  getSelectedHoldMusic(): HoldMusicOption | undefined {
    return DEFAULT_HOLD_MUSIC.find(
      (m) => m.id === this.settings.selectedHoldMusic,
    );
  }

  async setSelectedHoldMusic(musicId: string): Promise<void> {
    const music = DEFAULT_HOLD_MUSIC.find((m) => m.id === musicId);
    if (music) {
      this.settings.selectedHoldMusic = musicId;
      await this.saveSettings();
      console.log("[RingtoneService] Selected hold music:", music.name);
    }
  }

  // ==================== PLAYBACK ====================
  async playRingtone(ringtoneId?: string): Promise<void> {
    try {
      await this.stopSound();

      const ringtone = ringtoneId
        ? DEFAULT_RINGTONES.find((r) => r.id === ringtoneId)
        : this.getSelectedRingtone();

      if (!ringtone) {
        console.warn("[RingtoneService] Ringtone not found");
        return;
      }

      // For demo, use a built-in sound or placeholder
      // In production, load from ringtone.file
      const player = createAudioPlayer(
        // require(`../../assets/sounds/${ringtone.file}`),
        { uri: "https://example.com/ringtone.mp3" }, // Placeholder
        { updateInterval: 500 },
      );
      player.loop = true;
      player.volume = this.settings.ringtoneVolume;
      player.play();

      this.currentSound = player;
      console.log("[RingtoneService] Playing ringtone:", ringtone.name);
    } catch (error) {
      console.error("[RingtoneService] Play ringtone error:", error);
    }
  }

  async playHoldMusic(musicId?: string): Promise<void> {
    try {
      await this.stopSound();

      const music = musicId
        ? DEFAULT_HOLD_MUSIC.find((m) => m.id === musicId)
        : this.getSelectedHoldMusic();

      if (!music) {
        console.warn("[RingtoneService] Hold music not found");
        return;
      }

      // For demo, use a placeholder
      const player = createAudioPlayer(
        { uri: "https://example.com/hold_music.mp3" }, // Placeholder
        { updateInterval: 500 },
      );
      player.loop = true;
      player.volume = this.settings.holdMusicVolume;
      player.play();

      this.currentSound = player;
      console.log("[RingtoneService] Playing hold music:", music.name);
    } catch (error) {
      console.error("[RingtoneService] Play hold music error:", error);
    }
  }

  async playPreview(option: RingtoneOption | HoldMusicOption): Promise<void> {
    try {
      await this.stopSound();

      const player = createAudioPlayer(
        { uri: "https://example.com/preview.mp3" }, // Placeholder
        { updateInterval: 500 },
      );
      player.loop = false;
      player.volume = 0.8;
      player.play();

      this.currentSound = player;

      // Auto stop after 5 seconds for preview
      setTimeout(() => {
        this.stopSound();
      }, 5000);
    } catch (error) {
      console.error("[RingtoneService] Play preview error:", error);
    }
  }

  async stopSound(): Promise<void> {
    try {
      if (this.currentSound) {
        this.currentSound.pause();
        this.currentSound.remove();
        this.currentSound = null;
      }
    } catch (error) {
      console.error("[RingtoneService] Stop sound error:", error);
    }
  }

  async setVolume(
    volume: number,
    type: "ringtone" | "holdMusic",
  ): Promise<void> {
    const clampedVolume = Math.max(0, Math.min(1, volume));

    if (type === "ringtone") {
      this.settings.ringtoneVolume = clampedVolume;
    } else {
      this.settings.holdMusicVolume = clampedVolume;
    }

    await this.saveSettings();

    if (this.currentSound) {
      this.currentSound.volume = clampedVolume;
    }
  }

  // ==================== AI SOUND GENERATION ====================
  async generateAIRingtone(options: {
    mood: "calm" | "energetic" | "nature" | "professional";
    duration?: number;
  }): Promise<string | null> {
    try {
      console.log(
        "[RingtoneService] Generating AI ringtone with mood:",
        options.mood,
      );

      // In production, call AI music generation API
      // Example: OpenAI, Mubert, AIVA, etc.
      /*
      const response = await fetch('https://api.example.com/generate-sound', {
        method: 'POST',
        body: JSON.stringify({
          type: 'ringtone',
          mood: options.mood,
          duration: options.duration || 30,
        }),
      });
      
      const { soundUrl } = await response.json();
      
      // Download and cache
      const localPath = `${LegacyFileSystem.cacheDirectory}ai_ringtone_${Date.now()}.mp3`;
      await LegacyFileSystem.downloadAsync(soundUrl, localPath);
      
      // Save to settings
      this.settings.aiGeneratedSounds.push(localPath);
      await this.saveSettings();
      
      return localPath;
      */

      // Demo: return placeholder
      return null;
    } catch (error) {
      console.error("[RingtoneService] Generate AI ringtone error:", error);
      return null;
    }
  }

  async generateAIHoldMusic(options: {
    style: "jazz" | "classical" | "lofi" | "ambient";
    contextAware?: boolean;
  }): Promise<string | null> {
    try {
      console.log(
        "[RingtoneService] Generating AI hold music with style:",
        options.style,
      );

      // In production, call AI music generation API
      // For context-aware music, pass additional context like:
      // - Time of day
      // - Call duration
      // - Caller history

      return null;
    } catch (error) {
      console.error("[RingtoneService] Generate AI hold music error:", error);
      return null;
    }
  }

  // ==================== CUSTOM RINGTONE ====================
  async addCustomRingtone(uri: string, name: string): Promise<boolean> {
    try {
      // Copy to app directory
      const fileName = `custom_${Date.now()}.mp3`;
      const documentDir = LegacyFileSystem.documentDirectory ?? "";
      const localPath = `${documentDir}ringtones/${fileName}`;

      await LegacyFileSystem.makeDirectoryAsync(`${documentDir}ringtones/`, {
        intermediates: true,
      });
      await LegacyFileSystem.copyAsync({ from: uri, to: localPath });

      // Add to custom ringtones list
      this.settings.customRingtones.push(localPath);
      await this.saveSettings();

      console.log("[RingtoneService] Added custom ringtone:", name);
      return true;
    } catch (error) {
      console.error("[RingtoneService] Add custom ringtone error:", error);
      return false;
    }
  }

  async removeCustomRingtone(path: string): Promise<boolean> {
    try {
      await LegacyFileSystem.deleteAsync(path, { idempotent: true });
      this.settings.customRingtones = this.settings.customRingtones.filter(
        (r) => r !== path,
      );
      await this.saveSettings();
      return true;
    } catch (error) {
      console.error("[RingtoneService] Remove custom ringtone error:", error);
      return false;
    }
  }

  getCustomRingtones(): string[] {
    return this.settings.customRingtones;
  }

  // ==================== UTILITIES ====================
  isPlaying(): boolean {
    return this.currentSound !== null;
  }

  async cleanup(): Promise<void> {
    await this.stopSound();
  }
}

// ==================== SINGLETON EXPORT ====================
export const ringtoneService = new RingtoneService();

// ==================== HOOKS ====================
import { useCallback, useEffect, useState } from "react";

export function useRingtone() {
  const [settings, setSettings] = useState<SoundSettings>(
    ringtoneService.getSettings(),
  );
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    ringtoneService.initialize();
    setSettings(ringtoneService.getSettings());
  }, []);

  const playRingtone = useCallback(async (ringtoneId?: string) => {
    await ringtoneService.playRingtone(ringtoneId);
    setIsPlaying(true);
  }, []);

  const playHoldMusic = useCallback(async (musicId?: string) => {
    await ringtoneService.playHoldMusic(musicId);
    setIsPlaying(true);
  }, []);

  const stopSound = useCallback(async () => {
    await ringtoneService.stopSound();
    setIsPlaying(false);
  }, []);

  const setRingtone = useCallback(async (ringtoneId: string) => {
    await ringtoneService.setSelectedRingtone(ringtoneId);
    setSettings(ringtoneService.getSettings());
  }, []);

  const setHoldMusic = useCallback(async (musicId: string) => {
    await ringtoneService.setSelectedHoldMusic(musicId);
    setSettings(ringtoneService.getSettings());
  }, []);

  return {
    settings,
    isPlaying,
    ringtones: ringtoneService.getRingtones(),
    holdMusicOptions: ringtoneService.getHoldMusicOptions(),
    aiRingtones: ringtoneService.getAIRingtones(),
    aiHoldMusic: ringtoneService.getAIHoldMusic(),
    selectedRingtone: ringtoneService.getSelectedRingtone(),
    selectedHoldMusic: ringtoneService.getSelectedHoldMusic(),
    playRingtone,
    playHoldMusic,
    stopSound,
    setRingtone,
    setHoldMusic,
    playPreview: ringtoneService.playPreview.bind(ringtoneService),
    generateAIRingtone:
      ringtoneService.generateAIRingtone.bind(ringtoneService),
    generateAIHoldMusic:
      ringtoneService.generateAIHoldMusic.bind(ringtoneService),
  };
}
