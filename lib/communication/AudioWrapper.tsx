/**
 * Audio Wrapper - Compatibility layer for expo-av → expo-audio migration
 * Use this wrapper to prepare for SDK 54 migration
 *
 * @description Provides unified audio API that works with both expo-av and expo-audio
 * @updated 2026-01-26
 */

/* eslint-disable react-hooks/rules-of-hooks -- This file intentionally uses hooks conditionally based on SDK version */

import { useCallback, useEffect, useRef, useState } from "react";

// Try to import expo-audio first, fallback to expo-av
let useExpoAudio = false;
let AudioModule: any = null;

try {
  // Attempt to use new expo-audio (SDK 54+)
  AudioModule = require("expo-audio");
  useExpoAudio = true;
} catch {
  // Fallback to expo-av
  try {
    AudioModule = require("expo-av");
    useExpoAudio = false;
  } catch {
    console.warn("[AudioWrapper] No audio module available");
  }
}

// ==================== TYPES ====================

export interface AudioPlayerState {
  isPlaying: boolean;
  isLoaded: boolean;
  isLoading: boolean;
  duration: number;
  position: number;
  error: string | null;
}

export interface AudioPlayerControls {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  setRate: (rate: number) => Promise<void>;
}

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  error: string | null;
}

export interface AudioRecorderControls {
  startRecording: () => Promise<void>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  stopRecording: () => Promise<{ uri: string; duration: number } | null>;
}

// ==================== AUDIO PLAYER HOOK ====================

export function useAudioPlayer(
  source: string | null,
): AudioPlayerState & AudioPlayerControls {
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    isLoaded: false,
    isLoading: false,
    duration: 0,
    position: 0,
    error: null,
  });

  const soundRef = useRef<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load audio
  const loadAudio = useCallback(async () => {
    if (!source || !AudioModule) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      if (useExpoAudio) {
        // expo-audio API
        const player = AudioModule.useAudioPlayer(source);
        soundRef.current = player;
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isLoaded: true,
          duration: player.duration || 0,
        }));
      } else {
        // expo-av API
        const { sound, status } = await AudioModule.Audio.Sound.createAsync(
          typeof source === "string" ? { uri: source } : source,
          { shouldPlay: false },
          (status: any) => {
            if (status.isLoaded) {
              setState((prev) => ({
                ...prev,
                isPlaying: status.isPlaying,
                position: status.positionMillis || 0,
                duration: status.durationMillis || 0,
              }));
            }
          },
        );

        soundRef.current = sound;
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isLoaded: true,
          duration: (status as any).durationMillis || 0,
        }));
      }
    } catch (error: any) {
      console.error("[AudioWrapper] Load error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to load audio",
      }));
    }
  }, [source]);

  // Cleanup
  useEffect(() => {
    loadAudio();

    return () => {
      if (soundRef.current) {
        if (useExpoAudio) {
          soundRef.current.remove?.();
        } else {
          soundRef.current.unloadAsync?.();
        }
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadAudio]);

  // Play
  const play = useCallback(async () => {
    if (!soundRef.current) return;

    try {
      if (useExpoAudio) {
        soundRef.current.play();
      } else {
        await soundRef.current.playAsync();
      }
      setState((prev) => ({ ...prev, isPlaying: true }));
    } catch (error: any) {
      setState((prev) => ({ ...prev, error: error.message }));
    }
  }, []);

  // Pause
  const pause = useCallback(async () => {
    if (!soundRef.current) return;

    try {
      if (useExpoAudio) {
        soundRef.current.pause();
      } else {
        await soundRef.current.pauseAsync();
      }
      setState((prev) => ({ ...prev, isPlaying: false }));
    } catch (error: any) {
      setState((prev) => ({ ...prev, error: error.message }));
    }
  }, []);

  // Stop
  const stop = useCallback(async () => {
    if (!soundRef.current) return;

    try {
      if (useExpoAudio) {
        soundRef.current.seekTo(0);
        soundRef.current.pause();
      } else {
        await soundRef.current.stopAsync();
        await soundRef.current.setPositionAsync(0);
      }
      setState((prev) => ({ ...prev, isPlaying: false, position: 0 }));
    } catch (error: any) {
      setState((prev) => ({ ...prev, error: error.message }));
    }
  }, []);

  // Seek
  const seekTo = useCallback(async (position: number) => {
    if (!soundRef.current) return;

    try {
      if (useExpoAudio) {
        soundRef.current.seekTo(position / 1000); // expo-audio uses seconds
      } else {
        await soundRef.current.setPositionAsync(position);
      }
      setState((prev) => ({ ...prev, position }));
    } catch (error: any) {
      setState((prev) => ({ ...prev, error: error.message }));
    }
  }, []);

  // Volume
  const setVolume = useCallback(async (volume: number) => {
    if (!soundRef.current) return;

    try {
      if (useExpoAudio) {
        soundRef.current.volume = volume;
      } else {
        await soundRef.current.setVolumeAsync(volume);
      }
    } catch (error: any) {
      setState((prev) => ({ ...prev, error: error.message }));
    }
  }, []);

  // Rate
  const setRate = useCallback(async (rate: number) => {
    if (!soundRef.current) return;

    try {
      if (useExpoAudio) {
        soundRef.current.rate = rate;
      } else {
        await soundRef.current.setRateAsync(rate, true);
      }
    } catch (error: any) {
      setState((prev) => ({ ...prev, error: error.message }));
    }
  }, []);

  return {
    ...state,
    play,
    pause,
    stop,
    seekTo,
    setVolume,
    setRate,
  };
}

// ==================== AUDIO RECORDER HOOK ====================

export function useAudioRecorder(): AudioRecorderState & AudioRecorderControls {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    error: null,
  });

  const recordingRef = useRef<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!AudioModule) {
      setState((prev) => ({ ...prev, error: "Audio module not available" }));
      return;
    }

    try {
      // Request permissions
      if (!useExpoAudio) {
        const { status } = await AudioModule.Audio.requestPermissionsAsync();
        if (status !== "granted") {
          setState((prev) => ({ ...prev, error: "Permission denied" }));
          return;
        }

        // Configure audio mode
        await AudioModule.Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      }

      // Create recording
      if (useExpoAudio) {
        // expo-audio API
        const recorder = AudioModule.useAudioRecorder({
          android: {
            extension: ".m4a",
            outputFormat: "MPEG_4",
            audioEncoder: "AAC",
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            extension: ".m4a",
            outputFormat: "MPEG4AAC",
            audioQuality: "HIGH",
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
        });
        recorder.record();
        recordingRef.current = recorder;
      } else {
        // expo-av API
        const recording = new AudioModule.Audio.Recording();
        await recording.prepareToRecordAsync(
          AudioModule.Audio.RecordingOptionsPresets.HIGH_QUALITY,
        );
        await recording.startAsync();
        recordingRef.current = recording;
      }

      startTimeRef.current = Date.now();
      setState((prev) => ({ ...prev, isRecording: true, duration: 0 }));

      // Update duration
      intervalRef.current = setInterval(() => {
        setState((prev) => ({
          ...prev,
          duration: Date.now() - startTimeRef.current,
        }));
      }, 100);
    } catch (error: any) {
      console.error("[AudioWrapper] Recording error:", error);
      setState((prev) => ({ ...prev, error: error.message }));
    }
  }, []);

  // Pause recording
  const pauseRecording = useCallback(async () => {
    if (!recordingRef.current) return;

    try {
      if (useExpoAudio) {
        recordingRef.current.pause();
      } else {
        await recordingRef.current.pauseAsync();
      }
      setState((prev) => ({ ...prev, isPaused: true }));

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } catch (error: any) {
      setState((prev) => ({ ...prev, error: error.message }));
    }
  }, []);

  // Resume recording
  const resumeRecording = useCallback(async () => {
    if (!recordingRef.current) return;

    try {
      if (useExpoAudio) {
        recordingRef.current.record();
      } else {
        await recordingRef.current.startAsync();
      }
      setState((prev) => ({ ...prev, isPaused: false }));

      // Resume duration tracking
      const pausedDuration = state.duration;
      startTimeRef.current = Date.now() - pausedDuration;
      intervalRef.current = setInterval(() => {
        setState((prev) => ({
          ...prev,
          duration: Date.now() - startTimeRef.current,
        }));
      }, 100);
    } catch (error: any) {
      setState((prev) => ({ ...prev, error: error.message }));
    }
  }, [state.duration]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return null;

    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      let uri: string;
      const duration = state.duration;

      if (useExpoAudio) {
        recordingRef.current.stop();
        uri = recordingRef.current.uri;
      } else {
        await recordingRef.current.stopAndUnloadAsync();
        uri = recordingRef.current.getURI() || "";

        // Reset audio mode
        await AudioModule.Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
      }

      recordingRef.current = null;
      setState({
        isRecording: false,
        isPaused: false,
        duration: 0,
        error: null,
      });

      return { uri, duration };
    } catch (error: any) {
      console.error("[AudioWrapper] Stop recording error:", error);
      setState((prev) => ({
        ...prev,
        isRecording: false,
        error: error.message,
      }));
      return null;
    }
  }, [state.duration]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (recordingRef.current) {
        if (useExpoAudio) {
          recordingRef.current.stop?.();
        } else {
          recordingRef.current.stopAndUnloadAsync?.();
        }
      }
    };
  }, []);

  return {
    ...state,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  };
}

// ==================== UTILITY FUNCTIONS ====================

export async function playSound(uri: string): Promise<void> {
  if (!AudioModule) return;

  try {
    if (useExpoAudio) {
      const player = AudioModule.createAudioPlayer(uri);
      player.play();
    } else {
      const { sound } = await AudioModule.Audio.Sound.createAsync({ uri });
      await sound.playAsync();
      // Auto unload when finished
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    }
  } catch (error) {
    console.error("[AudioWrapper] Play sound error:", error);
  }
}

export async function configureAudioSession(
  options: {
    allowsRecording?: boolean;
    playsInSilentMode?: boolean;
    staysActiveInBackground?: boolean;
  } = {},
): Promise<void> {
  if (!AudioModule || useExpoAudio) return;

  try {
    await AudioModule.Audio.setAudioModeAsync({
      allowsRecordingIOS: options.allowsRecording ?? false,
      playsInSilentModeIOS: options.playsInSilentMode ?? true,
      staysActiveInBackground: options.staysActiveInBackground ?? false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  } catch (error) {
    console.error("[AudioWrapper] Configure audio session error:", error);
  }
}

export const isExpoAudioAvailable = useExpoAudio;
export const isAudioModuleAvailable = AudioModule !== null;
