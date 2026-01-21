/**
 * PressableAvatar Component
 * ===========================
 *
 * Avatar component that navigates to user profile when pressed.
 * Wraps the base Avatar with TouchableOpacity and navigation logic.
 *
 * Features:
 * - One-tap navigation to any user's profile
 * - Works with userId, username, or slug
 * - Built-in haptic feedback
 * - Disabled state when viewing own profile
 * - Shimmer loading effect
 *
 * @author ThietKeResort Team
 * @created 2025-01-20
 */

import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { memo, useCallback } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    type ViewStyle,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

import Avatar, { type AvatarShape, type AvatarSizeType } from "./avatar";

// ============================================================================
// Types
// ============================================================================

export interface PressableAvatarProps {
  /** User ID to navigate to profile */
  userId?: string | number;
  /** Username/slug for profile URL (alternative to userId) */
  username?: string;
  /** Display name for initials fallback */
  name?: string;
  /** Avatar URL or path */
  avatar?: string | null;
  /** Size variant */
  size?: AvatarSizeType;
  /** Override pixel size */
  pixelSize?: number;
  /** Avatar shape */
  shape?: AvatarShape;
  /** Show online indicator */
  showOnlineStatus?: boolean;
  /** Online status */
  onlineStatus?: "online" | "offline" | "busy" | "away";
  /** Custom navigation path (overrides default profile route) */
  customRoute?: string;
  /** Disable navigation (just shows avatar) */
  disabled?: boolean;
  /** Show loading state */
  loading?: boolean;
  /** Enable haptic feedback */
  hapticFeedback?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Badge color override */
  badgeColor?: string;
  /** Show verification badge */
  showVerified?: boolean;
  /** Cache bust token */
  cacheBust?: string | number;
  /** Callback after navigation */
  onNavigate?: (userId: string | number) => void;
  /** Alternative callback if you want custom handling */
  onPress?: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const VERIFIED_BADGE_SIZES: Record<AvatarSizeType, number> = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
};

// ============================================================================
// Component
// ============================================================================

function PressableAvatarComponent({
  userId,
  username,
  name,
  avatar,
  size = "md",
  pixelSize,
  shape = "circle",
  showOnlineStatus = false,
  onlineStatus,
  customRoute,
  disabled = false,
  loading = false,
  hapticFeedback = true,
  style,
  badgeColor,
  showVerified = false,
  cacheBust,
  onNavigate,
  onPress,
}: PressableAvatarProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();

  // Animation values
  const scale = useSharedValue(1);

  // Check if viewing own profile
  const isOwnProfile =
    currentUser &&
    (String(currentUser.id) === String(userId) ||
      (currentUser as any).username === username);

  // Determine if pressable
  const isPressable =
    !disabled && !loading && (userId || username || customRoute || onPress);

  // Handle press with haptic feedback
  const handlePress = useCallback(() => {
    if (!isPressable) return;

    // Haptic feedback
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Custom press handler takes priority
    if (onPress) {
      onPress();
      return;
    }

    // Build profile route
    let route = customRoute;
    if (!route) {
      if (username) {
        route = `/profile/${username}`;
      } else if (userId) {
        route = `/profile/${userId}`;
      }
    }

    if (route) {
      router.push(route as any);

      // Callback after navigation
      if (onNavigate && (userId || username)) {
        onNavigate(userId || username!);
      }
    }
  }, [
    isPressable,
    hapticFeedback,
    onPress,
    customRoute,
    username,
    userId,
    router,
    onNavigate,
  ]);

  // Press animation
  const handlePressIn = useCallback(() => {
    if (isPressable) {
      scale.value = withSpring(0.92, { damping: 15, stiffness: 200 });
    }
  }, [isPressable, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  }, [scale]);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Verified badge size
  const verifiedSize = VERIFIED_BADGE_SIZES[size];

  // Render loading state
  if (loading) {
    const avatarPixelSize = pixelSize ?? getPixelSize(size);
    return (
      <View
        style={[
          styles.container,
          { width: avatarPixelSize, height: avatarPixelSize },
          style,
        ]}
      >
        <View
          style={[
            styles.loadingCircle,
            {
              width: avatarPixelSize,
              height: avatarPixelSize,
              borderRadius:
                shape === "circle"
                  ? avatarPixelSize / 2
                  : shape === "square"
                    ? 0
                    : 12,
            },
          ]}
        >
          <ActivityIndicator size="small" color="#1877F2" />
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!isPressable}
        activeOpacity={isPressable ? 0.7 : 1}
        style={styles.touchable}
      >
        <Avatar
          avatar={avatar}
          name={name}
          userId={userId}
          size={size}
          pixelSize={pixelSize}
          shape={shape}
          showBadge={showOnlineStatus}
          onlineStatus={onlineStatus}
          badgeColor={badgeColor}
          cacheBust={cacheBust}
        />

        {/* Verified Badge */}
        {showVerified && (
          <View
            style={[
              styles.verifiedBadge,
              {
                width: verifiedSize,
                height: verifiedSize,
                borderRadius: verifiedSize / 2,
              },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={verifiedSize}
              color="#1877F2"
            />
          </View>
        )}

        {/* Own Profile Indicator (subtle border) */}
        {isOwnProfile && (
          <View style={styles.ownProfileIndicator}>
            <Text style={styles.ownProfileText}>Bạn</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// Helper to get pixel size from size variant
function getPixelSize(size: AvatarSizeType): number {
  const sizeMap: Record<AvatarSizeType, number> = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    "2xl": 80,
    "3xl": 120,
  };
  return sizeMap[size] ?? 40;
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  touchable: {
    position: "relative",
  },
  loadingCircle: {
    backgroundColor: "#F0F2F5",
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  ownProfileIndicator: {
    position: "absolute",
    bottom: -4,
    left: "50%",
    transform: [{ translateX: -12 }],
    backgroundColor: "#1877F2",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  ownProfileText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

// ============================================================================
// Export with memo for performance
// ============================================================================

export const PressableAvatar = memo(PressableAvatarComponent);
export default PressableAvatar;
