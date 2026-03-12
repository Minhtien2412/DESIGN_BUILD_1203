/**
 * PageHeader - Header cho các trang con (không phải tab chính)
 * Thiết kế đơn giản với nút back, title và optional actions
 * @created 2025-01-15
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { memo, useCallback } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ============================================================================
// THEME CONFIG
// ============================================================================
const COLORS = {
  // Gradient colors (Professional Blue-Black gradient)
  gradientStart: "#1a1a2e",
  gradientMiddle: "#16213e",
  gradientEnd: "#0f3460",

  // Text colors
  white: "#FFFFFF",
  textLight: "rgba(255,255,255,0.85)",
  textMuted: "rgba(255,255,255,0.6)",
};

// ============================================================================
// TYPES
// ============================================================================
export interface PageHeaderProps {
  /** Tiêu đề trang */
  title: string;
  /** Subtitle nhỏ dưới title */
  subtitle?: string;
  /** Callback khi nhấn back */
  onBackPress?: () => void;
  /** Custom right slot (button, icon, etc.) */
  rightSlot?: React.ReactNode;
  /** Gradient mode (true) hoặc transparent mode (false) */
  gradient?: boolean;
  /** Background color khi không dùng gradient */
  backgroundColor?: string;
  /** Text color */
  textColor?: string;
  /** Style thêm cho container */
  style?: ViewStyle;
  /** Ẩn nút back */
  hideBackButton?: boolean;
}

// ============================================================================
// PAGE HEADER COMPONENT
// ============================================================================
export const PageHeader = memo(function PageHeader({
  title,
  subtitle,
  onBackPress,
  rightSlot,
  gradient = true,
  backgroundColor = "#1a1a2e",
  textColor = COLORS.white,
  style,
  hideBackButton = false,
}: PageHeaderProps) {
  const insets = useSafeAreaInsets();

  const handleBack = useCallback(() => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  }, [onBackPress]);

  const content = (
    <View style={[styles.container, { paddingTop: insets.top + 8 }, style]}>
      <View style={styles.row}>
        {/* Back Button */}
        {!hideBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
          >
            <Ionicons name="chevron-back" size={26} color={textColor} />
          </TouchableOpacity>
        )}

        {/* Title Section */}
        <View
          style={[
            styles.titleContainer,
            hideBackButton && styles.titleContainerNoBack,
          ]}
        >
          <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[styles.subtitle, { color: COLORS.textMuted }]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Slot */}
        <View style={styles.rightSlot}>{rightSlot}</View>
      </View>
    </View>
  );

  if (gradient) {
    return (
      <LinearGradient
        colors={[
          COLORS.gradientStart,
          COLORS.gradientMiddle,
          COLORS.gradientEnd,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {content}
      </LinearGradient>
    );
  }

  return <View style={[styles.gradient, { backgroundColor }]}>{content}</View>;
});

// ============================================================================
// SIMPLE HEADER (Minimal version)
// ============================================================================
export interface SimpleHeaderProps {
  title: string;
  onBackPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
}

export const SimpleHeader = memo(function SimpleHeader({
  title,
  onBackPress,
  rightIcon,
  onRightPress,
}: SimpleHeaderProps) {
  const insets = useSafeAreaInsets();

  const handleBack = useCallback(() => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  }, [onBackPress]);

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientMiddle, COLORS.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.simpleGradient}
    >
      <View style={[styles.simpleContainer, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.simpleBackButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={26} color={COLORS.white} />
        </TouchableOpacity>

        <Text style={styles.simpleTitle} numberOfLines={1}>
          {title}
        </Text>

        {rightIcon ? (
          <TouchableOpacity
            style={styles.simpleRightButton}
            onPress={onRightPress}
            activeOpacity={0.7}
          >
            <Ionicons name={rightIcon} size={24} color={COLORS.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.simpleRightButton} />
        )}
      </View>
    </LinearGradient>
  );
});

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  gradient: {
    width: "100%",
  },
  container: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  titleContainerNoBack: {
    marginLeft: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  rightSlot: {
    minWidth: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  // Simple Header
  simpleGradient: {
    width: "100%",
  },
  simpleContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  simpleBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  simpleTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.white,
    textAlign: "center",
    marginHorizontal: 8,
  },
  simpleRightButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PageHeader;
