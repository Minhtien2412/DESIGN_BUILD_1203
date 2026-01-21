/**
 * VideoInteractionButtons - Like/Save/Share/Comment buttons
 * VIDEO-005: Video Interactions UI
 */

import { useVideoInteractions } from "@/services/VideoInteractionsService";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
    Animated,
    Pressable,
    Share,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";
import {
    AnimatedCounter,
    formatCompactNumber,
    useLikeAnimation,
} from "./AnimatedCounter";

export interface VideoInteractionButtonsProps {
  videoId: string;
  orientation?: "vertical" | "horizontal";
  style?: ViewStyle;
  showLabels?: boolean;
  onCommentPress?: () => void;
  shareUrl?: string;
  shareTitle?: string;
}

export function VideoInteractionButtons({
  videoId,
  orientation = "vertical",
  style,
  showLabels = true,
  onCommentPress,
  shareUrl,
  shareTitle = "Check out this video!",
}: VideoInteractionButtonsProps): React.ReactElement {
  const {
    isLiked,
    isSaved,
    likes,
    saves,
    shares,
    comments,
    toggleLike,
    toggleSave,
    recordShare,
  } = useVideoInteractions(videoId);

  const { scale: likeScale, burstOpacity, animateLike } = useLikeAnimation();
  const [saveScale] = useState(new Animated.Value(1));

  // Handle like press
  const handleLike = useCallback(async () => {
    animateLike(!isLiked);
    await toggleLike();
  }, [isLiked, toggleLike, animateLike]);

  // Handle save press
  const handleSave = useCallback(async () => {
    // Animate save button
    Animated.sequence([
      Animated.timing(saveScale, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(saveScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    await toggleSave();
  }, [toggleSave, saveScale]);

  // Handle share press
  const handleShare = useCallback(async () => {
    try {
      const result = await Share.share({
        message: shareUrl ? `${shareTitle}\n${shareUrl}` : shareTitle,
        url: shareUrl,
        title: shareTitle,
      });

      if (result.action === Share.sharedAction) {
        const platform = result.activityType
          ? getPlatformFromActivity(result.activityType)
          : "other";
        await recordShare(platform);
      }
    } catch {
      // User cancelled or error
    }
  }, [shareUrl, shareTitle, recordShare]);

  const isVertical = orientation === "vertical";

  return (
    <View
      style={[
        styles.container,
        isVertical ? styles.vertical : styles.horizontal,
        style,
      ]}
    >
      {/* Like Button */}
      <Pressable onPress={handleLike} style={styles.button}>
        <Animated.View
          style={[styles.iconContainer, { transform: [{ scale: likeScale }] }]}
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={28}
            color={isLiked ? "#FF2D55" : "#FFFFFF"}
          />
          {/* Heart burst effect */}
          <Animated.View style={[styles.burst, { opacity: burstOpacity }]}>
            <Ionicons name="heart" size={40} color="#FF2D55" />
          </Animated.View>
        </Animated.View>
        {showLabels && <AnimatedCounter value={likes} style={styles.label} />}
      </Pressable>

      {/* Comment Button */}
      <Pressable onPress={onCommentPress} style={styles.button}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={26}
            color="#FFFFFF"
          />
        </View>
        {showLabels && (
          <Text style={styles.label}>{formatCompactNumber(comments)}</Text>
        )}
      </Pressable>

      {/* Save Button */}
      <Pressable onPress={handleSave} style={styles.button}>
        <Animated.View
          style={[styles.iconContainer, { transform: [{ scale: saveScale }] }]}
        >
          <Ionicons
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={26}
            color={isSaved ? "#FFD700" : "#FFFFFF"}
          />
        </Animated.View>
        {showLabels && <AnimatedCounter value={saves} style={styles.label} />}
      </Pressable>

      {/* Share Button */}
      <Pressable onPress={handleShare} style={styles.button}>
        <View style={styles.iconContainer}>
          <Ionicons name="arrow-redo-outline" size={26} color="#FFFFFF" />
        </View>
        {showLabels && <AnimatedCounter value={shares} style={styles.label} />}
      </Pressable>
    </View>
  );
}

/**
 * Map iOS activity type to platform
 */
function getPlatformFromActivity(
  activityType: string
): "copy" | "facebook" | "twitter" | "whatsapp" | "other" {
  const type = activityType.toLowerCase();
  if (type.includes("copy")) return "copy";
  if (type.includes("facebook")) return "facebook";
  if (type.includes("twitter")) return "twitter";
  if (type.includes("whatsapp")) return "whatsapp";
  return "other";
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 16,
  },
  vertical: {
    flexDirection: "column",
  },
  horizontal: {
    flexDirection: "row",
    gap: 24,
  },
  button: {
    alignItems: "center",
    gap: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  burst: {
    position: "absolute",
  },
  label: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default VideoInteractionButtons;
