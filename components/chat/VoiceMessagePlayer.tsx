/**
 * Voice Message Player Component (MSG-005)
 * =========================================
 *
 * Play voice messages in chat bubbles
 * - Waveform visualization
 * - Play/pause controls
 * - Progress tracking
 * - Playback speed control
 *
 * @author ThietKeResort Team
 * @created 2026-01-22
 */

import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Audio, AVPlaybackStatus } from "expo-av";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ============================================================================
// Types
// ============================================================================

interface VoiceMessagePlayerProps {
  uri: string;
  duration: number; // in seconds
  waveform?: number[];
  isFromMe?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function VoiceMessagePlayer({
  uri,
  duration,
  waveform = [],
  isFromMe = false,
}: VoiceMessagePlayerProps) {
  const colors = useThemeColor();

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0); // in seconds
  const [isLoading, setIsLoading] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Refs
  const soundRef = useRef<Audio.Sound | null>(null);

  // Colors based on sender
  const accentColor = isFromMe ? "#FFFFFF" : colors.primary;
  const bgColor = isFromMe ? colors.primary : colors.surface;
  const textColor = isFromMe ? "#FFFFFF" : colors.text;
  const secondaryColor = isFromMe
    ? "rgba(255,255,255,0.7)"
    : colors.textSecondary;

  // ============================================
  // Playback
  // ============================================

  const loadSound = useCallback(async () => {
    if (soundRef.current) return;

    try {
      setIsLoading(true);
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false, progressUpdateIntervalMillis: 100 },
        onPlaybackStatusUpdate,
      );
      soundRef.current = sound;
    } catch (error) {
      console.error("Error loading voice message:", error);
    } finally {
      setIsLoading(false);
    }
  }, [uri]);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis / 1000);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
        // Reset to beginning
        soundRef.current?.setPositionAsync(0);
      }
    }
  }, []);

  const togglePlayback = useCallback(async () => {
    try {
      if (!soundRef.current) {
        await loadSound();
      }

      if (!soundRef.current) return;

      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) return;

      if (status.isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.error("Error toggling playback:", error);
    }
  }, [loadSound]);

  const toggleSpeed = useCallback(async () => {
    const speeds = [1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);

    if (soundRef.current) {
      await soundRef.current.setRateAsync(nextSpeed, true);
    }
  }, [playbackSpeed]);

  // Seek on waveform press
  const handleWaveformPress = useCallback(
    async (progressPercent: number) => {
      if (!soundRef.current) {
        await loadSound();
      }

      if (soundRef.current) {
        const newPosition = progressPercent * duration;
        await soundRef.current.setPositionAsync(newPosition * 1000);
        setPosition(newPosition);
      }
    },
    [loadSound, duration],
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // ============================================
  // Helpers
  // ============================================

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? position / duration : 0;

  // Generate default waveform if none provided
  const displayWaveform =
    waveform.length > 0
      ? waveform
      : Array.from({ length: 40 }, () => Math.random() * 0.6 + 0.2);

  // ============================================
  // Render
  // ============================================

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Play/Pause button */}
      <TouchableOpacity
        style={[styles.playButton, { backgroundColor: accentColor + "20" }]}
        onPress={togglePlayback}
        disabled={isLoading}
      >
        {isLoading ? (
          <View style={[styles.loadingDot, { backgroundColor: accentColor }]} />
        ) : (
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={20}
            color={accentColor}
          />
        )}
      </TouchableOpacity>

      {/* Waveform */}
      <TouchableOpacity
        style={styles.waveformContainer}
        activeOpacity={0.8}
        onPress={(e) => {
          const locationX = e.nativeEvent.locationX;
          // @ts-ignore
          const width = e.nativeEvent?.target?.clientWidth || 150;
          const percent = locationX / width;
          handleWaveformPress(Math.max(0, Math.min(1, percent)));
        }}
      >
        <View style={styles.waveform}>
          {displayWaveform.map((level, index) => {
            const barProgress = index / displayWaveform.length;
            const isPlayed = barProgress <= progressPercent;

            return (
              <View
                key={index}
                style={[
                  styles.waveformBar,
                  {
                    height: level * 24 + 4,
                    backgroundColor: isPlayed
                      ? accentColor
                      : accentColor + "40",
                  },
                ]}
              />
            );
          })}
        </View>
      </TouchableOpacity>

      {/* Duration & Speed */}
      <View style={styles.info}>
        <Text style={[styles.duration, { color: secondaryColor }]}>
          {formatTime(isPlaying || position > 0 ? position : duration)}
        </Text>

        {isPlaying && (
          <TouchableOpacity onPress={toggleSpeed} style={styles.speedButton}>
            <Text style={[styles.speedText, { color: secondaryColor }]}>
              {playbackSpeed}x
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 20,
    minWidth: 200,
    maxWidth: 280,
    gap: 8,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  waveformContainer: {
    flex: 1,
    height: 32,
    justifyContent: "center",
  },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    height: 28,
    gap: 1,
  },
  waveformBar: {
    width: 3,
    borderRadius: 1.5,
    minHeight: 4,
  },
  info: {
    alignItems: "flex-end",
    minWidth: 36,
  },
  duration: {
    fontSize: 11,
    fontWeight: "500",
    fontVariant: ["tabular-nums"],
  },
  speedButton: {
    paddingTop: 2,
  },
  speedText: {
    fontSize: 10,
    fontWeight: "600",
  },
});

export default VoiceMessagePlayer;
