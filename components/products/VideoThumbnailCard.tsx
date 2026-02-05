/**
 * VideoThumbnailCard - Shopee-style Video Thumbnail
 * ==================================================
 *
 * Video thumbnail hiển thị poster với play icon,
 * phát video khi user tap vào để tránh decoder overload.
 *
 * Features:
 * - Thumbnail-first approach để tối ưu hiệu năng
 * - Play icon overlay
 * - Progress indicator (khi phát)
 * - Tap để mở fullscreen hoặc phát video
 *
 * @author ThietKeResort Team
 * @created 2026-01-27
 * @updated 2026-01-29 - Fixed decoder overload by using thumbnail-first
 */

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { memo } from "react";
import {
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================
// Types
// ============================================
export interface VideoThumbnailCardProps {
  /** Unique ID */
  id: string;
  /** Video URL */
  videoUrl: string;
  /** Thumbnail image URL */
  thumbnailUrl?: string;
  /** Video duration in seconds */
  duration?: number;
  /** View count */
  views?: number;
  /** Whether visible in viewport */
  isVisible?: boolean;
  /** Card width (default: calculated for 2-column grid) */
  width?: number;
  /** Card height (default: calculated based on width) */
  height?: number;
  /** Aspect ratio (default: 4/3 for product cards) */
  aspectRatio?: number;
  /** Callback when tapped */
  onPress?: () => void;
  /** Show view count */
  showViews?: boolean;
  /** Show duration */
  showDuration?: boolean;
  /** Border radius */
  borderRadius?: number;
  /** Style override */
  style?: ViewStyle;
}

// ============================================
// Helper Functions
// ============================================
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatViews = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// ============================================
// Main Component - Thumbnail-first approach
// ============================================
export const VideoThumbnailCard = memo(function VideoThumbnailCard({
  thumbnailUrl,
  duration,
  views,
  width = (SCREEN_WIDTH - 36) / 2,
  height,
  aspectRatio = 4 / 3,
  onPress,
  showViews = true,
  showDuration = true,
  borderRadius = 8,
  style,
}: VideoThumbnailCardProps) {
  // Calculate height based on aspect ratio
  const calculatedHeight = height || width / aspectRatio;
  const actualDuration = duration || 0;

  // ============================================
  // Render - Thumbnail only (no auto-play video)
  // ============================================
  return (
    <Pressable
      style={[
        styles.container,
        { width, height: calculatedHeight, borderRadius },
        style,
      ]}
      onPress={onPress}
    >
      {/* Thumbnail Background */}
      {thumbnailUrl ? (
        <Image
          source={{ uri: thumbnailUrl }}
          style={[styles.thumbnail, { borderRadius }]}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[styles.placeholder, { borderRadius }]}>
          <Ionicons name="videocam" size={32} color="rgba(255,255,255,0.5)" />
        </View>
      )}

      {/* Play Icon Overlay */}
      <View style={styles.playIconOverlay}>
        <View style={styles.playIconCircle}>
          <Ionicons name="play" size={20} color="#fff" />
        </View>
      </View>

      {/* Video Badge */}
      <View style={styles.videoBadge}>
        <Ionicons name="videocam" size={10} color="#fff" />
      </View>

      {/* Bottom Info Bar */}
      <View style={styles.bottomBar}>
        {/* Info Row */}
        <View style={styles.infoRow}>
          {showViews && views !== undefined && (
            <View style={styles.viewsContainer}>
              <Ionicons name="eye" size={10} color="#fff" />
              <Text style={styles.viewsText}>{formatViews(views)}</Text>
            </View>
          )}
          {showDuration && actualDuration > 0 && (
            <View style={styles.durationContainer}>
              <Text style={styles.durationText}>
                {formatDuration(actualDuration)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
});

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    overflow: "hidden",
    position: "relative",
  },
  thumbnail: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
  },
  playIconOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  playIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 3, // Center play icon visually
  },
  videoBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 4,
    padding: 4,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  viewsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewsText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "500",
  },
  durationContainer: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  durationText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
});

export default VideoThumbnailCard;
