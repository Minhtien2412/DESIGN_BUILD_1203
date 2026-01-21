/**
 * FilterChipsRow - Reusable Modern Filter Chips Component
 * Animated horizontal scrollable filter chips with gradient, icons, and badges
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRef } from "react";
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

export interface FilterChipConfig {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  color: string;
  gradient?: readonly [string, string];
}

interface FilterChipProps {
  config: FilterChipConfig;
  isActive: boolean;
  onPress: () => void;
  count?: number;
  size?: "small" | "medium" | "large";
}

interface FilterChipsRowProps {
  configs: FilterChipConfig[];
  activeId: string;
  onSelect: (id: string) => void;
  counts?: Record<string, number>;
  size?: "small" | "medium" | "large";
  containerStyle?: ViewStyle;
  showIcons?: boolean;
  showCounts?: boolean;
}

// Single Animated Filter Chip
function FilterChip({
  config,
  isActive,
  onPress,
  count,
  size = "medium",
}: FilterChipProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const sizeStyles = {
    small: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      iconSize: 14,
      fontSize: 12,
    },
    medium: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      iconSize: 16,
      fontSize: 13,
    },
    large: {
      paddingHorizontal: 18,
      paddingVertical: 12,
      iconSize: 18,
      fontSize: 14,
    },
  };

  const currentSize = sizeStyles[size];
  const gradient = config.gradient || [config.color, config.color];

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {isActive ? (
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.chipActive,
              {
                paddingHorizontal: currentSize.paddingHorizontal,
                paddingVertical: currentSize.paddingVertical,
              },
            ]}
          >
            {config.icon && (
              <Ionicons
                name={config.icon}
                size={currentSize.iconSize}
                color="#FFF"
              />
            )}
            <Text
              style={[
                styles.chipTextActive,
                { fontSize: currentSize.fontSize },
              ]}
            >
              {config.label}
            </Text>
            {count !== undefined && count > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{count}</Text>
              </View>
            )}
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.chip,
              {
                borderColor: config.color + "40",
                paddingHorizontal: currentSize.paddingHorizontal,
                paddingVertical: currentSize.paddingVertical,
              },
            ]}
          >
            {config.icon && (
              <Ionicons
                name={config.icon}
                size={currentSize.iconSize}
                color={config.color}
              />
            )}
            <Text
              style={[
                styles.chipText,
                { color: config.color, fontSize: currentSize.fontSize },
              ]}
            >
              {config.label}
            </Text>
            {count !== undefined && count > 0 && (
              <View
                style={[
                  styles.countBadgeInactive,
                  { backgroundColor: config.color + "20" },
                ]}
              >
                <Text
                  style={[styles.countTextInactive, { color: config.color }]}
                >
                  {count}
                </Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// Main FilterChipsRow Component
export function FilterChipsRow({
  configs,
  activeId,
  onSelect,
  counts,
  size = "medium",
  containerStyle,
  showCounts = true,
}: FilterChipsRowProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {configs.map((config) => (
          <FilterChip
            key={config.id}
            config={config}
            isActive={activeId === config.id}
            onPress={() => onSelect(config.id)}
            count={showCounts ? counts?.[config.id] : undefined}
            size={size}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// Pre-configured filter presets
export const FILTER_PRESETS = {
  status: [
    {
      id: "all",
      label: "Tất cả",
      icon: "apps" as const,
      color: "#6366F1",
      gradient: ["#6366F1", "#8B5CF6"] as const,
    },
    {
      id: "available",
      label: "Sẵn sàng",
      icon: "checkmark-circle" as const,
      color: "#10B981",
      gradient: ["#10B981", "#34D399"] as const,
    },
    {
      id: "in-use",
      label: "Đang dùng",
      icon: "construct" as const,
      color: "#3B82F6",
      gradient: ["#3B82F6", "#60A5FA"] as const,
    },
    {
      id: "maintenance",
      label: "Bảo trì",
      icon: "settings" as const,
      color: "#F59E0B",
      gradient: ["#F59E0B", "#FBBF24"] as const,
    },
    {
      id: "repair",
      label: "Sửa chữa",
      icon: "build" as const,
      color: "#EF4444",
      gradient: ["#EF4444", "#F87171"] as const,
    },
  ],
  priority: [
    {
      id: "all",
      label: "Tất cả",
      icon: "apps" as const,
      color: "#6366F1",
      gradient: ["#6366F1", "#8B5CF6"] as const,
    },
    {
      id: "high",
      label: "Cao",
      icon: "alert-circle" as const,
      color: "#EF4444",
      gradient: ["#EF4444", "#F87171"] as const,
    },
    {
      id: "medium",
      label: "Trung bình",
      icon: "remove-circle" as const,
      color: "#F59E0B",
      gradient: ["#F59E0B", "#FBBF24"] as const,
    },
    {
      id: "low",
      label: "Thấp",
      icon: "checkmark-circle" as const,
      color: "#10B981",
      gradient: ["#10B981", "#34D399"] as const,
    },
  ],
  progress: [
    {
      id: "all",
      label: "Tất cả",
      icon: "apps" as const,
      color: "#6366F1",
      gradient: ["#6366F1", "#8B5CF6"] as const,
    },
    {
      id: "not-started",
      label: "Chưa bắt đầu",
      icon: "time" as const,
      color: "#9CA3AF",
      gradient: ["#9CA3AF", "#D1D5DB"] as const,
    },
    {
      id: "in-progress",
      label: "Đang thực hiện",
      icon: "play-circle" as const,
      color: "#3B82F6",
      gradient: ["#3B82F6", "#60A5FA"] as const,
    },
    {
      id: "completed",
      label: "Hoàn thành",
      icon: "checkmark-done-circle" as const,
      color: "#10B981",
      gradient: ["#10B981", "#34D399"] as const,
    },
    {
      id: "delayed",
      label: "Trễ hạn",
      icon: "alert-circle" as const,
      color: "#EF4444",
      gradient: ["#EF4444", "#F87171"] as const,
    },
  ],
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FAFAFA",
    paddingTop: 12,
    paddingBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    borderWidth: 1.5,
    backgroundColor: "#FFFFFF",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chipActive: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  chipText: {
    fontWeight: "600",
  },
  chipTextActive: {
    fontWeight: "700",
    color: "#FFFFFF",
  },
  countBadge: {
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 2,
  },
  countText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  countBadgeInactive: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 2,
  },
  countTextInactive: {
    fontSize: 11,
    fontWeight: "700",
  },
});

export default FilterChipsRow;
