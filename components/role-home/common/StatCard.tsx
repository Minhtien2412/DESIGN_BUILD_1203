/**
 * StatCard — KPI/metrics display card
 *
 * @created 2026-03-21
 */

import { ROLE_THEME } from "@/constants/roleTheme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export function StatCard({
  label,
  value,
  change,
  isPositive,
  icon,
  color,
}: Props) {
  return (
    <View style={s.card}>
      <View style={[s.iconBox, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={s.value}>{value}</Text>
      <Text style={s.label} numberOfLines={1}>
        {label}
      </Text>
      {change && (
        <Text style={[s.change, { color: isPositive ? "#10B981" : "#EF4444" }]}>
          {change}
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: ROLE_THEME.card,
    borderRadius: ROLE_THEME.radius.lg,
    padding: 14,
    alignItems: "flex-start",
    gap: 4,
    borderWidth: 1,
    borderColor: ROLE_THEME.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  value: {
    fontSize: ROLE_THEME.fontSize.xxl,
    fontWeight: "800",
    color: ROLE_THEME.textPrimary,
  },
  label: {
    fontSize: ROLE_THEME.fontSize.xs,
    color: ROLE_THEME.textSecondary,
    fontWeight: "500",
  },
  change: {
    fontSize: ROLE_THEME.fontSize.xs,
    fontWeight: "700",
    marginTop: 2,
  },
});
