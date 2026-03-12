/**
 * Online Status Badge Component
 * =============================
 *
 * Badge hiển thị trạng thái online của user:
 * - Online (xanh lá)
 * - Away (vàng)
 * - Busy (đỏ)
 * - Offline (xám)
 *
 * @author ThietKeResort Team
 * @created 2025-01-27
 */

import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

import Colors from "@/constants/Colors";

// ============================================
// TYPES
// ============================================

export type OnlineStatus = "online" | "away" | "busy" | "offline";

export interface OnlineStatusBadgeProps {
  /** Trạng thái */
  status: OnlineStatus;
  /** Kích thước badge */
  size?: "sm" | "md" | "lg";
  /** Hiển thị pulse animation cho online */
  showPulse?: boolean;
  /** Hiển thị border (cho avatar overlay) */
  showBorder?: boolean;
  /** Màu border */
  borderColor?: string;
  /** Custom style */
  style?: ViewStyle;
}

export interface OnlineStatusTextProps {
  /** Trạng thái */
  status: OnlineStatus;
  /** Custom text */
  customText?: Record<OnlineStatus, string>;
  /** Show dot indicator */
  showDot?: boolean;
  /** Custom style */
  style?: ViewStyle;
}

// ============================================
// SIZE MAPPING
// ============================================

const SIZE_MAP = {
  sm: { dot: 8, border: 2 },
  md: { dot: 12, border: 2 },
  lg: { dot: 16, border: 3 },
};

const STATUS_COLORS: Record<OnlineStatus, string> = {
  online: Colors.light.success,
  away: Colors.light.warning,
  busy: Colors.light.error,
  offline: Colors.light.textSecondary,
};

const DEFAULT_TEXT: Record<OnlineStatus, string> = {
  online: "Đang hoạt động",
  away: "Đang bận",
  busy: "Không làm phiền",
  offline: "Không hoạt động",
};

// ============================================
// BADGE COMPONENT
// ============================================

export function OnlineStatusBadge({
  status,
  size = "md",
  showPulse = true,
  showBorder = true,
  borderColor = Colors.light.background,
  style,
}: OnlineStatusBadgeProps) {
  const { dot, border } = SIZE_MAP[size];
  const color = STATUS_COLORS[status];

  // Pulse animation
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  React.useEffect(() => {
    if (status === "online" && showPulse) {
      pulseScale.value = withRepeat(
        withTiming(1.5, { duration: 1500, easing: Easing.out(Easing.ease) }),
        -1,
        false,
      );
      pulseOpacity.value = withRepeat(
        withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }),
        -1,
        false,
      );
    } else {
      pulseScale.value = 1;
      pulseOpacity.value = 1;
    }
  }, [status, showPulse, pulseScale, pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <View
      style={[
        styles.badgeContainer,
        {
          width: dot + (showBorder ? border * 2 : 0),
          height: dot + (showBorder ? border * 2 : 0),
        },
        style,
      ]}
    >
      {/* Pulse effect */}
      {status === "online" && showPulse && (
        <Animated.View
          style={[
            styles.pulse,
            {
              width: dot,
              height: dot,
              borderRadius: dot / 2,
              backgroundColor: color,
            },
            pulseStyle,
          ]}
        />
      )}

      {/* Main dot */}
      <View
        style={[
          styles.dot,
          {
            width: dot,
            height: dot,
            borderRadius: dot / 2,
            backgroundColor: color,
            borderWidth: showBorder ? border : 0,
            borderColor: borderColor,
          },
        ]}
      />
    </View>
  );
}

// ============================================
// TEXT STATUS COMPONENT
// ============================================

export function OnlineStatusText({
  status,
  customText,
  showDot = true,
  style,
}: OnlineStatusTextProps) {
  const text = customText?.[status] || DEFAULT_TEXT[status];
  const color = STATUS_COLORS[status];

  return (
    <View style={[styles.textContainer, style]}>
      {showDot && <View style={[styles.textDot, { backgroundColor: color }]} />}
      <Text style={[styles.statusText, { color }]}>{text}</Text>
    </View>
  );
}

// ============================================
// COMBINED AVATAR STATUS
// ============================================

export interface AvatarWithStatusProps {
  /** Avatar component hoặc image source */
  children: React.ReactNode;
  /** Trạng thái online */
  status: OnlineStatus;
  /** Kích thước badge */
  badgeSize?: "sm" | "md" | "lg";
  /** Vị trí badge */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  /** Custom style */
  style?: ViewStyle;
}

export function AvatarWithStatus({
  children,
  status,
  badgeSize = "md",
  position = "bottom-right",
  style,
}: AvatarWithStatusProps) {
  const positionStyle = getPositionStyle(position);

  return (
    <View style={[styles.avatarContainer, style]}>
      {children}
      <OnlineStatusBadge
        status={status}
        size={badgeSize}
        style={StyleSheet.flatten([styles.avatarBadge, positionStyle])}
      />
    </View>
  );
}

// Helper for position
function getPositionStyle(
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left",
): ViewStyle {
  switch (position) {
    case "bottom-right":
      return { bottom: 0, right: 0 };
    case "bottom-left":
      return { bottom: 0, left: 0 };
    case "top-right":
      return { top: 0, right: 0 };
    case "top-left":
      return { top: 0, left: 0 };
    default:
      return { bottom: 0, right: 0 };
  }
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  badgeContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  pulse: {
    position: "absolute",
  },
  dot: {},
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  textDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarBadge: {
    position: "absolute",
  },
});

export default OnlineStatusBadge;
