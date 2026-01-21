/**
 * AI Search Bar
 * Thanh tìm kiếm AI thông minh có thể nhúng vào bất kỳ màn hình nào
 * Created: 19/01/2026
 */

import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
} from "@/constants/modern-minimal-styles";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

interface AISearchBarProps {
  onPress: (query?: string) => void;
  placeholder?: string;
  style?: ViewStyle;
  compact?: boolean;
  showHints?: boolean;
}

const QUICK_HINTS = [
  { text: "Phong thủy", icon: "moon" },
  { text: "Tính chi phí", icon: "calculator" },
  { text: "Thiết kế", icon: "color-palette" },
  { text: "Thi công", icon: "construct" },
];

export default function AISearchBar({
  onPress,
  placeholder = "Hỏi AI bất cứ điều gì...",
  style,
  compact = false,
  showHints = true,
}: AISearchBarProps) {
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.searchBar, compact && styles.searchBarCompact]}
        onPress={() => onPress()}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#6366f1", "#8b5cf6"]}
          style={styles.aiIcon}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="sparkles" size={compact ? 14 : 16} color="#fff" />
        </LinearGradient>
        <Text
          style={[styles.placeholder, compact && styles.placeholderCompact]}
          numberOfLines={1}
        >
          {placeholder}
        </Text>
        <View style={styles.micButton}>
          <Ionicons
            name="mic"
            size={compact ? 16 : 18}
            color={MODERN_COLORS.primary}
          />
        </View>
      </TouchableOpacity>

      {showHints && !compact && (
        <View style={styles.hintsContainer}>
          {QUICK_HINTS.map((hint, index) => (
            <TouchableOpacity
              key={index}
              style={styles.hintChip}
              onPress={() => onPress(hint.text)}
            >
              <Ionicons
                name={hint.icon as any}
                size={12}
                color={MODERN_COLORS.primary}
              />
              <Text style={styles.hintText}>{hint.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ==================== FLOATING AI BUTTON ====================

interface FloatingAIButtonProps {
  onPress: () => void;
  style?: ViewStyle;
  size?: "small" | "medium" | "large";
}

export function FloatingAIButton({
  onPress,
  style,
  size = "medium",
}: FloatingAIButtonProps) {
  const buttonSize = size === "small" ? 44 : size === "large" ? 64 : 54;
  const iconSize = size === "small" ? 20 : size === "large" ? 28 : 24;

  return (
    <TouchableOpacity
      style={[
        styles.floatingButton,
        { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={["#6366f1", "#8b5cf6", "#a855f7"]}
        style={[styles.floatingGradient, { borderRadius: buttonSize / 2 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name="sparkles" size={iconSize} color="#fff" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ==================== AI MINI CARD ====================

interface AIMiniCardProps {
  onPress: () => void;
  title?: string;
  subtitle?: string;
  style?: ViewStyle;
}

export function AIMiniCard({
  onPress,
  title = "AI Trợ lý",
  subtitle = "Hỏi AI về thiết kế, thi công, phong thủy...",
  style,
}: AIMiniCardProps) {
  return (
    <TouchableOpacity
      style={[styles.miniCard, style]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={["#6366f1", "#8b5cf6"]}
        style={styles.miniCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.miniCardContent}>
          <View style={styles.miniCardIcon}>
            <Ionicons name="sparkles" size={24} color="#fff" />
          </View>
          <View style={styles.miniCardText}>
            <Text style={styles.miniCardTitle}>{title}</Text>
            <Text style={styles.miniCardSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="rgba(255,255,255,0.8)"
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    gap: MODERN_SPACING.sm,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    paddingHorizontal: MODERN_SPACING.md,
    height: 52,
    gap: MODERN_SPACING.sm,
    borderWidth: 1,
    borderColor: MODERN_COLORS.primary + "20",
    ...MODERN_SHADOWS.sm,
  },
  searchBarCompact: {
    height: 44,
    paddingHorizontal: MODERN_SPACING.sm,
  },
  aiIcon: {
    width: 28,
    height: 28,
    borderRadius: MODERN_RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    flex: 1,
    fontSize: 14,
    color: MODERN_COLORS.textSecondary,
  },
  placeholderCompact: {
    fontSize: 13,
  },
  micButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: MODERN_COLORS.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  hintsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.xs,
    paddingHorizontal: MODERN_SPACING.xs,
  },
  hintChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.primary + "10",
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 6,
    borderRadius: MODERN_RADIUS.full,
    gap: 4,
  },
  hintText: {
    fontSize: 12,
    color: MODERN_COLORS.primary,
    fontWeight: "500",
  },
  floatingButton: {
    position: "absolute",
    ...MODERN_SHADOWS.lg,
  },
  floatingGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  miniCard: {
    borderRadius: MODERN_RADIUS.lg,
    overflow: "hidden",
    ...MODERN_SHADOWS.md,
  },
  miniCardGradient: {
    padding: MODERN_SPACING.md,
  },
  miniCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.md,
  },
  miniCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  miniCardText: {
    flex: 1,
  },
  miniCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  miniCardSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
});
