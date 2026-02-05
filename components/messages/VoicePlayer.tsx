/**
 * Voice Message Player Component
 * Plays voice messages with waveform visualization
 * Uses AudioWrapper for expo-audio compatibility
 */

import { useThemeColor } from "@/hooks/use-theme-color";
import { AudioPlaybackStatus, AudioPlayer } from "@/utils/audioWrapper";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface VoicePlayerProps {
  audioUri: string;
  duration: number;
  isFromMe: boolean;
  onError?: () => void;
}

export function VoicePlayer({
  audioUri,
  duration,
  isFromMe,
  onError,
}: VoicePlayerProps) {
  const playerRef = useRef<AudioPlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const primary = useThemeColor({}, "primary");
  const baseTextColor = useThemeColor({}, "text");
  const textColor = isFromMe ? "#fff" : baseTextColor;

  /**
   * Handle playback status updates
   */
  const handleStatusUpdate = (status: AudioPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setIsPlaying(status.isPlaying);

      // Auto-stop when finished
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  /**
   * Load and play audio
   */
  const playAudio = async () => {
    try {
      setIsLoading(true);

      // Stop current player if exists
      if (playerRef.current) {
        await playerRef.current.unload();
      }

      // Create new player with wrapper
      playerRef.current = new AudioPlayer({
        uri: audioUri,
        shouldPlay: true,
        onPlaybackStatusUpdate: handleStatusUpdate,
      });

      const loaded = await playerRef.current.load();
      if (!loaded) {
        throw new Error("Failed to load audio");
      }

      setIsPlaying(true);
      setIsLoading(false);

      console.log("[VoicePlayer] Playing:", audioUri);
    } catch (error) {
      console.error("[VoicePlayer] Playback error:", error);
      setIsLoading(false);
      onError?.();
    }
  };

  /**
   * Pause audio
   */
  const pauseAudio = async () => {
    if (playerRef.current) {
      await playerRef.current.pause();
      setIsPlaying(false);
    }
  };

  /**
   * Toggle play/pause
   */
  const togglePlayback = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  /**
   * Format time (MM:SS)
   */
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  /**
   * Calculate progress percentage
   */
  const getProgress = (): number => {
    if (duration === 0) return 0;
    return (position / (duration * 1000)) * 100;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.unload();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Play/Pause button */}
      <Pressable
        onPress={togglePlayback}
        disabled={isLoading}
        style={({ pressed }) => [
          styles.playButton,
          pressed && styles.playButtonPressed,
        ]}
      >
        {isLoading ? (
          <Ionicons name="hourglass-outline" size={20} color={textColor} />
        ) : (
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={20}
            color={textColor}
          />
        )}
      </Pressable>

      {/* Waveform visualization */}
      <View style={styles.waveformContainer}>
        {/* Background waveform */}
        <View style={styles.waveform}>
          {Array.from({ length: 30 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.bar,
                {
                  height: Math.random() * 20 + 10,
                  backgroundColor: textColor + "40",
                },
              ]}
            />
          ))}
        </View>

        {/* Progress overlay */}
        <View style={[styles.waveformProgress, { width: `${getProgress()}%` }]}>
          {Array.from({ length: 30 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.bar,
                {
                  height: Math.random() * 20 + 10,
                  backgroundColor: isFromMe ? "#fff" : primary,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Duration */}
      <Text style={[styles.duration, { color: textColor }]}>
        {isPlaying ? formatTime(position) : formatTime(duration * 1000)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
    minWidth: 200,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  playButtonPressed: {
    opacity: 0.7,
  },
  waveformContainer: {
    flex: 1,
    height: 30,
    position: "relative",
    overflow: "hidden",
  },
  waveform: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    height: 30,
  },
  waveformProgress: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    height: 30,
    overflow: "hidden",
  },
  bar: {
    width: 3,
    borderRadius: 1.5,
  },
  duration: {
    fontSize: 12,
    minWidth: 40,
    textAlign: "right",
  },
});
