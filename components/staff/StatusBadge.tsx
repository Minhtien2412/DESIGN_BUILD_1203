/**
 * StatusBadge — Displays a staff member's work status with color-coded badge
 */

import {
    STAFF_STATUS_COLORS,
    STAFF_STATUS_LABELS,
    StaffStatus,
} from "@/types/staff";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

interface StatusBadgeProps {
  status: StaffStatus;
  size?: "sm" | "md";
  style?: ViewStyle;
}

export default function StatusBadge({
  status,
  size = "md",
  style,
}: StatusBadgeProps) {
  const color = STAFF_STATUS_COLORS[status] ?? "#6B7280";
  const label = STAFF_STATUS_LABELS[status] ?? status;
  const isSm = size === "sm";

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color + "18",
          borderColor: color + "40",
          paddingHorizontal: isSm ? 6 : 10,
          paddingVertical: isSm ? 2 : 4,
        },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text
        style={[styles.label, { color, fontSize: isSm ? 11 : 13 }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 100,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  label: {
    fontWeight: "600",
  },
});
