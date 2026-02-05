/**
 * MiniVideoLoop Component
 * Small video thumbnail that shows poster and plays on interaction
 * Optimized for grid display - uses thumbnail-first approach
 * to avoid decoder overload on Android
 *
 * @created 2026-01-29
 * @updated 2026-01-29 - Fixed decoder overload by using thumbnail-only display
 */

import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface MiniVideoLoopProps {
  /** Video URL (mp4, m3u8) */
  videoUrl: string;
  /** Thumbnail/poster image URL */
  thumbnailUrl?: string;
  /** Size of the video container */
  size?: number;
  /** Border radius */
  borderRadius?: number;
  /** Show LIVE badge */
  showLiveBadge?: boolean;
  /** Callback when pressed */
  onPress?: () => void;
  /** Whether the component is currently visible/active */
  isActive?: boolean;
  /** Duration text to display */
  durationText?: string;
}

/**
 * MiniVideoLoop - Thumbnail display with play icon
 *
 * NOTE: This component now displays thumbnails only to avoid
 * Android video decoder overload errors. Videos will play
 * when user navigates to the full video screen.
 */
const MiniVideoLoop = memo<MiniVideoLoopProps>(
  ({
    thumbnailUrl,
    size = 100,
    borderRadius = 16,
    showLiveBadge = true,
    onPress,
    durationText,
  }) => {
    return (
      <TouchableOpacity
        style={[styles.container, { width: size, height: size, borderRadius }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {thumbnailUrl ? (
          <Image
            source={{ uri: thumbnailUrl }}
            style={[styles.thumbnail, { borderRadius }]}
          />
        ) : (
          <View style={[styles.placeholder, { borderRadius }]}>
            <Ionicons name="videocam" size={24} color="rgba(255,255,255,0.5)" />
          </View>
        )}

        {showLiveBadge && (
          <View style={styles.liveBadge}>
            <View style={styles.livePulse} />
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
        )}

        {!showLiveBadge && durationText && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{durationText}</Text>
          </View>
        )}

        <View style={styles.playOverlay}>
          <Ionicons
            name="play-circle"
            size={32}
            color="rgba(255,255,255,0.9)"
          />
        </View>
      </TouchableOpacity>
    );
  },
);

MiniVideoLoop.displayName = "MiniVideoLoop";

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#1a1a2e",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  placeholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#2a2a3e",
    justifyContent: "center",
    alignItems: "center",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  liveBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E53935",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  liveBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  durationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
});

export default MiniVideoLoop;
