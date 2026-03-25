/**
 * RoleBadge — Displays a staff member's role with color-coded badge
 */

import {
    COMPANY_ROLE_COLORS,
    COMPANY_ROLE_LABELS,
    CompanyRole,
} from "@/types/staff";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

interface RoleBadgeProps {
  role: CompanyRole;
  size?: "sm" | "md";
  style?: ViewStyle;
}

export default function RoleBadge({
  role,
  size = "md",
  style,
}: RoleBadgeProps) {
  const color = COMPANY_ROLE_COLORS[role] ?? "#6B7280";
  const label = COMPANY_ROLE_LABELS[role] ?? role;
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
